import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  ForbiddenException,
  InternalServerErrorException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { Console } from 'console';
import { PrismaService } from '../prisma.service';

import { CreateDocumentDto } from './dto/create-document.dto';
import { System, SystemDocument } from 'src/systems/schema/system.schema';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Logger } from 'winston';
const fs = require('fs');
const path = require('path');

import {
  generateNumbering,
  documentAdminsCreator,
  adminsSeperators,
  sendRevisionReminderMail,
  sendMailForApproval,
  sendMailForReview,
  sendMailForEdit,
  sendMailPublishedForAdmins,
  sendMailPublishedForDocumentAdmins,
  prefixAndSuffix,
} from './utils';
import { queryGeneartorForDocumentsFilter } from '../utils/filterotherway';
import { CreateDoctypeDto } from '../doctype/dto/create-doctype.dto';
import { CreateCommentDto } from './dto/create-document-comment.dto';
import { CreateReferenceDocumentsDto } from './dto/createReferenceDocument.dto';
import { UserService } from 'src/user/user.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { sendMailPublished } from './utils';
import { RefsService } from 'src/refs/refs.service';
import { EntityService } from 'src/entity/entity.service';
import { NotEquals } from 'class-validator';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { v4 as uuid } from 'uuid';
import { Refs, RefsSchema } from 'src/refs/schema/refs.schema';
import { EmailService } from 'src/email/email.service';
import common = require('oci-common');
import * as objectstorage from 'oci-objectstorage';
import st = require('stream');
import { OrganizationService } from 'src/organization/organization.service';
import * as https from 'https';
import { doc } from 'prettier';
import { ChartFilter } from './dto/chartfilter.dto';
import { createHash } from 'crypto';
import { MongoClient } from 'mongodb';
import e = require('express');
// { name: Refs.name, schema: RefsSchema },
import auditTrailWatcher from '../watcher/changesStream';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    @InjectModel(System.name) private System: Model<SystemDocument>,
    // @InjectModel(Refs.name) private refsModel: Model<Refs>,
    private readonly userService: UserService,
    private refsService: RefsService,
    private readonly entityService: EntityService,
    private readonly serialNumberService: SerialNumberService,
    private readonly emailService: EmailService,
    private readonly organizationService: OrganizationService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  async create(createDocumentDto: CreateDocumentDto, file, user) {
    const randomNumber = uuid();

    // try {
    //GET THE CURRENT ACTIVE USER
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    // const auditTrail = await auditTrailWatcher(
    //   'Documents',
    //   'Document Control',
    //   'Documents',
    //   user,
    //   activeUser,
    //   '',
    // );
    let payload = JSON.parse(JSON.stringify(createDocumentDto));
    let {
      documentName,
      description,
      documentState,
      documentVersions,
      doctypeId,
      reasonOfCreation,
      documentLink,
      effectiveDate,
      currentVersion,
      tags,
      realmName,
      additionalReaders,
      creators,
      reviewers,
      approvers,
      locationId,
      entityId,
      referenceDocuments,
      systems,
      doctypeName,
      docsClassification,
      distributionList,
      distributionUsers,
      readAccess,
      readAccessUsers,
      refsData,
      locationName,
      section,
    } = payload;
    this.logger.log(
      `trace id=${randomNumber} Post api/documents service started with Data ${payload}`,
      '',
    );

    let hashValue = '';
    if (process.env.IS_OBJECT_STORE === 'true' && file) {
      documentLink = await this.addDocumentToOS(file, locationName);
    }
    if (file) {
      const fileContent = fs.readFileSync(file.path);
      const hash = createHash('sha256');
      hash.update(fileContent);
      hashValue = hash.digest('hex');
    }
    //if no file while creating then send error

    const organization = await this.prisma.organization.findFirst({
      where: {
        realmName: realmName,
      },
    });

    // if (!activeUser.entityId) {
    //   throw new NotFoundException(
    //     'No department found for the particular user',
    //   );
    // }
    // GETTING ACTIVE USERS DEPARTMENT
    const activeUserDept = await this.prisma.entity.findFirst({
      where: {
        id: entityId,
      },
    });
    const entityInfo = await this.prisma.entity.findFirst({
      where: {
        id: entityId,
      },
    });

    //write document numbering logic
    //find the doctype and check numbering

    const doctype = await this.prisma.doctype.findFirst({
      where: {
        id: doctypeId,
      },
    });
    // //////////////console.log('documents doctype', doctype);
    let location;
    if (activeUser.userType !== 'globalRoles') {
      location = await this.prisma.location.findFirst({
        where: {
          // id: doctype.locationId,
          id: activeUser.locationId,
        },
      });
    } else {
      location = await this.prisma.location.findFirst({
        where: {
          // id: doctype.locationId,
          id: entityInfo.locationId,
        },
      });
    }

    const versionInfo = [
      {
        type: 'CREATOR',
        id: activeUser.id,
        name: activeUser.firstname + ' ' + activeUser.lastname,
        documentLink: file
          ? process.env.IS_OBJECT_STORE === 'true'
            ? documentLink
            : `${
                process.env.SERVER_IP
              }/${organization.realmName.toLowerCase()}/${location.locationName.toLowerCase()}/document/${
                file.filename
              }`
          : documentLink,
        docCode: hashValue,
      },
    ];

    // Create document
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, POST /api/documents payload=${payload} `,
      '',
    );

    let reviewersData = [];
    let approversData = [];

    if (
      reviewers !== undefined &&
      reviewers !== 'undefined' &&
      reviewers?.length > 0
    ) {
      reviewersData = reviewers?.map((value) => value?.id);
    }

    if (
      approvers !== undefined &&
      approvers !== 'undefined' &&
      approvers?.length > 0
    ) {
      approversData = approvers?.map((value) => value?.id);
    }
    let creatorLocation;
    if (activeUser.userType === 'globalRoles') {
      creatorLocation = entityInfo.locationId;
    } else {
      creatorLocation = locationId;
    }
    let body: any = {
      data: {
        doctype: {
          connect: {
            id: doctypeId,
          },
        },
        organization: {
          connect: {
            id: organization.id,
          },
        },
        description: description,
        documentName: documentName,
        documentState: documentState,
        reviewers: reviewersData,
        approvers: approversData,
        creators: [activeUser?.id],
        currentVersion: 'A',
        tags: tags,
        documentLink: file
          ? process.env.IS_OBJECT_STORE === 'true'
            ? documentLink
            : `${
                process.env.SERVER_IP
              }/${organization.realmName.toLowerCase()}/${location.locationName.toLowerCase()}/document/${
                file.filename
              }`
          : documentLink,
        // documentNumbering: documentNumbering || '',
        issueNumber: '001',
        reasonOfCreation: reasonOfCreation,
        system: systems,
        docType: doctypeName,
        documentClassification: docsClassification,
        // clause,
        distributionList,
        distributionUsers,
        readAccess,
        readAccessUsers,
        isVersion: false,
        creatorLocation: {
          connect: {
            id: creatorLocation,
          },
        },

        creatorEntity: {
          connect: {
            id: entityId,
          },
        },
        createdBy: activeUser.id,
        // deleted: false,
        section: section,
        revisionReminderFlag: false,
        countNumber: 1,
        versionInfo,
      },
    };

    const createDocument = await this.prisma.documents.create(body);
    if (documentLink != null) {
      const attachRec = await this.prisma.documentAttachmentHistory.create({
        data: {
          documentId: createDocument.id,
          updatedLink: createDocument.documentLink,
          updatedBy: createDocument.createdBy,
        },
      });
    }

    const data = {
      moduleType: doctype.id,
      prefix: doctype.prefix,
      suffix: doctype.suffix,
      loScation: locationId,
      createdBy: null,
      organizationId: organization.id,
    };

    try {
      const checkprefixsuffix = await this.prisma.prefixSuffix.findFirst({
        where: {
          moduleType: doctype.id,
          location: locationId,
        },
      });
      if (!checkprefixsuffix) {
        const createPrefixSufix =
          await this.serialNumberService.createPrefixSuffix(data);
      }
    } catch (error) {}

    if (refsData && refsData.length > 0) {
      const refs = refsData.map((ref: any) => ({
        ...ref,
        refTo: createDocument.id,
      }));

      const createRefs = await this.refsService.create(refs);
      // ////////////////console.log('created refs--->', createRefs);
    }

    //first create document admins--- creator
    try {
      if (referenceDocuments) {
        for (let i = 0; i < referenceDocuments.length; i++) {
          const createRefDoc = await this.prisma.referenceDocuments.create({
            data: {
              version: referenceDocuments[i].currentVersion,
              type: referenceDocuments[i].type,
              documentLink: referenceDocuments[i].documentLink,
              documentName: referenceDocuments[i].documentName,
              referenceDocId: referenceDocuments[i].id,
              document: {
                connect: {
                  id: createDocument.id,
                },
              },
            },
          });
        }
      }

      const creator = [
        {
          userId: activeUser.id,
          firstname: activeUser.firstname,
          lastname: activeUser.lastname,
          email: activeUser.email,
        },
      ];
      if (reviewers !== 'undefined' && reviewers.length > 0) {
        // for (let reviewData of reviewers) {
        const reviwerData = reviewers.map((value: any) => value.id);
        const reviewUser = await this.prisma.user.findMany({
          where: { id: { in: reviwerData } },
        });
        const linkDocumentWithReviewers = await documentAdminsCreator(
          reviewUser,
          this.prisma.additionalDocumentAdmins,
          createDocument.id,
          'REVIEWER',
        );
        // }
      }

      if (approvers !== 'undefined' && approvers.length > 0) {
        // for (let approveData of approvers) {
        const approverData = approvers.map((value) => value.id);

        const approverUserData = await this.prisma.user.findMany({
          where: { id: { in: approverData } },
        });
        const linkDocumentWithApprovers = await documentAdminsCreator(
          approverUserData,
          this.prisma.additionalDocumentAdmins,
          createDocument.id,
          'APPROVER',
        );
        // }
      }

      const linkDocumentWithCreator = await documentAdminsCreator(
        creator,
        this.prisma.additionalDocumentAdmins,
        createDocument.id,
        'CREATOR',
      );

      if (readAccess === 'Selected Users') {
        if (readAccessUsers?.length > 0) {
          const userids = readAccessUsers.map((value) => value.id);
          let usersarray = await this.prisma.user.findMany({
            where: { id: { in: userids } },
          });
          //////////////console.log('userarray', usersarray);
          const linkDoctypeWithReaders = await documentAdminsCreator(
            usersarray,
            this.prisma.additionalDocumentAdmins,
            createDocument.id,
            'READER',
          );
        }
      }
      //console.log('document state ', createDocument.documentState);
      const createWorkFlowHistory =
        await this.prisma.documentWorkFlowHistory.create({
          data: {
            actionName: createDocument.documentState,
            user: {
              connect: {
                id: activeUser.id,
              },
            },
            actionBy: activeUser.email,

            document: {
              connect: {
                id: createDocument.id,
              },
            },
          },
        });
      const createddocument = await this.prisma.documents.findFirst({
        where: {
          id: createDocument.id,
        },
        include: {
          creatorEntity: true,
          creatorLocation: true,
          AdditionalDocumentAdmins: { include: { user: true } },
          organization: true,
        },
      });
      if (createDocument.documentState === 'IN_REVIEW') {
        //documentstate changed from draft to in review on send for review by creator, send mail to all reviewers for this doc
        const createdBy = await this.prisma.documentWorkFlowHistory.findFirst({
          where: {
            documentId: createDocument.id,
          },
          select: {
            actionBy: true,
            actionName: true,
            userId: true,
          },
        });
        // //console.log('createdby', createdBy);
        const user = await this.prisma.user.findUnique({
          where: {
            id: createdBy.userId,
          },
        });
        // //console.log('user', user);
        const mailRecipients =
          await this.prisma.additionalDocumentAdmins.findMany({
            where: {
              AND: [
                { documentId: createDocument.id },
                // { NOT: { userId: createdBy.userId } },
                { type: 'REVIEWER' },
              ],
            },
            select: {
              firstname: true,
              lastname: true,
              email: true,
            },
          });
        // //console.log('mailrecipients', mailRecipients);
        for (let users of mailRecipients) {
          await sendMailForReview(
            user,
            users,
            createddocument,
            this.emailService.sendEmail,
          );
        }
      }
    } catch (err) {
      const deleteTheCreatedDocument = await this.prisma.documents.delete({
        where: {
          id: createDocument.id,
        },
      });

      throw new BadRequestException(err);
    }
    this.logger.log(
      `trace id=${randomNumber} Post api/documents service successful`,
      '',
    );

    return {
      ...createDocument,
    };
    // } catch (err) {
    //   this.logger.error(
    //     `trace id=${randomNumber} Post api/documents  service failed ${err}`,
    //     '',
    //   );
    // }
  }

  async getEntityForDocument(user) {
    // try {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
      include: { entity: true },
    });
    let data;
    let uniqueData;
    if (activeUser?.userType !== 'globalRoles') {
      if (activeUser.entityId !== null) {
        data = await this.prisma.entity.findMany({
          where: {
            organizationId: activeUser.organizationId,
            users: { has: activeUser.id },
          },
          select: { id: true, entityName: true },
        });
      } else {
        data = await this.prisma.entity.findMany({
          where: {
            organizationId: activeUser.organizationId,
            locationId: activeUser.locationId,
          },
        });
      }
    } else {
      if (activeUser?.additionalUnits?.includes('All')) {
        data = await this.prisma.entity.findMany({
          where: {
            organizationId: activeUser.organizationId,
          },
        });
      } else {
        data = await this.prisma.entity.findMany({
          where: {
            organizationId: activeUser.organizationId,
            locationId: {
              in: activeUser.additionalUnits, // activeUser.additionalUnits is an array of strings
            },
          },
        });
      }
    }
    // if (data.length === 0) {
    //   data =

    // }
    const userDept = [
      {
        id: activeUser?.entityId,
        entityName: activeUser?.entity?.entityName,
      },
    ];

    const cominedData = [...data, ...userDept];

    uniqueData = cominedData.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
    return uniqueData;
    // } catch (err) {
    //   throw new InternalServerErrorException(err);
    // }
  }

  async findAllBySystems(filterString, systems, page, limit, realmName, user) {
    const skipValue = (page - 1) * Number(limit);

    // ?filter=locationAdmin|value,locationType|something
    let myFilter;

    if (filterString) {
      myFilter = filterString.split(',').map((item) => {
        //locationAdmin|value
        let [fieldName, fieldValue] = item.split('|'); //[locationAdmin,value]
        return { filterField: fieldName, filterString: fieldValue };
      });
    }

    let filterQuery: any;

    if (myFilter) {
      filterQuery = queryGeneartorForDocumentsFilter(myFilter);

      const filteredDocuments = await this.prisma.documents.findMany({
        skip: skipValue,
        take: Number(limit),
        where: {
          system: { has: systems },
          AND: [
            ...filterQuery,
            {
              organization: {
                realmName: realmName,
              },
            },
          ],
        },
        include: {
          doctype: {
            // include: {
            //   location: true,
            // },
          },
        },
        orderBy: {
          documentName: 'asc',
        },
      });
      //check permissionforUser
      const length = await this.prisma.documents.count({
        where: {
          system: { has: systems },
          AND: [
            ...filterQuery,
            {
              organization: {
                realmName: realmName,
              },
            },
          ],
        },
      });

      const documentsWithPermssions = [];

      for (const document of filteredDocuments) {
        const access = await this.checkPermissionsForPreviewPage(
          user,
          document.id,
        );
        const isUserCreator = await this.checkIfUserCreatorForDocument(
          user,
          document.id,
        );

        documentsWithPermssions.push({
          ...document,
          access: access,
          isCreator: isUserCreator,
        });
      }

      return { data: documentsWithPermssions, length: length };
    } else {
      const filteredDocuments = await this.prisma.documents.findMany({
        skip: skipValue,
        take: Number(limit),
        where: {
          system: { has: systems },
          organization: {
            realmName: realmName,
          },
        },
        include: {
          doctype: {
            // include: {
            //   location: true,
            // },
          },
        },
        orderBy: {
          documentName: 'asc',
        },
      });

      //permissions

      const documentsWithPermssions = [];

      for (const document of filteredDocuments) {
        const access = await this.checkPermissionsForPreviewPage(
          user,
          document.id,
        );
        const isUserCreator = await this.checkIfUserCreatorForDocument(
          user,
          document.id,
        );

        documentsWithPermssions.push({
          ...document,
          access: access,
          isCreator: isUserCreator,
        });
      }

      //permission checking

      const length = await this.prisma.documents.count({
        where: {
          system: systems,
          organization: {
            realmName: realmName,
          },
        },
      });

      return { data: documentsWithPermssions, length: length };
    }
  }

  async findOne(documentId, version, versionId, user) {
    const randomNumber = uuid();

    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/documents/getSingleDocument/${documentId} service started`,
        '',
      );

      let document;
      let versionDocs;
      let section, sectionName;
      let downloadAccess;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user?.id },
      });
      let refDocument = await this.refsService.getAllById(documentId);
      if (version) {
        // const version = await this.getVersionOfDocument(documentId);
        // const refDocs = [];

        // if (version.referenceDocumentsForVersion?.length > 0) {
        //   for (const refDoc of version.referenceDocumentsForVersion) {
        //     refDocs.push({ ...refDoc, currentVersion: refDoc.version });
        //   }
        // }

        document = await this.prisma.documents.findUnique({
          where: {
            id: documentId,
          },
          include: {
            creatorLocation: true,
            creatorEntity: true,
            AdditionalDocumentAdmins: { include: { user: true } },
            doctype: true,
            DocumentVersions: true,
            DocumentWorkFlowHistory: true,
            ReferenceDocuments: true,
          },
        });

        let documentAccessData = document?.doctype?.whoCanDownloadUsers?.map(
          (item) => {
            if (
              item?.id === 'All Users' ||
              item?.id === activeUser.id ||
              item?.id === activeUser.entityId ||
              item?.id === activeUser.locationId
            ) {
              return true;
            }
          },
        );

        downloadAccess = documentAccessData.includes(true);
        const attachmentdetails = await this.getDocumentAttachmentHistory(
          documentId,
        );
        if (
          document.section !== undefined &&
          document.section !== 'undefined' &&
          document !== null &&
          document !== ''
        ) {
          const sectionData = await this.prisma.section.findFirst({
            where: { id: document?.section },
            select: { name: true, id: true },
          });
          section = sectionData?.name || '';
          sectionName = sectionData?.name || '';
        }
        ////console.log('attachment details', attachmentdetails);
        //we wre getting the document only and i am sending
        //if version then only send the other documentInfo and change th link

        if (document?.AdditionalDocumentAdmins) {
          const additionalDocumentAdmins = document.AdditionalDocumentAdmins;
          const seperatedAdmins = adminsSeperators(additionalDocumentAdmins);
          return {
            ...document,
            attachmentHistory: attachmentdetails,
            creators: seperatedAdmins.creators,
            reviewers: seperatedAdmins.reviewers,
            approvers: seperatedAdmins.approvers,
            additionalReaders: seperatedAdmins.readers,
            // ReferenceDocuments: refDocs,
            // DocumentVersions: version.versionHistory,
            // DocumentWorkFlowHistory: version.workflowHistory,
            downloadAccess,
            documentLink: document.documentLink,
            documentLinkNew: document.documentLink,
            sectionName,

            // comments: version.commentsForVersion,
            // currentVersion: version.version.versionName,
            // issueNumber: version?.version?.issueNumber,
            // documentName: version.version.documentName,
            // documentNumbering: version.version.documentNumbering,
            // effectiveDate: version.version.effectiveDate,
            // isVersion: true,
            // reasonOfCreation: version.version.reasonOfCreation,
            // description: version.version.description,
          };
        } else {
          return {
            ...document,
            attachmentHistory: attachmentdetails,
            documentLink: document?.documentLink,
            documentLinkNew: document?.documentLink,
            sectionName,
            downloadAccess,
            // ReferenceDocuments: refDocs,
            // DocumentVersions: version.versionHistory,
            // DocumentWorkFlowHistory: version.workflowHistory,
            // documentLink: version.version.versionLink,
            // documentLinkNew: version.version.versionLink,
            // currentVersion: version.version.versionName,
            // comments: version.commentsForVersion,
            // documentName: version.version.documentName,
            // documentNumbering: version.version.documentNumbering,
            // effectiveDate: version.version.effectiveDate,
            // issueNumber: version?.version?.issueNumber,
            // isVersion: true,
            // reasonOfCreation: version.version.reasonOfCreation,
            // description: version.version.description,
          };
        }
      }
      document = await this.prisma.documents.findUnique({
        where: {
          id: documentId,
        },
        include: {
          creatorLocation: true,
          creatorEntity: true,
          AdditionalDocumentAdmins: { include: { user: true } },
          doctype: true,
          DocumentVersions: true,
          DocumentWorkFlowHistory: true,
          ReferenceDocuments: true,
        },
      });
      let documentAccessData = document?.doctype?.whoCanDownloadUsers?.map(
        (item) => {
          if (
            item?.id === 'All Users' ||
            item?.id === activeUser.id ||
            item?.id === activeUser.entityId ||
            item?.id === activeUser.locationId
          ) {
            return true;
          }
        },
      );

      downloadAccess = documentAccessData.includes(true);
      if (
        document?.section !== undefined &&
        document?.section !== 'undefined' &&
        document !== null &&
        document !== ''
      ) {
        const sectionData = await this.prisma.section.findFirst({
          where: { id: document?.section || '' },
          select: { name: true, id: true },
        });
        section = sectionData?.id || '';
        sectionName = sectionData?.name || '';
      }
      const attachmentdetails = await this.getDocumentAttachmentHistory(
        documentId,
      );

      if (document?.countNumber > 1) {
        versionDocs = await this.prisma.documents.findMany({
          where: {
            OR: [
              { documentId: document?.documentId, isVersion: true },
              { id: document?.documentId, isVersion: true },
            ],
          },
        });
      }

      // const versionLast = await this.prisma.documentVersions.findFirst({
      //   where: {
      //     documentId: documentId,
      //   },
      //   orderBy: [{ createdAt: 'desc' }],
      // });

      // document = await this.prisma.documents.findUnique({
      //   where: {
      //     id: documentId,
      //   },
      //   include: {
      //     creatorLocation: true,
      //     creatorEntity: true,
      //     AdditionalDocumentAdmins: true,
      //     doctype: true,
      //     // DocumentVersions: versionDocs,
      //     DocumentWorkFlowHistory: true,
      //     ReferenceDocuments:true,
      //     // ReferenceDocuments:true,
      //     // DocumentWorkFlowHistory:true
      //   },
      // });
      const refDocs = [];
      // const currentDocumentLink = await this.prisma.documentVersions.findFirst({
      //   where: {
      //     documentId,
      //     versionName: versionId,
      //   },
      // });

      if (document?.ReferenceDocuments?.length > 0) {
        for (const refDoc of document.ReferenceDocuments) {
          refDocs.push({ ...refDoc, currentVersion: refDoc.version });
        }
      }

      // const upDatedDoc = {
      //   ...document,
      //   documentLink: versionId !== null
      //   ? document.currentVersion === versionId
      //     ? document.documentLink
      //     : currentDocumentLink?.versionLink
      //   : document.documentLink,
      // }

      if (document?.AdditionalDocumentAdmins) {
        const additionalDocumentAdmins = document.AdditionalDocumentAdmins;
        const seperatedAdmins = adminsSeperators(additionalDocumentAdmins);
        this.logger.log(
          `trace id=${randomNumber} Get api/documents/getSingleDocument/${documentId} service successful`,
          '',
        );
        return {
          ...document,
          attachmentHistory: attachmentdetails,
          DocumentVersions: versionDocs || [],
          documentLinkNew: document.documentLink,
          section,
          sectionName,
          downloadAccess,
          // documentState: versionId !== null ? 'OBSOLETE' : document.documentState,
          // documentLinkNew:
          //   versionId !== null
          //     ? document.currentVersion === versionId
          //       ? document.documentLink
          //       : currentDocumentLink?.versionLink
          //     : document.documentLink,
          // isVersion: currentDocumentLink ? false : true,
          creators: seperatedAdmins.creators,
          reviewers: seperatedAdmins.reviewers,
          approvers: seperatedAdmins.approvers,
          additionalReaders: seperatedAdmins.readers,
          ReferenceDocuments: refDocument,
        };
      } else {
        return {
          ...document,
          attachmentHistory: attachmentdetails,
          DocumentVersions: versionDocs || [],
          documentLinkNew: document?.documentLink,
          sectionName,
          downloadAccess,
          // documentState: versionId !== null ? 'OBSOLETE' : document.documentState,
          // isVersion: currentDocumentLink ? false : true,
          // documentLinkNew:
          //   versionId === null
          //     ? document.currentVersion === versionId
          //       ? document.documentLink
          //       : currentDocumentLink?.versionLink
          //     : document.documentLink,
          ReferenceDocuments: refDocument,
        };
      }
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/documents/getSingleDocument/${documentId}  service failed ${err}`,
        '',
      );
    }
  }

  // async update(id, createDocumentDto: CreateDocumentDto, file?, user?) {
  //GET THE CURRENT ACTIVE USER
  // const activeUser = await this.prisma.user.findFirst({
  //   where: {
  //     kcId: user.id,
  //   },
  // });
  // const auditTrail = await auditTrailWatcher(
  //   'Documents',
  //   'Document Control',
  //   'Documents',
  //   user,
  //   activeUser,
  //   "",
  // );
  //   let payload = JSON.parse(JSON.stringify(createDocumentDto));
  //   let {
  //     documentName,
  //     description,
  //     documentState,
  //     documentVersions,
  //     doctypeId,
  //     reasonOfCreation,
  //     documentNumbering,
  //     documentLink,
  //     effectiveDate,
  //     currentVersion,
  //     tags,
  //     realmName,
  //     additionalReaders,
  //     creators,
  //     reviewers,
  //     approvers,
  //     referenceDocuments,
  //     entityId,
  //     locationId,
  //     distributionList,
  //     distributionUsers,
  //     readAccess,
  //     readAccessUsers,
  //     systems,
  //     refsData,
  //     locationName,
  //   } = payload;
  //   effectiveDate = new Date();
  //   //Find the document to be updated
  //   const documentToBeUpdated = await this.prisma.documents.findUnique({
  //     where: {
  //       id: id,
  //     },
  //   });

  //   //find the organization where document needs to be created
  //   const organization = await this.prisma.organization.findFirst({
  //     where: {
  //       realmName: realmName,
  //     },
  //   });
  //   //GET THE CURRENT ACTIVE USER
  //   const activeUser = await this.prisma.user.findFirst({
  //     where: {
  //       kcId: user.id,
  //     },
  //   });

  //   // if (!activeUser.entityId) {
  //   //   throw new NotFoundException(
  //   //     'No department found for the particular user',
  //   //   );
  //   // }
  //   // GETTING ACTIVE USERS DEPARTMENT
  //   const activeUserDept = await this.prisma.entity.findFirst({
  //     where: {
  //       id: activeUser.entityId || documentToBeUpdated.entityId,
  //     },
  //   });

  //   // write document numbering logic
  //   //find the doctype and check numbering

  //   const doctype = await this.prisma.doctype.findFirst({
  //     where: {
  //       id: doctypeId,
  //     },
  //   });

  //   const location = await this.prisma.location.findFirst({
  //     where: {
  //       id: {
  //         in: doctype?.locationId?.includes('All')
  //           ? [activeUser?.locationId]
  //           : doctype?.locationId,
  //       },
  //     },
  //   });
  //   if (
  //     doctype.documentNumbering === 'Serial' &&
  //     documentState === 'PUBLISHED'
  //   ) {
  //     const prefixArr = doctype.prefix.split('-');
  //     const suffixArr = doctype.suffix.split('-');
  //     const noOfDocumentsOfOrg = await this.prisma.documents.count({
  //       where: {
  //         organization: {
  //           realmName: realmName,
  //         },
  //       },
  //     });
  //     const currentyear = new Date().getFullYear();
  //     let year;
  //     if (organization.fiscalYearFormat === 'YY-YY+1') {
  //       year = await this.organizationService.getFiscalYear(
  //         organization.id,
  //         currentyear,
  //       );
  //     } else {
  //       const cyear = await this.organizationService.getFiscalYear(
  //         organization.id,
  //         currentyear,
  //       );
  //       year = cyear.toString().slice(-2);
  //     }
  //     const prefix = generateNumbering(
  //       prefixArr,
  //       location.locationId,
  //       activeUserDept.entityId,
  //       year,
  //     ).join('-');
  //     const suffix = generateNumbering(
  //       suffixArr,
  //       location.locationId,
  //       activeUserDept.entityId,
  //       year,
  //     ).join('-');

  //     documentNumbering = suffix
  //       ? `${prefix}-${noOfDocumentsOfOrg + 1}-${suffix}`
  //       : `${prefix}-${noOfDocumentsOfOrg + 1}`;
  //   }
  //   //if manual then take from dto
  //   //else if serial write serial numbering generation logic

  //   if (readAccess === 'Selected Users') {
  //     if (readAccessUsers?.length > 0) {
  //       const userids = readAccessUsers.map((value) => value.id);
  //       let usersarray = await this.prisma.user.findMany({
  //         where: { id: { in: userids } },
  //       });
  //       const linkDoctypeWithReaders = await documentAdminsCreator(
  //         usersarray,
  //         this.prisma.additionalDocumentAdmins,
  //         documentToBeUpdated.id,
  //         'READER',
  //       );
  //     }
  //   }
  //   if (file) {
  //     if (process.env.IS_OBJECT_STORE === 'true') {
  //       documentLink = await this.addDocumentToOS(file, locationName);
  //     } else {
  //       // ${process.env.SERVER_IP}/${organization.realmName.toLowerCase()}/${location.locationName.toLowerCase()}/document/${file.filename}
  //       documentLink = `${
  //         process.env.SERVER_IP
  //       }/${organization.organizationName.toLowerCase()}/${location.locationName.toLowerCase()}/document/${
  //         file.filename
  //       }`;
  //     }
  //   }
  //   let newVersion;
  //   let approvedDate;

  //   const currentDocumentInDb = await this.prisma.documents.findUnique({
  //     where: {
  //       id: id,
  //     },
  //   });

  //   if (documentState == 'PUBLISHED') {
  //     const date = new Date();
  //     if (
  //       doctype.documentNumbering === 'Serial' &&
  //       documentState === 'PUBLISHED'
  //     ) {
  //       const prefixArr = doctype.prefix.split('-');
  //       const suffixArr = doctype.suffix.split('-');
  //       const noOfDocumentsOfOrg = await this.prisma.documents.count({
  //         where: {
  //           organization: {
  //             realmName: realmName,
  //           },
  //         },
  //       });
  //       const currentyear = new Date().getFullYear();
  //       let year;
  //       if (organization.fiscalYearFormat === 'YY-YY+1') {
  //         year = await this.organizationService.getFiscalYear(
  //           organization.id,
  //           currentyear,
  //         );
  //       } else {
  //         const cyear = await this.organizationService.getFiscalYear(
  //           organization.id,
  //           currentyear,
  //         );
  //         year = cyear.toString().slice(-2);
  //       }
  //       const prefix = generateNumbering(
  //         prefixArr,
  //         location.locationId,
  //         activeUserDept.entityId,
  //         year,
  //       ).join('-');
  //       const suffix = generateNumbering(
  //         suffixArr,
  //         location.locationId,
  //         activeUserDept.entityId,
  //         year,
  //       ).join('-');

  //       documentNumbering = suffix
  //         ? `${prefix}-${noOfDocumentsOfOrg + 1}-${suffix}`
  //         : `${prefix}-${noOfDocumentsOfOrg + 1}`;
  //     }
  //     // //////////////console.log('inside if published', date);
  //     const revisionfrequencyOfDoctype = await this.prisma.doctype.findUnique({
  //       where: { id: doctypeId },
  //       select: {
  //         reviewFrequency: true,
  //         revisionRemind: true,
  //       },
  //     });
  //     const nextRevisionDate = await this.calculateNextDate(
  //       date,
  //       revisionfrequencyOfDoctype.reviewFrequency,
  //     );
  //     ////////////////console.log('nextRevisiondate', nextRevisionDate);
  //     const updateDocument = await this.prisma.documents.update({
  //       where: {
  //         id: id,
  //       },
  //       data: {
  //         distributionList,
  //         distributionUsers,
  //         readAccess,
  //         readAccessUsers,
  //         documentNumbering,
  //         documentState: documentState,
  //         approvedDate: date,
  //         nextRevisionDate: nextRevisionDate,
  //       },
  //     });

  //     // sending mail to users based on distributionList
  //     const allUsers = [];
  //     const currentdocindb = await this.prisma.documents.findFirst({
  //       where: {
  //         id: updateDocument.id,
  //       },
  //       include: {
  //         organization: true,
  //         creatorEntity: true,
  //         creatorLocation: true,
  //       },
  //     });

  //     if (!currentDocumentInDb.effectiveDate) {
  //       effectiveDate = new Date();
  //     }
  //   }
  //   if (documentState == 'APPROVED') {
  //     if (!currentDocumentInDb.approvedDate) {
  //       approvedDate = new Date();
  //     }
  //   }
  //   if (documentState == 'IN_REVIEW') {
  //     const updateDocument = await this.prisma.documents.update({
  //       where: {
  //         id: id,
  //       },
  //       data: {
  //         system: systems,
  //         description: description,
  //         documentName: documentName,
  //         documentState: documentState,
  //         tags: tags,
  //         documentLink: documentLink,
  //         distributionList,
  //         distributionUsers,
  //         readAccess,
  //         readAccessUsers,
  //         // documentNumbering: documentNumbering,
  //         reasonOfCreation: reasonOfCreation,
  //       },
  //     });
  //     if (documentLink != null) {
  //       const attachRec = await this.prisma.documentAttachmentHistory.create({
  //         data: {
  //           documentId: updateDocument.id,
  //           updatedLink: updateDocument.documentLink,
  //           updatedBy: activeUser.id,
  //         },
  //       });
  //       ////console.log('attachrec', attachRec);
  //     }
  //   }

  //   if (documentState == 'DRAFT') {
  //     const updateDocument = await this.prisma.documents.update({
  //       where: {
  //         id: id,
  //       },
  //       data: {
  //         system: systems,
  //         description: description,
  //         documentName: documentName,
  //         documentState: documentState,
  //         tags: tags,
  //         documentLink: documentLink,
  //         distributionList,
  //         distributionUsers,
  //         readAccess,
  //         readAccessUsers,
  //         // documentNumbering: documentNumbering,
  //         reasonOfCreation: reasonOfCreation,
  //       },
  //     });
  //     if (documentLink != null) {
  //       const attachRec = await this.prisma.documentAttachmentHistory.create({
  //         data: {
  //           documentId: updateDocument.id,
  //           updatedLink: updateDocument.documentLink,
  //           updatedBy: updateDocument.createdBy,
  //         },
  //       });
  //     }
  //   }

  //   if (documentState == 'IN_APPROVAL') {
  //     const updateDocument = await this.prisma.documents.update({
  //       where: {
  //         id: id,
  //       },
  //       data: {
  //         system: systems,
  //         description: description,
  //         documentName: documentName,
  //         documentState: documentState,
  //         tags: tags,
  //         documentLink: documentLink,
  //         distributionList,
  //         distributionUsers,
  //         readAccess,
  //         readAccessUsers,
  //         // documentNumbering: documentNumbering,
  //         reasonOfCreation: reasonOfCreation,
  //       },
  //     });
  //     if (documentLink != null) {
  //       const attachRec = await this.prisma.documentAttachmentHistory.create({
  //         data: {
  //           documentId: updateDocument.id,
  //           updatedLink: updateDocument.documentLink,
  //           updatedBy: updateDocument.createdBy,
  //         },
  //       });
  //     }
  //   }

  //   //if status save as draft
  //   if (documentState == 'AMMEND') {
  //     //Find the current version of the document, and take the link and current verion name
  //     //from that document , and create a documentVersion(with , link of fetched document , and its current version name,)
  //     //and from the newly recieved form data sent update the current version and document link and any other changes
  //     const currentSavedVersion = await this.prisma.documents.findUnique({
  //       where: {
  //         id: id,
  //       },
  //       include: {
  //         ReferenceDocuments: true,
  //       },
  //     });
  //     if (doctype.currentVersion === currentSavedVersion.currentVersion) {
  //       newVersion = 'A';
  //     } else {
  //       newVersion = String.fromCharCode(
  //         currentSavedVersion.currentVersion.charCodeAt(0) + 1,
  //       );
  //     }

  //     //create new version with the currently saved version
  //     const version = await this.prisma.documentVersions.create({
  //       data: {
  //         document: {
  //           connect: {
  //             id: id,
  //           },
  //         },
  //         versionName: currentSavedVersion.currentVersion,
  //         versionLink: currentSavedVersion.documentLink,
  //         approvedDate: currentSavedVersion.approvedDate,
  //         documentName: currentSavedVersion.documentName,
  //         documentNumbering: currentSavedVersion.documentNumbering,
  //         reasonOfCreation: currentSavedVersion.reasonOfCreation,
  //         effectiveDate: currentSavedVersion.effectiveDate,
  //         description: currentSavedVersion.description,
  //         issueNumber: currentSavedVersion.issueNumber,
  //         user: {
  //           connect: {
  //             id: activeUser.id,
  //           },
  //         },
  //         by: activeUser.email,
  //       },
  //     });

  //     if (currentSavedVersion.ReferenceDocuments.length > 0) {
  //       for (
  //         let i = 0;
  //         i < currentSavedVersion.ReferenceDocuments.length;
  //         i++
  //       ) {
  //         const createRefDoc =
  //           await this.prisma.versionReferenceDocuments.create({
  //             data: {
  //               version: referenceDocuments[i].currentVersion,
  //               type: referenceDocuments[i].type,
  //               documentLink: referenceDocuments[i].documentLink,
  //               documentName: referenceDocuments[i].documentName,
  //               referenceDocId: referenceDocuments[i].id,
  //               versionsLinkedWith: {
  //                 connect: {
  //                   id: version.id,
  //                 },
  //               },
  //             },
  //           });
  //       }
  //     }
  //     let resultForIssue;
  //     if (doctype.currentVersion === currentSavedVersion.currentVersion) {
  //       const numberValue = parseInt(documentToBeUpdated.issueNumber, 10) + 1;
  //       resultForIssue = numberValue
  //         .toString()
  //         .padStart(documentToBeUpdated?.issueNumber.toString().length, '0');
  //     }
  //     ////////////////console.log("distributionList",distributionList)
  //     ////////////////console.log("distributionUsers",distributionUsers)
  //     const updateDocument = await this.prisma.documents.update({
  //       where: {
  //         id: id,
  //       },
  //       data: {
  //         doctype: {
  //           connect: {
  //             id: doctypeId,
  //           },
  //         },
  //         organization: {
  //           connect: {
  //             id: organization.id,
  //           },
  //         },
  //         description: description,
  //         documentName: documentName,
  //         documentState: 'DRAFT',
  //         issueNumber: resultForIssue
  //           ? resultForIssue
  //           : currentSavedVersion.issueNumber,
  //         distributionList,
  //         distributionUsers,
  //         readAccess,
  //         readAccessUsers,
  //         currentVersion: newVersion,
  //         tags: tags,
  //         documentLink: documentLink,

  //         documentNumbering: documentNumbering,
  //         reasonOfCreation: reasonOfCreation,
  //         effectiveDate: effectiveDate
  //           ? effectiveDate
  //           : currentDocumentInDb.effectiveDate,
  //         approvedDate: approvedDate
  //           ? approvedDate
  //           : currentDocumentInDb.approvedDate,
  //       },
  //     });
  //     if (documentLink != null) {
  //       const attachRec = await this.prisma.documentAttachmentHistory.create({
  //         data: {
  //           documentId: updateDocument.id,
  //           updatedLink: updateDocument.documentLink,
  //           updatedBy: activeUser.id,
  //         },
  //       });
  //     }
  //   }

  //   await this.prisma.referenceDocuments.deleteMany({
  //     where: {
  //       documentId: id,
  //     },
  //   });
  //   // update the document with the form data
  //   const updateDocument = await this.prisma.documents.update({
  //     where: {
  //       id: id,
  //     },
  //     data: {
  //       doctype: {
  //         connect: {
  //           id: doctypeId,
  //         },
  //       },
  //       organization: {
  //         connect: {
  //           id: organization.id,
  //         },
  //       },
  //       description: description,
  //       documentName: documentName,
  //       currentVersion: newVersion,
  //       tags: tags,
  //       documentLink: documentLink,
  //       documentNumbering: documentNumbering,
  //       reasonOfCreation: reasonOfCreation,
  //       distributionList,
  //       distributionUsers,
  //       readAccess,
  //       readAccessUsers,
  //       effectiveDate: effectiveDate
  //         ? effectiveDate
  //         : currentDocumentInDb.effectiveDate,
  //       approvedDate: approvedDate
  //         ? approvedDate
  //         : currentDocumentInDb.approvedDate,
  //     },
  //   });
  //   if (documentLink != null) {
  //     const attachRec = await this.prisma.documentAttachmentHistory.create({
  //       data: {
  //         documentId: updateDocument.id,
  //         updatedLink: updateDocument.documentLink,
  //         updatedBy: activeUser.id,
  //       },
  //     });
  //   }

  //   // ////////////////console.log('updated document', updateDocument);
  //   // ////////////////console.log('inside update document', refsData);

  //   if (refsData && refsData.length > 0) {
  //     const refs = refsData.map((ref: any) => ({
  //       ...ref,
  //       refTo: id,
  //     }));

  //     const updateRefs = await this.refsService.update({ refs: refs, id: id });
  //     // ////////////////console.log('created refs--->', updateRefs);
  //   }

  //   //delete previously connected admins
  //   // const deleteConnectedDocumentAdmins =
  //   //   await this.prisma.additionalDocumentAdmins.deleteMany({
  //   //     where: {
  //   //       documentId: id,
  //   //     },
  //   //   });
  //   //delete previosly connected reference documents
  //   const deleteReferenceDocuments =
  //     await this.prisma.referenceDocuments.deleteMany({
  //       where: {
  //         documentId: id,
  //       },
  //     });

  //   //connect reference documents
  //   if (referenceDocuments) {
  //     for (let i = 0; i < referenceDocuments.length; i++) {
  //       const createRefDoc = await this.prisma.referenceDocuments.create({
  //         data: {
  //           version: referenceDocuments[i].currentVersion,
  //           type: referenceDocuments[i].type,
  //           documentLink: referenceDocuments[i].documentLink,
  //           documentName: referenceDocuments[i].documentName,
  //           referenceDocId: referenceDocuments[i].id,
  //           document: {
  //             connect: {
  //               id: updateDocument.id,
  //             },
  //           },
  //         },
  //       });
  //     }
  //   }

  //   //first create document admins--- creator
  //   //const linkDocumentWithCreators = await documentAdminsCreator(creators, this.prisma.additionalDocumentAdmins, updateDocument.id, "CREATOR")
  //   // const linkDocumentWithReviewers = await documentAdminsCreator(
  //   //   reviewers,
  //   //   this.prisma.additionalDocumentAdmins,
  //   //   updateDocument.id,
  //   //   'REVIEWER',
  //   // );
  //   // const linkDocumentWithApprovers = await documentAdminsCreator(
  //   //   approvers,
  //   //   this.prisma.additionalDocumentAdmins,
  //   //   updateDocument.id,
  //   //   'APPROVER',
  //   // );

  //   // if (additionalReaders?.length > 0) {
  //   //   const linkDoctypeWithReaders = await documentAdminsCreator(
  //   //     additionalReaders,
  //   //     this.prisma.additionalDocumentAdmins,
  //   //     updateDocument.id,
  //   //     'READER',
  //   //   );
  //   // }

  //   if (documentState === 'DRAFT' || documentState === 'IN_REVIEW') {
  //     const deleteAdditionalAdmins =
  //       await this.prisma.additionalDocumentAdmins.deleteMany({
  //         where: {
  //           document: {
  //             id: documentToBeUpdated.id,
  //           },
  //         },
  //       });

  //     const creator = [
  //       {
  //         userId: activeUser.id,
  //         firstname: activeUser.firstname,
  //         lastname: activeUser.lastname,
  //         email: activeUser.email,
  //       },
  //     ];
  //     if (reviewers.length > 0) {
  //       // for (let reviewData of reviewers) {
  //       const reviewUser = await this.prisma.user.findMany({
  //         where: { id: { in: reviewers } },
  //       });
  //       const linkDocumentWithReviewers = await documentAdminsCreator(
  //         reviewUser,
  //         this.prisma.additionalDocumentAdmins,
  //         documentToBeUpdated.id,
  //         'REVIEWER',
  //       );
  //       // }
  //     }
  //     //////////////console.log('approvers in edit', approvers);
  //     if (approvers.length > 0) {
  //       // for (let approveData of approvers) {
  //       const approverUserData = await this.prisma.user.findMany({
  //         where: { id: { in: approvers } },
  //       });
  //       const linkDocumentWithApprovers = await documentAdminsCreator(
  //         approverUserData,
  //         this.prisma.additionalDocumentAdmins,
  //         documentToBeUpdated.id,
  //         'APPROVER',
  //       );
  //       // }
  //     }

  //     const linkDocumentWithCreator = await documentAdminsCreator(
  //       creator,
  //       this.prisma.additionalDocumentAdmins,
  //       documentToBeUpdated.id,
  //       'CREATOR',
  //     );
  //   }

  //   const documentCreated = await this.prisma.documents.findFirst({
  //     where: {
  //       id: updateDocument.id,
  //     },
  //     include: {
  //       AdditionalDocumentAdmins: true,
  //     },
  //   });
  //   // Creating workflow history for document
  //   const createWorkFlowHistory =
  //     await this.prisma.documentWorkFlowHistory.create({
  //       data: {
  //         actionName: updateDocument.documentState,
  //         user: {
  //           connect: {
  //             id: activeUser.id,
  //           },
  //         },
  //         actionBy: activeUser.email,

  //         document: {
  //           connect: {
  //             id: updateDocument.id,
  //           },
  //         },
  //       },
  //     });

  //   const additionalDocumentAdmins = documentCreated.AdditionalDocumentAdmins;
  //   const seperatedAdmins = adminsSeperators(additionalDocumentAdmins);
  //   return {
  //     ...documentCreated,
  //     creators: seperatedAdmins.creators,
  //     reviewers: seperatedAdmins.reviewers,
  //     approvers: seperatedAdmins.approvers,
  //     readers: seperatedAdmins.readers,
  //   };
  // }

  async updatetest(id, createDocumentDto: CreateDocumentDto, file?, user?) {
    const randomNumber = uuid();
    try {
      this.logger.log(
        `trace id=${randomNumber} Patch api/documents/id service started `,
        '',
      );

      //GET THE CURRENT ACTIVE USER
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      // console.log('actove user', activeUser);
      // const auditTrail = await auditTrailWatcher(
      //   'Documents',
      //   'Document Control',
      //   'Documents',
      //   user,
      //   activeUser,
      //   '',
      // );
      let payload = JSON.parse(JSON.stringify(createDocumentDto));
      let {
        documentName,
        description,
        documentState,
        documentVersions,
        doctypeId,
        reasonOfCreation,
        documentNumbering,
        documentLink,
        effectiveDate,
        currentVersion,
        tags,
        realmName,
        additionalReaders,
        creators,
        reviewers,
        approvers,
        referenceDocuments,
        entityId,
        retireComment,
        locationId,
        distributionList,
        distributionUsers,
        readAccess,
        readAccessUsers,
        systems,
        refsData,
        locationName,
        section,
        aceoffixUrl,
        versionInfo,
        revertComment,
      } = payload;

      effectiveDate = new Date();
      let nextRevisionDate;
      let newVersion;
      let approvedDate;
      let resultForIssue;
      let issueNumber;
      let versionDoc;
      let notUpdate = false;
      let isAmmend = false;

      let currentDocumentState;

      let version;

      //Find the document to be updated
      // const activeUser = await this.prisma.user.findFirst({
      //   where: {
      //     kcId: user.id,
      //   },
      // });
      const documentToBeUpdated = await this.prisma.documents.findUnique({
        where: {
          id: id,
        },
        include: {
          ReferenceDocuments: true,
          organization: true,
          doctype: true,
        },
      });

      //store the current state of document
      currentDocumentState = documentToBeUpdated.documentState;

      //find the organization where document needs to be created
      // const organization = await this.prisma.organization.findFirst({
      //   where: {
      //     realmName: realmName,
      //   },
      // });
      const currentyear = new Date().getFullYear();
      let year;
      if (documentToBeUpdated?.organization.fiscalYearFormat === 'YY-YY+1') {
        year = await this.organizationService.getFiscalYear(
          documentToBeUpdated?.organization.id,
          currentyear,
        );
      } else {
        const cyear = await this.organizationService.getFiscalYear(
          documentToBeUpdated?.organization.id,
          currentyear,
        );
        year = cyear.toString().slice(-2);
      }
      //GET THE CURRENT ACTIVE USER
      let locations;
      if (activeUser.userType === 'globalRoles') {
        locations = documentToBeUpdated.locationId;
      } else {
        locations = activeUser.locationId;
      }
      const location = await this.prisma.location.findFirst({
        where: {
          id: {
            in: documentToBeUpdated?.doctype?.locationId?.includes('All')
              ? [locations]
              : documentToBeUpdated?.doctype?.locationId,
          },
        },
      });

      let hashValue = '';
      if (aceoffixUrl) {
        if (process.env.IS_OBJECT_STORE === 'true') {
          const revExistinVerInfo = versionInfo.findIndex(
            (item: any) => item.type === 'REVIEWER',
          );
          const appExistinVerInfo = versionInfo.findIndex(
            (item: any) => item.type === 'APPROVER',
          );
          if (
            documentState === 'DRAFT' ||
            (documentState === 'IN_REVIEW' &&
              currentDocumentState === 'DRAFT') ||
            (currentDocumentState === 'IN_REVIEW' &&
              (documentState === 'Save' || documentState === 'IN_APPROVAL') &&
              revExistinVerInfo !== -1) ||
            (currentDocumentState === 'IN_APPROVAL' &&
              (documentState === 'Save' || documentState === 'PUBLISHED') &&
              appExistinVerInfo !== -1)
          ) {
            documentLink = await this.addEditDocumentToOS(
              aceoffixUrl,
              locationName,
              true,
            );
          } else {
            documentLink = await this.addEditDocumentToOS(
              aceoffixUrl,
              locationName,
              false,
            );
          }
          const destDirectory = path.join(
            __dirname,
            '..',
            '..',
            '..',
            '..',
            'uploads',
            process.env.OB_ORG_NAME.replace('/', '').toLowerCase(),
            location.locationName.toLowerCase(),
            'document',
          );
          const fileName = aceoffixUrl.split('/').pop();

          if (!fs.existsSync(destDirectory)) {
            fs.mkdirSync(destDirectory, { recursive: true });
          }

          const filePath = await this.downloadFile(
            aceoffixUrl,
            path.join(destDirectory, fileName),
          );
          const fileContent = fs.readFileSync(filePath);
          const hash = createHash('sha256');
          hash.update(fileContent);
          hashValue = hash.digest('hex');
        } else {
          const revExistinVerInfo = versionInfo.findIndex(
            (item: any) => item.type === 'REVIEWER',
          );
          const appExistinVerInfo = versionInfo.findIndex(
            (item: any) => item.type === 'APPROVER',
          );
          if (
            documentState === 'DRAFT' ||
            (documentState === 'IN_REVIEW' &&
              currentDocumentState === 'DRAFT') ||
            (currentDocumentState === 'IN_REVIEW' &&
              (documentState === 'Save' || documentState === 'IN_APPROVAL') &&
              revExistinVerInfo !== -1) ||
            (currentDocumentState === 'IN_APPROVAL' &&
              (documentState === 'Save' || documentState === 'PUBLISHED') &&
              appExistinVerInfo !== -1)
          ) {
            documentLink = `${
              process.env.SERVER_IP
            }/${documentToBeUpdated?.organization.organizationName.toLowerCase()}/${location.locationName.toLowerCase()}/document/${aceoffixUrl
              .split('/')
              .pop()}`;
          } else {
            documentLink = `${
              process.env.SERVER_IP
            }/${documentToBeUpdated?.organization.organizationName.toLowerCase()}/${location.locationName.toLowerCase()}/document/${
              uuid() + '.docx'
            }`;
          }
          const destDirectory = path.join(
            __dirname,
            '..',
            '..',
            '..',
            '..',
            'uploads',
            documentToBeUpdated?.organization.organizationName.toLowerCase(),
            location.locationName.toLowerCase(),
            'document',
          );
          const fileName = documentLink.split('/').pop();

          if (!fs.existsSync(destDirectory)) {
            fs.mkdirSync(destDirectory, { recursive: true });
          }

          const filePath = await this.downloadFile(
            aceoffixUrl,
            path.join(destDirectory, fileName),
          );
          const fileContent = fs.readFileSync(filePath);
          const hash = createHash('sha256');
          hash.update(fileContent);
          hashValue = hash.digest('hex');
        }
      } else if (file) {
        if (process.env.IS_OBJECT_STORE === 'true') {
          documentLink = await this.addDocumentToOS(file, locationName);
          const fileContent = fs.readFileSync(file.path);
          const hash = createHash('sha256');
          hash.update(fileContent);
          hashValue = hash.digest('hex');
        } else {
          // ${process.env.SERVER_IP}/${organization.realmName.toLowerCase()}/${location.locationName.toLowerCase()}/document/${file.filename}
          documentLink = `${
            process.env.SERVER_IP
          }/${documentToBeUpdated?.organization.organizationName.toLowerCase()}/${location.locationName.toLowerCase()}/document/${
            file.filename
          }`;
          const fileContent = fs.readFileSync(file.path);
          const hash = createHash('sha256');
          hash.update(fileContent);
          hashValue = hash.digest('hex');
        }
      }

      if (
        (documentState === 'DRAFT' ||
          (currentDocumentState === 'DRAFT' &&
            documentState === 'IN_REVIEW')) &&
        (file || aceoffixUrl)
      ) {
        const index = versionInfo.findIndex(
          (item: any) => item.type === 'CREATOR',
        );
        versionInfo[index] = {
          type: 'CREATOR',
          id: activeUser.id,
          name: activeUser.firstname + ' ' + activeUser.lastname,
          documentLink: documentLink,
          docCode: hashValue,
        };
      }

      if (
        currentDocumentState === 'IN_REVIEW' &&
        (documentState === 'Save' || documentState === 'IN_APPROVAL')
      ) {
        const creIndex = versionInfo.findIndex(
          (item: any) => item?.type === 'CREATOR',
        );
        let revIndex = versionInfo.findIndex(
          (item: any) => item?.type === 'REVIEWER',
        );
        if (revIndex === -1) {
          versionInfo.push({
            type: 'REVIEWER',
            id: activeUser.id,
            name: activeUser.firstname + ' ' + activeUser.lastname,
            documentLink: versionInfo[creIndex].documentLink,
            docCode: versionInfo[creIndex]?.docCode,
          });
          revIndex = versionInfo.findIndex(
            (item: any) => item.type === 'REVIEWER',
          );
        }
        if (file || aceoffixUrl) {
          versionInfo[revIndex] = {
            type: 'REVIEWER',
            id: activeUser.id,
            name: activeUser.firstname + ' ' + activeUser.lastname,
            documentLink: documentLink,
            docCode: hashValue,
          };
        }
      }

      if (
        currentDocumentState === 'IN_APPROVAL' &&
        (documentState === 'Save' || documentState === 'PUBLISHED')
      ) {
        const revIndex = versionInfo.findIndex(
          (item: any) => item.type === 'REVIEWER',
        );
        let appIndex = versionInfo.findIndex(
          (item: any) => item.type === 'APPROVER',
        );
        if (appIndex === -1) {
          versionInfo.push({
            type: 'APPROVER',
            id: activeUser.id,
            name: activeUser.firstname + ' ' + activeUser.lastname,
            documentLink: versionInfo[revIndex]?.documentLink || '',
            docCode: versionInfo[revIndex]?.docCode,
          });
          appIndex = versionInfo.findIndex(
            (item: any) => item.type === 'APPROVER',
          );
        }
        if (file || aceoffixUrl) {
          versionInfo[appIndex] = {
            type: 'APPROVER',
            id: activeUser.id,
            name: activeUser.firstname + ' ' + activeUser.lastname,
            documentLink: documentLink,
            docCode: hashValue,
          };
        }
      }

      if (documentState == 'PUBLISHED') {
        const date = new Date();

        if (documentToBeUpdated.countNumber > 1) {
          let data;
          if (documentToBeUpdated.countNumber === 2) {
            data = await this.prisma.documents.findFirst({
              where: {
                id: documentToBeUpdated.documentId,
                countNumber: documentToBeUpdated.countNumber - 1,
              },
            });
          } else {
            data = await this.prisma.documents.findFirst({
              where: {
                documentId: documentToBeUpdated.documentId,
                countNumber: documentToBeUpdated.countNumber - 1,
              },
            });
          }

          await this.prisma.documents.update({
            where: { id: data?.id },
            data: {
              nextRevisionDate: null,
            },
          });
        }
        if (
          documentToBeUpdated?.doctype.documentNumbering === 'Serial' &&
          documentState === 'PUBLISHED'
        ) {
          const prefixArr = documentToBeUpdated?.doctype.prefix.split('-');
          const suffixArr = documentToBeUpdated?.doctype.suffix.split('-');
          const entitiId = await this.prisma.entity.findFirst({
            where: { id: documentToBeUpdated.entityId },
          });

          const prefix = generateNumbering(
            prefixArr,
            location.locationId,
            entitiId.entityId,
            year,
          ).join('-');
          const suffix = generateNumbering(
            suffixArr,
            location.locationId,
            entitiId.entityId,
            year,
          ).join('-');

          const presufdata = await prefixAndSuffix(
            this.prisma.prefixSuffix,
            documentToBeUpdated.locationId,
            documentToBeUpdated?.doctype.id,
            documentToBeUpdated?.doctype.organizationId,
            activeUser.id,
            documentToBeUpdated?.doctype.prefix,
            documentToBeUpdated?.doctype.suffix,
            this.serialNumberService.createPrefixSuffix,
          );

          if (documentToBeUpdated.documentNumbering === null) {
            const documentNumberGenerated =
              await this.serialNumberService.generateSerialNumberClone({
                moduleType: documentToBeUpdated?.doctype.id,
                location: documentToBeUpdated.locationId,
                entity: documentToBeUpdated.entityId,
                year: year,
                createdBy: documentToBeUpdated.createdBy,
                organizationId: documentToBeUpdated.organizationId,
              });

            documentNumbering = suffix
              ? `${prefix}-${documentNumberGenerated}-${suffix}`
              : `${prefix}-${documentNumberGenerated}`;

            documentNumbering = documentNumbering.startsWith('-')
              ? documentNumbering.slice(1)
              : documentNumbering;
          } else {
            documentNumbering = documentToBeUpdated.documentNumbering;
          }

          // //console.log('documentNumbering', documentNumbering);
          // Extract the substring between the two indices

          // const serialnumber =
          //   await this.serialNumberService.generateSerialNumber(query);
          // documentNumbering = serialnumber;
        }
        const revisionfrequencyOfDoctype = await this.prisma.doctype.findUnique(
          {
            where: { id: documentToBeUpdated.doctypeId },
            select: {
              reviewFrequency: true,
              revisionRemind: true,
            },
          },
        );
        nextRevisionDate = await this.calculateNextDate(
          date,
          revisionfrequencyOfDoctype.reviewFrequency,
        );

        // sending mail to users based on distributionList
        //const allUsers = [];
        const documentdetails = await this.prisma.documents.findFirst({
          where: {
            id,
          },
          include: {
            organization: true,
            creatorEntity: true,
            creatorLocation: true,
          },
        });

        // if (documentToBeUpdated.isVersion===false) {
        if (documentToBeUpdated.countNumber === 2) {
          const versionDocs = await this.prisma.documents.findFirst({
            where: {
              countNumber: documentToBeUpdated.countNumber - 1,
              id: documentToBeUpdated.documentId,
            },
          });
          const updateStatus = await this.prisma.documents.update({
            where: {
              id: versionDocs.id,
            },
            data: {
              documentState: 'OBSOLETE',
            },
          });
        } else if (documentToBeUpdated.countNumber > 2) {
          const versionDocs = await this.prisma.documents.findFirst({
            where: {
              countNumber: documentToBeUpdated.countNumber - 1,
              documentId: documentToBeUpdated.documentId,
            },
          });
          const updateStatus = await this.prisma.documents.update({
            where: {
              id: versionDocs.id,
            },
            data: {
              documentState: 'OBSOLETE',
            },
          });
        }

        if (
          documentLink !== null &&
          documentLink !== documentToBeUpdated.documentLink
        ) {
          const attachRec = await this.prisma.documentAttachmentHistory.create({
            data: {
              documentId: id,
              updatedLink: documentLink,
              updatedBy: activeUser.id,
            },
          });
        }
      }

      if (documentState == 'AMMEND') {
        isAmmend = true;
        if (
          documentToBeUpdated?.doctype.currentVersion ===
          documentToBeUpdated.currentVersion
        ) {
          newVersion = 'A';
        } else {
          newVersion = String.fromCharCode(
            documentToBeUpdated.currentVersion.charCodeAt(0) + 1,
          );
        }

        if (
          documentToBeUpdated?.doctype.currentVersion ===
          documentToBeUpdated.currentVersion
        ) {
          const numberValue = parseInt(documentToBeUpdated.issueNumber, 10) + 1;
          resultForIssue = numberValue
            .toString()
            .padStart(documentToBeUpdated?.issueNumber.toString().length, '0');
        }

        documentState = 'PUBLISHED';
        (approvedDate = documentToBeUpdated.approvedDate),
          // issueNumber =
          resultForIssue ? resultForIssue : documentToBeUpdated.issueNumber;
        //create new version with the currently saved version
        if (documentToBeUpdated.countNumber === 1) {
          version = await this.prisma.documents.create({
            data: {
              documentId: id,
              currentVersion: newVersion,
              // documentLink: documentToBeUpdated.documentLink,
              documentLink: documentLink,
              // approvedDate: documentToBeUpdated.approvedDate,
              documentName: documentToBeUpdated.documentName,
              approvers: approvers?.map((value) => value?.id),
              reviewers: reviewers?.map((value) => value?.id),
              creators: [activeUser?.id],
              documentNumbering: documentToBeUpdated.documentNumbering,
              reasonOfCreation: '',
              effectiveDate: documentToBeUpdated.effectiveDate,
              description: payload.reasonOfCreation,
              docType: documentToBeUpdated.docType,
              countNumber: documentToBeUpdated.countNumber + 1,
              issueNumber: resultForIssue
                ? resultForIssue
                : documentToBeUpdated.issueNumber,
              documentState: 'DRAFT',
              revisionReminderFlag: false,
              section: section,
              // user: {
              //   connect: {
              //     id: activeUser.id,
              //   },
              // },
              // description: description,
              system: systems,
              // locationId:documentToBeUpdated.locationId,
              creatorLocation: {
                connect: {
                  id: documentToBeUpdated.locationId,
                },
              },
              // entityId:documentToBeUpdated.entityId,
              creatorEntity: {
                connect: {
                  id: documentToBeUpdated.entityId,
                },
              },
              tags: tags,
              distributionList,
              distributionUsers,
              readAccess,
              readAccessUsers,
              doctype: {
                connect: {
                  id: doctypeId,
                },
              },
              organization: {
                connect: {
                  id: documentToBeUpdated?.organization.id,
                },
              },
              createdBy: activeUser.id,
              isVersion: false,
              // by: activeUser.email,
              versionInfo: [
                {
                  type: 'CREATOR',
                  id: activeUser.id,
                  name: activeUser.firstname + ' ' + activeUser.lastname,
                  documentLink: file
                    ? process.env.IS_OBJECT_STORE === 'true'
                      ? documentLink
                      : `${
                          process.env.SERVER_IP
                        }/${documentToBeUpdated?.organization.realmName.toLowerCase()}/${location.locationName.toLowerCase()}/document/${
                          file.filename
                        }`
                    : '',
                  docCode: hashValue,
                },
              ],
            },
          });
          if (
            documentLink !== null &&
            documentLink !== documentToBeUpdated.documentLink
          ) {
            const attachRec =
              await this.prisma.documentAttachmentHistory.create({
                data: {
                  documentId: version.id,
                  updatedLink: documentLink,
                  updatedBy: activeUser.id,
                },
              });
          }
          if (documentToBeUpdated.createdBy !== activeUser.id) {
            const creator = [
              {
                userId: activeUser.id,
                firstname: activeUser.firstname,
                lastname: activeUser.lastname,
                email: activeUser.email,
              },
            ];
            await this.prisma.additionalDocumentAdmins.create({
              data: {
                type: 'CREATOR',
                firstname: activeUser.firstname,
                lastname: activeUser.lastname,
                email: activeUser.email,
                user: {
                  connect: {
                    id: activeUser.id,
                  },
                },
                document: {
                  connect: {
                    id: id,
                  },
                },
              },
            });
          }
        } else {
          version = await this.prisma.documents.create({
            data: {
              documentId: documentToBeUpdated.documentId,
              currentVersion: newVersion,
              // documentLink: documentToBeUpdated.documentLink,
              documentLink: documentLink,
              approvers: approvers?.map((value) => value?.id),
              reviewers: reviewers?.map((value) => value?.id),
              creators: [activeUser?.id],
              // approvedDate: documentToBeUpdated.approvedDate,
              documentName: documentToBeUpdated.documentName,
              documentNumbering: documentToBeUpdated.documentNumbering,
              reasonOfCreation: '',
              effectiveDate: documentToBeUpdated.effectiveDate,
              description: payload.reasonOfCreation,
              docType: documentToBeUpdated.docType,
              countNumber: documentToBeUpdated.countNumber + 1,
              issueNumber: resultForIssue
                ? resultForIssue
                : documentToBeUpdated.issueNumber,
              documentState: 'DRAFT',
              section: section,
              // user: {
              //   connect: {
              //     id: activeUser.id,
              //   },
              // },
              // description: description,
              system: systems,
              // locationId:documentToBeUpdated.locationId,
              creatorLocation: {
                connect: {
                  id: documentToBeUpdated.locationId,
                },
              },
              // entityId:documentToBeUpdated.entityId,
              creatorEntity: {
                connect: {
                  id: documentToBeUpdated.entityId,
                },
              },
              tags: tags,
              distributionList,
              distributionUsers,
              readAccess,
              readAccessUsers,
              doctype: {
                connect: {
                  id: doctypeId,
                },
              },
              organization: {
                connect: {
                  id: documentToBeUpdated?.organization.id,
                },
              },
              createdBy: activeUser.id,
              isVersion: false,
              // by: activeUser.email,
              versionInfo: [
                {
                  type: 'CREATOR',
                  id: activeUser.id,
                  name: activeUser.firstname + ' ' + activeUser.lastname,
                  documentLink: file
                    ? process.env.IS_OBJECT_STORE === 'true'
                      ? documentLink
                      : `${
                          process.env.SERVER_IP
                        }/${documentToBeUpdated?.organization.realmName.toLowerCase()}/${location.locationName.toLowerCase()}/document/${
                          file.filename
                        }`
                    : '',
                  docCode: hashValue,
                },
              ],
            },
          });
          if (
            documentLink !== null &&
            documentLink !== documentToBeUpdated.documentLink
          ) {
            const attachRec =
              await this.prisma.documentAttachmentHistory.create({
                data: {
                  documentId: version.id,
                  updatedLink: documentLink,
                  updatedBy: activeUser.id,
                },
              });
          }

          if (documentToBeUpdated.createdBy !== activeUser.id) {
            const creator = [
              {
                userId: activeUser.id,
                firstname: activeUser.firstname,
                lastname: activeUser.lastname,
                email: activeUser.email,
              },
            ];
            await this.prisma.additionalDocumentAdmins.create({
              data: {
                type: 'CREATOR',
                firstname: activeUser.firstname,
                lastname: activeUser.lastname,
                email: activeUser.email,
                user: {
                  connect: {
                    id: activeUser.id,
                  },
                },
                document: {
                  connect: {
                    id: documentToBeUpdated.documentId,
                  },
                },
              },
            });
          }
        }

        const creatorinfo = await this.prisma.user.findFirst({
          where: {
            id: documentToBeUpdated.createdBy,
          },
        });
        const creator = [
          {
            userId: activeUser.id,
            firstname: activeUser.firstname,
            lastname: activeUser.lastname,
            email: activeUser.email,
          },
        ];

        if (reviewers !== 'undefined') {
          // let reviewUser
          // for (let reviewData of reviewers) {
          const reviwerdata = reviewers?.map((value: any) => value.userId);
          const reviewUser = await this.prisma.user.findMany({
            where: { id: { in: reviwerdata } },
          });
          const linkDocumentWithReviewers = await documentAdminsCreator(
            reviewUser,
            this.prisma.additionalDocumentAdmins,
            version.id,
            'REVIEWER',
          );
        }
        if (approvers !== 'undefined') {
          const appData = approvers?.map((value: any) => value.userId);
          const approverUserData = await this.prisma.user.findMany({
            where: { id: { in: appData } },
          });
          const linkDocumentWithApprovers = await documentAdminsCreator(
            approverUserData,
            this.prisma.additionalDocumentAdmins,
            version.id,
            'APPROVER',
          );
        }

        const linkDocumentWithCreator = await documentAdminsCreator(
          creator,
          this.prisma.additionalDocumentAdmins,
          version.id,
          'CREATOR',
        );

        if (
          documentToBeUpdated?.doctype.currentVersion ===
          documentToBeUpdated.currentVersion
        ) {
          const numberValue = parseInt(documentToBeUpdated.issueNumber, 10) + 1;
          resultForIssue = numberValue
            .toString()
            .padStart(documentToBeUpdated?.issueNumber.toString().length, '0');
        }

        resultForIssue ? resultForIssue : documentToBeUpdated.issueNumber;

        notUpdate = true;

        versionDoc = true;
        await this.prisma.documents.update({
          where: {
            id: id,
          },
          data: {
            isVersion: versionDoc ? versionDoc : documentToBeUpdated.isVersion,
            creators:
              activeUser.id === documentToBeUpdated?.createdBy
                ? documentToBeUpdated?.creators
                : [...documentToBeUpdated?.creators, activeUser?.id],
          },
        });
        const refsDocs = await this.refsService.getAllById(
          documentToBeUpdated.id,
        );
        if (refsDocs.length > 0) {
          const refs = refsData.map((ref: any) => ({
            ...ref,
            refTo: version.id,
          }));

          const createRefs = await this.refsService.create(refs);
        }
      }

      if (documentState === 'Retire') {
        documentState = 'RETIRE_INREVIEW';
      }

      if (documentState === 'Review Complete') {
        documentState = 'RETIRE_INAPPROVE';
      }

      if (documentState === 'discard') {
        documentState = 'PUBLISHED';
      }

      if (documentState === 'Approve Complete') {
        if (documentToBeUpdated.countNumber === 1) {
          documentState = 'RETIRE';
        } else {
          await this.prisma.documents.updateMany({
            where: { documentId: documentToBeUpdated?.documentId },
            data: { documentState: 'RETIRE' },
          });
          await this.prisma.documents.update({
            where: { id: documentToBeUpdated?.documentId },
            data: { documentState: 'RETIRE' },
          });
          documentState = 'RETIRE';
        }
      }

      if (documentState === 'Revert') {
        if (documentToBeUpdated.countNumber !== 1) {
          await this.prisma.documents.updateMany({
            where: { documentId: documentToBeUpdated.documentId },
            data: { documentState: 'OBSOLETE' },
          });
          await this.prisma.documents.update({
            where: { id: documentToBeUpdated.documentId },
            data: { documentState: 'OBSOLETE' },
          });
        }

        documentState = 'PUBLISHED';
      }

      if (!notUpdate) {
        // below variable take separately to update document on the basis of the document state, if save then only content should be updated
        let dataToBeUpdated = {
          doctype: {
            connect: {
              id: doctypeId,
            },
          },
          organization: {
            connect: {
              id: documentToBeUpdated?.organization.id,
            },
          },
          description: description,
          documentName: documentName,
          // documentState,
          issueNumber,
          distributionList,
          distributionUsers,
          readAccess,
          readAccessUsers,
          currentVersion,
          tags: tags,
          reviewers:
            documentState === 'DRAFT' ||
            documentState === 'IN_REVIEW' ||
            documentState === 'SEND_FOR_EDIT' ||
            documentState === 'REVIEW_COMPLETE' ||
            documentState === 'Save' ||
            documentState === 'IN_APPROVAL' ||
            documentState === 'RETIRE_INREVIEW'
              ? reviewers?.map((value) => value?.id)
              : documentToBeUpdated?.reviewers,
          approvers:
            documentState === 'DRAFT' ||
            documentState === 'IN_REVIEW' ||
            documentState === 'SEND_FOR_EDIT' ||
            documentState === 'REVIEW_COMPLETE' ||
            documentState === 'Save' ||
            documentState === 'IN_APPROVAL' ||
            documentState === 'RETIRE_INREVIEW'
              ? approvers?.map((value) => value?.id)
              : documentToBeUpdated?.approvers,
          // documentLink: documentToBeUpdated.documentLink,

          documentLink: documentLink,
          // documentState === 'PUBLISHED'
          //   ? documentToBeUpdated.documentLink
          //   : documentLink,
          nextRevisionDate,
          documentNumbering:
            documentNumbering !== 'null' ? documentNumbering : null,
          reasonOfCreation: reasonOfCreation,
          effectiveDate,
          approvedDate: documentState === 'PUBLISHED' ? effectiveDate : null,
          system: systems,
          isVersion: versionDoc ? versionDoc : documentToBeUpdated.isVersion,
          section: section,
          retireComment,
          versionInfo: versionInfo,
          revertComment: revertComment || '',
        } as any;

        if (documentState === 'Save') {
          dataToBeUpdated = {
            ...dataToBeUpdated,
            documentState: currentDocumentState,
          };
        } else {
          dataToBeUpdated = {
            ...dataToBeUpdated,
            documentState: documentState,
          };
        }
        const updateDocument = await this.prisma.documents.update({
          where: {
            id: id,
          },
          data: {
            ...dataToBeUpdated,
          },
        });
        if (
          documentLink !== null &&
          documentLink !== documentToBeUpdated.documentLink
        ) {
          const attachRec = await this.prisma.documentAttachmentHistory.create({
            data: {
              documentId: updateDocument.id,
              updatedLink: updateDocument.documentLink,
              updatedBy: activeUser.id,
            },
          });
        }
        await this.prisma.referenceDocuments.deleteMany({
          where: {
            documentId: id,
          },
        });

        if (refsData && refsData.length > 0) {
          const refs = refsData.map((ref: any) => ({
            ...ref,
            refTo: id,
          }));

          const updateRefs = await this.refsService.update({
            refs: refs,
            id: id,
          });
          // //////////////console.log('created refs--->', updateRefs);
        }
        const deleteReferenceDocuments =
          await this.prisma.referenceDocuments.deleteMany({
            where: {
              documentId: id,
            },
          });
        if (referenceDocuments) {
          for (let i = 0; i < referenceDocuments.length; i++) {
            const createRefDoc = await this.prisma.referenceDocuments.create({
              data: {
                version: referenceDocuments[i].currentVersion,
                type: referenceDocuments[i].type,
                documentLink: referenceDocuments[i].documentLink,
                documentName: referenceDocuments[i].documentName,
                referenceDocId: referenceDocuments[i].id,
                document: {
                  connect: {
                    id: documentToBeUpdated.id,
                  },
                },
              },
            });
          }
        }

        if (
          documentState === 'DRAFT' ||
          documentState === 'IN_REVIEW' ||
          documentState === 'SEND_FOR_EDIT' ||
          documentState === 'REVIEW_COMPLETE' ||
          documentState === 'Save' ||
          documentState === 'IN_APPROVAL' ||
          documentState === 'RETIRE_INREVIEW'
        ) {
          if (!notUpdate) {
            const deleteAdditionalAdmins =
              await this.prisma.additionalDocumentAdmins.deleteMany({
                where: {
                  document: {
                    id: documentToBeUpdated.id,
                  },
                },
              });
            const creatorinfo = await this.prisma.user.findFirst({
              where: {
                id: documentToBeUpdated.createdBy,
              },
            });
            let creator;
            if (isAmmend) {
              creator = [
                {
                  userId: activeUser.id,
                  firstname: activeUser.firstname,
                  lastname: activeUser.lastname,
                  email: activeUser.email,
                },
              ];
            } else {
              creator = [
                {
                  userId: creatorinfo.id,
                  firstname: creatorinfo.firstname,
                  lastname: creatorinfo.lastname,
                  email: creatorinfo.email,
                },
              ];
            }

            if (reviewers !== undefined) {
              // let reviewUser
              // for (let reviewData of reviewers) {
              const reviwerdata = reviewers?.map((value: any) => value.userId);
              const reviewUser = await this.prisma.user.findMany({
                where: { id: { in: reviwerdata } },
              });
              const linkDocumentWithReviewers = await documentAdminsCreator(
                reviewUser,
                this.prisma.additionalDocumentAdmins,
                documentToBeUpdated.id,
                'REVIEWER',
              );

              //////////console.log('linkDocumentWithReviewers', linkDocumentWithReviewers);
              // }
            }
            ////////////console.log('approvers in edit', approvers);
            if (approvers !== undefined) {
              //////////console.log('approvers inside', approvers);

              // for (let approveData of approvers) {
              const appData = approvers?.map((value: any) => value.userId);
              const approverUserData = await this.prisma.user.findMany({
                where: { id: { in: appData } },
              });
              const linkDocumentWithApprovers = await documentAdminsCreator(
                approverUserData,
                this.prisma.additionalDocumentAdmins,
                documentToBeUpdated.id,
                'APPROVER',
              );
              // }
              //////////console.log('linkDocumentWithApprovers', linkDocumentWithApprovers);
            }

            const linkDocumentWithCreator = await documentAdminsCreator(
              creator,
              this.prisma.additionalDocumentAdmins,
              documentToBeUpdated.id,
              'CREATOR',
            );
          }
        }

        const documentCreated = await this.prisma.documents.findFirst({
          where: {
            id: updateDocument.id,
          },
          include: {
            AdditionalDocumentAdmins: { include: { user: true } },
            organization: true,
            creatorEntity: true,
            creatorLocation: true,
          },
        });
        // Creating workflow history for document
        const createWorkFlowHistory =
          await this.prisma.documentWorkFlowHistory.create({
            data: {
              actionName: updateDocument.documentState,
              user: {
                connect: {
                  id: activeUser.id,
                },
              },
              actionBy: activeUser.email,

              document: {
                connect: {
                  id: updateDocument.id,
                },
              },
            },
          });

        const additionalDocumentAdmins =
          documentCreated.AdditionalDocumentAdmins;
        const seperatedAdmins = adminsSeperators(additionalDocumentAdmins);
        if (updateDocument.documentState === 'IN_APPROVAL') {
          //state changed from inreview to in approval by reviewer and mail to approvers and creator

          const reviewedBy =
            await this.prisma.documentWorkFlowHistory.findFirst({
              where: {
                documentId: updateDocument.id,
                actionName: 'IN_APPROVAL',
              },
              select: {
                actionBy: true,
                actionName: true,
                userId: true,
              },
            });
          ////////console.log('inside in approval');
          const user = await this.prisma.user.findUnique({
            where: { id: reviewedBy.userId },
            select: {
              firstname: true,
              lastname: true,
              email: true,
            },
          });
          const mailRecipients =
            await this.prisma.additionalDocumentAdmins.findMany({
              where: {
                AND: [
                  { documentId: updateDocument.id },
                  { OR: [{ type: 'APPROVER' }, { type: 'CREATOR' }] },
                ],
              },
              select: {
                firstname: true,
                lastname: true,
                email: true,
              },
            });
          for (let users of mailRecipients) {
            //////console.log('mail sending in approval');
            await sendMailForApproval(
              user,
              users,
              documentCreated,
              this.emailService.sendEmail,
            );
          }
        }
        if (updateDocument.documentState === 'IN_REVIEW') {
          //documentstate changed from draft to in review on send for review by creator, send mail to all reviewers for this doc
          const createdBy = await this.prisma.documentWorkFlowHistory.findFirst(
            {
              where: {
                documentId: updateDocument.id,
              },
              select: {
                actionBy: true,
                actionName: true,
                userId: true,
              },
            },
          );
          const user = await this.prisma.user.findUnique({
            where: {
              id: createdBy.userId,
            },
          });
          const mailRecipients =
            await this.prisma.additionalDocumentAdmins.findMany({
              where: {
                AND: [
                  { documentId: updateDocument.id },
                  // { NOT: { userId: createdBy.userId } },
                  { type: 'REVIEWER' },
                ],
              },
              select: {
                firstname: true,
                lastname: true,
                email: true,
              },
            });
          for (let users of mailRecipients) {
            await sendMailForReview(
              user,
              users,
              documentCreated,
              this.emailService.sendEmail,
            );
          }
        }
        if (updateDocument.documentState === 'SEND_FOR_EDIT') {
          // //console.log('inside send for edit');
          const reviewedBy =
            await this.prisma.documentWorkFlowHistory.findFirst({
              where: {
                documentId: updateDocument.id,
              },
              select: {
                actionBy: true,
                actionName: true,
                userId: true,
              },
            });
          // //console.log('reviewd by inside send for edit');
          const user = await this.prisma.user.findUnique({
            where: {
              id: reviewedBy.userId,
            },
          });
          const comment = await this.recentCommentForDocument(
            updateDocument.id,
          );
          // if (updateDocument.createdBy !== reviewedBy.userId) {
          const mailRecipients =
            await this.prisma.additionalDocumentAdmins.findMany({
              where: {
                AND: [
                  { documentId: updateDocument.id },
                  { OR: [{ type: 'REVIEWER' }, { type: 'CREATOR' }] },
                ],
              },
              select: {
                firstname: true,
                lastname: true,
                email: true,
              },
            });
          for (let users of mailRecipients) {
            await sendMailForEdit(
              user,
              users,
              documentCreated,
              comment,
              this.emailService.sendEmail,
            );
          }
          //}
        }
        if (updateDocument.documentState === 'PUBLISHED') {
          let allUsers = [];
          if (updateDocument.distributionList === 'All Users') {
            const allUser = await this.prisma.user.findMany({
              where: {
                organizationId: updateDocument.organizationId,
              },
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                username: true,
              },
            });
            allUsers.push(...allUser);
          } else if (distributionList === 'All in Units(S)') {
            const allUnits = distributionUsers.map((value: any) => value.id);
            const allUser = await this.prisma.user.findMany({
              where: {
                organizationId: updateDocument.organizationId,
                locationId: {
                  in: allUnits,
                },
              },
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                username: true,
              },
            });
            allUsers.push(...allUser);
          } else if (distributionList === 'All in Department(S)') {
            const allEntity = distributionUsers?.map((value: any) => value?.id);
            const allUser = await this.prisma.user.findMany({
              where: {
                organizationId: updateDocument.organizationId,
                entityId: {
                  in: allEntity,
                },
              },
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                username: true,
              },
            });
            allUsers.push(...allUser);
          } else if (distributionList === 'Selected Users') {
            const selectedUser = distributionUsers.map(
              (value: any) => value.id,
            );
            const allUser = await this.prisma.user.findMany({
              where: {
                organizationId: updateDocument.organizationId,
                id: {
                  in: selectedUser,
                },
              },
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                username: true,
              },
            });
            allUsers.push(...allUser);
          }
          // allUsers.map(async (value: any) => {
          //   ////console.log('documentdetails', documentdetails);
          //   await sendMailPublished(
          //     value,
          //     documentCreated,
          //     this.emailService.sendEmail,
          //   );
          // });
          const approvedBy =
            await this.prisma.documentWorkFlowHistory.findFirst({
              where: {
                documentId: updateDocument.id,
                actionName: 'PUBLISHED',
              },
              select: {
                actionBy: true,
                actionName: true,
                userId: true,
              },
            });
          const user = await this.prisma.user.findUnique({
            where: {
              id: approvedBy.userId,
            },
          });
          ////////////console.log('reviewed by', reviewedBy);
          // if (updateDocument.createdBy !== approvedBy.userId) {
          const docadmins = await this.prisma.additionalDocumentAdmins.findMany(
            {
              where: {
                AND: [
                  { documentId: updateDocument.id },
                  {
                    OR: [
                      { type: 'REVIEWER' },
                      { type: 'CREATOR' },
                      { type: 'APPROVER' },
                    ],
                  },
                ],
              },
              select: {
                firstname: true,
                lastname: true,
                email: true,
              },
            },
          );

          for (let users of docadmins) {
            await sendMailPublishedForDocumentAdmins(
              user,
              users,
              documentCreated,
              this.emailService.sendEmail,
            );
          }

          const mcoeId: any = await this.prisma.role.findFirst({
            where: {
              organizationId: activeUser.organizationId,
              roleName: 'ORG-ADMIN',
            },
          });
          const mrId: any = await this.prisma.role.findFirst({
            where: {
              organizationId: activeUser.organizationId,
              roleName: 'MR',
            },
          });
          const mailRecipients = await this.prisma.user.findMany({
            where: {
              OR: [
                { roleId: { has: mcoeId.id } },
                {
                  AND: [
                    // {
                    //   assignedRole: { some: { roleId: mrId.id } }
                    // },
                    { roleId: { has: mrId.id } },
                    { locationId: activeUser.locationId },
                  ],
                },
              ],
            },
            select: {
              firstname: true,
              lastname: true,
              email: true,
            },
          });
          //////////console.log('mailrecipients in send for edit', mailRecipients);
          // for (let users of mailRecipients) {
          //   await sendMailPublishedForAdmins(
          //     user,
          //     users,
          //     documentCreated,
          //     this.emailService.sendEmail,
          //   );
          // }
        }
        this.logger.log(
          `trace id=${randomNumber} Patch api/documents/${id} service successful`,
          '',
        );

        return {
          ...documentCreated,
          creators: seperatedAdmins.creators,
          reviewers: seperatedAdmins.reviewers,
          approvers: seperatedAdmins.approvers,
          readers: seperatedAdmins.readers,
        };
      }

      return 'successfully created new ammend doc';
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} Patch api/documents/${id} service failed ${error}`,
        '',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async remove(documentId, user) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });
    // const auditTrail = await auditTrailWatcher(
    //   'Documents',
    //   'Document Control',
    //   'Documents',
    //   user,
    //   activeUser,
    //   '',
    // );
    let document = await this.prisma.documents.findFirst({
      where: {
        id: documentId,
      },
    });

    if (
      document.documentState === 'DRAFT' ||
      activeUser.id === document.createdBy ||
      user.kcRoles.roles.includes('ORG-ADMIN') ||
      (user.kcRoles.roles.includes('MR') &&
        activeUser.locationId === document.locationId)
    ) {
      const deleteAditionadmins =
        await this.prisma.additionalDocumentAdmins.deleteMany({
          where: {
            documentId: documentId,
          },
          // data: {
          //   deleted: true,
          // },
        });

      if (document.countNumber === 2) {
        const updatedocument = await this.prisma.documents.update({
          where: {
            id: document.documentId,
          },
          data: {
            isVersion: false,
            // deleted: false
          },
        });
      } else if (document.countNumber > 2) {
        const documentToBeVersion = await this.prisma.documents.findFirst({
          where: {
            documentId: document.documentId,
            countNumber: document.countNumber - 1,
          },
        });

        await this.prisma.documents.update({
          where: { id: documentToBeVersion.id },
          data: { isVersion: false },
        });
      }
      // const deletedDocument = await this.prisma.documents.delete({
      //   where: {
      //     id: documentId,
      //   },
      // });
      const deletedDocument = await this.prisma.documents.delete({
        where: {
          id: documentId,
        },
        // data: {
        //   deleted: true,
        // },
      });

      return deletedDocument;
    } else if (
      user.kcRoles.roles.includes('ORG-ADMIN') ||
      (user.kcRoles.roles.includes('MR') &&
        activeUser.locationId === document.locationId)
    ) {
      const deleteAditionadmins =
        await this.prisma.additionalDocumentAdmins.deleteMany({
          where: {
            documentId: documentId,
          },
          // data: {
          //   deleted: true,
          // },
        });

      if (document.countNumber === 2) {
        const updatedocument = await this.prisma.documents.update({
          where: {
            id: document.documentId,
          },
          data: {
            isVersion: false,
            //deleted: false
          },
        });
      } else if (document.countNumber > 2) {
        const documentToBeVersion = await this.prisma.documents.findFirst({
          where: {
            documentId: document.documentId,
            countNumber: document.countNumber - 1,
          },
        });

        await this.prisma.documents.update({
          where: { id: documentToBeVersion.id },
          data: { isVersion: false },
        });
      }

      const deletedDocument = await this.prisma.documents.delete({
        where: {
          id: documentId,
        },
        // data: {
        //   deleted: true,
        // },
      });

      return deletedDocument;
    } else {
      throw new InternalServerErrorException({
        error: 'unable to delete the document by this user',
      });
    }
  }

  async saveFile(filename) {
    filename;
  }

  async createCommentOnDocument(user, createCommentDto: CreateCommentDto) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });

    const comment = await this.prisma.documentComments.create({
      data: {
        commentBy: `${activeUser.firstname} ${activeUser.lastname}`,
        user: { connect: { id: activeUser.id } },
        commentText: createCommentDto.commentText,
        document: {
          connect: {
            id: createCommentDto.documentId,
          },
        },
      },
    });
    return comment;
  }
  async getCommentsForDocument(documentId, version) {
    if (version) {
      try {
        const commentsForVersion = await this.prisma.documentComments.findMany({
          where: {
            AND: [
              { documentId: documentId },
              // {
              //   createdAt: {
              //     lte: versionLast.createdAt,
              //   },
              // },
            ],
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        });
        ////////////console.log('commentsForVersion', commentsForVersion);
        return commentsForVersion;
      } catch (err) {
        // ////////////////console.log('err', err);
      }
    }

    const document = await this.prisma.documents.findFirst({
      where: {
        id: documentId,
      },
    });

    const versions = await this.prisma.documentVersions.findMany({
      where: {
        documentId: documentId,
      },
      orderBy: [{ createdAt: 'desc' }],
    });
    let commentsForDoc;
    if (versions.length > 0) {
      commentsForDoc = await this.prisma.documentComments.findMany({
        where: {
          AND: [
            { documentId: documentId.documentId },
            {
              createdAt: {
                gte: versions[0].createdAt,
              },
            },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });
    } else {
      commentsForDoc = await this.prisma.documentComments.findMany({
        where: {
          documentId: documentId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });
    }

    return commentsForDoc;
  }
  async deleteCommentForDocument(commentId) {
    const deletedCommentForDocument = await this.prisma.documentComments.delete(
      {
        where: {
          id: commentId,
        },
      },
    );

    return deletedCommentForDocument;
  }

  async getWorkFlowHistoryforDocument(documentId: string) {
    const workflowHistory = await this.prisma.documentWorkFlowHistory.findMany({
      where: {
        documentId: documentId,
      },
    });

    return workflowHistory;
  }

  async getVersionsforDocument(documentId: string) {
    const getVersionsForDocument = await this.prisma.documentVersions.findMany({
      where: {
        id: documentId,
      },
    });

    return getVersionsForDocument;
  }

  // async getApproverReviewerDocumentDetails(user, documentId) {
  //   const activeUser = await this.prisma.user.findFirst({
  //     where: {
  //       kcId: user.id,
  //     },
  //     include: {
  //       location: true,
  //       entity: true,
  //       documentAdmins: true,
  //     },
  //   });

  //   const currentDocument = await this.prisma.documents.findUnique({
  //     where: {
  //       id: documentId,
  //     },
  //   });

  //   //Check if the active user is reviewr of the document
  //   const isUserApprover = await this.prisma.additionalDocumentAdmins.findFirst(
  //     {
  //       where: {
  //         AND: [
  //           { documentId: documentId },
  //           { type: 'APPROVER' },
  //           { userId: activeUser.id },
  //         ],
  //       },
  //     },
  //   );

  //   //Check if the active user is reviewr of the document
  //   const isUserReviewer = await this.prisma.additionalDocumentAdmins.findFirst(
  //     {
  //       where: {
  //         AND: [
  //           { documentId: documentId },
  //           { type: 'REVIEWER' },
  //           { userId: activeUser.id },
  //         ],
  //       },
  //     },
  //   );

  //   //Check if the active user is reviewr of the document
  //   // const isUserCreator = await this.prisma.documentAdmins.findFirst({
  //   //   where: {
  //   //     AND: [
  //   //       { doctypeId: currentDocument.doctypeId },
  //   //       { type: 'CREATOR' },
  //   //       { userId: activeUser.id },
  //   //     ],
  //   //   },
  //   // });
  //   const isUserCreator = await this.prisma.documents.findFirst({
  //     where: {
  //       id: documentId,
  //       createdBy: activeUser.id,
  //     },
  //   });
  //   const isAdditionalReader =
  //     await this.prisma.additionalDocumentAdmins.findFirst({
  //       where: {
  //         AND: [
  //           { documentId: documentId },
  //           { type: 'READER' },
  //           { userId: activeUser.id },
  //         ],
  //       },
  //     });

  //   //check read acces of doctype
  //   const access = await this.checkPermissionsForPreviewPage(user, documentId);
  //   let optionsArray = [];
  //   if (
  //     isUserApprover ||
  //     isUserCreator ||
  //     isUserReviewer ||
  //     isAdditionalReader ||
  //     access ||
  //     user.kcRoles.roles.includes('ORG-ADMIN')
  //   ) {
  //     const adminsArray = [isUserCreator, isUserReviewer, isUserApprover];
  //     for (let i = 0; i < 3; i++) {
  //       if (i == 0) {
  //         if (
  //           user.kcRoles.roles.includes('ORG-ADMIN') ||
  //           (user.kcRoles.roles.includes('MR') &&
  //             currentDocument.locationId === activeUser.locationId)
  //         ) {
  //           optionsArray.push('Save');
  //         } else if (
  //           adminsArray[i]
  //           //  ||
  //           // (user.kcRoles.roles.includes('ORG-ADMIN') &&
  //           // activeUser.location !== null)
  //         ) {
  //           if (
  //             currentDocument.documentState == 'DRAFT' ||
  //             currentDocument.documentState == 'SEND_FOR_EDIT'
  //           ) {
  //             optionsArray.push('Save as Draft', 'Send for Review');
  //           } else if (currentDocument.documentState == 'IN_REVIEW') {
  //             optionsArray.push('In Review');
  //             optionsArray.push('Save'); //added save option for document in_review to save the content without changing the state
  //           } else if (currentDocument.documentState == 'REVIEW_COMPLETE') {
  //             optionsArray.push('Send for Approval');
  //           } else if (currentDocument.documentState == 'APPROVED') {
  //             optionsArray.push('Publish');
  //           } else if (currentDocument.documentState == 'IN_APPROVAL') {
  //             optionsArray.push('In Approval');
  //             optionsArray.push('Save'); //added save option for document in_approval to save the content without changing the state
  //           } else if (currentDocument.documentState == 'PUBLISHED') {
  //             optionsArray.push('Amend');
  //           } else if (currentDocument.documentState == 'AMMEND') {
  //             optionsArray.push('Save as Draft', 'Send for Review');
  //           }
  //         } else {
  //           if (currentDocument.documentState == 'PUBLISHED') {
  //             optionsArray.push('Amend');
  //           }
  //         }
  //       } else if (i == 1) {
  //         if (adminsArray[i]) {
  //           if (currentDocument.documentState == 'IN_REVIEW') {
  //             optionsArray.push('Send for Edit', 'Review Complete');
  //           }
  //         }
  //       } else {
  //         if (adminsArray[i]) {
  //           if (currentDocument.documentState == 'IN_APPROVAL') {
  //             optionsArray.push('Send for Edit', 'Approve');
  //           }
  //         }
  //       }
  //     }
  //     //filtering duplicate arrays
  //     const finalOptions = [...new Set(optionsArray)];

  //     return finalOptions;
  //   } else {
  //     if (currentDocument.documentState == 'PUBLISHED') {
  //       optionsArray.push('Amend');
  //       return optionsArray;
  //     } else {
  //       throw new ForbiddenException(
  //         'You dont have enough permissions to view this page',
  //       );
  //     }
  //   }
  // }
  async getApproverReviewerDocumentDetails(user, documentId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
      include: {
        location: true,
        entity: true,
        documentAdmins: true,
      },
    });

    const currentDocument = await this.prisma.documents.findUnique({
      where: {
        id: documentId,
      },
    });

    // //console.log('currentDocument', currentDocument);
    //Check if the active user is reviewr of the document
    const isUserApprover = await this.prisma.additionalDocumentAdmins.findFirst(
      {
        where: {
          AND: [
            { documentId: documentId },
            { type: 'APPROVER' },
            { userId: activeUser.id },
          ],
        },
      },
    );

    //Check if the active user is reviewr of the document
    const isUserReviewer = await this.prisma.additionalDocumentAdmins.findFirst(
      {
        where: {
          AND: [
            { documentId: documentId },
            { type: 'REVIEWER' },
            { userId: activeUser.id },
          ],
        },
      },
    );

    //Check if the active user is reviewr of the document
    // const isUserCreator = await this.prisma.documentAdmins.findFirst({
    //   where: {
    //     AND: [
    //       { doctypeId: currentDocument.doctypeId },
    //       { type: 'CREATOR' },
    //       { userId: activeUser.id },
    //     ],
    //   },
    // });
    const isUserCreator = await this.prisma.documents.findFirst({
      where: {
        id: documentId,
        createdBy: activeUser.id,
      },
    });
    const isAdditionalReader =
      await this.prisma.additionalDocumentAdmins.findFirst({
        where: {
          AND: [
            { documentId: documentId },
            { type: 'READER' },
            { userId: activeUser.id },
          ],
        },
      });

    //check read acces of doctype
    const access = await this.checkPermissionsForPreviewPage(user, documentId);
    let optionsArray = [];
    if (
      isUserApprover ||
      isUserCreator ||
      isUserReviewer ||
      isAdditionalReader ||
      access ||
      user.kcRoles.roles.includes('ORG-ADMIN')
    ) {
      const adminsArray = [isUserCreator, isUserReviewer, isUserApprover];

      for (let i = 0; i < 3; i++) {
        if (i == 0) {
          {
            if (
              (currentDocument?.documentState == 'DRAFT' ||
                currentDocument?.documentState == 'SEND_FOR_EDIT') &&
              isUserCreator
            ) {
              optionsArray.push('Save as Draft', 'Send for Review');
              if (
                currentDocument?.documentLink?.endsWith('.docx') ||
                currentDocument?.documentLink?.endsWith('.doc') ||
                currentDocument?.documentLink?.endsWith('.xlsx') ||
                currentDocument?.documentLink?.endsWith('.xls') ||
                currentDocument?.documentLink?.endsWith('.pptx') ||
                currentDocument?.documentLink?.endsWith('.ppt')
              ) {
                optionsArray.push('Inline Edit');
              }
            } else if (currentDocument?.documentState == 'IN_REVIEW') {
              optionsArray.push('In Review');
              optionsArray.push('Save'); //added save option for document in_review to save the content without changing the state
            } else if (currentDocument?.documentState == 'REVIEW_COMPLETE') {
              optionsArray.push('Send for Approval');
            } else if (currentDocument?.documentState == 'APPROVED') {
              optionsArray.push('Publish');
            } else if (currentDocument?.documentState == 'IN_APPROVAL') {
              optionsArray.push('In Approval');
              optionsArray.push('Save'); //added save option for document in_approval to save the content without changing the state
            } else if (
              currentDocument?.documentState == 'PUBLISHED' &&
              currentDocument?.isVersion === false
            ) {
              if (
                currentDocument?.entityId === activeUser.entityId ||
                (user.kcRoles.roles.includes('MR') &&
                  activeUser.additionalUnits.includes(
                    currentDocument?.locationId,
                  ))
              ) {
                optionsArray.push('Amend');
              }
              if (
                user.kcRoles.roles.includes('ORG-ADMIN') ||
                (user.kcRoles.roles.includes('MR') &&
                  currentDocument.entityId === activeUser.entityId)
              ) {
                optionsArray.push('Retire');
              }
            } else if (currentDocument?.documentState == 'AMMEND') {
              optionsArray.push('Save as Draft', 'Send for Review');
            } else if (
              user.kcRoles.roles.includes('ORG-ADMIN') &&
              currentDocument?.documentState == 'PUBLISHED' &&
              currentDocument?.isVersion === false
            ) {
              optionsArray.push('Amend');

              optionsArray.push('Retire');
            } else if (
              // user.kcRoles.roles.includes('ORG-ADMIN') ||
              // user.kcRoles.roles.includes('MR') &&
              currentDocument?.documentState == 'RETIRE'
            ) {
              const index = optionsArray.indexOf('Save');
              if (index !== -1) {
                optionsArray.splice(index, 1);
              }
              if (
                user.kcRoles.roles.includes('ORG-ADMIN') ||
                user.kcRoles.roles.includes('MR')
              ) {
                optionsArray.push('Revert');
              }
            } else if (user.kcRoles.roles.includes('ORG-ADMIN')) {
              optionsArray.push('Save');
            } else if (
              adminsArray[i]
              //  ||
              // (user.kcRoles.roles.includes('ORG-ADMIN') &&
              // activeUser.location !== null)
            )
              if (
                user.kcRoles.roles.includes('MR') &&
                (currentDocument?.locationId === activeUser.locationId ||
                  activeUser?.additionalUnits?.includes(
                    currentDocument?.locationId,
                  )) &&
                currentDocument?.isVersion === false
              ) {
                optionsArray.push('Save');
              }
            if (
              currentDocument?.documentState == 'PUBLISHED' &&
              currentDocument?.isVersion === false
            ) {
              if (currentDocument?.entityId === activeUser.entityId)
                optionsArray.push('Amend');
              if (
                user.kcRoles.roles.includes('ORG-ADMIN') ||
                (user.kcRoles.roles.includes('MR') &&
                  currentDocument.entityId === activeUser.entityId)
              ) {
                optionsArray.push('Retire');
              }
            }
          }
        } else if (i == 1) {
          if (adminsArray[i]) {
            if (currentDocument?.documentState == 'IN_REVIEW') {
              optionsArray.push('Send for Edit', 'Review Complete', 'Save');
              if (
                currentDocument?.documentLink.endsWith('.docx') ||
                currentDocument?.documentLink?.endsWith('.doc') ||
                currentDocument?.documentLink?.endsWith('.xlsx') ||
                currentDocument?.documentLink?.endsWith('.xls') ||
                currentDocument?.documentLink?.endsWith('.pptx') ||
                currentDocument?.documentLink?.endsWith('.ppt')
              ) {
                optionsArray.push('Inline Edit');
              }
            } else if (
              // user.kcRoles.roles.includes('ORG-ADMIN') ||
              // user.kcRoles.roles.includes('MR') &&
              currentDocument?.documentState == 'RETIRE'
            ) {
              const index = optionsArray.indexOf('Save');
              if (index !== -1) {
                optionsArray.splice(index, 1);
              }
              if (
                user.kcRoles.roles.includes('ORG-ADMIN') ||
                user.kcRoles.roles.includes('MR')
              ) {
                optionsArray.push('Revert');
              }
            } else {
              if (currentDocument?.documentState == 'RETIRE_INREVIEW') {
                // optionsArray.filter((value)=>value !=='Save')
                const index = optionsArray.indexOf('Save');
                if (index !== -1) {
                  optionsArray.splice(index, 1);
                }
                optionsArray.push('Review Retire', 'discard');
              }
            }
          }
        } else {
          if (adminsArray[i]) {
            if (currentDocument?.documentState == 'IN_APPROVAL') {
              optionsArray.push('Send for Edit', 'Approve', 'Save');
              if (
                currentDocument?.documentLink.endsWith('.docx') ||
                currentDocument?.documentLink?.endsWith('.doc') ||
                currentDocument?.documentLink?.endsWith('.xlsx') ||
                currentDocument?.documentLink?.endsWith('.xls') ||
                currentDocument?.documentLink?.endsWith('.pptx') ||
                currentDocument?.documentLink?.endsWith('.ppt')
              ) {
                optionsArray.push('Inline Edit');
              }
            } else if (
              // user.kcRoles.roles.includes('ORG-ADMIN') ||
              // user.kcRoles.roles.includes('MR') &&
              currentDocument?.documentState == 'RETIRE'
            ) {
              const index = optionsArray.indexOf('Save');
              if (index !== -1) {
                optionsArray.splice(index, 1);
              }
              if (
                user.kcRoles.roles.includes('ORG-ADMIN') ||
                user.kcRoles.roles.includes('MR')
              ) {
                optionsArray.push('Revert');
              }
            } else if (currentDocument?.documentState == 'RETIRE_INAPPROVE') {
              const index = optionsArray.indexOf('Save');
              if (index !== -1) {
                optionsArray.splice(index, 1);
              }
              optionsArray.push('Approve Retire', 'discard');
            }
          }
        }
      }
      //filtering duplicate arrays
      const finalOptions = [...new Set(optionsArray)];
      return finalOptions;
    } else {
      if (currentDocument?.documentState == 'PUBLISHED') {
        if (currentDocument.entityId === activeUser.entityId) {
          optionsArray.push('Amend');
        }

        // optionsArray.push('Retire');

        return optionsArray;
      } else {
        throw new ForbiddenException(
          'You dont have enough permissions to view this page',
        );
      }
    }
  }

  async setStatusForDocument(status: string, documenId, user) {
    let approvedDate = new Date();
    let effectiveDate;
    let currentDate = new Date();
    let documentNumbering;

    const currentDocumentInDb = await this.prisma.documents.findUnique({
      where: {
        id: documenId,
      },
      include: {
        doctype: true,
        organization: true,
        creatorEntity: true,
        creatorLocation: true,
      },
    });

    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
      include: {
        location: true,
        entity: true,
      },
    });

    //////////////console.log("currentDocumentInDb",currentDocumentInDb)
    //////////////console.log('documentNumbering 1 st', documentNumbering);
    if (
      status === 'SAVE' ||
      status === 'undefined' ||
      status === undefined ||
      status === 'Save'
    ) {
      return;
    }

    if (status === 'PUBLISHED') {
      if (currentDocumentInDb.countNumber > 1) {
        let data;
        if (currentDocumentInDb.countNumber === 2) {
          data = await this.prisma.documents.findFirst({
            where: {
              id: currentDocumentInDb.documentId,
              countNumber: currentDocumentInDb.countNumber - 1,
            },
          });
        } else {
          data = await this.prisma.documents.findFirst({
            where: {
              documentId: currentDocumentInDb.documentId,
              countNumber: currentDocumentInDb.countNumber - 1,
            },
          });
        }

        await this.prisma.documents.update({
          where: { id: data?.id },
          data: {
            nextRevisionDate: null,
          },
        });
      }
      if (!currentDocumentInDb.effectiveDate) {
        ////////////////console.log('inside published setstatus');
        effectiveDate = new Date();
      }

      if (
        currentDocumentInDb.doctype.documentNumbering === 'Serial' &&
        status === 'PUBLISHED'
      ) {
        const prefixArr = currentDocumentInDb.doctype.prefix.split('-');
        const suffixArr = currentDocumentInDb.doctype.suffix.split('-');
        const noOfDocumentsOfOrg = await this.prisma.documents.count({
          where: {
            organization: {
              realmName: currentDocumentInDb.organization.realmName,
            },
          },
        });
        const location = await this.prisma.location.findFirst({
          where: { id: currentDocumentInDb.locationId },
        });

        const entitiId = await this.prisma.entity.findFirst({
          where: { id: currentDocumentInDb.entityId },
        });
        const currentyear = new Date().getFullYear();
        let year;
        if (currentDocumentInDb.organization?.fiscalYearFormat === 'YY-YY+1') {
          year = await this.organizationService.getFiscalYear(
            currentDocumentInDb.organization?.id,
            currentyear,
          );
        } else {
          const cyear = await this.organizationService.getFiscalYear(
            currentDocumentInDb?.organization.id,
            currentyear,
          );
          year = cyear.toString().slice(-2);
        }
        const prefix = generateNumbering(
          prefixArr,
          location.locationId,
          entitiId.entityId,
          year,
        ).join('-');
        const suffix = generateNumbering(
          suffixArr,
          location.locationId,
          entitiId.entityId,
          year,
        ).join('-');

        // const findPrefixAndSuffix = await this.prisma.prefixSuffix.findFirst({})
        if (currentDocumentInDb.documentNumbering === null) {
          const documentNumberGenerated =
            await this.serialNumberService.generateSerialNumberClone({
              moduleType: currentDocumentInDb.doctype.id,
              location: currentDocumentInDb.locationId,
              entity: currentDocumentInDb.entityId,
              year: year,
              createdBy: currentDocumentInDb.createdBy,
              organizationId: currentDocumentInDb.organizationId,
            });

          // const prefixText = prefix.startsWith("-")?prefix.slice(1):prefix
          // const suffixText = suffix.startsWith("-")?suffix.slice(1):suffix
          documentNumbering = suffix
            ? `${prefix}-${documentNumberGenerated}-${suffix}`
            : `${prefix}-${documentNumberGenerated}`;

          documentNumbering = documentNumbering.startsWith('-')
            ? documentNumbering.slice(1)
            : documentNumbering;

          //////////////console.log("inside documentNumbering",documentNumbering)
        } else {
          documentNumbering = currentDocumentInDb.documentNumbering;
        }
      }

      // const currentDate=new Date()

      const documentdetails = await this.prisma.documents.findFirst({
        where: {
          id: documenId,
        },
        include: {
          organization: true,
          creatorEntity: true,
          creatorLocation: true,
        },
      });

      if (currentDocumentInDb.countNumber === 2) {
        const versionDocs = await this.prisma.documents.findFirst({
          where: {
            countNumber: currentDocumentInDb.countNumber - 1,
            id: currentDocumentInDb.documentId,
          },
        });
        const updateStatus = await this.prisma.documents.update({
          where: {
            id: versionDocs.id,
          },
          data: {
            documentState: 'OBSOLETE',
          },
        });
      } else if (currentDocumentInDb.countNumber > 2) {
        const versionDocs = await this.prisma.documents.findFirst({
          where: {
            countNumber: currentDocumentInDb.countNumber - 1,
            documentId: currentDocumentInDb.documentId,
          },
        });
        const updateStatus = await this.prisma.documents.update({
          where: {
            id: versionDocs.id,
          },
          data: {
            documentState: 'OBSOLETE',
          },
        });
      }
    }
    // if (status == 'APPROVED') {
    //   if (!currentDocumentInDb.approvedDate) {
    //     approvedDate = new Date();
    //   }
    // }

    // Creating workflow history for document
    const createWorkFlowHistory =
      await this.prisma.documentWorkFlowHistory.create({
        data: {
          actionName: status,
          user: {
            connect: {
              id: activeUser.id,
            },
          },
          actionBy: activeUser.email,

          document: {
            connect: {
              id: documenId,
            },
          },
        },
      });

    const revisionfrequencyOfDoctype = await this.prisma.doctype.findUnique({
      where: { id: currentDocumentInDb.doctypeId },
      select: {
        reviewFrequency: true,
        revisionRemind: true,
      },
    });
    const newdate = new Date();
    const nextDate = await this.calculateNextDate(
      newdate,
      revisionfrequencyOfDoctype.reviewFrequency,
    );
    ////////////console.log('documentNumbering', documentNumbering);
    // ////////////console.log('nextRevisiondate', nextDate);
    const currentDocument = await this.prisma.documents.update({
      where: {
        id: documenId,
      },
      data: {
        documentState: status,
        effectiveDate: effectiveDate
          ? effectiveDate
          : currentDocumentInDb.effectiveDate,
        documentNumbering,
        approvedDate: status === 'PUBLISHED' ? approvedDate : effectiveDate,
        nextRevisionDate: status === 'PUBLISHED' ? nextDate : null,
      },
    });
    const currentdocindb = await this.prisma.documents.findUnique({
      where: { id: documenId },
      include: {
        organization: true,
        creatorEntity: true,
        creatorLocation: true,
      },
    });
    //if published send email alerts to document admins,mcoe,mr and distribution list
    if (currentdocindb.documentState === 'PUBLISHED') {
      const allUsers = [];
      if (currentdocindb.distributionList === 'All Users') {
        const allUser = await this.prisma.user.findMany({
          where: {
            organizationId: currentdocindb.organizationId,
          },
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            username: true,
          },
        });
        allUsers.push(...allUser);
      } else if (currentdocindb.distributionList === 'All in Units(S)') {
        const allUnits = currentdocindb.distributionUsers.map(
          (value: any) => value.id,
        );
        const allUser = await this.prisma.user.findMany({
          where: {
            organizationId: currentdocindb.organizationId,
            locationId: {
              in: allUnits,
            },
          },
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            username: true,
          },
        });
        allUsers.push(...allUser);
      } else if (currentdocindb.distributionList === 'All in Department(S)') {
        const allEntity = currentdocindb.distributionUsers.map(
          (value: any) => value.id,
        );
        const allUser = await this.prisma.user.findMany({
          where: {
            organizationId: currentdocindb.organizationId,
            entityId: {
              in: allEntity,
            },
          },
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            username: true,
          },
        });
        allUsers.push(...allUser);
      } else if (currentdocindb.distributionList === 'Selected Users') {
        const selectedUser = currentdocindb.distributionUsers.map(
          (value: any) => value.id,
        );
        const allUser = await this.prisma.user.findMany({
          where: {
            organizationId: currentdocindb.organizationId,
            id: {
              in: selectedUser,
            },
          },
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            username: true,
          },
        });
        allUsers.push(...allUser);
      }
      // allUsers.map(async (value: any) => {
      //   try {
      //     await sendMailPublished(
      //       value,
      //       currentdocindb,
      //       this.emailService.sendEmail,
      //     );
      //   } catch (error) {
      //     return 'mail not sent';
      //   }
      // });
      const approvedBy = await this.prisma.documentWorkFlowHistory.findFirst({
        where: {
          documentId: currentdocindb.id,
          actionName: 'PUBLISHED',
        },
        select: {
          actionBy: true,
          actionName: true,
          userId: true,
        },
      });
      // console.log('approved By', approvedBy);
      const user = await this.prisma.user.findUnique({
        where: {
          id: approvedBy.userId,
        },
      });
      const docadmins = await this.prisma.additionalDocumentAdmins.findMany({
        where: {
          AND: [
            { documentId: currentDocumentInDb.id },
            {
              OR: [
                { type: 'REVIEWER' },
                { type: 'CREATOR' },
                { type: 'APPROVER' },
              ],
            },
          ],
        },
        select: {
          firstname: true,
          lastname: true,
          email: true,
        },
      });

      for (let users of docadmins) {
        await sendMailPublishedForDocumentAdmins(
          user,
          users,
          currentdocindb,
          this.emailService.sendEmail,
        );
      }

      //////////console.log('reviewed by', reviewedBy);
      // if (updateDocument.createdBy !== approvedBy.userId) {
      const mcoeId: any = await this.prisma.role.findFirst({
        where: {
          organizationId: activeUser.organizationId,
          roleName: 'ORG-ADMIN',
        },
      });
      const mrId: any = await this.prisma.role.findFirst({
        where: {
          organizationId: activeUser.organizationId,
          roleName: 'MR',
        },
      });
      const mailRecipients = await this.prisma.user.findMany({
        where: {
          OR: [
            { roleId: { has: mcoeId.id } },
            {
              AND: [
                { roleId: { has: mrId.id } },
                { locationId: activeUser.locationId },
              ],
            },
          ],
        },
        select: {
          firstname: true,
          lastname: true,
          email: true,
        },
      });
      ////////console.log('mailrecipients in send for edit', mailRecipients);
      // for (let users of mailRecipients) {
      //   await sendMailPublishedForAdmins(
      //     user,
      //     users,
      //     currentdocindb,
      //     this.emailService.sendEmail,
      //   );
      // }
    }
    //if in approval state send mail to approvers
    if (currentdocindb.documentState === 'IN_APPROVAL') {
      //state changed from inreview to in approval by reviewer and mail to approvers and creator
      const reviewedBy = await this.prisma.documentWorkFlowHistory.findFirst({
        where: {
          documentId: currentdocindb.id,
          actionName: 'IN_APPROVAL',
        },
        select: {
          actionBy: true,
          actionName: true,
          userId: true,
        },
      });
      //////////console.log('reviewed by', reviewedBy);
      const user = await this.prisma.user.findUnique({
        where: { id: reviewedBy.userId },
        select: {
          firstname: true,
          lastname: true,
          email: true,
        },
      });
      ////////console.log('created by user', user);
      const mailRecipients =
        await this.prisma.additionalDocumentAdmins.findMany({
          where: {
            AND: [
              { documentId: currentdocindb.id },
              { OR: [{ type: 'APPROVER' }, { type: 'CREATOR' }] },
            ],
          },
          select: {
            firstname: true,
            lastname: true,
            email: true,
          },
        });
      //////////console.log('mailrecipeinets', mailRecipients);
      for (let users of mailRecipients) {
        await sendMailForApproval(
          user,
          users,
          currentdocindb,
          this.emailService.sendEmail,
        );
      }
    }
    if (currentdocindb.documentState === 'IN_REVIEW') {
      //documentstate changed from draft to in review on send for review by creator, send mail to all reviewers for this doc
      const createdBy = await this.prisma.documentWorkFlowHistory.findFirst({
        where: {
          AND: [{ documentId: currentdocindb.id }, { actionName: 'IN_REVIEW' }],
        },
        select: {
          actionBy: true,
          actionName: true,
          userId: true,
        },
      });
      //////////console.log('created by', createdBy);
      const user = await this.prisma.user.findUnique({
        where: {
          id: createdBy.userId,
        },
      });
      //////////console.log('user creator', user);
      const mailRecipients =
        await this.prisma.additionalDocumentAdmins.findMany({
          where: {
            AND: [
              { documentId: currentdocindb.id },
              // { NOT: { userId: createdBy.userId } },
              { type: 'REVIEWER' },
            ],
          },
          select: {
            firstname: true,
            lastname: true,
            email: true,
          },
        });
      for (let users of mailRecipients) {
        await sendMailForReview(
          user,
          users,
          currentdocindb,
          this.emailService.sendEmail,
        );
      }
    }
    if (currentdocindb.documentState === 'SEND_FOR_EDIT') {
      const reviewedBy = await this.prisma.documentWorkFlowHistory.findFirst({
        where: {
          documentId: currentdocindb.id,
        },
        select: {
          actionBy: true,
          actionName: true,
          userId: true,
        },
      });
      const user = await this.prisma.user.findUnique({
        where: {
          id: reviewedBy.userId,
        },
      });
      const comment = await this.recentCommentForDocument(currentdocindb.id);
      ////////console.log('reviewed by', reviewedBy);
      // if (currentdocindb.createdBy !== reviewedBy.userId) {
      const mailRecipients =
        await this.prisma.additionalDocumentAdmins.findMany({
          where: {
            AND: [
              { documentId: currentdocindb.id },
              { OR: [{ type: 'REVIEWER' }, { type: 'CREATOR' }] },
            ],
          },
          select: {
            firstname: true,
            lastname: true,
            email: true,
          },
        });
      for (let users of mailRecipients) {
        await sendMailForEdit(
          user,
          users,
          currentdocindb,
          comment,
          this.emailService.sendEmail,
        );
      }
      //}
    }

    return currentDocument;
  }

  async getReferenceDocumentSearch(searchNameString: string, realmName, user) {
    const documents = await this.prisma.documents.findMany({
      where: {
        AND: [
          {
            organization: {
              realmName: realmName,
            },
          },
          {
            documentName: {
              contains: searchNameString,

              mode: 'insensitive',
            },
          },
          {
            OR: [
              {
                documentState: 'PUBLISHED',
              },
              {
                documentState: 'APPROVED',
              },
            ],
          },
        ],
      },
    });

    //FILTER REFDOCS ACCORDINGLY IF THE LOGGED IN USER HAS THE PERMISSIONS FOR THE PREVIEW PAGE

    const documentsWithPermssions = [];

    for (const document of documents) {
      const access = await this.checkPermissionsForPreviewPage(
        user,
        document.id,
      );
      if (access.access) {
        documentsWithPermssions.push({ ...document, access: access });
      }
    }

    return documentsWithPermssions;
  }

  async getReferenceDocumentsForDocument(documentId) {
    const referenceDocuments = await this.prisma.referenceDocuments.findMany({
      where: {
        documentId: documentId,
      },
    });

    return referenceDocuments;
  }

  async createReferenceDocuments(
    createReferenceDocuments: CreateReferenceDocumentsDto,
  ) {
    const refDoc = await this.prisma.documents.findUnique({
      where: {
        id: createReferenceDocuments.documentId,
      },
    });

    const createRefDoc = await this.prisma.referenceDocuments.create({
      data: {
        version: refDoc.currentVersion,
        type: createReferenceDocuments.type,
        documentLink: refDoc.documentLink,
        documentName: refDoc.documentName,
        document: {
          connect: {
            id: createReferenceDocuments.idOfDocToBeConnected,
          },
        },
      },
    });

    return createRefDoc;
  }

  async deleteReferenceDocument(refdocId: string) {
    const deleteRefDoc = await this.prisma.referenceDocuments.delete({
      where: {
        id: refdocId,
      },
    });
  }

  async checkPermissionsForPreviewPage(user, documentId) {
    let access = false;

    const currentDocument = await this.prisma.documents.findUnique({
      where: {
        id: documentId,
      },
      include: {
        doctype: true,
      },
    });
    // if (currentDocument.documentState !== 'PUBLISHED') {
    //   access = false;
    //   return {
    //     access,
    //   };
    // }
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    if (
      user?.kcRoles?.roles?.includes('ORG-ADMIN') // if logged in user is org admin return access true
    ) {
      access = true;
      return { access };
    } else {
      //////////////console.log('inside else of checkpermission');
      //else check if he is a creator/reviewer or approver
      let admin = await this.prisma.additionalDocumentAdmins.findMany({
        where: {
          AND: [
            { userId: activeUser.id },
            { documentId: currentDocument.id },
            {
              OR: [
                { type: 'CREATOR' },
                { type: 'APPROVER' },
                { type: 'REVIEWER' },
              ],
            },
          ],
        },
      });
      //////////////console.log('admin in checkpermission', admin);
      if (admin.length > 0) {
        access = true;
        return { access };
      } else {
        //check for other read access options
        const readAccess: any = currentDocument.readAccess;
        if (readAccess === 'All Users') {
          access = true;
          return {
            access,
          };
        } else if (readAccess === 'All in Unit(S)') {
          const creators = await this.prisma.additionalDocumentAdmins.findMany({
            where: {
              AND: [{ documentId: currentDocument.id }, { type: 'CREATOR' }],
            },
            include: {
              user: {
                include: {
                  location: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          });

          if (creators) {
            creators.forEach((creator) => {
              if (creator.user.locationId == activeUser.locationId) {
                access = true;
              } else {
                access = false;
              }
            });
          }
          return {
            access,
          };
        } else if (readAccess === 'All in Department(S)') {
          const creators = await this.prisma.additionalDocumentAdmins.findMany({
            where: {
              AND: [{ documentId: currentDocument.id }, { type: 'CREATOR' }],
            },
            include: {
              user: {
                include: {
                  entity: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          });

          if (creators) {
            creators.forEach((creator) => {
              if (creator.user.entityId == activeUser.entityId) {
                access = true;
              } else {
                access = false;
              }
            });
          }
          return {
            access,
          };
        } else if (readAccess == 'Selected Users') {
          const creators = await this.prisma.additionalDocumentAdmins.findMany({
            where: {
              AND: [{ documentId: currentDocument.id }, { type: 'READER' }],
            },
            include: {
              user: true,
            },
          });

          if (creators) {
            creators.forEach((creator) => {
              if (creator.user.id == activeUser.id) {
                access = true;
              } else {
                access = false;
              }
            });
          }
          return {
            access,
          };
        }
      }
    }
  }

  async checkIfUserCreatorForDocument(user, documentId) {
    let access = false;
    const currentDocument = await this.prisma.documents.findUnique({
      where: {
        id: documentId,
      },
      include: {
        doctype: true,
      },
    });
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });

    const creators = await this.prisma.additionalDocumentAdmins.findMany({
      where: {
        AND: [
          { documentId: currentDocument.id },
          { type: 'CREATOR' },
          { userId: activeUser.id },
        ],
      },
      include: {
        user: {
          include: {
            location: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    // ////////////////console.log("creators", creators)
    if (creators?.length) {
      return true;
    } else {
      return false;
    }
  }

  async getVersionOfDocument(versionId) {
    const version = await this.prisma.documentVersions.findFirst({
      where: {
        id: versionId,
      },
    });

    const versionLast = await this.prisma.documentVersions.findFirst({
      where: {
        documentId: version.documentId,
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    const referenceDocumentsForVersion =
      await this.prisma.versionReferenceDocuments.findMany({
        where: {
          AND: [{ versionId: version.id }],
        },
      });

    const commentsForVersion = await this.prisma.documentComments.findMany({
      where: {
        AND: [
          { documentId: version.documentId },
          {
            createdAt: {
              lte: versionLast.createdAt,
            },
          },
        ],
      },
    });
    const workflowHistory = await this.prisma.documentWorkFlowHistory.findMany({
      where: {
        AND: [
          { documentId: versionLast.documentId },
          {
            createdAt: {
              lte: version.createdAt,
            },
          },
        ],
      },
    });

    const versionHistory = await this.prisma.documentVersions.findMany({
      where: {
        AND: [
          { documentId: versionLast.documentId },
          {
            createdAt: {
              lt: versionLast.createdAt,
            },
          },
        ],
      },
    });

    return {
      version: version,
      commentsForVersion: commentsForVersion,
      referenceDocumentsForVersion: referenceDocumentsForVersion,
      workflowHistory: workflowHistory,
      versionHistory: versionHistory,
    };
  }

  async findAllDocs(realmName: string, kcId: string) {
    try {
      const user = await this.userService.getUserInfo(kcId);
      const locId = user?.locationId ?? user.entity?.locationId;

      if (locId === undefined) {
        return [];
      }

      const documents = await this.prisma.documents.findMany({
        where: {
          locationId: locId,
          organizationId: user.organizationId,
          documentState: 'PUBLISHED',
          // deleted: false,
        },
      });

      return documents;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async fetchDocumentByEntity(entity: string, kcId: string) {
    try {
      const user = await this.userService.getUserInfo(kcId);
      const locId = user?.locationId ?? user.entity?.locationId;

      if (locId === undefined) {
        return [];
      }

      const documents = await this.prisma.documents.findMany({
        where: {
          entityId: entity,
          organizationId: user.organizationId,
          documentState: 'PUBLISHED',
          // deleted: false,
        },
      });

      return documents;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
  //not used anywhere(services.spec,ts)
  async findAllDocsByUserEntity(kcId: string) {
    try {
      const user = await this.userService.getUserInfo(kcId);
      const locId = user?.locationId ?? user.entity?.locationId;

      const documents = await this.prisma.documents.findMany({
        where: {
          locationId: locId,
          organizationId: user.organizationId,
          entityId: user.entityId,
          //deleted: false,
        },
      });

      return documents;
    } catch (err) {
      // console.error(err);
    }
  }

  async systems(userId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      const systems = await this.System.find({
        organizationId: activeUser.organizationId,
        deleted: false,
      }).select('name');
      return systems;
    } catch (error) {
      throw new ConflictException(error.message);
    }
  }

  async entity(userId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      const entity = await this.prisma.entity.findMany({
        where: {
          organizationId: activeUser.organizationId,
          deleted: false,
        },
        select: {
          id: true,
          entityId: true,
          entityName: true,
          entityTypeId: true,
          entityType: true,
          locationId: true,
        },
      });

      return entity;
    } catch (error) {
      throw new ConflictException(error.message);
    }
  }
  async findAll(filterString, page, limit, realmName, user) {
    const skipValue = (page - 1) * Number(limit);

    // ?filter=locationAdmin|value,locationType|something
    let myFilter;

    if (filterString) {
      myFilter = filterString.split(',').map((item) => {
        //locationAdmin|value
        let [fieldName, fieldValue] = item.split('|'); //[locationAdmin,value]
        return { filterField: fieldName, filterString: fieldValue };
      });
    }

    let filterQuery: any;

    if (myFilter) {
      filterQuery = queryGeneartorForDocumentsFilter(myFilter);

      const filteredDocuments = await this.prisma.documents.findMany({
        skip: skipValue,
        take: Number(limit),
        where: {
          AND: [
            ...filterQuery,
            {
              organization: {
                realmName: realmName,
              },
              deleted: false,
            },
          ],
        },
        include: {
          doctype: {
            // include: {
            //   location: true,
            // },
          },
        },
        orderBy: {
          documentName: 'asc',
        },
      });
      //check permissionforUser
      const length = await this.prisma.documents.count({
        where: {
          AND: [
            ...filterQuery,
            {
              organization: {
                realmName: realmName,
                deleted: false,
              },
            },
          ],
        },
      });

      const documentsWithPermssions = [];

      for (const document of filteredDocuments) {
        const access = await this.checkPermissionsForPreviewPage(
          user,
          document.id,
        );
        const isUserCreator = await this.checkIfUserCreatorForDocument(
          user,
          document.id,
        );

        documentsWithPermssions.push({
          ...document,
          access: access,
          isCreator: isUserCreator,
        });
      }

      return { data: documentsWithPermssions, length: length };
    } else {
      const filteredDocuments = await this.prisma.documents.findMany({
        skip: skipValue,
        take: Number(limit),
        where: {
          organization: {
            realmName: realmName,
            // deleted: false,
          },
        },
        include: {
          doctype: {
            // include: {
            //   location: true,
            // },
          },
        },
        orderBy: {
          documentName: 'asc',
        },
      });

      //permissions

      const documentsWithPermssions = [];

      for (const document of filteredDocuments) {
        const access = await this.checkPermissionsForPreviewPage(
          user,
          document.id,
        );
        const isUserCreator = await this.checkIfUserCreatorForDocument(
          user,
          document.id,
        );

        documentsWithPermssions.push({
          ...document,
          access: access,
          isCreator: isUserCreator,
        });
      }

      //permission checking

      const length = await this.prisma.documents.count({
        where: {
          organization: {
            realmName: realmName,
          },
          // deleted: false,
        },
      });

      return { data: documentsWithPermssions, length: length };
    }
  }
  //not used anywhere
  async displayAuditDocs(userId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    const allDocuments = await this.prisma.documents.findMany({
      where: {
        organizationId: activeUser.organizationId,
        createdBy: activeUser.id,
        OR: [{ documentState: 'IN_REVIEW' }, { documentState: 'PUBLISHED' }],
      },
    });
    const countAllDocuments = await this.prisma.documents.count({
      where: {
        organizationId: activeUser.organizationId,
        createdBy: `${activeUser.firstname} ${activeUser.lastname}`,
        OR: [{ documentState: 'IN_REVIEW' }, { documentState: 'PUBLISHED' }],
      },
    });

    return { documents: allDocuments, count: countAllDocuments };
  }

  async filterValue(userId, query) {
    const randomNumber = uuid();

    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/documents/filerValue service started`,
        '',
      );

      const {
        searchLocation,
        searchBusinessType,
        searchEntity,
        searchSystems,
        searchDoctype,
        searchUser,
      } = query;
      // ////////////////console.log('query', query);
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId },
      });

      let allLocation = [];
      let businessTypes = [];
      let allSystem = [];
      let allEntity = [];
      let allDoctype = [];
      let allUser = [];
      if (searchDoctype) {
        allDoctype = await this.prisma.doctype.findMany({
          where: {
            AND: {
              organizationId: activeUser.organizationId,
              documentTypeName: {
                contains: searchDoctype,
                mode: 'insensitive',
              },
            },
          },
        });
      }
      if (searchLocation) {
        allLocation = await this.prisma.location.findMany({
          where: {
            AND: {
              organizationId: activeUser.organizationId,
              deleted: false,
              locationName: { contains: searchLocation, mode: 'insensitive' },
            },
          },
        });
      }

      if (searchBusinessType) {
        businessTypes = await this.prisma.businessType.findMany({
          where: {
            AND: {
              organizationId: activeUser.organizationId,
              deleted: false,
              name: { contains: searchBusinessType, mode: 'insensitive' },
            },
          },
        });
      }

      if (searchEntity) {
        allEntity = await this.prisma.entity.findMany({
          where: {
            AND: {
              organizationId: activeUser.organizationId,
              deleted: false,
              entityName: { contains: searchEntity, mode: 'insensitive' },
            },
          },
        });
      }

      if (searchSystems) {
        allSystem = await this.System.find({
          $and: [
            { organizationId: activeUser.organizationId },
            { deleted: false },
            { name: { $regex: searchSystems, $options: 'i' } },
          ],
        });
      }
      if (searchUser) {
        allUser = await this.prisma.user.findMany({
          where: {
            organizationId: activeUser.organizationId,
            username: { contains: searchUser, mode: 'insensitive' },
            deleted: false,
          },
          include: { location: { select: { id: true, locationName: true } } },
        });
      }
      this.logger.log(
        `trace id=${randomNumber} Get api/documents/filerValue service successful`,
        '',
      );
      return {
        locations: allLocation,
        businessTypes: businessTypes,
        entity: allEntity,
        allSystems: allSystem,
        allDoctype: allDoctype,
        allUser,
      };
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/documents/filerValue  service failed ${err}`,
        '',
      );
      throw new NotFoundException(err);
    }
  }

  async filterValueNew(user, query) {
    const randomNumber = uuid();

    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/documents/filerValueNew service started`,
        '',
      );
      const { locationId } = query;

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      let [allLocation, allEntity, allDoctype, allUser, allSystem]: any =
        await Promise.all([
          this.prisma.location.findMany({
            where: { organizationId: activeUser.organizationId },
            select: { locationName: true, id: true },
            orderBy: { locationName: 'asc' },
          }),
          this.prisma.entity.findMany({
            where: {
              organizationId: activeUser.organizationId,
              locationId: locationId ?? activeUser.locationId,
              deleted: false,
            },
            select: { id: true, entityName: true },
            orderBy: { entityName: 'asc' },
          }),
          this.prisma.doctype.findMany({
            where: {
              organizationId: activeUser.organizationId,
              locationId: {
                hasSome: ['All', locationId ?? activeUser.locationId],
              },
            },
            select: { id: true, documentTypeName: true },
            orderBy: { documentTypeName: 'asc' },
          }),
          this.prisma.user.findMany({
            where: {
              organizationId: activeUser.organizationId,
              locationId: locationId ?? activeUser.locationId,
            },
            select: { id: true, username: true },
            orderBy: { username: 'asc' },
          }),
          this.System.find({
            $and: [
              { organizationId: activeUser.organizationId },
              { deleted: false },
            ],
          }),
        ]);
      this.logger.log(
        `trace id=${randomNumber} Get api/documents/filerValueNew service successful`,
        '',
      );

      return {
        locations: allLocation,
        // businessTypes: businessTypes,
        entity: allEntity,
        allSystems: allSystem,
        allDoctype: allDoctype,
        allUser,
      };
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/documents/filerValueNew  service failed ${err}`,
        '',
      );
    }
  }

  async calculateNextDate(startDate, monthsToAdd) {
    const date = new Date(startDate);

    // Add the specified number of months to the date
    if (
      monthsToAdd !== null &&
      monthsToAdd !== 'null' &&
      monthsToAdd !== undefined &&
      monthsToAdd !== 'undefined' &&
      monthsToAdd !== 0
    ) {
      date.setMonth(date.getMonth() + monthsToAdd);
    } else {
      date.setMonth(date.getMonth() + 120);
    }

    // Return the result as a JavaScript Date object
    return date;
  }

  async updateDateForNextRevision(user) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });

    const client = new MongoClient(process.env.MONGO_DB_URI1);
    await client.connect();
    const db = client.db(process.env.MONGO_DB_NAME);
    const documents = await db
      .collection('Documents')
      .find({
        $expr: {
          $and: [
            {
              $eq: [
                {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: { $toDate: '$nextRevisionDate' },
                  },
                },
                {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: { $toDate: '$approvedDate' },
                  },
                },
              ],
            },
            {
              $ne: ['$nextRevisionDate', null], // Check if nextRevisionDate exists
            },
          ],
        },
      })
      .toArray(); // Get documents as an array

    // Step 2: Process each document and prepare update operations
    const updatePromises = documents.map((doc) => {
      const newNextRevisionDate = new Date(
        new Date(doc.approvedDate).setFullYear(
          new Date(doc.approvedDate).getFullYear() + 1,
        ),
      ); // Add 1 year to approvedDate

      return db.collection('Documents').updateOne(
        { _id: doc._id }, // Use the document ID to find the specific document
        {
          $set: {
            nextRevisionDate: newNextRevisionDate,
          },
        },
      );
    });

    // Step 3: Execute all updates
    const results = await Promise.all(updatePromises);
    return results;
  }

  async revisionReminder(orgId) {
    const documentoforg = await this.prisma.documents.findMany({
      where: {
        organizationId: orgId,
        documentState: 'PUBLISHED',
      },
    });

    for (let document of documentoforg) {
      const approvedDate = await this.prisma.documents.findFirst({
        where: { id: document.id },
        include: {
          organization: true,
          creatorLocation: true,
          doctype: true,
          creatorEntity: true,
        },
      });
      // console.log('approveddate', approvedDate);
      const nextdate = new Date(approvedDate.nextRevisionDate);
      const currentDate = new Date();
      const timeDifferenceMs = nextdate.getTime() - currentDate.getTime();
      const revisionreminderdays = approvedDate.doctype.revisionRemind;
      //////////////console.log('revisionreminder days', revisionreminderdays);

      // Convert the time difference to days
      const daysDifference = Math.floor(
        timeDifferenceMs / (1000 * 60 * 60 * 24),
      );
      const depthead = await this.entityService.getEntityHead(
        approvedDate.entityId,
      );
      // console.log('departmenthead', depthead);
      const doccreator = await this.prisma.user.findUnique({
        where: {
          id: approvedDate.createdBy,
        },
        // include: {
        //   location: true,
        // },
      });

      const data1: any = {
        revisionReminderFlag: true,
      };
      // ////////////console.log('before if');
      if (daysDifference <= revisionreminderdays) {
        for (let user of depthead) {
          // console.log(
          //   'send mail to dept head and doc creator',
          //   user,
          //   doccreator,
          // );
          await sendRevisionReminderMail(
            user,
            approvedDate,
            this.emailService.sendEmail,
          );
        }
        await sendRevisionReminderMail(
          doccreator,
          approvedDate,
          this.emailService.sendEmail,
        );
        const revisionflag = await this.prisma.documents.update({
          where: {
            id: document.id,
          },
          data: data1,
        });
      }
    }
  }
  async getDocumentAttachmentHistory(documentId) {
    const randomName: string = uuid();
    try {
      this.logger.log(
        `trace id=${randomName}, GET /getDocumentAttachmentHistory/${documentId} `,
        '',
      );
      const result = await this.prisma.documentAttachmentHistory.findMany({
        where: {
          documentId: documentId,
        },
      });
      let details = [];
      for (let doc of result) {
        let user = await this.prisma.user.findFirst({
          where: {
            id: doc.updatedBy,
          },
        });
        let data: any = {
          attachment: doc.updatedLink,
          updatedBy: user.username,
          updatedAt: doc.updatedAt,
        };
        details.push(data);
      }
      details.sort((a, b) => b.updatedAt - a.updatedAt);
      return details;
    } catch (error) {
      this.logger.error(
        `trace id=${randomName}, GET /getDocumentAttachmentHistory/${documentId} failed `,
      );
      return new NotFoundException(error);
    }
  }
  // async restoreDocument(documentId) {
  //   //////console.log('restore doc', documentId);
  //   const randomName: string = uuid();
  //   try {
  //     this.logger.log(
  //       `trace id=${randomName}, Patch /restoredocument/${documentId} `,
  //       '',
  //     );
  //     const docstatus = await this.prisma.documents.update({
  //       where: {
  //         id: documentId,
  //       },
  //       data: {
  //         deleted: false,
  //       },
  //     });
  //     const admins = await this.prisma.additionalDocumentAdmins.updateMany({
  //       where: {
  //         id: documentId,
  //       },
  //       data: {
  //         deleted: false,
  //       },
  //     });
  //   } catch (error) {
  //     this.logger.error(`could not restore doc${documentId}`);
  //     ////console.log('unable to restore doc');
  //     return new NotFoundException();
  //   }
  // }

  async getDocumentOBJ(documentLink, uuid) {
    this.logger.log(
      `trace id = ${uuid} Getting Document for Download from Object Storage`,
      'document.service.ts',
    );
    try {
      const getObjectStoreContents = await this.prisma.connectedApps.findFirst({
        where: {
          sourceName: process.env.CONNECTED_APPS_OB,
        },
      });
      const tenancy = getObjectStoreContents.clientId;
      const userId = Buffer.from(
        getObjectStoreContents.user,
        'base64',
      ).toString('ascii');
      const fingerprint = Buffer.from(
        getObjectStoreContents.password,
        'base64',
      ).toString('ascii');
      let privateKey =
        '-----BEGIN PRIVATE KEY-----\n' +
        Buffer.from(getObjectStoreContents.clientSecret, 'base64')
          .toString('ascii')
          .replace(/ /g, '\n') +
        '\n-----END PRIVATE KEY-----';
      const passphrase = null;
      const region = common.Region.fromRegionId(process.env.REGION);

      const provider = new common.SimpleAuthenticationDetailsProvider(
        tenancy,
        userId,
        fingerprint,
        privateKey,
        passphrase,
        region,
      );
      const client = new objectstorage.ObjectStorageClient({
        authenticationDetailsProvider: provider,
      });

      const bucketName = process.env.BUCKET_NAME;
      const objectName = documentLink;

      const getObjectContent = await client.getObject({
        namespaceName: process.env.NAMESPACE,
        bucketName: bucketName,
        objectName: objectName,
      });

      const buffer = await this.streamToBuffer(
        getObjectContent.value as st.Readable,
      );

      this.logger.log(
        `trace id = ${uuid} Getting Document for Download from Object Storage Sucessful`,
        'document.service.ts',
      );
      return buffer;
    } catch {
      this.logger.log(
        `trace id = ${uuid} Getting Document for Download from Object Storage Failed`,
        'document.service.ts',
      );
    }
  }

  async streamToBuffer(stream: st.Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      stream.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
      });

      stream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  async getViewerOBJ(documentLink, uuid) {
    // //console.log('documentLink in getViewerObj', documentLink);
    this.logger.log(
      `trace id = ${uuid} Getting Document for Viewing from Object Storage`,
      'document.service.ts',
    );
    try {
      const getObjectStoreContents = await this.prisma.connectedApps.findFirst({
        where: {
          sourceName: process.env.CONNECTED_APPS_OB,
        },
      });
      const tenancy = getObjectStoreContents.clientId;
      const userId = Buffer.from(
        getObjectStoreContents.user,
        'base64',
      ).toString('ascii');
      const fingerprint = Buffer.from(
        getObjectStoreContents.password,
        'base64',
      ).toString('ascii');
      let privateKey =
        '-----BEGIN PRIVATE KEY-----\n' +
        Buffer.from(getObjectStoreContents.clientSecret, 'base64')
          .toString('ascii')
          .replace(/ /g, '\n') +
        '\n-----END PRIVATE KEY-----';
      const passphrase = null;
      const region = common.Region.fromRegionId(process.env.REGION);
      const provider = new common.SimpleAuthenticationDetailsProvider(
        tenancy,
        userId,
        fingerprint,
        privateKey,
        passphrase,
        region,
      );
      const client = new objectstorage.ObjectStorageClient({
        authenticationDetailsProvider: provider,
      });

      const bucketName = process.env.BUCKET_NAME;
      const objectName = documentLink;

      const date = new Date();

      const createPreauthenticatedRequestDetails = {
        name: 'par-object-' + date,
        objectName: objectName,
        accessType:
          objectstorage.models.CreatePreauthenticatedRequestDetails.AccessType
            .AnyObjectRead,
        timeExpires: new Date(Date.now() + 30000),
      };

      const createPreauthenticatedRequestRequest: objectstorage.requests.CreatePreauthenticatedRequestRequest =
        {
          namespaceName: process.env.NAMESPACE,
          bucketName: bucketName,
          createPreauthenticatedRequestDetails:
            createPreauthenticatedRequestDetails,
        };

      const createPreauthenticatedRequestResponse =
        await client.createPreauthenticatedRequest(
          createPreauthenticatedRequestRequest,
        );
      this.logger.log(
        `trace id = ${uuid} Getting Document for Viewing from Object Storage Sucessful`,
        'document.service.ts',
      );
      // //console.log(
      //   'return value',
      //   createPreauthenticatedRequestResponse.preauthenticatedRequest.fullPath +
      //     objectName,
      // );
      return (
        createPreauthenticatedRequestResponse.preauthenticatedRequest.fullPath +
        objectName
      );
    } catch {
      this.logger.log(
        `trace id = ${uuid} Getting Document for Viewing from Object Storage Failed`,
        'document.service.ts',
      );
    }
  }

  async recentCommentForDocument(documentId) {
    try {
      this.logger.log(
        `getting recent comment for document Id${documentId}`,
        'document.service.ts',
      );
      const comments = await this.prisma.documentComments.findMany({
        where: {
          documentId: documentId,
        },
        orderBy: {
          updatedAt: 'desc', // Sorting in descending order
        },
        take: 1, // Limiting the result to one comment (the most recent)
      });
      // //console.log('recent comment', comments[0]);
      return comments[0].commentText;
    } catch (error) {
      this.logger.log(
        ` recentCommentForDocument function failed for docid${documentId}`,
        'document.service.ts',
      );
    }
  }

  async addDocumentToOS(file, locationName) {
    const fs = require('fs');
    const getObjectStoreContents = await this.prisma.connectedApps.findFirst({
      where: {
        sourceName: process.env.CONNECTED_APPS_OB,
      },
    });

    //console.log('getObjectStoreContents', getObjectStoreContents);
    const tenancy = getObjectStoreContents.clientId;
    const userId = Buffer.from(getObjectStoreContents.user, 'base64').toString(
      'ascii',
    );
    const fingerprint = Buffer.from(
      getObjectStoreContents.password,
      'base64',
    ).toString('ascii');
    let privateKey =
      '-----BEGIN PRIVATE KEY-----\n' +
      Buffer.from(getObjectStoreContents.clientSecret, 'base64')
        .toString('ascii')
        .replace(/ /g, '\n') +
      '\n-----END PRIVATE KEY-----';
    const passphrase = null;
    const region = common.Region.fromRegionId(process.env.REGION);
    const provider = new common.SimpleAuthenticationDetailsProvider(
      tenancy,
      userId,
      fingerprint,
      privateKey,
      passphrase,
      region,
    );

    const client = new objectstorage.ObjectStorageClient({
      authenticationDetailsProvider: provider,
    });
    const bucketName = process.env.BUCKET_NAME;
    const objectName =
      process.env.OB_ORG_NAME +
      locationName +
      '/' +
      uuid() +
      '-' +
      file?.originalname.split(' ').join('');
    let contentType;
    if (file.originalname.split('.').pop() === 'pdf') {
      contentType = 'application/pdf';
    }
    if (file.originalname.split('.').pop() === 'docx') {
      contentType =
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    const fileContent = fs.readFileSync(file.path);
    client.putObject({
      namespaceName: process.env.NAMESPACE,
      bucketName: bucketName,
      objectName: objectName,
      putObjectBody: fileContent,
      contentType: contentType,
    });

    return objectName;
  }

  async addEditDocumentToOS(file, locationName, sameFile) {
    const fs = require('fs');
    const path = require('path');

    const destDirectory = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'uploads',
      process.env.OB_ORG_NAME.replace('/', '').toLowerCase(),
      locationName.toLowerCase(),
      'document',
    );
    const fileName = file.split('/').pop();

    if (!fs.existsSync(destDirectory)) {
      fs.mkdirSync(destDirectory, { recursive: true });
    }

    const filePath = await this.downloadFile(
      file,
      path.join(destDirectory, fileName),
    );
    const fileContent = fs.readFileSync(filePath);

    const getObjectStoreContents = await this.prisma.connectedApps.findFirst({
      where: {
        sourceName: process.env.CONNECTED_APPS_OB,
      },
    });

    const tenancy = getObjectStoreContents.clientId;
    const userId = Buffer.from(getObjectStoreContents.user, 'base64').toString(
      'ascii',
    );
    const fingerprint = Buffer.from(
      getObjectStoreContents.password,
      'base64',
    ).toString('ascii');
    let privateKey =
      '-----BEGIN PRIVATE KEY-----\n' +
      Buffer.from(getObjectStoreContents.clientSecret, 'base64')
        .toString('ascii')
        .replace(/ /g, '\n') +
      '\n-----END PRIVATE KEY-----';
    const passphrase = null;
    const region = common.Region.fromRegionId(process.env.REGION);
    const provider = new common.SimpleAuthenticationDetailsProvider(
      tenancy,
      userId,
      fingerprint,
      privateKey,
      passphrase,
      region,
    );

    const client = new objectstorage.ObjectStorageClient({
      authenticationDetailsProvider: provider,
    });
    const bucketName = process.env.BUCKET_NAME;
    let objectName = '';
    if (sameFile) {
      objectName = process.env.OB_ORG_NAME + locationName + '/' + fileName;
    } else {
      objectName =
        process.env.OB_ORG_NAME +
        locationName +
        '/' +
        uuid() +
        '-' +
        file.split('/').pop().split('-').pop();
    }
    let contentType;
    if (file.split('/').pop().split('.').pop() === 'pdf') {
      contentType = 'application/pdf';
    }
    if (file.split('/').pop().split('.').pop() === 'docx') {
      contentType =
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    client.putObject({
      namespaceName: process.env.NAMESPACE,
      bucketName: bucketName,
      objectName: objectName,
      putObjectBody: fileContent,
      contentType: contentType,
    });

    return objectName;
  }

  async downloadFile(urlString, destPath) {
    return new Promise((resolve, reject) => {
      const url = require('url');
      const http = require('http');
      const parsedUrl = url.parse(urlString);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;

      const file = fs.createWriteStream(destPath);
      const request = protocol
        .get(urlString, (response) => {
          response.pipe(file);
          file.on('finish', () => {
            file.close(() => {
              resolve(destPath);
            });
          });
        })
        .on('error', (error) => {
          fs.unlink(destPath, () => {
            reject(error);
          });
        });
    });
  }
  async getMyDeptMyLocCount(user, data) {
    try {
      const { location, entity } = data;
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      // documentState: 'PUBLISHED',
      let whereCondition = {};

      if (
        location !== undefined &&
        location !== 'undefined' &&
        location?.length > 0
      ) {
        whereCondition = { ...whereCondition, location: { in: location } };
      }

      if (
        entity !== undefined &&
        entity !== 'undefined' &&
        entity?.length > 0
      ) {
        whereCondition = { ...whereCondition, entityId: { in: entity } };
      }

      const locresult = await this.prisma.documents.findMany(
        {
          where: {
            locationId: activeUser.locationId,
            documentState: 'PUBLISHED',
          },
        },
        // whereCondition,
      );
      const locfilteredDocumentIds = locresult.map((doc) => doc.id);
      const locChartData = await this.getChartData(
        locfilteredDocumentIds,
        activeUser,
      );

      const deptresult = await this.prisma.documents.findMany({
        where: {
          entityId: activeUser.entityId,
          documentState: 'PUBLISHED',
        },
      });
      const deptFilteredDocumentIds = deptresult.map((doc) => doc.id);
      const deptChartData = await this.getChartData(
        deptFilteredDocumentIds,
        activeUser,
      );
      // this.logger.log(``)

      return {
        locresult: locresult.length,
        locChartData: locChartData,
        docData: deptresult,
        deptresult: deptresult.length,
        deptchartData: deptChartData,
      };
    } catch (error) {
      this.logger.error(
        `GET /api/documents/myDeptmyLocForDashboard failed ${error}`,
      );
    }
  }
  async getChartData(ids, activeUser) {
    let whereCondition = {
      organizationId: activeUser.organizationId,

      id: { in: ids },
    };
    //doc type grouping
    const docTypeChartResult = await this.prisma.documents.groupBy({
      by: ['docType'],
      where: {
        ...whereCondition,
        // documentState: 'PUBLISHED',
      },
      _count: {
        _all: true,
      },
    });

    // const docTypedocStatusChartResult = await this.prisma.documents.groupBy({
    //   by: ['docType', 'documentState'],
    //   where: {
    //     ...whereCondition,
    //     // documentState: 'PUBLISHED',
    //   },
    //   _count: {
    //     _all: true,
    //   },
    // });
    // console.log('doctypedocstatusresult', docTypedocStatusChartResult);
    const docStateChartResult = await this.prisma.documents.groupBy({
      by: ['documentState'],
      where: {
        ...whereCondition,
        // documentState: 'PUBLISHED',
      },
      _count: {
        _all: true,
      },
    });

    const docMonthGroupResult = await this.prisma.documents.findMany({
      where: {
        ...whereCondition,
      },
      select: {
        id: true,
        doctypeId: true,
        docType: true,
        locationId: true,
        entityId: true,
        createdAt: true,
        documentState: true,
        system: true,
      },
    });

    // Grouping documents by month
    const groupedByMonth = docMonthGroupResult.reduce((acc, doc) => {
      const createdAt = new Date(doc.createdAt);
      const monthYear = `${createdAt.getFullYear()}-${
        createdAt.getMonth() + 1
      }`;
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }

      acc[monthYear].push(doc);
      return acc;
    }, {});
    // console.log('grouped by month', groupedByMonth);
    const deptChartResult = await this.prisma.documents.groupBy({
      by: ['entityId'],
      where: {
        ...whereCondition,
        // documentState: 'PUBLISHED',
      },
      _count: {
        _all: true,
      },
    });
    // console.log('depat chart result', deptChartResult);

    // Extract counts and entityIds from deptChartResult
    const entityCounts = deptChartResult.map((item) => item._count._all);
    const entityIds = deptChartResult.map((item) => item.entityId);

    // Fetch entity names for the entity IDs in the result
    const entities = await this.prisma.entity.findMany({
      where: {
        id: {
          in: entityIds,
        },
      },
    });

    // Create a map of entityId to entity name
    const entityIdToNameMap = {};
    entities.forEach((entity) => {
      entityIdToNameMap[entity.id] = entity.entityName;
    });

    // Map entity names to deptChartResult
    const entityLabels = entityIds.map(
      (id) => entityIdToNameMap[id] || 'Unknown',
    );
    // Map entity names to deptChartResult
    const deptChartDataWithNames = {
      lables: entityLabels,
      count: entityCounts,
    };
    // console.log('deptchartwithnames', deptChartDataWithNames);

    const systemWiseChartResult = await this.prisma.documents.groupBy({
      by: ['system', 'documentState'],
      _count: true,
      where: {
        ...whereCondition,
        // documentState: 'PUBLISHED',
      },
    });
    const systemLabels = [];
    const systemCountData = [];
    const docstates = [];

    // Extract unique system IDs
    const uniqueSystemIds = Array.from(
      new Set(systemWiseChartResult.flatMap((data) => data.system)),
    );

    // Fetch system names for all unique system IDs
    const systems = await this.System.find({
      _id: { $in: uniqueSystemIds },
    }).exec();

    // Create a map to convert system IDs to system names
    const idToNameMap = new Map(
      systems.map((system) => [system.id, system.name]),
    );

    // Replace system IDs with system names in the systemWiseChartData
    const systemWiseChartDataWithNames = systemWiseChartResult.map((data) => ({
      ...data,
      system: data.system.map((id) => idToNameMap.get(id) || id), // Replace IDs with names
    }));

    systemWiseChartDataWithNames.forEach((result) => {
      const systemNames = result.system.join(', ');
      const count = result._count;
      const documentState = result.documentState;

      // Push system names, count, and document state into respective arrays
      systemLabels.push(systemNames);
      systemCountData.push(count);
      docstates.push(documentState);
    });
    const systemwiseChartData = {
      labels: systemLabels,
      counts: systemCountData,
      documentStates: docstates,
    };
    const docTypeChartData = {
      labels: docTypeChartResult.map((result) => result.docType),
      count: docTypeChartResult.map((result) => result._count._all),
    };

    const docStateChartData = {
      labels: docStateChartResult.map((result) => result.documentState),
      count: docStateChartResult.map((result) => result._count._all),
    };
    return {
      docTypeChartData: docTypeChartData,
      docStateChartData: docStateChartData,
      systemwiseChartData: systemwiseChartData,
      deptChartData: deptChartDataWithNames,
      monthwiseChartData: groupedByMonth,
      // statuswiseChartData: doctypedocstatusChartData,
    };
  }
  async getChartDataForStatuswise(ids, activeUser) {
    let whereCondition = {
      organizationId: activeUser.organizationId,

      id: { in: ids },
    };
    //doc type grouping
    const docTypeChartResult = await this.prisma.documents.groupBy({
      by: ['docType'],
      where: {
        ...whereCondition,
        // documentState: 'PUBLISHED',
      },
      _count: {
        _all: true,
      },
    });

    const docTypedocStatusChartResult = await this.prisma.documents.groupBy({
      by: ['docType', 'documentState'],
      where: {
        ...whereCondition,
        // documentState: 'PUBLISHED',
      },
      _count: {
        _all: true,
      },
    });
    const docStateChartResult = await this.prisma.documents.groupBy({
      by: ['documentState'],
      where: {
        ...whereCondition,
        // documentState: 'PUBLISHED',
      },
      _count: {
        _all: true,
      },
    });

    const docMonthGroupResult = await this.prisma.documents.findMany({
      where: {
        ...whereCondition,
      },
      select: {
        id: true,
        doctypeId: true,
        docType: true,
        locationId: true,
        entityId: true,
        createdAt: true,
        documentState: true,
        system: true,
      },
    });

    // Grouping documents by month
    const groupedByMonth = docMonthGroupResult.reduce((acc, doc) => {
      const createdAt = new Date(doc.createdAt);
      const monthYear = `${createdAt.getFullYear()}-${
        createdAt.getMonth() + 1
      }`;
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }

      acc[monthYear].push(doc);
      return acc;
    }, {});
    const deptChartResult = await this.prisma.documents.groupBy({
      by: ['entityId', 'documentState'],
      where: {
        ...whereCondition,
        // documentState: 'PUBLISHED',
      },
      _count: {
        _all: true,
      },
    });

    const entityCounts = deptChartResult.map((item) => item._count._all);
    const entityIds = deptChartResult.map((item) => item.entityId);
    const documentStates = deptChartResult.map((item) => item.documentState);

    // Fetch entity names for the entity IDs in the result
    const entities = await this.prisma.entity.findMany({
      where: {
        id: {
          in: entityIds,
        },
      },
    });

    // Create a map of entityId to entity name
    const entityIdToNameMap = {};
    entities.forEach((entity) => {
      entityIdToNameMap[entity.id] = entity.entityName;
    });

    // Map entity names to deptChartResult
    const entityLabels = entityIds.map(
      (id) => entityIdToNameMap[id] || 'Unknown',
    );

    // Map entity names to deptChartResult
    const deptChartDataWithNames = {
      labels: entityLabels,
      counts: entityCounts,
      documentStates: documentStates,
    };
    // console.log('deptchartwithnames', deptChartDataWithNames);

    const systemWiseChartResult = await this.prisma.documents.groupBy({
      by: ['system', 'documentState'],
      _count: true,
      where: {
        ...whereCondition,
        // documentState: 'PUBLISHED',
      },
    });
    const systemLabels = [];
    const systemCountData = [];
    const docstates = [];

    // Extract unique system IDs
    const uniqueSystemIds = Array.from(
      new Set(systemWiseChartResult.flatMap((data) => data.system)),
    );

    // Fetch system names for all unique system IDs
    const systems = await this.System.find({
      _id: { $in: uniqueSystemIds },
    }).exec();

    // Create a map to convert system IDs to system names
    const idToNameMap = new Map(
      systems.map((system) => [system.id, system.name]),
    );

    // Replace system IDs with system names in the systemWiseChartData
    const systemWiseChartDataWithNames = systemWiseChartResult.map((data) => ({
      ...data,
      system: data.system.map((id) => idToNameMap.get(id) || id), // Replace IDs with names
    }));

    systemWiseChartDataWithNames.forEach((result) => {
      const systemNames = result.system.join(', ');
      const count = result._count;
      const documentState = result.documentState;

      // Push system names, count, and document state into respective arrays
      systemLabels.push(systemNames);
      systemCountData.push(count);
      docstates.push(documentState);
    });
    const systemwiseChartData = {
      labels: systemLabels,
      counts: systemCountData,
      documentStates: docstates,
    };
    const deptChartData = {
      labels: systemLabels,
      counts: systemCountData,
      documentStates: documentStates,
    };

    const docTypeChartData = {
      labels: docTypeChartResult.map((result) => result.docType),
      count: docTypeChartResult.map((result) => result._count._all),
    };
    const doctypedocstatusChartData = {
      data: docTypedocStatusChartResult.map((result) => ({
        docType: result.docType,
        documentState: result.documentState,
        count: result._count._all,
      })),
    };

    const docStateChartData = {
      labels: docStateChartResult.map((result) => result.documentState),
      count: docStateChartResult.map((result) => result._count._all),
    };
    return {
      docTypeChartData: docTypeChartData,
      docStateChartData: docStateChartData,
      systemwiseChartData: systemwiseChartData,
      deptChartData: deptChartDataWithNames,
      monthwiseChartData: groupedByMonth,
      statuswiseChartData: doctypedocstatusChartData,
    };
  }
  async getMyDeptMyLocCountForTheCurrentYear(user) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const currentYear = new Date().getFullYear();
    const locresult = await this.prisma.documents.findMany({
      where: {
        locationId: activeUser.locationId,
        documentState: 'PUBLISHED',
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1),
        },
      },
    });
    const locfilteredDocumentIds = locresult.map((doc) => doc.id);
    const locChartData = await this.getChartData(
      locfilteredDocumentIds,
      activeUser,
    );
    const deptresult = await this.prisma.documents.findMany({
      where: {
        entityId: activeUser.entityId,
        documentState: 'PUBLISHED',
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1),
        },
      },
    });
    const deptfilteredDocumentIds = deptresult.map((doc) => doc.id);
    const deptChartData = await this.getChartData(
      deptfilteredDocumentIds,
      activeUser,
    );

    return {
      locresult: locresult,
      locChartData: locChartData,
      docData: deptresult,
      deptresult: deptresult,
      deptChartData: deptChartData,
    };
  }
  async getMyDeptMyLocRevisedCount(user) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const currentYear = new Date().getFullYear();
    const locresult = await this.prisma.documents.findMany({
      where: {
        locationId: activeUser.locationId,
        documentState: 'PUBLISHED',
        countNumber: {
          gt: 1,
        },
        currentVersion: {
          not: 'A',
        },
        documentId: {
          not: null,
        },
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1),
        },
      },
    });
    const locfilteredDocumentIds = locresult.map((doc) => doc.id);
    const locChartData = await this.getChartData(
      locfilteredDocumentIds,
      activeUser,
    );
    const deptresult = await this.prisma.documents.findMany({
      where: {
        entityId: activeUser.entityId,
        documentState: 'PUBLISHED',
        countNumber: {
          gt: 1,
        },
        currentVersion: {
          not: 'A',
        },
        documentId: {
          not: null,
        },
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1),
        },
      },
    });
    const deptFilteredDocumentIds = deptresult.map((doc) => doc.id);
    const deptChartData = await this.getChartData(
      deptFilteredDocumentIds,
      activeUser,
    );

    return {
      locresult: locresult,
      locChartData: locChartData,
      docData: deptresult,
      deptresult: deptresult,
      deptChartData: deptChartData,
    };
  }

  async getMyDeptMyLocRevisionDueCount(user) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const currentDate = new Date(); //get the current date
    // Calculate the date for two months from now
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

    const locresult = await this.prisma.documents.findMany({
      where: {
        OR: [
          {
            nextRevisionDate: {
              // Documents with nextRevisionDate within next two months
              gte: currentDate,
              lte: twoMonthsFromNow,
            },
          },
          {
            nextRevisionDate: {
              // Documents with nextRevisionDate in the past
              lt: currentDate,
            },
          },
        ],
        locationId: activeUser.locationId,
      },
    });
    const locfilteredDocumentIds = locresult.map((doc) => doc.id);
    const locChartData = await this.getChartData(
      locfilteredDocumentIds,
      activeUser,
    );
    const deptresult = await this.prisma.documents.findMany({
      where: {
        OR: [
          {
            nextRevisionDate: {
              // Documents with nextRevisionDate within next two months
              gte: currentDate,
              lte: twoMonthsFromNow,
            },
          },
          {
            nextRevisionDate: {
              // Documents with nextRevisionDate in the past
              lt: currentDate,
            },
          },
        ],
        entityId: activeUser.entityId,
      },
    });
    const deptFilteredDocumentIds = deptresult.map((doc) => doc.id);
    const deptChartData = await this.getChartData(
      deptFilteredDocumentIds,
      activeUser,
    );
    return {
      locresult: locresult,
      locChartData: locChartData,
      deptresult: deptresult,
      docData: deptresult,
      deptChartData: deptChartData,
    };
  }

  async getMyDeptMyLocStatuswiseCount(user) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const locresult = await this.prisma.documents.findMany({
      where: {
        locationId: activeUser.locationId,
        OR: [
          { documentState: 'IN_REVIEW' },
          { documentState: 'SEND_FOR_EDIT' },
          { documentState: 'IN_APPROVAL' },
          { documentState: 'DRAFT' },
        ],
      },
      select: {
        id: true,
        doctypeId: true,
        docType: true,
        locationId: true,
        entityId: true,
        createdAt: true,
        documentState: true,
        system: true,
      },
    });
    const locfilteredDocumentIds = locresult.map((doc) => doc.id);
    const locChartData = await this.getChartDataForStatuswise(
      locfilteredDocumentIds,
      activeUser,
    );
    const deptresult = await this.prisma.documents.findMany({
      where: {
        entityId: activeUser.entityId,
        OR: [
          { documentState: 'IN_REVIEW' },
          { documentState: 'SEND_FOR_EDIT' },
          { documentState: 'IN_APPROVAL' },
          { documentState: 'DRAFT' },
        ],
      },
      select: {
        id: true,
        doctypeId: true,
        docType: true,
        locationId: true,
        entityId: true,
        createdAt: true,
        documentState: true,
        system: true,
      },
    });
    const deptFilteredDocumentIds = deptresult.map((doc) => doc.id);
    const deptChartData = await this.getChartDataForStatuswise(
      deptFilteredDocumentIds,
      activeUser,
    );
    return {
      locresult: locresult,
      locChartData: locChartData,
      docData: locresult,
      deptresult: deptresult,
      deptChartData: deptChartData,
    };
  }
  async filterChartData(queryParams, user) {
    const filterObj: any = {};

    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });
    // Check if queryParams.filter is truthy
    if (!!queryParams) {
      // Add properties to filterObj if they exist in queryParams

      if (queryParams.entityId) {
        filterObj.entityId = queryParams.entityId;
      }

      if (queryParams.locationId) {
        filterObj.locationId = queryParams.locationId;
      }
      if (queryParams.businessId) {
        filterObj.businessId = queryParams.businessId;
      }
      if (queryParams.functionId) {
        filterObj.functionId = queryParams.functionId;
      }
      if (queryParams.businessTypeId) {
        filterObj.businessTypeId = queryParams.businessTypeId;
      }
    }
    let resultingIds = [];
    let whereCondition: any = {};
    // Use the getTableQuery function to generate the MongoDB aggregation pipeline
    const aggregationPipeline = await this.getChartQuery(
      filterObj,
      activeUser.organizationId,
    );
    const client = new MongoClient(process.env.MONGO_DB_URI1);
    await client.connect();
    const db = client.db(process.env.MONGO_DB_NAME);
    const documents = await db
      .collection('Documents')
      .aggregate(aggregationPipeline)
      .toArray();

    // Adjust the Prisma queries based on the fetched MongoDB documents
    const filteredDocumentIds = documents.map((doc) => doc._id);

    if (!!queryParams.filter) {
      resultingIds = filteredDocumentIds;
    }

    const chartData = await this.getChartData(filteredDocumentIds, activeUser);
    return chartData;
  }
  async getChartQuery(filter: ChartFilter, organizationId: string) {
    const aggregationPipeline = [];
    const matchStage = {
      $match: {
        organizationId: organizationId,
      },
    };
    aggregationPipeline.push(matchStage);
    Object.entries(filter).forEach(([key, value]) => {
      if (typeof value === 'string') value = value.replace("'", "''");
      const lowerVal = typeof value === 'string' ? value.toLowerCase() : value;

      if (key === 'locationId' && value !== 'undefined') {
        aggregationPipeline.push({ $match: { locationId: value } });
      }
      if (key === 'entityId' && value !== 'undefined') {
        aggregationPipeline.push({ $match: { entityId: value } });
      }
      if (key === 'businessId' && value !== undefined) {
        aggregationPipeline.push(
          {
            $lookup: {
              from: 'LocationBusiness',
              let: { locationId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$locationId', '$$locationId'] }, // Match locationId
                        { $in: ['$businessId', value] }, // Match businessId from the provided array
                      ],
                    },
                  },
                },
              ],
              as: 'locationBusiness',
            },
          },
          {
            $unwind: '$locationBusiness',
          },
          {
            $group: {
              _id: '$locationBusiness.locationId', // Group by locationId from LocationBusiness
              documents: { $push: '$$ROOT' },
            },
          },
          {
            $lookup: {
              from: 'Documents',
              localField: '_id', // Using _id from the $group stage, representing locationId from LocationBusiness
              foreignField: 'locationId', // Matching with locationId from the Documents collection
              as: 'locationDocuments',
            },
          },
        );
      }

      if (key === 'businessTypeId' && value !== 'undefined') {
        aggregationPipeline.push({
          $lookup: {
            from: 'Location',
            localField: 'locationId',
            foreignField: '_id',
            as: 'location',
          },
        });
        aggregationPipeline.push({ $unwind: '$location' });
        aggregationPipeline.push({
          $match: {
            'location.businessTypeId': value,
          },
        });
      }
      if (key === 'functionId' && value !== 'undefined') {
        aggregationPipeline.push({
          $lookup: {
            from: 'Location',
            localField: 'locationId',
            foreignField: '_id',
            as: 'location',
          },
        });
        aggregationPipeline.push({ $unwind: '$location' });
        aggregationPipeline.push({
          $match: {
            'location.functionId': { $in: value },
          },
        });
      }
    });

    return aggregationPipeline;
  }

  async UpdateDocumentBasedOnAdditionalDocument() {
    // try {
    const documents = await this.prisma.documents.findMany({
      include: { AdditionalDocumentAdmins: true },
    });

    for (let data of documents) {
      let reviwers = data?.AdditionalDocumentAdmins?.filter(
        (value) => value.type === 'REVIEWER',
      ).map((item) => item?.userId);
      let approvers = data?.AdditionalDocumentAdmins?.filter(
        (value) => value.type === 'APPROVER',
      ).map((item) => item?.userId);

      let creators = data?.AdditionalDocumentAdmins?.filter(
        (value) => value.type === 'CREATOR',
      ).map((item) => item?.userId);
      await this.prisma.documents.update({
        where: { id: data?.id },
        data: {
          reviewers: reviwers,
          approvers: approvers,
          creators: creators,
        },
      });
    }
    // } catch (err) {}
  }
}
