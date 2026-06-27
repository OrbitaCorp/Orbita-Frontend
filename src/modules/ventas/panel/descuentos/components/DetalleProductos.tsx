import { useState } from 'react'
import { Folder, Check } from 'lucide-react'
import { categoriasMock, productosMock } from '../mock/productos'
import type { Descuento } from '../types'

const MAX_VISIBLE = 5

interface Props { descuento: Descuento }

export function DetalleProductos({ descuento }: Props) {
  const [expandido, setExpandido] = useState(false)

  if (descuento.alcance === 'ticket') {
    return (
      <SectionWrap>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-muted)' }}>
          Aplica al ticket completo — sin restricción de productos.
        </p>
      </SectionWrap>
    )
  }

  if (descuento.alcance === 'categoria') {
    const cats = categoriasMock.filter((c) => descuento.categoriasIds?.includes(c.id))
    return (
      <SectionWrap>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {cats.map((c) => (
            <span
              key={c.id}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, height: 28, padding: '0 12px',
                borderRadius: 8, fontSize: 13, fontWeight: 500,
                background: 'var(--color-primary-bg)', color: 'var(--color-primary-h)',
                border: '1px solid rgba(59,130,246,.2)',
              }}
            >
              <Folder size={13} />
              {c.nombre}
            </span>
          ))}
          {cats.length === 0 && <p style={{ margin: 0, fontSize: 13, color: 'var(--color-muted)' }}>Sin categorías seleccionadas</p>}
        </div>
      </SectionWrap>
    )
  }

  // alcance === 'producto'
  const cats = categoriasMock.map((cat) => {
    const prods = (cat.productos ?? []).filter((p) => descuento.productosIds?.includes(p.id))
    return prods.length ? { cat, prods } : null
  }).filter(Boolean) as { cat: typeof categoriasMock[0]; prods: typeof productosMock }[]

  const totalProds = cats.reduce((acc, g) => acc + g.prods.length, 0)
  const needsExpand = totalProds > MAX_VISIBLE && !expandido

  return (
    <SectionWrap>
      {cats.length === 0 && (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-muted)' }}>Sin productos seleccionados</p>
      )}
      {cats.map(({ cat, prods }) => (
        <div key={cat.id} style={{ marginBottom: 8 }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              borderRadius: 8, background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              marginBottom: 2,
            }}
          >
            <Folder size={14} color="var(--color-primary)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', flex: 1 }}>{cat.nombre}</span>
            <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{prods.length} productos</span>
          </div>
          {prods.map((p, pi) => (
            <div
              key={p.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px 7px 28px',
                borderBottom: pi < prods.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <Check size={13} color="var(--color-success)" />
              <span style={{ fontSize: 13, color: 'var(--color-body)', flex: 1 }}>{p.nombre}</span>
              <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Todas las variantes</span>
            </div>
          ))}
        </div>
      ))}
      {totalProds > MAX_VISIBLE && (
        <button
          type="button"
          onClick={() => setExpandido((v) => !v)}
          style={{
            marginTop: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontSize: 13, color: 'var(--color-primary)', fontFamily: 'inherit',
          }}
        >
          {expandido ? 'Ver menos' : `Ver todos (${totalProds} productos)`}
        </button>
      )}
    </SectionWrap>
  )
}

function SectionWrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
      <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-muted)' }}>
        Productos afectados
      </p>
      {children}
    </div>
  )
}
