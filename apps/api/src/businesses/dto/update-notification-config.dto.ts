import { IsObject } from 'class-validator';

// Las claves de `matrix` (eventos) y las sub-claves (canales) se validan contra un set
// cerrado en BusinessesService — un Record dinámico no se puede acotar con decoradores
// declarativos de class-validator sin una lista fija de propiedades.
export class UpdateNotificationConfigDto {
  @IsObject() matrix!: Record<string, { panel: boolean; email: boolean; whatsapp: boolean }>;
}
