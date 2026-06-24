// Barra superior del panel de administración, con breadcrumb dinámico, buscador, acciones y menú de usuario.
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Bell, Moon, Sun, Search, LogOut, User, ChevronDown } from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'

// Mapa de sección (clave de URL) → label legible para el breadcrumb.
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

export default function Header() {
    {/* para usar el modo oscuro llamo al hook */ }
    const { isDark, toggle } = useDarkMode()
    const { query } = useRouter()
     {/* Leemos los segmentos de la URL para el breadcrumb:*/ }
    const seccion = (query.seccion as string) ?? ''
    const moduloPadre = (query.moduloPadre as string) ?? 'Gestión'
    const titulo = seccionLabels[seccion] ?? seccion

    const [userMenuAbierto, setUserMenuAbierto] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    {/* Cierra el menú si el usuario clickea fuera.*/ }
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setUserMenuAbierto(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="flex items-center h-16 px-8 shrink-0" style={{
            background: 'var(--color-bg)',
            borderBottom: '1px solid var(--color-border)'
        }}>

            {/* Breadcrumb: "ventas › Pedidos" — se actualiza solo al cambiar la URL */}
            <div className="flex items-center gap-2 text-sm">
                <span style={{ color: 'var(--color-muted)' }} className="capitalize">{moduloPadre}</span>
                <span style={{ color: 'var(--color-muted)' }}>›</span>
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>{titulo}</span>
            </div>

            <div className="flex-1" />

            {/* Acciones */}
            <div className="flex items-center gap-3">

                {/* Buscador global — sin lógica aún, placeholder funcional */}
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

                {/* Toggle dark mode — botón sin lógica aún, conectar a useDarkMode() */}
                <button
                    onClick={toggle}
                    aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                    className="grid place-items-center w-9 h-9 rounded-lg cursor-pointer"
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-body)',
                    }}
                >
                    {/* Muestra sol en dark mode, luna en light mode */}
                    {isDark
                        ? <Sun size={18} strokeWidth={1.5} />
                        : <Moon size={18} strokeWidth={1.5} />
                    }
                </button>

                 {/* Notificaciones — sin lógica aún */}
                <button className="grid place-items-center w-9 h-9 rounded-lg cursor-pointer" style={{
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-body)'
                }}>
                    <Bell size={18} strokeWidth={1.5} />
                </button>

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