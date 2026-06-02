import { useState } from 'react'
import { Heart, Plus, Star } from 'lucide-react'
import { useRouter } from 'next/router'
import { ProdImage } from './Thumb'
import { fmt, descuento } from '@/lib/storefront/utils'
import type { Producto } from '@/lib/storefront/types'

type Props = {
  producto: Producto
  height?:  number
  onAdd?:   () => void
}

export function ProductCard({ producto, height = 220, onAdd }: Props) {
  const router = useRouter()
  const { slug } = router.query as { slug: string }
  const [hov, setHov] = useState(false)
  const desc = producto.precioAnt ? descuento(producto.precio, producto.precioAnt) : 0

  return (
    <div
      onClick={() => router.push(`/tienda/${slug}/producto/${producto.id}`)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
        boxShadow: hov ? '0 12px 32px rgba(15,23,42,0.10)' : '0 1px 3px rgba(15,23,42,0.06)',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
      }}
    >
      <ProdImage hue={producto.hue} height={height} radius={0}>
        {producto.badge && (
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              height: 22, padding: '0 8px', borderRadius: 999,
              background: producto.badge === 'Oferta' ? 'var(--color-error-bg)' : 'var(--color-primary-bg)',
              color: producto.badge === 'Oferta' ? 'var(--color-error)' : 'var(--color-primary)',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              {producto.badge}
            </span>
          </div>
        )}
        <button
          aria-label="Favorito"
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)', color: '#0F172A',
            display: 'grid', placeItems: 'center',
            border: 'none', cursor: 'pointer',
          }}
        >
          <Heart size={15} strokeWidth={1.5} />
        </button>
      </ProdImage>

      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-subtle)', marginBottom: 4 }}>
          {producto.cat}
        </div>
        <div style={{
          fontSize: 14, fontWeight: 500, color: 'var(--color-text)', marginBottom: 8, minHeight: 40,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {producto.nombre}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>
              {fmt(producto.precio)}
            </span>
            {producto.precioAnt && (
              <span style={{ fontSize: 12, color: 'var(--color-subtle)', textDecoration: 'line-through', fontFamily: '"Geist Mono", monospace' }}>
                {fmt(producto.precioAnt)}
              </span>
            )}
          </div>
          {desc > 0 && (
            <span style={{ fontSize: 11, color: 'var(--color-success)', fontWeight: 700, fontFamily: '"Geist Mono", monospace' }}>
              -{desc}%
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          <Star size={11} fill="#F59E0B" color="#F59E0B" />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-body)', fontFamily: '"Geist Mono", monospace' }}>
            {producto.rating}
          </span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onAdd?.() }}
          style={{
            width: '100%', height: 36, borderRadius: 8,
            background: 'transparent', color: 'var(--color-body)',
            border: '1px solid var(--color-border)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-body)' }}
        >
          <Plus size={14} strokeWidth={2} /> Agregar
        </button>
      </div>
    </div>
  )
}
