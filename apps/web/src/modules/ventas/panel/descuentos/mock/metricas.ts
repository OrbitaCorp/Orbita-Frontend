import type { MetricasResumen } from '../types'

// Métricas mock — KPIs, gráfico temporal (30 días) y tabla de rendimiento.
// TODO: Reemplazar por GET /api/descuentos/metricas

const REV_SACRIFICADO = 342500
const REV_SACRIFICADO_PREV = 305800

const CHART_REVENUE = [
  8200, 12400, 9800, 15600, 11200, 18900, 14500, 9100, 16800, 13200,
  10400, 19500, 8700, 14200, 11800, 16100, 12900, 20100, 15300, 11600,
  17400, 13800, 9500, 14900, 18200, 12100, 16500, 10800, 19800, 14600,
]

const CHART_USOS = [
  4, 6, 5, 8, 5, 9, 7, 4, 8, 6, 5, 10, 4, 7, 6, 8, 6, 10, 7, 5,
  8, 7, 5, 7, 9, 6, 8, 5, 10, 7,
]

// 30 fechas diarias terminando en un ancla fija (determinista).
const ANCLA = Date.parse('2025-06-26T00:00:00Z')
const DIA_MS = 86_400_000
const FECHAS = Array.from({ length: 30 }, (_, i) =>
  new Date(ANCLA - (29 - i) * DIA_MS).toISOString().slice(0, 10)
)

export const metricasMock: MetricasResumen = {
  kpis: {
    revenueSacrificado: {
      valor: REV_SACRIFICADO,
      valorPrevio: REV_SACRIFICADO_PREV,
      variacion: Number(
        (((REV_SACRIFICADO - REV_SACRIFICADO_PREV) / REV_SACRIFICADO_PREV) * 100).toFixed(1)
      ),
    },
    ventasConDescuento: { cantidad: 147, total: 2_704_800, porcentaje: 23 },
    ticketPromedio: { conDescuento: 18400, sinDescuento: 24100 },
    tasaCanje: { emitidos: 200, canjeados: 68, porcentaje: 34 },
  },
  grafico: {
    fechas: FECHAS,
    revenueSacrificado: CHART_REVENUE,
    usos: CHART_USOS,
  },
  rendimiento: [
    { id: 'd2', nombre: '20% Off Remeras Oversize', entidad: 'descuento', tipoLabel: '% Producto', usos: 23, revenueSacrificado: 57500, revenueConDesc: 287500, ticketPromedio: 12500, estado: 'activo' },
    { id: 'd1', nombre: 'Promo Invierno 2x1 Buzos', entidad: 'descuento', tipoLabel: 'Llevá X Pagá Y', usos: 45, revenueSacrificado: 148500, revenueConDesc: 445500, ticketPromedio: 32900, estado: 'activo' },
    { id: 'c1', nombre: 'BIENVENIDO10', entidad: 'cupon', tipoLabel: '% Ticket', usos: 34, revenueSacrificado: 62400, revenueConDesc: 561600, ticketPromedio: 18400, estado: 'activo' },
    { id: 'd6', nombre: '3x2 en Medias', entidad: 'descuento', tipoLabel: 'Llevá X Pagá Y', usos: 67, revenueSacrificado: 39500, revenueConDesc: 118500, ticketPromedio: 5900, estado: 'activo' },
    { id: 'c2', nombre: 'VERANO2025', entidad: 'cupon', tipoLabel: '% Ticket', usos: 89, revenueSacrificado: 201300, revenueConDesc: 1140700, ticketPromedio: 15100, estado: 'expirado' },
    { id: 'd5', nombre: 'Liquidación Verano −30%', entidad: 'descuento', tipoLabel: '% Ticket', usos: 156, revenueSacrificado: 468000, revenueConDesc: 1872000, ticketPromedio: 14900, estado: 'expirado' },
  ],
}
