// Barra superior del panel de administración, con breadcrumb dinámico, buscador, acciones y menú de usuario.
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Bell, Moon, Sun, Search, LogOut, User, ChevronDown, AlertCircle, AlertTriangle, X } from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'

const seccionLabels: Record<string, string> = {
    dashboard: 'Inicio',
    pedidos: 'Pedidos',
    catalogo: 'Catálogo',
    clientes: 'Clientes',
    reportes: 'Reportes',
    pos: 'POS',
    inventario: 'Inventario',
    descuentos: 'Descuentos',
    mensajes: 'Mensajes',
    configuracion: 'Configuración',
}

interface Notif { id: string; nivel: 'danger' | 'warning'; titulo: string; desc: string; tiempo: string }
const NOTIFS: Notif[] = [
    { id: 'n1', nivel: 'danger',  titulo: '4 pedidos necesitan atención', desc: 'Confirmá pagos y movelos a preparación', tiempo: 'Ahora' },
    { id: 'n2', nivel: 'danger',  titulo: '2 pedidos sin atender +2hs',    desc: 'Pedidos P-0182 y P-0183 sin respuesta', tiempo: 'Hace 2hs' },
    { id: 'n3', nivel: 'warning', titulo: '3 productos con stock < 5',      desc: 'Remera oversize, Buzo frisa, Gorra', tiempo: 'Hace 3hs' },
    { id: 'n4', nivel: 'warning', titulo: '1 pago por confirmar',           desc: 'Transferencia pendiente de validación', tiempo: 'Hace 5hs' },
]

