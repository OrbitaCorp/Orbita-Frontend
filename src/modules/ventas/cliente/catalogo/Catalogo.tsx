import { useState } from 'react'
import { useRouter } from 'next/router'
import { Filter, Grid, List } from 'lucide-react'
import { StorefrontHeader } from '@/components/storefront/StorefrontHeader'
import { StorefrontFooter } from '@/components/storefront/StorefrontFooter'
import { AnnouncementBar } from '@/components/storefront/AnnouncementBar'
import { ProductCard } from '@/components/storefront/ProductCard'
import { Breadcrumb } from '@/components/storefront/Breadcrumb'
import { TIENDA, PRODUCTOS, CATEGORIAS, CARRITO_INICIAL } from '@/lib/storefront/mock'

const TALLES = ['XS','S','M','L','XL','XXL']

export default function Catalogo() {
  const router = useRouter()
  const { slug } = router.query as { slug: string }
  const base = `/tienda/${slug}`

  const [catActiva, setCatActiva] = useState('Todas')
  const [orden,     setOrden]     = useState('relevancia')
  const [soloStock, setSoloStock] = useState(true)
  const [viewMode,  setViewMode]  = useState<'grid' | 'list'>('grid')

  const filtrados = catActiva === 'Todas' ? PRODUCTOS : PRODUCTOS.filter(p => p.cat === catActiva)
  const ordenados = [...filtrados].sort((a, b) => {
    if (orden === 'precio-asc')  return a.precio - b.precio
    if (orden === 'precio-desc') return b.precio - a.precio
    return 0
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <StorefrontHeader tienda={TIENDA} carrito={CARRITO_INICIAL} />
      <AnnouncementBar />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px' }}>
        <Breadcrumb items={[{ label: 'Inicio', href: base }, { label: 'Catálogo' }]} />
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)', margin: 0 }}>Catálogo</h1>
            <div style={{ fontSize: 14, color: 'var(--color-muted)', marginTop: 4 }}>Toda nuestra selección actual</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {['Todas', ...CATEGORIAS.map(c => c.nombre)].map(cat => {
            const active = catActiva === cat
            return (
              <button key={cat} onClick={() => setCatActiva(cat)} style={{ height: 36, padding: '0 16px', borderRadius: 999, background: active ? 'var(--color-text)' : 'var(--color-bg)', color: active ? 'var(--color-bg)' : 'var(--color-body)', border: `1px solid ${active ? 'var(--color-text)' : 'var(--color-border)'}`, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 150ms' }}>
                {cat}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32, alignItems: 'flex-start' }}>
          <aside style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20, position: 'sticky', top: 76 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
              <Filter size={14} strokeWidth={1.5} /> Filtros
            </div>
            <FilterGroup title="Categoría">
              {CATEGORIAS.map(c => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-body)', padding: '4px 0', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: 'var(--color-primary)' }} />
                  {c.nombre}
                  <span style={{ color: 'var(--color-subtle)', marginLeft: 'auto', fontSize: 11, fontFamily: '"Geist Mono", monospace' }}>{c.count}</span>
                </label>
              ))}
            </FilterGroup>
            <FilterGroup title="Precio">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {['Desde', 'Hasta'].map(ph => (
                  <input
                    key={ph}
                    placeholder={ph}
                    type="number"
                    min={0}
                    style={{ width: '100%', boxSizing: 'border-box', height: 32, padding: '0 10px', borderRadius: 6, background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: 12, fontFamily: '"Geist Mono", monospace', outline: 'none', minWidth: 0 }}
                  />
                ))}
              </div>
            </FilterGroup>
            <FilterGroup title="Talle">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {TALLES.map((s, i) => <button key={s} style={{ width: 36, height: 32, borderRadius: 6, background: i === 2 ? 'var(--color-text)' : 'var(--color-bg)', color: i === 2 ? 'var(--color-bg)' : 'var(--color-text)', border: `1px solid ${i === 2 ? 'var(--color-text)' : 'var(--color-border)'}`, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>{s}</button>)}
              </div>
            </FilterGroup>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-body)', paddingTop: 16, borderTop: '1px solid var(--color-border)', marginTop: 16, cursor: 'pointer' }}>
              <input type="checkbox" checked={soloStock} onChange={e => setSoloStock(e.target.checked)} style={{ accentColor: 'var(--color-primary)' }} />
              Solo en stock
            </label>
          </aside>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 13, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>
                <strong style={{ color: 'var(--color-text)' }}>{ordenados.length}</strong> productos
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <select value={orden} onChange={e => setOrden(e.target.value)} style={{ height: 36, padding: '0 12px', borderRadius: 8, background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: 13, outline: 'none' }}>
                  <option value="relevancia">Más relevantes</option>
                  <option value="precio-asc">Precio: menor a mayor</option>
                  <option value="precio-desc">Precio: mayor a menor</option>
                </select>
                <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                  {([['grid', <Grid key="g" size={14} />], ['list', <List key="l" size={14} />]] as const).map(([mode, icon]) => (
                    <button key={mode} onClick={() => setViewMode(mode)} style={{ width: 36, height: 36, background: viewMode === mode ? 'var(--color-surface)' : 'transparent', color: 'var(--color-text)', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>{icon}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {ordenados.map(p => <ProductCard key={p.id} producto={p} />)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 40 }}>
              {['1','2','3','...','7'].map((n, i) => (
                <button key={i} style={{ minWidth: 36, height: 36, padding: '0 12px', borderRadius: 8, background: i === 0 ? 'var(--color-text)' : 'var(--color-bg)', color: i === 0 ? 'var(--color-bg)' : 'var(--color-body)', border: `1px solid ${i === 0 ? 'var(--color-text)' : 'var(--color-border)'}`, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>{n}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <StorefrontFooter tienda={TIENDA} slug={slug} />
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-subtle)', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  )
}
