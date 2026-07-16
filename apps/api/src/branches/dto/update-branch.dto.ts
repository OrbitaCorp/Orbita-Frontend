import { IsBoolean, IsLatitude, IsLongitude, IsOptional, IsString } from 'class-validator';

export class UpdateBranchDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsLatitude() latitude?: number;
  @IsOptional() @IsLongitude() longitude?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
