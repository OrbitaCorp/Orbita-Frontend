import { useState } from 'react'
import { Tag, Percent, DollarSign, ChevronDown, ChevronUp, X, AlertCircle } from 'lucide-react'
import type { Descuento } from '../../types'

// Cupones disponibles en el mock — en producción viene del backend
const CUPONES_MOCK: Record<string, Descuento> = {
  PROMO20:  { tipo: 'porcentaje', valor: 20,  codigo: 'PROMO20'  },
  VERANO10: { tipo: 'porcentaje', valor: 10,  codigo: 'VERANO10' },
  DESC500:  { tipo: 'monto_fijo', valor: 500, codigo: 'DESC500'  },
}

interface Props {
  cupon: Descuento | null
  descuentoManual: Descuento | null
  onAplicarCupon: (descuento: Descuento) => void
  onQuitarCupon: () => void
  onAplicarDescuentoManual: (descuento: Descuento | null) => void
  disabled?: boolean
}

function labelDescuento(d: Descuento): string {
  return d.tipo === 'porcentaje' ? `${d.valor}% off` : `$${d.valor} off`
}

export function ZonaDescuentos({
  cupon,
  descuentoManual,
  onAplicarCupon,
  onQuitarCupon,
  onAplicarDescuentoManual,
  disabled = false,
}: Props) {
  const [codigo, setCodigo] = useState('')
  const [errCupon, setErrCupon] = useState<string | null>(null)
  const [mostrarManual, setMostrarManual] = useState(false)
  const [tipoManual, setTipoManual] = useState<'porcentaje' | 'monto_fijo'>('porcentaje')
  const [valorManual, setValorManual] = useState('')

  const handleAplicarCupon = () => {
    const key = codigo.trim().toUpperCase()
    if (!key) { setErrCupon('Ingresá un código.'); return }
    const desc = CUPONES_MOCK[key]
    if (!desc) { setErrCupon('Código inválido.'); return }
    onAplicarCupon(desc)
    setCodigo('')
    setErrCupon(null)
  }

  const handleAplicarManual = () => {
    const valor = parseFloat(valorManual.replace(',', '.'))
    if (!valor || valor <= 0) return
    onAplicarDescuentoManual({ tipo: tipoManual, valor })
    setValorManual('')
    setMostrarManual(false)
  }

  const tipoBtn = (t: 'porcentaje' | 'monto_fijo') => ({
    width: 30,
    height: 30,
    border: 'none',
    background: tipoManual === t ? 'var(--color-primary)' : 'transparent',
    color: tipoManual === t ? '#fff' : 'var(--color-muted)',
    cursor: 'pointer' as const,
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  })

  return (
    <div style={{ padding: '10px 16px', borderTop: '1px solid var(--color-border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>

      {/* ── Cupón ─────────────────────── */}
      {cupon ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 8, background: 'rgba(16,185,129,.08)', border: '1px solid var(--color-success)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-success)', fontWeight: 600 }}>
            <Tag size={13} />
            {cupon.codigo} — {labelDescuento(cupon)}
          </span>
          <button onClick={onQuitarCupon} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-success)', display: 'flex', padding: 2 }}>
            <X size={13} />
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={codigo}
              onChange={(e) => { setCodigo(e.target.value.toUpperCase()); setErrCupon(null) }}
              onKeyDown={(e) => e.key === 'Enter' && !disabled && handleAplicarCupon()}
              placeholder="Código de cupón"
              disabled={disabled}
              style={{
                flex: 1, padding: '7px 10px', borderRadius: 7,
                border: `1px solid ${errCupon ? 'var(--color-error)' : 'var(--color-border)'}`,
                background: disabled ? 'var(--color-surface)' : 'var(--color-bg)',
                color: disabled ? 'var(--color-muted)' : 'var(--color-text)',
                fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <button
              onClick={handleAplicarCupon}
              disabled={disabled}
              style={{
                padding: '7px 12px', borderRadius: 7, border: 'none', whiteSpace: 'nowrap',
                background: disabled ? 'var(--color-surface)' : 'var(--color-primary)',
                color: disabled ? 'var(--color-muted)' : '#fff',
                fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              }}
            >
              Aplicar
            </button>
          </div>
          {errCupon && (
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={12} /> {errCupon}
            </p>
          )}
        </div>
      )}

      {/* ── Descuento manual ──────────── */}
      {descuentoManual ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 8, background: 'rgba(245,158,11,.08)', border: '1px solid var(--color-warning)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-warning)', fontWeight: 600 }}>
            <Percent size={13} />
            Desc. manual — {labelDescuento(descuentoManual)}
          </span>
          <button onClick={() => onAplicarDescuentoManual(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-warning)', display: 'flex', padding: 2 }}>
            <X size={13} />
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => !disabled && setMostrarManual((v) => !v)}
            disabled={disabled}
            style={{
              background: 'none', border: 'none', padding: 0,
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: 13, fontFamily: 'inherit',
              color: disabled ? 'var(--color-muted)' : 'var(--color-primary)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            % Descuento manual
            {!disabled && (mostrarManual ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
          </button>

          {mostrarManual && !disabled && (
            <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 7, overflow: 'hidden', flexShrink: 0 }}>
                <button onClick={() => setTipoManual('porcentaje')} style={tipoBtn('porcentaje')}><Percent size={12} /></button>
                <button onClick={() => setTipoManual('monto_fijo')}  style={tipoBtn('monto_fijo')}><DollarSign size={12} /></button>
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={valorManual}
                onChange={(e) => setValorManual(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAplicarManual()}
                placeholder={tipoManual === 'porcentaje' ? '10' : '500'}
                autoFocus
                style={{
                  flex: 1, padding: '6px 10px', borderRadius: 7,
                  border: '1px solid var(--color-border)', background: 'var(--color-bg)',
                  color: 'var(--color-text)', fontSize: 13, fontFamily: '"Geist Mono", monospace', outline: 'none',
                }}
              />
              <button
                onClick={handleAplicarManual}
                style={{ padding: '6px 10px', borderRadius: 7, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Ok
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
