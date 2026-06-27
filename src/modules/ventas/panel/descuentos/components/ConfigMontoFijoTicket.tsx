import { FormField, LabelRow } from './FormField'
import { Toggle } from '../../../_shared/components/Toggle'

interface Props {
  valor: string
  montoMinimo: string
  sinMontoMinimo: boolean
  onChangeValor: (v: string) => void
  onChangeMontoMinimo: (v: string) => void
  onToggleSinMinimo: (v: boolean) => void
  errores?: Record<string, string>
}

export function ConfigMontoFijoTicket({
  valor, montoMinimo, sinMontoMinimo,
  onChangeValor, onChangeMontoMinimo, onToggleSinMinimo,
  errores = {},
}: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <FormField
        label="Monto de descuento"
        prefix="$"
        type="number"
        min="0"
        placeholder="10000"
        value={valor}
        onChange={(e) => onChangeValor(e.target.value)}
        mono
        error={errores.valor}
      />

      <div>
        <LabelRow
          label="Compra mínima"
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Sin mínimo</span>
              <Toggle checked={sinMontoMinimo} onChange={onToggleSinMinimo} />
            </div>
          }
        />
        <FormField
          prefix="$"
          type="number"
          min="0"
          placeholder="50000"
          value={montoMinimo}
          onChange={(e) => onChangeMontoMinimo(e.target.value)}
          disabled={sinMontoMinimo}
          mono
          error={errores.montoMinimo}
        />
      </div>

      <div
        style={{
          padding: 12,
          borderRadius: 8,
          background: 'var(--color-primary-bg)',
          border: '1px solid rgba(59,130,246,.15)',
          fontSize: 12,
          color: 'var(--color-primary-h)',
        }}
      >
        El monto fijo se resta del total del ticket una vez cumplido el mínimo.
      </div>
    </div>
  )
}
