import { useRouter } from 'next/router'
import { Check, RefreshCw, RotateCcw, X, ChevronRight, Copy, Mail, MessageCircle } from 'lucide-react'
import { StorefrontHeader } from '@/components/storefront/StorefrontHeader'
import { StorefrontFooter } from '@/components/storefront/StorefrontFooter'
import { Breadcrumb } from '@/components/storefront/Breadcrumb'
import { Thumb } from '@/components/storefront/Thumb'
import { TIENDA, CARRITO_INICIAL, PEDIDO_MOCK } from '@/lib/storefront/mock'
import { fmt, openWpp } from '@/lib/storefront/utils'

export default function SeguimientoPedido() {
  const router = useRouter()
  const { slug, id } = router.query as { slug: string; id: string }
  const base = `/tienda/${slug}`

  const timeline    = PEDIDO_MOCK.timeline
  const currentStep = 3

  const statusLabel = currentStep <= 2 ? 'En preparación' : currentStep === 3 ? 'En camino' : 'Entregado'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <StorefrontHeader tienda={TIENDA} carrito={CARRITO_INICIAL} logged />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px 64px' }}>
        <Breadcrumb items={[
          { label: 'Inicio', href: base },
          { label: 'Mi cuenta' },
          { label: `Pedido #${PEDIDO_MOCK.id}` },
        ]} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>#{PEDIDO_MOCK.id}</div>
                <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>{PEDIDO_MOCK.fecha}</div>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                height: 24, padding: '0 10px', borderRadius: 999,
                background: 'var(--color-primary-bg)', color: 'var(--color-primary)',
                fontSize: 11, fontWeight: 700,
              }}>
                {statusLabel}
              </span>
            </div>

            <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Seguimiento del envío</h3>
                <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Transportista: <strong style={{ color: 'var(--color-text)' }}>Andreani</strong></div>
              </div>

              <div style={{
                background: 'var(--color-surface)', borderRadius: 10, padding: '14px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24,
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-subtle)', marginBottom: 4 }}>Código de tracking</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{PEDIDO_MOCK.tracking}</div>
                </div>
                <button style={{
                  height: 36, padding: '0 12px', borderRadius: 8,
                  background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-body)',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  <Copy size={13} strokeWidth={1.5} /> Copiar
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                {timeline.map((step, i) => {
                  const isDone   = i < currentStep
                  const isActive = i === currentStep && currentStep < timeline.length
                  return (
                    <div key={i} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: i < timeline.length - 1 ? 28 : 0 }}>
                      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: isDone ? 'var(--color-success)' : isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                          border: `2px solid ${isDone ? 'var(--color-success)' : isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          color: '#fff', display: 'grid', placeItems: 'center', zIndex: 2,
                        }}>
                          {isDone ? <Check size={14} strokeWidth={2.5} /> : isActive ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} /> : null}
                        </div>
                        {i < timeline.length - 1 && (
                          <div style={{
                            position: 'absolute', top: 28, bottom: -28, left: '50%',
                            width: 2, transform: 'translateX(-50%)',
                            background: isDone ? 'var(--color-success)' : 'var(--color-border)',
                          }} />
                        )}
                      </div>
                      <div style={{ flex: 1, paddingTop: 2 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: (isDone || isActive) ? 'var(--color-text)' : 'var(--color-muted)' }}>
                          {step.label}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-subtle)', marginTop: 2, fontFamily: '"Geist Mono", monospace' }}>
                          {step.fecha}
                        </div>
                        {isActive && (
                          <div style={{ fontSize: 12, color: 'var(--color-primary)', marginTop: 6 }}>
                            Tu paquete está en ruta. Llega aproximadamente mañana.
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 16px' }}>Detalle del pedido</h3>
              {CARRITO_INICIAL.map((it, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 0', borderBottom: i < CARRITO_INICIAL.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <Thumb hue={it.hue} size={64} radius={8} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>{it.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>{it.variante} · x{it.qty}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>
                    {fmt(it.precio * it.qty)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 14px' }}>Acciones del pedido</h3>
              {[
                { Icon: RefreshCw, label: 'Iniciar cambio',     href: `${base}/pedido/${id}/cambio`,     color: 'var(--color-body)' },
                { Icon: RotateCcw, label: 'Iniciar devolución', href: `${base}/pedido/${id}/devolucion`, color: 'var(--color-body)' },
                { Icon: X,         label: 'Cancelar pedido',    href: `${base}/pedido/${id}/cancelar`,   color: 'var(--color-error)' },
              ].map((a, i) => (
                <button
                  key={a.label}
                  onClick={() => router.push(a.href)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 4px', textAlign: 'left', width: '100%',
                    fontSize: 14, fontWeight: 500, color: a.color,
                    borderTop: i > 0 ? '1px solid var(--color-border)' : 'none',
                    background: 'none', border: 'none', cursor: 'pointer',
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <a.Icon size={16} strokeWidth={1.5} color={a.color} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{a.label}</span>
                  <ChevronRight size={14} color="var(--color-subtle)" />
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SideCard title="Contacto con la tienda">
              <button
                onClick={() => openWpp(TIENDA.wpp, `Hola! Tengo una consulta sobre mi pedido #${PEDIDO_MOCK.id}`)}
                style={{
                  width: '100%', height: 44, borderRadius: 10,
                  background: '#25D366', color: '#fff',
                  fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8,
                }}
              >
                <MessageCircle size={16} strokeWidth={1.5} /> WhatsApp
              </button>
              <button style={{
                width: '100%', height: 44, borderRadius: 10,
                background: 'transparent', color: 'var(--color-text)',
                border: '1px solid var(--color-border)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Mail size={16} strokeWidth={1.5} /> Email
              </button>
            </SideCard>

            <SideCard title="Entrega">
              <div style={{ fontSize: 13, color: 'var(--color-body)', lineHeight: 1.55 }}>
                <strong style={{ color: 'var(--color-text)' }}>María Fernández</strong><br />
                Av. Corrientes 1234, Piso 5 B<br />
                CABA · C1043AAZ
              </div>
              <button
                onClick={() => openWpp(TIENDA.wpp, `Hola! Quería consultar sobre el envío del pedido #${PEDIDO_MOCK.id}`)}
                style={{
                  marginTop: 12, fontSize: 13, color: 'var(--color-success)', fontWeight: 500,
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                <MessageCircle size={13} strokeWidth={1.5} /> Coordinar por WhatsApp →
              </button>
            </SideCard>
          </div>
        </div>
      </div>

      <StorefrontFooter tienda={TIENDA} slug={slug} />
    </div>
  )
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  )
}
