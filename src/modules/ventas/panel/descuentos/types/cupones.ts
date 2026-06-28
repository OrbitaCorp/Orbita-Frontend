import type { OrdenDireccion } from './comunes'
import type { AlcanceDescuento, NivelProducto } from './descuentos'

// ─── Enums ────────────────────────────────────────────────────────────────────

export type TipoCupon = 'porcentaje' | 'monto_fijo'
export type EstadoCupon = 'activo' | 'inactivo' | 'programado' | 'expirado' | 'agotado'

// Etiqueta de la columna "Tipo" = combinación tipo de descuento × alcance.
export type TipoCuponLabelKey =
  | 'porcentaje_ticket'
  | 'monto_fijo_ticket'
  | 'porcentaje_producto'
  | 'monto_fijo_producto'

// ─── Entidad ──────────────────────────────────────────────────────────────────

export interface Cupon {
  id: string
  codigo: string
  nombre: string
  tipoDescuento: TipoCupon
  valor: number
  alcance: AlcanceDescuento
  productosIds?: string[]
  categoriasIds?: string[]
  nivelProducto?: NivelProducto
  montoMinimo: number | null
  usosMaxTotal: number | null // null = ilimitado
  usosMaxPorCliente: number | null // null = ilimitado
  usosConsumidos: number
  fechaInicio: string // ISO 8601
  fechaExpiracion: string | null // null = sin vencimiento
  activo: boolean
  privado: boolean // true = solo canjeable si el cliente conoce el código; no aparece en la tienda
  // Campos derivados por el backend para el listado
  estado: EstadoCupon
  alcanceResumen: string
  // Link compartible
  link_activo: boolean
  link_redirect: string | null
  link_creado_at: string | null
  // Metadata
  creadoPor: string
  createdAt: string
  updatedAt: string
}

// ─── Filtros ──────────────────────────────────────────────────────────────────

export type OrdenColumnaCupon = 'codigo' | 'nombre' | 'valor' | 'vigencia' | 'usos' | 'estado'

export interface CuponesFiltros {
  estado: EstadoCupon | 'todos'
  tipo: TipoCuponLabelKey | 'todos'
  busqueda: string
  pagina: number
  porPagina: number
  ordenColumna: OrdenColumnaCupon
  ordenDireccion: OrdenDireccion
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export const ESTADO_CUPON_LABELS: Record<EstadoCupon, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  programado: 'Programado',
  expirado: 'Expirado',
  agotado: 'Agotado',
}

export const TIPO_CUPON_LABELS: Record<TipoCuponLabelKey, string> = {
  porcentaje_ticket: '% Ticket',
  monto_fijo_ticket: '$ Fijo Ticket',
  porcentaje_producto: '% Producto',
  monto_fijo_producto: '$ Fijo Producto',
}

// Deriva la clave de etiqueta a partir de los campos del cupón.
export function tipoCuponLabelKey(
  tipoDescuento: TipoCupon,
  alcance: AlcanceDescuento
): TipoCuponLabelKey {
  const esTicket = alcance === 'ticket'
  if (tipoDescuento === 'porcentaje') {
    return esTicket ? 'porcentaje_ticket' : 'porcentaje_producto'
  }
  return esTicket ? 'monto_fijo_ticket' : 'monto_fijo_producto'
}
