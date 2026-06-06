// src/modules/ventas/admin/reportes/ReporteClientes.tsx — Vista 13

import { Download, Users, TrendingUp, Banknote } from 'lucide-react'
import { Card } from '@/design-system/components/Card'
import { Button } from '@/design-system/components/Button'
import { Avatar } from '@/design-system/components/Avatar'
import { BarChart, DonutChart } from '@/design-system/components/Chart'
import { fmtMoney } from '@/lib/utils'
import { StatCard } from '../_shared/StatCard'
import { ReporteTabs, type VistaReporte } from './components/ReporteTabs'
import { SegmentoBadge } from '../clientes/components/SegmentoBadge'
import { MOCK_CLIENTES } from '../clientes/mock/clientes.mock'

export default function ReporteClientes({ ir }: { ir: (v: VistaReporte) => void }) {
    const top = [...MOCK_CLIENTES].sort((a, b) => b.gasto - a.gasto).slice(0, 5)

    return (
        <div style={pageWrap}>
            <ReporteTabs activo="clientes" ir={ir} />

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: 0 }}>Reporte de clientes</h1>
                <Button variant="outline" icon={<Download size={15} />}>Exportar</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
                <StatCard label="Clientes activos" value="48" icon={Users} accent="#3B82F6" />
                <StatCard label="Nuevos este mes" value="12" icon={Users} accent="#10B981" delta="+4" deltaPos />
                <StatCard label="Recurrentes" value="28%" icon={TrendingUp} accent="#8B5CF6" />
                <StatCard label="LTV prom" value={fmtMoney(62400)} icon={Banknote} accent="#F59E0B" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 16, marginBottom: 16 }}>
                <Card>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 14 }}>Nuevos clientes por semana</div>
                    <BarChart
                        color="#10B981"
                        data={[{ label: 'Sem 1', value: 8 }, { label: 'Sem 2', value: 12 }, { label: 'Sem 3', value: 6 }, { label: 'Sem 4', value: 14 }]}
                    />
                </Card>
                <Card>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 14 }}>Segmentación</div>
                    <DonutChart
                        size={140}
                        data={[
                            { label: 'VIP', value: 15, color: '#F59E0B' },
                            { label: 'Recurrente', value: 42, color: '#3B82F6' },
                            { label: 'Nuevo', value: 28, color: '#10B981' },
                            { label: 'Inactivo', value: 15, color: '#94A3B8' },
                        ]}
                    />
                </Card>
            </div>

            <Card padding="md" style={{ padding: 0 }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Top clientes por gasto</div>
                {top.map((c, i) => (
                    <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 80px 110px 120px', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: i < top.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{i + 1}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <Avatar name={c.nombre} size={28} />
                            <span style={{ fontSize: 13, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nombre}</span>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace', textAlign: 'right' }}>{c.pedidos} ped.</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace', textAlign: 'right' }}>{fmtMoney(c.gasto)}</span>
                        <span style={{ display: 'flex', justifyContent: 'flex-end' }}><SegmentoBadge segmento={c.segmento} size="sm" /></span>
                    </div>
                ))}
            </Card>
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
