import { useMutation, useQueryClient } from '@tanstack/react-query'
import { descuentosMock } from '../mock/descuentos'

interface Params {
  id: string
  activo: boolean
}

export function useToggleDescuento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, activo }: Params): Promise<void> => {
      // TODO: Reemplazar por PATCH /api/descuentos/:id/toggle
      await new Promise((r) => setTimeout(r, 150))
      const idx = descuentosMock.findIndex((d) => d.id === id)
      if (idx !== -1) {
        descuentosMock[idx] = {
          ...descuentosMock[idx],
          activo,
          estado: activo ? 'activo' : 'inactivo',
          updatedAt: new Date().toISOString().slice(0, 10),
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['descuentos'] }),
  })
}
