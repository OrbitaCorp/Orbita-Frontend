import type { CSSProperties } from 'react'
import { DiferenciaIndicador } from './DiferenciaIndicador'

const FMT = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const MONO = '"Geist Mono", "Fira Code", monospace'

function parseMonto(raw: string): number {
  return parseFloat(raw.replace(/\./g, '').replace(',', '.')) || 0
}

interface Props {
  totalTeorico: number
  conteo: string
  onConteoChange: (v: string) => void
  motivo: string
  onMotivoChange: (v: string) => void
  notas: string
  onNotasChange: (v: string) => void
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.04em',
  color: 'var(--color-body)',
  marginBottom: 6,
}

const inputBase: CSSProperties = {
  width: '100%',
  borderRadius: 8,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

export function ConteoCierre({ totalTeorico, conteo, onConteoChange, motivo, onMotivoChange, notas, onNotasChange }: Props) {
  const conteoN = parseMonto(conteo)
  const hayConteo = conteo.trim().length > 0
  const diff = conteoN - totalTeorico
  const hayDiferencia = hayConteo && diff !== 0

  return (
    <div
      style={{
        background: 'var(--color-bg)',
        borderRadius: 14,
        border: '1px solid var(--color-border)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      {/* Total teórico */}
      <div>
        <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--color-muted)' }}>
          Total teórico en efectivo
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 800,
            fontFamily: MONO,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
          }}
        >
          $ {FMT.format(totalTeorico)}
        </p>
      </div>

      {/* Conteo físico */}
      <div>
        <label style={labelStyle}>Conteo físico del efectivo</label>
        <div style={{ position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              fontFamily: MONO,
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--color-muted)',
              pointerEvents: 'none',
            }}
          >
            $
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={conteo}
            onChange={(e) => onConteoChange(e.target.value)}
            placeholder="0"
            style={{
              ...inputBase,
              padding: '11px 12px 11px 28px',
              fontSize: 20,
              fontWeight: 700,
              fontFamily: MONO,
            }}
          />
        </div>
        {!hayConteo && (
          <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--color-muted)' }}>
            Ingresá el conteo de efectivo en caja.
          </p>
        )}
      </div>

      {/* Diferencia (solo cuando hay conteo) */}
      {hayConteo && (
        <DiferenciaIndicador conteoN={conteoN} totalTeorico={totalTeorico} />
      )}

      {/* Motivo (obligatorio si hay diferencia) */}
      {hayDiferencia && (
        <div>
          <label style={{ ...labelStyle, color: 'var(--color-error)' }}>
            Motivo de la diferencia *
          </label>
          <textarea
            value={motivo}
            onChange={(e) => onMotivoChange(e.target.value)}
            placeholder="Explicá la diferencia encontrada…"
            rows={2}
            style={{
              ...inputBase,
              padding: '10px 12px',
              resize: 'vertical',
              fontSize: 13,
              borderColor: !motivo.trim() ? 'var(--color-error)' : 'var(--color-border)',
            }}
          />
          {!motivo.trim() && (
            <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--color-error)' }}>
              Requerido para cerrar con diferencia.
            </p>
          )}
        </div>
      )}

      {/* Notas del turno */}
      <div>
        <label style={labelStyle}>
          Notas del turno{' '}
          <span style={{ fontWeight: 400, color: 'var(--color-muted)' }}>(opcional)</span>
        </label>
        <textarea
          value={notas}
          onChange={(e) => onNotasChange(e.target.value)}
          placeholder="Observaciones generales del turno…"
          rows={3}
          style={{ ...inputBase, padding: '10px 12px', resize: 'vertical', fontSize: 13 }}
        />
      </div>
    </div>
  )
}
