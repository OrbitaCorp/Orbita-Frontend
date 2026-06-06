// src/modules/ventas/admin/pos/POSApertura.tsx — Vista 20
// Apertura de caja / inicio de turno.

import { Vault } from 'lucide-react'
import { Card } from '@/design-system/components/Card'
import { fmtMoney } from '@/lib/utils'
import { POSTabs, type VistaPOS } from './components/POSTabs'
import { CfgField } from '../configuracion/components/ConfigControls'

export default function POSApertura({ ir, onToast }: { ir: (v: VistaPOS) => void; onToast: (m: string) => void }) {
    return (
        <div style={pageWrap}>
            <POSTabs activo="apertura" ir={ir} />

            <Card style={{ maxWidth: 480, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                        <Vault size={26} strokeWidth={1.5} />
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>Abrí tu turno de trabajo</div>
                </div>

                <CfgField label="Monto inicial en efectivo" value="$ 5.000" />
                <CfgField label="Cajero responsable" value="Alexander Ibarra (Dueño)" select />
                <CfgField label="Notas del turno" value="" area />

                <div style={{ padding: 14, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 4 }}>Turno anterior</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>Cerrado · 16 may · 18:30 · {fmtMoney(142800)}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-warning)', marginTop: 4 }}>−$200 en efectivo</div>
                </div>

                <button onClick={() => { onToast('Caja abierta · Turno iniciado a las 9:00'); ir('cobro') }} style={{ width: '100%', height: 48, borderRadius: 10, border: 'none', background: '#10B981', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Abrir caja</button>
            </Card>
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
