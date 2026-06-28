import { BarChart2, Plus } from 'lucide-react'
import { Paginacion } from '../../_shared/components'
import { DescuentosFiltros } from './components/DescuentosFiltros'
import { CuponesTabla } from './components/CuponesTabla'
import { useCupones } from './hooks/useCupones'
import { useDescuentosFiltros } from './hooks/useDescuentosFiltros'

const btnSecundario: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  height: 36, padding: '0 14px', borderRadius: 8,
  fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  background: 'var(--color-bg)', color: 'var(--color-body)', border: '1px solid var(--color-border)',
}

const btnPrimario: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  height: 36, padding: '0 14px', borderRadius: 8,
  fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  background: 'var(--color-primary)', color: '#fff', border: 'none',
}

interface Props {
  onEditar: (id: string) => void
  onVerMetricas: () => void
  onCrear: () => void
}

export function CuponesListado({ onEditar, onVerMetricas, onCrear }: Props) {
  const filtros = useDescuentosFiltros()
  const { data, isLoading } = useCupones(filtros.cuponesFiltros)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <DescuentosFiltros />
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button style={btnSecundario} onClick={onVerMetricas}>
            <BarChart2 size={16} /> Métricas
          </button>
          <button style={btnPrimario} onClick={onCrear}>
            <Plus size={16} /> Crear cupón
          </button>
        </div>
      </div>
      <CuponesTabla
        datos={data?.data ?? []}
        isLoading={isLoading}
        ordenColumna={filtros.ordenColumna}
        ordenDireccion={filtros.ordenDireccion}
        onOrdenar={filtros.setOrden}
        onEditar={onEditar}
        onVerMetricas={onVerMetricas}
      />
      {(data?.total ?? 0) > 0 && (
        <Paginacion
          total={data?.total ?? 0}
          pagina={data?.pagina ?? 1}
          porPagina={data?.porPagina ?? 10}
          onCambiarPagina={filtros.setPagina}
          onCambiarPorPagina={filtros.setPorPagina}
        />
      )}
    </div>
  )
}
