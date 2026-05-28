// mock/dashboard.mock.ts
// TODO: eliminar cuando el backend esté listo.
// Reemplazar en Dashboard.tsx el bloque mock por useFetch.

import type { BadgeStatus } from '@/design-system/components/Badge'
import type { Periodo } from '@/design-system/components/PeriodoSelector'

export type TipoAlerta =
    | 'stock_critico'
    | 'stock_sin_stock'
    | 'pedidos_demora'
    | 'pagos_pendientes'
    | 'devoluciones'

export interface DashboardData {
    kpis: {
        ventas: { actual: number; delta: number }
        pedidos: { actual: number; delta: number; pendientes: number }
        productos: { actual: number; delta: number }
        clientes: { actual: number; delta: number }
    }
    serieVentas: {
        labels: string[]
        valores: number[]
        rawDates: string[]
    }
    seriePedidos: {
        labels: string[]
        estados: Record<'pendiente' | 'confirmado' | 'preparacion' | 'enviado' | 'cancelado', number[]>
    }
    topProductos: {
        sku: string
        nombre: string
        unidades: number
        monto: number
        hue: number
    }[]
    // Una alerta por tipo, con contador de cuántos casos hay
    alertas: {
        id: string
        tipo: TipoAlerta
        nivel: 'warning' | 'danger'
        titulo: string
        descripcion: string   // resumen: "3 productos", "2 pedidos", etc.
        count: number   // cuántos casos hay — backend lo calcula
        path: string   // a dónde ir para ver todos
        timestamp: string   // cuándo se detectó el primero
    }[]
    actividadReciente: {
        id: string
        cliente: string
        monto: number
        estado: BadgeStatus
        hora: string
    }[]
}

