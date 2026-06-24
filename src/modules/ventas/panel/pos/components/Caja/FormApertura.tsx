import { useState } from 'react'
import { AlertCircle, Unlock } from 'lucide-react'

interface Cajero {
  id: string
  nombre: string
}

interface Props {
  cajero: Cajero
  onConfirm: (params: { montoInicial: number; notas?: string }) => void
  onCancel: () => void
  cargando?: boolean
}

function getIniciales(nombre: string): string {
  return nombre.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function parseMonto(raw: string): number {
  return parseFloat(raw.replace(/\./g, '').replace(',', '.')) || 0
}

function formatFecha(): string {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
}

export function FormApertura({ cajero, onConfirm, onCancel, cargando = false }: Props) {
  const [monto, setMonto] = useState('')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonto(e.target.value)
    if (error) setError(null)
  }

  const handleSubmit = () => {
    const valor = parseMonto(monto)
    if (valor < 0) {
      setError('El monto inicial no puede ser negativo.')
      return
    }
    setError(null)
    onConfirm({ montoInicial: valor, notas: notas.trim() || undefined })
  }

  const inputBase: React.CSSProperties = {
    width: '100%',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--color-surface)' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Card con heading integrado */}
        <div style={{ background: 'var(--color-bg)', borderRadius: 14, border: '1px solid var(--color-border)', padding: 32, display: 'flex', flexDirection: 'column', gap: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

          {/* Encabezado dentro del card */}
          <div style={{ textAlign: 'center', paddingBottom: 6 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(59,130,246,0.1)', color: 'var(--color-primary)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <Unlock size={26} />
            </div>
            <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 700, fontFamily: 'Sora, Inter, sans-serif', color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
              Abrir caja
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--color-muted)' }}>
              Registrá el efectivo con el que abrís el turno.
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--color-muted)', textTransform: 'capitalize' }}>
              {formatFecha()}
            </p>
          </div>

          {/* Cajero */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, letterSpacing: '0.02em' }}>
              {getIniciales(cajero.nombre)}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>{cajero.nombre}</p>
              <p style={{ margin: '1px 0 0', fontSize: 12, color: 'var(--color-muted)' }}>Cajero</p>
            </div>
          </div>

          {/* Monto */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-body)', marginBottom: 6 }}>
              Monto inicial en efectivo
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: '"Geist Mono", monospace', fontSize: 15, fontWeight: 600, color: 'var(--color-muted)', pointerEvents: 'none' }}>$</span>
              <input
                type="text"
                inputMode="decimal"
                value={monto}
                onChange={handleChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="0"
                autoFocus
                style={{ ...inputBase, padding: '10px 12px 10px 28px', fontSize: 18, fontWeight: 700, fontFamily: '"Geist Mono", "Fira Code", monospace', letterSpacing: '-0.01em', borderColor: error ? 'var(--color-error)' : 'var(--color-border)' }}
              />
            </div>
            {error && (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={13} /> {error}
              </p>
            )}
          </div>

          {/* Notas */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-body)', marginBottom: 6 }}>
              Notas <span style={{ fontWeight: 400, color: 'var(--color-muted)' }}>(opcional)</span>
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej. cambio chico para vueltos"
              rows={2}
              style={{ ...inputBase, padding: '10px 12px', resize: 'vertical' }}
            />
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
            <button onClick={onCancel} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={cargando}
              style={{ flex: 2, padding: '11px 0', borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: cargando ? 'not-allowed' : 'pointer', opacity: cargando ? 0.7 : 1, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Unlock size={15} />
              {cargando ? 'Abriendo...' : 'Abrir caja'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
