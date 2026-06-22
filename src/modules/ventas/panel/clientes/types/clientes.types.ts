// src/modules/ventas/admin/clientes/types/clientes.types.ts
// Tipos del módulo de clientes del panel admin.

export type Segmento = 'vip' | 'recurrente' | 'nuevo' | 'inactivo'

export interface Cliente {
    id:       string
    nombre:   string
    email:    string
    tel:      string
    pedidos:  number
    gasto:    number
    ticket:   number
    ultima:   string   // ISO date — última compra
    segmento: Segmento
    tags:     string[]
}
