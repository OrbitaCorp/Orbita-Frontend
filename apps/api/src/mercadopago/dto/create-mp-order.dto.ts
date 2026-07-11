import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMpOrderDto {
  @IsUUID() orderId!: string;
  @IsOptional() @IsUUID() deviceId?: string;
}
