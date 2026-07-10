import type { MetricasKPIs as MetricasKPIsType } from '../types'

const MONO = '"Geist Mono", "Fira Code", monospace'

function fmt(n: number) {
  return `$ ${Math.round(n).toLocaleString('es-AR')}`
}

function varLabel(v: number) {
  const sign = v > 0 ? '+' : ''
  return `${sign}${Math.round(v)}%`
}

function MiniKpi({
  titulo,
  valor,
  variacion,
  sub,
}: {
  titulo: string
  valor: string
  variacion?: number
  sub?: string
}) {
  const esPositivo = (variacion ?? 0) >= 0
  return (
    <div
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 20,
      }}
    >
      <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--color-muted)', fontWeight: 500 }}>
        {titulo}
      </p>
      <p style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: 'var(--color-text)', fontFamily: MONO }}>
        {valor}
      </p>
      {sub && (
        <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--color-body)', fontFamily: MONO }}>
          {sub}
        </p>
      )}
      {variacion !== undefined && (
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: MONO,
            color: esPositivo ? 'var(--color-success)' : 'var(--color-error)',
          }}
        >
          {varLabel(variacion)} vs período anterior
        </p>
      )}
    </div>
  )
}

interface Props { kpis: MetricasKPIsType }

export function MetricasKPIs({ kpis }: Props) {
  const tasaCanjeLabel = `${kpis.tasaCanje.canjeados.toLocaleString('es-AR')} / ${kpis.tasaCanje.emitidos.toLocaleString('es-AR')}`

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14,
      }}
    >
      <MiniKpi
        titulo="Revenue sacrificado"
        valor={fmt(kpis.revenueSacrificado.valor)}
        variacion={kpis.revenueSacrificado.variacion}
      />
      <MiniKpi
        titulo="Ventas con descuento"
        valor={kpis.ventasConDescuento.cantidad.toLocaleString('es-AR')}
        sub={`${kpis.ventasConDescuento.porcentaje}% del total`}
      />
      <MiniKpi
        titulo="Ticket promedio"
        valor={fmt(kpis.ticketPromedio.conDescuento)}
        sub={`Sin desc: ${fmt(kpis.ticketPromedio.sinDescuento)}`}
      />
      <MiniKpi
        titulo="Tasa de canje"
        valor={`${kpis.tasaCanje.porcentaje}%`}
        sub={tasaCanjeLabel}
      />
    </div>
  )
}
