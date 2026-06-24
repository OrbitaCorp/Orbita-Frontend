// src/modules/ventas/panel/clientes/mock/clientes.mock.ts
// TODO: eliminar cuando el backend esté listo.
// Datos de ejemplo de clientes — Rama Indumentaria.

import type { Cliente } from '../types/clientes.types'

export const MOCK_CLIENTES: Cliente[] = [
    { id: 'c1',  nombre: 'María Fernández',        email: 'maria.f@gmail.com',    tel: '+54 9 11 5432-1098', pedidos: 8,  gasto: 248900, ticket: 31113, ultima: '2026-05-17', segmento: 'vip',        tags: ['fiel', 'alto valor'] },
    { id: 'c2',  nombre: 'Joaquín Pérez Iglesias', email: 'joaco.p@hotmail.com',  tel: '+54 9 11 4321-9876', pedidos: 4,  gasto: 89500,  ticket: 22375, ultima: '2026-05-17', segmento: 'recurrente', tags: ['online'] },
    { id: 'c3',  nombre: 'Camila Rodríguez',       email: 'cami.rod@gmail.com',   tel: '+54 9 11 7654-3210', pedidos: 2,  gasto: 38400,  ticket: 19200, ultima: '2026-05-17', segmento: 'nuevo',      tags: [] },
    { id: 'c4',  nombre: 'Lucas Giménez',          email: 'lucas.g@outlook.com',  tel: '+54 9 11 2345-6789', pedidos: 12, gasto: 480200, ticket: 40017, ultima: '2026-05-17', segmento: 'vip',        tags: ['fiel', 'mayorista'] },
    { id: 'c5',  nombre: 'Sofía Martínez',         email: 'sofi.mtz@gmail.com',   tel: '+54 9 11 8765-4321', pedidos: 3,  gasto: 67200,  ticket: 22400, ultima: '2026-05-16', segmento: 'recurrente', tags: [] },
    { id: 'c6',  nombre: 'Valentina Sosa',         email: 'valen.sosa@gmail.com', tel: '+54 9 11 3456-7890', pedidos: 1,  gasto: 42600,  ticket: 42600, ultima: '2026-04-15', segmento: 'inactivo',   tags: [] },
    { id: 'c7',  nombre: 'Benjamín Castro',        email: 'benja.c@gmail.com',    tel: '+54 9 11 9876-5432', pedidos: 6,  gasto: 182400, ticket: 30400, ultima: '2026-05-10', segmento: 'recurrente', tags: ['online'] },
    { id: 'c8',  nombre: 'Florencia Romero',       email: 'flor.r@gmail.com',     tel: '+54 9 11 5678-1234', pedidos: 2,  gasto: 56800,  ticket: 28400, ultima: '2026-05-14', segmento: 'nuevo',      tags: [] },
    { id: 'c9',  nombre: 'Diego Pereyra',          email: 'diego.p@gmail.com',    tel: '+54 9 11 2468-1357', pedidos: 9,  gasto: 312600, ticket: 34733, ultima: '2026-05-15', segmento: 'vip',        tags: ['fiel'] },
    { id: 'c10', nombre: 'Julieta Domínguez',      email: 'juli.dom@gmail.com',   tel: '+54 9 11 1357-2468', pedidos: 1,  gasto: 24900,  ticket: 24900, ultima: '2026-05-16', segmento: 'nuevo',      tags: [] },
]
