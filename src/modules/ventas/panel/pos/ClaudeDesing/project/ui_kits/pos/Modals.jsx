// ─── Modals: Overlay shell, Cobro, Post-venta, Cliente, Variante ──────────────

function Overlay({ onClose, children, align = 'center' }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,23,42,0.5)',
      backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center',
      justifyContent: align === 'right' ? 'flex-end' : 'center', padding: align === 'right' ? 0 : 24,
      animation: 'fadeIn 200ms ease' }}>
      {children}
    </div>
  );
}

function ModalShell({ title, onClose, children, footer, maxWidth = 480 }) {
  return (
    <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth, background: 'var(--color-bg)',
      border: '1px solid var(--color-border)', borderRadius: 12, boxShadow: 'var(--shadow-modal)', overflow: 'hidden',
      animation: 'modalIn 200ms ease-out', maxHeight: '92%', display: 'flex', flexDirection: 'column' }}>
      {title !== '' && (
        <header style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ flex: 1, fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>{title}</span>
          <button onClick={onClose} aria-label="Cerrar" style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Icon name="x" size={16} strokeWidth={1.8} /></button>
        </header>
      )}
      <div style={{ padding: 16, overflowY: 'auto' }}>{children}</div>
      {footer && <footer style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8, justifyContent: 'flex-end', flexShrink: 0 }}>{footer}</footer>}
    </div>
  );
}

// ── Cobro: 5 métodos + Nº operación + monto recibido + vuelto ──
const METODOS = [
  { id: 'efectivo', label: 'Efectivo',        icon: 'banknote' },
  { id: 'debito',   label: 'Tarjeta débito',  icon: 'credit-card' },
  { id: 'credito',  label: 'Tarjeta crédito', icon: 'credit-card' },
  { id: 'transfer', label: 'Transferencia',   icon: 'arrow-left-right' },
  { id: 'qr',       label: 'QR',              icon: 'qr-code' },
];
const METODO_LABEL = Object.fromEntries(METODOS.map(m => [m.id, m.label]));

function MetodoBtn({ m, on, onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 4, height: 56, padding: '0 12px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
      background: on ? 'var(--color-primary-bg)' : 'var(--color-bg)', color: on ? 'var(--color-primary-h)' : 'var(--color-body)',
      border: `1px solid ${on ? 'var(--color-primary)' : 'var(--color-border)'}` }}>
      <Icon name={m.icon} size={18} /> {m.label}
    </button>
  );
}

