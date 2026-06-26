import { useState } from 'react'
import { useRouter } from 'next/router'
import { Minus, Plus, ShoppingCart, Star, Lock, Truck, RotateCcw } from 'lucide-react'
import { StorefrontHeader } from '@/components/storefront/StorefrontHeader'
import { StorefrontFooter } from '@/components/storefront/StorefrontFooter'
import { ProductCard } from '@/components/storefront/ProductCard'
import { Breadcrumb } from '@/components/storefront/Breadcrumb'
import { ProdImage } from '@/components/storefront/Thumb'
import { TIENDA, PRODUCTOS, CARRITO_INICIAL } from '@/lib/storefront/mock'
import { fmt, descuento } from '@/lib/storefront/utils'

const TALLES  = [{ name:'XS', stock:false },{ name:'S', stock:true },{ name:'M', stock:true },{ name:'L', stock:true },{ name:'XL', stock:true },{ name:'XXL', stock:false }]
const COLORES = [{ name:'Beige arena', color:'#D6CFC0', stock:true },{ name:'Negro', color:'#0F172A', stock:true },{ name:'Verde oliva', color:'#3F4F35', stock:false }]
const HUES    = [35, 220, 140, 200]

const CARACT  = [
  { label: 'Material',    value: '100% gabardina de algodón' },
  { label: 'Forro',       value: 'Acolchado 80g' },
  { label: 'Cierre',      value: 'YKK' },
  { label: 'Origen',      value: 'Hecho en Argentina' },
]

const RESENAS = [
  { autor:'Lucía M.',  rating:5, fecha:'hace 3 días',    titulo:'Hermosa y de excelente calidad', texto:'Mejor de lo que esperaba. El género es grueso y abriga muchísimo. El talle M me quedó perfecto.' },
  { autor:'Tomás R.',  rating:5, fecha:'hace 1 semana',  titulo:'Justa para el frío',             texto:'La uso todos los días para ir al trabajo. Me re cumple. El color beige es tal cual la foto.' },
  { autor:'Ana P.',    rating:4, fecha:'hace 2 semanas', titulo:'Linda pero abriga menos',        texto:'Es muy linda y el corte queda divino. Para días bajo 10° quizás conviene algo más pesado.' },
  { autor:'Diego F.',  rating:5, fecha:'hace 3 semanas', titulo:'Envío rápido y buen producto',  texto:'Llegó al día siguiente. La calidad es notable, las costuras son prolijas. Volvería a comprar.' },
]

