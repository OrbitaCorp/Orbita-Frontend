import { Zap } from 'lucide-react'
import type { TipoDescuento, Aplicacion } from '../types'
import { TIPO_DESCUENTO_LABELS } from '../types'

interface PropsTipoDescuento {
  tipo: TipoDescuento
  aplicacion: Aplicacion
}

interface PropsTipoCupon {
  label: string
}

type Props = PropsTipoDescuento | PropsTipoCupon

function esDescuento(p: Props): p is PropsTipoDescuento {
  return 'tipo' in p
}

const badgeBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  height: 22,
  padding: '0 8px',
  borderRadius: 6,
  background: 'var(--color-surface-alt)',
  color: 'var(--color-body)',
  fontSize: 11,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  border: '1px solid var(--color-border)',
}

export function BadgeTipo(props: Props) {
  if (esDescuento(props)) {
    const esAuto = props.aplicacion === 'automatico'
    return (
      <span style={badgeBase}>
        {esAuto && <Zap size={10} color="var(--color-warning)" style={{ flexShrink: 0 }} />}
        {TIPO_DESCUENTO_LABELS[props.tipo]}
      </span>
    )
  }
  return (
    <span style={badgeBase}>
      {props.label}
    </span>
  )
}
