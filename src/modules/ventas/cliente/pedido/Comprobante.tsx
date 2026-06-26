import { useRouter } from 'next/router'
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Thumb } from '@/components/storefront/Thumb'
import { TIENDA, CARRITO_INICIAL, PEDIDO_MOCK } from '@/lib/storefront/mock'
import { fmt } from '@/lib/storefront/utils'

export default function Comprobante() {
  const router = useRouter()
  const { slug, id } = router.query as { slug: string; id: string }
  const base = `/tienda/${slug}`

  const subtotal  = CARRITO_INICIAL.reduce((s, i) => s + i.precio * i.qty, 0)
  const descuento = CARRITO_INICIAL.reduce((s, i) => s + (i.precioAnt ? (i.precioAnt - i.precio) * i.qty : 0), 0)
  const cupon     = Math.round((subtotal - descuento) * 0.1)
  const total     = subtotal - descuento - cupon

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .receipt-wrap { box-shadow: none !important; border: none !important; }
        }
        @media (max-width: 640px) {
          .sf-comp-bar  { padding: 0 16px !important; }
          .sf-comp-body { padding: 24px 12px 48px !important; }
        }
      `}</style>

      {/* Barra de acciones — oculta al imprimir */}
      <div className="no-print sf-comp-bar" style={{
        position: 'sticky', top: 0, zIndex: 50,
        height: 60, background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)',
        padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button
          onClick={() => router.push(`${base}/pedido/${id}`)}
          style={{
            fontSize: 13, color: 'var(--color-primary)', fontWeight: 500,
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          <ArrowLeft size={14} /> Volver al pedido
        </button>
        <button
          onClick={() => window.print()}
          style={{
            height: 38, padding: '0 16px', borderRadius: 8,
            background: 'var(--color-primary)', color: '#fff',
            fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 7,
            boxShadow: '0 2px 10px rgba(59,130,246,0.25)',
          }}
        >
          <Printer size={14} strokeWidth={1.5} /> Imprimir comprobante
        </button>
      </div>

      {/* Comprobante */}
      <div className="sf-comp-body" style={{ minHeight: 'calc(100vh - 60px)', background: '#F1F5F9', padding: '40px 24px 64px', display: 'flex', justifyContent: 'center' }}>
        <div
          className="receipt-wrap"
          style={{
            width: '100%', maxWidth: 680,
            background: '#fff', borderRadius: 16,
            boxShadow: '0 4px 40px rgba(0,0,0,0.10)',
            overflow: 'hidden',
          }}
        >

          {/* Cabecera tienda */}
          <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', padding: '32px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.20)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{TIENDA.nombre.charAt(0)}</span>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{TIENDA.nombre}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>{TIENDA.dominio}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>Comprobante de pago</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: '"Geist Mono", monospace', letterSpacing: '-0.01em' }}>#{PEDIDO_MOCK.id}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)', marginBottom: 4 }}>{PEDIDO_MOCK.fecha}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 24, padding: '0 10px', borderRadius: 999, background: 'rgba(255,255,255,0.20)', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                  <CheckCircle2 size={12} /> Confirmado
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '32px 36px' }}>

            {/* Método de pago */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28, padding: 20, background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', marginBottom: 4 }}>Método de pago</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{PEDIDO_MOCK.metodoPago ?? 'Mercado Pago'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', marginBottom: 4 }}>Estado del pago</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#16A34A' }}>Aprobado</div>
              </div>
            </div>

            {/* Datos del comprador */}
            {PEDIDO_MOCK.comprador && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', marginBottom: 14 }}>Datos del comprador</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    ['Nombre',    PEDIDO_MOCK.comprador.nombre],
                    ['Email',     PEDIDO_MOCK.comprador.email],
                    ['Teléfono',  PEDIDO_MOCK.comprador.telefono],
                    ['Dirección', PEDIDO_MOCK.comprador.direccion],
                  ].map(([k, v]) => (
                    <div key={k} style={{ gridColumn: k === 'Dirección' ? '1 / -1' : 'auto' }}>
                      <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 2 }}>{k}</div>
                      <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Separador */}
            <div style={{ height: 1, background: '#E2E8F0', marginBottom: 28 }} />

            {/* Productos */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', marginBottom: 16 }}>Productos</div>

              {/* Header tabla */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', gap: 12, padding: '8px 12px', background: '#F8FAFC', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B' }}>Producto</div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', textAlign: 'center' }}>Cant.</div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', textAlign: 'right' }}>Subtotal</div>
              </div>

              {CARRITO_INICIAL.map((it, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 80px 100px', gap: 12, alignItems: 'center',
                    padding: '12px', borderBottom: i < CARRITO_INICIAL.length - 1 ? '1px solid #F1F5F9' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Thumb hue={it.hue} size={44} radius={6} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{it.nombre}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{it.variante}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#475569', textAlign: 'center', fontFamily: '"Geist Mono", monospace' }}>x{it.qty}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', textAlign: 'right', fontFamily: '"Geist Mono", monospace' }}>
                    {fmt(it.precio * it.qty)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div style={{ background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', padding: '16px 20px' }}>
              {[
                ['Subtotal', fmt(subtotal), false],
                ...(descuento > 0 ? [['Descuentos', `−${fmt(descuento)}`, true]] : []),
                ['Cupón ORBITA10', `−${fmt(cupon)}`, true],
              ].map(([k, v, isDiscount]) => (
                <div key={String(k)} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13, color: '#475569' }}>
                  <span>{k}</span>
                  <span style={{ fontFamily: '"Geist Mono", monospace', color: isDiscount ? '#16A34A' : '#475569' }}>{v}</span>
                </div>
              ))}
              <div style={{ height: 1, background: '#E2E8F0', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>Total</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: '#1E293B', fontFamily: '"Geist Mono", monospace' }}>{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '20px 36px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>
              Este documento acredita la compra realizada en <strong style={{ color: '#64748B' }}>{TIENDA.nombre}</strong>.
            </div>
            <div style={{ fontSize: 11, color: '#CBD5E1', fontWeight: 600, letterSpacing: '0.04em' }}>
              Powered by Órbita
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
