import { useState } from 'react'
import { useRouter } from 'next/router'
import { RefreshCw, ChevronLeft } from 'lucide-react'
import { StorefrontHeader } from '@/components/storefront/StorefrontHeader'
import { StorefrontFooter } from '@/components/storefront/StorefrontFooter'
import { Breadcrumb } from '@/components/storefront/Breadcrumb'
import { Thumb } from '@/components/storefront/Thumb'
import { TIENDA, CARRITO_INICIAL, PEDIDO_MOCK } from '@/lib/storefront/mock'
import { openWpp } from '@/lib/storefront/utils'

const TALLES = ['XS','S','M','L','XL']

export default function InicioCambio() {
  const router = useRouter()
  const { slug, id } = router.query as { slug: string; id: string }
  const base = `/tienda/${slug}`

  const [seleccionado, setSeleccionado] = useState(CARRITO_INICIAL[0].id)
  const [nuevoTalle,   setNuevoTalle]   = useState('L')
  const [nota,         setNota]         = useState('')

  const itemSel = CARRITO_INICIAL.find(i => i.id === seleccionado)
  const msg = itemSel
    ? `Hola! Quiero solicitar un cambio del pedido #${PEDIDO_MOCK.id}. Producto: ${itemSel.nombre}, ${itemSel.variante}. Lo quiero cambiar por talle ${nuevoTalle}.${nota ? ' Detalle: ' + nota : ''}`
    : `Hola! Quiero solicitar un cambio del pedido #${PEDIDO_MOCK.id}.`

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <StorefrontHeader tienda={TIENDA} carrito={CARRITO_INICIAL} logged />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 32px 64px' }}>
        <Breadcrumb items={[
          { label: 'Inicio', href: base },
          { label: 'Mi cuenta' },
          { label: `Pedido #${PEDIDO_MOCK.id}`, href: `${base}/pedido/${id}` },
          { label: 'Iniciar cambio' },
        ]} />

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', color: '#4338CA', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <RefreshCw size={22} strokeWidth={1.5} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Iniciar un cambio</h1>
            <p style={{ fontSize: 14, color: 'var(--color-muted)', marginTop: 4 }}>
              Seleccioná el producto y el nuevo talle o modelo que querés. Coordinamos el resto por WhatsApp.
            </p>
          </div>
        </div>

        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '4px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-subtle)', padding: '16px 0 8px' }}>
            Pedido #{PEDIDO_MOCK.id}
          </div>
          {CARRITO_INICIAL.map(it => {
            const active = seleccionado === it.id
            return (
              <div key={it.id}>
                <label style={{
                  display: 'grid', gridTemplateColumns: '24px 64px 1fr',
                  gap: 14, alignItems: 'center',
                  padding: '14px 12px', margin: '0 -12px', borderRadius: 8,
                  background: active ? 'var(--color-primary-bg)' : 'transparent',
                  border: `1px solid ${active ? 'var(--color-primary)' : 'transparent'}`,
                  cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => setSeleccionado(active ? '' : it.id)}
                    style={{ accentColor: 'var(--color-primary)', width: 18, height: 18 }}
                  />
                  <Thumb hue={it.hue} size={64} radius={8} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{it.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>{it.variante} · x{it.qty}</div>
                  </div>
                </label>

                {active && (
                  <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 16, margin: '8px 0 12px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>¿Qué talle necesitás?</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                      {TALLES.map(s => (
                        <button key={s} onClick={() => setNuevoTalle(s)} style={{
                          minWidth: 48, height: 36, padding: '0 12px', borderRadius: 8,
                          background: nuevoTalle === s ? 'var(--color-text)' : 'var(--color-bg)',
                          color: nuevoTalle === s ? 'var(--color-bg)' : 'var(--color-text)',
                          border: `1px solid ${nuevoTalle === s ? 'var(--color-text)' : 'var(--color-border)'}`,
                          fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}>{s}</button>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-body)', marginBottom: 6 }}>
                      O describí el cambio que querés (opcional)
                    </div>
                    <textarea
                      value={nota}
                      onChange={e => setNota(e.target.value)}
                      placeholder="Ej: cambio por talle XL o el mismo en blanco"
                      style={{
                        width: '100%', minHeight: 64, padding: 10, borderRadius: 8, boxSizing: 'border-box',
                        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                        color: 'var(--color-text)', fontSize: 13, fontFamily: 'inherit', resize: 'vertical',
                        outline: 'none',
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 14 }}>¿Cómo funciona?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {['Seleccioná el producto y el nuevo talle/modelo.', 'Coordinamos con vos por WhatsApp.', 'Enviás el original y recibís el cambio.'].map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{i + 1}</span>
                <div style={{ fontSize: 13, color: 'var(--color-body)', lineHeight: 1.5, paddingTop: 3 }}>{p}</div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => openWpp(TIENDA.wpp, msg)} style={{
          width: '100%', height: 52, borderRadius: 10,
          background: '#25D366', color: '#fff',
          fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 4px 16px rgba(37,211,102,0.30)',
        }}>
          💬 Solicitar cambio por WhatsApp
        </button>

        <button onClick={() => router.push(`${base}/pedido/${id}`)} style={{
          marginTop: 16, fontSize: 13, color: 'var(--color-primary)', fontWeight: 500,
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <ChevronLeft size={14} /> Volver al seguimiento
        </button>
      </div>

      <StorefrontFooter tienda={TIENDA} slug={slug} />
    </div>
  )
}
