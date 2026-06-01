// ─── Other POS screens ────────────────────────────────────────────────────────

function ScreenTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{children}</h1>
      {sub && <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--color-muted)' }}>{sub}</p>}
    </div>
  );
}

function MiniKpi({ label, value, sub, accent, icon }) {
  return (
    <div style={{ flex: 1, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-muted)' }}>{label}</span>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: accent + '1A', color: accent, display: 'grid', placeItems: 'center' }}><Icon name={icon} size={16} /></div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text)', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ── Caja cerrada: everything blocked, central CTA ──
function CajaCerrada({ onAbrir }) {
  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, padding: 24, filter: 'blur(3px) saturate(0.6)', opacity: 0.5, pointerEvents: 'none' }}>
        <div style={{ display: 'flex', gap: 16, height: '100%' }}>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, alignContent: 'start' }}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ height: 150, borderRadius: 12, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />)}
          </div>
          <div style={{ width: 360, borderRadius: 12, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(248,250,252,0.4)' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 32, borderRadius: 16, background: 'var(--color-bg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-modal)', maxWidth: 380 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-surface-alt)', color: 'var(--color-muted)', display: 'grid', placeItems: 'center' }}><Icon name="lock" size={28} /></div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)', marginBottom: 6 }}>La caja está cerrada</div>
            <div style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.5, maxWidth: 300 }}>Para empezar a cobrar tenés que abrir la caja y registrar el monto inicial del turno.</div>
          </div>
          <Button variant="primary" size="lg" icon="unlock" onClick={onAbrir} style={{ width: '100%' }}>Abrir caja</Button>
        </div>
      </div>
    </div>
  );
}

