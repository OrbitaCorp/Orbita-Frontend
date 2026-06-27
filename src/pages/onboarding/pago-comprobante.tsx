import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Check, Printer, ArrowLeft } from 'lucide-react'

const N_COMPROBANTE = 'OB-2025-004817'
const FECHA_HOY = new Date().toLocaleDateString('es-AR', {
  day: '2-digit', month: 'long', year: 'numeric',
})
const HORA_HOY = new Date().toLocaleTimeString('es-AR', {
  hour: '2-digit', minute: '2-digit',
})

const ITEMS = [
  { desc: 'Órbita Starter — Plan inicial',       qty: 1, precio: 5000 },
]

function fmt(n: number) {
  return `$${n.toLocaleString('es-AR')}`
}

export default function PagoComprobante() {
  const router = useRouter()

  useEffect(() => {
    if (router.query.print === '1') {
      const t = setTimeout(() => window.print(), 600)
      return () => clearTimeout(t)
    }
  }, [router.query.print])

  return (
    <>
      <style>{`
        @media print {
          .no-print  { display: none !important; }
          body       { background: #fff !important; }
          .comp-card { box-shadow: none !important; border: none !important; }
        }
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      `}</style>

      {/* Barra de acciones */}
      <div className="no-print" style={{
        position: 'sticky', top: 0, zIndex: 50, height: 56,
        background: 'var(--color-bg, #fff)',
        borderBottom: '1px solid var(--color-border, #E2E8F0)',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button
          onClick={() => router.back()}
          style={{
            fontSize: 13, color: '#2563EB', fontWeight: 500,
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          <ArrowLeft size={14} /> Volver
        </button>
        <button
          onClick={() => window.print()}
          style={{
            height: 36, padding: '0 14px', borderRadius: 8,
            background: '#2563EB', color: '#fff',
            fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
          }}
        >
          <Printer size={13} strokeWidth={1.5} /> Imprimir
        </button>
      </div>

      {/* Comprobante */}
      <div style={{
        minHeight: 'calc(100vh - 56px)',
        background: '#F1F5F9',
        padding: '36px 16px 64px',
        display: 'flex', justifyContent: 'center',
      }}>
        <div
          className="comp-card"
          style={{
            width: '100%', maxWidth: 620,
            background: '#fff',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 4px 40px rgba(0,0,0,0.10)',
          }}
        >
          {/* Cabecera verde */}
          <div style={{
            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            padding: '28px 32px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(255,255,255,0.20)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg viewBox="0 0 30 30" fill="none" style={{ width: 26, height: 26 }}>
                  <circle cx="15" cy="15" r="13" stroke="rgba(255,255,255,0.55)" strokeWidth="3.2" strokeDasharray="60 22" strokeLinecap="round"/>
                  <circle cx="25.5" cy="7.5" r="4" fill="rgba(255,255,255,0.85)"/>
                  <circle cx="15" cy="15" r="4.5" fill="white"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Órbita</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>orbita.site</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                  Comprobante de pago
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>
                  {N_COMPROBANTE}
                </div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.28)',
                borderRadius: 999, padding: '5px 13px',
              }}>
                <Check size={12} strokeWidth={3} color="white" />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Pago aprobado</span>
              </div>
            </div>
          </div>

          {/* Info del pago */}
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[
                ['Fecha',     FECHA_HOY],
                ['Hora',      HORA_HOY],
                ['Método',    'MercadoPago'],
                ['Estado',    'Aprobado'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Detalle de items */}
          <div style={{ padding: '24px 32px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>
              Detalle
            </div>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
              {/* Cabecera tabla */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 60px 100px',
                background: '#F8FAFC', padding: '10px 16px',
                borderBottom: '1px solid #E2E8F0',
              }}>
                {['Descripción', 'Cant.', 'Subtotal'].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: h !== 'Descripción' ? 'right' : 'left' as 'right' | 'left' }}>
                    {h}
                  </span>
                ))}
              </div>

              {ITEMS.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 60px 100px',
                    padding: '14px 16px',
                    borderBottom: i < ITEMS.length - 1 ? '1px solid #E2E8F0' : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{item.desc}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Período: 3 meses</div>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748B', textAlign: 'right', alignSelf: 'center' }}>{item.qty}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', textAlign: 'right', alignSelf: 'center', fontFamily: 'monospace' }}>
                    {fmt(item.precio)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div style={{ marginTop: 16 }}>
              {[
                ['Subtotal', fmt(5000)],
                ['IVA (21%)', '$0'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: 12, color: '#64748B' }}>{label}</span>
                  <span style={{ fontSize: 12, color: '#64748B', fontFamily: 'monospace' }}>{value}</span>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between', padding: '12px 0',
                borderTop: '2px solid #1E293B', marginTop: 4,
              }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#1E293B' }}>Total</span>
                <span style={{ fontSize: 17, fontWeight: 800, color: '#1E293B', fontFamily: 'monospace' }}>{fmt(5000)} ARS</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 32px',
            background: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
          }}>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>
              Este comprobante acredita el pago realizado a través de MercadoPago.
            </span>
            <span style={{ fontSize: 11, color: '#CBD5E1', fontFamily: 'monospace' }}>
              Powered by Órbita
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
