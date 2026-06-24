import { useState } from 'react'
import { PauseCircle, X, Play, Trash2 } from 'lucide-react'
import { usePausadosStore } from '../../stores/usePausadosStore'
import { useTicketStore } from '../../stores/useTicketStore'
import type { TicketPausado } from '../../types'

const FMT = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const MONO = '"Geist Mono", "Fira Code", monospace'

function formatHora(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

function totalTicket(t: TicketPausado): number {
  return t.items.reduce((s, i) => s + (i.precioEditado ?? i.precioUnitario) * i.cantidad, 0)
}

function inicial(nombre?: string): string {
  return nombre ? nombre[0].toUpperCase() : '?'
}

// ─── Card de un ticket pausado ─────────────────────────────────────────────

interface CardProps {
  ticket: TicketPausado
  confirmando: boolean
  onRetomar: () => void
  onPedirConfirmar: () => void
  onCancelarConfirmar: () => void
  onDescartar: () => void
}

function PausadoCard({ ticket, confirmando, onRetomar, onPedirConfirmar, onCancelarConfirmar, onDescartar }: CardProps) {
  const totalItems = ticket.items.reduce((s, i) => s + i.cantidad, 0)
  const total = totalTicket(ticket)
  const nombre = ticket.cliente?.nombre

  return (
    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
      {/* Avatar + info */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: nombre ? 'var(--color-primary)' : 'var(--color-border)', color: nombre ? '#fff' : 'var(--color-muted)', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {inicial(nombre)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: '0 0 1px', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {nombre ?? 'Sin cliente'}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted)' }}>
            {formatHora(ticket.pausadoEn)} · {totalItems} {totalItems === 1 ? 'item' : 'items'} ·{' '}
            <span style={{ fontFamily: MONO, fontWeight: 600, color: 'var(--color-text)' }}>
              $ {FMT.format(total)}
            </span>
          </p>
        </div>
      </div>

      {/* Acciones */}
      {confirmando ? (
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--color-body)' }}>¿Descartar este ticket?</p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={onCancelarConfirmar} style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancelar
            </button>
            <button onClick={onDescartar} style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', background: 'var(--color-error)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Descartar
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onRetomar} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Play size={12} fill="currentColor" /> Retomar
          </button>
          <button onClick={onPedirConfirmar} style={{ width: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer' }}>
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Drawer ────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function DrawerPausados({ isOpen, onClose }: Props) {
  const { tickets, retomar, eliminar } = usePausadosStore()
  const { limpiarTicket, agregarItem, asociarCliente } = useTicketStore()
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null)

  if (!isOpen) return null

  const handleRetomar = (id: string) => {
    const ticket = retomar(id)
    if (!ticket) return
    limpiarTicket()
    ticket.items.forEach((item) => agregarItem({
      productoId: item.productoId,
      varianteId: item.varianteId,
      nombre: item.nombre,
      variante: item.variante,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      precioEditado: item.precioEditado,
      esConcepto: item.esConcepto,
    }))
    if (ticket.cliente) asociarCliente(ticket.cliente)
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 490, background: 'rgba(0,0,0,0.3)' }} />

      {/* Drawer */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 500, width: 300, background: 'var(--color-bg)', borderLeft: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PauseCircle size={16} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Tickets en pausa</span>
            {tickets.length > 0 && (
              <span style={{ padding: '1px 7px', borderRadius: 10, background: 'var(--color-primary)', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                {tickets.length}
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', display: 'flex', padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* Lista */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {tickets.length === 0 ? (
            <p style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--color-muted)', margin: 0 }}>
              No hay tickets pausados.
            </p>
          ) : (
            tickets.map((t) => (
              <PausadoCard
                key={t.id}
                ticket={t}
                confirmando={confirmandoId === t.id}
                onRetomar={() => handleRetomar(t.id)}
                onPedirConfirmar={() => setConfirmandoId(t.id)}
                onCancelarConfirmar={() => setConfirmandoId(null)}
                onDescartar={() => { eliminar(t.id); setConfirmandoId(null) }}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}
