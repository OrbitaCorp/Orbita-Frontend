// src/modules/ventas/panel/descuentos/RendimientoCupones.tsx — Vista 34

import { Tag, Check, TrendingUp, Banknote } from 'lucide-react'
import { Card } from '@/design-system/components/Card'
import { BarChart } from '@/design-system/components/Chart'
import { fmtMoney } from '@/lib/utils'
import { StatCard } from '../_shared/StatCard'
import { DescTabs, type VistaDescuento } from './components/DescTabs'
import { CUPONES } from './mock/descuentos.mock'

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const USOS_DIA = [12, 8, 18, 9, 21, 18, 13]
const COLS = '130px 90px 130px 130px 100px'

export default function RendimientoCupones({ ir }: { ir: (v: VistaDescuento) => void }) {
    return (
        <div style={pageWrap}>
            <DescTabs activo="rendimiento" ir={ir} />
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 20px' }}>Rendimiento de descuentos</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
                <StatCard label="Total descontado" value={fmtMoney(284000)} icon={Tag} accent="#8B5CF6" />
                <StatCard label="Usos totales" value="99" icon={Check} accent="#3B82F6" />
                <StatCard label="Conversión c/cupón" value="74%" icon={TrendingUp} accent="#10B981" />
                <StatCard label="Revenue c/cupón" value={fmtMoney(1840000)} icon={Banknote} accent="#F59E0B" />
            </div>

            <Card style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 14 }}>Usos por día</div>
                <BarChart color="#8B5CF6" data={DIAS.map((l, i) => ({ label: l, value: USOS_DIA[i] }))} />
            </Card>

            <Card padding="md" style={{ padding: 0 }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Por cupón</div>
                <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '8px 20px', fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)' }}>
                    <span>Código</span><span style={{ textAlign: 'right' }}>Usos</span><span style={{ textAlign: 'right' }}>Descontado</span><span style={{ textAlign: 'right' }}>Revenue</span><span style={{ textAlign: 'right' }}>Conv.</span>
                </div>
                {CUPONES.map((c, i) => (
                    <div key={c.codigo} style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', padding: '12px 20px', borderBottom: i < CUPONES.length - 1 ? '1px solid var(--color-border)' : 'none', fontSize: 13 }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{c.codigo}</span>
                        <span style={{ textAlign: 'right', color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{c.usos}</span>
                        <span style={{ textAlign: 'right', color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(c.usos * 4200)}</span>
                        <span style={{ textAlign: 'right', color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmtMoney(c.usos * 28000)}</span>
                        <span style={{ textAlign: 'right', color: 'var(--color-success)', fontFamily: '"Geist Mono", monospace' }}>{60 + i * 7}%</span>
                    </div>
                ))}
            </Card>
        </div>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
