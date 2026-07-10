// ─── Descuentos ──────────────────────────────────────────────────────────────

export interface Descuento {
  tipo: 'porcentaje' | 'monto_fijo'
  valor: number
  codigo?: string
  motivo?: string
}

// ─── Ticket ───────────────────────────────────────────────────────────────────

export interface TicketItem {
  id: string // `${productoId}::${varianteId ?? 'base'}`
  productoId: string
  varianteId?: string
  nombre: string
  variante?: string
  cantidad: number
  precioUnitario: number
  precioEditado?: number
  descuento?: Descuento
  notas?: string
  esConcepto?: boolean // ítem libre, no descuenta inventario
}

export interface TicketPausado {
  id: string
  items: TicketItem[]
  cliente: ClienteAsociado | null
  pausadoEn: string // ISO date
  nota?: string
}

// ─── Cliente ──────────────────────────────────────────────────────────────────

export interface ClienteAsociado {
  id: string
  nombre: string
  dni: string
  telefono: string
  email?: string
}

// ─── Cobro ────────────────────────────────────────────────────────────────────

export type TipoMetodoPago =
  | 'efectivo'
  | 'tarjeta_debito'
  | 'tarjeta_credito'
  | 'transferencia'
  | 'qr'

export interface MetodoPago {
  tipo: TipoMetodoPago
  monto: number
  referencia?: string
}

export interface ResultadoVenta {
  id: string
  numeroComprobante: string
  fecha: string
  items: TicketItem[]
  cliente: ClienteAsociado | null
  metodosPago: MetodoPago[]
  total: number
  vuelto?: number
}

// ─── Caja ─────────────────────────────────────────────────────────────────────

export type EstadoCaja = 'cerrada' | 'abierta'

export interface SesionCaja {
  id: string
  cajero: { id: string; nombre: string }
  fechaApertura: string
  fechaCierre?: string
  montoInicial: number
  estado: 'abierta' | 'cerrada' | 'forzada'
  notas?: string
}

export type TipoMovimiento = 'egreso' | 'ingreso'

export interface MovimientoCaja {
  id: string
  tipo: TipoMovimiento
  monto: number
  motivo: string
  fecha: string
  cajeroId: string
}

export interface ResumenTurno {
  sesion: SesionCaja
  ventasTotales: number
  cantidadTickets: number
  desglosePago: Partial<Record<TipoMetodoPago, number>>
  movimientos: MovimientoCaja[]
  totalTeorico: number
}

// ─── Catálogo / Productos ──────────────────────────────────────────────────────

export interface VariantePOS {
  id: string
  talle?: string
  color?: string
  stock: number
  precio?: number
}

export interface ProductoPOS {
  id: string
  nombre: string
  sku: string
  precio: number
  stock: number
  foto?: string
  categoriaId: string
  categoriaLabel?: string
  favorito?: boolean
  tieneVariantes: boolean
  variantes?: VariantePOS[]
}

export interface CategoriaPOS {
  id: string
  label: string
}

export interface FiltrosCatalogoPOS {
  busqueda?: string
  categoriaId?: string
  soloFavoritos?: boolean
}

// ─── Totales ──────────────────────────────────────────────────────────────────

export interface TotalesPOS {
  subtotal: number
  descProductos: number
  descCupon: number
  descManual: number
  descTotal: number
  total: number
  iva: number
  cantidadItems: number
}

// ─── Modales ──────────────────────────────────────────────────────────────────

export type ModalPOS =
  | 'cobro'
  | 'postventa'
  | 'cliente'
  | 'variante'
  | 'devolucion'
  | 'egresoing'
  | 'descuento'
  | null

// ─── Historial ────────────────────────────────────────────────────────────────

export interface FiltrosHistorial {
  fechaDesde?: string
  fechaHasta?: string
  cajeroId?: string
  estado?: SesionCaja['estado']
  conDiferencia?: boolean
}
