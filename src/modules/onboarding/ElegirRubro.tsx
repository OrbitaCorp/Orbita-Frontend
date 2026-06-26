import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Check, ChevronRight, ChevronLeft,
  type LucideIcon,
  ShoppingBag, CalendarDays, UtensilsCrossed, Wrench, Plane, GraduationCap, PartyPopper,
  Scissors, Sparkles, Brain, Dumbbell, Camera, Coffee, Hospital,
  Scale, Briefcase, Car, PawPrint, Home, BookOpen, Wine, Hotel,
  Smile, Disc3,
} from 'lucide-react'
import { Skeleton } from '@/design-system/components/Skeleton'
import { OrbiChat } from '@/components/OrbiChat'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Categoria = 'tienda' | 'turnos' | 'gastro' | 'servicios' | 'turismo' | 'educacion' | 'eventos'
type Filtro    = 'todos' | Categoria

type Rubro = {
  key:        string
  Icon:       LucideIcon
  label:      string
  descripcion: string
  categoria:  Categoria
  disponible: boolean
  href?:      string
}

// ─── Datos ────────────────────────────────────────────────────────────────────

const FILTROS: { key: Filtro; label: string; Icon?: LucideIcon }[] = [
  { key: 'todos',     label: 'Todos'            },
  { key: 'tienda',    label: 'Tienda & Stock',   Icon: ShoppingBag    },
  { key: 'turnos',    label: 'Turnos & Agenda',  Icon: CalendarDays   },
  { key: 'gastro',    label: 'Gastronomía',      Icon: UtensilsCrossed},
  { key: 'servicios', label: 'Servicios',         Icon: Wrench         },
  { key: 'turismo',   label: 'Turismo',           Icon: Plane          },
  { key: 'educacion', label: 'Educación',         Icon: GraduationCap  },
  { key: 'eventos',   label: 'Eventos',           Icon: PartyPopper    },
]

const RUBROS: Rubro[] = [
  // ── Tienda & Stock ───────────────────────────────────────────────────────
  { key: 'tienda',       Icon: ShoppingBag,    label: 'Tienda Online',             descripcion: 'Catálogo, carrito y ventas online',          categoria: 'tienda',    disponible: true,  href: '/onboarding/tienda/setup' },

  // ── Turnos & Agenda ──────────────────────────────────────────────────────
  { key: 'barberia',     Icon: Scissors,       label: 'Barbería / Peluquería',     descripcion: 'Múltiples profesionales y agenda',            categoria: 'turnos',    disponible: true,  href: '/onboarding/turnos/setup' },
  { key: 'estetica',     Icon: Sparkles,       label: 'Estética / Spa',            descripcion: 'Cabinas y salas disponibles',                 categoria: 'turnos',    disponible: false },
  { key: 'clinica',      Icon: Hospital,       label: 'Clínica / Consultorio',     descripcion: 'Historias clínicas y turnos médicos',         categoria: 'turnos',    disponible: false },
  { key: 'odonto',       Icon: Smile,          label: 'Odontología',               descripcion: 'Tratamientos por etapas',                     categoria: 'turnos',    disponible: false },
  { key: 'psico',        Icon: Brain,          label: 'Psicología',                descripcion: 'Sesiones recurrentes fijas',                  categoria: 'turnos',    disponible: false },
  { key: 'gym',          Icon: Dumbbell,       label: 'Gimnasio / Personal Trainer',descripcion: 'Cupos por clase y membresías',               categoria: 'turnos',    disponible: false },
  { key: 'foto',         Icon: Camera,         label: 'Fotografía / Producción',   descripcion: 'Reservas por jornada completa',               categoria: 'turnos',    disponible: false },

  // ── Gastronomía ──────────────────────────────────────────────────────────
  { key: 'rotiseria',    Icon: UtensilsCrossed,label: 'Rotisería / Comidas',       descripcion: 'Menú del día, delivery y pedidos',            categoria: 'gastro',    disponible: false },
  { key: 'cafeteria',    Icon: Coffee,         label: 'Cafetería / Bar',           descripcion: 'Carta digital, pedidos y delivery',           categoria: 'gastro',    disponible: false },
  { key: 'restaurant',   Icon: UtensilsCrossed,label: 'Restaurante',               descripcion: 'Reservas de mesa, menú y pedidos',            categoria: 'gastro',    disponible: false },

  // ── Servicios ────────────────────────────────────────────────────────────
  { key: 'juridico',     Icon: Scale,          label: 'Estudio Jurídico',          descripcion: 'Gestión de clientes y casos legales',         categoria: 'servicios', disponible: false },
  { key: 'coaching',     Icon: Briefcase,      label: 'Consultoría / Coaching',    descripcion: 'Reuniones online y presenciales',             categoria: 'servicios', disponible: false },
  { key: 'taller',       Icon: Car,            label: 'Taller Mecánico',           descripcion: 'Registro de vehículos por cliente',           categoria: 'servicios', disponible: false },
  { key: 'gomeria',      Icon: Disc3,          label: 'Gomería',                   descripcion: 'Atención rápida y alta rotación',             categoria: 'servicios', disponible: false },
  { key: 'vet',          Icon: PawPrint,       label: 'Veterinaria',               descripcion: 'Múltiples mascotas por cliente',              categoria: 'servicios', disponible: false },
  { key: 'inmobiliaria', Icon: Home,           label: 'Inmobiliaria',              descripcion: 'Propiedades, clientes e inquilinos',          categoria: 'servicios', disponible: false },

  // ── Turismo ──────────────────────────────────────────────────────────────
  { key: 'turismo',      Icon: Plane,          label: 'Turismo / Excursiones',     descripcion: 'Paquetes, pasajes y reservas',                categoria: 'turismo',   disponible: false },
  { key: 'hospedaje',    Icon: Hotel,          label: 'Hotel / Hospedaje',         descripcion: 'Habitaciones, check-in y reservas',           categoria: 'turismo',   disponible: false },

  // ── Educación ────────────────────────────────────────────────────────────
  { key: 'academia',     Icon: GraduationCap,  label: 'Academia / Escuela',        descripcion: 'Clases, cupos y seguimiento de alumnos',      categoria: 'educacion', disponible: false },
  { key: 'clases',       Icon: BookOpen,       label: 'Clases Particulares',       descripcion: 'Agenda de clases y seguimiento',              categoria: 'educacion', disponible: false },

  // ── Eventos ──────────────────────────────────────────────────────────────
  { key: 'boliche',      Icon: PartyPopper,    label: 'Boliche / Eventos',         descripcion: 'Entradas, lista VIP y reservas de mesa',      categoria: 'eventos',   disponible: false },
  { key: 'catering',     Icon: Wine,           label: 'Catering',                  descripcion: 'Presupuestos, fechas y menú personalizado',   categoria: 'eventos',   disponible: false },
]

const PASOS = ['Rubro', 'Negocio', 'Listo']

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{
      padding: 14, borderRadius: 14,
      border: '1.5px solid var(--color-border)',
      background: 'var(--color-surface)',
    }}>
      <Skeleton width={40} height={40} radius={10} style={{ display: 'block', marginBottom: 10 }} />
      <Skeleton width="60%" height={13} radius={4}  style={{ display: 'block', marginBottom: 6  }} />
      <Skeleton width="90%" height={11} radius={4}  style={{ display: 'block', marginBottom: 3  }} />
      <Skeleton width="75%" height={11} radius={4}  style={{ display: 'block', marginBottom: 10 }} />
      <Skeleton width={72}  height={11} radius={10} style={{ display: 'block' }} />
    </div>
  )
}

// ─── Logo SVG inline ─────────────────────────────────────────────────────────

function OrbitaLogo({ size = 24 }: { size?: number }) {
  const s = size / 30
  return (
    <svg viewBox="0 0 30 30" fill="none" style={{ width: size, height: size, flexShrink: 0 }}>
      <circle cx="15" cy="15" r="13" stroke="#2563eb" strokeWidth="3.2" strokeDasharray="60 22" strokeLinecap="round"/>
      <circle cx="25.5" cy="7.5" r={4 * s * (30 / size)} fill="#93c5fd"/>
      <circle cx="15" cy="15" r={4.5 * s * (30 / size)} fill="#1e3a8a"/>
    </svg>
  )
}

