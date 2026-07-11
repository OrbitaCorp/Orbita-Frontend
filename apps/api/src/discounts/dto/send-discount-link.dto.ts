import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SendDiscountLinkDto {
  @IsOptional() @IsUUID() customerId?: string;
  @IsOptional() @IsEmail() email?: string;
}
