import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CartItemInput {
  @IsUUID() variantId!: string;
  @IsInt() quantity!: number;
  @IsNumber() unitPrice!: number;
}
export class EvaluateDiscountsDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => CartItemInput) items!: CartItemInput[];
  @IsOptional() @IsUUID() customerId?: string;
  @IsOptional() @IsString() couponCode?: string;
  @IsIn(['POS', 'STOREFRONT']) channel!: 'POS' | 'STOREFRONT';
}
