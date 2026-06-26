import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Package, MapPin, User, Lock, LogOut,
  ChevronRight, Plus, Pencil, CheckCircle2,
  Eye, EyeOff, ShieldCheck,
} from 'lucide-react'
import { StorefrontHeader } from '@/components/storefront/StorefrontHeader'
import { StorefrontFooter } from '@/components/storefront/StorefrontFooter'
import { TIENDA, CARRITO_INICIAL, DIRECCIONES, USUARIO_MOCK, HISTORIAL_MOCK } from '@/lib/storefront/mock'
import { fmt } from '@/lib/storefront/utils'

type Tab = 'pedidos' | 'direcciones' | 'datos' | 'seguridad'

const TABS: { id: Tab; Icon: React.ElementType; label: string }[] = [
  { id: 'pedidos',     Icon: Package,  label: 'Mis pedidos'      },
  { id: 'direcciones', Icon: MapPin,   label: 'Mis direcciones'  },
  { id: 'datos',       Icon: User,     label: 'Datos personales' },
  { id: 'seguridad',   Icon: Lock,     label: 'Seguridad'        },
]

const ESTADO_STYLE: Record<string, { bg: string; color: string }> = {
  success: { bg: '#DCFCE7', color: '#16A34A' },
  warning: { bg: '#FEF9C3', color: '#CA8A04' },
  error:   { bg: '#FEE2E2', color: '#DC2626' },
  neutral: { bg: 'var(--color-surface)', color: 'var(--color-muted)' },
}

const totalGastado = HISTORIAL_MOCK.filter(p => p.estadoTipo !== 'error').reduce((s, p) => s + p.total, 0)

