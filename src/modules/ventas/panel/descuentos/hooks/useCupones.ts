import { useQuery } from '@tanstack/react-query'
import { cuponesMock } from '../mock/cupones'
import {
  tipoCuponLabelKey,
  type Cupon,
  type CuponesFiltros,
  type PaginatedResponse,
} from '../types'

function filtrar(items: Cupon[], f: CuponesFiltros): Cupon[] {
  let r = items
  if (f.estado !== 'todos') r = r.filter((c) => c.estado === f.estado)
  if (f.tipo !== 'todos') {
    r = r.filter((c) => tipoCuponLabelKey(c.tipoDescuento, c.alcance) === f.tipo)
  }
  const q = f.busqueda.trim().toLowerCase()
  if (q) {
    r = r.filter(
      (c) => c.nombre.toLowerCase().includes(q) || c.codigo.toLowerCase().includes(q)
    )
  }
  return r
}

function valorOrden(c: Cupon, columna: CuponesFiltros['ordenColumna']): string | number {
  switch (columna) {
    case 'codigo':
      return c.codigo.toLowerCase()
    case 'valor':
      return c.valor
    case 'usos':
      return c.usosConsumidos
    case 'estado':
      return c.estado
    case 'vigencia':
      return c.fechaInicio
    default:
      return c.nombre.toLowerCase()
  }
}

function ordenar(items: Cupon[], f: CuponesFiltros): Cupon[] {
  const sign = f.ordenDireccion === 'asc' ? 1 : -1
  return [...items].sort((a, b) => {
    const va = valorOrden(a, f.ordenColumna)
    const vb = valorOrden(b, f.ordenColumna)
    if (va < vb) return -sign
    if (va > vb) return sign
    return 0
  })
}

export async function fetchCupones(f: CuponesFiltros): Promise<PaginatedResponse<Cupon>> {
  // TODO: Reemplazar por GET /api/cupones (estado, tipo, paginación, orden)
  await new Promise((r) => setTimeout(r, 250))
  const filtrados = ordenar(filtrar(cuponesMock, f), f)
  const inicio = (f.pagina - 1) * f.porPagina
  return {
    data: filtrados.slice(inicio, inicio + f.porPagina),
    total: filtrados.length,
    pagina: f.pagina,
    porPagina: f.porPagina,
  }
}

export function useCupones(filtros: CuponesFiltros) {
  return useQuery({
    queryKey: ['cupones', filtros],
    queryFn: () => fetchCupones(filtros),
    staleTime: 30_000,
  })
}
