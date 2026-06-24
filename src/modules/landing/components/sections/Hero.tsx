import { useState, useEffect, useRef } from 'react';
import { OrbitSystem } from '@/modules/landing/components/orbit/OrbitSystem';
import { useTheme } from '@/modules/landing/context/ThemeContext';

const AVATARS = ['MC', 'LR', 'SP', 'DR', 'VM'];

const STARS = Array.from({ length: 80 }, (_, i) => {
  const x = (i * 197 + 440) % 1600;
  const y = (i * 313 + 151) % 1000;
  return `${x}px ${y}px #fff`;
}).join(', ');

const PILLS = [
  { label: 'Turnos online',  icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></> },
  { label: 'Tienda propia',  icon: <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></> },
  { label: 'Analytics',      icon: <><path d="M3 3v18h18"/><path d="m7 14 4-4 4 4 5-5"/></> },
  { label: 'Multi-canal',    icon: <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></> },
  { label: 'Sin comisiones', icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></> },
];

export function Hero() {
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);
  const starsRef = useRef<HTMLDivElement>(null);
  const glowRef  = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const scroll = { target: 0, current: 0 };
    let raf: number;
    const onScroll = () => { scroll.target = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    const tick = () => {
      scroll.current += (scroll.target - scroll.current) * 0.09;
      const y = scroll.current;
      const w = window.innerWidth;
      if (starsRef.current) starsRef.current.style.transform = `translateY(${y * 0.06}px)`;
      if (glowRef.current)  glowRef.current.style.transform  = `translate(-50%, calc(-50% - ${y * 0.10}px))`;
      if (orbitRef.current) {
        if (w >= 1024) {
          orbitRef.current.style.left      = '72%';
          orbitRef.current.style.transform = `translate(-50%, calc(-50% - ${y * 0.20}px))`;
          orbitRef.current.style.opacity   = '1';
        } else {
          orbitRef.current.style.left      = '50%';
          orbitRef.current.style.transform = `translate(-50%, calc(-50% - ${y * 0.06}px)) scale(0.50)`;
          orbitRef.current.style.opacity   = '0.22';
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="hero-height relative w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden dark:block hidden">
        <div ref={starsRef} className="absolute animate-twinkle opacity-40" style={{ inset: '-100px', boxShadow: STARS }} />
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div ref={glowRef} className="absolute rounded-full pointer-events-none"
          style={{ top: '50%', left: '72%', transform: 'translate(-50%, -50%)', width: 1000, height: 1000, background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(100px)', opacity: isDark ? 0.12 : 0.20 }}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-[3] block lg:hidden"
        style={{ background: `linear-gradient(to bottom, transparent, ${isDark ? '#020617' : '#eef4ff'})` }} />

      <div ref={orbitRef} className="absolute z-[2] pointer-events-none hidden md:block"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', transformStyle: 'preserve-3d', perspective: '3000px' }}
      >
        <OrbitSystem />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-center lg:justify-start">
          <div className="w-full lg:flex-1 lg:max-w-[560px] flex flex-col items-center lg:items-start text-center lg:text-left">

            <h1 className="font-black leading-[0.93] tracking-[-0.04em] mb-6 lg:mb-8"
              style={{ fontSize: 'clamp(44px, 10vw, 96px)', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 1.2s ease, transform 1.2s ease', transitionDelay: '0.3s' }}
            >
              <span className="dark:text-white block" style={{ color: '#0f172a' }}>Tu negocio,</span>
              <span className="block" style={{ color: '#2563eb' }}>en órbita.</span>
            </h1>

            <p className="dark:text-slate-400 leading-relaxed mb-6 lg:mb-10 max-w-[480px]"
              style={{ fontSize: 'clamp(16px, 4vw, 22px)', color: '#334155', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 1.2s ease, transform 1.2s ease', transitionDelay: '0.5s' }}
            >
              Gestioná turnos, vendé online y entendé tu negocio con una sola plataforma integral. Sin comisiones, sin complicaciones.
            </p>

            <div className="flex flex-wrap gap-2 mb-6 lg:mb-10 justify-center lg:justify-start"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 1s ease, transform 1s ease', transitionDelay: '0.7s' }}
            >
              {PILLS.map(({ label, icon }) => (
                <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold dark:bg-white/5 dark:border-white/10 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:text-white transition-colors"
                  style={{ background: '#fff', border: '1px solid #cbd5e1', color: '#334155' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#3b82f6'; (e.currentTarget as HTMLElement).style.color = '#1d4ed8' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1'; (e.currentTarget as HTMLElement).style.color = '#334155' }}
                >
                  <svg className="w-3 h-3" style={{ color: '#3b82f6' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                  {label}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-5 justify-center lg:justify-start"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 1.2s ease, transform 1.2s ease', transitionDelay: '0.9s' }}
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {AVATARS.map((a, i) => (
                    <div key={a} className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', border: `2px solid ${isDark ? '#020617' : '#ffffff'}`, zIndex: 5 - i }}
                    >{a}</div>
                  ))}
                </div>
                <div>
                  <div className="dark:text-white text-sm font-bold" style={{ color: '#0f172a' }}>+2.847 negocios</div>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ))}
                    <span className="text-xs ml-1 dark:text-slate-400" style={{ color: '#475569' }}>4.9</span>
                  </div>
                </div>
              </div>

              <div style={{ width: 1, height: 28, background: 'rgba(100,116,139,0.25)' }} />

              <div className="flex items-center gap-1.5 text-sm font-semibold dark:text-slate-400" style={{ color: '#334155' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Sin comisiones
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold dark:text-slate-400" style={{ color: '#334155' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Gratis para empezar
              </div>
            </div>
          </div>
          <div className="flex-1 hidden lg:block" />
        </div>
      </div>
    </section>
  );
}
