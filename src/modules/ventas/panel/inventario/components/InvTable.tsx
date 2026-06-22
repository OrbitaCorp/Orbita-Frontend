// Tabla de stock valorizado con estado por producto.

import { fmtMoney } from '@/lib/utils'
import { ProductoThumb } from '../../pedidos/components/ProductoThumb'
import { PRODUCTOS_STOCK } from '../mock/inventario.mock'

const COLS = '1.5fr 110px 90px 90px 120px 100px'

function estadoStock(stock: number, min: number): { label: string; bg: string; fg: string } {
    if (stock === 0) return { label: 'Sin stock', bg: 'var(--color-error-bg)',   fg: 'var(--color-error)' }
    if (stock < min) return { label: 'Crítico',   bg: 'var(--color-warning-bg)', fg: 'var(--color-warning)' }
    return { label: 'OK', bg: 'var(--color-success-bg)', fg: 'var(--color-success)' }
}

export function InvTable() {
    return (
        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', gap: 10, padding: '0 16px', height: 44, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <span>Producto</span><span>Categoría</span><span style={{ textAlign: 'right' }}>Stock</span><span style={{ textAlign: 'right' }}>Mín.</span><span style={{ textAlign: 'right' }}>Valor</span><span>Estado</span>
            </div>
            {PRODUCTOS_STOCK.map((p, i) => {
                const est = estadoStock(p.stock, p.stockMin)
                const crit = p.stock < p.stockMin
                return (
                    <div key={p.id} style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', gap: 10, padding: '0 16px', height: 56, borderBottom: i < PRODUCTOS_STOCK.length - 1 ? '1px solid var(--color-border)' : 'none', background: crit ? 'var(--color-warning-bg)' : 'transparent' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                            <ProductoThumb hue={p.hue} size={36} />
                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nombre}</span>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{p.cat}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace', textAlign: 'right' }}>{p.stock}</span>
                        <span style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace', textAlign: 'right' }}>{p.stockMin}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace', textAlign: 'right' }}>{fmtMoney(p.stock * p.precio)}</span>
                        <span><span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px', borderRadius: 9999, background: est.bg, color: est.fg, fontSize: 11, fontWeight: 600 }}>{est.label}</span></span>
                    </div>
                )
            })}
        </div>
    )
}
