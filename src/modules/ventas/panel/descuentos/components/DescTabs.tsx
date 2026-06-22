// Barra de tabs del módulo de descuentos.

export type VistaDescuento = 'cupones' | 'nuevo' | 'promos' | 'rendimiento'

interface DescTabsProps {
    activo: VistaDescuento
    ir:     (vista: VistaDescuento) => void
}

// La vista 'nuevo' (alta de cupón) se muestra bajo la tab "Cupones".
const TABS: { id: VistaDescuento; label: string }[] = [
    { id: 'cupones',     label: 'Cupones'     },
    { id: 'promos',      label: 'Promos auto' },
    { id: 'rendimiento', label: 'Rendimiento' },
]

export function DescTabs({ activo, ir }: DescTabsProps) {
    const efectivo = activo === 'nuevo' ? 'cupones' : activo
    return (
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)', marginBottom: 20, overflowX: 'auto' }}>
            {TABS.map(tb => {
                const a = efectivo === tb.id
                return (
                    <button
                        key={tb.id}
                        onClick={() => ir(tb.id)}
                        style={{
                            padding: '10px 14px', border: 'none', background: 'transparent',
                            color: a ? 'var(--color-text)' : 'var(--color-muted)',
                            fontSize: 13.5, fontWeight: a ? 600 : 500, cursor: 'pointer',
                            fontFamily: 'inherit', borderBottom: `2px solid ${a ? 'var(--color-primary)' : 'transparent'}`,
                            marginBottom: -1, whiteSpace: 'nowrap',
                        }}
                    >
                        {tb.label}
                    </button>
                )
            })}
        </div>
    )
}
