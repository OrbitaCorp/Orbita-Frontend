import { useQuery } from '@tanstack/react-query'
import { metricasMock } from '../mock/metricas'
import type { RendimientoItem } from '../types'

interface MetricasDetalleData {
  item: RendimientoItem
  usosPorDia: number[]
  productosDescontados: Array<{
    producto: string
    variante: string
    veces: number
    montoDesc: number
  }>
}

// Datos mock fijos para el drawer de detalle
const PRODUCTOS_MOCK = [
  { producto: 'Remera básica',   variante: 'M',  veces: 12, montoDesc: 21400 },
  { producto: 'Remera básica',   variante: 'L',  veces: 8,  montoDesc: 14200 },
  { producto: 'Remera oversize', variante: 'S',  veces: 6,  montoDesc: 13800 },
  { producto: 'Remera oversize', variante: 'M',  veces: 4,  montoDesc: 9200  },
  { producto: 'Camisa lino',     variante: 'L',  veces: 3,  montoDesc: 6700  },
]

const USOS_POR_DIA = [2,0,3,1,4,2,1,3,0,2,4,1,2,3,1,0,2,1,3,2,1,0,2,3,1,2,0,3,1,2]

export function useMetricasDetalle(id: string | null) {
  return useQuery({
    queryKey: ['metricas-detalle', id],
    queryFn: async (): Promise<MetricasDetalleData | null> => {
      await new Promise((r) => setTimeout(r, 250))
      const item = metricasMock.rendimiento.find((r) => r.id === id)
      if (!item) return null
      return {
        item,
        usosPorDia: USOS_POR_DIA,
        productosDescontados: PRODUCTOS_MOCK,
      }
    },
    enabled: !!id,
  })
}
