// src/modules/ventas/panel/inventario/types/inventario.types.ts
// Tipos del módulo de inventario del panel admin.

export interface ProductoStock {
    id:       string
    nombre:   string
    cat:      string
    precio:   number
    stock:    number
    stockMin: number
    hue:      number
}

export interface Proveedor {
    nombre:        string
    contacto:      string
    tel:           string
    email:         string
    ultimaCompra:  string
    totalComprado: number
}

// Tipo de movimiento de stock (entrada, salida, ajuste).
export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste'

export interface Movimiento {
    id:       string
    fecha:    string
    producto: string
    tipo:     TipoMovimiento
    cantidad: number
    motivo:   string
    usuario:  string
    hue:      number
}
