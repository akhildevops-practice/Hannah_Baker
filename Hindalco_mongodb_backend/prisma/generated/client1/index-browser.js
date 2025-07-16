
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  kcId: 'kcId',
  email: 'email',
  username: 'username',
  firstname: 'firstname',
  lastname: 'lastname',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  updatedAt: 'updatedAt',
  updatedBy: 'updatedBy',
  enabled: 'enabled',
  organizationId: 'organizationId',
  locationId: 'locationId',
  entityId: 'entityId',
  userType: 'userType',
  status: 'status',
  avatar: 'avatar',
  deleted: 'deleted',
  roleId: 'roleId',
  functionId: 'functionId',
  additionalUnits: 'additionalUnits'
};

exports.Prisma.ModelsScalarFieldEnum = {
  id: 'id',
  modelNo: 'modelNo',
  modelName: 'modelName',
  description: 'description',
  organizationId: 'organizationId',
  partsId: 'partsId',
  claimId: 'claimId'
};

exports.Prisma.PartsScalarFieldEnum = {
  id: 'id',
  partNo: 'partNo',
  partName: 'partName',
  description: 'description',
  organizationId: 'organizationId',
  entityId: 'entityId',
  claimId: 'claimId',
  modelsId: 'modelsId'
};

exports.Prisma.ClaimScalarFieldEnum = {
  id: 'id',
  partId: 'partId',
  modelId: 'modelId',
  partRecieptDate: 'partRecieptDate',
  vehicleType: 'vehicleType',
  FrameNo: 'FrameNo',
  prNo: 'prNo',
  lineOffDate: 'lineOffDate',
  saleDate: 'saleDate',
  repairDate: 'repairDate',
  shipmentId: 'shipmentId',
  investigationId: 'investigationId',
  settleMonth: 'settleMonth',
  kms: 'kms',
  problemId: 'problemId',
  mis: 'mis',
  claimNo: 'claimNo'
};

exports.Prisma.ProblemScalarFieldEnum = {
  id: 'id',
  problem: 'problem',
  createdAt: 'createdAt',
  organizationId: 'organizationId'
};

exports.Prisma.ClaimToEntityScalarFieldEnum = {
  id: 'id',
  claimId: 'claimId',
  entityId: 'entityId'
};

exports.Prisma.InvestigationScalarFieldEnum = {
  id: 'id',
  rootCause: 'rootCause',
  counterMeasure: 'counterMeasure',
  leadTime: 'leadTime',
  claimType: 'claimType',
  implementDate: 'implementDate',
  attachment: 'attachment',
  claimNo: 'claimNo',
  problemId: 'problemId'
};

exports.Prisma.ShipmentScalarFieldEnum = {
  id: 'id',
  shipmentDate: 'shipmentDate',
  quantity: 'quantity',
  location: 'location',
  InvoiceNumber: 'InvoiceNumber',
  dueDate: 'dueDate',
  shipmentCost: 'shipmentCost',
  createdBy: 'createdBy',
  awb: 'awb',
  supplierName: 'supplierName',
  supplierReport: 'supplierReport'
};

exports.Prisma.OrganizationScalarFieldEnum = {
  id: 'id',
  kcId: 'kcId',
  organizationName: 'organizationName',
  realmName: 'realmName',
  instanceUrl: 'instanceUrl',
  principalGeography: 'principalGeography',
  loginUrl: 'loginUrl',
  logoutUrl: 'logoutUrl',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  updatedAt: 'updatedAt',
  updatedBy: 'updatedBy',
  activeModules: 'activeModules',
  clientID: 'clientID',
  clientSecret: 'clientSecret',
  fiscalYearQuarters: 'fiscalYearQuarters',
  fiscalYearFormat: 'fiscalYearFormat',
  auditYear: 'auditYear',
  logoUrl: 'logoUrl',
  deleted: 'deleted'
};

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  kcId: 'kcId',
  roleName: 'roleName',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  updatedAt: 'updatedAt',
  updatedBy: 'updatedBy',
  deleted: 'deleted',
  organizationId: 'organizationId',
  locationId: 'locationId'
};

