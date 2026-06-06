// Sidebar del panel admin — diseño del prototipo "Panel Admin 34":
// logo orbital, botón "Publicar tienda", buscador con resultados en vivo y
// módulos expandibles con badges, dots de alerta y sub-secciones.

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { LayoutDashboard, ShoppingBag, Users, Package, CreditCard, MessageSquare, Tag, Settings, Search, Globe } from 'lucide-react'
import type { ComponentType } from 'react'

import { MOCK_PEDIDOS } from '@/modules/ventas/admin/pedidos/mock/pedidos.mock'
import { MOCK_CLIENTES } from '@/modules/ventas/admin/clientes/mock/clientes.mock'
import { PRODUCTOS_DB } from '@/modules/ventas/admin/catalogo/mock/catalogo.mock'
import { fmtMoney } from '@/lib/utils'

type IconType = ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>
interface Sub { label: string; seccion: string; vista?: string }
interface Modulo { id: string; label: string; Icon: IconType; seccion: string; badge?: number; alert?: boolean; subs?: Sub[] }

const MODULOS: Modulo[] = [
    { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard, seccion: 'dashboard' },
    {
        id: 'pedidos', label: 'Pedidos', Icon: ShoppingBag, seccion: 'pedidos', badge: 4, alert: true,
        subs: [
            { label: 'Lista', seccion: 'pedidos' },
            { label: 'Cola de prep.', seccion: 'pedidos', vista: 'cola' },
            { label: 'Historial', seccion: 'pedidos', vista: 'historial' },
            { label: 'Devoluciones', seccion: 'pedidos', vista: 'devoluciones' },
            { label: 'Notas de crédito', seccion: 'pedidos', vista: 'notas' },
            { label: 'Nuevo +', seccion: 'pedidos', vista: 'nuevo' },
        ],
    },
    {
        id: 'clientes', label: 'Clientes', Icon: Users, seccion: 'clientes',
        subs: [
            { label: 'Lista', seccion: 'clientes' },
            { label: 'Reporte de clientes', seccion: 'reportes', vista: 'clientes' },
        ],
    },
    {
        id: 'productos', label: 'Productos', Icon: Package, seccion: 'catalogo',
        subs: [
            { label: 'Lista de productos', seccion: 'catalogo' },
            { label: 'Crear producto', seccion: 'catalogo', vista: 'nuevo' },
            { label: 'Categorías', seccion: 'categorias' },
            { label: 'Inventario', seccion: 'inventario' },
            { label: 'Reporte de productos', seccion: 'reportes', vista: 'productos' },
        ],
    },
    {
        id: 'pos', label: 'POS', Icon: CreditCard, seccion: 'pos',
        subs: [
            { label: 'Cobro rápido', seccion: 'pos' },
            { label: 'Abrir caja', seccion: 'pos', vista: 'apertura' },
            { label: 'Cerrar caja', seccion: 'pos', vista: 'cierre' },
            { label: 'Historial cajas', seccion: 'pos', vista: 'historial' },
        ],
    },
    {
        id: 'mensajes', label: 'Mensajes', Icon: MessageSquare, seccion: 'mensajes', badge: 3, alert: true,
        subs: [
            { label: 'Bandeja', seccion: 'mensajes' },
            { label: 'Plantillas', seccion: 'mensajes', vista: 'plantillas' },
        ],
    },
    {
        id: 'descuentos', label: 'Descuentos', Icon: Tag, seccion: 'descuentos',
        subs: [
            { label: 'Lista cupones', seccion: 'descuentos' },
            { label: 'Nuevo cupón', seccion: 'descuentos', vista: 'nuevo' },
            { label: 'Promos auto', seccion: 'descuentos', vista: 'promos' },
            { label: 'Rendimiento', seccion: 'descuentos', vista: 'rendimiento' },
        ],
    },
    {
        id: 'config', label: 'Configuración', Icon: Settings, seccion: 'configuracion',
        subs: [
            { label: 'General', seccion: 'configuracion' },
            { label: 'Apariencia', seccion: 'configuracion', vista: 'apariencia' },
            { label: 'Equipo', seccion: 'configuracion', vista: 'equipo' },
            { label: 'Notificaciones', seccion: 'configuracion', vista: 'notificaciones' },
        ],
    },
]

