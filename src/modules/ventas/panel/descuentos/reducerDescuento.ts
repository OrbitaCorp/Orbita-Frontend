import type { TipoDescuento, AlcanceDescuento, Aplicacion, BonusTipoBeneficio } from './types'
import type { EscalaForm } from './components/ConfigVolumen'

// ─── State ────────────────────────────────────────────────────────────────────

export interface DescuentoFormState {
  // Básico
  nombre: string
  tipo: TipoDescuento | null
  // Valor + alcance estándar
  valor: string
  alcance: AlcanceDescuento
  productosIds: string[]
  categoriasIds: string[]
  // Monto mínimo (ticket types)
  montoMinimo: string
  sinMontoMinimo: boolean
  // LlevaXPagaY
  llevaCantidad: string
  pagaCantidad: string
  // CompraXObtieneZ — trigger
  triggerAlcance: AlcanceDescuento
  triggerProductosIds: string[]
  triggerCategoriasIds: string[]
  cantidadMinCompra: string
  // CompraXObtieneZ — bonus
  bonusAlcance: AlcanceDescuento
  bonusProductosIds: string[]
  bonusCategoriasIds: string[]
  bonusTipoBeneficio: BonusTipoBeneficio
  bonusValor: string
  // Volumen
  escalasVolumen: EscalaForm[]
  // Vigencia
  fechaInicio: string
  fechaFin: string
  sinVencimiento: boolean
  diasVigencia: number[]
  todoElDia: boolean
  horaInicio: string
  horaFin: string
  limiteUsosTotal: string
  ilimitadoUsos: boolean
  // Aplicación
  aplicacion: Aplicacion
  // Validación
  errores: Record<string, string>
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export type DescuentoFormAction =
  | { type: 'SET'; key: keyof DescuentoFormState; value: unknown }
  | { type: 'SET_TIPO'; tipo: TipoDescuento }
  | { type: 'ADD_ESCALA' }
  | { type: 'UPDATE_ESCALA'; idx: number; field: keyof EscalaForm; value: string }
  | { type: 'REMOVE_ESCALA'; idx: number }
  | { type: 'PRECARGAR'; state: Partial<DescuentoFormState> }

// ─── Initial State ────────────────────────────────────────────────────────────

function hoy(): string {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

export const initialDescuentoState: DescuentoFormState = {
  nombre: '',
  tipo: null,
  valor: '',
  alcance: 'producto',
  productosIds: [],
  categoriasIds: [],
  montoMinimo: '',
  sinMontoMinimo: false,
  llevaCantidad: '',
  pagaCantidad: '',
  triggerAlcance: 'producto',
  triggerProductosIds: [],
  triggerCategoriasIds: [],
  cantidadMinCompra: '1',
  bonusAlcance: 'producto',
  bonusProductosIds: [],
  bonusCategoriasIds: [],
  bonusTipoBeneficio: 'gratis',
  bonusValor: '',
  escalasVolumen: [{ desde: '1', hasta: '', porcentaje: '' }],
  fechaInicio: hoy(),
  fechaFin: '',
  sinVencimiento: false,
  diasVigencia: [],
  todoElDia: true,
  horaInicio: '00:00',
  horaFin: '23:59',
  limiteUsosTotal: '',
  ilimitadoUsos: true,
  aplicacion: 'automatico',
  errores: {},
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function reducerDescuento(
  state: DescuentoFormState,
  action: DescuentoFormAction
): DescuentoFormState {
  switch (action.type) {
    case 'SET':
      return { ...state, [action.key]: action.value, errores: { ...state.errores, [action.key as string]: '' } }

    case 'SET_TIPO':
      return {
        ...state,
        tipo: action.tipo,
        valor: '',
        alcance: 'producto',
        productosIds: [],
        categoriasIds: [],
        llevaCantidad: '',
        pagaCantidad: '',
        errores: {},
      }

    case 'ADD_ESCALA':
      return {
        ...state,
        escalasVolumen: [...state.escalasVolumen, { desde: '', hasta: '', porcentaje: '' }],
      }

    case 'UPDATE_ESCALA': {
      const escalas = state.escalasVolumen.map((e, i) =>
        i === action.idx ? { ...e, [action.field]: action.value } : e
      )
      return { ...state, escalasVolumen: escalas }
    }

    case 'REMOVE_ESCALA':
      return { ...state, escalasVolumen: state.escalasVolumen.filter((_, i) => i !== action.idx) }

    case 'PRECARGAR':
      return { ...state, ...action.state, errores: {} }

    default:
      return state
  }
}

// ─── Validación ───────────────────────────────────────────────────────────────

export function validarDescuentoForm(state: DescuentoFormState): Record<string, string> {
  const e: Record<string, string> = {}
  if (!state.nombre.trim()) e.nombre = 'El nombre es obligatorio'
  if (!state.tipo) e.tipo = 'Seleccioná un tipo de descuento'
  if (!state.valor && !['lleva_x_paga_y', 'compra_x_obtiene_z', 'volumen'].includes(state.tipo ?? '')) {
    e.valor = 'Ingresá un valor de descuento'
  }
  if (state.tipo === 'lleva_x_paga_y') {
    const lleva = parseInt(state.llevaCantidad, 10)
    const paga = parseInt(state.pagaCantidad, 10)
    if (!lleva || lleva < 2) e.llevaCantidad = 'Mínimo 2'
    if (!paga || paga < 1) e.pagaCantidad = 'Mínimo 1'
    if (lleva && paga && paga >= lleva) e.cantidades = 'Pagá debe ser menor que Llevá'
  }
  if (state.tipo === 'volumen' && state.escalasVolumen.length === 0) {
    e.escalas = 'Agregá al menos una escala'
  }
  if (!state.fechaInicio) e.fechaInicio = 'Seleccioná fecha de inicio'
  if (!state.sinVencimiento && !state.fechaFin) e.fechaFin = 'Seleccioná fecha de fin o activá "Sin vencimiento"'
  return e
}
