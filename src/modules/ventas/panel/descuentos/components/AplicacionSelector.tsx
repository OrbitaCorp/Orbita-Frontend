import { Zap, HandIcon } from 'lucide-react'
import type { Aplicacion } from '../types'

interface AplicacionCard {
  valor: Aplicacion
  Icono: React.ComponentType<{ size?: number; color?: string }>
  nombre: string
  desc: string
}

const CARDS: AplicacionCard[] = [
  {
    valor: 'automatico',
    Icono: Zap,
    nombre: 'Automático',
    desc: 'Se aplica solo cuando se cumplen las condiciones. No requiere acción del vendedor.',
  },
  {
    valor: 'manual',
    Icono: HandIcon,
    nombre: 'Manual',
    desc: 'El vendedor lo aplica desde el POS cuando el cliente lo solicita.',
  },
]

interface Props {
  aplicacion: Aplicacion
  onChange: (aplicacion: Aplicacion) => void
  error?: string
}

export function AplicacionSelector({ aplicacion, onChange, error }: Props) {
  return (
    <div>
      <div className="dcto-g2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {CARDS.map(({ valor, Icono, nombre, desc }) => {
          const activo = aplicacion === valor
          return (
            <button
              key={valor}
              type="button"
              onClick={() => onChange(valor)}
              style={{
                textAlign: 'left',
                padding: 16,
                borderRadius: 10,
                border: `1.5px solid ${activo ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: activo ? 'var(--color-primary-bg)' : 'var(--color-bg)',
                cursor: 'pointer',
                transition: 'border-color 150ms ease, background 150ms ease',
              }}
            >
              <div
                style={{
                  width: 36, height: 36, borderRadius: 10, marginBottom: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: activo ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                  transition: 'background 150ms ease',
                }}
              >
                <Icono
                  size={18}
                  color={activo ? '#fff' : 'var(--color-muted)'}
                />
              </div>
              <div
                style={{
                  fontSize: 14, fontWeight: 600, marginBottom: 4,
                  color: activo ? 'var(--color-primary-h)' : 'var(--color-text)',
                }}
              >
                {nombre}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.5 }}>
                {desc}
              </div>
            </button>
          )
        })}
      </div>
      {error && (
        <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-error)' }}>{error}</p>
      )}
    </div>
  )
}
