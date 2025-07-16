import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import mongoose, { Model } from 'mongoose';
import { DashboardService } from 'src/dashboard/dashboard.service';
import { System, SystemDocument } from 'src/systems/schema/system.schema';
import { InjectModel } from '@nestjs/mongoose';
import { DashboardFilter } from 'src/dashboard/dto/dashboard-filter.dto';
import { AuditService } from 'src/audit/audit.service';
import { Types } from 'mongoose';
import {
  Nonconformance,
  NonconformanceDocument,
} from 'src/audit/schema/nonconformance.schema';
import { Clauses } from 'src/systems/schema/clauses.schema';
import { HiraRegister } from 'src/risk-register/hiraRegisterSchema/hiraRegister.schema';
import { AspectImpact } from 'src/aspect-impact/aspectImpactSchema/aspectImpact.schema';
import { Hira } from 'src/risk-register/hiraRegisterSchema/hira.schema';
import { MongoClient, ObjectId } from 'mongodb';
import { cara } from 'src/cara//schema/cara.schema';
import { CIP } from 'src/cip/schema/cip.schema';
import { referenceDocuments } from 'src/reference-documents/schema/reference-documents.schema';
@Injectable()
export class  GlobalsearchService {
  constructor(
    @InjectModel(System.name) private SystemModel: Model<SystemDocument>,
    @InjectModel(Clauses.name) private ClauseModel: Model<Clauses>,
    @InjectModel(Nonconformance.name)
    private readonly NcModel: Model<NonconformanceDocument>,
    @InjectModel(HiraRegister.name)
    private readonly hiraRegisterModel: Model<HiraRegister>,
    @InjectModel(Hira.name)
    private readonly hiraModel: Model<Hira>,
    @InjectModel(AspectImpact.name)
    private readonly aspectImpactModel: Model<AspectImpact>,
    private prisma: PrismaService,
    private dashboardService: DashboardService,
    @InjectModel(cara.name) private caraModel: Model<cara>,
    @InjectModel(CIP.name) private CIPModel: Model<CIP>,
    private auditService: AuditService,
    @InjectModel(referenceDocuments.name)
    private referenceDocumentsModel: Model<referenceDocuments>,
  ) {}

  async findAllModules(queryParams) {
    return [
      {
        name: 'Documents',
        count: 10,
      },
      {
        name: 'Audit',
        count: 10,
      },
    ];
  }

  buildClauseQuery(
    searchQuery: string,
    systemsArray: any,
    organizationId: string,
    queryParams: any,
  ) {
    let query: any = {
      $or: [
        { number: { $regex: new RegExp(searchQuery, 'i') } },
        { name: { $regex: new RegExp(searchQuery, 'i') } },
        { description: { $regex: new RegExp(searchQuery, 'i') } },
      ],
      organizationId,
      deleted: false, // Ensuring deleted clauses are excluded
    };

    if (systemsArray && systemsArray?.length) {
      query.systemId = { $in: systemsArray };
    }
    return query;
  }
  async fetchClauses(searchQuery, systemsArray, organizationId, queryParams) {
    const clauseSearchQuery = this.buildClauseQuery(
      searchQuery,
      systemsArray,
      organizationId,
      queryParams,
    );
    //console.log('clauseSearchQuery in fetchClauses', clauseSearchQuery);
    
    const page = queryParams?.page ? parseInt(queryParams.page) : 1;
    const limit = queryParams?.limit ? parseInt(queryParams.limit) : 100;
    const skip = (page - 1) * limit; // Calculate the number of documents to skip
    const [clauseResult, clauseCountResult] = await Promise.all([
      this.ClauseModel.aggregate([
        { $match: clauseSearchQuery },
        {
          $project: {
            _id: 1,
            number: 1,
            name: 1,
            description: 1,
            systemId: 1,
          },
        },
        { $skip: skip },
        { $limit: limit },
      ]).exec(),
      this.ClauseModel.aggregate([
        { $match: clauseSearchQuery },
        { $count: 'count' },
      ]).exec(),
    ]);

    const count = clauseCountResult.length ? clauseCountResult[0].count : 0;

    const enrichedClauses = await Promise.all(
      clauseResult.map(async (clause) => {
        const system = await this.SystemModel.findById(clause.systemId);
        return {
          ...clause,
          systemName: system?.name || null,
          applicable_locations: system
            ? await this.mapLocationIdsToNames(
                system.applicable_locations,
                this.prisma.location,
              )
            : null,
        };
      }),
    );

    return { data: enrichedClauses, count };
  }

