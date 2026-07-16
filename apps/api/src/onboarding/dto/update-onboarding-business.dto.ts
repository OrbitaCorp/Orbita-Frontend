import { IsArray, IsBoolean, IsIn, IsOptional, IsString, Matches } from 'class-validator';

// Solo aplicable mientras el negocio sigue "en configuración" (isActive: false).
// Una vez publicado, cambiar subdomain/mode pasa por flujos dedicados con sus
// propias validaciones (ver PENDIENTES.md).
export class UpdateOnboardingBusinessDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() description?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'subdomain solo puede contener minúsculas, números y guiones' })
  subdomain?: string;

  @IsOptional() @IsIn(['FULL', 'SHOWCASE']) mode?: 'FULL' | 'SHOWCASE';

  // Wizard RBT-293 — pasos posteriores al modelo básico de negocio
  @IsOptional() @IsArray() @IsString({ each: true }) subrubros?: string[];
  @IsOptional() @IsIn(['solo', 'mini', 'medio', 'grande']) teamSize?: string;
  @IsOptional() @IsBoolean() operatesPhysical?: boolean;
  @IsOptional() @IsBoolean() operatesOnline?: boolean;
}
