import { useReducer, useEffect } from 'react'
import { reducerDescuento, initialDescuentoState, validarDescuentoForm } from './reducerDescuento'
import type { DescuentoFormState } from './reducerDescuento'
import { SectionCard, FormField } from './components/FormField'
import { TipoDescuentoSelector } from './components/TipoDescuentoSelector'
import { ConfigPorcentajeProducto } from './components/ConfigPorcentajeProducto'
import { ConfigMontoFijoProducto } from './components/ConfigMontoFijoProducto'
import { ConfigPorcentajeTicket } from './components/ConfigPorcentajeTicket'
import { ConfigMontoFijoTicket } from './components/ConfigMontoFijoTicket'
import { ConfigLlevaXPagaY } from './components/ConfigLlevaXPagaY'
import { ConfigCompraXObtieneZ } from './components/ConfigCompraXObtieneZ'
import { ConfigVolumen } from './components/ConfigVolumen'
import { VigenciaForm } from './components/VigenciaForm'
import { AplicacionSelector } from './components/AplicacionSelector'
import { PreviewPOS } from './components/PreviewPOS'
import { ResumenSidebar } from './components/ResumenSidebar'
import { useDescuento } from './hooks/useDescuento'
import { useCrearDescuento } from './hooks/useCrearDescuento'
import { useEditarDescuento } from './hooks/useEditarDescuento'
import type { AlcanceDescuento, BonusTipoBeneficio, Aplicacion } from './types'

interface Props {
  id?: string
  onVolver: () => void
}

function set(dispatch: React.Dispatch<Parameters<typeof reducerDescuento>[1]>, key: keyof DescuentoFormState) {
  return (value: unknown) => dispatch({ type: 'SET', key, value })
}

