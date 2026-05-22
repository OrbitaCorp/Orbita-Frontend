// components/AlertasGrid.tsx
// Grid de máximo 4 alertas agrupadas por tipo.
// Siempre danger primero, luego warning.
// Cada card muestra el contador de casos y navega al módulo correspondiente.

import { useRouter }                                                          from 'next/router'
import { Package, Clock, CreditCard, RotateCcw, AlertTriangle }              from 'lucide-react'
import type { DashboardData, TipoAlerta }                                    from '../mock/dashboard.mock'

type Alerta = DashboardData['alertas'][number]

// Configuración visual por tipo — ícono + colores semánticos
// Usa variables CSS del design system para que funcione en light y dark mode
const ALERTA_CONFIG: Record<TipoAlerta, {
    Icono: React.ElementType
    fg:    string
    bg:    string
}> = {
    stock_critico:    { Icono: Package,       fg: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
    stock_sin_stock:  { Icono: AlertTriangle, fg: 'var(--color-error)',   bg: 'var(--color-error-bg)'   },
    pedidos_demora:   { Icono: Clock,         fg: 'var(--color-error)',   bg: 'var(--color-error-bg)'   },
    pagos_pendientes: { Icono: CreditCard,    fg: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
    devoluciones:     { Icono: RotateCcw,     fg: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
}

export function AlertasGrid({ alertas }: { alertas: Alerta[] }) {
    const router        = useRouter()
    const { negocioId } = router.query

    // Ordenar danger primero, tomar máximo 4
    // El backend ya manda las 4 más críticas, pero ordenamos por si acaso
    const visibles = [...alertas]
        .sort((a, b) => {
            const p = { danger: 0, warning: 1 }
            return p[a.nivel] - p[b.nivel]
        })
        .slice(0, 4)

    return (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10 }}>
            {visibles.map(a => {
                // Obtiene config del tipo, con fallback seguro si llega un tipo nuevo del backend
                const cfg            = ALERTA_CONFIG[a.tipo] ?? ALERTA_CONFIG['stock_critico']
                const { Icono, fg, bg } = cfg

                // URL completa con negocioId dinámico
                const url = `/admin/${negocioId}${a.path}`

                return (
                    <div
                        key={a.id}
                        onClick={() => router.push(url)}
                        style={{
                            display:       'flex',
                            flexDirection: 'column',
                            gap:           8,
                            padding:       12,
                            background:    bg,
                            borderLeft:    `3px solid ${fg}`,
                            borderRadius:  8,
                            cursor:        'pointer',
                            minWidth:      0,
                            transition:    'opacity 150ms ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                        {/* Encabezado: ícono + título */}
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{
                                width:        24,
                                height:       24,
                                borderRadius: 6,
                                background:   fg,
                                color:        '#fff',
                                display:      'grid',
                                placeItems:   'center',
                                flexShrink:   0,
                            }}>
                                <Icono size={12} strokeWidth={1.8} />
                            </span>
                            <div style={{
                                fontSize:     12,
                                fontWeight:   600,
                                color:        'var(--color-text)',
                                flex:         1,
                                minWidth:     0,
                                whiteSpace:   'nowrap',
                                overflow:     'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                {a.titulo}
                            </div>
                        </div>

                        {/* Contador — el número de casos es lo más importante visualmente */}
                        <div style={{
                            fontSize:   28,
                            fontWeight: 700,
                            color:      fg,
                            fontFamily: 'Geist Mono, monospace',
                            lineHeight: 1,
                        }}>
                            {a.count}
                        </div>

                        {/* Descripción del grupo */}
                        <div style={{
                            fontSize:        11.5,
                            color:           'var(--color-body)',
                            lineHeight:      1.4,
                            display:         '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow:        'hidden',
                        } as React.CSSProperties}>
                            {a.descripcion}
                        </div>

                        {/* Footer: timestamp + flecha */}
                        <div style={{
                            display:        'flex',
                            alignItems:     'center',
                            justifyContent: 'space-between',
                            marginTop:      'auto',
                        }}>
                            <span style={{
                                fontSize:   10,
                                color:      'var(--color-muted)',
                                fontFamily: 'Geist Mono, monospace',
                            }}>
                                {a.timestamp}
                            </span>
                            <span style={{
                                fontSize:   11,
                                fontWeight: 600,
                                color:      fg,
                            }}>
                                Ver →
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}