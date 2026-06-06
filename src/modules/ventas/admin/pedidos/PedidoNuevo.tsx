// src/modules/ventas/admin/pedidos/PedidoNuevo.tsx — Vista 04
// Alta manual de un pedido en 3 pasos: cliente, productos, pago.

import { useMemo, useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { Card } from '@/design-system/components/Card'
import { Button } from '@/design-system/components/Button'
import { Avatar } from '@/design-system/components/Avatar'
import { fmtMoney } from '@/lib/utils'
import { PedidoTabs, type VistaPedido } from './components/PedidoTabs'
import { ProductoThumb } from './components/ProductoThumb'
import { MOCK_PEDIDOS, MOCK_PRODUCTOS_RAPIDOS, type ProductoRapido } from './mock/pedidos.mock'

interface PedidoNuevoProps {
    ir:      (vista: VistaPedido, id?: string) => void
    onToast: (msg: string) => void
}

interface ClienteResumen { nombre: string; email: string; pedidos: number }

export default function PedidoNuevo({ ir, onToast }: PedidoNuevoProps) {
    const [step, setStep] = useState(1)
    const [cliente, setCliente] = useState<ClienteResumen | null>(null)
    const [carrito, setCarrito] = useState<ProductoRapido[]>([])
    const [metodo, setMetodo]   = useState('Efectivo')

    // Clientes derivados de los pedidos existentes (únicos por email)
    const clientes = useMemo<ClienteResumen[]>(() => {
        const map = new Map<string, ClienteResumen>()
        for (const p of MOCK_PEDIDOS) {
            const prev = map.get(p.email)
            map.set(p.email, { nombre: p.cliente, email: p.email, pedidos: (prev?.pedidos ?? 0) + 1 })
        }
        return [...map.values()]
    }, [])

    const total = carrito.reduce((s, p) => s + p.precio, 0)

    return (
        <div style={pageWrap}>
            <PedidoTabs activo="nuevo" ir={ir} />

            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 20px' }}>Nuevo pedido manual</h1>

            {/* Stepper */}
            <div style={{ display: 'flex', marginBottom: 24, maxWidth: 560 }}>
                {[['1', 'Cliente'], ['2', 'Productos'], ['3', 'Pago']].map(([n, l], i) => {
                    const activo = step === i + 1
                    const done = step > i + 1
                    return (
                        <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 28, height: 28, borderRadius: '50%', background: done ? 'var(--color-success)' : activo ? 'var(--color-primary)' : 'var(--color-surface-alt)', color: done || activo ? '#fff' : 'var(--color-muted)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, fontFamily: '"Geist Mono", monospace' }}>
                                    {done ? <Check size={13} strokeWidth={2.6} /> : n}
                                </span>
                                <span style={{ fontSize: 13, fontWeight: activo || done ? 600 : 500, color: activo || done ? 'var(--color-text)' : 'var(--color-muted)' }}>{l}</span>
                            </div>
                            {i < 2 && <div style={{ flex: 1, height: 2, background: done ? 'var(--color-success)' : 'var(--color-border)', margin: '0 12px' }} />}
                        </div>
                    )
                })}
            </div>

            <Card style={{ maxWidth: 760 }}>
                {/* Paso 1 — cliente */}
                {step === 1 && (
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 16 }}>¿Quién compra?</div>
                        {!cliente ? clientes.slice(0, 3).map(c => (
                            <button key={c.email} onClick={() => setCliente(c)} style={pickRow}>
                                <Avatar name={c.nombre} size={36} />
                                <div style={{ flex: 1, textAlign: 'left' }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{c.nombre}</div>
                                    <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{c.email}</div>
                                </div>
                                <span style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{c.pedidos} pedidos</span>
                            </button>
                        )) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'var(--color-primary-bg)', border: '1px solid var(--color-primary)', borderRadius: 10 }}>
                                <Avatar name={cliente.nombre} size={44} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{cliente.nombre}</div>
                                    <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{cliente.email}</div>
                                </div>
                                <button onClick={() => setCliente(null)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Cambiar</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Paso 2 — productos */}
                {step === 2 && (
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 16 }}>Agregá productos</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                            {MOCK_PRODUCTOS_RAPIDOS.map(pr => (
                                <div key={pr.id} style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden' }}>
                                    <ProductoThumb hue={pr.hue} size="100%" radius={0} />
                                    <div style={{ padding: 10 }}>
                                        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pr.nombre}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(pr.precio)}</span>
                                            <button onClick={() => setCarrito(c => [...c, pr])} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                                                <Plus size={14} strokeWidth={2.2} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {carrito.length > 0 && (
                            <div style={{ marginTop: 14, padding: 12, background: 'var(--color-surface)', borderRadius: 8, fontSize: 13, color: 'var(--color-body)' }}>
                                {carrito.length} productos · Total {fmtMoney(total)}
                            </div>
                        )}
                    </div>
                )}

                {/* Paso 3 — pago */}
                {step === 3 && (
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 16 }}>Método de pago</div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            {['Efectivo', 'Transferencia', 'Mercado Pago'].map(m => {
                                const a = metodo === m
                                return (
                                    <button key={m} onClick={() => setMetodo(m)} style={{ flex: 1, height: 44, borderRadius: 8, border: `1px solid ${a ? 'var(--color-primary)' : 'var(--color-border)'}`, background: a ? 'var(--color-primary-bg)' : 'var(--color-surface)', color: a ? 'var(--color-primary)' : 'var(--color-body)', fontSize: 13, fontWeight: a ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit' }}>{m}</button>
                                )
                            })}
                        </div>
                        <textarea placeholder="Observaciones…" rows={2} style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 52, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--color-text)', fontFamily: 'inherit', outline: 'none' }} />
                    </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
                    {step > 1 ? <Button variant="outline" onClick={() => setStep(step - 1)}>Volver</Button> : <div />}
                    {step < 3
                        ? <Button variant="primary" disabled={step === 1 && !cliente} onClick={() => setStep(step + 1)}>Siguiente →</Button>
                        : <Button variant="primary" onClick={() => { onToast('Pedido creado · #1285'); ir('lista') }}>Crear pedido</Button>}
                </div>
            </Card>
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
const pickRow: React.CSSProperties = {
    width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 12,
    border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-surface)',
    cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8,
}
