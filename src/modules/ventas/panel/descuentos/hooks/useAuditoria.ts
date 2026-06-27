import { useQuery } from '@tanstack/react-query'
import { auditoriaMock } from '../mock/auditoria'
import type { EntidadAuditoria } from '../types'

export function useAuditoria(entidadId: string, entidadTipo: EntidadAuditoria) {
  return useQuery({
    queryKey: ['auditoria', entidadTipo, entidadId],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200))
      return auditoriaMock
        .filter((e) => e.entidadId === entidadId && e.entidadTipo === entidadTipo)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    },
    enabled: !!entidadId,
  })
}
