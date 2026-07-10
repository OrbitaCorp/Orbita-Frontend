import { Package } from 'lucide-react'
import type { ProductoPOS } from '../../types'

const FORMATO = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function stockColor(stock: number): string {
  if (stock === 0) return 'var(--color-error)'
  if (stock <= 3) return 'var(--color-warning)'
  return 'var(--color-muted)'
}

interface Props {
  producto: ProductoPOS
  onClick: (producto: ProductoPOS) => void
}

export function ProductoCardPOS({ producto, onClick }: Props) {
  const sinStock = producto.stock === 0
  const bajoStock = !sinStock && producto.stock <= 3

  const handleClick = () => {
    if (sinStock) return
    onClick(producto)
  }

  return (
    <button
      onClick={handleClick}
      disabled={sinStock}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 0,
        border: '1px solid var(--color-border)',
        borderRadius: 10,
        background: sinStock ? 'var(--color-surface)' : 'var(--color-bg)',
        cursor: sinStock ? 'not-allowed' : 'pointer',
        opacity: sinStock ? 0.45 : 1,
        textAlign: 'left',
        fontFamily: 'inherit',
        overflow: 'hidden',
        transition: 'box-shadow 0.12s, border-color 0.12s',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        if (!sinStock) {
          const el = e.currentTarget
          el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
          el.style.borderColor = 'var(--color-primary)'
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.boxShadow = ''
        el.style.borderColor = 'var(--color-border)'
      }}
    >
      {/* Imagen / placeholder */}
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 10',
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-border)',
          flexShrink: 0,
        }}
      >
        {producto.foto ? (
          <img
            src={producto.foto}
            alt={producto.nombre}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Package size={24} strokeWidth={1.5} />
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '8px 10px 10px', width: '100%', boxSizing: 'border-box' }}>
        <p
          style={{
            margin: '0 0 4px',
            fontSize: 13,
            fontWeight: 500,
            color: sinStock ? 'var(--color-muted)' : 'var(--color-text)',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {producto.nombre}
        </p>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 4 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              fontFamily: '"Geist Mono", "Fira Code", monospace',
              color: sinStock ? 'var(--color-muted)' : 'var(--color-text)',
            }}
          >
            $ {FORMATO.format(producto.precio)}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: stockColor(producto.stock),
              whiteSpace: 'nowrap',
              fontFamily: '"Geist Mono", "Fira Code", monospace',
            }}
          >
            {sinStock ? 'Sin stock' : `${producto.stock} u.`}
          </span>
        </div>
      </div>
    </button>
  )
}
