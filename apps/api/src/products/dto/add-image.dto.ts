import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddImageDto {
  @IsOptional() @IsUUID() optionValueId?: string;
  // multipart/form-data envía todo como string ("true"/"false").
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value === 'true' : value))
  @IsBoolean()
  isPrimary?: boolean;
}
