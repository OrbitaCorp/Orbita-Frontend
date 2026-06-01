// ─── Orbita primitives ────────────────────────────────────────────────────────
// Cosmetic recreations of the design-system components, faithful to the codebase.
// Button · Badge · Input · Card · Toast · Avatar

function Button({ variant = 'primary', size = 'md', icon, loading, disabled, children, style, ...props }) {
  const variants = {
    primary:   { background: 'var(--color-primary)',     color: '#fff',                border: 'none' },
    secondary: { background: 'var(--color-surface-alt)',  color: 'var(--color-text)',   border: 'none' },
    ghost:     { background: 'transparent',               color: 'var(--color-body)',   border: 'none' },
    danger:    { background: 'var(--color-error)',        color: '#fff',                border: 'none' },
    outline:   { background: 'transparent',               color: 'var(--color-primary)', border: '1px solid var(--color-primary)' },
  };
  const sizes = {
    sm: { height: 32, padding: '0 12px', fontSize: 13 },
    md: { height: 40, padding: '0 16px', fontSize: 14 },
    lg: { height: 48, padding: '0 24px', fontSize: 15, fontWeight: 600 },
  };
  const isDisabled = disabled || loading;
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  let bg = variants[variant].background;
  if (variant === 'primary') {
    if (press) bg = 'var(--color-primary-700, #1D4ED8)';
    else if (hover) bg = 'var(--color-primary-h)';
  } else if ((variant === 'ghost' || variant === 'secondary') && hover) {
    bg = 'var(--color-surface-alt)';
  } else if (variant === 'outline' && hover) {
    bg = 'var(--color-primary-bg)';
  }
  return (
    <button
      disabled={isDisabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        borderRadius: 8, fontFamily: 'inherit', fontWeight: 500, whiteSpace: 'nowrap',
        cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.5 : 1,
        transition: 'background 150ms ease, opacity 150ms ease',
        ...variants[variant], ...sizes[size], background: isDisabled ? variants[variant].background : bg, ...style,
      }}
      {...props}
    >
      {loading ? <Icon name="loader-2" size={15} style={{ animation: 'orbita-spin 1s linear infinite' }} /> : (icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />)}
      {children}
    </button>
  );
}

const BADGE = {
  pendiente:  { label: 'Pendiente',  dot: '#F59E0B', bg: '#FFFBEB', fg: '#B45309' },
  confirmado: { label: 'Confirmado', dot: '#10B981', bg: '#ECFDF5', fg: '#065F46' },
  cancelado:  { label: 'Cancelado',  dot: '#EF4444', bg: '#FEF2F2', fg: '#991B1B' },
  completado: { label: 'Completado', dot: '#3B82F6', bg: '#EFF6FF', fg: '#1E40AF' },
  'en-proceso': { label: 'En proceso', dot: '#8B5CF6', bg: '#F5F3FF', fg: '#5B21B6' },
  enviado:    { label: 'Enviado',    dot: '#3B82F6', bg: '#EFF6FF', fg: '#1E40AF' },
  preparacion:{ label: 'En prep.',   dot: '#8B5CF6', bg: '#F5F3FF', fg: '#5B21B6' },
  entregado:  { label: 'Entregado',  dot: '#10B981', bg: '#ECFDF5', fg: '#065F46' },
  abierta:    { label: 'Abierta',    dot: '#10B981', bg: '#ECFDF5', fg: '#065F46' },
  cerrada:    { label: 'Cerrada',    dot: '#64748B', bg: '#F1F5F9', fg: '#475569' },
};

function Badge({ status, label, size = 'md', dot = true }) {
  const c = BADGE[status] || BADGE.pendiente;
  const h = size === 'sm' ? 20 : 24, px = size === 'sm' ? 8 : 10, fs = size === 'sm' ? 11 : 12;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: h, padding: `0 ${px}px`,
      borderRadius: 9999, background: c.bg, color: c.fg, fontSize: fs, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />}
      {label ?? c.label}
    </span>
  );
}

