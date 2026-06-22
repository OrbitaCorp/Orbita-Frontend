import type { CSSProperties } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import type { TicketItem } from '../../types'

const FORMATO = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const btnQty: CSSProperties = {
  width: 28,
  height: 28,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-body)',
  flexShrink: 0,
}

interface Props {
  item: TicketItem
  onIncrementar: () => void
  onDecrementar: () => void
  onRemover: () => void
}

export function TicketItemRow({ item, onIncrementar, onDecrementar, onRemover }: Props) {
  const precio = item.precioEditado ?? item.precioUnitario
  const subtotal = precio * item.cantidad

  return (
    <div
      style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Nombre + eliminar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 2,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--color-text)',
            lineHeight: 1.3,
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.nombre}
        </p>
        <button
          onClick={onRemover}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 2,
            color: 'var(--color-muted)',
            display: 'flex',
            flexShrink: 0,
            borderRadius: 4,
          }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Variante */}
      {item.variante && (
        <p style={{ margin: '2px 0 4px', fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.3 }}>
          {item.variante}
        </p>
      )}

      {/* Controles de cantidad + subtotal */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: item.variante ? 0 : 6,
        }}
      >
        {/* [-][qty][+] */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid var(--color-border)',
            borderRadius: 7,
            overflow: 'hidden',
          }}
        >
          <button onClick={onDecrementar} style={btnQty}>
            <Minus size={12} />
          </button>
          <span
            style={{
              width: 30,
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: '"Geist Mono", monospace',
              color: 'var(--color-text)',
              borderLeft: '1px solid var(--color-border)',
              borderRight: '1px solid var(--color-border)',
              lineHeight: '28px',
              display: 'block',
            }}
          >
            {item.cantidad}
          </span>
          <button onClick={onIncrementar} style={btnQty}>
            <Plus size={12} />
          </button>
        </div>

        {/* Precio c/u + subtotal */}
        <div style={{ textAlign: 'right' }}>
          {item.cantidad > 1 && (
            <p
              style={{
                margin: '0 0 1px',
                fontSize: 11,
                color: 'var(--color-muted)',
                fontFamily: '"Geist Mono", monospace',
              }}
            >
              $ {FORMATO.format(precio)} c/u
            </p>
          )}
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: '"Geist Mono", "Fira Code", monospace',
              color: 'var(--color-text)',
            }}
          >
            $ {FORMATO.format(subtotal)}
          </p>
        </div>
      </div>
    </div>
  )
}
