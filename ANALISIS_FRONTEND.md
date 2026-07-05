# Análisis Frontend → Modelo de datos (`src/modules/ventas/`)

> Análisis exhaustivo módulo por módulo del frontend de Ventas para derivar el modelo de
> persistencia (NestJS + Prisma + PostgreSQL/Supabase). **No es Prisma todavía**: es la capa
> de descubrimiento que alimenta el diseño del schema.
>
> **Convenciones de este documento:**
> - **Origen** de cada campo: `interfaz TS` (definido en un `types/*.ts`), `mock data` (aparece en un `mock/*.ts` o hook con mock inline), `inferido de lógica` (el componente lo deriva/necesita pero no está tipado), `falta en mock` (la lógica de negocio lo requiere pero no existe en el frontend).
> - `business_id` → multi-tenant (row-level). Por decisión de proyecto, **toda entidad persistente lo necesita** salvo que se indique. Se marca explícitamente en cada entidad.
> - `branch_id` → multi-branch. Se marca solo donde la lógica lo requiere (stock, caja, ventas presenciales).
> - Campos `hue`, `hue2`, `imagenes: number`, `color` (de placeholder), `avatar` (iniciales) → **UI-only**, generan thumbnails de color falsos. No se persisten como tales (ver sección cruzada).
> - `[AMBIGUO: …]` marca decisiones que el código no resuelve.

**Alcance descubierto:** 3 áreas de nivel superior bajo `ventas/`:
- `panel/` — panel de administración (9 módulos funcionales).
- `cliente/` — storefront público (consume `@/lib/storefront/`, fuera de `ventas/`).
- `tienda/` — **carpeta de stubs vacíos** (0 líneas cada archivo). No implementado. Ver nota al final.
- `_shared/` — componentes y hooks reutilizables (excluido como módulo, se referencia donde aplica).

---

## Índice de módulos

| # | Módulo | Vistas | Estado datos |
|---|--------|--------|--------------|
| 1 | `panel/reportes` | Dashboard, ReporteVentas, ReporteProductos, ReporteClientes, ReporteInventario | mock inline |
| 2 | `panel/pedidos` | PedidoLista, PedidoDetalle, PedidoNuevo, PedidoHistorial, ColaPreparacion, Devoluciones, NotasCredito | `mock/` + `types/` |
| 3 | `panel/catalogo` | ProductoLista, ProductoNuevo, Categorias, CodigosBarras | `mock/` + `types/` |
| 4 | `panel/inventario` | StockGeneral, EntradaStock, AjusteStock, Movimientos, Proveedores | `mock/` + `types/` |
| 5 | `panel/clientes` | ClienteLista, ClienteDetalle | `mock/` + `types/` |
| 6 | `panel/descuentos` | DescuentosListado, DescuentosCrear, DescuentosDetalle, DescuentosMetricas, CuponesListado, CuponesCrear | `mock/` + `types/` (el más completo) |
| 7 | `panel/pos` | POSCobro, POSApertura, POSCierre, POSHistorial, POSReporte | `hooks` con mock + `stores` (Zustand) + `types.ts` |
| 8 | `panel/mensajes` | Bandeja, Chat, Plantillas | `mock/` inline |
| 9 | `panel/configuracion` | ConfigGeneral, Apariencia, Equipo, Notificaciones | `mock/` + `types/` |
| 10 | `cliente/*` (storefront) | Inicio, Catalogo, Categoria, ProductoDetalle, Carrito, CheckoutDatos, CheckoutPago, Confirmacion, Seguimiento, Devolucion, Cancelar, Comprobante, Perfil, MensajesCliente, Login, Registro, ForgotPassword, CuponesPublicos, DescuentoExclusivo | `@/lib/storefront/mock.ts` |

---

# Módulo 1: `panel/reportes`

## Vistas encontradas
- **Dashboard** (`panel/reportes/Dashboard.tsx`) — home del panel: KPIs, alertas, gráfico de ventas, top productos/categorías/canal, actividad reciente, botón "Publicar tienda".
- **ReporteVentas** (`panel/reportes/ReporteVentas.tsx`)
- **ReporteProductos** (`panel/reportes/ReporteProductos.tsx`)
- **ReporteClientes** (`panel/reportes/ReporteClientes.tsx`)
- **ReporteInventario** (`panel/reportes/ReporteInventario.tsx`)
- Componentes: `DateRangePicker`, `ReporteTabs`, `TopProductos`, `StatCard` (en `panel/_shared/`).

## Datos que consume
- `SERIE_VENTAS` (`mock/reportes.mock.ts`): `{ labels: string[], valores: number[] }` — serie diaria de ventas.
- `TOP_PRODUCTOS` (`TopProducto[]`): `{ sku, nombre, unidades, monto, hue }`.
- KPIs **hardcodeados en el JSX** del Dashboard: Ventas `248900`, Pedidos `12`, Ticket prom `20742`, Clientes nuevos `3`, con deltas `"+18% vs ayer"`.
- Alertas hardcodeadas (`ALERTAS0`): pedidos sin atender, stock crítico, pagos por confirmar.
- Reutiliza `MOCK_PEDIDOS` (de `pedidos/`) para "Actividad reciente".
- Distribución por canal Online/Presencial (donut hardcodeado 68/32).

## Datos que envía
- Selección de período (Hoy/Semana/Mes/personalizado con rango de fechas) → filtro de consulta.
- Acción "Publicar tienda" → muta estado de publicación de la tienda.

## Campos calculados (NO persistir)
- Todos los KPIs y deltas son **agregaciones**: `ventas_periodo = sum(pedidos.monto)`, `ticket_promedio = ventas / cantidad_pedidos`, `delta = (actual - anterior) / anterior`.
- Ranking top productos = `sum(unidades)` agrupado por producto en el período.
- Distribución por canal = `count(pedidos) group by canal`.
- Series temporales = ventas agrupadas por día.

## Entidades identificadas
Este módulo **no define entidades propias**; consume agregaciones de Pedidos, Productos, Clientes e Inventario. Requiere endpoints de reporte que devuelven datos ya calculados por el backend.

| Concepto | Tipo | Origen | Notas |
|---|---|---|---|
| KPIs dashboard | agregación | mock/hardcode | ventas, pedidos, ticket_prom, clientes_nuevos + deltas vs período anterior |
| Serie ventas | agregación temporal | mock data | por día del rango |
| Top productos | agregación | mock data `TopProducto` | unidades y monto por producto/período |
| Alertas | derivado | hardcode | pedidos pendientes, stock bajo, pagos por confirmar — se calculan de otras tablas |

## Endpoints necesarios

| Método | Ruta | Request | Response | Vista |
|---|---|---|---|---|
| GET | `/api/reportes/dashboard` | query `{ desde, hasta, branch_id? }` | `{ kpis, alertas, serieVentas, topProductos, distribucionCanal, actividadReciente }` | Dashboard |
| GET | `/api/reportes/ventas` | query `{ desde, hasta, branch_id? }` | serie + desglose | ReporteVentas |
| GET | `/api/reportes/productos` | query `{ desde, hasta }` | ranking productos | ReporteProductos |
| GET | `/api/reportes/clientes` | query `{ desde, hasta }` | segmentación, nuevos, recurrentes | ReporteClientes |
| GET | `/api/reportes/inventario` | query `{ branch_id? }` | stock, valorización, quiebres | ReporteInventario |
| POST | `/api/tienda/publicar` | `{}` | `{ url, publicada }` | Dashboard |

- **Multi-tenant:** todos filtran por `business_id` (implícito por auth).
- **Multi-branch:** ventas/inventario aceptan `branch_id` opcional.

## Ambigüedades
- `[AMBIGUO: los KPIs del Dashboard están hardcodeados en JSX, no en mock. No hay contrato claro de qué ventana temporal cubre cada delta ("vs ayer" vs período seleccionado).]`
- `[AMBIGUO: "Clientes nuevos" — la definición de "nuevo" (primer pedido en el período vs alta de cuenta) no está en el código.]`

---

# Módulo 2: `panel/pedidos`

## Vistas encontradas
- **PedidoLista** (`panel/pedidos/PedidoLista.tsx`) — tabla de pedidos con filtros/tabs.
- **PedidoDetalle** (`panel/pedidos/PedidoDetalle.tsx`)
- **PedidoNuevo** (`panel/pedidos/PedidoNuevo.tsx`) — alta manual en 3 pasos (cliente → productos → pago).
- **PedidoHistorial** (`panel/pedidos/PedidoHistorial.tsx`)
- **ColaPreparacion** (`panel/pedidos/ColaPreparacion.tsx`) — kanban preparar/listo/despachado.
- **Devoluciones** (`panel/pedidos/Devoluciones.tsx`)
- **NotasCredito** (`panel/pedidos/NotasCredito.tsx`)
- Componentes: `PedidoTable`, `PedidoTabs`, `ProductoThumb`, `ModalComprobante`, `ModalEmail`.

## Datos que consume
- `MOCK_PEDIDOS: Pedido[]`, `MOCK_DEVOLUCIONES: Devolucion[]`, `MOCK_NOTAS_CREDITO: NotaCredito[]`, `MOCK_COLA_INICIAL` (reparto kanban por id), `MOCK_PRODUCTOS_RAPIDOS: ProductoRapido[]` (`mock/pedidos.mock.ts`).

## Datos que envía
- **PedidoNuevo**: `{ clienteId/cliente, items: ProductoRapido[], metodoPago, observaciones }` → crear pedido.
- Cambios de estado (confirmar, cancelar, mover en cola).
- Aprobación/rechazo de devoluciones; emisión de notas de crédito.
- Envío de comprobante/email (`ModalComprobante`, `ModalEmail`).

## Campos calculados (NO persistir)
- `total_pedido = sum(items.cantidad * items.precio)` — el `Pedido.monto` en el mock es un snapshot; se persiste como total congelado pero deriva de las líneas.
- Clientes del wizard = `unique(MOCK_PEDIDOS by email)` con conteo de pedidos → derivado.
- Conteos por estado en tabs = `count group by estado`.

## Entidades identificadas

### `Pedido` (Order)
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | string | interfaz TS | PK. En mock son `"1284"`; storefront usa `"ORB-2847"` → `[AMBIGUO: formato de numeración]` |
| business_id | uuid | falta en mock | **multi-tenant** |
| branch_id | uuid | falta en mock | **multi-branch** — canal Presencial ata a sucursal |
| clienteId | string | interfaz TS | FK → Cliente |
| cliente | string | interfaz TS | nombre desnormalizado (snapshot) |
| email | string | interfaz TS | contacto del comprador |
| productos | LineaPedido[] | interfaz TS | líneas (relación 1:N) |
| canal | 'Online' \| 'Presencial' | interfaz TS | CanalVenta |
| monto | number | interfaz TS | total (snapshot, ver calculado) |
| estado | EstadoPedido | interfaz TS | pendiente/confirmado/preparacion/enviado/entregado/cancelado |
| fecha | string ISO | interfaz TS | createdAt de facto |
| etapaCola | 'preparar'\|'listo'\|'despachado' | inferido de lógica | de `MOCK_COLA_INICIAL`, no está en `Pedido` |
| metodoPago | string | inferido (PedidoNuevo) | Efectivo/Transferencia/Mercado Pago |
| observaciones | string | inferido (PedidoNuevo) | textarea, no tipado |
| direccion_envio | — | falta en mock | necesario para envíos (existe en storefront) |
| tracking | string | falta en mock (existe en storefront `Pedido`) | código de seguimiento |
| updated_at | timestamp | falta en mock | audit |

### `LineaPedido` (OrderItem)
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | uuid | falta en mock | PK |
| pedido_id | uuid | inferido | FK → Pedido |
| producto_id / variante_id | uuid | falta en mock | **no hay FK**: el mock guarda solo `nombre` string |
| nombre | string | interfaz TS | snapshot |
| cantidad | number | interfaz TS | |
| precio | number | interfaz TS | precio unitario congelado |
| hue | number | interfaz TS | **UI-only** |

### `Devolucion` (Return)
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | string | interfaz TS | PK `"DEV-0012"` |
| business_id | uuid | falta en mock | multi-tenant |
| pedido_id | uuid | **falta en mock** | ¡no hay link al pedido! solo `cliente` + `producto` string |
| cliente | string | interfaz TS | snapshot |
| producto | string | interfaz TS | snapshot |
| cantidad | number | interfaz TS | |
| monto | number | interfaz TS | a reembolsar |
| motivo | string | interfaz TS | |
| estado | EstadoDevolucion | interfaz TS | pendiente/proceso/aprobada/rechazada |
| metodoReembolso | 'nota_credito'\|'reembolso' | interfaz TS (`MetodoReembolso`) | |
| hue | number | interfaz TS | UI-only |

### `NotaCredito` (CreditNote)
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | string | interfaz TS | PK `"NC-0034"` |
| business_id | uuid | falta en mock | multi-tenant |
| cliente | string | interfaz TS | snapshot |
| pedidoId | string | interfaz TS | FK → Pedido |
| monto | number | interfaz TS | |
| tipo | 'Saldo a favor'\|'Reembolso' | interfaz TS | |
| estado | 'emitida'\|'aplicada' | interfaz TS | |
| vence | string | interfaz TS | ¡`"30 jun"` display, no ISO! → `[AMBIGUO: tipo real de fecha]` |

## Relaciones
- `Pedido → LineaPedido` (1:N)
- `Pedido → Cliente` (N:1 vía `clienteId`)
- `Pedido → Branch` (N:1, para Presencial)
- `LineaPedido → Producto/Variante` (N:1) — **falta la FK en el frontend**
- `NotaCredito → Pedido` (N:1 vía `pedidoId`)
- `Devolucion → Pedido` (N:1) — **relación implícita faltante**
- `Devolucion → NotaCredito` (1:1 opcional, cuando `metodoReembolso = nota_credito`)

## Endpoints necesarios

| Método | Ruta | Request | Response | Vista |
|---|---|---|---|---|
| GET | `/api/pedidos` | query `{ estado?, canal?, search?, page }` | `Pedido[]` | PedidoLista, PedidoHistorial |
| GET | `/api/pedidos/:id` | — | `Pedido` (con líneas) | PedidoDetalle |
| POST | `/api/pedidos` | `{ clienteId, items[], metodoPago, observaciones }` | `Pedido` | PedidoNuevo |
| PATCH | `/api/pedidos/:id/estado` | `{ estado }` | `Pedido` | PedidoDetalle, Lista |
| PATCH | `/api/pedidos/:id/cola` | `{ etapa }` | `Pedido` | ColaPreparacion |
| POST | `/api/pedidos/:id/comprobante` | `{ email? }` | `{ url }` | ModalComprobante |
| GET | `/api/devoluciones` | query `{ estado? }` | `Devolucion[]` | Devoluciones |
| PATCH | `/api/devoluciones/:id` | `{ estado, metodoReembolso }` | `Devolucion` | Devoluciones |
| GET | `/api/notas-credito` | — | `NotaCredito[]` | NotasCredito |
| POST | `/api/notas-credito` | `{ pedidoId, monto, tipo }` | `NotaCredito` | NotasCredito |

## Ambigüedades
- `[AMBIGUO: LineaPedido no referencia producto por id, solo por nombre string. Hay que decidir si las líneas apuntan a Producto/Variante (con FK) o son snapshots puros.]`
- `[AMBIGUO: la etapa de la cola de preparación vive en un mapa aparte (MOCK_COLA_INICIAL), no en Pedido. ¿Es un campo de Pedido o una tabla de tablero separada?]`
- `[AMBIGUO: Devolucion no tiene pedido_id. Sin él no se puede validar stock/monto contra el pedido original.]`
- `[AMBIGUO: NotaCredito.vence es un string de display ("30 jun", "—"). El tipo real debería ser date nullable.]`

---

# Módulo 3: `panel/catalogo`

## Vistas encontradas
- **ProductoLista** (`panel/catalogo/ProductoLista.tsx`)
- **ProductoNuevo** (`panel/catalogo/ProductoNuevo.tsx`) — wizard 4 pasos (Info → Imágenes → Precio/stock → Variantes/Publicar).
- **Categorias** (`panel/catalogo/Categorias.tsx`) — árbol jerárquico.
- **CodigosBarras** (`panel/catalogo/CodigosBarras.tsx`) — impresión de etiquetas por SKU/código de barras.
- Componentes: `CatalogoTabs`, `ProductoEstadoBadge`.

## Datos que consume
- `PRODUCTOS_DB: Producto[]`, `CATEGORIAS_DB: Categoria[]`, `CAT_TREE0: CatNode[]`, `CAT_ICONS`, `CAT_COLORS` (`mock/catalogo.mock.ts`).
- Helpers `generarSKU(nombre)`, `slugify(s)`.

## Datos que envía
- **ProductoNuevo** (form `ProdForm`) → crear producto: `{ nombre, descripcion, categoria, tags[], estado, imagenes, precio, precioComparacion, costo, sku, codigoBarras, stock, stockMinimo, seguirVendiendo, tieneVariantes, tiposVariante[] }`.
- Alta/edición/reordenamiento de categorías (árbol).

## Campos calculados (NO persistir)
- `margen = (1 - costo/precio) * 100` — solo display.
- `combos` de variantes = producto cartesiano de `tiposVariante[].opciones` → genera filas (variante, sku, precio, stock). Estas SÍ se persisten como variantes, pero la combinatoria se calcula en el front.
- `precioComparacion` tachado + badge "Oferta" = derivado de si `precioComparacion != null`.
- `Categoria.count` / `CatNode.productos` = conteo de productos, derivado.

## Entidades identificadas

### `Producto` (Product) — versión catálogo
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | string | interfaz TS | PK |
| business_id | uuid | falta en mock | **multi-tenant** |
| nombre | string | interfaz TS | |
| descripcion | string | inferido (ProdForm) | textarea, no en `Producto` type |
| sku | string | interfaz TS | |
| cat / categoria | string | interfaz TS | **por nombre string**, no FK a Categoria |
| precio | number | interfaz TS | precio de venta |
| precioAnt | number \| null | interfaz TS | precio de comparación (oferta) |
| costo | number | inferido (ProdForm) | privado, para margen — no en `Producto` type |
| stock | number | interfaz TS | total (o suma de variantes) |
| stockMin | number | interfaz TS | umbral de alerta |
| estado | EstadoProducto | interfaz TS | publicado/borrador/sin_stock |
| tags | string[] | inferido (ProdForm) | no en `Producto` type |
| variantes | string[] | interfaz TS | ⚠️ solo talles como strings; el wizard maneja variantes ricas |
| colores | string[] | interfaz TS | UI |
| codigoBarras | string? | interfaz TS | EAN |
| seguirVendiendo | boolean | inferido (ProdForm) | vender sin stock (backorder) |
| imagenes | number | interfaz TS | ⚠️ **cantidad**, no URLs → UI-only placeholder |
| hue | number | interfaz TS | **UI-only** |
| created_at / updated_at | timestamp | falta en mock | audit |

### `VarianteProducto` (ProductVariant)
Derivada del wizard (`tiposVariante` + `combos`) y presente rica en descuentos/pos:
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | uuid | falta / inferido | PK |
| producto_id | uuid | inferido | FK |
| combinacion | string | inferido (`c.key`, ej "M / Negro") | |
| sku | string | inferido | |
| precio | number | inferido | puede override del padre |
| stock | number | inferido | por variante |
| atributos | {tipo,valor}[] | inferido (`TipoVariante`) | Talle, Color, etc. |

