import { useState } from 'react'
import { useRouter } from 'next/router'
import { Shield, RefreshCw, MessageCircle, Star, CheckCircle, ArrowRight } from 'lucide-react'
import { StorefrontHeader } from '@/components/storefront/StorefrontHeader'
import { StorefrontFooter } from '@/components/storefront/StorefrontFooter'
import { AnnouncementBar } from '@/components/storefront/AnnouncementBar'
import { ProductCard } from '@/components/storefront/ProductCard'
import { ProdImage } from '@/components/storefront/Thumb'
import { TIENDA, PRODUCTOS, CARRITO_INICIAL, CATEGORIAS } from '@/lib/storefront/mock'
import { fmt, openWpp } from '@/lib/storefront/utils'

const OFERTAS = PRODUCTOS.filter(p => p.precioAnt).slice(0, 4)
const NUEVOS  = PRODUCTOS.filter(p => p.badge === 'Nuevo').slice(0, 4)

const RESENAS = [
  { nombre:'Laura M.',   ini:'LM', hue:340, rating:5, texto:'La campera es increíble, el material es de primerísima calidad. La talle M me quedó perfecta y el color es idéntico a las fotos.',  producto:'Campera bomber beige', fecha:'12 may' },
  { nombre:'Rodrigo F.', ini:'RF', hue:220, rating:5, texto:'Ya compré 3 veces y siempre quedo satisfecho. Los productos son exactamente lo que muestran, sin sorpresas desagradables.',           producto:'Remera oversize negra', fecha:'8 may'  },
  { nombre:'Camila S.',  ini:'CS', hue:280, rating:4, texto:'Muy buena ropa, precio justo y la atención por WhatsApp fue súper rápida. El envío llegó bien embalado.',                             producto:'Jean tiro medio',       fecha:'3 may'  },
  { nombre:'Martín G.',  ini:'MG', hue:140, rating:5, texto:'Compré el jogger y al mes volví por el buzo. La calidad de los materiales se nota. Se los recomiendo a todos.',                        producto:'Jogger gris melange',   fecha:'1 may'  },
  { nombre:'Flor R.',    ini:'FR', hue:30,  rating:5, texto:'Hermosa la remera estampada. Me la puse y recibí 3 comentarios el primer día. Definitivamente voy a comprar más.',                     producto:'Remera estampada',      fecha:'28 abr' },
  { nombre:'Diego P.',   ini:'DP', hue:200, rating:5, texto:'Excelente relación calidad-precio. La campera es cómoda, abriga bien y el cierre YKK es de los que duran.',                            producto:'Campera cortaviento',   fecha:'25 abr' },
]

