import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { MovimientoCaja, SesionCaja, TipoMovimiento, TipoMetodoPago } from '../types'

export interface FilaSesion {
  sesion: SesionCaja
  ventasTotales: number
  cantidadTickets: number
  diferencia: number | null
  desglose: { tipo: TipoMetodoPago; cantidad: number; total: number }[]
  movimientos: MovimientoCaja[]
}

const NOW = Date.now()

const MOCK_SESIONES: SesionCaja[] = [
  {
    id: 'caja-001',
    cajero: { id: 'usr-1', nombre: 'María García' },
    fechaApertura: new Date(NOW - 50 * 3_600_000).toISOString(),
    fechaCierre: new Date(NOW - 46 * 3_600_000).toISOString(),
    montoInicial: 5000,
    estado: 'cerrada',
  },
  {
    id: 'caja-003',
    cajero: { id: 'usr-1', nombre: 'María García' },
    fechaApertura: new Date(NOW - 26 * 3_600_000).toISOString(),
    fechaCierre: new Date(NOW - 22 * 3_600_000).toISOString(),
    montoInicial: 5000,
    estado: 'cerrada',
  },
  {
    id: 'caja-004',
    cajero: { id: 'usr-3', nombre: 'Sofía Martínez' },
    fechaApertura: new Date(NOW - 24 * 3_600_000).toISOString(),
    fechaCierre: new Date(NOW - 20 * 3_600_000).toISOString(),
    montoInicial: 3000,
    estado: 'forzada',
  },
  {
    id: 'caja-005',
    cajero: { id: 'usr-3', nombre: 'Sofía Martínez' },
    fechaApertura: new Date(NOW - 8 * 3_600_000).toISOString(),
    fechaCierre: new Date(NOW - 4 * 3_600_000).toISOString(),
    montoInicial: 4000,
    estado: 'cerrada',
  },
  {
    id: 'caja-002',
    cajero: { id: 'usr-2', nombre: 'Carlos López' },
    fechaApertura: new Date(NOW - 2 * 3_600_000).toISOString(),
    montoInicial: 3000,
    estado: 'abierta',
  },
]

const MOCK_MOVIMIENTOS: MovimientoCaja[] = []

type DesgloseEntry = { tipo: TipoMetodoPago; cantidad: number; total: number }
const FALLBACK_HISTORIAL = { ventasTotales: 0, cantidadTickets: 0, diferencia: null as number | null, desglose: [] as DesgloseEntry[] }

const MOCK_HISTORIAL: Record<string, typeof FALLBACK_HISTORIAL> = {
  'caja-001': { ventasTotales: 48500, cantidadTickets: 12, diferencia: null, desglose: [{ tipo: 'efectivo', cantidad: 8, total: 30000 }, { tipo: 'tarjeta_debito', cantidad: 4, total: 18500 }] },
  'caja-002': { ventasTotales: 0, cantidadTickets: 0, diferencia: null, desglose: [] },
  'caja-003': { ventasTotales: 72300, cantidadTickets: 18, diferencia: -350, desglose: [{ tipo: 'efectivo', cantidad: 10, total: 45000 }, { tipo: 'tarjeta_credito', cantidad: 5, total: 18500 }, { tipo: 'qr', cantidad: 3, total: 8800 }] },
  'caja-004': { ventasTotales: 15000, cantidadTickets: 4, diferencia: null, desglose: [{ tipo: 'efectivo', cantidad: 4, total: 15000 }] },
  'caja-005': { ventasTotales: 91200, cantidadTickets: 23, diferencia: 500, desglose: [{ tipo: 'efectivo', cantidad: 12, total: 52000 }, { tipo: 'tarjeta_debito', cantidad: 7, total: 25200 }, { tipo: 'transferencia', cantidad: 4, total: 14000 }] },
}

export function useSesionesCaja() {
  return useQuery({
    queryKey: ['sesiones-caja'],
    queryFn: async (): Promise<SesionCaja[]> => {
      await new Promise((r) => setTimeout(r, 300))
      return [...MOCK_SESIONES].reverse()
    },
  })
}

export function useHistorialCajas() {
  return useQuery({
    queryKey: ['historial-cajas'],
    queryFn: async (): Promise<FilaSesion[]> => {
      await new Promise((r) => setTimeout(r, 300))
      return [...MOCK_SESIONES]
        .sort((a, b) => b.fechaApertura.localeCompare(a.fechaApertura))
        .map((sesion) => ({
          sesion,
          movimientos: MOCK_MOVIMIENTOS.filter((m) => m.cajeroId === sesion.cajero.id),
          ...(MOCK_HISTORIAL[sesion.id] ?? FALLBACK_HISTORIAL),
        }))
    },
  })
}

export function useMovimientosCaja(cajaId?: string) {
  return useQuery({
    queryKey: ['movimientos-caja', cajaId],
    queryFn: async (): Promise<MovimientoCaja[]> => {
      await new Promise((r) => setTimeout(r, 150))
      return MOCK_MOVIMIENTOS.filter((m) => !cajaId || m.cajeroId === cajaId)
    },
    enabled: !!cajaId,
  })
}

interface AbrirCajaParams {
  cajero: SesionCaja['cajero']
  montoInicial: number
  notas?: string
}

export function useAbrirCaja() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: AbrirCajaParams): Promise<SesionCaja> => {
      await new Promise((r) => setTimeout(r, 300))
      const sesion: SesionCaja = {
        id: `caja-${Date.now()}`,
        ...params,
        fechaApertura: new Date().toISOString(),
        estado: 'abierta',
      }
      MOCK_SESIONES.push(sesion)
      return sesion
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sesiones-caja'] }),
  })
}

interface RegistrarMovimientoParams {
  tipo: TipoMovimiento
  monto: number
  motivo: string
  cajeroId: string
}

export function useRegistrarMovimiento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: RegistrarMovimientoParams): Promise<MovimientoCaja> => {
      await new Promise((r) => setTimeout(r, 200))
      const mov: MovimientoCaja = {
        id: `mov-${Date.now()}`,
        fecha: new Date().toISOString(),
        ...params,
      }
      MOCK_MOVIMIENTOS.push(mov)
      return mov
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ['movimientos-caja', vars.cajeroId] }),
  })
}

export function useForzarCierre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (sesionId: string): Promise<void> => {
      await new Promise((r) => setTimeout(r, 300))
      const idx = MOCK_SESIONES.findIndex((s) => s.id === sesionId)
      if (idx !== -1) {
        MOCK_SESIONES[idx] = {
          ...MOCK_SESIONES[idx],
          estado: 'forzada',
          fechaCierre: new Date().toISOString(),
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sesiones-caja'] })
      qc.invalidateQueries({ queryKey: ['historial-cajas'] })
    },
  })
}
