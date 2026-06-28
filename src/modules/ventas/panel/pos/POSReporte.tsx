import { useState, useMemo, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { useCajaStore } from './stores/useCajaStore'
import { useTicketsRecientes } from './hooks/useTickets'
import { useMovimientosCaja } from './hooks/useCaja'
import { ResumenTurno, type DesgloseItem } from './components/Caja/ResumenTurno'
import type { TipoMetodoPago } from './types'

const SK: CSSProperties = { background: 'var(--color-surface-alt)', borderRadius: 8 }

function ReporteSkeleton() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', gap: 24, minHeight: 0 }}>
      <div>
        <div style={{ ...SK, height: 28, width: 220, marginBottom: 8 }} />
        <div style={{ ...SK, height: 14, width: 300 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[1, 2, 3, 4].map((i) => <div key={i} style={{ ...SK, height: 96, borderRadius: 12 }} />)}
      </div>
      <div style={{ ...SK, height: 200, borderRadius: 12 }} />
    </div>
  )
}

function formatHora(iso: string) {
  return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

export function POSReporte() {
  const [loading, setLoading] = useState(true)
  const { sesion, acumuladoTurno } = useCajaStore()
  const { data: ticketsData = [] } = useTicketsRecientes(sesion?.id)
  const { data: movimientos = [] } = useMovimientosCaja(sesion?.id)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  const desglose = useMemo<DesgloseItem[]>(() => {
    const map: Partial<Record<TipoMetodoPago, { cantidad: number; total: number }>> = {}
    ticketsData.forEach((t) => {
      t.metodosPago.forEach((m) => {
        if (!map[m.tipo]) map[m.tipo] = { cantidad: 0, total: 0 }
        map[m.tipo]!.cantidad++
        map[m.tipo]!.total += m.monto
      })
    })
    return Object.entries(map).map(([tipo, data]) => ({ tipo, ...data! }))
  }, [ticketsData])

  if (loading) return <ReporteSkeleton />
  if (!sesion) return null

  const cajaId = `C-${sesion.id.slice(-4).padStart(4, '0')}`

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px 40px',
        background: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        minHeight: 0,
      }}
    >
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
          Reporte del turno
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--color-muted)' }}>
          {cajaId} · abierta a las {formatHora(sesion.fechaApertura)} por {sesion.cajero.nombre}
        </p>
      </div>

      {/* TODO: restringir a admin/dueño cuando el sistema de roles esté disponible */}
      <ResumenTurno
        ventasTotales={acumuladoTurno}
        ticketsEmitidos={ticketsData.length}
        movimientos={movimientos}
        desglose={desglose}
      />
    </div>
  )
}
