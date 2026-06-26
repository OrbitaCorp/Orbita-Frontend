import { useState } from 'react'
import { useRouter } from 'next/router'
import { ShoppingBag, Heart, Search, User, Menu, X } from 'lucide-react'
import type { TiendaConfig, ItemCarrito } from '@/lib/storefront/types'

type Props = {
  tienda:  TiendaConfig
  carrito: ItemCarrito[]
  logged?: boolean
}

const NAV_SECTIONS = [
  { label: 'Catálogo',     path: '/catalogo', hot: false },
  { label: 'Ofertas',      path: '/catalogo', hot: true  },
  { label: 'Novedades',    path: '/catalogo', hot: false },
  { label: 'Más vendidos', path: '/catalogo', hot: false },
]

const NAV_CATS = [
  { label: 'Remeras',    id: 'remeras'    },
  { label: 'Pantalones', id: 'pantalones' },
  { label: 'Buzos',      id: 'buzos'      },
  { label: 'Camperas',   id: 'camperas'   },
  { label: 'Jeans',      id: 'jeans'      },
  { label: 'Calzado',    id: 'calzado'    },
  { label: 'Accesorios', id: 'accesorios' },
  { label: 'Deportivo',  id: 'deportivo'  },
]

export function StorefrontHeader({ tienda, carrito, logged }: Props) {
  const router = useRouter()
  const { slug } = router.query as { slug: string }
  const base = `/tienda/${slug}`
  const cartCount = carrito.reduce((s, i) => s + i.qty, 0)
  const [menuOpen, setMenuOpen] = useState(false)
  const currentPath = router.asPath.replace(base, '') || '/'

  function isActive(path: string) {
    if (path === '/catalogo') return currentPath.startsWith('/catalogo')
    return currentPath === path
  }

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--color-bg)' }}>
      <style>{`
        .sf-nav-link {
          display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0;
          padding: 0 13px; height: 40px;
          text-decoration: none; font-size: 13px; font-weight: 500;
          color: var(--color-body); white-space: nowrap;
          border-bottom: 2px solid transparent;
          transition: color 150ms, border-color 150ms;
        }
        .sf-nav-link:hover { color: var(--color-text); border-bottom-color: var(--color-border-strong); }
        .sf-nav-link.active { color: var(--color-primary); font-weight: 600; border-bottom-color: var(--color-primary); }
        .sf-nav-link.hot { color: #EF4444; font-weight: 600; }
        .sf-nav-link.hot:hover { color: #DC2626; border-bottom-color: #EF4444; }
        .sf-nav-link.hot.active { border-bottom-color: #EF4444; }
        .sf-nav-cat { font-size: 13px; color: var(--color-muted); font-weight: 400; }
        .sf-nav-cat:hover { color: var(--color-text); border-bottom-color: var(--color-border-strong); }
        .sf-nav-scroll { overflow-x: auto; scrollbar-width: none; }
        .sf-nav-scroll::-webkit-scrollbar { display: none; }
        .sf-hdr-action { width: 36px; height: 36px; border-radius: 8px; display: grid; place-items: center; background: transparent; border: none; cursor: pointer; color: var(--color-body); transition: background 120ms, color 120ms; }
        .sf-hdr-action:hover { background: var(--color-surface); color: var(--color-text); }

        /* Mobile nav drawer */
        .sf-mobile-nav { display: none; }
        @media (max-width: 768px) {
          .sf-nav-bar { display: none !important; }
          .sf-search-full { display: none; }
          .sf-mobile-menu-btn { display: grid !important; }
          .sf-mobile-nav { display: flex; flex-direction: column; position: fixed; inset: 0; top: 60px; background: var(--color-bg); z-index: 100; padding: 20px 20px 40px; gap: 0; overflow-y: auto; border-top: 1px solid var(--color-border); }
          .sf-mobile-nav a { display: flex; align-items: center; gap: 10px; padding: 13px 0; font-size: 15px; font-weight: 500; color: var(--color-text); text-decoration: none; border-bottom: 1px solid var(--color-border); }
          .sf-mobile-nav a:last-child { border-bottom: none; }
          .sf-mobile-nav .sf-mobile-section-title { font-size: 11px; font-weight: 700; color: var(--color-subtle); text-transform: uppercase; letter-spacing: 0.07em; padding: 18px 0 6px; }
          .sf-logo-name { display: none; }
        }
      `}</style>

      {/* ── Row 1: topbar ── */}
      <div style={{
        height: 60, padding: '0 24px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid var(--color-border)',
      }}>
        {/* Logo */}
        <a href={base} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 2px 8px rgba(37,99,235,0.30)',
          }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#fff' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {tienda.nombre}
            </span>
            <span className="sf-logo-name" style={{ fontSize: 10, color: 'var(--color-subtle)', fontFamily: '"Geist Mono", monospace', lineHeight: 1, marginTop: 1 }}>
              {tienda.dominio}
            </span>
          </div>
        </a>

        {/* Buscador central */}
        <div className="sf-search-full" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => router.push(`${base}/catalogo`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', maxWidth: 480, height: 38, padding: '0 16px',
              background: 'var(--color-surface)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 999, color: 'var(--color-muted)',
              fontSize: 13, textAlign: 'left', cursor: 'pointer',
              transition: 'border-color 150ms',
            }}
            onFocus={e  => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
            onBlur={e   => { e.currentTarget.style.borderColor = 'var(--color-border)'  }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
          >
            <Search size={15} strokeWidth={1.5} color="var(--color-subtle)" />
            <span>Buscar productos...</span>
          </button>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto' }}>
          {/* Buscar (solo mobile) */}
          <button className="sf-hdr-action" style={{ display: 'none' }} onClick={() => router.push(`${base}/catalogo`)}>
            <Search size={18} strokeWidth={1.5} />
          </button>

          <button className="sf-hdr-action">
            <Heart size={18} strokeWidth={1.5} />
          </button>

          <button className="sf-hdr-action" onClick={() => router.push(`${base}/carrito`)} style={{ position: 'relative' }}>
            <ShoppingBag size={18} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: 3, right: 3,
                minWidth: 16, height: 16, padding: '0 4px',
                background: '#2563EB', color: '#fff',
                borderRadius: 999, fontSize: 9, fontWeight: 700,
                display: 'grid', placeItems: 'center',
                fontFamily: '"Geist Mono", monospace',
                lineHeight: 1,
              }}>
                {cartCount}
              </span>
            )}
          </button>

          <div style={{ width: 1, height: 22, background: 'var(--color-border)', margin: '0 6px', flexShrink: 0 }} />

          {logged ? (
            <button onClick={() => router.push(`${base}/pedido`)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px', height: 36, background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #F472B6, #FB923C)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center' }}>MF</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>María</span>
            </button>
          ) : (
            <button onClick={() => router.push(`${base}/login`)} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 150ms' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1D4ED8' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary)' }}
            >
              <User size={14} strokeWidth={1.5} />
              Ingresar
            </button>
          )}

          {/* Hamburger (mobile) */}
          <button
            className="sf-hdr-action sf-mobile-menu-btn"
            style={{ display: 'none', marginLeft: 4 }}
            onClick={() => setMenuOpen(o => !o)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Row 2: nav bar ── */}
      <nav className="sf-nav-bar sf-nav-scroll" style={{
        height: 40, display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: 0,
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
      }}>
        {/* Secciones */}
        {NAV_SECTIONS.map(s => (
          <a
            key={s.label}
            href={`${base}${s.path}`}
            className={`sf-nav-link${s.hot ? ' hot' : ''}${isActive(s.path) ? ' active' : ''}`}
          >
            {s.hot && (
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
            )}
            {s.label}
          </a>
        ))}

        {/* Separador */}
        <span style={{ width: 1, height: 16, background: 'var(--color-border)', margin: '0 4px', flexShrink: 0 }} />

        {/* Categorías */}
        {NAV_CATS.map(c => (
          <a
            key={c.id}
            href={`${base}/catalogo/${c.id}`}
            className={`sf-nav-link sf-nav-cat${isActive(`/catalogo/${c.id}`) ? ' active' : ''}`}
          >
            {c.label}
          </a>
        ))}
      </nav>

      {/* ── Mobile nav drawer ── */}
      {menuOpen && (
        <nav className="sf-mobile-nav">
          <span className="sf-mobile-section-title">Secciones</span>
          {NAV_SECTIONS.map(s => (
            <a key={s.label} href={`${base}${s.path}`} onClick={() => setMenuOpen(false)}
              style={{ color: s.hot ? '#EF4444' : undefined, fontWeight: s.hot ? 600 : undefined }}>
              {s.hot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444' }} />}
              {s.label}
            </a>
          ))}
          <span className="sf-mobile-section-title">Categorías</span>
          {NAV_CATS.map(c => (
            <a key={c.id} href={`${base}/catalogo/${c.id}`} onClick={() => setMenuOpen(false)}>
              {c.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
