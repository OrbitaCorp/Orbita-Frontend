// src/modules/ventas/admin/descuentos/mock/descuentos.mock.ts
// TODO: eliminar cuando el backend esté listo.
// Cupones y promociones automáticas de ejemplo — Rama Indumentaria.

export type TipoCupon = 'porcentaje' | 'fijo'

export interface Cupon {
    codigo: string
    tipo:   TipoCupon
    valor:  number
    usos:   number
    limite: number
    activo: boolean
    vence:  string
}

export const CUPONES: Cupon[] = [
    { codigo: 'ORBITA10', tipo: 'porcentaje', valor: 10,   usos: 24, limite: 100, activo: true,  vence: '2026-06-30' },
    { codigo: 'ENVIO',    tipo: 'fijo',       valor: 5000, usos: 8,  limite: 50,  activo: true,  vence: '2026-05-31' },
    { codigo: 'VERANO25', tipo: 'porcentaje', valor: 25,   usos: 67, limite: 50,  activo: false, vence: '2026-03-31' },
]

export interface Promo {
    nombre:    string
    condicion: string
    descuento: string
    activo:    boolean
}

export const PROMOS: Promo[] = [
    { nombre: '2×1 en Remeras',     condicion: 'Comprá 2 remeras',          descuento: 'La segunda al 50%', activo: true  },
    { nombre: 'Envío gratis +$50K', condicion: 'Pedidos mayores a $50.000', descuento: 'Envío sin cargo',   activo: true  },
    { nombre: '10% clientes VIP',   condicion: 'Segmento VIP automático',   descuento: '10% en todo',       activo: false },
]
