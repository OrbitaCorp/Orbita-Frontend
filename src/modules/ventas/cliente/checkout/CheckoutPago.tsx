import { useState } from 'react'
import { useRouter } from 'next/router'
import { QrCode, Landmark, Lock, ChevronLeft, CreditCard, Store, CheckCircle2, Clock, MessageCircle, ArrowRight } from 'lucide-react'
import { CheckoutStepper } from '@/components/storefront/CheckoutStepper'
import { Thumb } from '@/components/storefront/Thumb'
import { TIENDA, CARRITO_INICIAL } from '@/lib/storefront/mock'
import { fmt } from '@/lib/storefront/utils'

type Metodo = 'mp' | 'transferencia' | 'retiro'

const METODOS: { id: Metodo; Icon: React.ElementType; titulo: string; desc: string }[] = [
  { id: 'mp',            Icon: QrCode,   titulo: 'Mercado Pago / QR',      desc: 'Escaneá el QR o pagá con tarjeta vía Mercado Pago' },
  { id: 'transferencia', Icon: Landmark, titulo: 'Transferencia bancaria',  desc: 'CBU/Alias · Coordinás el comprobante por WhatsApp' },
  { id: 'retiro',        Icon: Store,    titulo: 'Retiro por local',        desc: 'Pagás en efectivo o con tarjeta al retirar' },
]

