import {
  Injectable,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AspectImpact } from './aspectImpactSchema/aspectImpact.schema';
import { AiMitigation } from './aspectImpactSchema/aiMitigation.schema';
import { RiskConfig } from 'src/risk/riskConfigSchema/riskconfig.schema';
import { AiReviewComments } from './aspectImpactSchema/aiReviewComments.schema';
import { AspectImpactConfig } from './aspectImpactConfigSchema/aspectImpactConfig.schema';
import { AspectType } from './aspectTypesSchema/aspectTypes.schema';
import { ImpactType } from './impactTypesSchema/impactTypes.schema';
import { Act } from './actSchema/act.schema';
import { AspImpConsolidatedStatus } from './aspImpConsolidatedStatusSchema/aspImpConsolidatedStatus.schema';
import { AspImpSignificanceConfiguration } from './aspImpSignicanceConfigurationSchema/aspImpSignicanceConfiguration.schema';
import { AspectImpactReviewHistory } from './aspectImpactSchema/aspectImpactReviewHistory.schema';
import { AspImpChangesTrack } from './aspectImpactSchema/aspImpChangesTrack.schema';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { PrismaService } from 'src/prisma.service';
import { ObjectId } from 'bson';
import { EmailService } from 'src/email/email.service';
import { Logger, log } from 'winston';
import { v4 as uuid } from 'uuid';
import auditTrial from '../watcher/changesStream';

