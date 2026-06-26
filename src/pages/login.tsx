import { useState } from 'react'
import { useRouter } from 'next/router'
import { Mail, Lock, Eye } from 'lucide-react'

export default function AdminLogin() {
  const router   = useRouter()
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/admin/rama-tienda/ventas/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', display: 'grid', placeItems: 'center' }}>
      <div style={{
        width: 420,
        background: 'var(--color-bg)', border: '1px solid var(--color-border)',
        borderRadius: 16, padding: 36,
        boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <svg viewBox="0 0 30 30" fill="none" style={{ width: 40, height: 40 }}>
            <circle cx="15" cy="15" r="13" stroke="#2563eb" strokeWidth="3.2" strokeDasharray="60 22" strokeLinecap="round"/>
            <circle cx="25.5" cy="7.5" r="4" fill="#93c5fd"/>
            <circle cx="15" cy="15" r="4.5" fill="#1e3a8a"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', textAlign: 'center', margin: '0 0 6px' }}>
          Ingresá a Órbita
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-muted)', textAlign: 'center', margin: '0 0 24px' }}>
          Panel de administración
        </p>
        <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 24 }} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Email">
            <Input type="email" placeholder="tu@email.com"
              icon={<Mail size={15} strokeWidth={1.5} color="var(--color-subtle)" />} />
          </Field>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>Contraseña</label>
              <a href="/forgot-password" style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}>¿Olvidaste?</a>
            </div>
            <Input
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              icon={<Lock size={15} strokeWidth={1.5} color="var(--color-subtle)" />}
              rightIcon={
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Eye size={15} strokeWidth={1.5} />
                </button>
              }
            />
          </div>

          <button type="submit" style={{
            width: '100%', height: 48, borderRadius: 10, marginTop: 8,
            background: 'var(--color-primary)', color: '#fff',
            fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(59,130,246,0.25)',
          }}>
            Ingresar
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--color-subtle)', fontSize: 11, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            <span>o continuá con</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          </div>

          <button type="button" style={{
            width: '100%', height: 44, borderRadius: 10,
            background: 'var(--color-bg)', border: '1.5px solid var(--color-border)',
            fontSize: 13, fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <GoogleIcon /> Continuar con Google
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--color-muted)' }}>
          ¿No tenés cuenta?{' '}
          <a href="/registro" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Registrate gratis
          </a>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

function Input({ type = 'text', placeholder, icon, rightIcon }: {
  type?: string; placeholder?: string
  icon?: React.ReactNode; rightIcon?: React.ReactNode
}) {
  return (
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>{icon}</span>}
      <input
        type={type}
        placeholder={placeholder}
        style={{
          width: '100%', height: 44,
          padding: `0 ${rightIcon ? 40 : 14}px 0 ${icon ? 40 : 14}px`,
          borderRadius: 8, border: '1px solid var(--color-border)',
          background: 'var(--color-bg)', color: 'var(--color-text)',
          fontSize: 14, outline: 'none', boxSizing: 'border-box',
        }}
      />
      {rightIcon && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>{rightIcon}</span>}
    </div>
  )
}
