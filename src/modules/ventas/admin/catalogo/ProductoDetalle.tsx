import { ChevronLeft, Edit2, GitBranch, TrendingUp, Eye, Package, ShoppingCart } from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { fmtMoney } from '@/lib/utils'
import { MOCK_PRODUCTOS, MOCK_CATEGORIAS } from './mock/catalogo.mock'
import type { EstadoProducto } from './types/catalogo.types'

type Props = { id: string; onVolver: () => void; onEditar: () => void; onVariantes: () => void }

const ESTADO_CONFIG: Record<EstadoProducto, { label: string; bg: string; fg: string }> = {
  activo:  { label: 'Activo',   bg: 'rgba(52,211,153,0.12)',  fg: '#34D399' },
  borrador:{ label: 'Borrador', bg: 'rgba(251,191,36,0.14)',  fg: '#FBBF24' },
  agotado: { label: 'Agotado',  bg: 'rgba(248,113,113,0.12)', fg: '#F87171' },
  pausado: { label: 'Pausado',  bg: 'rgba(167,139,250,0.14)', fg: '#A78BFA' },
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 16px' }}>{title}</h3>
      {children}
    </div>
  )
}

export default function ProductoDetalle({ id, onVolver, onEditar, onVariantes }: Props) {
  const p = MOCK_PRODUCTOS.find(x => x.id === id) ?? MOCK_PRODUCTOS[0]
  const estadoCfg = ESTADO_CONFIG[p.estado]
  const ingresos = p.precio * p.vendidos
  const conversion = p.vistas > 0 ? ((p.vendidos / p.vistas) * 100).toFixed(1) : '0'
  const stockPct = Math.min(100, Math.round((p.stock / Math.max(p.stockMinimo * 3, 1)) * 100))
  const catNames = p.categorias.map(cid => MOCK_CATEGORIAS.find(c => c.id === cid)?.nombre).filter(Boolean).join(', ')
  const maxPrecio = Math.max(...p.historialPrecios.map(h => h.precio))

  const kpis = [
    { label: 'Ingresos totales',  value: fmtMoney(ingresos),  icon: <TrendingUp size={18} />, color: '#34D399', sub: `${p.vendidos} unidades` },
    { label: 'Unidades vendidas', value: p.vendidos,           icon: <ShoppingCart size={18} />, color: '#60A5FA', sub: `${p.vistas} vistas totales` },
    { label: 'Stock actual',      value: p.stock,              icon: <Package size={18} />, color: p.stock === 0 ? '#EF4444' : p.stock <= p.stockMinimo ? '#F59E0B' : '#34D399', sub: `mínimo: ${p.stockMinimo}` },
    { label: 'Conversión',        value: `${conversion}%`,     icon: <Eye size={18} />, color: '#A78BFA', sub: 'vistas → ventas' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 40 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onVolver} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--color-muted)', borderRadius: 6, display: 'flex' }}>
          <ChevronLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>{p.nombre}</h1>
            <span style={{ padding: '2px 8px', borderRadius: 9999, background: estadoCfg.bg, color: estadoCfg.fg, fontSize: 11, fontWeight: 600 }}>{estadoCfg.label}</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: '2px 0 0' }}>SKU: {p.sku}</p>
        </div>
        {p.variantes.length > 0 && (
          <Button variant="outline" size="sm" icon={<GitBranch size={14} />} onClick={onVariantes}>{p.variantes.length} variantes</Button>
        )}
        <Button variant="primary" size="sm" icon={<Edit2 size={14} />} onClick={onEditar}>Editar</Button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {kpis.map(kpi => (
          <div key={kpi.label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--color-muted)', fontWeight: 500 }}>{kpi.label}</span>
              <span style={{ color: kpi.color }}>{kpi.icon}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: 'var(--color-subtle)' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 288px', gap: 16, alignItems: 'start' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="Historial de precios">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {p.historialPrecios.slice().reverse().map((hp, i, arr) => {
                const prev = arr[i + 1]
                const delta = prev ? hp.precio - prev.precio : 0
                const barW = Math.round((hp.precio / maxPrecio) * 100)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div style={{ width: 84, fontSize: 11, color: 'var(--color-muted)', flexShrink: 0 }}>
                      {new Date(hp.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ flex: 1, height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${barW}%`, background: i === 0 ? 'var(--color-primary)' : 'var(--color-muted)', borderRadius: 3 }} />
                    </div>
                    <div style={{ width: 88, textAlign: 'right', fontWeight: 600, fontSize: 13, color: i === 0 ? 'var(--color-text)' : 'var(--color-muted)' }}>
                      {fmtMoney(hp.precio)}
                    </div>
                    <div style={{ width: 72, textAlign: 'right', fontSize: 11, fontWeight: 600, color: delta > 0 ? '#F87171' : '#34D399', visibility: delta !== 0 ? 'visible' : 'hidden' }}>
                      {delta > 0 ? '▲' : '▼'} {fmtMoney(Math.abs(delta))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card title="Estado del stock">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-muted)', marginBottom: 8 }}>
              <span>Stock actual: <strong style={{ color: 'var(--color-text)' }}>{p.stock}</strong></span>
              <span>Mínimo: <strong style={{ color: 'var(--color-text)' }}>{p.stockMinimo}</strong></span>
            </div>
            <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', borderRadius: 4, width: `${stockPct}%`, background: p.stock === 0 ? '#EF4444' : p.stock <= p.stockMinimo ? '#F59E0B' : '#34D399' }} />
            </div>
            <p style={{ fontSize: 12, margin: 0, fontWeight: 600, color: p.stock === 0 ? '#EF4444' : p.stock <= p.stockMinimo ? '#F59E0B' : '#34D399' }}>
              {p.stock === 0 ? '⚠ Sin stock — producto inactivo para la venta'
               : p.stock <= p.stockMinimo ? `⚠ Stock bajo — quedan solo ${p.stock} unidades`
               : `Stock saludable — ${p.stock} unidades disponibles`}
            </p>
          </Card>

          <Card title="Descripción">
            <p style={{ fontSize: 13, color: 'var(--color-body)', lineHeight: 1.6, margin: 0 }}>{p.descripcion || 'Sin descripción cargada.'}</p>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="Info del producto">
            {[
              { label: 'Precio actual',  value: fmtMoney(p.precio) },
              { label: 'Precio tachado', value: p.precioTachado ? fmtMoney(p.precioTachado) : '—' },
              { label: 'Categorías',     value: catNames || '—' },
              { label: 'Creado',         value: new Date(p.creadoEn).toLocaleDateString('es-AR') },
              { label: 'Actualizado',    value: new Date(p.actualizadoEn).toLocaleDateString('es-AR') },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--color-border)', fontSize: 12 }}>
                <span style={{ color: 'var(--color-muted)' }}>{label}</span>
                <span style={{ color: 'var(--color-text)', fontWeight: 500, textAlign: 'right', maxWidth: '55%' }}>{value}</span>
              </div>
            ))}
          </Card>

          {p.variantes.length > 0 && (
            <Card title="Variantes">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {p.variantes.slice(0, 5).map(v => (
                  <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: 'var(--color-bg)', borderRadius: 7, fontSize: 12 }}>
                    <span style={{ color: 'var(--color-body)' }}>{Object.values(v.atributos).join(' / ')}</span>
                    <span style={{ fontWeight: 600, color: v.stock === 0 ? '#EF4444' : 'var(--color-text)' }}>×{v.stock}</span>
                  </div>
                ))}
                {p.variantes.length > 5 && (
                  <span style={{ fontSize: 11, color: 'var(--color-muted)', padding: '2px 8px' }}>+{p.variantes.length - 5} más</span>
                )}
              </div>
              <button onClick={onVariantes} style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', cursor: 'pointer', fontSize: 12, color: 'var(--color-body)', fontWeight: 600 }}>
                Gestionar variantes →
              </button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