### `Categoria` (Category)
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | string | interfaz TS | PK |
| business_id | uuid | falta | multi-tenant |
| nombre | string | interfaz TS | |
| slug | string | interfaz TS (CatNode) | |
| emoji / icono | string | interfaz TS | clave de `CAT_ICONS` |
| color | string | interfaz TS (CatNode) | hex — UI |
| count / productos | number | interfaz TS | **calculado** |
| activa | boolean | interfaz TS (CatNode) | |
| parent_id | uuid | inferido (CatNode.subcategorias) | jerarquía self-referencing |

## Relaciones
- `Producto → Categoria` (N:1) — en el front es por nombre, debería ser FK.
- `Producto → VarianteProducto` (1:N)
- `Categoria → Categoria` (1:N self, árbol vía `subcategorias`/`parent_id`)
- `VarianteProducto → atributos` (1:N o JSON)

## Endpoints necesarios

| Método | Ruta | Request | Response | Vista |
|---|---|---|---|---|
| GET | `/api/productos` | query `{ search, categoria, estado, page }` | `Producto[]` | ProductoLista |
| POST | `/api/productos` | `ProdForm` (con variantes) | `Producto` | ProductoNuevo |
| PUT | `/api/productos/:id` | `ProdForm` | `Producto` | edición |
| GET | `/api/productos/:id` | — | `Producto` + variantes | detalle |
| GET | `/api/categorias` | — | `Categoria[]` / árbol | Categorias, selects |
| POST/PUT/DELETE | `/api/categorias/:id` | `CatNode` | `Categoria` | Categorias |
| GET | `/api/productos/codigos-barras` | query `{ ids? }` | `{ sku, codigoBarras, nombre }[]` | CodigosBarras |

## Ambigüedades
- `[AMBIGUO: hay DOS modelos de variante: `Producto.variantes: string[]` (solo talles) y el wizard con `tiposVariante`/combos ricos. Persistir el modelo rico y deprecar el string[].]`
- `[AMBIGUO: Producto.imagenes es un número (cantidad), no URLs. El modelo real necesita una tabla ProductoImagen con url/orden.]`
- `[AMBIGUO: categoría referenciada por nombre en Producto pero por id/slug en el árbol. Unificar a FK.]`
- `[AMBIGUO: `costo` y `descripcion` y `tags` existen en el form de alta pero NO en la interfaz `Producto`. Faltan en el tipo persistente.]`

---

# Módulo 4: `panel/inventario`

## Vistas encontradas
- **StockGeneral** (`panel/inventario/StockGeneral.tsx`)
- **EntradaStock** (`panel/inventario/EntradaStock.tsx`) — registrar ingreso de mercadería.
- **AjusteStock** (`panel/inventario/AjusteStock.tsx`) — ajuste manual (+/-).
- **Movimientos** (`panel/inventario/Movimientos.tsx`) — historial.
- **Proveedores** (`panel/inventario/Proveedores.tsx`)
- Componentes: `InvTable`, `InvTabs`, `StockForm`.

## Datos que consume
- `PRODUCTOS_STOCK: ProductoStock[]`, `PROVEEDORES: Proveedor[]`, `MOVIMIENTOS: Movimiento[]` (`mock/inventario.mock.ts`).

## Datos que envía
- Entrada de stock: `{ producto, cantidad, motivo/proveedor, costo? }`.
- Ajuste: `{ producto, cantidad(+/-), motivo }`.
- Alta/edición de proveedor.

## Campos calculados (NO persistir)
- Estado "stock bajo" = `stock <= stockMin` (derivado).
- Valorización = `sum(stock * precio)` (derivado).
- `Proveedor.totalComprado` = suma de compras (derivado, aunque el mock lo guarda plano).

## Entidades identificadas

### `ProductoStock` — **es una vista/proyección de `Producto`**
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | string | interfaz TS | = Producto.id |
| nombre, cat, precio | — | interfaz TS | duplicados de Producto |
| stock | number | interfaz TS | por sucursal → **branch_id** |
| stockMin | number | interfaz TS | |
| hue | number | interfaz TS | UI-only |

→ No es entidad nueva; el stock real debe vivir en **`StockPorSucursal (producto_id, branch_id, cantidad, stock_min)`**.

### `Movimiento` (StockMovement)
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | string | interfaz TS | PK |
| business_id | uuid | falta | multi-tenant |
| branch_id | uuid | falta | **multi-branch** |
| fecha | string ISO | interfaz TS | timestamp |
| producto | string | interfaz TS | → debería ser `producto_id` (FK), hoy es nombre string |
| tipo | 'entrada'\|'salida'\|'ajuste' | interfaz TS | |
| cantidad | number | interfaz TS | negativa en ajustes |
| motivo | string | interfaz TS | ej "Venta #1284", "Compra a proveedor" |
| usuario | string | interfaz TS | → debería ser `usuario_id` (FK a Miembro) |
| proveedor_id | uuid | inferido (entrada) | FK opcional en entradas |
| hue | number | interfaz TS | UI-only |

### `Proveedor` (Supplier)
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | uuid | **falta en mock** (mock usa `nombre` como key) | PK |
| business_id | uuid | falta | multi-tenant |
| nombre | string | interfaz TS | |
| contacto | string | interfaz TS | persona |
| tel | string | interfaz TS | |
| email | string | interfaz TS | |
| ultimaCompra | string | interfaz TS | derivable de Movimientos |
| totalComprado | number | interfaz TS | **calculado** |

## Relaciones
- `Movimiento → Producto/Variante` (N:1) — implícita, hoy por nombre string.
- `Movimiento → Branch` (N:1)
- `Movimiento → Miembro` (N:1, `usuario`)
- `Movimiento → Proveedor` (N:1, en entradas)
- `StockPorSucursal → (Producto, Branch)` (N:1 × N:1)
- `Movimiento → Pedido/Venta` (N:1, motivo "Venta #1284" sugiere link) → **relación faltante**

## Endpoints necesarios

| Método | Ruta | Request | Response | Vista |
|---|---|---|---|---|
| GET | `/api/inventario/stock` | query `{ branch_id?, search }` | `ProductoStock[]` | StockGeneral |
| POST | `/api/inventario/entrada` | `{ producto_id, cantidad, proveedor_id?, costo?, motivo }` | `Movimiento` | EntradaStock |
| POST | `/api/inventario/ajuste` | `{ producto_id, cantidad, motivo }` | `Movimiento` | AjusteStock |
| GET | `/api/inventario/movimientos` | query `{ producto_id?, tipo?, desde, hasta }` | `Movimiento[]` | Movimientos |
| GET/POST/PUT | `/api/proveedores` | `Proveedor` | `Proveedor[]` | Proveedores |

## Ambigüedades
- `[AMBIGUO: Proveedor se identifica por nombre en el mock (sin id). Necesita PK.]`
- `[AMBIGUO: los Movimientos referencian producto y usuario por string. Faltan FKs.]`
- `[AMBIGUO: el motivo "Venta #1284" implica que las salidas se generan automáticamente al cobrar. ¿El movimiento se crea desde POS/Pedidos? Falta el vínculo venta→movimiento.]`
- `[AMBIGUO: el stock es claramente por sucursal (branch), pero el mock lo tiene plano en el producto. Confirmar StockPorSucursal.]`

---

# Módulo 5: `panel/clientes`

## Vistas encontradas
- **ClienteLista** (`panel/clientes/ClienteLista.tsx`)
- **ClienteDetalle** (`panel/clientes/ClienteDetalle.tsx`) — KPIs + tabs (pedidos/notas/info/actividad) + acción Email.
- Componentes: `SegmentoBadge`, `EmailMasivoModal`.

## Datos que consume
- `MOCK_CLIENTES: Cliente[]` (`mock/clientes.mock.ts`).
- `MOCK_PEDIDOS` (de pedidos/) para la tab "pedidos" del cliente.

## Datos que envía
- Envío de email individual (`ModalEmail`) y masivo (`EmailMasivoModal`).
- Asignación de segmento.
- Notas del cliente (tab "notas") → CRUD de notas.

## Campos calculados (NO persistir)
- `pedidos`, `gasto`, `ticket` (ticket promedio) → **agregaciones** de la tabla de pedidos.
- `ultima` (última compra) → `max(pedido.fecha)`.
- `segmento` → derivable de reglas (gasto/frecuencia), aunque el mock lo guarda plano.
- `totalGastado` en storefront = `sum(pedidos válidos)`.

## Entidades identificadas

### `Cliente` (Customer)
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | string | interfaz TS | PK |
| business_id | uuid | falta | **multi-tenant** |
| nombre | string | interfaz TS | (storefront separa nombre/apellido) |
| email | string | interfaz TS | |
| tel | string | interfaz TS | |
| pedidos | number | interfaz TS | **calculado** (count) |
| gasto | number | interfaz TS | **calculado** (sum) |
| ticket | number | interfaz TS | **calculado** (avg) |
| ultima | string ISO | interfaz TS | **calculado** (max fecha) |
| segmento | 'vip'\|'recurrente'\|'nuevo'\|'inactivo' | interfaz TS | derivable o manual |
| tags | string[] | interfaz TS | ej "fiel", "mayorista" |
| dni | string | falta (existe en POS `ClienteAsociado`) | fiscal |
| direcciones | Direccion[] | falta (existe en storefront) | 1:N |
| notas | ClienteNota[] | inferido (tab notas) | 1:N |
| created_at | timestamp | falta | "miembro desde" (storefront) |

### `ClienteNota` (CustomerNote) — inferida de la tab "notas"
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id, cliente_id, autor_id, texto, created_at | — | inferido de lógica | CRUD interno |

## Relaciones
- `Cliente → Pedido` (1:N)
- `Cliente → Direccion` (1:N) — de storefront
- `Cliente → ClienteNota` (1:N)
- `Cliente → Segmento` (N:1 enum)

## Endpoints necesarios

