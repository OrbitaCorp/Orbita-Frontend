// Barra de tabs del módulo de pedidos.
// Cada tab navega a una sub-vista del hub vía el callback `ir`.

import { Plus } from 'lucide-react'

export type VistaPedido =
    | 'lista'
    | 'detalle'
    | 'nuevo'
    | 'historial'
    | 'cola'
    | 'devoluciones'
    | 'notas'

const TABS: { id: VistaPedido; label: string; primary?: boolean }[] = [
    { id: 'lista',        label: 'Lista'             },
    { id: 'cola',         label: 'Cola preparación'  },
    { id: 'historial',    label: 'Historial'         },
    { id: 'devoluciones', label: 'Devoluciones'      },
    { id: 'notas',        label: 'Notas crédito'     },
    { id: 'nuevo',        label: 'Nuevo pedido', primary: true },
]

interface PedidoTabsProps {
    activo: VistaPedido
    ir:     (vista: VistaPedido) => void
}

export function PedidoTabs({ activo, ir }: PedidoTabsProps) {
    return (
        <div style={{
            display:      'flex',
            gap:          4,
            borderBottom: '1px solid var(--color-border)',
            marginBottom: 20,
            overflowX:    'auto',
        }}>
            {TABS.map(tb => {
                const a = activo === tb.id
                return (
                    <button
                        key={tb.id}
                        onClick={() => ir(tb.id)}
                        style={{
                            padding:      '10px 14px',
                            border:       'none',
                            background:   'transparent',
                            color:        tb.primary ? 'var(--color-primary)' : a ? 'var(--color-text)' : 'var(--color-muted)',
                            fontSize:     13.5,
                            fontWeight:   a || tb.primary ? 600 : 500,
                            cursor:       'pointer',
                            fontFamily:   'inherit',
                            borderBottom: `2px solid ${a ? 'var(--color-primary)' : 'transparent'}`,
                            marginBottom: -1,
                            whiteSpace:   'nowrap',
                            display:      'inline-flex',
                            alignItems:   'center',
                            gap:          6,
                        }}
                    >
                        {tb.primary && <Plus size={14} strokeWidth={2} />}
                        {tb.label}
                    </button>
                )
            })}
        </div>
    )
}
