import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import type {
  DescuentosFiltros,
  CuponesFiltros,
  OrdenColumnaDescuento,
  OrdenColumnaCupon,
  OrdenDireccion,
  EstadoDescuento,
  TipoDescuento,
  EstadoCupon,
  TipoCuponLabelKey,
} from '../types'

// Estado de filtros del listado persistido en la URL.
//
// Pages Router (Next 16): `useSearchParams` de `next/navigation` es solo lectura
// y devuelve null en prerender, así que leemos y escribimos con `useRouter` de
// `next/router`. El módulo se monta en la ruta dinámica
// `/admin/[negocioId]/[moduloPadre]/[seccion]`, por eso preservamos esos
// segmentos en cada `replace`.

export type DescuentosTab = 'descuentos' | 'cupones'

const RUTA_KEYS = ['negocioId', 'moduloPadre', 'seccion'] as const
const FILTER_KEYS = ['tab', 'estado', 'tipo', 'q', 'pagina', 'porPagina', 'orden', 'dir'] as const

const DEF = {
  tab: 'descuentos' as DescuentosTab,
  estado: 'todos',
  tipo: 'todos',
  q: '',
  pagina: 1,
  porPagina: 10,
  orden: 'nombre',
  dir: 'asc' as OrdenDireccion,
}

type QueryValue = string | string[] | undefined

function str(v: QueryValue, def: string): string {
  if (Array.isArray(v)) return v[0] ?? def
  return v ?? def
}

function num(v: QueryValue, def: number): number {
  const n = parseInt(str(v, ''), 10)
  return Number.isFinite(n) && n > 0 ? n : def
}

export function useDescuentosFiltros() {
  const router = useRouter()
  const { query } = router

  // ── Lectura ──
  const tab: DescuentosTab = str(query.tab, DEF.tab) === 'cupones' ? 'cupones' : 'descuentos'
  const estado = str(query.estado, DEF.estado)
  const tipo = str(query.tipo, DEF.tipo)
  const busqueda = str(query.q, DEF.q)
  const pagina = num(query.pagina, DEF.pagina)
  const porPagina = num(query.porPagina, DEF.porPagina)
  const orden = str(query.orden, DEF.orden)
  const dir: OrdenDireccion = str(query.dir, DEF.dir) === 'desc' ? 'desc' : 'asc'

  // ── Escritura ──
  const aplicar = useCallback(
    (patch: Record<string, string | number | undefined>) => {
      if (!router.isReady) return
      const next: Record<string, string> = {}
      for (const k of [...RUTA_KEYS, ...FILTER_KEYS]) {
        const v = query[k]
        if (typeof v === 'string' && v !== '') next[k] = v
      }
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined || v === '') delete next[k]
        else next[k] = String(v)
      }
      router.replace({ pathname: router.pathname, query: next }, undefined, { shallow: true })
    },
    [router, query]
  )

  // Cambiar un filtro siempre vuelve a la página 1.
  const setEstado = useCallback((v: string) => aplicar({ estado: v === 'todos' ? undefined : v, pagina: undefined }), [aplicar])
  const setTipo = useCallback((v: string) => aplicar({ tipo: v === 'todos' ? undefined : v, pagina: undefined }), [aplicar])
  const setBusqueda = useCallback((v: string) => aplicar({ q: v, pagina: undefined }), [aplicar])
  const setPagina = useCallback((v: number) => aplicar({ pagina: v === 1 ? undefined : v }), [aplicar])
  const setPorPagina = useCallback((v: number) => aplicar({ porPagina: v === DEF.porPagina ? undefined : v, pagina: undefined }), [aplicar])

  // Ordenar por una columna; reclickear la misma alterna la dirección.
  const setOrden = useCallback(
    (columna: string) => {
      const mismaCol = columna === orden
      const nuevaDir: OrdenDireccion = mismaCol && dir === 'asc' ? 'desc' : 'asc'
      aplicar({
        orden: columna === DEF.orden ? undefined : columna,
        dir: nuevaDir === DEF.dir ? undefined : nuevaDir,
      })
    },
    [aplicar, orden, dir]
  )

  // Cambiar de tab limpia los filtros (los dominios no comparten estados/tipos).
  const setTab = useCallback(
    (next: DescuentosTab) =>
      aplicar({
        tab: next === DEF.tab ? undefined : next,
        estado: undefined,
        tipo: undefined,
        q: undefined,
        pagina: undefined,
        orden: undefined,
        dir: undefined,
      }),
    [aplicar]
  )

  const resetFiltros = useCallback(
    () => aplicar({ estado: undefined, tipo: undefined, q: undefined, pagina: undefined, orden: undefined, dir: undefined }),
    [aplicar]
  )

  // ── Objetos tipados para los hooks de datos ──
  const descuentosFiltros: DescuentosFiltros = useMemo(
    () => ({
      estado: estado as DescuentosFiltros['estado'],
      tipo: tipo as TipoDescuento | 'todos',
      busqueda,
      pagina,
      porPagina,
      ordenColumna: orden as OrdenColumnaDescuento,
      ordenDireccion: dir,
    }),
    [estado, tipo, busqueda, pagina, porPagina, orden, dir]
  )

  const cuponesFiltros: CuponesFiltros = useMemo(
    () => ({
      estado: estado as EstadoCupon | 'todos',
      tipo: tipo as TipoCuponLabelKey | 'todos',
      busqueda,
      pagina,
      porPagina,
      ordenColumna: orden as OrdenColumnaCupon,
      ordenDireccion: dir,
    }),
    [estado, tipo, busqueda, pagina, porPagina, orden, dir]
  )

  return {
    tab,
    estado: estado as EstadoDescuento | EstadoCupon | 'todos',
    tipo,
    busqueda,
    pagina,
    porPagina,
    ordenColumna: orden,
    ordenDireccion: dir,
    descuentosFiltros,
    cuponesFiltros,
    setTab,
    setEstado,
    setTipo,
    setBusqueda,
    setPagina,
    setPorPagina,
    setOrden,
    resetFiltros,
  }
}
