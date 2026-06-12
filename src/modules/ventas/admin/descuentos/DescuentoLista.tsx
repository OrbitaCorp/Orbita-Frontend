// src/modules/ventas/admin/descuentos/DescuentoLista.tsx — Vista 31 + hub del módulo
//
// Punto de entrada del módulo `descuentos` (registrado en el componentMap admin).
// Hub con tabs: cupones (V31), nuevo cupón (V32), promos (V33), rendimiento (V34).
//
//   /admin/[negocioId]/ventas/descuentos              → cupones (V31)
//   …/descuentos?vista=nuevo                          → CuponNuevo (V32)
//   …/descuentos?vista=promos                         → PromoAutomaticas (V33)
//   …/descuentos?vista=rendimiento                    → RendimientoCupones (V34)

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Plus, Tag, Check, Banknote, Edit2 } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { Toast } from '@/design-system/components/Toast'
import { fmtMoney } from '@/lib/utils'

import { StatCard } from '../_shared/StatCard'
import { DescTabs, type VistaDescuento } from './components/DescTabs'
import CuponNuevo from './CuponNuevo'
import PromoAutomaticas from './PromoAutomaticas'
import RendimientoCupones from './RendimientoCupones'
import { CUPONES, type Cupon } from './mock/descuentos.mock'

const COLS = '130px 120px minmax(0,1fr) 100px 110px 70px'

// ─── Cupones (V31) ────────────────────────────────────────────────────────────

function CuponesView({ ir }: { ir: (v: VistaDescuento) => void }) {
    const [cups, setCups] = useState<Cupon[]>(CUPONES)

    return (
        <div style={pageWrap}>
            <DescTabs activo="cupones" ir={ir} />
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: 0 }}>Cupones de descuento</h1>
                <Button variant="primary" icon={<Plus size={16} />} onClick={() => ir('nuevo')}>Nuevo cupón</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                <StatCard label="Cupones activos" value="2" icon={Tag} accent="#3B82F6" />
                <StatCard label="Usos hoy" value="11" icon={Check} accent="#10B981" />
                <StatCard label="Ahorro generado" value={fmtMoney(284000)} icon={Banknote} accent="#8B5CF6" />
            </div>

            <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', gap: 10, padding: '0 16px', height: 44, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <span>Código</span><span>Valor</span><span>Usos</span><span>Vence</span><span>Activo</span><span />
                </div>
                {cups.map((c, i) => (
                    <div key={c.codigo} style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', gap: 10, padding: '0 16px', height: 56, borderBottom: i < cups.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{c.codigo}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px', borderRadius: 9999, background: 'var(--color-primary-bg)', color: 'var(--color-primary)', fontSize: 11, fontWeight: 600, width: 'fit-content' }}>{c.tipo === 'porcentaje' ? `${c.valor}%` : fmtMoney(c.valor)}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, maxWidth: 140, height: 6, background: 'var(--color-surface-alt)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.min(100, c.usos / c.limite * 100)}%`, background: 'var(--color-primary)', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{c.usos}/{c.limite}</span>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{c.vence.slice(5)}</span>
                        <button
                            onClick={() => setCups(cs => cs.map(x => x.codigo === c.codigo ? { ...x, activo: !x.activo } : x))}
                            style={{ width: 40, height: 22, borderRadius: 11, background: c.activo ? 'var(--color-success)' : 'var(--color-surface-alt)', border: c.activo ? 'none' : '1px solid var(--color-border)', position: 'relative', cursor: 'pointer' }}
                        >
                            <span style={{ position: 'absolute', top: c.activo ? 3 : 2, left: c.activo ? 21 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(15,23,42,0.15)', transition: 'left 200ms' }} />
                        </button>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <button style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Edit2 size={15} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Hub ──────────────────────────────────────────────────────────────────────

export default function DescuentoLista() {
    const router = useRouter()
    const { vista } = router.query
    const [toast, setToast] = useState<string | null>(null)

    useEffect(() => {
        if (!toast) return
        const t = setTimeout(() => setToast(null), 3000)
        return () => clearTimeout(t)
    }, [toast])

    const ir = (v: VistaDescuento) => {
        const { vista: _v, ...rest } = router.query
        const q: Record<string, string | string[] | undefined> = { ...rest }
        if (v !== 'cupones') q.vista = v
        router.push({ query: q })
    }

    const sub = vista as VistaDescuento | undefined
    let content
    if (sub === 'nuevo')            content = <CuponNuevo ir={ir} onToast={setToast} />
    else if (sub === 'promos')      content = <PromoAutomaticas ir={ir} />
    else if (sub === 'rendimiento') content = <RendimientoCupones ir={ir} />
    else                            content = <CuponesView ir={ir} />

    return (
        <>
            {content}
            {toast && (
                <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9000 }}>
                    <Toast variant="success" title={toast} onClose={() => setToast(null)} />
                </div>
            )}
        </>
    )
}

const pageWrap: React.CSSProperties = { padding: '24px 32px 64px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }
