import type { CSSProperties } from 'react'
import { ArrowLeftRight, RotateCcw, Pause, LockKeyhole } from 'lucide-react'
import type { SesionCaja } from '../../types'

const FORMATO = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function formatHora(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso)
  )
}

function abreviarNombre(nombre: string): string {
  const partes = nombre.trim().split(' ')
  if (partes.length === 1) return partes[0]
  return `${partes[0]} ${partes[1][0]}.`
}

interface Props {
  sesion: SesionCaja
  acumulado: number
  pausadosCount: number
  onMovimientos: () => void
  onDevolucion: () => void
  onPausados: () => void
  onCerrar: () => void
}

const btnBase: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '7px 12px',
  borderRadius: 8,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-body)',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
}

export function HeaderTurno({ sesion, acumulado, pausadosCount, onMovimientos, onDevolucion, onPausados, onCerrar }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '0 24px',
        height: 60,
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        flexShrink: 0,
      }}
    >
      {/* Estado de caja + cajero */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--color-success)',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
            Caja abierta
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted)', paddingLeft: 13 }}>
          {abreviarNombre(sesion.cajero.nombre)} · desde {formatHora(sesion.fechaApertura)}
        </p>
      </div>

      {/* Separador */}
      <div style={{ width: 1, height: 32, background: 'var(--color-border)', flexShrink: 0 }} />

      {/* Acumulado */}
      <div style={{ flexShrink: 0 }}>
        <p style={{ margin: '0 0 1px', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
          Acumulado del turno
        </p>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: '"Geist Mono", "Fira Code", monospace', color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
          $ {FORMATO.format(acumulado)}
        </p>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={onMovimientos} style={btnBase}>
          <ArrowLeftRight size={14} /> Movimientos
        </button>
        <button onClick={onDevolucion} style={btnBase}>
          <RotateCcw size={14} /> Devolución
        </button>
        <button onClick={onPausados} style={{ ...btnBase, position: 'relative' }}>
          <Pause size={14} /> Tickets pausados
          {pausadosCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                background: 'var(--color-primary)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
                lineHeight: 1,
              }}
            >
              {pausadosCount}
            </span>
          )}
        </button>
        <button onClick={onCerrar} style={btnBase}>
          <LockKeyhole size={14} /> Cerrar caja
        </button>
      </div>
    </div>
  )
}
