import { PreviewCupon } from './PreviewCupon'
import { ResumenSidebar } from './ResumenSidebar'
import type { TipoCupon, AlcanceDescuento } from '../types'

interface Props {
  codigo: string
  nombre: string
  tipo: TipoCupon | null
  valor: string
  alcance: AlcanceDescuento
  montoMinimo: string
  fechaInicio: string
  fechaExpiracion: string
  sinVencimiento: boolean
  ilimitadoTotal: boolean
  usosMaxTotal: string
  // Solo en modo edición: muestra el estado del link compartible (solo lectura).
  mostrarLink?: boolean
  linkActivo?: boolean
}

// Reutiliza el preview + resumen del cupón. Se usa tanto en la columna lateral
// de desktop como dentro del modal de confirmación en mobile.
export function CuponResumen({
  codigo, nombre, tipo, valor, alcance, montoMinimo,
  fechaInicio, fechaExpiracion, sinVencimiento, ilimitadoTotal, usosMaxTotal,
  mostrarLink, linkActivo,
}: Props) {
  return (
    <>
      <PreviewCupon codigo={codigo} nombre={nombre} tipo={tipo} valor={valor} alcance={alcance} montoMinimo={montoMinimo} />
      <ResumenSidebar nombre={nombre} tipo={null} aplicacion="manual" fechaInicio={fechaInicio} fechaFin={fechaExpiracion} sinVencimiento={sinVencimiento} diasVigencia={[]} ilimitadoUsos={ilimitadoTotal} limiteUsosTotal={usosMaxTotal} />
      {mostrarLink && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
          <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Link compartible</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: linkActivo ? 'var(--color-success)' : 'var(--color-muted)' }}>
            {linkActivo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      )}
    </>
  )
}
