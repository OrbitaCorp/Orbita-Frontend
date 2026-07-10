// src/modules/ventas/panel/clientes/ClienteDetalle.tsx — Vista 10
// Perfil de un cliente: KPIs, pestañas (pedidos/notas/info/actividad), acciones.

import { useState } from 'react'
import { ChevronRight, ChevronDown, Mail, Plus, TrendingUp, Eye, Banknote, ShoppingBag, BarChart3, Clock, X } from 'lucide-react'
import { Card } from '@/design-system/components/Card'
import { Badge } from '@/design-system/components/Badge'
import { Button } from '@/design-system/components/Button'
import { Avatar } from '@/design-system/components/Avatar'
import { fmtMoney } from '@/lib/utils'
import { StatCard } from '../_shared/StatCard'
import { SegmentoBadge } from './components/SegmentoBadge'
import { MOCK_CLIENTES } from './mock/clientes.mock'
import { MOCK_PEDIDOS } from '../pedidos/mock/pedidos.mock'
import { ModalEmail } from '../pedidos/components/ModalEmail'

type TabKey = 'pedidos' | 'notas' | 'info' | 'actividad'

interface ClienteDetalleProps {
    id:         string
    onVolver:   () => void
    irPedido:   (id: string) => void
    irNuevo:    () => void
    irReportes: () => void
}