export default function ProductoDetalle() {
  const router = useRouter()
  const { slug, id } = router.query as { slug: string; id: string }
  const base = `/tienda/${slug}`

  const producto     = PRODUCTOS.find(p => p.id === id) ?? PRODUCTOS[3]
  const desc         = producto.precioAnt ? descuento(producto.precio, producto.precioAnt) : 0
  const ahorro       = producto.precioAnt ? producto.precioAnt - producto.precio : 0
  const relacionados = PRODUCTOS.filter(p => p.id !== producto.id).slice(0, 4)

  const [imgIdx,   setImgIdx]   = useState(0)
  const [colorIdx, setColorIdx] = useState(0)
  const [talleIdx, setTalleIdx] = useState(2)
  const [qty,      setQty]      = useState(1)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <StorefrontHeader tienda={TIENDA} carrito={CARRITO_INICIAL} />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 32px 64px' }}>
        <Breadcrumb items={[
          { label: 'Inicio',   href: base },
          { label: 'Catálogo', href: `${base}/catalogo` },
          { label: producto.cat, href: `${base}/catalogo/${producto.cat.toLowerCase()}` },
          { label: producto.nombre },
        ]} />

        {/* ══ GRILLA PRINCIPAL ══ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 460px', gap: 56, marginBottom: 72 }}>

          {/* ── Galería + Características ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Thumbs laterales + imagen principal */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

              {/* Columna vertical de thumbnails */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                {HUES.map((hue, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    style={{
                      width: 76, padding: 0, borderRadius: 10, overflow: 'hidden',
                      border: `2px solid ${i === imgIdx ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      cursor: 'pointer', background: 'transparent',
                      transition: 'border-color 150ms',
                      flexShrink: 0,
                    }}
                  >
                    <ProdImage hue={hue} height={76} radius={0} />
                  </button>
                ))}
              </div>

              {/* Imagen principal */}
              <div style={{ flex: 1, position: 'relative' }}>
                <ProdImage hue={HUES[imgIdx]} height={560} radius={14}>
                  {producto.badge && (
                    <div style={{ position: 'absolute', top: 16, left: 16 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 999, background: producto.badge === 'Oferta' ? 'var(--color-error-bg)' : 'var(--color-primary-bg)', color: producto.badge === 'Oferta' ? 'var(--color-error)' : 'var(--color-primary)', fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        {producto.badge}{desc > 0 ? ` · -${desc}%` : ''}
                      </span>
                    </div>
                  )}
                </ProdImage>
              </div>
            </div>

            {/* Características — debajo de la imagen */}
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--color-border)', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', background: 'var(--color-surface)' }}>
                Características
              </div>
              <div style={{ padding: '4px 0' }}>
                {CARACT.map((c, i) => (
                  <div key={c.label} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 12, padding: '10px 16px', borderBottom: i < CARACT.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c.label}</span>
                    <span style={{ fontSize: 13, color: 'var(--color-body)' }}>{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Panel de info ── */}
          <div>
            {/* Categoría */}
            <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 999, background: 'var(--color-warning-bg)', color: 'var(--color-warning)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
              {producto.cat}
            </span>

            {/* Nombre */}
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--color-text)', margin: '0 0 10px', lineHeight: 1.15 }}>
              {producto.nombre}
            </h1>

            {/* Valoración */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= Math.floor(producto.rating) ? '#F59E0B' : 'none'} color="#F59E0B" />)}
              <span style={{ fontSize: 13, color: 'var(--color-body)', fontWeight: 600, fontFamily: '"Geist Mono", monospace' }}>{producto.rating}</span>
              <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>· 62 reseñas</span>
            </div>

            {/* Descripción — movida aquí, arriba del precio */}
            <p style={{ fontSize: 13.5, color: 'var(--color-body)', lineHeight: 1.65, margin: '0 0 20px', borderBottom: '1px solid var(--color-border)', paddingBottom: 20 }}>
              Una campera atemporal para el día a día. Confeccionada en gabardina premium con interior acolchado liviano, perfecta para el frío sin perder estilo.
            </p>

            {/* Precio */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
              <span style={{ fontSize: 34, fontWeight: 800, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmt(producto.precio)}</span>
              {producto.precioAnt && <span style={{ fontSize: 16, color: 'var(--color-subtle)', textDecoration: 'line-through', fontFamily: '"Geist Mono", monospace' }}>{fmt(producto.precioAnt)}</span>}
            </div>
            {ahorro > 0 && <div style={{ fontSize: 13, color: 'var(--color-success)', fontWeight: 600, marginBottom: 20 }}>Ahorrás {fmt(ahorro)}</div>}

            {/* Color */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 10 }}>
                Color: <span style={{ fontWeight: 400, color: 'var(--color-muted)' }}>{COLORES[colorIdx].name}</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {COLORES.map((c, i) => (
                  <button key={c.name} onClick={() => c.stock && setColorIdx(i)} disabled={!c.stock}
                    style={{ width: 36, height: 36, borderRadius: '50%', background: c.color, border: '2px solid var(--color-bg)', outline: `2px solid ${colorIdx === i ? 'var(--color-primary)' : 'var(--color-border)'}`, outlineOffset: 1, cursor: c.stock ? 'pointer' : 'not-allowed', opacity: c.stock ? 1 : 0.5 }} />
                ))}
              </div>
            </div>

            {/* Talle — sin "Guía de talles" */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 10 }}>
                Talle: <span style={{ fontWeight: 400, color: 'var(--color-muted)' }}>{TALLES[talleIdx].name}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TALLES.map((s, i) => (
                  <button key={s.name} onClick={() => s.stock && setTalleIdx(i)} disabled={!s.stock}
                    style={{ minWidth: 48, height: 40, padding: '0 12px', background: talleIdx === i ? 'var(--color-text)' : 'var(--color-bg)', color: talleIdx === i ? 'var(--color-bg)' : (s.stock ? 'var(--color-text)' : 'var(--color-subtle)'), border: `1px solid ${talleIdx === i ? 'var(--color-text)' : 'var(--color-border)'}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: s.stock ? 'pointer' : 'not-allowed' }}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-success)', fontWeight: 600, marginBottom: 20 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', flexShrink: 0 }} />
              Stock disponible · 8 unidades
            </div>

            {/* Qty + Agregar */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 8, height: 48, flexShrink: 0 }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 40, height: 48, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', display: 'grid', placeItems: 'center' }}><Minus size={14} /></button>
                <span style={{ width: 36, textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ width: 40, height: 48, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', display: 'grid', placeItems: 'center' }}><Plus size={14} /></button>
              </div>
              <button onClick={() => router.push(`${base}/carrito`)} style={{ flex: 1, height: 48, borderRadius: 8, background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(59,130,246,0.25)' }}>
                <ShoppingCart size={16} strokeWidth={1.5} /> Agregar al carrito
              </button>
            </div>

            {/* Comprar ahora — full width, sin Guardar */}
            <button
              onClick={() => router.push(`${base}/checkout/datos`)}
              style={{ width: '100%', height: 48, borderRadius: 8, background: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 20 }}
            >
              Comprar ahora
            </button>

            {/* Badges envío / cambios / pago */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
              {([
                [<Truck key="t" size={16} strokeWidth={1.5} color="var(--color-muted)" />, 'Envíos', '24-72 hs'],
                [<RotateCcw key="r" size={16} strokeWidth={1.5} color="var(--color-muted)" />, 'Cambios', '30 días gratis'],
                [<Lock key="l" size={16} strokeWidth={1.5} color="var(--color-muted)" />, 'Pago', '100% seguro'],
              ] as [React.ReactNode, string, string][]).map(([icon, t1, t2]) => (
                <div key={t1} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {icon}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>{t1}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{t2}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ══ RESEÑAS ══ */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Reseñas de clientes</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= 4 ? '#F59E0B' : 'none'} color="#F59E0B" />)}
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-body)', fontFamily: '"Geist Mono", monospace' }}>4.7</span>
              <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>· 62 reseñas</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
            {RESENAS.map((r, i) => (
              <div key={i} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{r.autor}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-subtle)' }}>{r.fecha}</div>
                </div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>{[1,2,3,4,5].map(n => <Star key={n} size={12} fill={n <= r.rating ? '#F59E0B' : 'none'} color="#F59E0B" />)}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>{r.titulo}</div>
                <div style={{ fontSize: 13, color: 'var(--color-body)', lineHeight: 1.5 }}>{r.texto}</div>
              </div>
            ))}
          </div>

          {/* Formulario bloqueado — solo compradores verificados */}
          <div style={{ position: 'relative', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
            {/* Form de fondo (deshabilitado visualmente) */}
            <div style={{ padding: 20, pointerEvents: 'none', userSelect: 'none', filter: 'blur(2px)', opacity: 0.45 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>Escribí tu reseña</div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                {[1,2,3,4,5].map(n => <Star key={n} size={20} fill="none" color="var(--color-border)" />)}
              </div>
              <input disabled placeholder="Título de tu reseña" style={{ width: '100%', boxSizing: 'border-box', height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', fontSize: 13, marginBottom: 10, color: 'var(--color-text)', outline: 'none' }} />
              <textarea disabled placeholder="Contanos tu experiencia con este producto..." style={{ width: '100%', boxSizing: 'border-box', height: 88, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', fontSize: 13, resize: 'none', color: 'var(--color-text)', outline: 'none', fontFamily: 'inherit' }} />
              <button disabled style={{ marginTop: 10, height: 38, padding: '0 20px', borderRadius: 8, background: 'var(--color-primary)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'not-allowed' }}>Publicar reseña</button>
            </div>

            {/* Overlay de bloqueo */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'rgba(var(--color-bg-raw, 255,255,255), 0.72)', backdropFilter: 'blur(4px)' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'grid', placeItems: 'center' }}>
                <Lock size={20} strokeWidth={1.5} color="var(--color-muted)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 4px' }}>Solo compradores verificados</p>
                <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: 0 }}>Comprá este producto para poder dejar una reseña.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ══ TAMBIÉN TE PUEDE GUSTAR ══ */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 16 }}>También te puede gustar</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {relacionados.map(p => <ProductCard key={p.id} producto={p} />)}
          </div>
        </div>
      </div>
      <StorefrontFooter tienda={TIENDA} slug={slug} />
    </div>
  )
}
