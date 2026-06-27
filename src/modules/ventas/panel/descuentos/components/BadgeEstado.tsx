import type { EstadoDescuento, EstadoCupon } from '../types'

// Colores basados en los tokens globales de Orbita (globals.css).
// agotado usa warning (naranja) — no hay token dedicado.
const CONFIG: Record<
  EstadoDescuento | EstadoCupon,
  { dot: string; bg: string; fg: string; label: string }
> = {
  activo:     { dot: 'var(--color-success)',  bg: 'var(--color-success-bg)',  fg: 'var(--color-success)',  label: 'Activo'     },
  inactivo:   { dot: 'var(--color-muted)',    bg: 'var(--color-surface-alt)', fg: 'var(--color-muted)',    label: 'Inactivo'   },
  programado: { dot: 'var(--color-primary)',  bg: 'var(--color-primary-bg)',  fg: 'var(--color-primary)',  label: 'Programado' },
  expirado:   { dot: 'var(--color-error)',    bg: 'var(--color-error-bg)',    fg: 'var(--color-error)',    label: 'Expirado'   },
  agotado:    { dot: 'var(--color-warning)',  bg: 'var(--color-warning-bg)',  fg: 'var(--color-warning)',  label: 'Agotado'    },
}

interface Props {
  estado: EstadoDescuento | EstadoCupon
}

export function BadgeEstado({ estado }: Props) {
  const cfg = CONFIG[estado] ?? CONFIG.inactivo
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 24,
        padding: '0 10px',
        borderRadius: 9999,
        background: cfg.bg,
        color: cfg.fg,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  )
}