  async fetchNonConformances(searchQuery, organization, queryParams, userLocationId, userEntityId) {
    // console.log("NC---> searchQuery, organization, queryParams, userLocationId", searchQuery, organization, queryParams, userLocationId);
    
    const page = queryParams?.page ? parseInt(queryParams.page) : 1;
    const limit = queryParams?.limit ? parseInt(queryParams.limit) : 100;
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    let ncQuery: any = {};
    if (queryParams?.filter) {
        ncQuery = {
            $or: [
                { id: { $regex: queryParams?.searchQuery, $options: 'i' } },
                { status: { $regex: queryParams?.searchQuery, $options: 'i' } },
                { severity: { $regex: queryParams?.searchQuery, $options: 'i' } },
            ],
            organizationId: organization,
            ...(queryParams?.location?.length && {
                location: { $in: queryParams.location },
            }),
            ...(queryParams?.entity?.length && {
                auditedEntity: { $in: queryParams.entity },
            }),
        };
    } else {
        ncQuery = {
            $or: [
                { id: { $regex: searchQuery, $options: 'i' } },
                { status: { $regex: searchQuery, $options: 'i' } },
                { severity: { $regex: searchQuery, $options: 'i' } },
            ],
            organizationId: organization,
            ...(queryParams?.userFilter && userLocationId && {
                location: { $in: [userLocationId] },
            }),
            ...(queryParams?.userFilter && userEntityId &&  {
              auditedEntity: { $in: [userEntityId] },
            }),
        };
    }

    // Fetch Non-Conformance Data
    const [ncResult, ncCount] = await Promise.all([
        this.NcModel.find(ncQuery)
            .select("_id id clause severity location auditedEntity audit system organization")
            .skip(skip)
            .limit(limit)
            .lean(),
        this.NcModel.countDocuments(ncQuery),
    ]);

    // Fetch Location Details
    const locationIdSet = new Set(ncResult.map((nc) => nc.location));
    const locationIdArray = Array.from(locationIdSet)?.filter((location) => !!location);

    const locationResult = await this.prisma.location.findMany({
        where: {
            id: {
                in: locationIdArray,
            },
        },
        select: {
            id: true,
            locationName: true,
        },
    });

    // Fetch Entity Details
    const entityIdSet = new Set(ncResult.map((nc) => nc.auditedEntity));
    const entityIdArray :any = Array.from(entityIdSet)?.filter((entityId) => !!entityId);

    // console.log("NC---> entityIdArray", entityIdArray);
    // console.log("NC---> entityIdSet", entityIdSet);
    
    

    const entityResult = await this.prisma.entity.findMany({
        where: {
            id: {
                in: entityIdArray,
            },
        },
        select: {
            id: true,
            entityName: true,
        },
    });

    // Create Mapping for Location & Entity
    const locationMap = locationResult.reduce((acc, location) => {
        acc[location.id] = location;
        return acc;
    }, {});

    const entityMap = entityResult.reduce((acc, entity) => {
        acc[entity.id] = entity;
        return acc;
    }, {});

    // Add Location & Entity Details to Response
    const ncData = ncResult.map((item: any) => ({
        ...item,
        locationDetails: locationMap[item.location] || {},
        entityDetails: entityMap[item.auditedEntity] || {},
    }));

    return { data: ncData, count: ncCount };
}


  private buildHiraQuery(
    organization,
    searchQuery,
    queryParams,
    userLocationId,
    userEntityId,
  ) {
    let hiraQuery;
    // console.log("organization searchquery entityId querparams userlocationid", organization, searchQuery, entityId, queryParams, userLocationId);
    if (queryParams?.filter) {
      hiraQuery = {
        organizationId: organization,
        status: 'active',
        jobTitle: { $regex: queryParams?.searchQuery, $options: 'i' },
        ...(queryParams?.entity?.length && {
          entityId: { $in: queryParams.entity },
        }),
        ...(queryParams?.location?.length && {
          locationId: { $in: queryParams.location },
        }),
      };
    } else {
      hiraQuery = {
        organizationId: organization,
        status: 'active',
        jobTitle: { $regex: searchQuery, $options: 'i' },
        ...(queryParams?.userFilter && userLocationId && {
          locationId : { $in: [userLocationId] }
        }),
        ...(queryParams?.userFilter && userEntityId && {
          entityId : { $in: [userEntityId] }
        })
      };
    }
    
    

    return hiraQuery;
  }

