import { useState } from 'react'
import type { CSSProperties } from 'react'
import { X, Receipt, ArrowLeftRight } from 'lucide-react'
import type { FilaSesion } from '../../hooks/useCaja'

const FMT = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const MONO = '"Geist Mono", "Fira Code", monospace'

const LABEL_METODO: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta_debito: 'Tarjeta débito',
  tarjeta_credito: 'Tarjeta crédito',
  transferencia: 'Transferencia',
  qr: 'QR',
}

const ESTADO_CFG = {
  abierta: { label: 'En curso', color: 'var(--color-success)' },
  cerrada: { label: 'Cerrada',  color: 'var(--color-muted)' },
  forzada: { label: 'Forzada',  color: 'var(--color-error)' },
}

function formatFechaHora(iso: string) {
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

type Tab = 'resumen' | 'movimientos'

interface Props {
  fila: FilaSesion
  onCerrar: () => void
}

export function ModalDetalleSesion({ fila, onCerrar }: Props) {
  const [tab, setTab] = useState<Tab>('resumen')
  const { sesion, ventasTotales, cantidadTickets, diferencia, desglose, movimientos } = fila

  const ingresos = movimientos.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0)
  const egresos = movimientos.filter((m) => m.tipo === 'egreso').reduce((s, m) => s + m.monto, 0)
  const cajaId = `C-${sesion.id.slice(-4).padStart(4, '0')}`
  const estadoCfg = ESTADO_CFG[sesion.estado] ?? ESTADO_CFG.cerrada

  const tabStyle = (t: Tab): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 14px',
    borderRadius: 8,
    border: 'none',
    background: tab === t ? 'var(--color-surface)' : 'transparent',
    color: tab === t ? 'var(--color-text)' : 'var(--color-muted)',
    fontSize: 13,
    fontWeight: tab === t ? 600 : 400,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.1s',
  })

  const thStyle: CSSProperties = { padding: '6px 8px', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-muted)', borderBottom: '1px solid var(--color-border)' }
  const tdStyle: CSSProperties = { padding: '9px 8px', fontSize: 14, color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' }

  return (
    <div onClick={onCerrar} style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--color-bg)', borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '88vh', margin: '0 16px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'Sora, Inter, sans-serif' }}>
                {cajaId}
              </h3>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: `${estadoCfg.color}18`, color: estadoCfg.color }}>
                {estadoCfg.label}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-muted)' }}>
              {sesion.cajero.nombre} · {formatFechaHora(sesion.fechaApertura)}
              {sesion.fechaCierre ? ` → ${formatFechaHora(sesion.fechaCierre)}` : ''}
            </p>
          </div>
          <button onClick={onCerrar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 4 }}>
          <button style={tabStyle('resumen')} onClick={() => setTab('resumen')}>
            <Receipt size={13} /> Resumen
          </button>
          <button style={tabStyle('movimientos')} onClick={() => setTab('movimientos')}>
            <ArrowLeftRight size={13} /> Movimientos
            {movimientos.length > 0 && (
              <span style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '0 6px', fontSize: 11, fontFamily: MONO, lineHeight: '18px' }}>
                {movimientos.length}
              </span>
            )}
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {tab === 'resumen' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* KPI row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {[
                  { label: 'Fondo inicial', valor: `$ ${FMT.format(sesion.montoInicial)}`, color: undefined },
                  { label: 'Ventas totales', valor: `$ ${FMT.format(ventasTotales)}`, color: 'var(--color-success)' },
                  { label: 'Tickets', valor: String(cantidadTickets), color: undefined },
                  {
                    label: 'Diferencia',
                    valor: diferencia === null ? '—' : diferencia === 0 ? 'Cuadra' : `${diferencia > 0 ? '+' : '−'} $ ${FMT.format(Math.abs(diferencia))}`,
                    color: diferencia === null ? 'var(--color-muted)' : diferencia === 0 ? 'var(--color-success)' : diferencia > 0 ? 'var(--color-warning)' : 'var(--color-error)',
                  },
                ].map(({ label, valor, color }) => (
                  <div key={label} style={{ background: 'var(--color-surface)', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                      {label}
                    </p>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: MONO, color: color ?? 'var(--color-text)' }}>
                      {valor}
                    </p>
                  </div>
                ))}
              </div>

              {/* Movimientos neto */}
              {(ingresos > 0 || egresos > 0) && (
                <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--color-surface)', fontSize: 13, color: 'var(--color-body)', lineHeight: 1.5 }}>
                  Mov. manuales:{' '}
                  <span style={{ color: 'var(--color-success)', fontFamily: MONO }}>+$ {FMT.format(ingresos)}</span> ingresos ·{' '}
                  <span style={{ color: 'var(--color-error)', fontFamily: MONO }}>−$ {FMT.format(egresos)}</span> egresos
                </div>
              )}

              {/* Desglose */}
              {desglose.length > 0 && (
                <div>
                  <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                    Desglose por método de pago
                  </p>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ ...thStyle, textAlign: 'left' }}>Método</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Cant.</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {desglose.map((d) => (
                        <tr key={d.tipo}>
                          <td style={tdStyle}>{LABEL_METODO[d.tipo] ?? d.tipo}</td>
                          <td style={{ ...tdStyle, textAlign: 'right', fontFamily: MONO, color: 'var(--color-muted)' }}>{d.cantidad}</td>
                          <td style={{ ...tdStyle, textAlign: 'right', fontFamily: MONO, fontWeight: 700 }}>$ {FMT.format(d.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'movimientos' && (
            <div>
              {movimientos.length === 0 ? (
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-muted)', textAlign: 'center', padding: '32px 0' }}>
                  Sin movimientos en este turno.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {movimientos.map((m) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: 'var(--color-surface)' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>{m.motivo}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-muted)' }}>
                          {new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(m.fecha))}
                        </p>
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: m.tipo === 'ingreso' ? 'var(--color-success)' : 'var(--color-error)' }}>
                        {m.tipo === 'ingreso' ? '+' : '−'}$ {FMT.format(m.monto)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