export default function ClienteDetalle({ id, onVolver, irPedido, irNuevo, irReportes }: ClienteDetalleProps) {
    const cliente = MOCK_CLIENTES.find(c => c.id === id) ?? MOCK_CLIENTES[0]
    const [tab, setTab] = useState<TabKey>('pedidos')
    const [emailOpen, setEmailOpen] = useState(false)

    const fechaCorta = (iso: string) => {
        const d = new Date(iso); const m = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
        return `${d.getDate()} ${m[d.getMonth()]}`
    }

    return (
        <div style={pageWrap}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-muted)', marginBottom: 14 }}>
                <button onClick={onVolver} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0 }}>Lista</button>
                <ChevronRight size={12} />
                <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{cliente.nombre}</span>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Avatar name={cliente.nombre} size={56} />
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>{cliente.nombre}</h1>
                            <SegmentoBadge segmento={cliente.segmento} />
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace', marginTop: 2 }}>{cliente.email} · {cliente.tel}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="outline" icon={<Mail size={15} />} onClick={() => setEmailOpen(true)}>Email</Button>
                    <Button variant="outline" icon={<ChevronDown size={13} />}>Asignar segmento</Button>
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                <StatCard label="Total gastado" value={fmtMoney(cliente.gasto)} icon={Banknote} accent="#3B82F6" />
                <StatCard label="Pedidos" value={cliente.pedidos} icon={ShoppingBag} accent="#10B981" />
                <StatCard label="Ticket prom" value={fmtMoney(cliente.ticket)} icon={BarChart3} accent="#8B5CF6" />
                <StatCard label="Última compra" value="Hoy" icon={Clock} accent="#F59E0B" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 16, alignItems: 'start' }}>
                {/* Pestañas */}
                <Card padding="md" style={{ padding: 0 }}>
                    <div style={{ display: 'flex', gap: 4, padding: '0 20px', borderBottom: '1px solid var(--color-border)' }}>
                        {([['pedidos', 'Pedidos'], ['notas', 'Notas'], ['info', 'Info'], ['actividad', 'Actividad']] as [TabKey, string][]).map(([k, l]) => {
                            const a = tab === k
                            return (
                                <button key={k} onClick={() => setTab(k)} style={{ padding: '12px 4px', marginRight: 16, border: 'none', background: 'transparent', color: a ? 'var(--color-primary)' : 'var(--color-muted)', fontSize: 13.5, fontWeight: a ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit', borderBottom: `2px solid ${a ? 'var(--color-primary)' : 'transparent'}`, marginBottom: -1 }}>{l}</button>
                            )
                        })}
                    </div>
                    <div style={{ padding: 20 }}>
                        {tab === 'pedidos' && MOCK_PEDIDOS.slice(0, 5).map((p, i) => (
                            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '80px 100px 1fr auto auto', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--color-border)' : 'none' }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', fontFamily: '"Geist Mono", monospace' }}>#{p.id}</span>
                                <span style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{fechaCorta(p.fecha)}</span>
                                <Badge status={p.estado} size="sm" />
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(p.monto)}</span>
                                <button onClick={() => irPedido(p.id)} style={iconBtn}><Eye size={15} /></button>
                            </div>
                        ))}

                        {tab === 'notas' && (
                            <div>
                                <textarea placeholder="Agregar nota interna…" rows={2} style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: 52, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--color-text)', fontFamily: 'inherit', outline: 'none', marginBottom: 8 }} />
                                <Button variant="primary" size="sm">Guardar</Button>
                                <div style={{ marginTop: 16, padding: 14, background: 'var(--color-surface)', borderRadius: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <Avatar name="Alexander" size={22} />
                                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>Alexander</span>
                                        <span style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>16 may · 11:20</span>
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--color-body)', lineHeight: 1.5 }}>Cliente VIP, siempre paga por transferencia. Preferir envíos a la mañana.</div>
                                </div>
                            </div>
                        )}

                        {tab === 'info' && ([['Nombre', cliente.nombre], ['Email', cliente.email], ['Teléfono', cliente.tel], ['Dirección', 'Av. Corrientes 1234, CABA'], ['Registro', 'feb 2025']] as [string, string][]).map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>{k}</span>
                                <span style={{ fontSize: 13, color: 'var(--color-text)', fontFamily: /Email|Tel|Reg/.test(k) ? '"Geist Mono", monospace' : 'inherit' }}>{v}</span>
                            </div>
                        ))}

                        {tab === 'actividad' && ([['Compró por primera vez', 'feb 2025', 'var(--color-success)'], ['Abrió email "Oferta verano"', '3 may', 'var(--color-primary)'], ['Consultó por WhatsApp', '10 may', 'var(--color-success)'], ['Realizó pedido #1284', '17 may', 'var(--color-primary)']] as [string, string, string][]).map(([txt, fc, col], i, arr) => (
                            <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i < arr.length - 1 ? 16 : 0 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: col, marginTop: 3 }} />
                                    {i < arr.length - 1 && <span style={{ width: 2, flex: 1, background: 'var(--color-border)', marginTop: 4 }} />}
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, color: 'var(--color-text)' }}>{txt}</div>
                                    <div style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace', marginTop: 2 }}>{fc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Card>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>Acciones rápidas</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <Button variant="primary" icon={<Plus size={15} />} onClick={irNuevo} style={{ justifyContent: 'center' }}>Nuevo pedido</Button>
                            <Button variant="outline" icon={<Mail size={15} />} onClick={() => setEmailOpen(true)} style={{ justifyContent: 'center' }}>Enviar email</Button>
                            <Button variant="outline" icon={<TrendingUp size={15} />} onClick={irReportes} style={{ justifyContent: 'center' }}>Ver en reportes</Button>
                        </div>
                    </Card>
                    <Card>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>Tags</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {cliente.tags.map(tg => (
                                <span key={tg} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, padding: '0 10px', borderRadius: 9999, background: 'var(--color-primary-bg)', color: 'var(--color-primary)', fontSize: 12, fontWeight: 600 }}>{tg} <X size={11} strokeWidth={2} /></span>
                            ))}
                            <button style={{ height: 24, padding: '0 10px', borderRadius: 9999, border: '1px dashed var(--color-border)', background: 'transparent', color: 'var(--color-muted)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Plus size={11} strokeWidth={2} /> Tag</button>
                        </div>
                    </Card>
                </div>
            </div>

            <ModalEmail isOpen={emailOpen} onClose={() => setEmailOpen(false)} cliente={{ nombre: cliente.nombre, email: cliente.email }} />
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
const iconBtn: React.CSSProperties = { width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }
