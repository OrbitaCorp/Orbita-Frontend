import type { ReactNode } from 'react';
import { useTheme } from '@/modules/landing/context/ThemeContext';

interface SatDef { ring: 1 | 2 | 3; dur: string; anchor: 'left' | 'right'; icon: ReactNode; label: string; }

const SATS: SatDef[] = [
  { ring: 1, dur: '52s', anchor: 'left',  icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,                                             label: 'Turnos'   },
  { ring: 1, dur: '52s', anchor: 'right', icon: <><path d="M3 3h2l2.4 12.6a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 7H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></>, label: 'Ventas'   },
  { ring: 2, dur: '40s', anchor: 'left',  icon: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></>,                       label: 'Pedidos'  },
  { ring: 2, dur: '40s', anchor: 'right', icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></>,                                             label: 'Clientes' },
  { ring: 3, dur: '30s', anchor: 'left',  icon: <><path d="M3 3v18h18"/><path d="m7 14 4-4 4 4 5-5"/></>,                                                                            label: 'Stats'    },
];

const RING_SIZES: Record<number, number> = { 1: 780, 2: 560, 3: 350 };

function Sat({ sat, reverse, isDark }: { sat: SatDef; reverse: boolean; isDark: boolean }) {
  return (
    <div className="sat" style={{
      width: 80, height: 80,
      background: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: isDark ? '1.5px solid rgba(96,165,250,0.18)' : '1.5px solid rgba(59,130,246,0.30)',
      borderRadius: 24,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
      boxShadow: isDark ? '0 15px 40px rgba(0,0,0,0.8), 0 0 25px rgba(59,130,246,0.25)' : '0 8px 32px rgba(59,130,246,0.18)',
      ['--dur' as string]: sat.dur,
      ...(reverse ? { animationDirection: 'reverse' } : {}),
    }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={isDark ? '#60A5FA' : '#2563EB'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ width: 28, height: 28, filter: isDark ? 'drop-shadow(0 0 8px #3b82f6)' : 'none' }}
      >
        {sat.icon}
      </svg>
      <span style={{ fontSize: 13, fontWeight: 800, color: isDark ? '#f8fafc' : '#1e40af', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        {sat.label}
      </span>
    </div>
  );
}

export function OrbitSystem() {
  const { isDark } = useTheme();

  return (
    <div style={{ width: 1050, height: 1050, transformStyle: 'preserve-3d', transform: 'rotateX(32deg) rotateZ(-8deg)' }}>
      {([1, 2, 3] as const).map(ring => {
        const size = RING_SIZES[ring];
        return (
          <div key={ring} style={{
            position: 'absolute', width: size, height: size,
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            border: `1.5px ${ring === 1 ? 'dashed' : 'solid'} ${isDark ? 'rgba(96,165,250,0.12)' : 'rgba(59,130,246,0.20)'}`,
            borderRadius: '50%', transformStyle: 'preserve-3d',
          }}>
            {SATS.filter(s => s.ring === ring).map((s, i) => (
              <div key={i} className="orbit-path"
                style={{ ['--dur' as string]: s.dur, ...(ring === 2 ? { animationDirection: 'reverse' } : {}) }}
              >
                <div style={{ position: 'absolute', top: '50%', [s.anchor === 'right' ? 'right' : 'left']: 0, width: 1, height: 1 }}>
                  <Sat sat={s} reverse={ring === 2} isDark={isDark} />
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
