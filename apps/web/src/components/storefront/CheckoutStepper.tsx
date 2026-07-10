import { Check } from 'lucide-react'

type Props = { step: 1 | 2 | 3 }

const STEPS = ['Datos', 'Pago', 'Confirmación']

export function CheckoutStepper({ step }: Props) {
  return (
    <>
      <style>{`
        @media (max-width: 480px) {
          .sf-stepper-label { display: none !important; }
          .sf-stepper-line  { width: 32px !important; margin: 0 8px !important; }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 40 }}>
        {STEPS.map((label, i) => {
          const n    = i + 1
          const done = n < step
          const curr = n === step
          return (
            <span key={label} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: done ? 'var(--color-success)' : curr ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: (done || curr) ? '#fff' : 'var(--color-muted)',
                  display: 'grid', placeItems: 'center',
                  fontSize: 13, fontWeight: 700,
                  border: (!done && !curr) ? '1px solid var(--color-border)' : 'none',
                  fontFamily: '"Geist Mono", monospace',
                  flexShrink: 0,
                }}>
                  {done ? <Check size={16} strokeWidth={2.5} /> : n}
                </span>
                <span className="sf-stepper-label" style={{
                  fontSize: 14, fontWeight: curr ? 700 : 500,
                  color: (done || curr) ? 'var(--color-text)' : 'var(--color-muted)',
                }}>
                  {label}
                </span>
              </span>
              {i < STEPS.length - 1 && (
                <span className="sf-stepper-line" style={{
                  display: 'inline-block',
                  width: 60, height: 2, margin: '0 16px',
                  background: done ? 'var(--color-success)' : 'var(--color-border)',
                }} />
              )}
            </span>
          )
        })}
      </div>
    </>
  )
}
