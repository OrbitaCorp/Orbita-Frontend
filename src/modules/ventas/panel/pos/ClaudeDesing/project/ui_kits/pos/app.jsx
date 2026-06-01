// ─── App: state machine wiring all POS screens ────────────────────────────────
const { useState, useEffect } = React;

function ShiftHeader({ total, pausadosCount, onMovimientos, onDevolucion, onPausados, onCerrar }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', flexShrink: 0,
      background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 0 3px var(--color-success-bg)' }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Caja abierta</div>
          <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Alan M. · desde 14:31</div>
        </div>
      </div>
      <div style={{ width: 1, height: 32, background: 'var(--color-border)' }} />
      <div>
        <div style={{ fontSize: 11, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Acumulado del turno</div>
        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>{fmt(total)}</div>
      </div>
      <div style={{ flex: 1 }} />
      <Button variant="ghost" size="sm" icon="arrow-left-right" onClick={onMovimientos} style={{ border: '1px solid var(--color-border)' }}>Movimientos</Button>
      <Button variant="ghost" size="sm" icon="rotate-ccw" onClick={onDevolucion} style={{ border: '1px solid var(--color-border)' }}>Devolución</Button>
      <Button variant="ghost" size="sm" icon="pause" onClick={onPausados} style={{ border: '1px solid var(--color-border)' }}>
        Pausados {pausadosCount > 0 && <span style={{ marginLeft: 2, padding: '0 6px', height: 18, display: 'inline-flex', alignItems: 'center', borderRadius: 9999, background: 'var(--color-primary)', color: '#fff', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{pausadosCount}</span>}
      </Button>
      <Button variant="ghost" size="sm" icon="lock" onClick={onCerrar} style={{ border: '1px solid var(--color-border)' }}>Cerrar caja</Button>
    </div>
  );
}

function CobroRapido(props) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <ShiftHeader total={86200} pausadosCount={props.pausadosCount}
        onMovimientos={props.onMovimientos} onDevolucion={props.onDevolucion} onPausados={props.onPausados} onCerrar={props.onCerrar} />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0, padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
          <Catalog onAdd={props.onAdd} onItemLibre={props.onItemLibre} />
        </div>
        <Ticket {...props} />
      </div>
    </div>
  );
}

const TITULOS = { pos: 'POS', historial: 'POS · Historial', cierre: 'POS · Cierre', apertura: 'POS · Apertura' };

function App() {
  const [dark, setDark] = useState(false);
  const [view, setView] = useState('pos');
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [items, setItems] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [cupon, setCupon] = useState(null);
  const [manual, setManual] = useState(null);
  const [pausados, setPausados] = useState(POS_DATA.pausados);
  const [modal, setModal] = useState(null);          // cobro | postventa | cliente | pausados | egreso | devolucion | variante
  const [variante, setVariante] = useState(null);    // producto for VarianteModal
  const [sesion, setSesion] = useState(null);        // sesion for SesionDetalleModal
  const [lastSale, setLastSale] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { document.body.classList.toggle('dark', dark); }, [dark]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3200); return () => clearTimeout(t); }, [toast]);

  // Promo automática informativa: 2+ remeras en el ticket.
  const remerasQty = items.filter(it => it.cat === 'Remeras').reduce((s, it) => s + it.qty, 0);
  const promo = remerasQty >= 2 ? '2x1 en Remeras' : null;

  const totals = computeTotals(items, cupon, manual);
  const fire = (variant, title, description) => setToast({ variant, title, description });

  const pushItem = (p, extra = {}) => setItems(prev => {
    const matchKey = (p.id) + (extra.variante || '');
    const i = prev.findIndex(x => (x.id + (x.variante || '')) === matchKey);
    const addQty = extra.qty || 1;
    if (i >= 0) { const n = [...prev]; n[i] = { ...n[i], qty: n[i].qty + addQty }; return n; }
    return [...prev, { key: matchKey + '-' + Date.now(), id: p.id, nombre: p.nombre, precio: p.precio, cat: p.cat, descPct: p.descPct, qty: addQty, variante: extra.variante }];
  });

  const onAdd = (p) => { if (p.variantes) { setVariante(p); setModal('variante'); } else pushItem(p); };
  const dec = (i) => setItems(prev => prev[i].qty <= 1 ? prev.filter((_, j) => j !== i) : prev.map((x, j) => j === i ? { ...x, qty: x.qty - 1 } : x));
  const inc = (i) => setItems(prev => prev.map((x, j) => j === i ? { ...x, qty: x.qty + 1 } : x));
  const remove = (i) => setItems(prev => prev.filter((_, j) => j !== i));
  const resetTicket = () => { setItems([]); setCliente(null); setCupon(null); setManual(null); };
  const itemLibre = () => pushItem({ id: 'libre-' + Date.now(), nombre: 'Ítem libre', precio: 5000, cat: 'Libre' });

  const confirmCobro = ({ metodo, vuelto }) => {
    setLastSale({ total: totals.total, metodo: METODO_LABEL[metodo], vuelto, cliente, comprobante: '#0008' + (40 + Math.floor(Math.random() * 59)) });
    setModal('postventa');
  };
  const nuevoTicket = () => { const c = lastSale; resetTicket(); setModal(null); fire('success', '¡Venta registrada!', `${c.comprobante} · ${fmt(c.total)} · ${c.metodo}.`); };

  const pausar = () => { setPausados(p => [{ id: 'tp-' + Date.now(), cliente: cliente ? cliente.nombre : 'Sin cliente', hora: new Date().toTimeString().slice(0, 5), items: items.length, total: totals.total }, ...p]); resetTicket(); fire('info', 'Ticket pausado', 'Lo encontrás en “Pausados”.'); };
  const cancelar = () => { resetTicket(); fire('warning', 'Ticket cancelado', 'Se vació el ticket actual.'); };
  const retomar = (t) => {
    if (items.length > 0) { setPausados(p => [{ id: 'tp-' + Date.now(), cliente: cliente ? cliente.nombre : 'Sin cliente', hora: new Date().toTimeString().slice(0, 5), items: items.length, total: totals.total }, ...p.filter(x => x.id !== t.id)]); fire('info', 'Ticket actual pausado', 'Se guardó para retomarlo después.'); }
    else { setPausados(p => p.filter(x => x.id !== t.id)); }
    setModal(null);
    setTimeout(() => fire('success', 'Ticket retomado', `${t.cliente} · ${fmt(t.total)}.`), items.length > 0 ? 350 : 0);
  };
  const descartar = (id) => { setPausados(p => p.filter(x => x.id !== id)); fire('warning', 'Ticket descartado', null); };

  const aplicarCupon = (codigo) => { setCupon({ codigo, pct: 20 }); fire('success', 'Cupón aplicado', `${codigo} · −20% sobre el subtotal.`); };
  const toggleManual = () => { setManual(m => m ? null : { pct: 10 }); fire('success', manual ? 'Descuento quitado' : 'Descuento manual', manual ? null : '−10% sobre el subtotal.'); };

  const ticketProps = {
    items, cliente, cupon, manual, promo,
    onDec: dec, onInc: inc, onRemove: remove,
    onCobrar: () => setModal('cobro'), onPausar: pausar, onCancelar: cancelar,
    onCliente: (v) => v === 'open' ? setModal('cliente') : setCliente(null),
    canManual: true, onManual: toggleManual,
    onAplicarCupon: aplicarCupon, onQuitarCupon: () => setCupon(null),
  };

  return (
    <Shell active="pos" titulo={TITULOS[view]} isDark={dark} onToggleDark={() => setDark(d => !d)}
      onNavigate={(s) => { if (s === 'pos') setView('pos'); }}>

      {cajaAbierta && view !== 'apertura' && (
        <div style={{ display: 'flex', gap: 4, padding: '8px 24px 0', background: 'var(--color-surface)', flexShrink: 0 }}>
          {[['pos', 'Cobro rápido'], ['historial', 'Historial'], ['cierre', 'Cierre']].map(([v, l]) => (
            <button key={v} onClick={() => setView(v)} style={{ height: 34, padding: '0 14px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: 'none',
              background: view === v ? 'var(--color-bg)' : 'transparent', color: view === v ? 'var(--color-primary-h)' : 'var(--color-muted)',
              borderBottom: `2px solid ${view === v ? 'var(--color-primary)' : 'transparent'}` }}>{l}</button>
          ))}
        </div>
      )}

      {!cajaAbierta && view === 'pos' && <CajaCerrada onAbrir={() => setView('apertura')} />}
      {view === 'apertura' && <AperturaCaja onCancel={() => setView('pos')} onConfirm={() => { setCajaAbierta(true); setView('pos'); fire('success', 'Caja abierta', 'Turno iniciado con $15.000.'); }} />}
      {cajaAbierta && view === 'pos' && <CobroRapido {...ticketProps} pausadosCount={pausados.length}
        onAdd={onAdd} onItemLibre={itemLibre}
        onMovimientos={() => setModal('egreso')} onDevolucion={() => setModal('devolucion')}
        onPausados={() => setModal('pausados')} onCerrar={() => setView('cierre')} />}
      {view === 'historial' && <Historial onVerSesion={(s) => { setSesion(s); setModal('sesion'); }} />}
      {view === 'cierre' && <CierreCaja onCancel={() => setView('pos')} onConfirm={() => { setCajaAbierta(false); setView('pos'); resetTicket(); fire('success', 'Caja cerrada', 'El turno se cerró correctamente.'); }} />}

      {/* Modals */}
      {modal === 'variante' && variante && <VarianteModal producto={variante} onClose={() => setModal(null)} onAgregar={(p) => { pushItem(p, { variante: p.variante, qty: p.qty }); setModal(null); fire('success', 'Producto agregado', `${p.nombre} · ${p.variante}`); }} />}
      {modal === 'cobro' && <CobroModal total={totals.total} onClose={() => setModal(null)} onConfirm={confirmCobro} />}
      {modal === 'postventa' && lastSale && <PostVentaModal {...lastSale} onClose={nuevoTicket} onNuevo={nuevoTicket} onDetalle={() => { setModal(null); fire('info', 'Comprobante ' + lastSale.comprobante, 'Aquí se abriría el detalle completo.'); resetTicket(); }} />}
      {modal === 'cliente' && <ClienteModal onClose={() => setModal(null)} onSelect={(c) => { setCliente(c); setModal(null); }} />}
      {modal === 'pausados' && <PausadosDrawer pausados={pausados} onClose={() => setModal(null)} onRetomar={retomar} onDescartar={descartar} />}
      {modal === 'egreso' && <EgresoIngresoModal onClose={() => setModal(null)} onRegistrar={(m) => { setModal(null); fire('success', m.tipo === 'ingreso' ? 'Ingreso registrado' : 'Egreso registrado', `${fmt(m.monto)}${m.motivo ? ' · ' + m.motivo : ''}.`); }} />}
      {modal === 'devolucion' && <DevolucionModal onClose={() => setModal(null)} onConfirmar={() => { setModal(null); fire('success', 'Devolución confirmada', 'Stock reingresado y reembolso registrado.'); }} />}
      {modal === 'sesion' && sesion && <SesionDetalleModal sesion={sesion} onClose={() => setModal(null)} />}

      {toast && <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 400 }}><Toast {...toast} onClose={() => setToast(null)} /></div>}
    </Shell>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
