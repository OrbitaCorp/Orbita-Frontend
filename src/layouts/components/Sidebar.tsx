import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Home, ShoppingBag, Package, Users, Store, BarChart2, CreditCard, ChevronDown, Settings, HelpCircle, Tag, Percent, Truck, MessageSquare  } from 'lucide-react'

export default function Sidebar() {
    const { query } = useRouter()
    const negocioId = (query.negocioId as string) ?? 'rama-tienda'
    const seccionActiva = (query.seccion as string) ?? ''

     // Ítems del menú principal — cada href usa negocioId dinámico para construir la ruta correcta
    const navItems = [
    { label: 'Pedidos',    Icon: ShoppingBag,   href: `/admin/${negocioId}/ventas/pedidos` },
    { label: 'Catálogo',   Icon: Package,       href: `/admin/${negocioId}/ventas/catalogo` },
    { label: 'Clientes',   Icon: Users,         href: `/admin/${negocioId}/ventas/clientes` },
    { label: 'Reportes',   Icon: BarChart2,     href: `/admin/${negocioId}/ventas/reportes` },
    { label: 'POS',        Icon: CreditCard,    href: `/admin/${negocioId}/ventas/pos` },
    { label: 'Inventario', Icon: Truck,         href: `/admin/${negocioId}/ventas/inventario` },
    { label: 'Descuentos', Icon: Tag,           href: `/admin/${negocioId}/ventas/descuentos` },
    { label: 'Mensajes',   Icon: MessageSquare, href: `/admin/${negocioId}/ventas/mensajes` },
]

    const cuentaItems = [
        { label: 'Configuración', Icon: Settings,   href: `/admin/${negocioId}/ventas/configuracion` },
        { label: 'Soporte',       Icon: HelpCircle, href: '#' },
    ]

    const [dropdownAbierto, setDropdownAbierto] = useState(false)
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
    const [montado, setMontado] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => { setMontado(true) }, [])

    // Listener global: si el click no fue dentro del dropdown ni del botón, cerrar el dropdown
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(e.target as Node)
            ) {
                setDropdownAbierto(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    function abrirDropdown() {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
        }
        setDropdownAbierto(prev => !prev)
    }


    // Compara el final del href con la sección activa de la URL.
    function esActivo(href: string) {
        return href.endsWith(seccionActiva) && seccionActiva !== ''
    }

    // Estilos del item activo según design system de Orbita:  fondo azul claro + texto azul + borde izquierdo azul
    function itemStyle(activo: boolean) {
        return {
            color: activo ? 'var(--color-primary-h)' : 'var(--color-body)',
            background: activo ? 'var(--color-primary-bg)' : 'transparent',
            borderLeft: `3px solid ${activo ? 'var(--color-primary)' : 'transparent'}`,
        }
    }

    return (
        <aside className="flex flex-col w-60 shrink-0 h-full" style={{
            background: 'var(--color-bg)',
            borderRight: '1px solid var(--color-border)'
        }}>

            {/* Logo fijo en la parte superior */}
            <div className="flex items-center gap-2.5 h-16 px-5 shrink-0" style={{
                borderBottom: '1px solid var(--color-border)'
            }}>
                <img src="/logo.svg" alt="Orbita" width={28} height={28} />
                <span className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Orbita</span>
            </div>

            {/* /* Selector de negocio activo con dropdown */}
            <div className="mx-3 mt-3 mb-2 shrink-0">
                <button
                    ref={buttonRef}
                    onClick={abrirDropdown}
                    className="flex items-center gap-2.5 w-full p-2 rounded-lg cursor-pointer"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                    <div className="grid place-items-center w-6 h-6 rounded-md text-xs font-semibold shrink-0" style={{
                        background: 'var(--color-text)',
                        color: 'var(--color-bg)'
                    }}>
                        RT
                    </div>
                    <div className="flex-1 text-left">
                        <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Rama Tienda</div>
                        <div className="text-xs" style={{ color: 'var(--color-subtle)' }}>Plan Negocio</div>
                    </div>
                    <ChevronDown size={14} strokeWidth={1.5} style={{
                        color: 'var(--color-subtle)',
                        transform: dropdownAbierto ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 150ms ease'
                    }} />
                </button>
            </div>

            {/* Dropdown via portal */}
            {montado && dropdownAbierto && createPortal(
                <div ref={dropdownRef} style={{
                    position: 'fixed',
                    top: dropdownPos.top,
                    left: dropdownPos.left,
                    width: dropdownPos.width,
                    zIndex: 9999,
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(15,23,42,0.10)',
                    overflow: 'hidden'
                }}>
                    {['Rama Turnos'].map(negocio => (
                        <button
                            key={negocio}
                            onClick={() => setDropdownAbierto(false)}
                            className="w-full px-3 py-2.5 text-left text-sm cursor-pointer"
                            style={{ background: 'transparent', border: 'none', color: 'var(--color-body)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-alt)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            {negocio}
                        </button>
                    ))}
                </div>,
                document.body
            )}

            {/* Navegacion */}
            <nav className="flex-1 overflow-y-auto p-2">

                <div className="text-xs font-semibold px-3 pt-2 pb-1 uppercase tracking-wider" style={{ color: 'var(--color-subtle)' }}>
                    Gestión
                </div>

                {/* Inicio */}
                <Link
                    href={`/admin/${negocioId}/ventas/dashboard`}
                    className="flex items-center gap-2.5 px-3 py-2 mb-0.5 rounded-md text-sm font-medium no-underline"
                    style={itemStyle(seccionActiva === 'dashboard')}
                >
                    <Home size={18} strokeWidth={1.5} />
                    Inicio
                </Link>

                {navItems.map(({ label, Icon, href }) => (
                    <Link
                        key={label}
                        href={href}
                        className="flex items-center gap-2.5 px-3 py-2 mb-0.5 rounded-md text-sm no-underline"
                        style={itemStyle(esActivo(href))}
                        onMouseEnter={e => {
                            if (!esActivo(href)) e.currentTarget.style.background = 'var(--color-surface-alt)'
                        }}
                        onMouseLeave={e => {
                            if (!esActivo(href)) e.currentTarget.style.background = 'transparent'
                        }}
                    >
                        <Icon size={18} strokeWidth={1.5} />
                        {label}
                    </Link>
                ))}

                <div className="text-xs font-semibold px-3 pt-4 pb-1 uppercase tracking-wider" style={{ color: 'var(--color-subtle)' }}>
                    Cuenta
                </div>

                {cuentaItems.map(({ label, Icon, href }) => (
                    <Link
                        key={label}
                        href={href}
                        className="flex items-center gap-2.5 px-3 py-2 mb-0.5 rounded-md text-sm no-underline"
                        style={itemStyle(esActivo(href))}
                        onMouseEnter={e => {
                            if (!esActivo(href)) e.currentTarget.style.background = 'var(--color-surface-alt)'
                        }}
                        onMouseLeave={e => {
                            if (!esActivo(href)) e.currentTarget.style.background = 'transparent'
                        }}
                    >
                        <Icon size={18} strokeWidth={1.5} />
                        {label}
                    </Link>
                ))}
            </nav>

        </aside>
    )
}