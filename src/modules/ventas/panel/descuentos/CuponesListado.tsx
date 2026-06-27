import { Paginacion } from '../../_shared/components'
import { DescuentosFiltros } from './components/DescuentosFiltros'
import { CuponesTabla } from './components/CuponesTabla'
import { useCupones } from './hooks/useCupones'
import { useDescuentosFiltros } from './hooks/useDescuentosFiltros'

interface Props {
  onEditar: (id: string) => void
  onVerMetricas: () => void
}

export function CuponesListado({ onEditar, onVerMetricas }: Props) {
  const filtros = useDescuentosFiltros()
  const { data, isLoading } = useCupones(filtros.cuponesFiltros)

  return (
    <div>
      <DescuentosFiltros />
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
