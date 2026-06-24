# Tipos e interfaces — POS

> Referencia de [types.ts](../types.ts). Cada campo con su descripción y dónde se usa.
> Volver al [README](./README.md) · ver [arquitectura](./arquitectura.md).

Hay además tipos **locales** definidos fuera de `types.ts` (en hooks o componentes); van al final.

---

## Descuentos

### `Descuento`
```ts
interface Descuento {
  tipo: 'porcentaje' | 'monto_fijo'
  valor: number
  codigo?: string
  motivo?: string
}
```
| Campo | Descripción |
|-------|-------------|
| `tipo` | `'porcentaje'` aplica % sobre la base; `'monto_fijo'` resta un monto. |
| `valor` | Número del descuento (20 = 20% o $20 según tipo). |
| `codigo` | Código del cupón si proviene de uno. |
| `motivo` | Razón del descuento manual (opcional). |

Usado en: cupón y descuento manual del ticket ([ZonaDescuentos](../components/TicketPOS/ZonaDescuentos.tsx), `useTicketStore`), y descuento por item (campo previsto, sin UI).

---

## Ticket

### `TicketItem`
```ts
interface TicketItem {
  id: string                  // `${productoId}::${varianteId ?? 'base'}`
  productoId: string
  varianteId?: string
  nombre: string
  variante?: string
  cantidad: number
  precioUnitario: number
  precioEditado?: number
  descuento?: Descuento
  notas?: string
  esConcepto?: boolean        // ítem libre, no descuenta inventario
}
```
| Campo | Descripción |
|-------|-------------|
| `id` | Clave compuesta para agrupar líneas iguales. |
| `productoId` / `varianteId` | Referencias al producto y variante. |
| `nombre` | Nombre congelado del producto. |
| `variante` | Texto legible "Talle / Color". |
| `cantidad` | Unidades de la línea. |
| `precioUnitario` | Precio base. |
| `precioEditado` | Override de precio (campo previsto, sin UI). |
| `descuento` | Descuento por item (previsto, sin UI). |
| `notas` | Nota por item (previsto, sin UI). |
| `esConcepto` | true = ítem libre/servicio (previsto, sin UI). |

Usado en: ticket actual, pausados, devolución, post-venta.

### `TicketPausado`
```ts
interface TicketPausado {
  id: string
  items: TicketItem[]
  cliente: ClienteAsociado | null
  pausadoEn: string           // ISO date
  nota?: string
}
```
| Campo | Descripción |
|-------|-------------|
| `id` | `pausado-{timestamp}`. |
| `items` | Líneas guardadas. |
| `cliente` | Cliente asociado al pausar, si había. |
| `pausadoEn` | Fecha/hora ISO de la pausa. |
| `nota` | Nota opcional. |

Usado en: `usePausadosStore`, `DrawerPausados` (Flujo 3).

---

## Cliente

### `ClienteAsociado`
```ts
interface ClienteAsociado {
  id: string
  nombre: string
  dni: string
  telefono: string
  email?: string
}
```
DNI es el identificador de búsqueda. Estructuralmente igual a `ClienteBase` de `_shared/SelectorCliente` (se castea entre ambos). Usado en ticket, pausados, post-venta.

---

## Cobro

### `TipoMetodoPago` (union)
```ts
type TipoMetodoPago =
  | 'efectivo' | 'tarjeta_debito' | 'tarjeta_credito' | 'transferencia' | 'qr'
```
| Valor | Label |
|-------|-------|
| `efectivo` | Efectivo |
| `tarjeta_debito` | Tarjeta débito |
| `tarjeta_credito` | Tarjeta crédito |
| `transferencia` | Transferencia |
| `qr` | QR |

Labels en `LABELS_METODO` ([MetodoPago.tsx](../components/Cobro/MetodoPago.tsx)).

### `MetodoPago`
```ts
interface MetodoPago {
  tipo: TipoMetodoPago
  monto: number
  referencia?: string
}
```
| Campo | Descripción |
|-------|-------------|
| `tipo` | Método usado. |
| `monto` | Monto cubierto por ese método (clave en pago mixto). |
| `referencia` | Nº de operación de tarjeta/transferencia (opcional). |

### `ResultadoVenta`
```ts
interface ResultadoVenta {
  id: string
  numeroComprobante: string
  fecha: string
  items: TicketItem[]
  cliente: ClienteAsociado | null
  metodosPago: MetodoPago[]
  total: number
  vuelto?: number
}
```
Resultado congelado de una venta. Hoy se arma en `POScobro` (comprobante con contador local). Usado por `ModalPostVenta` y el mock de `useTickets`.

---

## Caja

### `EstadoCaja` (union)
```ts
type EstadoCaja = 'cerrada' | 'abierta'
```
Estado en `useCajaStore.estado`. ⚠️ Distinto de `SesionCaja.estado`, que admite también `'forzada'`.

