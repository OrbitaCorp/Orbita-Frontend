// Barra de tabs del módulo de configuración.

export type VistaConfig = 'general' | 'apariencia' | 'equipo' | 'notificaciones'

const TABS: { id: VistaConfig; label: string }[] = [
    { id: 'general',        label: 'General'        },
    { id: 'apariencia',     label: 'Apariencia'     },
    { id: 'equipo',         label: 'Equipo'         },
    { id: 'notificaciones', label: 'Notificaciones' },
]

interface ConfigTabsProps {
    activo: VistaConfig
    ir:     (vista: VistaConfig) => void
}

export function ConfigTabs({ activo, ir }: ConfigTabsProps) {
    return (
        <>
        <style>{`.mod-tabs{-ms-overflow-style:none;scrollbar-width:none}.mod-tabs::-webkit-scrollbar{display:none}`}</style>
        <div className="mod-tabs" style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)', marginBottom: 20, overflowX: 'auto' }}>
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
        </>
    )
}
