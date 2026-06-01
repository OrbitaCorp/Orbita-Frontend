// ─── Modals (part 2): Pausados drawer · Egreso/Ingreso · Devolución · Detalle ──

// ── Drawer: tickets pausados ──
function PausadosDrawer({ pausados, onClose, onRetomar, onDescartar }) {
  const [confirmar, setConfirmar] = React.useState(null);
  return (
    <Overlay onClose={onClose} align="right">
      <div onClick={e => e.stopPropagation()} style={{ width: 392, height: '100%', background: 'var(--color-bg)', borderLeft: '1px solid var(--color-border)', boxShadow: 'var(--shadow-modal)', display: 'flex', flexDirection: 'column', animation: 'slideIn 300ms ease-out' }}>
        <header style={{ padding: 16, borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="pause" size={18} color="var(--color-body)" />
          <span style={{ flex: 1, fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>Tickets en pausa</span>
          <span style={{ padding: '0 8px', height: 20, display: 'inline-flex', alignItems: 'center', borderRadius: 9999, background: 'var(--color-surface-alt)', color: 'var(--color-body)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{pausados.length}</span>
          <button onClick={onClose} aria-label="Cerrar" style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Icon name="x" size={16} /></button>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {pausados.length === 0
            ? <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center', color: 'var(--color-muted)' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--color-surface-alt)', display: 'grid', placeItems: 'center' }}><Icon name="pause" size={24} /></div>
                <span style={{ fontSize: 13 }}>No hay tickets en pausa.</span>
              </div>
            : pausados.map(t => (
              <div key={t.id} style={{ padding: 12, marginBottom: 8, borderRadius: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <Avatar name={t.cliente === 'Sin cliente' ? '?' : t.cliente} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>{t.cliente}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>{t.hora} · {t.items} ítems · {fmt(t.total)}</div>
                  </div>
                </div>
                {confirmar === t.id
                  ? <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ flex: 1, fontSize: 12, color: 'var(--color-error)' }}>¿Descartar este ticket?</span>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmar(null)} style={{ border: '1px solid var(--color-border)' }}>No</Button>
                      <Button variant="danger" size="sm" onClick={() => { onDescartar(t.id); setConfirmar(null); }}>Sí, descartar</Button>
                    </div>
                  : <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="primary" size="sm" icon="play" onClick={() => onRetomar(t)} style={{ flex: 1 }}>Retomar</Button>
                      <Button variant="ghost" size="sm" icon="trash-2" onClick={() => setConfirmar(t.id)} style={{ border: '1px solid var(--color-border)', color: 'var(--color-error)' }}>Descartar</Button>
                    </div>}
              </div>
            ))}
        </div>
      </div>
    </Overlay>
  );
}

// ── Egreso / Ingreso de efectivo ──
function EgresoIngresoModal({ enCaja = 45200, onClose, onRegistrar }) {
  const [tipo, setTipo] = React.useState('egreso');
  const [monto, setMonto] = React.useState('');
  const [motivo, setMotivo] = React.useState('');
  const montoNum = parseFloat(monto.replace(/\./g, '').replace(',', '.')) || 0;
  const valido = montoNum > 0 && (tipo === 'ingreso' || motivo.trim());

  return (
    <Overlay onClose={onClose}>
      <ModalShell title="Movimiento de caja" onClose={onClose} maxWidth={420}
        footer={<>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" icon="check" disabled={!valido} onClick={() => onRegistrar({ tipo, monto: montoNum, motivo })}>Registrar movimiento</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 0, padding: 4, borderRadius: 10, background: 'var(--color-surface-alt)' }}>
            {[['ingreso', 'Ingreso', 'arrow-down-left'], ['egreso', 'Egreso', 'arrow-up-right']].map(([id, label, ic]) => (
              <button key={id} onClick={() => setTipo(id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 36, borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                background: tipo === id ? 'var(--color-bg)' : 'transparent', color: tipo === id ? 'var(--color-text)' : 'var(--color-muted)', boxShadow: tipo === id ? 'var(--shadow-sm)' : 'none' }}>
                <Icon name={ic} size={15} /> {label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Efectivo actual en caja</span>
            <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>{fmt(enCaja)}</span>
          </div>
          <Input label="Monto *" prefix="$" mono autoFocus value={monto} onChange={e => setMonto(e.target.value)} placeholder="0" />
          <Input label={tipo === 'egreso' ? 'Motivo *' : 'Motivo (opcional)'} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder={tipo === 'egreso' ? 'Ej. pago a proveedor' : 'Ej. aporte de cambio'} />
        </div>
      </ModalShell>
    </Overlay>
  );
}

// ── Devolución / intercambio (4 pasos) ──
const MOTIVOS = ['Producto defectuoso', 'No le gustó', 'Error en el cobro', 'Otro'];
function Stepper({ paso }) {
  const labels = ['Buscar', 'Ítems', 'Reembolso', 'Confirmar'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
      {labels.map((l, i) => {
        const n = i + 1, done = n < paso, cur = n === paso;
        return (
          <React.Fragment key={l}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
                background: cur ? 'var(--color-primary)' : done ? 'var(--color-success)' : 'var(--color-surface-alt)', color: cur || done ? '#fff' : 'var(--color-muted)' }}>{done ? '✓' : n}</div>
              <span style={{ fontSize: 12, fontWeight: cur ? 600 : 400, color: cur ? 'var(--color-text)' : 'var(--color-muted)' }}>{l}</span>
            </div>
            {i < labels.length - 1 && <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function DevolucionModal({ onClose, onConfirmar }) {
  const o = POS_DATA.ticketOriginal;
  const [paso, setPaso] = React.useState(1);
  const [busqueda, setBusqueda] = React.useState('');
  const [encontrado, setEncontrado] = React.useState(false);
  const [sel, setSel] = React.useState({});          // id -> qty a devolver
  const [motivo, setMotivo] = React.useState('');
  const [cambio, setCambio] = React.useState(false);
  const [reembolso, setReembolso] = React.useState('original');

  const seleccionados = o.items.filter(it => sel[it.id] > 0);
  const montoDevol = seleccionados.reduce((s, it) => s + it.precio * sel[it.id], 0);
  const difCambio = cambio ? 3500 : 0; // demo: producto de reemplazo

  const next = () => setPaso(p => Math.min(4, p + 1));
  const prev = () => setPaso(p => Math.max(1, p - 1));

  const footer = (
    <>
      {paso > 1 && <Button variant="ghost" onClick={prev}>Atrás</Button>}
      {paso === 1 && <Button variant="primary" disabled={!encontrado} onClick={next}>Continuar</Button>}
      {paso === 2 && <Button variant="primary" disabled={seleccionados.length === 0 || !motivo} onClick={next}>Continuar</Button>}
      {paso === 3 && <Button variant="primary" onClick={next}>Continuar</Button>}
      {paso === 4 && <Button variant="primary" icon="check" onClick={onConfirmar}>Confirmar devolución</Button>}
    </>
  );

  return (
    <Overlay onClose={onClose}>
      <ModalShell title="Devolución / intercambio" onClose={onClose} maxWidth={560} footer={footer}>
        <Stepper paso={paso} />

        {paso === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input autoFocus value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por Nº de comprobante, DNI o teléfono..."
              trailing={<button onClick={() => setEncontrado(true)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Buscar</button>} />
            {encontrado
              ? <Card padding="sm" style={{ background: 'var(--color-surface)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>{o.nro}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>{o.fecha}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-body)' }}>{o.cliente} · {o.metodo}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 4 }}>{o.items.length} ítems · <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)', fontWeight: 600 }}>{fmt(o.total)}</span></div>
                </Card>
              : <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-muted)', fontSize: 13 }}>Ingresá un comprobante y tocá “Buscar”.</div>}
          </div>
        )}

        {paso === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              {o.items.map(it => {
                const max = it.qty - it.devuelto;
                const cur = sel[it.id] || 0;
                return (
                  <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                    <button onClick={() => setSel(s => ({ ...s, [it.id]: cur > 0 ? 0 : 1 }))} style={{ width: 20, height: 20, borderRadius: 5, border: `1px solid ${cur > 0 ? 'var(--color-primary)' : 'var(--color-border-strong)'}`, background: cur > 0 ? 'var(--color-primary)' : 'var(--color-bg)', cursor: max > 0 ? 'pointer' : 'not-allowed', display: 'grid', placeItems: 'center', color: '#fff' }} disabled={max === 0}>{cur > 0 && <Icon name="check" size={13} strokeWidth={3} />}</button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: 'var(--color-text)' }}>{it.nombre}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{it.variante || '—'} · máx {max} {it.devuelto > 0 && `(${it.devuelto} ya devuelto)`}</div>
                    </div>
                    {cur > 0 && <QtyControl qty={cur} onDec={() => setSel(s => ({ ...s, [it.id]: Math.max(0, cur - 1) }))} onInc={() => setSel(s => ({ ...s, [it.id]: Math.min(max, cur + 1) }))} />}
                  </div>
                );
              })}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6 }}>Motivo de la devolución *</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {MOTIVOS.map(m => <button key={m} onClick={() => setMotivo(m)} style={{ height: 32, padding: '0 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  background: motivo === m ? 'var(--color-primary-bg)' : 'var(--color-bg)', color: motivo === m ? 'var(--color-primary-h)' : 'var(--color-body)', border: `1px solid ${motivo === m ? 'var(--color-primary)' : 'var(--color-border)'}` }}>{m}</button>)}
              </div>
              {motivo === 'Otro' && <div style={{ marginTop: 8 }}><Input placeholder="Detallá el motivo" /></div>}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)', cursor: 'pointer' }}>
              <button onClick={() => setCambio(c => !c)} style={{ width: 38, height: 22, borderRadius: 9999, border: 'none', cursor: 'pointer', background: cambio ? 'var(--color-primary)' : 'var(--color-border-strong)', position: 'relative', flexShrink: 0, transition: 'background 150ms ease' }}>
                <span style={{ position: 'absolute', top: 2, left: cambio ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 150ms ease' }} />
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>Cambio / intercambio</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Agregar un producto de reemplazo</div>
              </div>
            </label>
            {cambio && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Input placeholder="Buscar producto de reemplazo..." trailing={<Icon name="search" size={16} color="var(--color-subtle)" />} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'var(--color-warning-bg)' }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-warning)' }}>Diferencia a cobrar</span>
                  <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-warning)' }}>{fmt(difCambio)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {paso === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)' }}>Método de reembolso</div>
            {[['original', `Mismo método (${o.metodo})`, 'rotate-ccw'], ['efectivo', 'Efectivo', 'banknote'], ['nota', 'Nota de crédito interna', 'file-text']].map(([id, label, ic]) => (
              <button key={id} onClick={() => setReembolso(id)} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 48, padding: '0 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                background: reembolso === id ? 'var(--color-primary-bg)' : 'var(--color-bg)', color: reembolso === id ? 'var(--color-primary-h)' : 'var(--color-body)', border: `1px solid ${reembolso === id ? 'var(--color-primary)' : 'var(--color-border)'}` }}>
                <Icon name={ic} size={18} /> {label}
              </button>
            ))}
            {reembolso === 'original' && /tarjeta|crédito|débito/i.test(o.metodo) && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 10, background: 'var(--color-warning-bg)', marginTop: 4 }}>
                <Icon name="info" size={15} color="var(--color-warning)" style={{ marginTop: 1 }} />
                <span style={{ fontSize: 12, color: 'var(--color-warning)' }}>El reembolso a tarjeta puede demorar 5–10 días hábiles.</span>
              </div>
            )}
          </div>
        )}

        {paso === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SumRow label="Ítems devueltos" value={seleccionados.reduce((s, it) => s + sel[it.id], 0) + ' u.'} />
            <SumRow label="Monto a reembolsar" value={fmt(montoDevol - difCambio)} bold />
            <SumRow label="Método de reembolso" value={reembolso === 'original' ? o.metodo : reembolso === 'efectivo' ? 'Efectivo' : 'Nota de crédito'} mono={false} />
            <SumRow label="Stock reingresado" value={seleccionados.reduce((s, it) => s + sel[it.id], 0) + ' u.'} />
            <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>Motivo: {motivo}</div>
          </div>
        )}
      </ModalShell>
    </Overlay>
  );
}

// ── Detalle de sesión (lectura) ──
function SesionDetalleModal({ sesion, onClose }) {
  const t = POS_DATA.turno;
  const difColor = sesion.dif === null ? 'var(--color-muted)' : sesion.dif === 0 ? 'var(--color-success)' : Math.abs(sesion.dif) < 2000 ? 'var(--color-warning)' : 'var(--color-error)';
  return (
    <Overlay onClose={onClose}>
      <ModalShell title={`Caja ${sesion.id}`} onClose={onClose} maxWidth={560}
        footer={<>
          <Button variant="ghost" icon="printer">Reimprimir</Button>
          <Button variant="outline" icon="download">Exportar PDF</Button>
          <Button variant="primary" icon="shield-check">Marcar auditada</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <SumRow label="Cajero" value={sesion.cajero} mono={false} />
            <SumRow label="Estado" value={sesion.estado} mono={false} />
            <SumRow label="Apertura" value={sesion.apertura} />
            <SumRow label="Cierre" value={sesion.cierre} />
            <SumRow label="Ventas" value={fmt(sesion.ventas)} bold />
            <SumRow label="Diferencia" value={sesion.dif === null ? '—' : (sesion.dif > 0 ? '+' : '') + fmt(sesion.dif)} color={difColor} />
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', marginBottom: 8 }}>Por método de pago</div>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
              {t.metodos.map((m, i) => (
                <div key={m.metodo} style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.6fr 1fr', gap: 8, padding: '8px 12px', fontSize: 13, borderTop: i ? '1px solid var(--color-border)' : 'none' }}>
                  <span style={{ color: 'var(--color-body)' }}>{m.metodo}</span>
                  <span style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{m.cantidad}</span>
                  <span style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)', textAlign: 'right', fontWeight: 600 }}>{fmt(m.total)}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <SumRow label="Tickets emitidos" value={sesion.tickets} />
            <SumRow label="Devoluciones" value={`${t.devolCantidad} · ${fmt(t.devolMonto)}`} />
            <SumRow label="Ingresos manuales" value={fmt(t.ingresos)} color="var(--color-success)" />
            <SumRow label="Egresos manuales" value={fmt(t.egresos)} color="var(--color-error)" />
          </div>
          {sesion.dif !== null && sesion.dif !== 0 && (
            <div style={{ fontSize: 12, color: 'var(--color-muted)', padding: '8px 0', borderTop: '1px solid var(--color-border)' }}>Motivo de la diferencia: error de vuelto en una venta.</div>
          )}
        </div>
      </ModalShell>
    </Overlay>
  );
}

Object.assign(window, { PausadosDrawer, EgresoIngresoModal, DevolucionModal, SesionDetalleModal });
