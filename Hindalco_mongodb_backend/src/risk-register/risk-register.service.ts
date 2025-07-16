import {
  Injectable,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
  NotFoundException,
  ConflictException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  Riskschema,
  riskSchema,
} from './riskRegisterSchema/riskRegister.schema';
import {
  riskMitigation,
  riskMitigationDocument,
} from './riskRegisterSchema/riskMitigation.schema';
import { RiskConfig } from 'src/risk/riskConfigSchema/riskconfig.schema';
import {
  RiskReviewComments,
  RiskReviewCommentsSchema,
} from './riskRegisterSchema/riskReviewComments.schema';
import {
  HiraRegister,
  HiraRegisterSchema,
} from './hiraRegisterSchema/hiraRegister.schema';
import {
  HiraMitigation,
  HiraMitigationSchema,
} from './hiraRegisterSchema/hiraMitigation.schema';
import {
  HiraOwnerComments,
  HiraOwnerCommentsSchema,
} from './hiraRegisterSchema/hiraOwnerComments.schema';
import {
  HiraReviewComments,
  HiraReviewCommentsSchema,
} from './hiraRegisterSchema/hiraReviewComments.schema';
import {
  HiraTypeConfig,
  HiraTypeConfigSchema,
} from 'src/risk/schema/hiraTypesSchema/hiraTypes.schema';
import {
  HiraConsolidatedStatus,
  hiraConsolidatedStatusSchema,
} from './hiraRegisterSchema/hiraConsolidatedStatus.schema';

import {
  HiraReviewHistory,
  HiraReviewHistorySchema,
} from './hiraRegisterSchema/hiraReviewHistory.schema';

import { HiraChangesTrack } from './hiraRegisterSchema/hiraChangesTrack.schema';
import { RefsService } from 'src/refs/refs.service';
import { HiraConfig } from 'src/risk/schema/hiraConfigSchema/hiraconfig.schema';
import { HiraAreaMaster } from 'src/risk/schema/hiraAreaMasterSchema/hiraAreaMaster.schema';
import { Hira, HiraSchema } from './hiraRegisterSchema/hira.schema';
import {
  HiraSteps,
  HiraStepsSchema,
} from './hiraRegisterSchema/hiraSteps.schema';
import { PrismaService } from 'src/prisma.service';
import { ObjectId } from 'bson';
import * as sgMail from '@sendgrid/mail';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { OrganizationService } from 'src/organization/organization.service';
import { EmailService } from 'src/email/email.service';
import { Logger, log } from 'winston';
import { v4 as uuid } from 'uuid';
import auditTrial from '../watcher/changesStream';
import { CreateHiraDto } from './dto/create-hira.dto';
import { CreateHiraStepsDto } from './dto/create-hiraStep.dto';
import { UpdateHiraDto } from './dto/update-hira.dto';
import { UpdateHiraStepsDto } from './dto/update-hiraStep.dto';
import * as fs from 'fs';
import * as XLSX from 'xlsx'
import {
  getApproverMailTemplate,
  getCreatorAndReviewerMailTemplateWhenHiraIsRejected,
  getCreatorMailTemplateWhenHiraIsApproved,
  getResponsiblePersonMailTempalateWhenHiraIsApproved,
  getReviewerMailTemplate,
} from './hiraMailTemplates/templates';

const moment = require('moment');
sgMail.setApiKey(process.env.SMTP_PASSWORD);

@Injectable()
export class RiskRegisterService {
  constructor(
    @InjectModel(Riskschema.name) private riskModel: Model<Riskschema>,
    @InjectModel(riskMitigation.name)
    private riskMitigationModel: Model<riskMitigation>,
    @InjectModel(RiskConfig.name) private riskConfigModel: Model<RiskConfig>,
    @InjectModel(RiskReviewComments.name)
    private riskReviewCommentsModel: Model<RiskReviewComments>,

    @InjectModel(HiraRegister.name)
    private hiraRegisterModel: Model<HiraRegister>,
    @InjectModel(HiraMitigation.name)
    private hiraMitigationModel: Model<HiraMitigation>,
    @InjectModel(HiraOwnerComments.name)
    private hiraOwnerCommentsModel: Model<HiraOwnerComments>,
    @InjectModel(HiraReviewComments.name)
    private hiraReviewCommentsModel: Model<HiraReviewComments>,
    @InjectModel(HiraTypeConfig.name)
    private hiraTypeConfigModel: Model<HiraTypeConfig>,
    @InjectModel(HiraConsolidatedStatus.name)
    private hiraConsolidatedStatusModel: Model<HiraConsolidatedStatus>,

    @InjectModel(HiraReviewHistory.name)
    private hiraReviewHistoryModel: Model<HiraReviewHistory>,

    @InjectModel(HiraChangesTrack.name)
    private hiraChangesTrackModel: Model<HiraChangesTrack>,

    @InjectModel(HiraConfig.name) private hiraConfigModel: Model<HiraConfig>,
    @InjectModel(HiraAreaMaster.name)
    private hiraAreaMasterModel: Model<HiraAreaMaster>,
    @InjectModel(Hira.name) private hiraModel: Model<Hira>,
    @InjectModel(HiraSteps.name) private hiraStepsModel: Model<HiraSteps>,
    @Inject('Logger') private readonly logger: Logger,

    private readonly organizationService: OrganizationService,
    private readonly serialNumberService: SerialNumberService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private refsService: RefsService,
  ) {}

