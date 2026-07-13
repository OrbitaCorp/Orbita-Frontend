import { IsBooleanString, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindStockQueryDto {
  @IsOptional() @IsUUID() branch_id?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsBooleanString() lowStock?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
}
