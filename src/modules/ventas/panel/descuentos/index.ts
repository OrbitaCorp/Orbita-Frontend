// Barrel público del módulo de Descuentos y Cupones.
export * from './types'
export * from './hooks'
export { DescuentosShell } from './DescuentosShell'
export { DescuentosListado } from './DescuentosListado'
export { CuponesListado } from './CuponesListado'
export { DescuentosCrear } from './DescuentosCrear'
export { CuponesCrear } from './CuponesCrear'
export { generarCodigoCupon, isoADisplay, displayAIso } from './utils'
// Componentes internos — DescuentosFiltros (componente) se omite aquí para no colisionar
// con el tipo DescuentosFiltros de ./types. Importar desde './components/DescuentosFiltros'.
export { BadgeEstado, BadgeTipo, DescuentosTabla, CuponesTabla } from './components'
export { DescuentosDetalle } from './DescuentosDetalle'
export { DescuentosMetricas } from './DescuentosMetricas'
