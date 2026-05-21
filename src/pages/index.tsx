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
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </ThemeProvider>
  );
}
