// src/modules/ventas/admin/pedidos/PedidoLista.tsx — Vista 02 + hub del módulo
//
// Este componente es el punto de entrada del módulo `pedidos` (registrado en el
// componentMap del router admin). Funciona como HUB: según `router.query.vista`
// renderiza la sub-vista correspondiente, igual que ProductoLista en catálogo.
//
//   /admin/[negocioId]/ventas/pedidos                  → lista (esta vista, V02)
//   …/pedidos?vista=detalle&id=1284                    → PedidoDetalle (V03)
//   …/pedidos?vista=nuevo                              → PedidoNuevo (V04)
//   …/pedidos?vista=historial                          → PedidoHistorial (V05)
//   …/pedidos?vista=cola                               → ColaPreparacion (V08)
//   …/pedidos?vista=devoluciones                       → Devoluciones (V06)
//   …/pedidos?vista=notas                              → NotasCredito (V07)

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { Download, Plus, Search, Clock, ChevronDown, Globe, Store } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { Toast } from '@/design-system/components/Toast'

import { PedidoTabs, type VistaPedido } from './components/PedidoTabs'
import { PedidoTable } from './components/PedidoTable'
import { ModalComprobante } from './components/ModalComprobante'
import { ModalEmail, type ClienteEmail } from './components/ModalEmail'

import PedidoDetalle from './PedidoDetalle'
import PedidoNuevo from './PedidoNuevo'
import PedidoHistorial from './PedidoHistorial'
import ColaPreparacion from './ColaPreparacion'
import Devoluciones from './Devoluciones'
import NotasCredito from './NotasCredito'

import { MOCK_PEDIDOS } from './mock/pedidos.mock'
import type { EstadoPedido, Pedido } from './types/pedidos.types'

// ─── Lista (V02) ────────────────────────────────────────────────────────────

const ESTADO_TABS: { id: EstadoPedido | 'todos'; label: string; dot: string | null }[] = [
    { id: 'todos',       label: 'Todos',      dot: null      },
    { id: 'pendiente',   label: 'Pendientes', dot: '#F59E0B' },
    { id: 'confirmado',  label: 'Confirmados', dot: '#10B981' },
    { id: 'preparacion', label: 'En prep.',   dot: '#8B5CF6' },
    { id: 'enviado',     label: 'Enviados',   dot: '#3B82F6' },
    { id: 'entregado',   label: 'Entregados', dot: '#94A3B8' },
    { id: 'cancelado',   label: 'Cancelados', dot: '#EF4444' },
]

