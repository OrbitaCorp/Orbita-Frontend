// src/modules/ventas/admin/reportes/Dashboard.tsx

// ─── react ────────────────────────────────────────────────────────────────────
import { useState, useEffect }                                        from 'react'
import { useRouter }                                                  from 'next/router'

// ─── design system ────────────────────────────────────────────────────────────
import { Badge }                                                      from '@/design-system/components/Badge'
import { Skeleton }                                                   from '@/design-system/components/Skeleton'
import { Button }                                                     from '@/design-system/components/Button'
import { Table, type Column }                                         from '@/design-system/components/Table'
import { Avatar }                                                     from '@/design-system/components/Avatar'
import { KpiCard }                                                    from '@/design-system/components/KpiCard'
import { CardSection }                                                from '@/design-system/components/CardSection'
import { PeriodoSelector, PERIODOS, type Periodo, type CustomRange }  from '@/design-system/components/PeriodoSelector'
import { EmptyState }                                                 from '@/design-system/components/EmptyState'

// ─── módulo ───────────────────────────────────────────────────────────────────
import { AlertasGrid }              from './components/AlertasGrid'
import { TopProductos }             from './components/TopProductos'
import { PedidosPendientesBanner }  from './components/PedidosPendientesBanner'
import type { DashboardData }       from './mock/dashboard.mock'
import { MOCK }                     from './mock/dashboard.mock'

// ─── globales ─────────────────────────────────────────────────────────────────
import { fmtMoney, saludoHora, fechaLarga }                     from '@/lib/utils'
import { Banknote, ShoppingBag, Package, Users, ChevronRight }  from 'lucide-react'

// ─── tipos locales ────────────────────────────────────────────────────────────
type PedidoReciente = DashboardData['actividadReciente'][number]

// ─── Dashboard ────────────────────────────────────────────────────────────────
// Pantalla principal del panel de gestión — pulso del negocio en tiempo real.
//
// Secciones:
//   1. Header: saludo + fecha + selector de período
//   2. KPIs: ventas, pedidos, productos vendidos, clientes nuevos
//   3. Alertas activas full-width
//   4. Actividad reciente + Top productos
//   5. Banner pedidos pendientes

