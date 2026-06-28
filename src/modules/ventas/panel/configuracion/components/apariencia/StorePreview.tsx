// Vista previa en vivo del storefront — fiel al home real de la tienda.
// Modo `scaled` (panel lateral, chrome de navegador) o `full` (modal pantalla completa).

import { ExternalLink } from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { fontStack, RADII, type Apariencia } from '../../mock/apariencia.mock'

const PRODS = [
    { n: 'Remera oversize', p: '$24.900', old: null,      hue: 220, badge: 'Nuevo'  as string | null, r: 4.9 },
    { n: 'Pantalón cargo',  p: '$48.900', old: '$62.000', hue: 140, badge: 'Oferta' as string | null, r: 4.7 },
    { n: 'Buzo capucha',    p: '$38.500', old: null,      hue: 35,  badge: null,                      r: 4.8 },
    { n: 'Campera bomber',  p: '$89.000', old: '$110.000',hue: 30,  badge: 'Oferta' as string | null, r: 4.5 },
]

const CATS = ['Todos', 'Remeras', 'Pantalones', 'Buzos', 'Camperas']

const NAV_LABELS: Record<string, string[]> = {
    standard: ['Catálogo'],
    full:     ['Catálogo', 'Ofertas', 'Novedades', '+ vendidos'],
    minimal:  [],
    centered: ['Catálogo', 'Ofertas', 'Novedades'],
}

interface StorePreviewProps { ap: Apariencia; full?: boolean }