// ── Apertura de caja ──
function AperturaCaja({ onConfirm, onCancel }) {
  const [monto, setMonto] = React.useState('15.000');
  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--color-primary-bg)', color: 'var(--color-primary)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}><Icon name="unlock" size={26} /></div>
          <ScreenTitle sub="Registrá el efectivo con el que abrís el turno.">Abrir caja</ScreenTitle>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--color-subtle)', textTransform: 'capitalize' }}>{fechaLarga()}</p>
        </div>
        <Card padding="lg" style={{ background: 'var(--color-bg)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <Avatar name="Alan" size={36} />
              <div><div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>Alan Méndez</div><div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Cajero</div></div>
            </div>
            <Input label="Monto inicial en efectivo" prefix="$" mono value={monto} onChange={e => setMonto(e.target.value)} />
            <Input label="Notas (opcional)" placeholder="Ej. cambio chico para vueltos" />
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Button variant="ghost" onClick={onCancel} style={{ flex: 1, border: '1px solid var(--color-border)' }}>Cancelar</Button>
              <Button variant="primary" icon="unlock" onClick={() => onConfirm(monto)} style={{ flex: 2 }}>Abrir caja</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Cierre de caja ──
function CierreCaja({ onConfirm, onCancel }) {
  const t = POS_DATA.turno;
  const efectivoVentas = t.metodos.find(m => m.metodo === 'Efectivo').total;
  const teorico = t.inicial + efectivoVentas + t.ingresos - t.egresos - t.devolMonto;
  const [contado, setContado] = React.useState('');
  const [motivo, setMotivo] = React.useState('');
  const [confirmar, setConfirmar] = React.useState(false);
  const contNum = parseFloat(contado.replace(/\./g, '').replace(',', '.')) || 0;
  const dif = contado === '' ? null : contNum - teorico;

  let difColor = 'var(--color-muted)', difBg = 'var(--color-surface)', difLabel = 'Ingresá el conteo';
  if (dif !== null) {
    if (dif === 0) { difColor = 'var(--color-success)'; difBg = 'var(--color-success-bg)'; difLabel = 'Caja cuadrada'; }
    else if (dif < 0) { difColor = 'var(--color-error)'; difBg = 'var(--color-error-bg)'; difLabel = 'Faltante'; }
    else { difColor = 'var(--color-warning)'; difBg = 'var(--color-warning-bg)'; difLabel = 'Sobrante'; }
  }
  const necesitaMotivo = dif !== null && dif !== 0;
  const puedeCerrar = contado !== '' && (!necesitaMotivo || motivo.trim());

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <ScreenTitle sub={`Caja ${t.caja} · abierta a las ${t.apertura.split(' ')[1]} por ${t.cajero}`}>Cerrar caja</ScreenTitle>

        {/* Resumen del turno */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20, marginBottom: 12 }}>
          <MiniKpi label="Ventas del turno" value={fmt(t.ventasTotal)} accent="#3B82F6" icon="trending-up" />
          <MiniKpi label="Tickets emitidos" value={t.tickets} accent="#10B981" icon="receipt" />
          <MiniKpi label="Devoluciones" value={t.devolCantidad} sub={fmt(t.devolMonto)} accent="#F59E0B" icon="rotate-ccw" />
          <MiniKpi label="Mov. manuales" value={fmt(t.ingresos - t.egresos)} sub={`+${fmtPlain(t.ingresos)} / −${fmtPlain(t.egresos)}`} accent="#8B5CF6" icon="arrow-left-right" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16 }}>
          {/* Breakdown table */}
          <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', alignSelf: 'start' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Desglose por método de pago</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.6fr 1fr', gap: 8, padding: '8px 16px', background: 'var(--color-surface-alt)' }}>
              {['Método', 'Cant.', 'Total'].map((h, i) => <span key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', textAlign: i ? 'right' : 'left' }}>{h}</span>)}
            </div>
            {t.metodos.map((m, i) => (
              <div key={m.metodo} style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.6fr 1fr', gap: 8, padding: '11px 16px', fontSize: 13, borderTop: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-body)' }}>{m.metodo}</span>
                <span style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{m.cantidad}</span>
                <span style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)', textAlign: 'right', fontWeight: 600 }}>{fmt(m.total)}</span>
              </div>
            ))}
          </div>

          {/* Conteo y cierre */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 16, borderRadius: 12, background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Total teórico en efectivo</span>
                <span style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>{fmt(teorico)}</span>
              </div>
              <Input label="Conteo físico del efectivo" prefix="$" mono autoFocus value={contado} onChange={e => setContado(e.target.value)} placeholder="0" />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: difBg, marginTop: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: difColor, display: 'flex', alignItems: 'center', gap: 6 }}>{dif === 0 && <Icon name="check" size={15} strokeWidth={2.4} />}{difLabel}</span>
                <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', color: difColor }}>{dif === null ? '—' : (dif > 0 ? '+' : '') + fmt(dif)}</span>
              </div>
            </div>
            {necesitaMotivo && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-body)', marginBottom: 6 }}>Motivo de la diferencia *</div>
                <textarea value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Explicá por qué la caja no cuadra" rows={2}
                  style={{ width: '100%', padding: 12, fontSize: 14, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-body)', marginBottom: 6 }}>Notas del turno (opcional)</div>
              <textarea placeholder="Observaciones generales del turno" rows={2}
                style={{ width: '100%', padding: 12, fontSize: 14, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onCancel} style={{ border: '1px solid var(--color-border)' }}>Volver al POS</Button>
          <Button variant="primary" icon="lock" disabled={!puedeCerrar} onClick={() => setConfirmar(true)}>Cerrar caja</Button>
        </div>
      </div>

      {confirmar && (
        <Overlay onClose={() => setConfirmar(false)}>
          <ModalShell title="Confirmar cierre de caja" onClose={() => setConfirmar(false)} maxWidth={400}
            footer={<>
              <Button variant="ghost" onClick={() => setConfirmar(false)}>Cancelar</Button>
              <Button variant="primary" icon="lock" onClick={onConfirm}>Sí, cerrar caja</Button>
            </>}>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-body)', lineHeight: 1.5 }}>
              Vas a cerrar la caja <b style={{ fontFamily: 'var(--font-mono)' }}>{t.caja}</b> con un total contado de <b style={{ fontFamily: 'var(--font-mono)' }}>{fmt(contNum)}</b>{dif !== 0 && <> y una diferencia de <b style={{ fontFamily: 'var(--font-mono)', color: dif < 0 ? 'var(--color-error)' : 'var(--color-warning)' }}>{(dif > 0 ? '+' : '') + fmt(dif)}</b></>}. Esta acción no se puede deshacer.
            </p>
          </ModalShell>
        </Overlay>
      )}
    </div>
  );
}

// ── Historial de cajas ──
function EstadoBadge({ estado }) {
  if (estado === 'abierta') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 24, padding: '0 10px', borderRadius: 9999, background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-success)', animation: 'orbita-pulse 1.4s ease-in-out infinite' }} />En curso</span>
  );
  if (estado === 'forzada') return <Badge status="pendiente" label="Forzada" size="md" />;
  return <Badge status="cerrada" size="md" />;
}

function FilterSelect({ value, options, onChange, icon }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {icon && <span style={{ position: 'absolute', left: 10, pointerEvents: 'none', color: 'var(--color-subtle)' }}><Icon name={icon} size={15} /></span>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ height: 36, padding: icon ? '0 30px 0 32px' : '0 30px 0 12px', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
        background: 'var(--color-bg)', color: 'var(--color-body)', border: '1px solid var(--color-border)', outline: 'none', appearance: 'none' }}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 9, pointerEvents: 'none', color: 'var(--color-subtle)' }}><Icon name="chevron-down" size={14} /></span>
    </div>
  );
}

