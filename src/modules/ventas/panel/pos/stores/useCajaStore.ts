import { create } from 'zustand'
import type { SesionCaja, EstadoCaja } from '../types'

interface AbrirCajaParams {
  montoInicial: number
  cajero: SesionCaja['cajero']
  notas?: string
}

interface CajaState {
  sesion: SesionCaja | null
  estado: EstadoCaja
  acumuladoTurno: number

  abrirCaja: (params: AbrirCajaParams) => void
  cerrarCaja: () => void
  incrementarAcumulado: (monto: number) => void
  resetearAcumulado: () => void
}

export const useCajaStore = create<CajaState>((set) => ({
  sesion: null,
  estado: 'cerrada',
  acumuladoTurno: 0,

  abrirCaja: ({ montoInicial, cajero, notas }) => {
    const sesion: SesionCaja = {
      id: `caja-${Date.now()}`,
      cajero,
      fechaApertura: new Date().toISOString(),
      montoInicial,
      estado: 'abierta',
      notas,
    }
    set({ sesion, estado: 'abierta', acumuladoTurno: 0 })
  },

  cerrarCaja: () =>
    set((state) => ({
      sesion: state.sesion
        ? {
            ...state.sesion,
            fechaCierre: new Date().toISOString(),
            estado: 'cerrada' as const,
          }
        : null,
      estado: 'cerrada',
    })),

  incrementarAcumulado: (monto) =>
    set((state) => ({ acumuladoTurno: state.acumuladoTurno + monto })),

  resetearAcumulado: () => set({ acumuladoTurno: 0 }),
}))
