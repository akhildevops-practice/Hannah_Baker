import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RiskConfig } from './riskConfigSchema/riskconfig.schema';
import { HiraTypeConfig } from './schema/hiraTypesSchema/hiraTypes.schema';
import { HiraConfig } from './schema/hiraConfigSchema/hiraconfig.schema';
import { PrismaService } from 'src/prisma.service';
import { ObjectId } from 'mongodb';
import { HiraAreaMaster } from './schema/hiraAreaMasterSchema/hiraAreaMaster.schema';
@Injectable()
export class RiskConfigService {
  constructor(
    @InjectModel(RiskConfig.name) private riskConfigModel: Model<RiskConfig>,
    @InjectModel(HiraTypeConfig.name)
    private hiraTypeConfigModel: Model<HiraTypeConfig>,
    @InjectModel(HiraConfig.name) private hiraConfigModel: Model<HiraConfig>,
    @InjectModel(HiraAreaMaster.name)
    private hiraAreaMasterModel: Model<HiraAreaMaster>,

    private readonly prisma: PrismaService,
  ) {}
  async create(data: any, id: any) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: id,
        },
      });

      const { organizationId } = activeUser;
      const riskConfig = new this.riskConfigModel({
        ...data,
        organizationId,
        createdBy: activeUser.username,
        updatedBy: activeUser.username,
      });
      const isExist = await this.riskConfigModel.findOne({
        riskCategory: { $regex: new RegExp(`\\b${data.riskCategory}\\b`, 'i') },
        organizationId,
      });

      ////////////////console.log('isExist', isExist);

      if (!!isExist) throw new Error('Risk Category already exists');

      const result = await riskConfig.save();

      return result;
    } catch (err) {
      if (err.message === 'Risk Category already exists') {
        throw new ConflictException('Risk Category aready exists');
      }
      throw new InternalServerErrorException();
    }
  }
  async findAll(id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: id,
        },
      });
      const list = await this.riskConfigModel.find({
        organizationId: activeUser.organizationId,
      });
      return list;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async findOne(id: string) {
    try {
      const config = await this.riskConfigModel.findById(id);
      return config;
    } catch (err) {
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

      const result = await this.riskConfigModel.findByIdAndUpdate(id, {
        ...data,
        updatedBy: activeUser.username,
      });
      return result;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }

  async delete(id: string) {
    try {
      const result = await this.riskConfigModel.findByIdAndDelete(id);
      return result;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async searchDocument(searchQuery: any, id: any) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: id,
        },
      });
      const document = await this.prisma.documents.findMany({
        where: {
          AND: [
            {
              organizationId: activeUser.organizationId,
              documentName: { contains: searchQuery, mode: 'insensitive' },
            },
          ],
        },
      });
      return document;
    } catch (error) {
      // ////////////////console.log('error', error);
      throw new InternalServerErrorException();
    }
  }

  async findByCategory(id: string) {
    try {
      const config = await this.riskConfigModel
        .find({
          _id: id,
        })
        .select('id riskCategory riskType condition impactType');

      return config;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async findAllCategories(id: string) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: id,
        },
      });
      const config = await this.riskConfigModel
        .find({
          organizationId: activeUser.organizationId,
        })
        .select('id riskCategory');
      return config;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async getUserRiskConfig(id: any) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: id,
        },
      });

      const location = await this.prisma.location.findMany({
        where: {
          organizationId: activeUser.organizationId,
        },
        select: {
          locationName: true,
          id: true,
        },
      });
      const entity = await this.prisma.entity.findMany({
        where: {
          organizationId: activeUser.organizationId,
        },
        select: {
          entityName: true,
          id: true,
        },
      });
      const sectionsInOrg = await this.prisma.section.findMany({
        where: {
          organizationId: activeUser.organizationId,
        },
      });

      const sections = sectionsInOrg.map((section) => {
        return {
          id: section.id,
          name: section.name,
        };
      });
      return {
        location,
        entity,
        sections,
      };
    } catch (error) {
      // ////////////////console.log('err', error);
      throw new InternalServerErrorException();
    }
  }

  async findConfigByCategoryName(name: string, orgId: string) {
    try {
      const config = await this.riskConfigModel.findOne({
        riskCategory: name,
        organizationId: orgId,
      });
      return config;
    } catch (error) {}
  }

  async getAllHiraTypes(query: any) {
    try {
      const {
        page = 1,
        pageSize = 10,
        locationId,
        orgId,
        type,
        pagination = true,
        master,
      } = query;
  
      const locationFilter =
        locationId !== "All" && master
          ? { locationId: { $in: ["All", locationId] } }
          : {};
  
      const baseQuery = {
        organizationId: orgId,
        type,
        deleted: false,
        ...locationFilter,
      };
  
      const queryBuilder = this.hiraTypeConfigModel.find(baseQuery);
      if (pagination) {
        queryBuilder.skip((page - 1) * pageSize).limit(pageSize);
      }
  
      const [list, totalDocuments] = await Promise.all([
        queryBuilder.lean(),
        this.hiraTypeConfigModel.countDocuments(baseQuery),
      ]);
  
      const locationIds = [
        ...new Set(list.map((item) => item.locationId)),
      ].filter((id) => !!id && id !== "All");
  
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
          where: { id: { in: list?.map((item) => item.createdBy)?.filter((id)=>!!id) } },
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
      console.error("Error in getAllHiraTypes", error);
      throw new InternalServerErrorException();
    }
  }
  

  async createHiraType(body: any) {
    try {
      // //console.log('checkrisk body in createHiraType', body);
      const createdHiraType = await this.hiraTypeConfigModel.create(body);
      if (createdHiraType) {
        return {
          message: 'Hazard Type Created successfully',
          data: createdHiraType,
        };
      } else {
        throw new HttpException(
          'Hazard Type Creation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (err) {
      // //console.log('Error in Creating Hazard Type ', err);
      throw new InternalServerErrorException(err);
    }
  }

  async updateHazardType(body: any, hiraTypeId: string) {
    try {
      // //console.log('checkrisk body in createHiraType', body);
      const updateHiraType = await this.hiraTypeConfigModel.findByIdAndUpdate(
        hiraTypeId,
        {
          ...body,
        },
      );
      if (updateHiraType) {
        return {
          message: 'Hazard Type Updated successfully',
          data: updateHiraType,
        };
      } else {
        throw new HttpException(
          'Hazard Type Updation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (err) {
      // //console.log('Error in Creatin Hira Type', err);
      throw new InternalServerErrorException(err);
    }
  }

  async deleteHazardType(hiraTypeId: string) {
    try {
      // //console.log('checkrisk body in createHiraType', body);
      const deleteHazardType = await this.hiraTypeConfigModel.findByIdAndUpdate(
        hiraTypeId,
        {
          deleted: true,
          deletedAt: new Date(),
        },
      );
      if (deleteHazardType) {
        return {
          message: 'Hazard Type Deleted successfully',
          data: deleteHazardType,
        };
      } else {
        throw new HttpException(
          'Hazard Type Deletion failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (err) {
      // //console.log('Error in Updating Hira Type', err);
      throw new InternalServerErrorException(err);
    }
  }

  async createImpactType(body: any) {
    try {
      // //console.log('checkrisk body in createHiraType', body);
      const createImpactType = await this.hiraTypeConfigModel.create(body);
      if (createImpactType) {
        return {
          message: 'Impact Type Created successfully',
          data: createImpactType,
        };
      } else {
        throw new HttpException(
          'Impact Type Creation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (err) {
      // //console.log('Error in Creating Impact Type ', err);
      throw new InternalServerErrorException(err);
    }
  }

  async updateImpactType(body: any, hiraTypeId: string) {
    try {
      // //console.log('checkrisk body in createHiraType', body);
      const updateImpactType = await this.hiraTypeConfigModel.findByIdAndUpdate(
        hiraTypeId,
        {
          ...body,
        },
      );
      if (updateImpactType) {
        return {
          message: 'Impact Type Updated successfully',
          data: updateImpactType,
        };
      } else {
        throw new HttpException(
          'Impact Type Updation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (err) {
      // //console.log('Error in Creating Impact Type', err);
      throw new InternalServerErrorException(err);
    }
  }

  async deleteImpactType(hiraTypeId: string) {
    try {
      // //console.log('checkrisk body in createHiraType', body);
      const deleteImpactType = await this.hiraTypeConfigModel.findByIdAndUpdate(
        hiraTypeId,
        {
          deleted: true,
          deletedAt: new Date(),
        },
      );
      if (deleteImpactType) {
        return {
          message: 'Impact Type Deleted successfully',
          data: deleteImpactType,
        };
      } else {
        throw new HttpException(
          'Impact Type Deletion failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (err) {
      // //console.log('Error in Updating Impact Type', err);
      throw new InternalServerErrorException(err);
    }
  }

  async createHiraConfig(body: any) {
    try {
      // //console.log('in create hira config body', body);

      const isExist = await this.hiraConfigModel.findOne({
        riskCategory: 'HIRA',
        deleted: false,
        organizationId: body.organizationId,
      });

      if (!!isExist) {
        throw new HttpException(
          'Hira Config already exists',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        const createdHiraConfig = await this.hiraConfigModel.create(body);
        return createdHiraConfig;
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getHiraConfig(orgId: string) {
    try {
      const hiraconfig = await this.hiraConfigModel.find({
        organizationId: orgId,
        deleted: false,
      });
      // //console.log('hiraconfig', hiraconfig);

      return hiraconfig;
    } catch (err) {
      // //console.log('eroror in getHiraConfig', err);

      throw new InternalServerErrorException();
    }
  }

  async updateHiraConfig(body: any, hiraConfigId: string) {
    try {
      // //console.log('in updateHiraConfig hira config body', body);

      const isExist = await this.hiraConfigModel.findOne({
        _id: new ObjectId(hiraConfigId),
        deleted: false,
        // organizationId: body.organizationId,
      });

      if (!isExist) {
        throw new HttpException('Hira Config Not Found', HttpStatus.NOT_FOUND);
      } else {
        const updateHiraConfig = await this.hiraConfigModel.findByIdAndUpdate(
          hiraConfigId,
          body,
        );
        return updateHiraConfig;
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getAllAreaMaster(query: any) {
    try {
      const {
        page = 1,
        pageSize = 10,
        locationId,
        orgId,
        pagination = false,
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
  
      const queryBuilder = this.hiraAreaMasterModel.find(baseQuery).sort({ name: 1 });
      if (pagination) {
        queryBuilder.skip((page - 1) * pageSize).limit(pageSize);
      }
  
      const [list, totalDocuments] = await Promise.all([
        queryBuilder.lean(),
        this.hiraAreaMasterModel.countDocuments(baseQuery),
      ]);

      console.log("list length in area get all", list?.length);
      
  
      const locationIds = [
        ...new Set(list.map((item) => item.locationId)),
      ].filter((id) => id !== "All");
  
      const userIds = [...new Set(list?.map((item) => item?.createdBy))].filter(Boolean);
  
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
      console.error("Error in getAllAreaMaster", error);
      throw new InternalServerErrorException();
    }
  }
  

  async createAreaMaster(body: any) {
    try {
      // //console.log('checkrisk body in createAreaMaster', body);
      const createdAreaMaster = await this.hiraAreaMasterModel.create(body);
      if (createdAreaMaster) {
        return {
          message: 'Area Created successfully',
          data: createdAreaMaster,
        };
      } else {
        throw new HttpException(
          'Area Creation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (err) {
      // //console.log('Error in Creating Hazard Type ', err);
      throw new InternalServerErrorException(err);
    }
  }

  async updateAreaMaster(body: any, areaMasterId: string) {
    try {
      // //console.log('checkrisk body in updateAreaMaster', body);
      const updateHiraType = await this.hiraAreaMasterModel.findByIdAndUpdate(
        areaMasterId,
        {
          ...body,
        },
      );
      if (updateHiraType) {
        return {
          message: 'Area Updated successfully',
          data: updateHiraType,
        };
      } else {
        throw new HttpException(
          'Area Updation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (err) {
      // //console.log('Error in Creatin Hira Type', err);
      throw new InternalServerErrorException(err);
    }
  }

  async deleteAreaMaster(hiraAreaMasterId: string) {
    try {
      // //console.log('checkrisk body in createHiraType', body);
      const deletedAreaMaster =
        await this.hiraAreaMasterModel.findByIdAndUpdate(hiraAreaMasterId, {
          deleted: true,
          deletedAt: new Date(),
        });
      if (deletedAreaMaster) {
        return {
          message: 'Area Deleted successfully',
          data: deletedAreaMaster,
        };
      } else {
        throw new HttpException(
          'Area Deletion failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (err) {
      // //console.log('Error in Updating Hira Type', err);
      throw new InternalServerErrorException(err);
    }
  }
}
