// src/modules/ventas/admin/clientes/ClienteLista.tsx — Vista 09 + hub del módulo
//
// Punto de entrada del módulo `clientes` (registrado en el componentMap admin).
// Funciona como HUB: según `router.query.vista` muestra la lista (V09) o el
// detalle de un cliente (V10).
//
//   /admin/[negocioId]/ventas/clientes              → lista (V09)
//   …/clientes?vista=detalle&id=c1                  → ClienteDetalle (V10)

import { useState } from 'react'
import { useRouter } from 'next/router'
import { SlidersHorizontal, Download, Mail, ChevronRight, Eye } from 'lucide-react'
import { Card } from '@/design-system/components/Card'
import { Badge } from '@/design-system/components/Badge'
import { Button } from '@/design-system/components/Button'
import { Avatar } from '@/design-system/components/Avatar'
import { fmtMoney } from '@/lib/utils'

import { SegmentoBadge } from './components/SegmentoBadge'
import { EmailMasivoModal } from './components/EmailMasivoModal'
import ClienteDetalle from './ClienteDetalle'
import { MOCK_CLIENTES } from './mock/clientes.mock'
import { MOCK_PEDIDOS } from '../pedidos/mock/pedidos.mock'
import { ModalEmail, type ClienteEmail } from '../pedidos/components/ModalEmail'
import type { Segmento } from './types/clientes.types'

const COLS = '24px 1.4fr 90px 110px 110px 110px 110px 70px'

function relTime(iso: string): string {
    const d = new Date(iso), now = new Date('2026-05-17')
    const days = Math.floor((now.getTime() - d.getTime()) / 86400000)
    if (days <= 0) return 'Hoy'
    if (days === 1) return 'Ayer'
    if (days < 30) return `Hace ${days} días`
    return `Hace ${Math.floor(days / 30)} mes`
}

// ─── Lista (V09) ──────────────────────────────────────────────────────────────

