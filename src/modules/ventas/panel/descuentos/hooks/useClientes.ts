import { useQuery } from '@tanstack/react-query'
import { clientesMock } from '../mock/clientes'

export function useClientes(busqueda = '') {
  return useQuery({
    queryKey: ['clientes-descuentos', busqueda],
    queryFn: async () => {
      // TODO: Reemplazar por GET /api/clientes?busqueda=...
      const q = busqueda.trim().toLowerCase()
      if (!q) return clientesMock
      return clientesMock.filter(
        (c) =>
          `${c.nombre} ${c.apellido}`.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      )
    },
    staleTime: 5 * 60 * 1000,
  })
}

export type { ClienteMock } from '../mock/clientes'
