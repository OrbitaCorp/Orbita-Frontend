import { useState } from 'react'
import { useRouter } from 'next/router'
import { Heart, Minus, Plus, ShoppingCart, Star, Lock, Truck, RotateCcw, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
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

  const producto    = PRODUCTOS.find(p => p.id === id) ?? PRODUCTOS[3]
  const desc        = producto.precioAnt ? descuento(producto.precio, producto.precioAnt) : 0
  const ahorro      = producto.precioAnt ? producto.precioAnt - producto.precio : 0
  const relacionados = PRODUCTOS.filter(p => p.id !== producto.id).slice(0, 4)

  const [imgIdx,   setImgIdx]   = useState(0)
  const [colorIdx, setColorIdx] = useState(0)
  const [talleIdx, setTalleIdx] = useState(2)
  const [qty,      setQty]      = useState(1)
  const [acordeon, setAcordeon] = useState<string>('descripcion')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <StorefrontHeader tienda={TIENDA} carrito={CARRITO_INICIAL} />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 32px 48px' }}>
        <Breadcrumb items={[
          { label: 'Inicio', href: base },
          { label: 'Catálogo', href: `${base}/catalogo` },
          { label: producto.cat, href: `${base}/catalogo/${producto.cat.toLowerCase()}` },
          { label: producto.nombre },
        ]} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 480px', gap: 56, marginBottom: 64 }}>
          {/* Galería */}
          <div>
            <div style={{ position: 'relative' }}>
              <ProdImage hue={HUES[imgIdx]} height={560} radius={14}>
                {producto.badge && (
                  <div style={{ position: 'absolute', top: 16, left: 16 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 999, background: producto.badge === 'Oferta' ? 'var(--color-error-bg)' : 'var(--color-primary-bg)', color: producto.badge === 'Oferta' ? 'var(--color-error)' : 'var(--color-primary)', fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {producto.badge}{desc > 0 ? ` · -${desc}%` : ''}
                    </span>
                  </div>
                )}
                <button onClick={() => setImgIdx(i => (i - 1 + 4) % 4)} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'grid', placeItems: 'center', border: 'none', cursor: 'pointer', color: '#0F172A' }}><ChevronLeft size={18} /></button>
                <button onClick={() => setImgIdx(i => (i + 1) % 4)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'grid', placeItems: 'center', border: 'none', cursor: 'pointer', color: '#0F172A' }}><ChevronRight size={18} /></button>
                <button style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'grid', placeItems: 'center', border: 'none', cursor: 'pointer', color: '#0F172A' }}><Heart size={18} strokeWidth={1.5} /></button>
              </ProdImage>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12 }}>
              {HUES.map((hue, i) => (
                <button key={i} onClick={() => setImgIdx(i)} style={{ padding: 0, borderRadius: 10, overflow: 'hidden', border: `2px solid ${i === imgIdx ? 'var(--color-primary)' : 'transparent'}`, cursor: 'pointer', background: 'transparent' }}>
                  <ProdImage hue={hue} height={88} radius={6} />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 999, background: 'var(--color-warning-bg)', color: 'var(--color-warning)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{producto.cat}</span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--color-text)', margin: '0 0 12px', lineHeight: 1.15 }}>{producto.nombre}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= Math.floor(producto.rating) ? '#F59E0B' : 'none'} color="#F59E0B" />)}
              <span style={{ fontSize: 13, color: 'var(--color-body)', fontWeight: 600, fontFamily: '"Geist Mono", monospace' }}>{producto.rating}</span>
              <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>· 62 reseñas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 34, fontWeight: 800, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{fmt(producto.precio)}</span>
              {producto.precioAnt && <span style={{ fontSize: 16, color: 'var(--color-subtle)', textDecoration: 'line-through', fontFamily: '"Geist Mono", monospace' }}>{fmt(producto.precioAnt)}</span>}
            </div>
            {ahorro > 0 && <div style={{ fontSize: 13, color: 'var(--color-success)', fontWeight: 600, marginBottom: 8 }}>Ahorrás {fmt(ahorro)}</div>}
            <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 24, fontFamily: '"Geist Mono", monospace' }}>3 cuotas sin interés de {fmt(Math.round(producto.precio / 3))} con tarjeta</div>

            {/* Color */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 10 }}>Color: <span style={{ fontWeight: 400, color: 'var(--color-muted)' }}>{COLORES[colorIdx].name}</span></div>
              <div style={{ display: 'flex', gap: 10 }}>
                {COLORES.map((c, i) => (
                  <button key={c.name} onClick={() => c.stock && setColorIdx(i)} disabled={!c.stock}
                    style={{ width: 36, height: 36, borderRadius: '50%', background: c.color, border: '2px solid var(--color-bg)', outline: `2px solid ${colorIdx === i ? 'var(--color-primary)' : 'var(--color-border)'}`, outlineOffset: 1, cursor: c.stock ? 'pointer' : 'not-allowed', opacity: c.stock ? 1 : 0.5 }} />
                ))}
              </div>
            </div>

            {/* Talle */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Talle: <span style={{ fontWeight: 400, color: 'var(--color-muted)' }}>{TALLES[talleIdx].name}</span></div>
                <button style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Guía de talles</button>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-success)', fontWeight: 600, marginBottom: 20 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', flexShrink: 0 }} />
              Stock disponible · 8 unidades
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 8, height: 48 }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 40, height: 48, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', display: 'grid', placeItems: 'center' }}><Minus size={14} /></button>
                <span style={{ width: 36, textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ width: 40, height: 48, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', display: 'grid', placeItems: 'center' }}><Plus size={14} /></button>
              </div>
              <button onClick={() => router.push(`${base}/carrito`)} style={{ flex: 1, height: 48, borderRadius: 8, background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(59,130,246,0.25)' }}>
                <ShoppingCart size={16} strokeWidth={1.5} /> Agregar al carrito
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <button onClick={() => router.push(`${base}/checkout/datos`)} style={{ flex: 1, height: 48, borderRadius: 8, background: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Comprar ahora</button>
              <button style={{ height: 48, padding: '0 16px', borderRadius: 8, background: 'transparent', color: 'var(--color-body)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <Heart size={16} strokeWidth={1.5} /> Guardar
              </button>
            </div>

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
              {[
                [<Truck key="t" size={16} strokeWidth={1.5} color="var(--color-muted)" />, 'Envíos', '24-72 hs'],
                [<RotateCcw key="r" size={16} strokeWidth={1.5} color="var(--color-muted)" />, 'Cambios', '30 días gratis'],
                [<Lock key="l" size={16} strokeWidth={1.5} color="var(--color-muted)" />, 'Pago', '100% seguro'],
              ].map(([icon, t1, t2], i) => (
                <div key={String(t1)} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {icon}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>{t1}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{t2}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
              {[
                ['descripcion', 'Descripción',    'Una campera atemporal para el día a día. Confeccionada en gabardina premium con interior acolchado liviano.'],
                ['caract',      'Características', '• 100% gabardina de algodón\n• Forro acolchado 80g\n• Cierre YKK\n• Hecho en Argentina'],
                ['talles',      'Guía de talles',  'Calce regular. Si dudás entre dos talles, te recomendamos el menor.'],
              ].map(([id, title, body]) => (
                <div key={id} style={{ borderBottom: id !== 'talles' ? '1px solid var(--color-border)' : 'none' }}>
                  <button onClick={() => setAcordeon(acordeon === id ? '' : id)} style={{ width: '100%', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {title}<ChevronDown size={16} style={{ transform: acordeon === id ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
                  </button>
                  {acordeon === id && <div style={{ padding: '0 16px 16px', fontSize: 13, color: 'var(--color-body)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{body}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reseñas */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 24 }}>Reseñas de clientes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {RESENAS.map((r, i) => (
              <div key={i} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{r.autor}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-subtle)' }}>{r.fecha}</div>
                </div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>{[1,2,3,4,5].map(n => <Star key={n} size={12} fill={n <= r.rating ? '#F59E0B' : 'none'} color="#F59E0B" />)}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>{r.titulo}</div>
                <div style={{ fontSize: 13, color: 'var(--color-body)', lineHeight: 1.5 }}>{r.texto}</div>
              </div>
            ))}
          </div>
        </div>

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
