import { ProductoCardPOS } from './ProductoCardPOS'
import type { ProductoPOS } from '../../types'

interface Props {
  titulo: string
  productos: ProductoPOS[]
  cargando?: boolean
  onAgregarProducto: (producto: ProductoPOS) => void
}

function SkeletonCard() {
  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 10,
        overflow: 'hidden',
        background: 'var(--color-bg)',
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 10',
          background: 'var(--color-surface)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <div style={{ padding: '8px 10px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            height: 12,
            borderRadius: 4,
            background: 'var(--color-surface)',
            width: '80%',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: 12,
            borderRadius: 4,
            background: 'var(--color-surface)',
            width: '50%',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  )
}

export function GrillaProductos({ titulo, productos, cargando = false, onAgregarProducto }: Props) {
  return (
    <div>
      <p
        style={{
          margin: '0 0 10px',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--color-muted)',
        }}
      >
        {titulo}
        {!cargando && (
          <span style={{ fontWeight: 400, marginLeft: 6 }}>· {productos.length}</span>
        )}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: 10,
        }}
      >
        {cargando
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : productos.map((p) => (
              <ProductoCardPOS key={p.id} producto={p} onClick={onAgregarProducto} />
            ))}
      </div>
    </div>
  )
}