function Input({ label, error, prefix, trailing, mono, focusable = true, style, ...props }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-body)' }}>{label}</label>}
      <div style={{ display: 'flex', alignItems: 'center', height: 40, padding: '0 12px', gap: 6,
        background: props.disabled ? 'var(--color-surface-alt)' : 'var(--color-surface)',
        border: `1px solid ${error ? 'var(--color-error)' : focus ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 8, opacity: props.disabled ? 0.55 : 1,
        boxShadow: focus && !error ? '0 0 0 3px rgba(59,130,246,.12)' : 'none',
        transition: 'border-color 150ms ease, box-shadow 150ms ease' }}>
        {prefix && <span style={{ color: 'var(--color-muted)', fontSize: 14, fontFamily: mono ? 'var(--font-mono)' : 'inherit', flexShrink: 0 }}>{prefix}</span>}
        <input {...props}
          onFocus={() => focusable && setFocus(true)} onBlur={() => setFocus(false)}
          style={{ flex: 1, height: '100%', border: 'none', outline: 'none', background: 'transparent',
            fontSize: 14, color: 'var(--color-text)', fontFamily: mono ? 'var(--font-mono)' : 'inherit', ...style }} />
        {trailing && <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{trailing}</span>}
      </div>
      {error && <span style={{ fontSize: 12, color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon name="alert-circle" size={12} />{error}</span>}
    </div>
  );
}

function Card({ children, hoverable, padding = 'md', onClick, style }) {
  const [hover, setHover] = React.useState(false);
  const pad = { sm: 16, md: 24, lg: 32 }[padding];
  return (
    <div onClick={onClick}
      onMouseEnter={() => hoverable && setHover(true)} onMouseLeave={() => hoverable && setHover(false)}
      style={{ background: 'var(--color-surface)', border: `1px solid ${hover ? 'var(--color-border-strong)' : 'var(--color-border)'}`,
        borderRadius: 12, padding: pad,
        boxShadow: hover ? 'var(--shadow-card)' : 'var(--shadow-sm)',
        transform: hover ? 'translateY(-1px)' : 'none',
        transition: 'box-shadow 200ms ease, border-color 150ms ease, transform 200ms ease',
        cursor: onClick ? 'pointer' : 'default', ...style }}>
      {children}
    </div>
  );
}

const TOAST = {
  success: { color: 'var(--color-success)', bg: 'rgba(16,185,129,.1)', icon: 'check-circle' },
  error:   { color: 'var(--color-error)',   bg: 'rgba(239,68,68,.1)',  icon: 'x-circle' },
  warning: { color: 'var(--color-warning)', bg: 'rgba(245,158,11,.1)', icon: 'alert-triangle' },
  info:    { color: 'var(--color-primary)', bg: 'rgba(59,130,246,.1)', icon: 'info' },
};

function Toast({ variant = 'success', title, description, onClose }) {
  const m = TOAST[variant];
  return (
    <div role="alert" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
      background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderLeft: `3px solid ${m.color}`,
      borderRadius: 10, boxShadow: 'var(--shadow-card)', minWidth: 300, maxWidth: 380,
      animation: 'toastIn 300ms cubic-bezier(0.34,1.56,0.64,1)' }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: m.bg, color: m.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Icon name={m.icon} size={16} strokeWidth={1.8} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: description ? 2 : 0 }}>{title}</div>
        {description && <div style={{ fontSize: 12, color: 'var(--color-body)', lineHeight: 1.45 }}>{description}</div>}
      </div>
      {onClose && <button onClick={onClose} aria-label="Cerrar" style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="x" size={12} strokeWidth={1.8} /></button>}
    </div>
  );
}

function Avatar({ name, size = 28 }) {
  const hue = name.trim().split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `oklch(0.88 0.08 ${hue})`,
      color: `oklch(0.35 0.12 ${hue})`, display: 'grid', placeItems: 'center', fontSize: size * 0.42, fontWeight: 700, flexShrink: 0 }}>
      {name.trim()[0].toUpperCase()}
    </div>
  );
}

Object.assign(window, { Button, Badge, Input, Card, Toast, Avatar, BADGE });