  async fetchAspectImpact(searchQuery, organization, queryParams, userLocationId, userEntityId) {
    const page = queryParams?.page ? parseInt(queryParams.page) : 1;
    const limit = queryParams?.limit ? parseInt(queryParams.limit) : 100;
    const skip = (page - 1) * limit; 
    let query:any = {}
    //console.log("queryParams in fetchAspectImpact", queryParams);
    
    if(queryParams?.filter){
      query = {
        organizationId: organization,
        status: { $in: ['inWorkflow', ' active'] },
        $or: [
          { jobTitle: { $regex: searchQuery, $options: 'i' } },
          { activity: { $regex: searchQuery, $options: 'i' } },
        ],
        ...(queryParams?.location?.length && {
          locationId: { $in: queryParams.location },
        }),
        ...(queryParams?.entity?.length && {
          entityId: { $in: queryParams.entity },
        }),
      }
    } else {
      query = {
        organizationId: organization,
        status: { $in: ['inWorkflow', 'active'] },
        locationId: { $in: [userLocationId] },
        $or: [
          { jobTitle: { $regex: searchQuery, $options: 'i' } },
          { activity: { $regex: searchQuery, $options: 'i' } },
        ],
        ...(queryParams?.userFilter && userLocationId && {
          locationId : { $in: [userLocationId] }
        }),
        ...(queryParams?.userFilter && userEntityId && {
          entityId: { $in: [userEntityId] },
        }),
      }
    }
    // console.log("query in fetchAspectImpact", query);
    
    const [data, count] = await Promise.all([
      this.aspectImpactModel.find(query, '_id jobTitle activity entityId locationId').skip(skip).limit(limit).lean(),
      this.aspectImpactModel.countDocuments(query),
    ]);
    //console.log("count in fetchAspectImpact", count);
    
    const entityIdSet = new Set(data.map((aspect) => aspect.entityId));
    const locationIdSet = new Set(data.map((aspect) => aspect.locationId));

    const entityIdArray = Array.from(entityIdSet)?.filter((entity) => !!entity);
    const locationIdArray = Array.from(locationIdSet)?.filter(
      (location) => !!location,
    );

    //console.log("entityIdArray, locationIdArray", entityIdArray, locationIdArray);
    

    const [entityResult, locationResult] = await Promise.all([
      this.prisma.entity.findMany({
        where: {
          id: {
            in: entityIdArray,
          },
        },
        select : {
          id : true,
          entityName : true
        }
      }),
      this.prisma.location.findMany({
        where: {
          id: {
            in: locationIdArray,
          },
        },
        select : {
          id : true,
          locationName : true
        }
      }),
    ]);

    const entityMap = entityResult.reduce((acc, entity) => {
      acc[entity.id] = entity;
      return acc;
    }, {});

    const locationMap = locationResult.reduce((acc, location) => {
      acc[location.id] = location;
      return acc;
    }, {});

    const aspectImpactData = data.map((item:any)=>({
      ...item,
      entityDetails: entityMap[item.entityId] || {},
      locationDetails: locationMap[item.locationId] || {},
    }))

    return { data : aspectImpactData, count };
  }

