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
    return currentPath.startsWith(path)
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'var(--color-bg)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <style>{`
        /* Nav links */
        .sf-nav-link {
          display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0;
          padding: 0 12px; height: 64px;
          text-decoration: none; font-size: 13px; font-weight: 500;
          color: var(--color-body); white-space: nowrap;
          border-bottom: 2px solid transparent;
          transition: color 150ms, border-color 150ms;
          position: relative;
        }
        .sf-nav-link:hover { color: var(--color-text); }
        .sf-nav-link:hover::after {
          content: ''; position: absolute; bottom: 0; left: 12px; right: 12px;
          height: 2px; background: var(--color-border-strong); border-radius: 2px 2px 0 0;
        }
        .sf-nav-link.active { color: var(--color-primary); font-weight: 600; }
        .sf-nav-link.active::after {
          content: ''; position: absolute; bottom: 0; left: 12px; right: 12px;
          height: 2px; background: var(--color-primary); border-radius: 2px 2px 0 0;
        }
        .sf-nav-link.hot { color: #EF4444; font-weight: 600; }
        .sf-nav-link.hot:hover { color: #DC2626; }
        .sf-nav-link.hot:hover::after, .sf-nav-link.hot.active::after { background: #EF4444; }
        .sf-nav-cat { color: var(--color-muted); font-weight: 400; }
        .sf-nav-cat:hover { color: var(--color-body); }

        /* Action icon buttons */
        .sf-hdr-btn {
          width: 36px; height: 36px; border-radius: 8px;
          display: grid; place-items: center; position: relative;
          background: transparent; border: none; cursor: pointer;
          color: var(--color-body); transition: background 120ms, color 120ms;
        }
        .sf-hdr-btn:hover { background: var(--color-surface); color: var(--color-text); }

        /* Nav scroll area */
        .sf-nav-scroll { overflow-x: auto; scrollbar-width: none; display: flex; align-items: center; }
        .sf-nav-scroll::-webkit-scrollbar { display: none; }

        /* Right fade on nav scroll */
        .sf-nav-wrap { position: relative; flex: 1; min-width: 0; }
        .sf-nav-wrap::after {
          content: ''; position: absolute; right: 0; top: 0; bottom: 0;
          width: 40px; pointer-events: none;
          background: linear-gradient(to right, transparent, var(--color-bg));
        }

        /* Mobile */
        .sf-hdr-mobile-only { display: none !important; }
        .sf-hdr-desktop-only { display: flex; }
        @media (max-width: 768px) {
          .sf-hdr-mobile-only  { display: grid !important; }
          .sf-hdr-desktop-only { display: none !important; }
          .sf-nav-wrap         { display: none !important; }
          .sf-nav-div          { display: none !important; }
        }

        /* Mobile drawer */
        .sf-drawer {
          position: fixed; inset: 0; top: 65px; background: var(--color-bg);
          z-index: 100; overflow-y: auto;
          border-top: 1px solid var(--color-border);
          animation: sfDrawerIn 200ms ease;
        }
        @keyframes sfDrawerIn { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }
        .sf-drawer-link {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 20px; font-size: 15px; font-weight: 500;
          color: var(--color-text); text-decoration: none;
          border-bottom: 1px solid var(--color-border);
          transition: background 100ms;
        }
        .sf-drawer-link:hover { background: var(--color-surface); }
        .sf-drawer-section {
          padding: 16px 20px 6px;
          font-size: 11px; font-weight: 700; color: var(--color-subtle);
          text-transform: uppercase; letter-spacing: 0.07em;
        }
      `}</style>

      {/* ── Single unified row ── */}
      <div style={{
        height: 64,
        padding: '0 20px',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {/* Logo */}
        <a href={base} style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0, marginRight: 4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 2px 8px rgba(37,99,235,0.28)',
            flexShrink: 0,
          }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              {tienda.nombre}
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-subtle)', fontFamily: '"Geist Mono", monospace', lineHeight: 1 }}>
              {tienda.dominio}
            </div>
          </div>
        </a>

        {/* Nav links — desktop */}
        <div className="sf-nav-wrap">
          <div className="sf-nav-scroll">
            {/* Thin divider */}
            <span className="sf-nav-div" style={{ width: 1, height: 18, background: 'var(--color-border)', margin: '0 8px 0 4px', flexShrink: 0 }} />

            {NAV_SECTIONS.map(s => (
              <a
                key={s.label}
                href={`${base}${s.path}`}
                className={['sf-nav-link', s.hot ? 'hot' : '', isActive(s.path) ? 'active' : ''].filter(Boolean).join(' ')}
              >
                {s.hot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />}
                {s.label}
              </a>
            ))}

            <span style={{ width: 1, height: 16, background: 'var(--color-border)', margin: '0 2px', flexShrink: 0 }} />

            {NAV_CATS.map(c => (
              <a
                key={c.id}
                href={`${base}/catalogo/${c.id}`}
                className={['sf-nav-link sf-nav-cat', isActive(`/catalogo/${c.id}`) ? 'active' : ''].filter(Boolean).join(' ')}
              >
                {c.label}
              </a>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto', flexShrink: 0 }}>
          <button className="sf-hdr-btn" onClick={() => router.push(`${base}/catalogo`)} aria-label="Buscar">
            <Search size={18} strokeWidth={1.5} />
          </button>

          <button className="sf-hdr-btn" aria-label="Favoritos">
            <Heart size={18} strokeWidth={1.5} />
          </button>

          <button className="sf-hdr-btn" onClick={() => router.push(`${base}/carrito`)} aria-label="Carrito">
            <ShoppingBag size={18} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                minWidth: 15, height: 15, padding: '0 3px',
                background: '#2563EB', color: '#fff',
                borderRadius: 999, fontSize: 9, fontWeight: 700,
                display: 'grid', placeItems: 'center',
                fontFamily: '"Geist Mono", monospace', lineHeight: 1,
              }}>
                {cartCount}
              </span>
            )}
          </button>

          <div style={{ width: 1, height: 22, background: 'var(--color-border)', margin: '0 6px', flexShrink: 0 }} />

          {logged ? (
            <button onClick={() => router.push(`${base}/pedido`)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 6px', height: 36, background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #F472B6, #FB923C)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>MF</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>María</span>
            </button>
          ) : (
            <button onClick={() => router.push(`${base}/login`)} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 150ms', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1D4ED8' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#2563EB' }}
            >
              <User size={14} strokeWidth={2} />
              Ingresar
            </button>
          )}

          {/* Hamburger — mobile only */}
          <button
            className="sf-hdr-btn sf-hdr-mobile-only"
            style={{ marginLeft: 4 }}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <nav className="sf-drawer">
          <div className="sf-drawer-section">Secciones</div>
          {NAV_SECTIONS.map(s => (
            <a key={s.label} href={`${base}${s.path}`} className="sf-drawer-link" onClick={() => setMenuOpen(false)}
              style={s.hot ? { color: '#EF4444', fontWeight: 600 } : undefined}>
              {s.hot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />}
              {s.label}
            </a>
          ))}
          <div className="sf-drawer-section">Categorías</div>
          {NAV_CATS.map(c => (
            <a key={c.id} href={`${base}/catalogo/${c.id}`} className="sf-drawer-link" onClick={() => setMenuOpen(false)}>
              {c.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
