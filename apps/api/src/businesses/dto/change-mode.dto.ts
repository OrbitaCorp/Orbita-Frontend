import { IsIn } from 'class-validator';

// Acá defino qué se puede mandar cuando se cambia el modo de la tienda: FULL
// (tienda completa, con carrito) o SHOWCASE (solo catálogo, sin comprar). Cualquier
// otra cosa se rechaza sola con un error. Lo separé del resto de los datos del
// negocio porque cambiar el modo cambia toda la tienda — anotado en PENDIENTES.md.
export class ChangeModeDto {
  @IsIn(['FULL', 'SHOWCASE'])
  mode!: 'FULL' | 'SHOWCASE';
}
