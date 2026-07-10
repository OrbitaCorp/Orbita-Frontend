import { useQuery } from '@tanstack/react-query'
import { descuentosMock } from '../mock/descuentos'

export function useDescuento(id: string | undefined) {
  return useQuery({
    queryKey: ['descuento', id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300))
      const item = descuentosMock.find((d) => d.id === id)
      if (!item) throw new Error(`Descuento ${id} no encontrado`)
      return item
    },
    enabled: !!id,
  })
}
