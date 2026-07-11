import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateNotificationConfigDto {
  @IsObject() matrix!: Record<string, { panel: boolean; email: boolean; whatsapp: boolean }>;
}
