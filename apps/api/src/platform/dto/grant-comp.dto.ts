import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GrantCompDto {
  @IsString() currentPeriodEnd!: string;
  @IsString() grantReason!: string;
}