export default function Inicio() {
  const router = useRouter()
  const { slug } = router.query as { slug: string }
  const base = `/tienda/${slug}`

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <StorefrontHeader tienda={TIENDA} carrito={CARRITO_INICIAL} />
      <AnnouncementBar />

      {/* ── HERO ── */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '52% 48%', minHeight: 520 }}>
          <div style={{ padding: '64px 48px 64px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-success)', letterSpacing: '0.04em' }}>Colección Otoño · Invierno 2026</span>
            </div>
            <h1 style={{ fontSize: 58, fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 0.92, color: 'var(--color-text)', margin: '0 0 20px' }}>
              Vestí<br />
              <span style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #7C3AED 50%, #EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>diferente.</span><br />
              Vivilo.
            </h1>
            <p style={{ fontSize: 16, color: 'var(--color-muted)', lineHeight: 1.6, maxWidth: 400, margin: '0 0 28px' }}>
              Indumentaria contemporánea diseñada en Argentina. Piezas que duran y que te hacen destacar.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 32 }}>
              <button onClick={() => router.push(`${base}/catalogo`)} style={{ height: 52, padding: '0 28px', borderRadius: 10, background: 'var(--color-primary)', color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(59,130,246,0.30)' }}>
                Ver colección <ArrowRight size={16} strokeWidth={2} />
              </button>
              <button onClick={() => router.push(`${base}/catalogo`)} style={{ height: 52, padding: '0 20px', borderRadius: 10, background: 'transparent', color: 'var(--color-primary)', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                Ver ofertas →
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingTop: 28, borderTop: '1px solid var(--color-border)' }}>
              {([
                [<Shield size={16} color="var(--color-muted)" strokeWidth={1.5} key="s" />, 'Compra protegida'],
                [<RefreshCw size={16} color="var(--color-muted)" strokeWidth={1.5} key="r" />, 'Cambios en 30 días'],
                [<MessageCircle size={16} color="var(--color-muted)" strokeWidth={1.5} key="m" />, 'Atención por WPP'],
              ] as const).map(([ico, lbl], i, arr) => (
                <span key={String(lbl)} style={{ display: 'inline-flex', alignItems: 'center', gap: 20 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {ico}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-body)' }}>{lbl}</span>
                  </span>
                  {i < arr.length - 1 && <span style={{ width: 1, height: 16, background: 'var(--color-border)' }} />}
                </span>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '40px 32px 40px 0' }}>
            <div onClick={() => router.push(`${base}/producto/p4`)} style={{ width: 'calc(100% + 48px)', marginLeft: -48, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 20, overflow: 'hidden', boxShadow: '-24px 0 64px rgba(15,23,42,0.10)', cursor: 'pointer', position: 'relative' }}>
              <ProdImage hue={35} height={360} radius={0}>
                <div style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(15,23,42,0.80)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: '"Geist Mono", monospace' }}>{fmt(89000)}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'line-through', fontFamily: '"Geist Mono", monospace' }}>{fmt(110000)}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: '#EF4444', padding: '2px 6px', borderRadius: 999, fontFamily: '"Geist Mono", monospace' }}>-19%</span>
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: 20, left: 20, background: 'rgba(251,191,36,0.92)', color: '#0F172A', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 700 }}>⚡ Quedan 3 unidades</div>
                <div style={{ position: 'absolute', top: -14, right: 32, height: 28, padding: '0 12px', borderRadius: 999, background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5, zIndex: 2 }}>★ MÁS VENDIDA</div>
              </ProdImage>
              <div style={{ padding: 20, borderTop: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>Campera bomber beige arena</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '32px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', display: 'flex', justifyContent: 'center' }}>
          {(['+1.200', '4.8 ★', '340', '< 1hs'] as const).map((num, i, arr) => (
            <span key={num} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span style={{ padding: '0 48px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace', letterSpacing: '-0.02em' }}>{num}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', marginTop: 4 }}>{['ventas realizadas','rating promedio','reseñas verificadas','respuesta por WPP'][i]}</div>
              </span>
              {i < arr.length - 1 && <span style={{ width: 1, height: 40, background: 'var(--color-border)' }} />}
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
        {/* ── OFERTAS ── */}
        <section style={{ padding: '48px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-error)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-error)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ofertas</span>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', margin: '6px 0 0' }}>Precios especiales</h2>
            </div>
            <a href={`${base}/catalogo`} style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-primary)', textDecoration: 'none' }}>Ver todas →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {OFERTAS.map(p => <ProductCard key={p.id} producto={p} />)}
          </div>
        </section>

        {/* ── NUEVOS ── */}
        <section style={{ paddingBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nuevos ingresos</span>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', margin: '6px 0 0' }}>Recién llegados</h2>
            </div>
            <a href={`${base}/catalogo`} style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-primary)', textDecoration: 'none' }}>Ver todos →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {NUEVOS.map(p => <ProductCard key={p.id} producto={p} />)}
          </div>
        </section>

        {/* ── CATEGORÍAS ── */}
        <section style={{ paddingBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>¿Qué estás buscando?</h2>
          <p style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 20 }}>Explorá nuestra colección completa por categoría</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {CATEGORIAS.map(c => (
              <a key={c.id} href={`${base}/catalogo/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 20, borderRadius: 14, background: 'var(--color-bg)', border: '1px solid var(--color-border)', textDecoration: 'none', transition: 'all 150ms ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: `oklch(0.94 0.04 ${c.hue})`, display: 'grid', placeItems: 'center', fontSize: 22 }}>🛍️</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{c.nombre}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>{c.count} productos</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── RESEÑAS ── */}
        <section style={{ paddingBottom: 64 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Reseñas</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', margin: '6px 0 0' }}>Lo que dicen nuestros clientes</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 40, fontWeight: 800, color: 'var(--color-text)', fontFamily: '"Geist Mono", monospace', letterSpacing: '-0.03em' }}>4.8</span>
              <div>
                <div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map(i => <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />)}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>340 reseñas verificadas</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {RESENAS.map(r => (
              <div key={r.nombre} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20, transition: 'border-color 150ms, box-shadow 150ms' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(15,23,42,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `oklch(0.85 0.06 ${r.hue})`, color: `oklch(0.32 0.10 ${r.hue})`, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{r.ini}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{r.nombre}</div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 8px', borderRadius: 999, background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-muted)', fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 4 }}>{r.producto}</span>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map(i => <Star key={i} size={12} fill={i <= r.rating ? '#F59E0B' : 'none'} color={i <= r.rating ? '#F59E0B' : 'var(--color-border)'} />)}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-subtle)', fontFamily: '"Geist Mono", monospace', marginTop: 2 }}>{r.fecha}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--color-body)', lineHeight: 1.65, fontStyle: 'italic', margin: 0 }}>"{r.texto}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12, fontSize: 11, color: 'var(--color-success)', fontWeight: 500 }}>
                  <CheckCircle size={12} strokeWidth={2} /> Compra verificada
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHATSAPP BANNER ── */}
        <section style={{ paddingBottom: 64 }}>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, background: 'linear-gradient(125deg, #0A4731 0%, #128C7E 40%, #25D366 100%)', padding: '44px 52px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 480px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 12px', borderRadius: 999, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>ATENCIÓN PERSONALIZADA</span>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: '12px 0 10px', maxWidth: 480 }}>Pedí por WhatsApp y te respondemos en menos de 1 hora</h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.78)', lineHeight: 1.55, maxWidth: 440, margin: 0 }}>Consultá disponibilidad, talles, colores y coordinamos el envío de forma personalizada.</p>
            </div>
            <button onClick={() => openWpp(TIENDA.wpp, 'Hola! Quería hacer una consulta.')} style={{ height: 56, padding: '0 32px', borderRadius: 12, background: '#fff', color: '#0A4731', fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.20)' }}>
              💬 Escribirnos por WhatsApp
            </button>
          </div>
        </section>
      </div>

      <StorefrontFooter tienda={TIENDA} slug={slug} />
    </div>
  )
}
