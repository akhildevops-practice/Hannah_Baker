import {
  IsAlpha,
  IsArray,
  IsNotEmpty,
  IsNumber,
  isString,
  IsString,
} from 'class-validator';
import { LocationAdminDto } from '../../location/dto/location-admin.dto';

export class CreateDoctypeDto {
  @IsNotEmpty()
  @IsString()
  documentTypeName?: string;

  @IsNotEmpty()
  @IsString()
  documentNumbering: string;
  @IsNotEmpty()
  @IsNumber()
  reviewFrequency?: number;
  @IsNotEmpty()
  @IsNumber()
  revisionRemind?: number;

  @IsNotEmpty()
  @IsString({ each: true })
  prefix: string[];

  @IsNotEmpty()
  @IsString({ each: true })
  suffix: string[];

  @IsNotEmpty()
  @IsArray()
  creators: object[];
  @IsNotEmpty()
  @IsArray()
  approvers: object[];
  @IsNotEmpty()
  @IsArray()
  reviewers: object[];
  @IsNotEmpty()
  readAccess: any;

  @IsArray()
  locationIdOfDoctype?: object[];

  @IsArray()
  users?: object[];

  @IsString()
  entityIdOfDoctype?: string;

  @IsString()
  document_classification?: string;

  @IsArray()
  applicable_systems: string[];

  @IsArray()
  distributionUsers?: string[];

  @IsArray()
  readAccessUsers?: string[];

  @IsString()
  distributionList: string;

  @IsString()
  currentVersion: string;


  @IsString()
  whoCanDownload: string;

  @IsArray()
  whoCanDownloadUsers: string[];
}

// export class creator {
//     id: string
//     email: string
//     firstName: string
//     lastName: string

// }

// export class readAccessRestricted {
//     type: string
//     usersWithAccess: string[]

// }
