import { CheckCircle2, Printer, MessageCircle, Mail, Link2, Plus } from 'lucide-react'
import { LABELS_METODO } from './MetodoPago'
import type { ResultadoVenta } from '../../types'

const MONO = '"Geist Mono", "Fira Code", monospace'
const FMT = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

interface Props {
  isOpen: boolean
  resultado: ResultadoVenta | null
  onNuevoTicket: () => void
  onClose: () => void
}

function labelMetodos(resultado: ResultadoVenta): string {
  const tipos = [...new Set(resultado.metodosPago.map((m) => LABELS_METODO[m.tipo]))]
  return tipos.join(' + ')
}

interface AccionProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

function Accion({ icon, label, onClick }: AccionProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px 12px',
        borderRadius: 10,
        color: 'var(--color-body)',
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
    >
      <span style={{ display: 'flex', width: 38, height: 38, borderRadius: 10, border: '1px solid var(--color-border)', alignItems: 'center', justifyContent: 'center', color: 'var(--color-body)' }}>
        {icon}
      </span>
      <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{label}</span>
    </button>
  )
}

function ModalPostVentaContent({ resultado, onNuevoTicket, onClose }: Omit<Props, 'isOpen'>) {
  if (!resultado) return null

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--color-bg)', borderRadius: 16, width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.22)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px 24px', gap: 0 }}
      >
        {/* Check ícono */}
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(16,185,129,.12)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <CheckCircle2 size={28} strokeWidth={2} />
        </div>

        {/* Título */}
        <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, fontFamily: 'Sora, Inter, sans-serif', color: 'var(--color-text)', textAlign: 'center' }}>
          ¡Venta registrada!
        </h2>

        {/* Comprobante */}
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
          Comprobante
        </p>
        <p style={{ margin: '0 0 20px', fontSize: 26, fontWeight: 800, fontFamily: MONO, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
          {resultado.numeroComprobante}
        </p>

        {/* Resumen */}
        <div style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Total cobrado</span>
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: 'var(--color-text)' }}>
              $ {FMT.format(resultado.total)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Método</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>
              {labelMetodos(resultado)}
            </span>
          </div>
          {resultado.vuelto != null && resultado.vuelto > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Vuelto</span>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: 'var(--color-success)' }}>
                $ {FMT.format(resultado.vuelto)}
              </span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, justifyContent: 'center' }}>
          <Accion icon={<Printer size={18} strokeWidth={1.5} />} label="Imprimir" onClick={() => window.print()} />
          <Accion icon={<MessageCircle size={18} strokeWidth={1.5} />} label="WhatsApp" onClick={() => {}} />
          <Accion icon={<Mail size={18} strokeWidth={1.5} />} label="Email" onClick={() => {}} />
          <Accion icon={<Link2 size={18} strokeWidth={1.5} />} label="Copiar link" onClick={() => navigator.clipboard?.writeText(resultado.numeroComprobante)} />
        </div>

        {/* Nuevo ticket */}
        <button
          onClick={onNuevoTicket}
          style={{ width: '100%', padding: '13px 0', borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}
        >
          <Plus size={16} /> Nuevo ticket
        </button>

        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-muted)', fontFamily: 'inherit' }}
        >
          Ver detalle
        </button>
      </div>
    </div>
  )
}

export function ModalPostVenta({ isOpen, ...rest }: Props) {
  if (!isOpen) return null
  return <ModalPostVentaContent {...rest} />
}
