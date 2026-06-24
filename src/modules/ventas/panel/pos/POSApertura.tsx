import { useState } from 'react'
import { AlertCircle, LogIn } from 'lucide-react'
import { useCajaStore } from './stores/useCajaStore'
import { FormApertura } from './components/Caja/FormApertura'
import type { SesionCaja } from './types'

// Cajero hardcodeado hasta integrar autenticación real
const CAJERO_MOCK = { id: 'usr-1', nombre: 'Alan Méndez' }

function formatHora(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso)
  )
}

// ─── Sub-vista: caja ya abierta ───────────────────────────────────────────────

interface CajaAbiertaProps {
  sesion: SesionCaja
  onIrAlPOS: () => void
  onVolver: () => void
}

function CajaYaAbierta({ sesion, onIrAlPOS, onVolver }: CajaAbiertaProps) {
  return (
    <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 24, background: 'var(--color-surface)' }}>
      <div
        style={{
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          padding: 32,
          borderRadius: 16,
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.07)',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'rgba(245,158,11,0.1)',
            color: 'var(--color-warning)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <AlertCircle size={26} />
        </div>

        <div>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, fontFamily: 'Sora, Inter, sans-serif', color: 'var(--color-text)' }}>
            Caja ya abierta
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.6 }}>
            Tenés una caja abierta desde las{' '}
            <strong style={{ color: 'var(--color-text)' }}>{formatHora(sesion.fechaApertura)}</strong>{' '}
            por <strong style={{ color: 'var(--color-text)' }}>{sesion.cajero.nombre}</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          <button
            onClick={onIrAlPOS}
            style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <LogIn size={15} /> Ir al POS
          </button>
          <button
            onClick={onVolver}
            style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-muted)', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────

interface Props {
  onConfirm: () => void
  onCancel: () => void
}

export function POSApertura({ onConfirm, onCancel }: Props) {
  const { estado, sesion, abrirCaja } = useCajaStore()
  const [cargando, setCargando] = useState(false)

  if (estado === 'abierta' && sesion) {
    return <CajaYaAbierta sesion={sesion} onIrAlPOS={onConfirm} onVolver={onCancel} />
  }

  const handleConfirm = ({ montoInicial, notas }: { montoInicial: number; notas?: string }) => {
    setCargando(true)
    abrirCaja({ montoInicial, cajero: CAJERO_MOCK, notas })
    setCargando(false)
    onConfirm()
  }

  return (
    <FormApertura
      cajero={CAJERO_MOCK}
      onConfirm={handleConfirm}
      onCancel={onCancel}
      cargando={cargando}
    />
  )
}