exports.Prisma.SystemTypeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  updatedAt: 'updatedAt',
  color: 'color',
  updatedBy: 'updatedBy',
  deleted: 'deleted',
  organizationId: 'organizationId'
};

exports.Prisma.EntityTypeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  updatedAt: 'updatedAt',
  updatedBy: 'updatedBy',
  organizationId: 'organizationId',
  deleted: 'deleted'
};

exports.Prisma.BusinessTypeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  deleted: 'deleted',
  organizationId: 'organizationId'
};

exports.Prisma.BusinessScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  updatedAt: 'updatedAt',
  updatedBy: 'updatedBy',
  organizationId: 'organizationId',
  deleted: 'deleted'
};

exports.Prisma.FunctionsScalarFieldEnum = {
  id: 'id',
  name: 'name',
  functionId: 'functionId',
  description: 'description',
  functionHead: 'functionHead',
  functionSpoc: 'functionSpoc',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  updatedAt: 'updatedAt',
  updatedBy: 'updatedBy',
  deleted: 'deleted',
  organizationId: 'organizationId',
  type: 'type',
  locationId: 'locationId',
  businessId: 'businessId',
  unitId: 'unitId'
};

exports.Prisma.SectionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  updatedAt: 'updatedAt',
  updatedBy: 'updatedBy',
  organizationId: 'organizationId',
  deleted: 'deleted'
};

exports.Prisma.LocationScalarFieldEnum = {
  id: 'id',
  locationName: 'locationName',
  locationType: 'locationType',
  locationId: 'locationId',
  description: 'description',
  status: 'status',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  updatedBy: 'updatedBy',
  functionId: 'functionId',
  deleted: 'deleted',
  organizationId: 'organizationId',
  users: 'users',
  businessTypeId: 'businessTypeId',
  type: 'type'
};

exports.Prisma.EntityScalarFieldEnum = {
  id: 'id',
  entityName: 'entityName',
  description: 'description',
  entityTypeId: 'entityTypeId',
  organizationId: 'organizationId',
  locationId: 'locationId',
  createdBy: 'createdBy',
  entityId: 'entityId',
  deleted: 'deleted',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  updatedBy: 'updatedBy',
  users: 'users',
  sections: 'sections',
  functionId: 'functionId'
};

exports.Prisma.LocationBusinessScalarFieldEnum = {
  id: 'id',
  locationId: 'locationId',
  businessId: 'businessId'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  type: 'type',
  text: 'text',
  content: 'content',
  receiver: 'receiver',
  creator: 'creator',
  date: 'date',
  style: 'style',
  read: 'read'
};

exports.Prisma.DoctypeScalarFieldEnum = {
  id: 'id',
  locationId: 'locationId',
  documentTypeName: 'documentTypeName',
  documentNumbering: 'documentNumbering',
  reviewFrequency: 'reviewFrequency',
  revisionRemind: 'revisionRemind',
  prefix: 'prefix',
  suffix: 'suffix',
  organizationId: 'organizationId',
  readAccess: 'readAccess',
  readAccessUsers: 'readAccessUsers',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  updatedBy: 'updatedBy',
  createdBy: 'createdBy',
  applicable_systems: 'applicable_systems',
  users: 'users',
  document_classification: 'document_classification',
  entityId: 'entityId',
  distributionUsers: 'distributionUsers',
  currentVersion: 'currentVersion',
  distributionList: 'distributionList'
};