| Método | Ruta | Request | Response | Vista |
|---|---|---|---|---|
| GET | `/api/clientes` | query `{ search, segmento?, page }` | `Cliente[]` | ClienteLista |
| GET | `/api/clientes/:id` | — | `Cliente` + pedidos + notas | ClienteDetalle |
| PATCH | `/api/clientes/:id/segmento` | `{ segmento }` | `Cliente` | ClienteDetalle |
| POST | `/api/clientes/:id/notas` | `{ texto }` | `ClienteNota` | tab notas |
| POST | `/api/clientes/email` | `{ clienteIds[], asunto, cuerpo }` | `{ enviados }` | EmailMasivoModal |

## Ambigüedades
- `[AMBIGUO: pedidos/gasto/ticket/ultima/segmento — ¿se recalculan on-read o se materializan? Para tiendas grandes conviene materializar.]`
- `[AMBIGUO: el DNI del cliente solo aparece en POS (ClienteAsociado). El Cliente del panel no lo tiene. Unificar.]`
- `[AMBIGUO: la relación Cliente↔cuenta-de-usuario del storefront (login) no está modelada; puede haber clientes sin cuenta (creados en POS) y cuentas de storefront.]`

---

# Módulo 6: `panel/descuentos`

> El módulo **más completo y mejor tipado**. Fuente de verdad para descuentos y cupones,
> compartido por POS y Storefront ("best discount wins", evaluación en backend).

## Vistas encontradas
- **DescuentosShell** / **CuponesShell** — layout con tabs.
- **DescuentosListado** (`panel/descuentos/DescuentosListado.tsx`)
- **DescuentosCrear** (`panel/descuentos/DescuentosCrear.tsx`) — form multi-tipo (usa `reducerDescuento.ts`).
- **DescuentosDetalle** (`panel/descuentos/DescuentosDetalle.tsx`) — solo lectura + auditoría.
- **DescuentosMetricas** (`panel/descuentos/DescuentosMetricas.tsx`)
- **CuponesListado** (`panel/descuentos/CuponesListado.tsx`)
- **CuponesCrear** (`panel/descuentos/CuponesCrear.tsx`) — incluye link compartible + envío por email.
- ~50 componentes (`components/`), 20 hooks (`hooks/`) — CRUD, toggle, duplicar, métricas, auditoría, link.

## Datos que consume
- `descuentosMock`, `cuponesMock`, `metricasMock`, `auditoriaMock`, `clientesMock` (selector email), `productosMock`+`categoriasMock` (árbol de alcance) — `mock/`.

## Datos que envía
- Crear/editar descuento (todos los campos de `Descuento`), crear/editar cupón, toggle activo, duplicar, eliminar.
- Validar cupón (desde POS), evaluar carrito (POS + Storefront).
- Generar/activar link compartible; enviar link por email a cliente.

## Campos calculados (NO persistir)
- `estado` (activo/inactivo/programado/expirado/agotado) — **derivado** de `activo` + fechas + `usosConsumidos/usosMax`.
- `alcanceResumen` — texto para la columna Alcance, derivado.
- `recurrente` — derivado de `diasVigencia`/`horaInicio`.
- `combos`/aplicación real del descuento sobre el carrito → **se evalúa en backend** (`/evaluar`).
- Métricas (revenueSacrificado, tasaCanje, ticketPromedio) — agregaciones.

## Entidades identificadas

### `Descuento` (Discount) — automático o manual, sin código
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | string | interfaz TS | PK |
| business_id | uuid | falta (mock usa `creadoPor`) | multi-tenant |
| nombre | string | interfaz TS | |
| tipo | TipoDescuento | interfaz TS | 7 tipos (%_producto, $_producto, %_ticket, $_ticket, lleva_x_paga_y, compra_x_obtiene_z, volumen) |
| valor | number | interfaz TS | |
| alcance | 'producto'\|'categoria'\|'ticket' | interfaz TS | |
| productosIds | string[] | interfaz TS | FK N:N → Producto |
| categoriasIds | string[] | interfaz TS | FK N:N → Categoria |
| nivelProducto | 'padre'\|'variante' | interfaz TS | |
| condicion | CondicionDescuento | interfaz TS | cantidadMinima, montoMinimo, llevaCantidad, pagaCantidad, escalasVolumen[] |
| bonus* | varios | interfaz TS | solo `compra_x_obtiene_z`: bonusProductosIds, bonusCategoriasIds, bonusAlcance, bonusTipoBeneficio, bonusValor |
| aplicacion | 'automatico'\|'manual' | interfaz TS | |
| fechaInicio | ISO | interfaz TS | |
| fechaFin | ISO \| null | interfaz TS | null = sin vencimiento |
| diasVigencia | number[]\|null | interfaz TS | [0-6] |
| horaInicio/horaFin | "HH:mm"\|null | interfaz TS | ventana horaria |
| limiteUsosTotal | number\|null | interfaz TS | |
| usosConsumidos | number | interfaz TS | contador |
| activo | boolean | interfaz TS | |
| prioridad | number | interfaz TS | para "best discount wins" |
| estado | EstadoDescuento | interfaz TS | **derivado** |
| recurrente | boolean | interfaz TS | **derivado** |
| alcanceResumen | string | interfaz TS | **derivado** |
| creadoPor | string | interfaz TS | FK → Miembro |
| createdAt/updatedAt | ISO | interfaz TS | audit |

### `Cupon` (Coupon) — con código, canjeable
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | string | interfaz TS | PK |
| business_id | uuid | falta | multi-tenant |
| codigo | string | interfaz TS | único por tienda |
| nombre | string | interfaz TS | |
| tipoDescuento | 'porcentaje'\|'monto_fijo' | interfaz TS | |
| valor | number | interfaz TS | |
| alcance | AlcanceDescuento | interfaz TS | |
| productosIds/categoriasIds | string[] | interfaz TS | N:N |
| nivelProducto | NivelProducto | interfaz TS | |
| montoMinimo | number\|null | interfaz TS | |
| usosMaxTotal | number\|null | interfaz TS | |
| usosMaxPorCliente | number\|null | interfaz TS | requiere tracking por cliente |
| usosConsumidos | number | interfaz TS | |
| fechaInicio | ISO | interfaz TS | |
| fechaExpiracion | ISO\|null | interfaz TS | |
| activo | boolean | interfaz TS | |
| privado | boolean | interfaz TS | true = no aparece en tienda |
| estado | EstadoCupon | interfaz TS | **derivado** (incluye 'agotado') |
| alcanceResumen | string | interfaz TS | derivado |
| link_activo | boolean | interfaz TS | link compartible |
| link_redirect | string\|null | interfaz TS | ruta destino |
| link_creado_at | ISO\|null | interfaz TS | |
| creadoPor, createdAt, updatedAt | — | interfaz TS | audit |

### `LogAuditoria` (AuditLog)
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | string | interfaz TS | PK |
| entidadTipo | 'descuento'\|'cupon' | interfaz TS | polimórfico |
| entidadId | string | interfaz TS | FK |
| accion | crear/editar/activar/desactivar/eliminar | interfaz TS | |
| usuarioId, usuarioNombre | string | interfaz TS | FK → Miembro |
| cambios | CambioAuditoria[] | interfaz TS | `{ campo, antes, despues }` |
| timestamp | ISO | interfaz TS | |

### `UsoCupon` / `UsoDescuento` (Redemption) — **falta en mock, requerido**
Para `usosMaxPorCliente`, tasa de canje y métricas se necesita registro de canjes: `{ id, cupon_id/descuento_id, cliente_id, pedido_id, monto_descontado, canal, fecha }`.

### Métricas (proyecciones, no tablas)
`MetricasKPIs`, `MetricasGrafico`, `RendimientoItem` — agregaciones sobre UsoCupon/UsoDescuento y Pedidos.

## Relaciones
- `Descuento/Cupon → Producto` (N:N) y `→ Categoria` (N:N).
- `Descuento (compra_x_obtiene_z) → Producto/Categoria bonus` (N:N).
- `Cupon → UsoCupon → Cliente/Pedido` (1:N → N:1).
- `LogAuditoria → Descuento|Cupon` (N:1 polimórfico) `→ Miembro`.

## Endpoints necesarios (confirmados en `descuentos/CLAUDE.md`)

| Método | Ruta | Request | Response | Vista |
|---|---|---|---|---|
| GET | `/api/descuentos` | filtros `{estado,tipo,busqueda,pagina,orden}` | `PaginatedResponse<Descuento>` | Listado |
| GET | `/api/descuentos/:id` | — | `Descuento` | Detalle |
| POST | `/api/descuentos` | `Descuento` | `Descuento` | Crear |
| PUT | `/api/descuentos/:id` | `Descuento` | `Descuento` | Editar |
| PATCH | `/api/descuentos/:id/toggle` | — | `Descuento` | Listado |
| DELETE | `/api/descuentos/:id` | — | `{ok}` | Listado |
| POST | `/api/descuentos/:id/duplicar` | — | `Descuento` | Listado |
| GET/POST/PUT/PATCH/DELETE | `/api/cupones...` | idem | `Cupon` | Cupones |
| POST | `/api/cupones/:id/duplicar` | — | `Cupon` | CuponesListado |
| POST | `/api/cupones/validar` | `{ codigo, carrito }` | `{ valido, cupon }` | **POS** |
| POST | `/api/descuentos/evaluar` | `{ items[], cliente_id?, cupon? }` | `{ descuentos[], total }` | **POS + Storefront** |
| GET | `/api/descuentos/metricas` | filtros | `MetricasResumen` | Métricas |
| GET | `/api/descuentos/metricas/:id` | — | detalle rendimiento | MetricasDrawer |
| GET | `/api/descuentos/auditoria/:id` | — | `LogAuditoria[]` | HistorialCambios |
| PATCH | `/api/cupones/:id/link` | `{ activo, redirect }` | `Cupon` | LinkCompartible |
| POST | `/api/cupones/:id/enviar-link` | `{ clienteId/email }` | `{ok}` | LinkCompartibleModal |

