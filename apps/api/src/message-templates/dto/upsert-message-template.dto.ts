import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertMessageTemplateDto {
  @IsString() name!: string;
  @IsString() text!: string;
  @IsIn(['PEDIDO', 'RETIRO', 'ENVIO', 'POSTVENTA', 'OTRO']) category!: string;
}
