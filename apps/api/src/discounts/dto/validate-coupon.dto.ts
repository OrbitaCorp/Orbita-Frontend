import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ValidateCouponDto {
  @IsString() code!: string;
  @IsArray() items!: unknown[];
  @IsOptional() @IsUUID() customerId?: string;
}
