import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cuponesMock } from '../mock/cupones'
import type { Cupon } from '../types'

interface Input {
  id: string
  data: Partial<Omit<Cupon, 'id' | 'creadoPor' | 'createdAt' | 'usosConsumidos'>>
}

export function useEditarCupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: Input) => {
      await new Promise((r) => setTimeout(r, 500))
      const idx = cuponesMock.findIndex((c) => c.id === id)
      if (idx < 0) throw new Error(`Cupón ${id} no encontrado`)
      cuponesMock[idx] = {
        ...cuponesMock[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      return cuponesMock[idx]
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['cupones'] })
      qc.invalidateQueries({ queryKey: ['cupon', id] })
    },
  })
}
