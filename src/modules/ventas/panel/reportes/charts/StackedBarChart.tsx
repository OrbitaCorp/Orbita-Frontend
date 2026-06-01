import { useRef, useEffect, useState } from 'react'
import type { DashboardData } from '../types/dashboard.types'

const ESTADO_COLORS = {
    pendiente:   '#F59E0B',
    confirmado:  '#10B981',
    preparacion: '#8B5CF6',
    enviado:     '#3B82F6',
    cancelado:   '#EF4444',
} as const

export const STACKED_LEGEND = [
    { label:'Pendiente',      color: ESTADO_COLORS.pendiente   },
    { label:'Confirmado',     color: ESTADO_COLORS.confirmado  },
    { label:'En preparación', color: ESTADO_COLORS.preparacion },
    { label:'Enviado',        color: ESTADO_COLORS.enviado     },
    { label:'Cancelado',      color: ESTADO_COLORS.cancelado   },
]

interface StackedBarChartProps {
    data: DashboardData['seriePedidos']
}

export function StackedBarChart({ data }: StackedBarChartProps) {
    const containerRef      = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState(600)
    // hoverIdx: columna sobre la que está el mouse — las demás se atenúan
    const [hoverIdx, setHoverIdx] = useState<number | null>(null)
    const height = 220

    useEffect(() => {
        if (!containerRef.current) return
        const obs = new ResizeObserver(entries => {
            for (const e of entries)
                setWidth(Math.max(300, Math.floor(e.contentRect.width)))
        })
        obs.observe(containerRef.current)
        return () => obs.disconnect()
    }, [])

    const pad    = { top:20, right:16, bottom:32, left:32 }
    const innerW = width  - pad.left - pad.right
    const innerH = height - pad.top  - pad.bottom
    const n      = data.labels.length
    const orden  = ['pendiente','confirmado','preparacion','enviado','cancelado'] as const

    const totals = data.labels.map((_, i) =>
        orden.reduce((s, est) => s + data.estados[est][i], 0)
    )
    const yMax = Math.ceil(Math.max(...totals, 1) / 5) * 5
    const gap  = 12
    const barW = Math.max(8, (innerW - gap * (n - 1)) / n)

    const yTicks = Array.from({ length:5 }, (_, i) => {
        const val = (yMax / 4) * i
        return { val, y: pad.top + innerH - (val / yMax) * innerH }
    })

    return (
        <div ref={containerRef} style={{ width:'100%' }}>
            <svg width={width} height={height} style={{ display:'block' }}>

                {yTicks.map((t, i) => (
                    <g key={i}>
                        <line
                            x1={pad.left} y1={t.y}
                            x2={width - pad.right} y2={t.y}
                            stroke="var(--color-border)" strokeWidth="1"
                        />
                        {i > 0 && (
                            <text x={pad.left - 6} y={t.y + 4}
                                fontSize="10" fontFamily="Geist Mono, monospace"
                                fill="var(--color-muted)" textAnchor="end">
                                {Math.round(t.val)}
                            </text>
                        )}
                    </g>
                ))}

                {data.labels.map((label, i) => {
                    const x = pad.left + i * (barW + gap)
                    let acc = 0
                    // Columnas no activas se atenúan al 45% — igual que tu diseño
                    const opacity = hoverIdx === null || hoverIdx === i ? 1 : 0.45

                    return (
                        <g key={i}
                            onMouseEnter={() => setHoverIdx(i)}
                            onMouseLeave={() => setHoverIdx(null)}
                        >
                            {orden.map(est => {
                                const v = data.estados[est][i]
                                if (v === 0) return null
                                const segH = (v / yMax) * innerH
                                const y    = pad.top + innerH - segH - (acc / yMax) * innerH
                                acc += v
                                return (
                                    <rect key={est}
                                        x={x} y={y} width={barW} height={segH}
                                        fill={ESTADO_COLORS[est]} rx={2}
                                        opacity={opacity}
                                        style={{ transition:'opacity 150ms ease' }}
                                    />
                                )
                            })}

                            {totals[i] > 0 && (
                                <text
                                    x={x + barW / 2}
                                    y={pad.top + innerH - (totals[i] / yMax) * innerH - 6}
                                    fontSize="10" fontFamily="Geist Mono, monospace"
                                    fontWeight={600} fill="var(--color-body)"
                                    textAnchor="middle" opacity={opacity}
                                    style={{ transition:'opacity 150ms ease' }}
                                >
                                    {totals[i]}
                                </text>
                            )}

                            <text x={x + barW / 2} y={height - pad.bottom + 16}
                                fontSize="10" fontFamily="Geist, sans-serif"
                                fill="var(--color-muted)" textAnchor="middle">
                                {label}
                            </text>
                        </g>
                    )
                })}
            </svg>

            <div style={{ display:'flex', flexWrap:'wrap', gap:14, marginTop:8 }}>
                {STACKED_LEGEND.map(it => (
                    <span key={it.label} style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, color:'var(--color-body)' }}>
                        <span style={{ width:10, height:10, borderRadius:3, background:it.color }} />
                        {it.label}
                    </span>
                ))}
            </div>
        </div>
    )
}