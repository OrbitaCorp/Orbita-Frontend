// src/modules/ventas/panel/inventario/Proveedores.tsx — Vista 27

import { Plus, Archive } from 'lucide-react'
import { Card } from '@/design-system/components/Card'
import { Button } from '@/design-system/components/Button'
import { fmtMoney } from '@/lib/utils'
import { InvTabs, type VistaInventario } from './components/InvTabs'
import { PROVEEDORES } from './mock/inventario.mock'

export default function Proveedores({ ir }: { ir: (v: VistaInventario) => void }) {
    return (
        <div style={pageWrap}>
            <InvTabs activo="proveedores" ir={ir} />
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: 0 }}>Proveedores</h1>
                <Button variant="primary" icon={<Plus size={16} />}>Nuevo proveedor</Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PROVEEDORES.map(p => (
                    <Card key={p.nombre}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--color-primary-bg)', color: 'var(--color-primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                <Archive size={20} strokeWidth={1.6} />
                            </div>
                            <div style={{ flex: 1, minWidth: 160 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{p.nombre}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{p.contacto} · {p.tel}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{p.email}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 11, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total comprado</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(p.totalComprado)}</div>
                                <div style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>Última: {p.ultimaCompra}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Button variant="outline" size="sm">Ver historial</Button>
                                <Button variant="outline" size="sm" onClick={() => ir('entrada')}>Nueva compra</Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
