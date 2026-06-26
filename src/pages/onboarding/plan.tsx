import { useRouter } from 'next/router'
import { Check, Shield, Zap, HeadphonesIcon, Globe, Percent } from 'lucide-react'

const FEATURES = [
  { Icon: Zap,              texto: 'Panel de administración completo'       },
  { Icon: Globe,            texto: 'Subdominio .orbita.site incluido'       },
  { Icon: Percent,          texto: 'Sin comisiones por venta o turno'       },
  { Icon: HeadphonesIcon,   texto: 'Soporte prioritario por WhatsApp'       },
  { Icon: Shield,           texto: 'Cancelá cuando quieras, sin penalidad'  },
]

const PASOS = ['Rubro', 'Configuración', 'Listo']

function OrbitaLogo({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 30 30" fill="none" style={{ width: size, height: size, flexShrink: 0 }}>
      <circle cx="15" cy="15" r="13" stroke="#2563eb" strokeWidth="3.2" strokeDasharray="60 22" strokeLinecap="round"/>
      <circle cx="25.5" cy="7.5" r="4" fill="#93c5fd"/>
      <circle cx="15" cy="15" r="4.5" fill="#1e3a8a"/>
    </svg>
  )
}

function MercadoPagoLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="24" fill="#009EE3"/>
      <path d="M8 24c0-8.837 7.163-16 16-16 4.418 0 8.418 1.791 11.314 4.686L24 24H8z" fill="white" opacity=".9"/>
      <path d="M24 24l11.314-11.314A15.96 15.96 0 0 1 40 24c0 8.837-7.163 16-16 16-4.418 0-8.418-1.791-11.314-4.686L24 24z" fill="white" opacity=".6"/>
    </svg>
  )
}

export default function PlanPage() {
  const router = useRouter()
  const next   = (router.query.next as string) ?? '/admin'

  function pagar() {
    // En producción: redirigir al link de MP generado por el backend
    router.push(next)
  }

  function explorarPrimero() {
    router.push(next)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', fontFamily: 'inherit' }}>

      {/* ── Header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', height: 56, padding: '0 28px',
        background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <OrbitaLogo size={24} />
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Órbita</span>
        </a>

        {/* Stepper */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {PASOS.map((paso, i) => {
            const done    = i < 2
            const current = i === 2
            return (
              <div key={paso} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                    background: done ? '#10B981' : current ? '#2563EB' : 'var(--color-surface-alt)',
                    color: (done || current) ? 'white' : 'var(--color-subtle)',
                  }}>
                    {done ? <Check size={11} strokeWidth={3} /> : i + 1}
                  </div>
                  <span className="ob-step-label" style={{
                    fontSize: 13, fontWeight: 600,
                    color: current ? 'var(--color-text)' : done ? '#10B981' : 'var(--color-subtle)',
                  }}>
                    {paso}
                  </span>
                </div>
                {i < PASOS.length - 1 && (
                  <div style={{ width: 24, height: 1, background: done ? '#10B981' : 'var(--color-border)' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="ob-plan-content" style={{
        maxWidth: 480, margin: '0 auto',
        padding: '52px 24px 80px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>

        {/* Ícono top */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%', marginBottom: 20,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563EB 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
        }}>
          <OrbitaLogo size={36} />
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 8px', textAlign: 'center' }}>
          Activá tu cuenta
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: '0 0 36px', textAlign: 'center', lineHeight: 1.5 }}>
          Tu negocio está configurado. Elegí el plan de inicio para publicar tu espacio en Órbita.
        </p>

        {/* ── Card de plan ── */}
        <div style={{
          width: '100%',
          background: 'var(--color-bg)',
          border: '2px solid var(--color-primary)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(37,99,235,0.12)',
        }}>

          {/* Encabezado del plan */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563EB 100%)',
            padding: '24px 28px 20px',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
              borderRadius: 999, padding: '4px 12px',
              fontSize: 11, fontWeight: 700, color: 'white',
              border: '1px solid rgba(255,255,255,0.25)',
            }}>
              ✦ PLAN INICIAL
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
              Órbita Starter
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 42, fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>
                $5.000
              </span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', paddingBottom: 6 }}>
                / 3 meses
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
              $1.667 por mes · Sin renovación automática
            </div>
          </div>

          {/* Features */}
          <div style={{ padding: '20px 28px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {FEATURES.map(({ Icon, texto }) => (
                <div key={texto} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: 'rgba(16,185,129,0.10)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Check size={12} strokeWidth={3} color="#10B981" />
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--color-body)' }}>{texto}</span>
                </div>
              ))}
            </div>

            {/* Botón MercadoPago */}
            <button
              onClick={pagar}
              style={{
                width: '100%', height: 52, borderRadius: 12, border: 'none',
                background: '#009EE3', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,158,227,0.40)',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0085C1'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#009EE3'; e.currentTarget.style.transform = 'translateY(0)'    }}
            >
              <MercadoPagoLogo />
              Pagar con MercadoPago
            </button>

            {/* Seguridad */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 10 }}>
              <Shield size={11} strokeWidth={2} color="var(--color-subtle)" />
              <span style={{ fontSize: 11, color: 'var(--color-subtle)' }}>
                Pago 100% seguro · Encriptado por MercadoPago
              </span>
            </div>
          </div>
        </div>

        {/* Separador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', margin: '24px 0 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          <span style={{ fontSize: 12, color: 'var(--color-subtle)', whiteSpace: 'nowrap' }}>o si preferís</span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
        </div>

        {/* Explorar primero */}
        <button
          onClick={explorarPrimero}
          style={{
            marginTop: 16, background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, color: 'var(--color-muted)', fontWeight: 500,
            textDecoration: 'underline', textUnderlineOffset: 3,
            transition: 'color 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted)' }}
        >
          Explorar el panel primero (sin publicar)
        </button>

        <p style={{ fontSize: 11, color: 'var(--color-subtle)', marginTop: 8, textAlign: 'center' }}>
          Sin tarjeta de crédito requerida para explorar
        </p>
      </div>
    </div>
  )
}
