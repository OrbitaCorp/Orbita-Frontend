import { FormField, LabelRow } from './FormField'
import { Toggle } from '../../../_shared/components/Toggle'

const DIAS = [
  { idx: 1, label: 'L' },
  { idx: 2, label: 'Ma' },
  { idx: 3, label: 'Mi' },
  { idx: 4, label: 'J' },
  { idx: 5, label: 'V' },
  { idx: 6, label: 'S' },
  { idx: 0, label: 'D' },
]

interface Props {
  fechaInicio: string
  fechaFin: string
  sinVencimiento: boolean
  diasVigencia: number[]
  todoElDia: boolean
  horaInicio: string
  horaFin: string
  limiteUsosTotal: string
  ilimitadoUsos: boolean
  onChange: (field: string, value: unknown) => void
  errores?: Record<string, string>
}

export function VigenciaForm({
  fechaInicio, fechaFin, sinVencimiento,
  diasVigencia, todoElDia, horaInicio, horaFin,
  limiteUsosTotal, ilimitadoUsos,
  onChange, errores = {},
}: Props) {
  const toggleDia = (idx: number) => {
    const siguiente = diasVigencia.includes(idx)
      ? diasVigencia.filter((d) => d !== idx)
      : [...diasVigencia, idx]
    onChange('diasVigencia', siguiente)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Fechas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormField
          label="Fecha de inicio"
          type="date"
          value={fechaInicio}
          onChange={(e) => onChange('fechaInicio', e.target.value)}
          error={errores.fechaInicio}
        />
        <div>
          <LabelRow
            label="Fecha de fin"
            right={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Sin vencimiento</span>
                <Toggle
                  checked={sinVencimiento}
                  onChange={(v) => onChange('sinVencimiento', v)}
                />
              </div>
            }
          />
          <FormField
            type="date"
            value={fechaFin}
            onChange={(e) => onChange('fechaFin', e.target.value)}
            disabled={sinVencimiento}
            error={errores.fechaFin}
          />
        </div>
      </div>

      {/* Días de la semana */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--color-body)' }}>
            Días de la semana
          </p>
          {diasVigencia.length === 0 && (
            <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Todos los días</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {DIAS.map(({ idx, label }) => {
            const activo = diasVigencia.includes(idx)
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleDia(idx)}
                style={{
                  width: 38, height: 38, borderRadius: '50%', border: 'none',
                  background: activo ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                  color: activo ? '#fff' : 'var(--color-muted)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'background 150ms ease, color 150ms ease',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Horario */}
      <div>
        <LabelRow
          label="Horario"
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Todo el día</span>
              <Toggle
                checked={todoElDia}
                onChange={(v) => onChange('todoElDia', v)}
              />
            </div>
          }
        />
        {!todoElDia && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 6 }}>
            <FormField
              label="Desde"
              type="time"
              value={horaInicio}
              onChange={(e) => onChange('horaInicio', e.target.value)}
              error={errores.horaInicio}
            />
            <FormField
              label="Hasta"
              type="time"
              value={horaFin}
              onChange={(e) => onChange('horaFin', e.target.value)}
              error={errores.horaFin}
            />
          </div>
        )}
      </div>

      {/* Límite de usos */}
      <div>
        <LabelRow
          label="Límite de usos totales"
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Ilimitado</span>
              <Toggle
                checked={ilimitadoUsos}
                onChange={(v) => onChange('ilimitadoUsos', v)}
              />
            </div>
          }
        />
        <FormField
          type="number"
          min="1"
          placeholder="100"
          value={limiteUsosTotal}
          onChange={(e) => onChange('limiteUsosTotal', e.target.value)}
          disabled={ilimitadoUsos}
          mono
          error={errores.limiteUsosTotal}
        />
      </div>
    </div>
  )
}