export function DescuentosCrear({ id, onVolver }: Props) {
  const [state, dispatch] = useReducer(reducerDescuento, initialDescuentoState)
  const { data: existing, isLoading } = useDescuento(id)
  const crearMutation = useCrearDescuento()
  const editarMutation = useEditarDescuento()

  useEffect(() => {
    if (!existing) return
    dispatch({
      type: 'PRECARGAR',
      state: {
        nombre: existing.nombre,
        tipo: existing.tipo,
        valor: String(existing.valor),
        alcance: existing.alcance,
        productosIds: existing.productosIds ?? [],
        categoriasIds: existing.categoriasIds ?? [],
        montoMinimo: String(existing.condicion?.montoMinimo ?? ''),
        sinMontoMinimo: !existing.condicion?.montoMinimo,
        llevaCantidad: String(existing.condicion?.llevaCantidad ?? ''),
        pagaCantidad: String(existing.condicion?.pagaCantidad ?? ''),
        bonusTipoBeneficio: existing.bonusTipoBeneficio ?? 'gratis',
        bonusValor: String(existing.bonusValor ?? ''),
        bonusProductosIds: existing.bonusProductosIds ?? [],
        bonusCategoriasIds: existing.bonusCategoriasIds ?? [],
        sinVencimiento: !existing.fechaFin,
        fechaInicio: existing.fechaInicio.split('T')[0],
        fechaFin: existing.fechaFin?.split('T')[0] ?? '',
        diasVigencia: existing.diasVigencia ?? [],
        ilimitadoUsos: !existing.limiteUsosTotal,
        limiteUsosTotal: String(existing.limiteUsosTotal ?? ''),
        aplicacion: existing.aplicacion,
      },
    })
  }, [existing])

  const handleSubmit = async () => {
    const errores = validarDescuentoForm(state)
    if (Object.keys(errores).length) {
      dispatch({ type: 'SET', key: 'errores', value: errores })
      return
    }
    const payload = {
      nombre: state.nombre,
      tipo: state.tipo!,
      valor: parseFloat(state.valor) || 0,
      alcance: state.alcance,
      productosIds: state.productosIds,
      categoriasIds: state.categoriasIds,
      condicion: state.tipo === 'lleva_x_paga_y'
        ? { llevaCantidad: parseInt(state.llevaCantidad), pagaCantidad: parseInt(state.pagaCantidad) }
        : state.sinMontoMinimo ? undefined : { montoMinimo: parseFloat(state.montoMinimo) },
      bonusTipoBeneficio: state.tipo === 'compra_x_obtiene_z' ? state.bonusTipoBeneficio : undefined,
      bonusValor: state.tipo === 'compra_x_obtiene_z' && state.bonusTipoBeneficio !== 'gratis' ? parseFloat(state.bonusValor) : undefined,
      bonusProductosIds: state.tipo === 'compra_x_obtiene_z' ? state.bonusProductosIds : undefined,
      bonusCategoriasIds: state.tipo === 'compra_x_obtiene_z' ? state.bonusCategoriasIds : undefined,
      bonusAlcance: state.tipo === 'compra_x_obtiene_z' ? (state.bonusAlcance as Exclude<AlcanceDescuento, 'ticket'>) : undefined,
      aplicacion: state.aplicacion,
      fechaInicio: state.fechaInicio,
      fechaFin: state.sinVencimiento ? null : state.fechaFin,
      diasVigencia: state.diasVigencia.length ? state.diasVigencia : null,
      horaInicio: state.todoElDia ? null : state.horaInicio,
      horaFin: state.todoElDia ? null : state.horaFin,
      limiteUsosTotal: state.ilimitadoUsos ? null : parseInt(state.limiteUsosTotal),
      activo: true,
    }
    if (id) {
      await editarMutation.mutateAsync({ id, data: payload })
    } else {
      await crearMutation.mutateAsync(payload as Parameters<typeof crearMutation.mutateAsync>[0])
    }
    onVolver()
  }

  const isSaving = crearMutation.isPending || editarMutation.isPending
  const d = (key: keyof DescuentoFormState) => set(dispatch, key)
  const t = state.tipo

  if (isLoading && id) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-muted)' }}>Cargando…</div>
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Columna principal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SectionCard title="Información básica">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <FormField
                label="Nombre del descuento"
                placeholder="Ej: Promo Invierno 20%"
                value={state.nombre}
                onChange={(e) => d('nombre')(e.target.value)}
                error={state.errores.nombre}
              />
              <div>
                <p style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 500, color: 'var(--color-body)' }}>Tipo de descuento</p>
                <TipoDescuentoSelector
                  tipo={state.tipo}
                  onChange={(tipo) => dispatch({ type: 'SET_TIPO', tipo })}
                  error={state.errores.tipo}
                />
              </div>
            </div>
          </SectionCard>

          {t && (
            <SectionCard title="Configuración del descuento">
              {t === 'porcentaje_producto' && (
                <ConfigPorcentajeProducto valor={state.valor} alcance={state.alcance} productosIds={state.productosIds} categoriasIds={state.categoriasIds} onChangeValor={d('valor')} onChangeAlcance={d('alcance') as (a: AlcanceDescuento) => void} onChangeProductos={d('productosIds')} onChangeCategorias={d('categoriasIds')} errores={state.errores} />
              )}
              {t === 'monto_fijo_producto' && (
                <ConfigMontoFijoProducto valor={state.valor} alcance={state.alcance} productosIds={state.productosIds} categoriasIds={state.categoriasIds} onChangeValor={d('valor')} onChangeAlcance={d('alcance') as (a: AlcanceDescuento) => void} onChangeProductos={d('productosIds')} onChangeCategorias={d('categoriasIds')} errores={state.errores} />
              )}
              {t === 'porcentaje_ticket' && (
                <ConfigPorcentajeTicket valor={state.valor} montoMinimo={state.montoMinimo} sinMontoMinimo={state.sinMontoMinimo} onChangeValor={d('valor')} onChangeMontoMinimo={d('montoMinimo')} onToggleSinMinimo={d('sinMontoMinimo') as (v: boolean) => void} errores={state.errores} />
              )}
              {t === 'monto_fijo_ticket' && (
                <ConfigMontoFijoTicket valor={state.valor} montoMinimo={state.montoMinimo} sinMontoMinimo={state.sinMontoMinimo} onChangeValor={d('valor')} onChangeMontoMinimo={d('montoMinimo')} onToggleSinMinimo={d('sinMontoMinimo') as (v: boolean) => void} errores={state.errores} />
              )}
              {t === 'lleva_x_paga_y' && (
                <ConfigLlevaXPagaY llevaCantidad={state.llevaCantidad} pagaCantidad={state.pagaCantidad} alcance={state.alcance} productosIds={state.productosIds} categoriasIds={state.categoriasIds} onChangeLleva={d('llevaCantidad')} onChangePaga={d('pagaCantidad')} onChangeAlcance={d('alcance') as (a: AlcanceDescuento) => void} onChangeProductos={d('productosIds')} onChangeCategorias={d('categoriasIds')} errores={state.errores} />
              )}
              {t === 'compra_x_obtiene_z' && (
                <ConfigCompraXObtieneZ cantidadMinCompra={state.cantidadMinCompra} triggerAlcance={state.triggerAlcance} triggerProductosIds={state.triggerProductosIds} triggerCategoriasIds={state.triggerCategoriasIds} bonusAlcance={state.bonusAlcance} bonusProductosIds={state.bonusProductosIds} bonusCategoriasIds={state.bonusCategoriasIds} bonusTipoBeneficio={state.bonusTipoBeneficio} bonusValor={state.bonusValor} onChangeCantidadMin={d('cantidadMinCompra')} onChangeTriggerAlcance={d('triggerAlcance') as (a: AlcanceDescuento) => void} onChangeTriggerProductos={d('triggerProductosIds')} onChangeTriggerCategorias={d('triggerCategoriasIds')} onChangeBonusAlcance={d('bonusAlcance') as (a: AlcanceDescuento) => void} onChangeBonusProductos={d('bonusProductosIds')} onChangeBonusCategorias={d('bonusCategoriasIds')} onChangeBonusTipo={d('bonusTipoBeneficio') as (t: BonusTipoBeneficio) => void} onChangeBonusValor={d('bonusValor')} errores={state.errores} />
              )}
              {t === 'volumen' && (
                <ConfigVolumen alcance={state.alcance} productosIds={state.productosIds} categoriasIds={state.categoriasIds} escalas={state.escalasVolumen} onChangeAlcance={d('alcance') as (a: AlcanceDescuento) => void} onChangeProductos={d('productosIds')} onChangeCategorias={d('categoriasIds')} onUpdateEscala={(idx, field, value) => dispatch({ type: 'UPDATE_ESCALA', idx, field, value })} onAddEscala={() => dispatch({ type: 'ADD_ESCALA' })} onRemoveEscala={(idx) => dispatch({ type: 'REMOVE_ESCALA', idx })} errores={state.errores} />
              )}
            </SectionCard>
          )}

          <SectionCard title="Vigencia y condiciones">
            <VigenciaForm fechaInicio={state.fechaInicio} fechaFin={state.fechaFin} sinVencimiento={state.sinVencimiento} diasVigencia={state.diasVigencia} todoElDia={state.todoElDia} horaInicio={state.horaInicio} horaFin={state.horaFin} limiteUsosTotal={state.limiteUsosTotal} ilimitadoUsos={state.ilimitadoUsos} onChange={(field, value) => dispatch({ type: 'SET', key: field as keyof DescuentoFormState, value })} errores={state.errores} />
          </SectionCard>

          <SectionCard title="Modo de aplicación">
            <AplicacionSelector aplicacion={state.aplicacion} onChange={d('aplicacion') as (a: Aplicacion) => void} />
          </SectionCard>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingBottom: 40 }}>
            <button type="button" onClick={onVolver} style={{ height: 40, padding: '0 20px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-body)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="button" onClick={handleSubmit} disabled={isSaving} style={{ height: 40, padding: '0 24px', borderRadius: 8, border: 'none', background: isSaving ? 'var(--color-border)' : 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer' }}>
              {isSaving ? 'Guardando…' : id ? 'Guardar cambios' : 'Crear descuento'}
            </button>
          </div>
        </div>

        {/* Sidebar sticky */}
        <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <PreviewPOS nombre={state.nombre} tipo={state.tipo} aplicacion={state.aplicacion} valor={state.valor} llevaCantidad={state.llevaCantidad} pagaCantidad={state.pagaCantidad} montoMinimo={state.montoMinimo} />
          <ResumenSidebar nombre={state.nombre} tipo={state.tipo} aplicacion={state.aplicacion} fechaInicio={state.fechaInicio} fechaFin={state.fechaFin} sinVencimiento={state.sinVencimiento} diasVigencia={state.diasVigencia} ilimitadoUsos={state.ilimitadoUsos} limiteUsosTotal={state.limiteUsosTotal} />
        </div>
      </div>
    </div>
  )
}
