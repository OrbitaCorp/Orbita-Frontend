// src/modules/ventas/admin/catalogo/ProductoLista.tsx — Vista P1 + hub del módulo
//
// Punto de entrada del módulo `catalogo` (registrado en el componentMap admin).
// Hub: lista de productos (P1) o wizard de alta (P2) según `router.query.vista`.
// Las "Categorías" (P3) viven en otra sección (`categorias`) — ver CatalogoTabs.
//
//   /admin/[negocioId]/ventas/catalogo              → lista (P1)
//   …/catalogo?vista=nuevo                          → ProductoNuevo (P2)

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { Plus, Search, Eye, Edit2, MoreVertical, Copy, Trash2, Package, Globe, AlertCircle } from 'lucide-react'
import { Card } from '@/design-system/components/Card'
import { Button } from '@/design-system/components/Button'
import { Modal } from '@/design-system/components/Modal'
import { Toast } from '@/design-system/components/Toast'
import { fmtMoney } from '@/lib/utils'

import { StatCard } from '../_shared/StatCard'
import { CatalogoTabs, ProductoEstadoBadge } from './components/CatalogoTabs'
import { ProductoThumb } from '../pedidos/components/ProductoThumb'
import ProductoNuevo from './ProductoNuevo'
import { PRODUCTOS_DB, CATEGORIAS_DB } from './mock/catalogo.mock'
import type { Producto } from './types/catalogo.types'

const COLS = '56px 1.5fr 110px 110px 80px 90px 110px 80px'

// ─── Lista (P1) ───────────────────────────────────────────────────────────────

