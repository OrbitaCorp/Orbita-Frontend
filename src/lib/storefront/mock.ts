import type { Producto, Categoria, ItemCarrito, Direccion, Pedido, TiendaConfig, Usuario, PedidoResumen } from './types'

export const TIENDA: TiendaConfig = {
  nombre:  'Rama Indumentaria',
  sub:     'Tu tienda de ropa contemporánea. Envíos a todo el país.',
  slug:    'rama',
  dominio: 'rama.orbita.site',
  wpp:     '5491112345678',
  email:   'hola@ramaindumentaria.com.ar',
}

export const CATEGORIAS: Categoria[] = [
  { id: 'remeras',    nombre: 'Remeras',    count: 5,  hue: 200 },
  { id: 'pantalones', nombre: 'Pantalones', count: 5,  hue: 215 },
  { id: 'buzos',      nombre: 'Buzos',      count: 3,  hue: 220 },
  { id: 'camperas',   nombre: 'Camperas',   count: 4,  hue: 35  },
  { id: 'accesorios', nombre: 'Accesorios', count: 3,  hue: 30  },
]

export const PRODUCTOS: Producto[] = [
  { id:'p1',  nombre:'Remera oversize negra',      cat:'Remeras',    precio:24900, precioAnt:null,   badge:'Nuevo',  hue:220, rating:4.9, stock:true  },
  { id:'p2',  nombre:'Pantalón cargo verde oliva', cat:'Pantalones', precio:48900, precioAnt:62000,  badge:'Oferta', hue:140, rating:4.7, stock:true  },
  { id:'p3',  nombre:'Buzo frisa con capucha',     cat:'Buzos',      precio:38500, precioAnt:null,   badge:null,     hue:220, rating:4.8, stock:true  },
  { id:'p4',  nombre:'Campera bomber beige arena', cat:'Camperas',   precio:89000, precioAnt:110000, badge:'Oferta', hue:35,  rating:4.6, stock:true  },
  { id:'p5',  nombre:'Remera básica blanca',       cat:'Remeras',    precio:18900, precioAnt:null,   badge:null,     hue:200, rating:4.5, stock:true  },
  { id:'p6',  nombre:'Jogger gris melange',        cat:'Pantalones', precio:34500, precioAnt:null,   badge:null,     hue:210, rating:4.4, stock:true  },
  { id:'p7',  nombre:'Buzo sin capucha crema',     cat:'Buzos',      precio:32000, precioAnt:40000,  badge:'Oferta', hue:45,  rating:4.6, stock:true  },
  { id:'p8',  nombre:'Campera cortaviento azul',   cat:'Camperas',   precio:67000, precioAnt:null,   badge:null,     hue:215, rating:4.7, stock:true  },
  { id:'p9',  nombre:'Remera estampada gráfica',   cat:'Remeras',    precio:27500, precioAnt:null,   badge:'Nuevo',  hue:280, rating:4.8, stock:true  },
  { id:'p10', nombre:'Gorra trucker bordada',      cat:'Accesorios', precio:15900, precioAnt:null,   badge:'Nuevo',  hue:30,  rating:4.5, stock:true  },
  { id:'p11', nombre:'Jean tiro medio celeste',    cat:'Pantalones', precio:56000, precioAnt:68000,  badge:'Oferta', hue:200, rating:4.5, stock:true  },
  { id:'p12', nombre:'Remera orgánica oversize',   cat:'Remeras',    precio:26900, precioAnt:null,   badge:null,     hue:195, rating:4.6, stock:true  },
]

export const CARRITO_INICIAL: ItemCarrito[] = [
  { id:'p3',  nombre:'Buzo frisa con capucha',   variante:'Azul marino · Talle M',  qty:1, precio:38500, precioAnt:null,  hue:220 },
  { id:'p12', nombre:'Remera orgánica oversize',  variante:'Negro · Talle L',         qty:2, precio:26900, precioAnt:32000, hue:195 },
  { id:'p10', nombre:'Gorra trucker bordada',     variante:'Terracota · Talle único', qty:1, precio:15900, precioAnt:null,  hue:30  },
]

export const DIRECCIONES: Direccion[] = [
  { id:'d1', alias:'Casa',    calle:'Av. Corrientes 1234', piso:'Piso 5 · Depto B', ciudad:'CABA', cp:'C1043AAZ', default:true  },
  { id:'d2', alias:'Trabajo', calle:'Paraguay 857',        piso:'Piso 2',           ciudad:'CABA', cp:'C1057AAH', default:false },
]

export const USUARIO_MOCK: Usuario = {
  nombre:   'María',
  apellido: 'Fernández',
  email:    'maria@mail.com',
  telefono: '+54 9 11 2345-6789',
  avatar:   'MF',
  miembro:  'Mayo 2025',
}

export const HISTORIAL_MOCK: PedidoResumen[] = [
  { id: 'ORB-2847', fecha: '17 may 2026', total: 92280,  items: 4, estado: 'En preparación', estadoTipo: 'warning' },
  { id: 'ORB-2610', fecha: '03 abr 2026', total: 47800,  items: 2, estado: 'Entregado',       estadoTipo: 'success' },
  { id: 'ORB-2391', fecha: '12 feb 2026', total: 24900,  items: 1, estado: 'Entregado',       estadoTipo: 'success' },
  { id: 'ORB-2104', fecha: '28 ene 2026', total: 134700, items: 3, estado: 'Cancelado',       estadoTipo: 'error'   },
]

export const PEDIDO_MOCK: Pedido = {
  id:         'ORB-2847',
  fecha:      '17 may 2026 · 14:32',
  total:      92280,
  items:      4,
  tracking:   'AR3489573',
  metodoPago: 'Mercado Pago',
  comprador:  {
    nombre:    'María Fernández',
    email:     'maria@mail.com',
    telefono:  '+54 9 11 2345-6789',
    direccion: 'Av. Corrientes 1234, Piso 5 B · CABA C1043AAZ',
  },
  timeline: [
    { label:'Pendiente',       done:true,  fecha:'17 may · 14:32' },
    { label:'Confirmado',      done:true,  fecha:'17 may · 14:33' },
    { label:'En preparación',  done:true,  fecha:'17 may · 15:10' },
    { label:'Enviado',         done:false, fecha:'Est. 18 may'    },
    { label:'Entregado',       done:false, fecha:'Est. 19 may'    },
  ],
}
