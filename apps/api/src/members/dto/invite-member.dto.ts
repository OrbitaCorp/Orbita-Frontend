import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InviteMemberDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsUUID() roleId!: string;
}
