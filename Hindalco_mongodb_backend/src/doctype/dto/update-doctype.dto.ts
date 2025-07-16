import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { LocationAdminDto } from '../../location/dto/location-admin.dto';

export class UpdateDoctypeDto {
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
  @IsString()
  prefix: string[];

  @IsNotEmpty()
  @IsString()
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
  @IsString()
  locationIdOfDoctype?: object[];

  @IsString()
  entityIdOfDoctype?: string;

  @IsArray()
  document_classification?: string;

  @IsArray()
  distributionUsers: string[];
  @IsArray()
  readAccessUsers: string[];

  @IsString()
  distributionList: string;

  @IsArray()
  applicable_systems: string[];


  @IsString()
  whoCanDownload: string;

  @IsArray()
  whoCanDownloadUsers: string[];
}