// ─── ElegirRubro ─────────────────────────────────────────────────────────────

export function ElegirRubro() {
  const router = useRouter()

  const [filtro,         setFiltro]         = useState<Filtro>('todos')
  const [seleccionado,   setSeleccionado]   = useState<string>('')
  const [orbiAbierto,    setOrbiAbierto]    = useState(false)
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [cargando,       setCargando]       = useState(true)

  useEffect(() => {
    const t1 = setTimeout(() => setCargando(false),       750)
    const t2 = setTimeout(() => setTooltipVisible(true), 3500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const visibles = (filtro === 'todos' ? RUBROS : RUBROS.filter(r => r.categoria === filtro))
    .slice()
    .sort((a, b) => Number(b.disponible) - Number(a.disponible))

  function elegirRubro(r: Rubro) {
    if (!r.disponible) return
    setSeleccionado(prev => prev === r.key ? '' : r.key)
  }

  function continuar() {
    const rubro = RUBROS.find(r => r.key === seleccionado)
    router.push(rubro?.href ?? '/onboarding/proximamente')
  }

  const rubroSelec = RUBROS.find(r => r.key === seleccionado)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>

      {/* ── Header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', height: 56, padding: '0 28px',
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <OrbitaLogo size={24} />
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Órbita</span>
        </a>

        {/* Stepper */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {PASOS.map((paso, i) => (
            <div key={paso} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  background: i === 0 ? '#2563EB' : 'var(--color-surface-alt)',
                  color: i === 0 ? 'white' : 'var(--color-subtle)',
                }}>
                  {i + 1}
                </div>
                <span className="ob-step-label" style={{
                  fontSize: 13, fontWeight: 600,
                  color: i === 0 ? 'var(--color-text)' : 'var(--color-subtle)',
                }}>
                  {paso}
                </span>
              </div>
              {i < PASOS.length - 1 && (
                <div style={{ width: 24, height: 1, background: 'var(--color-border)' }} />
              )}
            </div>
          ))}
        </div>

        <a href="/login" className="ob-login-link" style={{ marginLeft: 'auto', textDecoration: 'none', fontSize: 13, color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
          ¿Ya tenés cuenta?{' '}
          <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Iniciá sesión</span>
        </a>
      </div>

      {/* ── Contenido ── */}
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: `0 24px ${seleccionado ? '104px' : '48px'}`,
      }}>

        {/* Atrás */}
        <div style={{ paddingTop: 28, marginBottom: 4 }}>
          <a
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              textDecoration: 'none', fontSize: 13, fontWeight: 600,
              color: 'var(--color-muted)', transition: 'color 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
          >
            <ChevronLeft size={15} />
            Atrás
          </a>
        </div>

        {/* Título */}
        <div style={{ textAlign: 'center', paddingTop: 20, marginBottom: 32 }}>
          <h1 className="ob-rubro-h1" style={{
            fontSize: 30, fontWeight: 800, letterSpacing: '-0.025em',
            color: 'var(--color-text)', margin: '0 0 8px',
          }}>
            ¿Qué tipo de negocio tenés?
          </h1>
          <p style={{ fontSize: 15, color: 'var(--color-muted)', margin: 0 }}>
            Elegí el rubro principal de tu negocio.
          </p>
        </div>

        {/* ── Filtros ── */}
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto',
          paddingBottom: 4, marginBottom: 28,
          scrollbarWidth: 'none',
        }}>
          {FILTROS.map(({ key, label, Icon: FIcon }) => {
            const activo = filtro === key
            return (
              <button
                key={key}
                onClick={() => setFiltro(key)}
                style={{
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 15px',
                  borderRadius: 999,
                  border: activo ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  background: activo ? 'var(--color-primary-bg)' : 'var(--color-surface)',
                  color: activo ? 'var(--color-primary)' : 'var(--color-body)',
                  fontSize: 13, fontWeight: activo ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                  whiteSpace: 'nowrap',
                }}
              >
                {FIcon && <FIcon size={13} strokeWidth={1.75} />}
                {label}
              </button>
            )
          })}
        </div>

        {/* ── Grid de rubros ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 10,
        }}>
          {cargando
            ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
            : visibles.map(rubro => {
            const { key, Icon, label, descripcion, disponible } = rubro
            const sel = seleccionado === key

            return (
              <button
                key={key}
                onClick={() => elegirRubro(rubro)}
                style={{
                  position: 'relative',
                  textAlign: 'left',
                  padding: '14px',
                  borderRadius: 14,
                  border: sel
                    ? '2px solid var(--color-primary)'
                    : '1.5px solid var(--color-border)',
                  background: sel
                    ? 'rgba(59,130,246,0.05)'
                    : (disponible ? 'var(--color-bg)' : 'var(--color-surface)'),
                  cursor: disponible ? 'pointer' : 'default',
                  transition: 'all 150ms ease',
                  boxShadow: sel ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
                  opacity: disponible ? 1 : 0.6,
                }}
                onMouseEnter={e => {
                  if (disponible && !sel) {
                    e.currentTarget.style.borderColor = 'var(--color-primary)'
                    e.currentTarget.style.transform   = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow   = '0 4px 16px rgba(59,130,246,0.1)'
                  }
                }}
                onMouseLeave={e => {
                  if (!sel) {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                    e.currentTarget.style.transform   = 'translateY(0)'
                    e.currentTarget.style.boxShadow   = 'none'
                  }
                }}
              >
                {sel && (
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Check size={10} color="white" strokeWidth={3} />
                  </div>
                )}

                <div style={{
                  width: 40, height: 40, borderRadius: 10, marginBottom: 10,
                  background: disponible
                    ? (sel ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.07)')
                    : 'rgba(100,116,139,0.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon
                    size={20}
                    strokeWidth={1.75}
                    color={disponible ? (sel ? 'var(--color-primary)' : '#3B82F6') : 'var(--color-muted)'}
                  />
                </div>

                <div style={{
                  fontSize: 13, fontWeight: 600, marginBottom: 3,
                  color: disponible ? 'var(--color-text)' : 'var(--color-muted)',
                }}>
                  {label}
                </div>

                <div style={{
                  fontSize: 11, lineHeight: 1.45, marginBottom: 10,
                  color: 'var(--color-muted)',
                }}>
                  {descripcion}
                </div>

                {disponible ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981' }}>Disponible</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-subtle)' }}>
                    <span style={{ fontSize: 10 }}>✦</span>
                    <span style={{ fontSize: 11 }}>Próximamente</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Barra de continuar ── */}
      {seleccionado && (
        <div className="ob-bottom-bar" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '14px 32px',
          background: 'var(--color-bg)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.07)',
          animation: 'fadeUp 0.3s ease forwards',
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {rubroSelec && <rubroSelec.Icon size={18} strokeWidth={1.75} color="var(--color-primary)" />}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 1 }}>
                {rubroSelec?.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                Rubro principal seleccionado
              </div>
            </div>
          </div>
          <button
            onClick={continuar}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 22px',
              borderRadius: 10, border: 'none',
              background: '#2563EB', color: 'white',
              fontSize: 14, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
              transition: 'background 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1D4ED8' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#2563EB' }}
          >
            Continuar <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* ── Orbi ── */}
      <OrbiChat
        abierto={orbiAbierto}
        tooltipVisible={tooltipVisible}
        conBarra={!!seleccionado}
        onToggle={() => setOrbiAbierto(p => !p)}
        mensaje="¿Todavía eligiendo tu rubro? Decime qué tipo de negocio tenés y te muestro las opciones perfectas."
        quickActions={[
          { label: 'Vendo productos',      onClick: () => { setFiltro('tienda');    setOrbiAbierto(false) } },
          { label: 'Doy turnos / agenda',  onClick: () => { setFiltro('turnos');    setOrbiAbierto(false) } },
          { label: 'Tengo un restaurante', onClick: () => { setFiltro('gastro');    setOrbiAbierto(false) } },
          { label: 'Otro tipo de negocio', onClick: () => { setFiltro('servicios'); setOrbiAbierto(false) } },
        ]}
      />
    </div>
  )
}
