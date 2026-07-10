import { TrendingUp, Receipt, RotateCcw, ArrowLeftRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { MovimientoCaja } from '../../types'

const FMT = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const MONO = '"Geist Mono", "Fira Code", monospace'

const LABEL_METODO: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta_debito: 'Tarjeta débito',
  tarjeta_credito: 'Tarjeta crédito',
  transferencia: 'Transferencia',
  qr: 'QR',
}

// ─── KPI card ──────────────────────────────────────────────────────────────

interface KPIProps {
  label: string
  valor: string
  subtitulo?: string
  Icon: LucideIcon
  iconColor?: string
  iconBg?: string
}

function KPICard({ label, valor, subtitulo, Icon, iconColor = 'var(--color-primary)', iconBg = 'rgba(59,130,246,.08)' }: KPIProps) {
  return (
    <div
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
          }}
        >
          {label}
        </p>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={15} strokeWidth={1.8} />
        </div>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 22,
          fontWeight: 800,
          fontFamily: MONO,
          color: 'var(--color-text)',
          letterSpacing: '-0.01em',
          lineHeight: 1.1,
        }}
      >
        {valor}
      </p>
      {subtitulo && (
        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted)' }}>{subtitulo}</p>
      )}
    </div>
  )
}

// ─── Desglose table ────────────────────────────────────────────────────────

interface FilaDesglose { tipo: string; cantidad: number; total: number }

function TablaDesglose({ filas }: { filas: FilaDesglose[] }) {
  if (filas.length === 0) {
    return (
      <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--color-muted)', textAlign: 'center', padding: '16px 0' }}>
        Sin ventas registradas en este turno.
      </p>
    )
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
      <thead>
        <tr>
          {['Método', 'Cant.', 'Total'].map((h, i) => (
            <th
              key={h}
              style={{
                padding: '6px 8px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: 'var(--color-muted)',
                textAlign: i === 0 ? 'left' : 'right',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filas.map((fila) => (
          <tr key={fila.tipo}>
            <td style={{ padding: '10px 8px', fontSize: 14, color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' }}>
              {LABEL_METODO[fila.tipo] ?? fila.tipo}
            </td>
            <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: 13, color: 'var(--color-muted)', fontFamily: MONO, borderBottom: '1px solid var(--color-border)' }}>
              {fila.cantidad}
            </td>
            <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: 14, fontWeight: 700, fontFamily: MONO, color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' }}>
              $ {FMT.format(fila.total)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── Componente público ────────────────────────────────────────────────────

export interface DesgloseItem { tipo: string; cantidad: number; total: number }

interface Props {
  ventasTotales: number
  ticketsEmitidos: number
  movimientos: MovimientoCaja[]
  desglose: DesgloseItem[]
}

export function ResumenTurno({ ventasTotales, ticketsEmitidos, movimientos, desglose }: Props) {
  const ingresos = movimientos.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0)
  const egresos = movimientos.filter((m) => m.tipo === 'egreso').reduce((s, m) => s + m.monto, 0)
  const netMovimientos = ingresos - egresos

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <KPICard
          label="Ventas del turno"
          valor={`$ ${FMT.format(ventasTotales)}`}
          Icon={TrendingUp}
          iconColor="var(--color-success)"
          iconBg="rgba(16,185,129,.08)"
        />
        <KPICard
          label="Tickets emitidos"
          valor={String(ticketsEmitidos)}
          Icon={Receipt}
          iconColor="var(--color-primary)"
          iconBg="rgba(59,130,246,.08)"
        />
        <KPICard
          label="Devoluciones"
          valor="0"
          subtitulo="$ 0"
          Icon={RotateCcw}
          iconColor="var(--color-warning)"
          iconBg="rgba(245,158,11,.08)"
        />
        <KPICard
          label="Mov. manuales"
          valor={`$ ${FMT.format(Math.abs(netMovimientos))}`}
          subtitulo={ingresos || egresos ? `+${FMT.format(ingresos)} / −${FMT.format(egresos)}` : undefined}
          Icon={ArrowLeftRight}
          iconColor="var(--color-primary)"
          iconBg="rgba(59,130,246,.08)"
        />
      </div>

      {/* Desglose */}
      <div
        style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          padding: '14px 16px',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
          }}
        >
          Desglose por método de pago
        </p>
        <TablaDesglose filas={desglose} />
      </div>
    </div>
  )
}
