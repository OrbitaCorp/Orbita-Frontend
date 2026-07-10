import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cuponesMock } from '../mock/cupones'

interface Params {
  id: string
  activo: boolean
}

export function useToggleCupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, activo }: Params): Promise<void> => {
      // TODO: Reemplazar por PATCH /api/cupones/:id/toggle
      await new Promise((r) => setTimeout(r, 150))
      const idx = cuponesMock.findIndex((c) => c.id === id)
      if (idx !== -1) {
        cuponesMock[idx] = {
          ...cuponesMock[idx],
          activo,
          estado: activo ? 'activo' : 'inactivo',
          updatedAt: new Date().toISOString().slice(0, 10),
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cupones'] }),
  })
}
