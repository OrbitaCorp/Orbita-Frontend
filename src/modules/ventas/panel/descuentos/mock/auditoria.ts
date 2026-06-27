import type { LogAuditoria } from '../types'

// Auditoría mock — cronológica descendente (más reciente primero por entidad).
// TODO: Reemplazar por GET /api/descuentos/auditoria/:id

const USR = { id: 'usr-admin', nombre: 'Marcos Olivera' }

export const auditoriaMock: LogAuditoria[] = [
  // d1 — Promo Invierno 2x1 Buzos
  {
    id: 'aud-d1-3',
    entidadTipo: 'descuento', entidadId: 'd1',
    accion: 'activar',
    usuarioId: USR.id, usuarioNombre: USR.nombre,
    cambios: [],
    timestamp: '2025-06-25T14:30:00Z',
  },
  {
    id: 'aud-d1-2',
    entidadTipo: 'descuento', entidadId: 'd1',
    accion: 'editar',
    usuarioId: USR.id, usuarioNombre: USR.nombre,
    cambios: [{ campo: 'fechaFin', antes: '2025-07-31', despues: '2025-08-31' }],
    timestamp: '2025-06-20T09:15:00Z',
  },
  {
    id: 'aud-d1-1',
    entidadTipo: 'descuento', entidadId: 'd1',
    accion: 'crear',
    usuarioId: USR.id, usuarioNombre: USR.nombre,
    cambios: [],
    timestamp: '2025-06-01T10:00:00Z',
  },
  // d2 — 20% Off Remeras Oversize
  {
    id: 'aud-d2-2',
    entidadTipo: 'descuento', entidadId: 'd2',
    accion: 'editar',
    usuarioId: USR.id, usuarioNombre: USR.nombre,
    cambios: [{ campo: 'valor', antes: 15, despues: 20 }],
    timestamp: '2025-06-18T11:00:00Z',
  },
  {
    id: 'aud-d2-1',
    entidadTipo: 'descuento', entidadId: 'd2',
    accion: 'crear',
    usuarioId: USR.id, usuarioNombre: USR.nombre,
    cambios: [],
    timestamp: '2025-06-15T09:00:00Z',
  },
  // c1 — BIENVENIDO10
  {
    id: 'aud-c1-2',
    entidadTipo: 'cupon', entidadId: 'c1',
    accion: 'editar',
    usuarioId: USR.id, usuarioNombre: USR.nombre,
    cambios: [{ campo: 'usosMaxTotal', antes: 50, despues: 100 }],
    timestamp: '2025-06-10T15:20:00Z',
  },
  {
    id: 'aud-c1-1',
    entidadTipo: 'cupon', entidadId: 'c1',
    accion: 'crear',
    usuarioId: USR.id, usuarioNombre: USR.nombre,
    cambios: [],
    timestamp: '2025-01-01T08:00:00Z',
  },
]
