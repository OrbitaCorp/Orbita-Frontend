import { useCallback } from 'react'
import { useRouter } from 'next/router'
import { DescuentosListado } from './DescuentosListado'
import { DescuentosCrear } from './DescuentosCrear'
import { DescuentosDetalle } from './DescuentosDetalle'
import { DescuentosMetricas } from './DescuentosMetricas'

const BASE_PATH = '/admin/[negocioId]/[moduloPadre]/[seccion]'

export function DescuentosShell() {
  const router = useRouter()
  const negocioId = (router.query.negocioId as string) ?? 'rama-tienda'
  const vista = (router.query.vista as string) || ''
  const idParam = (router.query.id as string) || undefined

  const baseQuery = { negocioId, moduloPadre: 'ventas', seccion: 'descuentos' }

  const irAListado   = useCallback(() => router.push({ pathname: BASE_PATH, query: baseQuery }), [router, negocioId])
  const irACrear     = useCallback(() => router.push({ pathname: BASE_PATH, query: { ...baseQuery, vista: 'crear' } }), [router, negocioId])
  const irADetalle   = useCallback((id: string) => router.push({ pathname: BASE_PATH, query: { ...baseQuery, vista: 'detalle', id } }), [router, negocioId])
  const irAEditar    = useCallback((id: string) => router.push({ pathname: BASE_PATH, query: { ...baseQuery, vista: 'editar', id } }), [router, negocioId])
  const irAMetricas  = useCallback(() => router.push({ pathname: BASE_PATH, query: { ...baseQuery, vista: 'metricas' } }), [router, negocioId])

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24, minHeight: 0 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {!vista && (
          <DescuentosListado onVerDetalle={irADetalle} onEditar={irAEditar} onVerMetricas={irAMetricas} onCrear={irACrear} />
        )}

        {vista === 'crear' && (
          <DescuentosCrear onVolver={irAListado} />
        )}

        {vista === 'editar' && idParam && (
          <DescuentosCrear id={idParam} onVolver={irAListado} />
        )}

        {vista === 'detalle' && idParam && (
          <DescuentosDetalle
            id={idParam}
            onVolver={irAListado}
            onEditar={() => irAEditar(idParam)}
            onVerMetricas={irAMetricas}
          />
        )}

        {vista === 'metricas' && (
          <DescuentosMetricas onVolver={irAListado} onVerDetalle={irADetalle} />
        )}

      </div>
    </div>
  )
}