### `SesionCaja`
```ts
interface SesionCaja {
  id: string
  cajero: { id: string; nombre: string }
  fechaApertura: string
  fechaCierre?: string
  montoInicial: number
  estado: 'abierta' | 'cerrada' | 'forzada'
  notas?: string
}
```
| Campo | Descripción |
|-------|-------------|
| `id` | `caja-{timestamp}`. |
| `cajero` | Quién abrió (id + nombre). |
| `fechaApertura` / `fechaCierre` | ISO; cierre ausente si sigue abierta. |
| `montoInicial` | Fondo de caja declarado. |
| `estado` | abierta / cerrada / forzada. |
| `notas` | Observaciones de apertura. |

Usado en apertura, cierre, historial.

### `TipoMovimiento` (union)
```ts
type TipoMovimiento = 'egreso' | 'ingreso'
```

### `MovimientoCaja`
```ts
interface MovimientoCaja {
  id: string
  tipo: TipoMovimiento
  monto: number
  motivo: string
  fecha: string
  cajeroId: string
}
```
Movimiento manual de efectivo. Usado en `ModalEgresoIngreso`, cierre e historial.

### `ResumenTurno` (tipo)
```ts
interface ResumenTurno {
  sesion: SesionCaja
  ventasTotales: number
  cantidadTickets: number
  desglosePago: Partial<Record<TipoMetodoPago, number>>
  movimientos: MovimientoCaja[]
  totalTeorico: number
}
```
⚠️ Definido en `types.ts` pero **no se usa**: el cierre y el historial computan sus propias estructuras (`DesgloseItem`, `FilaSesion`). Hay además un **componente** `ResumenTurno` (sin relación con este tipo).

---

## Catálogo / Productos

### `VariantePOS`
```ts
interface VariantePOS {
  id: string
  talle?: string
  color?: string
  stock: number
  precio?: number
}
```
Variante de un producto. `precio` opcional override del precio base.

### `ProductoPOS`
```ts
interface ProductoPOS {
  id: string
  nombre: string
  sku: string
  precio: number
  stock: number
  foto?: string
  categoriaId: string
  categoriaLabel?: string
  favorito?: boolean
  tieneVariantes: boolean
  variantes?: VariantePOS[]
}
```
| Campo | Descripción |
|-------|-------------|
| `precio` / `stock` | Precio base y stock total. |
| `foto` | URL (si falta, placeholder de ícono). |
| `categoriaId` / `categoriaLabel` | Categoría. |
| `favorito` | Aparece en la sección Favoritos. |
| `tieneVariantes` | Si true, el clic abre `ModalVariante`. |
| `variantes` | Detalle de variantes. |

Usado en catálogo y al agregar al ticket.

### `CategoriaPOS`
```ts
interface CategoriaPOS { id: string; label: string }
```
Chips de filtro en `FiltrosCatalogo`.

### `FiltrosCatalogoPOS`
```ts
interface FiltrosCatalogoPOS {
  busqueda?: string
  categoriaId?: string
  soloFavoritos?: boolean
}
```
Argumento de `useProductosPOS`.

---

## Totales

### `TotalesPOS`
```ts
interface TotalesPOS {
  subtotal: number
  descProductos: number
  descCupon: number
  descManual: number
  descTotal: number
  total: number
  iva: number
  cantidadItems: number
}
```
⚠️ Definido pero **no se usa**: `TicketPOS` calcula los totales con variables sueltas + `DescuentoDesglose[]`. Candidato a adoptar o eliminar.

---

## Modales

### `ModalPOS` (union)
```ts
type ModalPOS =
  | 'cobro' | 'postventa' | 'cliente' | 'variante'
  | 'devolucion' | 'egresoing' | 'descuento' | null
```
⚠️ Definido pero **no se usa**: `POScobro` maneja cada modal con su propio `useState` booleano, no con un enum central.

---

## Historial

### `FiltrosHistorial`
```ts
interface FiltrosHistorial {
  fechaDesde?: string
  fechaHasta?: string
  cajeroId?: string
  estado?: SesionCaja['estado']
  conDiferencia?: boolean
}
```
Estado de filtros de `POSHistorial`. El filtrado es client-side sobre `useHistorialCajas`.

---

## Tipos locales (fuera de types.ts)

| Tipo | Dónde | Para qué |
|------|-------|----------|
| `FilaSesion` | [hooks/useCaja.ts](../hooks/useCaja.ts) | Fila del historial: sesión + ventas + diferencia + desglose + movimientos. |
| `DescuentoDesglose` | [TicketTotales.tsx](../components/TicketPOS/TicketTotales.tsx) | `{ label, valor }` por línea de descuento. |
| `DesgloseItem` | [ResumenTurno.tsx](../components/Caja/ResumenTurno.tsx) | `{ tipo, cantidad, total }` por método en el cierre. |
| `ClienteBase` | [_shared/SelectorCliente.tsx](../../../_shared/components/SelectorCliente.tsx) | Igual a `ClienteAsociado`; se castea entre ambos. |
| `VarianteOpcion` | [_shared/SelectorVariante.tsx](../../../_shared/components/SelectorVariante.tsx) | Variante para el selector compartido. |
| `MetodoReembolso`, `MotivoDevolucion`, `ItemHistorial`, `TicketHistorial` | [ModalDevolucion.tsx](../components/Modales/ModalDevolucion.tsx) | Tipos del flujo de devolución (mock). |
