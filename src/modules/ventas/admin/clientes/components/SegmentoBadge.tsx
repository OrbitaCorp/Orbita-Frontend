// Badge de segmento de cliente (VIP / Recurrente / Nuevo / Inactivo).
// Colores semi-transparentes legibles tanto en claro como en oscuro.

import type { Segmento } from '../types/clientes.types'

export const SEG_CONFIG: Record<Segmento, { label: string; bg: string; fg: string }> = {
    vip:        { label: 'VIP ★',      bg: 'rgba(245,158,11,0.14)',  fg: '#F59E0B' },
    recurrente: { label: 'Recurrente', bg: 'rgba(59,130,246,0.12)',  fg: '#3B82F6' },
    nuevo:      { label: 'Nuevo',      bg: 'rgba(16,185,129,0.12)',  fg: '#10B981' },
    inactivo:   { label: 'Inactivo',   bg: 'rgba(148,163,184,0.16)', fg: '#94A3B8' },
}

export function SegmentoBadge({ segmento, size = 'md' }: { segmento: Segmento; size?: 'sm' | 'md' }) {
    const c = SEG_CONFIG[segmento]
    const h = size === 'sm' ? 22 : 24
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', height: h, padding: '0 10px',
            borderRadius: 9999, background: c.bg, color: c.fg,
            fontSize: size === 'sm' ? 11 : 12, fontWeight: 600, whiteSpace: 'nowrap',
        }}>
            {c.label}
        </span>
    )
}