export function StorePreview({ ap, full }: StorePreviewProps) {
    const { isDark } = useDarkMode()
    const dk   = ap.modoColor === 'oscuro' || (ap.modoColor === 'sistema' && isDark)
    const prim = ap.colorPrimario
    const rad  = RADII[ap.radioCards] ?? 12
    const ff   = fontStack(ap.fuenteBody)
    const fh   = fontStack(ap.fuenteHeading)
    const fs   = ap.escalaFuente === 'sm' ? 0.92 : ap.escalaFuente === 'lg' ? 1.08 : 1
    const gridCols = ap.layoutGrid === '4col' ? 4 : ap.layoutGrid === 'list' ? 1 : 3

    const c = dk
        ? { bg: '#0F172A', surf: '#1E293B', border: '#334155', text: '#F1F5F9', muted: '#94A3B8', subtle: '#64748B' }
        : { bg: ap.colorFondo === 'custom' ? '#F8FAFC' : ap.colorFondo, surf: '#FFFFFF', border: '#E2E8F0', text: '#0F172A', muted: '#64748B', subtle: '#94A3B8' }

    const navLinks = NAV_LABELS[ap.layoutHeader] ?? []
    const isCentered = ap.layoutHeader === 'centered'
    const isMinimal  = ap.layoutHeader === 'minimal'

    const slide = ap.sliders[0]
    const heroGrad = slide?.img
        ? `url(${slide.img}) center/cover`
        : `linear-gradient(120deg, #0F172A 0%, ${prim}66 55%, ${prim} 100%)`

    const inner = (
        <div style={{ background: c.bg, fontFamily: ff, color: c.text, minHeight: full ? 'auto' : 620 }}>

            {/* ── Announcement bar ── */}
            <div style={{ height: 28, background: prim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 10 * fs, fontWeight: 600, color: '#fff', letterSpacing: '0.04em' }}>Envío gratis desde $30.000 · Nuevos ingresos</span>
            </div>

            {/* ── Header ── */}
            <div style={{ height: 52, background: c.surf, borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8, position: 'relative' }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0, ...(isCentered ? { position: 'absolute', left: '50%', transform: 'translateX(-50%)' } : {}) }}>
                    {ap.logo
                        ? <img src={ap.logo} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: 22, height: 22, borderRadius: 7, background: `linear-gradient(135deg, #1D4ED8, ${prim})`, display: 'grid', placeItems: 'center' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} /></div>}
                    <span style={{ fontSize: 12 * fs, fontWeight: 700, fontFamily: fh, color: c.text }}>{ap.nombreTienda}</span>
                </div>

                {/* Nav */}
                {!isMinimal && !isCentered && navLinks.length > 0 && (
                    <div style={{ display: 'flex', gap: 0, flex: 1, overflowX: 'hidden' }}>
                        {navLinks.map(l => (
                            <span key={l} style={{ fontSize: 11 * fs, fontWeight: 500, color: c.muted, padding: '2px 10px', whiteSpace: 'nowrap' }}>{l}</span>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 4, marginLeft: 'auto', alignItems: 'center' }}>
                    {ap.mostrarBuscador && !isMinimal && (
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: c.bg, border: `1px solid ${c.border}`, display: 'grid', placeItems: 'center' }}>
                            <span style={{ fontSize: 10, color: c.muted }}>🔍</span>
                        </div>
                    )}
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: c.bg, border: `1px solid ${c.border}`, display: 'grid', placeItems: 'center', position: 'relative' }}>
                        <span style={{ fontSize: 10, color: c.muted }}>🛍</span>
                        <span style={{ position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: '50%', background: prim, color: '#fff', fontSize: 5, display: 'grid', placeItems: 'center', fontWeight: 700 }}>2</span>
                    </div>
                    <div style={{ height: 24, padding: '0 8px', borderRadius: 6, background: prim, color: '#fff', fontSize: 10 * fs, fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>Ingresar</div>
                </div>
            </div>

            {/* ── Nav row centrado (solo si layout=centered) ── */}
            {isCentered && (
                <div style={{ background: c.surf, borderBottom: `1px solid ${c.border}`, padding: '0 14px', display: 'flex', justifyContent: 'center', gap: 4 }}>
                    {navLinks.map(l => (
                        <span key={l} style={{ fontSize: 10 * fs, fontWeight: 500, color: c.muted, padding: '7px 10px', whiteSpace: 'nowrap' }}>{l}</span>
                    ))}
                </div>
            )}

            {/* ── Hero carousel ── */}
            <div style={{ position: 'relative', background: heroGrad, overflow: 'hidden' }}>
                {slide?.img && <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.42)' }} />}
                {/* Dot pattern */}
                {!slide?.img && <div style={{ position: 'absolute', inset: 0, opacity: 0.35, backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />}
                <div style={{ position: 'relative', padding: '28px 18px 24px', minHeight: 148 }}>
                    <div style={{ fontSize: 8 * fs, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>
                        {slide?.subtitulo || 'Colección Otoño · Invierno 2026'}
                    </div>
                    <div style={{ fontSize: 20 * fs, fontWeight: 900, color: '#fff', lineHeight: 1.08, fontFamily: fh, marginBottom: 10, maxWidth: 200, whiteSpace: 'pre-line' }}>
                        {slide?.titulo || ap.tagline}
                    </div>
                    <div style={{ display: 'flex', gap: 7 }}>
                        <button style={{ height: 28, padding: '0 14px', borderRadius: Math.min(rad, 8), background: '#fff', color: '#0F172A', fontSize: 11 * fs, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                            {slide?.cta || ap.textoCTA}
                        </button>
                        <button style={{ height: 28, padding: '0 10px', borderRadius: Math.min(rad, 8), background: 'rgba(255,255,255,0.13)', color: '#fff', fontSize: 10 * fs, fontWeight: 600, border: '1px solid rgba(255,255,255,0.28)', cursor: 'pointer' }}>
                            Ver más
                        </button>
                    </div>
                    {/* Slide dots */}
                    <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
                        {ap.sliders.map((_, i) => (
                            <span key={i} style={{ height: 5, width: i === 0 ? 18 : 5, borderRadius: 999, background: i === 0 ? '#fff' : 'rgba(255,255,255,0.38)', transition: 'width 280ms' }} />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Stats bar ── */}
            <div style={{ background: c.surf, borderBottom: `1px solid ${c.border}`, padding: '7px 14px', display: 'flex', justifyContent: 'center', gap: 20 }}>
                {(['+1.200 ventas', '48 hs envío', '30 días cambio', '3 cuotas s/int.'] as const).map((t, i) => (
                    <span key={i} style={{ fontSize: 8.5 * fs, color: i % 2 === 0 ? prim : c.muted, fontWeight: 700, fontFamily: '"Geist Mono", monospace', whiteSpace: 'nowrap' }}>{t}</span>
                ))}
            </div>

            {/* ── Categorías ── */}
            {ap.mostrarCategorias && (
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${c.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                        <span style={{ fontSize: 11 * fs, fontWeight: 700, color: c.text, fontFamily: fh }}>Comprá por categoría</span>
                        <span style={{ fontSize: 9 * fs, color: prim }}>Ver todas →</span>
                    </div>
                    <div style={{ display: 'flex', gap: 5, overflowX: 'hidden' }}>
                        {CATS.map((cat, i) => (
                            <span key={cat} style={{ height: 22, padding: '0 10px', borderRadius: 9999, background: i === 0 ? prim : c.surf, color: i === 0 ? '#fff' : c.muted, border: i === 0 ? 'none' : `1px solid ${c.border}`, fontSize: 9 * fs, fontWeight: 500, display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>{cat}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Productos: Más vendidos ── */}
            <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F59E0B' }} />
                            <span style={{ fontSize: 8 * fs, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Top ventas</span>
                        </div>
                        <span style={{ fontSize: 13 * fs, fontWeight: 700, fontFamily: fh, color: c.text }}>Más vendidos</span>
                    </div>
                    <span style={{ fontSize: 9 * fs, color: prim }}>Ver todos →</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(gridCols, 4)},1fr)`, gap: 7 }}>
                    {PRODS.slice(0, Math.min(gridCols, 4)).map((p, i) => (
                        <div key={i} style={{ background: c.surf, border: `1px solid ${c.border}`, borderRadius: rad, overflow: 'hidden' }}>
                            <div style={{ height: 64, position: 'relative', background: `repeating-linear-gradient(135deg, oklch(${dk ? 0.34 : 0.86} 0.06 ${p.hue}) 0 8px, oklch(${dk ? 0.30 : 0.82} 0.06 ${p.hue}) 8px 16px)` }}>
                                {p.badge && ((p.badge === 'Nuevo' && ap.mostrarBadgeNuevo) || (p.badge === 'Oferta' && ap.mostrarBadgeOferta)) && (
                                    <span style={{ position: 'absolute', top: 4, left: 4, height: 13, padding: '0 5px', borderRadius: 9999, fontSize: 7, fontWeight: 700, display: 'inline-flex', alignItems: 'center', background: p.badge === 'Nuevo' ? '#ECFDF5' : '#FEF2F2', color: p.badge === 'Nuevo' ? '#047857' : '#B91C1C' }}>{p.badge}</span>
                                )}
                            </div>
                            <div style={{ padding: '5px 7px 7px' }}>
                                {ap.mostrarRating && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2 }}>
                                        <span style={{ fontSize: 8, color: '#F59E0B' }}>★</span>
                                        <span style={{ fontSize: 8 * fs, fontWeight: 600, color: c.text, fontFamily: '"Geist Mono", monospace' }}>{p.r}</span>
                                    </div>
                                )}
                                <div style={{ fontSize: 10 * fs, fontWeight: 600, color: c.text, fontFamily: fh, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.n}</div>
                                <div style={{ display: 'flex', gap: 4, alignItems: 'baseline', marginTop: 2 }}>
                                    <span style={{ fontSize: 10 * fs, fontWeight: 700, color: c.text, fontFamily: '"Geist Mono", monospace' }}>{p.p}</span>
                                    {p.old && <span style={{ fontSize: 8 * fs, color: c.muted, textDecoration: 'line-through', fontFamily: '"Geist Mono", monospace' }}>{p.old}</span>}
                                </div>
                                <button style={{ marginTop: 5, width: '100%', height: 20, borderRadius: Math.min(rad, 5), border: 'none', background: prim, color: '#fff', fontSize: 8 * fs, fontWeight: 600, fontFamily: ff, cursor: 'pointer' }}>{ap.textoCTA}</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Banner WPP ── */}
            {ap.mostrarWhatsapp && (
                <div style={{ margin: '2px 14px 14px', padding: '12px 14px', borderRadius: 10, background: 'linear-gradient(135deg,#064E3B 0%,#065F46 60%,#047857 100%)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(52,211,153,0.18)', border: '1px solid rgba(52,211,153,0.35)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#34D399"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.528 5.845L.057 23.882l6.2-1.624A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-5.007-1.372l-.36-.213-3.681.965.982-3.594-.235-.369A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10 * fs, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>Respondemos en menos de 1 hora</div>
                        <div style={{ fontSize: 9 * fs, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>Lunes a sábado, sin bots</div>
                    </div>
                    <button style={{ height: 24, padding: '0 10px', borderRadius: 6, background: '#25D366', color: '#fff', fontSize: 9 * fs, fontWeight: 700, border: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>{ap.textoWhatsapp}</button>
                </div>
            )}

            {/* ── Footer ── */}
            {ap.mostrarFooter && (
                <div style={{ borderTop: `1px solid ${c.border}`, padding: '12px 14px', background: c.surf, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11 * fs, fontWeight: 700, color: c.text, fontFamily: fh }}>{ap.nombreTienda}</span>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {['Inicio', 'Catálogo', 'Nosotros'].map(l => (
                            <span key={l} style={{ fontSize: 9 * fs, color: c.subtle }}>{l}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )

    if (full) {
        return <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${c.border}` }}>{inner}</div>
    }

    return (
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: '0 8px 32px rgba(15,23,42,0.12)', background: 'var(--color-bg)' }}>
            {/* Chrome de navegador */}
            <div style={{ height: 34, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
                <div style={{ display: 'flex', gap: 5 }}>{['#EF4444', '#F59E0B', '#10B981'].map(cc => <span key={cc} style={{ width: 9, height: 9, borderRadius: '50%', background: cc }} />)}</div>
                <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>rama.orbita.shop</div>
                <ExternalLink size={12} strokeWidth={1.6} style={{ color: 'var(--color-muted)' }} />
            </div>
            {/* Contenido escalado */}
            <div style={{ height: 520 * 0.86, overflow: 'hidden' }}>
                <div style={{ width: `${100 / 0.86}%`, transform: 'scale(0.86)', transformOrigin: 'top left' }}>{inner}</div>
            </div>
            <div style={{ padding: '10px 14px', fontSize: 11, color: 'var(--color-muted)', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} /> Vista previa · actualiza en tiempo real
            </div>
        </div>
    )
}
