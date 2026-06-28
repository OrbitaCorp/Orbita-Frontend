import { useState, useMemo, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { LockKeyhole, AlertTriangle } from 'lucide-react'
import { useCajaStore } from './stores/useCajaStore'
import { usePausadosStore } from './stores/usePausadosStore'
import { useTicketsRecientes } from './hooks/useTickets'
import { useMovimientosCaja } from './hooks/useCaja'
import { ResumenTurno, type DesgloseItem } from './components/Caja/ResumenTurno'
import { ConteoCierre } from './components/Caja/ConteoCierre'
import { ModalConfirmacion } from '../../_shared/components/ModalConfirmacion'
import type { TipoMetodoPago } from './types'

const FMT = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const SK: CSSProperties = { background: 'var(--color-surface-alt)', borderRadius: 8 }

function CierreSkeleton() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', gap: 24, minHeight: 0 }}>
      <div>
        <div style={{ ...SK, height: 28, width: 160, marginBottom: 8 }} />
        <div style={{ ...SK, height: 14, width: 320 }} />
      </div>
      <div style={{ display: 'flex', gap: 24, flex: 1, alignItems: 'flex-start' }}>
        <div style={{ flex: '0 0 58%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[1, 2, 3, 4].map((i) => <div key={i} style={{ ...SK, height: 80, borderRadius: 12 }} />)}
          </div>
          <div style={{ ...SK, height: 200, borderRadius: 12 }} />
        </div>
        <div style={{ flex: '0 0 calc(42% - 24px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ ...SK, height: 180, borderRadius: 12 }} />
          <div style={{ ...SK, height: 120, borderRadius: 12 }} />
        </div>
      </div>
    </div>
  )
}

function parseMonto(raw: string): number {
  return parseFloat(raw.replace(/\./g, '').replace(',', '.')) || 0
}

function formatHora(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

interface Props {
  onVolverAlPOS: () => void
  onCierreConfirmado: () => void
}

export function POSCierre({ onVolverAlPOS, onCierreConfirmado }: Props) {
  const [loading, setLoading] = useState(true)
  const { sesion, acumuladoTurno, cerrarCaja } = useCajaStore()
  const { tickets: pausados } = usePausadosStore()

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  const { data: ticketsData = [] } = useTicketsRecientes(sesion?.id)
  const { data: movimientos = [] } = useMovimientosCaja(sesion?.id)

  const [conteo, setConteo] = useState('')
  const [motivo, setMotivo] = useState('')
  const [notas, setNotas] = useState('')
  const [modalConfirmar, setModalConfirmar] = useState(false)

  // Desglose por método de pago
  const desglose = useMemo<DesgloseItem[]>(() => {
    const map: Partial<Record<TipoMetodoPago, { cantidad: number; total: number }>> = {}
    ticketsData.forEach((t) => {
      t.metodosPago.forEach((m) => {
        const key = m.tipo
        if (!map[key]) map[key] = { cantidad: 0, total: 0 }
        map[key]!.cantidad++
        map[key]!.total += m.monto
      })
    })
    return Object.entries(map).map(([tipo, data]) => ({ tipo, ...data! }))
  }, [ticketsData])

  // Totales
  const efectivoVentas = desglose.find((d) => d.tipo === 'efectivo')?.total ?? 0
  const ingresos = movimientos.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0)
  const egresos = movimientos.filter((m) => m.tipo === 'egreso').reduce((s, m) => s + m.monto, 0)
  const totalTeorico = (sesion?.montoInicial ?? 0) + efectivoVentas + ingresos - egresos
  const conteoN = parseMonto(conteo)
  const diff = conteoN - totalTeorico
  const hayDiferencia = conteo.trim().length > 0 && diff !== 0

  const puedeConfirmar =
    !hayDiferencia || motivo.trim().length > 0

  if (loading) return <CierreSkeleton />
  if (!sesion) return null

  const cajaId = `C-${sesion.id.slice(-4).padStart(4, '0')}`

  const handleConfirmar = () => {
    cerrarCaja()
    setModalConfirmar(false)
    onCierreConfirmado()
  }

  const descripcionModal = (() => {
    const parts: string[] = [
      `Ventas del turno: $ ${FMT.format(acumuladoTurno)}`,
    ]
    if (hayDiferencia) parts.push(`Diferencia en efectivo: $ ${FMT.format(Math.abs(diff))} (${diff > 0 ? 'sobra' : 'falta'})`)
    if (pausados.length > 0) parts.push(`⚠ Hay ${pausados.length} ticket(s) pausados sin cobrar.`)
    return parts.join('\n')
  })()

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '30px 40px',
        background: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
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
          Cerrar caja
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--color-muted)' }}>
          {cajaId} · abierta a las {formatHora(sesion.fechaApertura)} por {sesion.cajero.nombre}
        </p>
      </div>

      {/* Aviso tickets pausados */}
      {pausados.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(245,158,11,.08)',
            border: '1px solid var(--color-warning)',
            color: 'var(--color-warning)',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <AlertTriangle size={15} strokeWidth={2} />
          Hay {pausados.length} ticket{pausados.length > 1 ? 's' : ''} pausado{pausados.length > 1 ? 's' : ''} sin cobrar.
          Cerrá o retomá antes de cerrar la caja.
        </div>
      )}

      {/* Contenido 2 columnas */}
      <div style={{ display: 'flex', gap: 24, flex: 1, alignItems: 'flex-start' }}>
        {/* Columna izquierda — resumen */}
        <div style={{ flex: '0 0 58%', minWidth: 0 }}>
          <ResumenTurno
            ventasTotales={acumuladoTurno}
            ticketsEmitidos={ticketsData.length}
            movimientos={movimientos}
            desglose={desglose}
          />
        </div>

        {/* Columna derecha — conteo */}
        <div style={{ flex: '0 0 calc(42% - 24px)', minWidth: 0 }}>
          <ConteoCierre
            totalTeorico={totalTeorico}
            conteo={conteo}
            onConteoChange={setConteo}
            motivo={motivo}
            onMotivoChange={setMotivo}
            notas={notas}
            onNotasChange={setNotas}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 16,
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <button
          onClick={onVolverAlPOS}
          style={{
            padding: '11px 24px',
            borderRadius: 10,
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg)',
            color: 'var(--color-body)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Volver al POS
        </button>

        <button
          onClick={() => puedeConfirmar && setModalConfirmar(true)}
          disabled={!puedeConfirmar}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 28px',
            borderRadius: 10,
            border: 'none',
            background: puedeConfirmar ? 'var(--color-primary)' : 'var(--color-border)',
            color: puedeConfirmar ? '#fff' : 'var(--color-muted)',
            fontSize: 14,
            fontWeight: 600,
            cursor: puedeConfirmar ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
          }}
        >
          <LockKeyhole size={15} /> Cerrar caja
        </button>
      </div>

      {/* Modal de confirmación */}
      <ModalConfirmacion
        isOpen={modalConfirmar}
        titulo="¿Cerrar la caja?"
        descripcion={descripcionModal}
        labelConfirmar="Sí, cerrar caja"
        labelCancelar="Volver"
        variante="danger"
        onConfirmar={handleConfirmar}
        onCancelar={() => setModalConfirmar(false)}
      />
    </div>
  )
}