- **Multi-branch:** `MetricasFiltros.sucursalId` confirma que las métricas se filtran por sucursal → `branch_id` en `UsoCupon/UsoDescuento`.
- **Canal:** `CanalMetricas = 'pos'|'storefront'` → el registro de uso debe guardar canal.

## Ambigüedades
- `[AMBIGUO: no existe tabla de canjes (UsoCupon) en el mock, pero usosMaxPorCliente, tasaCanje y métricas por canal/sucursal la requieren sí o sí.]`
- `[AMBIGUO: la regla "best discount wins" y la interacción cupón+descuento automático se evalúan en backend; el frontend solo envía a `/evaluar`. La lógica de precedencia (prioridad vs mayor ahorro) no está en el front.]`
- `[AMBIGUO: `creadoPor: 'usr-admin'` es un string, no FK real todavía.]`

---

# Módulo 7: `panel/pos`

## Vistas encontradas
- **POSShell** (orquestador) / **POSCobro** (`POSCobro.tsx`) — catálogo + ticket + cobro.
- **POSApertura** (`POSApertura.tsx`) — abrir caja.
- **POSCierre** (`POSCierre.tsx`) — conteo + diferencia.
- **POSHistorial** (`POSHistorial.tsx`) — sesiones de caja.
- **POSReporte** (`POSReporte.tsx`) — resumen de turno.
- Stores Zustand: `useTicketStore`, `useCajaStore`, `usePausadosStore` (persist localStorage).
- Hooks con mock: `useProductosPOS`, `useTickets`, `useCaja`, `useClientes`.

## Datos que consume
- Productos POS (`MOCK_PRODUCTOS` en `useProductosPOS`), categorías POS.
- Clientes (`CLIENTES_MOCK` en `useClientes`, con **DNI**).
- Sesiones de caja e historial (`MOCK_SESIONES`, `MOCK_HISTORIAL` en `useCaja`).
- Tickets recientes (`MOCK_TICKETS` en `useTickets`).

## Datos que envía
- Abrir caja: `{ cajero, montoInicial, notas }`.
- Crear ticket/venta: `{ items[], cliente, metodosPago[], total, vuelto }`.
- Registrar movimiento de caja: `{ tipo(egreso/ingreso), monto, motivo, cajeroId }`.
- Forzar cierre de sesión.
- Cerrar caja con conteo (diferencia).

## Campos calculados (NO persistir) — `TotalesPOS`
- `subtotal = sum(precioEditado ?? precioUnitario * cantidad)`
- `descProductos`, `descCupon`, `descManual`, `descTotal` — descuentos aplicados.
- `total = subtotal - descTotal`; `iva = total - total/1.21` (IVA 21% incluido).
- `cantidadItems`, `vuelto = pago - total`.
- `totalTeorico` (cierre) = montoInicial + ventas efectivo + ingresos − egresos.
- `diferencia` (cierre) = conteoReal − totalTeorico.

## Entidades identificadas

### `SesionCaja` (CashRegisterSession)
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | string | interfaz TS | PK |
| business_id | uuid | falta | multi-tenant |
| branch_id | uuid | falta | **multi-branch** (caja por sucursal) |
| cajero | {id,nombre} | interfaz TS | FK → Miembro |
| fechaApertura | ISO | interfaz TS | |
| fechaCierre | ISO? | interfaz TS | |
| montoInicial | number | interfaz TS | fondo |
| estado | 'abierta'\|'cerrada'\|'forzada' | interfaz TS | |
| notas | string? | interfaz TS | |
| conteoCierre / diferencia | number | inferido (POSCierre) | falta en el type base |

### `Venta` / `ResultadoVenta` (Sale/Ticket)
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | string | interfaz TS | PK |
| business_id / branch_id | uuid | falta | multi-tenant + branch |
| sesion_caja_id | uuid | inferido | FK → SesionCaja |
| numeroComprobante | string | interfaz TS | `"0001-00000001"` |
| fecha | ISO | interfaz TS | |
| items | TicketItem[] | interfaz TS | líneas |
| cliente | ClienteAsociado\|null | interfaz TS | venta anónima permitida |
| metodosPago | MetodoPago[] | interfaz TS | pago mixto |
| total | number | interfaz TS | |
| vuelto | number? | interfaz TS | |

### `TicketItem` (SaleItem)
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | string | interfaz TS | `${productoId}::${varianteId}` |
| productoId | string | interfaz TS | FK |
| varianteId | string? | interfaz TS | FK |
| nombre, variante | string | interfaz TS | snapshot |
| cantidad | number | interfaz TS | |
| precioUnitario | number | interfaz TS | |
| precioEditado | number? | interfaz TS | override manual → **requiere permiso/audit** |
| descuento | Descuento? | interfaz TS | por línea |
| notas | string? | interfaz TS | |
| esConcepto | boolean? | interfaz TS | ítem libre, **no descuenta stock** |

### `MetodoPago` (PaymentMethod, embebido)
`{ tipo: efectivo|tarjeta_debito|tarjeta_credito|transferencia|qr, monto, referencia? }`

### `MovimientoCaja` (CashMovement)
`{ id, tipo: egreso|ingreso, monto, motivo, fecha, cajeroId }` — business_id + branch_id + sesion_caja_id.

### `TicketPausado` (ParkedTicket)
`{ id, items[], cliente, pausadoEn, nota }` — hoy en **localStorage** (`usePausadosStore`). `[AMBIGUO: ¿se persiste server-side para multi-dispositivo?]`

### `ProductoPOS` / `VariantePOS` / `CategoriaPOS`
Proyecciones de Producto para el POS: `{ id, nombre, sku, precio, stock, foto?, categoriaId, favorito?, tieneVariantes, variantes[] }`. `favorito` → `[AMBIGUO: por usuario o por negocio?]`.

## Relaciones
- `SesionCaja → Miembro (cajero)` (N:1), `→ Branch` (N:1).
- `Venta → SesionCaja` (N:1), `→ Cliente` (N:1 opcional), `→ VentaItem` (1:N), `→ MetodoPago` (1:N).
- `VentaItem → Producto/Variante` (N:1).
- `MovimientoCaja → SesionCaja` (N:1).
- `Venta → Movimiento de inventario` (1:N, descuenta stock — ver Inventario).
- `Venta → UsoCupon/UsoDescuento` (1:N).

## Endpoints necesarios

| Método | Ruta | Request | Response | Vista |
|---|---|---|---|---|
| GET | `/api/pos/productos` | `FiltrosCatalogoPOS` | `ProductoPOS[]` | POSCobro |
| GET | `/api/pos/categorias` | — | `CategoriaPOS[]` | POSCobro |
| GET | `/api/pos/clientes` | query `{ busqueda }` (dni/tel/nombre) | `ClienteAsociado[]` | SelectorCliente |
| POST | `/api/pos/ventas` | `{ items, cliente, metodosPago, total, vuelto }` | `ResultadoVenta` | ModalCobro |
| GET | `/api/pos/ventas` | query `{ cajaId }` | `ResultadoVenta[]` | tickets recientes |
| POST | `/api/pos/caja/abrir` | `{ cajero, montoInicial, notas }` | `SesionCaja` | POSApertura |
| POST | `/api/pos/caja/:id/cerrar` | `{ conteoReal }` | `{ diferencia, resumen }` | POSCierre |
| POST | `/api/pos/caja/:id/forzar` | — | `SesionCaja` | Historial |
| GET | `/api/pos/caja/sesiones` | — | `SesionCaja[]` | Historial |
| GET | `/api/pos/caja/historial` | — | `FilaSesion[]` (con desglose) | Historial |
| POST | `/api/pos/caja/movimiento` | `{ tipo, monto, motivo, cajeroId }` | `MovimientoCaja` | ModalEgresoIngreso |
| GET | `/api/pos/caja/:id/resumen` | — | `ResumenTurno` | POSReporte |

## Ambigüedades
- `[AMBIGUO: precioEditado permite cambiar el precio en el ticket. Necesita permiso ("editar_precio") y quedar en auditoría; el front no lo restringe.]`
- `[AMBIGUO: TicketPausado vive en localStorage. Multi-tab/multi-dispositivo requiere persistencia server-side.]`
- `[AMBIGUO: la Venta del POS y el Pedido del panel son entidades distintas hoy (numeroComprobante vs id "1284"). ¿Se unifican en un modelo de "orden" con canal, o son tablas separadas Venta/Pedido?]`
- `[AMBIGUO: el descuento del ticket usa el tipo simple `pos/types.ts::Descuento` (`{tipo,valor,codigo}`), distinto del rico `descuentos/`. La evaluación real debe ir contra `/descuentos/evaluar`.]`
- `[AMBIGUO: `esConcepto` (ítem libre sin stock) — necesita bandera para no generar movimiento de inventario.]`

---

# Módulo 8: `panel/mensajes`

## Vistas encontradas
- **Bandeja** (`panel/mensajes/Bandeja.tsx`) — lista de conversaciones.
- **Chat** (`panel/mensajes/Chat.tsx`) — hilo con un cliente.
- **Plantillas** (`panel/mensajes/Plantillas.tsx`) — mensajes predefinidos con variables.
- Componentes: `BandejaLista`, `ChatPanel`, `ChatHeader`, `Composer`, `ConversacionItem`, `ModalPlantilla`, `ModalUsarPlantilla`, `PlantillaCard`, `PedidoMencionPopover`.

## Datos que consume
- `CONVERSACIONES: Conversacion[]`, `CHAT_MSGS_BY_CV: Record<id, ChatMsg[]>`, `PLANTILLAS: Plantilla[]`, `PEDIDOS_POR_CLIENTE`, `VARIABLES_DISPONIBLES`, helper `resolverVariables` (`mock/mensajes.mock.ts`).