// Mapea la sección actual de la URL al módulo padre del sidebar.
const SECCION_MODULO: Record<string, string> = {
    dashboard: 'dashboard', pedidos: 'pedidos', clientes: 'clientes',
    catalogo: 'productos', categorias: 'productos', inventario: 'productos', reportes: 'productos',
    pos: 'pos', mensajes: 'mensajes', descuentos: 'descuentos', configuracion: 'config',
}

export default function Sidebar() {
    const router = useRouter()
    const negocioId = (router.query.negocioId as string) ?? 'rama-tienda'
    const seccion = (router.query.seccion as string) ?? 'dashboard'
    const vista = (router.query.vista as string) ?? ''

    const moduloActivo = SECCION_MODULO[seccion] ?? 'dashboard'
    const [abierto, setAbierto] = useState(moduloActivo)
    const [busqueda, setBusqueda] = useState('')
    const [publicada, setPublicada] = useState(false)

    useEffect(() => { setAbierto(moduloActivo) }, [moduloActivo])

    const ir = (sec: string, v?: string) => {
        const query: Record<string, string> = { negocioId, moduloPadre: 'ventas', seccion: sec }
        if (v) query.vista = v
        router.push({ pathname: '/admin/[negocioId]/[moduloPadre]/[seccion]', query })
    }

    const resultados = useMemo(() => {
        const q = busqueda.trim().toLowerCase()
        if (!q) return null
        return {
            pedidos: MOCK_PEDIDOS.filter(p => p.cliente.toLowerCase().includes(q) || p.id.includes(q)).slice(0, 3),
            clientes: MOCK_CLIENTES.filter(c => c.nombre.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)).slice(0, 2),
            productos: PRODUCTOS_DB.filter(p => p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 2),
        }
    }, [busqueda])

    const subActiva = (s: Sub) => seccion === s.seccion && (vista || '') === (s.vista || '')

    return (
        <aside className="flex flex-col w-60 shrink-0 h-full" style={{ background: 'var(--color-bg)', borderRight: '1px solid var(--color-border)' }}>

            {/* Logo */}
            <div className="flex items-center gap-2.5 h-14 px-4 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <OrbitLogo />
                <span className="text-[15px] font-bold" style={{ color: 'var(--color-text)' }}>Orbita</span>
            </div>

            {/* Publicar tienda */}
            <button
                onClick={() => setPublicada(true)}
                className="flex items-center justify-center gap-2 mx-3 mt-3 h-9 rounded-lg text-[13px] font-semibold cursor-pointer"
                style={{ border: 'none', color: '#fff', background: publicada ? 'linear-gradient(135deg,#059669,#10B981)' : 'linear-gradient(135deg,#10B981,#059669)' }}
            >
                <Globe size={14} strokeWidth={1.6} /> {publicada ? '✓ Tienda online' : 'Publicar tienda'}
            </button>

            {/* Buscador */}
            <div className="relative mx-3 mt-2 mb-1">
                <Search size={13} strokeWidth={1.6} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-muted)' }} />
                <input
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Escape') setBusqueda('') }}
                    placeholder="Buscar pedidos, clientes..."
                    className="w-full h-8 pl-7 pr-2.5 text-xs rounded-md outline-none"
                    style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
                {resultados && (
                    <div className="absolute left-0 right-0 z-50 mt-1 p-1.5 rounded-lg overflow-y-auto" style={{ top: '100%', maxHeight: 340, background: 'var(--color-bg)', border: '1px solid var(--color-border)', boxShadow: '0 12px 32px rgba(15,23,42,0.16)' }}>
                        {resultados.pedidos.length > 0 && <><div style={resLabel}>PEDIDOS</div>{resultados.pedidos.map(p => <button key={p.id} onClick={() => { ir('pedidos', 'detalle'); setBusqueda('') }} style={resItem}>#{p.id} · {p.cliente} · {fmtMoney(p.monto)}</button>)}</>}
                        {resultados.clientes.length > 0 && <><div style={resLabel}>CLIENTES</div>{resultados.clientes.map(c => <button key={c.id} onClick={() => { ir('clientes', 'detalle'); setBusqueda('') }} style={resItem}>{c.nombre} · {c.pedidos} pedidos</button>)}</>}
                        {resultados.productos.length > 0 && <><div style={resLabel}>PRODUCTOS</div>{resultados.productos.map(p => <button key={p.id} onClick={() => { ir('catalogo'); setBusqueda('') }} style={resItem}>{p.nombre} · Stock {p.stock}</button>)}</>}
                        {resultados.pedidos.length + resultados.clientes.length + resultados.productos.length === 0 && <div className="p-3 text-xs text-center" style={{ color: 'var(--color-muted)' }}>Sin resultados</div>}
                    </div>
                )}
            </div>

            {/* Navegación por módulos */}
            <nav className="flex-1 overflow-y-auto px-2 pb-3 flex flex-col gap-0.5">
                {MODULOS.map(m => {
                    const activo = moduloActivo === m.id
                    const open = abierto === m.id
                    return (
                        <div key={m.id}>
                            <button
                                onClick={() => { ir(m.seccion); setAbierto(m.id) }}
                                className="flex items-center gap-2.5 w-full h-9 px-2.5 rounded-md cursor-pointer text-[13px]"
                                style={{ border: 'none', background: activo ? 'var(--color-primary-bg)' : 'transparent', color: activo ? 'var(--color-primary)' : 'var(--color-body)', fontWeight: activo ? 600 : 500 }}
                                onMouseEnter={e => { if (!activo) e.currentTarget.style.background = 'var(--color-surface-alt)' }}
                                onMouseLeave={e => { if (!activo) e.currentTarget.style.background = 'transparent' }}
                            >
                                <m.Icon size={16} strokeWidth={1.6} />
                                <span className="flex-1 text-left">{m.label}</span>
                                {m.alert && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-error)' }} />}
                                {m.badge && <span className="grid place-items-center text-[10px] font-bold" style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9999, fontFamily: '"Geist Mono", monospace', background: activo ? 'var(--color-primary)' : 'var(--color-surface-alt)', color: activo ? '#fff' : 'var(--color-muted)' }}>{m.badge}</span>}
                            </button>

                            {open && m.subs && (
                                <div className="flex flex-col gap-px mt-0.5" style={{ paddingLeft: 20 }}>
                                    {m.subs.map(s => {
                                        const sa = subActiva(s)
                                        return (
                                            <button
                                                key={s.label}
                                                onClick={() => ir(s.seccion, s.vista)}
                                                className="h-[30px] px-2 rounded-md text-left cursor-pointer text-xs"
                                                style={{ border: 'none', fontWeight: sa ? 600 : 500, color: sa ? 'var(--color-primary)' : 'var(--color-muted)', background: sa ? 'var(--color-primary-bg)' : 'transparent' }}
                                                onMouseEnter={e => { if (!sa) e.currentTarget.style.color = 'var(--color-body)' }}
                                                onMouseLeave={e => { if (!sa) e.currentTarget.style.color = 'var(--color-muted)' }}
                                            >
                                                {s.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </nav>
        </aside>
    )
}

// Ícono orbital del prototipo (gradiente azul + punto + anillo).
function OrbitLogo() {
    return (
        <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#2563EB,#3B82F6)', display: 'grid', placeItems: 'center', position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />
            <div style={{ position: 'absolute', inset: 3, border: '1px solid rgba(255,255,255,0.5)', borderRadius: '50%' }} />
        </div>
    )
}

const resLabel: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: 'var(--color-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '8px 8px 4px' }
const resItem: React.CSSProperties = { width: '100%', textAlign: 'left', padding: '8px', border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, color: 'var(--color-body)' }
