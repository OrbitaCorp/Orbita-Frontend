import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterDto {
  @IsString() slug!: string;
  @IsString() firstName!: string;
  @IsOptional() @IsString() lastName?: string;
  @IsEmail() email!: string;
  @IsOptional() @IsString() phone?: string;
  @IsString() password!: string;
}
