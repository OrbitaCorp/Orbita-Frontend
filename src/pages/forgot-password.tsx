import { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { Mail, Lock, Eye, ArrowLeft, CheckCircle } from 'lucide-react'

type Step = 'email' | 'code' | 'password' | 'done'

export default function AdminForgotPassword() {
  const router = useRouter()

  const [step, setStep]               = useState<Step>('email')
  const [showPw, setShowPw]           = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [digits, setDigits]           = useState(Array(6).fill(''))
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const handleDigit = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return
    const next = [...digits]; next[i] = v.slice(-1); setDigits(next)
    if (v && i < 5) inputsRef.current[i + 1]?.focus()
  }
  const handleDigitKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus()
  }

  const email = 'admin@orbita.app'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', display: 'grid', placeItems: 'center', padding: 16 }}>
      <div style={{
        width: 420, maxWidth: '100%',
        background: 'var(--color-bg)', border: '1px solid var(--color-border)',
        borderRadius: 16, padding: 36,
        boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
      }}>
        {/* Logo Órbita */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <svg viewBox="0 0 30 30" fill="none" style={{ width: 40, height: 40 }}>
            <circle cx="15" cy="15" r="13" stroke="#2563eb" strokeWidth="3.2" strokeDasharray="60 22" strokeLinecap="round"/>
            <circle cx="25.5" cy="7.5" r="4" fill="#93c5fd"/>
            <circle cx="15" cy="15" r="4.5" fill="#1e3a8a"/>
          </svg>
        </div>

        {/* ── Step 1: Email ── */}
        {step === 'email' && <>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', textAlign: 'center', margin: '0 0 6px' }}>
            Recuperar contraseña
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-muted)', textAlign: 'center', margin: '0 0 24px' }}>
            Panel de administración
          </p>
          <Divider />

          <p style={{ fontSize: 14, color: 'var(--color-body)', lineHeight: 1.6, marginBottom: 20 }}>
            Ingresá el email de tu cuenta de administrador y te enviaremos un código para restablecer tu contraseña.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Email">
              <InputField type="email" defaultValue={email}
                icon={<Mail size={15} strokeWidth={1.5} color="var(--color-subtle)" />} />
            </Field>

            <Btn onClick={() => setStep('code')}>Enviar código</Btn>
          </div>

          <BackLink href="/login">Volver al inicio de sesión</BackLink>
        </>}

        {/* ── Step 2: Código ── */}
        {step === 'code' && <>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', textAlign: 'center', margin: '0 0 6px' }}>
            Revisá tu email
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-muted)', textAlign: 'center', margin: '0 0 24px' }}>
            Enviamos un código a <strong style={{ color: 'var(--color-text)' }}>{email}</strong>
          </p>
          <Divider />

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 12 }}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputsRef.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleDigitKey(i, e)}
                style={{
                  width: 48, height: 56, borderRadius: 10, textAlign: 'center',
                  fontSize: 24, fontWeight: 700, color: 'var(--color-text)',
                  border: `2px solid ${d ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: 'var(--color-bg)', outline: 'none',
                  transition: 'border-color 0.15s', boxSizing: 'border-box',
                }}
              />
            ))}
          </div>

          <p style={{ fontSize: 12, color: 'var(--color-subtle)', textAlign: 'center', marginBottom: 20 }}>
            Demo: ingresá cualquier dígito o presioná Continuar
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Btn onClick={() => setStep('password')}>Verificar código</Btn>
            <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-primary)', fontWeight: 500, padding: '6px 0' }}>
              Reenviar código
            </button>
          </div>

          <BackBtn onClick={() => setStep('email')}>Volver</BackBtn>
        </>}

        {/* ── Step 3: Nueva contraseña ── */}
        {step === 'password' && <>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', textAlign: 'center', margin: '0 0 6px' }}>
            Nueva contraseña
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-muted)', textAlign: 'center', margin: '0 0 24px' }}>
            Elegí una contraseña segura para tu panel
          </p>
          <Divider />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>Nueva contraseña</label>
              <InputField
                type={showPw ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                icon={<Lock size={15} strokeWidth={1.5} color="var(--color-subtle)" />}
                rightIcon={<EyeToggle show={showPw} onToggle={() => setShowPw(p => !p)} />}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>Confirmar contraseña</label>
              <InputField
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repetí tu contraseña"
                icon={<Lock size={15} strokeWidth={1.5} color="var(--color-subtle)" />}
                rightIcon={<EyeToggle show={showConfirm} onToggle={() => setShowConfirm(p => !p)} />}
              />
            </div>

            <Btn onClick={() => setStep('done')}>Cambiar contraseña</Btn>
          </div>

          <BackBtn onClick={() => setStep('code')}>Volver</BackBtn>
        </>}

        {/* ── Done ── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'grid', placeItems: 'center' }}>
                <CheckCircle size={34} color="#10b981" strokeWidth={1.8} />
              </div>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 8px' }}>
              ¡Contraseña actualizada!
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 28, lineHeight: 1.6 }}>
              Ya podés ingresar al panel con tu nueva contraseña.
            </p>
            <Btn onClick={() => router.push('/login')}>Ir al inicio de sesión</Btn>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 24 }} />
}

function Btn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      width: '100%', height: 48, borderRadius: 10,
      background: 'var(--color-primary)', color: '#fff',
      fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(59,130,246,0.25)',
    }}>
      {children}
    </button>
  )
}

function BackBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <div style={{ textAlign: 'center', marginTop: 20 }}>
      <button type="button" onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <ArrowLeft size={13} />
        {children}
      </button>
    </div>
  )
}

function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div style={{ textAlign: 'center', marginTop: 24 }}>
      <a href={href} style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <ArrowLeft size={13} />
        {children}
      </a>
    </div>
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

function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} style={{ color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
      <Eye size={15} strokeWidth={1.5} />
    </button>
  )
}

function InputField({ type = 'text', placeholder, defaultValue, icon, rightIcon }: {
  type?: string; placeholder?: string; defaultValue?: string
  icon?: React.ReactNode; rightIcon?: React.ReactNode
}) {
  return (
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>{icon}</span>}
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
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
