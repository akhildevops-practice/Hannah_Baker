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
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { AbilityGuard } from 'src/ability/ability.guard';
import { checkAbilities } from 'src/ability/abilities.decorator';
import { Action } from 'src/ability/ability.factory';
import { FilesInterceptor } from '@nestjs/platform-express/multer';
import { AspectImpactService } from './aspect-impact.service';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
const fs = require('fs');

@Controller('/api/aspect-impact')
export class AspectImpactController {
  constructor(private readonly aspectImpactService: AspectImpactService) {}

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/getTableDataBasedOnFilters')
  getTableDataBasedOnFilters(@Query() query: any, @Req() req) {
    return this.aspectImpactService.getTableDataBasedOnFilters(query);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/getGroupedImpactDashboard')
  getGroupedImpactDashboard(@Query() query) {
    // console.log('in getGroupedImpactDashboard controller');
    return this.aspectImpactService.getGroupedImpactDashboard(
      query,
      // entityId,
      // orgId,
    );
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/getGroupedAspectDashboard')
  getGroupedAspectDashboard(@Query() query) {
    // console.log('in getTopTenAspImps controller');
    return this.aspectImpactService.getGroupedAspectDashboard(query);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/getTopTenAspImp')
  getTopTenAspImp(@Query() query) {
    // console.log('in getTopTenAspImp controller');
    return this.aspectImpactService.getTopTenAspImp(query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAspImpForInbox')
  getAspImpForInbox(@Req() req) {
    // console.log('getAspimp called');
    return this.aspectImpactService.getAspImpForInbox(req.user);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/getAllWorkflowAspectImpacts')
  fetchRevisionHistory(
    @Query() query: any,
    // @Param('orgId') orgId: any,
    // @Param() entityId: any,
  ) {
    //////console.log('in find all risk controller');
    return this.aspectImpactService.fetchRevisionHistory(
      query,
      // entityId,
    );
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_CONFIG' })
  @Post('/createAspImpConfig')
  createAspImpConfig(@Body() body: any, @Req() req: any) {
    return this.aspectImpactService.createAspImpConfig(body, req);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_CONFIG' })
  @Patch('/updateAspImpConfig/:aspImpConfigId')
  updateAspImpConfig(
    @Body() body: any,
    @Param('aspImpConfigId') aspImpConfigId: string,
    @Req() req,
  ) {
    return this.aspectImpactService.updateAspImpConfig(
      body,
      aspImpConfigId,
      req,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAspImpConfig/:orgId')
  getAspImpConfig(@Param('orgId') orgId: string) {
    return this.aspectImpactService.getAspImpConfig(orgId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getSignificanceConfiguration/:orgId')
  getSignificanceConfiguration(@Param('orgId') orgId: string) {
    return this.aspectImpactService.getSignificanceConfiguration(orgId);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createAspectType')
  createAspectType(@Body() body: any, @Req() req: any) {
    return this.aspectImpactService.createAspectType(body, req);
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/updateAspectType/:aspectTypeId')
  updateAspectType(
    @Body() body: any,
    @Param('aspectTypeId') aspectTypeId: string,
    @Req() req: any,
  ) {
    return this.aspectImpactService.updateAspectType(body, aspectTypeId, req);
  }

  @Delete('/deleteAspectType/:aspectTypeId')
  deleteAspectType(
    @Param('aspectTypeId') aspectTypeId: string,
    @Req() req: any,
  ) {
    return this.aspectImpactService.deleteAspectType(aspectTypeId, req);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAspectTypes')
  getAspectTypes(
    @Req() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query() query: any,
  ) {
    // console.log('hehrhehrehra');
    return this.aspectImpactService.getAspectTypes({
      ...query,
      page,
      pageSize,
    });
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createImpactType')
  createImpactType(@Body() body: any, @Req() req: any) {
    return this.aspectImpactService.createImpactType(body, req);
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/updateImpactType/:impactTypeId')
  updateImpactType(
    @Body() body: any,
    @Param('impactTypeId') impactTypeId: string,
    @Req() req: any,
  ) {
    return this.aspectImpactService.updateImpactType(body, impactTypeId, req);
  }

  @Delete('/deleteImpactType/:impactTypeId')
  deleteImpactType(
    @Param('impactTypeId') impactTypeId: string,
    @Req() req: any,
  ) {
    return this.aspectImpactService.deleteImpactType(impactTypeId, req);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getImpactTypes')
  getImpactTypes(
    @Req() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query() query: any,
  ) {
    // console.log('hehrhehrehra');
    return this.aspectImpactService.getImpactTypes({
      ...query,
      page,
      pageSize,
    });
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createAct')
  createAct(@Body() body: any, @Req() req: any) {
    return this.aspectImpactService.createAct(body, req);
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/updateAct/:actId')
  updateAct(@Body() body: any, @Param('actId') actId: string, @Req() req: any) {
    return this.aspectImpactService.updateAct(body, actId, req);
  }

  @Delete('/deleteAct/:actId')
  deleteAct(@Param('actId') actId: string, @Req() req: any) {
    return this.aspectImpactService.deleteAct(actId, req);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getActs')
  getActs(
    @Req() req: any,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query() query: any,
  ) {
    // console.log('hehrhehrehra');
    return this.aspectImpactService.getActs({ ...query, page, pageSize });
  }

  @UseGuards(AuthenticationGuard)
  @Post('/uploadattachement')
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
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/aspectImpactAttachments`;
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
    return this.aspectImpactService.uploadsAttachment(file, req.query);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/getuserlist')
  getAllUser(@Query() query: any, @Req() req) {
    return this.aspectImpactService.getAllUser(query, req.user.id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.aspectImpactService.create(body, req);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/all/:jobTitle')
  findAll(@Param('jobTitle') jobTitle: any, @Query() query: any, @Req() req) {
    return this.aspectImpactService.findAll(jobTitle, query, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/allByDepartment/:entityId')
  findAllByDepatment(
    @Param('entityId') entityId: any,
    @Query() query: any,
    @Req() req,
  ) {
    return this.aspectImpactService.findAllByDepatment(
      entityId,
      query,
      req.user.id,
    );
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aspectImpactService.findOne(id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'RISK_REGISTER' })
  @Put(':id')
  update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return this.aspectImpactService.update(id, data, req);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'RISK_REGISTER' })
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: any) {
    return this.aspectImpactService.delete(id, req);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'RISK_REGISTER' })
  @Patch('/close/:id')
  closeRisk(@Param('id') id: string) {
    return this.aspectImpactService.closeRisk(id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Post('/addmitigation')
  addMitigation(@Body() data: any, @Req() req: any) {
    return this.aspectImpactService.addMitigation(data, req);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'RISK_REGISTER' })
  @Put('/updatemitigation/:id')
  updateMitigation(
    @Body() data: any,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.aspectImpactService.updateMitigation(id, data, req);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Post('/addcomment')
  addComment(@Body() data: any, @Req() req: any) {
    return this.aspectImpactService.addComment(data, req.user.id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/getallcomments/:riskId')
  findCommentById(@Param('riskId') riskId: string) {
    return this.aspectImpactService.findAllCommentsByRiskId(riskId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Patch('/updatereviewers/:riskId')
  UpdateReviewersAndSendMail(
    @Param('riskId') riskId: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    return this.aspectImpactService.updateReviewers(riskId, data, req.user.id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/users/:locationId')
  getAllUsersByLocation(@Param('locationId') locationId: string) {
    return this.aspectImpactService.findAllUsersByLocation(locationId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Post('/addcommentsbulk')
  addCommentsBulk(@Body() data: any[], @Req() req: any) {
    return this.aspectImpactService.addCommentsBulk(data, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/getAllJobTitles/:orgId/:entityId')
  findAllJobTitles(
    @Param('orgId') orgId: any,
    @Param('entityId') entityId: any,
    @Req() req,
  ) {
    return this.aspectImpactService.getAllJobTitlesWithDetails(orgId, entityId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/checkConsolidatedStatus/:entityId/:orgId')
  checkConsolidatedStatus(
    @Param('entityId') entityId: string,
    @Param('orgId') orgId: string,
  ) {
    // //////////////console.log('in delete risk controller');
    return this.aspectImpactService.checkConsolidatedStatus(entityId, orgId);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createConsolidateEntry/:entityId/:orgId')
  createConsolidateEntry(
    @Body() body: any,
    @Param('entityId') entityId: string,
    @Param('orgId') orgId: string,
  ) {
    // //////////////console.log('in delete risk controller');
    return this.aspectImpactService.createConsolidateEntry(
      body,
      entityId,
      orgId,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getHiraInWorkflow/:hiraWorkflowId')
  getHiraInWorkflow(@Param('hiraWorkflowId') hiraWorkflowId: string) {
    // //////////////console.log('in delete risk controller');
    return this.aspectImpactService.getHiraInWorkflow(hiraWorkflowId);
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/updateConsolidatedEntry/:hiraWorkflowId')
  updateConsolidatedEntry(
    @Body() body: any,
    @Param('hiraWorkflowId') hiraWorkflowId: string,
    @Req() req: any,
  ) {
    // //////////////console.log('in delete risk controller');
    return this.aspectImpactService.updateConsolidatedEntry(
      body,
      hiraWorkflowId,
      req.user.id,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAllDepartmentsByLocation/:locationId')
  getAllDepartmentsByLocation(@Param('locationId') locationId: string) {
    // //////////////console.log('in delete risk controller');
    return this.aspectImpactService.getAllDepartmentsByLocation(locationId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAllLocation/:orgId')
  getAllLocations(@Param('orgId') orgId: string) {
    // //////////////console.log('in delete risk controller');
    return this.aspectImpactService.getAllLocations(orgId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Post('/createReviewHistoryEntry')
  createReviewHistoryEntry(@Body() body: any) {
    //////console.log('in find all risk controller');
    return this.aspectImpactService.createReviewHistoryEntry(body);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/fetchReviewHistory/:entityId/:orgId')
  fetchReviewHistory(
    @Param('entityId') entityId: any,
    // @Param('jobTitle') jobTitle: any,
    @Param('orgId') orgId: any,
    // @Param() entityId: any,
  ) {
    //////console.log('in find all risk controller');
    return this.aspectImpactService.fetchReviewHistory(
      entityId,
      // jobTitle,
      orgId,
      // entityId,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Patch('updateAspImpConsolidatedForRejectedAspectImpact/:hiraWorkflowId')
  updateHiraConsolidatedForRejectedHira(
    @Body() body: any,
    @Param('hiraWorkflowId') hiraWorkflowId: string,
  ) {
    // ////////////////console.log('in delete risk controller');
    return this.aspectImpactService.updateHiraConsolidatedForRejectedHira(
      body,
      hiraWorkflowId,
    );
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Post('/addAspImpInChangesTrack')
  createEntryInHiraHistoryTrack(@Body() body: any) {
    //////console.log('in find all risk controller');
    return this.aspectImpactService.createEntryInHiraHistoryTrack(body);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/fetchEntryInAspImpHistoryTrack/:entityId/:orgId')
  fetchEntryInHiraHistoryTrack(
    @Param('entityId') entityId: any,
    @Param('orgId') orgId: any,
    // @Param() entityId: any,
  ) {
    //////console.log('in find all risk controller');
    return this.aspectImpactService.fetchEntryInHiraHistoryTrack(
      entityId,
      orgId,
    );
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/fetchAspImpDashboardCounts/:orgId')
  fetchAspImpDashboardCounts(@Param('orgId') orgId: any, @Query() query: any) {
    return this.aspectImpactService.fetchAspImpDashboardCounts(orgId, query);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('/deletestage/:aspImpId')
  deleteStageInDraft(@Param('aspImpId') aspImpId: any, @Req() req: any) {
    return this.aspectImpactService.deleteStage(aspImpId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/fetchAspImpConslidatedCount/:orgId')
  fetchAspImpConslidatedCount(@Param('orgId') orgId: any) {
    return this.aspectImpactService.fetchAspImpConslidatedCount(orgId);
  }

}
