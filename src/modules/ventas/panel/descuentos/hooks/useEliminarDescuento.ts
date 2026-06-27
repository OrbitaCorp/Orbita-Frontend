import { useMutation, useQueryClient } from '@tanstack/react-query'
import { descuentosMock } from '../mock/descuentos'

export function useEliminarDescuento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // TODO: Reemplazar por DELETE /api/descuentos/:id
      await new Promise((r) => setTimeout(r, 200))
      const idx = descuentosMock.findIndex((d) => d.id === id)
      if (idx !== -1) descuentosMock.splice(idx, 1)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['descuentos'] }),
  })
}
