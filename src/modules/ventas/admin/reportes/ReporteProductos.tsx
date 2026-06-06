// src/modules/ventas/admin/reportes/ReporteProductos.tsx — Vista 12

import { useState } from 'react'
import { Download, ChevronDown, Package, Tag, ShoppingBag, Maximize2 } from 'lucide-react'
import { Card } from '@/design-system/components/Card'
import { Button } from '@/design-system/components/Button'
import { Modal } from '@/design-system/components/Modal'
import { StatCard } from '../_shared/StatCard'
import { ReporteTabs, type VistaReporte } from './components/ReporteTabs'
import { TopProductos } from './components/TopProductos'
import { ProductoThumb } from '../pedidos/components/ProductoThumb'
import { TOP_PRODUCTOS } from './mock/reportes.mock'
import { PRODUCTOS_STOCK } from '../inventario/mock/inventario.mock'

export default function ReporteProductos({ ir }: { ir: (v: VistaReporte) => void }) {
    const [exp, setExp] = useState(false)
    const [sinMov, setSinMov] = useState(false)

    return (
        <div style={pageWrap}>
            <ReporteTabs activo="productos" ir={ir} />

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: 0 }}>Reporte de productos</h1>
                <Button variant="outline" icon={<Download size={15} />}>Exportar</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                <StatCard label="Productos vendidos" value="287" icon={Package} accent="#3B82F6" />
                <StatCard label="Categoría top" value="Camperas" icon={Tag} accent="#8B5CF6" />
                <StatCard label="Unidades/pedido" value="2.1" icon={ShoppingBag} accent="#10B981" />
            </div>

            <Card style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Top productos por revenue</div>
                    <button onClick={() => setExp(true)} style={iconBtn}><Maximize2 size={15} /></button>
                </div>
                <TopProductos productos={TOP_PRODUCTOS} />
            </Card>

            <Card padding="md" style={{ padding: 0 }}>
                <button onClick={() => setSinMov(s => !s)} style={{ width: '100%', padding: '14px 20px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Sin movimiento (3)</span>
                    <ChevronDown size={16} style={{ color: 'var(--color-muted)', transform: sinMov ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
                </button>
                {sinMov && (
                    <div style={{ padding: '0 20px 16px' }}>
                        {PRODUCTOS_STOCK.slice(5, 8).map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', opacity: 0.75 }}>
                                <ProductoThumb hue={p.hue} size={36} />
                                <span style={{ flex: 1, fontSize: 13, color: 'var(--color-body)' }}>{p.nombre}</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px', borderRadius: 9999, background: 'var(--color-warning-bg)', color: 'var(--color-warning)', fontSize: 11, fontWeight: 600 }}>liquidar</span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Modal isOpen={exp} onClose={() => setExp(false)} title="Top productos" maxWidth={760}>
                <TopProductos productos={TOP_PRODUCTOS} />
            </Modal>
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
const iconBtn: React.CSSProperties = { width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }
