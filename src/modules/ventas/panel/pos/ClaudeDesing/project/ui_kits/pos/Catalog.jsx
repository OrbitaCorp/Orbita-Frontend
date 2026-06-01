// ─── Catalog (left column of Cobro rápido) ────────────────────────────────────

function ProductThumb({ icon, dim }) {
  return (
    <div style={{ width: '100%', aspectRatio: '1.4', borderRadius: 8, background: 'var(--color-surface-alt)',
      display: 'grid', placeItems: 'center', color: 'var(--color-subtle)', opacity: dim ? 0.5 : 1 }}>
      <Icon name={icon} size={26} />
    </div>
  );
}

function ProductCard({ p, onAdd }) {
  const [hover, setHover] = React.useState(false);
  const out = p.stock === 0;
  return (
    <button disabled={out} onClick={() => onAdd(p)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ textAlign: 'left', padding: 8, borderRadius: 12, fontFamily: 'inherit',
        background: out ? 'var(--color-surface-alt)' : 'var(--color-bg)', cursor: out ? 'not-allowed' : 'pointer',
        border: `1px solid ${hover && !out ? 'var(--color-border-strong)' : 'var(--color-border)'}`,
        boxShadow: out ? 'none' : (hover ? 'var(--shadow-card)' : 'var(--shadow-sm)'),
        transform: hover && !out ? 'translateY(-1px)' : 'none',
        transition: 'box-shadow 200ms ease, border-color 150ms ease, transform 200ms ease',
        opacity: out ? 0.45 : 1, filter: out ? 'grayscale(0.4)' : 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ProductThumb icon={p.icon} dim={out} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', lineHeight: 1.3 }}>{p.nombre}</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>{fmt(p.precio)}</span>
          {out
            ? <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-subtle)' }}>Sin stock</span>
            : <span style={{ fontSize: 11, color: p.stock <= 5 ? 'var(--color-warning)' : 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>{p.stock} u.</span>}
        </div>
      </div>
    </button>
  );
}

function CategoryChips({ active, onPick }) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
      {POS_DATA.categorias.map(c => {
        const on = c === active;
        return (
          <button key={c} onClick={() => onPick(c)}
            style={{ flexShrink: 0, height: 32, padding: '0 14px', borderRadius: 9999, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'background 150ms ease',
              background: on ? 'var(--color-primary)' : 'var(--color-bg)',
              color: on ? '#fff' : 'var(--color-body)',
              border: `1px solid ${on ? 'var(--color-primary)' : 'var(--color-border)'}` }}>
            {c}
          </button>
        );
      })}
    </div>
  );
}

function Catalog({ onAdd, onItemLibre }) {
  const [cat, setCat] = React.useState('Todos');
  const [q, setQ] = React.useState('');
  const productos = POS_DATA.productos.filter(p =>
    (cat === 'Todos' || p.cat === cat) &&
    (q === '' || p.nombre.toLowerCase().includes(q.toLowerCase()) || p.sku.includes(q)));
  const favoritos = POS_DATA.productos.filter(p => p.fav && p.stock > 0);
  const showFavs = cat === 'Todos' && q === '';
  // When Favoritos is shown, don't repeat those products in the grid below.
  const grid = showFavs ? productos.filter(p => !(p.fav && p.stock > 0)) : productos;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-subtle)' }}><Icon name="search" size={18} /></span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, código o SKU..."
            style={{ width: '100%', height: 48, padding: '0 14px 0 42px', fontSize: 15, borderRadius: 10, outline: 'none',
              background: 'var(--color-bg)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)', fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>
        <Button variant="outline" size="lg" icon="plus" onClick={onItemLibre} style={{ flexShrink: 0 }}>Ítem libre</Button>
      </div>

      <CategoryChips active={cat} onPick={setCat} />

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, marginRight: -4 }}>
        {showFavs && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Icon name="star" size={14} color="var(--color-warning)" />
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Favoritos</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
              {favoritos.map(p => <ProductCard key={p.id} p={p} onAdd={onAdd} />)}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>
            {showFavs ? 'Todos los productos' : cat === 'Todos' ? 'Resultados' : cat} · {grid.length}
          </span>
        </div>
        {grid.length === 0
          ? <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-muted)', fontSize: 14 }}>Sin resultados para “{q}”.</div>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
              {grid.map(p => <ProductCard key={p.id} p={p} onAdd={onAdd} />)}
            </div>}
      </div>
    </div>
  );
}

Object.assign(window, { Catalog });
