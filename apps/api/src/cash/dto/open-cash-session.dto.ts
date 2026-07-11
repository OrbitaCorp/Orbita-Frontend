import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OpenCashSessionDto {
  @IsOptional() @IsUUID() branch_id?: string;
  @IsNumber() initialAmount!: number;
  @IsOptional() @IsString() notes?: string;
}
