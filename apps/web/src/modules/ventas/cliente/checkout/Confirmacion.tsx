import { useState } from 'react'
import { useRouter } from 'next/router'
import { CheckCircle, Check, Clock, ArrowRight, MessageCircle } from 'lucide-react'
import { CheckoutStepper } from '@/components/storefront/CheckoutStepper'
import { Thumb } from '@/components/storefront/Thumb'
import { TIENDA, CARRITO_INICIAL, PEDIDO_MOCK } from '@/lib/storefront/mock'
import { fmt, openWpp } from '@/lib/storefront/utils'

export default function Confirmacion() {
  const router = useRouter()
  const { slug, metodo } = router.query as { slug: string; metodo?: string }
  const base = `/tienda/${slug}`

  const [pendiente, setPendiente] = useState(metodo === 'transferencia')

  const total = CARRITO_INICIAL.reduce((s, i) => s + i.precio * i.qty, 0)

  // Variantes visuales según estado
  const accentColor  = pendiente ? '#D97706'              : 'var(--color-success)'
  const accentBg     = pendiente ? 'rgba(245,158,11,0.10)': 'var(--color-success-bg)'
  const accentBorder = pendiente ? 'rgba(245,158,11,0.30)': 'rgba(16,185,129,0.25)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <style>{`
        @media (max-width: 640px) {
          .sf-conf-bar  { padding: 0 16px !important; }
          .sf-conf-wrap { padding: 20px 16px 48px !important; }
        }
      `}</style>
      <header className="sf-conf-bar" style={{
        position: 'sticky', top: 0, zIndex: 50,
        height: 60, background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)',
        padding: '0 32px', display: 'flex', alignItems: 'center',
      }}>
        <a href={base} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #2563EB, #3B82F6)', display: 'grid', placeItems: 'center' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{TIENDA.nombre}</span>
        </a>
      </header>

      <div className="sf-conf-wrap" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 64px' }}>
        <CheckoutStepper step={3} />

        {/* Toggle de demo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', background: 'var(--color-surface)',
            border: '1px solid var(--color-border)', borderRadius: 999, padding: 4, gap: 4,
          }}>
            {([{ label: 'Pendiente', value: true }, { label: 'Confirmado', value: false }] as const).map(opt => (
              <button
                key={opt.label}
                onClick={() => setPendiente(opt.value)}
                style={{
                  height: 30, padding: '0 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, transition: 'all 150ms',
                  background: pendiente === opt.value ? 'var(--color-bg)' : 'transparent',
                  color: pendiente === opt.value ? 'var(--color-text)' : 'var(--color-muted)',
                  boxShadow: pendiente === opt.value ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto' }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: accentBg, border: `2px solid ${accentColor}`,
            display: 'grid', placeItems: 'center', margin: '0 auto 20px',
            color: accentColor,
          }}>
            {pendiente
              ? <Clock size={44} strokeWidth={1.5} />
              : <CheckCircle size={44} strokeWidth={1.5} />}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 12px' }}>
            {pendiente ? 'Pedido pendiente' : '¡Pedido confirmado!'}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--color-muted)', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
            {pendiente
              ? <>Tu pedido fue registrado. En cuanto verifiquemos el comprobante de transferencia, lo confirmamos y te avisamos por WhatsApp.</>
              : <>Gracias por tu compra, <strong style={{ color: 'var(--color-text)' }}>María</strong>. Te avisamos por WhatsApp cuando esté listo.</>}
          </p>

          <div style={{
            background: 'var(--color-bg)', border: '1px solid var(--color-border)',
            borderRadius: 14, padding: 24, textAlign: 'left',
            boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-subtle)', marginBottom: 4 }}>Pedido</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>#{PEDIDO_MOCK.id}</div>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                height: 24, padding: '0 10px', borderRadius: 999,
                background: accentBg, color: accentColor,
                fontSize: 11, fontWeight: 700,
              }}>
                {pendiente
                  ? <><Clock size={11} strokeWidth={2.5} /> Pendiente</>
                  : <><Check size={11} strokeWidth={2.5} /> Confirmado</>}
              </span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-subtle)', marginBottom: 4 }}>Fecha</div>
                <div style={{ fontSize: 13, color: 'var(--color-body)', fontFamily: '"Geist Mono", monospace' }}>{PEDIDO_MOCK.fecha}</div>
              </div>
            </div>

            {CARRITO_INICIAL.map((it, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', alignItems: 'center' }}>
                <Thumb hue={it.hue} size={48} radius={8} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.nombre}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-subtle)', marginTop: 2 }}>x{it.qty}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>
                  {fmt(it.precio * it.qty)}
                </div>
              </div>
            ))}

            <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 12, paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmt(total)}</span>
            </div>

            <div style={{
              padding: 14, borderRadius: 10,
              background: accentBg, border: `1px solid ${accentBorder}`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <MessageCircle size={20} strokeWidth={1.5} color={accentColor} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
                  {pendiente ? 'Te avisamos cuando confirmemos el pago' : 'Te contactaremos por WhatsApp'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>También podés escribirnos directo:</div>
              </div>
              <button
                onClick={() => openWpp(TIENDA.wpp, `Hola! Acabo de confirmar el pedido #${PEDIDO_MOCK.id}.`)}
                style={{
                  height: 34, padding: '0 12px', borderRadius: 8,
                  background: '#25D366', color: '#fff',
                  fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                }}
              >
                WhatsApp
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            <button onClick={() => router.push(base)} style={{
              height: 48, padding: '0 22px', borderRadius: 8,
              background: 'transparent', color: 'var(--color-text)',
              border: '1px solid var(--color-border)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              Seguir comprando
            </button>
            <button onClick={() => router.push(`${base}/pedido/${PEDIDO_MOCK.id}`)} style={{
              height: 48, padding: '0 22px', borderRadius: 8,
              background: 'var(--color-primary)', color: '#fff',
              fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 16px rgba(59,130,246,0.25)',
            }}>
              Ver mi pedido <ArrowRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
