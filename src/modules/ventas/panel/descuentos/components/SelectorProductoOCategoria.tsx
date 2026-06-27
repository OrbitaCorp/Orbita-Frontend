import { AlcanceSelector } from './AlcanceSelector'
import { CategoriaLista } from './CategoriaLista'
import { ProductoArbol } from './ProductoArbol'
import type { AlcanceDescuento } from '../types'

interface Props {
  alcance: AlcanceDescuento
  productosIds: string[]
  categoriasIds: string[]
  onChangeAlcance: (a: AlcanceDescuento) => void
  onChangeProductos: (ids: string[]) => void
  onChangeCategorias: (ids: string[]) => void
  /** 'sin-ticket' oculta la opción Ticket completo. Default: 'sin-ticket'. */
  modoAlcance?: 'completo' | 'sin-ticket'
  label?: string
  error?: string
}

export function SelectorProductoOCategoria({
  alcance,
  productosIds,
  categoriasIds,
  onChangeAlcance,
  onChangeProductos,
  onChangeCategorias,
  modoAlcance = 'sin-ticket',
  label,
  error,
}: Props) {
  const opciones: AlcanceDescuento[] =
    modoAlcance === 'sin-ticket' ? ['categoria', 'producto'] : ['ticket', 'categoria', 'producto']

  const handleAlcanceChange = (a: AlcanceDescuento) => {
    onChangeAlcance(a)
    onChangeProductos([])
    onChangeCategorias([])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {label && (
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--color-body)' }}>
          {label}
        </p>
      )}
      <AlcanceSelector alcance={alcance} onChange={handleAlcanceChange} opciones={opciones} />

      {alcance === 'categoria' && (
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 500, color: 'var(--color-body)' }}>
            Seleccioná las categorías
          </p>
          <CategoriaLista categoriasIds={categoriasIds} onChange={onChangeCategorias} />
          {categoriasIds.length === 0 && error && (
            <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--color-error)' }}>{error}</p>
          )}
        </div>
      )}

      {alcance === 'producto' && (
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 500, color: 'var(--color-body)' }}>
            Seleccioná los productos
          </p>
          <ProductoArbol productosIds={productosIds} onChange={onChangeProductos} />
          {productosIds.length === 0 && error && (
            <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--color-error)' }}>{error}</p>
          )}
        </div>
      )}
    </div>
  )
}
