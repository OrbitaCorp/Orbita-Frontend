import { useMutation, useQueryClient } from '@tanstack/react-query'
import { descuentosMock } from '../mock/descuentos'
import type { Descuento } from '../types'

interface Input {
  id: string
  data: Partial<Omit<Descuento, 'id' | 'creadoPor' | 'createdAt' | 'usosConsumidos'>>
}

export function useEditarDescuento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: Input) => {
      await new Promise((r) => setTimeout(r, 500))
      const idx = descuentosMock.findIndex((d) => d.id === id)
      if (idx < 0) throw new Error(`Descuento ${id} no encontrado`)
      descuentosMock[idx] = {
        ...descuentosMock[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      return descuentosMock[idx]
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['descuentos'] })
      qc.invalidateQueries({ queryKey: ['descuento', id] })
    },
  })
}