exports.Prisma.DocumentsScalarFieldEnum = {
  id: 'id',
  doctypeId: 'doctypeId',
  organizationId: 'organizationId',
  documentName: 'documentName',
  documentNumbering: 'documentNumbering',
  reasonOfCreation: 'reasonOfCreation',
  effectiveDate: 'effectiveDate',
  nextRevisionDate: 'nextRevisionDate',
  currentVersion: 'currentVersion',
  documentLink: 'documentLink',
  description: 'description',
  tags: 'tags',
  documentState: 'documentState',
  locationId: 'locationId',
  entityId: 'entityId',
  system: 'system',
  section: 'section',
  revertComment: 'revertComment',
  docType: 'docType',
  documentClassification: 'documentClassification',
  issueNumber: 'issueNumber',
  retireComment: 'retireComment',
  revisionReminderFlag: 'revisionReminderFlag',
  isVersion: 'isVersion',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  approvedDate: 'approvedDate',
  countNumber: 'countNumber',
  createdBy: 'createdBy',
  distributionList: 'distributionList',
  documentId: 'documentId',
  reviewers: 'reviewers',
  approvers: 'approvers',
  creators: 'creators',
  distributionUsers: 'distributionUsers',
  readAccess: 'readAccess',
  readAccessUsers: 'readAccessUsers',
  versionInfo: 'versionInfo'
};

exports.Prisma.DocumentAttachmentHistoryScalarFieldEnum = {
  id: 'id',
  documentId: 'documentId',
  updatedLink: 'updatedLink',
  updatedBy: 'updatedBy',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReferenceDocumentsScalarFieldEnum = {
  id: 'id',
  documentLink: 'documentLink',
  type: 'type',
  documentName: 'documentName',
  version: 'version',
  documentId: 'documentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  referenceDocId: 'referenceDocId',
  versionId: 'versionId'
};

exports.Prisma.VersionReferenceDocumentsScalarFieldEnum = {
  id: 'id',
  documentLink: 'documentLink',
  type: 'type',
  documentName: 'documentName',
  version: 'version',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  referenceDocId: 'referenceDocId',
  versionId: 'versionId',
  documentsId: 'documentsId'
};

exports.Prisma.DocumentVersionsScalarFieldEnum = {
  id: 'id',
  versionName: 'versionName',
  userId: 'userId',
  by: 'by',
  approvedDate: 'approvedDate',
  versionLink: 'versionLink',
  documentId: 'documentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  documentName: 'documentName',
  documentNumbering: 'documentNumbering',
  reasonOfCreation: 'reasonOfCreation',
  effectiveDate: 'effectiveDate',
  description: 'description',
  issueNumber: 'issueNumber'
};

exports.Prisma.DocumentCommentsScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  commentBy: 'commentBy',
  commentText: 'commentText',
  documentId: 'documentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DocumentWorkFlowHistoryScalarFieldEnum = {
  id: 'id',
  actionName: 'actionName',
  userId: 'userId',
  actionBy: 'actionBy',
  documentId: 'documentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DocumentAdminsScalarFieldEnum = {
  id: 'id',
  type: 'type',
  firstname: 'firstname',
  lastname: 'lastname',
  email: 'email',
  userId: 'userId',
  doctypeId: 'doctypeId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdditionalDocumentAdminsScalarFieldEnum = {
  id: 'id',
  type: 'type',
  firstname: 'firstname',
  lastname: 'lastname',
  email: 'email',
  userId: 'userId',
  documentId: 'documentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LogsScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  resource: 'resource',
  type: 'type',
  additionalDetails: 'additionalDetails'
};

exports.Prisma.UserPersonalisationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  organizationId: 'organizationId',
  targetObject: 'targetObject',
  targetObjectId: 'targetObjectId'
};

exports.Prisma.ConnectedAppsScalarFieldEnum = {
  id: 'id',
  sourceName: 'sourceName',
  clientId: 'clientId',
  clientSecret: 'clientSecret',
  baseURL: 'baseURL',
  user: 'user',
  password: 'password',
  redirectURL: 'redirectURL',
  grantType: 'grantType',
  description: 'description',
  deleted: 'deleted',
  organizationId: 'organizationId',
  createdModifiedBy: 'createdModifiedBy',
  createdModifiedAt: 'createdModifiedAt',
  locationId: 'locationId',
  Status: 'Status'
};

