import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReturnDto {
  @IsUUID() orderId!: string;
  @IsOptional() @IsUUID() orderItemId?: string;
  @IsInt() quantity!: number;
  @IsNumber() amount!: number;
  @IsString() reason!: string;
  @IsIn(['CREDIT_NOTE', 'REFUND']) refundMethod!: string;
}
