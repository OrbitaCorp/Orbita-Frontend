import { IsString, IsOptional } from 'class-validator';

// `subdomain` y `mode` NO se editan acá — son de setup inicial / zona peligrosa
// (ver decisión documentada: CONTRATO_API.md permite editar `mode` en este mismo
// endpoint, pero esta fase lo excluye deliberadamente).
export class UpdateBusinessDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() description?: string;
}
