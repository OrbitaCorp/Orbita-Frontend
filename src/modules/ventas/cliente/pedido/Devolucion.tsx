import { useState } from 'react'
import { useRouter } from 'next/router'
import { RotateCcw, ChevronLeft, AlertTriangle } from 'lucide-react'
import { StorefrontHeader } from '@/components/storefront/StorefrontHeader'
import { StorefrontFooter } from '@/components/storefront/StorefrontFooter'
import { Breadcrumb } from '@/components/storefront/Breadcrumb'
import { Thumb } from '@/components/storefront/Thumb'
import { TIENDA, CARRITO_INICIAL, PEDIDO_MOCK } from '@/lib/storefront/mock'
import { openWpp } from '@/lib/storefront/utils'

const MOTIVOS = ['Talle incorrecto', 'No era lo que esperaba', 'Producto defectuoso', 'Me arrepentí', 'Otro']

export default function InicioDevolucion() {
  const router = useRouter()
  const { slug, id } = router.query as { slug: string; id: string }
  const base = `/tienda/${slug}`

  const [seleccionado, setSeleccionado] = useState(CARRITO_INICIAL[1].id)
  const [motivo,       setMotivo]       = useState('Talle incorrecto')
  const [reembolso,    setReembolso]    = useState<'credito' | 'cuenta'>('credito')
  const [nota,         setNota]         = useState('')

  const itemSel = CARRITO_INICIAL.find(i => i.id === seleccionado)
  const msg = itemSel
    ? `Hola! Quiero solicitar la devolución del pedido #${PEDIDO_MOCK.id}. Producto: ${itemSel.nombre}. Motivo: ${motivo.toLowerCase()}.${nota ? ' Detalle: ' + nota : ''} Método: ${reembolso === 'credito' ? 'Nota de crédito' : 'Reembolso a cuenta original'}.`
    : `Hola! Quiero solicitar una devolución del pedido #${PEDIDO_MOCK.id}.`

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <StorefrontHeader tienda={TIENDA} carrito={CARRITO_INICIAL} logged />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 32px 64px' }}>
        <Breadcrumb items={[
          { label: 'Inicio', href: base },
          { label: 'Mi cuenta' },
          { label: `Pedido #${PEDIDO_MOCK.id}`, href: `${base}/pedido/${id}` },
          { label: 'Devolución' },
        ]} />

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(245,158,11,0.12)', color: '#B45309', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <RotateCcw size={22} strokeWidth={1.5} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Solicitar devolución</h1>
            <p style={{ fontSize: 14, color: 'var(--color-muted)', marginTop: 4 }}>
              Tenés hasta 30 días desde la compra para iniciar una devolución.
            </p>
          </div>
        </div>

        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '4px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-subtle)', padding: '16px 0 8px' }}>
            Seleccioná el producto a devolver
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
                  <input type="checkbox" checked={active} onChange={() => setSeleccionado(active ? '' : it.id)} style={{ accentColor: 'var(--color-primary)', width: 18, height: 18 }} />
                  <Thumb hue={it.hue} size={64} radius={8} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{it.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>{it.variante} · x{it.qty}</div>
                  </div>
                </label>

                {active && (
                  <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 16, margin: '8px 0 12px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>Motivo</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                      {MOTIVOS.map(m => (
                        <button key={m} onClick={() => setMotivo(m)} style={{
                          height: 32, padding: '0 12px', borderRadius: 999,
                          background: motivo === m ? 'var(--color-text)' : 'var(--color-bg)',
                          color: motivo === m ? 'var(--color-bg)' : 'var(--color-body)',
                          border: `1px solid ${motivo === m ? 'var(--color-text)' : 'var(--color-border)'}`,
                          fontSize: 12, fontWeight: 500, cursor: 'pointer',
                        }}>{m}</button>
                      ))}
                    </div>
                    <textarea value={nota} onChange={e => setNota(e.target.value)} placeholder="Contanos más detalles..."
                      style={{ width: '100%', minHeight: 72, padding: 10, borderRadius: 8, boxSizing: 'border-box', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }} />
                    <div style={{ marginTop: 10, padding: 12, background: 'var(--color-warning-bg)', border: '1px solid rgba(245,158,11,0.30)', borderRadius: 8, fontSize: 12, color: 'var(--color-body)', lineHeight: 1.5, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <AlertTriangle size={14} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span><strong style={{ color: 'var(--color-text)' }}>Importante:</strong> el producto debe estar sin uso, con etiquetas originales y en su packaging.</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12 }}>Método de reembolso</div>
          {[
            { id: 'credito' as const, titulo: 'Nota de crédito',             desc: 'Para usar en tu próxima compra', badge: 'Más rápido' },
            { id: 'cuenta' as const,  titulo: 'Reembolso a la cuenta original', desc: '5–10 días hábiles' },
          ].map(opt => {
            const active = reembolso === opt.id
            return (
              <label key={opt.id} style={{
                display: 'flex', gap: 12, alignItems: 'center',
                padding: 12, marginBottom: 8, borderRadius: 8, cursor: 'pointer',
                background: active ? 'var(--color-primary-bg)' : 'var(--color-surface)',
                border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}>
                <input type="radio" name="reembolso" checked={active} onChange={() => setReembolso(opt.id)} style={{ accentColor: 'var(--color-primary)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{opt.titulo}</span>
                    {opt.badge && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-success)', background: 'var(--color-success-bg)', padding: '2px 8px', borderRadius: 999 }}>{opt.badge}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>{opt.desc}</div>
                </div>
              </label>
            )
          })}
        </div>

        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 14 }}>¿Cómo funciona?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {['Enviá la solicitud por WhatsApp.', 'Coordinamos el retiro del producto.', 'Procesamos el reembolso elegido.'].map((p, i) => (
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
          💬 Enviar solicitud por WhatsApp
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
