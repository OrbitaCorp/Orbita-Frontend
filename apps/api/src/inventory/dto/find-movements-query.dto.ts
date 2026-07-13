import { IsDateString, IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindMovementsQueryDto {
  @IsOptional() @IsUUID() variantId?: string;
  @IsOptional() @IsIn(['ENTRADA', 'SALIDA', 'AJUSTE']) type?: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  @IsOptional() @IsUUID() branch_id?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
}
