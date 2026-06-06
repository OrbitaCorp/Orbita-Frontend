// src/modules/ventas/admin/descuentos/CuponNuevo.tsx — Vista 32

import { useState } from 'react'
import { Card } from '@/design-system/components/Card'
import { Button } from '@/design-system/components/Button'
import { fmtMoney } from '@/lib/utils'
import { DescTabs, type VistaDescuento } from './components/DescTabs'
import { CfgField } from '../configuracion/components/ConfigControls'

export default function CuponNuevo({ ir, onToast }: { ir: (v: VistaDescuento) => void; onToast: (m: string) => void }) {
    const [codigo, setCodigo] = useState('ORBITA10')
    const [tipo, setTipo] = useState<'porcentaje' | 'fijo'>('porcentaje')
    const [valor, setValor] = useState('10')

    const inputBase: React.CSSProperties = { height: 40, padding: '0 12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace', outline: 'none', boxSizing: 'border-box' }

    return (
        <div style={pageWrap}>
            <DescTabs activo="nuevo" ir={ir} />
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 20px' }}>Nuevo cupón</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 24, alignItems: 'start', maxWidth: 900 }}>
                <Card>
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-body)', marginBottom: 6, display: 'block' }}>Código</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())} style={{ ...inputBase, flex: 1 }} />
                            <Button variant="outline" onClick={() => setCodigo('ORB' + Math.floor(Math.random() * 9000 + 1000))}>Generar</Button>
                        </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-body)', marginBottom: 6, display: 'block' }}>Tipo</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {([['porcentaje', 'Porcentaje %'], ['fijo', 'Monto fijo $']] as ['porcentaje' | 'fijo', string][]).map(([id, l]) => {
                                const a = tipo === id
                                return <button key={id} onClick={() => setTipo(id)} style={{ flex: 1, height: 40, borderRadius: 8, border: `1px solid ${a ? 'var(--color-primary)' : 'var(--color-border)'}`, background: a ? 'var(--color-primary-bg)' : 'var(--color-bg)', color: a ? 'var(--color-primary)' : 'var(--color-body)', fontSize: 13, fontWeight: a ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit' }}>{l}</button>
                            })}
                        </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-body)', marginBottom: 6, display: 'block' }}>Valor</label>
                        <input value={valor} onChange={e => setValor(e.target.value.replace(/\D/g, ''))} style={{ ...inputBase, width: '100%' }} />
                    </div>

                    <CfgField label="Límite de usos" value="100" />
                    <CfgField label="Fecha de vencimiento" value="30/06/2026" />

                    <Button variant="primary" size="lg" onClick={() => { onToast(`Cupón ${codigo} creado`); ir('cupones') }}>Crear cupón</Button>
                </Card>

                <Card style={{ position: 'sticky', top: 24 }}>
                    <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 12 }}>Así lo verá el cliente:</div>
                    <div style={{ padding: 14, background: 'var(--color-surface)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontSize: 13, color: 'var(--color-body)' }}>Descuento</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 10px', borderRadius: 9999, background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: 12, fontWeight: 600 }}>{codigo} −{tipo === 'porcentaje' ? valor + '%' : fmtMoney(Number(valor) || 0)}</span>
                    </div>
                </Card>
            </div>
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
