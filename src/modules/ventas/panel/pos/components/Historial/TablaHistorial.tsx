import { Eye, LockKeyhole } from 'lucide-react'
import { DataTable } from '../../../../_shared/components/DataTable'
import type { ColumnaTabla } from '../../../../_shared/components/DataTable'
import type { FilaSesion } from '../../hooks/useCaja'

const FMT = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const MONO = '"Geist Mono", "Fira Code", monospace'

type EstadoSesion = 'abierta' | 'cerrada' | 'forzada'

const ESTADO_CONFIG: Record<EstadoSesion, { label: string; bg: string; color: string; dot?: boolean }> = {
  abierta:  { label: 'En curso', bg: 'rgba(16,185,129,.1)',   color: 'var(--color-success)', dot: true },
  cerrada:  { label: 'Cerrada',  bg: 'var(--color-surface)',  color: 'var(--color-muted)' },
  forzada:  { label: 'Forzada',  bg: 'rgba(239,68,68,.08)',   color: 'var(--color-error)' },
}

function EstadoBadge({ estado }: { estado: EstadoSesion }) {
  const cfg = ESTADO_CONFIG[estado]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}>
      {cfg.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />}
      {cfg.label}
    </span>
  )
}

function DiferenciaCell({ diferencia }: { diferencia: number | null }) {
  if (diferencia === null) return <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>—</span>
  if (diferencia === 0) return <span style={{ color: 'var(--color-success)', fontFamily: MONO, fontSize: 13 }}>Cuadra</span>
  const color = diferencia > 0 ? 'var(--color-warning)' : 'var(--color-error)'
  const sign = diferencia > 0 ? '+' : '−'
  return <span style={{ color, fontFamily: MONO, fontSize: 13, fontWeight: 600 }}>{sign} $ {FMT.format(Math.abs(diferencia))}</span>
}

function formatHora(iso: string) {
  return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

function formatFecha(iso: string) {
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(iso))
}

interface Props {
  datos: FilaSesion[]
  cargando: boolean
  onSeleccionarSesion: (fila: FilaSesion) => void
  onForzarCierre: (fila: FilaSesion) => void
}

export function TablaHistorial({ datos, cargando, onSeleccionarSesion, onForzarCierre }: Props) {
  const columnas: ColumnaTabla<FilaSesion>[] = [
    {
      key: 'fecha',
      header: 'Fecha',
      width: 90,
      sortable: true,
      render: (r) => <span style={{ fontFamily: MONO, fontSize: 13 }}>{formatFecha(r.sesion.fechaApertura)}</span>,
    },
    {
      key: 'cajero',
      header: 'Cajero',
      width: 150,
      render: (r) => <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{r.sesion.cajero.nombre}</span>,
    },
    {
      key: 'apertura',
      header: 'Apertura',
      width: 75,
      align: 'center',
      render: (r) => <span style={{ fontFamily: MONO, fontSize: 13 }}>{formatHora(r.sesion.fechaApertura)}</span>,
    },
    {
      key: 'cierre',
      header: 'Cierre',
      width: 75,
      align: 'center',
      render: (r) => r.sesion.fechaCierre
        ? <span style={{ fontFamily: MONO, fontSize: 13 }}>{formatHora(r.sesion.fechaCierre)}</span>
        : <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>—</span>,
    },
    {
      key: 'fondo',
      header: 'Fondo',
      width: 100,
      align: 'right',
      render: (r) => <span style={{ fontFamily: MONO, fontSize: 13 }}>$ {FMT.format(r.sesion.montoInicial)}</span>,
    },
    {
      key: 'ventas',
      header: 'Ventas',
      width: 110,
      align: 'right',
      render: (r) => <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600 }}>$ {FMT.format(r.ventasTotales)}</span>,
    },
    {
      key: 'tickets',
      header: 'Tickets',
      width: 65,
      align: 'center',
      render: (r) => <span style={{ fontFamily: MONO, fontSize: 13 }}>{r.cantidadTickets}</span>,
    },
    {
      key: 'diferencia',
      header: 'Diferencia',
      width: 105,
      align: 'right',
      render: (r) => <DiferenciaCell diferencia={r.diferencia} />,
    },
    {
      key: 'estado',
      header: 'Estado',
      width: 100,
      render: (r) => <EstadoBadge estado={r.sesion.estado as EstadoSesion} />,
    },
    {
      key: 'acciones',
      header: '',
      width: 120,
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onSeleccionarSesion(r)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-body)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Eye size={12} /> Ver
          </button>
          {r.sesion.estado === 'abierta' && (
            <button
              onClick={() => onForzarCierre(r)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, border: '1px solid var(--color-error)', background: 'rgba(239,68,68,.06)', color: 'var(--color-error)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <LockKeyhole size={12} /> Forzar
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columnas={columnas}
      datos={datos}
      getRowKey={(r) => r.sesion.id}
      cargando={cargando}
      onClickFila={onSeleccionarSesion}
      vacio={
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>Sin sesiones registradas</p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-muted)' }}>Abrí tu primera caja para que aparezca aquí.</p>
        </div>
      }
    />
  )
}
