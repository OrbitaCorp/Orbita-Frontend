// src/modules/ventas/admin/pos/POSCobro.tsx — Vista 19 + hub del módulo
//
// Punto de entrada del módulo `pos` (registrado en el componentMap admin).
// Hub con tabs: cobro (V19), apertura (V20), cierre (V21), historial (V22).
//
//   /admin/[negocioId]/ventas/pos                  → cobro rápido (V19)
//   …/pos?vista=apertura                           → POSApertura (V20)
//   …/pos?vista=cierre                             → POSCierre (V21)
//   …/pos?vista=historial                          → POSHistorial (V22)

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Search, ShoppingCart, Tag, Check, X } from 'lucide-react'
import { Card } from '@/design-system/components/Card'
import { Button } from '@/design-system/components/Button'
import { Toast } from '@/design-system/components/Toast'
import { fmtMoney } from '@/lib/utils'

import { POSTabs, type VistaPOS } from './components/POSTabs'
import { ProductoThumb } from '../pedidos/components/ProductoThumb'
import { ModalComprobante } from '../pedidos/components/ModalComprobante'
import POSApertura from './POSApertura'
import POSCierre from './POSCierre'
import POSHistorial from './POSHistorial'
import { CUPONES_POS, type CuponPOS } from './mock/pos.mock'
import { PRODUCTOS_STOCK } from '../inventario/mock/inventario.mock'
import type { ProductoStock } from '../inventario/types/inventario.types'

type CartItem = ProductoStock & { q: number }
const CATS = ['Todas', 'Remeras', 'Pantalones', 'Buzos', 'Camperas', 'Accesorios']
const METODOS: [string, string][] = [['efectivo', 'Efectivo'], ['transferencia', 'Transf.'], ['mp', 'Mercado Pago']]

// ─── Cobro rápido (V19) ───────────────────────────────────────────────────────