export const MOCK: Record<Periodo, DashboardData> = {
    hoy: {
        kpis: {
            ventas: { actual: 124300, delta: 18.2 },
            pedidos: { actual: 12, delta: 9.0, pendientes: 3 },
            productos: { actual: 28, delta: 14.2 },
            clientes: { actual: 4, delta: 33.3 },
        },
        serieVentas: {
            labels: ['00h', '03h', '06h', '09h', '12h', '15h', '18h', '21h'],
            valores: [0, 1800, 4200, 18500, 41200, 64800, 89400, 124300],
            rawDates: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
        },
        seriePedidos: {
            labels: ['00h', '03h', '06h', '09h', '12h', '15h', '18h', '21h'],
            estados: {
                pendiente: [0, 0, 1, 2, 4, 3, 2, 1],
                confirmado: [0, 0, 1, 3, 5, 4, 3, 2],
                preparacion: [0, 0, 0, 2, 3, 4, 3, 1],
                enviado: [0, 0, 0, 1, 2, 3, 4, 2],
                cancelado: [0, 0, 0, 0, 1, 0, 1, 0],
            },
        },
        topProductos: [
            { sku: 'RM-OVR-NG', nombre: 'Remera oversize negra', unidades: 48, monto: 552000, hue: 220 },
            { sku: 'BZ-CAP-AZ', nombre: 'Buzo capucha azul', unidades: 32, monto: 720000, hue: 240 },
            { sku: 'ZP-URB-BL', nombre: 'Zapatillas urbanas blancas', unidades: 24, monto: 1077600, hue: 50 },
            { sku: 'PT-CRG-VR', nombre: 'Pantalón cargo verde', unidades: 21, monto: 396900, hue: 145 },
            { sku: 'GR-TKR-NG', nombre: 'Gorra trucker urbana', unidades: 19, monto: 133000, hue: 30 },
        ],
        alertas: [
    {
        id:          'stock-critico',
        tipo:        'stock_critico',
        nivel:       'warning',
        titulo:      'Stock crítico',
        descripcion: '3 productos por debajo del umbral mínimo',
        count:       3,
        path:        '/ventas/inventario?filtro=critico',
        timestamp:   'hace 12 min',
    },
    {
        id:          'sin-stock',
        tipo:        'stock_sin_stock',
        nivel:       'danger',
        titulo:      'Sin stock',
        descripcion: '2 productos agotados con pedidos activos',
        count:       2,
        path:        '/ventas/inventario?filtro=sin-stock',
        timestamp:   'hace 30 min',
    },
    {
        id:          'pedidos-demora',
        tipo:        'pedidos_demora',
        nivel:       'danger',
        titulo:      'Pedidos sin atender',
        descripcion: '4 pedidos esperan atención hace más de 1 hora',
        count:       4,
        path:        '/ventas/pedidos?estado=pendiente',
        timestamp:   'hace 1h 8min',
    },
    {
        id:          'pagos-pendientes',
        tipo:        'pagos_pendientes',
        nivel:       'warning',
        titulo:      'Pagos por confirmar',
        descripcion: '2 transferencias esperando confirmación manual',
        count:       2,
        path:        '/ventas/pedidos?estado=pago_pendiente',
        timestamp:   'hace 45 min',
    },
    {
        id:          'devoluciones',
        tipo:        'devoluciones',
        nivel:       'warning',
        titulo:      'Devoluciones pendientes',
        descripcion: '1 devolución solicitada sin resolver',
        count:       1,
        path:        '/ventas/orders/returns',
        timestamp:   'hace 2h',
    },
],
        actividadReciente: [
            { id: 'ORB-2848', cliente: 'María Fernández', monto: 41900, estado: 'pendiente', hora: '14:32' },
            { id: 'ORB-2847', cliente: 'Sofía Martínez', monto: 41500, estado: 'enviado', hora: '13:45' },
            { id: 'ORB-2846', cliente: 'Lucas Giménez', monto: 89000, estado: 'en-proceso', hora: '12:18' },
            { id: 'ORB-2845', cliente: 'Valentina Sosa', monto: 42600, estado: 'confirmado', hora: '11:50' },
            { id: 'ORB-2843', cliente: 'Benjamín Castro', monto: 14700, estado: 'completado', hora: '11:05' },
        ],
    },
    semana: {
        kpis: {
            ventas: { actual: 1112300, delta: 21.0 },
            pedidos: { actual: 84, delta: 15.0, pendientes: 7 },
            productos: { actual: 196, delta: 17.4 },
            clientes: { actual: 18, delta: 28.5 },
        },
        serieVentas: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            valores: [142500, 87200, 168900, 92400, 211200, 285800, 124300],
            rawDates: ['11 may', '12 may', '13 may', '14 may', '15 may', '16 may', '17 may'],
        },
        seriePedidos: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            estados: {
                pendiente: [3, 2, 4, 2, 5, 8, 4],
                confirmado: [5, 3, 6, 4, 7, 11, 6],
                preparacion: [4, 3, 5, 3, 6, 9, 5],
                enviado: [6, 4, 7, 5, 8, 12, 7],
                cancelado: [1, 0, 1, 0, 2, 1, 0],
            },
        },
        topProductos: [
            { sku: 'RM-OVR-NG', nombre: 'Remera oversize negra', unidades: 48, monto: 552000, hue: 220 },
            { sku: 'BZ-CAP-AZ', nombre: 'Buzo capucha azul', unidades: 32, monto: 720000, hue: 240 },
            { sku: 'ZP-URB-BL', nombre: 'Zapatillas urbanas blancas', unidades: 24, monto: 1077600, hue: 50 },
            { sku: 'PT-CRG-VR', nombre: 'Pantalón cargo verde', unidades: 21, monto: 396900, hue: 145 },
            { sku: 'GR-TKR-NG', nombre: 'Gorra trucker urbana', unidades: 19, monto: 133000, hue: 30 },
        ],
        alertas: [
    {
        id:          'stock-critico',
        tipo:        'stock_critico',
        nivel:       'warning',
        titulo:      'Stock crítico',
        descripcion: '3 productos por debajo del umbral mínimo',
        count:       3,
        path:        '/ventas/inventario?filtro=critico',
        timestamp:   'hace 12 min',
    },
  
],
        actividadReciente: [
            { id: 'ORB-2848', cliente: 'María Fernández', monto: 41900, estado: 'pendiente', hora: '14:32' },
            { id: 'ORB-2847', cliente: 'Sofía Martínez', monto: 41500, estado: 'enviado', hora: '13:45' },
            { id: 'ORB-2846', cliente: 'Lucas Giménez', monto: 89000, estado: 'en-proceso', hora: '12:18' },
            { id: 'ORB-2845', cliente: 'Valentina Sosa', monto: 42600, estado: 'confirmado', hora: '11:50' },
            { id: 'ORB-2843', cliente: 'Benjamín Castro', monto: 14700, estado: 'completado', hora: '11:05' },
        ],
    },
    mes: {
        kpis: {
            ventas: { actual: 3480400, delta: 14.8 },
            pedidos: { actual: 312, delta: 11.2, pendientes: 24 },
            productos: { actual: 742, delta: 12.6 },
            clientes: { actual: 78, delta: 19.6 },
        },
        serieVentas: {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            valores: [682400, 794500, 891200, 1112300],
            rawDates: ['1-7 may', '8-14 may', '15-21 may', '22-28 may'],
        },
        seriePedidos: {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            estados: {
                pendiente: [18, 22, 26, 31],
                confirmado: [28, 33, 38, 46],
                preparacion: [24, 28, 32, 39],
                enviado: [32, 36, 41, 50],
                cancelado: [5, 4, 6, 8],
            },
        },
        topProductos: [
            { sku: 'RM-OVR-NG', nombre: 'Remera oversize negra', unidades: 48, monto: 552000, hue: 220 },
            { sku: 'BZ-CAP-AZ', nombre: 'Buzo capucha azul', unidades: 32, monto: 720000, hue: 240 },
            { sku: 'ZP-URB-BL', nombre: 'Zapatillas urbanas blancas', unidades: 24, monto: 1077600, hue: 50 },
            { sku: 'PT-CRG-VR', nombre: 'Pantalón cargo verde', unidades: 21, monto: 396900, hue: 145 },
            { sku: 'GR-TKR-NG', nombre: 'Gorra trucker urbana', unidades: 19, monto: 133000, hue: 30 },
        ],
        alertas: [
    {
        id:          'stock-critico',
        tipo:        'stock_critico',
        nivel:       'warning',
        titulo:      'Stock crítico',
        descripcion: '3 productos por debajo del umbral mínimo',
        count:       3,
        path:        '/ventas/inventario?filtro=critico',
        timestamp:   'hace 12 min',
    },
    {
        id:          'sin-stock',
        tipo:        'stock_sin_stock',
        nivel:       'danger',
        titulo:      'Sin stock',
        descripcion: '2 productos agotados con pedidos activos',
        count:       2,
        path:        '/ventas/inventario?filtro=sin-stock',
        timestamp:   'hace 30 min',
    },
    {
        id:          'pedidos-demora',
        tipo:        'pedidos_demora',
        nivel:       'danger',
        titulo:      'Pedidos sin atender',
        descripcion: '4 pedidos esperan atención hace más de 1 hora',
        count:       4,
        path:        '/ventas/pedidos?estado=pendiente',
        timestamp:   'hace 1h 8min',
    },

 
],
        actividadReciente: [
            { id: 'ORB-2848', cliente: 'María Fernández', monto: 41900, estado: 'pendiente', hora: '14:32' },
            { id: 'ORB-2847', cliente: 'Sofía Martínez', monto: 41500, estado: 'enviado', hora: '13:45' },
            { id: 'ORB-2846', cliente: 'Lucas Giménez', monto: 89000, estado: 'en-proceso', hora: '12:18' },
            { id: 'ORB-2845', cliente: 'Valentina Sosa', monto: 42600, estado: 'confirmado', hora: '11:50' },
            { id: 'ORB-2843', cliente: 'Benjamín Castro', monto: 14700, estado: 'completado', hora: '11:05' },
        ],
    },
    custom: {
        kpis: {
            ventas: { actual: 1112300, delta: 21.0 },
            pedidos: { actual: 84, delta: 15.0, pendientes: 7 },
            productos: { actual: 196, delta: 17.4 },
            clientes: { actual: 18, delta: 28.5 },
        },
        serieVentas: {
            labels: ['L 11', 'M 12', 'M 13', 'J 14', 'V 15', 'S 16', 'D 17'],
            valores: [142500, 87200, 168900, 92400, 211200, 285800, 124300],
            rawDates: ['11 may', '12 may', '13 may', '14 may', '15 may', '16 may', '17 may'],
        },
        seriePedidos: {
            labels: ['L 11', 'M 12', 'M 13', 'J 14', 'V 15', 'S 16', 'D 17'],
            estados: {
                pendiente: [3, 2, 4, 2, 5, 8, 4],
                confirmado: [5, 3, 6, 4, 7, 11, 6],
                preparacion: [4, 3, 5, 3, 6, 9, 5],
                enviado: [6, 4, 7, 5, 8, 12, 7],
                cancelado: [1, 0, 1, 0, 2, 1, 0],
            },
        },
        topProductos: [
            { sku: 'RM-OVR-NG', nombre: 'Remera oversize negra', unidades: 48, monto: 552000, hue: 220 },
            { sku: 'BZ-CAP-AZ', nombre: 'Buzo capucha azul', unidades: 32, monto: 720000, hue: 240 },
            { sku: 'ZP-URB-BL', nombre: 'Zapatillas urbanas blancas', unidades: 24, monto: 1077600, hue: 50 },
            { sku: 'PT-CRG-VR', nombre: 'Pantalón cargo verde', unidades: 21, monto: 396900, hue: 145 },
            { sku: 'GR-TKR-NG', nombre: 'Gorra trucker urbana', unidades: 19, monto: 133000, hue: 30 },
        ],
        alertas: [
    {
        id:          'stock-critico',
        tipo:        'stock_critico',
        nivel:       'warning',
        titulo:      'Stock crítico',
        descripcion: '3 productos por debajo del umbral mínimo',
        count:       3,
        path:        '/ventas/inventario?filtro=critico',
        timestamp:   'hace 12 min',
    },
    {
        id:          'sin-stock',
        tipo:        'stock_sin_stock',
        nivel:       'danger',
        titulo:      'Sin stock',
        descripcion: '2 productos agotados con pedidos activos',
        count:       2,
        path:        '/ventas/inventario?filtro=sin-stock',
        timestamp:   'hace 30 min',
    },
    {
        id:          'pedidos-demora',
        tipo:        'pedidos_demora',
        nivel:       'danger',
        titulo:      'Pedidos sin atender',
        descripcion: '4 pedidos esperan atención hace más de 1 hora',
        count:       4,
        path:        '/ventas/pedidos?estado=pendiente',
        timestamp:   'hace 1h 8min',
    },
    {
        id:          'pagos-pendientes',
        tipo:        'pagos_pendientes',
        nivel:       'warning',
        titulo:      'Pagos por confirmar',
        descripcion: '2 transferencias esperando confirmación manual',
        count:       2,
        path:        '/ventas/pedidos?estado=pago_pendiente',
        timestamp:   'hace 45 min',
    },
    
],
        actividadReciente: [
            { id: 'ORB-2848', cliente: 'María Fernández', monto: 41900, estado: 'pendiente', hora: '14:32' },
            { id: 'ORB-2847', cliente: 'Sofía Martínez', monto: 41500, estado: 'enviado', hora: '13:45' },
            { id: 'ORB-2846', cliente: 'Lucas Giménez', monto: 89000, estado: 'en-proceso', hora: '12:18' },
            { id: 'ORB-2845', cliente: 'Valentina Sosa', monto: 42600, estado: 'confirmado', hora: '11:50' },
            { id: 'ORB-2843', cliente: 'Benjamín Castro', monto: 14700, estado: 'completado', hora: '11:05' },
        ],
    },
}