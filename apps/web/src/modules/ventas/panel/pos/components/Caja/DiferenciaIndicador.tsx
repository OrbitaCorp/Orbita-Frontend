import { CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react'

const FMT = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const MONO = '"Geist Mono", "Fira Code", monospace'

interface Props {
  conteoN: number   // valor físico ingresado (numérico)
  totalTeorico: number
}

export function DiferenciaIndicador({ conteoN, totalTeorico }: Props) {
  if (conteoN === 0 && totalTeorico !== 0) return null

  const diff = conteoN - totalTeorico
  const esCuadre = diff === 0
  const esSobra = diff > 0

  const color = esCuadre
    ? 'var(--color-success)'
    : esSobra
      ? 'var(--color-warning)'
      : 'var(--color-error)'

  const bg = esCuadre
    ? 'rgba(16,185,129,.07)'
    : esSobra
      ? 'rgba(245,158,11,.07)'
      : 'rgba(239,68,68,.07)'

  const Icon = esCuadre ? CheckCircle2 : esSobra ? TrendingUp : TrendingDown
  const label = esCuadre ? 'Cuadra exacto' : esSobra ? 'Sobra' : 'Falta'

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 14px',
        borderRadius: 10,
        background: bg,
        border: `1.5px solid ${color}`,
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 14,
          fontWeight: 600,
          color,
        }}
      >
        <Icon size={15} />
        {label}
      </span>
      <span
        style={{
          fontSize: 22,
          fontWeight: 800,
          fontFamily: MONO,
          letterSpacing: '-0.02em',
          color,
        }}
      >
        {esCuadre ? '$ 0' : `$ ${FMT.format(Math.abs(diff))}`}
      </span>
    </div>
  )
}
