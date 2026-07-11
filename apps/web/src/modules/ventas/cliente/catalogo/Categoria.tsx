import { useState } from 'react'
import { useRouter } from 'next/router'
import { StorefrontHeader } from '@/components/storefront/StorefrontHeader'
import { StorefrontFooter } from '@/components/storefront/StorefrontFooter'
import { AnnouncementBar } from '@/components/storefront/AnnouncementBar'
import { ProductCard } from '@/components/storefront/ProductCard'
import { Breadcrumb } from '@/components/storefront/Breadcrumb'
import { TIENDA, PRODUCTOS, CATEGORIAS, CARRITO_INICIAL } from '@/lib/storefront/mock'

export default function Categoria() {
  const router = useRouter()
  const { slug, categoria } = router.query as { slug: string; categoria: string }
  const base = `/tienda/${slug}`

  const cat      = CATEGORIAS.find(c => c.id === categoria) ?? CATEGORIAS[3]
  const productos = PRODUCTOS.filter(p => p.cat.toLowerCase() === cat.nombre.toLowerCase())
  const [sub, setSub] = useState('Todas')
  const SUBS = ['Todas', 'Bomber', 'Cortaviento', 'Cuero', 'Acolchadas', 'Técnicas']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <StorefrontHeader tienda={TIENDA} carrito={CARRITO_INICIAL} />
      <AnnouncementBar />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px' }}>
        <Breadcrumb items={[{ label: 'Inicio', href: base }, { label: 'Catálogo', href: `${base}/catalogo` }, { label: cat.nombre }]} />

        <div style={{ background: `oklch(0.94 0.04 ${cat.hue})`, borderRadius: 18, padding: 36, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A', margin: '0 0 8px' }}>{cat.nombre}</h1>
            <p style={{ fontSize: 15, color: '#334155', maxWidth: 380, marginBottom: 20 }}>Explorá toda nuestra selección de {cat.nombre.toLowerCase()}.</p>
            <div style={{ display: 'flex', gap: 20 }}>
              {[[cat.count, 'modelos']].map(([v, l]) => (
                <div key={String(l)}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', fontFamily: '"Geist Mono", monospace' }}>{v}</div>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 200, background: `oklch(0.84 0.06 ${cat.hue})`, borderRadius: 14 }} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap', borderBottom: '1px solid var(--color-border)', paddingBottom: 16 }}>
          {SUBS.map(s => (
            <button key={s} onClick={() => setSub(s)} style={{ padding: '8px 14px', borderRadius: 999, background: sub === s ? 'var(--color-primary-bg)' : 'transparent', color: sub === s ? 'var(--color-primary)' : 'var(--color-muted)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: sub === s ? 600 : 500 }}>{s}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
          {(productos.length > 0 ? productos : PRODUCTOS.slice(0, 4)).map(p => <ProductCard key={p.id} producto={p} />)}
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-subtle)', marginBottom: 16 }}>Otras categorías</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {CATEGORIAS.filter(c => c.id !== cat.id).map(c => (
            <a key={c.id} href={`${base}/catalogo/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 20, borderRadius: 12, background: 'var(--color-bg)', border: '1px solid var(--color-border)', textDecoration: 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `oklch(0.94 0.04 ${c.hue})`, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{c.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{c.count} productos</div>
              </div>
            </a>
          ))}
        </div>
      </div>
      <StorefrontFooter tienda={TIENDA} slug={slug} />
    </div>
  )
}
