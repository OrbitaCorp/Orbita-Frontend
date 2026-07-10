import type { OrdenDireccion } from './comunes'

// ─── Filtros ──────────────────────────────────────────────────────────────────

export type RangoFechasPreset = 'hoy' | '7d' | '30d' | '90d' | '12m' | 'personalizado'
export type CanalMetricas = 'todos' | 'pos' | 'storefront'
export type TipoMetricas = 'todos' | 'descuentos' | 'cupones'

export interface MetricasFiltros {
  rango: RangoFechasPreset
  fechaDesde?: string
  fechaHasta?: string
  canal: CanalMetricas
  tipo: TipoMetricas
  sucursalId: string | 'todas'
}

// ─── KPIs ─────────────────────────────────────────────────────────────────────

export interface KpiComparado {
  valor: number
  valorPrevio: number
  variacion: number // variación % respecto al período anterior
}

export interface MetricasKPIs {
  revenueSacrificado: KpiComparado
  ventasConDescuento: { cantidad: number; total: number; porcentaje: number }
  ticketPromedio: { conDescuento: number; sinDescuento: number }
  tasaCanje: { emitidos: number; canjeados: number; porcentaje: number }
}

// ─── Gráfico temporal ─────────────────────────────────────────────────────────

export interface MetricasGrafico {
  fechas: string[] // ISO 8601, un punto por día
  revenueSacrificado: number[]
  usos: number[]
}

// ─── Tabla de rendimiento ─────────────────────────────────────────────────────

export type RendimientoEntidad = 'descuento' | 'cupon'

export interface RendimientoItem {
  id: string
  nombre: string
  entidad: RendimientoEntidad
  tipoLabel: string
  usos: number
  revenueSacrificado: number
  revenueConDesc: number
  ticketPromedio: number
  estado: string
}

export type OrdenColumnaRendimiento =
  | 'nombre'
  | 'usos'
  | 'revenueSacrificado'
  | 'revenueConDesc'
  | 'ticketPromedio'

export interface RendimientoFiltros {
  ordenColumna: OrdenColumnaRendimiento
  ordenDireccion: OrdenDireccion
  pagina: number
  porPagina: number
}

// Respuesta agregada del endpoint de métricas.
export interface MetricasResumen {
  kpis: MetricasKPIs
  grafico: MetricasGrafico
  rendimiento: RendimientoItem[]
}
