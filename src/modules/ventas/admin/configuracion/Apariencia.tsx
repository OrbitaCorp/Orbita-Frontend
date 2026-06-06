// src/modules/ventas/admin/configuracion/Apariencia.tsx — Vista 16
// Apariencia pública de la tienda: color, tipografía, elementos visibles + preview.

import { useState } from 'react'
import { Card } from '@/design-system/components/Card'
import { ConfigTabs, type VistaConfig } from './components/ConfigTabs'
import { Toggle } from './components/ConfigControls'

const COLORES = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#0F172A', '#6B7280']
const FUENTES = ['Geist', 'Inter', 'Playfair', 'Poppins']
const ELEMENTOS: [string, boolean][] = [['Categorías', true], ['Buscador', true], ['Rating', true], ['WhatsApp', false]]

export default function Apariencia({ ir }: { ir: (v: VistaConfig) => void }) {
    const [color, setColor] = useState('#3B82F6')

    return (
        <div style={pageWrap}>
            <ConfigTabs activo="apariencia" ir={ir} />
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 20px' }}>Apariencia pública</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24, alignItems: 'start' }}>
                <Card>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-body)', marginBottom: 10 }}>Color primario</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                        {COLORES.map(c => (
                            <button key={c} onClick={() => setColor(c)} style={{ width: 36, height: 36, borderRadius: '50%', background: c, border: 'none', outline: color === c ? `2px solid ${c}` : 'none', outlineOffset: 2, cursor: 'pointer' }} />
                        ))}
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-body)', marginBottom: 10 }}>Tipografía</div>
                    <div style={{ display: 'flex', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 3, marginBottom: 18 }}>
                        {FUENTES.map((f, i) => (
                            <button key={f} style={{ flex: 1, height: 32, borderRadius: 5, border: 'none', background: i === 0 ? 'var(--color-bg)' : 'transparent', color: i === 0 ? 'var(--color-text)' : 'var(--color-muted)', fontSize: 12, fontWeight: i === 0 ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: i === 0 ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>{f}</button>
                        ))}
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-body)', marginBottom: 10 }}>Mostrar en tienda</div>
                    {ELEMENTOS.map(([l, on]) => (
                        <div key={l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                            <span style={{ fontSize: 13, color: 'var(--color-body)' }}>{l}</span>
                            <Toggle defaultOn={on} />
                        </div>
                    ))}
                </Card>

                {/* Preview en vivo */}
                <Card padding="md" style={{ padding: 0, position: 'sticky', top: 24 }}>
                    <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-muted)' }}>Vista previa</div>
                    <div style={{ padding: 18, background: `linear-gradient(160deg, ${color}14, var(--color-bg))` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Nueva colección</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', marginBottom: 12 }}>Rama Indumentaria</div>
                        <button style={{ height: 34, padding: '0 14px', borderRadius: 8, border: 'none', background: color, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Ver catálogo</button>
                    </div>
                </Card>
            </div>
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
