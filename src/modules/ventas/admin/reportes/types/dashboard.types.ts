import type { BadgeStatus } from '@/design-system/components/Badge'
import type { Periodo } from '@/design-system/components/PeriodoSelector'
import { TipoAlerta } from '../mock/dashboard.mock'

export type { Periodo }

export interface DashboardData {
    kpis: {
        ventas: { actual: number; delta: number }
        pedidos: { actual: number; delta: number; pendientes: number }
        ticket: { actual: number; delta: number }
        clientes: { actual: number; delta: number }
    }
    serieVentas: {
        labels: string[]
        valores: number[]
        rawDates: string[]
    }
    seriePedidos: {
        labels: string[]
        estados: Record<'pendiente' | 'confirmado' | 'preparacion' | 'enviado' | 'cancelado', number[]>
    }
    topProductos: {
        sku: string
        nombre: string
        unidades: number
        monto: number
        hue: number
    }[]
    alertas: {
        id: string
        tipo: TipoAlerta   // ← antes era string
        nivel: 'warning' | 'danger'
        titulo: string
        descripcion: string
        count: number       // ← nuevo
        path: string
        timestamp: string
    }[]
    actividadReciente: {
        id: string
        cliente: string
        monto: number
        estado: BadgeStatus
        hora: string
    }[]
}