export default function Perfil() {
  const router = useRouter()
  const { slug } = router.query as { slug: string }
  const base = `/tienda/${slug}`

  const [tab,         setTab]         = useState<Tab>('pedidos')

  useEffect(() => { window.scrollTo({ top: 0 }) }, [tab])
  const [showPass,    setShowPass]    = useState(false)
  const [showNew,     setShowNew]     = useState(false)
  const [guardado,    setGuardado]    = useState(false)
  const [guardadoDir, setGuardadoDir] = useState(false)
  const [nombre,      setNombre]      = useState(USUARIO_MOCK.nombre)
  const [apellido,    setApellido]    = useState(USUARIO_MOCK.apellido)
  const [email,       setEmail]       = useState(USUARIO_MOCK.email)
  const [telefono,    setTelefono]    = useState(USUARIO_MOCK.telefono)

  function handleGuardarDatos(e: React.FormEvent) {
    e.preventDefault()
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2500)
  }

  function handleGuardarDir(e: React.FormEvent) {
    e.preventDefault()
    setGuardadoDir(true)
    setShowNew(false)
    setTimeout(() => setGuardadoDir(false), 2500)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <style>{`
        @media (max-width: 768px) {
          .sf-prf-wrap        { padding: 20px 16px 48px !important; }
          .sf-prf-hero        { padding: 20px !important; flex-direction: column !important; gap: 16px !important; }
          .sf-prf-hero-stats  { width: 100% !important; justify-content: flex-start !important; gap: 32px !important; }
          .sf-prf-layout      { grid-template-columns: 1fr !important; }
          .sf-prf-sidebar     { position: static !important; display: flex !important; flex-direction: row !important; flex-wrap: wrap !important; gap: 0 !important; overflow: hidden !important; }
          .sf-prf-sidebar button { border-top: none !important; border-right: 1px solid var(--color-border) !important; flex: 1 1 auto !important; padding: 10px 8px !important; font-size: 12px !important; }
          .sf-prf-sidebar button:last-child { border-right: none !important; }
          .sf-prf-2col        { grid-template-columns: 1fr !important; }
          .sf-prf-3col        { grid-template-columns: 1fr !important; }
          .sf-prf-pedido-row  { grid-template-columns: 1fr auto !important; }
          .sf-prf-pedido-chev { display: none !important; }
        }
      `}</style>
      <StorefrontHeader tienda={TIENDA} carrito={CARRITO_INICIAL} logged />

      <div className="sf-prf-wrap" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 64px' }}>

        {/* ── Hero del perfil ── */}
        <div className="sf-prf-hero" style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #3B82F6 100%)',
          borderRadius: 16, padding: '32px 36px', marginBottom: 32,
          display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #F472B6, #FB923C)',
            color: '#fff', fontSize: 24, fontWeight: 800,
            display: 'grid', placeItems: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
          }}>
            {USUARIO_MOCK.avatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              {nombre} {apellido}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>{email}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
              Cliente desde {USUARIO_MOCK.miembro}
            </div>
          </div>
          <div className="sf-prf-hero-stats" style={{ display: 'flex', gap: 24 }}>
            {[
              { label: 'Pedidos',      value: HISTORIAL_MOCK.length },
              { label: 'Total gastado', value: fmt(totalGastado) },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: '"Geist Mono", monospace' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Layout sidebar + contenido ── */}
        <div className="sf-prf-layout" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'flex-start' }}>

          {/* Sidebar nav */}
          <div className="sf-prf-sidebar" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', position: 'sticky', top: 80 }}>
            {TABS.map((t, i) => {
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '13px 16px', fontSize: 13, fontWeight: active ? 600 : 500,
                    color: active ? 'var(--color-primary)' : 'var(--color-body)',
                    background: active ? 'var(--color-primary-bg)' : 'transparent',
                    borderLeft: `3px solid ${active ? 'var(--color-primary)' : 'transparent'}`,
                    borderTop: i > 0 ? '1px solid var(--color-border)' : 'none',
                    borderRight: 'none', borderBottom: 'none',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 150ms',
                  }}
                >
                  <t.Icon size={15} strokeWidth={1.5} />
                  {t.label}
                </button>
              )
            })}
            <div style={{ borderTop: '1px solid var(--color-border)' }}>
              <button
                onClick={() => router.push(`${base}/login`)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '13px 16px', fontSize: 13, fontWeight: 500,
                  color: 'var(--color-error)', background: 'transparent',
                  border: 'none', borderLeft: '3px solid transparent',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 150ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={15} strokeWidth={1.5} />
                Cerrar sesión
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div style={{ minHeight: 600 }}>

            {/* ══ PEDIDOS ══ */}
            {tab === 'pedidos' && (
              <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>Mis pedidos</div>
                  <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>{HISTORIAL_MOCK.length} pedidos en tu historial</div>
                </div>
                {HISTORIAL_MOCK.map((p, i) => {
                  const st = ESTADO_STYLE[p.estadoTipo]
                  return (
                    <div
                      key={p.id}
                      onClick={() => router.push(`${base}/pedido/${p.id}`)}
                      className="sf-prf-pedido-row"
                      style={{
                        display: 'grid', gridTemplateColumns: '1fr auto auto',
                        alignItems: 'center', gap: 16,
                        padding: '18px 24px', cursor: 'pointer',
                        borderBottom: i < HISTORIAL_MOCK.length - 1 ? '1px solid var(--color-border)' : 'none',
                        transition: 'background 150ms',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface)'}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>#{p.id}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999, background: st.bg, color: st.color }}>
                            {p.estado}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                          {p.fecha} · {p.items} producto{p.items > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace', textAlign: 'right' }}>
                        {fmt(p.total)}
                      </div>
                      <ChevronRight className="sf-prf-pedido-chev" size={16} color="var(--color-subtle)" />
                    </div>
                  )
                })}
              </div>
            )}

            {/* ══ DIRECCIONES ══ */}
            {tab === 'direcciones' && (
              <div>
                {guardadoDir && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 600, color: '#16A34A' }}>
                    <CheckCircle2 size={15} /> Dirección guardada correctamente
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  {DIRECCIONES.map(d => (
                    <div
                      key={d.id}
                      style={{
                        background: 'var(--color-bg)', border: `2px solid ${d.default ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 12, padding: '16px 20px',
                        display: 'flex', alignItems: 'flex-start', gap: 14,
                      }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: d.default ? 'var(--color-primary-bg)' : 'var(--color-surface)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <MapPin size={16} strokeWidth={1.5} color={d.default ? 'var(--color-primary)' : 'var(--color-muted)'} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{d.alias}</span>
                          {d.default && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-success)', background: 'var(--color-success-bg)', padding: '2px 8px', borderRadius: 999 }}>
                              Predeterminada
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--color-body)', lineHeight: 1.55 }}>
                          {d.calle}{d.piso ? ` · ${d.piso}` : ''}<br />
                          {d.ciudad} · CP {d.cp}
                        </div>
                      </div>
                      <button style={{ height: 32, padding: '0 12px', borderRadius: 7, background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-body)', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Pencil size={12} strokeWidth={1.5} /> Editar
                      </button>
                    </div>
                  ))}
                </div>

                {!showNew ? (
                  <button
                    onClick={() => setShowNew(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 18px', borderRadius: 10, background: 'var(--color-bg)', border: '1px dashed var(--color-border)', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'border-color 150ms' }}
                  >
                    <Plus size={15} strokeWidth={2} /> Agregar nueva dirección
                  </button>
                ) : (
                  <form onSubmit={handleGuardarDir} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 16 }}>Nueva dirección</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <FI label="Alias (ej: Casa, Trabajo)"><input placeholder="Mi casa" style={inputStyle} /></FI>
                      <FI label="Calle y número"><input placeholder="Av. Corrientes 1234" style={inputStyle} /></FI>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <FI label="Piso / Depto"><input placeholder="Piso 3 · Depto A" style={inputStyle} /></FI>
                        <FI label="Entre calles"><input placeholder="Opcional" style={inputStyle} /></FI>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 14 }}>
                        <FI label="Ciudad"><input placeholder="CABA" style={inputStyle} /></FI>
                        <FI label="Provincia"><input placeholder="Buenos Aires" style={inputStyle} /></FI>
                        <FI label="CP"><input placeholder="C1043" style={inputStyle} /></FI>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                      <button type="submit" style={{ height: 40, padding: '0 20px', borderRadius: 8, background: 'var(--color-primary)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Guardar dirección</button>
                      <button type="button" onClick={() => setShowNew(false)} style={{ height: 40, padding: '0 16px', borderRadius: 8, background: 'var(--color-surface)', color: 'var(--color-body)', fontSize: 13, fontWeight: 500, border: '1px solid var(--color-border)', cursor: 'pointer' }}>Cancelar</button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ══ DATOS PERSONALES ══ */}
            {tab === 'datos' && (
              <form onSubmit={handleGuardarDatos} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 28 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>Datos personales</div>
                <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 24 }}>Tu información de contacto y cuenta.</div>

                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #F472B6, #FB923C)', color: '#fff', fontSize: 22, fontWeight: 800, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {USUARIO_MOCK.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>Foto de perfil</div>
                    <button type="button" style={{ height: 34, padding: '0 14px', borderRadius: 7, background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-body)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                      Cambiar imagen
                    </button>
                  </div>
                </div>

                <div className="sf-prf-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <FI label="Nombre">
                    <input value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} />
                  </FI>
                  <FI label="Apellido">
                    <input value={apellido} onChange={e => setApellido(e.target.value)} style={inputStyle} />
                  </FI>
                </div>
                <div className="sf-prf-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <FI label="Email">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                  </FI>
                  <FI label="Teléfono">
                    <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} style={inputStyle} />
                  </FI>
                </div>
                <div className="sf-prf-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <FI label="Fecha de nacimiento">
                    <input type="date" defaultValue="1995-03-14" style={inputStyle} />
                  </FI>
                  <FI label="DNI / CUIL (opcional)">
                    <input placeholder="20-12345678-3" style={inputStyle} />
                  </FI>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button type="submit" style={{ height: 42, padding: '0 22px', borderRadius: 9, background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 2px 10px rgba(37,99,235,0.25)' }}>
                    Guardar cambios
                  </button>
                  {guardado && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#16A34A', fontWeight: 600 }}>
                      <CheckCircle2 size={15} /> Guardado correctamente
                    </div>
                  )}
                </div>
              </form>
            )}

            {/* ══ SEGURIDAD ══ */}
            {tab === 'seguridad' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Cambiar contraseña */}
                <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>Cambiar contraseña</div>
                  <div style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 20 }}>Usá una contraseña segura de al menos 8 caracteres.</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <FI label="Contraseña actual">
                      <div style={{ position: 'relative' }}>
                        <input type={showPass ? 'text' : 'password'} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 40 }} />
                        <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-subtle)', display: 'grid', placeItems: 'center' }}>
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </FI>
                    <FI label="Nueva contraseña">
                      <input type="password" placeholder="••••••••" style={inputStyle} />
                    </FI>
                    <FI label="Confirmar nueva contraseña">
                      <input type="password" placeholder="••••••••" style={inputStyle} />
                    </FI>
                  </div>
                  <button style={{ marginTop: 20, height: 42, padding: '0 22px', borderRadius: 9, background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                    Actualizar contraseña
                  </button>
                </div>

                {/* Info de sesión */}
                <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <ShieldCheck size={18} strokeWidth={1.5} color="var(--color-success)" />
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Sesión activa</div>
                  </div>
                  {[
                    ['Dispositivo',       'Chrome · Windows 11'],
                    ['Última actividad',  'Hoy, 14:32'],
                    ['Dirección IP',      '186.xxx.xxx.xxx'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: 13 }}>
                      <span style={{ color: 'var(--color-muted)', fontWeight: 500 }}>{k}</span>
                      <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                  <button
                    onClick={() => router.push(`${base}/login`)}
                    style={{ marginTop: 16, height: 38, padding: '0 16px', borderRadius: 8, background: 'transparent', border: '1px solid var(--color-error)', color: 'var(--color-error)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <LogOut size={14} strokeWidth={1.5} /> Cerrar sesión en todos los dispositivos
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <StorefrontFooter tienda={TIENDA} slug={slug} />
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 44, padding: '0 14px',
  borderRadius: 8, border: '1px solid var(--color-border)',
  background: 'var(--color-bg)', color: 'var(--color-text)',
  fontSize: 14, outline: 'none', boxSizing: 'border-box',
}

function FI({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>{label}</label>
      {children}
    </div>
  )
}
