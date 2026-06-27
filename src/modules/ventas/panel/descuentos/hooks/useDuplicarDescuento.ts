import { useMutation, useQueryClient } from '@tanstack/react-query'
import { descuentosMock } from '../mock/descuentos'

export function useDuplicarDescuento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // TODO: Reemplazar por POST /api/descuentos/:id/duplicar
      await new Promise((r) => setTimeout(r, 250))
      const original = descuentosMock.find((d) => d.id === id)
      if (original) {
        descuentosMock.push({
          ...original,
          id: `${id}-copia-${Date.now()}`,
          nombre: `${original.nombre} (copia)`,
          activo: false,
          estado: 'inactivo',
          usosConsumidos: 0,
          createdAt: new Date().toISOString().slice(0, 10),
          updatedAt: new Date().toISOString().slice(0, 10),
        })
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['descuentos'] }),
  })
}
