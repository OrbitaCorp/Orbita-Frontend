// src/modules/ventas/admin/reportes/ReporteVentas.tsx — Vista 11 + hub del módulo
//
// Punto de entrada del módulo `reportes` (registrado en el componentMap admin).
// Funciona como HUB con tabs: ventas (V11), productos (V12), clientes (V13),
// inventario (V14), conmutados vía `router.query.vista`.
//
//   /admin/[negocioId]/ventas/reportes                → ventas (V11)
//   …/reportes?vista=productos                        → ReporteProductos (V12)
//   …/reportes?vista=clientes                         → ReporteClientes (V13)
//   …/reportes?vista=inventario                       → ReporteInventario (V14)

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Download, Banknote, ShoppingBag, BarChart3, TrendingUp, Maximize2 } from 'lucide-react'
import { Card } from '@/design-system/components/Card'
import { Button } from '@/design-system/components/Button'
import { Modal } from '@/design-system/components/Modal'
import { Toast } from '@/design-system/components/Toast'
import { LineChart, DonutChart } from '@/design-system/components/Chart'
import { fmtMoney } from '@/lib/utils'

import { StatCard } from '../_shared/StatCard'
import { ReporteTabs, type VistaReporte } from './components/ReporteTabs'
import ReporteProductos from './ReporteProductos'
import ReporteClientes from './ReporteClientes'
import ReporteInventario from './ReporteInventario'
import { SERIE_VENTAS } from './mock/reportes.mock'

const money = (v: number) => fmtMoney(v)

// ─── Ventas (V11) ─────────────────────────────────────────────────────────────

function VentasView({ ir, onToast }: { ir: (v: VistaReporte) => void; onToast: (m: string) => void }) {
    const [exp, setExp] = useState(false)
    const total = SERIE_VENTAS.valores.reduce((s, v) => s + v, 0)

    return (
        <div style={pageWrap}>
            <ReporteTabs activo="ventas" ir={ir} />

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: 0 }}>Reporte de ventas</h1>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="outline" icon={<Download size={15} />} onClick={() => onToast('Descargando PDF…')}>PDF</Button>
                    <Button variant="outline" icon={<Download size={15} />} onClick={() => onToast('Descargando CSV…')}>CSV</Button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
                <StatCard label="Ventas" value={fmtMoney(3480400)} icon={Banknote} accent="#3B82F6" delta="+12%" deltaPos />
                <StatCard label="Pedidos" value="142" icon={ShoppingBag} accent="#10B981" delta="+8%" deltaPos />
                <StatCard label="Ticket prom" value={fmtMoney(24510)} icon={BarChart3} accent="#8B5CF6" delta="+4%" deltaPos />
                <StatCard label="Conversión" value="68%" icon={TrendingUp} accent="#F59E0B" delta="+3%" deltaPos />
            </div>

            <Card style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Ventas vs período anterior</div>
                    <button onClick={() => setExp(true)} style={iconBtn}><Maximize2 size={15} /></button>
                </div>
                <LineChart data={SERIE_VENTAS.valores} labels={SERIE_VENTAS.labels} height={240} formatValue={money} />
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: 16 }}>
                <Card>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 14 }}>Por canal</div>
                    <DonutChart size={140} data={[{ label: 'Online', value: 68, color: '#3B82F6' }, { label: 'Presencial', value: 32, color: '#10B981' }]} />
                </Card>
                <Card padding="md" style={{ padding: 0 }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Desglose por día</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '8px 20px', fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)' }}>
                        <span>Día</span><span style={{ textAlign: 'right' }}>Ventas</span><span style={{ textAlign: 'right' }}>Pedidos</span>
                    </div>
                    {SERIE_VENTAS.labels.map((l, i) => (
                        <div key={l} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '9px 20px', fontSize: 13, borderBottom: '1px solid var(--color-border)' }}>
                            <span style={{ color: 'var(--color-body)' }}>{l}</span>
                            <span style={{ textAlign: 'right', color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(SERIE_VENTAS.valores[i])}</span>
                            <span style={{ textAlign: 'right', color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{Math.round(SERIE_VENTAS.valores[i] / 24000)}</span>
                        </div>
                    ))}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '11px 20px', fontSize: 13, fontWeight: 700 }}>
                        <span style={{ color: 'var(--color-text)' }}>Total</span>
                        <span style={{ textAlign: 'right', color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(total)}</span>
                        <span style={{ textAlign: 'right', color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>142</span>
                    </div>
                </Card>
            </div>

            <Modal isOpen={exp} onClose={() => setExp(false)} title="Ventas vs período anterior" maxWidth={780}>
                <LineChart data={SERIE_VENTAS.valores} labels={SERIE_VENTAS.labels} height={340} formatValue={money} />
            </Modal>
        </div>
    )
}

// ─── Hub ──────────────────────────────────────────────────────────────────────

export default function ReporteVentas() {
    const router = useRouter()
    const { vista } = router.query
    const [toast, setToast] = useState<string | null>(null)

    useEffect(() => {
        if (!toast) return
        const t = setTimeout(() => setToast(null), 3000)
        return () => clearTimeout(t)
    }, [toast])

    const ir = (v: VistaReporte) => {
        const { vista: _v, ...rest } = router.query
        const q: Record<string, string | string[]> = { ...rest }
        if (v !== 'ventas') q.vista = v
        router.push({ query: q })
    }

    const sub = vista as VistaReporte | undefined
    let content
    if (sub === 'productos')       content = <ReporteProductos ir={ir} />
    else if (sub === 'clientes')   content = <ReporteClientes ir={ir} />
    else if (sub === 'inventario') content = <ReporteInventario ir={ir} />
    else                           content = <VentasView ir={ir} onToast={setToast} />

    return (
        <>
            {content}
            {toast && (
                <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9000 }}>
                    <Toast variant="info" title={toast} onClose={() => setToast(null)} />
                </div>
            )}
        </>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
const iconBtn: React.CSSProperties = { width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }
