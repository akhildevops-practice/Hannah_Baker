import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrgDto {
  @IsNotEmpty()
  @IsString()
  realm: string;
  //check for slash
  @IsNotEmpty()
  @IsString()
  instanceUrl: string;

  @IsNotEmpty()
  @IsString()
  principalGeography: string;

  @IsNotEmpty()
  @IsString()
  domain: string;
}
