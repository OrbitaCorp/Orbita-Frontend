import { FormField } from './FormField'
import { SelectorProductoOCategoria } from './SelectorProductoOCategoria'
import { BeneficioBonusSelector } from './BeneficioBonusSelector'
import type { AlcanceDescuento, BonusTipoBeneficio } from '../types'

interface Props {
  cantidadMinCompra: string
  triggerAlcance: AlcanceDescuento
  triggerProductosIds: string[]
  triggerCategoriasIds: string[]
  bonusAlcance: AlcanceDescuento
  bonusProductosIds: string[]
  bonusCategoriasIds: string[]
  bonusTipoBeneficio: BonusTipoBeneficio
  bonusValor: string
  onChangeCantidadMin: (v: string) => void
  onChangeTriggerAlcance: (a: AlcanceDescuento) => void
  onChangeTriggerProductos: (ids: string[]) => void
  onChangeTriggerCategorias: (ids: string[]) => void
  onChangeBonusAlcance: (a: AlcanceDescuento) => void
  onChangeBonusProductos: (ids: string[]) => void
  onChangeBonusCategorias: (ids: string[]) => void
  onChangeBonusTipo: (t: BonusTipoBeneficio) => void
  onChangeBonusValor: (v: string) => void
  errores?: Record<string, string>
}

export function ConfigCompraXObtieneZ({
  cantidadMinCompra,
  triggerAlcance, triggerProductosIds, triggerCategoriasIds,
  bonusAlcance, bonusProductosIds, bonusCategoriasIds,
  bonusTipoBeneficio, bonusValor,
  onChangeCantidadMin,
  onChangeTriggerAlcance, onChangeTriggerProductos, onChangeTriggerCategorias,
  onChangeBonusAlcance, onChangeBonusProductos, onChangeBonusCategorias,
  onChangeBonusTipo, onChangeBonusValor,
  errores = {},
}: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <FormField
        label="Cantidad mínima de compra"
        type="number"
        min="1"
        placeholder="1"
        value={cantidadMinCompra}
        onChange={(e) => onChangeCantidadMin(e.target.value)}
        mono
        error={errores.cantidadMinCompra}
      />

      <div style={{ paddingBottom: 20, borderBottom: '1px solid var(--color-border)' }}>
        <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>
          Productos que activan la promo
        </p>
        <SelectorProductoOCategoria
          alcance={triggerAlcance}
          productosIds={triggerProductosIds}
          categoriasIds={triggerCategoriasIds}
          onChangeAlcance={onChangeTriggerAlcance}
          onChangeProductos={onChangeTriggerProductos}
          onChangeCategorias={onChangeTriggerCategorias}
          error={errores.triggerSeleccion}
        />
      </div>

      <div>
        <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>
          Producto bonus que obtiene el cliente
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SelectorProductoOCategoria
            alcance={bonusAlcance}
            productosIds={bonusProductosIds}
            categoriasIds={bonusCategoriasIds}
            onChangeAlcance={onChangeBonusAlcance}
            onChangeProductos={onChangeBonusProductos}
            onChangeCategorias={onChangeBonusCategorias}
            error={errores.bonusSeleccion}
          />
          <BeneficioBonusSelector
            tipo={bonusTipoBeneficio}
            valor={bonusValor}
            onChangeTipo={onChangeBonusTipo}
            onChangeValor={onChangeBonusValor}
            errorValor={errores.bonusValor}
          />
        </div>
      </div>
    </div>
  )
}
