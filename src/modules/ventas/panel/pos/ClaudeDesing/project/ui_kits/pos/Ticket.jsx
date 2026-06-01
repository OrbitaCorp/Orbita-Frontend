// ─── Ticket (right column of Cobro rápido) ────────────────────────────────────

function QtyControl({ qty, onDec, onInc }) {
  const btn = { width: 26, height: 26, borderRadius: 6, border: '1px solid var(--color-border)',
    background: 'var(--color-bg)', color: 'var(--color-body)', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button style={btn} onClick={onDec}><Icon name="minus" size={13} /></button>
      <span style={{ minWidth: 20, textAlign: 'center', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>{qty}</span>
      <button style={btn} onClick={onInc}><Icon name="plus" size={13} /></button>
    </div>
  );
}

function TicketRow({ it, onDec, onInc, onRemove }) {
  const hasDesc = !!it.descPct;
  const unit = hasDesc ? Math.round(it.precio * (1 - it.descPct / 100)) : it.precio;
  return (
    <div style={{ display: 'flex', gap: 10, padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>{it.nombre}</div>
        {it.variante && <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 1 }}>{it.variante}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          {hasDesc && <span style={{ color: 'var(--color-subtle)', textDecoration: 'line-through' }}>{fmt(it.precio)}</span>}
          <span style={{ color: 'var(--color-muted)' }}>{fmt(unit)} c/u</span>
          {hasDesc && <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>−{it.descPct}%</span>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>{fmt(unit * it.qty)}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <QtyControl qty={it.qty} onDec={onDec} onInc={onInc} />
          <button onClick={onRemove} aria-label="Eliminar" style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--color-subtle)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Icon name="trash-2" size={15} /></button>
        </div>
      </div>
    </div>
  );
}

function TotalsRow({ label, value, color, mono = true, indent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, paddingLeft: indent ? 12 : 0 }}>
      <span style={{ color: indent ? 'var(--color-subtle)' : 'var(--color-muted)' }}>{label}</span>
      <span style={{ color: color || 'var(--color-body)', fontFamily: mono ? 'var(--font-mono)' : 'inherit', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

// Discount zone — always visible, below items, before totals.
function DiscountZone({ cupon, onAplicarCupon, onQuitarCupon, canManual, onManual, manual }) {
  const [code, setCode] = React.useState('');
  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {cupon
        ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 12px', borderRadius: 8, background: 'var(--color-success-bg)', border: '1px solid var(--color-success)' }}>
            <Icon name="ticket-percent" size={16} color="var(--color-success)" />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>{cupon.codigo} · −{cupon.pct}%</span>
            <button onClick={onQuitarCupon} aria-label="Quitar cupón" style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--color-success)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Icon name="x" size={14} /></button>
          </div>
        : <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Input placeholder="Código de cupón" value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
            </div>
            <Button variant="secondary" onClick={() => { if (code.trim()) { onAplicarCupon(code.trim()); setCode(''); } }}>Aplicar</Button>
          </div>}
      {canManual && (
        <button onClick={onManual} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color: manual ? 'var(--color-success)' : 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
          <Icon name="percent" size={13} /> {manual ? `Descuento manual −${manual.pct}% (quitar)` : 'Descuento manual'}
        </button>
      )}
    </div>
  );
}

function Ticket(props) {
  const { items, cliente, cupon, manual, promo, onDec, onInc, onRemove, onCobrar, onPausar, onCancelar, onCliente } = props;
  const empty = items.length === 0;
  const t = computeTotals(items, cupon, manual);

  return (
    <div style={{ width: 396, flexShrink: 0, display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%',
      background: 'var(--color-bg)', borderLeft: '1px solid var(--color-border)' }}>

      {/* Cliente */}
      <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)' }}>
        {cliente
          ? <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={cliente.nombre} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>{cliente.nombre}</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>DNI {cliente.dni}</div>
              </div>
              <button onClick={() => onCliente(null)} aria-label="Desasociar" style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--color-subtle)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Icon name="x" size={15} /></button>
            </div>
          : <Button variant="secondary" icon="user-plus" onClick={() => onCliente('open')} style={{ width: '100%' }}>Asociar cliente</Button>}
      </div>

      {/* Items / empty */}
      <div style={{ flex: 1, overflowY: 'auto', padding: empty ? 0 : '0 16px' }}>
        {empty
          ? <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-surface-alt)', color: 'var(--color-muted)', display: 'grid', placeItems: 'center' }}><Icon name="shopping-cart" size={26} /></div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>Ticket vacío</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', maxWidth: 220, lineHeight: 1.45 }}>Empezá agregando un producto desde el catálogo.</div>
              </div>
            </div>
          : <>
              {items.map((it, i) => <TicketRow key={it.key} it={it} onDec={() => onDec(i)} onInc={() => onInc(i)} onRemove={() => onRemove(i)} />)}
              {promo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '8px 10px', borderRadius: 8, background: 'var(--color-primary-bg)' }}>
                  <Icon name="sparkles" size={14} color="var(--color-primary)" />
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-primary-h)' }}>Promo aplicada · {promo}</span>
                </div>
              )}
            </>}
      </div>

      {/* Discount zone — always visible */}
      <DiscountZone {...props} />

      {/* Totals + Cobrar */}
      <div style={{ padding: 16, borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <TotalsRow label="Subtotal" value={fmt(t.subtotal)} />
        {t.descTotal > 0 && <TotalsRow label="Descuentos" value={'− ' + fmt(t.descTotal)} color="var(--color-success)" />}
        {t.descProd > 0 && <TotalsRow indent label="Por producto" value={'− ' + fmt(t.descProd)} color="var(--color-success)" />}
        {t.descCupon > 0 && <TotalsRow indent label={`Cupón ${cupon.codigo}`} value={'− ' + fmt(t.descCupon)} color="var(--color-success)" />}
        {t.descManual > 0 && <TotalsRow indent label={`Manual −${manual.pct}%`} value={'− ' + fmt(t.descManual)} color="var(--color-success)" />}
        <TotalsRow label="IVA 21% (incl.)" value={fmt(t.iva)} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 8, borderTop: '1px dashed var(--color-border)' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>TOTAL</span>
          <span style={{ fontSize: 34, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em', color: 'var(--color-text)' }}>{fmt(t.total)}</span>
        </div>
        <button disabled={empty} onClick={onCobrar}
          style={{ height: 60, borderRadius: 12, border: 'none', marginTop: 4,
            background: empty ? 'var(--color-surface-alt)' : 'var(--color-primary)',
            color: empty ? 'var(--color-subtle)' : '#fff', cursor: empty ? 'not-allowed' : 'pointer',
            fontSize: 19, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: empty ? 'none' : '0 4px 12px rgba(59,130,246,0.35)', transition: 'background 150ms ease' }}>
          <Icon name="credit-card" size={22} strokeWidth={2} /> Cobrar {!empty && fmt(t.total)}
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" size="sm" icon="pause" onClick={onPausar} disabled={empty} style={{ flex: 1, border: '1px solid var(--color-border)' }}>Pausar venta</Button>
          <Button variant="ghost" size="sm" icon="x" onClick={onCancelar} disabled={empty} style={{ flex: 1, border: '1px solid var(--color-border)', color: 'var(--color-error)' }}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Ticket, QtyControl });
