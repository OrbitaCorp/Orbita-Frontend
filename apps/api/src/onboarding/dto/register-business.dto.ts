import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterBusinessDto {
  @IsString() ownerName!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
  @IsString() businessName!: string;
}
