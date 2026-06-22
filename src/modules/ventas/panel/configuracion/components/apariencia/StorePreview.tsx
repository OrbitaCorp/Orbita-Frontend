// Vista previa en vivo del storefront — refleja la configuración de apariencia
// en tiempo real. Modo `scaled` (panel lateral con chrome de navegador) o
// `full` (modal de pantalla completa).

import { ExternalLink } from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { fontStack, RADII, type Apariencia } from '../../mock/apariencia.mock'

const PRODS = [
    { n: 'Remera oversize', p: '$24.900', old: null,      hue: 220, badge: 'Nuevo'  as string | null, r: '4.9' },
    { n: 'Pantalón cargo',  p: '$48.900', old: '$62.000', hue: 140, badge: 'Oferta' as string | null, r: '4.7' },
    { n: 'Buzo capucha',    p: '$38.500', old: null,      hue: 35,  badge: null,                      r: '4.8' },
]

interface StorePreviewProps {
    ap:    Apariencia
    full?: boolean
}

export function StorePreview({ ap, full }: StorePreviewProps) {
    const { isDark } = useDarkMode()
    const dk = ap.modoColor === 'oscuro' || (ap.modoColor === 'sistema' && isDark)

    const c = dk
        ? { bg: '#0F172A', surf: '#1E293B', border: '#334155', text: '#F1F5F9', muted: '#94A3B8' }
        : { bg: ap.colorFondo === 'custom' ? '#F8FAFC' : ap.colorFondo, surf: '#FFFFFF', border: '#E2E8F0', text: '#0F172A', muted: '#64748B' }

    const prim = ap.colorPrimario
    const rad = RADII[ap.radioCards] ?? 12
    const ff = fontStack(ap.fuenteBody)
    const fh = fontStack(ap.fuenteHeading)
    const fs = ap.escalaFuente === 'sm' ? 0.92 : ap.escalaFuente === 'lg' ? 1.08 : 1
    const gridCols = ap.layoutGrid === 'list' ? 1 : 3

    const inner = (
        <div style={{ background: c.bg, fontFamily: ff, color: c.text, position: 'relative', minHeight: full ? 'auto' : 520 }}>
            <style>{ap.cssCustom}</style>

            {/* Header */}
            <div style={{ height: 48, borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', justifyContent: ap.layoutHeader === 'centered' ? 'center' : 'flex-start', background: c.surf }}>
                {ap.logo
                    ? <img src={ap.logo} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                    : <div style={{ width: 26, height: 26, borderRadius: '50%', background: `linear-gradient(135deg,${prim},${prim}cc)`, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700 }}>{ap.nombreTienda.split(' ').slice(0, 2).map(w => w[0]).join('')}</div>}
                <span style={{ fontSize: 14 * fs, fontWeight: 700, fontFamily: fh, flex: ap.layoutHeader === 'centered' ? 'none' : 1 }}>{ap.nombreTienda}</span>
                {ap.layoutHeader === 'standard' && ap.mostrarBuscador && (
                    <div style={{ width: 120, height: 26, borderRadius: 9999, background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: 10, color: c.muted }}>Buscar…</div>
                )}
                <div style={{ display: 'flex', gap: 8, color: c.muted }}><span style={{ fontSize: 13 }}>♡</span><span style={{ fontSize: 13 }}>🛍</span></div>
            </div>

            {/* Hero */}
            <div style={{ padding: '24px 16px', background: ap.bannerHero ? `url(${ap.bannerHero}) center/cover` : `linear-gradient(160deg, ${prim}1f, ${c.bg})`, position: 'relative' }}>
                {ap.bannerHero && <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.35)' }} />}
                <div style={{ position: 'relative' }}>
                    <div style={{ fontSize: 9 * fs, fontWeight: 700, letterSpacing: '0.08em', color: ap.bannerHero ? '#fff' : prim, textTransform: 'uppercase', marginBottom: 8 }}>Nueva colección</div>
                    <div style={{ fontSize: 22 * fs, fontWeight: 800, lineHeight: 1.15, fontFamily: fh, color: ap.bannerHero ? '#fff' : c.text, marginBottom: 6, maxWidth: 240 }}>{ap.tagline}</div>
                    <button style={{ height: 32, padding: '0 16px', borderRadius: Math.min(rad, 10), border: 'none', background: prim, color: '#fff', fontSize: 12 * fs, fontWeight: 600, fontFamily: ff }}>{ap.textoCTA}</button>
                </div>
            </div>

            {/* Categorías */}
            {ap.mostrarCategorias && (
                <div style={{ display: 'flex', gap: 6, padding: '12px 16px', overflowX: 'hidden' }}>
                    {['Todos', 'Remeras', 'Pantalones', 'Buzos'].map((cat, i) => (
                        <span key={cat} style={{ height: 24, padding: '0 12px', borderRadius: 9999, background: i === 0 ? prim : c.surf, color: i === 0 ? '#fff' : c.muted, border: i === 0 ? 'none' : `1px solid ${c.border}`, fontSize: 11 * fs, fontWeight: 500, display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>{cat}</span>
                    ))}
                </div>
            )}

            {/* Grilla de productos */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols},1fr)`, gap: 10, padding: '4px 16px 16px' }}>
                {PRODS.slice(0, ap.layoutGrid === 'list' ? 2 : 3).map((p, i) => (
                    <div key={i} style={{ background: c.surf, border: `1px solid ${c.border}`, borderRadius: rad, overflow: 'hidden', display: ap.layoutGrid === 'list' ? 'flex' : 'block', gap: 10 }}>
                        <div style={{ height: ap.layoutGrid === 'list' ? 64 : 80, width: ap.layoutGrid === 'list' ? 64 : 'auto', flexShrink: 0, position: 'relative', background: `repeating-linear-gradient(135deg, oklch(${dk ? 0.34 : 0.86} 0.06 ${p.hue}) 0 8px, oklch(${dk ? 0.30 : 0.82} 0.06 ${p.hue}) 8px 16px)` }}>
                            {p.badge && ((p.badge === 'Nuevo' && ap.mostrarBadgeNuevo) || (p.badge === 'Oferta' && ap.mostrarBadgeOferta)) && (
                                <span style={{ position: 'absolute', top: 5, left: 5, height: 16, padding: '0 6px', borderRadius: 9999, fontSize: 8, fontWeight: 700, display: 'inline-flex', alignItems: 'center', background: p.badge === 'Nuevo' ? '#ECFDF5' : '#FEF2F2', color: p.badge === 'Nuevo' ? '#047857' : '#B91C1C' }}>{p.badge}</span>
                            )}
                        </div>
                        <div style={{ padding: '8px 10px', flex: 1, minWidth: 0 }}>
                            {ap.mostrarRating && <div style={{ fontSize: 9 * fs, color: c.muted, marginBottom: 3, fontFamily: '"Geist Mono", monospace' }}>★ {p.r}</div>}
                            <div style={{ fontSize: 11 * fs, fontWeight: 600, color: c.text, fontFamily: fh, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.n}</div>
                            <div style={{ display: 'flex', gap: 5, alignItems: 'baseline', marginTop: 3 }}>
                                <span style={{ fontSize: 12 * fs, fontWeight: 700, color: c.text, fontFamily: '"Geist Mono", monospace' }}>{p.p}</span>
                                {p.old && <span style={{ fontSize: 9 * fs, color: c.muted, textDecoration: 'line-through', fontFamily: '"Geist Mono", monospace' }}>{p.old}</span>}
                            </div>
                            <button style={{ marginTop: 6, width: '100%', height: 24, borderRadius: Math.min(rad, 8), border: 'none', background: prim, color: '#fff', fontSize: 10 * fs, fontWeight: 600, fontFamily: ff }}>{ap.textoCTA}</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            {ap.mostrarFooter && (
                <div style={{ borderTop: `1px solid ${c.border}`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: c.surf }}>
                    <span style={{ fontSize: 10, color: c.muted, fontFamily: fh }}>{ap.nombreTienda}</span>
                    <div style={{ display: 'flex', gap: 10, fontSize: 9, color: c.muted }}><span>Inicio</span><span>Catálogo</span></div>
                </div>
            )}

            {/* WhatsApp flotante */}
            {ap.mostrarWhatsapp && (
                <div style={{ position: 'absolute', bottom: 12, right: 12, height: 30, padding: '0 12px', borderRadius: 9999, background: '#10B981', color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center' }}>{ap.textoWhatsapp}</div>
            )}
        </div>
    )

    if (full) {
        return <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${c.border}` }}>{inner}</div>
    }

    // Wrapper con chrome de navegador, escalado
    return (
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: '0 8px 32px rgba(15,23,42,0.12)', background: 'var(--color-bg)' }}>
            <div style={{ height: 34, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
                <div style={{ display: 'flex', gap: 5 }}>{['#EF4444', '#F59E0B', '#10B981'].map(cc => <span key={cc} style={{ width: 9, height: 9, borderRadius: '50%', background: cc }} />)}</div>
                <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: 'var(--color-muted)', fontFamily: '"Geist Mono", monospace' }}>rama.orbita.shop</div>
                <ExternalLink size={12} strokeWidth={1.6} style={{ color: 'var(--color-muted)' }} />
            </div>
            <div style={{ height: 520 * 0.86, overflow: 'hidden' }}>
                <div style={{ width: `${100 / 0.86}%`, transform: 'scale(0.86)', transformOrigin: 'top left' }}>{inner}</div>
            </div>
            <div style={{ padding: '10px 14px', fontSize: 11, color: 'var(--color-muted)', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} /> Vista previa · actualiza en tiempo real
            </div>
        </div>
    )
}
