import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderItem {
  @IsUUID() id!: string;
  @IsInt() position!: number;
  @IsOptional() @IsUUID() parentId?: string | null;
}
export class ReorderCategoriesDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => ReorderItem) items!: ReorderItem[];
}