function Historial({ onVerSesion }) {
  const [estado, setEstado] = React.useState('Todas');
  const [conDif, setConDif] = React.useState('Todas');
  const [cajero, setCajero] = React.useState('Todos los cajeros');

  let data = POS_DATA.sesiones.filter(s => {
    const estOk = estado === 'Todas' || (estado === 'Abiertas' ? s.estado === 'abierta' : estado === 'Forzadas' ? s.estado === 'forzada' : estado === 'Cerradas' ? s.estado === 'cerrada' : true);
    const difOk = conDif === 'Todas' || (conDif === 'Solo con diferencia' ? (s.dif !== null && s.dif !== 0) : s.dif === 0);
    const cajOk = cajero === 'Todos los cajeros' || s.cajero === cajero;
    return estOk && difOk && cajOk;
  });
  // Active session always on top.
  data = [...data].sort((a, b) => (a.estado === 'abierta' ? -1 : 0) - (b.estado === 'abierta' ? -1 : 0));

  const cols = '1.2fr 1fr 1.3fr 1.3fr 1fr 1fr 0.7fr 1fr 1fr';
  const head = ['Caja', 'Cajero', 'Apertura', 'Cierre', 'Inicial', 'Ventas', 'Tickets', 'Diferencia', 'Estado'];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
          <ScreenTitle sub="Sesiones de caja registradas.">Historial de cajas</ScreenTitle>
          <Button variant="outline" icon="download">Exportar CSV</Button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 10, pointerEvents: 'none', color: 'var(--color-subtle)' }}><Icon name="calendar" size={15} /></span>
            <input type="text" defaultValue="Últimos 7 días" readOnly style={{ height: 36, width: 150, padding: '0 12px 0 32px', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', background: 'var(--color-bg)', color: 'var(--color-body)', border: '1px solid var(--color-border)', outline: 'none' }} />
          </div>
          <FilterSelect icon="user" value={cajero} options={['Todos los cajeros', 'Alan M.', 'Sofía R.']} onChange={setCajero} />
          <FilterSelect value={estado} options={['Todas', 'Cerradas', 'Abiertas', 'Forzadas']} onChange={setEstado} />
          <FilterSelect value={conDif} options={['Todas', 'Solo con diferencia', 'Solo cuadradas']} onChange={setConDif} />
        </div>

        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 10, padding: '0 16px', height: 40, background: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)' }}>
            {head.map((h, i) => <div key={h} style={{ display: 'flex', alignItems: 'center', justifyContent: i >= 4 && i <= 7 ? 'flex-end' : 'flex-start', fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>)}
          </div>
          {data.length === 0
            ? <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-muted)', fontSize: 14 }}>No hay sesiones de caja registradas. Abrí tu primera caja para empezar.</div>
            : data.map((s, i) => {
              const difColor = s.dif === null ? 'var(--color-muted)' : s.dif === 0 ? 'var(--color-success)' : Math.abs(s.dif) < 2000 ? 'var(--color-warning)' : 'var(--color-error)';
              const activa = s.estado === 'abierta';
              return (
                <div key={s.id} onClick={() => onVerSesion(s)} style={{ display: 'grid', gridTemplateColumns: cols, gap: 10, padding: '0 16px', minHeight: 56, alignItems: 'center', cursor: 'pointer',
                  background: activa ? 'var(--color-primary-bg)' : 'transparent', borderBottom: i < data.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                  onMouseEnter={e => { if (!activa) e.currentTarget.style.background = 'var(--color-surface-alt)'; }} onMouseLeave={e => { if (!activa) e.currentTarget.style.background = 'transparent'; }}>
                  <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>{s.id}</span>
                  <span style={{ fontSize: 13, color: 'var(--color-body)' }}>{s.cajero}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>{s.apertura}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>{s.cierre}</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-body)', textAlign: 'right' }}>{fmtPlain(s.inicial)}</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-text)', textAlign: 'right', fontWeight: 600 }}>{fmtPlain(s.ventas)}</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textAlign: 'right' }}>{s.tickets}</span>
                  <span style={{ textAlign: 'right', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: difColor }}>{s.dif === null ? '—' : (s.dif > 0 ? '+' : '') + fmtPlain(s.dif)}</span>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                    <EstadoBadge estado={s.estado} />
                    {activa && <button onClick={e => { e.stopPropagation(); onVerSesion(s); }} title="Forzar cierre" style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-warning)', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="lock" size={14} /></button>}
                  </div>
                </div>
              );
            })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, marginTop: 14 }}>
          <span style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', marginRight: 6 }}>1–{data.length} de {data.length}</span>
          <button disabled style={{ height: 30, padding: '0 10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-subtle)', fontSize: 12, fontFamily: 'var(--font-mono)', cursor: 'not-allowed' }}>Anterior</button>
          <button disabled style={{ height: 30, padding: '0 10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-subtle)', fontSize: 12, fontFamily: 'var(--font-mono)', cursor: 'not-allowed' }}>Siguiente</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CajaCerrada, AperturaCaja, CierreCaja, Historial, ScreenTitle });
