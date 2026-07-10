import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Check, type LucideIcon, Orbit, Package, Settings2, Key, Rocket } from 'lucide-react'

const MENSAJES: { Icon: LucideIcon; texto: string }[] = [
  { Icon: Orbit,     texto: 'Iniciando tu espacio en órbita...'        },
  { Icon: Package,   texto: 'Cargando el catálogo de productos...'     },
  { Icon: Settings2, texto: 'Configurando los módulos de tu tienda...' },
  { Icon: Key,       texto: 'Activando tu cuenta...'                   },
  { Icon: Rocket,    texto: '¡Todo listo para despegar!'               },
]

const DURACION_MS = 680

export default function TiendaSuccessPage() {
  const router  = useRouter()
  const [msgIdx, setMsgIdx] = useState(0)
  const [fase,   setFase]   = useState<'cargando' | 'listo'>('cargando')

  useEffect(() => {
    let idx = 0
    const interval = setInterval(() => {
      idx++
      if (idx >= MENSAJES.length) {
        clearInterval(interval)
        setTimeout(() => {
          setFase('listo')
          setTimeout(() => router.push('/admin'), 1800)
        }, 300)
      } else {
        setMsgIdx(idx)
      }
    }, DURACION_MS)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, gap: 40,
    }}>

      {/* ── Logo orbital animando ── */}
      {fase === 'cargando' && (
        <div style={{ position: 'relative', width: 120, height: 120 }}>

          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px dashed rgba(99,102,241,0.35)',
            animation: 'orbitSpin 3s linear infinite',
          }} />

          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 12, height: 12,
            marginTop: -6, marginLeft: -6,
            animation: 'satelliteOrbit 3s linear infinite',
          }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1, #3B82F6)',
              boxShadow: '0 0 8px rgba(99,102,241,0.8)',
            }} />
          </div>

          <div style={{
            position: 'absolute', inset: 18, borderRadius: '50%',
            border: '1.5px solid rgba(59,130,246,0.2)',
          }} />

          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 54, height: 54, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563EB 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(37,99,235,0.4)',
            }}>
              <svg viewBox="0 0 30 30" fill="none" style={{ width: 32, height: 32 }}>
                <circle cx="15" cy="15" r="13" stroke="rgba(255,255,255,0.5)" strokeWidth="3.2" strokeDasharray="60 22" strokeLinecap="round"/>
                <circle cx="25.5" cy="7.5" r="4" fill="rgba(255,255,255,0.85)"/>
                <circle cx="15" cy="15" r="4.5" fill="white"/>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ── Check de éxito ── */}
      {fase === 'listo' && (
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(16,185,129,0.4)',
          animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}>
          <Check size={44} color="white" strokeWidth={2.5} />
        </div>
      )}

      {/* ── Texto dinámico ── */}
      <div style={{ textAlign: 'center', minHeight: 72 }}>
        {fase === 'cargando' && (
          <div key={msgIdx} style={{ animation: 'fadeUp 0.4s ease forwards' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, margin: '0 auto 12px',
              background: 'rgba(59,130,246,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {(() => { const Icon = MENSAJES[msgIdx].Icon; return <Icon size={26} strokeWidth={1.75} color="var(--color-primary)" /> })()}
            </div>
            <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-body)', margin: 0 }}>
              {MENSAJES[msgIdx].texto}
            </p>
          </div>
        )}

        {fase === 'listo' && (
          <div style={{ animation: 'fadeUp 0.4s ease 0.2s both' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 6px' }}>
              ¡Tu tienda está lista!
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: 0 }}>
              Redirigiendo a tu panel…
            </p>
          </div>
        )}
      </div>

      {/* ── Barra de progreso ── */}
      {fase === 'cargando' && (
        <div style={{
          width: 200, height: 3,
          background: 'var(--color-surface-alt)',
          borderRadius: 99, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: 'linear-gradient(90deg, #3B82F6, #6366F1)',
            width: `${((msgIdx + 1) / MENSAJES.length) * 100}%`,
            transition: 'width 600ms ease',
          }} />
        </div>
      )}
    </div>
  )
}
