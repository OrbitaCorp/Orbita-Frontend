import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsUUID, IsEmail, IsArray, IsIn, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStorefrontConfigDto {
  @IsOptional() @IsString() storeName?: string;
  @IsOptional() @IsString() tagline?: string;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsString() faviconUrl?: string;
  @IsOptional() @IsString() colorPrimary?: string;
  @IsOptional() @IsString() colorSecondary?: string;
  @IsOptional() @IsString() colorAccent?: string;
  @IsOptional() @IsString() colorBackground?: string;
  @IsOptional() @IsIn(['light', 'dark']) colorMode?: 'light' | 'dark';
  @IsOptional() @IsString() fontFamily?: string;
  @IsOptional() @IsNumber() fontScale?: number;
  @IsOptional() @IsString() headerLayout?: string;
  @IsOptional() @IsString() gridLayout?: string;
  @IsOptional() @IsInt() cardRadius?: number;
  @IsOptional() @IsArray() heroSlides?: unknown[];
  @IsOptional() @IsArray() headerLinks?: unknown[];
  @IsOptional() @IsBoolean() showReviews?: boolean;
  @IsOptional() @IsBoolean() showNewBadge?: boolean;
  @IsOptional() @IsBoolean() showWhatsapp?: boolean;
}
