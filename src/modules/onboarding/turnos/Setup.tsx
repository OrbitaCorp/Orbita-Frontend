import { useState, Fragment, useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode, Dispatch, SetStateAction } from 'react'
import { useRouter } from 'next/router'
import {
  Check, ChevronLeft, ChevronRight,
  type LucideIcon,
  Scissors, Feather, Palette, Sparkles, Plus,
  Banknote, Landmark, QrCode, CreditCard,
  User, Users, UsersRound, Building2,
  Camera, Info,
} from 'lucide-react'
import { Skeleton } from '@/design-system/components/Skeleton'
import { OrbiChat } from '@/components/OrbiChat'
import { MapPicker } from '@/components/MapPicker'

// ─── Types ────────────────────────────────────────────────────────────────────

type Negocio = {
  nombre:      string
  descripcion: string
  email:       string
  telefono:    string
  direccion:   string
  logo:        string
  latLng:      [number, number]
  subdominio:  string
}

const BA: [number, number] = [-34.6037, -58.3816]

// ─── Data ─────────────────────────────────────────────────────────────────────

const SERVICIOS: { key: string; Icon: LucideIcon; label: string; descripcion: string }[] = [
  { key: 'corte',       Icon: Scissors, label: 'Corte de cabello',    descripcion: 'Damas, caballeros y niños'   },
  { key: 'barba',       Icon: Feather,  label: 'Barba / Afeitado',    descripcion: 'Arreglo y diseño de barba'   },
  { key: 'coloracion',  Icon: Palette,  label: 'Coloración',          descripcion: 'Tinte, mechas y balayage'    },
  { key: 'tratamiento', Icon: Sparkles, label: 'Tratamiento capilar', descripcion: 'Hidratación, keratina y más' },
  { key: 'otro',        Icon: Plus,     label: 'Otro servicio',       descripcion: 'Configurá desde cero'        },
]

const METODOS: { key: string; Icon: LucideIcon; label: string; desc: string }[] = [
  { key: 'efectivo',      Icon: Banknote,   label: 'Efectivo',         desc: 'Pagos en mano al momento del turno' },
  { key: 'transferencia', Icon: Landmark,   label: 'Transferencia',    desc: 'CBU/CVU o alias de cuenta bancaria' },
  { key: 'mercadopago',   Icon: QrCode,     label: 'MercadoPago / QR', desc: 'Código QR o link de pago'          },
  { key: 'tarjeta',       Icon: CreditCard, label: 'Tarjeta',          desc: 'Débito y crédito con o sin cuotas' },
]

const TAMANOS: { key: string; Icon: LucideIcon; label: string; desc: string }[] = [
  { key: 'solo',   Icon: User,       label: 'Solo/a yo',       desc: 'Trabajo de forma independiente'       },
  { key: 'mini',   Icon: Users,      label: '2 a 3 personas',  desc: 'Pequeño equipo de profesionales'      },
  { key: 'medio',  Icon: UsersRound, label: '4 a 10 personas', desc: 'Equipo con varios boxes o cabinas'    },
  { key: 'grande', Icon: Building2,  label: 'Más de 10',       desc: 'Salón o clínica de gran escala'       },
]

const PASOS_INTERNOS = ['Tus servicios', 'Tu negocio', 'Métodos de pago', 'Tu equipo']
const PASOS_GLOBALES = ['Rubro', 'Configuración', 'Listo']

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

function OrbitaLogo({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 30 30" fill="none" style={{ width: size, height: size, flexShrink: 0 }}>
      <circle cx="15" cy="15" r="13" stroke="#2563eb" strokeWidth="3.2" strokeDasharray="60 22" strokeLinecap="round"/>
      <circle cx="25.5" cy="7.5" r="4" fill="#93c5fd"/>
      <circle cx="15" cy="15" r="4.5" fill="#1e3a8a"/>
    </svg>
  )
}

const inputBase: CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1.5px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 150ms',
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>
        {label}
        {required && <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      onFocus={e => { e.target.style.borderColor = 'var(--color-primary)' }}
      onBlur={e  => { e.target.style.borderColor = 'var(--color-border)'  }}
      style={inputBase}
    />
  )
}

function Textarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      rows={3}
      onChange={e => onChange(e.target.value)}
      onFocus={e => { e.target.style.borderColor = 'var(--color-primary)' }}
      onBlur={e  => { e.target.style.borderColor = 'var(--color-border)'  }}
      style={{ ...inputBase, resize: 'vertical' }}
    />
  )
}

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

