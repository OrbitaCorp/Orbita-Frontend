// ─── Mock data for the POS kit ────────────────────────────────────────────────
window.POS_DATA = {
  categorias: ['Todos', 'Remeras', 'Pantalones', 'Calzado', 'Accesorios', 'Abrigos'],

  // Product thumbnails are simple tinted placeholders (no photos in the source product).
  // `variantes: true` → tapping the card opens the variant selector instead of adding directly.
  productos: [
    { id: 'p1', nombre: 'Remera básica', cat: 'Remeras',    precio: 8900,  sku: '7798-2210', stock: 24, fav: true,  icon: 'shirt', variantes: true },
    { id: 'p2', nombre: 'Remera oversize', cat: 'Remeras',  precio: 12500, sku: '7798-2211', stock: 8,  fav: true,  icon: 'shirt', variantes: true, descPct: 15 },
    { id: 'p3', nombre: 'Jean recto', cat: 'Pantalones',    precio: 28900, sku: '7798-3120', stock: 12, fav: true,  icon: 'package', variantes: true },
    { id: 'p4', nombre: 'Jogging', cat: 'Pantalones',       precio: 19900, sku: '7798-3121', stock: 0,  fav: false, icon: 'package' },
    { id: 'p5', nombre: 'Zapatilla urbana', cat: 'Calzado', precio: 45900, sku: '7798-4010', stock: 6,  fav: true,  icon: 'footprints', variantes: true },
    { id: 'p6', nombre: 'Borcego', cat: 'Calzado',          precio: 62000, sku: '7798-4011', stock: 3,  fav: false, icon: 'footprints' },
    { id: 'p7', nombre: 'Gorra trucker', cat: 'Accesorios', precio: 7400,  sku: '7798-5001', stock: 31, fav: false, icon: 'package' },
    { id: 'p8', nombre: 'Riñonera', cat: 'Accesorios',      precio: 13900, sku: '7798-5002', stock: 0,  fav: false, icon: 'package' },
    { id: 'p9', nombre: 'Buzo canguro', cat: 'Abrigos',     precio: 32900, sku: '7798-6001', stock: 15, fav: true,  icon: 'shirt' },
    { id: 'p10', nombre: 'Campera puffer', cat: 'Abrigos',  precio: 78000, sku: '7798-6002', stock: 4,  fav: false, icon: 'shirt' },
    { id: 'p11', nombre: 'Medias pack x3', cat: 'Accesorios', precio: 5900, sku: '7798-5010', stock: 50, fav: false, icon: 'package' },
    { id: 'p12', nombre: 'Camisa lino', cat: 'Remeras',     precio: 26500, sku: '7798-2230', stock: 9,  fav: false, icon: 'shirt' },
  ],

  // Variant matrix: stock per (talle × color). Used by the variant selector.
  talles: ['S', 'M', 'L', 'XL'],
  colores: [{ id: 'negro', label: 'Negro', hex: '#0F172A' }, { id: 'blanco', label: 'Blanco', hex: '#F8FAFC' }, { id: 'gris', label: 'Gris', hex: '#94A3B8' }],
  // stock[`${talle}-${color}`]; missing = 0
  varianteStock: {
    'S-negro': 4, 'S-blanco': 0, 'S-gris': 2,
    'M-negro': 8, 'M-blanco': 5, 'M-gris': 3,
    'L-negro': 6, 'L-blanco': 2, 'L-gris': 0,
    'XL-negro': 0, 'XL-blanco': 1, 'XL-gris': 0,
  },

  pausados: [
    { id: 't1', cliente: 'Lucía Fernández', hora: '14:22', items: 3, total: 41700 },
    { id: 't2', cliente: 'Sin cliente',      hora: '14:05', items: 1, total: 8900 },
    { id: 't3', cliente: 'Martín Rodríguez', hora: '13:48', items: 5, total: 118400 },
  ],

  clientes: [
    { nombre: 'María López',       dni: '35.412.876', tel: '11 5512-3344', compras: 12 },
    { nombre: 'Lucía Fernández',   dni: '34.221.890', tel: '11 4423-9087', compras: 4 },
    { nombre: 'Martín Rodríguez',  dni: '28.991.001', tel: '11 6677-2210', compras: 21 },
    { nombre: 'Carla Giménez',     dni: '40.118.220', tel: '11 3344-5566', compras: 0 },
  ],

  // Closing summary for the open session (C-0099)
  turno: {
    caja: 'C-0099', cajero: 'Alan Méndez', apertura: '29/05 14:31', inicial: 15000,
    ventasTotal: 336700, tickets: 26, devolCantidad: 1, devolMonto: 8900, ingresos: 5000, egresos: 2300,
    metodos: [
      { metodo: 'Efectivo',        cantidad: 12, total: 156400 },
      { metodo: 'Tarjeta débito',  cantidad: 8,  total: 94200 },
      { metodo: 'Tarjeta crédito', cantidad: 3,  total: 45600 },
      { metodo: 'Transferencia',   cantidad: 2,  total: 28000 },
      { metodo: 'QR',              cantidad: 1,  total: 12500 },
    ],
  },

  sesiones: [
    { id: 'C-0099', cajero: 'Alan M.',  apertura: '29/05 14:31', cierre: '—',           inicial: 15000, ventas: 336700, tickets: 26, dif: null,  estado: 'abierta' },
    { id: 'C-0098', cajero: 'Alan M.',  apertura: '29/05 09:02', cierre: '29/05 14:30', inicial: 12000, ventas: 248350, tickets: 19, dif: 0,     estado: 'cerrada' },
    { id: 'C-0097', cajero: 'Sofía R.', apertura: '28/05 09:15', cierre: '28/05 18:02', inicial: 12000, ventas: 412800, tickets: 31, dif: -1500, estado: 'cerrada' },
    { id: 'C-0096', cajero: 'Sofía R.', apertura: '27/05 09:08', cierre: '27/05 18:10', inicial: 10000, ventas: 389100, tickets: 28, dif: 1200,  estado: 'forzada' },
    { id: 'C-0095', cajero: 'Alan M.',  apertura: '26/05 09:00', cierre: '26/05 17:55', inicial: 12000, ventas: 301450, tickets: 24, dif: 0,     estado: 'cerrada' },
  ],

  // Original ticket lookup for devoluciones
  ticketOriginal: {
    nro: '#000812', fecha: '27/05 16:42', cliente: 'María López', total: 41400, metodo: 'Tarjeta crédito',
    items: [
      { id: 'p2', nombre: 'Remera oversize', variante: 'Talle M · Negro', precio: 12500, qty: 2, devuelto: 0 },
      { id: 'p7', nombre: 'Gorra trucker', variante: '', precio: 7400, qty: 2, devuelto: 1 },
    ],
  },
};

