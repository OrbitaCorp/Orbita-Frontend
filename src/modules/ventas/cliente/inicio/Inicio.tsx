// src/modules/ventas/cliente/inicio/Inicio.tsx — Vista 01 (v3 editorial)

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { ArrowRight, ChevronLeft, ChevronRight, Plus, ShoppingCart, Truck, ShoppingBag, MapPin, Check, RefreshCw, Shield, MessageCircle, Lock } from 'lucide-react'
import { StorefrontHeader } from '@/components/storefront/StorefrontHeader'
import { StorefrontFooter } from '@/components/storefront/StorefrontFooter'
import { AnnouncementBar } from '@/components/storefront/AnnouncementBar'
import { ProductCard } from '@/components/storefront/ProductCard'
import { ProdImage } from '@/components/storefront/Thumb'
import { TIENDA, PRODUCTOS, CARRITO_INICIAL } from '@/lib/storefront/mock'
import { fmt, openWpp } from '@/lib/storefront/utils'

const HERO_SLIDES = [
    {
        id: 's1', eyebrow: 'Colección Otoño · Invierno 2026',
        titulo: 'Camperas que\nabrigan con estilo',
        sub: 'Bombers, técnicas y cortavientos. Hasta 25% off en abrigos seleccionados.',
        cta: 'Ver camperas', cta2: 'Ofertas',
        grad: 'linear-gradient(120deg, #0F172A 0%, #1E3A5F 42%, #1D4ED8 100%)', accent: '#60A5FA',
        hue: 35, precio: 89000, precioAnt: 110000 as number | null, prod: 'Campera bomber beige arena',
    },
    {
        id: 's2', eyebrow: 'Nuevos ingresos',
        titulo: 'Recién llegados,\nlistos para vos',
        sub: 'Las últimas piezas de la temporada. Diseño contemporáneo hecho en Argentina.',
        cta: 'Ver novedades', cta2: 'Catálogo',
        grad: 'linear-gradient(120deg, #1E1B4B 0%, #4C1D95 45%, #7C3AED 100%)', accent: '#C4B5FD',
        hue: 280, precio: 27500, precioAnt: null as number | null, prod: 'Remera estampada gráfica',
    },
    {
        id: 's3', eyebrow: 'Ofertas flash',
        titulo: 'Precios especiales\npor tiempo limitado',
        sub: 'Hasta 23% off en remeras, joggers y jeans. Stock limitado, no te quedes afuera.',
        cta: 'Ver ofertas', cta2: 'Catálogo',
        grad: 'linear-gradient(120deg, #052E2B 0%, #0A6638 45%, #10B981 100%)', accent: '#6EE7B7',
        hue: 200, precio: 56000, precioAnt: 68000 as number | null, prod: 'Jean tiro medio celeste',
    },
]

const CATS_CARRUSEL = [
    { id: 'remeras',    nombre: 'Remeras',    count: 12, hue: 220, emoji: '👕' },
    { id: 'pantalones', nombre: 'Pantalones', count: 8,  hue: 140, emoji: '👖' },
    { id: 'buzos',      nombre: 'Buzos',      count: 6,  hue: 280, emoji: '🧥' },
    { id: 'camperas',   nombre: 'Camperas',   count: 5,  hue: 35,  emoji: '🧣' },
    { id: 'jeans',      nombre: 'Jeans',      count: 9,  hue: 200, emoji: '👖' },
    { id: 'calzado',    nombre: 'Calzado',    count: 14, hue: 30,  emoji: '👟' },
    { id: 'accesorios', nombre: 'Accesorios', count: 11, hue: 320, emoji: '🧢' },
    { id: 'deportivo',  nombre: 'Deportivo',  count: 7,  hue: 170, emoji: '🎽' },
]

const OFERTA_FLASH = [
    { id: 'of1', nombre: 'Remera oversize negra',   precio: 24900, precioAnt: 32000, hue: 220, badge: '−22%', cat: 'Remeras',    rating: 4.6, stock: true, stockCount: 4 },
    { id: 'of2', nombre: 'Jogger gris melange',     precio: 34500, precioAnt: 45000, hue: 210, badge: '−23%', cat: 'Pantalones', rating: 4.7, stock: true, stockCount: 2 },
    { id: 'of3', nombre: 'Buzo sin capucha crema',  precio: 32000, precioAnt: 40000, hue: 45,  badge: '−20%', cat: 'Buzos',      rating: 4.5, stock: true, stockCount: 7 },
    { id: 'of4', nombre: 'Jean tiro medio celeste', precio: 56000, precioAnt: 68000, hue: 200, badge: '−18%', cat: 'Jeans',      rating: 4.8, stock: true, stockCount: 3 },
]

