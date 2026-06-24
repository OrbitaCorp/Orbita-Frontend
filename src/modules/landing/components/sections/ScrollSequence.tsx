import { useEffect, useRef, type ReactNode } from 'react';
import { LiveChatCard }    from '@/modules/landing/components/cards/LiveChatCard';
import { UnifiedPanelCard } from '@/modules/landing/components/cards/UnifiedPanelCard';
import { CalendarCard }    from '@/modules/landing/components/cards/CalendarCard';
import { StoreCard }       from '@/modules/landing/components/cards/StoreCard';
import { DashboardCard }   from '@/modules/landing/components/cards/DashboardCard';
import { SectionDivider }  from '@/modules/landing/components/ui/SectionDivider';

type BadgeVariant = 'red' | 'green' | 'blue';

function Badge({ children, icon, variant = 'blue' }: { children: ReactNode; icon?: ReactNode; variant?: BadgeVariant }) {
  const cls: Record<BadgeVariant, string> = {
    red:   'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/25 text-red-700 dark:text-red-400',
    green: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500',
    blue:  'bg-blue-500/10 border-blue-500/25 text-blue-600 dark:text-blue-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border mb-6 ${cls[variant]}`}>
      {icon}
      {children}
    </span>
  );
}

function Check({ color = 'var(--orbita-bright)' }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function Cross() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}

interface StepItem { icon: ReactNode; text: string; }
interface Step {
  id: string;
  badge: ReactNode;
  title: ReactNode;
  desc: string;
  items: StepItem[];
  Card: React.ComponentType;
  cardWrap: boolean;
  cardFirst: boolean;
}

const STEPS: Step[] = [
  {
    id: 'step-problem',
    badge: <Badge variant="red">Antes de Órbita</Badge>,
    title: <>Tu negocio está <br/><span className="text-red-700 dark:text-red-400">fragmentado.</span></>,
    desc: 'Pedidos por WhatsApp, catálogo en Instagram, stock en Excel... información desconectada que te quita tiempo y dinero.',
    items: [
      { icon: <Cross />, text: 'Información duplicada en todas partes' },
      { icon: <Cross />, text: 'Carga manual lenta y propensa a errores' },
      { icon: <Cross />, text: '48 mensajes sin responder a la vez' },
    ],
    Card: LiveChatCard,
    cardWrap: true,
    cardFirst: false,
  },
  {
    id: 'step-solution',
    badge: <Badge variant="green">La solución</Badge>,
    title: <>Una sola plataforma. <br/><span className="text-blue-600 dark:text-blue-400">Todo conectado.</span></>,
    desc: 'Órbita reemplaza todas esas apps sueltas. Tus turnos, ventas, pedidos y clientes, sincronizados en tiempo real.',
    items: [
      { icon: <Check color="#10b981" />, text: 'Panel único de gestión centralizado' },
      { icon: <Check color="#10b981" />, text: 'Sincronización automática en tiempo real' },
    ],
    Card: UnifiedPanelCard,
    cardWrap: true,
    cardFirst: false,
  },
  {
    id: 'step-turnos',
    badge: <Badge variant="blue" icon={<svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}>Módulo · Turnos</Badge>,
    title: <>Agenda online. <br/><span className="text-blue-600 dark:text-blue-400">Sin WhatsApps.</span></>,
    desc: 'Tus clientes reservan turno desde tu link. Vos recibís la confirmación y ellos el recordatorio automático.',
    items: [
      { icon: <Check color="#60a5fa" />, text: 'Calendario visual con reservas en tiempo real' },
      { icon: <Check color="#60a5fa" />, text: 'Recordatorios automáticos por WhatsApp' },
    ],
    Card: CalendarCard,
    cardWrap: true,
    cardFirst: true,
  },
  {
    id: 'step-tienda',
    badge: <Badge variant="blue" icon={<svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}>Módulo · Tienda</Badge>,
    title: <>Tu tienda, <br/><span className="text-blue-600 dark:text-blue-400">abierta 24/7.</span></>,
    desc: 'Cargá tus productos y compartí el link. Tus clientes navegan, buscan y te hacen el pedido directo. Sin comisiones.',
    items: [
      { icon: <Check color="#60a5fa" />, text: 'Catálogo con fotos, precios y variantes' },
      { icon: <Check color="#60a5fa" />, text: 'Link propio para compartir en redes sociales' },
    ],
    Card: StoreCard,
    cardWrap: true,
    cardFirst: false,
  },
  {
    id: 'step-dash',
    badge: <Badge variant="green" icon={<svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}>Resultados</Badge>,
    title: <>Un negocio organizado <br/><span className="text-emerald-600 dark:text-emerald-500">crece más rápido.</span></>,
    desc: 'Cuando todo está en un solo lugar, tomás mejores decisiones. Sabés cuánto vendiste y qué funciona más.',
    items: [
      { icon: <Check color="#10b981" />, text: 'Dashboard con métricas en tiempo real' },
      { icon: <Check color="#10b981" />, text: 'Historial completo de cada cliente' },
    ],
    Card: DashboardCard,
    cardWrap: true,
    cardFirst: true,
  },
];

