import { useRef, useEffect, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  stars: number; quote: string; name: string; role: string; initials: string;
  gradient: string; iconColor: string; highlight: string; highlightIcon: ReactNode;
}

const TESTIMONIALS: Testimonial[] = [
  { stars: 5, quote: '"Antes tardaba 2 horas por día respondiendo WhatsApps de turnos. Ahora mis clientes reservan solos y yo me concentro en trabajar."', name: 'Martina C.', role: 'Estilista · CABA', initials: 'MC', gradient: 'from-blue-500 to-indigo-600', iconColor: 'text-blue-500', highlight: '2hs ahorradas', highlightIcon: <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { stars: 5, quote: '"La tienda online me permitió vender fuera de mi barrio. Mis ventas crecieron un 40% en el primer mes con el catálogo compartido."', name: 'Lucas R.', role: 'Dueño de tienda · Córdoba', initials: 'LR', gradient: 'from-emerald-500 to-teal-600', iconColor: 'text-emerald-500', highlight: '+40% ventas', highlightIcon: <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg> },
  { stars: 5, quote: '"El dashboard me hizo entender qué días son mejores para promociones. Datos que antes no tenía ni en Excel. Impresionante."', name: 'Sofía P.', role: 'Manicurista · Rosario', initials: 'SP', gradient: 'from-purple-500 to-pink-600', iconColor: 'text-purple-500', highlight: 'Datos claros', highlightIcon: <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17H8v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"/></svg> },
  { stars: 5, quote: '"Me olvidé de los turnos solapados. El calendario visual es súper claro y a los clientes les encanta el recordatorio por WhatsApp."', name: 'Diego F.', role: 'Barbero · Mendoza', initials: 'DF', gradient: 'from-orange-500 to-red-600', iconColor: 'text-orange-500', highlight: 'Cero errores', highlightIcon: <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  { stars: 5, quote: '"Centralizar todo en Órbita me cambió la vida. Pasé de usar 4 aplicaciones distintas a tener todo mi negocio en un solo panel."', name: 'Valeria M.', role: 'Indumentaria · La Plata', initials: 'VM', gradient: 'from-sky-500 to-blue-600', iconColor: 'text-sky-500', highlight: 'Todo en uno', highlightIcon: <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"/><path d="M12 2v20"/><path d="M2 12h20"/></svg> },
];

export function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir === 'left' ? -360 : 360, behavior: 'smooth' });
  };

  useEffect(() => {
    if (hovered) return;
    const id = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 10) scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      else scroll('right');
    }, 3500);
    return () => clearInterval(id);
  }, [hovered]);

  return (
    <section className="relative bg-transparent py-24 z-10 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.05]" aria-hidden>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-blue-400" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-blue-400" />
      </div>

      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-16 px-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/25 text-blue-600 dark:text-blue-400 mb-5">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            Testimonios
          </span>
          <h2 data-aos="fade-up" data-aos-delay="100" className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            Lo que dicen nuestros <span className="text-blue-500">usuarios.</span>
          </h2>
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-white">4.9 / 5</span>
              <span className="text-sm dark:text-slate-400" style={{ color: '#475569' }}>promedio</span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
            <span className="text-sm dark:text-slate-400" style={{ color: '#475569' }}>+2.847 reseñas verificadas</span>
          </div>
        </div>

        <div className="relative group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <button onClick={() => scroll('left')} aria-label="Anterior"
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          ><ChevronLeft size={24} /></button>

          <div ref={scrollRef} className="flex overflow-x-auto gap-6 px-6 md:px-16 pb-12 pt-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)' }}
          >
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} data-aos="fade-up" data-aos-delay={String(i * 100)}
                className="w-[300px] md:w-[360px] flex-shrink-0 snap-center group bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-7 hover:border-blue-400 dark:hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 flex flex-col"
              >
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.stars }).map((_, j) => <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}</div>
                <div className="flex items-center gap-1.5 mb-4">
                  <span className={t.iconColor}>{t.highlightIcon}</span>
                  <span className={`text-xs font-black text-transparent bg-clip-text bg-gradient-to-r ${t.gradient}`}>{t.highlight}</span>
                </div>
                <p className="text-sm dark:text-slate-400 leading-relaxed mb-6 italic flex-1" style={{ color: '#334155' }}>{t.quote}</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>{t.initials}</div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</div>
                    <div className="text-xs mt-0.5 dark:text-slate-400" style={{ color: '#475569' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => scroll('right')} aria-label="Siguiente"
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          ><ChevronRight size={24} /></button>
        </div>
      </div>
    </section>
  );
}
