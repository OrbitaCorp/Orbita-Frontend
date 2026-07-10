const MONO = '"Geist Mono", "Fira Code", monospace'
const FMT = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

export function parseMonto(raw: string): number {
  return parseFloat(raw.replace(/\./g, '').replace(',', '.')) || 0
}

function quickAmounts(total: number): number[] {
  const candidates = [
    total,
    Math.ceil(total / 1000) * 1000,
    Math.ceil(total / 10000) * 10000,
  ]
  return [...new Set(candidates)].slice(0, 4)
}

interface Props {
  total: number
  monto: string
  onChange: (v: string) => void
}

export function InputMonto({ total, monto, onChange }: Props) {
  const montoN = parseMonto(monto)
  const diff = montoN - total
  const hayMonto = montoN > 0

  const esVuelto = hayMonto && diff >= 0
  const esFalta = !hayMonto || diff < 0
  const diffAbs = hayMonto ? Math.abs(diff) : total

  const resultColor = esVuelto ? 'var(--color-success)' : 'var(--color-error)'
  const resultBg = esVuelto ? 'rgba(16,185,129,.06)' : 'rgba(239,68,68,.06)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
        Monto recibido
      </p>

      {/* Input con prefijo $ */}
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: MONO, fontSize: 15, fontWeight: 600, color: 'var(--color-muted)', pointerEvents: 'none' }}>
          $
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={monto}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          autoFocus
          style={{
            width: '100%',
            padding: '11px 12px 11px 28px',
            borderRadius: 8,
            border: '1.5px solid var(--color-border)',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            fontSize: 20,
            fontWeight: 700,
            fontFamily: MONO,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Quick amounts */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {quickAmounts(total).map((q, i) => (
          <button
            key={q}
            onClick={() => onChange(FMT.format(q))}
            style={{
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontFamily: MONO,
              fontWeight: i === 0 ? 600 : 400,
              border: '1px solid var(--color-border)',
              background: montoN === q ? 'var(--color-primary)' : 'var(--color-surface)',
              color: montoN === q ? '#fff' : 'var(--color-body)',
              cursor: 'pointer',
            }}
          >
            {i === 0 ? 'Monto exacto' : FMT.format(q)}
          </button>
        ))}
      </div>

      {/* Vuelto / Falta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: resultBg, border: `1px solid ${resultColor}` }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: resultColor }}>
          {esVuelto ? 'Vuelto' : 'Falta'}
        </span>
        <span style={{ fontSize: 22, fontWeight: 800, fontFamily: MONO, letterSpacing: '-0.02em', color: resultColor }}>
          $ {FMT.format(diffAbs)}
        </span>
      </div>
    </div>
  )
}
