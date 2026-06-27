import { Paginacion } from '../../_shared/components'
import { DescuentosFiltros } from './components/DescuentosFiltros'
import { DescuentosTabla } from './components/DescuentosTabla'
import { useDescuentos } from './hooks/useDescuentos'
import { useDescuentosFiltros } from './hooks/useDescuentosFiltros'

interface Props {
  onVerDetalle: (id: string) => void
  onEditar: (id: string) => void
  onVerMetricas: () => void
}

export function DescuentosListado({ onVerDetalle, onEditar, onVerMetricas }: Props) {
  const filtros = useDescuentosFiltros()
  const { data, isLoading } = useDescuentos(filtros.descuentosFiltros)

  return (
    <div>
      <DescuentosFiltros />
      <DescuentosTabla
        datos={data?.data ?? []}
        isLoading={isLoading}
        ordenColumna={filtros.ordenColumna}
        ordenDireccion={filtros.ordenDireccion}
        onOrdenar={filtros.setOrden}
        onVerDetalle={onVerDetalle}
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