import { OrganizationService } from 'src/organization/organization.service';
import * as sgMail from '@sendgrid/mail';
const moment = require('moment');
sgMail.setApiKey(process.env.SMTP_PASSWORD);
@Injectable()
export class AspectImpactService {
  constructor(
    @InjectModel(AspectImpact.name) private aspImpModel: Model<AspectImpact>,
    @InjectModel(AiMitigation.name)
    private aspImpMitigationModel: Model<AiMitigation>,
    @InjectModel(RiskConfig.name) private riskConfigModel: Model<RiskConfig>,
    @InjectModel(AiReviewComments.name)
    private aspImpReviewCommentsModal: Model<AiReviewComments>,
    @InjectModel(AspectImpactConfig.name)
    private aspImpConfigModel: Model<AspectImpactConfig>,
    @InjectModel(AspectType.name) private aspectTypeModel: Model<AspectType>,
    @InjectModel(ImpactType.name) private impactTypeModel: Model<ImpactType>,
    @InjectModel(Act.name) private actModel: Model<Act>,
    @InjectModel(AspImpConsolidatedStatus.name)
    private aspImpConsolidatedStatusModel: Model<AspImpConsolidatedStatus>,
    @InjectModel(AspImpSignificanceConfiguration.name)
    private aspImpSignificanceConfigurationModel: Model<AspImpSignificanceConfiguration>,
    @InjectModel(AspectImpactReviewHistory.name)
    private aspectImpactReviewHistoryModel: Model<AspectImpactReviewHistory>,
    @Inject('Logger') private readonly logger: Logger,
    @InjectModel(AspImpChangesTrack.name)
    private aspImpChangesTrackModel: Model<AspImpChangesTrack>,
    private readonly serialNumberService: SerialNumberService,
    private readonly organizationService: OrganizationService,

    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createAspImpConfig(body: any, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      const auditTrail = await auditTrial(
        'aspectimpactconfigs',
        'Aspect And Impact',
        'Aspect Impact Configuration',
        user.user,
        activeUser,
        "",
      );
      // console.log('in createcreateAspImpConfig body', body);

      const isExist = await this.aspImpConfigModel.findOne({
        riskCategory: 'Aspect Impact',
        deleted: false,
        organizationId: body.organizationId,
      });

      //below rules for AspImp for Hindalco
      const rules = [
        {
          ruleType: 'product',
          operator: '>=',
          value: 9,
          significance: true,
          organizationId: body.organizationId,
        },
        {
          ruleType: 'severity',
          operator: '>=',
          value: 3,
          significance: true,
          organizationId: body.organizationId,
        },
      ];

      if (!!isExist) {
        throw new HttpException(
          'Aspect Impact Config already exists',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        this.logger.log(
          `trace id=${uuid()} POST /aspect-impact/createAspImpConfig   payload  service successful`,
          '',
        );
        const createdAspImpConfig = await this.aspImpConfigModel.create(body);
        const createSignificanceConfig =
          await this.aspImpSignificanceConfigurationModel.create(rules);

        return createdAspImpConfig;
      }
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, POST /aspect-impact/createAspImpConfig payload ${body}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async updateAspImpConfig(body: any, aspImpConfigId: string, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      const auditTrail = await auditTrial(
        'aspectimpactconfigs',
        'Aspect And Impact',
        'Aspect Impact Configuration',
        user.user,
        activeUser,
        "",
      );
      // console.log('in updateAspImpConfig hira config body', body);

      const isExist = await this.aspImpConfigModel.findOne({
        _id: new ObjectId(aspImpConfigId),
        deleted: false,
        // organizationId: body.organizationId,
      });

      if (!isExist) {
        throw new HttpException(
          'Aspect Impact Config Not Found',
          HttpStatus.NOT_FOUND,
        );
      } else {
        this.logger.log(
          `trace id=${uuid()} PATCH /aspect-impact/updateAspImpConfig   payload  service successful`,
          '',
        );
        const updateAspImpConfig =
          await this.aspImpConfigModel.findByIdAndUpdate(aspImpConfigId, body);

        return updateAspImpConfig;
      }
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, PATCH /aspect-impact/updateAspImpConfig payload ${body}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async getAspImpConfig(orgId: string) {
    try {
      const aspImpConfig = await this.aspImpConfigModel.find({
        organizationId: orgId,
        deleted: false,
      });
      this.logger.log(
        `trace id=${uuid()} GET /aspect-impact/getAspImpConfig   payload  service successful`,
        '',
      );

      return aspImpConfig;
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, GET /aspect-impact/getAspImpConfig orgId ${orgId}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async getSignificanceConfiguration(orgId: string) {
    try {
      const aspImpSignificanceConfig =
        await this.aspImpSignificanceConfigurationModel.find({
          organizationId: orgId,
        });
        this.logger.log(
          `trace id=${uuid()} GET /aspect-impact/getSignificanceConfiguration   payload  service successful`,
          '',
        );

      return aspImpSignificanceConfig;
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, GET /aspect-impact/getSignificanceConfiguration orgId ${orgId}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async createAspectType(body: any, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      const auditTrail = await auditTrial(
        'aspecttypes',
        'Aspect And Impact',
        'Aspect Types',
        user.user,
        activeUser,
        "",
      );
      // console.log('checkrisk body in createHiraType', body);
      setTimeout(async () => {
      const createdAspectType = await this.aspectTypeModel.create(body);
      if (createdAspectType) {
        this.logger.log(
          `trace id=${uuid()} POST /aspect-impact/createAspectType   payload  service successful`,
          '',
        );
        return {
          message: 'Aspect Type Created successfully',
          data: createdAspectType,
        };
      } else {
        throw new HttpException(
          'Aspect Type Creation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }, 1000);
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, POST /aspect-impact/createAspectType orgId $payload body ${body}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async updateAspectType(body: any, aspectTypeId: string, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      const auditTrail = await auditTrial(
        'aspecttypes',
        'Aspect And Impact',
        'Aspect Types',
        user.user,
        activeUser,
        "",
      );
      // console.log('checkrisk body in createHiraType', body);
      setTimeout(async () => {
      // console.log('checkrisk body in createHiraType', body);
      const updatedAspectType = await this.aspectTypeModel.findByIdAndUpdate(
        aspectTypeId,
        {
          ...body,
        },
      );
      if (updatedAspectType) {
        this.logger.log(
          `trace id=${uuid()} PUT /aspect-impact/updateAspectType   payload  service successful`,
          '',
        );
        return {
          message: 'Aspect Type Updated successfully',
          data: updatedAspectType,
        };
      } else {
        throw new HttpException(
          'Aspect Type Updation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }, 1000);
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, PUT /aspect-impact/updateAspectType  $payload body ${body}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async deleteAspectType(aspectTypeId: string, user) {
    try {
      // const activeUser = await this.prisma.user.findFirst({
      //   where: {
      //     kcId: user.user.id,
      //   },
      // });
      // const auditTrail = await auditTrial(
      //   'aspecttypes',
      //   'Aspect And Impact',
      //   'Aspect Types',
      //   user.user,
      //   activeUser,
      //   "",
      // );
      // console.log('checkrisk body in createHiraType', body);
      setTimeout(async () => {
      // console.log('checkrisk body in createHiraType', body);
      const deletedAspectType = await this.aspectTypeModel.findByIdAndUpdate(
        aspectTypeId,
        {
          deleted: true,
          deletedAt: new Date(),
        },
      );
      if (deletedAspectType) {
        
      this.logger.log(
        `trace id=${uuid()} GET /aspect-impact/deleteAspectType   payload  service successful`,
        '',
      );
        return {
          message: 'Aspect Type Deleted successfully',
          data: deletedAspectType,
        };
      } else {
        throw new HttpException(
          'Aspect Type Deletion failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }, 1000);
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, DELETE /aspect-impact/deleteAspectType  $payload aspectTypeId ${aspectTypeId}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async getAspectTypes(query: any) {
    try {
      const {
        page = 1,
        pageSize = 10,
        locationId,
        orgId,
        pagination = true,
        master,
      } = query;
  
      const locationFilter =
        locationId !== "All" && master
          ? { locationId: { $in: ["All", locationId] } }
          : {};
  
      const baseQuery = {
        organizationId: orgId,
        deleted: false,
        ...locationFilter,
      };
  
      const queryBuilder = this.aspectTypeModel.find(baseQuery);
      if (pagination) {
        queryBuilder.skip((page - 1) * pageSize).limit(pageSize);
      }
  
      const [list, totalDocuments] = await Promise.all([
        queryBuilder.lean(),
        this.aspectTypeModel.countDocuments(baseQuery),
      ]);
  
      const locationIds = [
        ...new Set(list.map((item) => item.locationId)),
      ].filter((id) => id !== "All" && id);
  
      const userIds = [...new Set(list.map((item) => item.createdBy))].filter(Boolean);
  
      const [locationData, users] = await Promise.all([
        this.prisma.location.findMany({
          where: {
            organizationId: orgId,
            deleted: false,
            id: { in: locationIds },
          },
          select: {
            id: true,
            locationName: true,
          },
        }),
        this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
          },
        }),
      ]);
  
      const locationIdToNameMap = new Map(
        locationData.map((location) => [location.id, location.locationName])
      );
  
      const userMap = new Map(users.map((user) => [user.id, user]));
  
      const enhancedList = list.map((item) => ({
        ...item,
        locationName:
          item.locationId === "All"
            ? "All"
            : locationIdToNameMap.get(item.locationId) || "Unknown Location",
        createdBy: userMap.get(item.createdBy) || null,
      }));
  
      return { data: enhancedList, count: totalDocuments };
    } catch (error) {
      this.logger.error(
        `GET /aspect-impact/getAspectTypes failed with error ${error}`
      );
      throw new InternalServerErrorException(error);
    }
  }
  
  async createImpactType(body: any, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      const auditTrail = await auditTrial(
        'impacttypes',
        'Aspect And Impact',
        'Impact Types',
        user.user,
        activeUser,
        "",
      );
      // console.log('checkrisk body in createHiraType', body);
      setTimeout(async () => {
      // console.log('checkrisk body in createHiraType', body);
      const createdImpactType = await this.impactTypeModel.create(body);
      if (createdImpactType) {
        this.logger.log(
          `trace id=${uuid()} POST /aspect-impact/createImpactType   payload  service successful`,
          '',
        );
        return {
          message: 'Impact Type Created successfully',
          data: createdImpactType,
        };
      } else {
        throw new HttpException(
          'Impact Type Creation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }, 1000);
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, POST /aspect-impact/createImpactType  $payload body ${body}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async updateImpactType(body: any, impactTypeId: string, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      const auditTrail = await auditTrial(
        'impacttypes',
        'Aspect And Impact',
        'Impact Types',
        user.user,
        activeUser,
        "",
      );
      // console.log('checkrisk body in createHiraType', body);
      setTimeout(async () => {
      // console.log('checkrisk body in createHiraType', body);
      const updatedImpactType = await this.impactTypeModel.findByIdAndUpdate(
        impactTypeId,
        {
          ...body,
        },
      );
      if (updatedImpactType) {
        this.logger.log(
          `trace id=${uuid()} PUT /aspect-impact/updateImpactType   payload  service successful`,
          '',
        );
        return {
          message: 'Impact Type Updated successfully',
          data: updatedImpactType,
        };
      } else {
        throw new HttpException(
          'Impact Type Updation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }, 1000);
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, PUT /aspect-impact/updateImpactType  $payload body ${body}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async deleteImpactType(impactTypeId: string, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      const auditTrail = await auditTrial(
        'impacttypes',
        'Aspect And Impact',
        'Impact Types',
        user.user,
        activeUser,
        "",
      );
      // console.log('checkrisk body in createHiraType', body);
      setTimeout(async () => {
      // console.log('checkrisk body in createHiraType', body);
      const deletedImpactType = await this.impactTypeModel.findByIdAndUpdate(
        impactTypeId,
        {
          deleted: true,
          deletedAt: new Date(),
        },
      );
      if (deletedImpactType) {
        this.logger.log(
          `trace id=${uuid()} DELETE /aspect-impact/deleteImpactType   payload  service successful`,
          '',
        );
        return {
          message: 'Impact Type Deleted successfully',
          data: deletedImpactType,
        };
      } else {
        throw new HttpException(
          'Impact Type Deletion failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }, 1000);
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, DELETE /aspect-impact/deleteImpactType  $payload body impactTypeId ${impactTypeId}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async getImpactTypes(query: any) {
    try {
      const {
        page = 1,
        pageSize = 10,
        locationId,
        orgId,
        pagination = true,
        master,
      } = query;
  
      const locationFilter =
        locationId !== "All" && master
          ? { locationId: { $in: ["All", locationId] } }
          : {};
  
      const baseQuery = {
        organizationId: orgId,
        deleted: false,
        ...locationFilter,
      };
  
      const queryBuilder = this.impactTypeModel.find(baseQuery);
      if (pagination) {
        queryBuilder.skip((page - 1) * pageSize).limit(pageSize);
      }
  
      const [list, totalDocuments] = await Promise.all([
        queryBuilder.lean(),
        this.impactTypeModel.countDocuments(baseQuery),
      ]);
  
      const locationIds = [
        ...new Set(list.map((item) => item.locationId)),
      ].filter((id) => id !== "All");
  
      const userIds = [
        ...new Set(
          list?.map((item) => item?.createdBy)?.filter(Boolean)
        ),
      ];
  
      const [locationData, users] = await Promise.all([
        this.prisma.location.findMany({
          where: {
            organizationId: orgId,
            deleted: false,
            id: { in: locationIds },
          },
          select: {
            id: true,
            locationName: true,
          },
        }),
        this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
          },
        }),
      ]);
  
      const locationIdToNameMap = new Map(
        locationData.map((location) => [location.id, location.locationName])
      );
  
      const userMap = new Map(users.map((user) => [user.id, user]));
  
      const enhancedList = list.map((item) => ({
        ...item,
        locationName:
          item.locationId === "All"
            ? "All"
            : locationIdToNameMap.get(item.locationId) || "Unknown Location",
        createdBy: userMap?.get(item?.createdBy) || null,
      }));
  
      return { data: enhancedList, count: totalDocuments };
    } catch (error) {
      this.logger.error(
        `GET /aspect-impact/getImpactTypes failed with error ${error}`
      );
      throw new InternalServerErrorException(error);
    }
  }
  

  async createAct(body: any, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      const auditTrail = await auditTrial(
        'acts',
        'Aspect And Impact',
        'Corresponding Act Master',
        user.user,
        activeUser,
        "",
      );
      // console.log('checkrisk body in createHiraType', body);
      setTimeout(async () => {
      // console.log('checkrisk body in createHiraType', body);
      const createdAct = await this.actModel.create(body);
      if (createdAct) {
        this.logger.log(
          `trace id=${uuid()} POST /aspect-impact/createAct   payload  service successful`,
          '',
        );
        return {
          message: 'Act Created successfully',
          data: createdAct,
        };
      } else {
        throw new HttpException(
          'Act Creation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }, 1000);
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, POST /aspect-impact/createAct  $payload body ${body}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async updateAct(body: any, actId: string, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      const auditTrail = await auditTrial(
        'acts',
        'Aspect And Impact',
        'Corresponding Act Master',
        user.user,
        activeUser,
        "",
      );
      // console.log('checkrisk body in createHiraType', body);
      setTimeout(async () => {
      // console.log('checkrisk body in createHiraType', body);
      const updatedAct = await this.actModel.findByIdAndUpdate(actId, {
        ...body,
      });
      if (updatedAct) {
        this.logger.log(
          `trace id=${uuid()} PUT /aspect-impact/updateAct   payload  service successful`,
          '',
        );
        return {
          message: 'Act Updated successfully',
          data: updatedAct,
        };
      } else {
        throw new HttpException(
          'Act Updation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }, 1000);
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, PUT /aspect-impact/updateAct  $payload body ${body}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async deleteAct(actId: string, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      const auditTrail = await auditTrial(
        'acts',
        'Aspect And Impact',
        'Corresponding Act Master',
        user.user,
        activeUser,
        "",
      );
      // console.log('checkrisk body in createHiraType', body);
      setTimeout(async () => {
      // console.log('checkrisk body in createHiraType', body);
      const deletedAct = await this.actModel.findByIdAndUpdate(actId, {
        deleted: true,
        deletedAt: new Date(),
      });
      if (deletedAct) {
        this.logger.log(
          `trace id=${uuid()} DELETE /aspect-impact/deleteAct   payload  service successful`,
          '',
        );
        return {
          message: 'Act Deleted successfully',
          data: deletedAct,
        };
      } else {
        throw new HttpException(
          'Act Deletion failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }, 1000);
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, DELETE /aspect-impact/deleteAct  $payload actId ${actId}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async getActs(query: any) {
    try {
      const { orgId } = query;
      // console.log('query in ACT ASP IMP', query);
      
      // coerce page & pageSize to numbers only if provided
      const page = query.page ? Number(query.page) : undefined;
      const pageSize = query.pageSize ? Number(query.pageSize) : undefined;
  
      const baseQuery = { organizationId: orgId, deleted: false };
      const queryBuilder = this.actModel.find(baseQuery);
  
      // apply pagination only when both page & pageSize are valid numbers
      if (!!page && !!pageSize) {
        queryBuilder.skip((page - 1) * pageSize).limit(pageSize);
      }
  
      // run both the find and the count in parallel
      const [list, totalDocuments] = await Promise.all([
        queryBuilder.lean(),
        this.actModel.countDocuments(baseQuery),
      ]);
  
      // fetch creator details
      const userIds = Array.from(new Set(list.map(item => item.createdBy))).filter(Boolean);
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, username: true, email: true, firstname: true, lastname: true, avatar: true },
      });
      const userMap = new Map(users.map(u => [u.id, u]));
  
      // replace createdBy with full user object (or null)
      const enhancedList = list.map(item => ({
        ...item,
        createdBy: userMap.get(item.createdBy) || null,
      }));
  
      return {
        data: enhancedList,
        count: totalDocuments,
        // optionally echo back pagination info
        ...(page !== undefined && pageSize !== undefined ? { page, pageSize } : {}),
      };
    } catch (error) {
      this.logger.error(`GET /aspect-impact/getActs failed with error ${error}`);
      throw new InternalServerErrorException(error);
    }
  }
  
  
  

  async uploadsAttachment(files: any, data) {
    try {
      //file,req.query.realm.toLowerCase()

      const attachments = [];
      const realmName = data.realm.toLowerCase();
      let locationName;

      if (data?.locationName) {
        locationName = data?.locationName;
      } else {
        locationName = 'NoLocation';
      }

      for (let file of files) {
        const attachmentUrl = `${process.env.SERVER_IP}/${realmName}/${locationName}/aspectImpactAttachments/${file.filename}`;
        attachments.push({
          attachmentUrl,
          attachmentName: file.originalname,
        });
      }
      // const path = file.path;
      return attachments;
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, GET /aspect-impact/uploadattachement  $payload files ${files}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async create(body: any, user) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting create`,
      JSON.stringify({ 
        bodyKeys: Object.keys(body),
        userId: user?.user?.id,
        organizationId: body?.organizationId,
        entityId: body?.entityId,
        hiraConfigId: body?.hiraConfigId
      }),
    );

    try {
      // Input validation
      if (!body || !user) {
        this.logger.debug(
          `traceId=${traceId} - Input validation failed`,
          JSON.stringify({ body: !!body, user: !!user }),
        );
        throw new Error('Invalid input: body or user is missing');
      }

      this.logger.debug(
        `traceId=${traceId} - Fetching activeUser for kcId=${user?.user?.id}`,
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - ActiveUser fetched`,
        JSON.stringify({ 
          activeUserFound: !!activeUser,
          activeUserId: activeUser?.id
        }),
      );

      const auditTrail = await auditTrial(
        'aspectimpacts',
        'Aspect And Impact',
        'Aspect Impact Records',
        user.user,
        activeUser,
        "",
      );

      this.logger.debug(
        `traceId=${traceId} - Audit trail created`,
      );

      const { organizationId } = body;
      const { hiraConfigId } = body;

      this.logger.debug(
        `traceId=${traceId} - Extracted organizationId and hiraConfigId`,
        JSON.stringify({ 
          organizationId,
          hiraConfigId,
          entityId: body?.entityId
        }),
      );

      // Find the highest sNo for the existing entries with the same jobTitle
      this.logger.debug(
        `traceId=${traceId} - Searching for maximum sNo entry`,
        JSON.stringify({ 
          entityId: body.entityId,
          organizationId
        }),
      );

      const maxSNoEntry = await this.aspImpModel
        .findOne({
          // jobTitle: jobTitle,
          entityId: body.entityId,
          status: 'active',
          organizationId: organizationId,
        })
        .sort({ sNo: -1 })
        .limit(1);

      // Determine the sNo for the new entry
      const newSNo = maxSNoEntry ? maxSNoEntry.sNo + 1 : 1;

      this.logger.debug(
        `traceId=${traceId} - Determined new sNo`,
        JSON.stringify({ 
          maxSNoFound: !!maxSNoEntry,
          maxSNo: maxSNoEntry?.sNo,
          newSNo
        }),
      );

      this.logger.debug(
        `traceId=${traceId} - Creating aspect impact record`,
        JSON.stringify({ 
          newSNo,
          organizationId,
          hiraConfigId,
          status: 'active',
          revisionNumber: 0
        }),
      );

      const createAspImpData = await this.aspImpModel.create({
        ...body,
        sNo: newSNo, // Set the determined sNo
        organizationId,
        hiraConfigId: new ObjectId(hiraConfigId),
        revisionNumber: 0,
        status: 'active',
      });

      this.logger.debug(
        `traceId=${traceId} - Aspect impact record created successfully`,
        JSON.stringify({ 
          createdId: createAspImpData?._id,
          sNo: createAspImpData?.sNo
        }),
      );

      this.logger.log(
        `trace id=${traceId} POST /aspect-impact/create   payload  service successful`,
        '',
      );
      return createAspImpData;
    } catch (error) {
      this.logger.error(
        `traceId=${traceId} - create failed with error: ${error.message}`,
        JSON.stringify({ 
          organizationId: body?.organizationId,
          userId: user?.user?.id,
          entityId: body?.entityId
        }),
      );
      throw new InternalServerErrorException(error);
    }
  }

  async findAll(jobTitle: any, query: any, id: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting findAll`,
      JSON.stringify({ 
        jobTitle,
        queryKeys: Object.keys(query),
        kcId: id,
        page: query?.page,
        pageSize: query?.pageSize,
        entityId: query?.entityId
      }),
    );

    try {
      const page = query.page || 1;
      const pageSize = query.pageSize || 10;
      const skip = (page - 1) * pageSize;
      const { entityId } = query;

      this.logger.debug(
        `traceId=${traceId} - Pagination setup`,
        JSON.stringify({ 
          page,
          pageSize,
          skip,
          entityId
        }),
      );

      const sortParam = !!query.sort
        ? JSON.parse(query.sort)
        : { field: 'jobTitle', order: 'ascend' };

      this.logger.debug(
        `traceId=${traceId} - Sort parameters determined`,
        JSON.stringify({ sortParam }),
      );

      // let entity;
      this.logger.debug(
        `traceId=${traceId} - Fetching activeUser for kcId=${id}`,
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: id,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - ActiveUser fetched`,
        JSON.stringify({ 
          activeUserFound: !!activeUser,
          organizationId: activeUser?.organizationId
        }),
      );

      // Define the query object for the Risk model

      let riskQuery: any = {
        organizationId: activeUser.organizationId,
        status: { $in: ['inWorkflow', 'active'] },
        ...(jobTitle && jobTitle !== 'All' && { jobTitle: jobTitle }),
        // ... Add other filters as needed
      };

      let mitigationFilter: any = {
        mitigationStatus: { $in: ['inWorkflow', 'active'] },
      };

      this.logger.debug(
        `traceId=${traceId} - Initial riskQuery and mitigationFilter setup`,
        JSON.stringify({ 
          baseRiskQuery: {
            organizationId: activeUser?.organizationId,
            status: riskQuery.status,
            jobTitle: riskQuery.jobTitle
          },
          mitigationFilter
        }),
      );

      // If statusFilter is provided, split it into an array and add the $in condition to the riskQuery
      // if (!!query.statusFilter && query.statusFilter.trim() !== '') {
      //   riskQuery.status = { $in: query.statusFilter.split(',') };
      // }

      if (!!query.entityId) {
        riskQuery.entityId = entityId;
        this.logger.debug(
          `traceId=${traceId} - Applied entityId filter: ${entityId}`,
        );
      }

      if (!!query.status) {
        riskQuery.status = query.status;
        this.logger.debug(
          `traceId=${traceId} - Applied status filter: ${query?.status}`,
        );
      }

      if (!!query.dateFilter) {
        const { startDate, endDate } = JSON.parse(query.dateFilter);
        const startDateUTC = `${startDate}T00:00:59Z`;
        const endDateUTC = `${endDate}T23:59:59Z`;
        riskQuery.createdAt = {
          $gte: startDateUTC, // Greater than or equal to startDate
          $lte: endDateUTC, // Less than or equal to endDate
        };
        this.logger.debug(
          `traceId=${traceId} - Applied dateFilter: ${query?.dateFilter}`,
        );
      }

      if (!!query.search) {
        const searchRegex = new RegExp(query.search, 'i');
        riskQuery.$or = [
          { jobTitle: { $regex: searchRegex } },
          { activity: { $regex: searchRegex } },
          // { 'mitigations.title': { $regex: searchRegex } },
        ];
        this.logger.debug(
          `traceId=${traceId} - Applied search filter: ${query?.search}`,
        );
      }

      this.logger.debug(
        `traceId=${traceId} - Final riskQuery`,
        JSON.stringify(riskQuery),
      );

      this.logger.debug(
        `traceId=${traceId} - Executing DB query on aspImpModel`,
      );

      let list = await this.aspImpModel
        .find(riskQuery)
        .sort({ createdAt: 1 }) // Adjust sorting as needed
        .skip(skip)
        .limit(pageSize)
        .populate('hiraConfigId')
        .populate({
          path: 'mitigations',
          match: mitigationFilter,
        })
        .lean();

      this.logger.debug(
        `traceId=${traceId} - Retrieved ${list?.length} items from DB`,
      );

      let allUserIds = list
        ?.map((item: any) =>
          item?.mitigations?.length
            ? item?.mitigations?.map(
                (mitigation: any) => mitigation?.responsiblePerson,
              )
            : '',
        )
        .filter((item: any) => !!item)
        .flat();

      this.logger.debug(
        `traceId=${traceId} - Extracted allUserIds`,
        JSON.stringify({ 
          allUserIdsCount: allUserIds?.length,
          uniqueUserIds: [...new Set(allUserIds)]?.length
        }),
      );

      let userDetails = [];
      if (allUserIds?.length) {
        userDetails = await this.prisma.user.findMany({
          where: {
            id: { in: allUserIds },
          },
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
          },
        });
      }

      this.logger.debug(
        `traceId=${traceId} - Fetched user details`,
        JSON.stringify({ 
          userDetailsCount: userDetails?.length
        }),
      );

      let userMap = new Map(userDetails?.map((user: any) => [user.id, user]));

      this.logger.debug(
        `traceId=${traceId} - Built userMap with ${userMap?.size} entries`,
      );

      list = await Promise.all(
        list.map(async (risk: any) => {
          let location,
            entity,
            selectedRiskTypes,
            selectedConditions,
            selectedImpactTypes,
            selectedAspectTypes,
            selectedAct,
            assesmentTeam,
            createdByUserDetails,
            mitigations;

          if (!!risk.createdBy) {
            createdByUserDetails = await this.prisma.user.findFirst({
              where: {
                id: risk.createdBy,
              },
              select: {
                id: true,
                username: true,
                email: true,
                firstname: true,
                lastname: true,
                avatar: true,
              },
            });
          }

          if (risk.entityId) {
            entity = await this.prisma.entity.findUnique({
              where: { id: risk.entityId },
              select: { id: true, entityName: true },
            });
          }
          if (!!risk.condition) {
            selectedConditions = risk.hiraConfigId?.condition?.filter(
              (item: any) => item._id.toString() === risk.condition,
            )[0];
          }
          // Fetch and map location
          if (risk.locationId) {
            location = await this.prisma.location.findUnique({
              where: { id: risk.locationId },
              select: { id: true, locationName: true },
            });
          }

          if (!!risk.assesmentTeam) {
            assesmentTeam = await this.prisma.user.findMany({
              where: {
                id: { in: risk.assesmentTeam },
              },
              select: {
                id: true,
                username: true,
                email: true,
                firstname: true,
                lastname: true,
                avatar: true,
              },
            });
            assesmentTeam = assesmentTeam?.map((item) => ({
              ...item,
              label: item.username,
              value: item.id,
            }));

            //console.log('assesmentTeam', assesmentTeam);
          }

          // if (!!risk.condition) {
          //   selectedCondtions = risk.hiraConfigId?.condition?.filter(
          //     (item: any) => item._id.toString() === risk.condition,
          //   )[0];
          // }

          if (!!risk.impactType) {
            const findImpactType = await this.impactTypeModel
              .findOne({
                _id: risk.impactType,
                deleted: false,
              })
              .select('_id name');

            // console.log('findImpactType', findImpactType);

            selectedImpactTypes = findImpactType;
          }

          if (!!risk.aspectType) {
            const findAspectType = await this.aspectTypeModel
              .findOne({
                _id: risk.aspectType,
                deleted: false,
              })
              .select('_id name');

            // console.log('findAspectType', findAspectType);

            selectedAspectTypes = findAspectType;
          }

          if (!!risk.act) {
            const findAct = await this.actModel
              .findOne({
                _id: risk.act,
                deleted: false,
              })
              .select('_id name');

            // console.log('findAct', findAct);

            selectedAct = findAct;
          }
          // console.log('RISIKSKSK', risk);
          if (risk?.mitigations?.length) {
            mitigations = risk?.mitigations?.map((mitigation: any) => {
              return {
                ...mitigation,
                responsiblePersonDetails: userMap.get(
                  mitigation.responsiblePerson,
                )
                  ? userMap.get(mitigation.responsiblePerson)
                  : '',
              };
            });
            // console.log('mitigations', mitigations);
          }

          return {
            ...risk,
            mitigations: mitigations,
            prefixSuffix: risk?.prefixSuffix,
            entity,
            location,
            selectedRiskTypes,
            selectedConditions,
            selectedImpactTypes,
            selectedAspectTypes,
            selectedAct,
            assesmentTeam,
            createdByUserDetails,
          };
        }),
      );

      this.logger.debug(
        `traceId=${traceId} - Completed list processing and hydration`,
      );

      const total = await this.aspImpModel.countDocuments(riskQuery);

      this.logger.debug(
        `traceId=${traceId} - findAll completed successfully`,
        JSON.stringify({ 
          listCount: list?.length,
          totalCount: total,
          jobTitle
        }),
      );

      this.logger.log(
        `trace id=${traceId} GET /aspect-impact/all   payload jobtitle ${jobTitle} service successful`,
        '',
      );
      return { list, total };
    } catch (err) {
      this.logger.error(
        `traceId=${traceId} - findAll failed with error: ${err.message}`,
        JSON.stringify({ 
          jobTitle,
          kcId: id,
          queryKeys: Object.keys(query || {})
        }),
      );
      throw new InternalServerErrorException(err);
    }
  }

  async findAllByDepatment(entityId: any, query: any, id: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting findAllByDepartment`,
      JSON.stringify({ 
        entityId,
        queryKeys: Object.keys(query),
        kcId: id,
        page: query?.page,
        pageSize: query?.pageSize
      }),
    );

    try {
      const page = query.page || 1;
      const pageSize = query.pageSize || 10;
      const skip = (page - 1) * pageSize;

      this.logger.debug(
        `traceId=${traceId} - Pagination setup`,
        JSON.stringify({ 
          page,
          pageSize,
          skip
        }),
      );
      
      // let entity;
      this.logger.debug(
        `traceId=${traceId} - Fetching activeUser for kcId=${id}`,
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: id,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - ActiveUser fetched`,
        JSON.stringify({ 
          activeUserFound: !!activeUser,
          organizationId: activeUser?.organizationId
        }),
      );

      // Define the query object for the Risk model

      let riskQuery: any = {
        organizationId: activeUser.organizationId,
        status: { $in: ['inWorkflow', 'active'] },
        // ... Add other filters as needed
      };

      this.logger.debug(
        `traceId=${traceId} - Initial riskQuery setup`,
        JSON.stringify({ 
          organizationId: activeUser?.organizationId,
          defaultStatus: riskQuery.status
        }),
      );

      if (!!query.status) {
        riskQuery.status = query.status;
        this.logger.debug(`traceId=${traceId} - Applied status filter: ${query?.status}`);
      }
      // If statusFilter is provided, split it into an array and add the $in condition to the riskQuery
      if (!!query.statusFilter && query.statusFilter.trim() !== '') {
        riskQuery.status = { $in: query.statusFilter.split(',') };
        this.logger.debug(`traceId=${traceId} - Applied statusFilter: ${query?.statusFilter}`);
      }

      if (!!entityId) {
        riskQuery.entityId = entityId;
        this.logger.debug(`traceId=${traceId} - Applied entityId filter: ${entityId}`);
      }

      if (!!query.dateFilter) {
        const { startDate, endDate } = JSON.parse(query.dateFilter);
        const startDateUTC = `${startDate}T00:00:59Z`;
        const endDateUTC = `${endDate}T23:59:59Z`;
        riskQuery.createdAt = {
          $gte: startDateUTC, // Greater than or equal to startDate
          $lte: endDateUTC, // Less than or equal to endDate
        };
        this.logger.debug(`traceId=${traceId} - Applied dateFilter: ${query?.dateFilter}`);
      }

      if (!!query.search) {
        const searchRegex = new RegExp(query.search, 'i');
        riskQuery.$or = [
          { jobTitle: { $regex: searchRegex } },
          { activity: { $regex: searchRegex } },
          // { 'mitigations.title': { $regex: searchRegex } },
        ];
        this.logger.debug(`traceId=${traceId} - Applied search filter: ${query?.search}`);
      }

      this.logger.debug(
        `traceId=${traceId} - Final riskQuery`,
        JSON.stringify(riskQuery),
      );

      this.logger.debug(`traceId=${traceId} - Executing DB query on aspImpModel`);
      let list = await this.aspImpModel
        .find(riskQuery)
        .sort({ createdAt: 1 }) // Adjust sorting as needed
        .skip(skip)
        .limit(pageSize)
        .populate('hiraConfigId')
        .populate('mitigations')
        .lean();
      this.logger.debug(`traceId=${traceId} - Retrieved ${list?.length} items from DB`);
      let allUserIds = list
        ?.map((item: any) =>
          item?.mitigations?.length
            ? item?.mitigations?.map(
                (mitigation: any) => mitigation?.responsiblePerson,
              )
            : '',
        )
        .filter((item: any) => !!item)
        .flat();

      this.logger.debug(
        `traceId=${traceId} - Extracted allUserIds`,
        JSON.stringify({ 
          allUserIdsCount: allUserIds?.length,
          uniqueUserIds: [...new Set(allUserIds)]?.length
        }),
      );

      let userDetails = [];
      if (allUserIds?.length) {
        userDetails = await this.prisma.user.findMany({
          where: {
            id: { in: allUserIds },
          },
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
          },
        });
      }

      this.logger.debug(
        `traceId=${traceId} - Fetched user details`,
        JSON.stringify({ 
          userDetailsCount: userDetails?.length
        }),
      );

      let userMap = new Map(userDetails?.map((user: any) => [user.id, user]));

      // let list = (await this.aspImpModel
      //   .find(riskQuery)
      //   .sort([
      //     ['createdAt', -1],
      //     ['title', sortParam.order === 'ascend' ? 1 : -1],
      //   ])
      //   .skip(skip)
      //   .limit(pageSize)
      //   .populate({
      //     path: 'mitigations',
      //     options: { sort: { lastScoreUpdatedAt: -1 } },
      //   })
      //   .populate('riskConfigId')
      //   .lean()) as any;

      this.logger.debug(
        `traceId=${traceId} - Built userMap with ${userMap?.size} entries`,
      );

      this.logger.debug(
        `traceId=${traceId} - Starting processing of ${list?.length} risk items`,
      );
      list = await Promise.all(
        list.map(async (risk: any) => {
          let location,
            entity,
            selectedRiskTypes,
            selectedConditions,
            selectedImpactTypes,
            selectedAspectTypes,
            selectedAct,
            assesmentTeam,
            mitigations;

          if (risk.entityId) {
            entity = await this.prisma.entity.findUnique({
              where: { id: risk.entityId },
              select: { id: true, entityName: true },
            });
          }
          if (!!risk.condition) {
            selectedConditions = risk.hiraConfigId?.condition?.filter(
              (item: any) => item._id.toString() === risk.condition,
            )[0];
          }
          // Fetch and map location
          if (risk.locationId) {
            location = await this.prisma.location.findUnique({
              where: { id: risk.locationId },
              select: { id: true, locationName: true },
            });
          }

          if (!!risk.assesmentTeam) {
            assesmentTeam = await this.prisma.user.findMany({
              where: {
                id: { in: risk.assesmentTeam },
              },
              select: {
                id: true,
                username: true,
                email: true,
                firstname: true,
                lastname: true,
                avatar: true,
              },
            });
            assesmentTeam = assesmentTeam?.map((item) => ({
              ...item,
              label: item.username,
              value: item.id,
            }));

            //console.log('assesmentTeam', assesmentTeam);
          }

          // if (!!risk.condition) {
          //   selectedCondtions = risk.hiraConfigId?.condition?.filter(
          //     (item: any) => item._id.toString() === risk.condition,
          //   )[0];
          // }

          if (!!risk.impactType) {
            const findImpactType = await this.impactTypeModel
              .findOne({
                _id: risk.impactType,
                deleted: false,
              })
              .select('_id name');

            // console.log('findImpactType', findImpactType);

            selectedImpactTypes = findImpactType;
          }

          if (!!risk.aspectType) {
            const findAspectType = await this.aspectTypeModel
              .findOne({
                _id: risk.aspectType,
                deleted: false,
              })
              .select('_id name');

            // console.log('findAspectType', findAspectType);

            selectedAspectTypes = findAspectType;
          }

          if (!!risk.act) {
            const findAct = await this.actModel
              .findOne({
                _id: risk.act,
                deleted: false,
              })
              .select('_id name');

            // console.log('findAct', findAct);

            selectedAct = findAct;
          }
          if (risk?.mitigations?.length) {
            mitigations = risk?.mitigations?.map((mitigation: any) => {
              return {
                ...mitigation,
                responsiblePersonDetails: userMap.get(
                  mitigation.responsiblePerson,
                )
                  ? userMap.get(mitigation.responsiblePerson)
                  : '',
              };
            });
            // console.log('mititigationAAA', mitigations);

            // console.log('mitigations', mitigations);
          }

          return {
            ...risk,
            mitigations: mitigations,
            entity,
            location,
            selectedRiskTypes,
            selectedConditions,
            selectedImpactTypes,
            selectedAspectTypes,
            selectedAct,
            assesmentTeam,
          };
        }),
      );

      this.logger.debug(
        `traceId=${traceId} - Completed list processing and hydration`,
      );

      const total = await this.aspImpModel.countDocuments(riskQuery);

      this.logger.debug(
        `traceId=${traceId} - findAllByDepartment completed successfully`,
        JSON.stringify({ 
          listCount: list?.length,
          totalCount: total,
          entityId
        }),
      );

      return { list, total, traceId };
    } catch (err) {
      this.logger.error(
        `traceId=${traceId} - findAllByDepartment failed with error: ${err.message}`,
        JSON.stringify({ 
          entityId,
          kcId: id,
          queryKeys: Object.keys(query || {})
        }),
      );
      throw new InternalServerErrorException(err);
    }
  }

  async findOne(id: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting findOne`,
      JSON.stringify({ 
        aspectImpactId: id
      }),
    );

    try {
      // Input validation
      if (!id) {
        this.logger.debug(
          `traceId=${traceId} - Input validation failed`,
          JSON.stringify({ id: !!id }),
        );
        throw new Error('Invalid input: id is missing');
      }

      let location,
        entity,
        section,
        selectedInterestedParties,
        selectedCondtions,
        selectedImpactTypes,
        selectedAct,
        selectedAspectTypes;

      let assesmentTeam, riskReviewers, riskApprovers;

      this.logger.debug(
        `traceId=${traceId} - Fetching aspect impact record from DB`,
        JSON.stringify({ id }),
      );

      const risk = (await this.aspImpModel
        .findById(id)
        .populate('hiraConfigId')
        .populate({
          path: 'mitigations',
          model: 'AiMitigation', // Make sure this matches the model name for HiraMitigation
        })) as any;

      this.logger.debug(
        `traceId=${traceId} - Aspect impact record fetched`,
        JSON.stringify({ 
          riskFound: !!risk,
          riskId: risk?._id,
          status: risk?.status,
          hiraConfigId: risk?.hiraConfigId?._id,
          mitigationsCount: risk?.mitigations?.length
        }),
      );

      if (!risk) {
        this.logger.debug(
          `traceId=${traceId} - Aspect impact record not found`,
          JSON.stringify({ id }),
        );
        throw new NotFoundException(`Aspect impact record with ID ${id} not found`);
      }

      this.logger.debug(
        `traceId=${traceId} - Starting processing of conditions and related data`,
        JSON.stringify({ 
          hasCondition: !!risk.condition,
          hasInterestedParties: !!risk.interestedParties,
          hasImpactType: !!risk.impactType,
          hasAspectType: !!risk.aspectType,
          hasAct: !!risk.act
        }),
      );

      if (!!risk.condition) {
        selectedCondtions = risk.hiraConfigId?.condition?.filter(
          (item: any) => item._id.toString() === risk.condition,
        )[0];
        this.logger.debug(
          `traceId=${traceId} - Processed condition`,
          JSON.stringify({ 
            conditionId: risk.condition,
            selectedConditionFound: !!selectedCondtions
          }),
        );
      }

      if (!!risk.interestedParties && Array.isArray(risk.interestedParties)) {
        selectedInterestedParties =
          risk.hiraConfigId?.interestedParties?.filter((item: any) =>
            risk.interestedParties.includes(item._id.toString()),
          );
        this.logger.debug(
          `traceId=${traceId} - Processed interested parties`,
          JSON.stringify({ 
            interestedPartiesCount: risk.interestedParties?.length,
            selectedInterestedPartiesCount: selectedInterestedParties?.length
          }),
        );
      }

      if (!!risk.impactType) {
        const findImpactType = await this.impactTypeModel
          .findOne({
            _id: risk.impactType,
            deleted: false,
          })
          .select('_id name');

        selectedImpactTypes = findImpactType;
        this.logger.debug(
          `traceId=${traceId} - Processed impact type`,
          JSON.stringify({ 
            impactTypeId: risk.impactType,
            impactTypeFound: !!selectedImpactTypes
          }),
        );
      }

      if (!!risk.aspectType) {
        const findAspectType = await this.aspectTypeModel
          .findOne({
            _id: risk.aspectType,
            deleted: false,
          })
          .select('_id name');

        selectedAspectTypes = findAspectType;
        this.logger.debug(
          `traceId=${traceId} - Processed aspect type`,
          JSON.stringify({ 
            aspectTypeId: risk.aspectType,
            aspectTypeFound: !!selectedAspectTypes
          }),
        );
      }

      if (!!risk.act) {
        const findAct = await this.actModel
          .findOne({
            _id: risk.act,
            deleted: false,
          })
          .select('_id name');

        selectedAct = findAct;
        this.logger.debug(
          `traceId=${traceId} - Processed act`,
          JSON.stringify({ 
            actId: risk.act,
            actFound: !!selectedAct
          }),
        );
      }

      this.logger.debug(
        `traceId=${traceId} - Starting processing of location, entity and users`,
        JSON.stringify({ 
          hasLocationId: !!risk.locationId,
          hasEntityId: !!risk.entityId,
          hasAssessmentTeam: !!risk.assesmentTeam,
          hasReviewers: !!risk.reviewers,
          hasApprovers: !!risk.approvers
        }),
      );

      if (!!risk.locationId) {
        location = await this.prisma.location.findUnique({
          where: {
            id: risk.locationId,
          },
          select: {
            id: true,
            locationName: true,
          },
        });
        this.logger.debug(
          `traceId=${traceId} - Processed location`,
          JSON.stringify({ 
            locationId: risk.locationId,
            locationFound: !!location
          }),
        );
      }

      if (!!risk.entityId) {
        entity = await this.prisma.entity.findUnique({
          where: {
            id: risk.entityId,
          },
          select: {
            id: true,
            entityName: true,
          },
        });
        this.logger.debug(
          `traceId=${traceId} - Processed entity`,
          JSON.stringify({ 
            entityId: risk.entityId,
            entityFound: !!entity
          }),
        );
      }

      if (!!risk.assesmentTeam) {
        assesmentTeam = await this.prisma.user.findMany({
          where: {
            id: { in: risk.assesmentTeam },
          },
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
          },
        });
        assesmentTeam = assesmentTeam?.map((item) => ({
          ...item,
          label: item.username,
          value: item.id,
        }));

        this.logger.debug(
          `traceId=${traceId} - Processed assessment team`,
          JSON.stringify({ 
            assessmentTeamIdsCount: risk.assesmentTeam?.length,
            assessmentTeamFound: assesmentTeam?.length
          }),
        );
      }

      if (risk.reviewers && risk.reviewers.length > 0) {
        const validReviewers = risk.reviewers.filter((id) => id !== null);

        this.logger.debug(
          `traceId=${traceId} - Processing reviewers`,
          JSON.stringify({ 
            totalReviewers: risk.reviewers?.length,
            validReviewers: validReviewers?.length
          }),
        );

        if (validReviewers.length > 0) {
          riskReviewers = await this.prisma.user.findMany({
            where: {
              id: { in: validReviewers },
            },
            select: {
              id: true,
              username: true,
              email: true,
              firstname: true,
              lastname: true,
              avatar: true,
            },
          });
          riskReviewers = riskReviewers?.map((item) => ({
            ...item,
            label: item.username,
            value: item.id,
          }));
          this.logger.debug(
            `traceId=${traceId} - Processed reviewers`,
            JSON.stringify({ 
              reviewersFound: riskReviewers?.length
            }),
          );
        }
      }
      if (!!risk.approvers && risk.approvers.length > 0) {
        const validApprovers = risk.approvers.filter((id) => id !== null);

        this.logger.debug(
          `traceId=${traceId} - Processing approvers`,
          JSON.stringify({ 
            totalApprovers: risk.approvers?.length,
            validApprovers: validApprovers?.length
          }),
        );

        if (validApprovers.length > 0) {
          riskApprovers = await this.prisma.user.findMany({
            where: {
              id: { in: risk.approvers },
            },
            select: {
              id: true,
              username: true,
              email: true,
              firstname: true,
              lastname: true,
              avatar: true,
            },
          });
          riskApprovers = riskApprovers?.map((item) => ({
            ...item,
            label: item.username,
            value: item.id,
          }));
          this.logger.debug(
            `traceId=${traceId} - Processed approvers`,
            JSON.stringify({ 
              approversFound: riskApprovers?.length
            }),
          );
        }
      }

      // if (!!risk.section) {
      //   section = await this.prisma.section.findUnique({
      //     where: {
      //       id: risk.section,
      //     },
      //     select: {
      //       id: true,
      //       name: true,
      //     },
      //   });
      // }

      this.logger.debug(
        `traceId=${traceId} - Constructing final risk data response`,
        JSON.stringify({ 
          id: risk._id,
          status: risk.status,
          hasLocation: !!location,
          hasEntity: !!entity,
          hasConditions: !!selectedCondtions,
          hasInterestedParties: !!selectedInterestedParties,
          hasImpactType: !!selectedImpactTypes,
          hasAspectType: !!selectedAspectTypes,
          hasAct: !!selectedAct,
          hasAssessmentTeam: !!assesmentTeam,
          hasReviewers: !!riskReviewers,
          hasApprovers: !!riskApprovers,
          mitigationsCount: risk.mitigations?.length,
          attachmentsCount: risk.attachments?.length
        }),
      );

      const riskData = {
        _id: risk._id,
        status: risk.status,
        jobTitle: risk.jobTitle, // this is lifecycle stage
        hiraConfigId: risk?.hiraConfigId?._id,
        riskConfigData: {
          hiraMatrixData: risk?.hiraConfigId?.hiraMatrixData,
          // riskFactorial: risk?.hiraConfigId?.riskFactorial,
          riskLevelData: risk?.hiraConfigId?.riskLevelData,
          hiraMatrixHeader: risk?.hiraConfigId?.hiraMatrixHeader,
        },
        location: location,
        entity: entity,
        section: risk.section,
        specificEnvImpact: risk.specificEnvImpact,
        specificEnvAspect: risk.specificEnvAspect,
        // jobBasicStep: risk.jobBasicStep,
        existingControl: risk.existingControl,
        riskCategory: risk?.hiraConfigId?.riskCategory,
        // riskType: selectedRiskTypes || null,
        // condition: selectedCondtions || null,
        // dateOfIdentification: risk.dateOfIdentification,
        // area: risk.area,
        activity: risk.activity,
        // description: risk.description,
        impactType: selectedImpactTypes || null,
        aspectType: selectedAspectTypes || null,
        act: selectedAct || null,
        condition: selectedCondtions,
        interestedParties: selectedInterestedParties,
        riskImpact: risk.riskImpact,
        createdBy: risk.createdBy,
        updatedBy: risk.updatedBy,
        reference: risk.references,
        createdAt: risk.createdAt,
        updatedAt: risk.updatedAt,
        mitigations: risk.mitigations,
        preMitigation: risk.preMitigation || null,
        postMitigation: risk.postMitigation || null,
        preMitigationScore: risk.preMitigationScore || null,
        postMitigationScore: risk.postMitigationScore || null,
        preProbability: risk.preProbability || 1,
        preSeverity: risk.preSeverity || 1,
        postProbability: risk.postProbability || 1,
        postSeverity: risk.postSeverity || 1,
        attachments: risk.attachments || [],
        legalImpact: risk.legalImpact || 'No',
        riskReviewers: !!riskReviewers ? riskReviewers?.[0] : [],
        riskApprovers: !!riskApprovers ? riskApprovers?.[0] : [],
        assesmentTeam: !!assesmentTeam ? assesmentTeam : [],
        prefixSuffix: risk.prefixSuffix,
        additionalAssessmentTeam: risk.additionalAssessmentTeam || '',
      };

      this.logger.debug(
        `traceId=${traceId} - findOne completed successfully`,
        JSON.stringify({ 
          id,
          riskDataStatus: riskData.status,
          riskDataJobTitle: riskData.jobTitle
        }),
      );

      this.logger.log(
        `trace id=${traceId} GET /aspect-impact/:id   payload data ${id} service successful`,
        '',
      );

      return riskData;
    } catch (err) {
      this.logger.error(
        `traceId=${traceId} - findOne failed with error: ${err.message}`,
        JSON.stringify({ 
          aspectImpactId: id
        }),
      );
      throw new InternalServerErrorException(err);
    }
  }

  // async findOne(id: string) {
  //   try {
  //     let location, entity, selectedImpactTypes, selectedAspectTypes, selectedAct, selectedCondtions, selectedInterestedParties;
  //     let assesmentTeam, riskReviewers, riskApprovers;
  
  //     // Fetch the risk document (without populating hiraConfigId)
  //     const risk = await this.aspImpModel.findById(id).populate({
  //       path: 'mitigations',
  //       model: 'AiMitigation',
  //     }).lean() as any;
  
  //     if (!risk) {
  //       throw new NotFoundException('Risk not found');
  //     }
  
  //     // ✅ Fetch config data from aspImpConfigModel (Correct HIRA config retrieval)
  //     const aspImpConfig = await this.aspImpConfigModel.findOne({
  //       organizationId: risk.organizationId,
  //       deleted: false,
  //     }).lean();
  
  //     if (aspImpConfig) {
  //       selectedCondtions = aspImpConfig.condition?.find((item: any) => item._id.toString() === risk.condition) || null;
  
  //       if (Array.isArray(risk.interestedParties)) {
  //         selectedInterestedParties = aspImpConfig.interestedParties?.filter((item: any) => risk.interestedParties.includes(item._id.toString())) || [];
  //       }
  //     }
  
  //     // Fetch dependent records in parallel to improve performance
  //     const [
  //       findImpactType,
  //       findAspectType,
  //       findAct,
  //       locationData,
  //       entityData,
  //       assesmentTeamData,
  //       riskReviewersData,
  //       riskApproversData
  //     ] = await Promise.all([
  //       risk.impactType ? this.impactTypeModel.findOne({ _id: risk.impactType, deleted: false }).select('_id name') : null,
  //       risk.aspectType ? this.aspectTypeModel.findOne({ _id: risk.aspectType, deleted: false }).select('_id name') : null,
  //       risk.act ? this.actModel.findOne({ _id: risk.act, deleted: false }).select('_id name') : null,
  //       risk.locationId ? this.prisma.location.findUnique({ where: { id: risk.locationId }, select: { id: true, locationName: true } }) : null,
  //       risk.entityId ? this.prisma.entity.findUnique({ where: { id: risk.entityId }, select: { id: true, entityName: true } }) : null,
  //       risk.assesmentTeam?.length ? this.prisma.user.findMany({ where: { id: { in: risk.assesmentTeam } }, select: { id: true, username: true, email: true, firstname: true, lastname: true, avatar: true } }) : [],
  //       risk.reviewers?.length ? this.prisma.user.findMany({ where: { id: { in: risk.reviewers.filter((id) => id !== null) } }, select: { id: true, username: true, email: true, firstname: true, lastname: true, avatar: true } }) : [],
  //       risk.approvers?.length ? this.prisma.user.findMany({ where: { id: { in: risk.approvers.filter((id) => id !== null) } }, select: { id: true, username: true, email: true, firstname: true, lastname: true, avatar: true } }) : []
  //     ]);
  
  //     // Process user-related data
  //     const processUserList = (users) => users.map((item) => ({
  //       ...item,
  //       label: item.username,
  //       value: item.id,
  //     }));
  
  //     assesmentTeam = processUserList(assesmentTeamData);
  //     riskReviewers = processUserList(riskReviewersData);
  //     riskApprovers = processUserList(riskApproversData);
  
  //     // Construct final response object
  //     const riskData = {
  //       _id: risk._id,
  //       status: risk.status,
  //       jobTitle: risk.jobTitle, // Lifecycle stage
  //       hiraConfigId: aspImpConfig?._id, // ✅ Correct config reference
  //       riskConfigData: aspImpConfig ? {
  //         hiraMatrixData: aspImpConfig.hiraMatrixData,
  //         riskLevelData: aspImpConfig.riskLevelData,
  //         hiraMatrixHeader: aspImpConfig.hiraMatrixHeader,
  //       } : null,
  //       location: locationData,
  //       entity: entityData,
  //       section: risk.section,
  //       specificEnvImpact: risk.specificEnvImpact,
  //       specificEnvAspect: risk.specificEnvAspect,
  //       existingControl: risk.existingControl,
  //       riskCategory: aspImpConfig?.riskCategory || null,
  //       activity: risk.activity,
  //       impactType: findImpactType || null,
  //       aspectType: findAspectType || null,
  //       act: findAct || null,
  //       condition: selectedCondtions,
  //       interestedParties: selectedInterestedParties,
  //       riskImpact: risk.riskImpact,
  //       createdBy: risk.createdBy,
  //       updatedBy: risk.updatedBy,
  //       reference: risk.references,
  //       createdAt: risk.createdAt,
  //       updatedAt: risk.updatedAt,
  //       mitigations: risk.mitigations,
  //       preMitigation: risk.preMitigation || null,
  //       postMitigation: risk.postMitigation || null,
  //       preMitigationScore: risk.preMitigationScore || null,
  //       postMitigationScore: risk.postMitigationScore || null,
  //       preProbability: risk.preProbability || 1,
  //       preSeverity: risk.preSeverity || 1,
  //       postProbability: risk.postProbability || 1,
  //       postSeverity: risk.postSeverity || 1,
  //       attachments: risk.attachments || [],
  //       legalImpact: risk.legalImpact || 'No',
  //       riskReviewers: riskReviewers.length ? riskReviewers[0] : [],
  //       riskApprovers: riskApprovers.length ? riskApprovers[0] : [],
  //       assesmentTeam,
  //       prefixSuffix: risk.prefixSuffix,
  //       additionalAssessmentTeam: risk.additionalAssessmentTeam || '',
  //     };
  
  //     this.logger.log(`trace id=${uuid()} GET /aspect-impact/:id payload data ${id} service successful`, '');
  //     return riskData;
  //   } catch (err) {
  //     this.logger.error(`trace id=${uuid()}, GET /aspect-impact/:id payload id ${id} failed with error ${err} `);
  //     throw new InternalServerErrorException(err);
  //   }
  // }
  

  async update(id: string, data: any, user) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting update`,
      JSON.stringify({ 
        aspectImpactId: id,
        dataKeys: Object.keys(data || {}),
        userId: user?.user?.id
      }),
    );

    try {
      // Input validation
      if (!id || !data || !user) {
        this.logger.debug(
          `traceId=${traceId} - Input validation failed`,
          JSON.stringify({ 
            id: !!id, 
            data: !!data, 
            user: !!user 
          }),
        );
        throw new Error('Invalid input: id, data, or user is missing');
      }

      this.logger.debug(
        `traceId=${traceId} - Fetching activeUser for kcId=${user?.user?.id}`,
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - ActiveUser fetched`,
        JSON.stringify({ 
          activeUserFound: !!activeUser,
          activeUsername: activeUser?.username
        }),
      );

      const auditTrail = await auditTrial(
        'aspectimpacts',
        'Aspect And Impact',
        'Aspect Impact Records',
        user.user,
        activeUser,
        "",
      );

      this.logger.debug(
        `traceId=${traceId} - Audit trail created, updating record with delay`,
      );

      setTimeout(async () => {
        this.logger.debug(
          `traceId=${traceId} - Executing update operation`,
          JSON.stringify({ 
            aspectImpactId: id,
            updatedBy: activeUser?.username
          }),
        );

        const result = await this.aspImpModel.findByIdAndUpdate(id, {
          ...data,
          updatedBy: activeUser.username,
        });

        this.logger.debug(
          `traceId=${traceId} - Update operation completed`,
          JSON.stringify({ 
            aspectImpactId: id,
            updateSuccessful: !!result
          }),
        );

        this.logger.log(
          `trace id=${traceId} PUT /aspect-impact/:id   payload data ${id} service successful`,
          '',
        );

        return result;
      }, 1000);
    } catch (err) {
      this.logger.error(
        `traceId=${traceId} - update failed with error: ${err.message}`,
        JSON.stringify({ 
          aspectImpactId: id,
          userId: user?.user?.id
        }),
      );
      throw new InternalServerErrorException(err);
    }
  }

  async delete(id: string, user) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting delete`,
      JSON.stringify({ 
        aspectImpactId: id,
        userId: user?.user?.id
      }),
    );

    try {
      // Input validation
      if (!id || !user) {
        this.logger.debug(
          `traceId=${traceId} - Input validation failed`,
          JSON.stringify({ 
            id: !!id, 
            user: !!user 
          }),
        );
        throw new Error('Invalid input: id or user is missing');
      }

      this.logger.debug(
        `traceId=${traceId} - Fetching activeUser for kcId=${user?.user?.id}`,
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - ActiveUser fetched`,
        JSON.stringify({ 
          activeUserFound: !!activeUser,
          activeUsername: activeUser?.username
        }),
      );

      const auditTrail = await auditTrial(
        'aspectimpacts',
        'Aspect And Impact',
        'Aspect Impact Records',
        user.user,
        activeUser,
        "",
      );

      this.logger.debug(
        `traceId=${traceId} - Audit trail created, deleting record with delay`,
      );

      setTimeout(async () => {
        this.logger.debug(
          `traceId=${traceId} - Executing delete operation`,
          JSON.stringify({ 
            aspectImpactId: id
          }),
        );

        const result = await this.aspImpModel.findByIdAndDelete(id);

        this.logger.debug(
          `traceId=${traceId} - Delete operation completed`,
          JSON.stringify({ 
            aspectImpactId: id,
            deleteSuccessful: !!result
          }),
        );

        this.logger.log(
          `trace id=${traceId} DELETE /aspect-impact/:id   payload data ${id} service successful`,
          '',
        );
        return result;
      }, 1000);
    } catch (err) {
      this.logger.error(
        `traceId=${traceId} - delete failed with error: ${err.message}`,
        JSON.stringify({ 
          aspectImpactId: id,
          userId: user?.user?.id
        }),
      );
      throw new InternalServerErrorException(err);
    }
  }

  //not in use
  async closeRisk(id: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting closeRisk`,
      JSON.stringify({ 
        aspectImpactId: id
      }),
    );

    try {
      // Input validation
      if (!id) {
        this.logger.debug(
          `traceId=${traceId} - Input validation failed`,
          JSON.stringify({ id: !!id }),
        );
        throw new Error('Invalid input: id is missing');
      }

      this.logger.debug(
        `traceId=${traceId} - Executing close risk operation`,
        JSON.stringify({ 
          aspectImpactId: id,
          newStatus: 'CLOSED',
          closeDate: new Date().toISOString()
        }),
      );

      const result = await this.aspImpModel.findByIdAndUpdate(id, {
        status: 'CLOSED',
        closeDate: new Date(),
      });

      this.logger.debug(
        `traceId=${traceId} - closeRisk completed successfully`,
        JSON.stringify({ 
          aspectImpactId: id,
          closeSuccessful: !!result
        }),
      );

      return result;
    } catch (err) {
      this.logger.error(
        `traceId=${traceId} - closeRisk failed with error: ${err.message}`,
        JSON.stringify({ 
          aspectImpactId: id
        }),
      );
      throw new InternalServerErrorException();
    }
  }
  async addMitigation(data: any, user: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting addMitigation`,
      JSON.stringify({ 
        dataKeys: Object.keys(data || {}),
        riskId: data?.riskId,
        userId: user?.user?.id,
        mitigationStage: data?.mitigationData?.stage
      }),
    );

    try {
      // Input validation
      if (!data || !user) {
        this.logger.debug(
          `traceId=${traceId} - Input validation failed`,
          JSON.stringify({ 
            data: !!data, 
            user: !!user 
          }),
        );
        throw new Error('Invalid input: data or user is missing');
      }

      this.logger.debug(
        `traceId=${traceId} - Fetching activeUser for kcId=${user?.user?.id}`,
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - ActiveUser fetched`,
        JSON.stringify({ 
          activeUserFound: !!activeUser,
          activeUsername: activeUser?.username
        }),
      );

      const auditTrail = await auditTrial(
        'aimitigations',
        'Aspect And Impact',
        'AI Mitigation',
        user.user,
        activeUser,
        "",
      );

      this.logger.debug(
        `traceId=${traceId} - Audit trail created`,
      );

      // 1. Create a new mitigation
      const { riskId, mitigationData } = data;

      this.logger.debug(
        `traceId=${traceId} - Extracted mitigation data`,
        JSON.stringify({ 
          riskId,
          mitigationStage: mitigationData?.stage,
          hasMitigationData: !!mitigationData
        }),
      );

      let finalData = {
        ...mitigationData,
        mitigationStatus: 'active',
        revisionNumber: 0,
      };

      if (mitigationData?.stage === 'Completed') {
        this.logger.debug(
          `traceId=${traceId} - Processing completion date for completed mitigation`,
          JSON.stringify({ 
            completionDate: mitigationData?.completionDate
          }),
        );

        let date = moment(mitigationData?.completionDate, 'DD/MM/YYYY');
        if (date.isValid()) {
          finalData = {
            ...finalData,
            completionDate: date?.toDate(),
          };
        } else {
          this.logger.debug(
            `traceId=${traceId} - Invalid completion date format`,
            JSON.stringify({ 
              completionDate: mitigationData?.completionDate
            }),
          );
          throw new Error('Invalid completion date format');
        }
      } else {
        this.logger.debug(
          `traceId=${traceId} - Processing target date for in-progress mitigation`,
          JSON.stringify({ 
            targetDate: mitigationData?.targetDate
          }),
        );

        let date = moment(mitigationData?.targetDate, 'DD/MM/YYYY');
        if (date.isValid()) {
          finalData = {
            ...finalData,
            targetDate: date?.toDate(),
          };
        } else {
          this.logger.debug(
            `traceId=${traceId} - Invalid target date format`,
            JSON.stringify({ 
              targetDate: mitigationData?.targetDate
            }),
          );
          throw new Error('Invalid target date format');
        }
      }

      this.logger.debug(
        `traceId=${traceId} - Creating new mitigation`,
        JSON.stringify({ 
          mitigationStatus: finalData.mitigationStatus,
          revisionNumber: finalData.revisionNumber
        }),
      );

      const newMitigation = await this.aspImpMitigationModel.create(finalData);

      this.logger.debug(
        `traceId=${traceId} - Mitigation created, updating risk record`,
        JSON.stringify({ 
          newMitigationId: newMitigation._id,
          riskId
        }),
      );

      // 2. Update the associated risk by pushing the new mitigation's ObjectId
      await this.aspImpModel.findByIdAndUpdate(riskId, {
        $push: { mitigations: newMitigation._id },
      });

      this.logger.debug(
        `traceId=${traceId} - addMitigation completed successfully`,
        JSON.stringify({ 
          mitigationId: newMitigation._id,
          riskId
        }),
      );

      this.logger.log(
        `trace id=${traceId} POST /aspect-impact/addMitigation  data data ${data} service successful`,
        '',
      );
      return newMitigation;
    } catch (error) {
      this.logger.error(
        `traceId=${traceId} - addMitigation failed with error: ${error.message}`,
        JSON.stringify({ 
          riskId: data?.riskId,
          userId: user?.user?.id
        }),
      );
      throw new InternalServerErrorException(error);
    }
  }

  async updateMitigation(mitigationId: any, updatedData: any, user: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting updateMitigation`,
      JSON.stringify({ 
        mitigationId,
        updatedDataKeys: Object.keys(updatedData || {}),
        userId: user?.user?.id,
        hasTargetDate: !!updatedData?.targetDate,
        hasCompletionDate: !!updatedData?.completionDate
      }),
    );

    try {
      // Input validation
      if (!mitigationId || !updatedData || !user) {
        this.logger.debug(
          `traceId=${traceId} - Input validation failed`,
          JSON.stringify({ 
            mitigationId: !!mitigationId,
            updatedData: !!updatedData, 
            user: !!user 
          }),
        );
        throw new Error('Invalid input: mitigationId, updatedData, or user is missing');
      }

      this.logger.debug(
        `traceId=${traceId} - Fetching activeUser for kcId=${user?.user?.id}`,
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - ActiveUser fetched`,
        JSON.stringify({ 
          activeUserFound: !!activeUser,
          activeUsername: activeUser?.username
        }),
      );

      const auditTrail = await auditTrial(
        'aimitigations',
        'Aspect And Impact',
        'AI Mitigation',
        user.user,
        activeUser,
        "",
      );

      this.logger.debug(
        `traceId=${traceId} - Audit trail created, finding existing mitigation`,
      );

      // 1. Find the mitigation by its ID
      const existingMitigation = await this.aspImpMitigationModel.findById(
        mitigationId,
      );

      if (!existingMitigation) {
        this.logger.debug(
          `traceId=${traceId} - Mitigation not found`,
          JSON.stringify({ mitigationId }),
        );
        throw new Error('Mitigation not found');
      }

      this.logger.debug(
        `traceId=${traceId} - Existing mitigation found, processing date fields`,
        JSON.stringify({ 
          mitigationId,
          existingMitigationStatus: existingMitigation.mitigationStatus
        }),
      );

      // 2. Update the mitigation with the new data
      // Convert targetDate from 'DD/MM/YYYY' to a Date object if it exists
      if (updatedData.targetDate) {
        this.logger.debug(
          `traceId=${traceId} - Processing target date`,
          JSON.stringify({ 
            originalTargetDate: updatedData.targetDate
          }),
        );

        const formattedTargetDate = moment(
          updatedData.targetDate,
          'DD/MM/YYYY',
        ).toDate();
        updatedData.targetDate = formattedTargetDate;
      }

      // Convert completionDate from 'DD/MM/YYYY' to a Date object if it exists
      if (updatedData.completionDate) {
        this.logger.debug(
          `traceId=${traceId} - Processing completion date`,
          JSON.stringify({ 
            originalCompletionDate: updatedData.completionDate
          }),
        );

        const formattedCompletionDate = moment(
          updatedData.completionDate,
          'DD/MM/YYYY',
        ).toDate();
        updatedData.completionDate = formattedCompletionDate;
      }

      this.logger.debug(
        `traceId=${traceId} - Executing mitigation update`,
        JSON.stringify({ 
          mitigationId,
          updatedDataKeys: Object.keys(updatedData)
        }),
      );

      const updatedMitigation =
        await this.aspImpMitigationModel.findByIdAndUpdate(
          mitigationId,
          { ...updatedData },
          { new: true },
        );

      this.logger.debug(
        `traceId=${traceId} - updateMitigation completed successfully`,
        JSON.stringify({ 
          mitigationId,
          updateSuccessful: !!updatedMitigation
        }),
      );

      this.logger.log(
        `trace id=${traceId} POST /aspect-impact/updateMitigation  data mitigationId ${mitigationId} service successful`,
        '',
      );

      return updatedMitigation;
    } catch (error) {
      this.logger.error(
        `traceId=${traceId} - updateMitigation failed with error: ${error.message}`,
        JSON.stringify({ 
          mitigationId,
          userId: user?.user?.id
        }),
      );
      throw new InternalServerErrorException(error);
    }
  }

  async addComment(data: any, userId: any) {
    try {
      const newComment = new this.aspImpReviewCommentsModal(data);
      // ////////////console.log('newComment', newComment);
      await newComment.save();
      const test = await this.aspImpReviewCommentsModal.find();
      this.logger.log(
        `trace id=${uuid()} POST /aspect-impact/addComment  data data ${data} service successful`,
        '',
      );
      return newComment;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, POST /aspect-impact/addComment  $payload data ${data}  failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async findAllCommentsByRiskId(riskId: any) {
    try {
      const comments = await this.aspImpReviewCommentsModal
      .find({
        riskId: riskId,
      })
      .sort({ createdAt: 1 })
      .lean();

    // Extract all unique userId values from the comments data
    const userIds = [...new Set(comments.map((comment) => comment.userId))];

    // Fetch all user details that match the userId values in the comments data
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstname: true, lastname: true, avatar: true },
    });

    //////console.log('users', users);

    // Map over the comments data and add the corresponding user details to each comment
    const commentsWithUserDetails = comments.map((comment) => {
      const matchingUser = users.find((user) => user.id === comment.userId);
      return {
        ...comment,
        ...matchingUser,
      };
    });

    this.logger.log(
      `trace id=${uuid()} GET /aspect-impact/getallcomments  data riskId ${riskId} service successful`,
      '',
    );
    return commentsWithUserDetails;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET /aspect-impact/getallcomments/:riskId  $payload riskId ${riskId}  failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  
  }

  async getAllUser(query, userId) {
    try {
      const { search } = query;

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });
      const result = await this.prisma.user.findMany({
        where: {
          AND: [
            { organizationId: activeUser.organizationId },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          username: true,
          email: true,
          firstname: true,
          lastname: true,
          avatar: true,
        },
      });
      this.logger.log(
        `trace id=${uuid()} GET /aspect-impact/addcommegetAllUserntsbulk  data query ${query} service successful`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET /aspect-impact/getAllUser/ $payload query ${query}  failed with error ${error} `,
      );
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //not in use
  async updateReviewers(riskId: any, data: any, userId: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting updateReviewers`,
      JSON.stringify({ 
        riskId,
        dataKeys: Object.keys(data || {}),
        reviewersCount: data?.reviewers?.length,
        userId,
        hasComment: !!data?.comment
      }),
    );

    try {
      // Input validation
      if (!riskId || !data || !userId) {
        this.logger.debug(
          `traceId=${traceId} - Input validation failed`,
          JSON.stringify({ 
            riskId: !!riskId,
            data: !!data, 
            userId: !!userId 
          }),
        );
        throw new Error('Invalid input: riskId, data, or userId is missing');
      }

      this.logger.debug(
        `traceId=${traceId} - Fetching activeUser for kcId=${userId}`,
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - ActiveUser fetched`,
        JSON.stringify({ 
          activeUserFound: !!activeUser,
          activeUsername: activeUser?.username
        }),
      );

      this.logger.debug(
        `traceId=${traceId} - Updating risk record with reviewers`,
        JSON.stringify({ 
          riskId,
          reviewersCount: data?.reviewers?.length
        }),
      );

      const result = await this.aspImpModel.findByIdAndUpdate(riskId, {
        ...data,
        updatedBy: activeUser.username,
      });

      this.logger.debug(
        `traceId=${traceId} - Risk updated, fetching reviewer emails`,
        JSON.stringify({ 
          riskId,
          updateSuccessful: !!result,
          reviewersCount: data?.reviewers?.length
        }),
      );

      const userEmails = await this.prisma.user.findMany({
        where: {
          id: { in: data.reviewers },
        },
        select: {
          email: true,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - Reviewer emails fetched, sending notifications`,
        JSON.stringify({ 
          reviewerEmailsCount: userEmails?.length,
          mailSystem: process.env.MAIL_SYSTEM
        }),
      );

      // Send email to all users
      for (const userEmail of userEmails) {
        this.logger.debug(
          `traceId=${traceId} - Sending email to reviewer`,
          JSON.stringify({ 
            recipientEmail: userEmail.email
          }),
        );

        if (process.env.MAIL_SYSTEM === 'IP_BASED') {
          const result = await this.emailService.sendEmail(
            userEmail.email,
            'Risk Review Update',
            `Risk Review Update
           Comment : ${data.comment}`,
          );
        } else {
          try {
            await sgMail.send({
              to: userEmail.email, // recipient email
              from: process.env.FROM, // sender email
              subject: 'Risk Review Update',
              html: `<div>Risk Review Update</div>
                  <div>Comment : ${data.comment}</div>
                  
                  `,
            });
          } catch (error) {
            this.logger.debug(
              `traceId=${traceId} - Email sending failed for reviewer`,
              JSON.stringify({ 
                recipientEmail: userEmail.email,
                error: error.message
              }),
            );
            throw error;
          }
        }
      }

      this.logger.debug(
        `traceId=${traceId} - updateReviewers completed successfully`,
        JSON.stringify({ 
          riskId,
          emailsSent: userEmails?.length
        }),
      );

    } catch (error) {
      this.logger.error(
        `traceId=${traceId} - updateReviewers failed with error: ${error.message}`,
        JSON.stringify({ 
          riskId,
          userId,
          reviewersCount: data?.reviewers?.length
        }),
      );
      throw new InternalServerErrorException(error);
    }
  }

  async findAllUsersByLocation(locationId: any) {
    try {
      let whereCondtion = {};
      if (!!locationId) {
        whereCondtion = {
          locationId: locationId,
        };
      }
      const users = await this.prisma.user.findMany({
        where: {
          ...whereCondtion,
        },
        select: {
          id: true,
          username: true,
          email: true,
          firstname: true,
          lastname: true,
          avatar: true,
        },
      });
      //////console.log('users by location', users);

      return users;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, PATCH /aspect-impact/users/:locationId  $payload riskId ${locationId}  failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async addCommentsBulk(data: any[], userId: any) {
    try {
      const newComments = await this.aspImpReviewCommentsModal.insertMany(
        data.map((item) => ({
          ...item,
          userId,
        })),
      );
      this.logger.log(
        `trace id=${uuid()} POST /aspect-impact/addcommentsbulk  data entityId ${data} service successful`,
        '',
      );
      return newComments;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, POST /aspect-impact/addcommentsbulk  $payload data ${data}  failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getAllJobTitles(orgId: any, entityId: any) {
    try {
      let list = await this.aspImpModel.find(
        { organizationId: orgId, entityId: entityId },
        '_id jobTitle activity',
      );

      const uniqueJobTitles = [];
      const seenTitles = new Set();

      list.forEach((item) => {
        if (!seenTitles.has(item.jobTitle)) {
          seenTitles.add(item.jobTitle);
          uniqueJobTitles.push(item);
        }
      });

      this.logger.log(
        `trace id=${uuid()} GET /aspect-impact/getAllJobTitles  payload entityId ${entityId} service successful`,
        '',
      );
      return uniqueJobTitles;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET /aspect-impact/getAllJobTitles  $payload orgId ${orgId}  failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getAllJobTitlesWithDetails(orgId: any, entityId: any) {
    try {
      // Fetch job titles along with activity from aspImpModel
      const jobTitlesList = await this.aspImpModel.find(
        { organizationId: orgId, entityId: entityId },
        '_id jobTitle activity organizationId entityId locationId impactType aspectType act condition interestedParties specificEnvImpact specificEnvAspect existingControl riskImpact createdBy updatedBy references createdAt updatedAt attachments legalImpact prefixSuffix additionalAssessmentTeam status assesmentTeam'
      ).lean();
  
      if (!jobTitlesList.length) {
        throw new NotFoundException('No job titles found for the given entity.');
      }
  
      // ✅ Fetch config data from aspImpConfigModel (Correct HIRA config retrieval)
      const aspImpConfig = await this.aspImpConfigModel.findOne({
        organizationId: orgId,
        deleted: false,
      }).lean();
  
      // ✅ Extract unique job titles
      const uniqueJobTitlesMap = new Map();
      jobTitlesList.forEach((item) => {
        if (!uniqueJobTitlesMap.has(item.jobTitle)) {
          uniqueJobTitlesMap.set(item.jobTitle, item);
        }
      });
  
      const uniqueJobTitles = Array.from(uniqueJobTitlesMap.values());
  
      // ✅ Fetch dependent records in parallel to improve performance
      const locationIds = [...new Set(uniqueJobTitles.map((item) => item.locationId).filter(Boolean))];
      const entityIds = [...new Set(uniqueJobTitles.map((item) => item.entityId).filter(Boolean))];
      const impactTypeIds = [...new Set(uniqueJobTitles.map((item) => item.impactType).filter(Boolean))];
      const aspectTypeIds = [...new Set(uniqueJobTitles.map((item) => item.aspectType).filter(Boolean))];
      const actIds = [...new Set(uniqueJobTitles.map((item) => item.act).filter(Boolean))];
      const userIds = [
        ...new Set(
          uniqueJobTitles.flatMap((item) => [
            item.createdBy,
            item.updatedBy,
            ...(item.interestedParties || []),
            ...(item.assesmentTeam || []),
          ]).filter(Boolean)
        ),
      ];
  
      const [
        locationsData,
        entitiesData,
        impactTypesData,
        aspectTypesData,
        actsData,
        usersData,
      ]  = await Promise.all([
        locationIds.length ? this.prisma.location.findMany({ where: { id: { in: locationIds } }, select: { id: true, locationName: true } }) : [],
        entityIds.length ? this.prisma.entity.findMany({ where: { id: { in: entityIds } }, select: { id: true, entityName: true } }) : [],
        impactTypeIds.length ? this.impactTypeModel.find({ _id: { $in: impactTypeIds }, deleted: false }).select('_id name') : [],
        aspectTypeIds.length ? this.aspectTypeModel.find({ _id: { $in: aspectTypeIds }, deleted: false }).select('_id name') : [],
        actIds.length ? this.actModel.find({ _id: { $in: actIds }, deleted: false }).select('_id name') : [],
        userIds.length ? this.prisma.user.findMany({ 
          where: { 
            id: { 
              in: userIds?.filter(id => 
                typeof id === 'string' && 
                !id.includes('@') && 
                !id.includes(' ') && 
                !id.includes('{') && 
                !id.includes('}') &&
                id.length > 0
              ) 
            } 
          }, 
          select: { id: true, username: true, email: true, firstname: true, lastname: true, avatar: true } 
        }) : [],
      ]);
  
      // ✅ Create lookup maps for efficient access
      const locationMap = new Map<any,any>(locationsData.map((loc) => [loc.id, loc] as any));
      const entityMap = new Map<any,any>(entitiesData.map((ent) => [ent.id, ent] as any));
      const impactTypeMap = new Map<any,any>(impactTypesData.map((type) => [type._id.toString(), type] as any));
      const aspectTypeMap = new Map<any,any>(aspectTypesData.map((type) => [type._id.toString(), type] as any));
      const actMap = new Map<any,any>(actsData.map((act) => [act._id.toString(), act] as any));
      const userMap = new Map<any,any>(usersData.map((user) => [user.id, user] as any));
  
      // ✅ Process and structure the final response
      const response = uniqueJobTitles.map((job) => ({
        _id: job._id,
        status: job.status,
        jobTitle: job.jobTitle, // Lifecycle stage
        hiraConfigId: aspImpConfig?._id, // ✅ Correct config reference
        riskConfigData: aspImpConfig
          ? {
              hiraMatrixData: aspImpConfig.hiraMatrixData,
              riskLevelData: aspImpConfig.riskLevelData,
              hiraMatrixHeader: aspImpConfig.hiraMatrixHeader,
            }
          : null,
        location: locationMap.get(job.locationId) || null,
        entity: entityMap.get(job.entityId) || null,
        specificEnvImpact: job.specificEnvImpact,
        specificEnvAspect: job.specificEnvAspect,
        existingControl: job.existingControl,
        riskCategory: aspImpConfig?.riskCategory || null,
        activity: job.activity,
        impactType: impactTypeMap.get(job.impactType) || null,
        aspectType: aspectTypeMap.get(job.aspectType) || null,
        act: actMap.get(job.act) || null,
        condition: aspImpConfig?.condition?.find((item:any) => item._id.toString() === job.condition) || null,
        interestedParties: (job.interestedParties || []).map((id) => userMap.get(id) || null).filter(Boolean),
        assesmentTeam: (job.assesmentTeam || []).map((id) => userMap.get(id) || null).filter(Boolean),
        riskImpact: job.riskImpact,
        createdBy: userMap.get(job.createdBy) || null,
        updatedBy: userMap.get(job.updatedBy) || null,
        reference: job.references,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        preMitigation: job.preMitigation || null,
        postMitigation: job.postMitigation || null,
        preMitigationScore: job.preMitigationScore || null,
        postMitigationScore: job.postMitigationScore || null,
        preProbability: job.preProbability || 1,
        preSeverity: job.preSeverity || 1,
        postProbability: job.postProbability || 1,
        postSeverity: job.postSeverity || 1,
        attachments: job.attachments || [],
        legalImpact: job.legalImpact || 'No',
        prefixSuffix: job.prefixSuffix,
        additionalAssessmentTeam: job.additionalAssessmentTeam || '',
      }));
  
      this.logger.log(`trace id=${uuid()} GET /aspect-impact/getAllJobTitlesWithDetails entityId ${entityId} successful`, '');
      return response;
    } catch (error) {
      this.logger.error(`trace id=${uuid()}, GET /aspect-impact/getAllJobTitlesWithDetails orgId ${orgId} failed with error ${error}`);
      throw new InternalServerErrorException(error);
    }
  }
  

  async checkConsolidatedStatus(entityId: string, orgId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting checkConsolidatedStatus`,
      JSON.stringify({ 
        entityId,
        orgId
      }),
    );

    try {
      // Input validation
      if (!entityId || !orgId) {
        this.logger.debug(
          `traceId=${traceId} - Input validation failed`,
          JSON.stringify({ 
            entityId: !!entityId,
            orgId: !!orgId 
          }),
        );
        throw new Error('Invalid input: entityId or orgId is missing');
      }

      this.logger.debug(
        `traceId=${traceId} - Fetching consolidated status record`,
        JSON.stringify({ 
          entityId,
          orgId
        }),
      );

      const result = await this.aspImpConsolidatedStatusModel
        .findOne({
          entityId: entityId,
          organizationId: orgId,
        })
        .lean();

      if (!result) {
        this.logger.debug(
          `traceId=${traceId} - No consolidated status found, returning open status`,
          JSON.stringify({ 
            entityId,
            orgId
          }),
        );

        return {
          data: null,
          status: 'open',
          message: 'Hira Not yet submitted for review',
        };
      } else {
        this.logger.debug(
          `traceId=${traceId} - Consolidated status found, processing user details`,
          JSON.stringify({ 
            entityId,
            resultStatus: result.status,
            hasApprovedBy: !!result.approvedBy,
            hasReviewedBy: !!result.reviewedBy
          }),
        );

        let finalResponse: any = { ...result };
        let approvedByUserDetails, reviewedByUserDetails;

        if (result.approvedBy) {
          this.logger.debug(
            `traceId=${traceId} - Fetching approved by user details`,
            JSON.stringify({ 
              approvedBy: result.approvedBy
            }),
          );

          approvedByUserDetails = await this.prisma.user.findFirst({
            where: {
              id: result.approvedBy,
            },
            select: {
              id: true,
              username: true,
              email: true,
              firstname: true,
              lastname: true,
              avatar: true,
            },
          });
          finalResponse = {
            ...finalResponse, // Use finalResponse to keep it clean
            approvedByUserDetails,
          };
        }

        if (result.reviewedBy) {
          this.logger.debug(
            `traceId=${traceId} - Fetching reviewed by user details`,
            JSON.stringify({ 
              reviewedBy: result.reviewedBy
            }),
          );

          reviewedByUserDetails = await this.prisma.user.findFirst({
            where: {
              id: result.reviewedBy,
            },
            select: {
              id: true,
              username: true,
              email: true,
              firstname: true,
              lastname: true,
              avatar: true,
            },
          });
          finalResponse = {
            ...finalResponse, // Use finalResponse to keep it clean
            reviewedByUserDetails,
          };
        }

        this.logger.debug(
          `traceId=${traceId} - Fetching department details`,
          JSON.stringify({ 
            entityId
          }),
        );

        let departmentDetails;
        if (!!result) {
          departmentDetails = await this.prisma.entity.findUnique({
            where: {
              id: entityId,
            },
            select: {
              id: true,
              entityName: true,
            },
          });
        }

        this.logger.debug(
          `traceId=${traceId} - checkConsolidatedStatus completed successfully`,
          JSON.stringify({ 
            entityId,
            status: result.status,
            hasApprovedByDetails: !!approvedByUserDetails,
            hasReviewedByDetails: !!reviewedByUserDetails,
            hasDepartmentDetails: !!departmentDetails
          }),
        );

        this.logger.log(
          `trace id=${traceId} GET /aspect-impact/checkConsolidatedStatus  payload entityId ${entityId} service successful`,
          '',
        );
        // Convert Mongoose document to plain object
        return {
          data: {
            ...finalResponse,
            ...departmentDetails,
            // approvedByUserDetails,
            // reviewedByUserDetails,
          },
          status: result.status,
          message: 'Aspect Impact Found in Workflow',
        };
      }
    } catch (err) {
      this.logger.error(
        `traceId=${traceId} - checkConsolidatedStatus failed with error: ${err.message}`,
        JSON.stringify({ 
          entityId,
          orgId
        }),
      );
      throw new InternalServerErrorException(err);
    }
  }

  async createConsolidateEntry(body: any, entityId: string, orgId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting createConsolidateEntry`,
      JSON.stringify({ 
        entityId,
        orgId,
        bodyKeys: Object.keys(body || {}),
        reviewersCount: body?.reviewers?.length,
        approversCount: body?.approvers?.length,
        hasUrl: !!body?.url
      }),
    );

    try {
      // Input validation
      if (!body || !entityId || !orgId) {
        this.logger.debug(
          `traceId=${traceId} - Input validation failed`,
          JSON.stringify({ 
            body: !!body,
            entityId: !!entityId,
            orgId: !!orgId 
          }),
        );
        throw new Error('Invalid input: body, entityId, or orgId is missing');
      }

      const { reviewers, approvers, url } = body;
      let allAspectImpactIds = [];

      this.logger.debug(
        `traceId=${traceId} - Checking for existing entry`,
        JSON.stringify({ 
          entityId
        }),
      );

      // Check for existing entry with the same jobTitle
      const existingEntry: any =
        await this.aspImpConsolidatedStatusModel.findOne({
          entityId: entityId,
        });

      this.logger.debug(
        `traceId=${traceId} - Existing entry check completed`,
        JSON.stringify({ 
          entityId,
          hasExistingEntry: !!existingEntry,
          existingEntryId: existingEntry?._id
        }),
      );

      this.logger.debug(
        `traceId=${traceId} - Fetching aspect impacts by entity`,
        JSON.stringify({ 
          entityId
        }),
      );

      const fetchAllAspectImpactsByEntityId = await this.aspImpModel
        .find({
          entityId: entityId,
          status: 'active',
        })
        .select('_id mitigations');

      if (fetchAllAspectImpactsByEntityId?.length > 0) {
        allAspectImpactIds = fetchAllAspectImpactsByEntityId.map((item) =>
          item?._id?.toString(),
        );
      }

      this.logger.debug(
        `traceId=${traceId} - Aspect impacts fetched`,
        JSON.stringify({ 
          entityId,
          aspectImpactsCount: fetchAllAspectImpactsByEntityId?.length,
          aspectImpactIdsCount: allAspectImpactIds?.length
        }),
      );

      // Aggregate all mitigation IDs
      let allMitigationIds = [];
      if (fetchAllAspectImpactsByEntityId?.length > 0) {
        allMitigationIds = fetchAllAspectImpactsByEntityId
          .map((item) => item.mitigations)
          .flat()
          .filter((value, index, self) => self.indexOf(value) === index); // Unique IDs
      }

      this.logger.debug(
        `traceId=${traceId} - Mitigation IDs aggregated`,
        JSON.stringify({ 
          mitigationIdsCount: allMitigationIds?.length
        }),
      );

      let cycleNumber = 1; // Default cycle number

      if (existingEntry) {
        // If entry exists, determine the cycle number
        cycleNumber = existingEntry.workflow?.length
          ? existingEntry.workflow.length + 1
          : 1;
      }

      this.logger.debug(
        `traceId=${traceId} - Cycle number determined`,
        JSON.stringify({ 
          cycleNumber,
          hasExistingEntry: !!existingEntry,
          existingWorkflowLength: existingEntry?.workflow?.length
        }),
      );

      const data: any = {
        createdBy: body?.createdBy,
        status: 'IN_REVIEW',
        entityId: entityId,
        reviewStartedBy: body?.reviewStartedBy,
        reviewers: reviewers?.map((item: any) => item.id),
        approvers: approvers?.map((item: any) => item.id),
        organizationId: orgId,
        hiraRegisterIds: allAspectImpactIds,
        comments: body?.comments || [],
        workflowHistory: [
          {
            action: 'Review Started',
            by: body.reviewStartedBy,
            datetime: new Date(), // Current date and time
          },
        ],
        workflow: [
          {
            cycleNumber: 1,
            status: 'IN_REVIEW',
            reviewStartedBy: body?.reviewStartedBy,
            hiraRegisterIds: allAspectImpactIds,
            workflowHistory: [
              {
                action: 'Review Started',
                by: body.reviewStartedBy,
                datetime: new Date(), // Current date and time
              },
            ],
            comments: body?.comments || [],
          },
        ],
      };

      this.logger.debug(
        `traceId=${traceId} - Workflow data prepared`,
        JSON.stringify({ 
          dataStatus: data.status,
          workflowLength: data.workflow?.length,
          hiraRegisterIdsCount: data.hiraRegisterIds?.length
        }),
      );

      if (cycleNumber > 1) {
        this.logger.debug(
          `traceId=${traceId} - Delegating to updateHiraConsolidatedStatusForNewCycles for cycle > 1`,
          JSON.stringify({ 
            cycleNumber,
            existingEntryId: existingEntry._id
          }),
        );

        this.updateHiraConsolidatedStatusForNewCycles(
          body,
          data,
          existingEntry._id,
          cycleNumber,
          allAspectImpactIds,
          existingEntry,
          allMitigationIds,
        );
        return;
      }

      this.logger.debug(
        `traceId=${traceId} - Creating new consolidated entry`,
        JSON.stringify({ 
          entityId,
          cycleNumber
        }),
      );

      const result = await this.aspImpConsolidatedStatusModel.create(data);

      this.logger.debug(
        `traceId=${traceId} - Consolidated entry created`,
        JSON.stringify({ 
          entityId,
          resultId: result?._id,
          resultStatus: result?.status
        }),
      );

      if (!!result) {
        this.logger.debug(
          `traceId=${traceId} - Updating aspect impacts status to inWorkflow`,
          JSON.stringify({ 
            aspectImpactIdsCount: allAspectImpactIds?.length
          }),
        );

        const bulkUpdateResult = await this.aspImpModel.updateMany(
          { _id: { $in: allAspectImpactIds } }, // Filter to match documents by id
          { $set: { status: 'inWorkflow' } }, // Common update for all matched documents
        );

        if (allMitigationIds?.length > 0) {
          this.logger.debug(
            `traceId=${traceId} - Updating mitigations status to inWorkflow`,
            JSON.stringify({ 
              mitigationIdsCount: allMitigationIds?.length
            }),
          );

          const bulkUpdateMitigationsResult =
            await this.aspImpMitigationModel.updateMany(
              { _id: { $in: allMitigationIds } }, // Filter to match documents by id
              { $set: { mitigationStatus: 'inWorkflow' } }, // Set status to 'inWorkflow' for matched documents
            );
        }

        this.logger.debug(
          `traceId=${traceId} - Deleting changes track entry`,
          JSON.stringify({ 
            entityId
          }),
        );

        // delete the entityId entry in aspImpChangestTrack schema
        const deleteEntryInChangesTrack =
          await this.aspImpChangesTrackModel.deleteOne({
            entityId: entityId,
          });
      }

      // Function to send email asynchronously
      const sendEmail = async (recipients, subject, html) => {
        try {
          if (process.env.MAIL_SYSTEM === 'IP_BASED') {
            const result = await this.emailService.sendBulkEmails(
              recipients,
              subject,
              '',
              html,
            );
          } else {
            try {
              await sgMail.send({
                to: recipients,
                from: process.env.FROM,
                subject: subject,
                html: html,
              });
            } catch (error) {
              throw error;
            }
          }
        } catch (error) {
          console.error('Error sending email:', error);
        }
      };

      // Prepare and dispatch emails for reviewers
      if (reviewers?.length) {
        this.logger.debug(
          `traceId=${traceId} - Sending reviewer emails`,
          JSON.stringify({ 
            reviewersCount: reviewers?.length,
            resultId: result?._id
          }),
        );

        const reviewerEmails = reviewers.map((userObj) => userObj.email);
        const formattedDate = moment(existingEntry?.createdAt).format(
          'DD/MM/YYYY HH:mm',
        );
        const reviewerHtml = `<div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #003566; text-align: center;">Aspect Impact Initiated For Workflow</h2>
          <p>Hi,</p>
          <p>Aspect Impact Has Been Sent for Review.</p>
          <p><strong>Corp Func/Unit:</strong> ${body?.location}</p>
          <p><strong>Vertical/Dept:</strong> ${body?.entity}</p>
          <p><strong>Created On:</strong> ${formattedDate}</p>
          <p><strong>Comment:</strong> ${body.reviewComment}</p>
          <p>Please click the link below to review / reject the Aspect Impact:</p>
          ${process.env.PROTOCOL + '://' + url + '/' + result?._id}
          </div>
      </div>`;
        sendEmail(
          reviewerEmails,
          'Aspect Impact Initiated For Workflow',
          reviewerHtml,
        );
      }

      if (!result) {
        this.logger.debug(
          `traceId=${traceId} - No result returned from creation`,
          JSON.stringify({ 
            entityId
          }),
        );

        return {
          data: null,
          status: 'open',
          message:
            'Something went wrong while creating consolidated entry for selected Stage',
        };
      } else {
        this.logger.debug(
          `traceId=${traceId} - createConsolidateEntry completed successfully`,
          JSON.stringify({ 
            entityId,
            resultId: result?._id,
            resultStatus: result?.status,
            aspectImpactsUpdated: allAspectImpactIds?.length,
            mitigationsUpdated: allMitigationIds?.length
          }),
        );

        this.logger.log(
          `trace id=${traceId} POST /aspect-impact/createConsolidateEntry  payload entityId ${entityId} service successful`,
          '',
        );
        return {
          data: result,
          status: result.status,
          message:
            'Aspect Impact Successfully Sent For Review. Emails are being sent.',
        };
      }
    } catch (err) {
      this.logger.error(
        `traceId=${traceId} - createConsolidateEntry failed with error: ${err.message}`,
        JSON.stringify({ 
          entityId,
          orgId,
          reviewersCount: body?.reviewers?.length,
          approversCount: body?.approvers?.length
        }),
      );
      throw new InternalServerErrorException(err);
    }
  }

  getObjectWithLargestCycleNumber(workflow: any) {
    return workflow.reduce(
      (max: any, obj: any) => (obj.cycleNumber > max.cycleNumber ? obj : max),
      workflow[0],
    );
  }

  async getHiraInWorkflow(hiraWorkflowId: string) {
    try {
      const result = await this.aspImpConsolidatedStatusModel.findOne({
        _id: hiraWorkflowId,
      });

      const resultObj = result?.toObject();
      let approvedByUserDetails;

      // console.log('result obj-->', resultObj);

      const objectWithLargestCycleNumber = this.getObjectWithLargestCycleNumber(
        resultObj.workflow,
      );

      const workflowUserIds = objectWithLargestCycleNumber.workflowHistory?.map(
        (history) => history.by,
      );

      let workflowUserDetails = [],
        reviewersDetails = [],
        approversDetails = [];

      if (workflowUserIds && workflowUserIds.length > 0) {
        workflowUserDetails = await this.prisma.user.findMany({
          where: {
            id: { in: workflowUserIds },
          },
          select: {
            email: true,
            firstname: true,
            lastname: true,
            id: true,
          },
        });
      }
      if (!!resultObj?.reviewers && resultObj?.reviewers?.length > 0) {
        const reviewersUserDetails = await this.prisma.user.findMany({
          where: {
            id: { in: resultObj?.reviewers },
          },
          select: {
            email: true,
            firstname: true,
            lastname: true,
            id: true,
          },
        });
        reviewersDetails = [...reviewersUserDetails];
      }
      if (!!resultObj?.approvers && resultObj?.approvers?.length > 0) {
        const approversUserDetails = await this.prisma.user.findMany({
          where: {
            id: { in: resultObj?.approvers },
          },
          select: {
            email: true,
            firstname: true,
            lastname: true,
            id: true,
          },
        });
        approversDetails = [...approversUserDetails];
      }

      // Enrich the workflowHistory
      const enrichedWorkflowHistory = resultObj?.workflowHistory?.map(
        (historyItem) => {
          const userDetails = workflowUserDetails?.find(
            (user) => user.id === historyItem.by,
          );
          return {
            ...historyItem,
            user: userDetails
              ? {
                  email: userDetails.email,
                  firstname: userDetails.firstname,
                  lastname: userDetails.lastname,
                }
              : null,
          };
        },
      );

      // Enrich the workflow.workflowHistory
      const enrichedWorkflows = resultObj.workflow.map((workflowItem: any) => {
        if (workflowItem.status !== 'APPROVED') {
          const enrichedWorkflowHistory = workflowItem.workflowHistory.map(
            (historyItem: any) => {
              const userDetails = workflowUserDetails?.find(
                (user) => user.id === historyItem.by,
              );
              return {
                ...historyItem,
                user: userDetails
                  ? {
                      email: userDetails.email,
                      firstname: userDetails.firstname,
                      lastname: userDetails.lastname,
                    }
                  : null,
              };
            },
          );

          return {
            ...workflowItem,
            workflowHistory: enrichedWorkflowHistory,
          };
        }
        return workflowItem;
      });

      if (!!resultObj.approvedBy) {
        approvedByUserDetails = await this.prisma.user.findFirst({
          where: {
            id: resultObj.approvedBy,
          },
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
          },
        });
      }

      if (!result) {
        this.logger.log(
          `trace id=${uuid()} GET /aspect-impact/getHiraInWorkflow  payload hiraWorkflowId ${hiraWorkflowId} service successful`,
          '',
        );
        return {
          data: null,
          status: '',
          message: 'Aspect Impact Not Found In Workflow',
        };
      } else {
        this.logger.log(
          `trace id=${uuid()} GET /aspect-impact/getHiraInWorkflow  payload hiraWorkflowId ${hiraWorkflowId} service successful`,
          '',
        );
        return {
          data: {
            ...resultObj,
            workflowHistory: enrichedWorkflowHistory,
            workflow: enrichedWorkflows, // Set the enriched workflows here
            reviewersDetails: reviewersDetails,
            approversDetails: approversDetails,
            approvedByUserDetails,
          },
          status: result.status,
          message: 'Aspect Impact In Workflow Successfully Fetched!',
        };
      }
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, GET /aspect-impact/getHiraInWorkflow  $payload hiraWorkflowId ${hiraWorkflowId}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async updateConsolidatedEntry(
    body: any,
    hiraWorkflowId: string,
    userId: any,
  ) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting updateConsolidatedEntry`,
      JSON.stringify({ 
        hiraWorkflowId,
        userId,
        bodyKeys: Object.keys(body || {}),
        bodyStatus: body?.status,
        bodyEntityId: body?.entityId,
        approversCount: body?.approvers?.length,
        reviewersCount: body?.reviewers?.length
      }),
    );

    try {
      // Input validation
      if (!body || !hiraWorkflowId || !userId) {
        this.logger.debug(
          `traceId=${traceId} - Input validation failed`,
          JSON.stringify({ 
            body: !!body,
            hiraWorkflowId: !!hiraWorkflowId,
            userId: !!userId 
          }),
        );
        throw new Error('Invalid input: body, hiraWorkflowId, or userId is missing');
      }

      const { approvers, url, reviewers } = body;
      let serialNumber;

      this.logger.debug(
        `traceId=${traceId} - Fetching activeUser with organization and location`,
        JSON.stringify({ 
          userId
        }),
      );

      const activeuser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
        include: {
          organization: true,
          location: true,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - ActiveUser fetched`,
        JSON.stringify({ 
          activeUserFound: !!activeuser,
          activeUserId: activeuser?.id,
          organizationId: activeuser?.organization?.id,
          locationId: activeuser?.locationId
        }),
      );

      let allAspectImpactIds = [],
        allMitigationIds = [];

      this.logger.debug(
        `traceId=${traceId} - Fetching aspect impacts by entityId in workflow`,
        JSON.stringify({ 
          entityId: body.entityId
        }),
      );

      const fetchAllHiraByJobTitle = await this.aspImpModel
        .find({
          entityId: body.entityId,
          status: 'inWorkflow',
        })
        .select('_id mitigations');

      if (fetchAllHiraByJobTitle?.length > 0) {
        allAspectImpactIds = fetchAllHiraByJobTitle.map((item) =>
          item?._id?.toString(),
        );
      }

      this.logger.debug(
        `traceId=${traceId} - Aspect impacts fetched`,
        JSON.stringify({ 
          entityId: body.entityId,
          aspectImpactsCount: fetchAllHiraByJobTitle?.length,
          aspectImpactIdsCount: allAspectImpactIds?.length
        }),
      );

      if (fetchAllHiraByJobTitle?.length > 0) {
        allMitigationIds = fetchAllHiraByJobTitle
          .map((item) => item.mitigations)
          .flat()
          .filter((value, index, self) => self.indexOf(value) === index); // Unique IDs
      }

      this.logger.debug(
        `traceId=${traceId} - Mitigation IDs aggregated`,
        JSON.stringify({ 
          mitigationIdsCount: allMitigationIds?.length
        }),
      );

      let update: any = {
        status: body?.status,
        hiraRegisterIds: allAspectImpactIds,
      };

      this.logger.debug(
        `traceId=${traceId} - Processing workflow status update`,
        JSON.stringify({ 
          currentStatus: body?.status,
          isInApprovalOrApproved: ['IN_APPROVAL', 'APPROVED'].includes(body?.status),
          isRejected: body?.status === 'REJECTED'
        }),
      );

      // Handle status updates in the workflow
      if (body?.status === 'IN_APPROVAL' || body?.status === 'APPROVED') {
        this.logger.debug(
          `traceId=${traceId} - Setting up workflow update for IN_APPROVAL or APPROVED`,
          JSON.stringify({ 
            status: body.status,
            updatedBy: body?.updatedBy
          }),
        );

        update['$set'] = {
          'workflow.$[elem].status': body.status,
          'workflow.$[elem].updatedBy': body?.updatedBy || '',
        };

        if (body?.status === 'IN_APPROVAL') {
          this.logger.debug(
            `traceId=${traceId} - Processing IN_APPROVAL status`,
            JSON.stringify({ 
              reviewedBy: body?.reviewedBy
            }),
          );

          update = {
            ...update,
            reviewedBy: body?.reviewedBy || '',
            reviewedOn: new Date(),
            $push: {
              workflowHistory: {
                action: 'Review Completed',
                by: body.reviewedBy,
                datetime: new Date(),
              },
            },
          };
          update['$set']['workflow.$[elem].reviewedBy'] =
            body?.reviewedBy || '';
          update['$set']['workflow.$[elem].reviewedOn'] = new Date();
          update['$push'] = {
            'workflow.$[elem].workflowHistory': {
              action: 'Review Completed',
              by: body.reviewedBy,
              datetime: new Date(),
            },
          };
        }

        if (body?.status === 'APPROVED') {
          this.logger.debug(
            `traceId=${traceId} - Processing APPROVED status`,
            JSON.stringify({ 
              approvedBy: body?.approvedBy
            }),
          );

          update = {
            ...update,
            approvedBy: body?.approvedBy || '',
            approvedOn: new Date(),
            $push: {
              workflowHistory: {
                action: 'Approved',
                by: body.approvedBy,
                datetime: new Date(),
              },
            },
          };
          update['$set']['workflow.$[elem].approvedBy'] =
            body?.approvedBy || '';
          update['$set']['workflow.$[elem].approvedOn'] = new Date();
          update['$push'] = {
            'workflow.$[elem].workflowHistory': {
              action: 'Approved',
              by: body.approvedBy,
              datetime: new Date(),
            },
          };
        }
      }

      if (body?.status === 'REJECTED') {
        this.logger.debug(
          `traceId=${traceId} - Processing REJECTED status`,
          JSON.stringify({ 
            updatedBy: body?.updatedBy
          }),
        );

        update = {
          ...update,
          $push: {
            workflowHistory: {
              action: 'Rejected',
              by: body?.updatedBy,
              datetime: new Date(),
            },
          },
        };
        update['$set'] = {
          'workflow.$[elem].status': body.status,
          'workflow.$[elem].rejectedBy': body?.updatedBy || '',
        };
        update['$push'] = {
          'workflow.$[elem].workflowHistory': {
            action: 'Rejected',
            by: body?.updatedBy,
            datetime: new Date(),
          },
        };
      }

      this.logger.debug(
        `traceId=${traceId} - Executing consolidated status update`,
        JSON.stringify({ 
          hiraWorkflowId,
          updateKeys: Object.keys(update),
          hasSetOperations: !!update['$set'],
          hasPushOperations: !!update['$push']
        }),
      );

      // Find the active cycle which is not 'APPROVED' and update it
      const result = await this.aspImpConsolidatedStatusModel.findByIdAndUpdate(
        hiraWorkflowId,
        update,
        {
          arrayFilters: [{ 'elem.status': { $ne: 'APPROVED' } }],
          new: true,
        },
      );

      this.logger.debug(
        `traceId=${traceId} - Consolidated status updated`,
        JSON.stringify({ 
          hiraWorkflowId,
          updateSuccessful: !!result,
          resultStatus: result?.status
        }),
      );

      let updateComments;
      // Append new comments using $push
      if (body.comments && body.comments.length > 0) {
        this.logger.debug(
          `traceId=${traceId} - Updating comments`,
          JSON.stringify({ 
            hiraWorkflowId,
            commentsCount: body.comments?.length
          }),
        );

        updateComments =
          await this.aspImpConsolidatedStatusModel.findByIdAndUpdate(
            hiraWorkflowId,
            { $push: { comments: { $each: body.comments } } },
          );
      }

      if (!!result && body?.status === 'REJECTED') {
        // console.log(
        //   'WORKFLOW ENTRY IS CREATED, now modifying all asp imp back to active status',
        // );
        // console.time('UPDATE');
        // Fetch rows from hiraRegisterModel that match the condition

        // Update the original documents to have revisionNumber: 0 and status: "archived"
        const updateExisitingHiras = await this.aspImpModel.updateMany(
          {
            _id: { $in: allAspectImpactIds },
          },
          {
            $set: { status: 'active' },
          },
        );

        // console.log('ASP IMP updated back to active:', updateExisitingHiras);

        // Update status of existing mitigations back to 'active'
        const updateMitigations = await this.aspImpMitigationModel.updateMany(
          { _id: { $in: allMitigationIds } },
          { $set: { mitigationStatus: 'active' } },
        );
        // console.log('Mitigations updated back to active:', updateMitigations);

        // console.timeEnd('UPDATE');
      }

      if (!!result && body?.status === 'APPROVED') {
        // console.log('WORKFLOW ENTRY IS CREATED, now making copy of asp imp');
        // console.time('COPYUPDATE');
        serialNumber = await this.serialNumberService.generateSerialNumber({
          moduleType: 'AI',
          location: activeuser?.locationId,
          entity: activeuser?.entityId,
          year: body?.year.toString(),
          createdBy: activeuser?.id,
          organizationId: activeuser.organization.id,
        });

        // console.log('GENERATE SERIAL NUMBER RESULT-->', serialNumber);

        if (serialNumber === undefined || serialNumber === '') {
          return new ConflictException({ status: 409 });
        }
        const mappedserialNumber = await this.mapserialnumber(
          serialNumber,
          activeuser?.locationId,
          activeuser?.entityId,
          activeuser.organization.id,
        );

        // console.log('GENERATE MAPPED SERAIL NUMBER', mappedserialNumber);

        // Fetch rows from hiraRegisterModel that match the condition
        const rowsToCopy = await this.aspImpModel.find({
          _id: { $in: allAspectImpactIds },
        });

        // Update the original documents to have revisionNumber: 0 and status: "archived"
        const updateExisitingHiras = await this.aspImpModel.updateMany(
          {
            _id: { $in: allAspectImpactIds },
          },
          {
            $set: { status: 'archived', prefixSuffix: mappedserialNumber },
          },
        );

        // Prepare new rows by copying and updating specific fields
        const newRows = rowsToCopy.map((row) => {
          const currentRevision = row?.revisionNumber || 0; // Get the current revision number, default to 0 if it's not set
          const newRow = {
            ...row.toObject(),
            revisionNumber: currentRevision + 1, // Increment the revision number
            prefixSuffix: mappedserialNumber,
            status: 'active',
          }; // Use toObject() method
          delete newRow._id; // Ensure the new row gets a new ID
          return newRow;
        });

        // Fetch mitigation documents to be copied
        const mitigationsToCopy = await this.aspImpMitigationModel.find({
          _id: { $in: allMitigationIds },
        });

        // Prepare new mitigation entries by copying and updating specific fields
        const newMitigations = mitigationsToCopy.map((mitigation) => {
          const currentRevision = mitigation.revisionNumber || 0;
          const newMitigation = {
            ...mitigation.toObject(),
            revisionNumber: currentRevision + 1,
            mitigationStatus: 'active',
          };
          delete newMitigation._id; // Ensure new mitigation gets a new ID
          return newMitigation;
        });

        // Insert new mitigation entries
        const insertMitigationResult =
          await this.aspImpMitigationModel.insertMany(newMitigations);
        // console.log('New mitigation entries inserted:', insertMitigationResult);

        // Update original mitigations to have status: 'archived'
        const updateOriginalMitigations =
          await this.aspImpMitigationModel.updateMany(
            { _id: { $in: allMitigationIds } },
            { $set: { mitigationStatus: 'archived' } },
          );
        // console.log('Original mitigations updated:', updateOriginalMitigations);

        // Create a mapping from old mitigation IDs to new mitigation IDs
        const mitigationIdMapping = mitigationsToCopy.reduce(
          (acc, mitigation, index) => {
            acc[mitigation._id.toString()] = insertMitigationResult[index]._id;
            return acc;
          },
          {},
        );

        // console.log('Mitigation ID mapping:', mitigationIdMapping);

        // Update the `mitigations` array of each new AspectImpact entry
        const updatedAspectImpacts = newRows.map((row: any) => {
          return {
            ...row,
            mitigations: row.mitigations.map(
              (oldId) => mitigationIdMapping[oldId] || oldId,
            ),
          };
        });

        // Insert new rows back into the hiraRegisterModel
        const updatedInsertResult = await this.aspImpModel.insertMany(
          updatedAspectImpacts,
        );

        // console.log('New rows inserted:', updatedInsertResult);
        // console.timeEnd('COPYUPDATE');
      }

      // console.log('checkrisk updatecomments-->', updateComments);

      // Function to send email asynchronously
      const sendEmail = async (recipients, subject, html) => {
        try {
          if (process.env.MAIL_SYSTEM === 'IP_BASED') {
            const result = await this.emailService.sendBulkEmails(
              recipients,
              subject,
              '',
              html,
            );
            ////console.log('sent mail');
          } else {
            try {
              await sgMail.send({
                to: recipients,
                from: process.env.FROM,
                subject: subject,
                html: html,
              });
              // console.log('Email sent successfully to:', recipients);
            } catch (error) {
              throw error;
            }
          }
        } catch (error) {
          // console.error('Error sending email:', error);
        }
      };

      // Prepare and dispatch emails for approvers
      if (approvers?.length) {
        // console.log('checkrisk inside approver if', result?._id);
        const userEmails = await this.prisma.user.findMany({
          where: {
            id: { in: approvers },
          },
          select: {
            email: true,
          },
        });
        const approverEmails = userEmails.map(
          (userEmailsObj) => userEmailsObj.email,
        );
        const approverHtml = `
        <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
          <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #003566; text-align: center;">Aspect Impact Requested For Approval</h2>
            <p>Hi,</p>
            <p>Aspect Impact has been sent for your approval.</p>
            <p><strong>Corp Func/Unit:</strong> ${body?.location}</p>
            <p><strong>Vertical/Dept:</strong> ${body?.entity}</p>
            <p><strong>Reviewer's Comments:</strong> ${
              body.reviewCompleteComment || 'N/A'
            }</p>
            <p>Please click the link below to approve / reject the Aspect Impact:</p>
            ${process.env.PROTOCOL + '://' + url + '/' + result?._id}
          </div>
        </div>
        `;

        const finalHtml = `
        <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
          <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #003566; text-align: center;">Aspect Impact Approval Confirmation</h2>
            <p>Hi,</p>
            <p>The Aspect Impact has been successfully approved.</p>
            <p><strong>Corp Func/Unit:</strong> ${body?.location}</p>
            <p><strong>Vertical/Dept:</strong> ${body?.entity}</p>
            <p><strong>Approver's Comments:</strong> ${
              body.approveComment || 'N/A'
            }</p>
            <p>Thank you for your attention to this matter.</p>
          </div>
        </div>
        `;

        //for APPROVED status
        const htmlForResponsiblePerson = `
        <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #003566; text-align: center;">Aspect Impact Approval Notification</h2>
          <p>Hi,</p>
          <p>The Aspect Impact has been successfully approved.</p>
          <p><strong>Corp Func/Unit:</strong> ${body?.location}</p>
          <p><strong>Vertical/Dept:</strong> ${body?.entity}</p>
          <p>You are recieving this email as you were listed as one of the responsible person for this Aspect Impact</p>
          <p><strong>Approver's Comments:</strong> ${
            body.approveComment || 'N/A'
          }</p>
          <p>Thank you for your attention to this matter.</p>
        </div>
      </div>
      `;

        const approverSubject = 'Aspect Impact Review Completed';
        const finalSubject = 'Aspect Impact Approved';
        const subjectForResponsiblePerson =
          'Aspect Impact Approval Notification';

        if (body?.status === 'APPROVED') {
          const responsiblePersonEmails = await this.prisma.user.findMany({
            where: {
              id: {
                in: body?.responsiblePersonIdArray,
              },
            },
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
            },
          });
          // console.log('responsiblePersonEmails', responsiblePersonEmails);

          sendEmail(
            responsiblePersonEmails?.map((item: any) => item?.email),
            subjectForResponsiblePerson,
            htmlForResponsiblePerson,
          );
        }

        sendEmail(
          approverEmails,
          body?.status === 'IN_APPROVAL' ? approverSubject : finalSubject,
          body?.status === 'IN_APPROVAL' ? approverHtml : finalHtml,
        );
      }

      // Prepare and dispatch emails for approvers
      if (reviewers?.length) {
        // console.log('checkrisk inside approver if', result?._id);
        const userEmails = await this.prisma.user.findMany({
          where: {
            id: { in: reviewers },
          },
          select: {
            email: true,
          },
        });
        const reviewerEmails = userEmails.map(
          (userEmailsObj) => userEmailsObj.email,
        );

        //for APPROVED status
        const finalHtml = `Hi, Aspect Impact Approved, 
                                  You are Receiving this email as you were listed as an reviewer for this Aspect Impact
                                  <p><strong>Corp Func/Unit:</strong> ${
                                    body?.location
                                  }</p>
                                  <p><strong>Vertical/Dept:</strong> ${
                                    body?.entity
                                  }</p>
                                 Comments Left By Approver : ${
                                   body.approveComment || 'N/A'
                                 }
                                 
                                  To see the Aspect Impact in workflow,   Please Click Below Link 
                                  ${
                                    process.env.PROTOCOL +
                                    '://' +
                                    url +
                                    '/' +
                                    result?._id
                                  }
    
                                  `;

        const finalSubject = 'Aspect Impact Approved';
        sendEmail(reviewerEmails, finalSubject, finalHtml);
      }

      if (!result && !updateComments) {
        this.logger.debug(
          `traceId=${traceId} - No result or comment updates returned`,
          JSON.stringify({ 
            hiraWorkflowId,
            hasResult: !!result,
            hasUpdateComments: !!updateComments
          }),
        );

        return {
          data: null,
          status: 'open',
          message:
            'Something went wrong while creating consolidated entry for selected Stage',
        };
      } else {
        this.logger.debug(
          `traceId=${traceId} - updateConsolidatedEntry completed successfully`,
          JSON.stringify({ 
            hiraWorkflowId,
            resultStatus: result?.status,
            bodyStatus: body?.status,
            hasApprovers: !!approvers?.length,
            hasReviewers: !!reviewers?.length,
            aspectImpactsCount: allAspectImpactIds?.length,
            mitigationsCount: allMitigationIds?.length
          }),
        );

        this.logger.log(
          `trace id=${traceId} PUT /aspect-impact/updateConsolidatedEntry  payload hiraWorkflowId ${hiraWorkflowId} service successful`,
          '',
        );
        return {
          data: result,
          status: result.status,
          message: `${
            body?.status === 'IN_APPROVAL'
              ? 'Aspect Impact Successfully Sent For Approval'
              : body?.status === 'REJECTED'
              ? 'Aspect Impact Rejected'
              : 'Aspect Impact Successfully Approved'
          }. Emails are being sent.`,
        };
      }
    } catch (err) {
      this.logger.error(
        `traceId=${traceId} - updateConsolidatedEntry failed with error: ${err.message}`,
        JSON.stringify({ 
          hiraWorkflowId,
          userId,
          bodyStatus: body?.status,
          bodyEntityId: body?.entityId
        }),
      );
      throw new InternalServerErrorException(err);
    }
  }

  async updateHiraConsolidatedStatusForNewCycles(
    body: any,
    dataToBeUpdated: any,
    hiraWorkflowId: string,
    cycle: any,
    allAspectImpactIds = [],
    existingEntry: any,
    allMitigationIds = [],
  ) {
    // console.log(
    //   'checkrisk inside asp imp updateHiraConsolidatedStatusForNewCycles',
    // );
    // console.log('checkrisk dataToBeUpdated', dataToBeUpdated);
    // console.log('checkrisk hiraWorkflowId', hiraWorkflowId);

    // console.log('checkrisk cycle', cycle);
    try {
      const { reviewers, approvers, url } = body;

      const data: any = {
        status: 'IN_REVIEW',

        reviewStartedBy: body?.reviewStartedBy,
        reviewers: reviewers?.map((item: any) => item.id),
        approvers: approvers?.map((item: any) => item.id),

        hiraRegisterIds: allAspectImpactIds,
        // reviewComment: body?.reviewComment || '',
        // comments: body?.comments || [],

        $push: {
          workflowHistory: {
            action: 'Review Started',
            by: body.reviewStartedBy,
            datetime: new Date(), // Current date and time
          },
          workflow: {
            cycleNumber: cycle,
            status: 'IN_REVIEW',
            reviewStartedBy: body?.reviewStartedBy,
            hiraRegisterIds: allAspectImpactIds,
            workflowHistory: [
              {
                action: 'Review Started',
                by: body.reviewStartedBy,
                datetime: new Date(), // Current date and time
              },
            ],
            comments: body.comments,
          },
          // comments: body?.comments || {},
        },
      };

      const result = await this.aspImpConsolidatedStatusModel.findByIdAndUpdate(
        hiraWorkflowId,
        data,
      );

      if (!!result) {
        const bulkUpdateResult = await this.aspImpModel.updateMany(
          { _id: { $in: allAspectImpactIds } }, // Filter to match documents by id
          { $set: { status: 'inWorkflow' } }, // Common update for all matched documents
        );

        // console.log(
        //   'Bulk update result in asp imp updateWOrkflow for cycles greateer than 1:',
        //   bulkUpdateResult,
        // );

        if (allMitigationIds?.length > 0) {
          const bulkUpdateMitigationsResult =
            await this.aspImpMitigationModel.updateMany(
              { _id: { $in: allMitigationIds } }, // Filter to match documents by id
              { $set: { mitigationStatus: 'inWorkflow' } }, // Set status to 'inWorkflow' for matched documents
            );
          // console.log(
          //   'Bulk update result for mitigations:',
          //   bulkUpdateMitigationsResult,
          // );
        }

        // console.log(
        //   'entityId in creae consolidated entry-->',
        //   dataToBeUpdated?.entityId,
        // );

        // delete the entityId entry in aspImpChangestTrack schema
        const deleteEntryInChangesTrack =
          await this.aspImpChangesTrackModel.deleteOne({
            entityId: dataToBeUpdated?.entityId,
          });

        // console.log('is entry deleted---->', deleteEntryInChangesTrack);
      }

      let updateComments;
      // Append new comments using $push
      if (body?.comments && body?.comments.length > 0) {
        updateComments =
          await this.aspImpConsolidatedStatusModel.findByIdAndUpdate(
            hiraWorkflowId,
            { $push: { comments: { $each: body.comments } } },
          );
      }

      // Function to send email asynchronously
      const sendEmail = async (recipients, subject, html) => {
        try {
          if (process.env.MAIL_SYSTEM === 'IP_BASED') {
            const result = await this.emailService.sendBulkEmails(
              recipients,
              subject,
              '',
              html,
            );
            ////console.log('sent mail');
          } else {
            try {
              await sgMail.send({
                to: recipients,
                from: process.env.FROM,
                subject: subject,
                html: html,
              });
              // console.log('Email sent successfully to:', recipients);
            } catch (error) {
              throw error;
            }
          }
        } catch (error) {
          console.error('Error sending email in aspect impact upfate for new cylecs:', error);
        }
      };

      // Prepare and dispatch emails for reviewers
      if (reviewers?.length) {
        // console.log('checkrisk inside reviewer if', result?._id);

        const reviewerEmails = reviewers.map((userObj) => userObj.email);
        const formattedDate = moment(existingEntry?.createdAt).format(
          'DD/MM/YYYY HH:mm',
        );
        const reviewerHtml = `<div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
                              <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                                <h2 style="color: #003566; text-align: center;">Aspect Impact Initiated For Workflow</h2>
                                <p>Hi,</p>
                                <p>A Aspect Impact has been sent for review.</p>
                                <p><strong>Corp Func/Unit:</strong> ${
                                  body?.location
                                }</p>
                                <p><strong>Vertical/Dept:</strong> ${
                                  body?.entity
                                }</p>
                                <p><strong>Created On:</strong> ${formattedDate}</p>
                                <p><strong>Comment:</strong> ${
                                  body.reviewComment
                                }</p>
                                <p>Please click the link below to review / reject the Aspect Impact:</p>
                                ${
                                  process.env.PROTOCOL +
                                  '://' +
                                  url +
                                  '/' +
                                  result?._id
                                }
                                </div>
                            </div>`;

        sendEmail(
          reviewerEmails,
          'Aspect Impact Initiated For Workflow',
          reviewerHtml,
        );
      }

      // Prepare and dispatch emails for approvers
      // if (approvers?.length) {
      //   // console.log('checkrisk inside approver if', result?._id);

      //   const approverEmails = approvers.map((userObj) => userObj.email);
      //   const approverHtml = `Hi,Aspect Impact Sent for Review,
      //                         You are Receiving this email as you were listed as an approver for this Aspect Impact
      //                         Comment : ${body.reviewComment}`;
      //   sendEmail(
      //     approverEmails,
      //     'Aspect Impact Initiated For Workflow',
      //     approverHtml,
      //   );
      // }

      if (!result) {
        return {
          data: null,
          status: 'open',
          message:
            'Something went wrong while creating consolidated entry for selected Stage',
        };
      } else {
        return {
          data: result,
          status: result.status,
          message:
            'Aspect Impact Successfully Sent For Review. Emails are being sent.',
        };
      }
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, PUT /aspect-impact/updateConsolidatedEntry  $payload inside update for newer cycles hiraWorkflowId ${hiraWorkflowId}  failed with error ${error} `,
      );
    }
  }

  async getAllDepartmentsByLocation(locationId: string) {
    try {
      const result = await this.prisma.entity.findMany({
        where: {
          locationId: locationId,
          deleted: false,
        },
        select: {
          id: true,
          entityName: true,
        },
        orderBy: {
          entityName: 'asc', // Sorts by locationName in ascending order
        },
      });

      if (!result) {
        return {
          data: null,
          status: '',
          message: 'No Departments found in the organinzation',
        };
      } else {
        this.logger.log(
          `trace id=${uuid()} GET /aspect-impact/getAllDepartmentsByLocation  payload locationId ${locationId} service successful`,
          '',
        );
        return {
          data: result,
          message: 'Departments Fetched Successfully',
        };
      }
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, GET /aspect-impact/getAllDepartmentsByLocation/:locationId  $payload locationId ${locationId}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async getAllLocations(orgId: string) {
    try {
      const result = await this.prisma.location.findMany({
        where: {
          organizationId: orgId,
          deleted: false,
        },
        select: {
          id: true,
          locationName: true,
        },
        orderBy: {
          locationName: 'asc', // Sorts by locationName in ascending order
        },
      });

      if (!result) {
        return {
          data: null,
          status: '',
          message: 'No Units found in the organinzation',
        };
      } else {
        this.logger.log(
          `trace id=${uuid()} GET /aspect-impact/getAllLocations  payload orgId ${orgId} service successful`,
          '',
        );
        return {
          data: result,
          message: 'Units Fetched Successfully',
        };
      }
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, GET /aspect-impact/getAllLocations/:orgId  $payload orgId ${orgId}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  sendEmail = async (recipients, subject, html) => {
    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        const result = await this.emailService.sendBulkEmails(
          recipients,
          subject,
          '',
          html,
        );
        // console/.log('Email sent successfully to:', recipients);
        this.logger.log(
          `trace id=${uuid()} SENDING EMAIL IN ASPECT IMPACT for subject ${subject} successful`,
          '',
        );
      } else {
        try {
          await sgMail.send({
            to: recipients,
            from: process.env.FROM,
            subject: subject,
            html: html,
          });
          this.logger.log(
            `trace id=${uuid()} SENDING EMAIL IN ASPECT IMPACT for subject ${subject} successful`,
            '',
          );
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()},INSIDE SEndEmAIL service aspect impact for subject ${subject} and recipients ${recipients}  failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  };

  async createReviewHistoryEntry(body: any) {
    try {
      let allHiraIds = [];
      const fetchAllHiraByJobTitle = await this.aspImpModel
        .find({
          entityId: body?.entityId,
          status: 'active',
        })
        .select('_id');

      if (fetchAllHiraByJobTitle?.length > 0) {
        allHiraIds = fetchAllHiraByJobTitle.map((item) =>
          item?._id?.toString(),
        );
      }

      // console.log('allHiraIds in aspimp createReviewHistroyEntry', allHiraIds);
      if (!!allHiraIds?.length) {
        const upsertData = {
          ...body,
          hiraRegisterIds: allHiraIds,
        };

        const reviewEntry =
          await this.aspectImpactReviewHistoryModel.findOneAndUpdate(
            {
              // jobTitle: body?.jobTitle,
              organizationId: body?.organizationId,
              entityId: body?.entityId,
            },
            upsertData,
            { new: true, upsert: true, setDefaultsOnInsert: true },
          );
          this.logger.log(
            `trace id=${uuid()} POST /aspect-impact/createReviewHistoryEntry  payload body ${body} service successful`,
            '',
          );
        return reviewEntry;
      } else {
        this.logger.log(
          `trace id=${uuid()} POST /aspect-impact/createReviewHistoryEntry  payload body ${body} service NOT FOUND EXCEPTION`,
          '',
        );
        // If allHiraIds array is empty, throw a NotFoundException
        throw new NotFoundException(
          'No Asp Imp records found for the given job title.',
        );
      }
    } catch (error: any) {
      this.logger.error(
        `trace id=${uuid()}, POST /aspect-impact/createReviewHistoryEntry$payload body ${body}  failed with error ${error} `,
      );
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async fetchReviewHistory(
    entityId: any,
    // jobTitle: any,
    orgId: any,
    //  entityId: any
  ) {
    try {
      // console.log('inside sercive', jobTitle, orgId);

      let reviewHistory = await this.aspectImpactReviewHistoryModel
        .findOne({
          organizationId: orgId,
          entityId: entityId,
          // jobTitle: jobTitle,
        })
        .lean();

      let reviewedByUserDetails;
      let finalResponse: any = reviewHistory;
      if (reviewHistory?.reviewedBy) {
        reviewedByUserDetails = await this.prisma.user.findFirst({
          where: {
            id: reviewHistory.reviewedBy,
          },
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
          },
        });
        finalResponse = {
          ...reviewHistory, // Use finalResponse to keep it clean
          reviewedByUserDetails,
        };
      }

      // console.log('reviewHistory', reviewHistory);
      this.logger.log(
        `trace id=${uuid()} GET /aspect-impact/fetchReviewHistory  payload entityId ${entityId} service successful`,
        '',
      );
      return finalResponse;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET /aspect-impact/fetchReviewHistory entityId $payload entityId ${entityId}  failed with error ${error} `,);
        throw new InternalServerErrorException(error);
    }
  }

  async updateHiraConsolidatedForRejectedHira(
    body: any,
    hiraWorkflowId: string,
  ) {
    try {
      // console.log('body in updateHiraConsolidatedForRejectedHira', body);
      // console.log(
      //   'hiraWorkflowId in updateHiraConsolidatedForRejectedHira',
      //   hiraWorkflowId,
      // );

      const { approvers, url, reviewers } = body;
      let allAspectImpactIds = [],
        allMitigationIds = [];

      const fetchAllHiraByJobTitle = await this.aspImpModel
        .find({
          entityId: body?.entityId,
          status: 'active',
        })
        .select('_id mitigations');

      // console.log();

      if (fetchAllHiraByJobTitle?.length > 0) {
        allAspectImpactIds = fetchAllHiraByJobTitle.map((item) =>
          item?._id?.toString(),
        );
      }

      if (fetchAllHiraByJobTitle?.length > 0) {
        allMitigationIds = fetchAllHiraByJobTitle
          .map((item) => item.mitigations)
          .flat()
          .filter((value, index, self) => self.indexOf(value) === index); // Unique IDs
      }

      // console.log(
      //   'allMitigationIds in updateAsp Imp for rejected hira',
      //   allMitigationIds,
      // );

      // console.log(
      //   'allAspectImpactIds in updateConsolidatedEntry service',
      //   allAspectImpactIds,
      // );

      let update: any = {
        // updatedBy: body?.updatedBy,
        // status: body?.status,
        status: body?.status,
        reviewStartedBy: body?.reviewStartedBy,
        updatedBy: body?.updatedBy,
        reviewers: reviewers?.map((item: any) => item.id),
        approvers: approvers?.map((item: any) => item.id),
        hiraRegisterIds: allAspectImpactIds,
        $push: {
          workflowHistory: {
            action: 'Review Started',
            by: body.reviewStartedBy,
            datetime: new Date(),
          },
        },
      };

      update['$set'] = {
        'workflow.$[elem].status': body?.status,
        'workflow.$[elem].updatedBy': body?.updatedBy || '',
        'workflow.$[elem].reviewStartedBy': body?.reviewStartedBy || '',
        'workflow.$[elem].hiraRegisterIds': allAspectImpactIds,
      };

      update['$push'] = {
        'workflow.$[elem].workflowHistory': {
          action: 'Review Started',
          by: body.reviewStartedBy,
          datetime: new Date(),
        },
      };

      // Add comments to the $push operation if they exist
      // if (body.comments && body.comments.length > 0) {
      //   update.$push.comments = { $each: body.comments };
      //   update['$push']['workflow.$[elem].comments'] = { $each: body.comments };
      // }

      // console.log(
      //   'updateHiraConsolidatedForRejectedHira update object',
      //   update,
      // );

      //Find the active cycle which is not 'APPROVED' and update it
      const result = await this.aspImpConsolidatedStatusModel.findByIdAndUpdate(
        hiraWorkflowId,
        update,
        {
          arrayFilters: [{ 'elem.status': { $ne: 'APPROVED' } }],
          new: true,
        },
      );

      if (!!result) {
        const bulkUpdateResult = await this.aspImpModel.updateMany(
          { _id: { $in: allAspectImpactIds } }, // Filter to match documents by id
          { $set: { status: 'inWorkflow' } }, // Common update for all matched documents
        );

        // console.log(
        //   'Bulk update result in updateWOrkflow for rejected hira:',
        //   bulkUpdateResult,
        // );

        if (allMitigationIds?.length > 0) {
          const bulkUpdateMitigationsResult =
            await this.aspImpMitigationModel.updateMany(
              { _id: { $in: allMitigationIds } }, // Filter to match documents by id
              { $set: { mitigationStatus: 'inWorkflow' } }, // Set status to 'inWorkflow' for matched documents
            );
          // console.log(
          //   'Bulk update result for mitigations in update consolidated for rejected asp imp:',
          //   bulkUpdateMitigationsResult,
          // );
        }
      }

      let updateComments;
      // Append new comments using $push
      if (body.comments && body.comments.length > 0) {
        updateComments =
          await this.aspImpConsolidatedStatusModel.findByIdAndUpdate(
            hiraWorkflowId,
            { $push: { comments: { $each: body.comments } } },
          );
      }

      // //console.log('checkrisk updatecomments-->', updateComments);

      // Prepare and dispatch emails for approvers
      // if (approvers?.length) {
      //   // //console.log('checkrisk inside approver if', result?._id);
      //   const userEmails = await this.prisma.user.findMany({
      //     where: {
      //       id: { in: approvers },
      //     },
      //     select: {
      //       email: true,
      //     },
      //   });
      //   const approverEmails = userEmails.map(
      //     (userEmailsObj) => userEmailsObj.email,
      //   );
      //   const approverHtml = `<div>Hi, <br />Hira Sent for Approval, <br />
      //                         You are Receiving this email as you were listed as an approver for this Hira</div>
      //                         <div>Comments Left By Reviewer : ${
      //                           body.reviewCompleteComment || 'N/A'
      //                         }</div><br/>
      //                         Please Click Below Link to Approve Hira<br/>
      //                         ${
      //                           process.env.PROTOCOL +
      //                           '://' +
      //                           url +
      //                           '/' +
      //                           result?._id
      //                         }

      //                         `;

      //   //for APPROVED status
      //   const finalHtml = `<div>Hi, <br />Hira Approved, <br />
      //                         You are Receiving this email as you were listed as an approver for this Hira</div>
      //                         <div>Comments Left By Approver : ${
      //                           body.approveComment || 'N/A'
      //                         }</div><br/>

      //                         `;
      //   const approverSubject = 'Hira Review Completed';
      //   const finalSubject = 'Hira Approved';
      //   this.sendEmail(
      //     approverEmails,
      //     body?.status === 'IN_APPROVAL' ? approverSubject : finalSubject,
      //     body?.status === 'IN_APPROVAL' ? approverHtml : finalHtml,
      //   );
      // }

      // Prepare and dispatch emails for approvers
      if (reviewers?.length) {
        // //console.log('checkrisk inside approver if', result?._id);
        // const userEmails = await this.prisma.user.findMany({
        //   where: {
        //     id: { in: reviewers },
        //   },
        //   select: {
        //     email: true,
        //   },
        // });
        const reviewerEmails = reviewers.map((userObj) => userObj.email);

        //for APPROVED status
        const finalHtml = `Hi, <br />Aspect Impact Sent for Review
        Comment : ${body.reviewComment}
        Please Click Below Link to Review Aspect Impact
        ${process.env.PROTOCOL + '://' + url + '/' + result?._id}
        `;

        const finalSubject = 'Aspect Impact Initiated For Workflow';
        this.sendEmail(reviewerEmails, finalSubject, finalHtml);
      }

      if (!result) {
        this.logger.log(
          `trace id=${uuid()} GET /aspect-impact/updateHiraConsolidatedForRejectedHira  payload hiraWorkflowId ${hiraWorkflowId} service successful`,
          '',
        );
        return {
          data: null,
          status: 'open',
          message:
            'Something went wrong while creating consolidated entry for selected job title',
        };
      } else {
        this.logger.log(
          `trace id=${uuid()} GET /aspect-impact/updateHiraConsolidatedForRejectedHira  payload hiraWorkflowId ${hiraWorkflowId} service successful`,
          '',
        );
        return {
          data: result,
          status: result.status,
          message: `Aspect Impact Sucessfully Sent For Review. Emails are being sent.`,
        };
      }
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, POST /aspect-impact/updateHiraConsolidatedForRejectedHira $payload hiraWorkflowId ${hiraWorkflowId}  failed with error ${err} `,);
        throw new InternalServerErrorException(err);
    }
  }

  async fetchRevisionHistory(query: any) {
    try {
      console.log('query in fetchRevisionHistory', query);
      const { jobTitle, workflowCycle, entityId } = query;
      const page = query.page || 1;
      const pageSize = query.pageSize || 10;
      const skip = (page - 1) * pageSize;
      let cycleNumber = parseInt(workflowCycle);
      // cycleNumber = cycleNumber - 1;

      const matchingDocument = await this.aspImpConsolidatedStatusModel
        .findOne({
          entityId: entityId,
        })

        .lean();

      console.log('matchingDocument', matchingDocument);
      const matchingWorkflow: any = matchingDocument.workflow.find(
        (workflow: any) => workflow.cycleNumber === cycleNumber,
      );

      console.log('matchingWorkflow', matchingWorkflow);

      const allHiraIds = matchingWorkflow.hiraRegisterIds;

      if (!allHiraIds?.length) {
        throw new NotFoundException(
          'No HIRA records found for the given job title.',
        );
      } else {
        let riskQuery: any = {
          _id: { $in: allHiraIds },
          // status: 'archived',
        };
        if (!!query.search) {
          const searchRegex = new RegExp(query.search, 'i');
          riskQuery.$or = [
            { jobTitle: { $regex: searchRegex } },
            { jobBasicStep: { $regex: searchRegex } },
            // { 'mitigations.title': { $regex: searchRegex } },
            // Add other fields as needed
          ];
        }
        let list = await this.aspImpModel
          .find(riskQuery)
          .sort({ createdAt: 1 })
          .skip(skip)
          .limit(pageSize)
          .populate('hiraConfigId')
          .populate({
            path: 'mitigations',
            // match: mitigationFilter,
          })
          .lean();
        // .select('_id jobTitle createdAt');

        console.log('fetchAllHiraByJobTitle', list);

        list = await Promise.all(
          list.map(async (risk: any) => {
            let location,
              entity,
              selectedRiskTypes,
              selectedConditions,
              selectedImpactTypes,
              selectedAspectTypes,
              selectedAct,
              assesmentTeam,
              createdByUserDetails;

            if (!!risk.createdBy) {
              console.log('risk.createdBy', risk.createdBy);

              createdByUserDetails = await this.prisma.user.findFirst({
                where: {
                  id: risk.createdBy,
                },
                select: {
                  id: true,
                  username: true,
                  email: true,
                  firstname: true,
                  lastname: true,
                  avatar: true,
                },
              });
            }

            console.log('createdByUserDetails', createdByUserDetails);

            if (risk.entityId) {
              entity = await this.prisma.entity.findUnique({
                where: { id: risk.entityId },
                select: { id: true, entityName: true },
              });
            }
            if (!!risk.condition) {
              selectedConditions = risk.hiraConfigId?.condition?.filter(
                (item: any) => item._id.toString() === risk.condition,
              )[0];
            }
            // Fetch and map location
            if (risk.locationId) {
              location = await this.prisma.location.findUnique({
                where: { id: risk.locationId },
                select: { id: true, locationName: true },
              });
            }

            if (!!risk.assesmentTeam) {
              assesmentTeam = await this.prisma.user.findMany({
                where: {
                  id: { in: risk.assesmentTeam },
                },
                select: {
                  id: true,
                  username: true,
                  email: true,
                  firstname: true,
                  lastname: true,
                  avatar: true,
                },
              });
              assesmentTeam = assesmentTeam?.map((item) => ({
                ...item,
                label: item.username,
                value: item.id,
              }));

              //console.log('assesmentTeam', assesmentTeam);
            }

            // if (!!risk.condition) {
            //   selectedCondtions = risk.hiraConfigId?.condition?.filter(
            //     (item: any) => item._id.toString() === risk.condition,
            //   )[0];
            // }

            if (!!risk.impactType) {
              const findImpactType = await this.impactTypeModel
                .findOne({
                  _id: risk.impactType,
                  deleted: false,
                })
                .select('_id name');

              // console.log('findImpactType', findImpactType);

              selectedImpactTypes = findImpactType;
            }

            if (!!risk.aspectType) {
              const findAspectType = await this.aspectTypeModel
                .findOne({
                  _id: risk.aspectType,
                  deleted: false,
                })
                .select('_id name');

              // console.log('findAspectType', findAspectType);

              selectedAspectTypes = findAspectType;
            }

            if (!!risk.act) {
              const findAct = await this.actModel
                .findOne({
                  _id: risk.act,
                  deleted: false,
                })
                .select('_id name');

              // console.log('findAct', findAct);

              selectedAct = findAct;
            }

            return {
              ...risk,
              entity,
              location,
              selectedRiskTypes,
              selectedConditions,
              selectedImpactTypes,
              selectedAspectTypes,
              selectedAct,
              assesmentTeam,
              createdByUserDetails,
            };
          }),
        );
        ////console.log("list",list);
        const total = await this.aspImpModel.countDocuments(riskQuery);
        return { list, total };
      }
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET /aspect-impact/fetchRevisionHistory $payload query ${query}  failed with error ${error} `,);
        throw new InternalServerErrorException(error);
    }
  }

  async createEntryInHiraHistoryTrack(body: any) {
    try {
      let allAspectImpactIds = [];
      const fetchAllHiraByJobTitle = await this.aspImpModel
        .find({
          // jobTitle: body?.jobTitle,
          entityId: body?.entityId,
          status: 'active',
        })
        .select('_id');

      if (fetchAllHiraByJobTitle?.length > 0) {
        allAspectImpactIds = fetchAllHiraByJobTitle.map((item) =>
          item?._id?.toString(),
        );
      }

      console.log(
        'allAspectImpactIds in createReviewHistroyEntry',
        allAspectImpactIds,
      );

      if (!!allAspectImpactIds?.length) {
        const query = {
          // jobTitle: body?.jobTitle,
          entityId: body?.entityId,
          organizationId: body?.organizationId, // Assuming organizationId is part of body
        };

        const update = {
          ...body,
          hiraRegisterIds: allAspectImpactIds,
          status: 'active',
        };

        const options = { new: true, upsert: true, setDefaultsOnInsert: true };

        const createOrUpdateEntry =
          await this.aspImpChangesTrackModel.findOneAndUpdate(
            query,
            update,
            options,
          );

        return createOrUpdateEntry;
      } else {
        // If allHiraIds array is empty, throw a NotFoundException
        throw new NotFoundException(
          'No AspImp records found for the given department.',
        );
      }
    } catch (error: any) {
      this.logger.error(
        `trace id=${uuid()}, POST  /aspect-impact/createEntryInHiraHistoryTrack $payload body ${body}  failed with error ${error} `,);
      // Check if the error is an instance of NotFoundException
      if (error instanceof NotFoundException) {
        // You can handle NotFoundException specifically if needed
        // For example, send a specific response
        throw new NotFoundException(error.message);
      } else {
        // For other errors, throw InternalServerErrorException
        throw new InternalServerErrorException(error);
      }
    }
  }

  async fetchEntryInHiraHistoryTrack(
    entityId: any,
    orgId: any,
    //  entityId: any
  ) {
    try {
      let details = await this.aspImpChangesTrackModel
        .findOne({
          organizationId: orgId,
          entityId: entityId,
        })
        .lean();
        this.logger.log(
          `trace id=${uuid()} GET /aspect-impact/fetchEntryInHiraHistoryTrack  payload entityId ${entityId} service successful`,
          '',
        );
        if(!details){ 
          return {data : null}
        }
        return details;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET /aspect-impact/fetchEntryInHiraHistoryTrack $payload entityId ${entityId}  failed with error ${error} `,);
        throw new InternalServerErrorException(error);
    }
  }

  async getGroupedImpactDashboard(query: any) {
    try {
      // console.log('QUERY IN group impact ->', query);
      let whereCondition: any = {};
      whereCondition = {
        status: { $in: ['active', 'inWorkflow'] },
        deleted: false,
        organizationId: query?.organizationId,
      };
      if (!!query?.jobTitle?.length) {
        whereCondition = {
          ...whereCondition,

          jobTitle: { $in: query?.jobTitle },
        };
      }
      if (!!query?.entity?.length) {
        whereCondition = {
          ...whereCondition,
          entityId: { $in: query?.entity },
        };
      }
      if (!!query?.unit?.length) {
        whereCondition = {
          ...whereCondition,
          locationId: { $in: query?.unit },
        };
      }
      if (!!query?.fromDate && !!query?.toDate) {
        whereCondition = {
          ...whereCondition,
          createdAt: {
            $gte: new Date(query?.fromDate),
            $lt: new Date(query?.toDate),
          },
        };
      }
      // console.log('whereCondition in gruoup impact', whereCondition);

      const aspectImpacts = await this.aspImpModel
        .find(
          whereCondition,
          //   {
          //   organizationId: orgId,
          //   entityId: entityId,
          // }
        )
        .select('_id jobTitle activity impactType');

      const impactTypes = await this.impactTypeModel
        .find({
          organizationId: query?.organizationId,
          deleted: false,
        })
        .select('_id name');

      const impactTypeCounts = impactTypes.map((impactType) => {
        const count = aspectImpacts.filter(
          (aspectImpact) =>
            aspectImpact.impactType === impactType._id.toString(),
        ).length;

        return {
          impactTypeName: impactType.name,
          impactType: impactType._id,
          count,
        };
      });

      // Calculate total count of all impact types
      const totalCount = impactTypeCounts.reduce(
        (acc, curr) => acc + curr.count,
        0,
      );

      // Calculate percentages for each impact type
      const impactTypePercentages = impactTypeCounts.map((impactType) => ({
        ...impactType,
        percentage:
          totalCount > 0
            ? ((impactType.count / totalCount) * 100).toFixed(2) + '%'
            : '0%',
      }));
      this.logger.log(
        `trace id=${uuid()} GET /aspect-impact/getGroupedImpactDashboard  payload query ${query} service successful`,
        '',
      );
      return {
        impactTypeCounts: impactTypePercentages, // Updated to include percentages
        totalCount, // Total count of all impact types
      };
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET /aspect-impact/getGroupedImpactDashboard $payload query ${query}  failed with error ${error} `,);
        throw new InternalServerErrorException(error)
    }
  }

  async getGroupedAspectDashboard(query) {
    try {
      // console.log('QUERY IN group aspecte ->', query);
      let whereCondition: any = {};
      whereCondition = {
        status: { $in: ['active', 'inWorkflow'] },
        deleted: false,
        organizationId: query?.organizationId,
      };
      if (!!query?.jobTitle?.length) {
        whereCondition = {
          ...whereCondition,

          jobTitle: { $in: query?.jobTitle },
        };
      }
      if (!!query?.entity?.length) {
        whereCondition = {
          ...whereCondition,
          entityId: { $in: query?.entity },
        };
      }
      if (!!query?.unit?.length) {
        whereCondition = {
          ...whereCondition,
          locationId: { $in: query?.unit },
        };
      }
      if (!!query?.fromDate && !!query?.toDate) {
        whereCondition = {
          ...whereCondition,
          createdAt: {
            $gte: new Date(query?.fromDate),
            $lt: new Date(query?.toDate),
          },
        };
      }
      // console.log('whereCondition in gruoup aspect', whereCondition);

      let aspectImpacts = await this.aspImpModel
        .find(
          whereCondition,
          //   {
          //   organizationId: orgId,
          //   entityId: entityId,
          // }
        )
        .select(
          '_id jobTitle activity aspectType legalImpact interestedParties mitigations postMitigationScore postSeverity preMitigationScore preSeverity year',
        );

      // console.log('ai before filter', aspectImpacts?.length);

      // Filter aspectImpacts based on the significance criteria
      aspectImpacts = aspectImpacts.filter(this.calculateIfSignificant);

      // console.log('ai after filter', aspectImpacts?.length);

      const aspectTypes = await this.aspectTypeModel
        .find({
          organizationId: query?.organizationId,
          deleted: false,
        })
        .select('_id name');

      // Group aspectImpacts by year
      const groupedByYear = aspectImpacts.reduce((acc, aspectImpact) => {
        const year = aspectImpact.year;
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push(aspectImpact);
        return acc;
      }, {});

      // Initialize the response structure
      const response = {
        labels: [],
        datasets: [],
      };

      // Set labels (years)
      response.labels = Object.keys(groupedByYear);

      // Array of colors for the datasets
      const colors = [
        '#3e95cd',
        '#8e5ea2',
        '#3cba9f',
        '#e8c3b9',
        '#c45850' /* ... other colors ... */,
      ];

      // Prepare datasets
      aspectTypes.forEach((aspectType, index) => {
        const dataset = {
          label: aspectType.name,
          data: [],
          borderColor: colors[index % colors.length], // Cycle through colors array
          fill: false,
        };

        response.labels.forEach((year) => {
          const count = groupedByYear[year].filter(
            (impact) => impact.aspectType === aspectType._id.toString(),
          ).length;
          if (count > 0) {
            dataset.data.push(count);
          }
        });

        // Add dataset only if it has non-zero counts
        if (dataset.data.length > 0) {
          response.datasets.push(dataset);
        }
      });
      this.logger.log(
        `trace id=${uuid()} GET /aspect-impact/getGroupedAspectDashboard  payload query ${query} service successful`,
        '',
      );
      return response;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET /aspect-impact/getGroupedAspectDashboard $payload query ${query}  failed with error ${error} `,);
        throw new InternalServerErrorException(error)
    }
  }

  async calculateIfSignificant(rowData) {
    if (rowData?.legalImpact === 'Yes') {
      return true;
    } else if (rowData?.interestedParties?.length) {
      return true;
    } else {
      if (rowData?.mitigations && rowData?.mitigations?.length) {
        if (rowData?.postMitigationScore >= 9 || rowData?.postSeverity >= 3) {
          return true;
        }
      } else {
        if (rowData?.preMitigationScore >= 9 || rowData?.preSeverity >= 3) {
          return true;
        }
      }
    }
    return false;
  }

  async getTopTenAspImp(query) {
    try {
      // console.log('QUERY IN top 10 ->', query);
      let whereCondition: any = {};
      whereCondition = {
        status: { $in: ['active', 'inWorkflow'] },
        deleted: false,
        organizationId: query?.organizationId,
      };

      if (!!query?.entity?.length) {
        whereCondition = {
          ...whereCondition,
          entityId: { $in: query?.entity },
        };
      }
      if (!!query?.unit?.length) {
        whereCondition = {
          ...whereCondition,
          locationId: { $in: query?.unit },
        };
      }
     
      // console.log('whereCondition in top 10', whereCondition);

      const aspectImpacts = await this.aspImpModel
        .find({
          // organizationId: orgId,
          // entityId: entityId,
          ...whereCondition,
          postMitigationScore: { $gt: 0 }, // Exclude aspect impacts with a postMitigationScore of 0
        })
        .select('_id jobTitle entityId activity impactType postMitigationScore')
        .sort({ postMitigationScore: -1 }) // Sort by postMitigationScore in descending order
        .limit(10) // Limit to the top 10 results
        .lean()
   

      const entityIds = new Set();
      aspectImpacts.forEach((aspectImpact) => {
        entityIds.add(aspectImpact?.entityId);
      });
      let entityDetails;

      if (Array.from(entityIds).length) {
        entityDetails = await this.prisma.entity.findMany({
          where: {
            id: { in: Array.from(entityIds) as any },
          },
          select: {
            id: true,
            entityName: true,
          },
        });
      }
      const entityMap = new Map(
        entityDetails?.map((entity) => [entity.id, entity]),
      );
      const finalList = aspectImpacts.map((aspectImpact) => {
        const entity : any = entityMap.get(aspectImpact?.entityId);
        return {
          ...aspectImpact,
          entityName: entity?.entityName,
        }})
        this.logger.log(
          `trace id=${uuid()} GET /aspect-impact/getTopTenAspImp  payload query ${query} service successful`,
          '',
        );
      return finalList;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET /aspect-impact/getTopTenAspImp $payload query ${query}  failed with error ${error} `,);
        throw new InternalServerErrorException(error)
    }
  }

  async mapserialnumber(serialnumber, locationId, entityId, organizationId) {
    //console.log('va;ues', entityId);

    const currentTime = new Date();
    const year = currentTime.getFullYear();
    const currentYear: any = await this.organizationService.getFiscalYear(
      organizationId,
      year,
    );
    const organization = await this.prisma.organization.findFirst({
      where: {
        id: organizationId,
      },
      select: {
        fiscalYearFormat: true,
      },
    });
    let showyear;
    if (organization.fiscalYearFormat === 'YY-YY+1') {
      showyear = currentYear;
    } else {
      showyear = currentYear.toString().slice(-2);
    }
    const location = await this.prisma.location.findFirst({
      where: {
        id: locationId,
      },
      select: {
        locationId: true,
      },
    });
    const entity = await this.prisma.entity.findFirst({
      where: {
        id: entityId,
      },
      select: {
        entityId: true,
      },
    });
    const month = (currentTime.getMonth() + 1).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
    }); //get current month
    const serialNumber1 = serialnumber
      .replace(/LocationId/g, locationId ? location.locationId : '') // replace all occurrences of 'LocationId'
      .replace(/DepartmentId/g, entityId ? entity.entityId : '') // replace all occurrences of 'DepartmentId'
      .replace(/YY/g, showyear) // replace all occurrences of 'YY' with last two digits of currentyear fron std api
      .replace(/MM/g, month); // replace all occurrences of 'MM'

    return serialNumber1;
  }
  async getAspImpForInbox(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: {
          organization: true,
          entity: true,
        },
      });
      // console.log('getAspimp called');
      const isReviewer = await this.aspImpConsolidatedStatusModel.find({
        organizationId: activeUser.organizationId,
        status: 'IN_REVIEW',
        reviewers: { $elemMatch: { $eq: activeUser.id } },
        // entityId: activeUser.entityId,
      });
      const isApprover = await this.aspImpConsolidatedStatusModel.find({
        organizationId: activeUser.organizationId,
        status: 'IN_APPROVAL',
        approvers: { $elemMatch: { $eq: activeUser.id } },
        // entityId: activeUser.entityId,
      });
      const isCreator = await this.aspImpConsolidatedStatusModel.find({
        organizationId: activeUser.organizationId,
        status: 'REJECTED',
        createdBy: activeUser.id,
        // entityId: activeUser.entityId,
      });

      let entityIds:any = new Set();
      if(!!isReviewer?.length) {
        isReviewer.forEach((item) => {
          entityIds.add(item.entityId);
        });
      }
      
      if(!!isApprover?.length) {
        isApprover.forEach((item) => {
          entityIds.add(item.entityId);
        });
      }

      if(!!isCreator?.length) {
        isCreator.forEach((item) => {
          entityIds.add(item.entityId);
        });
      }

      let entityIdArray  = Array.from(entityIds);
      entityIdArray = entityIdArray.filter((item) => item !== null && item !== undefined);

      let entities = await this.prisma.entity.findMany({
        where : {
          id: { in: Array.from(entityIds) }
        },
        select: {
          id: true,
          entityName: true
        }});

        let entityMap = new Map(entities.map((entity) => [entity.id, entity]));

      let reviewerArray = [],
        approverArray = [],
        creatorArray = [];
      for (let rec of isReviewer) {
        let url;
        // console.log("rec in isReveiewer", rec);
        
        //http://apple.localhost:3000/audit/auditschedule/auditscheduleform/schedule/65fbf804569a970e4dec207b
        if (process.env.MAIL_SYSTEM === 'IP_BASED') {
          url = `${process.env.PROTOCOL}://${process.env.REDIRECT}/risk/riskregister/AspectImpact/workflow/${rec?._id}`;
        } else {
          url = `${process.env.PROTOCOL}://${activeUser.organization?.realmName}.${process.env.REDIRECT}/risk/riskregister/AspectImpact/workflow/${rec?._id}`;
        }
        let data: any = {
          _id: __dirname,
          url: url,
          entity: entityMap?.get(rec?.entityId)?.entityName,
          rec,
        };
        reviewerArray.push(data);
      }
      for (let rec of isApprover) {
        let url;
        //http://apple.localhost:3000/audit/auditschedule/auditscheduleform/schedule/65fbf804569a970e4dec207b
        if (process.env.MAIL_SYSTEM === 'IP_BASED') {
          url = `${process.env.PROTOCOL}://${process.env.REDIRECT}/risk/riskregister/AspectImpact/workflow/${rec?._id}`;
        } else {
          url = `${process.env.PROTOCOL}://${activeUser.organization?.realmName}.${process.env.REDIRECT}/risk/riskregister/AspectImpact/workflow/${rec?._id}`;
        }
        let data: any = {
          _id: __dirname,
          url: url,
          entity: entityMap?.get(rec?.entityId)?.entityName,
          rec,
        };
        approverArray.push(data);
      }
      for (let rec of isCreator) {
        let url;
  
        if (process.env.MAIL_SYSTEM === 'IP_BASED') {
          url = `${process.env.PROTOCOL}://${process.env.REDIRECT}/risk/riskregister/AspectImpact/workflow/${rec?._id}`;
        } else {
          url = `${process.env.PROTOCOL}://${activeUser.organization?.realmName}.${process.env.REDIRECT}/risk/riskregister/AspectImpact/workflow/${rec?._id}`;
        }
        let data: any = {
          _id: __dirname,
          url: url,
          entity: entityMap?.get(rec?.entityId)?.entityName,
          rec,
        };
        creatorArray.push(data);
      }
      this.logger.log(
        `trace id=${uuid()} GET /aspect-impact/getAspImpForInbox  payload user ${user} service successful`,
        '',
      );
      return {
        reviewState: reviewerArray,
        approveState: approverArray,
        creatorState: creatorArray,
      };
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET /aspect-impact/getAspImpForInbox $payload user ${user}  failed with error ${error} `,);
        throw new InternalServerErrorException(error)
    }
  }

  async getTableDataBasedOnFilters(query: any) {
    try {
      let page = query?.page ? parseInt(query.page) : 1;
      let pageSize = query?.pageSize ? parseInt(query.pageSize) : 10;
      const skip = (page - 1) * pageSize;

      let whereCondition: any = {
        organizationId: query?.organizationId,
        status: { $in: ['active', 'inWorkflow'] },
      };

      if (!!query?.jobTitle?.length) {
        whereCondition = {
          ...whereCondition,

          jobTitle: { $in: query?.jobTitle },
        };
      }
      if (!!query?.entity?.length) {
        whereCondition = {
          ...whereCondition,
          entityId: { $in: query?.entity },
        };
      }
      if (!!query?.unit?.length) {
        whereCondition = {
          ...whereCondition,
          locationId: { $in: query?.unit },
        };
      }
      if (!!query?.fromDate && !!query?.toDate) {
        whereCondition = {
          ...whereCondition,
          createdAt: {
            $gte: new Date(query?.fromDate),
            $lt: new Date(query?.toDate),
          },
        };
      }

      if (!!query?.impactType) {
        whereCondition.impactType = query?.impactType;
      }

      // console.log('where condition in asp imp table data', whereCondition);
      let aspImpData = this.aspImpModel
      .find(whereCondition)
      .sort({ createdAt: 1 })
      .populate("hiraConfigId")
      .populate("mitigations")
    
    
    if (query?.pagination !== "false") {
      aspImpData = aspImpData.skip(skip).limit(pageSize);
    }
    
    let list = await aspImpData.lean();
      let allUserIds = list
        ?.map((item: any) =>
          item?.mitigations?.length
            ? item?.mitigations?.map(
                (mitigation: any) => mitigation?.responsiblePerson,
              )
            : '',
        )
        .filter((item: any) => !!item)
        .flat();
      // console.log('all user ids', allUserIds);

      let userDetails = [];
      if (allUserIds?.length) {
        userDetails = await this.prisma.user.findMany({
          where: {
            id: { in: allUserIds },
          },
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
          },
        });
      }
      let userMap = new Map(userDetails?.map((user: any) => [user.id, user]));
      // console.log('userMap', userMap);

      list = await Promise.all(
        list.map(async (risk: any) => {
          let location,
            entity,
            selectedRiskTypes,
            selectedConditions,
            selectedImpactTypes,
            selectedAspectTypes,
            selectedAct,
            assesmentTeam,
            mitigations;

          if (risk.entityId) {
            entity = await this.prisma.entity.findUnique({
              where: { id: risk.entityId },
              select: { id: true, entityName: true },
            });
          }
          if (!!risk.condition) {
            selectedConditions = risk.hiraConfigId?.condition?.filter(
              (item: any) => item._id.toString() === risk.condition,
            )[0];
          }
          // Fetch and map location
          if (risk.locationId) {
            location = await this.prisma.location.findUnique({
              where: { id: risk.locationId },
              select: { id: true, locationName: true },
            });
          }

          if (!!risk.assesmentTeam) {
            assesmentTeam = await this.prisma.user.findMany({
              where: {
                id: { in: risk.assesmentTeam },
              },
              select: {
                id: true,
                username: true,
                email: true,
                firstname: true,
                lastname: true,
                avatar: true,
              },
            });
            assesmentTeam = assesmentTeam?.map((item) => ({
              ...item,
              label: item.username,
              value: item.id,
            }));

            //console.log('assesmentTeam', assesmentTeam);
          }

          // if (!!risk.condition) {
          //   selectedCondtions = risk.hiraConfigId?.condition?.filter(
          //     (item: any) => item._id.toString() === risk.condition,
          //   )[0];
          // }

          if (!!risk.impactType) {
            const findImpactType = await this.impactTypeModel
              .findOne({
                _id: risk.impactType,
                deleted: false,
              })
              .select('_id name');

            // console.log('findImpactType', findImpactType);

            selectedImpactTypes = findImpactType;
          }

          if (!!risk.aspectType) {
            const findAspectType = await this.aspectTypeModel
              .findOne({
                _id: risk.aspectType,
                deleted: false,
              })
              .select('_id name');

            // console.log('findAspectType', findAspectType);

            selectedAspectTypes = findAspectType;
          }

          if (!!risk.act) {
            const findAct = await this.actModel
              .findOne({
                _id: risk.act,
                deleted: false,
              })
              .select('_id name');

            // console.log('findAct', findAct);

            selectedAct = findAct;
          }
          if (risk?.mitigations?.length) {
            mitigations = risk?.mitigations?.map((mitigation: any) => {
              return {
                ...mitigation,
                responsiblePersonDetails: userMap.get(
                  mitigation.responsiblePerson,
                )
                  ? userMap.get(mitigation.responsiblePerson)
                  : '',
              };
            });
            // console.log('mititigationAAA', mitigations);

            // console.log('mitigations', mitigations);
          }

          return {
            ...risk,
            mitigations: mitigations,
            entity,
            location,
            selectedRiskTypes,
            selectedConditions,
            selectedImpactTypes,
            selectedAspectTypes,
            selectedAct,
            assesmentTeam,
          };
        }),
      );

      const total = await this.aspImpModel.countDocuments(whereCondition);
      this.logger.log(
        `trace id=${uuid()} GET /aspect-impact/getTableDataBasedOnFilters  query ${query} service successful`,
        '',
      );
      return { list, total };
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, GET /aspect-impact/getTableDataBasedOnFilters $payload query ${query}  failed with error ${err} `,);
        throw new InternalServerErrorException(err)
    }
  }

  async fetchAspImpDashboardCounts(orgId: string, query: any) {
    try {
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
  
      if (query?.isPrimaryFilter) {
        // Primary Filter Applied
        let whereCondition: any = {
          status: { $in: ["active", "inWorkflow"] },
          deleted: false,
          organizationId: orgId,
        };

        
  
        let whereConditionForCurrentYear: any = {
          ...whereCondition,
          createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
        };
  
        if (!!query?.entity?.length) {
          whereCondition.entityId = { $in: query.entity };
          whereConditionForCurrentYear.entityId = { $in: query.entity };
        }
        if (!!query?.unit?.length) {
          whereCondition.locationId = { $in: query.unit };
          whereConditionForCurrentYear.locationId = { $in: query.unit };
        }
        // if (!!query?.fromDate && !!query?.toDate) {
        //   const dateFilter = {
        //     $gte: new Date(query.fromDate),
        //     $lt: new Date(query.toDate),
        //   };
        //   // whereCondition.createdAt = dateFilter;
        //   // whereConditionForCurrentYear.createdAt = dateFilter;
        // }
  
        const totalAspImp = await this.aspImpModel.countDocuments({
          ...whereCondition,
        });
  
        const inWorkflowAspImp = await this.aspImpModel.countDocuments({
          ...whereCondition,
          status:"inWorkflow",
        });
  
        const currentYearAspImp = await this.aspImpModel.countDocuments({
          ...whereConditionForCurrentYear,
        });
  
        const formattedResult = {
          totalAspImp,
          inWorkflowAspImp,
          currentYearAspImp,
        };
  
        this.logger.log(
          `trace id=${uuid()}, GET /aspect-impact/fetchAspImpDashboardCounts payload query ${query} success`,
          "",
        );
        return formattedResult;
      } else {
        // Default Filter Applied
        let entityQueryForTotal: any = {
          organizationId: orgId,
          entityId: query?.entity[0],
          status: { $in: ["active", "inWorkflow"] },
          deleted: false,
        };
  
        let entityQueryForCurrentYear: any = {
          ...entityQueryForTotal,
          createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
        };
  
        let locationQueryForTotal: any = {
          organizationId: orgId,
          locationId: query?.unit[0],
          status: { $in: ["active", "inWorkflow"] },
          deleted: false,
        };
  
        let locationQueryForCurrentYear: any = {
          ...locationQueryForTotal,
          createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
        };
  
        const totalAspImpEntityWise = await this.aspImpModel.countDocuments({
          ...entityQueryForTotal,
        });
  
        const totalAspImpLocationWise = await this.aspImpModel.countDocuments({
          ...locationQueryForTotal,
        });
  
        const inWorkflowEntityWise = await this.aspImpModel.countDocuments({
          ...entityQueryForTotal,
          status:"inWorkflow",
        });
  
        const inWorkflowLocationWise = await this.aspImpModel.countDocuments({
          ...locationQueryForTotal,
          status:"inWorkflow",
        });
  
        const currentYearEntityWise = await this.aspImpModel.countDocuments({
          ...entityQueryForCurrentYear,
        });
  
        const currentYearLocationWise = await this.aspImpModel.countDocuments({
          ...locationQueryForCurrentYear,
        });
  
        const formattedResult = {
          totalEntityWise: totalAspImpEntityWise,
          totalLocationWise: totalAspImpLocationWise,
          inWorkflowEntityWise,
          inWorkflowLocationWise,
          currentYearEntityWise,
          currentYearLocationWise,
        };
  
        this.logger.log(
          `trace id=${uuid()}, GET /aspect-impact/fetchAspImpDashboardCounts payload query ${query} success`,
          "",
        );
        return formattedResult;
      }
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET /aspect-impact/fetchAspImpDashboardCounts payload query ${query} failed with error ${error}`,
      );
      throw new InternalServerErrorException(error);
    }
  }
  
  async deleteStage(aspImpId) {
    try {
      const deleteStage :any = await this.aspImpModel.findByIdAndDelete(aspImpId);
      // console.log("delete stage", deleteStage)
      if (deleteStage) {
        this.logger.log(
          `trace id=${uuid()} DELETE /aspect-impact/deletestage   payload  service successful`,
          '',
        );
        return {
          message: 'Stage Deleted successfully',
          data: deleteStage,
        };
      } else {
        throw new HttpException(
          'Stage Deletion failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, DELETE /aspect-impact/deletestage  $payload actId ${aspImpId}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }


  async fetchAspImpConslidatedCount(orgId: string) {
    // Step 1: Fetch all entities (with locationId for grouping)
    const entities = await this.prisma.entity.findMany({
      where: { organizationId: orgId },
      select: { id: true, entityName: true, locationId: true },
    });
  
    const entityIdToEntityMap = new Map(
      entities.map((e) => [e.id, e])
    );
  
    // Step 2: Fetch all AspImpConsolidatedStatus documents
    const statusDocs = await this.aspImpConsolidatedStatusModel
      .find({ organizationId: orgId })
      .select('entityId status')
      .lean();
  
    // Step 3: Count status by entityId
    const statusMap = new Map<string, { IN_REVIEW: number; IN_APPROVAL: number; APPROVED: number }>();
  
    for (const doc of statusDocs) {
      const { entityId, status } = doc;
      if (!statusMap.has(entityId)) {
        statusMap.set(entityId, {
          IN_REVIEW: 0,
          IN_APPROVAL: 0,
          APPROVED: 0,
        });
      }
  
      const statusCounts = statusMap.get(entityId);
      if (statusCounts && status in statusCounts) {
        statusCounts[status]++;
      }
    }
  
    // Step 4: Get entityIds having DRAFT from aspImpModel
    const draftEntityDocs = await this.aspImpModel
      .find({ organizationId: orgId, status: 'DRAFT' })
      .select('entityId')
      .lean();
  
    const draftEntityIdSet = new Set(draftEntityDocs.map((doc) => doc.entityId));
  
    // Step 5: Group entities by location
    const locationMap = new Map<
      string,
      { _id: string; locationName: string; entityGroupedCount: any[] }
    >();
  
    // Fetch all required location names
    const locationIds = [...new Set(entities.map((e) => e.locationId).filter(Boolean))];
    const locationDocs = await this.prisma.location.findMany({
      where: { id: { in: locationIds } },
      select: { id: true, locationName: true },
    });
    const locationIdToName = new Map(locationDocs.map((l) => [l.id, l.locationName]));
  
    // Step 6: Build entity status per location
    for (const entity of entities) {
      const baseStatus = statusMap.get(entity.id) || {
        IN_REVIEW: 0,
        IN_APPROVAL: 0,
        APPROVED: 0,
      };
      const DRAFT = draftEntityIdSet.has(entity.id) ? 1 : 0;
      const inWorkflow = baseStatus.IN_REVIEW + baseStatus.IN_APPROVAL;
      const total = baseStatus.IN_REVIEW + baseStatus.IN_APPROVAL + baseStatus.APPROVED + DRAFT;
  
      // Filter out empty entries
      if (total === 0) continue;
  
      const entityInfo = {
        entityId: entity.id,
        entityName: entity.entityName,
        IN_REVIEW: baseStatus.IN_REVIEW,
        IN_APPROVAL: baseStatus.IN_APPROVAL,
        APPROVED: baseStatus.APPROVED,
        DRAFT,
        inWorkflow,
        total,
      };
  
      const locationId = entity.locationId || 'no-location';
      if (!locationMap.has(locationId)) {
        locationMap.set(locationId, {
          _id: locationId,
          locationName: locationIdToName.get(locationId) || 'Unknown',
          entityGroupedCount: [],
        });
      }
  
      locationMap.get(locationId)!.entityGroupedCount.push(entityInfo);
    }
  
    return [...locationMap.values()];
  }
  

}
