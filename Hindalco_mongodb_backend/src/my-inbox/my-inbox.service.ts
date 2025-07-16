import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, now } from 'mongoose';
import { useContainer } from 'class-validator';
import { PrismaService } from '../prisma.service';
//import { Audit, AuditDocument } from '../schema/audit.schema';
//import { Nonconformance, NonconformanceDocument } from './schema/nonconformance.schema';
import { Audit, AuditDocument } from 'src/audit/schema/audit.schema';
import {
  Nonconformance,
  NonconformanceDocument,
} from 'src/audit/schema/nonconformance.schema';
import { ObjectUnsubscribedError } from 'rxjs';
import { ObjectId } from 'bson';
import { AuditService } from 'src/audit/audit.service';

@Injectable()
export class MyInboxService {
  constructor(
    @InjectModel(Audit.name) private readonly auditModel: Model<AuditDocument>,
    @InjectModel(Nonconformance.name)
    private readonly NcModel: Model<NonconformanceDocument>,
    private prisma: PrismaService,
    private auditservice: AuditService,
  ) {}
  //this api will fetch all the documents for the logged-in user where he is the creator for those documents and the req states
  async getDocumentByUser(userid) {
    // console.log('userid', userid);
    const userInfo = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });
    // console.log('userInfo', userInfo);
    try {
      const document = await this.prisma.documents.findMany({
        where: {
          organizationId: userInfo.organizationId,
          createdBy: userInfo.id,
          //deleted: false,

          OR: [{ documentState: 'DRAFT' }, { documentState: 'SEND_FOR_EDIT' }],
        },
        orderBy: {
          createdAt: 'desc', // Sort by createdAt in descending order
        },
        take: 200, // Limit the result to the first 200 documents
      });
      // console.log('document of the user', document);
      const docsInReview = await this.getAllDocInReview(userInfo.id);
      const docsInApproval = await this.getAllDocInApproval(userInfo.id);

      return {
        mydocuments: document,
        documentsinreviewstate: docsInReview,
        documentsinapprovalstate: docsInApproval,
      }; //combining the result to display all documents for this user
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  //this api will return all the docs in review state for the logged-in user where he is the reviewer

  async getAllDocInReview(userid) {
    try {
      const docInfo = await this.prisma.additionalDocumentAdmins.findMany({
        where: { userId: userid, type: 'REVIEWER' },
      });
      ////////////////console.log('Doc review info', docInfo);
      const docids = [];
      const result = await docInfo.map(async (value) => {
        docids.push(value.documentId);
      });
      const docIdResult = await this.prisma.documents.findMany({
        where: {
          id: {
            in: docids.filter((value) => value !== null),
          },
          documentState: 'IN_REVIEW',
          // deleted: false,
        },
        select: {
          id: true,
          documentName: true,
          createdBy: true,
          documentState: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc', // Sort by createdAt in descending order
        },
        take: 200, // Limit the result to the first 200 documents
      });
      // console.log('doc of review', docIdResult);
      return docIdResult;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  //this api will return all the doc in approval state for the loggedin user where he is the approver

  async getAllDocInApproval(userid) {
    try {
      const docInfo = await this.prisma.additionalDocumentAdmins.findMany({
        where: { userId: userid, type: 'APPROVER' },
      });
      const docids = [];
      const result = await docInfo.map(async (value) => {
        docids.push(value.documentId);
      });
      const docIdResult = await this.prisma.documents.findMany({
        where: {
          id: {
            in: docids.filter((value) => value !== null),
          },
          documentState: 'IN_APPROVAL',
          //deleted: false,
        },
        select: {
          id: true,
          documentName: true,
          createdBy: true,
          createdAt: true,
          documentState: true,
        },
        orderBy: {
          createdAt: 'desc', // Sort by createdAt in descending order
        },
        take: 200, // Limit the result to the first 200 documents
      });
      ////console.log('doc of approver', docIdResult);
      return docIdResult;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  //this api returns all the audits of the loggedin user who is an auditee and currently open under him
  async getAllAudits(userid) {
    const userInfo = await this.prisma.user.findFirst({
      where: { kcId: userid.id },
    });

    const audits = await this.auditModel.find({
      where: { organization: userInfo.organizationId },
    });

    let auditeeAudits = [];
    let auditoraudits = [];
    let verfied = [];
    let mrAudits = [];
    let isAuditor;
    let isAuditee;
    for (let audit of audits) {
      if (audit.auditors.includes(userInfo.id)) {
        isAuditor = true;
      }
      if (audit.auditees.includes(userInfo.id)) {
        isAuditee = true;
      }

      if (!!isAuditor) {
        auditoraudits.push(audit._id);
      }
      if (!!isAuditee) {
        auditeeAudits.push(audit._id);
      }
    }

    const auditeedata = await this.getAuditByAuditee(auditeeAudits);
    const auditordata = await this.getAuditByAuditor(auditoraudits);
    const verifiedData = await this.getAuditByMR(userid);
    // const funcSpocDh = await this.getAuditsforFunSpocDH(audits, userInfo);

    return { auditee: auditeedata, auditor: auditordata, verifiedData };
  }
  async getAuditByAuditee(auditeeAudits) {
    try {
      let finalresult = [];
      //filter these audits based on the condition OPEN/in_PROGRESS and under auditee
      const result = await auditeeAudits.map(async (value) => {
        const auditInfo = await this.NcModel.find({
          $and: [
            {
              status: { $ne: 'CLOSED' },
              // status: "OPEN",
              currentlyUnder: 'AUDITEE',
              audit: new ObjectId(value._id),
            },
          ],
        });
        return auditInfo;
      });
      const res = Promise.all(result);
      for (let n of await res) {
        if (n.length !== 0) {
          finalresult.push(...n);
        }
      }

      return finalresult;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }
  //this api returns all the audits if the loggedin user is an auditor and cuurently inprogress state under him

  async getAuditByAuditor(auditoraudits) {
    try {
      let finalresult = [];
      //status add rejected,verified
      // console.log('auditoraudite', auditoraudits);
      const result = await auditoraudits.map(async (value) => {
        const query = {
          status: 'AUDITORREVIEW',
          audit: new ObjectId(value._id),
          currentlyUnder: 'AUDITOR',
        };

        const auditInfo = await this.NcModel.find({
          // $or:[{status: 'AUDITORREVIEW'}],
          audit: new ObjectId(value._id),
          currentlyUnder: 'AUDITOR',
        });
        return auditInfo;
      });
      const res = Promise.all(result);
      for (let n of await res) {
        if (n.length !== 0) {
          finalresult.push(...n);
        }
      }
      // console.log('finalresult', finalresult);
      return finalresult;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }
  //this api return all the audits if the loggedin user is a MR and currently under him
  async getAuditByMR(userid) {
    try {
      //1.first check if the loggedin user is an

      const activeuser = await this.prisma.user.findFirst({
        where: {
          kcId: userid.id,
        },
        include: {
          entity: true,
          location: true,
        },
      });

      let finalresult = [];

      // if (
      //   userid.kcRoles.roles.includes('ORG-ADMIN')
      //   // ||userid.kcRoles.roles.includes('MR')status=="VERIFIED" fnc spc ,auditor
      // ) {
      //   finalresult = await this.NcModel.find({
      //     $or: [{ status: 'REJECTED' }, { status: 'VERIFIED' }],
      //     currentlyUnder: 'ORG-ADMIN',
      //     organization: activeuser.organizationId,
      //   });
      // } else if (userid.kcRoles.roles.includes('MR')) {
      //   finalresult = await this.NcModel.find({
      //     $or: [{ status: 'REJECTED' }, { status: 'VERIFIED' }],
      //     currentlyUnder: 'MR',
      //     organization: activeuser.organizationId,
      //     location: activeuser.locationId,
      //   });
      // } else {
      //   finalresult = [];
      // }
      //get data for  depthead, check first if he is dh
      let dhresult, funspocresult, mrresult, adminresult;
      dhresult = await this.NcModel.find({
        $or: [
          // { currentlyUnder: 'Func Spoc' },
          { currentlyUnder: 'DeptHead' },
        ],
        status: { $ne: 'CLOSED' },
        organization: activeuser.organizationId,
      });
      funspocresult = await this.NcModel.find({
        $or: [
          { currentlyUnder: 'Function Spoc' },
          // { currentlyUnder: 'DeptHead' },
        ],
        status: { $ne: 'CLOSED' },
        organization: activeuser.organizationId,
      });
      // console.log('fun spoc result', funspocresult);
      mrresult = await this.NcModel.find({
        $or: [
          { currentlyUnder: 'MR' },

          // { currentlyUnder: 'DeptHead' },
        ],
        auditedEntity: activeuser.entity.id,
        status: { $ne: 'CLOSED' },
        organization: activeuser.organizationId,
      });
      // console.log('mr result', mrresult);
      finalresult.push(...mrresult);
      adminresult = await this.NcModel.find({
        $or: [
          { currentlyUnder: 'ORG-ADMIN' },
          // { currentlyUnder: 'DeptHead' },
        ],
        status: { $ne: 'CLOSED' },
        organization: activeuser.organizationId,
      });
      // console.log('adminresult', adminresult);
      finalresult.push(...adminresult);
      // console.log('funspocresult', funspocresult);
      for (let rec of dhresult) {
        const entitydata = await this.prisma.entity.findFirst({
          where: {
            id: rec.auditedEntity,
            users: { has: activeuser.id },
          },
        });
        if (entitydata) {
          finalresult.push(rec);
        }
      }
      for (let rec of funspocresult) {
        //check if he is funcspoc
        const entityForNc = await this.prisma.entity.findFirst({
          where: {
            id: rec?.auditedEntity,
          },
        });

        const currentFunction = await this.prisma.functions.findFirst({
          where: { id: entityForNc?.functionId },
        });

        if (currentFunction?.functionSpoc?.includes(activeuser.id)) {
          // console.log('inside if funcspoc');
          finalresult.push(rec);
        }
      }

      // }
      return finalresult;
    } catch (error) {
      ////////////////console.log(error);
    }
  }
}
