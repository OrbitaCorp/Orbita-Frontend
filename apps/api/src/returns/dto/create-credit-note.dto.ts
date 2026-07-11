import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCreditNoteDto {
  @IsUUID() orderId!: string;
  @IsOptional() @IsUUID() returnId?: string;
  @IsOptional() @IsUUID() customerId?: string;
  @IsNumber() amount!: number;
  @IsIn(['BALANCE', 'REFUND']) type!: string;
}
