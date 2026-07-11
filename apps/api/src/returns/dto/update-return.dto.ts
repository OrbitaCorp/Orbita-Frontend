import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateReturnDto {
  @IsOptional() @IsIn(['PENDING', 'IN_PROCESS', 'APPROVED', 'REJECTED']) status?: string;
  @IsOptional() @IsIn(['CREDIT_NOTE', 'REFUND']) refundMethod?: string;
}
