import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cuponesMock } from '../mock/cupones'

export function useEliminarCupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // TODO: Reemplazar por DELETE /api/cupones/:id
      await new Promise((r) => setTimeout(r, 200))
      const idx = cuponesMock.findIndex((c) => c.id === id)
      if (idx !== -1) cuponesMock.splice(idx, 1)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cupones'] }),
  })
}
