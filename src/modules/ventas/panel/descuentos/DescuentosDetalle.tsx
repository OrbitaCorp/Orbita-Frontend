import { useDescuento } from './hooks/useDescuento'
import { useAuditoria } from './hooks/useAuditoria'
import { DetalleEncabezado } from './components/DetalleEncabezado'
import { DetalleConfiguracion } from './components/DetalleConfiguracion'
import { DetalleProductos } from './components/DetalleProductos'
import { DetalleVigencia } from './components/DetalleVigencia'
import { HistorialCambios } from './components/HistorialCambios'
import { DetalleAcciones } from './components/DetalleAcciones'
import { DetalleRendimiento } from './components/DetalleRendimiento'
import { PreviewPOS } from './components/PreviewPOS'

interface Props {
  id: string
  onVolver: () => void
  onEditar: () => void
  onVerMetricas: () => void
}

export function DescuentosDetalle({ id, onVolver, onEditar, onVerMetricas }: Props) {
  const { data: descuento, isLoading, isError } = useDescuento(id)
  const { data: logs = [] } = useAuditoria(id, 'descuento')

  if (isLoading) {
    const sk = (h: number, w?: string | number) => ({
      height: h, width: w ?? '100%',
      background: 'var(--color-surface-alt)', borderRadius: 8,
    })
    return (
      <div>
        <div style={sk(14, 100)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start', marginTop: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ ...sk(110), borderRadius: 12 }} />
            <div style={{ ...sk(200), borderRadius: 12 }} />
            <div style={{ ...sk(140), borderRadius: 12 }} />
            <div style={{ ...sk(100), borderRadius: 12 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ ...sk(160), borderRadius: 12 }} />
            <div style={{ ...sk(180), borderRadius: 12 }} />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !descuento) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <p style={{ color: 'var(--color-error)', fontSize: 14 }}>No se pudo cargar el descuento.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Breadcrumb de volver */}
      <button
        type="button"
        onClick={onVolver}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 20,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 13,
          color: 'var(--color-muted)',
          fontFamily: 'inherit',
          padding: 0,
        }}
      >
        ← Volver al listado
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {/* Columna izquierda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <DetalleEncabezado descuento={descuento} onEditar={onEditar} />
          <DetalleConfiguracion descuento={descuento} />
          <DetalleProductos descuento={descuento} />
          <DetalleVigencia descuento={descuento} />
          <HistorialCambios logs={logs} tituloEntidad="descuento" />
        </div>

        {/* Columna derecha sticky */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            position: 'sticky',
            top: 24,
          }}
        >
          <DetalleAcciones descuento={descuento} onVolver={onVolver} />
          <PreviewPOS
            nombre={descuento.nombre}
            tipo={descuento.tipo}
            aplicacion={descuento.aplicacion}
            valor={String(descuento.valor)}
            llevaCantidad={String(descuento.condicion?.llevaCantidad ?? '')}
            pagaCantidad={String(descuento.condicion?.pagaCantidad ?? '')}
            montoMinimo={String(descuento.condicion?.montoMinimo ?? '')}
          />
          <DetalleRendimiento descuento={descuento} onVerMetricas={onVerMetricas} />
        </div>
      </div>
    </div>
  )
}
