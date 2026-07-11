import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CashMovementDto {
  @IsIn(['INGRESO', 'EGRESO']) type!: 'INGRESO' | 'EGRESO';
  @IsNumber() amount!: number;
  @IsString() reason!: string;
}
