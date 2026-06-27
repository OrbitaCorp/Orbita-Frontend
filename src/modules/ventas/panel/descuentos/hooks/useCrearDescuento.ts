import { useMutation, useQueryClient } from '@tanstack/react-query'
import { descuentosMock } from '../mock/descuentos'
import type { Descuento } from '../types'

type Input = Omit<Descuento, 'id' | 'estado' | 'recurrente' | 'alcanceResumen' | 'creadoPor' | 'createdAt' | 'updatedAt' | 'usosConsumidos' | 'prioridad'>

export function useCrearDescuento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Input) => {
      await new Promise((r) => setTimeout(r, 600))
      const nuevo: Descuento = {
        ...input,
        id: `desc-${Date.now()}`,
        estado: input.activo ? 'activo' : 'inactivo',
        recurrente: (input.diasVigencia?.length ?? 0) > 0,
        alcanceResumen: input.alcance === 'ticket' ? 'Ticket completo' : 'Productos seleccionados',
        creadoPor: 'usuario-actual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usosConsumidos: 0,
        prioridad: descuentosMock.length + 1,
      }
      descuentosMock.push(nuevo)
      return nuevo
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['descuentos'] })
    },
  })
}
