import { IsString, ValidateIf } from 'class-validator';

export class HeroSlideDto {
  @IsString() id!: string;
  @IsString() titulo!: string;
  @IsString() subtitulo!: string;

  @ValidateIf((o: HeroSlideDto) => o.img !== null)
  @IsString()
  img!: string | null;

  @IsString() cta!: string;
}
