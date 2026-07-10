import { useState } from 'react'
import { X, ArrowDownLeft, ArrowUpRight, AlertCircle } from 'lucide-react'
import { useCajaStore } from '../../stores/useCajaStore'
import { useRegistrarMovimiento } from '../../hooks/useCaja'

const FMT = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const MONO = '"Geist Mono", "Fira Code", monospace'

function parseMonto(raw: string): number {
  return parseFloat(raw.replace(/\./g, '').replace(',', '.')) || 0
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

function ModalContent({ onClose }: { onClose: () => void }) {
  const { sesion, acumuladoTurno } = useCajaStore()
  const registrar = useRegistrarMovimiento()

  const [tipo, setTipo] = useState<'ingreso' | 'egreso'>('egreso')
  const [monto, setMonto] = useState('')
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState<string | null>(null)

  const montoN = parseMonto(monto)
  const esEgreso = tipo === 'egreso'
  const requiereMotivo = esEgreso
  const puedeRegistrar = montoN > 0 && (!requiereMotivo || motivo.trim().length > 0)
  const efectivoActual = (sesion?.montoInicial ?? 0) + acumuladoTurno

  const handleRegistrar = async () => {
    if (!puedeRegistrar || !sesion) return
    setError(null)
    try {
      await registrar.mutateAsync({
        tipo,
        monto: montoN,
        motivo: motivo.trim() || `${tipo === 'ingreso' ? 'Ingreso' : 'Egreso'} de caja`,
        cajeroId: sesion.cajero.id,
      })
      onClose()
    } catch {
      setError('Error al registrar el movimiento.')
    }
  }

  const tipoBtn = (t: 'ingreso' | 'egreso') => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '10px 0',
    borderRadius: 8,
    border: 'none',
    background: tipo === t ? 'var(--color-primary)' : 'transparent',
    color: tipo === t ? '#fff' : 'var(--color-muted)',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s',
  } as const)

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--color-bg)', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.22)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: 'Sora, Inter, sans-serif', color: 'var(--color-text)' }}>
            Movimiento de caja
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', display: 'flex', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Toggle ingreso / egreso */}
          <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <button onClick={() => setTipo('ingreso')} style={tipoBtn('ingreso')}>
              <ArrowDownLeft size={15} /> Ingreso
            </button>
            <button onClick={() => setTipo('egreso')} style={tipoBtn('egreso')}>
              <ArrowUpRight size={15} /> Egreso
            </button>
          </div>

          {/* Efectivo actual */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Efectivo actual en caja</span>
            <span style={{ fontSize: 15, fontWeight: 700, fontFamily: MONO, color: 'var(--color-text)' }}>
              $ {FMT.format(efectivoActual)}
            </span>
          </div>

          {/* Monto */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-body)', marginBottom: 6, letterSpacing: '0.04em' }}>
              Monto *
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: MONO, fontSize: 15, fontWeight: 600, color: 'var(--color-muted)', pointerEvents: 'none' }}>$</span>
              <input
                type="text"
                inputMode="decimal"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0"
                autoFocus
                style={{ width: '100%', padding: '10px 12px 10px 28px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 18, fontWeight: 700, fontFamily: MONO, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-body)', marginBottom: 6, letterSpacing: '0.04em' }}>
              Motivo {requiereMotivo ? '*' : <span style={{ fontWeight: 400, color: 'var(--color-muted)' }}>(opcional)</span>}
            </label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && puedeRegistrar && handleRegistrar()}
              placeholder={esEgreso ? 'Ej. pago a proveedor' : 'Ej. refuerzo de cambio'}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${requiereMotivo && !motivo.trim() && montoN > 0 ? 'var(--color-error)' : 'var(--color-border)'}`, background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={13} /> {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, padding: '0 24px 24px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-body)', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancelar
          </button>
          <button
            onClick={handleRegistrar}
            disabled={!puedeRegistrar || registrar.isPending}
            style={{ flex: 2, padding: '12px 0', borderRadius: 10, border: 'none', background: puedeRegistrar ? 'var(--color-primary)' : 'var(--color-border)', color: puedeRegistrar ? '#fff' : 'var(--color-muted)', fontSize: 14, fontWeight: 600, cursor: puedeRegistrar ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}
          >
            {registrar.isPending ? 'Registrando…' : 'Registrar movimiento'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ModalEgresoIngreso({ isOpen, onClose }: Props) {
  if (!isOpen) return null
  return <ModalContent onClose={onClose} />
}