// es-AR currency formatter
window.fmt = (n) => '$\u00A0' + Math.round(n).toLocaleString('es-AR');
window.fmtPlain = (n) => Math.round(n).toLocaleString('es-AR');

// Long human date, e.g. "Jueves 29 de mayo · 14:31 hs"
window.fechaLarga = () => {
  const d = new Date();
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const hh = String(d.getHours()).padStart(2, '0'), mm = String(d.getMinutes()).padStart(2, '0');
  return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]} · ${hh}:${mm} hs`;
};

// Shared totals math so Ticket + Cobro modal never diverge.
// items: [{precio, qty, descPct?}], cupon: {codigo, pct}|null, manual: {pct}|null
window.computeTotals = (items, cupon, manual) => {
  const subtotal = items.reduce((s, it) => s + it.precio * it.qty, 0);
  const descProd = items.reduce((s, it) => s + (it.descPct ? Math.round(it.precio * it.qty * it.descPct / 100) : 0), 0);
  const base = subtotal - descProd;
  const descCupon = cupon ? Math.round(base * cupon.pct / 100) : 0;
  const descManual = manual ? Math.round(base * manual.pct / 100) : 0;
  const descTotal = descProd + descCupon + descManual;
  const total = subtotal - descTotal;
  const iva = Math.round(total - total / 1.21);
  return { subtotal, descProd, descCupon, descManual, descTotal, total, iva };
};
