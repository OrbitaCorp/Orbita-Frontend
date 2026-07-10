// src/modules/ventas/panel/reportes/mock/reportes.mock.ts
// TODO: eliminar cuando el backend esté listo.
// Series y rankings de ejemplo para los reportes — Rama Indumentaria.

export const SERIE_VENTAS = {
    labels:  ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    valores: [142500, 87200, 168900, 92400, 211200, 285800, 124300],
}

export interface TopProducto {
    sku:      string
    nombre:   string
    unidades: number
    monto:    number
    hue:      number
}

export const TOP_PRODUCTOS: TopProducto[] = [
    { sku: 'CB-BMR-BG', nombre: 'Campera bomber beige', unidades: 24, monto: 2136000, hue: 35  },
    { sku: 'RM-OVR-NG', nombre: 'Remera oversize negra', unidades: 41, monto: 1020900, hue: 220 },
    { sku: 'BZ-FRS-CP', nombre: 'Buzo frisa capucha',    unidades: 18, monto: 693000,  hue: 215 },
    { sku: 'JN-TRO-CL', nombre: 'Jean tiro celeste',     unidades: 15, monto: 840000,  hue: 200 },
    { sku: 'JG-GRS-ML', nombre: 'Jogger gris melange',   unidades: 12, monto: 414000,  hue: 210 },
]
