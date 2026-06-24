import { useState } from 'react'
import { useRouter } from 'next/router'
import { ShoppingBag, Heart, Search, User } from 'lucide-react'
import type { TiendaConfig } from '@/lib/storefront/types'
import type { ItemCarrito } from '@/lib/storefront/types'

type Props = {
  tienda:   TiendaConfig
  carrito:  ItemCarrito[]
  logged?:  boolean
}

export function StorefrontHeader({ tienda, carrito, logged }: Props) {
  const router = useRouter()
  const { slug } = router.query as { slug: string }
  const base = `/tienda/${slug}`
  const cartCount = carrito.reduce((s, i) => s + i.qty, 0)

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      height: 60,
      background: 'var(--color-bg)',
      borderBottom: '1px solid var(--color-border)',
      padding: '0 32px', display: 'flex', alignItems: 'center', gap: 16,
    }}>
      {/* Logo + nombre */}
      <a href={base} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
          display: 'grid', placeItems: 'center',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
        </div>
        <span style={{ width: 1, height: 20, background: 'var(--color-border)', flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
            {tienda.nombre}
          </span>
          <span style={{ fontSize: 10, color: 'var(--color-subtle)', fontFamily: '"Geist Mono", monospace', lineHeight: 1 }}>
            {tienda.dominio}
          </span>
        </div>
      </a>

      {/* Buscador central */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => router.push(`${base}/catalogo`)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: 320, height: 38, padding: '0 14px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 999, color: 'var(--color-muted)',
            fontSize: 13, textAlign: 'left', cursor: 'pointer',
          }}
        >
          <Search size={15} strokeWidth={1.5} />
          <span>Buscar productos...</span>
        </button>
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{
          width: 36, height: 36, borderRadius: 8,
          display: 'grid', placeItems: 'center',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--color-text)',
        }}>
          <Heart size={18} strokeWidth={1.5} />
        </button>

        <button
          onClick={() => router.push(`${base}/carrito`)}
          style={{
            position: 'relative', width: 36, height: 36, borderRadius: 8,
            display: 'grid', placeItems: 'center',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--color-text)',
          }}
        >
          <ShoppingBag size={18} strokeWidth={1.5} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              minWidth: 16, height: 16, padding: '0 4px',
              background: 'var(--color-primary)', color: '#fff',
              borderRadius: 999, fontSize: 9, fontWeight: 700,
              display: 'grid', placeItems: 'center',
              fontFamily: '"Geist Mono", monospace',
            }}>
              {cartCount}
            </span>
          )}
        </button>

        <span style={{ width: 1, height: 24, background: 'var(--color-border)', margin: '0 4px' }} />

        {logged ? (
          <button
            onClick={() => router.push(`${base}/pedido`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0 4px', height: 36,
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >
            <span style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #F472B6, #FB923C)',
              color: '#fff', fontSize: 11, fontWeight: 700,
              display: 'grid', placeItems: 'center',
            }}>
              MF
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>María</span>
          </button>
        ) : (
          <button
            onClick={() => router.push(`${base}/login`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 36, padding: '0 14px',
              background: 'transparent', color: 'var(--color-body)',
              border: '1px solid var(--color-border)',
              borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            <User size={14} strokeWidth={1.5} />
            Ingresar
          </button>
        )}
      </div>
    </header>
  )
}
