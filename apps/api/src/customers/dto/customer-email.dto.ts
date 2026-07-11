import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomerEmailDto {
  @IsArray() @IsUUID('4', { each: true }) customerIds!: string[];
  @IsString() subject!: string;
  @IsString() body!: string;
}
