import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AbilityGuard } from '../ability/ability.guard';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { DoctypeService } from './doctype.service';
import { CreateDoctypeDto } from './dto/create-doctype.dto';
import { UpdateDoctypeDto } from './dto/update-doctype.dto';

@Controller('api/doctype')
export class DoctypeController {
  constructor(private readonly doctypeService: DoctypeService) {}
  /**
   *
   *  this controller for creating a doctype
   * @param createDoctypeDto
   * @returns a single organization
   */

  @UseGuards(AuthenticationGuard)
  @Post()
  create(@Body() createDoctypeDto: CreateDoctypeDto, @Req() req) {
    return this.doctypeService.createDoctype(createDoctypeDto, req.user);
  }


  @UseGuards(AuthenticationGuard)
  @Get('/getByDoctypeId/:id')
  getDoctypeId( @Req() req , @Param('id') id) {
    return this.doctypeService.getDoctypeId(req.user.id, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getDocTypeByName')
  getDocTypeByName(
    @Query('docType') docType: string,
    @Query('location') location: string,
    @Query('department') department: string,
    @Query('section') section: string,
    @Req() req,
  ) {
    return this.doctypeService.getDocTypeByName(
      docType,
      location,
      department,
      section,
      req.user.id,
    );
  }
  /**
   *
   *  this controller for creating a doctype
   * @param id of location
   * @returns the updated doctype
   */

  @UseGuards(AuthenticationGuard)
  @Get('/location/:locationId')
  getDoctypeForLocation(
    @Param('locationId') locationId,
    @Query('page') page,
    @Query('limit') limit,
    @Req() req,
  ) {
    // const locationTest = JSON.parse(locationId)
    if (locationId === 'All') {
      const data = ['All'];
      locationId = JSON.stringify(data);
    }
    return this.doctypeService.getDoctypesForLocation(
      JSON.parse(locationId),
      page,
      limit,
      req.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/docsValid')
  docsValid(@Query('text') text: string, @Req() req) {
    return this.doctypeService.uniqueCheck(req.user.id, text);
  }

  /**
   *
   *  this controller for creating a doctype
   * @param id of the doctype to be fetched
   * @returns the fetched doctype with provided id
   */

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctypeService.findOne(id);
  }
  /**
   *
   *  this controller for updating a doctype
   * @param updateDoctypeDto
   * @param id of the doctype which needs to be updated
   * @returns the updated doctype
   */
  @UseGuards(AuthenticationGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDoctypeDto: UpdateDoctypeDto,
    @Req() req,
  ) {
    return this.doctypeService.updateDoctype(id, updateDoctypeDto, req.user);
  }
  /**
   *
   *  this controller for deleting a doctype
   * @param id of the doctype to be deleted
   * @returns the deleted doctype
   */

  @Delete(':id')
  deleteDoctype(@Param('id') id: string, @Req() req) {
    return this.doctypeService.deleteDoctype(id, req.user);
  }
  @Delete('permanentDelete/:id')
  permanentDeleteDoctype(@Param('id') id: string) {
    return this.doctypeService.permanentDeleteDoctype(id);
  }
  @Patch('restoreDoctype/:id')
  restoreDoctype(@Param('id') id: string) {
    return this.doctypeService.restoreDoctype(id);
  }

  /**
   *
   *  this controller for deleting a doctype
   * @param id of the doctype to be deleted
   * @returns the deleted doctype
   */

  @UseGuards(AuthenticationGuard)
  @Get('/documents/getDoctypeCreatorDetails')
  async getDoctypeCreator(@Req() req) {
    return this.doctypeService.getDoctypeCreatorDetails(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getSystemsForDocuments/:docType')
  async getSystemsForDocuments(@Req() req, @Param('docType') name: string) {
    return this.doctypeService.getSystemsForDocuments(req.user.id, name);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getDocClassfication/:system/:docType')
  async getDocClassfication(
    @Req() req,
    @Param('system') system: string,
    @Param('docType') docType: string,
  ) {
    return this.doctypeService.getDocClassfication(
      system,
      docType,
      req.user.id,
    );
  }
}
