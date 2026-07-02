import { useState } from 'react'
import { Percent, DollarSign, Receipt, FileText, ArrowLeftRight, Gift, Package, ChevronDown, ChevronUp } from 'lucide-react'
import type { TipoDescuento } from '../types'

interface TipoCard {
  tipo: TipoDescuento
  icono: React.ReactNode
  nombre: string
  desc: string
}

const CARDS_BASICOS: TipoCard[] = [
  { tipo: 'porcentaje_producto',   icono: <Percent size={16} strokeWidth={2} />,       nombre: '% Producto',      desc: 'Descuento porcentual sobre productos elegidos' },
  { tipo: 'monto_fijo_producto',   icono: <DollarSign size={16} strokeWidth={2} />,    nombre: '$ Fijo Producto', desc: 'Monto fijo sobre productos elegidos' },
  { tipo: 'porcentaje_ticket',     icono: <Receipt size={16} strokeWidth={2} />,        nombre: '% Ticket',        desc: 'Descuento porcentual sobre el total del ticket' },
  { tipo: 'monto_fijo_ticket',     icono: <FileText size={16} strokeWidth={2} />,      nombre: '$ Fijo Ticket',   desc: 'Monto fijo sobre el total del ticket' },
]

const CARDS_AVANZADOS: TipoCard[] = [
  { tipo: 'lleva_x_paga_y',     icono: <ArrowLeftRight size={16} strokeWidth={2} />, nombre: 'Llevá X Pagá Y',    desc: 'El cliente lleva X productos y paga solo Y' },
  { tipo: 'compra_x_obtiene_z', icono: <Gift size={16} strokeWidth={2} />,           nombre: 'Comprá X Obtené Z', desc: 'Regalá un producto al comprar otros' },
  { tipo: 'volumen',            icono: <Package size={16} strokeWidth={2} />,        nombre: 'Volumen',           desc: 'Descuentos escalonados por cantidad' },
]

interface Props {
  tipo: TipoDescuento | null
  onChange: (tipo: TipoDescuento) => void
  error?: string
}

function CardGrid({ cards, tipo, onChange }: { cards: TipoCard[]; tipo: TipoDescuento | null; onChange: (t: TipoDescuento) => void }) {
  return (
    <div className="tds-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
      {cards.map((card) => {
        const activo = tipo === card.tipo
        return (
          <button
            key={card.tipo}
            type="button"
            onClick={() => onChange(card.tipo)}
            style={{
              textAlign: 'left', padding: 16, borderRadius: 10, cursor: 'pointer',
              border: `1.5px solid ${activo ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: activo ? 'var(--color-primary-bg)' : 'var(--color-bg)',
              transition: 'border-color 150ms ease, background 150ms ease',
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 8, marginBottom: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: activo ? 'var(--color-primary)' : 'var(--color-surface-alt)',
              color: activo ? '#fff' : 'var(--color-body)',
              transition: 'background 150ms ease, color 150ms ease',
            }}>
              {card.icono}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: activo ? 'var(--color-primary-h)' : 'var(--color-text)', marginBottom: 2 }}>
              {card.nombre}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.4 }}>
              {card.desc}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export function TipoDescuentoSelector({ tipo, onChange, error }: Props) {
  const [expandido, setExpandido] = useState(() => CARDS_AVANZADOS.some((c) => c.tipo === tipo))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <style>{`@media (max-width: 768px) { .tds-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
      <CardGrid cards={CARDS_BASICOS} tipo={tipo} onChange={onChange} />

      <button
        type="button"
        onClick={() => setExpandido((v) => !v)}
        style={{
          alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 5,
          height: 30, padding: '0 12px', borderRadius: 8,
          border: '1px solid var(--color-border)', background: 'transparent',
          color: 'var(--color-muted)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
        }}
      >
        {expandido ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        Descuentos avanzados
      </button>

      {expandido && (
        <div className="tds-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {CARDS_AVANZADOS.map((card) => {
            const activo = tipo === card.tipo
            return (
              <button
                key={card.tipo}
                type="button"
                onClick={() => onChange(card.tipo)}
                style={{
                  textAlign: 'left', padding: 16, borderRadius: 10, cursor: 'pointer',
                  border: `1.5px solid ${activo ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: activo ? 'var(--color-primary-bg)' : 'var(--color-bg)',
                  transition: 'border-color 150ms ease, background 150ms ease',
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 8, marginBottom: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: activo ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                  color: activo ? '#fff' : 'var(--color-body)',
                  transition: 'background 150ms ease, color 150ms ease',
                }}>
                  {card.icono}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: activo ? 'var(--color-primary-h)' : 'var(--color-text)', marginBottom: 2 }}>
                  {card.nombre}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.4 }}>
                  {card.desc}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {error && <p style={{ margin: 0, fontSize: 12, color: 'var(--color-error)' }}>{error}</p>}
    </div>
  )
}
