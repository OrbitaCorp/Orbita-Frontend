import { useState, useEffect, type ReactNode } from 'react';

function useCounter(target: number, duration = 1800, delay = 400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [target, duration, delay]);
  return val;
}

function Sparkline({ data, color = '#3b82f6', height = 28 }: { data: number[]; color?: string; height?: number }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1, w = 100;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(' ');
  const [lx, ly] = points.split(' ').pop()!.split(',');
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full overflow-visible" style={{ height }} preserveAspectRatio="none">
      <defs><linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.25"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <polygon points={`0,${height} ${points} ${w},${height}`} fill="url(#sparkFill)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="2.5" fill={color} className="animate-pulse" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    </svg>
  );
}

function NotifToast({ icon, text, accent, delay }: { icon: ReactNode; text: string; accent: string; delay: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), delay);
    const t2 = setTimeout(() => setShow(false), delay + 4000);
    const id = setInterval(() => { setShow(true); setTimeout(() => setShow(false), 4000); }, 8000 + delay);
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(id); };
  }, [delay]);
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 shadow-lg"
      style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.95)', transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}
    >
      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${accent}18`, color: accent }}>{icon}</div>
      <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{text}</span>
    </div>
  );
}

export function UnifiedPanelCard() {
  const v0 = useCounter(84500, 2000, 300);
  const t0 = useCounter(23, 1400, 600);
  const c0 = useCounter(147, 1600, 500);

  const [ventas,   setVentas]   = useState(0);
  const [turnos,   setTurnos]   = useState(0);
  const [clientes, setClientes] = useState(0);
  const [sparkData, setSparkData] = useState([12,19,14,25,22,30,28,35,32,42,38,48]);
  const [feed, setFeed] = useState([
    { id:1, color:'#10b981', bg:'rgba(16,185,129,0.1)', icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,      text:'Laura M. reservó turno',     time:'Hace 2 min',  active: true  },
    { id:2, color:'#3b82f6', bg:'rgba(59,130,246,0.1)', icon: <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></>, text:'Venta #1041 completada',       time:'Hace 8 min',  active: false },
    { id:3, color:'#8b5cf6', bg:'rgba(139,92,246,0.1)', icon: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,        text:'Nuevo cliente registrado',   time:'Hace 15 min', active: false },
  ]);

  useEffect(() => { setVentas(v0); }, [v0]);
  useEffect(() => { setTurnos(t0); }, [t0]);
  useEffect(() => { setClientes(c0); }, [c0]);

  useEffect(() => {
    const id = setInterval(() => {
      setSparkData(prev => { const n = [...prev.slice(1)]; const l = n[n.length - 1]; n.push(Math.max(15, Math.min(55, l + (Math.random() - 0.5) * 18))); return n; });
      if (Math.random() > 0.4) setVentas(v => v + Math.floor(Math.random() * 1200));
      if (Math.random() > 0.7) setTurnos(t => t + 1);
      if (Math.random() > 0.8) setClientes(c => c + 1);
      setFeed(prev => {
        const items = prev.map(i => ({ ...i, active: false }));
        const ai = prev.findIndex(i => i.active);
        items[(ai + items.length - 1) % items.length].active = true;
        return items;
      });
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-[370px] select-none">
      <div className="absolute -top-3 -right-6 z-20 flex flex-col gap-2">
        <NotifToast delay={800} accent="#10b981" icon={<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>} text="Nuevo turno confirmado" />
        <NotifToast delay={2200} accent="#3b82f6" icon={<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>} text="Pedido #1042 recibido" />
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400"/><span className="w-2.5 h-2.5 rounded-full bg-amber-400"/><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"/></div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 ml-2">Panel Unificado</span>
          </div>
          <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/><span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">En vivo</span></div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-white/5">
          {[
            { label:'Ventas hoy', value:`$${ventas.toLocaleString('es-AR')}`, trend:'+18%', up: true },
            { label:'Turnos hoy', value:turnos, trend:`${turnos}/28`, up: null },
            { label:'Clientes',   value:clientes, trend:'+12', up: true },
          ].map(kpi => (
            <div key={kpi.label} className="px-4 py-3.5 text-center">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">{kpi.label}</div>
              <div className="text-lg font-black text-slate-900 dark:text-white leading-none mb-1">{kpi.value}</div>
              <span className={`text-[10px] font-bold ${kpi.up === true ? 'text-emerald-500' : kpi.up === false ? 'text-red-500' : 'text-blue-500'}`}>{kpi.up === true && '↑ '}{kpi.trend}</span>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Ingresos · Últimos 12 días</span>
            <span className="text-[10px] font-bold text-emerald-500">+32%</span>
          </div>
          <Sparkline data={sparkData} color="#3b82f6" height={36} />
        </div>

        <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2.5">Actividad reciente</div>
          <div className="space-y-2.5">
            {feed.map(item => (
              <div key={item.id} className={`flex items-center gap-2.5 transition-all duration-500 ${item.active ? 'opacity-100 translate-x-1' : 'opacity-50'}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500 ${item.active ? 'scale-110 shadow-sm' : 'scale-100'}`} style={{ background: item.bg }}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[11px] font-semibold transition-colors duration-500 ${item.active ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'} truncate`}>{item.text}</div>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500">{item.time}</div>
                </div>
                {item.active && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 animate-pulse" />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 px-5 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
          {[
            { label:'Turnos',   color:'#10b981', icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></> },
            { label:'Tienda',   color:'#3b82f6', icon: <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></> },
            { label:'Clientes', color:'#8b5cf6', icon: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
            { label:'Analytics',color:'#f59e0b', icon: <><path d="M3 3v18h18"/><path d="m7 14 4-4 4 4 5-5"/></> },
          ].map(mod => (
            <div key={mod.label} className="flex flex-col items-center gap-1 group cursor-default">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background:`${mod.color}15`, border:`1px solid ${mod.color}30` }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={mod.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{mod.icon}</svg>
              </div>
              <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{mod.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
