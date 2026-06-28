// src/modules/ventas/panel/clientes/ClienteLista.tsx — Vista 09 + hub del módulo

import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { Download, Mail, ChevronRight, Eye, Search, BarChart2 } from 'lucide-react'
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

const SEGMENTOS: { id: Segmento | 'todos'; label: string }[] = [
    { id: 'todos',      label: 'Todos'     },
    { id: 'vip',        label: 'VIP'       },
    { id: 'recurrente', label: 'Recurrente'},
    { id: 'nuevo',      label: 'Nuevo'     },
    { id: 'inactivo',   label: 'Inactivo'  },
]

// ─── Card mobile ─────────────────────────────────────────────────────────────

function ClienteCard({ c, onVer, onEmail }: {
    c: typeof MOCK_CLIENTES[0]
    onVer: () => void
    onEmail: () => void
}) {
    const [hov, setHov] = useState(false)
    return (
        <div
            onClick={onVer}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                background:   hov ? 'var(--color-surface)' : 'var(--color-bg)',
                border:       '1px solid var(--color-border)',
                borderRadius: 12,
                padding:      '14px 14px 12px',
                cursor:       'pointer',
                transition:   'background 150ms',
                display:      'flex',
                flexDirection:'column',
                gap:          8,
            }}
        >
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <Avatar name={c.nombre} size={38} />
                <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--color-text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.nombre}</div>
                    <div style={{ fontSize:11, color:'var(--color-subtle)', fontFamily:'"Geist Mono", monospace', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.email}</div>
                </div>
                <SegmentoBadge segmento={c.segmento} size="sm" />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:4 }}>
                {[
                    ['Pedidos', String(c.pedidos)],
                    ['Gastado', fmtMoney(c.gasto)],
                    ['Ticket', fmtMoney(c.ticket)],
                ].map(([k, v]) => (
                    <div key={k} style={{ background:'var(--color-surface)', borderRadius:8, padding:'6px 8px' }}>
                        <div style={{ fontSize:10, color:'var(--color-muted)', marginBottom:2 }}>{k}</div>
                        <div style={{ fontSize:12, fontWeight:700, color:'var(--color-text)', fontFamily:'"Geist Mono", monospace' }}>{v}</div>
                    </div>
                ))}
            </div>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:11, color:'var(--color-subtle)' }}>{relTime(c.ultima)}</span>
                <div style={{ display:'flex', gap:4 }} onClick={e => e.stopPropagation()}>
                    <button onClick={onVer}   style={iconBtn}><Eye size={13} /></button>
                    <button onClick={onEmail} style={iconBtn}><Mail size={13} /></button>
                </div>
            </div>
        </div>
    )
}

// ─── Lista (V09) ─────────────────────────────────────────────────────────────

