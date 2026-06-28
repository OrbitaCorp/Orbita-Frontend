import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cuponesMock } from '../mock/cupones'

interface Params {
  id: string
  link_activo: boolean
  link_redirect?: string | null
}

export function useToggleLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, link_activo, link_redirect }: Params): Promise<void> => {
      // TODO: Reemplazar por PATCH /api/cupones/:id/link
      await new Promise((r) => setTimeout(r, 300))
      const idx = cuponesMock.findIndex((c) => c.id === id)
      if (idx !== -1) {
        cuponesMock[idx] = {
          ...cuponesMock[idx],
          link_activo,
          link_redirect: link_redirect !== undefined ? link_redirect : cuponesMock[idx].link_redirect,
          link_creado_at: cuponesMock[idx].link_creado_at ?? new Date().toISOString(),
          updatedAt: new Date().toISOString().slice(0, 10),
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cupones'] }),
  })
}
