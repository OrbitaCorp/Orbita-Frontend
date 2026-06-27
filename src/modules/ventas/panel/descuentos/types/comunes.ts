// Tipos transversales del módulo de Descuentos y Cupones.

export type OrdenDireccion = 'asc' | 'desc'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  pagina: number
  porPagina: number
}

// ─── Auditoría ────────────────────────────────────────────────────────────────

export type EntidadAuditoria = 'descuento' | 'cupon'
export type AccionAuditoria = 'crear' | 'editar' | 'activar' | 'desactivar' | 'eliminar'

export interface CambioAuditoria {
  campo: string
  antes: string | number | null
  despues: string | number | null
}

export interface LogAuditoria {
  id: string
  entidadTipo: EntidadAuditoria
  entidadId: string
  accion: AccionAuditoria
  usuarioId: string
  usuarioNombre: string
  cambios: CambioAuditoria[]
  timestamp: string // ISO 8601
}
