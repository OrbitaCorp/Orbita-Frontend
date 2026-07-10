import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cuponesMock } from '../mock/cupones'
import type { Cupon } from '../types'

type Input = Omit<Cupon, 'id' | 'estado' | 'alcanceResumen' | 'creadoPor' | 'createdAt' | 'updatedAt' | 'usosConsumidos'>

export function useCrearCupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Input) => {
      await new Promise((r) => setTimeout(r, 600))
      const nuevo: Cupon = {
        ...input,
        id: `cup-${Date.now()}`,
        estado: input.activo ? 'activo' : 'inactivo',
        alcanceResumen:
          input.alcance === 'ticket'
            ? 'Ticket completo'
            : input.alcance === 'categoria'
              ? 'Categorías'
              : 'Productos seleccionados',
        creadoPor: 'usuario-actual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usosConsumidos: 0,
      }
      cuponesMock.push(nuevo)
      return nuevo
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cupones'] })
    },
  })
}
