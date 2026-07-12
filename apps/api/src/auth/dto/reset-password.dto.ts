import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  /** Access token extraído del hash de la URL de recuperación (#access_token=...). */
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}