function ListaView({ ir }: { ir: (v: VistaPedido, id?: string) => void }) {
    const [tab, setTab] = useState<EstadoPedido | 'todos'>('todos')
    const [canal, setCanal] = useState<'todos' | 'online' | 'presencial'>('todos')
    const [busqueda, setBusqueda] = useState('')
    const [comprobante, setComprobante] = useState<string | null>(null)
    const [email, setEmail] = useState<ClienteEmail | null>(null)

    const base = useMemo(
        () => canal === 'todos' ? MOCK_PEDIDOS : MOCK_PEDIDOS.filter(p => p.canal.toLowerCase() === canal),
        [canal],
    )

    const counts = useMemo(() => {
        const c: Record<string, number> = { todos: base.length }
        base.forEach(p => { c[p.estado] = (c[p.estado] ?? 0) + 1 })
        return c
    }, [base])

    const rows = useMemo(() => {
        let r = tab === 'todos' ? base : base.filter(p => p.estado === tab)
        if (busqueda) r = r.filter(p => p.id.includes(busqueda) || p.cliente.toLowerCase().includes(busqueda.toLowerCase()))
        return r
    }, [base, tab, busqueda])

    return (
        <div style={pageWrap}>
            <PedidoTabs activo="lista" ir={ir} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: 0 }}>Pedidos</h1>
                    <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', borderRadius: 9999, background: 'var(--color-surface-alt)', color: 'var(--color-muted)', fontSize: 12, fontWeight: 600, fontFamily: '"Geist Mono", monospace' }}>12</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 24, padding: '0 10px', borderRadius: 9999, background: 'var(--color-warning-bg)', color: 'var(--color-warning)', fontSize: 12, fontWeight: 600 }}>4 sin atender</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="outline" icon={<Download size={15} />}>Exportar</Button>
                    <Button variant="primary" icon={<Plus size={16} />} onClick={() => ir('nuevo')}>Nuevo pedido</Button>
                </div>
            </div>

            {/* Filtros */}
            <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 2, padding: '6px 8px', borderBottom: '1px solid var(--color-border)', overflowX: 'auto' }}>
                    {ESTADO_TABS.map(({ id, label, dot }) => {
                        const a = tab === id
                        return (
                            <button key={id} onClick={() => setTab(id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8, border: 'none', background: a ? 'var(--color-primary-bg)' : 'transparent', color: a ? 'var(--color-primary)' : 'var(--color-body)', fontSize: 13, fontWeight: a ? 600 : 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                                {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />}
                                {label}
                                <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 9999, fontFamily: '"Geist Mono", monospace', background: a ? 'var(--color-primary-bg)' : 'var(--color-surface-alt)', color: a ? 'var(--color-primary)' : 'var(--color-muted)' }}>{counts[id] ?? 0}</span>
                            </button>
                        )
                    })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', flexWrap: 'wrap' }}>
                    <button style={{ height: 36, padding: '0 12px', display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13, fontWeight: 500, color: 'var(--color-text)', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Clock size={15} /> Hoy, 17 may <ChevronDown size={13} style={{ opacity: 0.6 }} />
                    </button>
                    <div style={{ display: 'flex', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 2, height: 36 }}>
                        {([['todos', 'Todos', null], ['online', 'Online', Globe], ['presencial', 'Presencial', Store]] as ['todos' | 'online' | 'presencial', string, typeof Globe | null][]).map(([id, l, Icon]) => {
                            const a = canal === id
                            return (
                                <button key={id} onClick={() => { setCanal(id); setTab('todos') }} style={{ height: '100%', padding: '0 12px', borderRadius: 6, border: 'none', background: a ? 'var(--color-bg)' : 'transparent', color: a ? 'var(--color-text)' : 'var(--color-muted)', fontSize: 12, fontWeight: a ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    {Icon && <Icon size={13} />}{l}
                                </button>
                            )
                        })}
                    </div>
                    <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                        <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por # o cliente…" style={{ width: '100%', boxSizing: 'border-box', height: 36, paddingLeft: 34, paddingRight: 12, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13, color: 'var(--color-text)', fontFamily: 'inherit', outline: 'none' }} />
                    </div>
                </div>
            </div>

            <PedidoTable
                rows={rows}
                onRowClick={(p: Pedido) => ir('detalle', p.id)}
                onComprobante={(p) => setComprobante(p.id)}
                onEmail={(p) => setEmail({ nombre: p.cliente, email: p.email })}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 4px', flexWrap: 'wrap', gap: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                    Mostrando <strong style={{ color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>1–{rows.length}</strong> de <strong style={{ color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>12</strong>
                </span>
                <Button variant="outline" size="sm">Ver todos (142)</Button>
            </div>

            <ModalComprobante isOpen={comprobante !== null} onClose={() => setComprobante(null)} id={comprobante ?? undefined} />
            {email && <ModalEmail isOpen onClose={() => setEmail(null)} cliente={email} />}
        </div>
    )
}

// ─── Hub ──────────────────────────────────────────────────────────────────────

export default function PedidoLista() {
    const router = useRouter()
    const { vista, id } = router.query
    const [toast, setToast] = useState<string | null>(null)

    useEffect(() => {
        if (!toast) return
        const t = setTimeout(() => setToast(null), 3000)
        return () => clearTimeout(t)
    }, [toast])

    const ir = (v: VistaPedido, pid?: string) => {
        const { vista: _v, id: _i, ...rest } = router.query
        const q: Record<string, string | string[]> = { ...rest }
        if (v !== 'lista') q.vista = v
        if (pid) q.id = pid
        router.push({ query: q })
    }

    const sub = vista as VistaPedido | undefined
    let content
    if (sub === 'detalle')          content = <PedidoDetalle id={id as string} ir={ir} />
    else if (sub === 'nuevo')       content = <PedidoNuevo ir={ir} onToast={setToast} />
    else if (sub === 'historial')   content = <PedidoHistorial ir={ir} />
    else if (sub === 'cola')        content = <ColaPreparacion ir={ir} onToast={setToast} />
    else if (sub === 'devoluciones') content = <Devoluciones ir={ir} onToast={setToast} />
    else if (sub === 'notas')       content = <NotasCredito ir={ir} onToast={setToast} />
    else                            content = <ListaView ir={ir} />

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
