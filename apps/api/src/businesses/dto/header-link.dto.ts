import { IsBoolean, IsString } from 'class-validator';

export class HeaderLinkDto {
  @IsString() id!: string;
  @IsString() label!: string;
  @IsBoolean() on!: boolean;
}
