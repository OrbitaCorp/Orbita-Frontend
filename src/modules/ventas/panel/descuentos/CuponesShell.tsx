import { useCallback } from 'react'
import { useRouter } from 'next/router'
import { CuponesListado } from './CuponesListado'
import { CuponesCrear } from './CuponesCrear'

const BASE_PATH = '/admin/[negocioId]/[moduloPadre]/[seccion]'

export function CuponesShell() {
  const router = useRouter()
  const negocioId = (router.query.negocioId as string) ?? 'rama-tienda'
  const vista = (router.query.vista as string) || ''
  const idParam = (router.query.id as string) || undefined

  const baseQuery    = { negocioId, moduloPadre: 'ventas', seccion: 'cupones' }
  const metricasQuery = { negocioId, moduloPadre: 'ventas', seccion: 'descuentos', vista: 'metricas' }

  const irAListado  = useCallback(() => router.push({ pathname: BASE_PATH, query: baseQuery }), [router, negocioId])
  const irACrear    = useCallback(() => router.push({ pathname: BASE_PATH, query: { ...baseQuery, vista: 'crear' } }), [router, negocioId])
  const irAEditar   = useCallback((id: string) => router.push({ pathname: BASE_PATH, query: { ...baseQuery, vista: 'editar', id } }), [router, negocioId])
  const irAMetricas = useCallback(() => router.push({ pathname: BASE_PATH, query: metricasQuery }), [router, negocioId])

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24, minHeight: 0 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {!vista && (
          <CuponesListado onEditar={irAEditar} onVerMetricas={irAMetricas} onCrear={irACrear} />
        )}

        {vista === 'crear' && (
          <CuponesCrear onVolver={irAListado} />
        )}

        {vista === 'editar' && idParam && (
          <CuponesCrear id={idParam} onVolver={irAListado} />
        )}

      </div>
    </div>
  )
}

export default CuponesShell
