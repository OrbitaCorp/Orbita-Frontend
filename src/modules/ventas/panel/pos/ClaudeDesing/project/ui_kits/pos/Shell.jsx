// ─── Shell ────────────────────────────────────────────────────────────────────
// AdminLayout: 240px sidebar + 64px sticky header + content area.
// Recreated from layouts/components/{Sidebar,Header}.tsx.

// Cashier role: reduced nav — only POS-adjacent sections are enabled.
const NAV = [
  { label: 'POS',        icon: 'credit-card',  seccion: 'pos' },
  { label: 'Pedidos',    icon: 'shopping-bag', seccion: 'pedidos' },
  { label: 'Inventario', icon: 'truck',        seccion: 'inventario' },
];
const CUENTA = [
  { label: 'Configuración', icon: 'settings',     seccion: 'configuracion' },
  { label: 'Soporte',       icon: 'help-circle',  seccion: 'soporte' },
];

function NavItem({ item, active, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px',
        marginBottom: 2, borderRadius: 6, fontSize: 14, fontWeight: active ? 500 : 400, textAlign: 'left',
        fontFamily: 'inherit', cursor: 'pointer', border: 'none',
        color: active ? 'var(--color-primary-h)' : 'var(--color-body)',
        background: active ? 'var(--color-primary-bg)' : hover ? 'var(--color-surface-alt)' : 'transparent',
        borderLeft: `3px solid ${active ? 'var(--color-primary)' : 'transparent'}`,
        transition: 'background 150ms ease' }}>
      <Icon name={item.icon} size={18} />
      {item.label}
    </button>
  );
}

function Sidebar({ active, onNavigate }) {
  return (
    <aside style={{ display: 'flex', flexDirection: 'column', width: 240, flexShrink: 0, height: '100%',
      background: 'var(--color-bg)', borderRight: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 64, padding: '0 20px', flexShrink: 0, borderBottom: '1px solid var(--color-border)' }}>
        <img src="../../assets/logo.svg" alt="Orbita" width={28} height={28} />
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)' }}>Orbita</span>
      </div>

      <div style={{ margin: '12px 12px 8px' }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: 8, borderRadius: 8,
          background: 'var(--color-surface)', border: '1px solid var(--color-border)', cursor: 'pointer', fontFamily: 'inherit' }}>
          <div style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 6, fontSize: 11, fontWeight: 600,
            background: 'var(--color-text)', color: 'var(--color-bg)', flexShrink: 0 }}>RT</div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>Rama Tienda</div>
            <div style={{ fontSize: 12, color: 'var(--color-subtle)' }}>Plan Negocio</div>
          </div>
          <Icon name="chevron-down" size={14} color="var(--color-subtle)" />
        </button>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 600, padding: '8px 12px 4px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-subtle)' }}>Gestión</div>
        {NAV.map(it => <NavItem key={it.seccion} item={it} active={active === it.seccion} onClick={() => onNavigate(it.seccion)} />)}
        <div style={{ fontSize: 11, fontWeight: 600, padding: '16px 12px 4px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-subtle)' }}>Cuenta</div>
        {CUENTA.map(it => <NavItem key={it.seccion} item={it} active={active === it.seccion} onClick={() => onNavigate(it.seccion)} />)}
      </nav>
    </aside>
  );
}

function Header({ titulo, isDark, onToggleDark }) {
  const [menu, setMenu] = React.useState(false);
  const iconBtn = { display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 8,
    background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-body)', cursor: 'pointer' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: 64, padding: '0 24px', flexShrink: 0,
      background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
        <span style={{ color: 'var(--color-muted)', textTransform: 'capitalize' }}>ventas</span>
        <span style={{ color: 'var(--color-muted)' }}>›</span>
        <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{titulo}</span>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-subtle)' }}><Icon name="search" size={16} /></span>
          <input placeholder="Buscar en Orbita..." style={{ height: 36, width: 240, padding: '0 12px 0 34px', fontSize: 14, borderRadius: 8,
            outline: 'none', background: 'var(--color-surface)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)', fontFamily: 'inherit' }} />
        </div>
        <button onClick={onToggleDark} style={iconBtn} aria-label="Tema"><Icon name={isDark ? 'sun' : 'moon'} size={18} /></button>
        <button style={iconBtn} aria-label="Notificaciones"><Icon name="bell" size={18} /></button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setMenu(m => !m)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8,
            background: menu ? 'var(--color-surface-alt)' : 'transparent', border: '1px solid transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
            <div style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', fontSize: 12, fontWeight: 600, background: 'var(--color-primary)', color: '#fff' }}>AM</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1, marginBottom: 2, color: 'var(--color-text)' }}>Alan</div>
              <div style={{ fontSize: 12, lineHeight: 1, color: 'var(--color-muted)' }}>Cajero</div>
            </div>
            <Icon name="chevron-down" size={14} color="var(--color-subtle)" />
          </button>
          {menu && (
            <div style={{ position: 'absolute', right: 0, marginTop: 4, width: 208, borderRadius: 12, overflow: 'hidden', zIndex: 50,
              background: 'var(--color-bg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-pop)' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Alan</div>
                <div style={{ fontSize: 12, marginTop: 2, color: 'var(--color-muted)' }}>alan@orbita.com</div>
              </div>
              <div style={{ padding: 4 }}>
                <MenuRow icon="user" label="Mi perfil" />
              </div>
              <div style={{ padding: 4, borderTop: '1px solid var(--color-border)' }}>
                <MenuRow icon="log-out" label="Cerrar sesión" danger />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuRow({ icon, label, danger }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 8,
        fontSize: 14, textAlign: 'left', cursor: 'pointer', border: 'none', fontFamily: 'inherit',
        color: danger ? 'var(--color-error)' : 'var(--color-body)',
        background: hover ? (danger ? 'var(--color-error-bg)' : 'var(--color-surface-alt)') : 'transparent' }}>
      <Icon name={icon} size={16} />{label}
    </button>
  );
}

function Shell({ active, onNavigate, titulo, isDark, onToggleDark, children }) {
  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', background: 'var(--color-surface)' }}>
      <Sidebar active={active} onNavigate={onNavigate} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header titulo={titulo} isDark={isDark} onToggleDark={onToggleDark} />
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

Object.assign(window, { Shell });
