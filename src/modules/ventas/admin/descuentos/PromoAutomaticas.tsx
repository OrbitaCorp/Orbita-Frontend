// src/modules/ventas/admin/descuentos/PromoAutomaticas.tsx — Vista 33

import { useState } from 'react'
import { Plus, Tag } from 'lucide-react'
import { Card } from '@/design-system/components/Card'
import { Button } from '@/design-system/components/Button'
import { DescTabs, type VistaDescuento } from './components/DescTabs'
import { PROMOS } from './mock/descuentos.mock'

export default function PromoAutomaticas({ ir }: { ir: (v: VistaDescuento) => void }) {
    const [promos, setPromos] = useState(PROMOS)

    return (
        <div style={pageWrap}>
            <DescTabs activo="promos" ir={ir} />
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: 0 }}>Promociones automáticas</h1>
                <Button variant="primary" icon={<Plus size={16} />}>Nueva promo</Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {promos.map((p, i) => (
                    <Card key={p.nombre}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                <Tag size={20} strokeWidth={1.6} />
                            </div>
                            <div style={{ flex: 1, minWidth: 160 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{p.nombre}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{p.condicion} · <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>{p.descuento}</span></div>
                            </div>
                            <button
                                onClick={() => setPromos(ps => ps.map((x, j) => j === i ? { ...x, activo: !x.activo } : x))}
                                style={{ width: 40, height: 22, borderRadius: 11, background: p.activo ? 'var(--color-success)' : 'var(--color-surface-alt)', border: p.activo ? 'none' : '1px solid var(--color-border)', position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                            >
                                <span style={{ position: 'absolute', top: p.activo ? 3 : 2, left: p.activo ? 21 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(15,23,42,0.15)', transition: 'left 200ms' }} />
                            </button>
                            <Button variant="outline" size="sm">Editar</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