  async uploadsAttachment(files: any, data) {
    try {
      //file,req.query.realm.toLowerCase()
      //////console.log('check files', files);
      //////console.log('check data', data);

      const attachments = [];
      const realmName = data.realm.toLowerCase();
      let locationName;

      if (data?.locationName) {
        locationName = data?.locationName;
      } else {
        locationName = 'NoLocation';
      }

      for (let file of files) {
        const attachmentUrl = `${process.env.SERVER_IP}/${realmName}/${locationName}/risk/hiraAttachments/${file.filename}`;
        attachments.push({
          attachmentUrl,
          attachmentName: file.originalname,
        });
      }
      // const path = file.path;
      return attachments;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }

  getExcelObj(excelRow: any) {
    const filteredData = excelRow.filter((item: any) => !!item);

    let prevHeader = null;
    const excelObj = filteredData.reduce((acc: any, item: any) => {
      if (!prevHeader) {
        prevHeader = item;
        return { ...acc, [prevHeader]: null };
      } else {
        acc[prevHeader] = item;
        prevHeader = null;
      }
      return acc;
    }, {});

    return excelObj;
  }



  private async streamToBuffer(stream: fs.ReadStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: any[] = [];
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', err => reject(err));
    });
  }



  async validateImport(file: any, userId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting validateImport`,
      JSON.stringify({ filePath: file?.path, userId }),
    );

    try {
      if (!fs.existsSync(file.path)) {
        this.logger.debug(
          `traceId=${traceId} - File not found at path`,
          JSON.stringify({ filePath: file?.path }),
        );
        throw new InternalServerErrorException('File not found');
      }

      this.logger.debug(
        `traceId=${traceId} - Fetching active user`,
        JSON.stringify({ userId }),
      );

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId },
      });

      this.logger.debug(
        `traceId=${traceId} - Active user found`,
        JSON.stringify({ activeUserId: activeUser?.id }),
      );

      // ✅ Read Excel File as Stream (Memory Efficient)
      this.logger.debug(
        `traceId=${traceId} - Creating file stream and reading buffer`,
        JSON.stringify({ filePath: file.path }),
      );

      const fileBuffer = await this.streamToBuffer(fs.createReadStream(file.path));
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

      const sheetNames = workbook.SheetNames;
      const sheetName = sheetNames[0];

      this.logger.debug(
        `traceId=${traceId} - Excel workbook loaded`,
        JSON.stringify({ sheetNames, selectedSheet: sheetName }),
      );

      if (!workbook.Sheets[sheetName]) {
        this.logger.debug(
          `traceId=${traceId} - Invalid sheet name`,
          JSON.stringify({ sheetName }),
        );
        throw new InternalServerErrorException('Invalid Sheet Name');
      }

      const worksheet = workbook.Sheets[sheetName];
      const rawExcelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      this.logger.debug(
        `traceId=${traceId} - Raw excel data extracted`,
        JSON.stringify({ totalRows: rawExcelData.length }),
      );

      // ✅ Define header row counts
      const startingEmptyRows = 1;
      const headerRows = 6;
      const tableHeaderRows = 1;
      const totalRowsToSkip = startingEmptyRows + headerRows + tableHeaderRows;

      this.logger.debug(
        `traceId=${traceId} - Calculated rows to skip`,
        JSON.stringify({ startingEmptyRows, headerRows, tableHeaderRows, totalRowsToSkip }),
      );

      // ✅ Filter out empty rows efficiently
      const excelData = rawExcelData
        .map((row:any) => row?.filter(cell => cell !== undefined && cell !== null && cell !== ''))
        .filter(row => row.length > 0);

      this.logger.debug(
        `traceId=${traceId} - Filtered empty rows`,
        JSON.stringify({ filteredRowCount: excelData.length }),
      );

      // ✅ Define column headings
      const attributeNames = [
        'sNo', 'jobBasicStep', 'hazardDescription', 'impactText', 'existingControl',
        'preProbability', 'preSeverity', 'preMitigationScore',
        'additionalControlMeasure', 'responsiblePerson', 'implementationStatus',
        'postProbability', 'postSeverity', 'postMitigationScore'
      ];

      this.logger.debug(
        `traceId=${traceId} - Defined attribute names`,
        JSON.stringify({ attributeCount: attributeNames.length }),
      );

      // ✅ Convert Excel Data to JSON
      const jsonData = excelData.slice(totalRowsToSkip).map((row) => {
        const rowObject: Record<string, any> = {};
        attributeNames.forEach((name, index) => {
          rowObject[name] = row[index] || 'NA';
        });
        return rowObject;
      });

      this.logger.debug(
        `traceId=${traceId} - Converted to JSON format`,
        JSON.stringify({ jsonDataCount: jsonData.length }),
      );
      

      // ✅ Replace "NA" with 0 in numerical fields
      const formattedJsonData = jsonData.map((item: any) => {
        const preProbability = item.preProbability === 'NA' ? 0 : item.preProbability;
        const preSeverity = item.preSeverity === 'NA' ? 0 : item.preSeverity;
        let postProbability = item.postProbability === 'NA' ? 0 : item.postProbability;
        let postSeverity = item.postSeverity === 'NA' ? 0 : item.postSeverity;
      
        // If postProbability and postSeverity are 0 and (preProbability * preSeverity) <= 8, copy values
        if (postProbability === 0 && postSeverity === 0 && (preProbability * preSeverity) <= 8) {
          postProbability = preProbability;
          postSeverity = preSeverity;
        }
      
        return {
          ...item,
          preProbability,
          preSeverity,
          postProbability,
          postSeverity,
          preMitigationScore: item.preMitigationScore === 'NA' ? 0 : item.preMitigationScore,
          postMitigationScore: item.postMitigationScore === 'NA' ? 0 : item.postMitigationScore,
        };
      });

      this.logger.debug(
        `traceId=${traceId} - Formatted numerical fields`,
        JSON.stringify({ formattedDataCount: formattedJsonData.length }),
      );
      

      // ✅ Delete the uploaded file after processing
      this.logger.debug(
        `traceId=${traceId} - Deleting uploaded file`,
        JSON.stringify({ filePath: file.path }),
      );

      fs.unlinkSync(file.path);

      const result = {
        steps: formattedJsonData,
        stepsStartingFromRow: totalRowsToSkip + 2,
        totalRowsToSkip,
        sheetNames,
      };

      this.logger.debug(
        `traceId=${traceId} - validateImport completed successfully`,
        JSON.stringify({ 
          stepsCount: formattedJsonData.length,
          stepsStartingFromRow: totalRowsToSkip + 2,
          totalRowsToSkip,
          sheetNamesCount: sheetNames.length
        }),
      );

      this.logger.log(
        `trace id=${uuid()}, POST /risk-register/validateImport processed successfully`, '',
      );

      return result;

    } catch (error) {
      this.logger.error(
        `traceId=${traceId} - validateImport failed with error: ${error.message}`,
        JSON.stringify({ filePath: file?.path, userId }),
      );
      this.logger.error(
        `trace id=${uuid()}, POST /risk-register/validateImport failed with error: ${error}`,
      );
      return new InternalServerErrorException(error);
    }
  }

  async import(file: any, userId: string, body: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting import`,
      JSON.stringify({ filePath: file?.path, userId, sheetName: body?.sheetName }),
    );

    try {
      if (!fs.existsSync(file.path)) {
        this.logger.debug(
          `traceId=${traceId} - File not found at path`,
          JSON.stringify({ filePath: file?.path }),
        );
        throw new InternalServerErrorException('File not found');
      }

      const sheetName = body.sheetName;
      const stepsStartingFromRow = parseInt(body.stepsStartingFromRow) || 0;

      this.logger.debug(
        `traceId=${traceId} - Extracted import parameters`,
        JSON.stringify({ sheetName, stepsStartingFromRow }),
      );

      // ✅ Use `this.streamToBuffer` instead of a standalone function
      this.logger.debug(
        `traceId=${traceId} - Reading file buffer`,
        JSON.stringify({ filePath: file.path }),
      );

      const fileBuffer = await this.streamToBuffer(fs.createReadStream(file.path));
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[sheetName];

      this.logger.debug(
        `traceId=${traceId} - Workbook loaded`,
        JSON.stringify({ sheetName }),
      );

      if (!worksheet) {
        this.logger.debug(
          `traceId=${traceId} - Invalid sheet name`,
          JSON.stringify({ sheetName }),
        );
        throw new InternalServerErrorException('Invalid Sheet Name');
      }

      const rawExcelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      this.logger.debug(
        `traceId=${traceId} - Raw excel data extracted`,
        JSON.stringify({ totalRows: rawExcelData.length }),
      );

      const excelData = rawExcelData.map((row:any) => row?.filter(cell => cell !== undefined && cell !== null));

      this.logger.debug(
        `traceId=${traceId} - Filtered null/undefined cells`,
        JSON.stringify({ filteredRowCount: excelData.length }),
      );

      const attributeNames = [
        'sNo', 'jobBasicStep', 'hazardDescription', 'impactText', 'existingControl',
        'preProbability', 'preSeverity', 'preMitigationScore',
        'additionalControlMeasure', 'responsiblePerson', 'implementationStatus',
        'postProbability', 'postSeverity', 'postMitigationScore'
      ];

      this.logger.debug(
        `traceId=${traceId} - Defined attribute names`,
        JSON.stringify({ attributeCount: attributeNames.length }),
      );

      const rowsToSkip = stepsStartingFromRow - 2;

      this.logger.debug(
        `traceId=${traceId} - Calculated rows to skip`,
        JSON.stringify({ rowsToSkip, stepsStartingFromRow }),
      );

      const jsonData = excelData.slice(rowsToSkip).map((row) => {
        const rowObject: Record<string, any> = {};
        attributeNames.forEach((name, index) => {
          rowObject[name] = row[index] || 'NA';
        });
        return rowObject;
      });

      this.logger.debug(
        `traceId=${traceId} - Converted to JSON format`,
        JSON.stringify({ jsonDataCount: jsonData.length }),
      );

      const formattedJsonData = jsonData.map((item: any) => {
        const preProbability = item.preProbability === 'NA' ? 0 : item.preProbability;
        const preSeverity = item.preSeverity === 'NA' ? 0 : item.preSeverity;
        let postProbability = item.postProbability === 'NA' ? 0 : item.postProbability;
        let postSeverity = item.postSeverity === 'NA' ? 0 : item.postSeverity;
      
        if (postProbability === 0 && postSeverity === 0 && (preProbability * preSeverity) <= 8) {
          postProbability = preProbability;
          postSeverity = preSeverity;
        }
      
        return {
          ...item,
          preProbability,
          preSeverity,
          postProbability,
          postSeverity,
          preMitigationScore: item.preMitigationScore === 'NA' ? 0 : item.preMitigationScore,
          postMitigationScore: item.postMitigationScore === 'NA' ? 0 : item.postMitigationScore,
        };
      });

      this.logger.debug(
        `traceId=${traceId} - Formatted numerical fields`,
        JSON.stringify({ formattedDataCount: formattedJsonData.length }),
      );
      

      this.logger.debug(
        `traceId=${traceId} - Deleting uploaded file`,
        JSON.stringify({ filePath: file.path }),
      );

      fs.unlinkSync(file.path);

      this.logger.debug(
        `traceId=${traceId} - import completed successfully`,
        JSON.stringify({ importedDataCount: formattedJsonData.length }),
      );

      this.logger.log(`trace id=${uuid()}, GET 'api/risk-register/import' payload query success`, '');
      return formattedJsonData;

    } catch (error) {
      this.logger.error(
        `traceId=${traceId} - import failed with error: ${error.message}`,
        JSON.stringify({ filePath: file?.path, userId }),
      );
      this.logger.error(`trace id=${uuid()}, POST /risk-register/import failed with error: ${error}`);
      return new InternalServerErrorException(error);
    }
  }



  async insertBulkSteps(data: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting insertBulkSteps`,
      JSON.stringify({ dataCount: data?.length, firstItemKeys: data?.[0] ? Object.keys(data[0]) : [] }),
    );

    try {
      // console.log('data in insert bulk steps', data);
      const { jobTitle, entityId, organizationId } = data[0];

      this.logger.debug(
        `traceId=${traceId} - Extracted parameters from first data item`,
        JSON.stringify({ jobTitle, entityId, organizationId }),
      );

      this.logger.debug(
        `traceId=${traceId} - Checking for duplicate job title`,
        JSON.stringify({ jobTitle, entityId, organizationId }),
      );

      const duplicate = await this.hiraRegisterModel.findOne({
        entityId: entityId,
        organizationId,
        jobTitle: jobTitle,
      });

      this.logger.debug(
        `traceId=${traceId} - Duplicate check completed`,
        JSON.stringify({ duplicateFound: !!duplicate }),
      );
      if (duplicate) {
        this.logger.debug(
          `traceId=${traceId} - Duplicate job title found, throwing BadRequestException`,
          JSON.stringify({ jobTitle, entityId }),
        );
        throw new BadRequestException(
          'A job with the same title already exists for this entity.',
        );
      }

      this.logger.debug(
        `traceId=${traceId} - Preparing final data for insertion`,
        JSON.stringify({ itemCount: data.length }),
      );

      const finalData = data.map((item: any) => ({
        ...item,
        revisionNumber: 0,
        status: 'active',
        workflowStatus: 'DRAFT',
        subStepNo: '1.1',
        hiraConfigId: new ObjectId(item.hiraConfigId),
      }));

      this.logger.debug(
        `traceId=${traceId} - Executing bulk insert operation`,
        JSON.stringify({ finalDataCount: finalData.length }),
      );

      const insertBulkData = await this.hiraRegisterModel.insertMany(finalData);

      this.logger.debug(
        `traceId=${traceId} - insertBulkSteps completed successfully`,
        JSON.stringify({ insertedCount: insertBulkData?.length }),
      );

      // console.log('insertBulkData', insertBulkData);
      this.logger.log(
        `trace id=${uuid()}, POST 'api/risk-register/insertBulkSteps jobTitle query  success`,
        '',
      );
      return insertBulkData;
    } catch (error) {
      this.logger.error(
        `traceId=${traceId} - insertBulkSteps failed with error: ${error.message}`,
        JSON.stringify({ dataCount: data?.length, jobTitle: data?.[0]?.jobTitle }),
      );
      this.logger.error(
        `trace id=${uuid()}, POST /risk-register/insertBulkSteps payload ${data}  failed with error ${error} `,
      );
      if (error.status === 400) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to create HIRA register, please check the log.',
        );
      }
    }
  }

  async insertBulkStepsNew(body: any) {
    try {
      // console.log('data in insert bulk steps', data);
      const { hira, steps } = body;
      const { jobTitle, entityId, organizationId } = hira;
      const duplicate = await this.hiraModel.findOne({
        entityId: entityId,
        organizationId,
        jobTitle: jobTitle,
      });
      if (duplicate) {
        throw new BadRequestException(
          'A job with the same title already exists for this department.',
        );
      }
      const stepsToInsert = steps.map((step: any) => ({
        ...step,
        status: 'active',
        subStepNo: '1.1',
      }));
      //bulk insert steps into hiraSteps modle
      const createdHiraSteps: any = await this.hiraStepsModel.create(
        stepsToInsert,
      );
      // console.log('createdHiraSteps', createdHiraSteps);

      //get createHiraSteps id
      const stepIds = createdHiraSteps.map((step: any) => step._id?.toString());
      // console.log('stepIds', stepIds);

      const hiraToCreate = {
        ...hira,
        stepIds: stepIds,
        workflow: [],
      };
      const createdHira = await this.hiraModel.create(hiraToCreate);

      // console.log('created hira -->', createdHira);

      // console.log('finalData', finalData);

      // const insertBulkData = await this.hiraRegisterModel.insertMany(finalData);

      // console.log('insertBulkData', insertBulkData);
      this.logger.log(
        `trace id=${uuid()}, POST 'api/risk-register/hira/insertBulkSteps jobTitle query  success`,
        '',
      );
      return createdHira;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, POST /risk-register/insertBulkSteps payload ${JSON.stringify(
          body,
        )}  failed with error ${error} `,
      );
      if (error.status === 400) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to create HIRA register, please check the log.',
        );
      }
    }
  }

  async replaceHazardWithHazardId(tableDataInObj) {
    const uniqueHazards = [
      ...new Set(tableDataInObj.map((item) => item.hazard.trim())),
    ];

    // console.log('uniqueHazards', uniqueHazards);

    const hazardIdMapping = {};

    const allHazards = await this.hiraTypeConfigModel.find({
      type: 'hazard',
    });

    // console.log('allHazards', allHazards);

    for (const hazard of uniqueHazards) {
      const hazardConfig = allHazards.find((h) => h.name.trim() === hazard);

      if (hazardConfig) {
        hazardIdMapping[hazard as any] = hazardConfig._id.toString();
      }
    }

    // console.log('hazardIdMapping', hazardIdMapping);

    const tableDataWithHazardId = tableDataInObj.map((item) => {
      const normalizedHazard = item.hazard.trim();
      if (normalizedHazard && hazardIdMapping[normalizedHazard]) {
        return { ...item, hazard: hazardIdMapping[normalizedHazard] };
      }
      return item;
    });

    return tableDataWithHazardId;
  }

  async create(body: any, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      const auditTrail = await auditTrial(
        'hiraregisters',
        'HIRA',
        'HIRA HEADER',
        user.user,
        activeUser,
        '',
      );
      const {
        organizationId,
        hiraConfigId,
        jobTitle,
        sNo,
        nested = false,
        entityId,
        isNewJob,
        workflowStatus,
        revisionNo,
      } = body;
      // console.log("WORKFLOW STATUS -------->>>>>>", workflowStatus)
      let createdBy = '',
        entityIdExisting = '',
        locationIdExisting = '';
      // Check for duplicate jobTitle with the same entityId
      if (!!isNewJob) {
        createdBy = body?.createdBy;
        entityIdExisting = entityId;
        locationIdExisting = body?.locationId;
        const duplicate = await this.hiraRegisterModel.findOne({
          entityId: entityId,
          organizationId,
          jobTitle: jobTitle,
        });

        if (duplicate) {
          throw new BadRequestException(
            'A job with the same title already exists for this entity.',
          );
        }
      } else {
        const hira = await this.hiraRegisterModel
          .findOne({
            entityId: entityId,
            organizationId,
            jobTitle: jobTitle,
          })
          .select('createdBy entityId locationId');
        //console.log('hira', hira);

        createdBy = hira.createdBy;
        entityIdExisting = hira.entityId;
        locationIdExisting = hira.locationId;
      }

      // Fetch the latest subStepNo for the given sNo
      const latestEntry = await this.hiraRegisterModel
        .findOne({
          sNo: sNo,
          jobTitle: jobTitle,
          organizationId: organizationId,
        })
        .sort({ subStepNo: -1 })
        .exec();

      let newSubStepNo = '1.1'; // Default if no entries exist for this sNo
      if (latestEntry && latestEntry.subStepNo) {
        const [base, increment] = latestEntry.subStepNo.split('.');
        newSubStepNo = `${base}.${parseInt(increment) + 1}`;
      }
      if (
        !!workflowStatus &&
        (workflowStatus === 'IN_REVIEW' || workflowStatus === 'IN_APPROVAL')
      ) {
        const createdHiraRegister = await this.hiraRegisterModel.create({
          ...body,
          organizationId,
          hiraConfigId: new ObjectId(hiraConfigId),
          revisionNumber: revisionNo,
          status: 'inWorkflow',
          workflowStatus: workflowStatus,
          subStepNo: newSubStepNo, // Set the incremented subStepNo
          createdBy: createdBy,
          entityId: entityIdExisting,
          locationId: locationIdExisting,
        });
        if (!!createdHiraRegister) {
          const updateOtherHiraSteps = await this.hiraRegisterModel.updateMany(
            {
              jobTitle: jobTitle,
              organizationId: organizationId,
              entityId: entityId,
              revisionNumber: revisionNo,
            },
            {
              $set: {
                status: 'inWorkflow',
                workflowStatus: workflowStatus,
              },
            },
          );
        }
        return createdHiraRegister;
      } else {
        const createdHiraRegister = await this.hiraRegisterModel.create({
          ...body,
          organizationId,
          hiraConfigId: new ObjectId(hiraConfigId),
          revisionNumber: revisionNo,
          status: 'active',
          workflowStatus: 'DRAFT',
          subStepNo: newSubStepNo, // Set the incremented subStepNo
          createdBy: createdBy,
          entityId: entityIdExisting,
          locationId: locationIdExisting,
        });
        this.logger.log(
          `trace id=${uuid()}, POST 'api/risk-register/create jobTitle query  success`,
          '',
        );
        return createdHiraRegister;
      }
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, POST /risk-register/hira-register/create payload ${body}  failed with error ${error} `,
      );
      if (error.status === 400) {
        throw error;
      } else {
        // console.log('error in create hira', error);

        throw new InternalServerErrorException(
          'Failed to create HIRA register, please check the log.',
        );
      }
    }
  }

  async createHiraWithStep(
    body: { hira: CreateHiraDto; step: CreateHiraStepsDto },
    user: any,
  ) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting createHiraWithStep`,
      JSON.stringify({ hira: body.hira, step: body.step }),
    );

    const session = await this.hiraModel.startSession();
    session.startTransaction();

    this.logger.debug(
      `traceId=${traceId} - Database session started and transaction initiated`,
      JSON.stringify({ sessionId: session.id }),
    );

    try {
      this.logger.debug(
        `traceId=${traceId} - Finding active user`,
        JSON.stringify({ kcId: user.user.id }),
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - Active user found`,
        JSON.stringify({ userId: activeUser.id, organizationId: activeUser.organizationId }),
      );

      // Check for duplicate HIRA in the same department
      this.logger.debug(
        `traceId=${traceId} - Checking for duplicate HIRA`,
        JSON.stringify({
          jobTitle: body.hira.jobTitle,
          organizationId: activeUser.organizationId,
          entityId: body.hira.entityId,
        }),
      );

      const findDuplicateInSameDept = await this.hiraModel
        .find({
          jobTitle: body.hira.jobTitle,
          organizationId: activeUser.organizationId,
          entityId: body.hira.entityId,
          status: 'active',
        })
        .session(session); // Use session for transaction

      // If duplicate HIRA found, throw ConflictException
      if (findDuplicateInSameDept.length > 0) {
        this.logger.debug(
          `traceId=${traceId} - Duplicate HIRA found`,
          JSON.stringify({ duplicateCount: findDuplicateInSameDept.length }),
        );
        throw new ConflictException(
          'A HIRA with the same job title already exists in the department.',
        );
      }

      this.logger.debug(
        `traceId=${traceId} - No duplicates found, creating HIRA step`,
        JSON.stringify(body.step),
      );

      // Create the HIRA Step first (pass single object)
      const createdHiraStep = await this.hiraStepsModel.create(
        [
          {
            ...body.step,
            createdBy: activeUser.id,
            status: 'active',
          },
        ],
        { session }, // Ensure the step creation is part of the transaction
      );

      this.logger.debug(
        `traceId=${traceId} - HIRA step created successfully`,
        JSON.stringify({ stepId: createdHiraStep[0]._id?.toString() }),
      );

      // console.log("createdHiraStep ------>>", createdHiraStep);

      this.logger.debug(
        `traceId=${traceId} - Creating HIRA document`,
        JSON.stringify(body.hira),
      );

      // After creating the step, create the HIRA (pass single object)
      const createdHira = await this.hiraModel.create(
        [
          {
            ...body.hira,
            createdBy: activeUser.id,
            status: 'active',
            currentVersion: 0,
            workflowStatus: 'DRAFT',
            stepIds: [createdHiraStep[0]._id?.toString()],
          },
        ],
        { session }, // Ensure the HIRA creation is part of the transaction
      );

      this.logger.debug(
        `traceId=${traceId} - HIRA document created successfully`,
        JSON.stringify({ hiraId: createdHira[0]._id?.toString() }),
      );

      // console.log("createdHira ------>>", createdHira);

      // console.log("session ------>>", session);

      // Commit the transaction if both operations succeed
      await session.commitTransaction();
      session.endSession();

      this.logger.debug(
        `traceId=${traceId} - Transaction committed successfully`,
        JSON.stringify({ success: true }),
      );

      // Return the created HIRA, including the steps
      return { ...createdHira, traceId };
    } catch (error) {
      // Rollback the transaction if any error occurs
      await session.abortTransaction();
      session.endSession();

      this.logger.debug(
        `traceId=${traceId} - Transaction aborted due to error`,
        JSON.stringify({ error: error.message }),
      );

      if (error instanceof ConflictException) {
        throw error; // Re-throw ConflictException for duplicates
      } else {
        // Throw internal server error if something goes wrong
        throw new InternalServerErrorException(
          'An error occurred while creating the HIRA and Step.',
        );
      }
    }
  }


  async createHiraWithMultipleSteps(body: any, user: any) {
  const session = await this.hiraModel.startSession();
  session.startTransaction();

  try {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.user.id },
    });

    // Check for duplicate HIRA in the same department
    const existingHira = await this.hiraModel.find({
      jobTitle: body.hira.jobTitle,
      organizationId: activeUser.organizationId,
      entityId: body.hira.entityId,
      status: "active",
    }).session(session);

    if (existingHira.length > 0) {
      throw new ConflictException("A HIRA with the same job title already exists in the department.");
    }

    // **Step 1: Create multiple HIRA steps**
    const stepsToInsert = body.steps.map((step) => ({
      ...step,
      createdBy: activeUser.id,
      status: "active",
    }));

    const createdHiraSteps = await this.hiraStepsModel.insertMany(stepsToInsert, { session });

    // Extract newly created step IDs
    const stepIds = createdHiraSteps.map((step) => step._id.toString());

    // **Step 2: Create the HIRA document**
    const createdHira = await this.hiraModel.create(
      [
        {
          ...body.hira,
          createdBy: activeUser.id,
          status: "active",
          currentVersion: 0,
          workflowStatus: "DRAFT",
          stepIds: stepIds, // Store all created step IDs
        },
      ],
      { session }
    );

    // Commit the transaction if everything succeeds
    await session.commitTransaction();
    session.endSession();

    return createdHira;
  } catch (error) {
    // Rollback the transaction if anything fails
    await session.abortTransaction();
    session.endSession();

    if (error instanceof ConflictException) {
      throw error;
    } else {
      throw new InternalServerErrorException("An error occurred while creating the HIRA and Steps.");
    }
  }
}


  async fetchHiraDocument(hiraId: string) {
  return this.hiraModel
    .findOne({ _id: hiraId, status: "active" })
    .lean();
  }
  buildSearchQuery(hira: any, search: string) {
    let searchQuery: any = {
      _id: { $in: hira.stepIds?.map((stepId: any) => new ObjectId(stepId)) },
      status: "active",
    };
  
    if (search) {
      const searchRegex = new RegExp(search, "i");
      searchQuery = {
        ...searchQuery,
        $or: [
          { jobBasicStep: searchRegex },
          { hazardDescription: searchRegex },
          { impactText: searchRegex },
          { existingControl: searchRegex },
          { additionalControlMeasure: searchRegex },
          { responsiblePerson: searchRegex },
          { implementationStatus: searchRegex },
        ],
      };
    }
    return searchQuery;
  }
  
  async fetchHiraSteps(searchQuery: any, page: number, pageSize: any) {
    const skip = (page - 1) * pageSize;
  
    const hiraSteps = await this.hiraStepsModel.aggregate([
      { $match: searchQuery },
      { $addFields: { parsedSubStepNo: { $toDouble: { $substr: ["$subStepNo", 0, -1] } } } },
      { $sort: { sNo: 1, parsedSubStepNo: 1, createdAt: 1 } },
      { $skip: skip },
      { $limit: parseInt(pageSize) },
      { $project: { parsedSubStepNo: 0 } },
    ]);
  
    const totalStepsCount = await this.hiraStepsModel.countDocuments(searchQuery);
    return { hiraSteps, totalStepsCount };
  }
  
  async getArchivedHiraJobTitles(hira: any) {
    const archivedHiraIds = new Set(hira.workflow.map((workflow: any) => workflow.hiraId).filter(Boolean));
  
    const archivedHiraJobTitles = await this.hiraModel
      .find({ _id: { $in: Array.from(archivedHiraIds) } }, { _id: 1, jobTitle: 1 })
      .lean();
  
    return new Map(archivedHiraJobTitles.map((hira) => [hira._id.toString(), hira.jobTitle]));
  }

   collectAllUserIds(hira: any, hiraSteps: any[]) {
  const stepsCreatedByIds = hiraSteps.map((step) => step.createdBy).filter(Boolean);
  const responsiblePeopleIds = hiraSteps.map((step) => step?.responsiblePerson).filter(Boolean);

  const getUserIdsFromAllWorkflow = hira?.workflow
    ?.map((workflow: any) => [
      ...workflow.reviewers,
      ...workflow.approvers,
      workflow.reviewStartedBy,
      workflow.reviewedBy,
      workflow.approvedBy,
      workflow.rejectedBy,
    ])
    .flat()
    .filter(Boolean);

  return new Set([...stepsCreatedByIds, ...responsiblePeopleIds, ...getUserIdsFromAllWorkflow, ...hira.assesmentTeam, hira.createdBy]);
}


 async fetchReferencedData(hira: any, allUserIds: Set<string>) {
  return await Promise.all([
    this.prisma.user.findMany({
      where: { id: { in: Array.from(allUserIds) } },
      select: { id: true, username: true, email: true, firstname: true, lastname: true, avatar: true },
    }),
    this.hiraTypeConfigModel.find({ deleted: false, organizationId: hira.organizationId }).select("_id name").lean(),
    hira.locationId ? this.prisma.location.findFirst({ where: { id: hira.locationId }, select: { id: true, locationName: true } }) : null,
    hira.entityId ? this.prisma.entity.findFirst({ where: { id: hira.entityId }, select: { id: true, entityName: true } }) : null,
    hira.section ? this.prisma.section.findFirst({ where: { id: hira.section }, select: { id: true, name: true } }) : null,
    hira.area ? this.hiraAreaMasterModel.findOne({ _id: hira.area }).select("name").lean() : null,
  ]);
}

 createHazardMap(hiraHazardsList: any[]) {
  return new Map(hiraHazardsList.map((hazard) => [hazard._id?.toString(), hazard]));
}

 createUserMap(users: any[]) {
  return new Map(users.map((user) => [user.id, user]));
}

 mapStepDetails(hiraSteps: any[], hazardMap: Map<string, any>, userMap: Map<string, any>) {
  return hiraSteps.map((step) => ({
    ...step,
    hazardTypeDetails: hazardMap.get(step.hazardType),
    ...(step?.responsiblePerson && { responsiblePersonDetails: userMap.get(step.responsiblePerson) }),
  }));
}

 mapWorkflowDetails(hira: any, archivedHiraJobTitleMap: Map<string, string>, userMap: Map<string, any>) {
  return hira.workflow.map((workflow) => ({
    ...workflow,
    jobTitle: workflow.hiraId && archivedHiraJobTitleMap.has(workflow.hiraId) ? archivedHiraJobTitleMap.get(workflow.hiraId) : hira.jobTitle,
    reviewedByUserDetails: userMap.get(workflow.reviewedBy),
    approvedByUserDetails: userMap.get(workflow.approvedBy),
    reviewersDetails: workflow.reviewers.map((reviewer) => userMap.get(reviewer)),
    approversDetails: workflow.approvers.map((approver) => userMap.get(approver)),
  }));
}

 constructResponse(hira: any, workflowsWithUserDetails: any, locationData: any, entityData: any, userMap: Map<string, any>, areaData: any, sectionData: any, steps: any[], totalStepsCount: number) {
  return {
    hira: { ...hira, workflow: workflowsWithUserDetails, locationDetails: locationData, entityDetails: entityData, createdByUserDetails: userMap.get(hira.createdBy), areaDetails: areaData, sectionDetails: sectionData },
    steps,
    stepsCount: totalStepsCount,
  };
}


async viewHiraWithSteps(hiraId: string, query: any) {
  try {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting viewHiraWithSteps`,
      JSON.stringify({ hiraId, query }),
    );
    this.logger.log(`trace id=${traceId} GET /riskregister/hira/${hiraId} payload query=${JSON.stringify(query)}`,'viewHiraWithSteps-service');

    const { page, pageSize, search } = query;
    
    this.logger.debug(
      `traceId=${traceId} - Query parameters extracted`,
      JSON.stringify({ page, pageSize, search }),
    );

    this.logger.debug(
      `traceId=${traceId} - Fetching HIRA document from database`,
      JSON.stringify({ hiraId }),
    );

    const hira :any = await this.hiraModel
      .findOne({
        _id: hiraId,
        status: 'active', // Ensure we fetch only active HIRA
      })
      .lean();

    if (!hira) {
      this.logger.debug(
        `traceId=${traceId} - HIRA not found`,
        JSON.stringify({ hiraId }),
      );
      this.logger.warn(`trace id=${traceId} GET /riskregister/hira/${hiraId} - HIRA not found or access denied.`);
      throw new NotFoundException('HIRA not found or you do not have access to it.');
    }

    this.logger.debug(
      `traceId=${traceId} - HIRA document fetched successfully`,
      JSON.stringify({ 
        hiraId: hira._id, 
        jobTitle: hira.jobTitle, 
        stepIdsCount: hira.stepIds?.length,
        workflowStatus: hira.workflowStatus
      }),
    );

    this.logger.log(`trace id=${traceId} HIRA found: ${JSON.stringify(hira)}`,'viewHiraWithSteps-service');

    let hiraCreatedAt = hira?.createdAt;

    const skip = (page - 1) * pageSize;
    
    this.logger.debug(
      `traceId=${traceId} - Building search query for HIRA steps`,
      JSON.stringify({ page, pageSize, skip, hasSearch: !!search }),
    );

    let searchQuery: any = {
      _id: { $in: hira.stepIds?.map((stepId: any) => new ObjectId(stepId)) },
      status: 'active',
    };
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      searchQuery = {
        ...searchQuery,
        $or: [
          { jobBasicStep: searchRegex },
          { hazardDescription: searchRegex },
          { impactText: searchRegex },
          { existingControl: searchRegex },
          { additionalControlMeasure: searchRegex },
          { responsiblePerson: searchRegex },
          { implementationStatus: searchRegex },
        ],
      };
    }

    this.logger.debug(
      `traceId=${traceId} - Search query for HIRA steps built`,
      JSON.stringify({ stepIdsToQuery: hira.stepIds?.length, hasSearchFilter: !!search }),
    );

    // this.logger.log(`trace id=${traceId} Search query for HIRA steps: ${JSON.stringify(searchQuery)}`,'viewHiraWithSteps-service');

    this.logger.debug(
      `traceId=${traceId} - Executing aggregation query for HIRA steps`,
      JSON.stringify({ pageSize: parseInt(pageSize), skip }),
    );

    const hiraSteps = await this.hiraStepsModel.aggregate([
      { $match: searchQuery },
      {
        $addFields: {
          parsedSubStepNo: {
            $toDouble: {
              $substr: ['$subStepNo', 0, -1],
            },
          },
        },
      },
      { $sort: { sNo: 1, parsedSubStepNo: 1, createdAt: 1 } },
      { $skip: skip },
      { $limit: parseInt(pageSize) },
      { $project: { parsedSubStepNo: 0 } },
    ]);

    this.logger.debug(
      `traceId=${traceId} - HIRA steps aggregation completed`,
      JSON.stringify({ stepsRetrieved: hiraSteps.length }),
    );

    // this.logger.log(`trace id=${traceId} Retrieved ${hiraSteps.length} steps for HIRA ${hiraId}`,'viewHiraWithSteps-service');

    const totalStepsCount = await this.hiraStepsModel.countDocuments(searchQuery);
    
    this.logger.debug(
      `traceId=${traceId} - Total steps count calculated`,
      JSON.stringify({ totalStepsCount }),
    );
    
    this.logger.log(`trace id=${traceId} Total steps count: ${totalStepsCount}`,'viewHiraWithSteps-service');

    this.logger.debug(
      `traceId=${traceId} - Processing archived HIRA workflow data`,
      JSON.stringify({ workflowCount: hira.workflow?.length }),
    );

    const archivedHiraIds = new Set(
      hira.workflow.map((workflow: any) => workflow.hiraId).filter(Boolean),
    );

    this.logger.debug(
      `traceId=${traceId} - Archived HIRA IDs collected`,
      JSON.stringify({ archivedHiraIdsCount: archivedHiraIds.size }),
    );

    const archivedHiraJobTitles = await this.hiraModel
      .find({ _id: { $in: Array.from(archivedHiraIds) } }, { _id: 1, jobTitle: 1, createdAt: 1 })
      .lean();

    this.logger.debug(
      `traceId=${traceId} - Archived HIRA job titles fetched`,
      JSON.stringify({ archivedHiraJobTitlesCount: archivedHiraJobTitles.length }),
    );

    // this.logger.log(`trace id=${traceId} Archived HIRA IDs: ${JSON.stringify(Array.from(archivedHiraIds))}`,'viewHiraWithSteps-service');

    const archivedHiraMap = new Map(
      archivedHiraJobTitles.map((hira) => [hira._id.toString(), hira])
    );
    

    this.logger.debug(
      `traceId=${traceId} - Collecting user IDs from various sources`,
      JSON.stringify({ stepsCount: hiraSteps.length }),
    );

    const stepsCreatedByIds = hiraSteps.map((step) => step.createdBy).filter((id) => !!id);
    const responsiblePeopleIds = hiraSteps.map((step) => step?.responsiblePerson).filter((id) => !!id);
    const getUserIdsFromAllWorkflow = hira?.workflow
      ?.map((workflow: any) => [
        ...workflow.reviewers,
        ...workflow.approvers,
        workflow.reviewStartedBy,
        workflow.reviewedBy,
        workflow.approvedBy,
        workflow.rejectedBy,
      ])
      .flat()
      .filter((id) => !!id);
    const uniqueUserIdsFromAllWorkflow = new Set(getUserIdsFromAllWorkflow);
    const uniqueUserIdsFromAllWorkflowArray = Array.from(uniqueUserIdsFromAllWorkflow);

    this.logger.debug(
      `traceId=${traceId} - User IDs collected from workflows`,
      JSON.stringify({ 
        stepsCreatedByIdsCount: stepsCreatedByIds.length,
        responsiblePeopleIdsCount: responsiblePeopleIds.length,
        workflowUserIdsCount: uniqueUserIdsFromAllWorkflowArray.length
      }),
    );

    this.logger.log(`trace id=${traceId} Unique user IDs from all workflow: ${JSON.stringify(uniqueUserIdsFromAllWorkflowArray)}`,'viewHiraWithSteps-service');

    const allUserIds = new Set([
      ...stepsCreatedByIds,
      ...responsiblePeopleIds,
      ...getUserIdsFromAllWorkflow,
      ...hira.assesmentTeam,
      hira.createdBy,
    ]);

    this.logger.debug(
      `traceId=${traceId} - All unique user IDs consolidated`,
      JSON.stringify({ totalUniqueUserIds: allUserIds.size }),
    );

    this.logger.log(`trace id=${traceId} All unique user IDs involved: ${JSON.stringify(Array.from(allUserIds))}`,'viewHiraWithSteps-service');

    this.logger.debug(
      `traceId=${traceId} - Fetching related data in parallel`,
      JSON.stringify({ 
        fetchingDataFor: ['users', 'hazards', 'location', 'entity', 'section', 'area'],
        organizationId: hira.organizationId
      }),
    );

    const [users, hiraHazardsList, locationData, entityData, sectionData, areaData] = await Promise.all([
      this.prisma.user.findMany({
        where: { id: { in: Array.from(allUserIds) } },
        select: { id: true, username: true, email: true, firstname: true, lastname: true, avatar: true },
      }),
      this.hiraTypeConfigModel
        .find({ deleted: false, organizationId: hira.organizationId })
        .select('_id name')
        .lean(),
      this.prisma.location.findFirst({ where: { id: hira.locationId }, select: { id: true, locationName: true } }),
      this.prisma.entity.findFirst({ where: { id: hira.entityId }, select: { id: true, entityName: true } }),
      this.prisma.section.findFirst({ where: { id: hira.section }, select: { id: true, name: true } }),
      this.hiraAreaMasterModel.findOne({ _id: hira.area }).select('name').lean(),
    ]);

    this.logger.debug(
      `traceId=${traceId} - Related data fetched successfully`,
      JSON.stringify({ 
        usersCount: users?.length,
        hazardsCount: hiraHazardsList?.length,
        locationFound: !!locationData,
        entityFound: !!entityData,
        sectionFound: !!sectionData,
        areaFound: !!areaData
      }),
    );

    this.logger.log(`trace id=${traceId} Successfully fetched associated user and entity details for HIRA ${hiraId}`,'viewHiraWithSteps-service');

    this.logger.debug(
      `traceId=${traceId} - Creating lookup maps for processing`,
      JSON.stringify({ 
        hazardsToMap: hiraHazardsList?.length,
        usersToMap: users?.length
      }),
    );

    const hazardMap = new Map(hiraHazardsList.map((hazard) => [hazard._id?.toString(), hazard]));
    const userMap = new Map(users.map((user) => [user.id, user]));

    this.logger.debug(
      `traceId=${traceId} - Lookup maps created successfully`,
      JSON.stringify({ 
        hazardMapSize: hazardMap.size,
        userMapSize: userMap.size
      }),
    );

    this.logger.debug(
      `traceId=${traceId} - Processing steps with hazard and user details`,
      JSON.stringify({ stepsToProcess: hiraSteps.length }),
    );

    const steps = hiraSteps.map((step: any) => ({
      ...step,
      hazardTypeDetails: hazardMap.get(step.hazardType),
      ...(step?.responsiblePerson && { responsiblePersonDetails: userMap.get(step.responsiblePerson) }),
      postMitigationScore: parseInt(step?.postProbability) > 0 ? parseInt(step?.postProbability) * parseInt(step?.postSeverity) : 0, 
    }));

    this.logger.debug(
      `traceId=${traceId} - Steps processing completed`,
      JSON.stringify({ processedStepsCount: steps.length }),
    );

    this.logger.log(`trace id=${traceId} Processed steps with hazard and responsible person details.`,'viewHiraWithSteps-service');

    this.logger.debug(
      `traceId=${traceId} - Processing workflows with user details`,
      JSON.stringify({ workflowsToProcess: hira.workflow?.length }),
    );

    const workflowsWithUserDetails = hira.workflow.map((workflow: any) => ({
      ...workflow,
      jobTitle: workflow.hiraId && archivedHiraMap.has(workflow.hiraId)
  ? archivedHiraMap.get(workflow.hiraId).jobTitle
  : hira.jobTitle,
      reviewedByUserDetails: userMap.get(workflow.reviewedBy),
      approvedByUserDetails: userMap.get(workflow.approvedBy),
      reviewersDetails: workflow.reviewers.map((reviewer: any) => userMap.get(reviewer)),
      approversDetails: workflow.approvers.map((approver: any) => userMap.get(approver)),
      workflowHistory: workflow.workflowHistory.map((history: any) => ({
        ...history,
        user: userMap.get(history.by),
      })),
    }));

    const assesmentTeamData = hira.assesmentTeam.map((userId: any) => userMap.get(userId));

    this.logger.debug(
      `traceId=${traceId} - Workflows and assessment team processing completed`,
      JSON.stringify({ 
        workflowsProcessed: workflowsWithUserDetails.length,
        assessmentTeamMembersCount: assesmentTeamData.length
      }),
    );

    this.logger.log(`trace id=${traceId} Successfully processed workflow and assessment team data.`,'viewHiraWithSteps-service');

    this.logger.debug(
      `traceId=${traceId} - Handling version-specific logic`,
      JSON.stringify({ currentVersion: hira.currentVersion }),
    );

    if (hira.currentVersion > 0) {
      this.logger.debug(
        `traceId=${traceId} - Processing versioned HIRA, finding first archived workflow`,
        JSON.stringify({ currentVersion: hira.currentVersion }),
      );
      
      const firstArchivedWorkflow = hira.workflow.find(w => w.cycleNumber === 1 && w.hiraId);
      
      if (firstArchivedWorkflow?.hiraId) {
        this.logger.debug(
          `traceId=${traceId} - First archived workflow found`,
          JSON.stringify({ hiraId: firstArchivedWorkflow.hiraId }),
        );

        const archivedHira: any = archivedHiraMap.get(firstArchivedWorkflow?.hiraId);
        if (archivedHira?.createdAt) {
          hiraCreatedAt = archivedHira.createdAt;
          this.logger.debug(
            `traceId=${traceId} - Updated HIRA created date from archived version`,
            JSON.stringify({ originalCreatedAt: hira.createdAt, archivedCreatedAt: hiraCreatedAt }),
          );
        }
      }
    }

    this.logger.debug(
      `traceId=${traceId} - Building final response object`,
      JSON.stringify({ 
        hiraId: hira._id,
        stepsCount: steps.length,
        totalStepsCount,
        workflowsCount: workflowsWithUserDetails.length
      }),
    );

    const response = {
      hira: {
        ...hira,
        hiraCreatedAt,
        workflow: workflowsWithUserDetails,
        locationDetails: locationData,
        entityDetails: entityData,
        createdByUserDetails: userMap?.get(hira?.createdBy),
        areaDetails: areaData,
        sectionDetails: sectionData,
        assesmentTeamData: assesmentTeamData,
      },
      steps: steps,
      stepsCount: totalStepsCount,
    };

    this.logger.debug(
      `traceId=${traceId} - viewHiraWithSteps completed successfully`,
      JSON.stringify({ 
        success: true,
        hiraId: hira._id,
        stepsReturned: steps.length,
        totalSteps: totalStepsCount
      }),
    );

    return response;
  } catch (error) {
    this.logger.error(`trace id=${uuid()} GET /riskregister/hira/${hiraId} failed with error: ${error}`,'viewHiraWithSteps-service');

    if (error instanceof NotFoundException) {
      throw error;
    } else {
      throw new InternalServerErrorException('An error occurred while fetching the HIRA and Steps.');
    }
  }
}


  async getArchivedHiraWithSteps(hiraId: string, query: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting getArchivedHiraWithSteps`,
      JSON.stringify({ hiraId, queryKeys: Object.keys(query) }),
    );

    try {
      const { page, pageSize, search } = query;

      this.logger.debug(
        `traceId=${traceId} - Query parameters extracted`,
        JSON.stringify({ page, pageSize, search }),
      );

      // Fetch the HIRA document using the hiraId and ensure it belongs to the user's organization
      this.logger.debug(
        `traceId=${traceId} - Fetching archived HIRA document`,
        JSON.stringify({ hiraId }),
      );

      const hira = await this.hiraModel
        .findOne({
          _id: hiraId,
          status: 'archived', // Ensure we fetch only active HIRA
        })
        .lean(); // Return plain JS object instead of Mongoose document

      this.logger.debug(
        `traceId=${traceId} - HIRA document query completed`,
        JSON.stringify({ hiraFound: !!hira, hiraId }),
      );

      // If HIRA not found, throw an exception
      if (!hira) {
        this.logger.debug(
          `traceId=${traceId} - HIRA not found`,
          JSON.stringify({ hiraId }),
        );
        throw new NotFoundException(
          'HIRA not found or you do not have access to it.',
        );
      }

      // Calculate skip and limit for pagination
      const skip = (page - 1) * pageSize;

      this.logger.debug(
        `traceId=${traceId} - Pagination calculations completed`,
        JSON.stringify({ page, pageSize, skip }),
      );

      // Build the search query for steps
      let searchQuery: any = {
        _id: {
          $in: hira.stepIds?.map((stepId: any) => new ObjectId(stepId)),
        },
        status: 'archived',
      }; // Ensure only active steps are fetched

      this.logger.debug(
        `traceId=${traceId} - Search query built for HIRA steps`,
        JSON.stringify({ stepIdsCount: hira.stepIds?.length, status: 'archived' }),
      );

      //console.log('search query for hirasteps-->', searchQuery);

      // Fetch all the steps associated with the HIRA with pagination and search
      this.logger.debug(
        `traceId=${traceId} - Executing HIRA steps query`,
        JSON.stringify({ skip, pageSize }),
      );

      const hiraSteps = await this.hiraStepsModel
        .find(searchQuery)
        .sort({ sNo: 1 })
        .skip(skip) // Skip records for pagination
        .limit(pageSize) // Limit records to pageSize
        .lean() // Return plain JS object instead of Mongoose document
        .exec(); // Execute the query

      this.logger.debug(
        `traceId=${traceId} - HIRA steps fetched`,
        JSON.stringify({ stepsCount: hiraSteps?.length }),
      );

      //console.log('hiraSteps--->', hiraSteps);

      const totalStepsCount = await this.hiraStepsModel.countDocuments(
        searchQuery,
      );

      this.logger.debug(
        `traceId=${traceId} - Total steps count calculated`,
        JSON.stringify({ totalStepsCount }),
      );

      const archivedHiraIds = new Set(
        hira.workflow.map((workflow: any) => workflow.hiraId).filter(Boolean),
      );

      this.logger.debug(
        `traceId=${traceId} - Collected archived HIRA IDs from workflow`,
        JSON.stringify({ archivedHiraIdsCount: archivedHiraIds.size }),
      );

      const archivedHiraJobTitles = await this.hiraModel
        .find(
          { _id: { $in: Array.from(archivedHiraIds) } },
          { _id: 1, jobTitle: 1 },
        )
        .lean();

      this.logger.debug(
        `traceId=${traceId} - Fetched archived HIRA job titles`,
        JSON.stringify({ jobTitlesCount: archivedHiraJobTitles?.length }),
      );

      // Construct a map of HIRA IDs to jobTitles
      const archivedHiraJobTitleMap = new Map(
        archivedHiraJobTitles.map((hira) => [
          hira._id.toString(),
          hira.jobTitle,
        ]),
      );

      this.logger.debug(
        `traceId=${traceId} - Created archived HIRA job title map`,
        JSON.stringify({ mapSize: archivedHiraJobTitleMap.size }),
      );

      const stepsCreatedByIds = hiraSteps
        .map((step) => step.createdBy)
        .filter((id) => !!id);
      const responsiblePeopleIds = hiraSteps
        .map((step) => step?.responsiblePerson)
        .filter((id) => !!id);

      this.logger.debug(
        `traceId=${traceId} - Collected user IDs from steps`,
        JSON.stringify({ 
          stepsCreatedByIdsCount: stepsCreatedByIds.length,
          responsiblePeopleIdsCount: responsiblePeopleIds.length
        }),
      );

      const getUserIdsFromAllWorkflow = hira?.workflow
        ?.map((workflow: any) => {
          return [
            ...workflow.reviewers,
            ...workflow.approvers,
            workflow.reviewStartedBy,
            workflow.reviewedBy,
            workflow.approvedBy,
            workflow.rejectedBy,
          ];
        })
        .flat()
        .filter((id) => !!id);
      const uniqueUserIdsFromAllWorkflow = new Set(getUserIdsFromAllWorkflow);
      const uniqueUserIdsFromAllWorkflowArray = Array.from(
        uniqueUserIdsFromAllWorkflow,
      );

      this.logger.debug(
        `traceId=${traceId} - Collected user IDs from workflow`,
        JSON.stringify({ uniqueWorkflowUserIdsCount: uniqueUserIdsFromAllWorkflowArray.length }),
      );

      console.log(
        'uniqueUserIdsFromAllWorkflowArray ------>>',
        uniqueUserIdsFromAllWorkflowArray,
      );

      const allUserIds = new Set([
        ...stepsCreatedByIds,
        ...responsiblePeopleIds,
        ...getUserIdsFromAllWorkflow,
        hira.createdBy,
      ]);

      this.logger.debug(
        `traceId=${traceId} - Combined all unique user IDs`,
        JSON.stringify({ totalUniqueUserIds: allUserIds.size }),
      );

      //console.log('allUserIds ------>>', allUserIds);

      this.logger.debug(
        `traceId=${traceId} - Starting parallel data fetch operations`,
        JSON.stringify({ 
          userIdsToFetch: allUserIds.size,
          organizationId: hira.organizationId,
          locationId: hira.locationId,
          entityId: hira.entityId
        }),
      );

      const [
        users,
        hiraHazardsList,
        locationData,
        entityData,
        sectionData,
        areaData,
      ] = await Promise.all([
        this.prisma.user.findMany({
          where: { id: { in: Array.from(allUserIds) } },
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
          },
        }),
        this.hiraTypeConfigModel
          .find({
            deleted: false,
            organizationId: hira.organizationId,
          })
          .select('_id name')
          .lean(),
        this.prisma.location.findFirst({
          where: { id: hira.locationId },
          select: { id: true, locationName: true },
        }),
        this.prisma.entity.findFirst({
          where: { id: hira.entityId },
          select: { id: true, entityName: true },
        }),
        this.prisma.section.findFirst({
          where: { id: hira.section },
          select: { id: true, name: true },
        }),
        this.hiraAreaMasterModel
          .findOne({ _id: hira.area })
          .select('name')
          .lean(),
      ]);

      this.logger.debug(
        `traceId=${traceId} - Parallel data fetch completed`,
        JSON.stringify({ 
          usersCount: users?.length,
          hazardsCount: hiraHazardsList?.length,
          locationFound: !!locationData,
          entityFound: !!entityData,
          sectionFound: !!sectionData,
          areaFound: !!areaData
        }),
      );

      // console.log('sectionData --->', sectionData);
      // console.log('areaData--->', areaData);

      const hazardIds: any = new Set();
      const responsiblePersonIds: any = new Set();

      hiraSteps.forEach((step: any) => {
        step?.hazardType && hazardIds.add(step?.hazardType);
        step?.responsiblePerson?.length &&
          responsiblePersonIds.add(step?.responsiblePerson);
      });

      const hazardMap = new Map(
        hiraHazardsList.map((hazard) => [hazard._id?.toString(), hazard]),
      );

      const userMap = new Map(users.map((user) => [user.id, user]));

      this.logger.debug(
        `traceId=${traceId} - Creating data maps and processing steps`,
        JSON.stringify({ stepsToProcess: hiraSteps?.length }),
      );

      const steps = hiraSteps?.map((step: any) => ({
        ...step,
        hazardTypeDetails: hazardMap.get(step.hazardType),
        ...(step?.responsiblePerson && {
          responsiblePersonDetails: userMap.get(step.responsiblePerson),
        }),
      }));

      this.logger.debug(
        `traceId=${traceId} - Processing workflow with user details`,
        JSON.stringify({ workflowCount: hira.workflow?.length }),
      );

      // Map user details to each workflow object
      const workflowsWithUserDetails = hira.workflow.map((workflow: any) => ({
        ...workflow,
        jobTitle:
          workflow.hiraId && archivedHiraJobTitleMap.has(workflow.hiraId)
            ? archivedHiraJobTitleMap.get(workflow.hiraId)
            : hira.jobTitle,
        reviewedByUserDetails: userMap.get(workflow.reviewedBy),
        approvedByUserDetails: userMap.get(workflow.approvedBy),
        workflowHistory: workflow.workflowHistory.map((history: any) => ({
          ...history,
          user: userMap.get(history.by), // Populate 'by' field with user details
        })),
      }));
      const assesmentTeamData = hira.assesmentTeam.map((userId: any) =>
        userMap.get(userId),
      );

      this.logger.debug(
        `traceId=${traceId} - Constructing final response`,
        JSON.stringify({ 
          stepsCount: steps?.length,
          totalStepsCount,
          assessmentTeamCount: assesmentTeamData?.length
        }),
      );

      // console.log('assesmentTeamData ------>>', assesmentTeamData);

      const result = {
        hira: {
          ...hira,
          workflow: workflowsWithUserDetails,
          locationDetails: locationData,
          entityDetails: entityData,
          createdByUserDetails: userMap?.get(hira?.createdBy),
          areaDetails: areaData,
          sectionDetails: sectionData,
          assesmentTeamData: assesmentTeamData,
        },
        steps: steps,
        stepsCount: totalStepsCount,
      };

      this.logger.debug(
        `traceId=${traceId} - getArchivedHiraWithSteps completed successfully`,
        JSON.stringify({ 
          hiraId,
          returnedStepsCount: steps?.length,
          totalStepsCount
        }),
      );

      // Return the HIRA along with its associated steps
      return result;
    } catch (error) {
      //console.log('error in getHiraWithSteps', error);

      this.logger.error(
        `traceId=${traceId} - getArchivedHiraWithSteps failed with error: ${error.message}`,
        JSON.stringify({ hiraId, queryKeys: Object.keys(query) }),
      );

      if (error instanceof NotFoundException) {
        throw error; // Re-throw if HIRA not found
      } else {
        // Throw internal server error if something else goes wrong
        throw new InternalServerErrorException(
          'An error occurred while fetching the HIRA and Steps.',
        );
      }
    }
  }

  async getHiraList(orgId: string, query: any) {
    try {
      const traceId = uuid();
      this.logger.debug(
        `traceId=${traceId} - Starting getHiraList`,
        JSON.stringify({ orgId, query }),
      );
      const page = parseInt(query.page) || 1;
      const pageSize = parseInt(query.pageSize) || 10;
      const skip = (page - 1) * pageSize;
      
      this.logger.debug(
        `traceId=${traceId} - Pagination parameters set`,
        JSON.stringify({ page, pageSize, skip }),
      );
      
      //console.log('query', query);
      const { entityId, locationId, area, section, search, workflowStatus } =
        query;
        
      this.logger.debug(
        `traceId=${traceId} - Query filters extracted`,
        JSON.stringify({ entityId, locationId, area, section, search, workflowStatus }),
      );
      
      const findQuery = {
        organizationId: orgId,
        status: 'active', // Ensure we fetch only active HIRA
        ...(entityId && { entityId }),
        ...(locationId && { locationId }),
        ...(area && { area }),
        ...(section && { section }),
        ...(workflowStatus && { workflowStatus }),
        ...(search && { jobTitle: { $regex: new RegExp(search, 'i') } }),
      };
      
      this.logger.debug(
        `traceId=${traceId} - MongoDB query built`,
        JSON.stringify({ findQuery }),
      );
      
      // Fetch the HIRA document using the hiraId and ensure it belongs to the user's organization
      const hira = await this.hiraModel
        .find(findQuery)
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order
        .skip(skip)
        .limit(pageSize)
        .lean();

      this.logger.debug(
        `traceId=${traceId} - HIRA documents fetched`,
        JSON.stringify({ hiraCount: hira?.length }),
      );

      const hiraTotalCount = await this.hiraModel.countDocuments(findQuery);

      this.logger.debug(
        `traceId=${traceId} - Total HIRA count fetched`,
        JSON.stringify({ hiraTotalCount }),
      );

      // If HIRA not found, throw an exception
      if (!hira) {
        this.logger.debug(
          `traceId=${traceId} - No HIRA found`,
          JSON.stringify({ orgId }),
        );
        throw new NotFoundException('No HIRA Found!');
      }

      this.logger.debug(
        `traceId=${traceId} - Fetching HIRA configuration`,
        JSON.stringify({ orgId }),
      );

      let hiraConfig: any = await this.hiraConfigModel
        .findOne({
          riskCategory: 'HIRA',
          deleted: false,
          organizationId: orgId,
        })
        .select('condition riskType')
        .lean();

      this.logger.debug(
        `traceId=${traceId} - HIRA configuration fetched`,
        JSON.stringify({ configFound: !!hiraConfig }),
      );

      const userIds: any = new Set();
      const locationIds: any = new Set();
      const entityIds: any = new Set();
      const areaIds: any = new Set();
      const sectionIds: any = new Set();

      this.logger.debug(
        `traceId=${traceId} - Collecting unique IDs from HIRA data`,
        JSON.stringify({ hiraItemsCount: hira?.length }),
      );

      hira?.forEach((item: any) => {
        item?.createdBy && userIds.add(item?.createdBy);
        item?.locationId && locationIds.add(item?.locationId);
        item?.entityId && entityIds.add(item?.entityId);
        item?.area && areaIds.add(item?.area);
        item?.section && sectionIds.add(item?.section);
        item?.workflow?.forEach((workflow: any) => {
          workflow?.reviewers?.length &&
            workflow?.reviewers.forEach((reviewer: any) =>
              userIds.add(reviewer),
            );
          workflow?.approvers?.length &&
            workflow?.approvers.forEach((approver: any) =>
              userIds.add(approver),
            );
        });
      });

      this.logger.debug(
        `traceId=${traceId} - Unique IDs collected`,
        JSON.stringify({
          userIdsCount: userIds.size,
          locationIdsCount: locationIds.size,
          entityIdsCount: entityIds.size,
          areaIdsCount: areaIds.size,
          sectionIdsCount: sectionIds.size,
        }),
      );

      this.logger.debug(
        `traceId=${traceId} - Fetching related data in parallel`,
        JSON.stringify({ fetchingDataFor: ['users', 'locations', 'entities', 'sections', 'areas'] }),
      );

      // Fetch related data using Prisma
      const [users, locations, entities, sections, areas] = await Promise.all([
        this.prisma.user.findMany({
          where: { id: { in: Array.from(userIds) } },
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
          },
        }),
        this.prisma.location.findMany({
          where: { id: { in: Array.from(locationIds) } },
          select: { id: true, locationName: true },
        }),
        this.prisma.entity.findMany({
          where: { id: { in: Array.from(entityIds) } },
          select: { id: true, entityName: true },
        }),
        this.prisma.section.findMany({
          where: { id: { in: Array.from(sectionIds) } },
          select: { id: true, name: true },
        }),
        this.hiraAreaMasterModel
          .find({
            id: { $in: Array.from(areaIds) as any },
          })
          .select('id name'),
      ]);

      this.logger.debug(
        `traceId=${traceId} - Related data fetched successfully`,
        JSON.stringify({
          usersCount: users?.length,
          locationsCount: locations?.length,
          entitiesCount: entities?.length,
          sectionsCount: sections?.length,
          areasCount: areas?.length,
        }),
      );

      // Create maps for quick lookup
      this.logger.debug(
        `traceId=${traceId} - Creating lookup maps for related data`,
        JSON.stringify({ creatingMapsFor: ['users', 'locations', 'entities', 'sections', 'areas'] }),
      );

      const userMap = new Map(users?.map((user) => [user?.id, user]));
      const locationMap = new Map(
        locations?.map((location) => [location?.id, location]),
      );
      const entityMap = new Map(
        entities?.map((entity) => [entity?.id, entity]),
      );
      const sectionMap = new Map(
        sections?.map((section) => [section?.id, section]),
      );
      const areaMap = new Map(areas?.map((area) => [area?.id, area]));

      this.logger.debug(
        `traceId=${traceId} - Lookup maps created successfully`,
        JSON.stringify({
          userMapSize: userMap.size,
          locationMapSize: locationMap.size,
          entityMapSize: entityMap.size,
          sectionMapSize: sectionMap.size,
          areaMapSize: areaMap.size,
        }),
      );

      // Map the related data to the HIRA
      this.logger.debug(
        `traceId=${traceId} - Mapping related data to HIRA items`,
        JSON.stringify({ hiraItemsToProcess: hira.length }),
      );

      const hiraList = hira.map((item: any) => {
        const latestWorkflowDetails = item?.workflow?.slice(
          item?.workflow?.length - 1,
        )[0];
        let reviewersDetails = [],
          approversDetails = [];
        if (latestWorkflowDetails) {
          reviewersDetails = latestWorkflowDetails?.reviewers?.map(
            (reviewerId: any) => userMap.get(reviewerId),
          );
          approversDetails = latestWorkflowDetails?.approvers?.map(
            (approverId: any) => userMap.get(approverId),
          );
        }
        return {
          ...item,
          createdByDetails: userMap.get(item?.createdBy) || '',
          locationDetails: locationMap.get(item?.locationId) || '',
          entityDetails: entityMap.get(item?.entityId) || '',
          areaDetails: areaMap.get(item?.area) || '',
          sectionDetails: sectionMap.get(item?.section) || '',
          riskTypeDetails: hiraConfig?.riskType?.find(
            (riskType: any) => riskType?._id?.toString() === item?.riskType,
          ),
          conditionDetails: hiraConfig?.condition?.find(
            (condition: any) => condition?._id?.toString() === item?.condition,
          ),
          reviewersDetails: reviewersDetails,
          approversDetails: approversDetails,
          latestWorkflowDetails: latestWorkflowDetails,
        };
      });

      this.logger.debug(
        `traceId=${traceId} - HIRA list mapping completed successfully`,
        JSON.stringify({ mappedItemsCount: hiraList.length }),
      );

      const response = {
        list: hiraList,
        total: hiraTotalCount,
      };

      this.logger.debug(
        `traceId=${traceId} - getHiraList completed successfully`,
        JSON.stringify({ totalItems: hiraTotalCount, returnedItems: hiraList.length }),
      );

      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw if HIRA not found
      } else {
        // Throw internal server error if something else goes wrong
        throw new InternalServerErrorException(
          'An error occurred while fetching HIRA List!',
        );
      }
    }
  }

  async createHira(body: CreateHiraDto, user: any) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });

      // Check for duplicate HIRA in the same department
      const findDuplicateInSameDept = await this.hiraModel.find({
        jobTitle: body.jobTitle,
        organizationId: activeUser.organizationId,
        entityId: body.entityId,
        status: 'active',
      });

      // If duplicate HIRA found, throw ConflictException
      if (findDuplicateInSameDept && findDuplicateInSameDept.length > 0) {
        throw new ConflictException(
          'A HIRA with the same job title already exists in the department.',
        );
      }

      // Create new HIRA record
      const createdHira = await this.hiraModel.create({
        ...body,
        createdBy: activeUser.id,
        status: 'active',
        currentVersion: 0,
        workflowStatus: 'DRAFT',
      });

      return createdHira;
    } catch (error) {
      // Handle MongoDB errors
      if (error instanceof ConflictException) {
        throw error; // Re-throw the conflict exception
      } else {
        // If any other error occurs (like database query failure), throw InternalServerErrorException
        throw new InternalServerErrorException(
          'An error occurred while creating the HIRA record.',
        );
      }
    }
  }

  async createHiraStep(body: CreateHiraStepsDto, user: any) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      // Create new HIRA Step record
      const createdHiraStep = await this.hiraStepsModel.create({
        ...body,
        createdBy: activeUser.id,
        status: 'active',
      });

      return createdHiraStep;
    } catch (error) {
      // If any other error occurs (like database query failure), throw InternalServerErrorException
      throw new InternalServerErrorException(
        'An error occurred while creating the HIRA Step.',
      );
    }
  }

  async addHiraStepToHira(body: CreateHiraStepsDto, user: any, hiraId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting addHiraStepToHira`,
      JSON.stringify({ hiraId, body, userId: user?.user?.id }),
    );

    try {
      this.logger.debug(
        `traceId=${traceId} - Finding active user`,
        JSON.stringify({ kcId: user.user.id }),
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - Active user found`,
        JSON.stringify({ userId: activeUser.id, organizationId: activeUser.organizationId }),
      );

      this.logger.debug(
        `traceId=${traceId} - Creating new HIRA step`,
        JSON.stringify({ stepData: body, createdBy: activeUser.id }),
      );

      // Create new HIRA Step record
      const createdHiraStep = await this.hiraStepsModel.create({
        ...body,
        createdBy: activeUser.id,
        status: 'active',
      });

      this.logger.debug(
        `traceId=${traceId} - HIRA step created successfully`,
        JSON.stringify({ stepId: createdHiraStep.id }),
      );

      let updatedHira;

      if (!!createdHiraStep) {
        this.logger.debug(
          `traceId=${traceId} - Updating HIRA with new step ID`,
          JSON.stringify({ 
            hiraId, 
            stepId: createdHiraStep.id,
            workflowStatus: body?.workflowStatus,
            isDraftWorkflow: body?.workflowStatus === 'DRAFT'
          }),
        );

        //append the step id to `stepIds` array in hiraModel
        if (body?.workflowStatus === 'DRAFT') {
          this.logger.debug(
            `traceId=${traceId} - Updating HIRA with DRAFT workflow status`,
            JSON.stringify({ hiraId }),
          );

          updatedHira = await this.hiraModel.findOneAndUpdate(
            { _id: hiraId },
            {
              $push: { stepIds: createdHiraStep.id },
              workflowStatus: 'DRAFT',
            },
            { new: true },
          );

          this.logger.debug(
            `traceId=${traceId} - HIRA updated with DRAFT status`,
            JSON.stringify({ 
              hiraId: updatedHira?._id,
              workflowStatus: updatedHira?.workflowStatus,
              stepIdsCount: updatedHira?.stepIds?.length
            }),
          );
        } else {
          this.logger.debug(
            `traceId=${traceId} - Updating HIRA without workflow status change`,
            JSON.stringify({ hiraId }),
          );

          updatedHira = await this.hiraModel.findOneAndUpdate(
            { _id: hiraId },
            {
              $push: { stepIds: createdHiraStep.id },
            },
            { new: true },
          );

          this.logger.debug(
            `traceId=${traceId} - HIRA updated successfully`,
            JSON.stringify({ 
              hiraId: updatedHira?._id,
              stepIdsCount: updatedHira?.stepIds?.length
            }),
          );
        }
      }

      // console.log("checkrisk5 updatedHira in addStepToHIRA", updatedHira, body?.workflowStatus);

      this.logger.debug(
        `traceId=${traceId} - addHiraStepToHira completed successfully`,
        JSON.stringify({ 
          success: true,
          hiraId,
          stepId: createdHiraStep?.id,
          finalStepCount: updatedHira?.stepIds?.length
        }),
      );

      return updatedHira;
    } catch (error) {
      this.logger.debug(
        `traceId=${traceId} - addHiraStepToHira failed with error`,
        JSON.stringify({ error: error.message, hiraId }),
      );

      // If any other error occurs (like database query failure), throw InternalServerErrorException
      throw new InternalServerErrorException(
        'An error occurred while adding hira step.',
      );
    }
  }

  async updateHiraStep(body: UpdateHiraStepsDto, user: any, stepId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting updateHiraStep`,
      JSON.stringify({ stepId, body, userId: user?.user?.id }),
    );

    try {
      let updateHiraStep;
      
      this.logger.debug(
        `traceId=${traceId} - Checking workflow status and conditions`,
        JSON.stringify({ 
          workflowStatus: body?.workflowStatus, 
          hasHiraId: !!body?.hiraId,
          isDraftUpdate: body?.workflowStatus === 'DRAFT' && body?.hiraId
        }),
      );

      if (body?.workflowStatus === 'DRAFT' && body?.hiraId) {
        this.logger.debug(
          `traceId=${traceId} - Updating HIRA workflow status to DRAFT`,
          JSON.stringify({ hiraId: body?.hiraId }),
        );

        let updateStatusOfHira = await this.hiraModel.findOneAndUpdate(
          { _id: body?.hiraId },
          {
            workflowStatus: 'DRAFT',
          },
          { new: true },
        );

        this.logger.debug(
          `traceId=${traceId} - HIRA workflow status updated successfully`,
          JSON.stringify({ 
            hiraId: updateStatusOfHira?._id,
            workflowStatus: updateStatusOfHira?.workflowStatus
          }),
        );

        // console.log("checkrisk5 updateStatusOfHira in updateHiraStep", updateStatusOfHira);
      } else {
        this.logger.debug(
          `traceId=${traceId} - Updating HIRA step details`,
          JSON.stringify({ stepId, updateFields: Object.keys(body) }),
        );

        updateHiraStep = await this.hiraStepsModel.findOneAndUpdate(
          { _id: stepId },
          {
            ...body,
          },
        );

        this.logger.debug(
          `traceId=${traceId} - HIRA step updated successfully`,
          JSON.stringify({ 
            stepId: updateHiraStep?._id,
            updated: !!updateHiraStep
          }),
        );
      }
      // console.log("checkrisk5 updateHiraStep in updateHiraStep", updateHiraStep);

      this.logger.debug(
        `traceId=${traceId} - updateHiraStep completed successfully`,
        JSON.stringify({ 
          success: true,
          stepId,
          operationType: body?.workflowStatus === 'DRAFT' && body?.hiraId ? 'workflow_update' : 'step_update'
        }),
      );

      return updateHiraStep;
    } catch (error) {
      this.logger.debug(
        `traceId=${traceId} - updateHiraStep failed with error`,
        JSON.stringify({ error: error.message, stepId }),
      );

      // If any other error occurs (like database query failure), throw InternalServerErrorException
      throw new InternalServerErrorException(
        'An error occurred while creating the HIRA Step.',
      );
    }
  }

  async updateHira(body: UpdateHiraDto, req: any, hiraId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting updateHira`,
      JSON.stringify({ hiraId, bodyKeys: Object.keys(body) }),
    );

    try {
      this.logger.debug(
        `traceId=${traceId} - Executing updateHira database query`,
        JSON.stringify({ hiraId }),
      );

      const updateHira = await this.hiraModel.findOneAndUpdate(
        { _id: hiraId },
        {
          ...body,
        },
      );

      this.logger.debug(
        `traceId=${traceId} - updateHira completed successfully`,
        JSON.stringify({ 
          hiraId, 
          updated: !!updateHira,
          updatedHiraId: updateHira?._id 
        }),
      );

      return updateHira;
    } catch (error) {
      this.logger.error(
        `traceId=${traceId} - updateHira failed with error: ${error.message}`,
        JSON.stringify({ hiraId, bodyKeys: Object.keys(body) }),
      );
      // If any other error occurs (like database query failure), throw InternalServerErrorException
      throw new InternalServerErrorException(
        'An error occurred while updating hira details.',
      );
    }
  }

  async deleteHira(hiraId: string, query: any): Promise<any> {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting deleteHira`,
      JSON.stringify({ hiraId, query }),
    );

    try {
      console.log('query in deleteHira', query);

      const currentVersion = parseInt(query?.currentVersion) || 0;
      const workflowStatus = query?.workflowStatus || 'DRAFT';
      const { jobTitle, entityId } = query;
      const stepIds = query?.stepIds || [];

      this.logger.debug(
        `traceId=${traceId} - Extracted deletion parameters`,
        JSON.stringify({ 
          currentVersion, 
          workflowStatus, 
          jobTitle, 
          entityId, 
          stepIdsCount: stepIds.length 
        }),
      );

      this.logger.debug(
        `traceId=${traceId} - Determining deletion strategy`,
        JSON.stringify({ 
          currentVersion,
          isSimpleDeletion: currentVersion === 0 || currentVersion === 1,
          isVersionedDeletion: currentVersion > 1
        }),
      );

      if (currentVersion === 0 || currentVersion === 1) {
        this.logger.debug(
          `traceId=${traceId} - Executing simple deletion for version ${currentVersion}`,
          JSON.stringify({ hiraId, stepIdsToDelete: stepIds.length }),
        );

        const deleteAllSteps = await this.hiraStepsModel.deleteMany({
          _id: { $in: stepIds },
        });

        this.logger.debug(
          `traceId=${traceId} - HIRA steps deleted`,
          JSON.stringify({ deletedStepsCount: deleteAllSteps.deletedCount }),
        );

        const deletedHira = await this.hiraModel.deleteOne({
          _id: hiraId,
        });

        this.logger.debug(
          `traceId=${traceId} - HIRA document deleted`,
          JSON.stringify({ deletedHiraCount: deletedHira.deletedCount }),
        );

        console.log(
          'deleteing version 0 hira, delteallsteps deltehira',
          deleteAllSteps,
          deletedHira,
        );

        this.logger.debug(
          `traceId=${traceId} - Simple deletion completed successfully`,
          JSON.stringify({ 
            currentVersion,
            stepsDeleted: deleteAllSteps.deletedCount,
            hiraDeleted: deletedHira.deletedCount
          }),
        );
      } else {
        this.logger.debug(
          `traceId=${traceId} - Executing versioned deletion for version ${currentVersion}`,
          JSON.stringify({ hiraId, stepIdsToDelete: stepIds.length }),
        );

        const deleteAllSteps = await this.hiraStepsModel.deleteMany({
          _id: { $in: stepIds },
        });

        this.logger.debug(
          `traceId=${traceId} - Current version HIRA steps deleted`,
          JSON.stringify({ deletedStepsCount: deleteAllSteps.deletedCount }),
        );

        const deletedHira = await this.hiraModel.deleteOne({
          _id: hiraId,
        });

        this.logger.debug(
          `traceId=${traceId} - Current version HIRA document deleted`,
          JSON.stringify({ deletedHiraCount: deletedHira.deletedCount }),
        );

        console.log(
          'deleteing version 1 hira, delteallsteps deltehira',
          deleteAllSteps,
          deletedHira,
        );
        console.log('making active previous version');

        const previousVersion = currentVersion - 1;

        this.logger.debug(
          `traceId=${traceId} - Activating previous version`,
          JSON.stringify({ 
            previousVersion,
            searchCriteria: { jobTitle, entityId }
          }),
        );

        const updatePreviousHira = await this.hiraModel.findOneAndUpdate(
          {
            currentVersion: previousVersion,
            status: 'archived',
            jobTitle: jobTitle,
            entityId: entityId,
          },
          {
            status: 'active',
            $pull: { workflow: { cycleNumber: currentVersion } }, //wi
          },
          { new: true }, // This ensures you get the updated document in the result
        );

        this.logger.debug(
          `traceId=${traceId} - Previous HIRA version activated`,
          JSON.stringify({ 
            previousHiraId: updatePreviousHira?._id,
            previousVersion: updatePreviousHira?.currentVersion,
            status: updatePreviousHira?.status,
            stepIdsCount: updatePreviousHira?.stepIds?.length
          }),
        );

        const previousHiraStepIds = updatePreviousHira?.stepIds;

        if (previousHiraStepIds?.length > 0) {
          this.logger.debug(
            `traceId=${traceId} - Activating previous version steps`,
            JSON.stringify({ stepIdsToActivate: previousHiraStepIds.length }),
          );

          const updateAllPreviousSteps = await this.hiraStepsModel.updateMany(
            { _id: { $in: previousHiraStepIds } },
            {
              status: 'active',
            },
          );

          this.logger.debug(
            `traceId=${traceId} - Previous version steps activated`,
            JSON.stringify({ 
              modifiedStepsCount: updateAllPreviousSteps.modifiedCount,
              matchedStepsCount: updateAllPreviousSteps.matchedCount
            }),
          );

          // console.log(
          //   'updatePreviousHira, updateAllPreviousSteps',
          //   updatePreviousHira,
          //   updateAllPreviousSteps,
          // );
        }

        this.logger.debug(
          `traceId=${traceId} - Versioned deletion completed successfully`,
          JSON.stringify({ 
            currentVersion,
            previousVersion,
            stepsDeleted: deleteAllSteps.deletedCount,
            hiraDeleted: deletedHira.deletedCount,
            previousVersionActivated: !!updatePreviousHira
          }),
        );
      }

      this.logger.debug(
        `traceId=${traceId} - deleteHira completed successfully`,
        JSON.stringify({ 
          success: true,
          hiraId,
          currentVersion,
          deletionType: currentVersion <= 1 ? 'simple' : 'versioned'
        }),
      );

    } catch (error) {
      this.logger.debug(
        `traceId=${traceId} - deleteHira failed with error`,
        JSON.stringify({ error: error.message, hiraId }),
      );
    }
  }

  async deleteHiraStep(hiraId: string, stepId: string) {
    const session = await this.hiraModel.startSession(); // Start a transaction session
    session.startTransaction(); // Start the transaction
    try {
      // Find and delete the step in hiraStepsModel
      const deletedHiraStep = await this.hiraStepsModel.findOneAndDelete(
        { _id: stepId },
        { session },
      );

      if (!deletedHiraStep) {
        // If the step is not found, abort the transaction and throw an error
        await session.abortTransaction();
        throw new NotFoundException(`Hira step with id ${stepId} not found.`);
      }

      // Remove the reference from the hiraModel stepIds array
      const updatedHira = await this.hiraModel.findOneAndUpdate(
        { _id: hiraId },
        { $pull: { stepIds: stepId } },
        { new: true, session },
      );

      if (!updatedHira) {
        // If the Hira document is not found, abort the transaction and throw an error
        await session.abortTransaction();
        throw new NotFoundException(`Hira with id ${hiraId} not found.`);
      }

      // Commit the transaction after both operations succeed
      await session.commitTransaction();
      session.endSession(); // End the session after the transaction

      return updatedHira;
    } catch (error) {
      // Rollback the transaction in case of any error
      await session.abortTransaction();
      session.endSession(); // Ensure session is ended
      // If an error occurred, rethrow it as an InternalServerErrorException
      throw new InternalServerErrorException(
        'An error occurred while deleting hira step.',
        error.message,
      );
    }
  }

  async findAll(jobTitle: any, query: any, id: string) {
    try {
      const page = parseInt(query.page) || 1;
      const pageSize = parseInt(query.pageSize) || 10;
      const skip = (page - 1) * pageSize;
      const { entityId } = query;

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: id },
      });

      let riskQuery: any = {
        organizationId: activeUser.organizationId,
        status: { $in: ['inWorkflow', 'active'] },
        ...(jobTitle && jobTitle !== 'All' && { jobTitle: jobTitle }),
        // ... Add other filters as needed
      };

      if (!!query.status) {
        riskQuery.status = query.status;
      }

      if (!!query.entityId) {
        riskQuery.entityId = entityId;
      }

      if (!!query.dateFilter) {
        const { startDate, endDate } = JSON.parse(query.dateFilter);
        const startDateUTC = `${startDate}T00:00:59Z`;
        const endDateUTC = `${endDate}T23:59:59Z`;
        riskQuery.createdAt = {
          $gte: startDateUTC, // Greater than or equal to startDate
          $lte: endDateUTC, // Less than or equal to endDate
        };
      }

      if (!!query.search) {
        const searchRegex = new RegExp(query.search.toString(), 'i');
        riskQuery.$or = [
          // { jobTitle: { $regex: searchRegex } },
          { jobBasicStep: { $regex: searchRegex } },
          { hazardDescription: { $regex: searchRegex } },
          { impactText: { $regex: searchRegex } },
          { existingControl: { $regex: searchRegex } },
          { additionalControlMeasure: { $regex: searchRegex } },
          { responsiblePerson: { $regex: searchRegex } },
          { implementationStatus: { $regex: searchRegex } },
          // { preMitigationScore: { $regex: searchRegex } },

          // { 'mitigations.title': { $regex: searchRegex } },
          // Add other fields as needed
        ];
      }

      // console.log('query', query)

      // console.log('riskQuery', riskQuery);

      let queryBuilder = this.hiraRegisterModel
        .find(riskQuery)
        .sort({ sNo: 1, createdAt: 1 }) // Adjust sorting as needed
        // .populate('hiraConfigId')
        .lean();

      let hiraConfig: any = await this.hiraConfigModel
        .findOne({
          riskCategory: 'HIRA',
          deleted: false,
          organizationId: activeUser.organizationId,
        })
        .select('condition riskType')
        .lean();

      if (skip !== undefined && pageSize !== undefined) {
        queryBuilder = queryBuilder.skip(skip).limit(pageSize);
      }

      let list = await queryBuilder;
      const userIds: any = new Set();
      const locationIds: any = new Set();
      const entityIds: any = new Set();
      const areaIds: any = new Set();
      const sectionIds: any = new Set();
      list?.forEach((item: any) => {
        if (item?.createdBy) {
          userIds.add(item.createdBy);
        }
        if (item?.responsiblePerson) {
          userIds.add(item.responsiblePerson);
        }
        if (item?.assesmentTeam) {
          item.assesmentTeam.forEach((team: any) => {
            userIds.add(team);
          });
        }
        if (item?.locationId) {
          locationIds.add(item.locationId);
        }
        if (item?.entityId) {
          entityIds.add(item.entityId);
        }
        if (item?.responsiblePerson) {
          userIds.add(item.responsiblePerson);
        }
        if (item?.area) {
          areaIds.add(item?.area);
        }
        if (item?.section) {
          sectionIds.add(item.section);
        }
      });
      // console.log('areaIdfs', areaIds);

      const areaMaster = await this.hiraAreaMasterModel
        .find({
          id: { $in: Array.from(areaIds) as any },
        })
        .select('id name');

      // Fetch related data using Prisma
      const [users, entities, locations, sections] = await Promise.all([
        this.prisma.user.findMany({
          where: { id: { in: Array.from(userIds) } },
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
          },
        }),
        this.prisma.entity.findMany({
          where: { id: { in: Array.from(entityIds) } },
          select: { id: true, entityName: true },
        }),
        this.prisma.location.findMany({
          where: { id: { in: Array.from(locationIds) } },
          select: { id: true, locationName: true },
        }),
        this.prisma.section.findMany({
          where: { id: { in: Array.from(sectionIds) } },
          select: { id: true, name: true },
        }),
      ]);

      // console.log('section', sections);/

      // Create maps for quick lookup
      const userMap = new Map(users.map((user) => [user.id, user]));
      const entityMap = new Map(entities.map((entity) => [entity.id, entity]));
      const locationMap = new Map(
        locations.map((section) => [section.id, section]),
      );
      const areaMap = new Map(areaMaster?.map((area) => [area?.id, area]));

      const sectionMap = new Map(
        sections.map((section) => [section.id, section]),
      );

      // console.log('aareamap', areaMap);

      let headerData: any = {
        selectedRiskTypes: hiraConfig?.riskType?.filter(
          (item: any) => item._id.toString() === list[0]?.riskType,
        )[0],
        selectedCondition: hiraConfig?.condition?.filter(
          (item: any) => item._id.toString() === list[0]?.condition,
        )[0],
      };

      list = await Promise.all(
        list.map(async (risk: any) => {
          // console.log('sectopmap', sectionMap.get(risk.section));

          let location,
            entity,
            section,
            selectedRiskTypes,
            selectedCondition,
            selectedHazardTypes,
            selectedImpactTypes,
            assesmentTeamData,
            createdByUserDetails,
            responsiblePersonDetails;

          if (!!risk.hazardType) {
            const findHazardType = await this.hiraTypeConfigModel
              .findOne({
                _id: risk.hazardType,
                type: 'hazard',
                deleted: false,
              })
              .select('_id name type');

            // //console.log('findHazardType', findHazardType);

            selectedHazardTypes = findHazardType;
          }

          if (!!risk.impactType) {
            const findImpactType = await this.hiraTypeConfigModel
              .findOne({
                _id: risk.impactType,
                type: 'impact',
                deleted: false,
              })
              .select('_id name type');

            // //console.log('findImpactType', findImpactType);

            selectedImpactTypes = findImpactType;
          }
          return {
            ...risk,
            location: locationMap.get(risk.locationId) || '',
            entity: entityMap.get(risk.entityId) || '',
            section: risk?.section,
            sectionObj: sectionMap.get(risk.section)
              ? sectionMap.get(risk.section)
              : risk?.section
              ? risk?.section
              : '',
            areaObj: areaMap.get(risk?.area)
              ? areaMap.get(risk?.area)
              : risk?.area
              ? risk?.area
              : '',
            area: risk?.area,
            selectedRiskTypes: headerData.selectedRiskTypes,
            selectedHazardTypes,
            selectedImpactTypes,
            selectedCondition: headerData.selectedCondition,
            assesmentTeamData:
              risk?.assesmentTeam?.map((userId: any) => {
                return userMap.get(userId);
              }) || '',
            createdByUserDetails: userMap.get(risk.createdBy) || '',
            responsiblePersonDetails: userMap.get(risk.responsiblePerson) || '',
            // Add other fields as required
          };
        }),
      );
      ////console.log("list",list);
      const total = await this.hiraRegisterModel.countDocuments(riskQuery);
      this.logger.log(
        `trace id=${uuid()}, GET 'api/risk-register/findAll jobTitle query  success`,
        '',
      );
      return { list, total };
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, GET /risk-register/hira-register/findAll payload ${query}  failed with error ${err} `,
      );
      throw new InternalServerErrorException();
    }
  }

  async findOne(id: string) {
    try {
      let location,
        entity,
        section,
        selectedRiskTypes,
        selectedCondition,
        selectedHazardTypes,
        selectedImpactTypes,
        createdByUserDetails;

      let assesmentTeam, riskReviewers, riskApprovers;
      const risk = (await this.hiraRegisterModel
        .findById(id)
        .populate('hiraConfigId')
        .populate({
          path: 'mitigations',
          model: 'HiraMitigation', // Make sure this matches the model name for HiraMitigation
        })) as any;

      // //console.log('risk riesk-->', risk);
      // //console.log('risk hiraConfigId-->', risk.hiraConfigId);

      if (!!risk.riskType) {
        selectedRiskTypes = risk.hiraConfigId?.riskType?.filter(
          (item: any) => item._id.toString() === risk.riskType,
        )[0];
      }

      if (!!risk.condition) {
        selectedCondition = risk.hiraConfigId?.condition?.filter(
          (item: any) => item._id.toString() === risk.condition,
        )[0];
      }

      if (!!risk.hazardType) {
        const findHazardType = await this.hiraTypeConfigModel
          .findOne({
            _id: risk.hazardType,
            type: 'hazard',
            deleted: false,
          })
          .select('_id name type');

        // //console.log('findHazardType', findHazardType);

        selectedHazardTypes = findHazardType;
      }

      if (!!risk.impactType) {
        const findImpactType = await this.hiraTypeConfigModel
          .findOne({
            _id: risk.impactType,
            type: 'impact',
            deleted: false,
          })
          .select('_id name type');

        // //console.log('findImpactType', findImpactType);

        selectedImpactTypes = findImpactType;
      }

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

        //////console.log('assesmentTeam', assesmentTeam);
      }

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

        //////console.log('assesmentTeam', assesmentTeam);
      }

      if (risk.reviewers && risk.reviewers.length > 0) {
        const validReviewers = risk.reviewers.filter((id) => id !== null);

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
          //////console.log('riskReviewers', riskReviewers);
        }
      }
      if (!!risk.approvers && risk.approvers.length > 0) {
        const validApprovers = risk.approvers.filter((id) => id !== null);

        if (validApprovers.length > 0) {
          riskApprovers = await this.prisma.user.findMany({
            where: {
              id: { in: risk.riskApprovers },
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
          //////console.log('riskApprovers', riskApprovers);
        }
      }

      // console.log('risk', risk.additionalAssesmentTeam);
      this.logger.log(
        `trace id=${uuid()}, PUT 'api/risk-register/findOne jobTitle query  success`,
        '',
      );
      const riskData = {
        _id: risk._id,
        status: risk.status,
        jobTitle: risk.jobTitle,
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
        jobBasicStep: risk.jobBasicStep,
        existingControl: risk.existingControl,
        riskCategory: risk?.hiraConfigId?.riskCategory,
        riskType: selectedRiskTypes || null,
        condition: selectedCondition || null,
        hazardType: selectedHazardTypes || null,
        // dateOfIdentification: risk.dateOfIdentification,
        area: risk.area,
        // activity: risk.activity,
        description: risk.description,
        impactType: selectedImpactTypes || null,
        impactText: risk.impactText || '',
        // riskImpact: risk.riskImpact,
        createdBy: risk.createdBy,
        createdByUserDetails: createdByUserDetails,
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
        reviewers: !!riskReviewers ? riskReviewers?.[0] : [],
        approvers: !!riskApprovers ? riskApprovers?.[0] : [],
        assesmentTeam: !!assesmentTeam ? assesmentTeam : [],
        additionalAssesmentTeam: risk.additionalAssesmentTeam || [],
      };

      // ////////////////console.log('impactType', selectedImpactTypes);

      // ////////////////console.log('riskData', riskData);

      return riskData;
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, GET /risk-register/hira-register/findOne payload ${id}  failed with error ${err} `,
      );
      throw new InternalServerErrorException();
    }
  }

  async update(id: string, data: any, userId: string) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });
      // ////////////////console.log('date to update in risk register', data.dateOfIdentification);

      // const result = await this.hiraRegisterModel.findByIdAndUpdate(id, {
      //   ...data,
      //   updatedBy: activeUser.username,
      // });
      // console.log('data in update risk', data);
      let result;
      if (data.subStepNo === '1.1') {
        // Perform bulk update when subStepNo is '1.1'
        await this.hiraRegisterModel.findByIdAndUpdate(id, {
          ...data,
          updatedBy: activeUser.username,
        });
        result = await this.hiraRegisterModel.updateMany(
          {
            sNo: data.sNo, // Match all documents with the same sNo as in the payload
            jobTitle: data.jobTitle, // Match all documents with the same jobTitle as in the payload
            organizationId: data?.organizationId,
            entityId: data.entityId,

            // subStepNo: data.subStepNo  // Match all documents with the subStepNo '1.1'
          },
          {
            $set: {
              jobBasicStep: data.jobBasicStep, // Set new values from payload
              sNo: data.sNo,
            },
          },
        );
      } else {
        // Perform a single document update otherwise
        result = await this.hiraRegisterModel.findByIdAndUpdate(id, {
          ...data,
          updatedBy: activeUser.username,
        });
      }
      this.logger.log(
        `trace id=${uuid()}, PUT 'api/risk-register/update jobTitle query  success`,
        '',
      );
      return result;
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, PUT /risk-register/hira-register/update payload ${id}  failed with error ${err} `,
      );
      throw new InternalServerErrorException();
    }
  }

  async delete(id: string) {
    try {
      const result = await this.hiraRegisterModel.findByIdAndDelete(id);
      this.logger.log(
        `trace id=${uuid()}, DELETE 'api/risk-register/delete jobTitle query  success`,
        '',
      );
      return result;
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, DELETE /risk-register/hira-register/delete payload ${id}  failed with error ${err} `,
      );
      throw new InternalServerErrorException();
    }
  }

  //not in use
  async closeRisk(id: string) {
    try {
      const result = await this.riskModel.findByIdAndUpdate(id, {
        status: 'CLOSED',
        closeDate: new Date(),
      });
      // ////////////////console.log('result after deleting--,', result);
      return result;
    } catch (err) {
      // ////////////////console.log('error in delete risk', err);
      throw new InternalServerErrorException();
    }
  }
  //not in use
  async addMitigation(data: any, userId: any) {
    // 1. Create a new mitigation
    const { riskId, mitigationData } = data;
    // ////////////////console.log('data in add mitigation', data);

    const newMitigation = new this.riskMitigationModel(mitigationData);
    await newMitigation.save();

    // 2. Update the associated risk by pushing the new mitigation's ObjectId
    await this.riskModel.findByIdAndUpdate(riskId, {
      $push: { mitigations: newMitigation._id },
    });

    return newMitigation;
  }
  //not in use
  async updateMitigation(mitigationId: any, updatedData: any, userId: any) {
    // 1. Find the mitigation by its ID
    const existingMitigation = await this.riskMitigationModel.findById(
      mitigationId,
    );

    if (!existingMitigation) {
      throw new Error('Mitigation not found');
    }

    // 2. Update the mitigation with the new data
    // ////////////////console.log('updated in mitigation', updatedData.targetDate);

    const updatedMitigation = await this.riskMitigationModel.findByIdAndUpdate(
      mitigationId,
      { ...updatedData },
      { new: true },
    );
    // ////////////////console.log('result after updating', updatedMitigation);

    return updatedMitigation;
  }
  //not in use

  async addComment(data: any, userId: any) {
    try {
      const newComment = new this.hiraReviewCommentsModel(data);
      // ////////////////console.log('newComment', newComment);
      await newComment.save();
      const test = await this.hiraReviewCommentsModel.find();
      // ////////////////console.log('test', test);

      return newComment;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create comment');
    }
  }
  //not in use

  async findAllCommentsByRiskId(riskId: any) {
    const comments = await this.hiraReviewCommentsModel
      .find({
        riskId: riskId,
      })
      .sort({ createdAt: 1 })
      .lean();

    //////console.log('comments', comments);

    // Extract all unique userId values from the comments data
    const userIds = [...new Set(comments.map((comment) => comment.userId))];

    // console.log('userIds', userIds);

    // Fetch all user details that match the userId values in the comments data
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstname: true, lastname: true, avatar: true },
    });
    //
    // console.log('users', users);

    // Map over the comments data and add the corresponding user details to each comment
    const commentsWithUserDetails = comments.map((comment) => {
      const matchingUser = users.find((user) => user.id === comment.userId);
      return {
        ...comment,
        ...matchingUser,
      };
    });

    // console.log('commentsWithUserDetails', commentsWithUserDetails);

    return commentsWithUserDetails;
  }
  async getAllUser(query, userId) {
    const { search, location } = query;
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    try {
      // Base conditions for the query
      let whereConditions: any = [
        { organizationId: activeUser.organizationId },
        { email: { contains: search, mode: 'insensitive' } },
      ];

      // If location is provided, handle the location filtering
      if (location !== undefined) {
        // Construct the condition for checking if "all" is in additionalUnits for globalRoles users
        whereConditions.push({
          OR: [
            // Users with "all" in additionalUnits (don't apply location filter)
            {
              additionalUnits: {
                has: 'All',
              },
            },
            // Users with matching locationId
            {
              locationId: location,
            },
            // Users with globalRoles and locationId in their additionalUnits
            {
              userType: 'globalRoles',
              additionalUnits: {
                has: location, // Check if location exists in the additionalUnits array
              },
            },
          ],
        });
      }

      // Run the query
      const result = await this.prisma.user.findMany({
        where: {
          AND: whereConditions, // Combine conditions using AND
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
        `trace id=${uuid()}, GET 'api/risk-register/getuserlist jobTitle query success`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET /risk-register/getuserlist payload ${query} failed with error ${error}`,
      );
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //this api is modified like above in order to support global roles for hindalco
  // async getAllUser(query, userId) {
  //   const { search, location } = query;
  //   const activeUser = await this.prisma.user.findFirst({
  //     where: {
  //       kcId: userId,
  //     },
  //   });
  //   try {
  //     let query;
  //     if (location !== undefined) {
  //       query = {
  //         AND: [
  //           { organizationId: activeUser.organizationId },
  //           { email: { contains: search, mode: 'insensitive' } },
  //           { locationId: location },
  //         ],
  //       };
  //     } else {
  //       query = {
  //         AND: [
  //           { organizationId: activeUser.organizationId },
  //           { email: { contains: search, mode: 'insensitive' } },
  //         ],
  //       };
  //     }

  //     const result = await this.prisma.user.findMany({
  //       where: query,
  //       select: {
  //         id: true,
  //         username: true,
  //         email: true,
  //         firstname: true,
  //         lastname: true,
  //         avatar: true,
  //       },
  //     });
  //     const userWithGlobalRoles=await this.prisma.user.findMany({
  //       where:{
  //         userType:"globalRoles"
  //       }
  //     })
  //     this.logger.log(
  //       `trace id=${uuid()}, GET 'api/risk-register/getuserlist jobTitle query  success`, '',
  //     );
  //     return result;
  //   } catch (error) {
  //     this.logger.error(
  //       `trace id=${uuid()}, GET /risk-register/getuserlist payload ${query}  failed with error ${error} `,
  //     );
  //     throw new HttpException(
  //       {
  //         message: error.message,
  //       },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }

  //not in use
  async updateReviewers(riskId: any, data: any, userId: any) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });
      const result = await this.riskModel.findByIdAndUpdate(riskId, {
        ...data,
        updatedBy: activeUser.username,
      });
      const userEmails = await this.prisma.user.findMany({
        where: {
          id: { in: data.reviewers },
        },
        select: {
          email: true,
        },
      });

      // Send email to all users
      for (const userEmail of userEmails) {
        await sgMail.send({
          to: userEmail.email, // recipient email
          from: process.env.FROM, // sender email
          subject: 'Risk Review Update',
          html: `<div>Risk Review Update</div>
          <div>Comment : ${data.comment}</div>
          
          `,
        });
      }
    } catch (error) {
      ////////console.log('error in update reviewers', error);
    }
  }

  async findAllUsersByLocation(orgId: any) {
    try {
      let whereCondtion = {};
      if (!!orgId) {
        whereCondtion = {
          organizationId: orgId,
          deleted: false,
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
      this.logger.log(
        `trace id=${uuid()}, GET 'api/risk-register/users jobTitle query  success`,
        '',
      );

      return users;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET /risk-register/users/:orgId payload ${orgId}  failed with error ${error} `,
      );
      throw new InternalServerErrorException();
    }
  }

  // async findAllUsersByLocation(locationId: any) {
  //   try {
  //     let whereCondtion = {};
  //     if (!!locationId) {
  //       whereCondtion = {
  //         locationId: locationId,
  //       };
  //     }
  //     const users = await this.prisma.user.findMany({
  //       where: {
  //         ...whereCondtion,
  //       },
  //       select: {
  //         id: true,
  //         username: true,
  //         email: true,
  //         firstname: true,
  //         lastname: true,
  //         avatar: true,
  //       },
  //     });
  //     //////console.log('users by location', users);

  //     return users;
  //   } catch (error) {
  //     //////console.log('errrror', error);
  //   }
  // }

  //not in use
  async addCommentsBulk(data: any[], userId: any) {
    try {
      const newComments = await this.hiraReviewCommentsModel.insertMany(
        data.map((item) => ({
          ...item,
          userId,
        })),
      );
      return newComments;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create comments');
    }
  }

  async getAllJobTitles(orgId: any, entityId: any) {
    try {
      let list = await this.hiraRegisterModel.find(
        { organizationId: orgId, entityId: entityId },
        '_id jobTitle',
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
        `trace id=${uuid()}, GET 'api/risk-register/getAllJobTitles jobTitle query  success`,
        '',
      );
      return uniqueJobTitles;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET /risk-register/hira-register/getAllJobTitles/:orgId/:entityId payload ${orgId} ${entityId}  failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async checkConsolidatedStatus(jobTitle: string, orgId: string) {
    try {
      const result = await this.hiraConsolidatedStatusModel
        .findOne({
          jobTitle: jobTitle,
          organizationId: orgId,
        })
        .lean();

      if (!result) {
        return {
          data: null,
          status: 'open',
          message: 'Hira Not yet submitted for review',
        };
      } else {
        let finalResponse: any = { ...result }; // Spread to clone result

        // Remove any unwanted properties if necessary
        // delete finalResponse.someUnwantedProperty;

        let approvedByUserDetails, reviewedByUserDetails;
        if (result.approvedBy) {
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
        this.logger.log(
          `trace id=${uuid()}, GET 'api/risk-register/checkConsolidatedStatus jobTitle query  success`,
          '',
        );
        return {
          data: finalResponse,
          status: result.status,
          message: 'Hira found in workflow',
        };
      }
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, GET /risk-register/hira-register/checkConsolidatedStatus/:jobTItle/:orgId payload ${jobTitle} ${orgId}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async createConsolidateEntry(body: any, jobTitle: string, orgId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting createConsolidateEntry`,
      JSON.stringify({ jobTitle, orgId, reviewersCount: body?.reviewers?.length, approversCount: body?.approvers?.length }),
    );
    
    try {
      const { reviewers, approvers, url, hiraPageUrl } = body;
      let allHiraIds = [];
      // Check for existing entry with the same jobTitle
      this.logger.debug(
        `traceId=${traceId} - Checking for existing consolidated entry`,
        JSON.stringify({ jobTitle }),
      );
      
      const existingEntry: any = await this.hiraConsolidatedStatusModel.findOne(
        {
          jobTitle: jobTitle,
        },
      );

      this.logger.debug(
        `traceId=${traceId} - Existing entry found`,
        JSON.stringify({ existingEntryId: existingEntry?._id, hasExisting: !!existingEntry }),
      );

      this.logger.debug(
        `traceId=${traceId} - Fetching all HIRAs by job title`,
        JSON.stringify({ jobTitle, orgId }),
      );

      const fetchAllHiraByJobTitle = await this.hiraRegisterModel
        .find({
          jobTitle: jobTitle,
          organizationId: orgId,
          status: 'active',
        })
        .select('_id');

      // console.log(
      //   'fetchAllHiraByJobTitle in createConsolidatedEntry',
      //   fetchAllHiraByJobTitle,
      // );

      // console.log('checkrisk existingEntry', existingEntry);

      if (fetchAllHiraByJobTitle?.length > 0) {
        allHiraIds = fetchAllHiraByJobTitle.map((item) =>
          item?._id?.toString(),
        );
      }

      this.logger.debug(
        `traceId=${traceId} - HIRA IDs collected`,
        JSON.stringify({ allHiraIdsCount: allHiraIds.length, allHiraIds }),
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
        JSON.stringify({ cycleNumber, hasExistingEntry: !!existingEntry }),
      );

      // console.log('checkrisk cycleNyumber', cycleNumber);

      const data: any = {
        createdBy: body?.createdBy,
        status: 'IN_REVIEW',
        jobTitle: jobTitle,
        reviewStartedBy: body?.reviewStartedBy,
        reviewers: reviewers?.map((item: any) => item.id),
        approvers: approvers?.map((item: any) => item.id),
        organizationId: orgId,
        hiraRegisterIds: allHiraIds,
        // reviewComment: body?.reviewComment || '',
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
            hiraRegisterIds: allHiraIds,
            reviewStartedBy: body?.reviewStartedBy,
            // reason : body?.reason,
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

      // console.log(
      //   'inside createConsolidateEntry before updateHiraConsolidatedStatusForNewCycles',
      // );

      if (cycleNumber > 1) {
        this.logger.debug(
          `traceId=${traceId} - Updating for new cycles`,
          JSON.stringify({ cycleNumber, existingEntryId: existingEntry._id }),
        );
        
        this.updateHiraConsolidatedStatusForNewCycles(
          body,
          data,
          existingEntry._id,
          cycleNumber,
          allHiraIds,
          jobTitle,
          existingEntry,
          orgId,
        );
        return;
      }

      const createdByUserDetails = await this.prisma.user.findFirst({
        where: {
          id: body?.createdBy,
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

      // console.log(
      //   'inside createConsolidateEntry after updateHiraConsolidatedStatusForNewCycles',
      // );

      // Bulk update all matching hiraRegisterModel documents
      // const bulkUpdateResult = await this.hiraRegisterModel.bulkWrite(
      //   allHiraIds.map((hiraId) => ({
      //     updateOne: {
      //       filter: { _id: hiraId }, // Match document by id
      //       update: { $set: { status: 'inWorkflow' } }, // Set status to "inWorkflow"
      //     },
      //   })),
      // );

      // console.log('befor updating all body statys', body?.status);

      const bulkUpdateResult = await this.hiraRegisterModel.updateMany(
        { _id: { $in: allHiraIds } }, // Filter to match documents by id
        {
          $set: {
            status: 'inWorkflow',
            workflowStatus: 'IN_REVIEW',
          },
        }, //newly added 7june
        // { $set: {workflowStatus : body?.status }} //newly added 7june
      );

      // console.log('Bulk update result:', bulkUpdateResult);

      const result = await this.hiraConsolidatedStatusModel.create(data);

      if (!!result) {
        const deleteEntryInChangesTrack =
          await this.deleteEntryInHiraHistoryTrack(jobTitle, orgId);
        // console.log(
        //   'chekrisk DELETEENTRYINCHANGESTRACK',
        //   deleteEntryInChangesTrack,
        // );
      }

      // Function to send email asynchronously
      const sendEmail = async (recipients, subject, html) => {
        try {
          if (process.env.MAIL_SYSTEM === 'IP_BASED') {
            // console.log('inside ip based');

            const result = await this.emailService.sendBulkEmails(
              recipients,
              subject,
              '',
              html,
            );
            // console.log('sent mail', result);
          } else {
            try {
              try {
                await sgMail.send({
                  to: recipients,
                  from: process.env.FROM,
                  subject: subject,
                  html: html,
                });
                console.log('Email sent successfully to:', recipients);
              } catch (error) {
                throw error;
              }

              console.log('Email sent successfully to:', recipients);
            } catch (error) {
              throw error;
            }
          }
          // //console.log('Email sent successfully to:', recipients);
        } catch (error) {
          console.error('Error sending email:', error);
        }
      };

      // Prepare and dispatch emails for reviewers
      if (reviewers?.length) {
        // //console.log('checkrisk inside reviewer if', result?._id);

        const reviewerEmails = reviewers.map((userObj) => userObj.email);
        const formattedDate = moment(existingEntry?.createdAt).format(
          'DD/MM/YYYY HH:mm',
        );
        const reviewerHtml = `<div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #003566; text-align: center;">HIRA Initiated For Workflow</h2>
          <p>Hi,</p>
          <p>A HIRA has been sent for review.</p>
          <p><strong>Job Title:</strong> ${jobTitle}</p>
          <p><strong>Corp Func/Unit:</strong> ${body?.locationName}</p>
          <p><strong>Vertical/Dept:</strong> ${body?.entityName}</p>
          <p><strong>Created On:</strong> ${formattedDate}</p>
          <p><strong>Comment:</strong> ${body.reviewComment}</p>
          <p>Please click the link below to review / reject the HIRA:</p>
          ${process.env.PROTOCOL + '://' + url + '/' + result?._id}
          <p>Please Click the link below to edit the HIRA:</p>
          ${process.env.PROTOCOL + '://' + hiraPageUrl}
          <p>Thanks,</p>
          <p>${
            createdByUserDetails?.firstname +
            ' ' +
            createdByUserDetails?.lastname
          }</p>
          <p>${createdByUserDetails?.email}</p>
          </div>
      </div>`;
        sendEmail(reviewerEmails, 'Hira Initiated For Workflow', reviewerHtml);
      }

      if (!result) {
        this.logger.log(
          `trace id=${uuid()}, POST 'api/risk-register/createConsolidateEntry jobTitle query  success`,
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
          `trace id=${uuid()}, POST 'api/risk-register/createConsolidateEntry jobTitle query  success`,
          '',
        );
        return {
          data: result,
          status: result.status,
          message: 'Hira Successfully Sent For Review. Emails are being sent.',
        };
      }
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, POST /risk-register/hira-register/createConsolidateEntry/:jobTItle/:orgId payload ${body} ${orgId}  failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async sendMailToReviewersFirstVersion(
    reviewers,
    url,
    hiraPageUrl,
    result,
    reviewStartedBy,
    payloadBody,
  ) {
    const reviewerEmails = reviewers.map((userObj) => userObj.email);
    //get current time in DD/MM/YYYY HH:mm
    const formattedDate = moment(result?.updatedAt).format('DD/MM/YYYY HH:mm');
    const createdByUserDetails = await this.prisma.user.findFirst({
      where: {
        id: reviewStartedBy,
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
    const htmlForReviewer = getReviewerMailTemplate(
      payloadBody?.jobTitle,
      payloadBody,
      formattedDate,
      url,
      hiraPageUrl,
      createdByUserDetails,
    );
    this.sendEmail(
      reviewerEmails,
      'HIRA Initiated For Review',
      htmlForReviewer,
    );
  }

  async sendMailToApprovers(
    approvers,
    url,
    hiraPageUrl,
    result,
    reviewedBy,
    payloadBody,
  ) {
    // console.log("approvers in sendMail to approvers", approvers);
    // console.log("reviewedBy in sendMail to approvers", reviewedBy);

    const userDetails = await this.prisma.user.findMany({
      where: {
        id: {
          in: [...approvers, reviewedBy, result?.createdBy],
        },
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
      },
    });
    //get current time in DD/MM/YYYY HH:mm
    const formattedDate = moment(result?.updatedAt).format('DD/MM/YYYY HH:mm');
    const approverEmails = userDetails
      ?.filter((item: any) => approvers?.includes(item.id))
      .map((item) => item.email);
    // console.log("approver emails in sendMail to approvers", approverEmails);

    const reviewedByUserDetails = userDetails?.find(
      (item: any) => item.id === reviewedBy,
    );

    // console.log("reviewed by user details in sendMail to approvers", reviewedByUserDetails);
    const hiraCreatedByEmail = userDetails?.find(
      (item: any) => item.id === result?.createdBy,
    )?.email;
    const ccEmailsSet = new Set([
      hiraCreatedByEmail,
      reviewedByUserDetails?.email,
    ]);
    let ccEmails = Array.from(ccEmailsSet);
    // console.log("ccEmails in sendMail to approvers", ccEmails);

    const htmlForApprover = getApproverMailTemplate(
      payloadBody?.jobTitle,
      payloadBody,
      formattedDate,
      url,
      hiraPageUrl,
      reviewedByUserDetails,
    );
    // Filter out any email from ccEmails that is present in approverEmails
    ccEmails = ccEmails.filter((email) => !approverEmails.includes(email));
    if(approverEmails?.length) {
      this.sendEmailWithCcOption(
        approverEmails,
        ccEmails,
        'Hira Review Completed, Requested Approval',
        htmlForApprover,
      );
    }
  }

  async sendMailToUsersWhenHiraIsApproved(
    creator,
    reviewedBy,
    responsiblePersonIdArray = [],
    assesmentTeamUserIds = [],
    hiraPageUrl,
    result,
    approvedBy,
    payloadBody,
  ) {
    //get current time in DD/MM/YYYY HH:mm
    const formattedDate = moment(result?.updatedAt).format('DD/MM/YYYY HH:mm');
    const userDetails = await this.prisma.user.findMany({
      where: {
        id: {
          in: [
            approvedBy,
            creator,
            reviewedBy,
            ...responsiblePersonIdArray,
            ...assesmentTeamUserIds,
          ],
        },
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
    const creatorEmail = userDetails?.find(
      (item: any) => item.id === creator,
    )?.email;
    // console.log("creator email in sendMailToCreatorWhenHiraIsApproved", creatorEmail);
    const approvedByUserDetails = userDetails?.find(
      (item: any) => item.id === approvedBy,
    );
    // console.log("approved by user details in sendMailToCreatorWhenHiraIsApproved", approvedByUserDetails);
    const htmlForCreator = getCreatorMailTemplateWhenHiraIsApproved(
      payloadBody,
      formattedDate,
      hiraPageUrl,
      approvedByUserDetails,
    );
    const reviewedByEmail = userDetails?.find(
      (item: any) => item.id === reviewedBy,
    )?.email;
    let responsiblePersonEmails = [];
    if (responsiblePersonIdArray.length) {
      responsiblePersonEmails = userDetails
        ?.filter((item: any) => responsiblePersonIdArray?.includes(item.id))
        .map((item) => item.email);
    }
    const assesmentTeamEmails = userDetails
      ?.filter((item: any) => assesmentTeamUserIds?.includes(item.id))
      .map((item) => item.email);
    // console.log("assesment team emails in sendMailToCreatorWhenHiraIsApproved", assesmentTeamEmails);

    //cc to reviewer, responsiblePeople, assesmentTeam People
    const ccEmailsSet = new Set([
      reviewedByEmail,
      ...responsiblePersonEmails,
      ...assesmentTeamEmails,
    ]);

    let ccEmailArray = Array.from(ccEmailsSet);

    // console.log("ccEmailArray in sendMailToUsersWhenHiraIsApproved", ccEmailArray);

    // Filter out the recipient's email from the ccEmailArray
    ccEmailArray = ccEmailArray.filter((email) => email !== creatorEmail);

    if(!!creatorEmail) {
    this.sendEmailWithCcOption(
        [creatorEmail],
        ccEmailArray,
        'Hira Approved',
        htmlForCreator,
      );
    }
  }

  async sendMailToResponsiblePersonWhenHiraIsApproved(
    responsiblePersonIdArray,
    hiraPageUrl,
    result,
    approvedBy,
    payloadBody,
  ) {
    const responsiblePersonEmails = await this.prisma.user.findMany({
      where: {
        id: {
          in: responsiblePersonIdArray,
        },
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
      },
    });
    const emails = responsiblePersonEmails.map((item) => item?.email);


    //get current time in DD/MM/YYYY HH:mm
    const formattedDate = moment(result?.updatedAt).format('DD/MM/YYYY HH:mm');
    const createdByUserDetails = await this.prisma.user.findFirst({
      where: {
        id: approvedBy,
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
    // console.log("responsible person emails", emails);

    const htmlForResponsiblePeople =
      getResponsiblePersonMailTempalateWhenHiraIsApproved(
        payloadBody,
        formattedDate,
        hiraPageUrl,
        createdByUserDetails,
      );
    if(emails && emails?.length) {
      this.sendEmail(
        emails,
        'Hira Approval Notification',
        htmlForResponsiblePeople,
      );
    }
   
  }

  async sendMailToCreatorWhenHiraIsRejectedInReview(
    creator,
    hiraPageUrl,
    result,
    rejectedBy,
    payloadBody,
  ) {
    const userDetails = await this.prisma.user.findMany({
      where: {
        id: {
          in: [rejectedBy, creator],
        },
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
    const creatorEmail = userDetails?.find(
      (item: any) => item.id === creator,
    )?.email;
    const rejectedByUserDetails = userDetails?.find(
      (item: any) => item.id === rejectedBy,
    );

    const htmlForCreatorAndReviewers =
      getCreatorAndReviewerMailTemplateWhenHiraIsRejected(
        payloadBody,
        hiraPageUrl,
        rejectedByUserDetails,
      );
    if(!!creatorEmail) {
      this.sendEmail([creatorEmail], 'Hira Rejected', htmlForCreatorAndReviewers);
    }
  }

  async sendMailToCreatorAndReviewerOnHiraRejectionInApproval(
    creator,
    reviewedBy,
    hiraPageUrl,
    result,
    rejectedBy,
    payloadBody,
  ) {
    const userDetails = await this.prisma.user.findMany({
      where: {
        id: {
          in: [reviewedBy, rejectedBy, creator],
        },
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
    const creatorEmail = userDetails?.find(
      (item: any) => item.id === creator,
    )?.email;
    const rejectedByUserDetails = userDetails?.find(
      (item: any) => item.id === rejectedBy,
    );
    const reviewerEmail = userDetails?.find(
      (item: any) => item.id === reviewedBy,
    )?.email;
    const htmlForCreatorAndReviewers =
      getCreatorAndReviewerMailTemplateWhenHiraIsRejected(
        payloadBody,
        hiraPageUrl,
        rejectedByUserDetails,
      );
    if(creatorEmail && reviewerEmail) {
      this.sendEmailWithCcOption(
        [creatorEmail],
        [reviewerEmail],
        'Hira Rejected',
        htmlForCreatorAndReviewers,
      );
    }
  }

  async startReviewFirstVersion(body: any, hiraId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting startReviewFirstVersion`,
      JSON.stringify({ hiraId, reviewersCount: body?.reviewers?.length, approversCount: body?.approvers?.length }),
    );
    
    try {
      // Input validation
      if (!hiraId || !body) {
        throw new Error('Invalid input: HIRA ID or body is missing');
      }
      const { reviewers, approvers, reviewStartedBy } = body;
      // console.log("body in start review first version", body);

      // Validate required fields
      if (!reviewStartedBy || !reviewers?.length || !approvers?.length) {
        throw new Error(
          'Missing required fields: reviewStartedBy, reviewers, or approvers',
        );
      }
      const existingHira = await this.hiraModel
        .findOne({
          _id: hiraId,
        })
        .select('currentVersion');
      const targetCycleNumber = existingHira.currentVersion + 1;
      // console.log("targetCcyclenumenr in startReviewFirstVersion status --- ", targetCycleNumber);

      const workflowObjectToBePushed: any = {
        cycleNumber: targetCycleNumber,
        status: 'IN_REVIEW',
        reviewStartedBy: reviewStartedBy,
        reviewers: reviewers?.map((item: any) => item.id),
        approvers: approvers?.map((item: any) => item.id),
        comments: body?.comments || [],
        workflowHistory: [
          {
            action: 'Review Started',
            by: reviewStartedBy,
            datetime: new Date(), // Current date and time
          },
        ],
        reason: body?.reason || '',
      };

      const result = await this.hiraModel.findByIdAndUpdate(
        hiraId,
        {
          $push: { workflow: workflowObjectToBePushed }, // Push the new workflow entry to the workflow array
          $set: {
            workflowStatus: 'IN_REVIEW',
            createdBy: reviewStartedBy, // Optionally set the createdBy field
          },
        },
        { new: true }, // Return the updated document
      );
      // Check if the update operation succeeded
      if (!result) {
        throw new Error(`Failed to update HIRA record with ID ${hiraId}`);
      }
      const workflowUrl = `${
        process.env.PROTOCOL + '://' + body.url + '/' + hiraId
      }`;
      const hiraPageUrl = `${
        process.env.PROTOCOL + '://' + body.hiraPageUrl + '/' + hiraId
      }`;
      this.sendMailToReviewersFirstVersion(
        reviewers,
        workflowUrl,
        hiraPageUrl,
        result,
        reviewStartedBy,
        body,
      );
      return result;
    } catch (error) {
      // Log error for debugging
      console.error('Error in startReviewFirstVersion:', error);
      // Rethrow the error to be handled by the calling function or middleware
      throw new Error(`Unable to start review: ${error.message}`);
    }
  }

  async startHiraReviewOfRejectedHira(body: any, hiraId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting startHiraReviewOfRejectedHira`,
      JSON.stringify({ hiraId, reviewersCount: body?.reviewers?.length, approversCount: body?.approvers?.length }),
    );
    
    try {
      // Input validation
      if (!hiraId || !body) {
        throw new Error('Invalid input: HIRA ID or body is missing');
      }
      const { reviewers, approvers, reviewStartedBy } = body;
      // console.log("body in start review first version", body);

      // Validate required fields
      if (!reviewStartedBy || !reviewers?.length || !approvers?.length) {
        throw new Error(
          'Missing required fields: reviewStartedBy, reviewers, or approvers',
        );
      }

      const existingHira = await this.hiraModel.findById(hiraId);
      // Check if the document exists
      if (!existingHira) {
        throw new Error(`No HIRA found with ID ${hiraId}`);
      }

      // console.log("existingHira in startHiraReviewOfRejectedHira status --- ", body?.status,existingHira);

      // Determine the target cycle number for update
      const targetCycleNumber = existingHira.currentVersion + 1;

      let updateStatusQueryResult;
      updateStatusQueryResult = await this.hiraModel.updateOne(
        {
          _id: hiraId,
          'workflow.cycleNumber': targetCycleNumber,
        },
        {
          $set: {
            'workflow.$.status': body?.status,
            'workflow.$.reviewStartedBy': reviewStartedBy,
            'workflow.$.reviewedOn': '',
            reviewers: reviewers?.map((item: any) => item.id),
            approvers: approvers?.map((item: any) => item.id),
            comments: body?.comments || [],
            workflowStatus: body?.status,
          },
          $push: {
            'workflow.$.workflowHistory': {
              action: 'Review Started',
              by: reviewStartedBy,
              datetime: new Date(), // Current date and time
            },
          },
        },
      );

      // Check if the update operation succeeded
      if (!updateStatusQueryResult?.modifiedCount) {
        throw new Error(`Failed to update HIRA record with ID ${hiraId}`);
      }
      const workflowUrl = `${
        process.env.PROTOCOL + '://' + body.url + '/' + hiraId
      }`;
      const hiraPageUrl = `${
        process.env.PROTOCOL + '://' + body.hiraPageUrl + '/' + hiraId
      }`;
      this.sendMailToReviewersFirstVersion(
        reviewers,
        workflowUrl,
        hiraPageUrl,
        existingHira,
        reviewStartedBy,
        body,
      );
      return updateStatusQueryResult;
    } catch (error) {
      // Log error for debugging
      console.error('Error in startReviewFirstVersion:', error);
      // Rethrow the error to be handled by the calling function or middleware
      throw new Error(`Unable to start review: ${error.message}`);
    }
  }

  async approveHiraFirstVersionAndCreateHiraCopy(
    existingHira: any,
    hiraId: any,
    payloadBody: any,
  ) {
    const session = await this.hiraModel.startSession();
    session.startTransaction();
    try {
      const targetCycleNumber = existingHira.currentVersion + 1;
      let serialNumber, mappedserialNumber;

      if (existingHira?.currentVersion === 0) {
        //generate serial number and save it in the hira
        serialNumber = await this.serialNumberService.generateSerialNumber({
          moduleType: 'HIRA',
          location: payloadBody?.locationId,
          entity: payloadBody?.entityId,
          year: payloadBody?.year.toString(),
          createdBy: payloadBody?.updatedBy,
          organizationId: payloadBody.organizationId,
        });

        // console.log("GENERATE SERIAL NUMBER RESULT-->", serialNumber);

        if (serialNumber === undefined || serialNumber === '') {
          return new ConflictException({ status: 409 });
        }
        mappedserialNumber = await this.mapserialnumber(
          serialNumber,
          payloadBody?.locationId,
          payloadBody?.entityId,
          payloadBody.organizationId,
        );

        // console.log("MAPPED SERIAL NUMBER-->", mappedserialNumber);
      }
      const now = new Date()
      // Update the workflow status and add history for the existing HIRA before copying
      const updateStatusQueryResult = await this.hiraModel.updateOne(
        {
          _id: hiraId,
          'workflow.cycleNumber': targetCycleNumber,
        },
        {
          $set: {
            'workflow.$.status': 'APPROVED',
            'workflow.$.approvedBy': payloadBody?.updatedBy,
            'workflow.$.approvedOn': now,
            workflowStatus: 'APPROVED',
            ...(existingHira?.currentVersion === 0 && {
              prefixSuffix: mappedserialNumber,
            }),
          },
          $push: {
            'workflow.$.workflowHistory': {
              action: 'Approved',
              by: payloadBody?.updatedBy,
              datetime: now,
            },
            ...(payloadBody?.comments?.length && {
              'workflow.$.comments': {
                $each: payloadBody?.comments, // Push each comment to the existing comments array
              },
            }),
          },
        },
        { session },
      );
      ;

      // Check if the workflow update was successful before proceeding
      if (
        !updateStatusQueryResult ||
        updateStatusQueryResult.modifiedCount === 0
      ) {
        throw new Error('Failed to update workflow status.');
      }

      // Update the status of the original HIRA to "archived"
      await this.hiraModel.updateOne(
        { _id: hiraId },
        { $set: { status: 'archived' } },
        { session },
      );

      // Copy all steps associated with the original HIRA and set them to "active"
      const copiedSteps = await Promise.all(
        existingHira.stepIds.map(async (stepId: string) => {
          const step = await this.hiraStepsModel
            .findById(stepId)
            .session(session);

          if (!step) {
            throw new Error(`Step with ID ${stepId} not found`);
          }

          // Update the status of the original step to "archived"
          await this.hiraStepsModel.updateOne(
            { _id: stepId },
            { $set: { status: 'archived' } },
            { session },
          );

          // Create a copy of the step with status "active"
          const copiedStep = new this.hiraStepsModel({
            ...step.toObject(),
            _id: undefined, // Mongoose will create a new ID for this document
            status: 'active',
            // createdAt: now,
            // updatedAt: now,
          });

          // Save the copied step and return the new ID
          const savedStep = await copiedStep.save({ session });
          return savedStep._id;
        }),
      );

      // Create a new copy of the HIRA with the updated fields
      const hiraCopyObject = existingHira.toObject(); // Convert the original HIRA to a plain object

      // Remove the fields that should be automatically generated or need to be updated
      delete hiraCopyObject._id; // Allow Mongoose to create a new ID for the copy
      // delete hiraCopyObject.createdAt; // Reset the createdAt date
      // delete hiraCopyObject.updatedAt; // Reset the updatedAt date

      // Update the necessary fields for the copy
      hiraCopyObject.stepIds = copiedSteps?.map((stepId: any) =>
        stepId?.toString(),
      ); // Assign the copied step IDs
      hiraCopyObject.status = 'active'; // Set the new status
      hiraCopyObject.workflowStatus = 'APPROVED'; // Set the workflow status to 'APPROVED'
      if (existingHira?.currentVersion === 0) {
        hiraCopyObject.prefixSuffix = mappedserialNumber;
      }

      hiraCopyObject.currentVersion = targetCycleNumber; // Set the new version
      // hiraCopyObject.createdAt = now // Set the current creation date
      // hiraCopyObject.updatedAt = now // Set the current update date

      // Update the workflow status directly in the copied object
      hiraCopyObject.workflow = hiraCopyObject.workflow.map((workflow: any) => {
        if (workflow.cycleNumber === targetCycleNumber) {
          // Update the workflow object for the target cycle number
          return {
            ...workflow,
            status: 'APPROVED',
            approvedBy: payloadBody?.updatedBy,
            approvedOn: now,
            workflowHistory: [
              ...(workflow.workflowHistory || []),
              {
                action: 'Approved',
                by: payloadBody?.updatedBy,
                datetime: now,
              },
            ],
            comments: [
              ...(workflow.comments || []),
              ...(payloadBody?.comments?.length ? payloadBody.comments : []),
            ],
            hiraId: hiraId, // Add the archived HIRA ID in the current workflow cycle
          };
        }
        return workflow;
      });
      // console.log("hiraCopyObject", hiraCopyObject);
      // Create a new HIRA document using the modified object
      const copiedHira = await this.hiraModel.create([hiraCopyObject], {
        session,
      });

      // Extract the created HIRA from the result (since create returns an array)
      const savedHiraCopy = copiedHira[0];

      // Check for references and update refTo to the new HIRA ID
      const existingRefs = await this.refsService.getAllById(hiraId);
      // console.log("existingRefs in approveHiraFirstVersionANdCreateHira--", existingRefs);

      if (existingRefs && existingRefs.length > 0) {
        await Promise.all(
          existingRefs.map(async (ref: any) => {
            await this.refsService.update({
              refs: [{ ...ref, refTo: savedHiraCopy._id?.toString() }],
              id: hiraId,
            });
          }),
        );
      }
      // Commit the transaction if everything succeeds
      await session.commitTransaction();
      session.endSession();

      // Send notifications outside the transaction after successful commit
      const hiraPageUrl = `${
        process.env.PROTOCOL +
        '://' +
        payloadBody.hiraPageUrl +
        '/' +
        savedHiraCopy._id
      }`;
      // console.log("createdBy in approveHiraFirstVersionANdCreateHira--", hiraCopyObject?.createdBy);

      const ongoingWorkflowObject = existingHira.workflow.find(
        (workflow) => workflow.cycleNumber === targetCycleNumber,
      );

      // Fetch the responsible persons from the copied steps for notifications
      const getResponsiblePersonFromSteps = await this.hiraStepsModel
        .find({
          _id: { $in: hiraCopyObject?.stepIds },
        })
        .select('responsiblePerson');

      const responsiblePersonIdArray = getResponsiblePersonFromSteps
        .map((item) => item?.responsiblePerson)
        .filter((item) => !!item);
      const assesmentTeamUserIds = hiraCopyObject?.assesmentTeam;

      // Send mail to the creator, cc to reviewedBy, responsiblePeople and assessMentTEam
      this.sendMailToUsersWhenHiraIsApproved(
        hiraCopyObject?.createdBy,
        ongoingWorkflowObject?.reviewedBy,
        responsiblePersonIdArray,
        assesmentTeamUserIds,
        hiraPageUrl,
        hiraCopyObject,
        payloadBody?.approvedBy,
        payloadBody,
      );

      // console.log("responsiblePersonIdArray in approveHiraFirstVersionANdCreateHira", responsiblePersonIdArray);

      // Send mail to responsible persons if there are any
      if (responsiblePersonIdArray?.length) {
        this.sendMailToResponsiblePersonWhenHiraIsApproved(
          responsiblePersonIdArray,
          hiraPageUrl,
          hiraCopyObject,
          payloadBody?.approvedBy,
          payloadBody,
        );
      }

      return savedHiraCopy;
    } catch (error) {
      // Rollback the transaction in case of any error
      await session.abortTransaction();
      session.endSession();
      console.log('Error in approveHiraFirstVersionAndCreateHiraCopy:', error);
      throw error;
    }
  }

  async updateWorkflowStatus(body: any, hiraId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting updateWorkflowStatus`,
      JSON.stringify({ hiraId, body, status: body?.status }),
    );

    try {
      this.logger.debug(
        `traceId=${traceId} - Input validation`,
        JSON.stringify({ hiraId, bodyPresent: !!body }),
      );

      // Input validation
      if (!hiraId || !body) {
        throw new Error('Invalid input: HIRA ID or body is missing');
      }
      const { status, updatedBy, reviewedBy, comment } = body;
      // Validate required fields
      if (!updatedBy || !status) {
        throw new Error('Missing required fields: userId or status');
      }

      this.logger.debug(
        `traceId=${traceId} - Finding existing HIRA`,
        JSON.stringify({ hiraId }),
      );

      // Find the document by ID
      const existingHira = await this.hiraModel.findById(hiraId);
      // Check if the document exists
      if (!existingHira) {
        throw new Error(`No HIRA found with ID ${hiraId}`);
      }

      this.logger.debug(
        `traceId=${traceId} - Existing HIRA found`,
        JSON.stringify({ 
          hiraId: existingHira._id,
          currentVersion: existingHira.currentVersion,
          workflowStatus: existingHira.workflowStatus
        }),
      );

      // console.log("existingHira in updateWorkflowStatus status --- ", status,existingHira);

      // Determine the target cycle number for update
      const targetCycleNumber = existingHira.currentVersion + 1;
      
      this.logger.debug(
        `traceId=${traceId} - Processing status update`,
        JSON.stringify({ 
          status,
          targetCycleNumber,
          updatedBy: updatedBy || reviewedBy
        }),
      );

      let updateStatusQueryResult;
      if (status === 'IN_APPROVAL') {
        this.logger.debug(
          `traceId=${traceId} - Processing IN_APPROVAL status`,
          JSON.stringify({ hiraId, targetCycleNumber }),
        );

        // Perform the update for the specific workflow with the target cycle number
        updateStatusQueryResult = await this.hiraModel.updateOne(
          {
            _id: hiraId,
            'workflow.cycleNumber': targetCycleNumber,
          },
          {
            $set: {
              'workflow.$.status': status,
              'workflow.$.reviewedBy': reviewedBy,
              'workflow.$.reviewedOn': new Date(),
              workflowStatus: status,
            },
            $push: {
              'workflow.$.workflowHistory': {
                action: 'Review Completed',
                by: reviewedBy,
                datetime: new Date(),
              },
              ...(body?.comments?.length && {
                'workflow.$.comments': {
                  $each: body?.comments, // Push each comment to the existing comments array
                },
              }),
            },
          },
        );
        // console.log(
        //   'updateStatusQueryResult in updateworkflowstatus status ==',
        //   status,
        //   updateStatusQueryResult,
        // );
        const ongoingWorkflowObject = existingHira.workflow.find(
          (workflow) => workflow.cycleNumber === targetCycleNumber,
        );

        // console.log(
        //   'ongoingWorkflowObject in updateworkflowstatus status ==',
        //   status,
        //   ongoingWorkflowObject,
        // );

        this.logger.debug(
          `traceId=${traceId} - IN_APPROVAL update completed`,
          JSON.stringify({ 
            updateResult: !!updateStatusQueryResult,
            matchedCount: updateStatusQueryResult?.matchedCount,
            modifiedCount: updateStatusQueryResult?.modifiedCount
          }),
        );

        if (!!updateStatusQueryResult) {
          this.logger.debug(
            `traceId=${traceId} - Sending approval emails`,
            JSON.stringify({ 
              approversCount: ongoingWorkflowObject?.approvers?.length,
              reviewedBy
            }),
          );

          const workflowUrl = `${
            process.env.PROTOCOL + '://' + body.url + '/' + hiraId
          }`;
          const hiraPageUrl = `${
            process.env.PROTOCOL + '://' + body.hiraPageUrl + '/' + hiraId
          }`;
          //send mail to approvers
          this.sendMailToApprovers(
            ongoingWorkflowObject?.approvers,
            workflowUrl,
            hiraPageUrl,
            existingHira,
            reviewedBy,
            body,
          );

          this.logger.debug(
            `traceId=${traceId} - Approval emails sent successfully`,
            JSON.stringify({ hiraId }),
          );
        }
        return updateStatusQueryResult;
      } else if (status === 'REJECTED') {
        this.logger.debug(
          `traceId=${traceId} - Processing REJECTED status`,
          JSON.stringify({ hiraId, targetCycleNumber }),
        );

        const existingWorkflowStatus = existingHira.workflow.find(
          (workflow) => workflow.cycleNumber === targetCycleNumber,
        ).status;

        this.logger.debug(
          `traceId=${traceId} - Found existing workflow status`,
          JSON.stringify({ existingWorkflowStatus, rejectedBy: body?.rejectedBy }),
        );

        updateStatusQueryResult = await this.hiraModel.updateOne(
          {
            _id: hiraId,
            'workflow.cycleNumber': targetCycleNumber,
          },
          {
            $set: {
              'workflow.$.status': status,
              'workflow.$.rejectedBy': body?.rejectedBy,
              workflowStatus: status,
            },
            $push: {
              'workflow.$.workflowHistory': {
                action: 'Rejected',
                by: body?.rejectedBy,
                datetime: new Date(),
              },
              ...(body?.comments?.length && {
                'workflow.$.comments': {
                  $each: body?.comments, // Push each comment to the existing comments array
                },
              }),
            },
          },
        );
        // console.log(
        //   'updateStatusQueryResult in updateworkflowstatus status ==',
        //   status,
        //   updateStatusQueryResult,
        // );
        const ongoingWorkflowObject = existingHira.workflow.find(
          (workflow) => workflow.cycleNumber === targetCycleNumber,
        );

        // console.log(
        //   'ongoingWorkflowObject in updateworkflowstatus status ==',
        //   status,
        //   ongoingWorkflowObject,
        // );

        this.logger.debug(
          `traceId=${traceId} - REJECTED update completed`,
          JSON.stringify({ 
            updateResult: !!updateStatusQueryResult,
            matchedCount: updateStatusQueryResult?.matchedCount,
            modifiedCount: updateStatusQueryResult?.modifiedCount
          }),
        );

        if (!!updateStatusQueryResult) {
          this.logger.debug(
            `traceId=${traceId} - Sending rejection emails`,
            JSON.stringify({ 
              existingWorkflowStatus,
              createdBy: existingHira?.createdBy
            }),
          );

          const hiraPageUrl = `${
            process.env.PROTOCOL + '://' + body.hiraPageUrl + '/' + hiraId
          }`;
          if (existingWorkflowStatus === 'IN_REVIEW') {
            //send mail to creator when hira is reject in IN_REVIEW stage
            this.sendMailToCreatorWhenHiraIsRejectedInReview(
              existingHira?.createdBy,
              hiraPageUrl,
              existingHira,
              body?.rejectedBy,
              body,
            );
          } else if (existingWorkflowStatus === 'IN_APPROVAL') {
            //send mail to creator and cc to reviewer
            this.sendMailToCreatorAndReviewerOnHiraRejectionInApproval(
              existingHira?.createdBy,
              ongoingWorkflowObject?.reviewedBy,
              hiraPageUrl,
              existingHira,
              body?.rejectedBy,
              body,
            );
          }

          this.logger.debug(
            `traceId=${traceId} - Rejection emails sent successfully`,
            JSON.stringify({ hiraId }),
          );
        }
        return updateStatusQueryResult;
      } else if (status === 'APPROVED') {
        this.logger.debug(
          `traceId=${traceId} - Processing APPROVED status`,
          JSON.stringify({ 
            hiraId,
            currentVersion: existingHira?.currentVersion,
            approvedBy: body?.approvedBy
          }),
        );

        // if(existingHira?.currentVersion === 0) {
        this.approveHiraFirstVersionAndCreateHiraCopy(
          existingHira,
          hiraId,
          body,
        );

        this.logger.debug(
          `traceId=${traceId} - APPROVED process initiated`,
          JSON.stringify({ hiraId }),
        );
        // console.log("updateStatusQueryResult", updateStatusQueryResult);
        // }
      }

      this.logger.debug(
        `traceId=${traceId} - updateWorkflowStatus completed successfully`,
        JSON.stringify({ 
          success: true,
          hiraId,
          status,
          hasResult: !!updateStatusQueryResult
        }),
      );

      return updateStatusQueryResult;
    } catch (error) {
      this.logger.debug(
        `traceId=${traceId} - updateWorkflowStatus failed with error`,
        JSON.stringify({ error: error.message, hiraId, status: body?.status }),
      );

      console.log('Error in updateWorkflowStatus:', error);
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
      const result = await this.hiraConsolidatedStatusModel.findOne({
        _id: hiraWorkflowId,
      });

      const resultObj = result?.toObject();
      let approvedByUserDetails;
      // console.log('result obj-->', resultObj);

      const objectWithLargestCycleNumber = this.getObjectWithLargestCycleNumber(
        resultObj.workflow,
      );

      const workflowUserIds =
        objectWithLargestCycleNumber?.workflowHistory?.map(
          (history) => history.by,
        );
      // console.log('workflow ids ->', workflowUserIds);

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

      // console.log('workflow user details--->', workflowUserDetails);

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

      // console.log('approvedByUserDetails', approvedByUserDetails);

      if (!result) {
        this.logger.log(
          `trace id=${uuid()}, GET 'api/risk-register/updateConsolidatedEntry jobTitle query  success`,
          '',
        );
        return {
          data: null,
          status: '',
          message: 'Hira Not Found In Workflow',
        };
      } else {
        this.logger.log(
          `trace id=${uuid()}, GET 'api/risk-register/updateConsolidatedEntry jobTitle query  success`,
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
          message: 'Hira In Workflow Successfully Fetched!',
        };
      }
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, GET /risk-register/hira-register/getHiraInWorkflow/:hiraWorkflowId/ payload ${hiraWorkflowId} failed with error ${err} `,
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
        status: body?.status,
        jobTitle: body?.jobTitle
      }),
    );

    try {
      this.logger.debug(
        `traceId=${traceId} - Extracting body parameters`,
        JSON.stringify({ 
          hasApprovers: !!body?.approvers,
          hasReviewers: !!body?.reviewers,
          approversCount: body?.approvers?.length,
          reviewersCount: body?.reviewers?.length
        }),
      );

      const { approvers, url, reviewers, hiraPageUrl } = body;
      let allHiraIds = [];
      let serialNumber;

      this.logger.debug(
        `traceId=${traceId} - Finding active user`,
        JSON.stringify({ kcId: userId }),
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
        `traceId=${traceId} - Active user found`,
        JSON.stringify({ 
          userId: activeuser?.id,
          organizationId: activeuser?.organization?.id,
          locationId: activeuser?.location?.id
        }),
      );

      this.logger.debug(
        `traceId=${traceId} - Fetching HIRA records by job title`,
        JSON.stringify({ jobTitle: body?.jobTitle }),
      );

      const fetchAllHiraByJobTitle = await this.hiraRegisterModel
        .find({
          jobTitle: body?.jobTitle,
          status: 'inWorkflow',
        })
        .select('_id');

      if (fetchAllHiraByJobTitle?.length > 0) {
        allHiraIds = fetchAllHiraByJobTitle.map((item) =>
          item?._id?.toString(),
        );
      }

      this.logger.debug(
        `traceId=${traceId} - HIRA records collection completed`,
        JSON.stringify({ 
          hiraCoun: fetchAllHiraByJobTitle?.length,
          allHiraIdsCount: allHiraIds?.length
        }),
      );

      this.logger.debug(
        `traceId=${traceId} - Preparing update object`,
        JSON.stringify({ 
          status: body?.status,
          hiraRegisterIdsCount: allHiraIds?.length
        }),
      );

      let update: any = {
        // updatedBy: body?.updatedBy,
        // status: body?.status,
        status: body?.status,
        // hiraRegisterIds: body?.hiraRegisterIds,
        hiraRegisterIds: allHiraIds,
      };

      // Prepare to push new comments if they exist
      // if (body.comments && body.comments.length > 0) {
      //   update['$push'] = {
      //     comments: { $each: body.comments },
      //   };
      //   // update['$push']['workflow.$[elem].comments'] = { $each: body.comments };

      // }

      // Handle status updates in the workflow
      if (body?.status === 'IN_APPROVAL' || body?.status === 'APPROVED') {
        this.logger.debug(
          `traceId=${traceId} - Processing approval flow`,
          JSON.stringify({ 
            status: body?.status,
            updatedBy: body?.updatedBy
          }),
        );

        update['$set'] = {
          'workflow.$[elem].status': body.status,
          'workflow.$[elem].updatedBy': body?.updatedBy || '',
        };

        if (body?.status === 'IN_APPROVAL') {
          this.logger.debug(
            `traceId=${traceId} - Setting up IN_APPROVAL update`,
            JSON.stringify({ 
              reviewedBy: body?.reviewedBy,
              reviewedOn: new Date()
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
            `traceId=${traceId} - Setting up APPROVED update`,
            JSON.stringify({ 
              approvedBy: body?.approvedBy,
              approvedOn: new Date()
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
          `traceId=${traceId} - Setting up REJECTED update`,
          JSON.stringify({ 
            rejectedBy: body?.updatedBy,
            rejectedOn: new Date()
          }),
        );
        update = {
          ...update,
          // approvedBy: body?.approvedBy || '',
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
        // update['$set']['workflow.$[elem].rejectedBy'] =
        //   body?.rejectedBy || '';
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
      const result = await this.hiraConsolidatedStatusModel.findByIdAndUpdate(
        hiraWorkflowId,
        update,
        {
          arrayFilters: [{ 'elem.status': { $ne: 'APPROVED' } }],
          new: true,
        },
      );

      this.logger.debug(
        `traceId=${traceId} - Consolidated status update completed`,
        JSON.stringify({ 
          success: !!result,
          resultId: result?._id,
          status: result?.status
        }),
      );

      if (!!result && body?.status === 'REJECTED') {
        this.logger.debug(
          `traceId=${traceId} - Processing REJECTED status post-update`,
          JSON.stringify({ 
            allHiraIdsCount: allHiraIds?.length
          }),
        );

        // Update the original documents to have revisionNumber: 0 and status: "archived"
        const updateExisitingHiras = await this.hiraRegisterModel.updateMany(
          {
            _id: { $in: allHiraIds },
          },
          {
            $set: {
              status: 'active',
              workflowStatus: 'REJECTED', //newly added 7june
            },
          },
        );

        this.logger.debug(
          `traceId=${traceId} - REJECTED HIRA updates completed`,
          JSON.stringify({ 
            matchedCount: updateExisitingHiras?.matchedCount,
            modifiedCount: updateExisitingHiras?.modifiedCount
          }),
        );

        // Prepare new rows by copying and updating specific fields

        // console.timeEnd('UPDATE');
      }

      if (!!result && body?.status === 'APPROVED') {
        this.logger.debug(
          `traceId=${traceId} - Processing APPROVED status post-update`,
          JSON.stringify({ 
            allHiraIdsCount: allHiraIds?.length,
            locationId: body?.locationId,
            entityId: body?.entityId,
            year: body?.year
          }),
        );

        serialNumber = await this.serialNumberService.generateSerialNumber({
          moduleType: 'HIRA',
          // location: activeuser?.locationId,
          // entity: activeuser?.entityId,
          location: body?.locationId,
          entity: body?.entityId,
          year: body?.year.toString(),
          createdBy: activeuser?.id,
          organizationId: activeuser.organization.id,
        });

        this.logger.debug(
          `traceId=${traceId} - Serial number generated`,
          JSON.stringify({ 
            serialNumber,
            isValid: !!(serialNumber && serialNumber !== '')
          }),
        );

        if (serialNumber === undefined || serialNumber === '') {
          this.logger.debug(
            `traceId=${traceId} - Serial number generation failed`,
            JSON.stringify({ serialNumber }),
          );
          return new ConflictException({ status: 409 });
        }
        const mappedserialNumber = await this.mapserialnumber(
          serialNumber,
          body?.locationId,
          body?.entityId,
          // activeuser?.locationId,
          // activeuser?.entityId,
          activeuser.organization.id,
        );

        this.logger.debug(
          `traceId=${traceId} - Serial number mapped`,
          JSON.stringify({ mappedserialNumber }),
        );

        // console.log('GENERATE MAPPED SERAIL NUMBER', mappedserialNumber);

        this.logger.debug(
          `traceId=${traceId} - Starting HIRA copying process`,
          JSON.stringify({ allHiraIdsCount: allHiraIds?.length }),
        );

        // Fetch rows from hiraRegisterModel that match the condition
        const rowsToCopy = await this.hiraRegisterModel.find({
          _id: { $in: allHiraIds },
        });

        this.logger.debug(
          `traceId=${traceId} - HIRA records fetched for copying`,
          JSON.stringify({ 
            recordsCount: rowsToCopy?.length,
            mappedserialNumber
          }),
        );

        // Update the original documents to have revisionNumber: 0 and status: "archived"
        const updateExisitingHiras = await this.hiraRegisterModel.updateMany(
          {
            _id: { $in: allHiraIds },
          },
          {
            $set: {
              status: 'archived',
              workflowStatus: 'APPROVED',
              prefixSuffix: mappedserialNumber,
            },
          },
        );

        this.logger.debug(
          `traceId=${traceId} - Original HIRA records archived`,
          JSON.stringify({ 
            matchedCount: updateExisitingHiras?.matchedCount,
            modifiedCount: updateExisitingHiras?.modifiedCount
          }),
        );

        // Prepare new rows by copying and updating specific fields
        const newRows = rowsToCopy.map((row) => {
          const currentRevision = row?.revisionNumber || 0; // Get the current revision number, default to 0 if it's not set
          const newRow = {
            ...row.toObject(),
            revisionNumber: currentRevision + 1, // Increment the revision number
            prefixSuffix: mappedserialNumber,
            status: 'active',
            workflowStatus: 'APPROVED', //newly added 7june
          }; // Use toObject() method,
          delete newRow._id; // Ensure the new row gets a new ID
          return newRow;
        });

        this.logger.debug(
          `traceId=${traceId} - New HIRA rows prepared`,
          JSON.stringify({ 
            newRowsCount: newRows?.length,
            sampleRevisionNumber: newRows[0]?.revisionNumber
          }),
        );

        // Insert new rows back into the hiraRegisterModel
        const insertResult = await this.hiraRegisterModel.insertMany(newRows);

        this.logger.debug(
          `traceId=${traceId} - New HIRA rows inserted`,
          JSON.stringify({ 
            insertedCount: insertResult?.length,
            firstInsertedId: insertResult[0]?._id
          }),
        );
      }

      if (!!result && body?.status === 'IN_APPROVAL') {
        this.logger.debug(
          `traceId=${traceId} - Processing IN_APPROVAL status post-update`,
          JSON.stringify({ allHiraIdsCount: allHiraIds?.length }),
        );

        const updateExisitingHiras = await this.hiraRegisterModel.updateMany(
          {
            _id: { $in: allHiraIds },
          },
          {
            $set: { workflowStatus: 'IN_APPROVAL' },
          },
        );

        this.logger.debug(
          `traceId=${traceId} - IN_APPROVAL HIRA updates completed`,
          JSON.stringify({ 
            matchedCount: updateExisitingHiras?.matchedCount,
            modifiedCount: updateExisitingHiras?.modifiedCount
          }),
        );
      }

      let updateComments;
      // Append new comments using $push
      if (body.comments && body.comments.length > 0) {
        this.logger.debug(
          `traceId=${traceId} - Updating comments`,
          JSON.stringify({ 
            commentsCount: body.comments?.length,
            hiraWorkflowId
          }),
        );

        updateComments =
          await this.hiraConsolidatedStatusModel.findByIdAndUpdate(
            hiraWorkflowId,
            { $push: { comments: { $each: body.comments } } },
          );

        this.logger.debug(
          `traceId=${traceId} - Comments updated`,
          JSON.stringify({ success: !!updateComments }),
        );
      }

      this.logger.debug(
        `traceId=${traceId} - Fetching updated by user details`,
        JSON.stringify({ updatedBy: body?.updatedBy }),
      );

      const updatedByUserDetails = await this.prisma.user.findFirst({
        where: {
          id: body?.updatedBy,
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

      this.logger.debug(
        `traceId=${traceId} - Updated by user details found`,
        JSON.stringify({ 
          userId: updatedByUserDetails?.id,
          userEmail: updatedByUserDetails?.email
        }),
      );

      // //console.log('checkrisk updatecomments-->', updateComments);

      // Prepare and dispatch emails for approvers
      if (approvers?.length) {
        this.logger.debug(
          `traceId=${traceId} - Processing approver emails`,
          JSON.stringify({ 
            approversCount: approvers?.length,
            status: body?.status
          }),
        );

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

        this.logger.debug(
          `traceId=${traceId} - Approver emails fetched`,
          JSON.stringify({ 
            approverEmailsCount: approverEmails?.length
          }),
        );
        if (body?.status === 'IN_APPROVAL' || body?.status === 'APPROVED') {
          const approverHtml = `
          <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
            <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #003566; text-align: center;">HIRA Requested For Approval</h2>
              <p>Hi,</p>
              <p>A HIRA has been sent for your approval.</p>
              <p><strong>Job Title:</strong> ${body?.jobTitle}</p>
              <p><strong>Corp Func/Unit:</strong> ${body?.locationName}</p>
              <p><strong>Vertical/Dept:</strong> ${body?.entityName}</p>
  
              <p><strong>Reviewer's Comments:</strong> ${
                body.reviewCompleteComment || 'N/A'
              }</p>
              <p>Please click the link below to approve / reject the HIRA:</p>
              ${process.env.PROTOCOL + '://' + url + '/' + result?._id}
              <p>Please Click the link below to edit the HIRA:</p>
              ${process.env.PROTOCOL + '://' + hiraPageUrl}
              <p>Thanks,</p>
              <p>${
                updatedByUserDetails?.firstname +
                ' ' +
                updatedByUserDetails?.lastname
              }</p>
              <p>${updatedByUserDetails?.email}</p>
            </div>
          </div>
          `;

          //for APPROVED status
          const finalHtml = `
          <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
            <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #003566; text-align: center;">HIRA Approval Confirmation</h2>
              <p>Hi,</p>
              <p>The HIRA has been successfully approved.</p>
              <p><strong>Job Title:</strong> ${body?.jobTitle}</p>
              <p><strong>Corp Func/Unit:</strong> ${body?.locationName}</p>
              <p><strong>Vertical/Dept:</strong> ${body?.entityName}</p>
              <p><strong>Approver's Comments:</strong> ${
                body.approveComment || 'N/A'
              }</p>
              <p>Thanks,</p>
              <p>${
                updatedByUserDetails?.firstname +
                ' ' +
                updatedByUserDetails?.lastname
              }</p>
              <p>${updatedByUserDetails?.email}</p>
            </div>
          </div>
          `;

          //for APPROVED status
          const htmlForResponsiblePerson = `
           <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
             <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
               <h2 style="color: #003566; text-align: center;">HIRA Approval Notification</h2>
               <p>Hi,</p>
               <p>The HIRA has been successfully approved.</p>
               <p>You are recieving this email as you were listed as one of the responsible person for this HIRA</p>
               <p><strong>Job Title:</strong> ${body?.jobTitle}</p>
               <p><strong>Corp Func/Unit:</strong> ${body?.locationName}</p>
               <p><strong>Vertical/Dept:</strong> ${body?.entityName}</p>
               <p><strong>Approver's Comments:</strong> ${
                 body.approveComment || 'N/A'
               }</p>
               <p>Thanks,</p>
               <p>${
                 updatedByUserDetails?.firstname +
                 ' ' +
                 updatedByUserDetails?.lastname
               }</p>
               <p>${updatedByUserDetails?.email}</p>
             </div>
           </div>
           `;
          const approverSubject = 'Hira Review Completed';
          const finalSubject = 'Hira Approved';
          const subjectForResponsiblePerson = 'Hira Approval Notification';
          if (body?.responsiblePersonIdArray?.length) {
            // console.log(
            //   'checkrisk new array id -->',
            //   body?.responsiblePersonIdArray,
            // );

            // console.log(
            //   'checkrisknew responsible emails',
            //   responsiblePersonEmails,
            // );
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
              this.sendEmail(
                responsiblePersonEmails?.map((item: any) => item?.email),
                subjectForResponsiblePerson,
                htmlForResponsiblePerson,
              );
            }
          }
          // console.log('inside approval email', approverEmails, approverSubject);

          this.sendEmail(
            approverEmails,
            body?.status === 'IN_APPROVAL' ? approverSubject : finalSubject,
            body?.status === 'IN_APPROVAL' ? approverHtml : finalHtml,
          );

          this.logger.debug(
            `traceId=${traceId} - Approver emails sent`,
            JSON.stringify({ 
              emailsCount: approverEmails?.length,
              status: body?.status
            }),
          );
        } else if (body?.status === 'REJECTED') {
          this.logger.debug(
            `traceId=${traceId} - Processing rejection emails`,
            JSON.stringify({ 
              reviewersCount: reviewers?.length,
              createdBy: body?.createdBy
            }),
          );

          const usersToSendEmail = await this.prisma.user.findMany({
            where: {
              id: { in: [...reviewers, body?.createdBy] },
            },
            select: {
              email: true,
            },
          });

          const userEmails = usersToSendEmail.map(
            (userEmailsObj) => userEmailsObj.email,
          );

          this.logger.debug(
            `traceId=${traceId} - Rejection email recipients found`,
            JSON.stringify({ userEmailsCount: userEmails?.length }),
          );

          const htmlBody = `
          <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
            <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #003566; text-align: center;">HIRA Has Been Rejected!</h2>
              <p>Hi,</p>
              <p>HIRA has been sent back for Edit.</p>
              <p><strong>Job Title:</strong> ${body?.jobTitle}</p>
              <p><strong>Corp Func/Unit:</strong> ${body?.locationName}</p>
              <p><strong>Vertical/Dept:</strong> ${body?.entityName}</p>
              Comments : ${body.comments[0]?.commentText || 'N/A'}
             
              <p>Please click the link to view the HIRA:</p>
              ${process.env.PROTOCOL + '://' + url + '/' + result?._id}
              <p>Please Click the link below to edit the HIRA:</p>
              ${process.env.PROTOCOL + '://' + hiraPageUrl}
              <p>Thanks,</p>
              <p>${
                updatedByUserDetails?.firstname +
                ' ' +
                updatedByUserDetails?.lastname
              }</p>
              <p>${updatedByUserDetails?.email}</p>
            </div>
          </div>
          `;
          const subject = 'HIRA Rejected';
          this.sendEmail(userEmails, subject, htmlBody);

          this.logger.debug(
            `traceId=${traceId} - Rejection emails sent`,
            JSON.stringify({ userEmailsCount: userEmails?.length }),
          );
        }
      }

      // Prepare and dispatch emails for reviewers
      if (reviewers?.length && body?.status !== 'REJECTED') {
        this.logger.debug(
          `traceId=${traceId} - Processing reviewer emails`,
          JSON.stringify({ 
            reviewersCount: reviewers?.length,
            status: body?.status
          }),
        );

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

        this.logger.debug(
          `traceId=${traceId} - Reviewer emails fetched`,
          JSON.stringify({ 
            reviewerEmailsCount: reviewerEmails?.length
          }),
        );

        //for APPROVED status
        const finalHtml = `Hi, Hira Approved,
                                  You are Receiving this email as you were listed as an reviewer for this Hira
                                  Comments Left By Approver : ${
                                    body.approveComment || 'N/A'
                                  }
                                 
                                  To see the HIRA in workflow,   Please Click Below Link
                                  ${
                                    process.env.PROTOCOL +
                                    '://' +
                                    url +
                                    '/' +
                                    result?._id
                                  }
    
                                  Thanks,
                                  ${
                                    updatedByUserDetails?.firstname +
                                    ' ' +
                                    updatedByUserDetails?.lastname
                                  }
                                  ${updatedByUserDetails?.email}
                                  `;

        const finalSubject = 'Hira Approved';
        this.sendEmail(reviewerEmails, finalSubject, finalHtml);

        this.logger.debug(
          `traceId=${traceId} - Reviewer emails sent`,
          JSON.stringify({ 
            reviewerEmailsCount: reviewerEmails?.length,
            subject: finalSubject
          }),
        );
      }

      this.logger.debug(
        `traceId=${traceId} - Processing final response`,
        JSON.stringify({ 
          hasResult: !!result,
          status: body?.status
        }),
      );

      if (!result) {
        this.logger.debug(
          `traceId=${traceId} - updateConsolidatedEntry failed - no result`,
          JSON.stringify({ hiraWorkflowId }),
        );

        this.logger.log(
          `trace id=${traceId}, PATCH 'api/risk-register/updateConsolidatedEntry jobTitle query ${body} failed`,
          '',
        );
        return {
          data: null,
          status: 'open',
          message:
            'Something went wrong while creating consolidated entry for selected job title',
        };
      } else {
        this.logger.debug(
          `traceId=${traceId} - updateConsolidatedEntry completed successfully`,
          JSON.stringify({ 
            success: true,
            hiraWorkflowId,
            status: body?.status,
            resultStatus: result?.status
          }),
        );

        this.logger.log(
          `trace id=${traceId}, PATCH 'api/risk-register/updateConsolidatedEntry jobTitle query ${body} success`,
          '',
        );
        return {
          data: result,
          status: result.status,
          message: `${
            body?.status === 'IN_APPROVAL'
              ? 'Hira Successfully Sent For Approval'
              : body?.status === 'REJECTED'
              ? 'Hira Rejected Successfully'
              : 'Hira Successfully Approved'
          }. Emails are being sent.`,
        };
      }
    } catch (err) {
      this.logger.debug(
        `traceId=${traceId} - updateConsolidatedEntry failed with error`,
        JSON.stringify({ 
          error: err.message, 
          hiraWorkflowId, 
          status: body?.status 
        }),
      );

      console.error('Error in createConsolidateEntry', err);
      if (err instanceof ConflictException) {
        // If it's a conflict exception, rethrow it
        throw err;
      }
      this.logger.error(
        `trace id=${traceId}, PATCH /risk-register/hira-register/updateConsolidatedEntry/:hiraWorkflowId/ payload ${hiraWorkflowId} failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  //not in use
  async addHiraMitigation(data: any, userId: any) {
    // 1. Create a new mitigation
    const { riskId, mitigationData } = data;
    // ////////////////console.log('data in add mitigation', data);

    const newMitigation = new this.hiraMitigationModel(mitigationData);
    await newMitigation.save();

    // 2. Update the associated risk by pushing the new mitigation's ObjectId
    await this.hiraRegisterModel.findByIdAndUpdate(riskId, {
      $push: { mitigations: newMitigation._id },
    });

    return newMitigation;
  }

  //not in use
  async updateHiraMitigation(mitigationId: any, updatedData: any, userId: any) {
    // 1. Find the mitigation by its ID
    const existingMitigation = await this.hiraMitigationModel.findById(
      mitigationId,
    );

    if (!existingMitigation) {
      throw new Error('Mitigation not found');
    }

    // 2. Update the mitigation with the new data
    // ////////////////console.log('updated in mitigation', updatedData.targetDate);

    const updatedMitigation = await this.riskMitigationModel.findByIdAndUpdate(
      mitigationId,
      { ...updatedData },
      { new: true },
    );
    // ////////////////console.log('result after updating', updatedMitigation);

    return updatedMitigation;
  }

  async fetchHiraListwithUniqueJobTitleNew(orgId: any, query: any) {
    try {
      const {
        entityId,
        locationId,
        search,
        // page = 1,
        // pageSize = 10,
        area,
        section,
        workflowStatus,
      } = query;

      let page = parseInt(query.page) || 1;
      let pageSize = parseInt(query.pageSize) || 10;
      // Constructing the whereCondition directly for use in MongoDB aggregation
      let whereCondition = {
        organizationId: orgId,
        locationId: locationId,
        status: { $in: ['inWorkflow', 'active'] },
        ...(entityId && { entityId }),
        ...(area && { area }),
        ...(section && { section }),
        ...(workflowStatus && { workflowStatus }),
        ...(search && { jobTitle: { $regex: new RegExp(search, 'i') } }),
      };

      // console.log('whereCondition', whereCondition);

      // MongoDB aggregation pipeline to fetch unique job titles with pagination
      let recordsPipeline: any = [
        { $match: whereCondition },
        { $sort: { updatedAt: -1 } },
        { $group: { _id: '$jobTitle', record: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$record' } },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
      ];

      // console.log('recordsPipeline', recordsPipeline);

      const records = await this.hiraRegisterModel.aggregate(recordsPipeline);

      let hiraConfig: any = await this.hiraConfigModel
        .findOne({
          riskCategory: 'HIRA',
          deleted: false,
          organizationId: orgId,
        })
        .select('condition riskType')
        .lean();

      // console.log('CHECk hiraConfig', hiraConfig);

      let jobTitleSet = new Set(records.map((r) => r.jobTitle));
      let jobTitleArray = Array.from(jobTitleSet);

      // Extracting IDs for batch processing
      const userIds = new Set(records.map((r) => r.createdBy).filter(Boolean));
      const areaIds = new Set(records.map((r) => r.area).filter(Boolean));
      const entityIds = new Set(records.map((r) => r.entityId).filter(Boolean));
      const sectionIds = new Set(records.map((r) => r.section).filter(Boolean));

      const consolidatedEntries = await this.hiraConsolidatedStatusModel
        .find({
          jobTitle: { $in: jobTitleArray },
          organizationId: orgId,
        })
        .lean();
      consolidatedEntries.forEach((entry: any) => {
        if (entry?.reviewers?.length) {
          entry.reviewers.forEach((id) => userIds.add(id));
        }
        if (entry?.approvers?.length) {
          entry.approvers.forEach((id) => userIds.add(id));
        }
      });

      // Fetch related data using Prisma
      const [users, entities, sections, areas] = await Promise.all([
        this.prisma.user.findMany({
          where: { id: { in: Array.from(userIds) } },
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
          },
        }),
        this.prisma.entity.findMany({
          where: { id: { in: Array.from(entityIds) } },
          select: { id: true, entityName: true },
        }),
        this.prisma.section.findMany({
          where: { id: { in: Array.from(sectionIds) } },
          select: { id: true, name: true },
        }),
        this.hiraAreaMasterModel
          .find({
            id: { $in: Array.from(areaIds) as any },
          })
          .select('id name'),
      ]);

      // Create maps for quick lookup
      const userMap = new Map(users.map((user) => [user.id, user]));
      const entityMap = new Map(entities.map((entity) => [entity.id, entity]));
      const sectionMap = new Map(
        sections.map((section) => [section.id, section]),
      );
      const areaMap = new Map(areas.map((area) => [area.id, area]));

      const jobTitleToWorkflowMap = new Map();
      const jobTitleToNestedWorkflowMap = new Map();
      consolidatedEntries?.forEach((entry: any) => {
        jobTitleToWorkflowMap?.set(entry.jobTitle, entry);

        if (entry.workflow && entry.workflow.length > 0) {
          const latestWorkflow = entry.workflow.reduce(
            (prev: any, current: any) => {
              return prev.cycleNumber > current.cycleNumber ? prev : current;
            },
          );
          // console.log('latestWorkflow', latestWorkflow);
          jobTitleToNestedWorkflowMap.set(entry.jobTitle, latestWorkflow);
          // console.log('entry to create map', entry);
        }

        // }
      });

      // Reformat records with fetched related data
      const finalList = records.map((record) => {
        const { hiraConfigId, ...rest } = record; // Exclude hiraConfigId from the output
        const workflow = jobTitleToWorkflowMap?.get(record.jobTitle);
        const cycleWorkflow = jobTitleToNestedWorkflowMap.get(record.jobTitle);
        const selectedRiskType = hiraConfig?.riskType?.find(
          (rt) => rt._id.toString() === record.riskType,
        );
        const selectedCondition = hiraConfig?.condition?.find(
          (c) => c._id.toString() === record.condition,
        );

        // console.log('CHECK selectedRiskType', selectedRiskType);
        // console.log('CHECK selectedCondition', selectedCondition);

        return {
          ...rest,
          selectedRiskType: selectedRiskType
            ? {
                name: selectedRiskType.name,
                createdAt: selectedRiskType.createdAt,
                updatedAt: selectedRiskType.updatedAt,
              }
            : null,
          selectedCondition: selectedCondition
            ? {
                name: selectedCondition.name,
                createdAt: selectedCondition.createdAt,
                updatedAt: selectedCondition.updatedAt,
              }
            : null,
          createdByUser: userMap.get(record.createdBy) || null,
          entityDetails: entityMap.get(record.entityId) || '',
          sectionDetails: sectionMap.get(record.section) || '',
          areaDetails: areaMap.get(record.area) || '',
          reviewers:
            workflow?.reviewers?.map((id: any) => userMap.get(id)) || [],
          approvers:
            workflow?.approvers?.map((id: any) => userMap.get(id)) || [],
          comments: workflow?.comments || [],
          cycle: !!cycleWorkflow ? cycleWorkflow?.cycleNumber : 0,
          status: !!cycleWorkflow ? cycleWorkflow?.status : 'active',
        };
      });

      // Returning the paginated data along with total unique job titles count
      const totalUniqueJobTitles = await this.hiraRegisterModel.distinct(
        'jobTitle',
        whereCondition,
      );
      this.logger.log(
        `trace id=${uuid()}, GET 'api/risk-register/fetchHiraListwithUniqueJobTitle jobTitle query ${query} success`,
        '',
      );
      return {
        data: finalList,
        total: totalUniqueJobTitles.length,
      };
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET /risk-register/hira-register/fetchHiraListwithUniqueJobTitle/:orgId/ payload ${orgId} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async updateHiraConsolidatedStatusForNewCycles(
    body: any,
    dataToBeUpdated: any,
    hiraWorkflowId: string,
    cycle: any,
    allHiraIds: any = [],
    jobTitle: any = '',
    existingEntry: any,
    orgId,
  ) {
    // console.log('checkrisk inside updateHiraConsolidatedStatusForNewCycles');
    // console.log('checkrisk dataToBeUpdated', dataToBeUpdated);
    // console.log('checkrisk hiraWorkflowId', hiraWorkflowId);

    // console.log('checkrisk cycle', cycle);
    // console.log('checkrisk allHiraIds', allHiraIds);

    try {
      const { reviewers, approvers, url } = body;

      const data: any = {
        status: 'IN_REVIEW',

        reviewStartedBy: body?.reviewStartedBy,
        reviewers: reviewers?.map((item: any) => item.id),
        approvers: approvers?.map((item: any) => item.id),

        hiraRegisterIds: allHiraIds,
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
            hiraRegisterIds: allHiraIds,
            reason: body?.reason,
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

      // Append new comments if they exist
      // if (body.comments && body.comments.length > 0) {
      //   data['$push']['comments'] = { $each: body.comments };
      // }

      const result = await this.hiraConsolidatedStatusModel.findByIdAndUpdate(
        hiraWorkflowId,
        data,
      );

      if (!!result) {
        const bulkUpdateResult = await this.hiraRegisterModel.updateMany(
          { _id: { $in: allHiraIds } }, // Filter to match documents by id
          {
            $set: {
              status: 'inWorkflow',
              workflowStatus: 'IN_REVIEW',
            },
          }, // Common update for all matched documents
        );

        // console.log(
        //   'Bulk update result in updateWOrkflow for cycles greateer than 1:',
        //   bulkUpdateResult,
        // );

        const deleteEntryInChangesTrack =
          await this.deleteEntryInHiraHistoryTrack(jobTitle, orgId);
        // console.log(
        //   'chekrisk DELETEENTRYINCHANGESTRACK for new cycles',
        //   deleteEntryInChangesTrack,
        // );
      }

      let updateComments;
      // Append new comments using $push
      if (body?.comments && body?.comments.length > 0) {
        updateComments =
          await this.hiraConsolidatedStatusModel.findByIdAndUpdate(
            hiraWorkflowId,
            { $push: { comments: { $each: body.comments } } },
          );
      }

      const createdByUserDetails = await this.prisma.user.findFirst({
        where: {
          id: body?.createdBy,
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

      // Prepare and dispatch emails for reviewers
      if (reviewers?.length) {
        // console.log('checkrisk inside reviewer if', reviewers);

        const reviewerEmails = reviewers.map((userObj) => userObj.email);
        const formattedDate = moment(existingEntry?.createdAt).format(
          'DD/MM/YYYY HH:mm',
        );
        const reviewerHtml = `<div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
                              <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                                <h2 style="color: #003566; text-align: center;">HIRA Initiated For Workflow</h2>
                                <p>Hi,</p>
                                <p>A HIRA has been sent for review.</p>
                                <p><strong>Job Title:</strong> ${jobTitle}</p>
                                <p><strong>Corp Func/Unit:</strong> ${
                                  body?.locationName
                                }</p>
                                <p><strong>Vertical/Dept:</strong> ${
                                  body?.entityName
                                }</p>
                                <p><strong>Created On:</strong> ${formattedDate}</p>
                                <p><strong>Comment:</strong> ${
                                  body.reviewComment
                                }</p>
                                <p>Please click the link below to review / reject the HIRA:</p>
                                ${
                                  process.env.PROTOCOL +
                                  '://' +
                                  url +
                                  '/' +
                                  result?._id
                                }
                                </div>
                                <p>Thanks,</p>
                                <p>${
                                  createdByUserDetails?.firstname +
                                  ' ' +
                                  createdByUserDetails?.lastname
                                }</p>
                                <p>${createdByUserDetails?.email}</p>
                            </div>`;
        // console.log('html reviewwer', reviewerHtml);

        this.sendEmail(
          reviewerEmails,
          'Hira Initiated For Review',
          reviewerHtml,
        );
      }

      // Prepare and dispatch emails for approvers
      // if (approvers?.length) {
      //   // console.log('checkrisk inside approver if', result?._id);

      //   const approverEmails = approvers.map((userObj) => userObj.email);
      //   const approverHtml = `<div>Hi, <br />Hira Sent for Review, <br />
      //                         You are Receiving this email as you were listed as an approver for this Hira</div>
      //                         <div>Comment : ${body.reviewComment}</div><br/>`;
      //   this.sendEmail(
      //     approverEmails,
      //     'Hira Initiated For Workflow',
      //     approverHtml,
      //   );
      // }

      if (!result) {
        this.logger.log(
          `trace id=${uuid()}, GET 'api/risk-register/updateConsolidatedEntry jobTitle query ${jobTitle} success`,
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
          `trace id=${uuid()}, GET 'api/risk-register/updateConsolidatedEntry jobTitle query ${jobTitle} success`,
          '',
        );
        return {
          data: result,
          status: result.status,
          message: 'Hira Successfully Sent For Review. Emails are being sent.',
        };
      }
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, PATCH /risk-register/hira-register/updateConsolidatedEntry inside updateHiraConsolidatedStatusForNewCycles  failed with error ${error} `,
      );
    }
  }

  async createReviewHistoryEntry(body: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting createReviewHistoryEntry`,
      JSON.stringify({ 
        jobTitle: body?.jobTitle, 
        organizationId: body?.organizationId,
        bodyKeys: Object.keys(body)
      }),
    );

    try {
      let allHiraIds = [];

      this.logger.debug(
        `traceId=${traceId} - Fetching all HIRA by job title`,
        JSON.stringify({ jobTitle: body?.jobTitle, status: 'active' }),
      );

      const fetchAllHiraByJobTitle = await this.hiraRegisterModel
        .find({
          jobTitle: body?.jobTitle,
          status: 'active',
        })
        .select('_id');

      this.logger.debug(
        `traceId=${traceId} - HIRA fetch by job title completed`,
        JSON.stringify({ foundCount: fetchAllHiraByJobTitle?.length }),
      );

      if (fetchAllHiraByJobTitle?.length > 0) {
        allHiraIds = fetchAllHiraByJobTitle.map((item) =>
          item?._id?.toString(),
        );

        this.logger.debug(
          `traceId=${traceId} - Extracted HIRA IDs`,
          JSON.stringify({ allHiraIdsCount: allHiraIds.length }),
        );
      }

      // console.log('allHiraIds in createReviewHistroyEntry', allHiraIds);
      if (!!allHiraIds?.length) {
        this.logger.debug(
          `traceId=${traceId} - HIRA IDs found, proceeding with upsert`,
          JSON.stringify({ allHiraIdsCount: allHiraIds.length }),
        );

        const upsertData = {
          ...body,
          hiraRegisterIds: allHiraIds,
        };

        this.logger.debug(
          `traceId=${traceId} - Executing findOneAndUpdate for review history`,
          JSON.stringify({ 
            jobTitle: body?.jobTitle, 
            organizationId: body?.organizationId 
          }),
        );

        const reviewEntry = await this.hiraReviewHistoryModel.findOneAndUpdate(
          { jobTitle: body?.jobTitle, organizationId: body?.organizationId },
          upsertData,
          { new: true, upsert: true, setDefaultsOnInsert: true },
        );

        this.logger.debug(
          `traceId=${traceId} - createReviewHistoryEntry completed successfully`,
          JSON.stringify({ 
            reviewEntryId: reviewEntry?._id,
            jobTitle: body?.jobTitle
          }),
        );

        this.logger.log(
          `trace id=${uuid()}, POST 'api/risk-register/createreview history jobTitle query ${body} success`,
          '',
        );
        return reviewEntry;
      } else {
        this.logger.debug(
          `traceId=${traceId} - No HIRA records found for job title`,
          JSON.stringify({ jobTitle: body?.jobTitle }),
        );
        // If allHiraIds array is empty, throw a NotFoundException
        throw new NotFoundException(
          'No HIRA records found for the given job title.',
        );
      }
    } catch (error: any) {
      this.logger.error(
        `traceId=${traceId} - createReviewHistoryEntry failed with error: ${error.message}`,
        JSON.stringify({ 
          jobTitle: body?.jobTitle,
          organizationId: body?.organizationId
        }),
      );
      this.logger.error(
        `trace id=${uuid()}, POST /risk-register/hira-register/createReviewHistoryEntry/ payload ${body} failed with error ${error} `,
      );
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new InternalServerErrorException(error);
      }
    }
  }

  sendEmail = async (recipients, subject, html) => {
    // console.log("recipients in sendmail-->", recipients);
    if (!recipients.length) {
      this.logger.warn('No recipients provided, skipping sendEmail');
      return;
    }
    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        const result = await this.emailService.sendBulkEmails(
          recipients,
          subject,
          '',
          html,
        );
        this.logger.log(
          `trace id=${uuid()}, INSIDE send email service riskregister for recipients and subject  ${recipients} ${subject} success`,
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
            `trace id=${uuid()}, INSIDE send email service riskregister for recipients and subject  ${recipients} ${subject} success`,
            '',
          );
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, ERROR IN SENDING EMAIL sendEmail function in risk register service recipients  ${recipients} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  };

  sendEmailWithCcOption = async (
    recipients = [],
    cc = [],
    subject = '',
    html = '',
  ) => {
    // console.log("recipients in sendEmailWithCcOption-->", recipients);
    // console.log("cc in sendEmailWithCcOption-->", cc);

    try {
      if (!recipients.length) {
        this.logger.warn('No recipients provided, skipping sendEmailWithCcOption');
        return;
      }
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        const result = await this.emailService.sendBulkEmails(
          [...recipients, ...cc],
          subject,
          '',
          html,
        );
        this.logger.log(
          `trace id=${uuid()}, INSIDE send email service riskregister for recipients and subject  ${recipients} ${subject} success`,
          '',
        );
      } else {
        try {
          await sgMail.send({
            to: recipients,
            cc: cc,
            from: process.env.FROM,
            subject: subject,
            html: html,
          });
          this.logger.log(
            `trace id=${uuid()}, INSIDE send email service riskregister for recipients and subject  ${recipients} ${subject} success`,
            '',
          );
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, ERROR IN SENDING EMAIL sendEmail function in risk register service recipients  ${recipients} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  };

  async fetchReviewHistory(
    jobTitle: any,
    orgId: any,
    //  entityId: any
  ) {
    try {
      const traceId = uuid();
      this.logger.debug(
        `traceId=${traceId} - Starting fetchReviewHistory`,
        JSON.stringify({ jobTitle, orgId }),
      );
      // console.log('inside sercive', jobTitle, orgId);

      this.logger.debug(
        `traceId=${traceId} - Fetching review history from database`,
        JSON.stringify({ organizationId: orgId, jobTitle }),
      );

      let reviewHistory = await this.hiraReviewHistoryModel
        .findOne({
          organizationId: orgId,
          jobTitle: jobTitle,
        })
        .lean();

      this.logger.debug(
        `traceId=${traceId} - Review history query completed`,
        JSON.stringify({ reviewHistoryFound: !!reviewHistory, hasReviewedBy: !!reviewHistory?.reviewedBy }),
      );

      let reviewedByUserDetails;
      let finalResponse: any = reviewHistory;
      
      if (reviewHistory?.reviewedBy) {
        this.logger.debug(
          `traceId=${traceId} - Fetching reviewed by user details`,
          JSON.stringify({ reviewedBy: reviewHistory.reviewedBy }),
        );

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

        this.logger.debug(
          `traceId=${traceId} - Reviewed by user details fetched`,
          JSON.stringify({ userFound: !!reviewedByUserDetails }),
        );

        finalResponse = {
          ...reviewHistory, // Use finalResponse to keep it clean
          reviewedByUserDetails,
        };
      }

      // console.log('reviewHistory', reviewHistory);
      this.logger.debug(
        `traceId=${traceId} - fetchReviewHistory completed successfully`,
        JSON.stringify({ hasResponse: !!finalResponse }),
      );

      this.logger.log(
        `trace id=${traceId}, GET 'api/risk-register/fetchReviewHistory jobTitle query ${jobTitle} success`,
        '',
      );
      return finalResponse;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/hira-register/fetchReviewHistory jobTitle ${jobTitle} failed with error ${error} `,
      );
    }
  }

  async fetchRevisionHistory(query: any) {
    try {
      // console.log('query in fetchRevisionHistory', query);
      const { jobTitle, workflowCycle } = query;
      const page = parseInt(query.page) || 1;
      const pageSize = parseInt(query.pageSize) || 10;
      const skip = (page - 1) * pageSize;
      let cycleNumber = parseInt(workflowCycle);
      // cycleNumber = cycleNumber - 1;

      const matchingDocument = await this.hiraConsolidatedStatusModel
        .findOne({
          jobTitle: jobTitle,
        })

        .lean();

      // console.log('matchingDocument', matchingDocument);
      const matchingWorkflow: any = matchingDocument.workflow.find(
        (workflow: any) => workflow.cycleNumber === cycleNumber,
      );

      // console.log('matchingWorkflow', matchingWorkflow);

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
        let list = await this.hiraRegisterModel
          .find(riskQuery)
          .sort({ createdAt: 1 })
          .skip(skip)
          .limit(pageSize)
          // .populate('hiraConfigId')
          .lean();
        // .select('_id jobTitle createdAt');

        // console.log('fetchAllHiraByJobTitle', list);

        let hiraConfig: any = await this.hiraConfigModel
          .findOne({
            riskCategory: 'HIRA',
            deleted: false,
            organizationId: query?.orgId,
          })
          .select('condition riskType')
          .lean();

        const userIds: any = new Set();
        const locationIds: any = new Set();
        const entityIds: any = new Set();
        const sectionIds: any = new Set();

        list?.forEach((item: any) => {
          if (item?.createdBy) {
            userIds.add(item.createdBy);
          }
          if (item?.responsiblePerson) {
            userIds.add(item.responsiblePerson);
          }
          if (item?.assesmentTeam) {
            item.assesmentTeam.forEach((team: any) => {
              userIds.add(team);
            });
          }
          if (item?.locationId) {
            locationIds.add(item.locationId);
          }
          if (item?.entityId) {
            entityIds.add(item.entityId);
          }
          if (item?.section) {
            sectionIds.add(item.section);
          }
        });

        // Fetch related data using Prisma
        const [users, entities, locations, sections] = await Promise.all([
          this.prisma.user.findMany({
            where: { id: { in: Array.from(userIds) } },
            select: {
              id: true,
              username: true,
              email: true,
              firstname: true,
              lastname: true,
              avatar: true,
            },
          }),
          this.prisma.entity.findMany({
            where: { id: { in: Array.from(entityIds) } },
            select: { id: true, entityName: true },
          }),
          this.prisma.location.findMany({
            where: { id: { in: Array.from(locationIds) } },
            select: { id: true, locationName: true },
          }),
          this.prisma.section.findMany({
            where: { id: { in: Array.from(sectionIds) } },
            select: { id: true, name: true },
          }),
        ]);

        // Create maps for quick lookup
        const userMap = new Map(users.map((user) => [user.id, user]));
        const entityMap = new Map(
          entities.map((entity) => [entity.id, entity]),
        );
        const locationMap = new Map(
          locations.map((section) => [section.id, section]),
        );
        const sectionMap = new Map(
          sections.map((section) => [section.id, section]),
        );

        let headerData: any = {
          selectedRiskTypes: hiraConfig?.riskType?.filter(
            (item: any) => item._id.toString() === list[0]?.riskType,
          )[0],
          selectedCondition: hiraConfig?.condition?.filter(
            (item: any) => item._id.toString() === list[0]?.condition,
          )[0],
        };

        list = await Promise.all(
          list.map(async (risk: any) => {
            let location,
              entity,
              section,
              selectedRiskTypes,
              selectedCondition,
              selectedHazardTypes,
              selectedImpactTypes,
              assesmentTeamData,
              createdByUserDetails,
              responsiblePersonDetails;

            if (!!risk.hazardType) {
              const findHazardType = await this.hiraTypeConfigModel
                .findOne({
                  _id: risk.hazardType,
                  type: 'hazard',
                  deleted: false,
                })
                .select('_id name type');

              // //console.log('findHazardType', findHazardType);

              selectedHazardTypes = findHazardType;
            }

            if (!!risk.impactType) {
              const findImpactType = await this.hiraTypeConfigModel
                .findOne({
                  _id: risk.impactType,
                  type: 'impact',
                  deleted: false,
                })
                .select('_id name type');

              // //console.log('findImpactType', findImpactType);

              selectedImpactTypes = findImpactType;
            }
            return {
              ...risk,
              location: locationMap.get(risk.locationId) || '',
              entity: entityMap.get(risk.entityId) || '',
              section: sectionMap.get(risk.sectionId)
                ? sectionMap.get(risk.sectionId)
                : risk?.section
                ? risk?.section
                : '',
              selectedRiskTypes: headerData.selectedRiskTypes,
              selectedHazardTypes,
              selectedImpactTypes,
              selectedCondition: headerData.selectedCondition,
              assesmentTeamData:
                risk?.assesmentTeam?.map((userId: any) => {
                  return userMap.get(userId);
                }) || '',
              createdByUserDetails: userMap.get(risk.createdBy) || '',
              responsiblePersonDetails:
                userMap.get(risk.responsiblePerson) || '',
              // Add other fields as required
            };
          }),
        );
        ////console.log("list",list);
        const total = await this.hiraRegisterModel.countDocuments(riskQuery);
        this.logger.log(
          `trace id=${uuid()}, GET 'api/risk-register/getAllWorkflowHira jobTitle query ${query} success`,
          '',
        );
        return { list, total };
      }
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/hira-register/getAllWorkflowHira query ${query} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async updateHiraConsolidatedForRejectedHira(
    body: any,
    hiraWorkflowId: string,
  ) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting updateHiraConsolidatedForRejectedHira`,
      JSON.stringify({ hiraWorkflowId, jobTitle: body?.jobTitle, status: body?.status }),
    );
    
    try {
      // console.log('body in updateHiraConsolidatedForRejectedHira', body);
      // console.log(
      //   'hiraWorkflowId in updateHiraConsolidatedForRejectedHira',
      //   hiraWorkflowId,
      // );

      const { approvers, url, reviewers } = body;
      let allHiraIds = [];

      const fetchAllHiraByJobTitle = await this.hiraRegisterModel
        .find({
          jobTitle: body?.jobTitle,
          status: 'active',
        })
        .select('_id');

      // console.log();

      if (fetchAllHiraByJobTitle?.length > 0) {
        allHiraIds = fetchAllHiraByJobTitle.map((item) =>
          item?._id?.toString(),
        );
      }

      // console.log('allHiraIds in updateConsolidatedEntry service', allHiraIds);

      let update: any = {
        // updatedBy: body?.updatedBy,
        // status: body?.status,
        status: body?.status,
        reviewStartedBy: body?.reviewStartedBy,
        updatedBy: body?.updatedBy,
        reviewers: reviewers?.map((item: any) => item.id),
        approvers: approvers?.map((item: any) => item.id),
        hiraRegisterIds: allHiraIds,
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
        'workflow.$[elem].hiraRegisterIds': allHiraIds,
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

      this.logger.debug(
        `traceId=${traceId} - Updating consolidated status`,
        JSON.stringify({ hiraWorkflowId, updateKeys: Object.keys(update) }),
      );

      //Find the active cycle which is not 'APPROVED' and update it
      const result = await this.hiraConsolidatedStatusModel.findByIdAndUpdate(
        hiraWorkflowId,
        update,
        {
          arrayFilters: [{ 'elem.status': { $ne: 'APPROVED' } }],
          new: true,
        },
      );

      this.logger.debug(
        `traceId=${traceId} - Consolidated status updated`,
        JSON.stringify({ resultId: result?._id, updated: !!result }),
      );

      if (!!result) {
        const bulkUpdateResult = await this.hiraRegisterModel.updateMany(
          { _id: { $in: allHiraIds } }, // Filter to match documents by id
          { $set: { status: 'inWorkflow', workflowStatus: 'IN_REVIEW' } }, // Common update for all matched documents
        );

        // console.log(
        //   'Bulk update result in updateWOrkflow for rejected hira:',
        //   bulkUpdateResult,
        // );
      }

      let updateComments;
      // Append new comments using $push
      if (body.comments && body.comments.length > 0) {
        updateComments =
          await this.hiraConsolidatedStatusModel.findByIdAndUpdate(
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
        const finalHtml = `Hi, <br />Hira Sent for Review
        Comment : ${body.reviewComment}
        Please Click Below Link to Review Hira
        ${process.env.PROTOCOL + '://' + url + '/' + result?._id}
        `;

        const finalSubject = 'Hira Initiated For Workflow';
        this.sendEmail(reviewerEmails, finalSubject, finalHtml);
      }

      if (!result) {
        return {
          data: null,
          status: 'open',
          message:
            'Something went wrong while creating consolidated entry for selected job title',
        };
      } else {
        return {
          data: result,
          status: result.status,
          message: `Hira Sucessfully Sent For Review. Emails are being sent.`,
        };
      }
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/hira-register/updateHiraConsolidatedForRejectedHira payload ${body} failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async createEntryInHiraHistoryTrack(body: any) {
    try {
      let allHiraIds = [];
      const fetchAllHiraByJobTitle = await this.hiraRegisterModel
        .find({
          jobTitle: body?.jobTitle,
          status: 'active',
        })
        .select('_id');

      if (fetchAllHiraByJobTitle?.length > 0) {
        allHiraIds = fetchAllHiraByJobTitle.map((item) =>
          item?._id?.toString(),
        );
      }

      // console.log('allHiraIds in createReviewHistroyEntry', allHiraIds);

      if (!!allHiraIds?.length) {
        const query = {
          jobTitle: body?.jobTitle,
          organizationId: body?.organizationId, // Assuming organizationId is part of body
        };

        const update = {
          ...body,
          hiraRegisterIds: allHiraIds,
          status: 'active',
        };

        const options = { new: true, upsert: true, setDefaultsOnInsert: true };

        const createOrUpdateEntry =
          await this.hiraChangesTrackModel.findOneAndUpdate(
            query,
            update,
            options,
          );

        const bulkUpdateResult = await this.hiraRegisterModel.updateMany(
          { _id: { $in: allHiraIds } }, // Filter to match documents by id
          { $set: { workflowStatus: 'DRAFT' } }, //newly added 7june
        );

        return createOrUpdateEntry;
      } else {
        // If allHiraIds array is empty, throw a NotFoundException
        throw new NotFoundException(
          'No HIRA records found for the given job title.',
        );
      }
    } catch (error: any) {
      this.logger.error(
        `trace id=${uuid()}, POST 'api/risk-register/hira-register/addHiraInChangesTrack payload ${body} failed with error ${error} `,
      );
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

  //function to delete entry in hira changes track schema after it is approved

  async deleteEntryInHiraHistoryTrack(jobTitle: any, orgId: any) {
    try {
      let details = await this.hiraChangesTrackModel
        .findOneAndDelete({
          organizationId: orgId,
          jobTitle: jobTitle,
        })
        .lean();
      this.logger.log(
        `trace id=${uuid()},  'deleteEntryInHiraHistoryTrack jobTitle query ${jobTitle} success`,
        '',
      );
      return details;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, ERROR in deleteEntryInHiraHistoryTrack for jobtittle  payload ${jobTitle} failed with error ${error} `,
      );
    }
  }

  async fetchEntryInHiraHistoryTrack(
    jobTitle: any,
    orgId: any,
    //  entityId: any
  ) {
    try {
      let details = await this.hiraChangesTrackModel
        .findOne({
          organizationId: orgId,
          jobTitle: jobTitle,
        })
        .lean();
      this.logger.log(
        `trace id=${uuid()}, GET 'api/risk-register/fetchEntryInHiraHistoryTrack jobTitle query ${jobTitle} success`,
        '',
      );
      return details;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/hira-register/fetchEntryInHiraHistoryTrack payload jobtitle ${jobTitle} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
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

  async updateHiraHeader(jobTitle: string, data: any, user) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting updateHiraHeader`,
      JSON.stringify({ jobTitle, dataKeys: Object.keys(data), userId: user?.user?.id }),
    );

    try {
      this.logger.debug(
        `traceId=${traceId} - Fetching active user`,
        JSON.stringify({ userId: user?.user?.id }),
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - Active user found`,
        JSON.stringify({ activeUserId: activeUser?.id }),
      );

      this.logger.debug(
        `traceId=${traceId} - Creating audit trail`,
        JSON.stringify({ module: 'hiraregisters', subModule: 'HIRA' }),
      );

      const auditTrail = await auditTrial(
        'hiraregisters',
        'HIRA',
        'HIRA HEADER',
        user.user,
        activeUser,
        '',
      );

      // Find the largest revision number for the given jobTitle
      this.logger.debug(
        `traceId=${traceId} - Finding latest revision`,
        JSON.stringify({ jobTitle }),
      );

      const latestRevision = await this.hiraRegisterModel
        .findOne({
          jobTitle: jobTitle,
          // status: 'active'
        })
        .sort({ revisionNumber: -1 })
        .limit(1);

      if (!latestRevision) {
        this.logger.debug(
          `traceId=${traceId} - No documents found for job title`,
          JSON.stringify({ jobTitle }),
        );
        throw new Error(
          'No documents found for the specified job title and status',
        );
      }

      this.logger.debug(
        `traceId=${traceId} - Latest revision found`,
        JSON.stringify({ 
          jobTitle, 
          revisionNumber: latestRevision.revisionNumber,
          latestRevisionId: latestRevision._id 
        }),
      );

      // Update all documents matching the jobTitle and the largest revisionNumber
      this.logger.debug(
        `traceId=${traceId} - Executing updateMany query`,
        JSON.stringify({ 
          jobTitle, 
          revisionNumber: latestRevision.revisionNumber 
        }),
      );

      const result = await this.hiraRegisterModel.updateMany(
        {
          jobTitle: jobTitle,
          revisionNumber: latestRevision.revisionNumber,
          // status: 'active'
        },
        { $set: data },
      );

      this.logger.debug(
        `traceId=${traceId} - UpdateMany query completed`,
        JSON.stringify({ 
          acknowledged: result?.acknowledged,
          matchedCount: result?.matchedCount,
          modifiedCount: result?.modifiedCount
        }),
      );

      if (result?.acknowledged) {
        this.logger.debug(
          `traceId=${traceId} - updateHiraHeader completed successfully`,
          JSON.stringify({ 
            jobTitle,
            documentsUpdated: result?.modifiedCount
          }),
        );
        this.logger.log(
          `trace id=${uuid()}, GET 'api/risk-register/updateHiraHeader payload jobTitle ${jobTitle} success`,
          '',
        );
        return { message: 'Hira Header Info Updated Successfully' };
      } else {
        this.logger.debug(
          `traceId=${traceId} - No documents were updated`,
          JSON.stringify({ jobTitle }),
        );
        this.logger.log(
          `trace id=${uuid()}, GET 'api/risk-register/updateHiraHeader jobTitle query ${jobTitle} success`,
          '',
        );
        return { message: 'No documents were updated' };
      }
      // return result;
    } catch (err) {
      this.logger.error(
        `traceId=${traceId} - updateHiraHeader failed with error: ${err.message}`,
        JSON.stringify({ jobTitle, dataKeys: Object.keys(data) }),
      );
      this.logger.error(
        `trace id=${uuid()}, PUT 'api/risk-register/hira-register/updateHiraHeader payload jobtitle ${jobTitle} failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async getHiraForInbox(user, randomNumber) {
    try {
      // console.log("user in getHiraForInbox>>>>>>>>>>", user);

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });

      // Fetch HIRA records where the status is 'IN_REVIEW' and 'IN_APPROVAL' respectively
      const isReviewer = await this.hiraModel.find(
        {
          organizationId: activeUser.organizationId,
          workflowStatus: 'IN_REVIEW',
        },
        {
          jobTitle: 1,
          status: 1,
          updatedAt: 1,
          workflow: 1, // Include the workflow field to process it in the application code
        },
      );

      const isApprover = await this.hiraModel.find(
        {
          organizationId: activeUser.organizationId,
          workflowStatus: 'IN_APPROVAL',
        },
        {
          jobTitle: 1,
          status: 1,
          updatedAt: 1,
          workflow: 1, // Include the workflow field to process it in the application code
        },
      );

      // console.log("isReviewer ------>>>>>>", isReviewer);
      // console.log("isApprover ---------->>>>>>>>>>>>", isApprover);

      // Filter records where the active user is a reviewer in the last workflow entry
      const filteredReviewerRecords = isReviewer.filter((hira) => {
        // console.log("hira in filterReviewREcords", hira);

        const lastWorkflow = hira.workflow[hira.workflow.length - 1];
        // console.log("latestworkflow in filterReviewREcords", lastWorkflow);

        return lastWorkflow?.reviewers.includes(activeUser.id);
      });

      // Filter records where the active user is an approver in the last workflow entry
      const filteredApproverRecords = isApprover.filter((hira) => {
        // console.log("hira in filterApproverRecords", hira);

        const lastWorkflow = hira.workflow[hira.workflow.length - 1];
        // console.log("latestworkflow in filterApproverRecords", lastWorkflow);

        return lastWorkflow?.approvers.includes(activeUser.id);
      });
      this.logger.log(
        `trace id=${uuid()}, GET 'api/risk-register/getHiraForInbox payload query ${user} success`,
        '',
      );
      return {
        reviewState: filteredReviewerRecords,
        approveState: filteredApproverRecords,
      };
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber}, GET /api/riskconfig/getHiraForInbox`,
        'riskconfig.controller',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getStepsCountByHazardType(orgId: string, query: any) {
    try {
      let whereCondition: any = {};
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
      console.log('QUERY getHiraCounByHazardType', query);

      if (query?.isPrimaryFilter) {
        whereCondition = {
          status: 'active',
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
        if (!!query?.fromDate && !!query?.toDate) {
          whereCondition = {
            ...whereCondition,
            createdAt: {
              $gte: new Date(query?.fromDate),
              $lt: new Date(query?.toDate),
            },
          };
        }
      } else {
        whereCondition = {
          status: 'active',
        };

        if (!!query?.entityId) {
          whereCondition.entityId = query?.entityId;
        }

        if (!!query?.locationId) {
          whereCondition.locationId = query?.locationId;
        }
        if (query?.total) {
          whereCondition = whereCondition;
        }

        if (query?.new) {
          whereCondition = {
            ...whereCondition,
            createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
          };
        }
      }

      // console.log("WHERE CONDITION IN getHiraCounByHazardType", whereCondition);

      const hiraList = await this.hiraModel
        .find({
          ...whereCondition,
          ...(query?.inWorkflow && {
            workflowStatus: { $in: ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'] },
          }),
        })
        .select('stepIds')
        .lean();
      const stepIds = hiraList?.map((hira) => hira?.stepIds).flat();

      const hiraStepsGroupedByHazardType = await this.hiraStepsModel.aggregate([
        {
          // Match the filter conditions
          $match: {
            ...whereCondition,
            ...(query?.significant && { preMitigationScore: { $gte: 8 } }),
          },
        },
        {
          // Group by hazardType
          $group: {
            _id: '$hazardType',
            stepIds: { $push: '$_id' }, // Collect all step _ids for each hazardType
            count: { $sum: 1 }, // Count the number of steps for each hazardType
          },
        },
        {
          // Rename _id field to hazardTypeId for output
          $project: {
            hazardTypeId: '$_id',
            stepIds: 1,
            count: 1,
            _id: 0, // Exclude the _id field
          },
        },
      ]);

      // console.log("hiraStepsGroupedByHazardType--->>>", hiraStepsGroupedByHazardType);

      const filteredStepsBasedOnHiraFitler =
        hiraStepsGroupedByHazardType.filter((item) => {
          return item?.stepIds?.some((stepId) =>
            stepIds.includes(stepId.toString()),
          );
        });

      // console.log("filteredStepsBasedOnHiraFitler--->>>", filteredStepsBasedOnHiraFitler);
      const hazardSet = new Set();
      const stepIdSet = new Set();
      filteredStepsBasedOnHiraFitler?.forEach((item) => {
        item.hazardTypeId && hazardSet?.add(item.hazardTypeId);
        item?.stepIds?.forEach((stepId) => {
          stepId && stepIdSet?.add(stepId.toString());
        });
      });

      if (!!filteredStepsBasedOnHiraFitler?.length) {
        const [hazardsList, hirasList] = await Promise.all([
          this.hiraTypeConfigModel
            .find({
              _id: {
                $in: Array.from(hazardSet),
              },
              type: 'hazard',
              deleted: false,
              organizationId: orgId,
            })
            .select('name _id')
            .lean(),
          this.hiraModel
            .find({
              stepIds: {
                $in: Array.from(stepIdSet),
              },
              organizationId: orgId,
              status: 'active',
              deleted: false,
            })
            .select('jobTitle stepIds'),
        ]);
        // console.log('hazardsList--->>>', hazardsList);
        // console.log('hirasList--->>>', hirasList);

        // Map hazard names and job titles to hiraStepsGroupedByHazardType
        const hazardMap = new Map();
        hazardsList.forEach((hazard) => {
          hazardMap.set(hazard._id.toString(), hazard.name);
        });

        const stepIdToHiraMap = new Map();
        hirasList.forEach((hira) => {
          hira.stepIds.forEach((stepId) => {
            stepIdToHiraMap.set(stepId.toString(), {
              id: hira._id,
              jobTitle: hira.jobTitle,
            });
          });
        });

        const populatedResults = filteredStepsBasedOnHiraFitler.map((group) => {
          const hazardName = hazardMap.get(group.hazardTypeId);
          const hira = group.stepIds.map((stepId) =>
            stepIdToHiraMap.get(stepId.toString()),
          );

          return {
            ...group,
            hazardName,
            hira,
            stepIds: group?.stepIds?.map((stepId) => stepId.toString()),
          };
        });

        // console.log('populatedResults--->>>', populatedResults);
        return populatedResults.filter(item => item.hazardTypeId);
      } else return [];
    } catch (error) {
      console.log('error in getHiraCounByHazardType', error);
    }
  }

  async getHiraCountByCondition(orgId: string, query: any) {
    try {
      let whereCondition: any = {};
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
      // console.log('QUERY getHiraCountByCondition', query);

      if (query?.isPrimaryFilter) {
        whereCondition = {
          status: 'active',
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
        if (!!query?.fromDate && !!query?.toDate) {
          whereCondition = {
            ...whereCondition,
            createdAt: {
              $gte: new Date(query?.fromDate),
              $lt: new Date(query?.toDate),
            },
          };
        }
      } else {
        whereCondition = {
          status: 'active',
          organizationId: query?.organizationId,
        };

        if (!!query?.entityId) {
          whereCondition.entityId = query?.entityId;
        }

        if (!!query?.locationId) {
          whereCondition.locationId = query?.locationId;
        }
        if (query?.total) {
          whereCondition = whereCondition;
        }

        if (query?.inWorkflow) {
          whereCondition = {
            ...whereCondition,
            workflowStatus: { $in: ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'] },
          };
        }

        if (query?.new) {
          whereCondition = {
            ...whereCondition,
            createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
          };
        }
        if (query?.significant) {
          whereCondition = {
            ...whereCondition,
            preMitigationScore: { $gte: 8 },
          };
        }
      }

      // Fetch the HiraConfig first to get condition details
      const hiraConfig = await this.hiraConfigModel
        .findOne({
          riskCategory: 'HIRA',
          deleted: false,
          organizationId: query?.organizationId,
        })
        .select('condition')
        .lean();

      // Create a map from condition IDs to names
      const conditionNameMap = new Map(
        hiraConfig.condition.map((cond: any) => [
          cond._id.toString(),
          cond.name,
        ]),
      );

      // console.log('WHERE CONDITION IN getHiraCountByCondition', whereCondition);

      // Use aggregation to group by condition and count the HIRAs
      const hiraData = await this.hiraModel.aggregate([
        {
          // Match the filter conditions
          $match: whereCondition,
        },
        {
          // Group by the condition field and include jobTitle and HIRA ID
          $group: {
            _id: '$condition',
            count: { $sum: 1 }, // Count the number of HIRAs for each condition
            hiras: {
              $push: {
                jobTitle: '$jobTitle',
                hiraId: '$_id',
              },
            },
          },
        },
        {
          // Project the final output format
          $project: {
            conditionId: '$_id',
            count: 1,
            hiras: 1,
            _id: 0, // Exclude the internal MongoDB _id field
          },
        },
      ]);
      // console.log('hiraData in condition graph--->>>', hiraData);
      // console.log('hiras in hira Data', hiraData?.map((item) => item.hiras));
      if (hiraData?.length) {
        const populatedResults = hiraData.map((group) => {
          const conditionName = conditionNameMap.get(group.conditionId);
          return {
            ...group,
            conditionName,
          };
        });
        // console.log('populatedResults in condition --->>>', populatedResults);
        return populatedResults;
      } else {
        return [];
      }
    } catch (error) {
      console.log('error in getHiraCounByHazardType', error);
    }
  }

  async getStepsCountByScore(orgId: string, query: any) {
    try {
      let whereCondition: any = {};
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
      // console.log('QUERY getHiraCounByHazardType', query);

      if (query?.isPrimaryFilter) {
        whereCondition = {
          status: 'active',
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
        if (!!query?.fromDate && !!query?.toDate) {
          whereCondition = {
            ...whereCondition,
            createdAt: {
              $gte: new Date(query?.fromDate),
              $lt: new Date(query?.toDate),
            },
          };
        }
      } else {
        whereCondition = {
          status: 'active',
        };

        if (!!query?.entityId) {
          whereCondition.entityId = query?.entityId;
        }

        if (!!query?.locationId) {
          whereCondition.locationId = query?.locationId;
        }
        if (query?.total) {
          whereCondition = whereCondition;
        }

        if (query?.new) {
          whereCondition = {
            ...whereCondition,
            createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
          };
        }
        if (query?.significant) {
          whereCondition = {
            ...whereCondition,
            preMitigationScore: { $gte: 8 },
          };
        }
      }

      // console.log("WHERE CONDITION IN getStepsCountByScore", whereCondition);

      const stepsData = await this.hiraStepsModel.aggregate([
        {
          // Matching valid preMitigationScore and applying additional conditions
          $match: {
            preMitigationScore: { $exists: true, $ne: null },
            ...whereCondition, // Apply your custom whereCondition here
          },
        },
        {
          // Grouping by the risk levels based on preMitigationScore
          $group: {
            _id: null, // Single document as output, not grouping by any field
            green: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$preMitigationScore', 1] },
                      { $lte: ['$preMitigationScore', 3] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            yellow: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$preMitigationScore', 3] },
                      { $lte: ['$preMitigationScore', 7] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            orange: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$preMitigationScore', 7] },
                      { $lte: ['$preMitigationScore', 13] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            red: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$preMitigationScore', 13] },
                      { $lte: ['$preMitigationScore', 25] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);
      // console.log('stepsData in score graph--->>>', stepsData);
      return stepsData;
    } catch (error) {
      console.log('error in getHiraCounByHazardType', error);
    }
  }

  async getTopTenHiraByScore(orgId: string, query: any) {
    try {
      let whereCondition: any = {};
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
      // console.log('QUERY getHiraCounByHazardType', query);

      if (query?.isPrimaryFilter) {
        whereCondition = {
          status: 'active',
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
        if (!!query?.fromDate && !!query?.toDate) {
          whereCondition = {
            ...whereCondition,
            createdAt: {
              $gte: new Date(query?.fromDate),
              $lt: new Date(query?.toDate),
            },
          };
        }
      } else {
        whereCondition = {
          status: 'active',
        };

        if (!!query?.entityId) {
          whereCondition.entityId = query?.entityId;
        }

        if (!!query?.locationId) {
          whereCondition.locationId = query?.locationId;
        }
        if (query?.total) {
          whereCondition = whereCondition;
        }

        if (query?.new) {
          whereCondition = {
            ...whereCondition,
            createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
          };
        }
        // if (query?.significant) {
        //   whereCondition = {
        //     ...whereCondition,
        //     preMitigationScore: { $gte: 8 },
        //   };
        // }
      }

      // console.log('WHERE CONDITION IN getTopTenHiraByScore', whereCondition);

      const allHiraList = await this.hiraModel
        .find({
          ...whereCondition,
        })
        .select('jobTitle stepIds')
        .lean();

      // console.log('allHiraList in getTopTenHiraByScore', allHiraList);

      const hiraStepIds = allHiraList?.map((hira) => hira?.stepIds).flat();

      // console.log('hiraStepIds in getTopTenHiraByScore', hiraStepIds);

      const allStepsList = await this.hiraStepsModel
      .find({ _id: { $in: hiraStepIds } })
      .select('preProbability preSeverity')
      .lean();
    
    // 2. Build a lookup map of stepId → computed score
      const stepScoresMap = allStepsList.reduce<Record<string, number>>((acc, step) => {
        const prob = Number(step.preProbability) || 0;
        const sev  = Number(step.preSeverity)    || 0;
        acc[step._id] = prob * sev;
        return acc;
      }, {});
      
      // 3. Compute each HIRA’s max score from its steps
      const hiraScores = allHiraList.map(hira => {
        const maxScore = hira.stepIds
          .map(stepId => stepScoresMap[stepId] || 0)
          .reduce((max, score) => Math.max(max, score), 0);
        return { ...hira, maxScore };
      });
      
      // 4. Sort and take top 10
      const topTenHira = hiraScores
        .sort((a, b) => b.maxScore - a.maxScore)
        .slice(0, 10);
    
      return topTenHira;
    } catch (error) {
      console.log('error in getHiraCounByHazardType', error);
    }
  }

  async getHiraCountByEntity(orgId: string, query: any) {
    try {
      let whereCondition: any = {};
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
  
      if (query?.isPrimaryFilter) {
        whereCondition = {
          status: 'active',
          workflowStatus: 'APPROVED',
          organizationId: query?.organizationId,
        };
        if (!!query?.entity?.length) {
          whereCondition.entityId = { $in: query?.entity };
        }
        if (!!query?.unit?.length) {
          whereCondition.locationId = { $in: query?.unit };
        }
        if (!!query?.fromDate && !!query?.toDate) {
          whereCondition.createdAt = {
            $gte: new Date(query?.fromDate),
            $lt: new Date(query?.toDate),
          };
        }
      } else {
        whereCondition = {
          status: 'active',
          workflowStatus: 'APPROVED',
          organizationId: query?.organizationId,
        };
  
        if (!!query?.entityId) {
          whereCondition.entityId = query?.entityId;
        }
  
        if (!!query?.locationId) {
          whereCondition.locationId = query?.locationId;
        }
  
        if (query?.inWorkflow) {
          whereCondition.workflowStatus = {
            $in: ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'],
          };
        }
  
        if (query?.new) {
          whereCondition.createdAt = {
            $gte: currentYearStart,
            $lt: currentYearEnd,
          };
        }
  
        if (query?.significant) {
          whereCondition.preMitigationScore = { $gte: 8 };
        }
      }
  
      // Fetch entity names
      const allEntities = await this.prisma.entity.findMany({
        where: { organizationId: query?.organizationId },
        select: { id: true, entityName: true },
      });
      const entityNameMap = new Map(
        allEntities.map((e) => [e.id, e.entityName]),
      );
  
      // Aggregate HIRA data by entityId and include locationId
      const hiraData = await this.hiraModel.aggregate([
        { $match: whereCondition },
        {
          $group: {
            _id: { entityId: '$entityId', locationId: '$locationId' },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            entityId: '$_id.entityId',
            locationId: '$_id.locationId',
            count: 1,
            _id: 0,
          },
        },
      ]);
  
      // Get unique locationIds from aggregated results
      const locationIds = [
        ...new Set(hiraData.map((item) => item.locationId)),
      ];
  
      const allLocations = await this.prisma.location.findMany({
        where: { id: { in: locationIds } },
        select: { id: true, locationId: true },
      });
  
      const locationMap = new Map(
        allLocations.map((loc) => [loc.id, loc.locationId]),
      );
  
      // Final result
      const result = hiraData.map((item) => ({
        ...item,
        entityName: entityNameMap.get(item.entityId) || undefined,
        locationId: locationMap.get(item.locationId) || undefined,
      }));
  
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  
  

  async fetchHiraDashboardBoardCounts(orgId: string, query: any) {
    try {
      // console.log("qyeruuuuu--->", query)
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
      if (query?.isPrimaryFilter) {
        // console.log("PRIMARY FILTER APPPLIED---------");
        let whereConditionForSignificantSteps: any = {
          status: 'active',
          deleted: false,
          organizationId: orgId,
          preMitigationScore: { $gte: 8 },
        };

        let whereCondition: any = {
          organizationId: orgId, // Matching organization ID
          status: 'active',
        };
        let whereConditionForCurrentYear: any = {
          organizationId: orgId,
          // createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
        };
        if (!!query?.entity?.length) {
          whereCondition.entityId = { $in: query.entity };
          whereConditionForSignificantSteps.entityId = { $in: query.entity };
          whereConditionForCurrentYear.entityId = { $in: query.entity };
        }
        if (!!query?.unit?.length) {
          whereCondition.locationId = { $in: query.unit };
          whereConditionForSignificantSteps.locationId = { $in: query.unit };
          whereConditionForCurrentYear.locationId = { $in: query.unit };
        }
        if (!!query?.fromDate && !!query?.toDate) {
          whereCondition.createdAt = {
            $gte: new Date(query.fromDate),
            $lt: new Date(query.toDate),
          };
          whereConditionForSignificantSteps.createdAt = {
            $gte: new Date(query.fromDate),
            $lt: new Date(query.toDate),
          };
          whereConditionForCurrentYear = {
            ...whereConditionForCurrentYear,
            // createdAt: {
            //   $gte: new Date(query.fromDate),
            //   $lt: new Date(query.toDate),
            // },
          };
        }

        const resultsForTotalSteps = await this.hiraStepsModel.countDocuments({
          ...whereCondition,
        });
        const resultsForInWorkflowHira = await this.hiraModel.countDocuments({
          ...whereCondition,
          workflowStatus: { $in: ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'] },
        });

        const resultsForTotalCurrentYearHira =
          await this.hiraModel.countDocuments({
            ...whereConditionForCurrentYear,
          });

        const totalSignificantSteps = await this.hiraStepsModel.countDocuments({
          ...whereConditionForSignificantSteps,
        });

        const formattedResult = {
          totalSteps: resultsForTotalSteps,
          inWorkflowHira: resultsForInWorkflowHira,
          totalHiraTillDate: resultsForTotalCurrentYearHira,
          totalSignificantSteps,
        };

        this.logger.log(
          `trace id=${uuid()}, GET 'api/risk-register/fetchOverallStatusCounts payload query ${query} success`,
          '',
        );
        return formattedResult;
      } else {
        // console.log("DEFAULT FILTER APPLIED");

        let entityQueryForTotal: any = {
          organizationId: orgId,
          entityId: { $in: query.entity },
          status: 'active',
          // workflowStatus: 'APPROVED',
        };
        let entityQueryForCurrentYear: any = {
          organizationId: orgId,
          entityId: { $in: query.entity },
          status: 'active',
          // createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
        };
        let entityQueryForSignificantSteps: any = {
          status: 'active',
          entityId:{ $in: query.entity },
          preMitigationScore: { $gte: 8 },
        };

        let locationQueryForTotal: any = {
          organizationId: orgId,
          locationId: query?.unit[0],
          status: 'active',
          // workflowStatus: 'APPROVED',
        };
        let locationQueryForCurrentYear: any = {
          organizationId: orgId,
          locationId: query?.unit[0],
          status: 'active',
          // createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
        };
        let locationQueryForSignificantSteps: any = {
          status: 'active',
          locationId: query?.unit[0],
          preMitigationScore: { $gte: 8 },
        };

        const resultsForTotalStepsEntityWise =
          await this.hiraStepsModel.countDocuments({
            ...entityQueryForTotal,
          });
        const resultsForTotalStepsLocationWise = await this.hiraStepsModel.count({
          ...locationQueryForTotal,
        });
        const resultsForInWorkflowEntityWise =
          await this.hiraModel.countDocuments({
            ...entityQueryForCurrentYear,
            workflowStatus: { $in: ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'] },
          });
        const resultsForInWorkflowLocationWise =
          await this.hiraModel.countDocuments({
            ...locationQueryForCurrentYear,
            workflowStatus: { $in: ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'] },
          });
        const resultsForCurrentYearEntityWise =
          await this.hiraModel.countDocuments({
            ...entityQueryForCurrentYear,
          });
        const resultsForCurrentYearLocationWise =
          await this.hiraModel.countDocuments({
            ...locationQueryForCurrentYear,
          });
        const totalSignificantStepsEntityWise =
          await this.hiraStepsModel.countDocuments({
            ...entityQueryForSignificantSteps,
          });
        const totalSignificantStepsLocationWise =
          await this.hiraStepsModel.countDocuments({
            ...locationQueryForSignificantSteps,
          });

        // console.log("Total HIRA Count Entity Wise:", resultsForTotalHiraEntityWise);
        // console.log("Total HIRA Count Location Wise:", resultsForTotalHiraLocationWise);
        // console.log("In Workflow HIRA Count Entity Wise:", resultsForInWorkflowEntityWise);
        // console.log("In Workflow HIRA Count Location Wise:", resultsForInWorkflowLocationWise);
        // console.log("Current Year HIRA Count Entity Wise:", resultsForCurrentYearEntityWise);
        // console.log("Current Year HIRA Count Location Wise:", resultsForCurrentYearLocationWise);
        // console.log("Total Significant Steps Entity Wise:", totalSignificantStepsEntityWise);
        // console.log("Total Significant Steps Location Wise:", totalSignificantStepsLocationWise);

        const formattedResult = {
          totalStepsEntityWise: resultsForTotalStepsEntityWise,
          totalStepsLocationWise: resultsForTotalStepsLocationWise,
          inWorkflowEntityWise: resultsForInWorkflowEntityWise,
          inWorkflowLocationWise: resultsForInWorkflowLocationWise,
          totalCurrentYearEntityWise: resultsForCurrentYearEntityWise,
          totalCurrentYearLocationWise: resultsForCurrentYearLocationWise,
          totalSignificantStepsEntityWise,
          totalSignificantStepsLocationWise,
        };

        this.logger.log(
          `trace id=${uuid()}, GET 'api/risk-register/fetchHiraDashboardBoardCounts payload query ${query} success`,
          '',
        );
        return formattedResult;
      }
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/fetchOverallStatusCounts payload query ${query} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  // async fetchHiraCountsByEntityAndSection(orgId: string, query: any) {
  //   try {
  //     const results = await this.hiraModel.aggregate([
  //       {
  //         $match: {
  //           organizationId: orgId, // Matching organization ID
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: '$entityId',
  //           total: {
  //             $sum: {
  //               $cond: [{ $ne: ['$status', 'archived'] }, 1, 0], // Only count if not archived
  //             },
  //           },
  //           inWorkflow: {
  //             $sum: {
  //               $cond: {
  //                 if: { $in: ['$workflowStatus', ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED']] },
  //                 then: 1,
  //                 else: 0,
  //               },
  //             },
  //           },
  //           DRAFT: {
  //             $sum: {
  //               $cond: [{ $eq: ['$workflowStatus', 'DRAFT'] }, 1, 0],
  //             },
  //           },
  //           APPROVED: {
  //             $sum: {
  //               $cond: [{ $eq: ['$workflowStatus', 'APPROVED'] }, 1, 0],
  //             },
  //           },
  //           locationId: { $first: '$locationId' }, // Assuming all documents have the same locationId per entityId
  //           section: { $first: '$section' },
  //         },
  //       },
  //     ]);

  //     const sectionQueryResult = await this.hiraModel.aggregate([
  //       {
  //         $match: {
  //           organizationId: orgId, // Matching organization ID
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: '$section', // Group by section
  //           total: {
  //             $sum: {
  //               $cond: [{ $ne: ['$status', 'archived'] }, 1, 0], // Only count if not archived
  //             },
  //           },
  //           inWorkflow: {
  //             $sum: {
  //               $cond: {
  //                 if: { $in: ['$workflowStatus', ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED']] },
  //                 then: 1,
  //                 else: 0,
  //               },
  //             },
  //           },
  //           DRAFT: {
  //             $sum: {
  //               $cond: [{ $eq: ['$workflowStatus', 'DRAFT'] }, 1, 0],
  //             },
  //           },
  //           APPROVED: {
  //             $sum: {
  //               $cond: [{ $eq: ['$workflowStatus', 'APPROVED'] }, 1, 0],
  //             },
  //           },
  //           section: { $first: '$section' }, // Preserve the section field
  //         },
  //       },
  //     ]);

  //     let sectionSet: any = new Set();
  //     let sectionArray: any = [];

  //     if (results?.length) {
  //       let entityIdSet: any = new Set();
  //       let locationIdSet: any = new Set();

  //       results.forEach((item) => {
  //         entityIdSet.add(item._id);
  //         locationIdSet.add(item.locationId);
  //       });

  //       if (sectionQueryResult?.length) {
  //         sectionQueryResult.forEach((item) => {
  //           sectionSet.add(item._id);
  //         });
  //       }

  //       const entityArray: any = Array.from(entityIdSet).filter((item) => item !== null && item !== undefined);
  //       const locationArray: any = Array.from(locationIdSet).filter((item) => item !== null && item !== undefined);
  //       sectionArray = Array.from(sectionSet).filter((item) => item !== null && item !== undefined);

  //       const [entities, locations, sections, entitiesForSections] = await Promise.all([
  //         this.prisma.entity.findMany({
  //           where: {
  //             id: { in: entityArray },
  //           },
  //           select: {
  //             id: true,
  //             entityName: true,
  //           },
  //         }),
  //         this.prisma.location.findMany({
  //           where: {
  //             id: { in: locationArray },
  //           },
  //           select: {
  //             id: true,
  //             locationName: true,
  //           },
  //         }),
  //         this.prisma.section.findMany({
  //           where: {
  //             id: { in: sectionArray },
  //           },
  //           select: {
  //             id: true,
  //             name: true,
  //           },
  //         }),
  //         this.prisma.entity.findMany({
  //           where: {
  //             sections: {
  //               hasSome: sectionArray,
  //             },
  //           },
  //           select: {
  //             id: true,
  //             entityName: true,
  //             sections: true,
  //           },
  //         }),
  //       ]);

  //       const entityMap = new Map(entities.map((entity) => [entity.id, entity]));
  //       const locationMap = new Map(locations.map((location) => [location.id, location]));
  //       const sectionMap = new Map(sections.map((section) => [section.id, section]));

  //       const entitySectionQueryResult = sectionQueryResult.map((item) => {
  //         const matchedEntity = entitiesForSections.find((entity) =>
  //           entity.sections.includes(item.section)
  //         );
  //         return {
  //           ...item,
  //           entityName: matchedEntity ? matchedEntity.entityName : '',
  //           sectionName: sectionMap.get(item._id)?.name || '',
  //         };
  //       });

  //       const formattedResultArray = results.map((item) => ({
  //         ...item,
  //         entityId: item._id,
  //         locationName: locationMap.get(item.locationId)?.locationName || '',
  //         entityName: entityMap.get(item._id)?.entityName || '',
  //       }));

  //       const sortedResults = formattedResultArray.sort((a, b) => a.locationName.localeCompare(b.locationName));

  //       this.logger.log(
  //         `trace id=${uuid()}, GET 'api/risk-register/hira/fetchStatusCountsByEntity payload query ${query} success`,
  //         ''
  //       );

  //       return {
  //         mainTableResult: sortedResults,
  //         sectionResults: entitySectionQueryResult,
  //       };
  //     } else {
  //       return [];
  //     }
  //   } catch (error) {
  //     this.logger.error(
  //       `trace id=${uuid()}, GET 'api/risk-register/fetchStatusCountsByEntity payload query ${query} failed with error ${error} `,
  //     );
  //     throw new InternalServerErrorException(error);
  //   }
  // }

  async fetchHiraCountsByEntityAndSection(orgId: string, query: any) {
    try {
      // Fetch all records for the given organization
      const records = await this.hiraModel.find({
        organizationId: orgId,
        status: 'active',
      });

      // Group data by entityId
      const entityData = {};
      records.forEach((record) => {
        const entityId = record.entityId;
        if (!entityData[entityId]) {
          entityData[entityId] = {
            total: 0,
            inWorkflow: 0,
            DRAFT: 0,
            APPROVED: 0,
            locationId: record.locationId,
            section: record.section,
          };
        }

        if (record.status !== 'archived') {
          entityData[entityId].total++;
          if (
            ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'].includes(
              record.workflowStatus,
            )
          ) {
            entityData[entityId].inWorkflow++;
          }
          if (record.workflowStatus === 'DRAFT') {
            entityData[entityId].DRAFT++;
          }
          if (record.workflowStatus === 'APPROVED') {
            entityData[entityId].APPROVED++;
          }
        }
      });

      // Group data by section
      const sectionData = {};
      records.forEach((record) => {
        const sectionId = record.section;
        if (!sectionData[sectionId]) {
          sectionData[sectionId] = {
            total: 0,
            inWorkflow: 0,
            DRAFT: 0,
            APPROVED: 0,
          };
        }

        if (record.status !== 'archived') {
          sectionData[sectionId].total++;
          if (
            ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'].includes(
              record.workflowStatus,
            )
          ) {
            sectionData[sectionId].inWorkflow++;
          }
          if (record.workflowStatus === 'DRAFT') {
            sectionData[sectionId].DRAFT++;
          }
          if (record.workflowStatus === 'APPROVED') {
            sectionData[sectionId].APPROVED++;
          }
        }
      });

      // Extract unique IDs for further lookups
      const entityIds = Object.keys(entityData);
      const locationIds = Array.from(
        new Set(records.map((r) => r.locationId).filter(Boolean)),
      );
      const sectionIds = Object.keys(sectionData);

      // Fetch related data from Prisma
      const [entities, locations, sections] = await Promise.all([
        this.prisma.entity.findMany({
          where: { id: { in: entityIds } },
          select: { id: true, entityName: true },
        }),
        this.prisma.location.findMany({
          where: { id: { in: locationIds } },
          select: { id: true, locationName: true },
        }),
        this.prisma.section.findMany({
          where: { id: { in: sectionIds } },
          select: { id: true, name: true },
        }),
      ]);

      // Map related data for easy lookups
      const entityMap = Object.fromEntries(
        entities.map((e) => [e.id, e.entityName]),
      );
      const locationMap = Object.fromEntries(
        locations.map((l) => [l.id, l.locationName]),
      );
      const sectionMap = Object.fromEntries(
        sections.map((s) => [s.id, s.name]),
      );

      // Format the results
      const mainTableResult = entityIds.map((id) => ({
        entityId: id,
        entityName: entityMap[id] || '',
        locationName: locationMap[entityData[id].locationId] || '',
        ...entityData[id],
      }));

      const sectionResults = sectionIds.map((id) => ({
        sectionId: id,
        sectionName: sectionMap[id] || '',
        ...sectionData[id],
      }));

      return { mainTableResult, sectionResults };
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/fetchStatusCountsByEntity payload query ${query} failed with error: ${error}`,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async checkIfUserIsMultiDeptHead(query) {
    try {
      const traceId = uuid();
      this.logger.debug(
        `traceId=${traceId} - Starting checkIfUserIsMultiDeptHead`,
        JSON.stringify({ query }),
      );
      const { orgId, userId } = query;
      
      this.logger.debug(
        `traceId=${traceId} - Fetching entities for user as dept head`,
        JSON.stringify({ orgId, userId }),
      );
      
      // Fetch all entities where the active user exists in the users array,check if he is dept head in any of the entity
      const entities: any = await this.prisma.entity.findMany({
        where: {
          organizationId: orgId,
          users: { has: userId },
        },
        select: {
          entityName: true,
          // entityId: true,
          id: true,
        },
      });

      this.logger.debug(
        `traceId=${traceId} - Entities fetched successfully`,
        JSON.stringify({ entitiesCount: entities?.length, entities }),
      );

      if (!entities || entities.length <= 1) {
        this.logger.debug(
          `traceId=${traceId} - Insufficient entities found for multi-dept head`,
          JSON.stringify({ entitiesCount: entities?.length }),
        );
        throw new NotFoundException(
          `No entities found for user ${userId} as dept head in organization ${orgId}`,
        );
      }
      
      this.logger.debug(
        `traceId=${traceId} - User is multi-dept head, returning entities`,
        JSON.stringify({ entitiesCount: entities.length }),
      );
      
      this.logger.log(
        `trace id=${traceId}, GET 'api/risk-register/checkIfUserIsMultiDeptHead payload query ${JSON.stringify(query)} success`,
        '',
      );
      return entities;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err; // Rethrow the NotFoundException to be handled by the caller
      }
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/hira-register/checkIfUserIsMultiDeptHead payload query ${query} failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async getHiraWithStepsWithFilters(orgId: any, query: any) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting getHiraWithStepsWithFilters`,
      JSON.stringify({ 
        orgId, 
        queryKeys: Object.keys(query),
        isPrimaryFilter: query?.isPrimaryFilter,
        pagination: query?.pagination
      }),
    );

    try {
      this.logger.debug(
        `traceId=${traceId} - Extracting query parameters`,
        JSON.stringify({ 
          hasHazard: !!query?.hazard,
          hasCondition: !!query?.condition,
          hiraIdsCount: query?.hiraIds?.length || 0,
          hasEntity: !!query?.entity,
          hasUnit: !!query?.unit,
          hasJobTitle: !!query?.jobTitle,
          hasHira: !!query?.hira,
          hasEntityFilter: !!query?.entityFilter
        }),
      );

      const { hazard, condition, hiraIds, entity, unit, jobTitle, hira, entityFilter } =
        query;
      
      let page = query?.page ? parseInt(query.page) : 1;
      let pageSize = query?.pageSize ? parseInt(query.pageSize) : 10;
      let hiraIdInObject = [];
      if (hiraIds?.length) {
        hiraIdInObject = hiraIds.map((id) => new ObjectId(id));
      }

      this.logger.debug(
        `traceId=${traceId} - Pagination and ID processing completed`,
        JSON.stringify({ 
          page,
          pageSize,
          hiraIdInObjectCount: hiraIdInObject?.length
        }),
      );
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
      
      this.logger.debug(
        `traceId=${traceId} - Setting up date ranges`,
        JSON.stringify({ 
          currentYearStart,
          currentYearEnd
        }),
      );

      let whereCondition: any = {
        organizationId: orgId,
        status: 'active',
      };

      this.logger.debug(
        `traceId=${traceId} - Initial where condition set`,
        JSON.stringify({ whereCondition }),
      );

      if (!!query?.isPrimaryFilter) {
        this.logger.debug(
          `traceId=${traceId} - Processing primary filter`,
          JSON.stringify({ 
            hasJobTitle: !!jobTitle?.length,
            hasEntity: !!query?.entity?.length,
            hasUnit: !!query?.unit?.length,
            hasDateRange: !!(query?.fromDate && query?.toDate)
          }),
        );

        whereCondition = {
          ...whereCondition,
        };
        if (!!jobTitle?.length) {
          whereCondition = {
            ...whereCondition,
          };
        }
        if (!!query?.entity?.length) {
          whereCondition = {
            ...whereCondition,
            entityId: { $in: query?.entity },
          };
          this.logger.debug(
            `traceId=${traceId} - Added entity filter`,
            JSON.stringify({ entityIds: query?.entity }),
          );
        }
        if (!!query?.unit?.length) {
          whereCondition = {
            ...whereCondition,
            locationId: { $in: query?.unit },
          };
          this.logger.debug(
            `traceId=${traceId} - Added unit filter`,
            JSON.stringify({ unitIds: query?.unit }),
          );
        }
        if (!!query?.fromDate && !!query?.toDate) {
          whereCondition = {
            ...whereCondition,
            createdAt: {
              $gte: new Date(query?.fromDate),
              $lt: new Date(query?.toDate),
            },
          };
          this.logger.debug(
            `traceId=${traceId} - Added date range filter`,
            JSON.stringify({ 
              fromDate: query?.fromDate,
              toDate: query?.toDate
            }),
          );
        }
      } else {
        this.logger.debug(
          `traceId=${traceId} - Processing non-primary filter`,
          JSON.stringify({ 
            hasEntityId: !!query?.entityId,
            hasLocationId: !!query?.locationId,
            isTotal: !!query?.total,
            isNew: !!query?.new,
            inWorkflow: !!query?.inWorkflow
          }),
        );

        whereCondition = {
          status: 'active',
          organizationId: query?.organizationId,
        };

        if (!!query?.entityId) {
          whereCondition.entityId = query?.entityId;
          this.logger.debug(
            `traceId=${traceId} - Added entityId filter`,
            JSON.stringify({ entityId: query?.entityId }),
          );
        }

        if (!!query?.locationId) {
          whereCondition.locationId = query?.locationId;
          this.logger.debug(
            `traceId=${traceId} - Added locationId filter`,
            JSON.stringify({ locationId: query?.locationId }),
          );
        }
        if (query?.total) {
          whereCondition = whereCondition;
        }
        if (query?.new) {
          whereCondition = {
            ...whereCondition,
            createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
          };
          this.logger.debug(
            `traceId=${traceId} - Added new records filter`,
            JSON.stringify({ currentYearStart, currentYearEnd }),
          );
        }
        // if (query?.significant) {
        //   whereCondition = {
        //     ...whereCondition,
        //     preMitigationScore: { $gte: 8 },
        //   };
        // }
        if (query?.inWorkflow) {
          whereCondition = {
            ...whereCondition,
            workflowStatus: { $in: ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'] },
          };
          this.logger.debug(
            `traceId=${traceId} - Added inWorkflow filter`,
            JSON.stringify({ workflowStatuses: ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'] }),
          );
        }
      }

      if (!!hazard) {
        // whereCondition.hazardType = hazard;
        whereCondition._id = { $in: hiraIdInObject };
        this.logger.debug(
          `traceId=${traceId} - Added hazard filter`,
          JSON.stringify({ hazard, hiraIdInObjectCount: hiraIdInObject?.length }),
        );
      }
      if (!!condition) {
        whereCondition.condition = condition;
        this.logger.debug(
          `traceId=${traceId} - Added condition filter`,
          JSON.stringify({ condition }),
        );
      }
      if (!!hira) {
        whereCondition._id = { $in: hira };
        this.logger.debug(
          `traceId=${traceId} - Added hira filter`,
          JSON.stringify({ hiraIds: hira }),
        );
      }
      if (!!entityFilter) {
        whereCondition.entityId = entityFilter;
        whereCondition.workflowStatus = "APPROVED"
        this.logger.debug(
          `traceId=${traceId} - Added entityFilter`,
          JSON.stringify({ entityFilter }),
        );
      }
      
      this.logger.debug(
        `traceId=${traceId} - Final where condition prepared`,
        JSON.stringify({ 
          whereConditionKeys: Object.keys(whereCondition),
          whereCondition
        }),
      );

      const shouldPaginate = query?.pagination !== 'false';

      this.logger.debug(
        `traceId=${traceId} - Preparing HIRA query`,
        JSON.stringify({ 
          shouldPaginate,
          page,
          pageSize
        }),
      );

      let hiraQuery = this.hiraModel
        .find({
          ...whereCondition,
        })
        .sort({ createdAt: -1 }); // Sort by createdAt in descending order
        
      if (shouldPaginate) {
        const skip = (page - 1) * pageSize;
        hiraQuery = hiraQuery.skip(skip).limit(pageSize);
        
        this.logger.debug(
          `traceId=${traceId} - Pagination applied`,
          JSON.stringify({ skip, limit: pageSize }),
        );
      }

      this.logger.debug(
        `traceId=${traceId} - Executing HIRA query`,
        JSON.stringify({ shouldPaginate }),
      );

      const hiraList = await hiraQuery.lean();

      this.logger.debug(
        `traceId=${traceId} - HIRA query completed`,
        JSON.stringify({ hiraListCount: hiraList?.length }),
      );

      const totalHiraCount = await this.hiraModel.countDocuments({
        ...whereCondition,
      });

      this.logger.debug(
        `traceId=${traceId} - Total count query completed`,
        JSON.stringify({ totalHiraCount }),
      );

      this.logger.debug(
        `traceId=${traceId} - Fetching HIRA config`,
        JSON.stringify({ orgId }),
      );

      let hiraConfig: any = await this.hiraConfigModel
        .findOne({
          riskCategory: 'HIRA',
          deleted: false,
          organizationId: orgId,
        })
        .select('condition riskType')
        .lean();

      this.logger.debug(
        `traceId=${traceId} - HIRA config fetched`,
        JSON.stringify({ hasHiraConfig: !!hiraConfig }),
      );

      this.logger.debug(
        `traceId=${traceId} - Starting ID collection from HIRA list`,
        JSON.stringify({ hiraListCount: hiraList?.length }),
      );

      const userIds: any = new Set();
      const locationIds: any = new Set();
      const entityIds: any = new Set();
      const areaIds: any = new Set();
      const sectionIds: any = new Set();

      hiraList?.forEach((item: any) => {
        item?.createdBy && userIds.add(item?.createdBy);
        item?.locationId && locationIds.add(item?.locationId);
        item?.entityId && entityIds.add(item?.entityId);
        item?.area && areaIds.add(item?.area);
        item?.section && sectionIds.add(item?.section);
        item?.workflow?.forEach((workflow: any) => {
          workflow?.reviewers?.length &&
            workflow?.reviewers.forEach((reviewer: any) =>
              userIds.add(reviewer),
            );
          workflow?.approvers?.length &&
            workflow?.approvers.forEach((approver: any) =>
              userIds.add(approver),
            );
        });
      });

      this.logger.debug(
        `traceId=${traceId} - ID collection completed`,
        JSON.stringify({ 
          userIdsCount: userIds.size,
          locationIdsCount: locationIds.size,
          entityIdsCount: entityIds.size,
          areaIdsCount: areaIds.size,
          sectionIdsCount: sectionIds.size
        }),
      );

      this.logger.debug(
        `traceId=${traceId} - Fetching related data with Promise.all`,
        JSON.stringify({ 
          userIdsCount: userIds.size,
          locationIdsCount: locationIds.size,
          entityIdsCount: entityIds.size,
          areaIdsCount: areaIds.size,
          sectionIdsCount: sectionIds.size
        }),
      );

      // Fetch related data using Prisma
      const [users, locations, entities, sections, areas] = await Promise.all([
        this.prisma.user.findMany({
          where: { id: { in: Array.from(userIds) } },
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
          },
        }),
        this.prisma.location.findMany({
          where: { id: { in: Array.from(locationIds) } },
          select: { id: true, locationName: true },
        }),
        this.prisma.entity.findMany({
          where: { id: { in: Array.from(entityIds) } },
          select: { id: true, entityName: true },
        }),
        this.prisma.section.findMany({
          where: { id: { in: Array.from(sectionIds) } },
          select: { id: true, name: true },
        }),
        this.hiraAreaMasterModel
          .find({
            id: { $in: Array.from(areaIds) as any },
          })
          .select('id name'),
      ]);

      this.logger.debug(
        `traceId=${traceId} - Related data fetched successfully`,
        JSON.stringify({ 
          usersCount: users?.length,
          locationsCount: locations?.length,
          entitiesCount: entities?.length,
          sectionsCount: sections?.length,
          areasCount: areas?.length
        }),
      );

      this.logger.debug(
        `traceId=${traceId} - Creating lookup maps`,
        JSON.stringify({ 
          usersCount: users?.length,
          locationsCount: locations?.length,
          entitiesCount: entities?.length,
          sectionsCount: sections?.length,
          areasCount: areas?.length
        }),
      );

      // Create maps for quick lookup
      const userMap = new Map(users?.map((user) => [user?.id, user]));
      const locationMap = new Map(
        locations?.map((location) => [location?.id, location]),
      );
      const entityMap = new Map(
        entities?.map((entity) => [entity?.id, entity]),
      );
      const sectionMap = new Map(
        sections?.map((section) => [section?.id, section]),
      );
      const areaMap = new Map(areas?.map((area) => [area?.id, area]));

      this.logger.debug(
        `traceId=${traceId} - Lookup maps created`,
        JSON.stringify({ 
          userMapSize: userMap.size,
          locationMapSize: locationMap.size,
          entityMapSize: entityMap.size,
          sectionMapSize: sectionMap.size,
          areaMapSize: areaMap.size
        }),
      );

    

      this.logger.debug(
        `traceId=${traceId} - Starting HIRA list population`,
        JSON.stringify({ 
          hiraListCount: hiraList?.length
        }),
      );

      const populatedHiraList = hiraList.map((item: any) => {
        let pendingWith : any = 'N/A';
        const latestWorkflowDetails = item?.workflow?.slice(
          item?.workflow?.length - 1,
        )[0];
        let reviewersDetails = [],
          approversDetails = [], approvedDate = '';
        if (latestWorkflowDetails) {
          reviewersDetails = latestWorkflowDetails?.reviewers?.map(
            (reviewerId: any) => userMap.get(reviewerId),
          );
          approversDetails = latestWorkflowDetails?.approvers?.map(
            (approverId: any) => userMap.get(approverId),
          );
          // console.log("item", item);
          // console.log("item?.workflowStatus", item?.workflowStatus);
          // console.log("reviewersDetails", reviewersDetails);
          // console.log("approversDetails", approversDetails);
          // console.log("begfore pending with", pendingWith);
          
          // console.log("latestWorkflowDetails", latestWorkflowDetails);
          approvedDate = latestWorkflowDetails?.approvedOn;
          if (approvedDate) {
            const dateObj = new Date(approvedDate);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            approvedDate = `${day}-${month}-${year}`;
          } else {
            approvedDate = 'N/A';
          }
      
          if (item?.workflowStatus === 'IN_REVIEW' && reviewersDetails?.length) {
            // console.log("hira in review");
            
            pendingWith = reviewersDetails
              .filter(Boolean)
              .map((u: any) => `${u?.firstname || ''} ${u?.lastname || ''}`.trim())
              .join(', ');
          }
          if (
            item?.workflowStatus === 'IN_APPROVAL' &&
            approversDetails?.length
          ) {
            // console.log("hira in approval");
            pendingWith = approversDetails
              .filter(Boolean)
              .map((u: any) => `${u?.firstname || ''} ${u?.lastname || ''}`.trim())
              .join(', ');
          }
          // console.log("pending with", pendingWith);
          
        }
        return {
          ...item,
          createdByDetails: userMap.get(item?.createdBy) || '',
          locationDetails: locationMap.get(item?.locationId) || '',
          entityDetails: entityMap.get(item?.entityId) || '',
          areaDetails: areaMap.get(item?.area) || '',
          sectionDetails: sectionMap.get(item?.section) || '',
          riskTypeDetails: hiraConfig?.riskType?.find(
            (riskType: any) => riskType?._id?.toString() === item?.riskType,
          ),
          conditionDetails: hiraConfig?.condition?.find(
            (condition: any) => condition?._id?.toString() === item?.condition,
          ),
          reviewersDetails: reviewersDetails,
          approversDetails: approversDetails,
          latestWorkflowDetails: latestWorkflowDetails,
          pendingWith,
          approvedDate,
        };
      });
      this.logger.debug(
        `traceId=${traceId} - HIRA list population completed`,
        JSON.stringify({ 
          populatedHiraListCount: populatedHiraList?.length,
          totalHiraCount
        }),
      );

      this.logger.debug(
        `traceId=${traceId} - getHiraWithStepsWithFilters completed successfully`,
        JSON.stringify({ 
          success: true,
          listCount: populatedHiraList?.length,
          total: totalHiraCount,
          orgId
        }),
      );

      this.logger.log(
        `trace id=${traceId}, GET 'api/risk-register/getAllHiraTableDataBasedOnFilter payload query ${query} success`,
        '',
      );
      return {
        list: populatedHiraList,
        total: totalHiraCount,
      };

      // console.log('finalList length-->', finalList.length);1

      // return {
      //   data: finalList,
      //   total: uniqueRecords.length,
      // };
    } catch (error) {
      this.logger.debug(
        `traceId=${traceId} - getHiraWithStepsWithFilters failed with error`,
        JSON.stringify({ 
          error: error.message, 
          orgId,
          queryKeys: Object.keys(query || {})
        }),
      );

      this.logger.error(
        `trace id=${traceId}, GET 'api/risk-register/getAllHiraTableDataBasedOnFilter payload query ${query} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getHiraCount(query: any) {
    try {
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);

      let whereCondition: any = {
        status: { $in: ['active', 'inWorkflow'] },
        deleted: false,
        organizationId: query?.organizationId,
      };

      if (query?.isPrimaryFilter) {
        // Apply primary filters
        if (!!query?.jobTitle?.length) {
          whereCondition.jobTitle = { $in: query.jobTitle };
        }
        if (!!query?.entity?.length) {
          whereCondition.entityId = { $in: query.entity };
        }
        if (!!query?.unit?.length) {
          whereCondition.locationId = { $in: query.unit };
        }
        if (!!query?.fromDate && !!query?.toDate) {
          whereCondition.createdAt = {
            $gte: new Date(query.fromDate),
            $lt: new Date(query.toDate),
          };
        }
        // Unique HIRA count
        const totalUniqueJobTitles = await this.hiraRegisterModel.distinct(
          'jobTitle',
          {
            ...whereCondition,
          },
        );
        const totalConslidatedHira = totalUniqueJobTitles?.length;

        // Unique HIRA count
        const totalUniqueInWorkflowHiras =
          await this.hiraRegisterModel.distinct('jobTitle', {
            ...whereCondition,
            status: 'inWorkflow',
          });
        const totalInWorkflowConsolidatedHira =
          totalUniqueInWorkflowHiras?.length;

        // console.log('totalConslidatedHira', totalConslidatedHira);

        // Calculate total counts based on the primary filter
        const totalSteps = await this.hiraRegisterModel.countDocuments({
          ...whereCondition,
          subStepNo: 1.1,
        });

        const totalNewHira = await this.hiraRegisterModel.countDocuments({
          ...whereCondition,
          createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
        });

        const totalRisks = await this.hiraRegisterModel.countDocuments(
          whereCondition,
        );

        const totalSignificantHira =
          await this.hiraRegisterModel.countDocuments({
            ...whereCondition,
            preMitigationScore: { $gte: 8 },
          });
        this.logger.log(
          `trace id=${uuid()}, GET 'api/risk-register/getHiraCount payload query ${query} success`,
          '',
        );
        return {
          totalSteps,
          totalRisks,
          totalNewHira,
          totalSignificantHira,
          totalConslidatedHira,
          totalInWorkflowConsolidatedHira,
        };
      } else {
        // Use separate counts for entity and location
        let entityQuery = { ...whereCondition, entityId: query.entity };
        let locationQuery = { ...whereCondition, locationId: query.unit };

        // console.log('whereConditionForUniqueJobs', whereConditionForUniqueJobs);

        // Unique HIRA count
        const totalUniqueJobTitlesForEntity =
          await this.hiraRegisterModel.distinct('jobTitle', {
            ...whereCondition,
            entityId: query.entity,
          });
        const totalHiraEntityWise = totalUniqueJobTitlesForEntity?.length;

        const uniqueHiraCountForLocation =
          await this.hiraRegisterModel.distinct('jobTitle', {
            ...whereCondition,
            locationId: query.unit,
          });
        const totalHiraLocationWise = uniqueHiraCountForLocation?.length;

        const totalUniqueInWorkflowHirasEntity =
          await this.hiraRegisterModel.distinct('jobTitle', {
            ...whereCondition,
            status: 'inWorkflow',
            entityId: query.entity,
          });
        const totalInWorkflowConsolidatedHiraEntity =
          totalUniqueInWorkflowHirasEntity?.length;

        const totalUniqueInWorkflowHirasLocation =
          await this.hiraRegisterModel.distinct('jobTitle', {
            ...whereCondition,
            status: 'inWorkflow',
            locationId: query.unit,
          });
        const totalInWorkflowConsolidatedHiraLocation =
          totalUniqueInWorkflowHirasLocation?.length;

        const entityStepsCount = await this.hiraRegisterModel.countDocuments({
          ...entityQuery,
          subStepNo: 1.1,
        });
        const entityNewHiraCount = await this.hiraRegisterModel.countDocuments({
          ...entityQuery,
          createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
        });

        const entityTotalRiskCount =
          await this.hiraRegisterModel.countDocuments(entityQuery);

        const entitySignificantHiraCount =
          await this.hiraRegisterModel.countDocuments({
            ...entityQuery,
            preMitigationScore: { $gte: 8 },
          });

        const locationStepsCount = await this.hiraRegisterModel.countDocuments({
          ...locationQuery,
          subStepNo: 1.1,
        });
        const locationNewHiraCount =
          await this.hiraRegisterModel.countDocuments({
            ...locationQuery,
            createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
          });
        const locationTotalRiskCount =
          await this.hiraRegisterModel.countDocuments(locationQuery);

        const locationSignificantHiraCount =
          await this.hiraRegisterModel.countDocuments({
            ...locationQuery,
            preMitigationScore: { $gte: 8 },
          });
        this.logger.log(
          `trace id=${uuid()}, GET 'api/risk-register/getHiraCount payload query ${query} success`,
          '',
        );
        return {
          entity: {
            totalSteps: entityStepsCount,
            totalRisks: entityTotalRiskCount,
            totalNewHira: entityNewHiraCount,
            totalSignificantHira: entitySignificantHiraCount,
            totalConslidatedHira: totalHiraEntityWise,
            totalInWorkflowConsolidatedHira:
              totalInWorkflowConsolidatedHiraEntity,
          },
          location: {
            totalSteps: locationStepsCount,
            totalRisks: locationTotalRiskCount,
            totalNewHira: locationNewHiraCount,
            totalSignificantHira: locationSignificantHiraCount,
            totalConslidatedHira: totalHiraLocationWise,
            totalInWorkflowConsolidatedHira:
              totalInWorkflowConsolidatedHiraLocation,
          },
        };
      }
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/getHiraCount payload query ${query} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getHiraGraphData(query: any) {
    // console.log('QUERY IN HAZARD ->', query);
    try {
      let whereCondition: any = {};
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
      // console.log('QUERY inhazard graph', query);

      if (query?.isPrimaryFilter) {
        whereCondition = {
          status: { $in: ['active', 'inWorkflow'] },
          deleted: false,
          // entityId: { $in: query?.entity },
          // locationId: { $in: query?.unit },
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
      } else {
        whereCondition = {
          status: { $in: ['active', 'inWorkflow'] },
          deleted: false,
          organizationId: query?.organizationId,
        };

        if (!!query?.entityId) {
          whereCondition.entityId = query?.entityId;
        }

        if (!!query?.locationId) {
          whereCondition.locationId = query?.locationId;
        }
        // if (query?.steps) {
        //   whereCondition.subStepNo = 1.1;
        // }

        if (query?.total) {
          whereCondition = whereCondition;
        }

        if (query?.new) {
          whereCondition = {
            ...whereCondition,
            createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
          };
        }

        if (query?.significant) {
          whereCondition = {
            ...whereCondition,
            preMitigationScore: { $gte: 8 },
          };
        }
        if (query?.inWorkflow) {
          whereCondition = {
            ...whereCondition,
            status: 'inWorkflow',
          };
        }
      }

      // console.log('WHERECONDITION in hira graph', whereCondition);

      const records = await this.hiraRegisterModel
        .find(whereCondition)
        .select('jobTitle hazardType')
        .lean();

      const uniqueJobTitlesByHazardType = new Map();

      // Gather unique job titles by hazard type
      records.forEach((record) => {
        const hazardType = record.hazardType;
        let jobTitles = uniqueJobTitlesByHazardType.get(hazardType);
        if (!jobTitles) {
          jobTitles = new Set();
          uniqueJobTitlesByHazardType.set(hazardType, jobTitles);
        }
        jobTitles.add(record.jobTitle);
      });

      // Collect all unique hazardType IDs for fetching details
      const hazardTypeIds = Array.from(uniqueJobTitlesByHazardType.keys());

      // Fetch hazard type details from the HiraTypeConfig model
      const hazardTypeDetails = await this.hiraTypeConfigModel
        .find({
          _id: { $in: hazardTypeIds },
          type: 'hazard',
          deleted: false,
        })
        .select('_id name')
        .lean();

      // Create a map of hazardType IDs to their names
      const hazardTypeNameMap = new Map(
        hazardTypeDetails.map((h) => [h._id.toString(), h.name]),
      );

      // Format the result to include hazard type names
      const result = Array.from(uniqueJobTitlesByHazardType).map(
        ([hazardType, jobTitlesSet]) => ({
          hazardTypeId: hazardType,
          hazardTypeName:
            hazardTypeNameMap.get(hazardType) || 'Unknown Hazard Type', // Provide a fallback name
          uniqueJobTitleCount: jobTitlesSet.size,
          jobTitles: Array.from(jobTitlesSet), // Convert Set to Array to list job titles
        }),
      );
      this.logger.log(
        `trace id=${uuid()}, GET 'api/risk-register/getHiraGraphData payload query ${query} success`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/getHiraGraphData payload query ${query} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }
  async getHiraGraphDataByCondition(query: any) {
    try {
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);

      // Fetch the HiraConfig first to get condition details
      const hiraConfig = await this.hiraConfigModel
        .findOne({
          riskCategory: 'HIRA',
          deleted: false,
          organizationId: query?.organizationId,
        })
        .select('condition')
        .lean();

      let whereCondition: any = {
        status: { $in: ['active', 'inWorkflow'] },
        deleted: false,
        organizationId: query?.organizationId,
      };
      if (query?.isPrimaryFilter) {
        whereCondition = {
          ...whereCondition,
          // entityId: { $in: query?.entity },
          // locationId: { $in: query?.unit },
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
      } else {
        if (!!query?.entityId) {
          whereCondition.entityId = query?.entityId;
        }

        if (!!query?.locationId) {
          whereCondition.locationId = query?.locationId;
        }
        // if (query?.steps) {
        //   whereCondition.subStepNo = 1.1;
        // }

        if (query?.total) {
          whereCondition = whereCondition;
        }

        if (query?.new) {
          whereCondition = {
            ...whereCondition,
            createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
          };
        }

        if (query?.significant) {
          whereCondition = {
            ...whereCondition,
            preMitigationScore: { $gte: 8 },
          };
        }
        if (query?.inWorkflow) {
          whereCondition = {
            ...whereCondition,
            status: 'inWorkflow',
          };
        }
      }

      // Create a map from condition IDs to names
      const conditionNameMap = new Map(
        hiraConfig.condition.map((cond: any) => [
          cond._id.toString(),
          cond.name,
        ]),
      );

      const records = await this.hiraRegisterModel
        .find(
          //   {
          //   status: { $in: ['active', 'inWorkflow'] },
          //   deleted: false,
          //   jobTitle: { $in: query?.jobTitle },
          //   entityId: { $in: query?.entity },
          //   locationId: { $in: query?.unit },
          // }
          whereCondition,
        )
        .select('jobTitle condition') // Focus on 'condition' field
        .lean();

      const uniqueJobTitlesByCondition = new Map();

      // Aggregate unique job titles by condition
      records.forEach((record) => {
        const condition = record.condition;
        let jobTitles = uniqueJobTitlesByCondition.get(condition);
        if (!jobTitles) {
          jobTitles = new Set();
          uniqueJobTitlesByCondition.set(condition, jobTitles);
        }
        jobTitles.add(record.jobTitle);
      });

      // Map condition IDs to their names for the final result
      const result = Array.from(uniqueJobTitlesByCondition).map(
        ([conditionId, jobTitlesSet]) => ({
          conditionId: conditionId,
          conditionName:
            conditionNameMap.get(conditionId) || 'Unknown Condition',
          uniqueJobTitleCount: jobTitlesSet.size,
          jobTitles: Array.from(jobTitlesSet),
        }),
      );
      this.logger.log(
        `trace id=${uuid()}, GET 'api/risk-register/getHiraGraphDataByCondition payload query ${query} success`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/getHiraGraphDataByCondition payload query ${query} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getHiraAverageRiskScore(query) {
    try {
      // Aggregate to find the maximum preMitigationScore for each jobTitle
      const maxScoresByJobTitle = await this.hiraRegisterModel.aggregate([
        {
          $match: {
            preMitigationScore: { $exists: true, $ne: null }, // Ensure the field exists and is not null
            deleted: false, // Consider only non-deleted entries
            entityId: { $in: query?.entity },
            locationId: { $in: query?.unit },
          },
        },
        {
          $group: {
            _id: '$jobTitle', // Group by jobTitle
            maxScore: { $max: '$preMitigationScore' }, // Get maximum score per jobTitle
          },
        },
      ]);

      // console.log('maxScoresByJobTitle', maxScoresByJobTitle);

      // Calculate the average of these maximum scores
      if (maxScoresByJobTitle.length === 0) {
        return { averageRiskScore: 0 }; // Handle case with no data
      }

      const total = maxScoresByJobTitle.reduce(
        (acc, curr) => acc + curr.maxScore,
        0,
      );
      const averageRiskScore = total / maxScoresByJobTitle.length;

      // const seenIds = new Set();
      // const duplicates = [];

      // maxScoresByJobTitle.forEach((item) => {
      //   if (seenIds.has(item._id)) {
      //     duplicates.push(item._id); // Add to duplicates if already seen
      //   }
      //   seenIds.add(item._id); // Mark this ID as seen
      // });

      // console.log(
      //   'Duplicates:',
      //   duplicates.length > 0 ? duplicates : 'No duplicates found.',
      // );
      this.logger.log(
        `trace id=${uuid()}, GET 'api/risk-register/getHiraAverageRiskScore payload query ${query} success`,
        '',
      );
      return { averageRiskScore };
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/getHiraAverageRiskScore payload query ${query} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getTopTenRiskScores(query) {
    try {
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
      let whereCondition: any = {
        status: { $in: ['active', 'inWorkflow'] },
        deleted: false,
        organizationId: query?.organizationId,
      };
      if (query?.isPrimaryFilter) {
        whereCondition = {
          ...whereCondition,
          // entityId: { $in: query?.entity },
          // locationId: { $in: query?.unit },
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
      } else {
        if (!!query?.entityId) {
          whereCondition.entityId = query?.entityId;
        }

        if (!!query?.locationId) {
          whereCondition.locationId = query?.locationId;
        }
        // if (query?.steps) {
        //   whereCondition.subStepNo = 1.1;
        // }

        if (query?.total) {
          whereCondition = whereCondition;
        }

        if (query?.new) {
          whereCondition = {
            ...whereCondition,
            createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
          };
        }

        if (query?.significant) {
          whereCondition = {
            ...whereCondition,
            preMitigationScore: { $gte: 8 },
          };
        }
        if (query?.inWorkflow) {
          whereCondition = {
            ...whereCondition,
            status: 'inWorkflow',
          };
        }
      }

      console.log('whereCondition', whereCondition);

      const topScoresByJobTitle = await this.hiraRegisterModel.aggregate([
        {
          $match: {
            ...whereCondition,
          },
        },
        {
          $group: {
            _id: '$jobTitle',
            maxScore: { $max: '$preMitigationScore' },
            document: { $first: '$$ROOT' }, // Capture the whole document of the max score
          },
        },
        {
          $sort: { maxScore: -1 },
        },
        {
          $limit: 10,
        },
        {
          $project: {
            _id: 1,
            maxScore: 1,
            section: '$document.section',
            entityId: '$document.entityId',
            jobBasicStep: '$document.jobBasicStep',
          },
        },
      ]);

      if (topScoresByJobTitle?.length) {
        const entityIds = topScoresByJobTitle.map((item) => item.entityId);
        const sectionIds = topScoresByJobTitle.map((item) => item.section);
        // console.log('sectionIds', sectionIds);

        const sections = await this.prisma.section.findMany({
          where: {
            id: { in: sectionIds },
          },
          select: {
            id: true,
            name: true,
          },
        });

        const entities = await this.prisma.entity.findMany({
          where: {
            id: { in: entityIds },
          },
          select: {
            id: true,
            entityId: true,
            entityName: true,
          },
        });

        const entityMap = new Map(
          entities.map((entity) => [entity.id, entity]),
        );
        const sectionMap = new Map(
          sections?.map((section) => [section.id, section]),
        );
        const topScoresWithEntity = topScoresByJobTitle.map((item) => {
          const entity = entityMap.get(item.entityId)
            ? entityMap.get(item.entityId)?.entityName
            : ' ';
          const section = sectionMap.get(item.section)
            ? sectionMap.get(item.section)?.name
            : item?.section;
          // console.log('section', section);

          return {
            ...item,
            entity,
            section,
          };
        });
        this.logger.log(
          `trace id=${uuid()}, GET 'api/risk-register/getTopTenRiskScores payload query ${query} success`,
          '',
        );
        return topScoresWithEntity;
      } else return [];

      // return topScoresByJobTitle;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/getTopTenRiskScores payload query ${query} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getHiraRiskLevelGraphData(query: any) {
    try {
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
      let whereCondition: any = {
        status: { $in: ['active', 'inWorkflow'] },
        deleted: false,
        organizationId: query?.organizationId,
      };
      if (query?.isPrimaryFilter) {
        whereCondition = {
          ...whereCondition,
          // entityId: { $in: query?.entity },
          // locationId: { $in: query?.unit },
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
      } else {
        if (!!query?.entityId) {
          whereCondition.entityId = query?.entityId;
        }

        if (!!query?.locationId) {
          whereCondition.locationId = query?.locationId;
        }
        // if (query?.steps) {
        //   whereCondition.subStepNo = 1.1;
        // }

        if (query?.total) {
          whereCondition = whereCondition;
        }

        if (query?.new) {
          whereCondition = {
            ...whereCondition,
            createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
          };
        }

        if (query?.significant) {
          whereCondition = {
            ...whereCondition,
            preMitigationScore: { $gte: 8 },
          };
        }
        if (query?.inWorkflow) {
          whereCondition = {
            ...whereCondition,
            status: 'inWorkflow',
          };
        }
      }
      const riskLevels = await this.hiraRegisterModel.aggregate([
        {
          $match: {
            preMitigationScore: { $exists: true, $ne: null },
            ...whereCondition,
          },
        },
        {
          $group: {
            _id: null,
            green: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$preMitigationScore', 1] },
                      { $lte: ['$preMitigationScore', 3] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            yellow: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$preMitigationScore', 3] },
                      { $lte: ['$preMitigationScore', 7] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            orange: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$preMitigationScore', 7] },
                      { $lte: ['$preMitigationScore', 13] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            red: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$preMitigationScore', 13] },
                      { $lte: ['$preMitigationScore', 25] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

      // Assuming riskLevels contains a single result with the count of each risk level.
      const result =
        riskLevels.length > 0
          ? riskLevels[0]
          : { green: 0, yellow: 0, orange: 0, red: 0 };
      this.logger.log(
        `trace id=${uuid()}, GET 'api/risk-register/getHiraRiskLevelGraphData payload query ${query} success`,
        '',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/getHiraRiskLevelGraphData payload query ${query} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getAllHiraTableDataBasedOnFilter(orgId: any, query: any) {
    try {
      const {
        hazard,
        condition,

        entity,
        unit,
        jobTitle,
      } = query;

      let page = query?.page ? parseInt(query.page) : 1;
      let pageSize = query?.pageSize ? parseInt(query.pageSize) : 10;

      console.log('QUERY IN ALL HIRA API', query);
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
      let whereCondition: any = {
        organizationId: orgId,
        status: { $in: ['inWorkflow', 'active'] },
      };

      if (!!query?.isPrimaryFilter) {
        whereCondition = {
          ...whereCondition,
          // entityId: { $in: entity },
          // locationId: { $in: unit },
        };
        if (!!jobTitle?.length) {
          whereCondition = {
            ...whereCondition,

            jobTitle: { $in: jobTitle },
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
      } else {
        whereCondition = {
          status: { $in: ['active', 'inWorkflow'] },
          deleted: false,
          organizationId: query?.organizationId,
        };

        if (!!query?.entityId) {
          whereCondition.entityId = query?.entityId;
        }

        if (!!query?.locationId) {
          whereCondition.locationId = query?.locationId;
        }
        // if (query?.steps) {
        //   whereCondition.subStepNo = 1.1;
        // }

        if (query?.total) {
          whereCondition = whereCondition;
        }

        if (query?.new) {
          whereCondition = {
            ...whereCondition,
            createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
          };
        }

        if (query?.significant) {
          whereCondition = {
            ...whereCondition,
            preMitigationScore: { $gte: 8 },
          };
        }
        if (query?.inWorkflow) {
          whereCondition = {
            ...whereCondition,
            status: 'inWorkflow',
          };
        }
      }

      if (!!hazard) {
        whereCondition.hazardType = hazard;
      }
      if (!!condition) {
        whereCondition.condition = condition;
      }

      // console.log('WHERE CONDITION IN ALL HIRA API', whereCondition);

      const allRecords = await this.hiraRegisterModel
        .find(whereCondition)
        .populate('hiraConfigId')
        .sort({ updatedAt: -1 }) // Sorting in descending order by createdAt
        .lean();

      // console.log('UNIQUE LENGETH-->', allRecords.length);

      const uniqueRecordsMap = new Map();
      allRecords.forEach((record) => {
        if (!uniqueRecordsMap.has(record.jobTitle)) {
          uniqueRecordsMap.set(record.jobTitle, record);
        }
      });

      const uniqueRecords = Array.from(uniqueRecordsMap.values());
      const startIndex = (page - 1) * pageSize;

      // console.log('start index-->', startIndex);
      // console.log('page size-->', startIndex + pageSize);

      const paginatedRecords = uniqueRecords.slice(
        startIndex,
        startIndex + pageSize,
      );

      // console.log('paginated records length-->', paginatedRecords.length);

      const userIds = new Set();
      const areaIds = new Set();
      const entityIds = new Set();
      const sectionIds = new Set();
      uniqueRecords.forEach((record) => {
        if (record.createdBy) {
          userIds.add(record.createdBy);
        }
        if (record?.area) {
          areaIds.add(record?.area);
        }
        if (record?.entityId) {
          entityIds.add(record?.entityId);
        }
        if (record?.section) {
          sectionIds.add(record?.section);
        }
      });

      // console.log("checkrisknew section IDS-->", sectionIds);

      const uniqueJobTitles = new Set(
        uniqueRecords.map((record: any) => record.jobTitle),
      );

      // console.log('checkrisk unique job titles', uniqueJobTitles);

      const consolidatedEntries = await this.hiraConsolidatedStatusModel
        .find({
          jobTitle: { $in: Array.from(uniqueJobTitles) },
          organizationId: orgId,
        })
        .lean();

      // consolidatedEntries.forEach((entry: any) => {
      //   console.log("entry--", entry);

      //   if (entry.workflow && entry.workflow.length > 0) {
      //     const latestWorkflow = entry.workflow.reduce(
      //       (prev: any, current: any) => {
      //         return prev.cycleNumber > current.cycleNumber ? prev : current;
      //       },
      //     );
      //     // console.log('latestWorkflow', latestWorkflow);

      //     if (latestWorkflow.reviewedBy) {
      //       userIds.add(latestWorkflow.reviewedBy);
      //     }
      //     if (latestWorkflow.approvedBy) {
      //       userIds.add(latestWorkflow.approvedBy);
      //     }
      //   }
      // });

      consolidatedEntries.forEach((entry: any) => {
        if (entry?.reviewers?.length) {
          entry.reviewers.forEach((id) => userIds.add(id));
        }
        if (entry?.approvers?.length) {
          entry.approvers.forEach((id) => userIds.add(id));
        }
      });

      // console.log('consolidatedEntries', consolidatedEntries);

      // console.log(
      //   'consolidatedEntries workflow',
      //   consolidatedEntries[0]?.workflow,
      // );

      // Fetch user details for all collected user IDs
      let users, entityDetails, sectionDetails;
      if (Array.from(userIds).length) {
        users = await this.prisma.user.findMany({
          where: {
            id: { in: Array.from(userIds) as any },
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
      if (Array.from(sectionIds).length) {
        sectionDetails = await this.prisma.section.findMany({
          where: {
            id: { in: Array.from(sectionIds) as any },
          },
          select: {
            id: true,
            name: true,
          },
        });
      }

      // console.log("sectionDetails --->", sectionDetails);

      const areaMaster = await this.hiraAreaMasterModel
        .find({
          id: { $in: Array.from(areaIds) as any },
        })
        .select('id name');

      // console.log("check area master ---", areaMaster);

      const userMap = new Map(users?.map((user) => [user?.id, user]));
      // console.log("user map", userMap);

      const areaMap = new Map(areaMaster?.map((area) => [area?.id, area]));

      const entityMap = new Map(
        entityDetails?.map((entity) => [entity.id, entity]),
      );

      const sectionMap = new Map(
        sectionDetails?.map((section) => [section.id, section]),
      );

      // console.log("area map ", areaMap);

      const jobTitleToWorkflowMap = new Map();
      const jobTitleToNestedWorkflowMap = new Map();
      consolidatedEntries?.forEach((entry: any) => {
        jobTitleToWorkflowMap?.set(entry.jobTitle, entry);

        if (entry.workflow && entry.workflow.length > 0) {
          const latestWorkflow = entry.workflow.reduce(
            (prev: any, current: any) => {
              return prev.cycleNumber > current.cycleNumber ? prev : current;
            },
          );
          // console.log('latestWorkflow', latestWorkflow);
          jobTitleToNestedWorkflowMap.set(entry.jobTitle, latestWorkflow);
          // console.log('entry to create map', entry);
        }

        // }
      });

      let finalList = paginatedRecords?.map((item) => {
        const { hiraConfigId, ...rest } = item; // Exclude hiraConfigId from the output
        const workflow = jobTitleToWorkflowMap?.get(item.jobTitle);
        const cycleWorkflow = jobTitleToNestedWorkflowMap.get(item.jobTitle);
        // console.log("workflow", workflow);

        const selectedRiskType = hiraConfigId?.riskType?.find(
          (rt) => rt._id.toString() === item.riskType,
        );
        const selectedCondition = hiraConfigId?.condition?.find(
          (c) => c._id.toString() === item.condition,
        );

        return {
          ...rest,
          selectedRiskType: selectedRiskType
            ? {
                name: selectedRiskType.name,
                createdAt: selectedRiskType.createdAt,
                updatedAt: selectedRiskType.updatedAt,
              }
            : null,
          selectedCondition: selectedCondition
            ? {
                name: selectedCondition.name,
                createdAt: selectedCondition.createdAt,
                updatedAt: selectedCondition.updatedAt,
              }
            : null,
          createdByUser: userMap?.get(item.createdBy) || null,
          // reviewedByUser: workflow?.reviewedBy
          //   ? userMap.get(workflow.reviewedBy)
          //   : null,
          // approvedByUser: workflow?.approvedBy
          //   ? userMap.get(workflow.approvedBy)
          //   : null,
          reviewers:
            workflow?.reviewers?.map((id: any) => userMap.get(id)) || [],
          approvers:
            workflow?.approvers?.map((id: any) => userMap.get(id)) || [],
          areaDetails: areaMap.get(item?.area) ? areaMap.get(item?.area) : '',
          entityDetails: entityMap.get(item?.entityId) || '',
          sectionDetails: sectionMap.get(item?.section)
            ? sectionMap.get(item?.section)
            : '',
          comments: workflow?.comments || [],
          cycle: !!cycleWorkflow ? cycleWorkflow?.cycleNumber : 0,
          workflowStatus: !!cycleWorkflow ? cycleWorkflow?.status : 'active',
        };
      });

      // console.log('finalList length-->', finalList.length);
      this.logger.log(
        `trace id=${uuid()}, GET 'api/risk-register/getAllHiraTableDataBasedOnFilter payload query ${query} success`,
        '',
      );

      return {
        data: finalList,
        total: uniqueRecords.length,
      };
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/getAllHiraTableDataBasedOnFilter payload query ${query} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async fetchStatusCountsByEntity(orgId: string, query: any) {
    try {
      const results = await this.hiraRegisterModel.aggregate([
        {
          $match: {
            organizationId: orgId, // Matching organization ID
          },
        },
        {
          $sort: { jobTitle: 1, revisionNumber: -1 },
        },
        {
          $group: {
            _id: '$jobTitle',
            doc: { $first: '$$ROOT' },
          },
        },
        {
          $replaceRoot: { newRoot: '$doc' },
        },
        {
          $group: {
            _id: '$entityId',
            total: {
              $sum: {
                $cond: [
                  { $ne: ['$status', 'archived'] }, // Only sum if status is not 'archived'
                  1,
                  0,
                ],
              },
            },
            inWorkflow: {
              $sum: {
                $cond: {
                  if: {
                    $in: [
                      '$workflowStatus',
                      ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'],
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
            DRAFT: {
              $sum: {
                $cond: [{ $eq: ['$workflowStatus', 'DRAFT'] }, 1, 0],
              },
            },
            APPROVED: {
              $sum: {
                $cond: [{ $eq: ['$workflowStatus', 'APPROVED'] }, 1, 0],
              },
            },
            locationId: { $first: '$locationId' }, // Assuming all documents have the same locationId per entityId
            section: { $first: '$section' },
          },
        },
      ]);

      const sectionQueryResult = await this.hiraRegisterModel.aggregate([
        {
          $match: {
            organizationId: orgId, // Matching organization ID
          },
        },
        {
          $sort: { jobTitle: 1, revisionNumber: -1 },
        },
        {
          $group: {
            _id: '$jobTitle',
            doc: { $first: '$$ROOT' }, // Get the document with the highest revision number for each unique jobTitle
          },
        },
        {
          $replaceRoot: { newRoot: '$doc' }, // Replace the grouped document with the one containing all relevant fields
        },
        {
          $group: {
            _id: '$section', // Grouping by section instead of locationId
            total: {
              $sum: {
                $cond: [
                  { $ne: ['$status', 'archived'] }, // Only sum if status is not 'archived'
                  1,
                  0,
                ],
              },
            },
            inWorkflow: {
              $sum: {
                $cond: {
                  if: {
                    $in: [
                      '$workflowStatus',
                      ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'],
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
            DRAFT: {
              $sum: {
                $cond: [{ $eq: ['$workflowStatus', 'DRAFT'] }, 1, 0],
              },
            },
            APPROVED: {
              $sum: {
                $cond: [{ $eq: ['$workflowStatus', 'APPROVED'] }, 1, 0],
              },
            },
            section: { $first: '$section' }, // Preserving the section in the grouped results
            // jobTitle: { $first: '$jobTitle' }, // Including the jobTitle in the results
          },
        },
      ]);

      // console.log('sectionQueryResult', sectionQueryResult);

      let sectionSet: any = new Set();
      let sectionArray: any = [];

      // console.log("results", results);
      if (results?.length) {
        let entityIdSet: any = new Set();
        let locationIdSet: any = new Set();
        // let sectionSet: any = new Set();
        results.forEach((item) => {
          entityIdSet.add(item._id);
          locationIdSet.add(item.locationId);
        });

        if (sectionQueryResult?.length) {
          sectionQueryResult.forEach((item) => {
            sectionSet.add(item._id);
          });
        }

        // entityIdSet?.add(null);

        const entityArray: any = Array.from(entityIdSet)?.filter(
          (item) => item !== null && item !== undefined,
        );
        const locationArray: any = Array.from(locationIdSet)?.filter(
          (item) => item !== null && item !== undefined,
        );
        sectionArray = Array.from(sectionSet)?.filter(
          (item) => item !== null && item !== undefined,
        );

        const [entities, locations, sections, entitiesForSections] =
          await Promise.all([
            this.prisma.entity.findMany({
              where: {
                id: { in: entityArray },
              },
              select: {
                id: true,
                entityName: true,
              },
            }),
            this.prisma.location.findMany({
              where: {
                id: { in: locationArray },
              },
              select: {
                id: true,
                locationName: true,
              },
            }),
            this.prisma.section.findMany({
              where: {
                id: { in: sectionArray },
              },
              select: {
                id: true,
                name: true,
              },
            }),
            this.prisma.entity.findMany({
              where: {
                sections: {
                  hasSome: sectionArray,
                },
              },
              select: {
                id: true,
                entityName: true,
                sections: true,
              },
            }),
          ]);

        // console.log("entitiesForSections", entitiesForSections);
        // console.log("section names array", sections);

        const entityMap = new Map(
          entities.map((entity) => [entity.id, entity]),
        );
        const locationMap = new Map(
          locations.map((location) => [location.id, location]),
        );
        const sectionMap = new Map(
          sections.map((section) => [section.id, section]),
        );

        // Populate entityName in sectionQueryResult based on section matching in entitiesForSections
        const entitySectionQueryResult = sectionQueryResult.map((item) => {
          const matchedEntity = entitiesForSections.find((entity) =>
            entity.sections.includes(item.section),
          );
          return {
            ...item,
            entityName: matchedEntity ? matchedEntity.entityName : '',
            sectionName: sectionMap.get(item._id)?.name || '',
          };
        });

        // console.log("entitySectionQueryResult", entitySectionQueryResult);

        const formattedResultArray = results.map((item) => ({
          ...item,
          entityId: item._id,
          locationName: locationMap.get(item.locationId)?.locationName || '',
          entityName: entityMap.get(item._id)?.entityName || '',
          // sectionName: sectionMap.get(item?.section)?.name || '',
        }));

        // Sorting the array by locationName
        const sortedResults = formattedResultArray.sort((a, b) =>
          a.locationName.localeCompare(b.locationName),
        );
        this.logger.log(
          `trace id=${uuid()}, GET 'api/risk-register/fetchStatusCountsByEntity payload query ${query} success`,
          '',
        );
        return {
          mainTableResult: sortedResults,
          sectionResults: entitySectionQueryResult,
        };
      } else {
        return [];
      }
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/fetchStatusCountsByEntity payload query ${query} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async fetchOverallStatusCounts(orgId: string, query: any) {
    try {
      console.log('qyeruuuuu--->', query);
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
      if (query?.isPrimaryFilter) {
        console.log('PRIMARY FILTER APPPLIED---------');
        let whereConditionForSignificantSteps: any = {
          status: 'active',
          deleted: false,
          organizationId: orgId,
          preMitigationScore: { $gte: 8 },
        };

        let whereCondition: any = {
          organizationId: orgId, // Matching organization ID
          status: 'active',
        };
        let whereConditionForCurrentYear: any = {
          organizationId: orgId,
          // createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
        };
        if (!!query?.entity?.length) {
          whereCondition.entityId = { $in: query.entity };
          whereConditionForSignificantSteps.entityId = { $in: query.entity };
          whereConditionForCurrentYear.entityId = { $in: query.entity };
        }
        if (!!query?.unit?.length) {
          whereCondition.locationId = { $in: query.unit };
          whereConditionForSignificantSteps.locationId = { $in: query.unit };
          whereConditionForCurrentYear.locationId = { $in: query.unit };
        }
        if (!!query?.fromDate && !!query?.toDate) {
          whereCondition.createdAt = {
            $gte: new Date(query.fromDate),
            $lt: new Date(query.toDate),
          };
          whereConditionForSignificantSteps.createdAt = {
            $gte: new Date(query.fromDate),
            $lt: new Date(query.toDate),
          };
          whereConditionForCurrentYear = {
            ...whereConditionForCurrentYear,
            // createdAt: {
            //   $gte: new Date(query.fromDate),
            //   $lt: new Date(query.toDate),
            // },
          };
        }

        const resultsForTotalSteps = await this.hiraStepsModel.countDocuments({
          ...whereCondition,
        });
        const resultsForInWorkflowHira = await this.hiraModel.countDocuments({
          ...whereCondition,
          workflowStatus: { $in: ['IN_REVIEW', 'IN_APPROVAL', 'REJECTED'] },
        });

        const resultsForTotalCurrentYearHira =
          await this.hiraModel.countDocuments({
            ...whereConditionForCurrentYear,
          });

        const totalSignificantSteps = await this.hiraStepsModel.countDocuments({
          ...whereConditionForSignificantSteps,
        });

        const formattedResult = {
          totalSteps: resultsForTotalSteps,
          inWorkflowHira: resultsForInWorkflowHira,
          totalHiraTillDate: resultsForTotalCurrentYearHira,
          totalSignificantSteps,
        };

        this.logger.log(
          `trace id=${uuid()}, GET 'api/risk-register/fetchOverallStatusCounts payload query ${query} success`,
          '',
        );
        return formattedResult;
      } else {
        console.log('DEFAULT FILTER APPLIED');
        let entityQueryForTotalAndInWorkflow: any = {
          organizationId: orgId,
          entityId: query?.entity[0],
        };
        let entityQueryForCurrentYear: any = {
          organizationId: orgId,
          entityId: query?.entity[0],
          // createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
        };
        let entityQueryForSignificantSteps: any = {
          status: 'active',
          entityId: query?.entity[0],
          preMitigationScore: { $gte: 8 },
          organizationId: orgId,
        };

        let locationQueryForTotalAndInWorkflow: any = {
          organizationId: orgId,
          locationId: query?.unit[0],
        };
        let locationQueryForCurrentYear: any = {
          organizationId: orgId,
          locationId: query?.unit[0],
          // createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
        };
        let locationQueryForSignificantSteps: any = {
          status: 'active',
          locationId: query?.unit[0],
          preMitigationScore: { $gte: 8 },
          organizationId: orgId,
        };
        const resultsForTotalAndInWorkflowEntityWise =
          await this.hiraRegisterModel.aggregate([
            {
              $match: {
                ...entityQueryForTotalAndInWorkflow,
              },
            },
            {
              $sort: { jobTitle: 1, revisionNumber: -1 },
            },
            {
              $group: {
                _id: '$jobTitle',
                doc: { $first: '$$ROOT' },
              },
            },
            {
              $replaceRoot: { newRoot: '$doc' },
            },
            {
              $group: {
                _id: null, // Grouping all documents together
                total: { $sum: 1 },
                inWorkflow: {
                  $sum: {
                    $cond: {
                      if: {
                        $in: ['$workflowStatus', ['IN_REVIEW', 'IN_APPROVAL']],
                      },
                      then: 1,
                      else: 0,
                    },
                  },
                },
              },
            },
          ]);

        const resultsForCurrentYearEntityWise =
          await this.hiraRegisterModel.aggregate([
            {
              $match: {
                ...entityQueryForCurrentYear,
                // createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
              },
            },
            {
              $sort: { jobTitle: 1, revisionNumber: -1 },
            },
            {
              $group: {
                _id: '$jobTitle',
                doc: { $first: '$$ROOT' },
              },
            },
            {
              $replaceRoot: { newRoot: '$doc' },
            },
            {
              $group: {
                _id: null, // Grouping all documents together
                total: { $sum: 1 },
              },
            },
          ]);
        const resultsForTotalAndInWorkflowLocationWise =
          await this.hiraRegisterModel.aggregate([
            {
              $match: {
                ...locationQueryForTotalAndInWorkflow,
              },
            },
            {
              $sort: { jobTitle: 1, revisionNumber: -1 },
            },
            {
              $group: {
                _id: '$jobTitle',
                doc: { $first: '$$ROOT' },
              },
            },
            {
              $replaceRoot: { newRoot: '$doc' },
            },
            {
              $group: {
                _id: null, // Grouping all documents together
                total: { $sum: 1 },
                inWorkflow: {
                  $sum: {
                    $cond: {
                      if: {
                        $in: ['$workflowStatus', ['IN_REVIEW', 'IN_APPROVAL']],
                      },
                      then: 1,
                      else: 0,
                    },
                  },
                },
              },
            },
          ]);
        const resultsForCurrentYearLocationWise =
          await this.hiraRegisterModel.aggregate([
            {
              $match: {
                ...locationQueryForCurrentYear,
                // createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
              },
            },
            {
              $sort: { jobTitle: 1, revisionNumber: -1 },
            },
            {
              $group: {
                _id: '$jobTitle',
                doc: { $first: '$$ROOT' },
              },
            },
            {
              $replaceRoot: { newRoot: '$doc' },
            },
            {
              $group: {
                _id: null, // Grouping all documents together
                total: { $sum: 1 },
              },
            },
          ]);

        const totalSignificantStepsEntityWise =
          await this.hiraRegisterModel.countDocuments({
            ...entityQueryForSignificantSteps,
          });
        const totalSignificantStepsLocationWise =
          await this.hiraRegisterModel.countDocuments({
            ...locationQueryForSignificantSteps,
          });

        // if (results?.length) {
        const formattedResult = {
          totalEntityWise:
            resultsForTotalAndInWorkflowEntityWise[0]?.total || 0,
          totalLocationWise:
            resultsForTotalAndInWorkflowLocationWise[0]?.total || 0,
          inWorkflowEntityWise:
            resultsForTotalAndInWorkflowEntityWise[0]?.inWorkflow || 0,
          inWorkflowLocationWise:
            resultsForTotalAndInWorkflowLocationWise[0]?.inWorkflow || 0,
          totalCurrentYearEntityWise:
            resultsForCurrentYearEntityWise[0]?.total || 0,
          totalCurrentYearLocationWise:
            resultsForCurrentYearLocationWise[0]?.total || 0,
          totalSignificantStepsEntityWise,
          totalSignificantStepsLocationWise,
        };

        this.logger.log(
          `trace id=${uuid()}, GET 'api/risk-register/fetchOverallStatusCounts payload query ${query} success`,
          '',
        );
        return formattedResult;
      }
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/fetchOverallStatusCounts payload query ${query} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }
  async fetchAllHiraSecondaryFilter(orgId: any, query: any) {
    try {
      const { entityId, locationId, page = 1, pageSize = 10 } = query;

      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);

      // Base query setup considering the createdAt within the current year
      let baseQuery: any = {
        organizationId: orgId,
        status: { $in: ['inWorkflow', 'active'] },
      };

      if (!!entityId) {
        baseQuery.entityId = entityId;
      }

      if (!!locationId) {
        baseQuery.locationId = locationId;
      }

      // if (query?.steps) {
      //   baseQuery.subStepNo = 1.1;
      // }

      if (query?.total) {
        baseQuery = baseQuery;
      }

      if (query?.new) {
        baseQuery = {
          ...baseQuery,
          createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
        };
      }

      if (query?.significant) {
        baseQuery = {
          ...baseQuery,
          preMitigationScore: { $gte: 8 },
        };
      }

      // console.log('baseQuery', baseQuery);

      const allRecords = await this.hiraRegisterModel
        .find(baseQuery)
        .populate('hiraConfigId')
        .sort({ updatedAt: -1 }) // Sorting in descending order by createdAt
        .lean();

      const uniqueRecordsMap = new Map();
      allRecords.forEach((record) => {
        if (!uniqueRecordsMap.has(record.jobTitle)) {
          uniqueRecordsMap.set(record.jobTitle, record);
        }
      });

      const uniqueRecords = Array.from(uniqueRecordsMap.values());
      const startIndex = (page - 1) * pageSize;
      const paginatedRecords = uniqueRecords.slice(
        startIndex,
        startIndex + pageSize,
      );

      const userIds = new Set();
      const areaIds = new Set();
      const entityIds = new Set();
      const sectionIds = new Set();
      uniqueRecords.forEach((record) => {
        if (record.createdBy) {
          userIds.add(record.createdBy);
        }
        if (record?.area) {
          areaIds.add(record?.area);
        }
        if (record?.entityId) {
          entityIds.add(record?.entityId);
        }
        if (record?.section) {
          sectionIds.add(record?.section);
        }
      });

      // console.log("checkrisknew section IDS-->", sectionIds);

      const uniqueJobTitles = new Set(
        uniqueRecords.map((record: any) => record.jobTitle),
      );

      // console.log('checkrisk unique job titles', uniqueJobTitles);

      const consolidatedEntries = await this.hiraConsolidatedStatusModel
        .find({
          jobTitle: { $in: Array.from(uniqueJobTitles) },
          organizationId: orgId,
        })
        .lean();
      consolidatedEntries.forEach((entry: any) => {
        if (entry?.reviewers?.length) {
          entry.reviewers.forEach((id) => userIds.add(id));
        }
        if (entry?.approvers?.length) {
          entry.approvers.forEach((id) => userIds.add(id));
        }
      });

      // Fetch user details for all collected user IDs
      let users, entityDetails, sectionDetails;
      if (Array.from(userIds).length) {
        users = await this.prisma.user.findMany({
          where: {
            id: { in: Array.from(userIds) as any },
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
      if (Array.from(sectionIds).length) {
        sectionDetails = await this.prisma.section.findMany({
          where: {
            id: { in: Array.from(sectionIds) as any },
          },
          select: {
            id: true,
            name: true,
          },
        });
      }

      // console.log("sectionDetails --->", sectionDetails);

      const areaMaster = await this.hiraAreaMasterModel
        .find({
          id: { $in: Array.from(areaIds) as any },
        })
        .select('id name');

      // console.log("check area master ---", areaMaster);

      const userMap = new Map(users?.map((user) => [user?.id, user]));
      // console.log("user map", userMap);

      const areaMap = new Map(areaMaster?.map((area) => [area?.id, area]));

      const entityMap = new Map(
        entityDetails?.map((entity) => [entity.id, entity]),
      );

      const sectionMap = new Map(
        sectionDetails?.map((section) => [section.id, section]),
      );

      // console.log("area map ", areaMap);

      const jobTitleToWorkflowMap = new Map();
      const jobTitleToNestedWorkflowMap = new Map();
      consolidatedEntries?.forEach((entry: any) => {
        jobTitleToWorkflowMap?.set(entry.jobTitle, entry);

        if (entry.workflow && entry.workflow.length > 0) {
          const latestWorkflow = entry.workflow.reduce(
            (prev: any, current: any) => {
              return prev.cycleNumber > current.cycleNumber ? prev : current;
            },
          );
          // console.log('latestWorkflow', latestWorkflow);
          jobTitleToNestedWorkflowMap.set(entry.jobTitle, latestWorkflow);
          // console.log('entry to create map', entry);
        }

        // }
      });

      let finalList = paginatedRecords?.map((item) => {
        const { hiraConfigId, ...rest } = item; // Exclude hiraConfigId from the output
        const workflow = jobTitleToWorkflowMap?.get(item.jobTitle);
        const cycleWorkflow = jobTitleToNestedWorkflowMap.get(item.jobTitle);
        // console.log("workflow", workflow);

        const selectedRiskType = hiraConfigId?.riskType?.find(
          (rt) => rt._id.toString() === item.riskType,
        );
        const selectedCondition = hiraConfigId?.condition?.find(
          (c) => c._id.toString() === item.condition,
        );

        return {
          ...rest,
          selectedRiskType: selectedRiskType
            ? {
                name: selectedRiskType.name,
                createdAt: selectedRiskType.createdAt,
                updatedAt: selectedRiskType.updatedAt,
              }
            : null,
          selectedCondition: selectedCondition
            ? {
                name: selectedCondition.name,
                createdAt: selectedCondition.createdAt,
                updatedAt: selectedCondition.updatedAt,
              }
            : null,
          createdByUser: userMap?.get(item.createdBy) || null,
          reviewers:
            workflow?.reviewers?.map((id: any) => userMap.get(id)) || [],
          approvers:
            workflow?.approvers?.map((id: any) => userMap.get(id)) || [],
          areaDetails: areaMap.get(item?.area) ? areaMap.get(item?.area) : '',
          entityDetails: entityMap.get(item?.entityId) || '',
          sectionDetails: sectionMap.get(item?.section)
            ? sectionMap.get(item?.section)
            : '',
          comments: workflow?.comments || [],
          cycle: !!cycleWorkflow ? cycleWorkflow?.cycleNumber : 0,
          status: !!cycleWorkflow ? cycleWorkflow?.status : 'active',
        };
      });
      this.logger.log(
        `trace id=${uuid()}, GET 'api/risk-register/fetchAllHiraSecondaryFilter payload query ${query} success`,
        '',
      );
      return {
        data: finalList,
        total: uniqueRecords.length,
      };
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/fetchAllHiraSecondaryFilter payload query ${query} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getSignificantHiraGraphData(query) {
    try {
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
      const currentYearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
      let whereCondition: any = {
        status: { $in: ['active', 'inWorkflow'] },
        deleted: false,
        organizationId: query?.organizationId,
        preMitigationScore: { $gte: 8 },
      };
      if (query?.isPrimaryFilter) {
        whereCondition = {
          ...whereCondition,
          // entityId: { $in: query?.entity },
          // locationId: { $in: query?.unit },
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
      } else {
        if (!!query?.entityId) {
          whereCondition.entityId = query?.entityId;
        }

        if (!!query?.locationId) {
          whereCondition.locationId = query?.locationId;
        }
        // if (query?.steps) {
        //   whereCondition.subStepNo = 1.1;
        // }

        if (query?.total) {
          whereCondition = whereCondition;
        }

        if (query?.new) {
          whereCondition = {
            ...whereCondition,
            createdAt: { $gte: currentYearStart, $lt: currentYearEnd },
          };
        }

        if (query?.significant) {
          whereCondition = {
            ...whereCondition,
            preMitigationScore: { $gte: 8 },
          };
        }
      }

      // Fetch data from the database
      const records = await this.hiraRegisterModel
        .find(whereCondition)
        .select('jobBasicStep preMitigationScore postMitigationScore')
        .lean();

      // Structure data for the graph
      const graphData = records.map((record) => ({
        jobBasicStep: record.jobBasicStep,
        preMitigationScore: record.preMitigationScore,
        postMitigationScore: record.postMitigationScore,
      }));
      this.logger.log(
        `trace id=${uuid()}, GET 'api/risk-register/getSignificantHiraGraphData payload query ${query} success`,
        '',
      );
      return graphData;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET 'api/risk-register/getSignificantHiraGraphData payload query ${query} failed with error ${error} `,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async deleteJob(query: any): Promise<any> {
    try {
      // console.log('query', query);

      const cycle = query?.cycle ? parseInt(query.cycle) : 0;
      const status = query?.status;
      // console.log('cycle', cycle);

      // Construct the query filter
      const queryFilter = {
        jobTitle: query.jobTitle,
        entityId: query.entityId,
        organizationId: query.orgId,
      };
      // console.log('queryFilter', queryFilter);

      if (cycle === 0) {
        if (status === 'active') {
          // console.log('inside cycle 0 in draft status');
          const deleteFromHiraRegister =
            await this.hiraRegisterModel.deleteMany(queryFilter);
          this.logger.log(
            `trace id=${uuid()}, DELETE 'api/risk-register/deleteJob payload query ${query} success  `,
            '',
          );
        } else if (
          status === 'IN_REVIEW' ||
          status === 'IN_APPROVAL' ||
          status === 'REJECTED' ||
          status === 'APPROVED'
        ) {
          // console.log('inside cycle 0 in workflow status');
          const deleteFromHiraRegister =
            await this.hiraRegisterModel.deleteMany(queryFilter);
          const deleteEntryFromConsolidated =
            await this.hiraConsolidatedStatusModel.deleteMany({
              jobTitle: query.jobTitle,
              organizationId: query.orgId,
            });
          this.logger.log(
            `trace id=${uuid()}, DELETE 'api/risk-register/deleteJob payload query ${query} success  `,
            '',
          );
        }
      } else if (cycle >= 1) {
        if (status === 'active') {
          // console.log('inside cycle >=1 in draft status');
          const deleteFromHiraRegister =
            await this.hiraRegisterModel.deleteMany({
              ...queryFilter,
              revisionNumber: cycle,
            });
          // console.log('Number of documents deleted:', deleteFromHiraRegister);
          const rowsToCopy = await this.hiraRegisterModel.find({
            ...queryFilter,
            revisionNumber: cycle - 1,
          });
          const newRows = rowsToCopy.map((row: any) => {
            const currentRevision = row?.revisionNumber || 0; // Get the current revision number, default to 0 if it's not set
            const newRow = {
              ...row.toObject(),
              revisionNumber: currentRevision + 1, // Increment the revision number
              status: 'active',
              workflowStatus: 'DRAFT', //newly added 7june
            }; // Use toObject() method,
            delete newRow._id; // Ensure the new row gets a new ID
            return newRow;
          });
          // Insert new rows back into the hiraRegisterModel
          const insertResult = await this.hiraRegisterModel.insertMany(newRows);
          this.logger.log(
            `trace id=${uuid()}, DELETE 'api/risk-register/deleteJob payload query ${query} success  `,
            '',
          );
        } else if (
          status === 'IN_REVIEW' ||
          status === 'IN_APPROVAL' ||
          status === 'REJECTED' ||
          status === 'APPROVED'
        ) {
          // console.log('inside cycle >=1 in workflow status');
          const deleteFromHiraRegister =
            await this.hiraRegisterModel.deleteMany({
              ...queryFilter,
              revisionNumber: cycle,
            });
          // console.log('Number of documents deleted:', deleteFromHiraRegister);

          const rowsToCopy = await this.hiraRegisterModel.find({
            ...queryFilter,
            revisionNumber: cycle - 1,
          });
          const newRows = rowsToCopy.map((row: any) => {
            const currentRevision = row?.revisionNumber || 0; // Get the current revision number, default to 0 if it's not set
            const newRow = {
              ...row.toObject(),
              revisionNumber: currentRevision + 1, // Increment the revision number
              status: 'active',
              workflowStatus: 'APPROVED', //newly added 7june
            }; // Use toObject() method,
            delete newRow._id; // Ensure the new row gets a new ID
            return newRow;
          });
          // Insert new rows back into the hiraRegisterModel
          const insertResult = await this.hiraRegisterModel.insertMany(newRows);
          // console.log('insertResult', insertResult);
          const deleteEntryFromConsolidated =
            await this.hiraConsolidatedStatusModel.updateOne(
              { jobTitle: query.jobTitle, organizationId: query.orgId },
              {
                $pull: { workflow: { cycleNumber: cycle } }, //wi
                $set: { status: 'APPROVED' },
              },
            );
          this.logger.log(
            `trace id=${uuid()}, DELETE 'api/risk-register/deleteJob payload query ${query} success  `,
            '',
          );
          return deleteFromHiraRegister;
        }
      }
    } catch (err) {
      this.logger.error(
        `trace id=${uuid()}, DELETE 'api/risk-register/deleteJob payload query ${query} failed with error ${err} `,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async changeReviewersApprovers(body: any, hiraId: string) {
    const traceId = uuid();
    this.logger.debug(
      `traceId=${traceId} - Starting changeReviewersApprovers`,
      JSON.stringify({ hiraId, reviewersCount: body?.reviewers?.length, approversCount: body?.approvers?.length }),
    );
    
    try {
      // Input validation
      if (!hiraId || !body) {
        throw new Error(
          'Invalid input: HIRA ID, body, or targetCycleNumber is missing',
        );
      }
      const { reviewers, approvers, updatedBy } = body;

      const existingHira = await this.hiraModel
        .findOne({
          _id: hiraId,
        })
        .select('currentVersion');
      const targetCycleNumber = existingHira.currentVersion + 1;

      // Validate required fields
      if (!reviewers?.length || !approvers?.length || !updatedBy) {
        throw new Error(
          'Missing required fields: reviewers, approvers, or updatedBy',
        );
      }

      // Update reviewers and approvers for the specific workflow cycle
      const updatedResult = await this.hiraModel.findOneAndUpdate(
        { _id: hiraId, 'workflow.cycleNumber': targetCycleNumber },
        {
          $set: {
            'workflow.$.reviewers': reviewers.map((item: any) => item.id),
            'workflow.$.approvers': approvers.map((item: any) => item.id),
          },
          $push: {
            'workflow.$.workflowHistory': {
              action: 'Reviewers and Approvers Changed By IMSC',
              by: updatedBy,
              datetime: new Date(),
            },
          },
        },
        { new: true }, // Return the updated document
      );

      // Check if the update was successful
      if (!updatedResult) {
        throw new Error(
          `Failed to update reviewers and approvers for cycle number ${targetCycleNumber} in HIRA ID ${hiraId}`,
        );
      }

      return updatedResult;
    } catch (error) {
      console.error('Error in changeReviewersApprovers:', error);
      throw new Error(
        `Unable to replace reviewers and approvers: ${error.message}`,
      );
    }
  }

  async changeApprovers(body: any, hiraId: string) {
    try {
      // Input validation
      if (!hiraId || !body) {
        throw new Error(
          'Invalid input: HIRA ID, body, or targetCycleNumber is missing',
        );
      }
      const { approvers, updatedBy } = body;

      const existingHira = await this.hiraModel
        .findOne({
          _id: hiraId,
        })
        .select('currentVersion');
      const targetCycleNumber = existingHira.currentVersion + 1;

      // Validate required fields
      if (!approvers?.length || !updatedBy) {
        throw new Error('Missing required fields:  approvers, or updatedBy');
      }

      // Update reviewers and approvers for the specific workflow cycle
      const updatedResult = await this.hiraModel.findOneAndUpdate(
        { _id: hiraId, 'workflow.cycleNumber': targetCycleNumber },
        {
          $set: {
            'workflow.$.approvers': approvers.map((item: any) => item.id),
          },
          $push: {
            'workflow.$.workflowHistory': {
              action: 'Approvers Changed By IMSC',
              by: updatedBy,
              datetime: new Date(),
            },
          },
        },
        { new: true }, // Return the updated document
      );

      // Check if the update was successful
      if (!updatedResult) {
        throw new Error(
          `Failed to update approvers for cycle number ${targetCycleNumber} in HIRA ID ${hiraId}`,
        );
      }

      return updatedResult;
    } catch (error) {
      console.error('Error in changeApprovers:', error);
      throw new Error(
        `Unable to replace reviewers and approvers: ${error.message}`,
      );
    }
  }
}
