import { IsBoolean } from 'class-validator';

// Un solo endpoint (POST /business/pause) cubre pausar Y reanudar según el valor de
// `paused` — no hay una ruta /unpause separada (ver CONTRATO_API.md §Businesses).
export class PauseBusinessDto {
  @IsBoolean() paused!: boolean;
}
