import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/modules/landing/context/ThemeContext';

interface Props { variant?: 'default' | 'subtle' | 'wide'; }

export function SectionDivider({ variant = 'default' }: Props) {
  const { isDark } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const py = variant === 'wide' ? 'py-20 lg:py-28' : variant === 'subtle' ? 'py-8 lg:py-12' : 'py-12 lg:py-20';

  return (
    <div ref={ref} className={`w-full flex items-center justify-center ${py} relative z-20 pointer-events-none select-none overflow-hidden`} aria-hidden>
      <div className="flex items-center w-full transition-all duration-1000"
        style={{
          maxWidth: variant === 'wide' ? 800 : 520,
          opacity: visible ? 1 : 0,
          transform: visible ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'opacity 1s ease, transform 1.2s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div className="flex-1 h-px" style={{ background: isDark ? 'linear-gradient(to right, transparent 0%, rgba(96,165,250,0.05) 30%, rgba(59,130,246,0.25) 100%)' : 'linear-gradient(to right, transparent 0%, rgba(59,130,246,0.05) 30%, rgba(59,130,246,0.2) 100%)' }} />

        <div className="relative mx-3 flex items-center justify-center" style={{ width: 56, height: 56 }}>
          <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.5s' }}>
            {[0, 1500].map((delay, i) => (
              <div key={i} className="absolute rounded-full" style={{ width: 40, height: 40, border: `1px solid ${isDark ? 'rgba(96,165,250,0.15)' : 'rgba(59,130,246,0.12)'}`, animation: visible ? `sectionPulseRing 3s ease-out infinite ${delay}ms` : 'none' }} />
            ))}
          </div>
          <div className="absolute rounded-[100%]" style={{ width: 48, height: 16, border: `1px solid ${isDark ? 'rgba(96,165,250,0.25)' : 'rgba(59,130,246,0.20)'}`, opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease 0.3s' }} />
          <div className="absolute rounded-full" style={{ width: 20, height: 20, background: isDark ? 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', animation: visible ? 'sectionNucleusPulse 2.5s ease-in-out infinite' : 'none', opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 0.2s' }} />
          <div className="rounded-full" style={{ width: 6, height: 6, background: isDark ? 'linear-gradient(135deg, #3b82f6, #60a5fa)' : 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: isDark ? '0 0 10px rgba(59,130,246,0.6)' : '0 0 8px rgba(59,130,246,0.4)', opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0)', transition: 'opacity 0.4s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)' }} />
        </div>

        <div className="flex-1 h-px" style={{ background: isDark ? 'linear-gradient(to left, transparent 0%, rgba(96,165,250,0.05) 30%, rgba(59,130,246,0.25) 100%)' : 'linear-gradient(to left, transparent 0%, rgba(59,130,246,0.05) 30%, rgba(59,130,246,0.2) 100%)' }} />
      </div>

      <style>{`
        @keyframes sectionPulseRing { 0% { transform:scale(1); opacity:.6; } 100% { transform:scale(2.8); opacity:0; } }
        @keyframes sectionNucleusPulse { 0%,100% { transform:scale(1); opacity:.7; } 50% { transform:scale(1.4); opacity:1; } }
      `}</style>
    </div>
  );
}
