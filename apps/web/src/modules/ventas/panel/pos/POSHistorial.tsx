import { useState, useMemo, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { useHistorialCajas, useForzarCierre } from './hooks/useCaja'
import type { FilaSesion } from './hooks/useCaja'
import { FiltrosHistorial } from './components/Historial/FiltrosHistorial'
import { TablaHistorial } from './components/Historial/TablaHistorial'
import { ModalDetalleSesion } from './components/Historial/ModalDetalleSesion'
import { ModalConfirmacion } from '../../_shared/components/ModalConfirmacion'
import type { FiltrosHistorial as Filtros } from './types'

const FMT_FECHA = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
const SK: CSSProperties = { background: 'var(--color-surface-alt)', borderRadius: 8 }

function HistorialSkeleton() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', gap: 20, minHeight: 0 }}>
      <div>
        <div style={{ ...SK, height: 28, width: 200, marginBottom: 8 }} />
        <div style={{ ...SK, height: 14, width: 260 }} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[140, 120, 120, 100, 80].map((w, i) => (
          <div key={i} style={{ ...SK, height: 36, width: w, borderRadius: 8 }} />
        ))}
      </div>
      <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ ...SK, height: 44, borderRadius: 0 }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ ...SK, height: 52, borderRadius: 0, borderBottom: '1px solid var(--color-border)' }} />
        ))}
      </div>
    </div>
  )
}
const FMT_NUM = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

function exportarCSV(datos: FilaSesion[]) {
  const headers = ['Fecha apertura', 'Cajero', 'Cierre', 'Fondo', 'Ventas', 'Tickets', 'Diferencia', 'Estado']
  const rows = datos.map((r) => {
    const s = r.sesion
    const dif = r.diferencia === null ? '' : String(r.diferencia)
    return [
      FMT_FECHA.format(new Date(s.fechaApertura)),
      s.cajero.nombre,
      s.fechaCierre ? FMT_FECHA.format(new Date(s.fechaCierre)) : '',
      FMT_NUM.format(s.montoInicial),
      FMT_NUM.format(r.ventasTotales),
      String(r.cantidadTickets),
      dif,
      s.estado,
    ].map((v) => `"${v}"`).join(';')
  })
  const content = [headers.join(';'), ...rows].join('\n')
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `historial-cajas-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function POSHistorial() {
  const [loading, setLoading] = useState(true)
  const { data: sesiones = [], isLoading } = useHistorialCajas()
  const forzarCierre = useForzarCierre()

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  const [filtros, setFiltros] = useState<Filtros>({})
  const [sesionDetalle, setSesionDetalle] = useState<FilaSesion | null>(null)
  const [sesionAForzar, setSesionAForzar] = useState<FilaSesion | null>(null)

  const datosFiltrados = useMemo(() => {
    return sesiones.filter((f) => {
      if (filtros.cajeroId && f.sesion.cajero.id !== filtros.cajeroId) return false
      if (filtros.estado && f.sesion.estado !== filtros.estado) return false
      if (filtros.conDiferencia && (f.diferencia === null || f.diferencia === 0)) return false
      if (filtros.fechaDesde && f.sesion.fechaApertura.slice(0, 10) < filtros.fechaDesde) return false
      if (filtros.fechaHasta && f.sesion.fechaApertura.slice(0, 10) > filtros.fechaHasta) return false
      return true
    })
  }, [sesiones, filtros])

  const handleForzarCierre = () => {
    if (!sesionAForzar) return
    forzarCierre.mutate(sesionAForzar.sesion.id, {
      onSuccess: () => setSesionAForzar(null),
    })
  }

  if (loading) return <HistorialSkeleton />

  const descripcionForzar = sesionAForzar
    ? `Estás cerrando la caja de ${sesionAForzar.sesion.cajero.nombre}, abierta el ${FMT_FECHA.format(new Date(sesionAForzar.sesion.fechaApertura))} hs. Esta acción queda registrada y no se puede deshacer.`
    : undefined

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px 40px',
        background: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        minHeight: 0,
      }}
    >
      {/* Encabezado */}
      <div>
        <h1
          style={{
            margin: '0 0 4px',
            fontSize: 26,
            fontWeight: 800,
            fontFamily: 'Sora, Inter, sans-serif',
            color: 'var(--color-text)',
          }}
        >
          Historial de cajas
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--color-muted)' }}>
          Registro de sesiones y cierres
        </p>
      </div>

      {/* Filtros */}
      <FiltrosHistorial
        filtros={filtros}
        onFiltrosChange={setFiltros}
        onExportarCSV={() => exportarCSV(datosFiltrados)}
        totalRegistros={datosFiltrados.length}
      />

      {/* Tabla */}
      <div
        style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <TablaHistorial
          datos={datosFiltrados}
          cargando={isLoading}
          onSeleccionarSesion={setSesionDetalle}
          onForzarCierre={setSesionAForzar}
        />
      </div>

      {/* Modal detalle */}
      {sesionDetalle && (
        <ModalDetalleSesion
          fila={sesionDetalle}
          onCerrar={() => setSesionDetalle(null)}
        />
      )}

      {/* Modal forzar cierre */}
      <ModalConfirmacion
        isOpen={!!sesionAForzar}
        titulo="¿Forzar cierre de caja?"
        descripcion={descripcionForzar}
        labelConfirmar="Sí, forzar cierre"
        labelCancelar="Cancelar"
        variante="warning"
        cargando={forzarCierre.isPending}
        onConfirmar={handleForzarCierre}
        onCancelar={() => setSesionAForzar(null)}
      />
    </div>
  )
}
