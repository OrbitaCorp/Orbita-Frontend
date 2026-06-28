// src/modules/ventas/panel/pedidos/PedidoDetalle.tsx — Vista 03
// Detalle de un pedido: productos, línea de tiempo de estado, notas y cliente.

import { useState } from 'react'
import { useRouter } from 'next/router'
import { ChevronRight, Printer, Mail, Check, ChevronDown } from 'lucide-react'
import { Card } from '@/design-system/components/Card'
import { Badge } from '@/design-system/components/Badge'
import { Button } from '@/design-system/components/Button'
import { Avatar } from '@/design-system/components/Avatar'
import { Toast } from '@/design-system/components/Toast'
import { fmtMoney } from '@/lib/utils'
import { PedidoTabs, type VistaPedido } from './components/PedidoTabs'
import { ProductoThumb } from './components/ProductoThumb'
import { ModalComprobante } from './components/ModalComprobante'
import { ModalEmail } from './components/ModalEmail'
import { MOCK_PEDIDOS } from './mock/pedidos.mock'
import type { EstadoPedido } from './types/pedidos.types'

const ORDEN: EstadoPedido[] = ['pendiente', 'confirmado', 'preparacion', 'enviado', 'entregado']

const NEXT_ESTADO: Partial<Record<EstadoPedido, EstadoPedido>> = {
    pendiente:   'confirmado',
    confirmado:  'preparacion',
    preparacion: 'enviado',
    enviado:     'entregado',
}

const ESTADO_LABEL: Record<EstadoPedido, string> = {
    pendiente:   'Pendiente',
    confirmado:  'Confirmado',
    preparacion: 'En preparación',
    enviado:     'Enviado',
    entregado:   'Entregado',
    cancelado:   'Cancelado',
}

const ACCION_LABEL: Partial<Record<EstadoPedido, string>> = {
    pendiente:   'Confirmar pedido',
    confirmado:  'Iniciar preparación',
    preparacion: 'Marcar como enviado',
    enviado:     'Marcar como entregado',
}

const ESTADO_COLOR: Record<EstadoPedido, string> = {
    pendiente:   '#F59E0B',
    confirmado:  '#10B981',
    preparacion: '#8B5CF6',
    enviado:     '#3B82F6',
    entregado:   '#94A3B8',
    cancelado:   '#EF4444',
}

interface PedidoDetalleProps {
    id: string
    ir: (vista: VistaPedido, id?: string) => void
}