const NUEVOS_INGRESOS = [
    { id: 'ni1', nombre: 'Campera técnica impermeable', precio: 112000, precioAnt: null, hue: 200, badge: 'Nuevo', cat: 'Camperas',    rating: 4.8, stock: true },
    { id: 'ni2', nombre: 'Remera estampada gráfica',    precio: 27500,  precioAnt: null, hue: 280, badge: 'Nuevo', cat: 'Remeras',     rating: 4.9, stock: true },
    { id: 'ni3', nombre: 'Gorra trucker bordada',       precio: 15900,  precioAnt: null, hue: 30,  badge: 'Nuevo', cat: 'Accesorios',  rating: 4.5, stock: true },
    { id: 'ni4', nombre: 'Top deportivo lila',          precio: 19500,  precioAnt: null, hue: 270, badge: 'Nuevo', cat: 'Deportivo',   rating: 4.7, stock: true },
]

const STATS: [string, string][] = [
    ['+1.200', 'ventas realizadas'],
    ['48 hs',  'envío al país'],
    ['30 días', 'cambios gratis'],
    ['3 cuotas', 'sin interés'],
]

export default function Inicio() {
    const router = useRouter()
    const { slug } = router.query as { slug: string }
    const base = `/tienda/${slug}`
    const go = (path: string) => router.push(`${base}${path}`)

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            <style>{`
                @keyframes sfFadeIn   { from { opacity:0; transform:translateY(8px)  } to { opacity:1; transform:translateY(0) } }
                @keyframes sfDotPulse { 0%,100%{ opacity:1; transform:scale(1)  } 50%{ opacity:.4; transform:scale(.7) } }
                @keyframes sfFloat    { 0%,100%{ transform:translateY(0)   } 33%{ transform:translateY(-7px)  } 66%{ transform:translateY(-3px) } }
                @keyframes sfBadge    { 0%,100%{ transform:translateY(0)   } 50%{ transform:translateY(-8px) } }
                @keyframes sfMarquee  { from { transform:translateX(0) } to { transform:translateX(-50%) } }
                .sf-cat-scroll::-webkit-scrollbar { display:none }
                .sf-marquee-track { display:flex; gap:8px; width:max-content; animation:sfMarquee 28s linear infinite; }
                .sf-marquee-track:hover { animation-play-state:paused; }
                .sf-marquee-wrap { overflow:hidden; mask-image:linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%); -webkit-mask-image:linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%); }

                /* Contenedor base */
                .sf-w  { max-width:1280px; margin:0 auto; padding:0 32px }
                /* Grillas de productos */
                .sf-g4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px }
                /* Grid hero */
                .sf-hero-grid { display:grid; grid-template-columns:1fr 400px; gap:40px; align-items:center; max-width:1280px; margin:0 auto; padding:0 48px }
                /* Grid envíos / beneficios */
                .sf-2col { display:grid; grid-template-columns:1.1fr 1fr; gap:18px }

                /* ── Tablet (≤1024px) ── */
                @media(max-width:1024px){
                    .sf-w         { padding:0 24px }
                    .sf-g4        { grid-template-columns:repeat(2,1fr); gap:12px }
                    .sf-hero-grid { grid-template-columns:1fr; padding:0 32px }
                    .sf-hero-card { display:none }
                    .sf-2col      { grid-template-columns:1fr }
                }
                /* ── Mobile (≤640px) ── */
                @media(max-width:640px){
                    .sf-w          { padding:0 16px }
                    .sf-g4         { gap:10px }
                    .sf-hero-grid  { padding:0 20px }
                    .sf-stats-row  { flex-wrap:wrap; gap:8px 0 }
                    .sf-stats-div  { display:none !important }
                    .sf-stats-item { padding:4px 16px !important }
                }
            `}</style>

            <StorefrontHeader tienda={TIENDA} carrito={CARRITO_INICIAL} />
            <AnnouncementBar />

            {/* ══ HERO ══ */}
            <HeroCarousel go={go} />

            {/* ══ STATS BAR ══ */}
            <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '12px 0' }}>
                <div className="sf-w" style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="sf-stats-row" style={{ display: 'flex', alignItems: 'center' }}>
                        {STATS.map(([num, lbl], i, arr) => (
                            <span key={lbl} style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <span className="sf-stats-item" style={{ padding: '0 24px', display: 'flex', alignItems: 'baseline', gap: 5 }}>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)', fontFamily: '"Geist Mono", monospace' }}>{num}</span>
                                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-body)' }}>{lbl}</span>
                                </span>
                                {i < arr.length - 1 && <span className="sf-stats-div" style={{ width: 1, height: 14, background: 'var(--color-border)', flexShrink: 0 }} />}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══ CATEGORÍAS ══ */}
            <CategoriaCarrusel go={go} />

            {/* ══ MÁS VENDIDOS ══ */}
            <section className="sf-w" style={{ paddingTop: 36, paddingBottom: 36 }}>
                <SectionHead color="#F59E0B" eyebrow="Top ventas" titulo="Más vendidos" onVer={() => go('/catalogo')} />
                <div className="sf-g4">
                    {PRODUCTOS.slice(0, 4).map(p => (
                        <ProductCard key={p.id} producto={p} />
                    ))}
                </div>
            </section>

            {/* ══ DESTACADOS ══ */}
            <section className="sf-w" style={{ paddingBottom: 36 }}>
                <SectionHead color="#EF4444" eyebrow="Destacados" titulo="Productos destacados" onVer={() => go('/catalogo')} />
                <div className="sf-g4">
                    {OFERTA_FLASH.map(p => (
                        <ProductCard key={p.id} producto={p} stockCount={p.stockCount} />
                    ))}
                </div>
            </section>

            {/* ══ NUEVOS INGRESOS ══ */}
            <section className="sf-w" style={{ paddingBottom: 36 }}>
                <SectionHead color="#10B981" eyebrow="Nuevos ingresos" titulo="Recién llegados" onVer={() => go('/catalogo')} />
                <div className="sf-g4">
                    {NUEVOS_INGRESOS.map(p => (
                        <ProductCard key={p.id} producto={p} />
                    ))}
                </div>
            </section>

            {/* ══ LANZAMIENTOS ══ */}
            <section className="sf-w" style={{ paddingBottom: 36 }}>
                <SectionHead color="#7C3AED" eyebrow="Lanzamientos" titulo="Nuevos lanzamientos" onVer={() => go('/catalogo')} />
                <div className="sf-g4">
                    {PRODUCTOS.slice(4, 8).map(p => <ProductCard key={p.id} producto={p} />)}
                </div>
            </section>

            {/* ══ MÁS PARA VOS ══ */}
            <section className="sf-w" style={{ paddingBottom: 44 }}>
                <SectionHead color="var(--color-primary)" eyebrow="Recomendados" titulo="Más para vos" onVer={() => go('/catalogo')} />
                <div className="sf-g4">
                    {PRODUCTOS.slice(8, 12).map(p => <ProductCard key={p.id} producto={p} />)}
                </div>
            </section>

            {/* ══ ENVÍOS + BENEFICIOS ══ */}
            <section className="sf-w" style={{ paddingBottom: 44 }}>
                <div className="sf-2col">
                    {/* Panel envíos oscuro */}
                    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, background: 'linear-gradient(135deg,#0F172A 0%,#1E3A5F 55%,#2563EB 140%)', padding: '32px 28px 28px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ position: 'absolute', top: -50, right: -30, width: 240, height: 240, borderRadius: '50%', background: 'rgba(96,165,250,0.22)', filter: 'blur(60px)' }} />
                        {/* Contenido */}
                        <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 24, padding: '0 11px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                <Truck size={11} /> Envíos
                            </span>
                            <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#fff', marginTop: 14, maxWidth: 320 }}>Llega a todo el país en 24–48 hs</h2>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', lineHeight: 1.55, marginTop: 8, maxWidth: 340 }}>Despachamos por correo y moto con seguimiento en tiempo real.</p>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 14, height: 34, padding: '0 13px', borderRadius: 9, background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(52,211,153,0.35)', color: '#6EE7B7', fontSize: 12, fontWeight: 600 }}>
                                <Check size={13} /> Envío gratis desde {fmt(80000)}
                            </div>
                        </div>
                        {/* Tracking — pegado al fondo */}
                        <div style={{ position: 'relative', zIndex: 1, marginTop: 28, background: 'rgba(255,255,255,0.09)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center' }}>
                            {([
                                { Ico: ShoppingBag,  lbl: 'Confirmado', done: true  },
                                { Ico: ShoppingCart, lbl: 'Preparando', done: true  },
                                { Ico: Truck,        lbl: 'En camino',  done: false },
                                { Ico: MapPin,       lbl: 'Entregado',  done: false },
                            ]).map((s, i, arr) => (
                                <span key={s.lbl} style={{ display: 'contents' }}>
                                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                                        <span style={{ width: 30, height: 30, borderRadius: '50%', background: s.done ? '#34D399' : 'rgba(255,255,255,0.13)', color: s.done ? '#052E2B' : 'rgba(255,255,255,0.55)', display: 'grid', placeItems: 'center', border: !s.done && i === 2 ? '2px solid #60A5FA' : 'none' }}>
                                            <s.Ico size={14} />
                                        </span>
                                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{s.lbl}</span>
                                    </span>
                                    {i < arr.length - 1 && <span style={{ flex: 1, height: 2, background: s.done ? '#34D399' : 'rgba(255,255,255,0.16)', margin: '0 3px 14px' }} />}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Beneficios */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {([
                            { Ico: RefreshCw,    c: '#7C3AED', t: 'Cambios sin vueltas',      d: '30 días para cambiar talle o modelo, coordinado por WhatsApp.' },
                            { Ico: Shield,       c: '#10B981', t: 'Compra protegida',          d: 'Tarjeta, transferencia o Mercado Pago en hasta 3 cuotas sin interés.' },
                            { Ico: MessageCircle,c: '#F59E0B', t: 'Atención en menos de 1 hora', d: 'Te respondemos por WhatsApp de lunes a sábado, sin bots.' },
                        ]).map((b, i) => (
                            <div key={b.t} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '18px 20px', animation: `sfFadeIn 450ms ${i * 55}ms cubic-bezier(0.2,0.8,0.2,1) both` }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: `linear-gradient(135deg,${b.c},${b.c}bb)`, color: '#fff', display: 'grid', placeItems: 'center', boxShadow: `0 6px 14px ${b.c}38` }}>
                                    <b.Ico size={20} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 2 }}>{b.t}</div>
                                    <div style={{ fontSize: 12, color: 'var(--color-body)', lineHeight: 1.5 }}>{b.d}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Métodos de pago */}
                <div style={{ marginTop: 12, padding: '14px 22px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pagás con</span>
                        {['Visa', 'Mastercard', 'Amex', 'Mercado Pago', 'Transferencia'].map(m => (
                            <span key={m} style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-body)', padding: '4px 9px', borderRadius: 6, background: 'var(--color-bg)', border: '1px solid var(--color-border)', fontFamily: '"Geist Mono", monospace' }}>{m}</span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-body)', fontWeight: 500 }}>
                        <Lock size={13} color="var(--color-success)" />
                        Pago cifrado y protegido
                    </div>
                </div>
            </section>

            {/* ══ BANNER WHATSAPP ══ */}
            <section className="sf-w" style={{ paddingBottom: 52 }}>
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, background: 'linear-gradient(125deg,#0A4731 0%,#128C7E 40%,#25D366 100%)' }}>
                    <div style={{ position: 'absolute', top: -70, right: -70, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', filter: 'blur(70px)' }} />
                    <div style={{ position: 'relative', zIndex: 1, padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 360px', minWidth: 240 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px', borderRadius: 999, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em' }}>ATENCIÓN PERSONALIZADA</span>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2, margin: '10px 0 0', maxWidth: 400 }}>Pedí por WhatsApp y te respondemos en menos de 1 hora 💬</h2>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.84)', lineHeight: 1.55, margin: '8px 0 0', maxWidth: 380 }}>Consultá disponibilidad, talles, colores y coordinamos el envío de forma personalizada.</p>
                            <div style={{ display: 'flex', gap: 22, marginTop: 16 }}>
                                {([['< 1hs', 'tiempo de respuesta'], ['+1.200', 'pedidos coordinados']] as [string, string][]).map(([n, l]) => (
                                    <div key={l}>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: '"Geist Mono", monospace' }}>{n}</div>
                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.70)', marginTop: 1 }}>{l}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => openWpp(TIENDA.wpp, 'Hola! Quería hacer una consulta.')} style={{ height: 50, padding: '0 26px', borderRadius: 10, background: '#fff', color: '#0A4731', fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 9, boxShadow: '0 6px 24px rgba(0,0,0,0.18)', flexShrink: 0 }}>
                            💬 Escribirnos por WhatsApp
                        </button>
                    </div>
                </div>
            </section>

            <StorefrontFooter tienda={TIENDA} slug={slug} />
        </div>
    )
}