exports.Prisma.UnitTypeScalarFieldEnum = {
  id: 'id',
  unitType: 'unitType',
  unitOfMeasurement: 'unitOfMeasurement',
  organizationId: 'organizationId',
  locationId: 'locationId',
  deleted: 'deleted',
  createdModifiedBy: 'createdModifiedBy',
  createdModifiedAt: 'createdModifiedAt',
  connectedAppsId: 'connectedAppsId'
};

exports.Prisma.KpiScalarFieldEnum = {
  id: 'id',
  kpiName: 'kpiName',
  kpiType: 'kpiType',
  keyFields: 'keyFields',
  unitTypeId: 'unitTypeId',
  uom: 'uom',
  sourceId: 'sourceId',
  status: 'status',
  apiEndPoint: 'apiEndPoint',
  kpiDescription: 'kpiDescription',
  kpiTargetType: 'kpiTargetType',
  organizationId: 'organizationId',
  locationId: 'locationId',
  createdModifiedBy: 'createdModifiedBy',
  createdModifiedAt: 'createdModifiedAt'
};

exports.Prisma.AuditTrialScalarFieldEnum = {
  id: 'id',
  moduleType: 'moduleType',
  actionType: 'actionType',
  transactionId: 'transactionId',
  actionBy: 'actionBy',
  actionDate: 'actionDate'
};

exports.Prisma.PrefixSuffixScalarFieldEnum = {
  id: 'id',
  prefix: 'prefix',
  suffix: 'suffix',
  moduleType: 'moduleType',
  location: 'location',
  organizationId: 'organizationId',
  createdBy: 'createdBy',
  createdAt: 'createdAt'
};

exports.Prisma.SerialNumberScalarFieldEnum = {
  id: 'id',
  moduleType: 'moduleType',
  location: 'location',
  entity: 'entity',
  year: 'year',
  tid: 'tid',
  serialNumber: 'serialNumber',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  organizationId: 'organizationId'
};

exports.Prisma.RolesTableScalarFieldEnum = {
  id: 'id',
  orgId: 'orgId',
  unitId: 'unitId',
  users: 'users',
  roleId: 'roleId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};


exports.Prisma.ModelName = {
  User: 'User',
  Models: 'Models',
  Parts: 'Parts',
  Claim: 'Claim',
  Problem: 'Problem',
  ClaimToEntity: 'ClaimToEntity',
  Investigation: 'Investigation',
  Shipment: 'Shipment',
  Organization: 'Organization',
  Role: 'Role',
  SystemType: 'SystemType',
  EntityType: 'EntityType',
  businessType: 'businessType',
  Business: 'Business',
  Functions: 'Functions',
  Section: 'Section',
  Location: 'Location',
  Entity: 'Entity',
  LocationBusiness: 'LocationBusiness',
  Notification: 'Notification',
  Doctype: 'Doctype',
  Documents: 'Documents',
  documentAttachmentHistory: 'documentAttachmentHistory',
  ReferenceDocuments: 'ReferenceDocuments',
  VersionReferenceDocuments: 'VersionReferenceDocuments',
  DocumentVersions: 'DocumentVersions',
  DocumentComments: 'DocumentComments',
  DocumentWorkFlowHistory: 'DocumentWorkFlowHistory',
  documentAdmins: 'documentAdmins',
  AdditionalDocumentAdmins: 'AdditionalDocumentAdmins',
  Logs: 'Logs',
  userPersonalisation: 'userPersonalisation',
  ConnectedApps: 'ConnectedApps',
  unitType: 'unitType',
  kpi: 'kpi',
  auditTrial: 'auditTrial',
  prefixSuffix: 'prefixSuffix',
  serialNumber: 'serialNumber',
  rolesTable: 'rolesTable'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
