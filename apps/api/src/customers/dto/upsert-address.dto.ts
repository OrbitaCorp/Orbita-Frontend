import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertAddressDto {
  @IsOptional() @IsString() alias?: string;
  @IsString() street!: string;
  @IsOptional() @IsString() floor?: string;
  @IsString() city!: string;
  @IsOptional() @IsString() zip?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}
