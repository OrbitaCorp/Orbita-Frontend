import type { CSSProperties } from 'react'
import { X, Download } from 'lucide-react'
import type { FiltrosHistorial as FiltrosType } from '../../types'
import type { SesionCaja } from '../../types'

const CAJEROS_MOCK = [
  { id: '', nombre: 'Todos los cajeros' },
  { id: 'usr-1', nombre: 'María García' },
  { id: 'usr-2', nombre: 'Carlos López' },
  { id: 'usr-3', nombre: 'Sofía Martínez' },
]

const ESTADOS_FILTER: { valor: SesionCaja['estado'] | undefined; label: string }[] = [
  { valor: undefined, label: 'Todas' },
  { valor: 'abierta', label: 'Abierta' },
  { valor: 'cerrada', label: 'Cerrada' },
  { valor: 'forzada', label: 'Forzada' },
]

interface Props {
  filtros: FiltrosType
  onFiltrosChange: (f: FiltrosType) => void
  onExportarCSV: () => void
  totalRegistros: number
}

export function FiltrosHistorial({ filtros, onFiltrosChange, onExportarCSV, totalRegistros }: Props) {
  const set = (updates: Partial<FiltrosType>) => onFiltrosChange({ ...filtros, ...updates })

  const hayFiltros = !!(
    filtros.fechaDesde || filtros.fechaHasta || filtros.cajeroId ||
    filtros.estado || filtros.conDiferencia
  )

  const inputStyle: CSSProperties = {
    padding: '7px 10px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
  }

  const chipStyle = (activo: boolean): CSSProperties => ({
    padding: '4px 13px',
    borderRadius: 20,
    border: `1px solid ${activo ? 'var(--color-primary)' : 'var(--color-border)'}`,
    background: activo ? 'rgba(59,130,246,.1)' : 'transparent',
    color: activo ? 'var(--color-primary)' : 'var(--color-body)',
    fontSize: 12,
    fontWeight: activo ? 600 : 400,
    cursor: 'pointer',
    fontFamily: 'inherit',
  })

  return (
    <div
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Fila 1: rango de fechas + cajero + acciones */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>Desde</span>
          <input
            type="date"
            value={filtros.fechaDesde ?? ''}
            onChange={(e) => set({ fechaDesde: e.target.value || undefined })}
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>Hasta</span>
          <input
            type="date"
            value={filtros.fechaHasta ?? ''}
            onChange={(e) => set({ fechaHasta: e.target.value || undefined })}
            style={inputStyle}
          />
        </div>
        <select
          value={filtros.cajeroId ?? ''}
          onChange={(e) => set({ cajeroId: e.target.value || undefined })}
          style={{ ...inputStyle, minWidth: 170 }}
        >
          {CAJEROS_MOCK.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {hayFiltros && (
            <button
              onClick={() => onFiltrosChange({})}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <X size={13} /> Limpiar
            </button>
          )}
          <button
            onClick={onExportarCSV}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-body)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Download size={13} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Fila 2: estado chips + diferencia checkbox + contador */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--color-muted)', marginRight: 2 }}>Estado:</span>
        {ESTADOS_FILTER.map(({ valor, label }) => (
          <button
            key={label}
            onClick={() => set({ estado: valor })}
            style={chipStyle(filtros.estado === valor)}
          >
            {label}
          </button>
        ))}

        <div style={{ marginLeft: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            id="conDiferencia"
            checked={filtros.conDiferencia ?? false}
            onChange={(e) => set({ conDiferencia: e.target.checked || undefined })}
            style={{ cursor: 'pointer' }}
          />
          <label htmlFor="conDiferencia" style={{ fontSize: 12, color: 'var(--color-body)', cursor: 'pointer', userSelect: 'none' }}>
            Solo con diferencia
          </label>
        </div>

        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-muted)' }}>
          {totalRegistros} resultado{totalRegistros !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