function ListaView({ irNuevo }: { irNuevo: () => void }) {
    const [busq, setBusq] = useState('')
    const [fcat, setFcat] = useState('todos')
    const [fest, setFest] = useState('todos')
    const [menu, setMenu] = useState<string | null>(null)
    const [detalle, setDetalle] = useState<Producto | null>(null)

    const rows = useMemo(() => PRODUCTOS_DB.filter(p => {
        if (busq && !p.nombre.toLowerCase().includes(busq.toLowerCase()) && !p.sku.toLowerCase().includes(busq.toLowerCase())) return false
        if (fcat !== 'todos' && p.cat !== fcat) return false
        if (fest !== 'todos' && p.estado !== fest) return false
        return true
    }), [busq, fcat, fest])

    const pub = PRODUCTOS_DB.filter(p => p.estado === 'publicado').length
    const sins = PRODUCTOS_DB.filter(p => p.estado === 'sin_stock').length
    const bor = PRODUCTOS_DB.filter(p => p.estado === 'borrador').length

    return (
        <div style={pageWrap}>
            <CatalogoTabs activo="lista" />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: 0 }}>Productos</h1>
                    <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', borderRadius: 9999, background: 'var(--color-surface-alt)', color: 'var(--color-muted)', fontSize: 12, fontWeight: 600, fontFamily: '"Geist Mono", monospace' }}>{PRODUCTOS_DB.length} productos</span>
                </div>
                <Button variant="primary" icon={<Plus size={16} />} onClick={irNuevo}>Crear producto</Button>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
                <StatCard label="Total" value={PRODUCTOS_DB.length} icon={Package} accent="#3B82F6" />
                <StatCard label="Publicados" value={pub} icon={Globe} accent="#10B981" />
                <StatCard label="Sin stock" value={sins} icon={AlertCircle} accent="#F59E0B" />
                <StatCard label="Borradores" value={bor} icon={Edit2} accent="#64748B" />
            </div>

            {/* Filtros */}
            <Card padding="sm" style={{ padding: 10, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                        <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                        <input value={busq} onChange={e => setBusq(e.target.value)} placeholder="Buscar por nombre o SKU…" style={{ ...inputBase, width: '100%', height: 36, paddingLeft: 34, paddingRight: 12, fontSize: 13 }} />
                    </div>
                    <select value={fcat} onChange={e => setFcat(e.target.value)} style={selSt}>
                        <option value="todos">Todas las categorías</option>
                        {CATEGORIAS_DB.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                    </select>
                    <select value={fest} onChange={e => setFest(e.target.value)} style={selSt}>
                        <option value="todos">Todos los estados</option>
                        <option value="publicado">Publicado</option>
                        <option value="borrador">Borrador</option>
                        <option value="sin_stock">Sin stock</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={() => { setBusq(''); setFcat('todos'); setFest('todos') }}>Limpiar</Button>
                </div>
            </Card>

            {/* Tabla */}
            <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', gap: 10, padding: '0 16px', height: 44, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <span /><span>Producto</span><span>Categoría</span><span style={{ textAlign: 'right' }}>Precio</span><span style={{ textAlign: 'right' }}>Stock</span><span>Variantes</span><span>Estado</span><span style={{ textAlign: 'right' }}>Acc.</span>
                </div>
                {rows.map((p, i) => {
                    const stockCol = p.stock === 0 ? 'var(--color-error)' : p.stock < p.stockMin ? 'var(--color-warning)' : 'var(--color-success)'
                    return (
                        <div key={p.id} style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', gap: 10, padding: '0 16px', height: 60, borderBottom: i < rows.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                            <ProductoThumb hue={p.hue} size={40} />
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nombre}</div>
                                <div style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{p.sku}</div>
                            </div>
                            <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px', borderRadius: 9999, background: 'var(--color-surface-alt)', color: 'var(--color-muted)', fontSize: 11, fontWeight: 600, width: 'fit-content' }}>{p.cat}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace', textAlign: 'right' }}>{fmtMoney(p.precio)}</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: stockCol, fontFamily: '"Geist Mono", monospace', textAlign: 'right' }}>{p.stock}</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px', borderRadius: 9999, background: 'var(--color-primary-bg)', color: 'var(--color-primary)', fontSize: 11, fontWeight: 600, width: 'fit-content' }}>{p.variantes.length} var.</span>
                            <ProductoEstadoBadge estado={p.estado} />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2, position: 'relative' }}>
                                <button onClick={() => setDetalle(p)} style={iconBtn}><Eye size={15} /></button>
                                <button onClick={irNuevo} style={iconBtn}><Edit2 size={15} /></button>
                                <button onClick={() => setMenu(menu === p.id ? null : p.id)} style={iconBtn}><MoreVertical size={15} /></button>
                                {menu === p.id && (
                                    <>
                                        <div onClick={() => setMenu(null)} style={{ position: 'fixed', inset: 0, zIndex: 19 }} />
                                        <div style={{ position: 'absolute', right: 0, top: 32, zIndex: 20, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, boxShadow: '0 8px 24px rgba(15,23,42,0.12)', padding: 4, minWidth: 180 }}>
                                            <button onClick={() => setMenu(null)} style={menuItem}><Copy size={14} style={{ color: 'var(--color-muted)' }} /> Duplicar</button>
                                            <button onClick={() => setMenu(null)} style={menuItem}><Eye size={14} style={{ color: 'var(--color-muted)' }} /> {p.estado === 'publicado' ? 'Cambiar a borrador' : 'Publicar'}</button>
                                            <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0' }} />
                                            <button onClick={() => setMenu(null)} style={{ ...menuItem, color: 'var(--color-error)' }}><Trash2 size={14} /> Eliminar</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                })}
                {rows.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-muted)', fontSize: 13 }}>Sin productos para estos filtros</div>}
            </div>

            {/* Modal detalle */}
            <Modal isOpen={detalle !== null} onClose={() => setDetalle(null)} title={detalle?.nombre ?? ''} maxWidth={600}>
                {detalle && (
                    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
                        <div>
                            <ProductoThumb hue={detalle.hue} size={200} radius={12} />
                            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>{[0, 1, 2].map(j => <ProductoThumb key={j} hue={detalle.hue + j * 8} size={56} radius={8} />)}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>{detalle.nombre}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace', marginBottom: 10 }}>{detalle.sku}</div>
                            <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px', borderRadius: 9999, background: 'var(--color-surface-alt)', color: 'var(--color-muted)', fontSize: 11, fontWeight: 600, marginBottom: 12 }}>{detalle.cat}</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(detalle.precio)}</span>
                                {detalle.precioAnt && <span style={{ fontSize: 14, color: 'var(--color-subtle)', textDecoration: 'line-through', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(detalle.precioAnt)}</span>}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--color-body)', marginBottom: 6 }}>Stock: <strong style={{ fontFamily: '"Geist Mono", monospace' }}>{detalle.stock}</strong></div>
                            <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 4 }}>Variantes</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>{detalle.variantes.map(v => <span key={v} style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px', borderRadius: 9999, background: 'var(--color-surface-alt)', color: 'var(--color-muted)', fontSize: 11, fontWeight: 600 }}>{v}</span>)}</div>
                            <Button variant="primary" icon={<Edit2 size={15} />} onClick={() => { setDetalle(null); irNuevo() }}>Editar producto</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

// ─── Hub ──────────────────────────────────────────────────────────────────────

export default function ProductoLista() {
    const router = useRouter()
    const { vista } = router.query
    const [toast, setToast] = useState<string | null>(null)

    useEffect(() => {
        if (!toast) return
        const t = setTimeout(() => setToast(null), 3000)
        return () => clearTimeout(t)
    }, [toast])

    const irNuevo = () => {
        const { vista: _v, ...rest } = router.query
        router.push({ query: { ...rest, vista: 'nuevo' } })
    }
    const volver = () => {
        const { vista: _v, ...rest } = router.query
        router.push({ query: rest })
    }

    const content = vista === 'nuevo'
        ? <ProductoNuevo onVolver={volver} onToast={setToast} />
        : <ListaView irNuevo={irNuevo} />

    return (
        <>
            {content}
            {toast && (
                <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9000 }}>
                    <Toast variant="success" title={toast} onClose={() => setToast(null)} />
                </div>
            )}
        </>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
const inputBase: React.CSSProperties = { boxSizing: 'border-box', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)', fontFamily: 'inherit', outline: 'none' }
const selSt: React.CSSProperties = { height: 36, padding: '0 10px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }
const iconBtn: React.CSSProperties = { width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }
const menuItem: React.CSSProperties = { width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', textAlign: 'left', fontSize: 13, color: 'var(--color-text)', fontFamily: 'inherit' }
