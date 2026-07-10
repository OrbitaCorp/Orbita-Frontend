// src/modules/ventas/panel/inventario/mock/inventario.mock.ts
// TODO: eliminar cuando el backend esté listo.
// Stock, proveedores y movimientos de ejemplo — Rama Indumentaria.

import type { ProductoStock, Proveedor, Movimiento } from '../types/inventario.types'

export const PRODUCTOS_STOCK: ProductoStock[] = [
    { id: 'p1', nombre: 'Campera bomber beige arena', cat: 'Camperas',   precio: 89000, stock: 3,  stockMin: 5,  hue: 35  },
    { id: 'p2', nombre: 'Remera oversize negra',      cat: 'Remeras',    precio: 24900, stock: 18, stockMin: 10, hue: 220 },
    { id: 'p3', nombre: 'Buzo frisa con capucha',     cat: 'Buzos',      precio: 38500, stock: 7,  stockMin: 5,  hue: 215 },
    { id: 'p4', nombre: 'Pantalón cargo verde oliva', cat: 'Pantalones', precio: 48900, stock: 0,  stockMin: 5,  hue: 140 },
    { id: 'p5', nombre: 'Jean tiro medio celeste',    cat: 'Pantalones', precio: 56000, stock: 12, stockMin: 5,  hue: 200 },
    { id: 'p6', nombre: 'Jogger gris melange',        cat: 'Pantalones', precio: 34500, stock: 4,  stockMin: 5,  hue: 210 },
    { id: 'p7', nombre: 'Gorra trucker bordada',      cat: 'Accesorios', precio: 15900, stock: 24, stockMin: 10, hue: 30  },
    { id: 'p8', nombre: 'Remera básica blanca',       cat: 'Remeras',    precio: 18900, stock: 32, stockMin: 10, hue: 200 },
]

export const PROVEEDORES: Proveedor[] = [
    { nombre: 'Textiles Buenos Aires', contacto: 'Jorge Martín', tel: '+54 9 11 4567-8901', email: 'jorge@tba.com',    ultimaCompra: '2026-04-20', totalComprado: 840000 },
    { nombre: 'Indumentaria Norte',    contacto: 'Laura Vega',   tel: '+54 9 11 9876-5432', email: 'laura@inorte.com', ultimaCompra: '2026-03-15', totalComprado: 320000 },
]

export const MOVIMIENTOS: Movimiento[] = [
    { id: 'm1', fecha: '2026-05-17T11:20:00', producto: 'Remera oversize negra', tipo: 'salida',  cantidad: 2,  motivo: 'Venta #1284',        usuario: 'Alexander', hue: 220 },
    { id: 'm2', fecha: '2026-05-17T09:05:00', producto: 'Jean tiro medio celeste', tipo: 'entrada', cantidad: 12, motivo: 'Compra a proveedor', usuario: 'Rosa',      hue: 200 },
    { id: 'm3', fecha: '2026-05-16T18:40:00', producto: 'Campera bomber beige', tipo: 'ajuste',  cantidad: -1, motivo: 'Producto dañado',     usuario: 'Alexander', hue: 35  },
    { id: 'm4', fecha: '2026-05-16T15:10:00', producto: 'Gorra trucker bordada', tipo: 'entrada', cantidad: 24, motivo: 'Compra a proveedor', usuario: 'Rosa',      hue: 30  },
    { id: 'm5', fecha: '2026-05-16T12:30:00', producto: 'Buzo frisa con capucha', tipo: 'salida',  cantidad: 1,  motivo: 'Venta #1283',        usuario: 'Alexander', hue: 215 },
]
