// Barra de tabs del módulo POS (punto de venta).

export type VistaPOS = 'cobro' | 'apertura' | 'cierre' | 'historial'

const TABS: { id: VistaPOS; label: string }[] = [
    { id: 'cobro',     label: 'Cobro rápido'    },
    { id: 'apertura',  label: 'Abrir caja'      },
    { id: 'cierre',    label: 'Cerrar caja'     },
    { id: 'historial', label: 'Historial cajas' },
]

interface POSTabsProps {
    activo: VistaPOS
    ir:     (vista: VistaPOS) => void
}

export function POSTabs({ activo, ir }: POSTabsProps) {
    return (
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)', marginBottom: 20, overflowX: 'auto' }}>
            {TABS.map(tb => {
                const a = activo === tb.id
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
