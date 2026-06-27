import { Percent, DollarSign, Receipt, FileText, ArrowLeftRight, Gift, Package } from 'lucide-react'
import type { TipoDescuento } from '../types'

interface TipoCard {
  tipo: TipoDescuento
  icono: React.ReactNode
  nombre: string
  desc: string
}

const CARDS: TipoCard[] = [
  { tipo: 'porcentaje_producto',   icono: <Percent size={16} strokeWidth={2} />,       nombre: '% Producto',         desc: 'Descuento porcentual sobre productos elegidos' },
  { tipo: 'monto_fijo_producto',   icono: <DollarSign size={16} strokeWidth={2} />,    nombre: '$ Fijo Producto',    desc: 'Monto fijo sobre productos elegidos' },
  { tipo: 'porcentaje_ticket',     icono: <Receipt size={16} strokeWidth={2} />,        nombre: '% Ticket',           desc: 'Descuento porcentual sobre el total del ticket' },
  { tipo: 'monto_fijo_ticket',     icono: <FileText size={16} strokeWidth={2} />,      nombre: '$ Fijo Ticket',      desc: 'Monto fijo sobre el total del ticket' },
  { tipo: 'lleva_x_paga_y',        icono: <ArrowLeftRight size={16} strokeWidth={2} />, nombre: 'Llevá X Pagá Y',   desc: 'El cliente lleva X productos y paga solo Y' },
  { tipo: 'compra_x_obtiene_z',    icono: <Gift size={16} strokeWidth={2} />,           nombre: 'Comprá X Obtené Z', desc: 'Regalá un producto al comprar otros' },
  { tipo: 'volumen',               icono: <Package size={16} strokeWidth={2} />,        nombre: 'Volumen',            desc: 'Descuentos escalonados por cantidad' },
]

const FILAS = [CARDS.slice(0, 4), CARDS.slice(4)]

interface Props {
  tipo: TipoDescuento | null
  onChange: (tipo: TipoDescuento) => void
  error?: string
}

export function TipoDescuentoSelector({ tipo, onChange, error }: Props) {
  return (
    <div>
      {FILAS.map((fila, fi) => (
        <div
          key={fi}
          style={{ display: 'grid', gridTemplateColumns: `repeat(${fila.length}, 1fr)`, gap: 10, marginBottom: fi < FILAS.length - 1 ? 10 : 0 }}
        >
          {fila.map((card) => {
            const activo = tipo === card.tipo
            return (
              <button
                key={card.tipo}
                type="button"
                onClick={() => onChange(card.tipo)}
                style={{
                  textAlign: 'left',
                  padding: 16,
                  borderRadius: 10,
                  border: `1.5px solid ${activo ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: activo ? 'var(--color-primary-bg)' : 'var(--color-bg)',
                  cursor: 'pointer',
                  transition: 'border-color 150ms ease, background 150ms ease',
                }}
              >
                <div
                  style={{
                    width: 34, height: 34, borderRadius: 8, marginBottom: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: activo ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                    color: activo ? '#fff' : 'var(--color-body)',
                    transition: 'background 150ms ease, color 150ms ease',
                  }}
                >
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
      ))}
      {error && <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-error)' }}>{error}</p>}
    </div>
  )
}
