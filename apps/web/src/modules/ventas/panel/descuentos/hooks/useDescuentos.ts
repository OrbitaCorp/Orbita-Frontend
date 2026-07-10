import { useQuery } from '@tanstack/react-query'
import { descuentosMock } from '../mock/descuentos'
import type { Descuento, DescuentosFiltros, PaginatedResponse } from '../types'

function filtrar(items: Descuento[], f: DescuentosFiltros): Descuento[] {
  let r = items
  if (f.estado !== 'todos') r = r.filter((d) => d.estado === f.estado)
  if (f.tipo !== 'todos') r = r.filter((d) => d.tipo === f.tipo)
  const q = f.busqueda.trim().toLowerCase()
  if (q) r = r.filter((d) => d.nombre.toLowerCase().includes(q))
  return r
}

function valorOrden(d: Descuento, columna: DescuentosFiltros['ordenColumna']): string | number {
  switch (columna) {
    case 'usos':
      return d.usosConsumidos
    case 'estado':
      return d.estado
    case 'vigencia':
      return d.fechaInicio
    default:
      return d.nombre.toLowerCase()
  }
}

function ordenar(items: Descuento[], f: DescuentosFiltros): Descuento[] {
  const sign = f.ordenDireccion === 'asc' ? 1 : -1
  return [...items].sort((a, b) => {
    const va = valorOrden(a, f.ordenColumna)
    const vb = valorOrden(b, f.ordenColumna)
    if (va < vb) return -sign
    if (va > vb) return sign
    return 0
  })
}

export async function fetchDescuentos(
  f: DescuentosFiltros
): Promise<PaginatedResponse<Descuento>> {
  // TODO: Reemplazar por GET /api/descuentos (estado, tipo, paginación, orden)
  await new Promise((r) => setTimeout(r, 250))
  const filtrados = ordenar(filtrar(descuentosMock, f), f)
  const inicio = (f.pagina - 1) * f.porPagina
  return {
    data: filtrados.slice(inicio, inicio + f.porPagina),
    total: filtrados.length,
    pagina: f.pagina,
    porPagina: f.porPagina,
  }
}

export function useDescuentos(filtros: DescuentosFiltros) {
  return useQuery({
    queryKey: ['descuentos', filtros],
    queryFn: () => fetchDescuentos(filtros),
    staleTime: 30_000,
  })
}