function SkeletonTitle({ w1, w2 }: { w1: number | string; w2: number | string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 28 }}>
      <Skeleton width={w1} height={28} radius={6} style={{ display: 'block', margin: '0 auto 8px' }} />
      <Skeleton width={w2} height={14} radius={4} style={{ display: 'block', margin: '0 auto'    }} />
    </div>
  )
}

function SkeletonField({ labelWidth, inputHeight = 42 }: { labelWidth: number; inputHeight?: number }) {
  return (
    <div>
      <Skeleton width={labelWidth} height={13} radius={4}  style={{ display: 'block', marginBottom: 6 }} />
      <Skeleton width="100%"       height={inputHeight} radius={10} style={{ display: 'block' }} />
    </div>
  )
}

function SkeletonStepServicios() {
  return (
    <div>
      <SkeletonTitle w1={260} w2={340} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 10 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ padding: '13px 13px 12px', borderRadius: 14, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)' }}>
            <Skeleton width={38} height={38} radius={10} style={{ display: 'block', marginBottom: 9 }} />
            <Skeleton width="55%" height={13} radius={4}  style={{ display: 'block', marginBottom: 4 }} />
            <Skeleton width="85%" height={11} radius={4}  style={{ display: 'block' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function SkeletonStepNegocio() {
  return (
    <div style={{ maxWidth: 540, margin: '0 auto' }}>
      <SkeletonTitle w1={240} w2={300} />
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <Skeleton width={100} height={100} radius={50} style={{ display: 'block' }} />
      </div>
      <Skeleton width="100%" height={50} radius={10} style={{ display: 'block', marginBottom: 16 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SkeletonField labelWidth={140} />
        <SkeletonField labelWidth={90} inputHeight={80} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <SkeletonField labelWidth={110} />
          <SkeletonField labelWidth={75}  />
        </div>
        <div>
          <Skeleton width={160} height={13} radius={4}  style={{ display: 'block', marginBottom: 6 }} />
          <Skeleton width="100%" height={288} radius={12} style={{ display: 'block' }} />
        </div>
      </div>
    </div>
  )
}

function SkeletonStepPagos() {
  return (
    <div style={{ maxWidth: 540, margin: '0 auto' }}>
      <SkeletonTitle w1={210} w2={340} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ padding: '20px 18px 18px', borderRadius: 14, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)' }}>
            <Skeleton width={34} height={34} radius={8}  style={{ display: 'block', marginBottom: 12 }} />
            <Skeleton width="55%" height={16} radius={4}  style={{ display: 'block', marginBottom: 6  }} />
            <Skeleton width="80%" height={12} radius={4}  style={{ display: 'block' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function SkeletonStepEquipo() {
  return (
    <div style={{ maxWidth: 540, margin: '0 auto' }}>
      <SkeletonTitle w1={220} w2={300} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ padding: '20px 18px 18px', borderRadius: 14, border: '1.5px solid var(--color-border)', background: 'var(--color-surface)' }}>
            <Skeleton width={34} height={34} radius={8}  style={{ display: 'block', marginBottom: 12 }} />
            <Skeleton width="65%" height={16} radius={4}  style={{ display: 'block', marginBottom: 6  }} />
            <Skeleton width="85%" height={12} radius={4}  style={{ display: 'block' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function SkeletonPaso({ paso }: { paso: number }) {
  if (paso === 0) return <SkeletonStepServicios />
  if (paso === 1) return <SkeletonStepNegocio   />
  if (paso === 2) return <SkeletonStepPagos      />
  return                  <SkeletonStepEquipo     />
}

// ─── Step 0 — Tus servicios ───────────────────────────────────────────────────

function StepServicios({ servicios, toggleServicio }: { servicios: string[]; toggleServicio: (k: string) => void }) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 6px' }}>
          ¿Qué servicios ofrecés?
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: 0 }}>
          Podés elegir varios. Los configuramos para que se adapten a tu negocio.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 10 }}>
        {SERVICIOS.map(s => {
          const sel = servicios.includes(s.key)
          return (
            <button
              key={s.key}
              onClick={() => toggleServicio(s.key)}
              style={{
                position: 'relative', textAlign: 'left',
                padding: '13px 13px 12px',
                borderRadius: 14,
                border:      `2px solid ${sel ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background:  sel ? 'rgba(59,130,246,0.05)' : 'var(--color-bg)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: sel ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
              }}
              onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--color-primary)' }}
              onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--color-border)'  }}
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
                width: 38, height: 38, borderRadius: 10, marginBottom: 9,
                background: sel ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <s.Icon size={19} strokeWidth={1.75} color={sel ? 'var(--color-primary)' : '#3B82F6'} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.4 }}>{s.descripcion}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 1 — Tu negocio ──────────────────────────────────────────────────────

const SUBDOMINIOS_OCUPADOS = ['orbita', 'admin', 'app', 'tienda', 'test', 'demo', 'api', 'shop', 'store', 'mail']

type EstadoSub = 'idle' | 'checking' | 'disponible' | 'ocupado'

function StepNegocio({ negocio, setNegocio }: { negocio: Negocio; setNegocio: Dispatch<SetStateAction<Negocio>> }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [buscando,    setBuscando]    = useState(false)
  const [buscarInput, setBuscarInput] = useState(negocio.direccion)
  const [estadoSub,   setEstadoSub]   = useState<EstadoSub>('idle')

  useEffect(() => {
    const sub = negocio.subdominio.trim()
    if (!sub) { setEstadoSub('idle'); return }
    setEstadoSub('checking')
    const t = setTimeout(() => {
      setEstadoSub(SUBDOMINIOS_OCUPADOS.includes(sub) ? 'ocupado' : 'disponible')
    }, 700)
    return () => clearTimeout(t)
  }, [negocio.subdominio])

  const set = (k: 'nombre' | 'descripcion' | 'email' | 'telefono') => (v: string) =>
    setNegocio(prev => ({ ...prev, [k]: v }))

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setNegocio(prev => ({ ...prev, logo: reader.result as string }))
    reader.readAsDataURL(file)
  }

  async function geocodificar() {
    const q = buscarInput.trim()
    if (!q) return
    setBuscando(true)
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=ar&limit=1`)
      const data = await res.json()
      const hit  = data[0]
      if (hit) {
        setNegocio(prev => ({ ...prev, latLng: [+hit.lat, +hit.lon], direccion: hit.display_name }))
        setBuscarInput(hit.display_name)
      }
    } finally { setBuscando(false) }
  }

  function handleDragEnd(latLng: [number, number]) {
    setNegocio(prev => ({ ...prev, latLng }))
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latLng[0]}&lon=${latLng[1]}`)
      .then(r => r.json())
      .then(d => {
        if (d.display_name) {
          setNegocio(prev => ({ ...prev, direccion: d.display_name }))
          setBuscarInput(d.display_name)
        }
      })
      .catch(() => {})
  }

  return (
    <div style={{ maxWidth: 540, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 6px' }}>
          Contanos sobre tu negocio
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: 0 }}>
          Esta información aparecerá en tu perfil y en los turnos.
        </p>
      </div>

      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} style={{ display: 'none' }} />
        <button
          onClick={() => fileRef.current?.click()}
          title="Agregar logo"
          style={{
            width: 100, height: 100, borderRadius: '50%',
            border: '2px dashed var(--color-border)',
            background: 'var(--color-surface)',
            cursor: 'pointer', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 5,
            transition: 'border-color 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'  }}
        >
          {negocio.logo
            ? <img src={negocio.logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <>
                <Camera size={22} color="var(--color-muted)" strokeWidth={1.5} />
                <span style={{ fontSize: 10, color: 'var(--color-muted)', textAlign: 'center', lineHeight: 1.35 }}>
                  Agregar LOGO<br />(opcional)
                </span>
              </>
          }
        </button>
      </div>

      {/* Nota medios de contacto */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'flex-start',
        background: 'rgba(59,130,246,0.06)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 10, padding: '10px 14px',
        fontSize: 12, color: 'var(--color-body)',
        marginBottom: 20,
      }}>
        <Info size={15} color="var(--color-primary)" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          El <strong>email</strong> y el <strong>teléfono</strong> son tus medios de contacto públicos —
          tus clientes los van a usar para comunicarse con vos.
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Nombre del negocio" required>
          <Input value={negocio.nombre} onChange={set('nombre')} placeholder="Ej: Barbería Don Carlos" />
        </Field>
        <Field label="Descripción">
          <Textarea value={negocio.descripcion} onChange={set('descripcion')} placeholder="Breve descripción de tu negocio..." />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Email de contacto" required>
            <Input type="email" value={negocio.email} onChange={set('email')} placeholder="hola@minegocio.com" />
          </Field>
          <Field label="Teléfono" required>
            <Input type="tel" value={negocio.telefono} onChange={set('telefono')} placeholder="+54 11 1234-5678" />
          </Field>
        </div>

        {/* Subdominio */}
        <Field label="Subdominio de tu negocio">
          <div style={{
            display: 'flex', alignItems: 'center',
            border: `1.5px solid ${
              estadoSub === 'disponible' ? 'var(--color-success)' :
              estadoSub === 'ocupado'    ? 'var(--color-error)'   :
              estadoSub === 'checking'   ? 'var(--color-primary)' :
              'var(--color-border)'
            }`,
            borderRadius: 10,
            background: 'var(--color-surface)', overflow: 'hidden',
            transition: 'border-color 200ms',
          }}>
            <input
              value={negocio.subdominio}
              onChange={e => setNegocio(prev => ({
                ...prev,
                subdominio: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
              }))}
              placeholder="mi-negocio"
              style={{ ...inputBase, border: 'none', background: 'transparent', borderRadius: 0, flex: 1, outline: 'none' }}
            />
            <span style={{
              paddingRight: 14, flexShrink: 0,
              fontSize: 13, fontWeight: 500,
              color: 'var(--color-muted)',
              whiteSpace: 'nowrap',
            }}>
              .orbita.site
            </span>
            {estadoSub === 'checking' && (
              <span style={{
                width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginRight: 12,
                border: '2px solid var(--color-primary)', borderTopColor: 'transparent',
                display: 'inline-block',
                animation: 'spin 600ms linear infinite',
              }} />
            )}
            {estadoSub === 'disponible' && (
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-success)', marginRight: 12, flexShrink: 0, whiteSpace: 'nowrap' }}>
                ✓ Disponible
              </span>
            )}
            {estadoSub === 'ocupado' && (
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-error)', marginRight: 12, flexShrink: 0, whiteSpace: 'nowrap' }}>
                ✗ No disponible
              </span>
            )}
          </div>
          <p style={{ fontSize: 11, color: 'var(--color-muted)', margin: '5px 0 0' }}>
            Una vez activo tu espacio, podés conectar un dominio propio como <strong>tunegocio.com.ar</strong>.
          </p>
        </Field>

        {/* Ubicación con mapa */}
        <Field label="Ubicación de tu negocio">
          <div style={{ border: '1.5px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
              <input
                value={buscarInput}
                onChange={e => setBuscarInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); geocodificar() } }}
                placeholder="Buscá tu dirección..."
                style={{ ...inputBase, border: 'none', borderRadius: 0, flex: 1, outline: 'none' }}
              />
              <button
                onClick={geocodificar}
                disabled={buscando}
                style={{
                  padding: '0 16px', flexShrink: 0,
                  background: 'var(--color-primary)', color: 'white',
                  border: 'none', cursor: buscando ? 'default' : 'pointer',
                  fontWeight: 600, fontSize: 13, opacity: buscando ? 0.7 : 1,
                  transition: 'opacity 150ms',
                }}
              >
                {buscando ? '…' : 'Buscar'}
              </button>
            </div>
            <MapPicker center={negocio.latLng} onDragEnd={handleDragEnd} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--color-muted)', margin: '5px 0 0' }}>
            Arrastrá el marcador para ajustar la ubicación exacta. Usá los botones + / − del mapa para hacer zoom.
          </p>
        </Field>
      </div>
    </div>
  )
}

// ─── Step 2 — Métodos de pago ─────────────────────────────────────────────────

function StepPagos({ pagos, setPagos }: { pagos: string[]; setPagos: Dispatch<SetStateAction<string[]>> }) {
  function toggle(key: string) {
    setPagos(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }
  return (
    <div style={{ maxWidth: 540, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 6px' }}>
          ¿Cómo aceptás pagos?
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: 0 }}>
          Podés seleccionar todos los que usás. Se puede cambiar después.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {METODOS.map(m => {
          const sel = pagos.includes(m.key)
          return (
            <button
              key={m.key}
              onClick={() => toggle(m.key)}
              style={{
                position: 'relative', textAlign: 'left',
                padding: '20px 18px 18px',
                borderRadius: 14,
                border:      `2px solid ${sel ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background:  sel ? 'rgba(59,130,246,0.05)' : 'var(--color-bg)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: sel ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
              }}
              onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--color-primary)' }}
              onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--color-border)'  }}
            >
              {sel && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={10} color="white" strokeWidth={3} />
                </div>
              )}
              <div style={{
                width: 40, height: 40, borderRadius: 10, marginBottom: 12,
                background: sel ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <m.Icon size={20} strokeWidth={1.75} color={sel ? 'var(--color-primary)' : '#3B82F6'} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.45 }}>{m.desc}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 3 — Tu equipo ───────────────────────────────────────────────────────

function StepEquipo({ tamano, setTamano }: { tamano: string; setTamano: (k: string) => void }) {
  return (
    <div style={{ maxWidth: 540, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 6px' }}>
          ¿Cómo es tu equipo?
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: 0 }}>
          No es obligatorio — podés configurarlo después desde tu panel.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {TAMANOS.map(t => {
          const sel = tamano === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTamano(t.key)}
              style={{
                position: 'relative', textAlign: 'left',
                padding: '20px 18px 18px',
                borderRadius: 14,
                border:      `2px solid ${sel ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background:  sel ? 'rgba(59,130,246,0.05)' : 'var(--color-bg)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: sel ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
              }}
              onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--color-primary)' }}
              onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--color-border)'  }}
            >
              {sel && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={10} color="white" strokeWidth={3} />
                </div>
              )}
              <div style={{
                width: 40, height: 40, borderRadius: 10, marginBottom: 12,
                background: sel ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <t.Icon size={20} strokeWidth={1.75} color={sel ? 'var(--color-primary)' : '#3B82F6'} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.45 }}>{t.desc}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function TurnosSetup() {
  const router = useRouter()
  const [paso,         setPaso]        = useState(0)
  const [cargandoPaso, setCargandoPaso] = useState(true)
  const [servicios,    setServicios]   = useState<string[]>([])
  const [negocio,      setNegocio]     = useState<Negocio>({ nombre: '', descripcion: '', email: '', telefono: '', direccion: '', logo: '', latLng: BA, subdominio: '' })
  const [pagos,        setPagos]       = useState<string[]>([])
  const [tamano,       setTamano]      = useState('')
  const [orbiAbierto,  setOrbiAbierto] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setCargandoPaso(false), 450)
    return () => clearTimeout(t)
  }, [paso])

  function toggleServicio(key: string) {
    setServicios(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const puedeAvanzar = paso === 0 ? servicios.length > 0 : true

  function avanzar() {
    if (paso < 3) { setCargandoPaso(true); setPaso(p => p + 1) }
    else router.push('/onboarding/turnos/success')
  }

  function retroceder() {
    if (paso > 0) { setCargandoPaso(true); setPaso(p => p - 1) }
    else router.push('/onboarding/rubro')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>

      {/* ── Header global ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', height: 56, padding: '0 28px',
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <OrbitaLogo size={24} />
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Órbita</span>
        </a>

        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {PASOS_GLOBALES.map((label, i) => {
            const done    = i === 0
            const current = i === 1
            return (
              <Fragment key={label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                    background: done ? '#10B981' : current ? '#2563EB' : 'var(--color-surface-alt)',
                    color:      (done || current) ? 'white' : 'var(--color-subtle)',
                  }}>
                    {done ? <Check size={11} strokeWidth={3} /> : i + 1}
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 600,
                    color: current ? 'var(--color-text)' : done ? '#10B981' : 'var(--color-subtle)',
                  }}>
                    {label}
                  </span>
                </div>
                {i < PASOS_GLOBALES.length - 1 && (
                  <div style={{ width: 24, height: 1, background: done ? '#10B981' : 'var(--color-border)' }} />
                )}
              </Fragment>
            )
          })}
        </div>

        <a href="/login" style={{ marginLeft: 'auto', textDecoration: 'none', fontSize: 13, color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
          ¿Ya tenés cuenta?{' '}
          <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Iniciá sesión</span>
        </a>
      </div>

      {/* ── Inner step progress ── */}
      <div style={{
        borderBottom: '1px solid var(--color-border)',
        background:   'var(--color-surface)',
        padding:      '0 28px',
        overflowX:    'auto',
        scrollbarWidth: 'none',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', minWidth: 480 }}>
          {PASOS_INTERNOS.map((label, i) => {
            const done    = i < paso
            const current = i === paso
            const isLast  = i === PASOS_INTERNOS.length - 1
            return (
              <Fragment key={label}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '11px 0', flexShrink: 0,
                  opacity: (done || current) ? 1 : 0.45,
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700,
                    background: done ? '#10B981' : current ? '#2563EB' : 'var(--color-surface-alt)',
                    color:      (done || current) ? 'white' : 'var(--color-subtle)',
                    boxShadow:  current ? '0 0 0 3px rgba(37,99,235,0.2)' : 'none',
                    transition: 'all 300ms',
                  }}>
                    {done ? <Check size={10} strokeWidth={3} /> : i + 1}
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: current ? 600 : 500, whiteSpace: 'nowrap',
                    color: current ? 'var(--color-text)' : done ? '#10B981' : 'var(--color-muted)',
                    transition: 'color 300ms',
                  }}>
                    {label}
                  </span>
                </div>
                {!isLast && (
                  <div style={{
                    flex: 1, height: 1, margin: '0 10px',
                    background:  done ? '#10B981' : 'var(--color-border)',
                    transition: 'background 300ms',
                    minWidth: 20,
                  }} />
                )}
              </Fragment>
            )
          })}
        </div>
      </div>

      {/* ── Step content ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px 160px' }}>
        {cargandoPaso
          ? <SkeletonPaso paso={paso} />
          : <>
              {paso === 0 && <StepServicios servicios={servicios} toggleServicio={toggleServicio} />}
              {paso === 1 && <StepNegocio   negocio={negocio}    setNegocio={setNegocio}          />}
              {paso === 2 && <StepPagos     pagos={pagos}        setPagos={setPagos}              />}
              {paso === 3 && <StepEquipo    tamano={tamano}      setTamano={setTamano}            />}
            </>
        }
      </div>

      {/* ── Orbi ── */}
      <OrbiChat
        abierto={orbiAbierto}
        onToggle={() => setOrbiAbierto(p => !p)}
        conBarra
        mensaje="¿Tenés alguna duda al configurar tu negocio? Estoy acá para ayudarte."
        quickActions={[
          { label: '¿Para qué sirve el logo?',         onClick: () => {} },
          { label: '¿Para qué se usa la ubicación?',   onClick: () => {} },
          { label: '¿Puedo completar esto después?',   onClick: () => {} },
        ]}
      />

      {/* ── Navigation bar ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '14px 32px',
        background: 'var(--color-bg)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.07)',
        zIndex: 1000,
      }}>
        <button
          onClick={retroceder}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 10,
            border: '1.5px solid var(--color-border)',
            background: 'transparent', color: 'var(--color-body)',
            fontSize: 14, fontWeight: 600,
            cursor: 'pointer', transition: 'all 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)';  e.currentTarget.style.color = 'var(--color-body)'    }}
        >
          <ChevronLeft size={15} strokeWidth={2.5} />
          {paso === 0 ? 'Volver al rubro' : 'Anterior'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {paso === 3 && (
            <button
              onClick={() => router.push('/onboarding/turnos/success')}
              style={{
                padding: '9px 18px', borderRadius: 10,
                border: 'none', background: 'transparent',
                color: 'var(--color-muted)',
                fontSize: 14, fontWeight: 600,
                cursor: 'pointer', transition: 'color 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-body)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted)' }}
            >
              Omitir por ahora
            </button>
          )}
          <button
            onClick={avanzar}
            disabled={!puedeAvanzar}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 10, border: 'none',
              background:  puedeAvanzar ? '#2563EB' : 'var(--color-surface-alt)',
              color:       puedeAvanzar ? 'white'   : 'var(--color-subtle)',
              fontSize: 14, fontWeight: 700,
              cursor:    puedeAvanzar ? 'pointer' : 'default',
              boxShadow: puedeAvanzar ? '0 4px 16px rgba(37,99,235,0.35)' : 'none',
              transition: 'all 150ms',
            }}
            onMouseEnter={e => { if (puedeAvanzar) e.currentTarget.style.background = '#1D4ED8' }}
            onMouseLeave={e => { if (puedeAvanzar) e.currentTarget.style.background = '#2563EB' }}
          >
            {paso === 3 ? 'Finalizar' : 'Continuar'}
            {paso < 3
              ? <ChevronRight size={16} strokeWidth={2.5} />
              : <Check        size={16} strokeWidth={2.5} />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