## Datos que envía
- Enviar mensaje `{ conversacionId, texto }`.
- Marcar leído / archivar conversación.
- Crear/editar/usar plantilla (resuelve variables `{nombre}`, `{id}`, `{tracking}`, `{tienda}`).

## Campos calculados (NO persistir)
- `unread` count por bandeja (filtro).
- Resolución de variables de plantilla → texto final (runtime).
- `preview` = último mensaje truncado (derivado).

## Entidades identificadas

### `Conversacion` (Conversation)
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | string | interfaz TS | PK |
| business_id | uuid | falta | multi-tenant |
| cliente | string | interfaz TS | → debería ser cliente_id (FK) |
| email | string | interfaz TS | |
| preview | string | interfaz TS | **derivado** (último msg) |
| tiempo | string | interfaz TS | "14:26"/"Ayer" → display, no ISO |
| unread | boolean | interfaz TS | |
| archivado | boolean | interfaz TS | |
| pedido | string\|null | interfaz TS | FK opcional → Pedido |

### `ChatMsg` (Message)
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | uuid | falta | PK |
| conversacion_id | uuid | inferido | FK |
| from | 'cli'\|'me' (panel) / 'cliente'\|'tienda' (storefront) | interfaz TS | ⚠️ enums distintos entre panel y storefront |
| txt | string | interfaz TS | |
| hora | string | interfaz TS | display, no ISO |
| pedido_mencionado | string? | inferido (PedidoMencionPopover) | mención inline |

### `Plantilla` (MessageTemplate)
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | string | interfaz TS | PK |
| business_id | uuid | falta | multi-tenant |
| nombre | string | interfaz TS | |
| texto | string | interfaz TS | con `{variables}` |
| categoria | pedido/retiro/envio/postventa/otro | interfaz TS | |

## Relaciones
- `Conversacion → Cliente` (N:1) — hoy por nombre string.
- `Conversacion → Pedido` (N:1 opcional).
- `Conversacion → ChatMsg` (1:N).
- Plantilla independiente (por negocio).

## Endpoints necesarios

| Método | Ruta | Request | Response | Vista |
|---|---|---|---|---|
| GET | `/api/conversaciones` | query `{ filtro: todos/sin_leer/archivados }` | `Conversacion[]` | Bandeja |
| GET | `/api/conversaciones/:id/mensajes` | — | `ChatMsg[]` | Chat |
| POST | `/api/conversaciones/:id/mensajes` | `{ texto, pedidoMencionado? }` | `ChatMsg` | Composer |
| PATCH | `/api/conversaciones/:id` | `{ unread?, archivado? }` | `Conversacion` | Bandeja |
| GET/POST/PUT/DELETE | `/api/plantillas` | `Plantilla` | `Plantilla[]` | Plantillas |

## Ambigüedades
- `[AMBIGUO: el remitente usa enums distintos en panel ('cli'/'me') y storefront ('cliente'/'tienda'). Unificar.]`
- `[AMBIGUO: `tiempo`/`hora` son strings de display, no timestamps. El modelo real necesita created_at.]`
- `[AMBIGUO: el storefront tiene UNA conversación por cliente (hilo único con menciones de pedido), el panel tiene una por cliente ligada opcionalmente a un pedido. Confirmar cardinalidad conversación↔cliente↔pedido.]`
- `[AMBIGUO: canal del mensaje (WhatsApp vs chat interno) no está modelado, aunque las plantillas y config sugieren WhatsApp.]`

---

# Módulo 9: `panel/configuracion`

## Vistas encontradas
- **ConfigGeneral** (`panel/configuracion/ConfigGeneral.tsx`) — hub + V15 (negocio, contacto, pagos, envíos, redes, zona peligrosa).
- **Apariencia** (`panel/configuracion/Apariencia.tsx`) — branding, tema, layout, toggles del storefront.
- **Equipo** (`panel/configuracion/Equipo.tsx`) — roles, permisos, miembros.
- **Notificaciones** (`panel/configuracion/Notificaciones.tsx`) — toggles de eventos + canales.
- Componentes: `ConfigTabs`, `ConfigControls`, `StorePreview`, `ImgUploader`, y `equipo/` (ModalInvitar, ModalRol, ModalEditarMiembro, etc.).

## Datos que consume
- `AP_DEFAULTS: Apariencia`, `GOOGLE_FONTS`, `PRESET_COLORS` (`mock/apariencia.mock.ts`).
- `PERMISOS`, `GRUPOS`, `ROLES0: Rol[]`, `MIEMBROS0: Miembro[]`, helpers `fmtAcceso`, `genPassword` (`mock/equipo.mock.ts`).
- Datos de ConfigGeneral/Notificaciones **hardcodeados en JSX** (nombre, contacto, PAGOS, envíos, redes, canales).

## Datos que envía
- Guardar config del negocio (nombre, rubro, descripción, contacto, horario).
- Toggle métodos de pago (Mercado Pago, Efectivo, Retiro).
- Config de envíos (costo base, gratis desde, zonas, política).
- Redes sociales.
- Apariencia completa (branding + tema + layout).
- Invitar/editar/eliminar miembro; crear/editar rol; asignar permisos.
- Toggle notificaciones por evento y canal.
- Zona peligrosa: pausar tienda, eliminar espacio.

## Entidades identificadas

### `Negocio` / `Business` (Tenant) — **la raíz multi-tenant**
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | uuid | falta | **PK = business_id** |
| nombre | string | hardcode | "Rama Indumentaria" |
| rubro | string | hardcode | "Indumentaria" |
| descripcion | string | hardcode | |
| whatsapp, email, horario | string | hardcode | contacto |
| envio_base, envio_gratis_desde | number | hardcode | |
| zonas_entrega | string[] | hardcode | |
| politica_envios | string | hardcode | |
| instagram, tiktok, facebook | string | hardcode | redes |
| metodosPago | {label,on}[] | hardcode | MP/Efectivo/Retiro |
| pausada | boolean | inferido | zona peligrosa |

### `Apariencia` / `StorefrontConfig` (1:1 con Negocio)
Objeto grande (`mock/apariencia.mock.ts`): nombreTienda, tagline, logo, favicon, `sliders: HeroSlide[]`, colores (primario/secundario/accent/fondo), modoColor, fuentes, escalaFuente, `layoutHeader`, `headerLinks: HeaderLink[]`, layoutGrid, radioCards, y ~8 toggles (`mostrarRating`, `mostrarBadgeNuevo`, `mostrarWhatsapp`, etc.), textos CTA/envío/whatsapp.
→ `HeroSlide { id, titulo, subtitulo, img, cta }` y `HeaderLink { id, label, on }` son sub-entidades (1:N) o JSON.

### `Rol` (Role)
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | string | interfaz TS | PK (dueno/admin/vendedor) |
| business_id | uuid | falta | multi-tenant |
| nombre, descripcion, color | string | interfaz TS | |
| esDefault | boolean | interfaz TS | roles default no editables |
| permisos | string[] | interfaz TS | N:N → Permiso |
| miembros | number | interfaz TS | **calculado** |

### `Permiso` (Permission) — catálogo global
`{ id, grupo, label, desc }` — 19 permisos en 7 grupos (Pedidos, Clientes, Reportes, Inventario, POS, Descuentos, Configuración). Probablemente seed estático, no por negocio.

### `Miembro` (BusinessMember)
| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| id | string | interfaz TS | PK |
| business_id | uuid | falta | multi-tenant |
| nombre, email | string | interfaz TS | |
| rol | string | interfaz TS | FK → Rol |
| estado | 'activo'\|'pendiente' | interfaz TS | invitación |
| passwordTemp | boolean | interfaz TS | forzar cambio |
| ultimoAcceso | ISO\|null | interfaz TS | |

> ⚠️ El proyecto define 4 roles (owner, admin, cajero, empleado) vía `business_members`, pero el mock trae 3 (dueno, admin, vendedor). Ver conflicto en sección cruzada.

### `ConfigNotificaciones` (1:1 con Negocio)
Matriz evento×canal: eventos (Nuevo pedido, Pedido cancelado, Stock crítico, Devolución, Pago confirmado, Resumen diario, Cliente nuevo, Reporte semanal) × canales (Panel, Email, WhatsApp), cada uno on/off.

## Relaciones
- `Negocio (1:1) Apariencia`, `Negocio (1:1) ConfigNotificaciones`.
- `Negocio (1:N) Rol`, `Negocio (1:N) Miembro`.
- `Rol (N:N) Permiso`, `Miembro (N:1) Rol`.
- `Miembro (N:1) Negocio` = tabla `business_members` del proyecto.

## Endpoints necesarios

| Método | Ruta | Request | Response | Vista |
|---|---|---|---|---|
| GET/PUT | `/api/config/general` | `Negocio` | `Negocio` | ConfigGeneral |
| GET/PUT | `/api/config/apariencia` | `Apariencia` | `Apariencia` | Apariencia |
| GET/PUT | `/api/config/notificaciones` | matriz | idem | Notificaciones |
| GET | `/api/roles` + `/api/permisos` | — | `Rol[]`, `Permiso[]` | Equipo |
| POST/PUT/DELETE | `/api/roles/:id` | `Rol` | `Rol` | ModalRol |
| GET | `/api/miembros` | — | `Miembro[]` | Equipo |
| POST | `/api/miembros/invitar` | `{ nombre, email, rol }` | `Miembro` (passwordTemp) | ModalInvitar |
| PUT/DELETE | `/api/miembros/:id` | `Miembro` | `Miembro` | ModalEditarMiembro |
| POST | `/api/tienda/pausar` / `/api/negocio/eliminar` | — | `{ok}` | Zona peligrosa |

