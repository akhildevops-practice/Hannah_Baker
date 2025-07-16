import {
  Injectable,
  ConflictException,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDoctypeDto } from './dto/create-doctype.dto';
import { UpdateDoctypeDto } from './dto/update-doctype.dto';
import {
  adminsSeperators,
  doctypeAdminsCreator,
  formatDoctypes,
  getUserDetails,
} from './utils';

import e from 'express';
import { userInfo } from 'os';
import { NotificationService } from 'src/notification/notification.service';

import {
  notificationEvents,
  notificationTypes,
} from 'src/utils/notificationEvents.global';
import { CreateNotificationDto } from 'src/notification/dto/create-notification.dto';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { create } from 'domain';
import auditTrial from '../watcher/changesStream';

@Injectable()
export class DoctypeService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private serialNumberService: SerialNumberService,
  ) {}
  async createDoctype(createDoctypeDto: CreateDoctypeDto, user: any) {
    //GET THE CURRENT ACTIVE USER
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const auditTrail = await auditTrial(
      'Doctype',
      'Document Control',
      'Document Type',
      user,
      activeUser,
      '',
    );
    //Org id of the doctype

    ////////////////console.log('createDocType', createDoctypeDto);
    let organizationOfDoctype;

    //LocationID of doctype to be linked
    let locationOfDoctype;
    //DepartmentId of doctype to be linked
    let departmentOfDoctype;
    //Creator of the doctype
    let docTypeCreatorId;
    //For loc admin
    if (
      user.kcRoles.roles.includes('LOCATION-ADMIN') &&
      !user.kcRoles.roles.includes('ORG-ADMIN')
    ) {
      //pull the location admin from db
      const locationAdmin = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      //get location admins location Id and department id and his own id
      locationOfDoctype = locationAdmin.locationId;
      departmentOfDoctype = locationAdmin.entityId;
      docTypeCreatorId = locationAdmin.id;
      organizationOfDoctype = locationAdmin.organizationId;
    } else if (user.kcRoles.roles.includes('ORG-ADMIN')) {
      const orgAdmin = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      locationOfDoctype = createDoctypeDto.locationIdOfDoctype;
      docTypeCreatorId = orgAdmin.id;
      organizationOfDoctype = orgAdmin.organizationId;
    } else if (
      user.kcRoles.roles.includes('PLANT-HEAD') ||
      (user.kcRoles.roles.includes('MR') &&
        !user.kcRoles.roles.includes('ORG-ADMIN') &&
        !user.kcRoles.roles.includes('LOCATION-ADMIN'))
    ) {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      locationOfDoctype = [activeUser.locationId];

      docTypeCreatorId = activeUser.id;
      organizationOfDoctype = activeUser.organizationId;
    }
    if (createDoctypeDto.document_classification != null) {
      const isDuplicate = await this.prisma.doctype.findFirst({
        where: {
          organizationId: organizationOfDoctype,
          document_classification: createDoctypeDto.document_classification,
        },
      });

      if (isDuplicate) {
        throw new ConflictException(
          'Please choose a unique name for Document Classification',
        );
      }
    }
    //Prefic and suffix convert to strings
    const prefix = createDoctypeDto.prefix.join('-');
    const suffix = createDoctypeDto.suffix.join('-');

    //Payload for doctype creation
    // const allLocations = createDoctypeDto.locationIdOfDoctype.map((value)=>value.id)
    if (user.kcRoles.roles.includes('ORG-ADMIN')) {
      locationOfDoctype = createDoctypeDto.locationIdOfDoctype.map(
        (value: any) => value.id,
      );
    }

    const createDocTypeData = {
      locationId: locationOfDoctype,
      organization: {
        connect: { id: organizationOfDoctype },
      },
      documentTypeName: createDoctypeDto.documentTypeName,
      documentNumbering: createDoctypeDto.documentNumbering,
      reviewFrequency: createDoctypeDto.reviewFrequency,
      revisionRemind: createDoctypeDto.revisionRemind,
      readAccess: createDoctypeDto.readAccess.type,
      document_classification: createDoctypeDto.document_classification,
      applicable_systems: createDoctypeDto.applicable_systems,
      prefix: prefix,
      suffix: suffix,
      createdBy: user.id,
      distributionUsers: createDoctypeDto.distributionUsers,
      readAccessUsers: createDoctypeDto.readAccessUsers,
      distributionList: createDoctypeDto.distributionList,
      currentVersion: createDoctypeDto.currentVersion,
      users: createDoctypeDto.readAccess.usersWithAccess,
      whoCanDownload: createDoctypeDto.whoCanDownload,
      whoCanDownloadUsers: createDoctypeDto.whoCanDownloadUsers || [],
    };

    const createdDoctype = await this.prisma.doctype.create({
      data: createDocTypeData,
    });
    // moduleType,
    // prefix,
    // suffix,
    // location,
    // createdBy,
    // organizationId,

    //check if approvers reviewrs etc empty then only pass here

    // const linkDoctypeWithApprovers = await doctypeAdminsCreator(
    //   createDoctypeDto.approvers,
    //   this.prisma.documentAdmins,
    //   createdDoctype.id,
    //   'APPROVER',
    // );
    // const linkDoctypeWithReviewers = await doctypeAdminsCreator(
    //   createDoctypeDto.reviewers,
    //   this.prisma.documentAdmins,
    //   createdDoctype.id,
    //   'REVIEWER',
    // );
    // const linkDoctypeWithCreators = await doctypeAdminsCreator(
    //   createDoctypeDto.creators,
    //   this.prisma.documentAdmins,
    //   createdDoctype.id,
    //   'CREATOR',
    // );
    // if (createDoctypeDto.readAccess.type == 'Restricted Access') {
    //   const linkDoctypeWithReaders = await doctypeAdminsCreator(
    //     createDoctypeDto.readAccess.usersWithAccess,
    //     this.prisma.documentAdmins,
    //     createdDoctype.id,
    //     'READER',
    //   );
    // }

    const doctype = await this.prisma.doctype.findUnique({
      where: {
        id: createdDoctype.id,
      },
      // include: {
      //   documentAdmins: true,
      // },
    });

    // const documentAdmins = doctype.documentAdmins;

    // const seperatedAdmins = adminsSeperators(documentAdmins);
    return {
      ...doctype,
      // creators: seperatedAdmins.creators,
      // reviewers: seperatedAdmins.reviewers,
      // approvers: seperatedAdmins.approvers,
      // readAccess: {
      //   type: doctype.readAccess,
      //   usersWithAccess: seperatedAdmins.readers,
      // },
    };
  }


  async getDoctypeId(user: any, id: string) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    // if (locationId?.length > 0) {

    const docType = await this.prisma.doctype.findFirst({
      where: { id },
      include: {
        documentAdmins: true,
      },
      orderBy: [
        {
          documentTypeName: 'asc',
        },
      ],
    });
    let location;
    if (docType.locationId.includes('All')) {
      location = [{ id: 'All', locationName: 'All' }];
    } else {
      location = await this.prisma.location.findMany({
        where: { id: { in: docType.locationId } },
      });
    }

    return { ...docType, locationId: location };

    // return { data: docTypes, length: docTypes.length };
  }
  async getDoctypesForLocation(
    locationId: any[],
    page?: number,
    limit?: number,
    user?,
  ) {
    const skipValue = (page - 1) * Number(limit);
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    if (locationId?.length > 0) {
      let whereCondition: any = {
        organizationId: activeUser.organizationId,
        // deleted: false,
      };

      if (!locationId.includes('All')) {
        whereCondition = {
          ...whereCondition,
          locationId: {
            hasEvery: locationId,
          },
        };
      }
      const docTypes = await this.prisma.doctype.findMany({
        skip: skipValue,
        take: Number(limit),
        where: whereCondition,
        include: {
          documentAdmins: true,
        },
        orderBy: [
          {
            documentTypeName: 'asc',
          },
        ],
      });

      const totalDoctypes = await this.prisma.doctype.count({
        where: whereCondition,
      });

      return { data: docTypes, length: totalDoctypes };
    } else {
      return { data: [], length: 0 };
    }

    // return { data: docTypes, length: docTypes.length };
  }

  async findOne(id: string) {
    const doctype = await this.prisma.doctype.findUnique({
      where: {
        id: id,
      },
      include: {
        documentAdmins: true,
      },
    });
    const documentAdmins = doctype.documentAdmins;

    const allLocations = doctype.locationId.map(async (value) => {
      if (value === 'All') {
        return { id: 'All', locationName: 'All' };
      } else {
        const locs = await this.prisma.location.findFirst({
          where: {
            id: value,
          },
          select: {
            id: true,
            locationName: true,
          },
        });

        return locs;
      }
    });
    const seperatedAdmins = adminsSeperators(documentAdmins);
    return {
      ...doctype,
      creators: seperatedAdmins.creators,
      reviewers: seperatedAdmins.reviewers,
      approvers: seperatedAdmins.approvers,
      readAccess: {
        type: doctype.readAccess,
        usersWithAccess: seperatedAdmins.readers,
      },
    };
  }

  async updateDoctype(
    id: string,
    updateDoctypeDto: UpdateDoctypeDto,
    user: any,
  ) {
    //GET THE CURRENT ACTIVE USER
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const auditTrail = await auditTrial(
      'Doctype',
      'Document Control',
      'Document Type',
      user,
      activeUser,
      '',
    );
    let docTypeCreatorId;
    //For loc admin
    const locations = updateDoctypeDto.locationIdOfDoctype.map(
      (value: any) => value?.id,
    );
    if (
      user.kcRoles.roles.includes('LOCATION-ADMIN') &&
      !user.kcRoles.roles.includes('ORG-ADMIN')
    ) {
      //pull the location admin from db
      const locationAdmin = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      //get location admins location Id and department id and his own id

      docTypeCreatorId = locationAdmin.id;
    } else if (user.kcRoles.roles.includes('ORG-ADMIN')) {
      const orgAdmin = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });

      docTypeCreatorId = orgAdmin.id;
    } else if (
      user.kcRoles.roles.includes('MR') &&
      !user.kcRoles.roles.includes('ORG-ADMIN') &&
      !user.kcRoles.roles.includes('LOCATION-ADMIN')
    ) {
      const mrUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });

      docTypeCreatorId = mrUser.id;
    }

    const prefix = updateDoctypeDto.prefix.join('-');
    const suffix = updateDoctypeDto.suffix.join('-');

    const updateDocTypeData = {
      documentTypeName: updateDoctypeDto.documentTypeName,
      documentNumbering: updateDoctypeDto.documentNumbering,
      reviewFrequency: updateDoctypeDto.reviewFrequency,
      revisionRemind: updateDoctypeDto.revisionRemind,
      applicable_systems: updateDoctypeDto.applicable_systems,
      prefix: prefix,
      suffix: suffix,
      readAccess: updateDoctypeDto.readAccess.type,
      document_classification: updateDoctypeDto.document_classification,
      updatedBy: docTypeCreatorId,
      distributionList: updateDoctypeDto.distributionList,
      distributionUsers: updateDoctypeDto.distributionUsers,
      users: updateDoctypeDto.readAccess.usersWithAccess,
      readAccessUsers: updateDoctypeDto.readAccessUsers,
       whoCanDownload: updateDoctypeDto.whoCanDownload,
      whoCanDownloadUsers: updateDoctypeDto.whoCanDownloadUsers || [],
      locationId: locations,
    };
    const updatedDoctype = await this.prisma.doctype.update({
      where: {
        id: id,
      },
      data: updateDocTypeData,
    });

    const doctype = await this.prisma.doctype.findUnique({
      where: {
        id: updatedDoctype.id,
      },
      include: {
        documentAdmins: true,
      },
    });

    return {
      ...doctype,

      readAccess: {
        type: doctype.readAccess,
        usersWithAccess: doctype.users,
      },
    };
  }

  async deleteDoctype(id: string, user) {
    //GET THE CURRENT ACTIVE USER
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const auditTrail = await auditTrial(
      'Doctype',
      'Document Control',
      'Document Type',
      user,
      activeUser,
      '',
    );
    setTimeout(async () => {
      const deleteDoctype = await this.prisma.doctype.delete({
        where: {
          id: id,
        },
      });

      return deleteDoctype.id;
    }, 1000);
  }
  async restoreDoctype(id: string) {
    const deleteDoctype = await this.prisma.doctype.update({
      where: {
        id: id,
      },
      data: {
        // deleted: false,
      },
    });

    return deleteDoctype.id;
  }
  async permanentDeleteDoctype(id: string) {
    const deleteDoctype = await this.prisma.doctype.delete({
      where: {
        id: id,
      },
    });

    return deleteDoctype.id;
  }

  async getDoctypeCreatorDetails(user) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
      include: {
        location: true,
        entity: true,
      },
    });
    console.log('activeUser', activeUser);
    let doctypes;
    if (activeUser.userType !== 'globalRoles') {
      // console.log('inside if');
      doctypes = await this.prisma.doctype.findMany({
        where: {
          locationId: {
            hasSome: ['All', activeUser.locationId],
          },
          organizationId: activeUser.organizationId,
          // deleted: false,
        },
        // include: {
        //   documentAdmins: true,
        // },
      });
      if (!doctypes) {
        throw new HttpException('The user does not belong to a location', 404);
      }

      // let doctypesWhereActiveUserIsCreator = doctypes.filter((data) =>
      //   data.documentAdmins.some(
      //     (item: any) => item.email == activeUser.email && item.type == 'CREATOR',
      //   ),
      // );

      if (doctypes?.length > 0) {
        return {
          doctypes: doctypes,
          userLocation: activeUser?.location,
          userDepartment: activeUser?.entity,
        };
      } else {
        throw new HttpException(
          'The user doesnt has permission to create Documents',
          404,
        );
      }
    } else {
      if (activeUser?.additionalUnits?.includes('All')) {
        doctypes = await this.prisma.doctype.findMany({
          where: {
            organizationId: activeUser.organizationId,
            // deleted: false,
          },
          // include: {
          //   documentAdmins: true,
          // },
        });
      } else {
        doctypes = await this.prisma.doctype.findMany({
          where: {
            locationId: {
              hasSome: activeUser.additionalUnits,
            },
            organizationId: activeUser.organizationId,
            // deleted: false,
          },
          // include: {
          //   documentAdmins: true,
          // },
        });
      }
      console.log('doctypes', doctypes);
      if (!doctypes) {
        throw new HttpException('The user does not belong to a location', 404);
      }

      // let doctypesWhereActiveUserIsCreator = doctypes.filter((data) =>
      //   data.documentAdmins.some(
      //     (item: any) => item.email == activeUser.email && item.type == 'CREATOR',
      //   ),
      // );

      if (doctypes?.length > 0) {
        return {
          doctypes: doctypes,
          userLocation: activeUser?.location,
          userDepartment: activeUser?.entity,
        };
      } else {
        throw new HttpException(
          'The user doesnt has permission to create Documents',
          404,
        );
      }
    }
  }

  async uniqueCheck(userId, text) {
    const user = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    //////////////console.log('text', text);
    //  try {
    if (text != null) {
      const result = await this.prisma.doctype.findMany({
        where: {
          organizationId: user.organizationId,
          document_classification: {
            contains: text,
            mode: 'insensitive',
          },
          // deleted: false,
        },
      });
      const finalResult = result.length === 0 ? true : false;

      return finalResult;
    } else {
      return true;
    }
    // } catch (error) {
    //   return {
    //     error: error.message,
    //   };
    // }
  }

  async getSystemsForDocuments(userId, docType) {
    const orgId = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    const result = await this.prisma.doctype.findMany({
      where: {
        organizationId: orgId.organizationId,
        documentTypeName: {
          contains: docType,
          mode: 'insensitive',
        },
        // deleted: false,
      },
      select: {
        id: true,
        applicable_systems: true,
      },
    });

    return result;
  }
  async getDocClassfication(system, docType, userId) {
    const orgId = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    try {
      const finalResult = await this.prisma.doctype.findFirst({
        where: {
          organizationId: orgId.organizationId,
          applicable_systems: { has: system },
          documentTypeName: docType,
        },
      });
      return finalResult;
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async getDocTypeByName(docType, location, department, section, userId) {
    const orgId = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    let docTypeDetails;
    let locDetails;
    let deptDetails;
    let sectionDetails;
    let finalResult;

    docTypeDetails = await this.prisma.doctype.findFirst({
      where: {
        organizationId: orgId.organizationId,
        documentTypeName: {
          equals: docType,
          mode: 'insensitive',
        },
      },
    });
    if (!docTypeDetails) {
      return { message: `"${docType}" Document Type does not exist` };
    }

    const systems = docTypeDetails.applicable_systems.map(
      (item: any) => item.id,
    );

    locDetails = await this.prisma.location.findFirst({
      where: {
        organizationId: orgId.organizationId,
        locationName: {
          equals: location,
          mode: 'insensitive',
        },
      },
    });
    if (!locDetails) {
      return { message: `"${location}" location does not exist` };
    }

    deptDetails = await this.prisma.entity.findFirst({
      where: {
        organizationId: orgId.organizationId,
        locationId: locDetails.id,
        entityName: {
          equals: department,
          mode: 'insensitive',
        },
      },
    });
    if (!deptDetails) {
      return {
        message: `"${department}" department not found for "${location}" location`,
      };
    }

    const applicableSystems = deptDetails.sections;
    sectionDetails = await this.prisma.section.findFirst({
      where: {
        organizationId: orgId.organizationId,
        name: {
          equals: section,
          mode: 'insensitive',
        },
        id: {
          in: applicableSystems,
        },
      },
    });
    if (!sectionDetails) {
      finalResult = {
        docTypeId: docTypeDetails.id,
        systems,
        locationId: locDetails.id,
        entityId: deptDetails.id,
        docTypeDetails,
      };
      return {
        message: `Document Created but "${section}" section not found for department "${department}"`,
        finalResult,
      };
    }
    finalResult = {
      docTypeId: docTypeDetails.id,
      systems,
      locationId: locDetails.id,
      entityId: deptDetails.id,
      docTypeDetails,
      sectionName: sectionDetails.name,
      section: sectionDetails.id,
    };
    return { message: `Document Created Successfully`, finalResult };
  }
}