function ListaView({
    irDetalle,
    irReporte,
}: {
    irDetalle: (id: string) => void
    irReporte: () => void
}) {
    const [seg,          setSeg]          = useState<Segmento | 'todos'>('todos')
    const [busqueda,     setBusqueda]     = useState('')
    const [exp,          setExp]          = useState<string | null>(null)
    const [emailMasivo,  setEmailMasivo]  = useState(false)
    const [email,        setEmail]        = useState<ClienteEmail | null>(null)

    const rows = useMemo(() => {
        let r = seg === 'todos' ? MOCK_CLIENTES : MOCK_CLIENTES.filter(c => c.segmento === seg)
        if (busqueda.trim()) {
            const q = busqueda.trim().toLowerCase()
            r = r.filter(c => c.nombre.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
        }
        return r
    }, [seg, busqueda])

    return (
        <div className="cli-page" style={pageWrap}>
            <style>{`
                .cli-page        { padding: 24px 32px 64px; }
                .cli-header      { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; flex-wrap:wrap; margin-bottom:20px; }
                .cli-table-wrap  { display: block; }
                .cli-cards-wrap  { display: none; }
                .cli-tabs        { -ms-overflow-style:none; scrollbar-width:none; }
                .cli-tabs::-webkit-scrollbar { display:none; }
                @media (max-width: 768px) {
                    .cli-page       { padding: 16px 14px 48px !important; }
                    .cli-header     { flex-direction: column; align-items: flex-start !important; }
                    .cli-export-btn { display: none !important; }
                    .cli-table-wrap { display: none !important; }
                    .cli-cards-wrap { display: flex !important; flex-direction: column; gap: 10px; }
                }
            `}</style>

            {/* Tabs */}
            <div className="cli-tabs" style={{ display:'flex', gap:4, borderBottom:'1px solid var(--color-border)', marginBottom:20, overflowX:'auto' }}>
                {([['lista', 'Lista'], ['reporte', 'Reporte clientes']] as const).map(([k, l]) => {
                    const a = k === 'lista'
                    return (
                        <button key={k} onClick={() => k === 'reporte' && irReporte()} style={{ padding:'10px 14px', border:'none', background:'transparent', color: a ? 'var(--color-text)' : 'var(--color-muted)', fontSize:13.5, fontWeight: a ? 600 : 500, cursor:'pointer', fontFamily:'inherit', borderBottom:`2px solid ${a ? 'var(--color-primary)' : 'transparent'}`, marginBottom:-1, whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:6 }}>
                            {k === 'reporte' && <BarChart2 size={13} />}
                            {l}
                        </button>
                    )
                })}
            </div>

            {/* Header */}
            <div className="cli-header">
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <h1 style={{ fontSize:26, fontWeight:700, letterSpacing:'-0.02em', color:'var(--color-text)', margin:0 }}>Clientes</h1>
                    <span style={{ display:'inline-flex', alignItems:'center', height:24, padding:'0 10px', borderRadius:9999, background:'var(--color-surface-alt)', color:'var(--color-muted)', fontSize:12, fontWeight:600, fontFamily:'"Geist Mono", monospace' }}>{rows.length} clientes</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                    <span className="cli-export-btn"><Button variant="outline" icon={<Download size={15} />}>Exportar</Button></span>
                    <Button variant="primary" icon={<Mail size={16} />} onClick={() => setEmailMasivo(true)}>Email masivo</Button>
                </div>
            </div>

            {/* Filtros siempre visibles */}
            <div style={{ background:'var(--color-bg)', border:'1px solid var(--color-border)', borderRadius:12, padding:'10px 12px', marginBottom:16, display:'flex', flexDirection:'column', gap:10 }}>
                {/* Búsqueda */}
                <div style={{ position:'relative' }}>
                    <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--color-muted)', pointerEvents:'none' }} />
                    <input
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre o email…"
                        style={{ width:'100%', boxSizing:'border-box', height:36, paddingLeft:32, paddingRight:12, background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:8, fontSize:13, color:'var(--color-text)', fontFamily:'inherit', outline:'none' }}
                    />
                </div>
                {/* Segmento */}
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                    <span style={{ fontSize:11, fontWeight:600, color:'var(--color-muted)', textTransform:'uppercase', letterSpacing:'0.04em' }}>Segmento</span>
                    {SEGMENTOS.map(({ id, label }) => {
                        const a = seg === id
                        return (
                            <button key={id} onClick={() => setSeg(id)} style={{ height:28, padding:'0 12px', borderRadius:9999, border:'none', background: a ? 'var(--color-primary-bg)' : 'var(--color-surface-alt)', color: a ? 'var(--color-primary)' : 'var(--color-muted)', fontSize:12, fontWeight: a ? 600 : 500, cursor:'pointer', fontFamily:'inherit' }}>
                                {label}
                            </button>
                        )
                    })}
                    {(busqueda || seg !== 'todos') && (
                        <button onClick={() => { setSeg('todos'); setBusqueda('') }} style={{ height:28, padding:'0 10px', borderRadius:9999, border:'1px solid var(--color-border)', background:'transparent', color:'var(--color-muted)', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* ── DESKTOP: tabla ── */}
            <div className="cli-table-wrap" style={{ background:'var(--color-bg)', border:'1px solid var(--color-border)', borderRadius:12, overflow:'hidden' }}>
                <div style={{ display:'grid', gridTemplateColumns:COLS, alignItems:'center', gap:10, padding:'0 16px', height:44, background:'var(--color-surface)', borderBottom:'1px solid var(--color-border)', fontSize:11, fontWeight:600, color:'var(--color-muted)', textTransform:'uppercase', letterSpacing:'0.04em' }}>
                    <span /><span>Cliente</span><span style={{ textAlign:'right' }}>Pedidos</span><span style={{ textAlign:'right' }}>Gastado</span><span style={{ textAlign:'right' }}>Ticket</span><span>Última</span><span>Segmento</span><span style={{ textAlign:'right' }}>Acc.</span>
                </div>
                {rows.length === 0 ? (
                    <div style={{ padding:'32px 16px', textAlign:'center', fontSize:13, color:'var(--color-muted)' }}>Sin resultados</div>
                ) : rows.map((c, i) => {
                    const open = exp === c.id
                    return (
                        <div key={c.id}>
                            <div onClick={() => setExp(open ? null : c.id)} style={{ display:'grid', gridTemplateColumns:COLS, alignItems:'center', gap:10, padding:'0 16px', height:60, borderBottom:(open || i < rows.length - 1) ? '1px solid var(--color-border)' : 'none', cursor:'pointer', background: open ? 'var(--color-primary-bg)' : 'transparent', transition:'background 150ms' }}>
                                <span style={{ color:'var(--color-muted)', transform: open ? 'rotate(90deg)' : 'none', transition:'transform 150ms', display:'inline-flex' }}><ChevronRight size={14} strokeWidth={1.8} /></span>
                                <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                                    <Avatar name={c.nombre} size={34} />
                                    <div style={{ minWidth:0 }}>
                                        <div style={{ fontSize:13, fontWeight:500, color:'var(--color-text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.nombre}</div>
                                        <div style={{ fontSize:11, color:'var(--color-subtle)', fontFamily:'"Geist Mono", monospace', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.email}</div>
                                    </div>
                                </div>
                                <span style={{ fontSize:14, fontWeight:700, color:'var(--color-primary)', fontFamily:'"Geist Mono", monospace', textAlign:'right' }}>{c.pedidos}</span>
                                <span style={{ fontSize:13, fontWeight:600, color:'var(--color-text)', fontFamily:'"Geist Mono", monospace', textAlign:'right' }}>{fmtMoney(c.gasto)}</span>
                                <span style={{ fontSize:12, color:'var(--color-muted)', fontFamily:'"Geist Mono", monospace', textAlign:'right' }}>{fmtMoney(c.ticket)}</span>
                                <span style={{ fontSize:12, color:'var(--color-muted)' }}>{relTime(c.ultima)}</span>
                                <span><SegmentoBadge segmento={c.segmento} size="sm" /></span>
                                <div style={{ display:'flex', justifyContent:'flex-end', gap:2 }} onClick={e => e.stopPropagation()}>
                                    <button onClick={() => irDetalle(c.id)} style={iconBtn}><Eye size={15} /></button>
                                    <button onClick={() => setEmail({ nombre: c.nombre, email: c.email })} style={iconBtn}><Mail size={15} /></button>
                                </div>
                            </div>
                            {open && (
                                <div style={{ padding:'14px 16px 14px 50px', background:'var(--color-surface)', borderBottom: i < rows.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                    <div style={{ fontSize:11, fontWeight:600, color:'var(--color-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>Últimos pedidos</div>
                                    {MOCK_PEDIDOS.slice(0, 3).map(p => (
                                        <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'6px 0' }}>
                                            <span style={{ fontSize:12, fontWeight:600, color:'var(--color-text)', fontFamily:'"Geist Mono", monospace', width:60 }}>#{p.id}</span>
                                            <Badge status={p.estado} size="sm" />
                                            <div style={{ flex:1 }} />
                                            <span style={{ fontSize:13, fontWeight:600, color:'var(--color-text)', fontFamily:'"Geist Mono", monospace' }}>{fmtMoney(p.monto)}</span>
                                        </div>
                                    ))}
                                    <button onClick={() => irDetalle(c.id)} style={{ marginTop:8, background:'none', border:'none', color:'var(--color-primary)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', padding:0 }}>Ver perfil completo →</button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* ── MOBILE: cards ── */}
            <div className="cli-cards-wrap">
                {rows.length === 0 ? (
                    <div style={{ padding:'32px 16px', textAlign:'center', fontSize:13, color:'var(--color-muted)' }}>Sin resultados</div>
                ) : rows.map(c => (
                    <ClienteCard
                        key={c.id}
                        c={c}
                        onVer={() => irDetalle(c.id)}
                        onEmail={() => setEmail({ nombre: c.nombre, email: c.email })}
                    />
                ))}
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 4px', flexWrap:'wrap', gap:12 }}>
                <span style={{ fontSize:13, color:'var(--color-muted)' }}>Mostrando <strong style={{ color:'var(--color-text)', fontFamily:'"Geist Mono", monospace' }}>{rows.length}</strong> de <strong style={{ color:'var(--color-text)', fontFamily:'"Geist Mono", monospace' }}>48</strong></span>
                <Button variant="outline" size="sm">Ver todos (48)</Button>
            </div>

            <EmailMasivoModal isOpen={emailMasivo} onClose={() => setEmailMasivo(false)} />
            {email && <ModalEmail isOpen onClose={() => setEmail(null)} cliente={email} />}
        </div>
    )
}

// ─── Hub ─────────────────────────────────────────────────────────────────────

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
        router.push({
            pathname: `/admin/${negocioId as string}/${moduloPadre as string}/${seccion}`,
            query:    extra ?? {},
        })
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

    return (
        <ListaView
            irDetalle={irDetalle}
            irReporte={() => irSeccion('reportes', { vista: 'clientes' })}
        />
    )
}

const pageWrap: React.CSSProperties = { padding:'24px 32px 64px', maxWidth:1280, width:'100%', margin:'0 auto', boxSizing:'border-box' }
const iconBtn:  React.CSSProperties = { width:28, height:28, borderRadius:6, border:'none', background:'transparent', color:'var(--color-muted)', cursor:'pointer', display:'grid', placeItems:'center' }
