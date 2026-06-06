// src/modules/ventas/admin/pos/mock/pos.mock.ts
// TODO: eliminar cuando el backend esté listo.
// Cupones del POS e historial de cajas — Rama Indumentaria.

export interface CuponPOS {
    codigo:        string
    tipo:          '%' | '$'
    valor:         number
    desc:          string
    activo:        boolean
    usosRestantes: number
    soloVip?:      boolean
}

export const CUPONES_POS: CuponPOS[] = [
    { codigo: 'ORBITA10', tipo: '%', valor: 10,   desc: '10% off en todo',       activo: true,  usosRestantes: 76 },
    { codigo: 'ENVIO',    tipo: '$', valor: 5000, desc: '$5.000 de descuento',   activo: true,  usosRestantes: 42 },
    { codigo: 'VIP20',    tipo: '%', valor: 20,   desc: '20% clientes VIP',      activo: true,  usosRestantes: 999, soloVip: true },
    { codigo: 'VERANO25', tipo: '%', valor: 25,   desc: '25% off (vencido)',     activo: false, usosRestantes: 0 },
]

export type EstadoCaja = 'ok' | 'warn'

export interface Caja {
    id:       string
    cajero:   string
    apertura: string
    cierre:   string
    ventas:   number
    estado:   EstadoCaja
}

export const CAJAS: Caja[] = [
    { id: '#C-0042', cajero: 'Alexander', apertura: '17 may · 09:00', cierre: '17 may · 18:30', ventas: 248900, estado: 'ok'   },
    { id: '#C-0041', cajero: 'Rosa',      apertura: '16 may · 09:15', cierre: '16 may · 18:30', ventas: 142800, estado: 'warn' },
    { id: '#C-0040', cajero: 'Alexander', apertura: '15 may · 09:00', cierre: '15 may · 18:45', ventas: 198400, estado: 'ok'   },
    { id: '#C-0039', cajero: 'Rosa',      apertura: '14 may · 09:00', cierre: '14 may · 18:30', ventas: 176200, estado: 'ok'   },
    { id: '#C-0038', cajero: 'Alexander', apertura: '13 may · 09:10', cierre: '13 may · 18:30', ventas: 211800, estado: 'ok'   },
    { id: '#C-0037', cajero: 'Rosa',      apertura: '12 may · 09:00', cierre: '12 may · 18:30', ventas: 164500, estado: 'warn' },
]