function ListaView({ irDetalle }: { irDetalle: (id: string) => void }) {
    const [filtros, setFiltros] = useState(false)
    const [seg, setSeg] = useState<Segmento | 'todos'>('todos')
    const [exp, setExp] = useState<string | null>(null)
    const [emailMasivo, setEmailMasivo] = useState(false)
    const [email, setEmail] = useState<ClienteEmail | null>(null)

    const rows = seg === 'todos' ? MOCK_CLIENTES : MOCK_CLIENTES.filter(c => c.segmento === seg)

    return (
        <div style={pageWrap}>
            {/* Tabs lista/detalle */}
            <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)', marginBottom: 20 }}>
                {[['lista', 'Lista'], ['detalle', 'Detalle']].map(([k, l]) => {
                    const a = k === 'lista'
                    return (
                        <button key={k} onClick={() => k === 'detalle' && irDetalle(MOCK_CLIENTES[0].id)} style={{ padding: '10px 14px', border: 'none', background: 'transparent', color: a ? 'var(--color-text)' : 'var(--color-muted)', fontSize: 13.5, fontWeight: a ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit', borderBottom: `2px solid ${a ? 'var(--color-primary)' : 'transparent'}`, marginBottom: -1 }}>{l}</button>
                    )
                })}
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: 0 }}>Clientes</h1>
                    <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', borderRadius: 9999, background: 'var(--color-surface-alt)', color: 'var(--color-muted)', fontSize: 12, fontWeight: 600, fontFamily: '"Geist Mono", monospace' }}>10 clientes</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="outline" icon={<SlidersHorizontal size={15} />} onClick={() => setFiltros(f => !f)}>Filtros</Button>
                    <Button variant="outline" icon={<Download size={15} />}>Exportar</Button>
                    <Button variant="primary" icon={<Mail size={16} />} onClick={() => setEmailMasivo(true)}>Email masivo</Button>
                </div>
            </div>

            {/* Filtros */}
            {filtros && (
                <Card style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Segmento:</span>
                        {(['todos', 'vip', 'recurrente', 'nuevo', 'inactivo'] as const).map(s => {
                            const a = seg === s
                            return (
                                <button key={s} onClick={() => setSeg(s)} style={{ height: 30, padding: '0 12px', borderRadius: 9999, border: 'none', background: a ? 'var(--color-primary-bg)' : 'var(--color-surface-alt)', color: a ? 'var(--color-primary)' : 'var(--color-muted)', fontSize: 12, fontWeight: a ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>{s}</button>
                            )
                        })}
                        <div style={{ flex: 1 }} />
                        <Button variant="outline" size="sm" onClick={() => setSeg('todos')}>Limpiar</Button>
                    </div>
                </Card>
            )}

            {/* Tabla */}
            <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', gap: 10, padding: '0 16px', height: 44, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <span /><span>Cliente</span><span style={{ textAlign: 'right' }}>Pedidos</span><span style={{ textAlign: 'right' }}>Gastado</span><span style={{ textAlign: 'right' }}>Ticket</span><span>Última</span><span>Segmento</span><span style={{ textAlign: 'right' }}>Acc.</span>
                </div>
                {rows.map((c, i) => {
                    const open = exp === c.id
                    return (
                        <div key={c.id}>
                            <div onClick={() => setExp(open ? null : c.id)} style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', gap: 10, padding: '0 16px', height: 60, borderBottom: (open || i < rows.length - 1) ? '1px solid var(--color-border)' : 'none', cursor: 'pointer', background: open ? 'var(--color-primary-bg)' : 'transparent', transition: 'background 150ms' }}>
                                <span style={{ color: 'var(--color-muted)', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 150ms', display: 'inline-flex' }}><ChevronRight size={14} strokeWidth={1.8} /></span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                    <Avatar name={c.nombre} size={34} />
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nombre}</div>
                                        <div style={{ fontSize: 11, color: 'var(--color-subtle)', fontFamily: '"Geist Mono", monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}</div>
                                    </div>
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)', fontFamily: '"Geist Mono", monospace', textAlign: 'right' }}>{c.pedidos}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace', textAlign: 'right' }}>{fmtMoney(c.gasto)}</span>
                                <span style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace', textAlign: 'right' }}>{fmtMoney(c.ticket)}</span>
                                <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{relTime(c.ultima)}</span>
                                <span><SegmentoBadge segmento={c.segmento} size="sm" /></span>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }} onClick={e => e.stopPropagation()}>
                                    <button onClick={() => irDetalle(c.id)} style={iconBtn}><Eye size={15} /></button>
                                    <button onClick={() => setEmail({ nombre: c.nombre, email: c.email })} style={iconBtn}><Mail size={15} /></button>
                                </div>
                            </div>
                            {open && (
                                <div style={{ padding: '14px 16px 14px 50px', background: 'var(--color-surface)', borderBottom: i < rows.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Últimos pedidos</div>
                                    {MOCK_PEDIDOS.slice(0, 3).map(p => (
                                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace', width: 60 }}>#{p.id}</span>
                                            <Badge status={p.estado} size="sm" />
                                            <div style={{ flex: 1 }} />
                                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(p.monto)}</span>
                                        </div>
                                    ))}
                                    <button onClick={() => irDetalle(c.id)} style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>Ver perfil completo →</button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 4px' }}>
                <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Mostrando <strong style={{ color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{rows.length}</strong> de <strong style={{ color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>48</strong></span>
                <Button variant="outline" size="sm">Ver todos (48)</Button>
            </div>

            <EmailMasivoModal isOpen={emailMasivo} onClose={() => setEmailMasivo(false)} />
            {email && <ModalEmail isOpen onClose={() => setEmail(null)} cliente={email} />}
        </div>
    )
}

// ─── Hub ──────────────────────────────────────────────────────────────────────

export default function ClienteLista() {
    const router = useRouter()
    const { vista, id } = router.query

    const irDetalle = (cid: string) => {
        const { vista: _v, id: _i, ...rest } = router.query
        router.push({ query: { ...rest, vista: 'detalle', id: cid } })
    }
    const volver = () => {
        const { vista: _v, id: _i, ...rest } = router.query
        router.push({ query: rest })
    }
    const irSeccion = (seccion: string, extra?: Record<string, string>) => {
        const { negocioId, moduloPadre } = router.query
        router.push({ query: { negocioId: negocioId as string, moduloPadre: moduloPadre as string, seccion, ...extra } })
    }

    if (vista === 'detalle') {
        return (
            <ClienteDetalle
                id={id as string}
                onVolver={volver}
                irPedido={(pid) => irSeccion('pedidos', { vista: 'detalle', id: pid })}
                irNuevo={() => irSeccion('pedidos', { vista: 'nuevo' })}
                irReportes={() => irSeccion('reportes', { vista: 'clientes' })}
            />
        )
    }

    return <ListaView irDetalle={irDetalle} />
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
const iconBtn: React.CSSProperties = { width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }
