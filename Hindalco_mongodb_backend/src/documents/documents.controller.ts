import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpException,
  Req,
  UseGuards,
  Query,
  Inject,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { CreateCommentDto } from './dto/create-document-comment.dto';
import { MongooseDocumentMiddleware } from 'mongoose';
import { query } from 'express';
import { resourceLimits } from 'worker_threads';
import { SystemsController } from 'src/systems/systems.controller';

import { Logger, log } from 'winston';
import { get } from 'request';
const fs = require('fs');

@Controller('api/documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  @UseGuards(AuthenticationGuard)
  @Get('UpdateDocumentBasedOnAdditionalDocument')
  UpdateDocumentBasedOnAdditionalDocument() {
    return this.documentsService.UpdateDocumentBasedOnAdditionalDocument();
  }

  @UseGuards(AuthenticationGuard)
  @Patch('updateDateForNextRevision')
  updateDateForNextRevision(@Req() req) {
    return this.documentsService.updateDateForNextRevision(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.query.realm.toLowerCase();
          const locationName = req.query.locationName.toLowerCase();
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/document`;
          ////////////////console.log('destination', destination);
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }
          cb(null, destination);
        },
        filename: (req, file, cb) => {
          //generating a random name for the file
          const randomName: string = uuid();
          //Calling the callback passing the random name generated with the original extension name
          cb(
            null,
            `${randomName}${extname(file?.originalname.split(' ').join(''))}`,
          );
        },
      }),
    }),
  )
  create(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file,
    @Req() req,
  ) {
    return this.documentsService.create(createDocumentDto, file, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/revisionReminder/:id')
  revisionReminder(@Param('id') id) {
    //////////////console.log('inside controller');
    return this.documentsService.revisionReminder(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getSingleDocument/:id')
  findOne(
    @Param('id') id: string,
    @Query('version') version: boolean,
    @Query('versionId') versionId: string,
    @Req() req
  ) {
    return this.documentsService.findOne(id, version, versionId,req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/filerValue')
  filterValue(@Req() req, @Query() query) {
    return this.documentsService.filterValue(req.user.id, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/filerValueNew')
  filterValueNew(@Req() req, @Query() query) {
    return this.documentsService.filterValueNew(req.user, query);
  }
  @UseGuards(AuthenticationGuard)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.query.realm.toLowerCase();
          const locationName = req.query.locationName.toLowerCase();
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/document`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }
          cb(null, destination);
        },
        filename: (req, file, cb) => {
          //generating a random name for the file
          const randomName: string = uuid();

          cb(
            null,
            `${randomName}${extname(file?.originalname.split(' ').join(''))}`,
          );
        },
      }),
    }),
  )
  update(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file,
    @Req() req,
    @Param('id') id,
  ) {
    return this.documentsService.updatetest(
      id,
      createDocumentDto,
      file,
      req.user,
    );
  }
  // @UseGuards(AuthenticationGuard)
  // @Patch('/restoredocument/:id')
  // restore(@Param('id') id: string) {
  //   return this.documentsService.restoreDocument(id);
  // }

  @UseGuards(AuthenticationGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.documentsService.remove(id, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getDocumentAttachmentHistory/:id')
  getDocumentAttachmentHistory(@Param('id') id) {
    return this.documentsService.getDocumentAttachmentHistory(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getEntityForDocument')
  getEntityForDocument(@Req() req) {
    return this.documentsService.getEntityForDocument(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createComment')
  createComment(@Body() createCommentsDto: CreateCommentDto, @Req() req) {
    return this.documentsService.createCommentOnDocument(
      req.user,
      createCommentsDto,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Delete('/deleteComment/:commentId')
  deleteComment(@Param('commentId') commentId: string) {
    return this.documentsService.deleteCommentForDocument(commentId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getCommentsForDocument/:documentId')
  getCommentsForDocument(
    @Param('documentId') documentId,
    @Query('version') version: boolean,
  ) {
    return this.documentsService.getCommentsForDocument(documentId, version);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getWorkflowHistory/:documentId')
  getWorkFlowHistory(@Param('documentId') documenId) {
    return this.documentsService.getWorkFlowHistoryforDocument(documenId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getVersionsForDocument/:documentId')
  getVersionsForDocument(@Param('documentId') documentId) {
    return this.documentsService.getVersionsforDocument(documentId);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/setStatus/:documentId')
  setStatusForDocument(
    @Query('status') status,
    @Param('documentId') documentId,

    @Req() req,
  ) {
    return this.documentsService.setStatusForDocument(
      status,
      documentId,
      req.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/checkUserPermissions/:documentId')
  checkUserPermissions(@Req() req, @Param('documentId') documentId) {
    return this.documentsService.getApproverReviewerDocumentDetails(
      req.user,
      documentId,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getDocumentsByName/:realmName')
  getDocumentsByNameSearch(
    @Query('documentName') documentName,
    @Param('realmName') realmName,
    @Req() req,
  ) {
    return this.documentsService.getReferenceDocumentSearch(
      documentName,
      realmName,
      req.user,
    );
  }

  @Get('getReferenceDocuments/forCurrentDoc/:documentId')
  getAllReferenceDocumentsForCurrentDoc(@Param('documentId') documentId) {
    return this.documentsService.getReferenceDocumentsForDocument(documentId);
  }

  @Delete('/deleteRefDoc/:id')
  deleteReferenceDocument(@Param('id') id) {
    return this.documentsService.deleteReferenceDocument(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/:realmName/all')
  findAllDocs(@Param('realmName') realmName, @Req() req) {
    return this.documentsService.findAllDocs?.(realmName, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/fetchDocumentByEntity/:entity')
  fetchDocumentByEntity(@Param('entity') entity, @Req() req) {
    return this.documentsService.fetchDocumentByEntity(entity, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/byEntity')
  findAllDocsByUserEntity(@Req() req) {
    return this.documentsService.findAllDocsByUserEntity(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/systems')
  systems(@Req() req) {
    return this.documentsService.systems(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/entity')
  entity(@Req() req) {
    return this.documentsService.entity(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/displayAllDocs')
  displayAllDocs(@Req() req) {
    return this.documentsService.displayAuditDocs(req.user.id);
  }
  // //api to get esignature
  // @UseGuards(AuthenticationGuard)
  // @Get('eSignature')
  // async docuSign() {
  //   return this.documentsService.docuSign();
  // }
  //api to get the count and data for modulewise dashboard
  @UseGuards(AuthenticationGuard)
  @Get('myDeptmyLocCountForDashboard')
  getMyDeptMyLocCount(@Req() req, @Query() data) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, GET /api/documents/myDeptmyLocCount`,
      'documents.controller.ts',
    );
    return this.documentsService.getMyDeptMyLocCount(req.user, data);
  }

  //api to get the count and data for modulewise dashboard for the current year
  @UseGuards(AuthenticationGuard)
  @Get('myDeptmyLocCountForDashboardForCurrentYear')
  getMyDeptMyLocCountFortheCurrentYear(@Req() req) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, GET /api/documents/myDeptmyLocCountforCurrentYear`,
      'documents.controller.ts',
    );
    return this.documentsService.getMyDeptMyLocCountForTheCurrentYear(req.user);
  }

  //api to get the count and data for revised doc
  @UseGuards(AuthenticationGuard)
  @Get('myDeptmyLocRevisedCountForDashboard')
  getMyDeptMyLocRevisedCount(@Req() req) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, GET /api/documents/myDeptmyLocRevisedCountfordashboard`,
      'documents.controller.ts',
    );
    return this.documentsService.getMyDeptMyLocRevisedCount(req.user);
  }

  //api to get the count and data for revison due for the current and next month
  @UseGuards(AuthenticationGuard)
  @Get('myDeptmyLocRevisionDueCountForDashboard')
  getMyDeptMyLocRevisionDueCount(@Req() req) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, GET /api/documents/myDeptmyLocRevisionCountfordashboard`,
      'documents.controller.ts',
    );
    return this.documentsService.getMyDeptMyLocRevisionDueCount(req.user);
  }
  //api to get the count and data of all the docs in workflow
  @UseGuards(AuthenticationGuard)
  @Get('myDeptmyLocInWorkFlowCountForDashboard')
  getMyDeptMyLocInWorkflowCount(@Req() req) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, GET /api/documents/myDeptmyLocInWorkFlowCountForDashboard`,
      'documents.controller.ts',
    );
    return this.documentsService.getMyDeptMyLocStatuswiseCount(req.user);
  }

  //api to get the chart data when filters are applied
  @UseGuards(AuthenticationGuard)
  @Get('filterChartData')
  filterChartData(@Query() queryParams: any, @Req() req) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, GET /api/documents/filterChartData`,
      'documents.controller.ts',
    );
    return this.documentsService.filterChartData(queryParams, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/:realmNames')
  findAll(
    @Param('realmNames') realName,
    @Query('filter') filter,
    @Query('page') page,
    @Query('limit') limit,
    @Req() req,
  ) {
    return this.documentsService.findAll(
      filter,
      page,
      limit,
      realName,
      req.user,
    );
  }

  @Post('documentOBJ')
  getDocumentOBJ(@Body() requestBody) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, POST /api/documents/documentOBJ`,
      'documents.controller.ts',
    );
    const documentLink = requestBody.documentLink;
    return this.documentsService.getDocumentOBJ(documentLink, randomName);
  }

  @Post('viewerOBJ')
  getViewerOBJ(@Body() requestBody) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, POST /api/documents/viewerOBJ`,
      'documents.controller.ts',
    );
    const documentLink = requestBody.documentLink;
    return this.documentsService.getViewerOBJ(documentLink, randomName);
  }
}