function CobroModal({ total, onClose, onConfirm }) {
  const [metodo, setMetodo] = React.useState('efectivo');
  const [recibido, setRecibido] = React.useState('');
  const [ref, setRef] = React.useState('');
  const recNum = parseFloat(recibido.replace(/\./g, '').replace(',', '.')) || 0;
  const vuelto = Math.max(0, recNum - total);
  const falta = Math.max(0, total - recNum);
  const isEfectivo = metodo === 'efectivo';
  const necesitaRef = metodo === 'debito' || metodo === 'credito' || metodo === 'transfer' || metodo === 'qr';
  const puede = isEfectivo ? recNum >= total : true;
  const quick = [...new Set([total, Math.ceil(total / 1000) * 1000, Math.ceil(total / 5000) * 5000, Math.ceil(total / 10000) * 10000])];

  return (
    <Overlay onClose={onClose}>
      <ModalShell title="Cobrar venta" onClose={onClose} maxWidth={480}
        footer={<>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" icon="check" disabled={!puede} onClick={() => onConfirm({ metodo, vuelto: isEfectivo ? vuelto : 0 })}>Confirmar cobro</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Total a cobrar</span>
            <span style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>{fmt(total)}</span>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', marginBottom: 8 }}>Método de pago</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
              {METODOS.slice(0, 3).map(m => <MetodoBtn key={m.id} m={m} on={m.id === metodo} onClick={() => setMetodo(m.id)} />)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {METODOS.slice(3).map(m => <MetodoBtn key={m.id} m={m} on={m.id === metodo} onClick={() => setMetodo(m.id)} />)}
            </div>
            <button style={{ marginTop: 8, fontSize: 12, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>+ Pago mixto</button>
          </div>

          {necesitaRef && (
            <Input label="Nº de operación / referencia (opcional)" mono value={ref} onChange={e => setRef(e.target.value)} placeholder="Ej. 0048-221903" />
          )}

          {isEfectivo && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Input label="Monto recibido" prefix="$" mono inputMode="decimal" value={recibido} onChange={e => setRecibido(e.target.value)} placeholder="0" autoFocus />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={() => setRecibido(fmtPlain(total))} style={{ height: 30, padding: '0 10px', borderRadius: 8, border: '1px solid var(--color-primary)', background: 'var(--color-primary-bg)', color: 'var(--color-primary-h)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>Monto exacto</button>
                {quick.map(v => (
                  <button key={v} onClick={() => setRecibido(fmtPlain(v))} style={{ flex: 1, minWidth: 64, height: 30, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-body)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{fmtPlain(v)}</button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: falta > 0 ? 'var(--color-error-bg)' : 'var(--color-success-bg)', marginTop: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: falta > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>{falta > 0 ? 'Falta' : 'Vuelto'}</span>
                <span style={{ fontSize: 30, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em', color: falta > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>{fmt(falta > 0 ? falta : vuelto)}</span>
              </div>
            </div>
          )}
        </div>
      </ModalShell>
    </Overlay>
  );
}

// ── Post-venta success ──
function PostVentaModal({ total, metodo, vuelto, cliente, comprobante, onNuevo, onDetalle, onClose }) {
  const [copiado, setCopiado] = React.useState(false);
  const acciones = [
    { icon: 'printer', label: 'Imprimir' },
    { icon: 'message-circle', label: 'WhatsApp' },
    { icon: 'mail', label: 'Email' },
    { icon: copiado ? 'check' : 'link', label: copiado ? 'Copiado' : 'Copiar link', onClick: () => { setCopiado(true); setTimeout(() => setCopiado(false), 1500); } },
  ];
  return (
    <Overlay onClose={onClose}>
      <ModalShell title="" onClose={onClose} maxWidth={420}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center', paddingBottom: 4 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'grid', placeItems: 'center', marginBottom: 4 }}>
            <Icon name="check" size={30} strokeWidth={2.2} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>¡Venta registrada!</div>
          <div style={{ fontSize: 12, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Comprobante</div>
          <div style={{ fontSize: 30, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{comprobante}</div>

          <div style={{ width: '100%', marginTop: 8, padding: '12px 14px', borderRadius: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cliente && <SumRow label="Cliente" value={cliente.nombre} mono={false} />}
            <SumRow label="Total cobrado" value={fmt(total)} bold />
            <SumRow label="Método" value={metodo} mono={false} />
            {vuelto > 0 && <SumRow label="Vuelto" value={fmt(vuelto)} color="var(--color-success)" />}
          </div>

          <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 12 }}>
            {acciones.map(a => (
              <button key={a.label} onClick={a.onClick} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 4px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 500, color: 'var(--color-body)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <Icon name={a.icon} size={18} /> {a.label}
              </button>
            ))}
          </div>
          <Button variant="primary" size="lg" icon="plus" onClick={onNuevo} style={{ width: '100%', marginTop: 12 }}>Nuevo ticket</Button>
          <button onClick={onDetalle} style={{ marginTop: 4, fontSize: 13, fontWeight: 500, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Ver detalle</button>
        </div>
      </ModalShell>
    </Overlay>
  );
}

function SumRow({ label, value, bold, color, mono = true }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
      <span style={{ color: 'var(--color-muted)' }}>{label}</span>
      <span style={{ color: color || 'var(--color-text)', fontWeight: bold ? 700 : 500, fontFamily: mono ? 'var(--font-mono)' : 'inherit' }}>{value}</span>
    </div>
  );
}

// ── Asociar / crear cliente ──
function ClienteModal({ onClose, onSelect }) {
  const [modo, setModo] = React.useState('buscar');   // buscar | crear
  const [q, setQ] = React.useState('');
  const [form, setForm] = React.useState({ nombre: '', dni: '', tel: '', email: '' });
  const res = POS_DATA.clientes.filter(c => c.nombre.toLowerCase().includes(q.toLowerCase()) || c.dni.includes(q) || c.tel.includes(q));
  const valido = form.nombre.trim() && form.dni.trim() && form.tel.trim();
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Overlay onClose={onClose}>
      <ModalShell title={modo === 'buscar' ? 'Asociar cliente' : 'Crear cliente'} onClose={onClose} maxWidth={440}
        footer={modo === 'buscar'
          ? <Button variant="outline" icon="user-plus" onClick={() => setModo('crear')}>Crear cliente nuevo</Button>
          : <>
              <Button variant="ghost" onClick={() => setModo('buscar')}>Volver</Button>
              <Button variant="primary" icon="check" disabled={!valido} onClick={() => onSelect({ nombre: form.nombre, dni: form.dni, tel: form.tel, compras: 0 })}>Crear y asociar</Button>
            </>}>
        {modo === 'buscar' ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <Input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por DNI, teléfono o nombre..."
                trailing={<Icon name="search" size={16} color="var(--color-subtle)" />} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {res.map(c => (
                <button key={c.dni} onClick={() => onSelect(c)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-alt)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Avatar name={c.nombre} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>{c.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>DNI {c.dni} · {c.tel}</div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{c.compras} compras</span>
                </button>
              ))}
              {res.length === 0 && <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-muted)', fontSize: 13 }}>No se encontró ningún cliente.</div>}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Nombre completo *" autoFocus value={form.nombre} onChange={set('nombre')} placeholder="Ej. Juan Pérez" />
            <Input label="DNI *" mono value={form.dni} onChange={set('dni')} placeholder="00.000.000" />
            <Input label="Teléfono *" mono value={form.tel} onChange={set('tel')} placeholder="11 0000-0000" />
            <Input label="Email (opcional)" value={form.email} onChange={set('email')} placeholder="cliente@email.com" />
          </div>
        )}
      </ModalShell>
    </Overlay>
  );
}

// ── Selector de variante (talle × color) ──
function VarianteModal({ producto, onClose, onAgregar }) {
  const [talle, setTalle] = React.useState(null);
  const [color, setColor] = React.useState(null);
  const [qty, setQty] = React.useState(1);
  const stockDe = (t, c) => POS_DATA.varianteStock[`${t}-${c}`] || 0;
  const talleTieneStock = (t) => POS_DATA.colores.some(c => stockDe(t, c.id) > 0);
  const stockSel = talle && color ? stockDe(talle, color) : null;
  const listo = talle && color && stockSel > 0;

  return (
    <Overlay onClose={onClose}>
      <ModalShell title="Elegir variante" onClose={onClose} maxWidth={420}
        footer={<>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" icon="plus" disabled={!listo} onClick={() => onAgregar({ ...producto, variante: `Talle ${talle} · ${POS_DATA.colores.find(c => c.id === color).label}`, qty })}>Agregar al ticket</Button>
        </>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 10, background: 'var(--color-surface-alt)', display: 'grid', placeItems: 'center', color: 'var(--color-subtle)' }}><Icon name={producto.icon} size={26} /></div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{producto.nombre}</div>
            <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>{fmt(producto.precio)}</div>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 8 }}>Talle</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {POS_DATA.talles.map(tt => {
              const off = !talleTieneStock(tt);
              const on = tt === talle;
              return <button key={tt} disabled={off} onClick={() => setTalle(tt)} style={{ width: 48, height: 40, borderRadius: 8, cursor: off ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600,
                background: on ? 'var(--color-primary)' : 'var(--color-bg)', color: off ? 'var(--color-subtle)' : on ? '#fff' : 'var(--color-body)',
                border: `1px solid ${on ? 'var(--color-primary)' : 'var(--color-border)'}`, opacity: off ? 0.4 : 1 }}>{tt}</button>;
            })}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 8 }}>Color</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {POS_DATA.colores.map(c => {
              const off = talle ? stockDe(talle, c.id) === 0 : false;
              const on = c.id === color;
              return <button key={c.id} disabled={off} onClick={() => setColor(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, height: 40, padding: '0 12px', borderRadius: 8, cursor: off ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
                background: on ? 'var(--color-primary-bg)' : 'var(--color-bg)', color: on ? 'var(--color-primary-h)' : 'var(--color-body)',
                border: `1px solid ${on ? 'var(--color-primary)' : 'var(--color-border)'}`, opacity: off ? 0.4 : 1 }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', background: c.hex, border: '1px solid var(--color-border-strong)' }} />{c.label}</button>;
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, color: stockSel === 0 ? 'var(--color-error)' : 'var(--color-muted)' }}>
            {stockSel === null ? 'Elegí talle y color' : stockSel === 0 ? 'Sin stock en esta combinación' : <><b style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>{stockSel}</b> unidades disponibles</>}
          </div>
          <QtyControl qty={qty} onDec={() => setQty(q => Math.max(1, q - 1))} onInc={() => setQty(q => Math.min(stockSel || 99, q + 1))} />
        </div>
      </ModalShell>
    </Overlay>
  );
}

Object.assign(window, { Overlay, ModalShell, CobroModal, PostVentaModal, ClienteModal, VarianteModal, METODO_LABEL, SumRow });