export default function Dashboard() {
    const router                        = useRouter()
    const { negocioId }                 = router.query
    const [periodo, setPeriodo]         = useState<Periodo>('semana')
    const [customRange, setCustomRange] = useState<CustomRange | null>(null)

    // ── Mock activo — eliminar cuando el backend esté listo ───────────────────
    // Reemplazar por:
    // const { data, loading } = useFetch<DashboardData>(
    //     negocioId
    //         ? periodo === 'custom' && customRange
    //             ? `/ventas/${negocioId}/dashboard?dateFrom=${customRange.from.toISOString()}&dateTo=${customRange.to.toISOString()}`
    //             : `/ventas/${negocioId}/dashboard?periodo=${periodo}`
    //         : null
    // )
    const [loading, setLoading] = useState(true)
    const data: DashboardData   = MOCK[periodo]

    useEffect(() => {
        setLoading(true)
        const t = setTimeout(() => setLoading(false), 350)
        return () => clearTimeout(t)
    }, [periodo])
    // ─────────────────────────────────────────────────────────────────────────

    const dangerCount = data.alertas.filter(a => a.nivel === 'danger').length

    // Columnas de la tabla de actividad reciente
    // Usa Table<T> del design system con Column<T> tipado
    const columnas: Column<PedidoReciente>[] = [
        {
            key:    'id',
            header: '# Pedido',
            width:  '130px',
            render: row => (
                <span style={{
                    fontSize:   13,
                    fontWeight: 600,
                    color:      'var(--color-primary)',
                    fontFamily: 'Geist Mono, monospace',
                }}>
                    #{row.id}
                </span>
            ),
        },
        {
            key:    'cliente',
            header: 'Cliente',
            render: row => (
                // Avatar del design system + nombre del cliente
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <Avatar name={row.cliente} size={24} />
                    <span style={{ fontSize:13, color:'var(--color-text)' }}>
                        {row.cliente}
                    </span>
                </div>
            ),
        },
        {
            key:    'monto',
            header: 'Monto',
            align:  'right',
            width:  '110px',
            render: row => (
                <span style={{
                    fontSize:   13,
                    fontWeight: 600,
                    color:      'var(--color-text)',
                    fontFamily: 'Geist Mono, monospace',
                }}>
                    {fmtMoney(row.monto)}
                </span>
            ),
        },
        {
            key:    'estado',
            header: 'Estado',
            width:  '130px',
            // Badge del design system — status ya tipado como BadgeStatus
            render: row => <Badge status={row.estado} size="sm" />,
        },
        {
            key:    'hora',
            header: 'Hora',
            width:  '60px',
            render: row => (
                <span style={{
                    fontSize:   12,
                    color:      'var(--color-muted)',
                    fontFamily: 'Geist Mono, monospace',
                }}>
                    {row.hora}
                </span>
            ),
        },
    ]

    return (
        <div style={{
            padding:   '24px 32px 64px',
            maxWidth:  1280,
            width:     '100%',
            margin:    '0 auto',
            boxSizing: 'border-box',
        }}>

            {/* ── 1. Header ── */}
            <div style={{
                display:        'flex',
                alignItems:     'flex-end',
                justifyContent: 'space-between',
                gap:            16,
                flexWrap:       'wrap',
                marginBottom:   24,
            }}>
                <div>
                    <h1 style={{
                        fontSize:      30,
                        fontWeight:    700,
                        letterSpacing: '-0.02em',
                        margin:        0,
                        color:         'var(--color-text)',
                    }}>
                        {saludoHora()},{' '}
                        <span style={{ color:'var(--color-primary)' }}>
                            Alexander
                            {/* TODO: reemplazar con useAuth().user.name */}
                        </span>
                    </h1>
                    <div style={{
                        fontSize:      14,
                        color:         'var(--color-muted)',
                        marginTop:     4,
                        textTransform: 'capitalize',
                    }}>
                        {fechaLarga()}
                    </div>
                </div>

                {/* PeriodoSelector del design system
                    customRange: rango elegido por el usuario en el popover
                    onCustomRange: guarda el rango y activa el período 'custom' */}
                <PeriodoSelector
                    value={periodo}
                    onChange={setPeriodo}
                    customRange={customRange}
                    onCustomRange={r => {
                        setCustomRange(r)
                        setPeriodo('custom')
                        // TODO: cuando llegue el backend, el useFetch va a recibir:
                        // dateFrom=r.from.toISOString()
                        // dateTo=r.to.toISOString()
                    }}
                />
            </div>

            {/* ── 2. KPIs ── */}
            <div style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap:                 16,
                marginBottom:        24,
            }}>
                {/* KpiCard del design system — contador animado incluido */}
                <KpiCard
                    label="Ventas totales"
                    value={data.kpis.ventas.actual}
                    delta={data.kpis.ventas.delta}
                    prefix="$"
                    accent="#3B82F6"
                    icon={Banknote}
                    loading={loading}
                />
                <KpiCard
                    label="Pedidos"
                    value={data.kpis.pedidos.actual}
                    delta={data.kpis.pedidos.delta}
                    accent="#10B981"
                    icon={ShoppingBag}
                    loading={loading}
                    // footnote: pendientes en ámbar para llamar la atención
                    footnote={
                        <span style={{
                            color:      '#B45309',
                            fontSize:   11,
                            fontWeight: 600,
                            display:    'inline-flex',
                            alignItems: 'center',
                            gap:        4,
                        }}>
                            <span style={{
                                width:        6,
                                height:       6,
                                borderRadius: '50%',
                                background:   '#F59E0B',
                            }} />
                            {data.kpis.pedidos.pendientes} pendientes de atención
                        </span>
                    }
                />
                <KpiCard
                    label="Productos vendidos"
                    value={data.kpis.productos.actual}
                    delta={data.kpis.productos.delta}
                    accent="#8B5CF6"
                    icon={Package}
                    loading={loading}
                    footnote={
                        <span style={{ fontSize:11, color:'var(--color-muted)' }}>
                            unidades despachadas
                        </span>
                    }
                />
                <KpiCard
                    label="Clientes nuevos"
                    value={data.kpis.clientes.actual}
                    delta={data.kpis.clientes.delta}
                    accent="#F59E0B"
                    icon={Users}
                    loading={loading}
                />
            </div>

            {/* ── 3. Alertas full-width ── */}
            <div style={{ marginBottom:16 }}>
                <CardSection
                    title="Alertas activas"
                    subtitle={`${data.alertas.length} requieren atención`}
                    badge={dangerCount}
                    action={
                        <Button
                            variant="ghost"
                            size="sm"
                            style={{
                                color:      'var(--color-primary)',
                                display:    'inline-flex',
                                alignItems: 'center',
                                gap:        4,
                            }}
                        >
                            Ver todas <ChevronRight size={12} strokeWidth={2} />
                        </Button>
                    }
                >
                    {loading
                        ? <Skeleton height={120} />
                        // AlertasGrid del módulo — en components/AlertasGrid.tsx
                        : <AlertasGrid alertas={data.alertas} />
                    }
                </CardSection>
            </div>

            {/* ── 4. Actividad reciente + Top productos ── */}
            <div style={{
                display:             'grid',
                gridTemplateColumns: 'minmax(0, 65fr) minmax(0, 35fr)',
                gap:                 16,
            }}>
                <CardSection
                    title="Actividad reciente"
                    subtitle="Últimos pedidos registrados"
                    action={
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/${negocioId}/ventas/pedidos`)}
                            style={{
                                color:      'var(--color-primary)',
                                display:    'inline-flex',
                                alignItems: 'center',
                                gap:        4,
                            }}
                        >
                            Ver todos <ChevronRight size={12} strokeWidth={2} />
                        </Button>
                    }
                >
                    {loading
                        ? <Skeleton height={260} />
                        // Table del design system — genérica y tipada con Column<T>
                        : <Table<PedidoReciente>
                            columns={columnas}
                            data={data.actividadReciente}
                            keyField="id"
                            onRowClick={row => router.push(
                                `/admin/${negocioId}/ventas/pedidos/${row.id}`
                            )}
                            emptyState={
                                // EmptyState del design system
                                <EmptyState
                                    icon={ShoppingBag}
                                    title="Sin actividad reciente"
                                    description="Los pedidos aparecerán acá cuando empiecen a llegar"
                                />
                            }
                          />
                    }
                </CardSection>

                <CardSection
                    title="Top productos"
                    subtitle="Más vendidos en el período"
                >
                    {loading
                        ? <Skeleton height={260} />
                        // TopProductos del módulo — en components/TopProductos.tsx
                        : <TopProductos productos={data.topProductos} />
                    }
                </CardSection>
            </div>

            {/* ── 5. Banner pedidos pendientes ── */}
            {/* PedidosPendientesBanner del módulo — en components/PedidosPendientesBanner.tsx */}
            <PedidosPendientesBanner
                count={data.kpis.pedidos.pendientes}
                loading={loading}
                negocioId={negocioId as string}
            />

        </div>
    )
}