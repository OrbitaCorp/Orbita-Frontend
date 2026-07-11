import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ImageOrderItem {
  @IsUUID() id!: string;
  @IsInt() position!: number;
}
export class ReorderImagesDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => ImageOrderItem) items!: ImageOrderItem[];
  @IsOptional() @IsUUID() primaryId?: string;
}