## Ambigüedades
- `[AMBIGUO: los datos de ConfigGeneral (negocio, pagos, envíos, redes) están hardcodeados en JSX sin interfaz TS ni mock. Falta el tipo `Negocio` explícito.]`
- `[AMBIGUO: 3 roles en mock vs 4 roles (owner/admin/cajero/empleado) del proyecto. Reconciliar nombres.]`
- `[AMBIGUO: `logo`/`favicon`/`HeroSlide.img` son null en mock. Se necesita storage de imágenes (Supabase Storage).]`
- `[AMBIGUO: Permiso ¿es catálogo global (seed) o por negocio? El mock lo trata como global.]`

---

# Módulo 10: `cliente/*` (Storefront público)

> Todas las vistas consumen **`@/lib/storefront/mock.ts`** (fuera de `ventas/`), con tipos en
> `@/lib/storefront/types.ts`. Es un **modelo de datos paralelo** al del panel — clave para el
> análisis cruzado. Comparte la API de descuentos con el POS.

## Vistas encontradas
- **Inicio** (`cliente/inicio/Inicio.tsx`) — home de la tienda (hero, categorías, destacados).
- **Catalogo** (`cliente/catalogo/Catalogo.tsx`), **Categoria** (`cliente/catalogo/Categoria.tsx`).
- **ProductoDetalle** (`cliente/producto/ProductoDetalle.tsx`).
- **Carrito** (`cliente/checkout/Carrito.tsx`).
- **CheckoutDatos** (`cliente/checkout/CheckoutDatos.tsx`) — comprador + dirección.
- **CheckoutPago** (`cliente/checkout/CheckoutPago.tsx`) — MP/transferencia/retiro.
- **Confirmacion** (`cliente/checkout/Confirmacion.tsx`).
- **Seguimiento** (`cliente/pedido/Seguimiento.tsx`), **Comprobante**, **Devolucion**, **Cancelar**.
- **Perfil** (`cliente/perfil/Perfil.tsx`) — tabs pedidos/mensajes/direcciones/datos/seguridad + `MensajesCliente`.
- **Login**, **Registro**, **ForgotPassword** (`cliente/auth/`).
- **CuponesPublicos** (`cliente/cupones/CuponesPublicos.tsx`), **DescuentoExclusivo** (`cliente/cupones/DescuentoExclusivo.tsx`).

## Datos que consume (`@/lib/storefront/mock.ts`)
`TIENDA` (TiendaConfig), `CATEGORIAS`, `PRODUCTOS`, `CARRITO_INICIAL`, `DIRECCIONES`, `USUARIO_MOCK`, `HISTORIAL_MOCK`, `CUPONES_MOCK`, `DESCUENTOS_EXCLUSIVOS`, `MENSAJES_MOCK`, `PEDIDO_MOCK`.

## Datos que envía
- Registro/login/recuperar contraseña.
- Agregar al carrito, checkout: `{ comprador{nombre,apellido,email,telefono}, direccion, metodoPago }` → crear pedido.
- Solicitar devolución / cancelar pedido.
- Editar datos de perfil, direcciones.
- Enviar mensaje a la tienda; canjear cupón/descuento exclusivo.

## Campos calculados (NO persistir)
- Totales de checkout (`useCheckout`/`computeCheckoutTotals` en `_shared/hooks`): `subtotal`, `descProd` (por `precioAnt`), `descCupon` (10% hardcodeado), `descManual`, `descTotal`, `total`, `iva` (21% incl.).
- `totalGastado = sum(HISTORIAL válidos)`.
- Descuento de ofertas = `sum((precioAnt - precio) * qty)`.

## Entidades identificadas (⚠️ modelo storefront, distinto del panel)

### `Producto` (storefront)
`{ id, nombre, cat, precio, precioAnt, badge('Nuevo'|'Oferta'|null), hue, hue2, rating, stock: boolean }`
→ **Difiere del `Producto` del catálogo**: aquí `stock` es boolean, hay `rating` y `badge`, no hay `sku`/`variantes`/`estado`.

### `Categoria` (storefront)
`{ id, nombre, count, hue }` — sin slug/emoji/árbol.

### `ItemCarrito`
`{ id, nombre, variante(string), qty, precio, precioAnt, hue }`.

### `Direccion` (Address) — **falta en el panel**
`{ id, alias, calle, piso, ciudad, cp, default }` → sub-entidad de Cliente (1:N).

### `Pedido` (storefront) + `TimelineStep`
`{ id('ORB-2847'), fecha, total, items(number), tracking, metodoPago, comprador{nombre,email,telefono,direccion}, timeline: TimelineStep[] }`.
→ `TimelineStep { label, done, fecha }` = historial de estados (podría ser tabla `PedidoEstadoHistorial`).

### `Usuario` (StorefrontAccount) — cuenta del cliente
`{ nombre, apellido, email, telefono, avatar, miembro(fecha alta) }` → **relación con `Cliente` del panel sin modelar**.

### `PedidoResumen`
`{ id, fecha, total, items, estado, estadoTipo }` — proyección para el historial.

### `Cupon` (storefront) y `DescuentoExclusivo`
- `Cupon { codigo, tipo(porcentaje|monto), valor, descripcion, minCompra?, vencimiento?, categorias? }` (públicos).
- `DescuentoExclusivo { codigo, nombre, descripcion, tipo, valor, vencimiento?, categorias? }` (privados, por link).
→ Ambos deben mapear al modelo rico `Cupon`/`Descuento` del panel (mismo backend).

### `TiendaConfig`
`{ nombre, sub, slug, dominio, wpp, email }` — subconjunto de Apariencia/Negocio (branding público).

### `MensajeCliente`
`{ from: 'cliente'|'tienda', txt, hora }` — hilo único cliente↔tienda.

## Relaciones
- `Usuario/Cliente → Direccion` (1:N), `→ Pedido` (1:N), `→ MensajeCliente` (1:N).
- `Pedido → TimelineStep` (1:N), `→ comprador` (embebido/snapshot), `→ metodoPago`.
- `Carrito → ItemCarrito → Producto` (N:1).
- `Cupon/DescuentoExclusivo → Categoria` (N:N vía `categorias[]`).

## Endpoints necesarios

| Método | Ruta | Request | Response | Vista |
|---|---|---|---|---|
| POST | `/api/auth/registro` \| `/login` \| `/forgot` | credenciales | `{ token, usuario }` | auth |
| GET | `/api/tienda/:slug` | — | `TiendaConfig` + Apariencia | todas |
| GET | `/api/tienda/:slug/productos` | query `{ categoria, search }` | `Producto[]` | Catalogo |
| GET | `/api/tienda/:slug/productos/:id` | — | `Producto` + relacionados | ProductoDetalle |
| POST | `/api/checkout` | `{ items, comprador, direccion, metodoPago, cupon? }` | `Pedido` | CheckoutPago |
| POST | `/api/descuentos/evaluar` | `{ items, cupon }` | totales | Carrito/Checkout |
| GET | `/api/mi/pedidos` | — | `PedidoResumen[]` | Perfil |
| GET | `/api/pedidos/:id/seguimiento` | — | `Pedido` (timeline) | Seguimiento |
| POST | `/api/pedidos/:id/devolucion` \| `/cancelar` | `{ items, motivo, reembolso }` | `{ok}` | Devolucion/Cancelar |
| GET/POST/PUT/DELETE | `/api/mi/direcciones` | `Direccion` | `Direccion[]` | Perfil |
| PUT | `/api/mi/perfil` | `Usuario` | `Usuario` | Perfil |
| POST | `/api/mi/mensajes` | `{ txt }` | `MensajeCliente` | MensajesCliente |
| GET | `/api/tienda/:slug/cupones` | — | `Cupon[]` | CuponesPublicos |
| GET | `/api/descuento-exclusivo/:codigo` | — | `DescuentoExclusivo` | DescuentoExclusivo |

## Ambigüedades
- `[AMBIGUO: el descuento de cupón en checkout es 10% HARDCODEADO. La evaluación real debe ir a /descuentos/evaluar.]`
- `[AMBIGUO: `Producto` del storefront (stock:boolean, rating, badge) vs `Producto` del catálogo (stock:number, sku, variantes). Es la MISMA entidad con proyecciones distintas — badge/rating deben resolverse: badge es derivado (Nuevo/Oferta), rating requiere tabla de reseñas.]`
- `[AMBIGUO: `rating` no tiene fuente (no hay entidad Reseña en ningún módulo). ¿Se persiste rating agregado o hay reseñas?]`
- `[AMBIGUO: relación cuenta storefront (`Usuario`) ↔ `Cliente` del panel: mismo email pero modelos separados. Definir si son una sola tabla `clientes` con login opcional.]`
- `[AMBIGUO: numeración de pedidos: storefront `ORB-2847`, panel `1284`, POS `0001-00000001`. Tres esquemas.]`

---

# Sección final: Análisis Cruzado

## Entidades compartidas entre módulos

