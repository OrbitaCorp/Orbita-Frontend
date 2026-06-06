// Controles reutilizables de configuración: Toggle (switch) y CfgField (campo).

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

// Switch on/off — autocontenido para la demo (estado local).
export function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
    const [on, setOn] = useState(defaultOn)
    return (
        <span
            onClick={() => setOn(o => !o)}
            style={{
                width: 40, height: 22, borderRadius: 11,
                background: on ? 'var(--color-success)' : 'var(--color-surface-alt)',
                border: on ? 'none' : '1px solid var(--color-border)',
                position: 'relative', flexShrink: 0, cursor: 'pointer', display: 'inline-block',
            }}
        >
            <span style={{ position: 'absolute', top: on ? 3 : 2, left: on ? 21 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(15,23,42,0.15)', transition: 'left 200ms' }} />
        </span>
    )
}

interface CfgFieldProps {
    label:    string
    value:    string
    area?:    boolean
    select?:  boolean
}

export function CfgField({ label, value, area, select }: CfgFieldProps) {
    const base: React.CSSProperties = {
        width: '100%', boxSizing: 'border-box', background: 'var(--color-bg)',
        border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14,
        color: 'var(--color-text)', fontFamily: 'inherit', outline: 'none',
    }
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-body)', marginBottom: 6, display: 'block' }}>{label}</label>
            {area ? (
                <textarea defaultValue={value} rows={2} style={{ ...base, resize: 'vertical', minHeight: 52, padding: '10px 12px' }} />
            ) : (
                <div style={{ position: 'relative' }}>
                    <input defaultValue={value} style={{ ...base, height: 40, padding: '0 12px' }} />
                    {select && <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }} />}
                </div>
            )}
        </div>
    )
}