export default function Header() {
    const { isDark, toggle } = useDarkMode()
    const { query } = useRouter()
    const seccion    = (query.seccion    as string) ?? ''
    const moduloPadre = (query.moduloPadre as string) ?? 'Gestión'
    const titulo     = seccionLabels[seccion] ?? seccion

    const [userMenuAbierto, setUserMenuAbierto] = useState(false)
    const [notifOpen, setNotifOpen]             = useState(false)
    const [notifs, setNotifs]                   = useState<Notif[]>(NOTIFS)

    const menuRef  = useRef<HTMLDivElement>(null)
    const notifRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current  && !menuRef.current.contains(e.target  as Node)) setUserMenuAbierto(false)
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="flex items-center h-16 px-8 shrink-0" style={{
            background: 'var(--color-bg)',
            borderBottom: '1px solid var(--color-border)'
        }}>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <span style={{ color: 'var(--color-muted)' }} className="capitalize">{moduloPadre}</span>
                <span style={{ color: 'var(--color-muted)' }}>›</span>
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>{titulo}</span>
            </div>

            <div className="flex-1" />

            {/* Acciones */}
            <div className="flex items-center gap-3">

                {/* Buscador global */}
                <div className="relative">
                    <Search
                        size={16}
                        strokeWidth={1.5}
                        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: 'var(--color-subtle)' }}
                    />
                    <input
                        type="text"
                        placeholder="Buscar en Orbita..."
                        className="h-9 w-64 pl-9 pr-3 text-sm rounded-lg outline-none"
                        style={{
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border-strong)',
                            color: 'var(--color-text)',
                        }}
                    />
                </div>

                {/* Toggle dark mode */}
                <button
                    onClick={toggle}
                    aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                    className="grid place-items-center w-9 h-9 rounded-lg cursor-pointer"
                    style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-body)' }}
                >
                    {isDark ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
                </button>

                {/* Notificaciones con badge + dropdown */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setNotifOpen(o => !o)}
                        className="grid place-items-center w-9 h-9 rounded-lg cursor-pointer"
                        style={{
                            background: notifOpen ? 'var(--color-surface-alt)' : 'transparent',
                            border: `1px solid ${notifOpen ? 'var(--color-border-strong)' : 'var(--color-border)'}`,
                            color: 'var(--color-body)',
                            position: 'relative',
                        }}
                    >
                        <Bell size={18} strokeWidth={1.5} />
                        {notifs.length > 0 && (
                            <span style={{
                                position: 'absolute', top: -4, right: -4,
                                minWidth: 18, height: 18, borderRadius: 9,
                                background: 'var(--color-error)', color: '#fff',
                                fontSize: 10, fontWeight: 700, fontFamily: '"Geist Mono", monospace',
                                display: 'grid', placeItems: 'center', padding: '0 4px',
                                border: '2px solid var(--color-bg)',
                                lineHeight: 1,
                            }}>
                                {notifs.length}
                            </span>
                        )}
                    </button>

                    {notifOpen && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                            width: 340, borderRadius: 12, zIndex: 1000,
                            background: 'var(--color-bg)',
                            border: '1px solid var(--color-border)',
                            boxShadow: '0 8px 32px rgba(15,23,42,0.12)',
                            overflow: 'hidden',
                        }}>
                            {/* Header del dropdown */}
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Bell size={14} style={{ color: 'var(--color-warning)' }} />
                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
                                        {notifs.length > 0 ? `${notifs.length} notificaciones` : 'Sin notificaciones'}
                                    </span>
                                </div>
                                {notifs.length > 0 && (
                                    <button onClick={() => setNotifs([])} style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                                        Limpiar todas
                                    </button>
                                )}
                            </div>

                            {/* Lista */}
                            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                                {notifs.length === 0 ? (
                                    <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>Todo en orden ✓</div>
                                    </div>
                                ) : notifs.map((n, idx) => {
                                    const Icon = n.nivel === 'danger' ? AlertCircle : AlertTriangle
                                    const col  = n.nivel === 'danger' ? 'var(--color-error)' : 'var(--color-warning)'
                                    return (
                                        <div key={n.id} style={{
                                            display: 'flex', alignItems: 'flex-start', gap: 10,
                                            padding: '10px 16px',
                                            borderBottom: idx < notifs.length - 1 ? '1px solid var(--color-border)' : 'none',
                                        }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <Icon size={14} style={{ color: col, marginTop: 2, flexShrink: 0 }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.4 }}>{n.titulo}</div>
                                                <div style={{ fontSize: 11.5, color: 'var(--color-muted)', marginTop: 1 }}>{n.desc}</div>
                                                <div style={{ fontSize: 10.5, color: 'var(--color-subtle)', marginTop: 3, fontFamily: '"Geist Mono", monospace' }}>{n.tiempo}</div>
                                            </div>
                                            <button onClick={() => setNotifs(ns => ns.filter(x => x.id !== n.id))} style={{ width: 20, height: 20, borderRadius: 4, border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                                <X size={11} strokeWidth={2} />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Usuario con dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setUserMenuAbierto(!userMenuAbierto)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer"
                        style={{
                            background: userMenuAbierto ? 'var(--color-surface-alt)' : 'transparent',
                            border: '1px solid transparent',
                            transition: 'background 150ms ease'
                        }}
                    >
                        <div className="grid place-items-center w-8 h-8 rounded-full text-xs font-semibold shrink-0" style={{
                            background: 'var(--color-primary)',
                            color: '#fff'
                        }}>
                            RM
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-medium leading-none mb-0.5" style={{ color: 'var(--color-text)' }}>Alexander</div>
                            <div className="text-xs leading-none" style={{ color: 'var(--color-muted)' }}>Propietario</div>
                        </div>
                        <ChevronDown size={14} strokeWidth={1.5} style={{
                            color: 'var(--color-subtle)',
                            transform: userMenuAbierto ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 150ms ease'
                        }} />
                    </button>

                    {userMenuAbierto && (
                        <div className="absolute right-0 mt-1 w-52 rounded-xl overflow-hidden z-50" style={{
                            background: 'var(--color-bg)',
                            border: '1px solid var(--color-border)',
                            boxShadow: '0 8px 24px rgba(15,23,42,0.10)',
                        }}>
                            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <div className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Alexander</div>
                                <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>alexander@orbita.com</div>
                            </div>

                            <div className="p-1">
                                {[
                                    { Icon: User, label: 'Mi perfil' },
                                ].map(({ Icon, label }) => (
                                    <button
                                        key={label}
                                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm cursor-pointer text-left"
                                        style={{ background: 'transparent', border: 'none', color: 'var(--color-body)' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-alt)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <Icon size={16} strokeWidth={1.5} />
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <div className="p-1" style={{ borderTop: '1px solid var(--color-border)' }}>
                                <button
                                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm cursor-pointer text-left"
                                    style={{ background: 'transparent', border: 'none', color: 'var(--color-error)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-error-bg)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <LogOut size={16} strokeWidth={1.5} />
                                    Cerrar sesión
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