| Entidad | Módulos que la usan | Campos en conflicto / observación |
|---|---|---|
| **Producto** | catalogo, inventario, pos, descuentos, pedidos, reportes, storefront | **7 formas distintas.** catalogo: `Producto{sku,stock:number,variantes:string[],estado,precioAnt}`; inventario: `ProductoStock{stock,stockMin}`; pos: `ProductoPOS{tieneVariantes,favorito,foto,categoriaId}`; descuentos: `ProductoPadre{precioDesde,variantes:Variante[]}`; pedidos: `ProductoRapido{precio}` + `LineaPedido{nombre}`; reportes: `TopProducto{unidades,monto}`; storefront: `Producto{stock:boolean,rating,badge,hue2}`. **Un solo modelo canónico con proyecciones.** |
| **VarianteProducto** | catalogo (combos), pos (VariantePOS), descuentos (Variante) | catalogo genera combos `{key,sku,precio,stock}`; pos `{talle,color,stock}`; descuentos `{nombre,sku,precio,stock}`. Atributos (talle/color) modelados como string libre en unos, tipados en otros. |
| **Categoria** | catalogo (plana + CatNode árbol), descuentos, pos, storefront | catalogo tiene jerarquía (`subcategorias`, `slug`, `icono`); descuentos plana con `productos[]`; pos `{id,label}`; storefront `{count,hue}`. IDs distintos: `'remeras'` (catalogo) vs `'cat-remeras'` (descuentos). |
| **Cliente / Customer** | clientes, pos, descuentos, pedidos, mensajes, storefront | clientes: `Cliente{segmento,tags,gasto,ticket}`; pos: `ClienteAsociado{dni}` (¡único con DNI!); descuentos: `ClienteMock{nombre,apellido}`; pedidos: `clienteId+cliente string`; mensajes: `cliente string`; storefront: `Usuario{avatar,miembro}` + `comprador`. Sin `dni`/`direcciones` unificados. |
| **Descuento** | descuentos (rico), pos (simple), storefront (Cupon/DescuentoExclusivo) | descuentos: 7 tipos con condiciones/bonus/vigencia; pos/types: `{tipo,valor,codigo}` plano; storefront: `Cupon`/`DescuentoExclusivo` simplificados. **descuentos/ es la fuente de verdad**; los demás son inputs a `/evaluar`. |
| **Cupon** | descuentos (rico), storefront (público) | descuentos: `{usosMaxPorCliente,privado,link_*,estado(agotado)}`; storefront: `{minCompra,vencimiento,categorias}`. |
| **Pedido / Venta** | pedidos (Pedido), pos (ResultadoVenta), storefront (Pedido), reportes | pedidos: `{clienteId,productos:LineaPedido[],canal,monto,estado}`; pos: `{numeroComprobante,metodosPago[],vuelto,items:TicketItem[]}`; storefront: `{tracking,timeline[],comprador}`. **¿Un modelo Orden unificado con canal, o Venta(POS)+Pedido(online) separados?** |
| **LineaPedido / TicketItem** | pedidos, pos, storefront, carrito | pedidos: `{nombre,cantidad,precio}` sin FK; pos: `{productoId,varianteId,precioEditado,descuento,esConcepto}`; carrito: `{key,qty,descPct,variante}`. |
| **Miembro / Usuario-staff** | configuracion (Miembro), pos (cajero), descuentos (creadoPor), inventario (usuario), auditoria (usuarioId) | Referenciado como FK en muchos lados pero por string suelto (`'usr-admin'`, `'Alexander'`). Tabla `business_members`. |
| **Branch / Sucursal** | pos (SesionCaja), inventario (stock), descuentos (métricas sucursalId), pedidos (Presencial) | **No existe entidad Branch en ningún mock**, pero el proyecto la exige día 1 y varios módulos la necesitan. Falta crear. |
| **Negocio / Business** | configuracion (raíz), TODOS (business_id) | Solo aparece hardcodeado en ConfigGeneral. Es el tenant raíz. |

## Datos que el mock tiene pero son de UI (NO persistir)

- **`hue`, `hue2`** (en Producto, Cliente-avatar, LineaPedido, Movimiento, TopProducto, etc.) — generan thumbnails de color placeholder. Se reemplazan por URLs de imagen reales.
- **`imagenes: number`** (catalogo) — es una **cantidad**, no imágenes. UI-only; el modelo real necesita `ProductoImagen[]` con URLs.
- **`avatar: 'MF'`** (storefront Usuario) — iniciales derivadas del nombre.
- **`color` de categorías/roles** (hex) — decorativo, aunque puede persistirse como preferencia.
- **`estado` derivado** (Descuento/Cupon: activo/programado/expirado/agotado; Producto: sin_stock) — calculado de fechas/stock/usos, no columna a escribir directamente (o materializada con cuidado).
- **`alcanceResumen`, `preview`, `tipoLabel`** — textos derivados para tablas.
- **`recurrente`, `miembros`(count), `count`(categorías), `totalComprado`, `pedidos/gasto/ticket/ultima`(cliente)** — **agregaciones/derivados**, no fuentes de verdad.
- **`tiempo`/`hora`** de mensajes (`"14:26"`, `"Ayer"`) — formato de display, no timestamp real.
- KPIs y series de reportes/dashboard — todos calculados.

## Datos que faltan en el mock pero la lógica de negocio necesita

- **`business_id`** en TODAS las entidades persistentes (multi-tenant). Ausente en todos los mocks.
- **`branch_id`** en Stock, Movimiento, SesionCaja, Venta, Pedido (Presencial), métricas. **No existe entidad `Branch`** pese al requerimiento "branches desde día uno".
- **Timestamps `created_at` / `updated_at`** en la mayoría (Cliente, Producto, Categoria, Proveedor, Conversacion, Movimiento parcial). Solo descuentos/cupones los tienen.
- **FKs reales**: hoy muchas relaciones son por **string/nombre** (LineaPedido→producto, Movimiento→producto/usuario, Devolucion→pedido, Conversacion→cliente). Falta `producto_id`, `usuario_id`, `pedido_id`, `cliente_id`.
- **Tabla de canjes `UsoCupon`/`UsoDescuento`** (`{cupon_id,cliente_id,pedido_id,monto,canal,branch_id,fecha}`) — imprescindible para `usosMaxPorCliente`, tasa de canje y métricas por canal/sucursal.
- **`Direccion`** del cliente — solo existe en storefront; el panel `Cliente` no la tiene.
- **`ClienteNota`** y **actividad/timeline del cliente** — inferidas de tabs de ClienteDetalle, sin modelo.
- **`ProductoImagen`** (URLs, orden, principal) — hoy solo hay un contador.
- **`ProductoReseña` / rating** — el storefront muestra `rating` sin fuente.
- **`PedidoEstadoHistorial`** — el storefront tiene `timeline[]`; el panel cambia estado sin historial.
- **`Pago` como entidad** con estado (pendiente/confirmado) — hoy `metodoPago` es un string; MercadoPago V1 necesita `{ preference_id, payment_id, status, monto }`.
- **`costo`, `descripcion`, `tags`** del producto — en el form de alta pero no en el tipo `Producto`.
- **`dni`** del cliente — solo en POS.
- **Vínculo cuenta-storefront (`Usuario`) ↔ `Cliente`** — sin modelar.
- **Persistencia server-side de tickets pausados** (hoy localStorage).
- **`StockPorSucursal`** — el stock hoy es plano en el producto.

## Decisiones pendientes

1. **¿Orden unificada o Venta+Pedido separadas?** POS (`ResultadoVenta`, comprobante, pago mixto, vuelto) y online (`Pedido`, tracking, timeline, envío) tienen ciclos distintos. Recomendación: una tabla `orden` con `canal` + campos opcionales, o dos tablas con vista común. Definir antes de tocar Reportes (que agrega ambas).
2. **Numeración de comprobantes/pedidos**: unificar los 3 esquemas (`ORB-2847`, `1284`, `0001-00000001`).
3. **Modelo de Producto canónico**: consolidar las 7 proyecciones en una entidad + variantes ricas + imágenes reales + costo/descripcion/tags. Deprecar `variantes: string[]`.
4. **Producto ↔ Categoria por FK** (no por nombre). Unificar IDs de categoría (`remeras` vs `cat-remeras`).
5. **Stock por sucursal** (`StockPorSucursal`) y creación de la entidad **`Branch`** (falta por completo).
6. **Cliente único**: fusionar `Cliente` (panel) + `ClienteAsociado` (POS, con DNI) + `Usuario` (storefront, con login) + direcciones. ¿Cliente con o sin cuenta?
7. **Tabla de canjes de descuentos/cupones** para soportar límites por cliente y métricas por canal/sucursal.
8. **Roles**: reconciliar 3 del mock (dueno/admin/vendedor) con 4 del proyecto (owner/admin/cajero/empleado). ¿`Permiso` es catálogo global o por negocio?
9. **Evaluación de descuentos**: confirmar contrato de `/api/descuentos/evaluar` (input carrito, output desglose) y la precedencia "best discount wins" (¿mayor ahorro o `prioridad`?). Reemplazar los descuentos hardcodeados (10% en checkout).
10. **Pagos MercadoPago V1**: modelar entidad `Pago` con estado y referencia externa; hoy `metodoPago` es solo un enum string.
11. **Storage de imágenes** (logo, favicon, sliders, fotos de producto) — Supabase Storage; los mocks tienen `null`/contadores.
12. **Devoluciones/Notas de crédito**: agregar `pedido_id` a `Devolucion`; tipar `NotaCredito.vence` como fecha; vincular devolución→nota de crédito→saldo del cliente.
13. **Mensajería**: unificar enum de remitente, agregar timestamps reales y canal (WhatsApp vs interno); definir cardinalidad conversación↔pedido.
14. **Auditoría transversal**: `LogAuditoria` hoy es solo de descuentos/cupones. Evaluar extenderlo a productos, precios (POS `precioEditado`), stock y pedidos.
15. **`tienda/` (stubs vacíos)**: la carpeta `ventas/tienda/` (`CatalogoTienda`, `CarritoTienda`, `FlujoPagoTienda`, `ProductoCard`, `useInventarioTienda`) está **vacía (0 líneas)**. El storefront real vive en `cliente/` + `@/lib/storefront/`. Decidir si `tienda/` se elimina o se implementa.

---

## Anexo: componentes `_shared` relevantes al modelo

- `_shared/hooks/useCarrito.ts` → `CarritoItem{key,id,nombre,precio,cat,qty,descPct?,variante?}` (estado local, no persistente).
- `_shared/hooks/useCheckout.ts` → `computeCheckoutTotals` (cálculo de totales, IVA 21% incluido — lógica de UI que el backend debe replicar/autoritar).
- `_shared/hooks/useInventario.ts` y `tienda/useInventarioTienda.ts` → **archivos vacíos** (stubs).
- Componentes compartidos (`SelectorCliente`, `SelectorProducto`, `SelectorVariante`, `MatrizVariantes`, `DataTable`, etc.) confirman que Cliente, Producto y Variante son entidades transversales reutilizadas por POS, Pedidos, Inventario y Descuentos.