function CobroView({ ir, onToast }: { ir: (v: VistaPOS) => void; onToast: (m: string) => void }) {
    const [cart, setCart] = useState<CartItem[]>([{ ...PRODUCTOS_STOCK[1], q: 2 }, { ...PRODUCTOS_STOCK[6], q: 1 }])
    const [cat, setCat] = useState('Todas')
    const [metodo, setMetodo] = useState('efectivo')
    const [recibido, setRecibido] = useState('')
    const [codigoCupon, setCodigoCupon] = useState('')
    const [cuponAplicado, setCuponAplicado] = useState<CuponPOS | null>(null)
    const [errorCupon, setErrorCupon] = useState('')
    const [descManualVal, setDescManualVal] = useState('')
    const [descManualTipo, setDescManualTipo] = useState<'%' | '$'>('%')
    const [comprobante, setComprobante] = useState(false)

    const prods = cat === 'Todas' ? PRODUCTOS_STOCK : PRODUCTOS_STOCK.filter(p => p.cat === cat)
    const add = (p: ProductoStock) => setCart(c => {
        const ex = c.find(x => x.id === p.id)
        return ex ? c.map(x => x.id === p.id ? { ...x, q: x.q + 1 } : x) : [...c, { ...p, q: 1 }]
    })
    const setQ = (id: string, d: number) => setCart(c => c.map(x => x.id === id ? { ...x, q: Math.max(1, x.q + d) } : x))
    const del = (id: string) => setCart(c => c.filter(x => x.id !== id))

    const sub = cart.reduce((s, p) => s + p.precio * p.q, 0)
    const desc = (() => {
        if (cuponAplicado) return cuponAplicado.tipo === '%' ? Math.round(sub * cuponAplicado.valor / 100) : Math.min(cuponAplicado.valor, sub)
        if (descManualVal) { const n = parseFloat(descManualVal) || 0; return descManualTipo === '%' ? Math.round(sub * n / 100) : Math.min(n, sub) }
        return 0
    })()
    const tot = sub - desc
    const vuelto = metodo === 'efectivo' && recibido ? Math.max(0, Number(recibido) - tot) : 0

    const aplicarCupon = (cod: string) => {
        const c = CUPONES_POS.find(x => x.codigo === cod.toUpperCase())
        if (!c) { setErrorCupon('Cupón no encontrado'); return }
        if (!c.activo) { setErrorCupon('Este cupón no está disponible'); return }
        setCuponAplicado(c); setCodigoCupon(''); setErrorCupon('')
    }

    const cobrar = () => {
        if (cart.length === 0) return
        onToast('✓ Venta registrada · Pedido #1285')
        setCart([]); setCuponAplicado(null); setDescManualVal('')
        setComprobante(true)
    }

    const inputBase: React.CSSProperties = { background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }

    return (
        <div style={pageWrap}>
            <POSTabs activo="cobro" ir={ir} />

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
                {/* Catálogo */}
                <div>
                    <div style={{ position: 'relative', marginBottom: 14 }}>
                        <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                        <input placeholder="Buscar por nombre o código…" style={{ ...inputBase, width: '100%', height: 44, paddingLeft: 42, paddingRight: 14, fontSize: 14, borderRadius: 10 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                        {CATS.map(c => {
                            const a = cat === c
                            return <button key={c} onClick={() => setCat(c)} style={{ height: 30, padding: '0 12px', borderRadius: 9999, border: 'none', background: a ? 'var(--color-primary-bg)' : 'var(--color-surface-alt)', color: a ? 'var(--color-primary)' : 'var(--color-muted)', fontSize: 12, fontWeight: a ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit' }}>{c}</button>
                        })}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10 }}>
                        {prods.map(p => (
                            <button key={p.id} onClick={() => add(p)} disabled={p.stock === 0} style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', background: 'var(--color-bg)', cursor: p.stock === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: p.stock === 0 ? 0.5 : 1, textAlign: 'left', padding: 0 }}>
                                <ProductoThumb hue={p.hue} size="100%" radius={0} />
                                <div style={{ padding: 10 }}>
                                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nombre}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(p.precio)}</span>
                                        <span style={{ fontSize: 10, color: p.stock === 0 ? 'var(--color-error)' : 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{p.stock === 0 ? 'sin stock' : p.stock}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ticket */}
                <Card padding="md" style={{ padding: 0, position: 'sticky', top: 24 }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Venta actual</span>
                        <button onClick={() => setCart([])} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Limpiar</button>
                    </div>

                    <div style={{ padding: '8px 16px', maxHeight: 200, overflowY: 'auto' }}>
                        {cart.length === 0 ? (
                            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--color-muted)' }}>
                                <ShoppingCart size={28} strokeWidth={1.4} style={{ opacity: 0.5 }} />
                                <div style={{ fontSize: 13, marginTop: 8 }}>Agregá productos</div>
                            </div>
                        ) : cart.map(it => (
                            <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                                <ProductoThumb hue={it.hue} size={36} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.nombre}</div>
                                    <div style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(it.precio * it.q)}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 2, border: '1px solid var(--color-border)', borderRadius: 6 }}>
                                    <button onClick={() => setQ(it.id, -1)} style={qtyBtn}>−</button>
                                    <span style={{ minWidth: 20, textAlign: 'center', fontSize: 12, fontWeight: 600, fontFamily: '"Geist Mono", monospace', color: 'var(--color-text)' }}>{it.q}</span>
                                    <button onClick={() => setQ(it.id, 1)} style={qtyBtn}>+</button>
                                </div>
                                <button onClick={() => del(it.id)} style={{ width: 24, height: 24, border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={13} strokeWidth={1.8} /></button>
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: 16, borderTop: '1px solid var(--color-border)' }}>
                        {/* Descuentos */}
                        {!cuponAplicado && (
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>Descuento manual</div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <input value={descManualVal} onChange={e => setDescManualVal(e.target.value.replace(/\D/g, ''))} placeholder="0" style={{ ...inputBase, width: 80, height: 34, padding: '0 10px', fontSize: 13, borderRadius: 7, fontFamily: '"Geist Mono", monospace' }} />
                                    <div style={{ display: 'flex', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 7, padding: 2 }}>
                                        {(['%', '$'] as const).map(tp => {
                                            const a = descManualTipo === tp
                                            return <button key={tp} onClick={() => setDescManualTipo(tp)} style={{ width: 34, height: 30, borderRadius: 5, border: 'none', background: a ? 'var(--color-primary)' : 'transparent', color: a ? '#fff' : 'var(--color-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: '"Geist Mono", monospace' }}>{tp}</button>
                                        })}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 10px' }}>
                                    <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                                    <span style={{ fontSize: 11, color: 'var(--color-subtle)' }}>o</span>
                                    <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                                </div>

                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>Cupones disponibles</div>
                                <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                                    {CUPONES_POS.filter(c => c.activo).map(c => (
                                        <div key={c.codigo} onClick={() => !c.soloVip && aplicarCupon(c.codigo)} title={c.soloVip ? 'Solo disponible para clientes VIP' : ''} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, cursor: c.soloVip ? 'not-allowed' : 'pointer', opacity: c.soloVip ? 0.5 : 1 }}>
                                            <Tag size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{c.codigo}</div>
                                                <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{c.desc}</div>
                                            </div>
                                            {c.soloVip
                                                ? <span style={{ height: 18, padding: '0 8px', borderRadius: 9999, background: 'var(--color-warning-bg)', color: 'var(--color-warning)', fontSize: 9, fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>Solo VIP</span>
                                                : <span style={{ height: 20, padding: '0 8px', borderRadius: 9999, background: c.tipo === '%' ? 'var(--color-primary-bg)' : 'var(--color-success-bg)', color: c.tipo === '%' ? 'var(--color-primary)' : 'var(--color-success)', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>−{c.tipo === '%' ? c.valor + '%' : fmtMoney(c.valor)}</span>}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 4 }}>O ingresá un código</div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <input value={codigoCupon} onChange={e => setCodigoCupon(e.target.value.toUpperCase())} placeholder="Código de cupón…" style={{ ...inputBase, flex: 1, height: 34, padding: '0 10px', fontSize: 13, borderRadius: 7, fontFamily: '"Geist Mono", monospace', border: `1px solid ${errorCupon ? 'var(--color-error)' : 'var(--color-border)'}` }} />
                                    <Button variant="primary" size="sm" onClick={() => aplicarCupon(codigoCupon)}>Aplicar</Button>
                                </div>
                                {errorCupon && <div style={{ fontSize: 11, color: 'var(--color-error)', marginTop: 4 }}>{errorCupon}</div>}
                            </div>
                        )}
                        {cuponAplicado && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--color-success-bg)', border: '1px solid rgba(16,185,129,0.30)', borderRadius: 8, marginBottom: 12 }}>
                                <Check size={14} strokeWidth={2.2} style={{ color: 'var(--color-success)' }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-success)', fontFamily: '"Geist Mono", monospace' }}>{cuponAplicado.codigo}</span>{' '}
                                    <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{cuponAplicado.desc}</span>
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-success)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(desc)}</span>
                                <button onClick={() => setCuponAplicado(null)} style={{ width: 20, height: 20, border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={13} strokeWidth={1.8} /></button>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                            <span style={{ color: 'var(--color-muted)' }}>Subtotal</span>
                            <span style={{ color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(sub)}</span>
                        </div>
                        {desc > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                                <span style={{ color: 'var(--color-muted)' }}>Descuento</span>
                                <span style={{ color: 'var(--color-success)', fontFamily: '"Geist Mono", monospace' }}>−{fmtMoney(desc)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8, marginBottom: 14, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>Total</span>
                            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(tot)}</span>
                        </div>

                        <div style={{ display: 'flex', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 2, marginBottom: 12 }}>
                            {METODOS.map(([m, l]) => {
                                const a = metodo === m
                                return <button key={m} onClick={() => setMetodo(m)} style={{ flex: 1, height: 32, borderRadius: 6, border: 'none', background: a ? 'var(--color-bg)' : 'transparent', color: a ? 'var(--color-text)' : 'var(--color-muted)', fontSize: 12, fontWeight: a ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: a ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>{l}</button>
                            })}
                        </div>
                        {metodo === 'efectivo' && (
                            <div style={{ marginBottom: 12 }}>
                                <input value={recibido} onChange={e => setRecibido(e.target.value.replace(/\D/g, ''))} placeholder="Monto recibido" style={{ ...inputBase, width: '100%', height: 38, padding: '0 12px', fontSize: 14, fontFamily: '"Geist Mono", monospace' }} />
                                {vuelto > 0 && <div style={{ fontSize: 12, color: 'var(--color-success)', marginTop: 6, fontFamily: '"Geist Mono", monospace' }}>Vuelto: {fmtMoney(vuelto)}</div>}
                            </div>
                        )}
                        <button onClick={cobrar} disabled={cart.length === 0} style={{ width: '100%', height: 48, borderRadius: 10, border: 'none', background: cart.length ? '#10B981' : 'var(--color-surface-alt)', color: cart.length ? '#fff' : 'var(--color-subtle)', fontSize: 18, fontWeight: 800, cursor: cart.length ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>Cobrar {fmtMoney(tot)}</button>
                    </div>
                </Card>
            </div>

            <ModalComprobante isOpen={comprobante} onClose={() => setComprobante(false)} tipo="venta" id="1285" />
        </div>
    )
}

// ─── Hub ──────────────────────────────────────────────────────────────────────

export default function POSCobro() {
    const router = useRouter()
    const { vista } = router.query
    const [toast, setToast] = useState<string | null>(null)

    useEffect(() => {
        if (!toast) return
        const t = setTimeout(() => setToast(null), 3000)
        return () => clearTimeout(t)
    }, [toast])

    const ir = (v: VistaPOS) => {
        const { vista: _v, ...rest } = router.query
        const q: Record<string, string | string[] | undefined> = { ...rest }
        if (v !== 'cobro') q.vista = v
        router.push({ query: q })
    }

    const sub = vista as VistaPOS | undefined
    let content
    if (sub === 'apertura')       content = <POSApertura ir={ir} onToast={setToast} />
    else if (sub === 'cierre')    content = <POSCierre ir={ir} onToast={setToast} />
    else if (sub === 'historial') content = <POSHistorial ir={ir} />
    else                          content = <CobroView ir={ir} onToast={setToast} />

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
const qtyBtn: React.CSSProperties = { width: 24, height: 24, border: 'none', background: 'transparent', color: 'var(--color-body)', cursor: 'pointer', fontSize: 14 }
