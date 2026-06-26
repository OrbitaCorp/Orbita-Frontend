import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ThemeProvider }        from '@/modules/landing/context/ThemeContext';
import { Navbar }               from '@/modules/landing/components/layout/Navbar';
import { Footer }               from '@/modules/landing/components/layout/Footer';
import { Hero }                 from '@/modules/landing/components/sections/Hero';
import { ScrollSequence }       from '@/modules/landing/components/sections/ScrollSequence';
import { PresentationSections } from '@/modules/landing/components/sections/PresentationSections';
import { SectionDivider }       from '@/modules/landing/components/ui/SectionDivider';
import { ScrollToTop }          from '@/modules/landing/components/ui/ScrollToTop';

export default function HomePage() {
  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: 'ease-out-cubic', offset: 60 });
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Hero />
          <ScrollSequence />
          <SectionDivider variant="wide" />
          <PresentationSections />

          {/* CTA final — fuera del sticky wrapper para que nunca quede recortado */}
          <div className="max-w-5xl mx-auto px-6 pb-20 pt-4">
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 sm:p-12 text-center">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, white 0%, transparent 60%)' }} />
              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">Tu negocio merece estar en órbita.</h3>
                <p className="text-blue-100 text-base mb-8 max-w-sm mx-auto">Configurá tu espacio en minutos y empezá a gestionar turnos, ventas y clientes desde un solo lugar.</p>
                <a href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-blue-600 font-bold text-sm hover:bg-blue-50 transition-all shadow-lg shadow-black/10">
                  Crear tu espacio
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </ThemeProvider>
  );
}
