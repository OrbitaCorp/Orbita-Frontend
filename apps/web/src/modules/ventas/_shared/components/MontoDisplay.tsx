type MontoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const SIZE_PX: Record<MontoSize, number> = {
  xs: 11,
  sm: 13,
  md: 16,
  lg: 22,
  xl: 32,
}

const FORMATO = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

interface Props {
  monto: number
  size?: MontoSize
  color?: string
  prefix?: string
  showSign?: boolean
  dim?: boolean
}

export function MontoDisplay({
  monto,
  size = 'md',
  color,
  prefix = '$',
  showSign = false,
  dim = false,
}: Props) {
  const sign = showSign ? (monto >= 0 ? '+' : '-') : monto < 0 ? '-' : ''

  const resolvedColor =
    color ??
    (dim
      ? 'var(--color-muted)'
      : monto < 0
      ? 'var(--color-error)'
      : 'var(--color-text)')

  return (
    <span
      style={{
        fontFamily: '"Geist Mono", "Fira Code", monospace',
        fontSize: SIZE_PX[size],
        fontWeight: 600,
        color: resolvedColor,
        letterSpacing: '-0.02em',
      }}
    >
      {sign}{prefix}{FORMATO.format(Math.abs(monto))}
    </span>
  )
}
