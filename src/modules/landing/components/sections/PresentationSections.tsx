import { useEffect, useRef } from 'react';
import { RubrosCarousel } from './RubrosCarousel';
import { Testimonials }   from './Testimonials';
import { Upcoming }       from './Upcoming';

const SLIDES = [
  { C: RubrosCarousel, id: 'rubros'       },
  { C: Testimonials,   id: 'testimonios'  },
  { C: Upcoming,       id: 'proximamente' },
];

declare global {
  interface Window { __orbitaRetract?: number; }
}

export function PresentationSections() {
  const firstRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    let smooth = 0;

    const tick = () => {
      const el = firstRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        let target = 0;
        if (rect.top <= 0 && rect.bottom >= vh) target = 1;
        else if (rect.top > 0 && rect.top < vh) target = 1 - rect.top / vh;
        else if (rect.bottom > 0 && rect.bottom < vh) target = rect.bottom / vh;
        smooth += (target - smooth) * 0.06;
        window.__orbitaRetract = smooth;
      }
      raf = requestAnimationFrame(tick);
    };

    tick();
    return () => { cancelAnimationFrame(raf); window.__orbitaRetract = 0; };
  }, []);

  return (
    <>
      {SLIDES.map(({ C, id }, i) => (
        <div key={id} id={id} ref={i === 0 ? firstRef : null} className="slide-container" style={{ zIndex: 11 + i }}>
          <div className="sticky-slide"><C /></div>
        </div>
      ))}
    </>
  );
}
