// src/modules/ventas/admin/mensajes/Plantillas.tsx — Vista 30
// Plantillas de mensajes reutilizables con variables resaltadas.

import { Plus } from 'lucide-react'
import { Card } from '@/design-system/components/Card'
import { Button } from '@/design-system/components/Button'
import { MsgTabs, type VistaMensaje } from './components/MsgTabs'
import { PLANTILLAS } from './mock/mensajes.mock'

export default function Plantillas({ ir, onToast }: { ir: (v: VistaMensaje) => void; onToast: (m: string) => void }) {
    return (
        <div style={pageWrap}>
            <MsgTabs activo="plantillas" ir={ir} />
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: 0 }}>Plantillas de mensajes</h1>
                <Button variant="primary" icon={<Plus size={16} />}>Nueva plantilla</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
                {PLANTILLAS.map(p => (
                    <Card key={p.nombre}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', flex: 1 }}>{p.nombre}</span>
                            {p.tags.map(tg => (
                                <span key={tg} style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 8px', borderRadius: 9999, background: 'var(--color-primary-bg)', color: 'var(--color-primary)', fontSize: 10, fontWeight: 600 }}>{tg}</span>
                            ))}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--color-body)', lineHeight: 1.6, padding: 12, background: 'var(--color-surface)', borderRadius: 8, marginBottom: 12 }}>
                            {p.texto.split(/(\{[^}]+\})/).map((part, i) => part.startsWith('{')
                                ? <span key={i} style={{ color: 'var(--color-primary)', fontWeight: 600, fontFamily: '"Geist Mono", monospace' }}>{part}</span>
                                : <span key={i}>{part}</span>)}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Button variant="primary" size="sm" onClick={() => onToast(`Plantilla "${p.nombre}" lista para usar`)}>Usar</Button>
                            <Button variant="outline" size="sm">Editar</Button>
                            <Button variant="danger" size="sm">Eliminar</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
