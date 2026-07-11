import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CheckoutItemInput {
  @IsUUID() variantId!: string;
  @IsInt() @Min(1) quantity!: number;
}
class CheckoutBuyerInput {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsOptional() @IsString() phone?: string;
}
export class CheckoutDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => CheckoutItemInput) items!: CheckoutItemInput[];
  @ValidateNested() @Type(() => CheckoutBuyerInput) buyer!: CheckoutBuyerInput;
  @IsOptional() @IsObject() shippingAddress?: Record<string, unknown>;
  @IsIn(['MERCADOPAGO', 'TRANSFER', 'PICKUP']) paymentMethod!: string;
  @IsOptional() @IsString() couponCode?: string;
}
