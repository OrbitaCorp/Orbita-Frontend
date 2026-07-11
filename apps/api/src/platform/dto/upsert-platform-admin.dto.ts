import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertPlatformAdminDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsIn(['SUPERADMIN', 'OPERATOR']) role!: 'SUPERADMIN' | 'OPERATOR';
}
