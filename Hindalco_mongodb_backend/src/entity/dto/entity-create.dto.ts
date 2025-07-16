import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

interface objId {
  id: string;
}
export class EntityCreateDto {
  @IsNotEmpty()
  @IsString()
  realm: string;

  @IsNotEmpty()
  @IsString()
  entityName: string;

  @IsNotEmpty()
  @IsString()
  entityTypeId: any;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsArray()
  location: objId;

  // @IsNotEmpty()
  // @IsString()
  // business: string;

  // @IsNotEmpty()
  // @IsString()
  // sections: string[];
  @IsOptional()
  @IsArray()
  functionId: objId;

  @IsOptional()
  @IsArray()
  sections: objId;

  @IsNotEmpty()
  @IsString()
  entityId: string;

  @IsOptional()
  @IsArray()
  users: object[];

  @IsOptional()
  @IsArray()
  additionalAuditee: object[];

  @IsOptional()
  @IsArray()
  notification: object[];
}
