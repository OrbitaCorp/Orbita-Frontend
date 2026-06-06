// src/modules/ventas/admin/pos/POSHistorial.tsx — Vista 22
// Historial de cierres de caja con KPIs del mes.

import { useState } from 'react'
import { Printer, Vault, BarChart3, Banknote } from 'lucide-react'
import { Avatar } from '@/design-system/components/Avatar'
import { fmtMoney } from '@/lib/utils'
import { StatCard } from '../_shared/StatCard'
import { POSTabs, type VistaPOS } from './components/POSTabs'
import { ModalComprobante } from '../pedidos/components/ModalComprobante'
import { CAJAS } from './mock/pos.mock'

const COLS = '90px 1fr 150px 150px 120px 100px 70px'

export default function POSHistorial({ ir }: { ir: (v: VistaPOS) => void }) {
    const [comprobante, setComprobante] = useState<string | null>(null)

    return (
        <div style={pageWrap}>
            <POSTabs activo="historial" ir={ir} />
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 20px' }}>Historial de cajas</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                <StatCard label="Turnos este mes" value="18" icon={Vault} accent="#3B82F6" />
                <StatCard label="Promedio por turno" value={fmtMoney(189400)} icon={BarChart3} accent="#10B981" />
                <StatCard label="Total del mes" value={fmtMoney(3409200)} icon={Banknote} accent="#8B5CF6" />
            </div>

            <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', gap: 10, padding: '0 16px', height: 44, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <span>Turno</span><span>Cajero</span><span>Apertura</span><span>Cierre</span><span style={{ textAlign: 'right' }}>Ventas</span><span>Dif.</span><span />
                </div>
                {CAJAS.map((c, i) => (
                    <div key={c.id} style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', gap: 10, padding: '0 16px', height: 54, borderBottom: i < CAJAS.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{c.id}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar name={c.cajero} size={24} />
                            <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{c.cajero}</span>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{c.apertura}</span>
                        <span style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{c.cierre}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace', textAlign: 'right' }}>{fmtMoney(c.ventas)}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px', borderRadius: 9999, background: c.estado === 'ok' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)', color: c.estado === 'ok' ? 'var(--color-success)' : 'var(--color-warning)', fontSize: 11, fontWeight: 600, width: 'fit-content' }}>{c.estado === 'ok' ? 'OK' : '−$200'}</span>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <button onClick={() => setComprobante(c.id)} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Printer size={15} /></button>
                        </div>
                    </div>
                ))}
            </div>

            <ModalComprobante isOpen={comprobante !== null} onClose={() => setComprobante(null)} tipo="cierre" id={comprobante ?? undefined} />
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
