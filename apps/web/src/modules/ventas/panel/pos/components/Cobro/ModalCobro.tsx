import { useState } from 'react'
import { X, Check, Plus } from 'lucide-react'
import { SelectorMetodoPago, METODOS_PAGO, LABELS_METODO } from './MetodoPago'
import { InputMonto, parseMonto } from './InputMonto'
import type { TipoMetodoPago, MetodoPago } from '../../types'

const MONO = '"Geist Mono", "Fira Code", monospace'
const FMT = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

interface Props {
  isOpen: boolean
  total: number
  onClose: () => void
  onConfirmar: (metodos: MetodoPago[], vuelto?: number) => void
}

// Se desmonta cuando isOpen=false → estado siempre fresco al abrir
function ModalCobroContent({ total, onClose, onConfirmar }: Omit<Props, 'isOpen'>) {
  const [metodo, setMetodo] = useState<TipoMetodoPago>('efectivo')
  const [montoInput, setMontoInput] = useState('')
  const [referencia, setReferencia] = useState('')
  const [pagoMixto, setPagoMixto] = useState(false)
  const [mixto, setMixto] = useState<[TipoMetodoPago, string][]>([
    ['efectivo', ''],
    ['tarjeta_debito', ''],
  ])

  const esEfectivo = metodo === 'efectivo'
  const montoN = parseMonto(montoInput)
  const sumaM = mixto.reduce((s, [, m]) => s + parseMonto(m), 0)

  const puedeConfirmar = pagoMixto
    ? sumaM > 0
    : esEfectivo ? montoN > 0 : true

  const handleConfirmar = () => {
    let metodos: MetodoPago[]
    let vuelto: number | undefined

    if (pagoMixto) {
      metodos = mixto
        .filter(([, m]) => parseMonto(m) > 0)
        .map(([tipo, m]) => ({ tipo, monto: parseMonto(m) }))
    } else {
      metodos = [{ tipo: metodo, monto: total, referencia: referencia.trim() || undefined }]
      if (esEfectivo && montoN > total) vuelto = montoN - total
    }

    onConfirmar(metodos, vuelto)
    onClose()
  }

  const updateMixto = (i: number, field: 0 | 1, val: string) =>
    setMixto((prev) => prev.map((r, j) => j === i ? (field === 0 ? [val as TipoMetodoPago, r[1]] : [r[0], val]) : r))

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--color-bg)', borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: 'Sora, Inter, sans-serif', color: 'var(--color-text)' }}>
            Cobrar venta
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', display: 'flex', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Total a cobrar</span>
            <span style={{ fontSize: 28, fontWeight: 800, fontFamily: MONO, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
              $ {FMT.format(total)}
            </span>
          </div>

          {/* Método de pago */}
          {!pagoMixto && (
            <div>
              <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                Método de pago
              </p>
              <SelectorMetodoPago seleccionado={metodo} onChange={(t) => { setMetodo(t); setReferencia('') }} />
            </div>
          )}

          {/* + Pago mixto toggle */}
          <button
            onClick={() => setPagoMixto((v) => !v)}
            style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
          >
            <Plus size={13} /> {pagoMixto ? 'Un solo método' : 'Pago mixto'}
          </button>

          {/* Zona de monto */}
          {!pagoMixto ? (
            esEfectivo ? (
              <InputMonto total={total} monto={montoInput} onChange={setMontoInput} />
            ) : (
              <div>
                <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                  Nº de operación <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(opcional)</span>
                </p>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ej. 4587901"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            )
          ) : (
            /* Pago mixto: 2 filas */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                Distribuir pago
              </p>
              {mixto.map(([tipo, monto], i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    value={tipo}
                    onChange={(e) => updateMixto(i, 0, e.target.value)}
                    style={{ flex: 1, padding: '9px 10px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                  >
                    {METODOS_PAGO.map((m) => <option key={m.tipo} value={m.tipo}>{m.label}</option>)}
                  </select>
                  <div style={{ position: 'relative', width: 110 }}>
                    <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontFamily: MONO, fontSize: 13, color: 'var(--color-muted)', pointerEvents: 'none' }}>$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={monto}
                      onChange={(e) => updateMixto(i, 1, e.target.value)}
                      placeholder="0"
                      style={{ width: '100%', padding: '9px 8px 9px 22px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 14, fontWeight: 700, fontFamily: MONO, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 2px', fontSize: 13, color: sumaM >= total ? 'var(--color-success)' : 'var(--color-muted)' }}>
                <span>Restante</span>
                <span style={{ fontFamily: MONO, fontWeight: 700 }}>$ {FMT.format(Math.max(0, total - sumaM))}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, padding: '0 24px 24px' }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-body)', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={!puedeConfirmar}
            style={{ flex: 2, padding: '12px 0', borderRadius: 10, border: 'none', background: puedeConfirmar ? 'var(--color-primary)' : 'var(--color-border)', color: puedeConfirmar ? '#fff' : 'var(--color-muted)', fontSize: 14, fontWeight: 600, cursor: puedeConfirmar ? 'pointer' : 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Check size={15} /> Confirmar cobro
          </button>
        </div>
      </div>
    </div>
  )
}

export function ModalCobro({ isOpen, ...rest }: Props) {
  if (!isOpen) return null
  return <ModalCobroContent {...rest} />
}
