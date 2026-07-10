import { useQuery } from '@tanstack/react-query'
import { metricasMock } from '../mock/metricas'
import type { MetricasFiltros } from '../types'

export function useMetricas(filtros?: Partial<MetricasFiltros>) {
  return useQuery({
    queryKey: ['metricas', filtros],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 400))
      return metricasMock
    },
  })
}