export default function CheckoutPago() {
  const router  = useRouter()
  const { slug } = router.query as { slug: string }
  const base = `/tienda/${slug}`

  const [metodo, setMetodo]         = useState<Metodo>('mp')
  const [mostrarWpp, setMostrarWpp] = useState(false)

  const subtotal  = CARRITO_INICIAL.reduce((s, i) => s + i.precio * i.qty, 0)
  const descuento = CARRITO_INICIAL.reduce((s, i) => s + (i.precioAnt ? (i.precioAnt - i.precio) * i.qty : 0), 0)
  const cupon     = Math.round((subtotal - descuento) * 0.1)
  const total     = subtotal - descuento - cupon

  const NUM_PEDIDO = 'P-2025-00182'
  const wppLink = `https://wa.me/${TIENDA.wpp}?text=${encodeURIComponent(
    `Hola! Quiero enviar el comprobante de pago del pedido #${NUM_PEDIDO}. Total: ${fmt(total)}.`
  )}`

  function confirmar() {
    if (metodo === 'transferencia') {
      setMostrarWpp(true)
    } else {
      router.push(`${base}/checkout/confirmacion`)
    }
  }

  // ── Pantalla intermediaria: envío de comprobante por WhatsApp ──
  if (mostrarWpp) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          height: 60, background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)',
          padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <a href={base} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #2563EB, #3B82F6)', display: 'grid', placeItems: 'center' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{TIENDA.nombre}</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-muted)' }}>
            <Lock size={13} strokeWidth={1.5} /> Pago seguro · SSL 256-bit
          </div>
        </header>

        <div style={{ maxWidth: 560, margin: '0 auto', padding: '60px 24px 80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

          {/* Icono animado */}
          <style>{`
            @keyframes sf-pop { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
            .sf-wpp-icon { animation: sf-pop 420ms cubic-bezier(.34,1.56,.64,1) both; }
            @keyframes sf-fadein { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
            .sf-wpp-body { animation: sf-fadein 350ms 200ms ease both; }
          `}</style>

          <div className="sf-wpp-icon" style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'linear-gradient(135deg, #16A34A, #22C55E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 40px rgba(34,197,94,0.30)',
            marginBottom: 28,
          }}>
            <CheckCircle2 size={44} strokeWidth={1.5} color="#fff" />
          </div>

          <div className="sf-wpp-body" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                ¡Pedido registrado!
              </h1>
              <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: 0, lineHeight: 1.6, maxWidth: 380 }}>
                Tu pedido <strong style={{ color: 'var(--color-text)' }}>#{NUM_PEDIDO}</strong> fue recibido correctamente.
                Para completarlo, envianos el comprobante de la transferencia por WhatsApp.
              </p>
            </div>

            {/* Card con datos de la transferencia a modo de recordatorio */}
            <div style={{
              width: '100%', padding: '16px 20px', borderRadius: 12,
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-subtle)', marginBottom: 12 }}>
                Datos de la transferencia
              </div>
              {[['CBU', '0720049288000012345678'], ['Alias', 'rama.indumentaria'], ['Titular', 'Rama Indumentaria S.A.S.'], ['Total a transferir', fmt(total)]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--color-border)', alignItems: 'baseline' }}>
                  <span style={{ color: 'var(--color-subtle)', minWidth: 130, fontSize: 11, textTransform: 'uppercase', fontWeight: 600, flexShrink: 0 }}>{k}</span>
                  <span style={{ color: 'var(--color-text)', fontWeight: 600, fontFamily: '"Geist Mono", monospace', fontSize: 13, wordBreak: 'break-all' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Botón WhatsApp */}
            <a
              href={wppLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '100%', height: 56, borderRadius: 14, textDecoration: 'none',
                background: '#25D366', color: '#fff',
                fontSize: 15, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 8px 28px rgba(37,211,102,0.35)',
                transition: 'opacity 150ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.90')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <MessageCircle size={20} strokeWidth={1.5} />
              Enviar comprobante por WhatsApp
            </a>

            <p style={{ fontSize: 12, color: 'var(--color-subtle)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
              Una vez que recibamos el comprobante, confirmamos tu pedido.
            </p>

            {/* Link secundario */}
            <button
              onClick={() => router.push(`${base}/checkout/confirmacion?metodo=transferencia`)}
              style={{
                fontSize: 13, color: 'var(--color-primary)', fontWeight: 600,
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 0',
              }}
            >
              Ya lo envié, ver mi pedido <ArrowRight size={13} />
            </button>

          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        height: 60, background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)',
        padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href={base} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #2563EB, #3B82F6)', display: 'grid', placeItems: 'center' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{TIENDA.nombre}</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-muted)' }}>
          <Lock size={13} strokeWidth={1.5} /> Pago seguro · SSL 256-bit
        </div>
      </header>

      <style>{`
        @media (max-width: 768px) {
          .sf-pago-wrap   { padding: 24px 16px 48px !important; }
          .sf-pago-layout { grid-template-columns: 1fr !important; }
          .sf-pago-aside  { position: static !important; }
        }
      `}</style>
      <div className="sf-pago-wrap" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 64px' }}>
        <CheckoutStepper step={2} />
        <div className="sf-pago-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'flex-start' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 16px' }}>Método de pago</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {METODOS.map(m => {
                  const active = metodo === m.id
                  return (
                    <div
                      key={m.id}
                      onClick={() => setMetodo(m.id)}
                      style={{
                        padding: 16, borderRadius: 10, cursor: 'pointer',
                        background: active ? 'var(--color-primary-bg)' : 'var(--color-bg)',
                        border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        transition: 'all 150ms',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                          background: active ? 'var(--color-primary)' : 'transparent',
                          border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
                          display: 'grid', placeItems: 'center',
                        }}>
                          {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                        </div>
                        <m.Icon size={20} strokeWidth={1.5} color="var(--color-body)" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{m.titulo}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>{m.desc}</div>
                        </div>
                      </div>

                      {/* ── Panel Mercado Pago ── */}
                      {active && m.id === 'mp' && (
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

                          {/* QR */}
                          <div style={{ padding: 20, background: 'var(--color-surface)', borderRadius: 10, border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            <div style={{ display: 'inline-block', padding: 14, background: '#fff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
                              <div style={{ width: 160, height: 160, background: 'repeating-conic-gradient(#0F172A 0% 25%, #fff 0% 50%) 50% / 11px 11px', border: '5px solid #fff' }} />
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-body)' }}>Abrí Mercado Pago y escaneá el QR</div>
                          </div>

                          {/* Separador */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                            <span style={{ fontSize: 12, color: 'var(--color-subtle)', fontWeight: 500 }}>o</span>
                            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                          </div>

                          {/* Botón MP */}
                          <button style={{
                            width: '100%', height: 52, borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: '#009EE3',
                            color: '#fff', fontSize: 14, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            boxShadow: '0 4px 16px rgba(0,158,227,0.30)',
                            transition: 'opacity 150ms',
                          }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.90')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                          >
                            {/* MP logotipo simplificado */}
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                              <circle cx="11" cy="11" r="11" fill="rgba(255,255,255,0.20)" />
                              <path d="M5 11.5C5 8.46 7.46 6 10.5 6c1.65 0 3.12.73 4.13 1.88L17 6.5C15.54 4.97 13.63 4 11.5 4 7.36 4 4 7.36 4 11.5S7.36 19 11.5 19c2.13 0 4.04-.97 5.5-2.5l-2.37-1.38A4.47 4.47 0 0 1 11.5 17 4.5 4.5 0 0 1 7 12.5" fill="#fff" />
                              <circle cx="15.5" cy="11.5" r="2" fill="#fff" />
                            </svg>
                            <CreditCard size={16} strokeWidth={2} />
                            Pagá con tarjeta vía Mercado Pago
                          </button>
                        </div>
                      )}

                      {/* ── Panel Transferencia ── */}
                      {active && m.id === 'transferencia' && (
                        <div style={{ marginTop: 16, padding: 16, borderRadius: 10, background: 'var(--color-success-bg)', border: '1px solid rgba(16,185,129,0.30)' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12 }}>Datos para transferir</div>
                          {[['CBU', '0720049288000012345678'], ['Alias', 'rama.indumentaria'], ['Titular', 'Rama Indumentaria S.A.S.']].map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', gap: 8, padding: '6px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.50)', marginBottom: 6 }}>
                              <span style={{ color: 'var(--color-subtle)', minWidth: 56, fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>{k}</span>
                              <span style={{ color: 'var(--color-text)', fontWeight: 600, fontFamily: '"Geist Mono", monospace', fontSize: 13 }}>{v}</span>
                            </div>
                          ))}
                          <div style={{ fontSize: 12, color: 'var(--color-success)', marginTop: 10, fontWeight: 500 }}>
                            Coordinamos la confirmación del pago por WhatsApp.
                          </div>
                        </div>
                      )}

                      {/* ── Panel Retiro por local ── */}
                      {active && m.id === 'retiro' && (
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>

                          {/* Info de reserva */}
                          <div style={{ padding: 14, borderRadius: 10, background: 'var(--color-warning-bg)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <CheckCircle2 size={16} strokeWidth={2} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Tu stock queda reservado</div>
                              <div style={{ fontSize: 12, color: 'var(--color-body)', marginTop: 2 }}>Al confirmar, reservamos los productos. Abonás al retirar.</div>
                            </div>
                          </div>

                          {/* Datos del local */}
                          <div style={{ padding: 16, borderRadius: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-subtle)', marginBottom: 12 }}>Punto de retiro</div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                              <Store size={16} strokeWidth={1.5} color="var(--color-muted)" style={{ flexShrink: 0, marginTop: 1 }} />
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{TIENDA.nombre}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 1 }}>Av. Corrientes 1234, CABA</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <Clock size={15} strokeWidth={1.5} color="var(--color-muted)" style={{ flexShrink: 0 }} />
                              <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Lun–Sáb · 10:00 a 19:00</span>
                            </div>
                          </div>

                          {/* Formas de pago en local */}
                          <div style={{ padding: 14, borderRadius: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-subtle)', marginBottom: 10 }}>Aceptamos al retirar</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {['Efectivo', 'Débito', 'Crédito'].map(p => (
                                <span key={p} style={{ height: 28, padding: '0 12px', borderRadius: 999, background: 'var(--color-bg)', border: '1px solid var(--color-border)', fontSize: 12, fontWeight: 500, color: 'var(--color-body)', display: 'inline-flex', alignItems: 'center' }}>
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              onClick={confirmar}
              style={{
                width: '100%', height: 56, borderRadius: 12,
                background: 'var(--color-primary)', color: '#fff',
                fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 12px 32px rgba(59,130,246,0.30)',
              }}
            >
              <Lock size={16} strokeWidth={1.5} />
              {metodo === 'retiro' ? 'Reservar y retirar en local' : 'Confirmar compra'} ·{' '}
              <span style={{ fontFamily: '"Geist Mono", monospace' }}>{fmt(total)}</span>
            </button>

            <button onClick={() => router.push(`${base}/checkout/datos`)} style={{
              fontSize: 13, color: 'var(--color-primary)', fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
            }}>
              <ChevronLeft size={14} /> Volver a datos
            </button>
          </div>

          <aside className="sf-pago-aside" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24, position: 'sticky', top: 76 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-subtle)', marginBottom: 14 }}>
              Resumen del pedido
            </div>
            {CARRITO_INICIAL.map((it, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', alignItems: 'center' }}>
                <Thumb hue={it.hue} size={56} radius={8} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.nombre}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-subtle)', marginTop: 2 }}>x{it.qty}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmt(it.precio * it.qty)}</div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, marginTop: 4 }}>
              {descuento > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                  <span style={{ color: 'var(--color-body)' }}>Ofertas</span>
                  <span style={{ color: 'var(--color-success)', fontFamily: '"Geist Mono", monospace' }}>−{fmt(descuento)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                <span style={{ color: 'var(--color-body)' }}>Cupón ORBITA10</span>
                <span style={{ color: 'var(--color-success)', fontFamily: '"Geist Mono", monospace' }}>−{fmt(cupon)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 10, marginTop: 6, borderTop: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmt(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
