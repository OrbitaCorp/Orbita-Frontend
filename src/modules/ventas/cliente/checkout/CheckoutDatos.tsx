import { useState } from 'react'
import { useRouter } from 'next/router'
import { MapPin, Mail, Phone, Plus, X, ArrowRight, ChevronLeft } from 'lucide-react'
import { CheckoutStepper } from '@/components/storefront/CheckoutStepper'
import { Thumb } from '@/components/storefront/Thumb'
import { TIENDA, CARRITO_INICIAL, DIRECCIONES } from '@/lib/storefront/mock'
import { fmt } from '@/lib/storefront/utils'

export default function CheckoutDatos() {
  const router = useRouter()
  const { slug } = router.query as { slug: string }
  const base = `/tienda/${slug}`

  const [dirSel,     setDirSel]     = useState('d1')
  const [showNewDir, setShowNewDir] = useState(false)

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
          🔒 Pago seguro
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 64px' }}>
        <CheckoutStepper step={1} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'flex-start' }}>

          <form style={{ display: 'flex', flexDirection: 'column', gap: 20 }} onSubmit={e => { e.preventDefault(); router.push(`${base}/checkout/pago`) }}>

            <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 16px' }}>¿Quién recibe el pedido?</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <F label="Nombre"><I placeholder="María" /></F>
                <F label="Apellido"><I placeholder="Fernández" /></F>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <F label="Email"><I type="email" placeholder="hola@mail.com" icon={<Mail size={15} strokeWidth={1.5} color="var(--color-subtle)" />} /></F>
                <F label="Teléfono"><I type="tel" placeholder="+54 9 11..." icon={<Phone size={15} strokeWidth={1.5} color="var(--color-subtle)" />} /></F>
              </div>
            </div>

            <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 8px' }}>Información de entrega</h2>
              <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 20 }}>
                Coordinamos el envío por WhatsApp después de confirmar el pago.
              </p>

              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>
                ¿Tenés una dirección guardada?
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                {DIRECCIONES.map(d => {
                  const active = dirSel === d.id
                  return (
                    <label
                      key={d.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: 16, borderRadius: 10, cursor: 'pointer',
                        background: active ? 'var(--color-primary-bg)' : 'var(--color-bg)',
                        border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      }}
                    >
                      <input type="radio" name="dir" checked={active} onChange={() => setDirSel(d.id)} style={{ accentColor: 'var(--color-primary)' }} />
                      <MapPin size={20} strokeWidth={1.5} color="var(--color-muted)" />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{d.alias}</span>
                          {d.default && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-success)', background: 'var(--color-success-bg)', padding: '2px 8px', borderRadius: 999 }}>Predeterminada</span>}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>
                          {d.calle}{d.piso ? ` · ${d.piso}` : ''} · {d.ciudad} · CP {d.cp}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
              <button type="button" onClick={() => setShowNewDir(!showNewDir)} style={{
                fontSize: 13, fontWeight: 500, color: 'var(--color-primary)',
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                {showNewDir ? <X size={14} /> : <Plus size={14} />}
                {showNewDir ? 'Ocultar formulario' : 'Agregar nueva dirección'}
              </button>

              {showNewDir && (
                <div style={{ marginTop: 14 }}>
                  <F label="Dirección" style={{ marginBottom: 14 }}>
                    <I placeholder="Av. Corrientes 1234" icon={<MapPin size={15} strokeWidth={1.5} color="var(--color-subtle)" />} />
                  </F>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <F label="Piso"><I placeholder="5" /></F>
                    <F label="Departamento"><I placeholder="B" /></F>
                    <F label="Entre calles"><I placeholder="Opcional" /></F>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 14 }}>
                    <F label="Provincia">
                      <select style={{ width: '100%', height: 44, padding: '0 14px', borderRadius: 8, background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: 14, outline: 'none' }}>
                        <option>CABA</option><option>Buenos Aires</option><option>Córdoba</option>
                      </select>
                    </F>
                    <F label="Ciudad"><I placeholder="CABA" /></F>
                    <F label="CP"><I placeholder="C1043" /></F>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => router.push(`${base}/carrito`)} style={{
                fontSize: 13, color: 'var(--color-primary)', fontWeight: 500,
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                <ChevronLeft size={14} /> Volver al carrito
              </button>
              <button type="submit" style={{
                height: 52, padding: '0 28px', borderRadius: 10,
                background: 'var(--color-primary)', color: '#fff',
                fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(59,130,246,0.30)',
              }}>
                Continuar con el pago <ArrowRight size={16} strokeWidth={2} />
              </button>
            </div>
          </form>

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
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>
                  {fmt(it.precio * it.qty)}
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, marginTop: 4 }}>
              {descuento > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, color: 'var(--color-body)' }}>
                  <span>Ofertas</span>
                  <span style={{ color: 'var(--color-success)', fontFamily: '"Geist Mono", monospace' }}>−{fmt(descuento)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, color: 'var(--color-body)' }}>
                <span>Cupón</span>
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

function F({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>{label}</label>
      {children}
    </div>
  )
}

function I({ placeholder, type = 'text', icon }: { placeholder?: string; type?: string; icon?: React.ReactNode }) {
  return (
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>{icon}</span>}
      <input type={type} placeholder={placeholder} style={{
        width: '100%', height: 44, padding: `0 14px 0 ${icon ? 40 : 14}px`,
        borderRadius: 8, border: '1px solid var(--color-border)',
        background: 'var(--color-bg)', color: 'var(--color-text)',
        fontSize: 14, outline: 'none', boxSizing: 'border-box',
      }} />
    </div>
  )
}
