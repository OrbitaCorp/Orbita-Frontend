import { useQuery } from '@tanstack/react-query'
import { cuponesMock } from '../mock/cupones'

export function useCupon(id: string | undefined) {
  return useQuery({
    queryKey: ['cupon', id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300))
      const item = cuponesMock.find((c) => c.id === id)
      if (!item) throw new Error(`Cupón ${id} no encontrado`)
      return item
    },
    enabled: !!id,
  })
}