export default function PedidoDetalle({ id, ir }: PedidoDetalleProps) {
    const router  = useRouter()
    const pedido  = MOCK_PEDIDOS.find(p => p.id === id) ?? MOCK_PEDIDOS[0]

    const [modal,        setModal]        = useState<null | 'comprobante' | 'email'>(null)
    const [estadoActual, setEstadoActual] = useState<EstadoPedido>(pedido.estado)
    const [menuAbierto,  setMenuAbierto]  = useState(false)
    const [toast,        setToast]        = useState<string | null>(null)

    const idxActual = estadoActual === 'cancelado' ? -1 : ORDEN.indexOf(estadoActual)
    const pasos: { label: string; done: boolean }[] = [
        { label: 'Pedido recibido', done: true },
        { label: 'Confirmado',      done: idxActual >= 1 },
        { label: 'En preparación',  done: idxActual >= 2 },
        { label: 'Enviado',         done: idxActual >= 3 },
        { label: 'Entregado',       done: idxActual >= 4 },
    ]

    const cambiarEstado = (nuevo: EstadoPedido) => {
        setEstadoActual(nuevo)
        setMenuAbierto(false)
        setToast(`Estado actualizado a "${ESTADO_LABEL[nuevo]}"`)
        setTimeout(() => setToast(null), 3000)
    }

    const negocioId   = router.query.negocioId as string
    const nextEstado  = NEXT_ESTADO[estadoActual]
    const accionLabel = nextEstado ? ACCION_LABEL[estadoActual] : null
    const finalizado  = estadoActual === 'entregado' || estadoActual === 'cancelado'

    return (
        <div style={pageWrap}>
            <style>{`
                .det-header  { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; margin-bottom:20px; }
                .det-actions { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
                .det-grid    { display:grid; grid-template-columns:minmax(0,1fr) 320px; gap:16px; align-items:start; }
                .det-estado-menu { position:absolute; top:calc(100% + 6px); left:0; right:0; z-index:300;
                    background:var(--color-bg); border:1px solid var(--color-border); border-radius:10px;
                    box-shadow:0 8px 24px rgba(15,23,42,.14); overflow:hidden; }
                @media (max-width:900px) {
                    .det-grid { grid-template-columns:1fr !important; }
                }
                @media (max-width:640px) {
                    .det-header  { flex-direction:column; align-items:flex-start; }
                    .det-actions { width:100%; }
                    .det-actions > * { flex:1; }
                }
            `}</style>

            <PedidoTabs activo="detalle" ir={ir} />

            {/* Breadcrumb */}
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--color-muted)', marginBottom:14 }}>
                <button onClick={() => ir('lista')} style={{ background:'none', border:'none', color:'var(--color-muted)', cursor:'pointer', fontFamily:'inherit', fontSize:13, padding:0 }}>Lista</button>
                <ChevronRight size={12} />
                <span style={{ color:'var(--color-text)', fontWeight:500, fontFamily:'"Geist Mono", monospace' }}>#{pedido.id}</span>
            </div>

            {/* Header */}
            <div className="det-header">
                <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                    <h1 style={{ fontSize:26, fontWeight:700, fontFamily:'"Geist Mono", monospace', color:'var(--color-text)', margin:0 }}>#{pedido.id}</h1>
                    <Badge status={estadoActual} />
                    <span style={{ fontSize:14, color:'var(--color-muted)' }}>{pedido.cliente}</span>
                </div>
                <div className="det-actions">
                    <Button variant="outline" icon={<Printer size={15} />} onClick={() => setModal('comprobante')}>Imprimir</Button>
                    <Button variant="outline" icon={<Mail size={15} />} onClick={() => setModal('email')}>Email</Button>
                </div>
            </div>

            <div className="det-grid">

                {/* Columna principal */}
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    <Card>
                        <div style={{ fontSize:14, fontWeight:600, color:'var(--color-text)', marginBottom:14 }}>Productos del pedido</div>
                        {pedido.productos.map((it, i) => (
                            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i < pedido.productos.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                <ProductoThumb hue={it.hue} size={44} />
                                <div style={{ flex:1 }}>
                                    <div style={{ fontSize:13, fontWeight:500, color:'var(--color-text)' }}>{it.nombre}</div>
                                    <div style={{ fontSize:12, color:'var(--color-muted)', fontFamily:'"Geist Mono", monospace' }}>{it.cantidad} × {fmtMoney(it.precio)}</div>
                                </div>
                                <span style={{ fontSize:14, fontWeight:600, color:'var(--color-text)', fontFamily:'"Geist Mono", monospace' }}>{fmtMoney(it.cantidad * it.precio)}</span>
                            </div>
                        ))}
                        <div style={{ display:'flex', justifyContent:'space-between', marginTop:14, paddingTop:14, borderTop:'1px solid var(--color-border)' }}>
                            <span style={{ fontSize:15, fontWeight:600, color:'var(--color-text)' }}>Total</span>
                            <span style={{ fontSize:18, fontWeight:800, color:'var(--color-text)', fontFamily:'"Geist Mono", monospace' }}>{fmtMoney(pedido.monto)}</span>
                        </div>
                    </Card>

                    <Card>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                            <div style={{ fontSize:14, fontWeight:600, color:'var(--color-text)' }}>Estado del pedido</div>
                            {estadoActual === 'cancelado' && (
                                <span style={{ fontSize:12, fontWeight:600, color:'var(--color-error)', background:'var(--color-error-bg)', padding:'3px 10px', borderRadius:9999 }}>Cancelado</span>
                            )}
                        </div>
                        {pasos.map((paso, i) => (
                            <div key={i} style={{ display:'flex', gap:12 }}>
                                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                                    <div style={{ width:26, height:26, borderRadius:'50%', flexShrink:0, background: paso.done && estadoActual !== 'cancelado' ? 'var(--color-primary)' : 'var(--color-surface-alt)', color: paso.done && estadoActual !== 'cancelado' ? '#fff' : 'var(--color-muted)', display:'grid', placeItems:'center' }}>
                                        {paso.done && estadoActual !== 'cancelado' ? <Check size={13} strokeWidth={2.6} /> : <span style={{ fontSize:11, fontWeight:700 }}>{i+1}</span>}
                                    </div>
                                    {i < pasos.length - 1 && <div style={{ width:2, flex:1, minHeight:24, background: paso.done && estadoActual !== 'cancelado' ? 'var(--color-primary)' : 'var(--color-border)', marginTop:2 }} />}
                                </div>
                                <div style={{ paddingBottom: i < pasos.length - 1 ? 16 : 0 }}>
                                    <div style={{ fontSize:13, fontWeight: paso.done ? 600 : 500, color: paso.done && estadoActual !== 'cancelado' ? 'var(--color-text)' : 'var(--color-muted)' }}>{paso.label}</div>
                                    {paso.done && estadoActual !== 'cancelado' && <div style={{ fontSize:11, color:'var(--color-muted)', fontFamily:'"Geist Mono", monospace', marginTop:2 }}>17 may · 1{4+i}:0{i}</div>}
                                </div>
                            </div>
                        ))}
                    </Card>

                    <Card>
                        <div style={{ fontSize:14, fontWeight:600, color:'var(--color-text)', marginBottom:10 }}>Notas internas</div>
                        <textarea placeholder="Agregar nota interna…" rows={2} style={{ width:'100%', boxSizing:'border-box', resize:'vertical', minHeight:52, background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:8, padding:'10px 12px', fontSize:13, color:'var(--color-text)', fontFamily:'inherit', outline:'none' }} />
                        <div style={{ marginTop:8 }}><Button variant="primary" size="sm">Guardar nota</Button></div>
                    </Card>
                </div>

                {/* Sidebar */}
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

                    {/* ── Cambiar estado ── */}
                    <Card>
                        <div style={{ fontSize:14, fontWeight:600, color:'var(--color-text)', marginBottom:14 }}>Cambiar estado</div>

                        {/* Estado actual */}
                        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'var(--color-surface)', borderRadius:8, marginBottom:12 }}>
                            <span style={{ width:10, height:10, borderRadius:'50%', background: ESTADO_COLOR[estadoActual], flexShrink:0 }} />
                            <span style={{ fontSize:13, fontWeight:600, color:'var(--color-text)', flex:1 }}>{ESTADO_LABEL[estadoActual]}</span>
                            <span style={{ fontSize:11, color:'var(--color-muted)' }}>actual</span>
                        </div>

                        {/* Botón avanzar */}
                        {accionLabel && (
                            <button
                                onClick={() => cambiarEstado(nextEstado!)}
                                style={{ width:'100%', height:38, borderRadius:8, border:'none', background:'var(--color-primary)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', marginBottom:10 }}
                            >
                                {accionLabel}
                            </button>
                        )}

                        {/* Selector de cualquier estado */}
                        {!finalizado && (
                            <div style={{ position:'relative' }}>
                                <button
                                    onClick={() => setMenuAbierto(o => !o)}
                                    style={{ width:'100%', height:34, borderRadius:8, border:'1px solid var(--color-border)', background:'var(--color-bg)', color:'var(--color-body)', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 12px' }}
                                >
                                    <span>Cambiar a otro estado</span>
                                    <ChevronDown size={14} style={{ opacity:0.6, transform: menuAbierto ? 'rotate(180deg)' : 'none', transition:'transform 180ms' }} />
                                </button>

                                {menuAbierto && (
                                    <div className="det-estado-menu">
                                        {ORDEN.map(e => (
                                            <button
                                                key={e}
                                                onClick={() => cambiarEstado(e)}
                                                style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 14px', border:'none', background: estadoActual === e ? 'var(--color-surface-alt)' : 'transparent', cursor:'pointer', fontFamily:'inherit', fontSize:13, color:'var(--color-text)', textAlign:'left' }}
                                            >
                                                <span style={{ width:8, height:8, borderRadius:'50%', background: ESTADO_COLOR[e], flexShrink:0 }} />
                                                <span style={{ flex:1, fontWeight: estadoActual === e ? 600 : 400 }}>{ESTADO_LABEL[e]}</span>
                                                {estadoActual === e && <Check size={13} style={{ color:'var(--color-primary)', flexShrink:0 }} />}
                                            </button>
                                        ))}
                                        <div style={{ borderTop:'1px solid var(--color-border)' }}>
                                            <button
                                                onClick={() => cambiarEstado('cancelado')}
                                                style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 14px', border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit', fontSize:13, color:'var(--color-error)', textAlign:'left' }}
                                            >
                                                <span style={{ width:8, height:8, borderRadius:'50%', background: ESTADO_COLOR.cancelado, flexShrink:0 }} />
                                                Cancelar pedido
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {finalizado && (
                            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:8, background: estadoActual === 'entregado' ? 'var(--color-success-bg)' : 'var(--color-error-bg)', color: estadoActual === 'entregado' ? 'var(--color-success)' : 'var(--color-error)', fontSize:12, fontWeight:600 }}>
                                {estadoActual === 'entregado' ? '✓ Pedido completado' : '✕ Pedido cancelado'}
                            </div>
                        )}
                    </Card>

                    {/* ── Cliente ── */}
                    <Card>
                        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                            <Avatar name={pedido.cliente} size={44} />
                            <div style={{ minWidth:0 }}>
                                <div style={{ fontSize:14, fontWeight:600, color:'var(--color-text)' }}>{pedido.cliente}</div>
                                <div style={{ fontSize:12, color:'var(--color-muted)', fontFamily:'"Geist Mono", monospace' }}>{pedido.email}</div>
                            </div>
                        </div>
                        <Button
                            variant="outline" size="sm"
                            style={{ width:'100%', justifyContent:'center' }}
                            onClick={() => router.push(`/admin/${negocioId}/ventas/clientes?vista=detalle&id=${pedido.clienteId}`)}
                        >
                            Ver perfil completo →
                        </Button>
                    </Card>

                    <Card>
                        <div style={{ fontSize:14, fontWeight:600, color:'var(--color-text)', marginBottom:12 }}>Datos del pedido</div>
                        {([['Canal', pedido.canal], ['Fecha', '17 may · 14:32'], ['# Pedido', '#' + pedido.id], ['Método de pago', 'Tarjeta Visa · 4521']] as [string,string][]).map(([k,v]) => (
                            <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'5px 0' }}>
                                <span style={{ color:'var(--color-muted)' }}>{k}</span>
                                <span style={{ color:'var(--color-text)', fontFamily:/Fecha|Pedido|Visa/.test(k) ? '"Geist Mono", monospace' : 'inherit' }}>{v}</span>
                            </div>
                        ))}
                    </Card>

                    <Card>
                        <div style={{ fontSize:14, fontWeight:600, color:'var(--color-text)', marginBottom:8 }}>Entrega</div>
                        <div style={{ fontSize:13, color:'var(--color-muted)', marginBottom:12 }}>Coordinar por WhatsApp</div>
                        <button style={{ width:'100%', height:40, borderRadius:8, border:'none', background:'var(--color-success-bg)', color:'var(--color-success)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>💬 WhatsApp</button>
                    </Card>
                </div>
            </div>

            <ModalComprobante isOpen={modal === 'comprobante'} onClose={() => setModal(null)} id={pedido.id} />
            <ModalEmail isOpen={modal === 'email'} onClose={() => setModal(null)} cliente={{ nombre: pedido.cliente, email: pedido.email }} />

            {toast && (
                <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', zIndex:9000 }}>
                    <Toast variant="success" title={toast} onClose={() => setToast(null)} />
                </div>
            )}
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding:'24px 32px 64px', maxWidth:1280, width:'100%', margin:'0 auto', boxSizing:'border-box' }
