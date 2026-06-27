import { FormField } from './FormField'
import { SelectorProductoOCategoria } from './SelectorProductoOCategoria'
import type { AlcanceDescuento } from '../types'

interface Props {
  valor: string
  alcance: AlcanceDescuento
  productosIds: string[]
  categoriasIds: string[]
  onChangeValor: (v: string) => void
  onChangeAlcance: (a: AlcanceDescuento) => void
  onChangeProductos: (ids: string[]) => void
  onChangeCategorias: (ids: string[]) => void
  errores?: Record<string, string>
}

export function ConfigPorcentajeProducto({
  valor, alcance, productosIds, categoriasIds,
  onChangeValor, onChangeAlcance, onChangeProductos, onChangeCategorias,
  errores = {},
}: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <FormField
        label="Porcentaje de descuento"
        suffix="%"
        type="number"
        min="0"
        max="100"
        placeholder="10"
        value={valor}
        onChange={(e) => onChangeValor(e.target.value)}
        mono
        error={errores.valor}
      />
      <SelectorProductoOCategoria
        alcance={alcance}
        productosIds={productosIds}
        categoriasIds={categoriasIds}
        onChangeAlcance={onChangeAlcance}
        onChangeProductos={onChangeProductos}
        onChangeCategorias={onChangeCategorias}
        label="¿A qué productos aplica?"
        error={errores.seleccion}
      />
    </div>
  )
}
