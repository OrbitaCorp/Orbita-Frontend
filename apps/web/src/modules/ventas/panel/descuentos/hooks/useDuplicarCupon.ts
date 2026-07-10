import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cuponesMock } from '../mock/cupones'

export function useDuplicarCupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // TODO: Reemplazar por POST /api/cupones/:id/duplicar
      await new Promise((r) => setTimeout(r, 250))
      const original = cuponesMock.find((c) => c.id === id)
      if (original) {
        const timestamp = Date.now()
        cuponesMock.push({
          ...original,
          id: `${id}-copia-${timestamp}`,
          codigo: `${original.codigo}-COPIA`,
          nombre: `${original.nombre} (copia)`,
          activo: false,
          estado: 'inactivo',
          usosConsumidos: 0,
          createdAt: new Date().toISOString().slice(0, 10),
          updatedAt: new Date().toISOString().slice(0, 10),
        })
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cupones'] }),
  })
}
