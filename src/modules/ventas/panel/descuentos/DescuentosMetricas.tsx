import { useState } from 'react'
import { useMetricas } from './hooks/useMetricas'
import { MetricasKPIs } from './components/MetricasKPIs'
import { MetricasGrafico } from './components/MetricasGrafico'
import { MetricasFiltros } from './components/MetricasFiltros'
import { MetricasTabla } from './components/MetricasTabla'
import { MetricasDrawer } from './components/MetricasDrawer'
import type { MetricasFiltros as MetricasFiltrosType } from './types'

const FILTROS_INIT: MetricasFiltrosType = {
  rango: '30d',
  canal: 'todos',
  tipo: 'todos',
  sucursalId: 'todas',
}

interface Props {
  onVolver: () => void
  onVerDetalle?: (id: string) => void
}

export function DescuentosMetricas({ onVolver, onVerDetalle }: Props) {
  const [filtros, setFiltros] = useState<MetricasFiltrosType>(FILTROS_INIT)
  const [drawerItemId, setDrawerItemId] = useState<string | null>(null)

  const { data, isLoading, isError } = useMetricas(filtros)

  function handleFiltroChange(parcial: Partial<MetricasFiltrosType>) {
    setFiltros((prev) => ({ ...prev, ...parcial }))
  }

  return (
    <div>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          onClick={onVolver}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, color: 'var(--color-muted)', fontFamily: 'inherit', padding: 0,
          }}
        >
          ← Volver
        </button>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>
          Métricas de descuentos
        </h2>
      </div>

      {/* Filtros */}
      <div style={{ marginBottom: 20 }}>
        <MetricasFiltros filtros={filtros} onChange={handleFiltroChange} />
      </div>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>Cargando métricas…</p>
        </div>
      )}

      {isError && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <p style={{ color: 'var(--color-error)', fontSize: 14 }}>No se pudieron cargar las métricas.</p>
        </div>
      )}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* KPIs */}
          <MetricasKPIs kpis={data.kpis} />

          {/* Gráfico */}
          <MetricasGrafico grafico={data.grafico} />

          {/* Tabla */}
          <MetricasTabla
            items={data.rendimiento}
            onRowClick={(id) => setDrawerItemId(id)}
          />
        </div>
      )}

      {/* Drawer de detalle */}
      <MetricasDrawer
        id={drawerItemId}
        onClose={() => setDrawerItemId(null)}
        onNavegar={onVerDetalle}
      />
    </div>
  )
}
