export type BadgeStatus =
  | 'pendiente'
  | 'confirmado'
  | 'cancelado'
  | 'completado'
  | 'en-proceso'
  | 'enviado';

interface BadgeConfig {
  label: string;
  dot:   string;
  light: { bg: string; fg: string };
  dark:  { bg: string; fg: string };
}

const config: Record<BadgeStatus, BadgeConfig> = {
  pendiente:  { label: 'Pendiente',   dot: '#F59E0B', light: { bg: '#FFFBEB', fg: '#B45309' }, dark: { bg: 'rgba(251,191,36,0.14)',  fg: '#FBBF24' } },
  confirmado: { label: 'Confirmado',  dot: '#10B981', light: { bg: '#ECFDF5', fg: '#065F46' }, dark: { bg: 'rgba(52,211,153,0.12)',  fg: '#34D399' } },
  cancelado:  { label: 'Cancelado',   dot: '#EF4444', light: { bg: '#FEF2F2', fg: '#991B1B' }, dark: { bg: 'rgba(248,113,113,0.12)', fg: '#F87171' } },
  completado: { label: 'Completado',  dot: '#3B82F6', light: { bg: '#EFF6FF', fg: '#1E40AF' }, dark: { bg: 'rgba(96,165,250,0.14)',  fg: '#93C5FD' } },
  'en-proceso': { label: 'En proceso', dot: '#8B5CF6', light: { bg: '#F5F3FF', fg: '#5B21B6' }, dark: { bg: 'rgba(167,139,250,0.14)', fg: '#A78BFA' } },
  enviado:    { label: 'Enviado',     dot: '#3B82F6', light: { bg: '#EFF6FF', fg: '#1E40AF' }, dark: { bg: 'rgba(96,165,250,0.14)',  fg: '#60A5FA' } },
};

interface BadgeProps {
  status:   BadgeStatus;
  dot?:     boolean;
  size?:    'sm' | 'md';
  // Pasá dark=true si el componente padre está en dark mode.
  // Si usás CSS variables de forma global, podés ignorar esta prop.
  dark?:    boolean;
  label?:   string;
}

export function Badge({ status, dot = true, size = 'md', dark = false, label }: BadgeProps) {
  const c    = config[status];
  const mode = dark ? c.dark : c.light;
  const h    = size === 'sm' ? 20 : 24;
  const px   = size === 'sm' ? 8  : 10;
  const fs   = size === 'sm' ? 11 : 12;

  return (
    <span style={{
      display:     'inline-flex',
      alignItems:  'center',
      gap:         6,
      height:      h,
      padding:     `0 ${px}px`,
      borderRadius: 9999,
      background:  mode.bg,
      color:       mode.fg,
      fontSize:    fs,
      fontWeight:  600,
      whiteSpace:  'nowrap',
    }}>
      {dot && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      )}
      {label ?? c.label}
    </span>
  );
}
