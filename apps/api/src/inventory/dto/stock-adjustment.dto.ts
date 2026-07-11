import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class StockAdjustmentDto {
  @IsUUID() variantId!: string;
  @IsOptional() @IsUUID() branch_id?: string;
  @IsInt() quantity!: number;
  @IsString() reason!: string;
}
