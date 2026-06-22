interface StatusConfig {
  bg: string
  color: string
  label: string
}

const STATUS_MAP: Record<string, StatusConfig> = {
  abierta:   { bg: 'rgba(16,185,129,.12)',  color: 'var(--color-success)', label: 'Abierta'   },
  cerrada:   { bg: 'rgba(100,116,139,.12)', color: 'var(--color-muted)',   label: 'Cerrada'   },
  forzada:   { bg: 'rgba(239,68,68,.12)',   color: 'var(--color-error)',   label: 'Forzada'   },
  en_curso:  { bg: 'rgba(59,130,246,.12)',  color: 'var(--color-primary)', label: 'En curso'  },
  pendiente: { bg: 'rgba(245,158,11,.12)',  color: 'var(--color-warning)', label: 'Pendiente' },
  aprobado:  { bg: 'rgba(16,185,129,.12)',  color: 'var(--color-success)', label: 'Aprobado'  },
  rechazado: { bg: 'rgba(239,68,68,.12)',   color: 'var(--color-error)',   label: 'Rechazado' },
  activo:    { bg: 'rgba(16,185,129,.12)',  color: 'var(--color-success)', label: 'Activo'    },
  inactivo:  { bg: 'rgba(100,116,139,.12)', color: 'var(--color-muted)',   label: 'Inactivo'  },
}

interface Props {
  status: string
  label?: string
}

export function StatusBadge({ status, label }: Props) {
  const cfg = STATUS_MAP[status] ?? {
    bg: 'rgba(100,116,139,.12)',
    color: 'var(--color-muted)',
    label: status,
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        borderRadius: 100,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      {label ?? cfg.label}
    </span>
  )
}
