// Banner horizontal azul al pie del Dashboard.
// Número grande en caja glassmorphism a la izquierda,
// texto descriptivo al centro, dos CTAs a la derecha.
//
// Usa Button del design system para los botones de acción.

import { useRouter }    from 'next/router'
import { Package, ChevronRight } from 'lucide-react'
import { Button }       from '@/design-system/components/Button'

interface PedidosPendientesBannerProps {
    count:      number
    loading:    boolean
    negocioId:  string
}

export function PedidosPendientesBanner({ count, loading, negocioId }: PedidosPendientesBannerProps) {
    const router = useRouter()

    return (
        <section style={{
            background:   'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
            borderRadius: 14, padding:'24px 28px',
            position:     'relative', overflow:'hidden',
            display:      'flex', alignItems:'center', gap:24, flexWrap:'wrap',
            boxShadow:    '0 8px 24px rgba(59,130,246,0.22)',
            marginTop:    16,
        }}>
            {/* Puntos decorativos — identidad visual de Orbita */}
            <span style={{ position:'absolute', top:18,    right:80,  width:6, height:6, borderRadius:'50%', background:'#fff', opacity:0.30 }} />
            <span style={{ position:'absolute', top:44,    right:30,  width:4, height:4, borderRadius:'50%', background:'#fff', opacity:0.22 }} />
            <span style={{ position:'absolute', bottom:18, right:140, width:5, height:5, borderRadius:'50%', background:'#fff', opacity:0.25 }} />
            <span style={{ position:'absolute', bottom:38, right:60,  width:3, height:3, borderRadius:'50%', background:'#fff', opacity:0.18 }} />

            {/* Número en caja glassmorphism */}
            <div style={{
                width:88, height:88, borderRadius:16,
                background:'rgba(255,255,255,0.14)',
                border:'1px solid rgba(255,255,255,0.18)',
                display:'grid', placeItems:'center', flexShrink:0,
                backdropFilter:'blur(4px)',
            }}>
                <span style={{
                    fontSize:40, fontWeight:700, color:'#fff',
                    fontFamily:'Geist Mono, monospace',
                    letterSpacing:'-0.02em', lineHeight:1,
                }}>
                    {loading ? '··' : count}
                </span>
            </div>

            {/* Texto */}
            <div style={{ flex:1, minWidth:200 }}>
                <div style={{
                    fontSize:11, fontWeight:600,
                    color:'rgba(255,255,255,0.72)',
                    textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6,
                }}>
                    Requieren tu atención
                </div>
                <div style={{ fontSize:20, fontWeight:700, color:'#fff', letterSpacing:'-0.01em', marginBottom:4 }}>
                    {count === 1
                        ? 'Hay un pedido esperando'
                        : `Tenés ${loading ? '—' : count} pedidos esperando`}
                </div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.85)', lineHeight:1.5 }}>
                    Confirmá pagos y movelos a preparación para que tus clientes no esperen de más.
                </div>
            </div>

            {/* CTAs */}
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <Button
                    variant="ghost"
                    size="md"
                    onClick={() => router.push(`/admin/${negocioId}/ventas/cola`)}
                    style={{ border:'1px solid rgba(255,255,255,0.30)', color:'#fff' }}
                >
                    <Package size={14} strokeWidth={1.5} /> Ver cola
                </Button>
                <Button
                    variant="primary"
                    size="md"
                    onClick={() => router.push(`/admin/${negocioId}/ventas/pedidos`)}
                    style={{ background:'#fff', color:'#1D4ED8', boxShadow:'0 2px 6px rgba(15,23,42,0.18)' }}
                >
                    Atender ahora <ChevronRight size={14} strokeWidth={2.5} />
                </Button>
            </div>
        </section>
    )
}