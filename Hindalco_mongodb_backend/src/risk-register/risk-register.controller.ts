import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Inject,
  // Res,
} from '@nestjs/common';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { AbilityGuard } from 'src/ability/ability.guard';
import { checkAbilities } from 'src/ability/abilities.decorator';
import { Action } from 'src/ability/ability.factory';
import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express/multer';
import { RiskRegisterService } from './risk-register.service';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { Logger } from 'winston';
import { extname } from 'path';
import { CreateHiraDto } from './dto/create-hira.dto';
import { CreateHiraStepsDto } from './dto/create-hiraStep.dto';
import { UpdateHiraDto } from './dto/update-hira.dto';
const fs = require('fs');

@Controller('/api/riskregister')
export class RiskRegisterController {
  constructor(
    private readonly riskRegisterService: RiskRegisterService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  @UseGuards(AuthenticationGuard)
  @Post('/hira-register/uploadattachement')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          let locationName;
          const realmName = req.query.realm.toLowerCase();
          if (req.query.locationName) {
            locationName = req.query.locationName;
          } else {
            locationName = 'NoLocation';
          }
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/riskAttachments`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }
          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const randomName: string = uuid();
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // You can implement a file filter logic here if needed
        // For example, to reject certain file types
        cb(null, true);
      },
    }),
  )
  addAttachMentForAudit(
    @UploadedFiles() file: Express.Multer.File[],
    @Req() req,
  ) {
    return this.riskRegisterService.uploadsAttachment(file, req.query);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'RISK_REGISTER' })
  @Delete('/hira-register/deleteJob')
  deleteJob(@Query() query: any) {
    console.log('in delete risk controller');
    return this.riskRegisterService.deleteJob(query);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/hira-register/getAllHiraTableDataBasedOnFilter/:orgId')
  getAllHiraTableDataBasedOnFilter(
    @Param('orgId') orgId: any,
    @Query() query: any,
  ) {
    //////console.log('in find all risk controller');
    return this.riskRegisterService.getAllHiraTableDataBasedOnFilter(
      orgId,
      query,
    );
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/hira-register/fetchStatusCountsByEntity/:orgId')
  fetchStatusCountsByEntity(@Param('orgId') orgId: any, @Query() query: any) {
    //////console.log('in find all risk controller');
    return this.riskRegisterService.fetchStatusCountsByEntity(orgId, query);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/hira-register/fetchOverallStatusCounts/:orgId')
  fetchOverallStatusCounts(@Param('orgId') orgId: any, @Query() query: any) {
    //////console.log('in find all risk controller');
    return this.riskRegisterService.fetchOverallStatusCounts(orgId, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getHiraRiskLevelGraphData')
  getHiraRiskLevelGraphData(@Req() req: any, @Query() query) {
    return this.riskRegisterService.getHiraRiskLevelGraphData(query);
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({}) }))
  @Post('/validateImport')
  async validateImport(@UploadedFile() file, @Req() req) {
    console.log('file', file);
    return await this.riskRegisterService.validateImport(file, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({}) }))
  @Post('/import')
  async importUser(@UploadedFile() file, @Req() req, @Body() body: any) {
    console.log('file', file);
    return await this.riskRegisterService.import(file, req.user.id, body);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/hira-register/getAllWorkflowHira')
  fetchRevisionHistory(
    @Query() query: any,
    // @Param('orgId') orgId: any,
    // @Param() entityId: any,
  ) {
    //////console.log('in find all risk controller');
    return this.riskRegisterService.fetchRevisionHistory(
      query,
      // entityId,
    );
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/getuserlist')
  getAllUser(@Query() query: any, @Req() req) {
    return this.riskRegisterService.getAllUser(query, req.user.id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Post('/hira-register')
  create(@Body() body: any, @Req() req: any) {
    //////console.log('in post risk data', data);
    return this.riskRegisterService.create(body, req);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/hira-register/all/:jobTitle')
  findAll(@Param('jobTitle') jobTitle: any, @Query() query: any, @Req() req) {
    // ////////////console.log('in find all risk controller');
    return this.riskRegisterService.findAll(jobTitle, query, req.user.id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/hira-register/:id')
  findOne(@Param('id') id: string) {
    // ////////////console.log('in find one risk controller');
    return this.riskRegisterService.findOne(id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'RISK_REGISTER' })
  @Put('/hira-register/:id')
  update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    // ////////////console.log('in update risk controller');
    return this.riskRegisterService.update(id, data, req.user.id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'RISK_REGISTER' })
  @Delete('/hira-register/:id')
  delete(@Param('id') id: string) {
    // ////////////////console.log('in delete risk controller');
    return this.riskRegisterService.delete(id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'RISK_REGISTER' })
  @Patch('/close/:id')
  closeRisk(@Param('id') id: string) {
    // ////////////////console.log('in delete risk controller');
    return this.riskRegisterService.closeRisk(id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Post('/addmitigation')
  addMitigation(@Body() data: any, @Req() req: any) {
    return this.riskRegisterService.addMitigation(data, req.user.id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'RISK_REGISTER' })
  @Put('/updatemitigation/:id')
  updateMitigation(
    @Body() data: any,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.riskRegisterService.updateMitigation(id, data, req.user.id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Post('/addcomment')
  addComment(@Body() data: any, @Req() req: any) {
    return this.riskRegisterService.addComment(data, req.user.id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/getallcomments/:riskId')
  findCommentById(@Param('riskId') riskId: string) {
    // ////////////////console.log('in find one risk controller');
    return this.riskRegisterService.findAllCommentsByRiskId(riskId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Patch('/updatereviewers/:riskId')
  UpdateReviewersAndSendMail(
    @Param('riskId') riskId: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    // ////////////////console.log('in find one risk controller');
    return this.riskRegisterService.updateReviewers(riskId, data, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  // @Get('/users/:locationId')
  @Get('/users/:orgId')
  getAllUsersByLocation(@Param('orgId') orgId: string) {
    // ////////console.log('in find one risk controller');
    return this.riskRegisterService.findAllUsersByLocation(orgId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Post('/addcommentsbulk')
  addCommentsBulk(@Body() data: any[], @Req() req: any) {
    return this.riskRegisterService.addCommentsBulk(data, req.user.id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/hira-register/getAllJobTitles/:orgId/:entityId')
  findAllJobTitles(
    @Param('orgId') orgId: any,
    @Param('entityId') entityId: any,
    @Req() req,
  ) {
    //////console.log('in find all risk controller');
    return this.riskRegisterService.getAllJobTitles(orgId, entityId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/hira-register/checkConsolidatedStatus/:jobTitle/:orgId')
  checkConsolidatedStatus(
    @Param('jobTitle') jobTitle: string,
    @Param('orgId') orgId: string,
  ) {
    // ////////////////console.log('in delete risk controller');
    return this.riskRegisterService.checkConsolidatedStatus(jobTitle, orgId);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/hira-register/createConsolidateEntry/:jobTitle/:orgId')
  createConsolidateEntry(
    @Body() body: any,
    @Param('jobTitle') jobTitle: string,
    @Param('orgId') orgId: string,
  ) {
    // ////////////////console.log('in delete risk controller');
    return this.riskRegisterService.createConsolidateEntry(
      body,
      jobTitle,
      orgId,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/hira-register/getHiraInWorkflow/:hiraWorkflowId')
  getHiraInWorkflow(@Param('hiraWorkflowId') hiraWorkflowId: string) {
    // ////////////////console.log('in delete risk controller');
    return this.riskRegisterService.getHiraInWorkflow(hiraWorkflowId);
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/hira-register/updateConsolidatedEntry/:hiraWorkflowId')
  updateConsolidatedEntry(
    @Body() body: any,
    @Param('hiraWorkflowId') hiraWorkflowId: string,
    @Req() req: any,
  ) {
    // ////////////////console.log('in delete risk controller');
    return this.riskRegisterService.updateConsolidatedEntry(
      body,
      hiraWorkflowId,
      req.user.id,
    );
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Post('/hira-register/addmitigation')
  addHiraMitigation(@Body() data: any, @Req() req: any) {
    return this.riskRegisterService.addHiraMitigation(data, req.user.id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'RISK_REGISTER' })
  @Put('/hira-register/updatemitigation/:id')
  updateHiraMitigation(
    @Body() data: any,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.riskRegisterService.updateHiraMitigation(id, data, req.user.id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/hira-register/fetchHiraListwithUniqueJobTitle/:orgId')
  fetchHiraListwithUniqueJobTitle(
    @Param('orgId') orgId: any,
    @Query() query: any,
  ) {
    //////console.log('in find all risk controller');
    return this.riskRegisterService.fetchHiraListwithUniqueJobTitleNew(
      orgId,
      query,
    );
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Post('/hira-register/createReviewHistoryEntry')
  createReviewHistoryEntry(@Body() body: any) {
    //////console.log('in find all risk controller');
    return this.riskRegisterService.createReviewHistoryEntry(body);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/hira-register/fetchReviewHistory/:jobTitle/:orgId')
  fetchReviewHistory(
    @Param('jobTitle') jobTitle: any,
    @Param('orgId') orgId: any,
    // @Param() entityId: any,
  ) {
    //////console.log('in find all risk controller');
    return this.riskRegisterService.fetchReviewHistory(
      jobTitle,
      orgId,
      // entityId,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/hira-register/updateHiraConsolidatedForRejectedHira/:hiraWorkflowId')
  updateHiraConsolidatedForRejectedHira(
    @Body() body: any,
    @Param('hiraWorkflowId') hiraWorkflowId: string,
  ) {
    // ////////////////console.log('in delete risk controller');
    return this.riskRegisterService.updateHiraConsolidatedForRejectedHira(
      body,
      hiraWorkflowId,
    );
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Post('/hira-register/addHiraInChangesTrack')
  createEntryInHiraHistoryTrack(@Body() body: any) {
    //////console.log('in find all risk controller');
    return this.riskRegisterService.createEntryInHiraHistoryTrack(body);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/hira-register/fetchEntryInHiraHistoryTrack/:jobTitle/:orgId')
  fetchEntryInHiraHistoryTrack(
    @Param('jobTitle') jobTitle: any,
    @Param('orgId') orgId: any,
    // @Param() entityId: any,
  ) {
    //////console.log('in find all risk controller');
    return this.riskRegisterService.fetchEntryInHiraHistoryTrack(
      jobTitle,
      orgId,
      // entityId,
    );
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'RISK_REGISTER' })
  @Put('/hira-register/updateHiraHeader/:jobTitle')
  updateHiraHeader(
    @Param('jobTitle') jobTitle: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    // ////////////console.log('in update risk controller');
    return this.riskRegisterService.updateHiraHeader(jobTitle, data, req);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getHiraForInbox')
  getHiraForInbox(@Req() req: any) {
    const randomNumber: string = uuid();
    this.logger.log(
      `trace id=${randomNumber}, GET /api/riskconfig/getHiraForInbox`,
      'riskconfig.controller',
    );
    return this.riskRegisterService.getHiraForInbox(req.user, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/checkIfUserIsMultiDeptHead')
  checkIfUserIsMultiDeptHead(@Req() req: any, @Query() query) {
    return this.riskRegisterService.checkIfUserIsMultiDeptHead(query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getHiraCount')
  getHiraCount(@Req() req: any, @Query() query) {
    return this.riskRegisterService.getHiraCount(query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getHiraGraphData')
  getHiraGraphData(@Req() req: any, @Query() query) {
    return this.riskRegisterService.getHiraGraphData(query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getHiraGraphDataByCondition')
  getHiraGraphDataByCondition(@Req() req: any, @Query() query) {
    return this.riskRegisterService.getHiraGraphDataByCondition(query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getHiraAverageRiskScore')
  getHiraAverageRiskScore(@Req() req: any, @Query() query) {
    return this.riskRegisterService.getHiraAverageRiskScore(query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getTopTenRiskScores')
  getTopTenRiskScores(@Req() req: any, @Query() query) {
    return this.riskRegisterService.getTopTenRiskScores(query);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/hira-register/fetchAllHiraSecondaryFilter/:orgId')
  fetchAllHiraSecondaryFilter(@Param('orgId') orgId: any, @Query() query: any) {
    //////console.log('in find all risk controller');
    return this.riskRegisterService.fetchAllHiraSecondaryFilter(orgId, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getSignificantHiraGraphData')
  getSignificantHiraGraphData(@Req() req: any, @Query() query) {
    return this.riskRegisterService.getSignificantHiraGraphData(query);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Post('/hira-register/insertBulkSteps')
  insertBulkSteps(@Body() body: any, @Req() req: any) {
    //////console.log('in post risk data', data);
    return this.riskRegisterService.insertBulkSteps(body);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Post('/hira/createhiraWithStep')
  createHira(
    @Body()
    body: {
      hira: CreateHiraDto;
      step: CreateHiraStepsDto;
    },
    @Req() req: any,
  ) {
    return this.riskRegisterService.createHiraWithStep(body, req);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Put('/hira/startReviewFirstVersion/:hiraId')
  startReviewFirstVersion(
    @Body() body: any,
    @Param('hiraId') hiraId: any,
    @Req() req: any,
  ) {
    return this.riskRegisterService.startReviewFirstVersion(body, hiraId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Put('/hira/startHiraReviewOfRejectedHira/:hiraId')
  startHiraReviewOfRejectedHira(
    @Body() body: any,
    @Param('hiraId') hiraId: any,
    @Req() req: any,
  ) {
    return this.riskRegisterService.startHiraReviewOfRejectedHira(body, hiraId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Put('/hira/updateWorkflowStatus/:hiraId')
  updateWorkflowStatus(
    @Body() body: any,
    @Param('hiraId') hiraId: any,
    @Req() req: any,
  ) {
    return this.riskRegisterService.updateWorkflowStatus(body, hiraId);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Get('/hira/getHiraWithSteps/:hiraId')
  viewHiraWithSteps(@Param('hiraId') hiraId: string, @Query() query: any) {
    return this.riskRegisterService.viewHiraWithSteps(hiraId, query);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Get('/hira/getArchivedHiraWithSteps/:archivedHiraId')
  getArchivedHiraWithSteps(
    @Param('archivedHiraId') archivedHiraId: string,
    @Query() query: any,
  ) {
    return this.riskRegisterService.getArchivedHiraWithSteps(
      archivedHiraId,
      query,
    );
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Get('/hira/getHiraList/:orgId')
  getHiraList(@Param('orgId') orgId: string, @Query() query: any) {
    return this.riskRegisterService.getHiraList(orgId, query);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Put('/hira/updateHira/:hiraId')
  updateHira(
    @Body() body: UpdateHiraDto,
    @Req() req: any,
    @Param('hiraId') hiraId: string,
  ) {
    return this.riskRegisterService.updateHira(body, req, hiraId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Post('/hira/createHiraStep')
  createHiraStep(@Body() body: CreateHiraStepsDto, @Req() req: any) {
    return this.riskRegisterService.createHiraStep(body, req);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Post('/hira/addHiraStepToHira/:hiraId')
  addHiraStepToHira(
    @Body() body: CreateHiraStepsDto,
    @Req() req: any,
    @Param('hiraId') hiraId: string,
  ) {
    return this.riskRegisterService.addHiraStepToHira(body, req, hiraId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Put('/hira/updateHiraStep/:stepId')
  updateHiraStep(
    @Body() body: CreateHiraStepsDto,
    @Req() req: any,
    @Param('stepId') stepId: string,
  ) {
    return this.riskRegisterService.updateHiraStep(body, req, stepId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'RISK_REGISTER' })
  @Delete('/hira/deleteHira/:hiraId')
  deleteHira(@Param('hiraId') hiraId: string, @Query() query: any) {
    console.log('in delete risk controller');
    return this.riskRegisterService.deleteHira(hiraId, query);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'RISK_REGISTER' })
  @Delete('/hira/hiraStep/:hiraId/:stepId')
  deleteHiraStep(
    @Param('hiraId') hiraId: string,
    @Param('stepId') stepId: string,
  ) {
    console.log('in deleteHiraStep controller');
    return this.riskRegisterService.deleteHiraStep(hiraId, stepId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Get('/hira/getStepsCountByHazardType/:orgId')
  getStepsCountByHazardType(
    @Param('orgId') orgId: string,
    @Query() query: any,
  ) {
    return this.riskRegisterService.getStepsCountByHazardType(orgId, query);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Get('/hira/getHiraCountByCondition/:orgId')
  getHiraCountByCondition(@Param('orgId') orgId: string, @Query() query: any) {
    return this.riskRegisterService.getHiraCountByCondition(orgId, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/hira/getStepsCountByScore/:orgId')
  getStepsCountByScore(@Param('orgId') orgId: string, @Query() query) {
    return this.riskRegisterService.getStepsCountByScore(orgId, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/hira/getTopTenHiraByScore/:orgId')
  getTopTenHiraByScore(@Param('orgId') orgId: string, @Query() query) {
    return this.riskRegisterService.getTopTenHiraByScore(orgId, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/hira/getHiraCountByEntity/:orgId')
  getHiraCountByEntity(@Param('orgId') orgId: string, @Query() query) {
    return this.riskRegisterService.getHiraCountByEntity(orgId, query);
  }


  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/hira/fetchHiraDashboardBoardCounts/:orgId')
  fetchHiraDashboardBoardCounts(
    @Param('orgId') orgId: any,
    @Query() query: any,
  ) {
    //////console.log('in find all risk controller');
    return this.riskRegisterService.fetchHiraDashboardBoardCounts(orgId, query);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/hira/getHiraWithStepsWithFilters/:orgId')
  getHiraWithStepsWithFilters(@Param('orgId') orgId: any, @Query() query: any) {
    //////console.log('in find all risk controller');
    return this.riskRegisterService.getHiraWithStepsWithFilters(orgId, query);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/hira/fetchHiraCountsByEntityAndSection/:orgId')
  fetchHiraCountsByEntityAndSection(
    @Param('orgId') orgId: any,
    @Query() query: any,
  ) {
    //////console.log('in find all risk controller');
    return this.riskRegisterService.fetchHiraCountsByEntityAndSection(
      orgId,
      query,
    );
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Post('/hira/insertBulkSteps')
  importBulkSteps(@Body() body: any, @Req() req: any) {
    //////console.log('in post risk data', data);
    return this.riskRegisterService.insertBulkStepsNew(body);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Put('/hira/changeReviewerApprover/:hiraId')
  changeReviewersApprovers(@Body() body: any, @Param('hiraId') hiraId: string) {
    return this.riskRegisterService.changeReviewersApprovers(body, hiraId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Put('/hira/changeApprover/:hiraId')
  changeApprovers(@Body() body: any, @Param('hiraId') hiraId: string) {
    return this.riskRegisterService.changeApprovers(body, hiraId);
  }
}
