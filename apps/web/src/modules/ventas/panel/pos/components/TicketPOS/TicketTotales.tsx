const MONO = '"Geist Mono", "Fira Code", monospace'

const FORMATO = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export interface DescuentoDesglose {
  label: string
  valor: number  // siempre positivo
}

interface Props {
  subtotal: number
  descuentos: DescuentoDesglose[]
  iva: number
  total: number
}

interface FilaProps {
  label: string
  valor: number
  muted?: boolean
  negativo?: boolean
}

function Fila({ label, valor, muted, negativo }: FilaProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 4,
      }}
    >
      <span style={{ fontSize: 13, color: muted ? 'var(--color-muted)' : 'var(--color-body)' }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          fontFamily: MONO,
          color: negativo ? 'var(--color-success)' : muted ? 'var(--color-muted)' : 'var(--color-body)',
        }}
      >
        {negativo ? '−' : ''}$ {FORMATO.format(Math.abs(valor))}
      </span>
    </div>
  )
}

export function TicketTotales({ subtotal, descuentos, iva, total }: Props) {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--color-border)',
        flexShrink: 0,
      }}
    >
      <Fila label="Subtotal" valor={subtotal} muted />

      {descuentos.map((d) => (
        <Fila key={d.label} label={d.label} valor={d.valor} negativo />
      ))}

      <Fila label="IVA 21% (incl.)" valor={iva} muted />

      {/* Total dominante */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginTop: 8,
          paddingTop: 8,
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--color-text)',
          }}
        >
          Total
        </span>
        <span
          style={{
            fontSize: 28,
            fontWeight: 800,
            fontFamily: MONO,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          $ {FORMATO.format(total)}
        </span>
      </div>
    </div>
  )
}
