// src/modules/ventas/panel/inventario/Movimientos.tsx — Vista 26
// Registro cronológico de entradas, salidas y ajustes de stock.

import { Download } from 'lucide-react'
import { Card } from '@/design-system/components/Card'
import { Button } from '@/design-system/components/Button'
import { InvTabs, type VistaInventario } from './components/InvTabs'
import { MOVIMIENTOS } from './mock/inventario.mock'
import type { TipoMovimiento } from './types/inventario.types'

const TIPO: Record<TipoMovimiento, { fg: string; bg: string; label: string }> = {
    entrada: { fg: 'var(--color-success)', bg: 'var(--color-success-bg)', label: '↑ Entrada' },
    salida:  { fg: 'var(--color-error)',   bg: 'var(--color-error-bg)',   label: '↓ Salida'  },
    ajuste:  { fg: 'var(--color-warning)', bg: 'var(--color-warning-bg)', label: '≈ Ajuste'  },
}

export default function Movimientos({ ir }: { ir: (v: VistaInventario) => void }) {
    return (
        <div style={pageWrap}>
            <InvTabs activo="movimientos" ir={ir} />
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: 0 }}>Movimientos de stock</h1>
                <Button variant="outline" icon={<Download size={15} />}>Exportar</Button>
            </div>

            <Card padding="md" style={{ padding: 0 }}>
                {MOVIMIENTOS.map((m, i) => {
                    const c = TIPO[m.tipo]
                    return (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < MOVIMIENTOS.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 24, minWidth: 90, padding: '0 10px', borderRadius: 9999, background: c.bg, color: c.fg, fontSize: 11, fontWeight: 600 }}>{c.label}</span>
                            <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text)' }}>{m.producto}</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: c.fg, fontFamily: '"Geist Mono", monospace', minWidth: 50, textAlign: 'right' }}>{m.cantidad > 0 ? '+' : ''}{m.cantidad}</span>
                            <span style={{ fontSize: 12, color: 'var(--color-muted)', minWidth: 80 }}>{m.usuario}</span>
                            <span style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{m.motivo}</span>
                        </div>
                    )
                })}
            </Card>
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
