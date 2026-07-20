// Controles reutilizables de configuración: Toggle (switch) y CfgField (campo).
//
// Soportan dos modos (cambio aditivo — Fase 1, integración de ConfigGeneral):
//  - NO controlado (comportamiento original): `defaultOn` / `value` actúan como valor
//    inicial y el control maneja su propio estado. Así lo siguen usando StockForm
//    (inventario) y las demás vistas prototipo — nada de eso cambia.
//  - CONTROLADO (nuevo): pasando `on` + `onChange` (Toggle) u `onChange` (CfgField),
//    el padre es dueño del estado — necesario para leer/guardar contra la API real.

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function Toggle({ defaultOn = false, on, onChange, disabled = false }: {
    defaultOn?: boolean
    on?: boolean
    onChange?: (on: boolean) => void
    disabled?: boolean
}) {
    const [interno, setInterno] = useState(defaultOn)
    const activo = on ?? interno
    const click = () => {
        if (disabled) return
        if (onChange) onChange(!activo)
        else setInterno(o => !o)
    }
    return (
        <span
            onClick={click}
            style={{
                width: 40, height: 22, borderRadius: 11,
                background: activo ? 'var(--color-success)' : 'var(--color-surface-alt)',
                border: activo ? 'none' : '1px solid var(--color-border)',
                position: 'relative', flexShrink: 0, cursor: disabled ? 'not-allowed' : 'pointer', display: 'inline-block',
                opacity: disabled ? 0.5 : 1,
            }}
        >
            <span style={{ position: 'absolute', top: activo ? 3 : 2, left: activo ? 21 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(15,23,42,0.15)', transition: 'left 200ms' }} />
        </span>
    )
}

interface CfgFieldProps {
    label:     string
    value:     string
    area?:     boolean
    select?:   boolean
    onChange?: (value: string) => void
    disabled?: boolean
}

export function CfgField({ label, value, area, select, onChange, disabled }: CfgFieldProps) {
    const base: React.CSSProperties = {
        width: '100%', boxSizing: 'border-box', background: 'var(--color-bg)',
        border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14,
        color: 'var(--color-text)', fontFamily: 'inherit', outline: 'none',
    }
    // Con onChange el campo es controlado (`value`); sin onChange conserva el
    // comportamiento original (`defaultValue`) para no romper a los otros consumidores.
    const bind = onChange
        ? { value, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value), disabled }
        : { defaultValue: value, disabled }
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-body)', marginBottom: 6, display: 'block' }}>{label}</label>
            {area ? (
                <textarea {...bind} rows={2} style={{ ...base, resize: 'vertical', minHeight: 52, padding: '10px 12px' }} />
            ) : (
                <div style={{ position: 'relative' }}>
                    <input {...bind} style={{ ...base, height: 40, padding: '0 12px' }} />
                    {select && <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }} />}
                </div>
            )}
        </div>
    )
}
