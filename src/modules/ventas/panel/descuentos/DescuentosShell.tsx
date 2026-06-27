import { useCallback, useState } from 'react'
import { BarChart2, Plus, Tag, Ticket } from 'lucide-react'
import { useDescuentosFiltros } from './hooks/useDescuentosFiltros'
import { DescuentosListado } from './DescuentosListado'
import { CuponesListado } from './CuponesListado'
import { DescuentosCrear } from './DescuentosCrear'
import { CuponesCrear } from './CuponesCrear'
import { DescuentosDetalle } from './DescuentosDetalle'
import { DescuentosMetricas } from './DescuentosMetricas'
import type { DescuentosTab } from './hooks/useDescuentosFiltros'

type Vista = 'listado' | 'detalle' | 'editar' | 'crear' | 'metricas'

const tabBtn = (activo: boolean): React.CSSProperties => ({
  height: 48,
  padding: '0 16px',
  fontSize: 14,
  fontWeight: activo ? 600 : 400,
  cursor: 'pointer',
  fontFamily: 'inherit',
  border: 'none',
  borderBottom: `2px solid ${activo ? 'var(--color-primary)' : 'transparent'}`,
  borderRadius: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  background: 'transparent',
  color: activo ? 'var(--color-primary)' : 'var(--color-muted)',
  marginBottom: -1,
  transition: 'color 150ms ease, border-color 150ms ease',
})

const btnSecundario: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  height: 36,
  padding: '0 14px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
  background: 'var(--color-bg)',
  color: 'var(--color-body)',
  border: '1px solid var(--color-border)',
}

const btnPrimario: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  height: 36,
  padding: '0 14px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
  background: 'var(--color-primary)',
  color: '#fff',
  border: 'none',
}

export function DescuentosShell() {
  const { tab, setTab } = useDescuentosFiltros()
  const [vista, setVista] = useState<Vista>('listado')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const irADetalle = useCallback((id: string) => {
    setSelectedId(id)
    setVista('detalle')
  }, [])

  const irAEditar = useCallback((id: string) => {
    setSelectedId(id)
    setVista('editar')
  }, [])

  const irAMetricas = useCallback(() => setVista('metricas'), [])
  const irACrear = useCallback(() => setVista('crear'), [])
  const irAListado = useCallback(() => {
    setVista('listado')
    setSelectedId(null)
  }, [])

  const handleTab = useCallback((t: DescuentosTab) => {
    setTab(t)
    irAListado()
  }, [setTab, irAListado])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Contenido */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, minHeight: 0 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* Barra de tabs + acciones — solo en listado */}
          {vista === 'listado' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid var(--color-border)',
              marginBottom: 20,
              gap: 4,
            }}>
              <button style={tabBtn(tab === 'descuentos')} onClick={() => handleTab('descuentos')}>
                <Tag size={16} />
                Descuentos
              </button>
              <button style={tabBtn(tab === 'cupones')} onClick={() => handleTab('cupones')}>
                <Ticket size={16} />
                Cupones
              </button>

              <div style={{ flex: 1 }} />

              <div style={{ display: 'flex', gap: 8, paddingBottom: 1 }}>
                <button style={btnSecundario} onClick={irAMetricas}>
                  <BarChart2 size={16} />
                  Métricas
                </button>
                <button style={btnPrimario} onClick={irACrear}>
                  <Plus size={16} />
                  {tab === 'descuentos' ? 'Crear descuento' : 'Crear cupón'}
                </button>
              </div>
            </div>
          )}

          {vista === 'listado' && tab === 'descuentos' && (
            <DescuentosListado
              onVerDetalle={irADetalle}
              onEditar={irAEditar}
              onVerMetricas={irAMetricas}
            />
          )}

          {vista === 'listado' && tab === 'cupones' && (
            <CuponesListado
              onEditar={irAEditar}
              onVerMetricas={irAMetricas}
            />
          )}

          {vista === 'crear' && tab === 'descuentos' && (
            <DescuentosCrear onVolver={irAListado} />
          )}

          {vista === 'crear' && tab === 'cupones' && (
            <CuponesCrear onVolver={irAListado} />
          )}

          {vista === 'editar' && tab === 'descuentos' && selectedId && (
            <DescuentosCrear id={selectedId} onVolver={irAListado} />
          )}

          {vista === 'editar' && tab === 'cupones' && selectedId && (
            <CuponesCrear id={selectedId} onVolver={irAListado} />
          )}

          {vista === 'detalle' && selectedId && (
            <DescuentosDetalle
              id={selectedId}
              onVolver={irAListado}
              onEditar={() => irAEditar(selectedId)}
              onVerMetricas={irAMetricas}
            />
          )}

          {vista === 'metricas' && (
            <DescuentosMetricas
              onVolver={irAListado}
              onVerDetalle={irADetalle}
            />
          )}

        </div>
      </div>
    </div>
  )
}
