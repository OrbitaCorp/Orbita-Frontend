import { IsIn } from 'class-validator';

// El modo del negocio solo admite estos dos valores (enum BusinessMode del schema).
// Tiene DTO y endpoint propios (no forma parte de UpdateBusinessDto) porque cambiar
// de modo afecta todo el storefront — ver decisión en PENDIENTES.md, Fase 2.
export class ChangeModeDto {
  @IsIn(['FULL', 'SHOWCASE'])
  mode!: 'FULL' | 'SHOWCASE';
}
