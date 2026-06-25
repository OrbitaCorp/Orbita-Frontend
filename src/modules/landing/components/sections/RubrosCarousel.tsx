import { useRef, useEffect, useState } from 'react';
import { useTheme } from '@/modules/landing/context/ThemeContext';

const RUBROS = [
  { img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80', name: 'Pet Shops'    },
  { img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80', name: 'Manicura'     },
  { img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80', name: 'Tienda Online' },
  { img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80', name: 'Barbería'      },
  { img: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&q=80', name: 'Estética'      },
  { img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80', name: 'Gastronomía'   },
  { img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80', name: 'Spa'            },
  { img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80', name: 'Automotriz'   },
  { img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80', name: 'Restaurante'  },
  { img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80', name: 'Gimnasio'     },
];

const N = RUBROS.length;
const CARD_W = 165;
const CARD_H = 225;
const SPEED = 0.0003;
const H_CONTAINER = 540;

export function RubrosCarousel() {
  const { isDark }   = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number>(0);
  const offsetRef    = useRef(0);
  const [contH, setContH] = useState(H_CONTAINER);

  useEffect(() => {
    const onResize = () => setContH(window.innerWidth < 768 ? 380 : H_CONTAINER);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const animate = () => {
      offsetRef.current = (offsetRef.current + SPEED) % 1;
      const container = containerRef.current;
      if (!container) { rafRef.current = requestAnimationFrame(animate); return; }

      const W  = container.offsetWidth;
      const HC = container.offsetHeight;
      const cards = container.querySelectorAll<HTMLElement>('.rubro-card');

      cards.forEach((card, i) => {
        const t       = ((i / N) - offsetRef.current + 1000) % 1;
        const isMob   = window.innerWidth < 768;
        const spread  = isMob ? Math.max(W * 2.5, 900) : W * 1.2;
        const cardH   = isMob ? CARD_H * 0.78 : CARD_H;
        const xPx     = (W / 2) + (t - 0.5) * spread - CARD_W / 2;
        const screenT = (xPx + CARD_W / 2) / W;
        const cT      = Math.max(-0.2, Math.min(1.2, screenT));
        const arc     = Math.max(0, 4 * cT * (1 - cT));
        // Centro arriba (~24px), bordes hacia el medio del contenedor. El rango
        // se acota a la altura real del contenedor para que la card nunca se
        // corte con overflow:hidden.
        const yPx     = 24 + (1 - arc) * Math.max(40, HC - cardH - 70);
        const rot     = (cT - 0.5) * 28;
        const scale   = (isMob ? 0.50 : 0.55) + arc * (isMob ? 0.42 : 0.50);
        const bright  = 0.44 + arc * 0.56;
        const zIdx    = Math.round(5 + arc * 15);
        let opacity   = 1;
        const sPct = screenT * 100;
        if (sPct < -10) opacity = Math.max(0, (sPct + 30) / 20);
        if (sPct > 110) opacity = Math.max(0, (130 - sPct) / 20);

        card.style.transform = `translate(${xPx.toFixed(1)}px,${yPx.toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        card.style.filter    = `brightness(${bright.toFixed(3)})`;
        card.style.zIndex    = String(zIdx);
        card.style.opacity   = opacity.toFixed(3);
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <section className="relative w-full bg-transparent overflow-hidden z-10">
      <div ref={containerRef} className="relative w-full" style={{ height: contH, overflow: 'hidden' }}>
        <div className="absolute inset-y-0 left-0 w-16 md:w-52 z-20 pointer-events-none"
          style={{ background: `linear-gradient(to right, ${isDark ? '#020617' : '#eef4ff'} 10%, transparent)` }} />
        <div className="absolute inset-y-0 right-0 w-16 md:w-52 z-20 pointer-events-none"
          style={{ background: `linear-gradient(to left, ${isDark ? '#020617' : '#eef4ff'} 10%, transparent)` }} />

        {RUBROS.map(r => (
          <div key={r.name} className="rubro-card" style={{
            position: 'absolute', left: 0, top: 0, width: CARD_W, height: CARD_H,
            borderRadius: 18, overflow: 'hidden',
            border: isDark ? '1.5px solid rgba(96,165,250,0.20)' : '1.5px solid rgba(148,163,184,0.30)',
            boxShadow: isDark ? '0 28px 70px -10px rgba(0,0,0,0.75)' : '0 10px 28px -8px rgba(15,23,42,0.22)',
            willChange: 'transform, opacity',
          }}>
            <img src={r.img} alt={r.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: isDark ? 'linear-gradient(to top, rgba(2,6,23,0.93) 0%, rgba(2,6,23,0.15) 45%, transparent 68%)' : 'linear-gradient(to top, rgba(15,23,42,0.78) 0%, rgba(15,23,42,0.12) 32%, transparent 52%)' }} />
            <span style={{ position: 'absolute', bottom: 14, left: 0, width: '100%', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'white', letterSpacing: '0.04em', textShadow: '0 1px 8px rgba(0,0,0,0.85)' }}>
              {r.name}
            </span>
          </div>
        ))}
      </div>

      <div className="relative z-30 mt-4 lg:-mt-8 flex flex-col items-center gap-3 text-center px-6 pb-10 lg:pb-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">Para cualquier rubro</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Adaptable a <span className="text-blue-500">cualquier negocio.</span>
          </h2>
          <p className="mt-4 text-base dark:text-slate-400 max-w-md mx-auto" style={{ color: '#334155' }}>
            Ya sea una peluquería, un restaurante, una tienda o un spa: Órbita se adapta a tu forma de trabajar.
          </p>
        </div>

        <a href="/signup" className="mt-3 inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200">
          Crear tu espacio
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>

        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {RUBROS.map(r => (
            <span key={r.name} className="px-3 py-1.5 rounded-full text-xs font-semibold dark:bg-white/5 dark:border-white/10 dark:text-slate-300" style={{ background: '#fff', border: '1px solid #cbd5e1', color: '#334155' }}>
              {r.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
