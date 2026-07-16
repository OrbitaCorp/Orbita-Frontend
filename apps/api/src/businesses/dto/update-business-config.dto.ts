import { IsString, IsOptional, IsNumber, IsBoolean, IsEmail, IsArray } from 'class-validator';

export class UpdateBusinessConfigDto {
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() scheduleText?: string;
  @IsOptional() @IsBoolean() acceptsMercadopago?: boolean;
  @IsOptional() @IsBoolean() acceptsCash?: boolean;
  @IsOptional() @IsBoolean() acceptsTransfer?: boolean;
  @IsOptional() @IsBoolean() acceptsPickup?: boolean;
  @IsOptional() @IsBoolean() acceptsCard?: boolean;
  @IsOptional() @IsString() transferAlias?: string;
  @IsOptional() @IsNumber() shippingBase?: number;
  @IsOptional() @IsNumber() freeShippingFrom?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) deliveryZones?: string[];
  @IsOptional() @IsString() shippingPolicy?: string;
  @IsOptional() @IsString() instagram?: string;
  @IsOptional() @IsString() tiktok?: string;
  @IsOptional() @IsString() facebook?: string;
}