  async fetchAllCapa(searchQuery, organization, queryParams, userLocationId, userEntityId) {
    let capaQuery: any = {};
    const page = queryParams?.page ? parseInt(queryParams.page) : 1;
    const limit = queryParams?.limit ? parseInt(queryParams.limit) : 100;
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    if (queryParams?.filter) {
      capaQuery = {
        organizationId: queryParams?.organizationId,

        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
        ],
        ...(queryParams?.entity?.length && {
          entityId: { $in: queryParams.entity },
        }),
        ...(queryParams?.location?.length && {
          locationId: { $in: queryParams.location },
        }),
      };
    } else {
      capaQuery = {
        organizationId: organization,
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
        ],
        ...(queryParams?.userFilter &&
          userLocationId && {
            locationId: { $in: [userLocationId] },
          }),
          ...(queryParams?.userFilter && userEntityId && {
            entityId: { $in: [userEntityId] },
          }),
      };
    }
    // console.log("capa query in fetchAllCapa", capaQuery);
    
    const [capaResult, capaCount] = await Promise.all([
      this.caraModel.find(capaQuery).select("title description locationId entityId").skip(skip).limit(limit).lean(),
      this.caraModel.countDocuments(capaQuery),
    ]);

    if (capaResult?.length) {
      const entityIdSet = new Set(capaResult.map((capa) => capa.entityId));
      const locationIdSet = new Set(capaResult.map((capa) => capa.locationId));

      const [entityResult, locationResult] = await Promise.all([
        this.prisma.entity.findMany({
          where: {
            id: {
              in: [...entityIdSet],
            },
          },
        }),
        this.prisma.location.findMany({
          where: {
            id: {
              in: [...locationIdSet],
            },
          },
        }),
      ]);

      const entityMap = entityResult.reduce((acc, entity) => {
        acc[entity.id] = entity;
        return acc;
      }, {});

      const locationMap = locationResult.reduce((acc, location) => {
        acc[location.id] = location;
        return acc;
      }, {});

      const capaData = capaResult.map((capa) => {
        return {
          ...capa,
          entityDetails: entityMap[capa.entityId],
          locationDetails: locationMap[capa.locationId],
        };
      });

      return { data: capaData, count: capaCount };
    } else {
      return { data: [], count: capaCount };
    }
  }

  async fetchAllCip(searchQuery, organization, queryParams, userLocationId, userEntityId) {
    let cipQuery: any = {};
    const page = queryParams?.page ? parseInt(queryParams.page) : 1;
    const limit = queryParams?.limit ? parseInt(queryParams.limit) : 100;
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    if (queryParams?.filter) {
      cipQuery = {
        organizationId: organization,
        title: { $regex: queryParams?.searchQuery || '', $options: 'i' }, // Use regex for case-insensitive search
        ...(queryParams?.entity?.length && {
          'entity.id': { $in: queryParams?.entity }, // Match entities
        }),
        ...(queryParams?.location?.length && {
          'location.id': { $in: queryParams?.location }, // Match location by `location.id`
        }),
      };
    } else {
      cipQuery = {
        organizationId: organization,
        title: { $regex: searchQuery || '', $options: 'i' },
        ...(queryParams?.userFilter && userLocationId && {
          'location.id': { $in: [userLocationId] }, // Match user's location by `location.id`
        }),
        ...(queryParams?.userFilter && userLocationId && {
          'entity.id': { $in: [userEntityId] }, // Match entities
        }),
      };
    }

    //console.log("cipquery in fetchAllCip", cipQuery);

    const [cipResult, cipCount] = await Promise.all([
      this.CIPModel.find(cipQuery).skip(skip).limit(limit).lean(),
      this.CIPModel.countDocuments(cipQuery),
    ]);

    if (cipResult?.length) {
      const cipData = cipResult.map((cip) => {
        return {
          ...cip,
          entityDetails: cip?.entity,
          locationDetails: cip?.location,
        };
      });

      return { data: cipData, count: cipCount };
    } else {
      return { data: [], count: cipCount };
    }
  }

  async getAllHiraWithSteps(
    searchQuery = '',
    queryParams,
    organization,
    userLocationId,
    userEntityId,
  ) {
    try {
      const hiraQuery = this.buildHiraQuery(
        organization,
        searchQuery,
        queryParams,
        userLocationId,
        userEntityId,
      );
      //console.log('hiraQuery in getAllHiraWithSteps', hiraQuery);
      const page = queryParams?.page ? parseInt(queryParams.page) : 1;
      const limit = queryParams?.limit ? parseInt(queryParams.limit) : 100;
      const skip = (page - 1) * limit; // Calculate the number of documents to skip
      const hiraResult = await this.hiraModel
        .find(hiraQuery, '_id jobTitle entityId locationId stepIds')
        .skip(skip)
        .limit(limit)
        .lean();

      const hiraCount = await this.hiraModel.countDocuments(hiraQuery);
      if (hiraResult?.length > 0) {
        const entityIdsSet = new Set(hiraResult.map((hira) => hira.entityId));
        const locationIdSet = new Set(
          hiraResult.map((hira) => hira.locationId),
        );

        const [entityResult, locationResult] = await Promise.all([
          this.prisma.entity.findMany({
            where: {
              id: {
                in: [...entityIdsSet],
              },
            },
            select : {
              id : true,
              entityName : true
            }
          }),
          this.prisma.location.findMany({
            where: {
              id: {
                in: [...locationIdSet],
              },
            },
            select : {
              id : true,
              locationName : true
            }
          }),
        ]);

        const entityMap = entityResult.reduce((acc, entity) => {
          acc[entity.id] = entity;
          return acc;
        }, {});

        const locationMap = locationResult.reduce((acc, location) => {
          acc[location.id] = location;
          return acc;
        }, {});

        const hiraData = hiraResult.map((hira) => {
          return {
            ...hira,
            entityDetails: entityMap[hira.entityId],
            locationDetails: locationMap[hira.locationId],
          };
        });

        return {
          data: hiraData,
          count: hiraCount,
        };
      } else {
        return {
          data: [],
          count: hiraCount,
        };
      }
    } catch (error) {
      //console.log('error in get all hira with steps in global search', error);
    }
  }

  async fetchAllDocuments(searchQuery, organization, queryParams, user, userLocationId, userEntityId) {
    try {
      const page = queryParams?.page ? parseInt(queryParams.page) : 1;
      const limit = queryParams?.limit ? parseInt(queryParams.limit) : 100;
      const skip = (page - 1) * limit; // Calculate the number of documents to skip
      let docQuery: any = {};
      if (queryParams?.filter) {
        docQuery = {
          organizationId: organization,
          searchQuery: queryParams?.searchQuery,
          ...(queryParams?.entityFilter?.length && {
            departments: queryParams?.entityFilter,
          }),
          ...(queryParams?.locationFilter?.length && {
            locationIds: queryParams?.locationFilter,
          }),
        };
      } else {
        docQuery = {
          organizationId: organization,
          searchQuery: queryParams?.searchQuery,
          ...(queryParams?.userFilter && {
            locationIds : [userLocationId] 
          }),
          ...(queryParams?.userFilter && userEntityId && {
            departments: [userEntityId] ,
          }),
        };
      }
      // console.log("docQuery in fetchAllDocuments", docQuery);
      
      // Pass pagination parameters to the service
      const docResult = await this.dashboardService.findAll(
        {
          ...docQuery,
          documentStatus: ['PUBLISHED'],
          page : page,
          limit : limit,
        },
        user,
      );

      // console.log("docResult in fetchAllDocuments", docResult);
      
      return {
        data: docResult.data, // Assuming data is paginated in the service response
        count: docResult.total, // Total documents count
      };
    } catch (error) {
      console.error('Error in fetchAllDocuments:', error);
      throw new Error('Failed to fetch documents');
    }
  }

  async fetchAllRefDocs(searchQuery, organization, queryParams, userLocationId) {
    try {
      let docQuery: any = {};
      const page = queryParams?.page ? parseInt(queryParams.page) : 1;
      const limit = queryParams?.limit ? parseInt(queryParams.limit) : 100;
      const skip = (page - 1) * limit;
      if (queryParams?.filter) {
        docQuery = {
          organizationId: organization,
          topic: { $regex: searchQuery, $options: 'i' },
          ...(queryParams?.locationFilter?.length && !queryParams?.locationFilter?.includes('All') && {
            'location.id': { $in: queryParams?.locationFilter },
          }),
        };
      } else {
        docQuery = {
          organizationId: organization,
          topic: { $regex: searchQuery, $options: 'i' },
        ...(queryParams?.userFilter && userLocationId && {
            'location.id': { $in: [userLocationId] },
          }),
        };
      }

      //console.log("ref doc query in fetchAllRefDocs", docQuery);
      

      const result = await this.referenceDocumentsModel.find(docQuery).skip(skip).limit(limit).lean();
      const count = await this.referenceDocumentsModel.countDocuments(docQuery);
      return {
        data: result,
        count: count,
      };
    } catch (error) {
      //console.log('error in fetchAllRefDocs in global search', error);
    }
  }

  async findAll(queryParams: DashboardFilter, user, req) {
    try {
      const { searchQuery, systemsArray, organization, entityId } =
        queryParams;
        // console.log("queryParams in global search", queryParams);
        
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: req.user.id,
        },
      });
      const modulesNameAndCount = [];
      const documents = await this.fetchAllDocuments(
        searchQuery,
        organization,
        queryParams,
        user,
        activeUser?.locationId,
        activeUser?.entityId,
      );
      modulesNameAndCount.push({
        name: 'Documents',
        count: documents.count,
      });

      // Clauses Search
      const clauses = await this.fetchClauses(
        searchQuery,
        systemsArray,
        organization,
        queryParams,
      );
      // console.log("clauses in global search", clauses);
      modulesNameAndCount.push({
        name: 'Clauses',
        count: clauses.count,
      });

      // Non-Conformance Search (NC)
      const ncData = await this.fetchNonConformances(
        searchQuery,
        organization,
        queryParams,
        activeUser?.locationId,
        activeUser?.entityId,
      );
      modulesNameAndCount.push({
        name: 'NC',
        count: ncData.count,
      });

      // console.log("active user in global search", activeUser);
      // console.log("searchQuery in global search", searchQuery);

      // HIRA Search

      const hiraData = await this.getAllHiraWithSteps(
        searchQuery,
        queryParams,
        organization,
        activeUser?.locationId,
        activeUser?.entityId,
      );
      modulesNameAndCount.push({
        name: 'HIRA',
        count: hiraData?.count || 0,
      });

      // Aspect Impact Search
      const aspectImpactData = await this.fetchAspectImpact(
        searchQuery,
        organization,
        queryParams,
        activeUser?.locationId,
        activeUser?.entityId,
      );
      modulesNameAndCount.push({
        name: 'AspectImpact',
        count: aspectImpactData.count,
      });

      //Capa Search
      const capaData = await this.fetchAllCapa(
        searchQuery,
        organization,
        queryParams,
        activeUser?.locationId,
        activeUser?.entityId,
      );
      modulesNameAndCount.push({
        name: 'CAPA',
        count: capaData.count,
      });

      //CIP Search
      const cipData = await this.fetchAllCip(
        searchQuery,
        organization,
        queryParams,
        activeUser?.locationId,
        activeUser?.entityId,
      );
      modulesNameAndCount.push({
        name: 'CIP',
        count: cipData.count,
      });

      //ref doc search
      const refDocData = await this.fetchAllRefDocs(
        searchQuery,
        organization,
        queryParams,
        activeUser?.locationId,
      );
      modulesNameAndCount.push({
        name: 'Ref Doc',
        count: refDocData.count,
      });

      return {
        modulesNameAndCount,
        result: {
          document: documents.data,
          clauses: clauses.data,
          nc: ncData.data,
          hira: hiraData?.data || [],
          aspectImpact: aspectImpactData.data,
          capa: capaData.data,
          cip: cipData.data,
          refDoc: refDocData.data,
        },
      };
    } catch (error) {
      console.error('Error in findAll API:', error);
      throw new Error('Failed to fetch data');
    }
  }

  // async findAllOld(queryParams: DashboardFilter, user, req) {
  //   try {
  //     const queryObj = {
  //       searchQuery: queryParams.searchQuery,
  //       // page: Number(queryParams.page),
  //       // limit: Number(queryParams.limit),
  //     };
  //     //////console.log('querysysarray', queryParams.systemsArray);

  //     let modulesNameAndCount = [];
  //     const result = await this.dashboardService.findAll(
  //       { ...queryParams, documentStatus: ['PUBLISHED'] },
  //       user,
  //     );
  //     modulesNameAndCount.push({
  //       name: 'Documents',
  //       count: result.data_length,
  //     });

  //     const clauseSearchQuery1 = {
  //       $and: [
  //         {
  //           $or: [
  //             { number: { $regex: new RegExp(queryObj.searchQuery, 'i') } },
  //             { name: { $regex: new RegExp(queryObj.searchQuery, 'i') } },
  //             {
  //               description: { $regex: new RegExp(queryObj.searchQuery, 'i') },
  //             },
  //           ],
  //         },
  //         { systemId: { $in: queryParams.systemsArray } },
  //       ],
  //     };
  //     const clauseSearchQuery = {
  //       $and: [
  //         {
  //           $or: [
  //             { number: { $regex: new RegExp(queryObj.searchQuery, 'i') } },
  //             { name: { $regex: new RegExp(queryObj.searchQuery, 'i') } },
  //             {
  //               description: { $regex: new RegExp(queryObj.searchQuery, 'i') },
  //             },
  //           ],
  //         },
  //         { organizationId: queryParams.organization },
  //       ],
  //     };
  //     let clauseResult, clauseResultCount;

  //     if (queryParams.systemsArray) {
  //       const match1 = { deleted: false };

  //       // ////console.log('sysarray', queryParams);

  //       clauseResult = await this.ClauseModel.aggregate([
  //         { $match: clauseSearchQuery1 },
  //         { $match: match1 },

  //         {
  //           $project: {
  //             _id: '$_id',
  //             number: 1,
  //             name: 1,
  //             description: 1,
  //             // 'clauses.id': 1,
  //             //systemName: '$name',
  //             systemId: 1,
  //             // applicable_locations: 1,
  //           },
  //         },
  //       ]).exec();
  //       // ////console.log('caluse result', clauseResult);
  //       clauseResultCount = await this.ClauseModel.aggregate([
  //         { $match: clauseSearchQuery1 },
  //         { $match: match1 },

  //         //{ $unwind: '$clauses' },
  //         // {
  //         //   $match: {
  //         //     $or: [
  //         //       { number: new RegExp(queryObj.searchQuery, 'i') },
  //         //       { name: new RegExp(queryObj.searchQuery, 'i') },
  //         //       {
  //         //         description: new RegExp(queryObj.searchQuery, 'i'),
  //         //       },
  //         //       //{ organizationId: queryParams.organization },
  //         //       ,
  //         //     ],
  //         //   },
  //         // },
  //         { $count: 'count' },
  //       ]).exec();
  //       const finalresult = await Promise.all(
  //         clauseResult.map(async (cl: any) => {
  //           const mongoose = require('mongoose'); // Import mongoose here if not already imported
  //           ////console.log('cl systemid', cl);
  //           let id: any = mongoose.Types.ObjectId(cl.systemId);
  //           let sys = await this.SystemModel.findById(id);
  //           ////console.log('sys', sys);
  //           const data: any = {
  //             name: cl.name,
  //             _id: cl._id,
  //             number: cl.number,
  //             systemName: sys ? sys.name : null,
  //             applicable_locations: sys
  //               ? await this.mapLocationIdsToNames(
  //                   sys.applicable_locations,
  //                   this.prisma.location,
  //                 )
  //               : null,
  //           };
  //           // ////console.log('data', data);
  //           return data;
  //         }),
  //       );

  //       const actualCount = clauseResultCount.length
  //         ? clauseResultCount[0].count
  //         : 0;
  //       ////console.log('caluse data', actualCount);
  //       modulesNameAndCount.push({
  //         name: 'Clauses',
  //         count: actualCount,
  //       });

  //       const ncSearchQueryObj = {
  //         text: queryObj.searchQuery,
  //         pagination: false,
  //         organization: queryParams.organization,
  //       };
  //       const queryCondition = {
  //         $or: [
  //           // { audit: { $in: auditIds } },
  //           // { type: { $regex: text, $options: 'i' } },
  //           { id: { $regex: ncSearchQueryObj.text, $options: 'i' } },
  //           // { 'clause.clauseNumber': { $regex: text, $options: 'i' } },
  //           { status: { $regex: ncSearchQueryObj.text, $options: 'i' } },
  //           { severity: { $regex: ncSearchQueryObj.text, $options: 'i' } },
  //         ],
  //         organization: ncSearchQueryObj.organization,
  //       };

  //       const [ncResult, ncCount] = await Promise.all([
  //         this.NcModel.find(queryCondition),
  //         this.NcModel.countDocuments(queryCondition),
  //       ]);

  //       modulesNameAndCount.push({
  //         name: 'NC',
  //         count: ncCount,
  //       });
  //       // ////console.log('modulesNameAndCount:', modulesNameAndCount);
  //       ////console.log('finalresult:', finalresult);
  //       //////console.log('result.data_length:', result.data_length);
  //       //////console.log('actualCount:', actualCount);

  //       return {
  //         modulesNameAndCount,
  //         result: {
  //           document: result,
  //           // clauses: [],
  //           clauses: finalresult,
  //           // nc: { ...ncSearhResult },
  //           nc: ncResult,
  //         },
  //       };
  //     } else {
  //       const match1 = { deleted: false };
  //       clauseResult = await this.ClauseModel.aggregate([
  //         { $match: clauseSearchQuery },
  //         { $match: match1 },
  //         {
  //           $project: {
  //             _id: '$_id',
  //             number: 1,
  //             name: 1,
  //             description: 1,
  //             // 'clauid': 1,
  //             // systemName: '$name',
  //             systemId: 1,
  //             // applicable_locations: 1,
  //           },
  //         },
  //       ]).exec();
  //       // ////console.log('clause result', clauseResult);

  //       let clausedata = [];
  //       const finalresult = await Promise.all(
  //         clauseResult.map(async (cl: any) => {
  //           const mongoose = require('mongoose'); // Import mongoose here if not already imported

  //           let id: any = mongoose.Types.ObjectId(cl.systemId);
  //           let sys = await this.SystemModel.findById(id);

  //           const data: any = {
  //             name: cl.name,
  //             _id: cl._id,
  //             number: cl.number,
  //             systemName: sys ? sys.name : null,
  //             applicable_locations: sys
  //               ? await this.mapLocationIdsToNames(
  //                   sys.applicable_locations,
  //                   this.prisma.location,
  //                 )
  //               : null,
  //           };

  //           return data;
  //         }),
  //       );

  //       clauseResultCount = await this.ClauseModel.aggregate([
  //         { $match: clauseSearchQuery },
  //         { $match: match1 },

  //         { $count: 'count' },
  //       ]).exec();

  //       const actualCount = clauseResultCount.length
  //         ? clauseResultCount[0].count
  //         : 0;

  //       modulesNameAndCount.push({
  //         name: 'Clauses',
  //         count: actualCount,
  //       });

  //       const ncSearchQueryObj = {
  //         text: queryObj.searchQuery,
  //         pagination: false,
  //         organization: queryParams.organization,
  //       };
  //       const queryCondition = {
  //         $or: [
  //           // { audit: { $in: auditIds } },
  //           // { type: { $regex: text, $options: 'i' } },
  //           { id: { $regex: ncSearchQueryObj.text, $options: 'i' } },
  //           // { 'clause.clauseNumber': { $regex: text, $options: 'i' } },
  //           { status: { $regex: ncSearchQueryObj.text, $options: 'i' } },
  //           { severity: { $regex: ncSearchQueryObj.text, $options: 'i' } },
  //         ],
  //         organization: ncSearchQueryObj.organization,
  //       };

  //       const [ncResult, ncCount] = await Promise.all([
  //         this.NcModel.find(queryCondition),
  //         this.NcModel.countDocuments(queryCondition),
  //       ]);

  //       modulesNameAndCount.push({
  //         name: 'NC',
  //         count: ncCount,
  //       });

  //       let hiraQuery: any = {
  //         organizationId: queryParams.organization,
  //         status : "active",

  //         $or: [
  //           { jobTitle: { $regex: queryObj.searchQuery, $options: 'i' } },
  //         ],
  //       };

  //       if (!!queryParams?.entityId) {
  //         hiraQuery = {
  //           ...hiraQuery,
  //           entityId: queryParams?.entityId,
  //         };
  //       }
  //       const hiraWithStepsResult = await this.getAllHiraWithSteps(hiraQuery, queryParams?.hiraPage, queryParams?.hiraPageSize);

  //       console.log('hiraWithStepsResult result', hiraWithStepsResult);

  //       modulesNameAndCount.push({
  //         name: 'HIRA',
  //         count: hiraWithStepsResult?.count,
  //       });

  //       // console.log('hira count', modulesNameAndCount);

  //       let aspectImpactQuery: any = {
  //         organizationId: queryParams.organization,
  //         $or: [
  //           { jobTitle: { $regex: queryObj.searchQuery, $options: 'i' } },
  //           { activity: { $regex: queryObj.searchQuery, $options: 'i' } },
  //         ],
  //       };

  //       if (!!queryParams?.entityId) {
  //         aspectImpactQuery = {
  //           ...aspectImpactQuery,
  //           entityId: queryParams?.entityId,
  //         };
  //       }

  //       const aspectImpactList = await this.aspectImpactModel.find(
  //         aspectImpactQuery,
  //         '_id jobTitle activity',
  //       );

  //       // console.log('aspect impact list', aspectImpactList);

  //       const aspectImpactCount = await this.aspectImpactModel.countDocuments({
  //         // organizationId: queryParams.organization,
  //         // entityId: queryParams?.entityId,
  //         // status: { $in: ['inWorkflow', 'active'] },
  //         $or: [
  //           { jobTitle: { $regex: queryObj.searchQuery, $options: 'i' } },
  //           { activity: { $regex: queryObj.searchQuery, $options: 'i' } },
  //         ],
  //       });

  //       // console.log('aspect impact count', aspectImpactCount);

  //       modulesNameAndCount.push({
  //         name: 'AspectImpact',
  //         count: aspectImpactCount,
  //       });

  //       // console.log('afete ai modulenames nad count', modulesNameAndCount);

  //       return {
  //         modulesNameAndCount,
  //         result: {
  //           document: result,
  //           // clauses: [],
  //           clauses: finalresult,
  //           // nc: { ...ncSearhResult },
  //           nc: ncResult,
  //           hira: hiraWithStepsResult?.data,
  //           aspectImpact: aspectImpactList,
  //         },
  //       };
  //     }
  //   } catch (error) {
  //     console.log('error in findall globalsearc', error);
  //   }
  // }

  async mapLocationIdsToNames(locationIds, locationsTable) {
    if (!locationIds || !locationsTable) {
      return null;
    }
    // ////console.log('locatinionids', locationIds);
    let locs = [];
    for (let loc of locationIds) {
      if (loc.id == 'All') {
        //////console.log('inside if all');
        const data = {
          id: 'All',
          _id: 'All',
        };
        locs.push(data);
      } else {
        const location = await locationsTable.findFirst({
          where: {
            id: loc.id,
          },
        });
        const data = {
          id: location.locationName,
          _id: location.id,
        };
        locs.push(data);
      }
    }
    //////console.log('locs array', locs);
    return locs;
  }
  async recycleBinList(userid) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });
    const client = new MongoClient(process.env.MONGO_DB_URI1);
    await client.connect();

    const db = client.db(process.env.MONGO_DB_NAME); // Replace with your database name

    const collections = [
      'Functions',

      'Location',
      'Entity',
      'Business',

      'User',

      'systems',
      'unitType',
      'auditsettings',
      'meetingtypes',
      'schedulemrms',
      'kpis',
    ];

    try {
      let result = [];
      for (const collection of collections) {
        // //console.log('collection name', collection);
        const table = db.collection(collection);
        //  //console.log('table', table);
        const docs = await table
          .find({ deleted: true, organizationId: activeUser.organizationId })
          .toArray();
        ////console.log(`Results in collection: ${collection}`);
        ////console.log(docs);
        let reords = [];

        result.push({ type: collection, documents: docs });
      }
      // //console.log('result', result);
      return result;
    } catch (err) {
      console.error('An error occurred:', err);
    } finally {
      client.close();
    }
  }
  async restoreAll(body, userid) {
    // console.log('body', body);
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });
    const idsToUpdate = await this.convertids(body);
    const client = new MongoClient(process.env.MONGO_DB_URI1);
    await client.connect();

    const db = client.db(process.env.MONGO_DB_NAME); // Replace with your database name

    const collections = [
      'Functions',

      'auditsettings',

      'Location',
      'Entity',
      'Business',
      'Doctype',
      'User',

      'systems',
      'unitType',
      'meetingtypes',
      'schedulemrms',
      'kpis',
    ];
    try {
      let result = [];
      for (const collection of collections) {
        const table = db.collection(collection);
        // Update documents in the collection
        // console.log('table', idsToUpdate);
        const updateResult = await table.updateMany(
          {
            $and: [
              { _id: { $in: idsToUpdate } }, // Condition 1: Filter by document IDs
              { deleted: true },
              { organizationId: activeUser.organizationId }, // Condition 2: Add your additional condition here
            ],
          },
          //  { _id: { $in: idsToUpdate } }, // Filter by document IDs
          { $set: { deleted: false } }, // Update the 'deleted' field
        );
        //console.log('update rest', updateResult);
        result.push({ type: collection, updateResult });
      }
      // console.log('result', result);
      return result;
    } catch (err) {
      console.error('An error occurred:', err);
    }
    // finally {
    //   client.close();
    // }
  }
  async deleteAllByIds(data, userid) {
    const idsToDelete = await this.convertids(data); // Assuming you have a list of IDs to delete
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    });
    const client = new MongoClient(process.env.MONGO_DB_URI1);
    await client.connect();

    const db = client.db(process.env.MONGO_DB_NAME); // Replace with your database name

    try {
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map((collection) => collection.name);
      const filteredCollectionNames = collectionNames.filter(
        (name) => name !== 'auditTrail',
      );
      let result = [];

      for (const collectionInfo of filteredCollectionNames) {
        const collectionName = collectionInfo;

        const table = db.collection(collectionName);
        // console.log('table', table);

        // Find all documents in the collection
        const documents = await table.find({}).toArray();
        // console.log('documents of table', documents, table);
        //skip the audittrial table for search
        if (collectionName === 'auditTrial') {
          continue;
        }
        // Check each document for the presence of IDs to be deleted
        for (const document of documents) {
          let containsId = false;

          for (const [key, value] of Object.entries(document)) {
            if (key === '_id') {
              continue; // Skip checking the _id field itself
            }

            if (Array.isArray(value)) {
              //console.log('inside if');
              // Check if the array contains any of the IDs to be deleted
              for (const id of value) {
                if (idsToDelete.includes(id)) {
                  containsId = true;
                  break;
                }
              }
            } else {
              //console.log('inside else');
              // Code block remains the same for non-array values
              if (typeof value === 'string' && idsToDelete.includes(value)) {
                containsId = true;
                break;
              }

              if (
                typeof value === 'string' &&
                ObjectId.isValid(value) &&
                idsToDelete.some((objId) => objId.toString() === value)
              ) {
                containsId = true;
                break;
              }

              if (
                typeof value === 'object' &&
                value !== null &&
                value.constructor.name === 'ObjectID' &&
                !value.equals(new ObjectId(document._id.toString()))
              ) {
                containsId = idsToDelete.includes(value.toString());
                if (containsId) break;
              }
            }
          }

          // console.log('containsId', containsId);

          if (containsId) {
            // //console.log(
            //   `Cannot delete IDs from ${collectionName} as they are referenced in other tables.`,
            // );
            return new ConflictException();
          }
        }

        // Delete documents in the collection based on IDs
        const deleteResult = await table.deleteMany({
          _id: { $in: idsToDelete },
        });
        result.push({ type: collectionName, deleteResult });
      }

      return result;
    } catch (err) {
      console.error('An error occurred:', err);
    } finally {
      client.close();
    }
  }
  async convertids(data) {
    let ids = [];
    for (let obj of data) {
      if (
        obj.moduleType === 'Documents' ||
        obj.moduleType === 'User' ||
        obj.moduleType === 'Location' ||
        obj.moduleType === 'Doctype' ||
        obj.moduleType === 'Business' ||
        obj.moduleType === 'Entity' ||
        obj.moduleType === 'Functions' ||
        obj.moduleType === 'unitType'
      ) {
        // console.log('type of id in convertids', typeof obj.id);
        ids.push(obj.id);
      } else {
        ids.push(new ObjectId(obj.id));
      }
    }
    return ids;
  }
}
