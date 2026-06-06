import { useState } from 'react'
import { useRouter } from 'next/router'
import { CreditCard, QrCode, Landmark, Lock, ChevronLeft } from 'lucide-react'
import { CheckoutStepper } from '@/components/storefront/CheckoutStepper'
import { Thumb } from '@/components/storefront/Thumb'
import { TIENDA, CARRITO_INICIAL } from '@/lib/storefront/mock'
import { fmt } from '@/lib/storefront/utils'

type Metodo = 'tarjeta' | 'mp' | 'transferencia'

const METODOS = [
  { id: 'tarjeta' as Metodo,       Icon: CreditCard, titulo: 'Tarjeta de crédito o débito',   desc: 'Visa · Mastercard · Amex · hasta 6 cuotas' },
  { id: 'mp' as Metodo,            Icon: QrCode,     titulo: 'Mercado Pago / QR',              desc: 'Pagá con QR o link de pago' },
  { id: 'transferencia' as Metodo, Icon: Landmark,   titulo: 'Transferencia bancaria',         desc: 'CBU/Alias · Coordinás el comprobante por WhatsApp' },
]

export default function CheckoutPago() {
  const router  = useRouter()
  const { slug } = router.query as { slug: string }
  const base = `/tienda/${slug}`

  const [metodo, setMetodo] = useState<Metodo>('tarjeta')

  const subtotal  = CARRITO_INICIAL.reduce((s, i) => s + i.precio * i.qty, 0)
  const descuento = CARRITO_INICIAL.reduce((s, i) => s + (i.precioAnt ? (i.precioAnt - i.precio) * i.qty : 0), 0)
  const cupon     = Math.round((subtotal - descuento) * 0.1)
  const total     = subtotal - descuento - cupon

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

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 64px' }}>
        <CheckoutStepper step={2} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'flex-start' }}>

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

                      {active && m.id === 'tarjeta' && (
                        <div style={{ marginTop: 16, padding: 16, background: 'var(--color-surface)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>Número de tarjeta</label>
                              <input defaultValue="•••• •••• •••• 4521" style={{ width: '100%', height: 44, padding: '0 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 14, outline: 'none', fontFamily: '"Geist Mono", monospace', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                              <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>Vencimiento</label>
                                <input defaultValue="12/28" style={{ width: '100%', height: 44, padding: '0 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 14, outline: 'none', fontFamily: '"Geist Mono", monospace', boxSizing: 'border-box' }} />
                              </div>
                              <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>CVV</label>
                                <input defaultValue="•••" style={{ width: '100%', height: 44, padding: '0 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 14, outline: 'none', fontFamily: '"Geist Mono", monospace', boxSizing: 'border-box' }} />
                              </div>
                            </div>
                            <div>
                              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>Titular</label>
                              <input defaultValue="MARIA FERNANDEZ" style={{ width: '100%', height: 44, padding: '0 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                          </div>
                        </div>
                      )}

                      {active && m.id === 'mp' && (
                        <div style={{ marginTop: 16, padding: 20, background: 'var(--color-surface)', borderRadius: 10, textAlign: 'center', border: '1px solid var(--color-border)' }}>
                          <div style={{ display: 'inline-block', padding: 14, background: '#fff', borderRadius: 12 }}>
                            <div style={{ width: 180, height: 180, background: 'repeating-conic-gradient(#0F172A 0% 25%, #fff 0% 50%) 50% / 12px 12px', border: '6px solid #fff' }} />
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--color-body)', marginTop: 12, fontWeight: 500 }}>Abrí Mercado Pago y escaneá el QR</div>
                        </div>
                      )}

                      {active && m.id === 'transferencia' && (
                        <div style={{ marginTop: 16, padding: 16, borderRadius: 10, background: 'var(--color-success-bg)', border: '1px solid rgba(16,185,129,0.30)' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12 }}>Datos para transferir</div>
                          {[['CBU', '0720049288000012345678'], ['Alias', 'rama.indumentaria'], ['Titular', 'Rama Indumentaria S.A.S.']].map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', gap: 8, padding: '6px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.50)', marginBottom: 6 }}>
                              <span style={{ color: 'var(--color-subtle)', minWidth: 56, fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>{k}</span>
                              <span style={{ color: 'var(--color-text)', fontWeight: 600, fontFamily: '"Geist Mono", monospace', fontSize: 13 }}>{v}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              onClick={() => router.push(`${base}/checkout/confirmacion`)}
              style={{
                width: '100%', height: 56, borderRadius: 12,
                background: 'var(--color-primary)', color: '#fff',
                fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 12px 32px rgba(59,130,246,0.30)',
              }}
            >
              <Lock size={16} strokeWidth={1.5} /> Confirmar compra · <span style={{ fontFamily: '"Geist Mono", monospace' }}>{fmt(total)}</span>
            </button>

            <button onClick={() => router.push(`${base}/checkout/datos`)} style={{
              fontSize: 13, color: 'var(--color-primary)', fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
            }}>
              <ChevronLeft size={14} /> Volver a datos
            </button>
          </div>

          <aside style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24, position: 'sticky', top: 76 }}>
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
