import { useState } from 'react'
import { Heart, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/router'
import { ProdImage } from './Thumb'
import { fmt, descuento } from '@/lib/storefront/utils'
import type { Producto } from '@/lib/storefront/types'

type Props = {
  producto:   Producto
  height?:    number
  rank?:      number   // #1, #2… overlay (Más vendidos)
  stockCount?: number  // si número exacto de stock disponible, muestra badge
  onAdd?:     () => void
}

function badgeColor(badge: string): { bg: string; color: string } {
  if (badge.startsWith('−') || badge.startsWith('-') || badge.includes('%'))
    return { bg: '#DC2626', color: '#fff' }
  if (badge.toLowerCase() === 'nuevo')
    return { bg: '#059669', color: '#fff' }
  return { bg: '#2563EB', color: '#fff' }
}

export function ProductCard({ producto, height = 240, rank, stockCount, onAdd }: Props) {
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
        border: `1px solid ${hov ? 'var(--color-border-strong)' : 'var(--color-border)'}`,
        borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
        boxShadow: hov ? '0 10px 28px rgba(15,23,42,0.10)' : '0 1px 3px rgba(15,23,42,0.06)',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
      }}
    >
      {/* ── Imagen ── */}
      <ProdImage hue={producto.hue} height={height} radius={0}>

        {/* Rank overlay */}
        {rank !== undefined && (
          <span style={{
            position: 'absolute', top: 10, left: 10, zIndex: 3,
            width: 24, height: 24, borderRadius: '50%',
            background: 'rgba(15,23,42,0.80)', backdropFilter: 'blur(4px)',
            color: '#fff', fontSize: 10, fontWeight: 700,
            display: 'grid', placeItems: 'center',
            fontFamily: '"Geist Mono", monospace',
          }}>
            {rank}
          </span>
        )}

        {/* Badge top-left (solo si no hay rank, o usamos posición diferente) */}
        {producto.badge && rank === undefined && (() => {
          const { bg, color } = badgeColor(producto.badge)
          return (
            <span style={{
              position: 'absolute', top: 10, left: 10, zIndex: 3,
              height: 23, padding: '0 9px', borderRadius: 999,
              background: bg, color,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
              display: 'inline-flex', alignItems: 'center',
              fontFamily: producto.badge.startsWith('−') ? '"Geist Mono", monospace' : 'inherit',
            }}>
              {producto.badge}
            </span>
          )
        })()}

        {/* Badge cuando hay rank (arriba a la derecha del rank) */}
        {producto.badge && rank !== undefined && (() => {
          const { bg, color } = badgeColor(producto.badge)
          return (
            <span style={{
              position: 'absolute', top: 10, left: 42, zIndex: 3,
              height: 23, padding: '0 9px', borderRadius: 999,
              background: bg, color,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
              display: 'inline-flex', alignItems: 'center',
              fontFamily: producto.badge.startsWith('−') ? '"Geist Mono", monospace' : 'inherit',
            }}>
              {producto.badge}
            </span>
          )
        })()}

        {/* Stock bajo — badge abajo izquierda */}
        {stockCount !== undefined && stockCount <= 5 && (
          <span style={{
            position: 'absolute', bottom: 10, left: 10, zIndex: 3,
            height: 22, padding: '0 8px', borderRadius: 999,
            background: stockCount <= 3 ? '#D97706' : '#059669',
            color: '#fff', fontSize: 10, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            {stockCount <= 3 ? `⚡ ${stockCount} disponibles` : `✓ En stock`}
          </span>
        )}

        {/* Favorito */}
        <button
          aria-label="Favorito"
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', top: 10, right: 10, zIndex: 3,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)',
            color: '#0F172A', border: 'none', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          }}
        >
          <Heart size={14} strokeWidth={1.6} />
        </button>
      </ProdImage>

      {/* ── Info ── */}
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: 'var(--color-text)',
          lineHeight: 1.35, minHeight: 36,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: 8,
        }}>
          {producto.nombre}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 10 }}>
          <span style={{
            fontSize: 16, fontWeight: 700, color: 'var(--color-text)',
            fontFamily: '"Geist Mono", monospace',
          }}>
            {fmt(producto.precio)}
          </span>
          {producto.precioAnt && (
            <span style={{
              fontSize: 12, color: 'var(--color-muted)',
              textDecoration: 'line-through',
              fontFamily: '"Geist Mono", monospace',
            }}>
              {fmt(producto.precioAnt)}
            </span>
          )}
          {desc > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#DC2626',
              fontFamily: '"Geist Mono", monospace', marginLeft: 'auto',
            }}>
              −{desc}%
            </span>
          )}
        </div>

        <button
          onClick={e => { e.stopPropagation(); onAdd?.() }}
          style={{
            width: '100%', height: 36, borderRadius: 8,
            background: 'var(--color-primary)', color: '#fff',
            border: 'none', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 6,
            transition: 'opacity 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          <ShoppingCart size={13} strokeWidth={2} /> Agregar
        </button>
      </div>
    </div>
  )
}
