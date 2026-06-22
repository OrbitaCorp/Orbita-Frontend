import { Banknote, CreditCard, ArrowLeftRight, QrCode } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TipoMetodoPago } from '../../types'

interface Metodo { tipo: TipoMetodoPago; label: string; Icon: LucideIcon }

export const METODOS_PAGO: Metodo[] = [
  { tipo: 'efectivo',        label: 'Efectivo',        Icon: Banknote },
  { tipo: 'tarjeta_debito',  label: 'Tarjeta débito',  Icon: CreditCard },
  { tipo: 'tarjeta_credito', label: 'Tarjeta crédito', Icon: CreditCard },
  { tipo: 'transferencia',   label: 'Transferencia',   Icon: ArrowLeftRight },
  { tipo: 'qr',              label: 'QR',              Icon: QrCode },
]

export const LABELS_METODO: Record<TipoMetodoPago, string> = {
  efectivo:        'Efectivo',
  tarjeta_debito:  'Tarjeta débito',
  tarjeta_credito: 'Tarjeta crédito',
  transferencia:   'Transferencia',
  qr:              'QR',
}

interface Props {
  seleccionado: TipoMetodoPago
  onChange: (tipo: TipoMetodoPago) => void
}

export function SelectorMetodoPago({ seleccionado, onChange }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {METODOS_PAGO.map(({ tipo, label, Icon }) => {
        const activo = seleccionado === tipo
        return (
          <button
            key={tipo}
            onClick={() => onChange(tipo)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '10px 12px',
              borderRadius: 8,
              border: `1.5px solid ${activo ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: activo ? 'rgba(59,130,246,.07)' : 'var(--color-bg)',
              color: activo ? 'var(--color-primary)' : 'var(--color-body)',
              fontSize: 13,
              fontWeight: activo ? 600 : 400,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
              transition: 'border-color 0.1s, background 0.1s',
            }}
          >
            <Icon size={15} strokeWidth={1.8} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