// ─── Encabezado de sección ─────────────────────────────────────────────────────

function SectionHead({ color, eyebrow, titulo, onVer }: { color: string; eyebrow: string; titulo: string; onVer: () => void }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, animation: 'sfDotPulse 2s infinite' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{eyebrow}</span>
                </div>
                <h2 style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '5px 0 0' }}>{titulo}</h2>
            </div>
            <button onClick={onVer} style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>Ver todos →</button>
        </div>
    )
}

// ─── Hero carousel ─────────────────────────────────────────────────────────────

function HeroCarousel({ go }: { go: (p: string) => void }) {
    const [idx, setIdx] = useState(0)
    const [paused, setPaused] = useState(false)
    const n = HERO_SLIDES.length

    useEffect(() => {
        if (paused) return
        const id = setInterval(() => setIdx(i => (i + 1) % n), 4000)
        return () => clearInterval(id)
    }, [paused, n])

    const goSlide = (i: number) => setIdx((i + n) % n)

    return (
        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
            style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', width: `${n * 100}%`, transform: `translateX(-${idx * (100 / n)}%)`, transition: 'transform 680ms cubic-bezier(0.4,0,0.2,1)' }}>
                {HERO_SLIDES.map(s => (
                    <div key={s.id} style={{ width: `${100 / n}%`, flexShrink: 0 }}>
                        <div style={{ position: 'relative', background: s.grad, overflow: 'hidden' }}>
                            {/* Textura de puntos */}
                            <div style={{ position: 'absolute', inset: 0, opacity: 0.40, backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)', backgroundSize: '22px 22px', maskImage: 'linear-gradient(to right, transparent, black 60%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 60%)' }} />
                            <div style={{ position: 'absolute', top: -80, right: '30%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', filter: 'blur(70px)' }} />

                            <div className="sf-hero-grid" style={{ minHeight: 440, paddingTop: 48, paddingBottom: 48 }}>
                                {/* Texto */}
                                <div>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 26, padding: '0 12px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16 }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.accent, animation: 'sfDotPulse 2s infinite' }} />
                                        {s.eyebrow}
                                    </div>
                                    <h1 style={{ fontSize: 'clamp(30px, 3.6vw, 50px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.0, color: '#fff', whiteSpace: 'pre-line', margin: 0 }}>{s.titulo}</h1>
                                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.84)', lineHeight: 1.6, marginTop: 14, maxWidth: 380 }}>{s.sub}</p>
                                    <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
                                        <button onClick={() => go('/catalogo')} style={{ height: 46, padding: '0 22px', borderRadius: 10, background: '#fff', color: '#0F172A', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, boxShadow: '0 8px 22px rgba(0,0,0,0.22)' }}>
                                            {s.cta} <ArrowRight size={15} />
                                        </button>
                                        <button onClick={() => go('/catalogo')} style={{ height: 46, padding: '0 18px', borderRadius: 10, background: 'rgba(255,255,255,0.10)', border: '1.5px solid rgba(255,255,255,0.28)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                                            {s.cta2}
                                        </button>
                                    </div>
                                </div>

                                {/* Card producto — se oculta en tablet */}
                                <div className="sf-hero-card" style={{ position: 'relative' }}>
                                    <div onClick={() => go('/producto/p4')} style={{ borderRadius: 16, overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 20px 56px rgba(0,0,0,0.28)' }}>
                                        <ProdImage hue={s.hue} height={260} radius={0} />
                                        <div style={{ padding: 15, background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(18px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.prod}</div>
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 3 }}>
                                                    <span style={{ fontSize: 15, fontWeight: 800, color: s.accent, fontFamily: '"Geist Mono", monospace' }}>{fmt(s.precio)}</span>
                                                    {s.precioAnt && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textDecoration: 'line-through', fontFamily: '"Geist Mono", monospace' }}>{fmt(s.precioAnt)}</span>}
                                                </div>
                                            </div>
                                            <button onClick={e => { e.stopPropagation(); go('/carrito') }} style={{ width: 36, height: 36, borderRadius: 9, background: '#fff', color: '#0F172A', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    {s.precioAnt && (
                                        <div style={{ position: 'absolute', top: -10, left: -12, height: 24, padding: '0 10px', borderRadius: 999, background: 'linear-gradient(135deg,#F59E0B,#EF4444)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', display: 'inline-flex', alignItems: 'center', boxShadow: '0 4px 10px rgba(239,68,68,0.35)' }}>⭐ OFERTA</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Flechas */}
            <button onClick={() => goSlide(idx - 1)} aria-label="Anterior" style={arrowStyle('left')}><ChevronLeft size={19} /></button>
            <button onClick={() => goSlide(idx + 1)} aria-label="Siguiente" style={arrowStyle('right')}><ChevronRight size={19} /></button>

            {/* Dots */}
            <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 3, display: 'flex', gap: 6 }}>
                {HERO_SLIDES.map((_, i) => (
                    <button key={i} onClick={() => goSlide(i)} aria-label={`Slide ${i + 1}`}
                        style={{ height: 7, width: i === idx ? 22 : 7, borderRadius: 999, border: 'none', cursor: 'pointer', background: i === idx ? '#fff' : 'rgba(255,255,255,0.42)', transition: 'width 280ms ease', padding: 0 }} />
                ))}
            </div>
        </div>
    )
}

function arrowStyle(side: 'left' | 'right'): React.CSSProperties {
    return {
        position: 'absolute', [side]: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 3,
        width: 38, height: 38, borderRadius: '50%',
        background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.24)', backdropFilter: 'blur(8px)',
        color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer',
    }
}

// ─── Carrusel de categorías (marquee automático si > 4 items) ─────────────────

const CAT_MIN_MARQUEE = 4

function CatPill({ c, go }: { c: typeof CATS_CARRUSEL[number]; go: (p: string) => void }) {
    return (
        <button
            onClick={() => go(`/catalogo/${c.id}`)}
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 9, height: 50, padding: '0 14px 0 7px', cursor: 'pointer', borderRadius: 999, border: '1px solid var(--color-border)', background: 'var(--color-bg)', transition: 'border-color 150ms' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
        >
            <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: `radial-gradient(circle at 35% 30%, oklch(0.86 0.07 ${c.hue}), oklch(0.74 0.08 ${c.hue}))`, display: 'grid', placeItems: 'center', fontSize: 16 }}>{c.emoji}</span>
            <span style={{ textAlign: 'left' }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2 }}>{c.nombre}</span>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--color-muted)', marginTop: 1, fontFamily: '"Geist Mono", monospace' }}>{c.count} productos</span>
            </span>
        </button>
    )
}

function CategoriaCarrusel({ go }: { go: (p: string) => void }) {
    const cats = CATS_CARRUSEL
    const isMarquee = cats.length > CAT_MIN_MARQUEE

    return (
        <div style={{ paddingTop: 24, paddingBottom: 28 }}>
            <div className="sf-w" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 10 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Comprá por categoría</h2>
                <button onClick={() => go('/catalogo')} style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>Ver todas →</button>
            </div>

            {isMarquee ? (
                /* ── Marquee automático ── */
                <div className="sf-marquee-wrap" style={{ paddingLeft: 0 }}>
                    <div className="sf-marquee-track">
                        {/* Duplicamos para el loop infinito */}
                        {[...cats, ...cats].map((c, i) => (
                            <CatPill key={`${c.id}-${i}`} c={c} go={go} />
                        ))}
                    </div>
                </div>
            ) : (
                /* ── Scroll estático si ≤ 4 ── */
                <div className="sf-w">
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {cats.map(c => <CatPill key={c.id} c={c} go={go} />)}
                    </div>
                </div>
            )}
        </div>
    )
}