export function ScrollSequence() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const stateRef      = useRef({ progress: 0, gatherProgress: 0, heroScroll: 0, trailAlpha: 1.0, opacity: 0.55 });
  const animFrameRef  = useRef<number>(0);
  const mouseRef      = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove);

    const state = stateRef.current;

    let mobileScrolling = false;
    let mobileScrollTimer: ReturnType<typeof setTimeout> | null = null;

    const onScroll = () => {
      if (window.innerWidth < 768) {
        mobileScrolling = true;
        if (mobileScrollTimer) clearTimeout(mobileScrollTimer);
        mobileScrollTimer = setTimeout(() => { mobileScrolling = false; }, 120);
      }
      state.heroScroll = Math.min(1, window.scrollY / window.innerHeight);

      const fill  = document.querySelector<HTMLElement>('.progress-fill');
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (fill && total > 0) fill.style.height = `${(window.scrollY / total) * 100}%`;

      const el = containerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const containerH = el.offsetHeight;
        const scrolled = -rect.top;
        const range = containerH - vh;
        if (range > 0) {
          state.progress = Math.max(0, Math.min(1, scrolled / range));
        }
        const visibleRatio = Math.max(0, Math.min(1, (vh - rect.top) / vh));
        const isMobile = window.innerWidth < 1024;
        state.opacity = (isMobile ? 0.95 : 0.55) + visibleRatio * 0.40;
        state.trailAlpha = 1.0 - state.progress * 0.88;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let width = 0, height = 0;

    class Particle {
      startX = 0; startY = 0;
      nx = 0; ny = 0;
      size = 1;
      color = '#60a5fa'; lightColor = '#1d4ed8';
      orbitAngle = 0; orbitDist = 300; orbitSpeed = 0.001;
      pulsePhase = 0;
      gDelay = 0; gDur = 0.5;
      vortexRadius = 50; vortexAngle = 0; vortexSpeed = 0.01;
      colorMobileDark = ''; colorMobileLight = '';
      x = 0; y = 0;

      constructor() { this.init(); }

      init() {
        this.startX = Math.random() * width;
        this.startY = Math.random() * height;
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 36;
        this.nx = r * Math.cos(a);
        this.ny = r * Math.sin(a);
        this.size = Math.random() * 2.2 + 0.4;
        const darkCols  = ['#60a5fa', '#3b82f6', '#93c5fd', '#bfdbfe', '#e0e7ff'];
        const lightCols = ['#1d4ed8', '#2563eb', '#3b82f6', '#1e40af', '#4f46e5'];
        const idx = Math.floor(Math.random() * darkCols.length);
        this.color      = darkCols[idx];
        this.lightColor = lightCols[idx];
        this.orbitAngle   = Math.random() * Math.PI * 2;
        this.orbitDist    = Math.random() * 800 + 120;
        this.orbitSpeed   = 0.0006 + Math.random() * 0.0010;
        this.pulsePhase   = Math.random() * Math.PI * 2;
        this.gDelay = Math.random() * 0.40;
        this.gDur   = 0.28 + Math.random() * 0.34;
        this.vortexRadius = 14 + Math.random() * 82;
        this.vortexAngle  = Math.random() * Math.PI * 2;
        this.vortexSpeed  = (0.007 + Math.random() * 0.005) / (0.6 + this.vortexRadius * 0.016);
        if (width < 768) {
          const alpha = (0.32 + (this.vortexRadius / 96) * 0.68).toFixed(2);
          const darkRgb:  [number,number,number][] = [[96,165,250],[59,130,246],[147,197,253],[191,219,254],[224,231,255]];
          const lightRgb: [number,number,number][] = [[29,78,216],[37,99,235],[59,130,246],[30,64,175],[79,70,229]];
          const [dr,dg,db] = darkRgb[idx];
          const [lr,lg,lb] = lightRgb[idx];
          this.colorMobileDark  = `rgba(${dr},${dg},${db},${alpha})`;
          this.colorMobileLight = `rgba(${lr},${lg},${lb},${alpha})`;
          this.size = 0.4 + (1 - this.vortexRadius / 96) * 1.8;
        }
        this.x = this.startX;
        this.y = this.startY;
      }

      update(prog: number, gp: number, t: number, nucleusRetract = 0) {
        if (width < 768) {
          this.vortexAngle += this.vortexSpeed;
          const cx = width * 0.5;
          const cy = height * 0.40 - window.scrollY;
          const nr = this.vortexRadius / 96;
          const funnelY = 16 * Math.pow(1 - nr, 2);
          const yScale  = 0.35 + (1 - nr) * 0.20;
          this.x = cx + Math.cos(this.vortexAngle) * this.vortexRadius;
          this.y = (cy + funnelY) + Math.sin(this.vortexAngle) * this.vortexRadius * yScale;
          return;
        }
        this.orbitAngle += this.orbitSpeed;
        const oe_raw = prog < 0.5 ? 2*prog*prog : 1 - Math.pow(-2*prog+2,2)/2;
        const oe = oe_raw * (1 - nucleusRetract);
        const oe_cx = oe_raw + nucleusRetract * (1 - oe_raw);

        const isMobile = width < 1024;
        const startX = isMobile ? width * 0.5 : width * 0.72;
        const startY = isMobile ? height * 0.34 : height * 0.5;
        const targetY = isMobile ? height * 0.42 : height * 0.5;
        const cx = startX + (width * 0.5 - startX) * oe_cx;
        const cy = startY + (targetY - startY) * oe_cx;
        const localGP = Math.max(0, Math.min(1, (gp - this.gDelay) / this.gDur));
        const ge = localGP < 0.5 ? 2*localGP*localGP : 1 - Math.pow(-2*localGP+2,2)/2;
        const breatheAmt = ge * (1 - oe);
        const breathe = Math.sin(t * 0.0007 + this.pulsePhase) * breatheAmt * 7;
        const nfx = cx + this.nx + breathe * 0.5;
        const nfy = cy + this.ny + breathe * 0.5;
        const gx = this.startX * (1 - ge) + nfx * ge;
        const gy = this.startY * (1 - ge) + nfy * ge;
        const ripple = (1 - oe) * Math.sin(t * 0.0018 + this.pulsePhase * 2) * 0.12;
        const pulsedDist = this.orbitDist * (1 + ripple);
        const ox = cx + Math.cos(this.orbitAngle) * pulsedDist;
        const oy = cy + Math.sin(this.orbitAngle) * pulsedDist * 0.72;
        this.x = gx * (1 - oe) + ox * oe;
        this.y = gy * (1 - oe) + oy * oe;
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const dx = this.x - mx;
        const dy = this.y - my;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 120 && d > 0) {
          const f = (120 - d) / 120;
          this.x += (dx / d) * f * 5;
          this.y += (dy / d) * f * 5;
        }
      }

      draw(isLight: boolean) {
        ctx.fillStyle = width < 768
          ? (isLight ? this.colorMobileLight : this.colorMobileDark)
          : (isLight ? this.lightColor : this.color);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    let particles: Particle[] = [];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const count = width < 768 ? 55 : 300;
      particles = Array.from({ length: count }, () => new Particle());
    };
    window.addEventListener('resize', resize);
    resize();

    const GATHER_DURATION = 4200;
    let startTime: number | null = null;

    const animate = (t = 0) => {
      if (startTime === null) startTime = t;

      if (width < 768) {
        canvas.style.opacity = '0';
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const naturalGP = Math.min(1, (t - startTime) / GATHER_DURATION);
      const heroBreak     = Math.pow(state.heroScroll, 0.6);
      const effectiveProg = Math.max(state.progress, heroBreak);
      const forcedGP = effectiveProg > 0.01 ? Math.min(1, effectiveProg * 6) : 0;
      state.gatherProgress = Math.max(naturalGP, forcedGP);
      const gp = state.gatherProgress;

      const nucleusRetract = window.__orbitaRetract || 0;

      canvas.style.opacity = String(state.opacity);

      const orbitTrail   = 0.18 + (1 - state.progress) * 0.75;
      const dynamicTrail = effectiveProg > 0.04
        ? Math.min(orbitTrail, state.trailAlpha)
        : 0.05 + gp * 0.95;
      const effectiveTrail = dynamicTrail + nucleusRetract * (0.88 - dynamicTrail);
      const isLight = document.documentElement.classList.contains('light');
      ctx.fillStyle = isLight
        ? `rgba(238,244,255,${effectiveTrail})`
        : `rgba(2,6,23,${effectiveTrail})`;
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => { p.update(effectiveProg, gp, t, nucleusRetract); p.draw(isLight); });
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} id="main-canvas" />
      <div className="progress-bar"><div className="progress-fill" /></div>

      <div ref={containerRef} id="modulos" className="relative z-10">
        {STEPS.map((step, i) => (
          <div key={step.id}>
            {i > 0 && <SectionDivider variant="subtle" />}

            <section id={step.id} className="py-12 lg:py-16">
              <div className="w-full max-w-[1340px] mx-auto px-6 md:px-10 lg:px-16">
                <div className={`flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16
                  ${step.cardFirst ? 'lg:flex-row-reverse' : ''}`}
                >
                  <div
                    className="flex-shrink-0 w-full lg:w-[45%] lg:max-w-[520px]"
                    data-aos="fade-up"
                    data-aos-delay={i === 0 ? '0' : '100'}
                  >
                    {step.badge}
                    <h2 className="text-4xl lg:text-5xl font-black leading-[1.05] tracking-tight mb-5 text-slate-900 dark:text-white">
                      {step.title}
                    </h2>
                    <p className="text-base dark:text-slate-400 leading-relaxed mb-6" style={{ color: '#334155' }}>
                      {step.desc}
                    </p>
                    <ul className="space-y-3">
                      {step.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {item.icon}
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className="w-full lg:w-[45%] flex items-center justify-center"
                    data-aos="fade-up"
                    data-aos-delay="200"
                  >
                    <div className={`origin-center scale-[0.7] sm:scale-90 lg:scale-100 ${!step.cardWrap ? 'w-full min-w-[320px] lg:min-w-[420px]' : ''}`}>
                      {step.cardWrap
                        ? <div className="relative flex justify-center"><step.Card /></div>
                        : <step.Card />
                      }
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ))}
      </div>
    </>
  );
}
