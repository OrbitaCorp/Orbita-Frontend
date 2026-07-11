# Análisis Frontend → Modelo de datos (`apps/web/src/modules/ventas/`)

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

---

## Cambios detectados (actualización post-`MODELO_DATOS_DEFINITIVO.md`)

> Verificado con `git log` (rango `cd5f9f9..HEAD`, commit en que se creó este análisis hasta hoy)
> y `git status` (sin drift sin commitear). El frontend se movió de `src/` a `apps/web/src/`
> (reestructuración pura, `git mv`, cero cambios de contenido) y tuvo **un solo cambio de
> contenido** en `ventas/` + `components/storefront/` desde entonces:

- **`fix(storefront): quitar rating con estrellas del cliente`** (commit `3931223`) — elimina la
  UI de estrellas en `apps/web/src/components/storefront/ProductCard.tsx` y
  `cliente/producto/ProductoDetalle.tsx` (bloque de valoración junto al título, promedio en el
  header de "Reseñas de clientes", estrellas por reseña individual, selector de estrellas del
  formulario "Escribí tu reseña"). Implementa la **Decisión 5** de `MODELO_DATOS_DEFINITIVO.md`
  (`reviews` = opiniones verificadas, **sin rating numérico**).
  - **El propio commit aclara que es un cambio parcial, solo de UI**: "No se tocan los tipos ni
    los datos mock (`rating` en `Producto`/`PRODUCTOS`): el cambio de modelo de datos queda a
    cargo del CTO según el documento." Verificado — sigue habiendo `rating: number` en
    `@/lib/storefront/types.ts` y en cada producto de `@/lib/storefront/mock.ts`.
  - **El rollout quedó incompleto** — quedan restos de rating no tocados por el commit:
    `cliente/catalogo/Categoria.tsx` todavía muestra `'4.6 ★'` hardcodeado junto al conteo de
    productos; `panel/configuracion/Apariencia.tsx` (+ `StorePreview.tsx` +
    `mock/apariencia.mock.ts`) todavía expone el toggle `mostrarRating` ("Puntuaciones y
    reseñas") que ya no debería tener efecto si no hay rating que mostrar. Ver nota en Módulo 10
    y en Análisis Cruzado.
- **Ningún otro archivo cambió** bajo `ventas/` desde el análisis original: mismos 9 módulos de
  `panel/`, misma estructura de `cliente/*`, `tienda/` sigue siendo 5 archivos stub de 0 líneas,
  `_shared/hooks/useInventario.ts` sigue vacío. No hay módulos nuevos, archivos borrados/renombrados,
  ni mock data o tipos TS modificados fuera del cambio de UI de rating descripto arriba.
- El resto de esta actualización consiste en **cruzar cada `[AMBIGUO: …]` contra
  `MODELO_DATOS_DEFINITIVO.md`** (documento "Estado: Definitivo", todas las decisiones de
  arquitectura cerradas) para marcar cuáles ya tienen decisión tomada.

---

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

> **Sin cambios detectados en el código** desde el análisis original.

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
- `[AMBIGUO: los KPIs del Dashboard están hardcodeados en JSX, no en mock. No hay contrato claro de qué ventana temporal cubre cada delta ("vs ayer" vs período seleccionado).]` — **sigue sin resolver.** `MODELO_DATOS_DEFINITIVO.md` define las tablas fuente (`orders`, `payments`, etc.) pero no especifica la ventana temporal de comparación de los deltas; queda para el contrato de API de `/api/reportes/dashboard`.
- `[AMBIGUO: "Clientes nuevos" — la definición de "nuevo" (primer pedido en el período vs alta de cuenta) no está en el código.]` — **sigue sin resolver.** No hay definición en el documento; es una regla de negocio a definir en el contrato de API, no en el schema.

---

# Módulo 2: `panel/pedidos`

> **Sin cambios detectados en el código** desde el análisis original.

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
| id | string | interfaz TS | PK. En mock son `"1284"`; storefront usa `"ORB-2847"` → `[RESUELTO: orderNumber unificado, ver Ambigüedades del módulo]` |
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
| vence | string | interfaz TS | ¡`"30 jun"` display, no ISO! → `[RESUELTO: credit_notes.expiresAt es DateTime? real]` |

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
- `[RESUELTO: OrderItem (order_items §8.2) — las líneas referencian variant_id (FK a product_variants), no un nombre string. productName/variantLabel quedan como snapshot desnormalizado además de la FK, no en lugar de ella. Todo producto tiene al menos una variante (incluso los "sin variación" tienen una variante default), así que la línea siempre apunta a una variante concreta.]`
- `[AMBIGUO: la etapa de la cola de preparación (kanban preparar/listo/despachado) sigue sin un campo propio en el modelo definitivo. `OrderStatus` (PENDING→CONFIRMED→PREPARING→SHIPPED→DELIVERED) cubre el ciclo de vida general de una orden ONLINE, pero no está confirmado si `PREPARING` reemplaza 1:1 al tablero de 3 etapas de `ColaPreparacion` o si esa vista necesita un campo/tabla aparte. Confirmar con el CTO al implementar `ColaPreparacion`.]`
- `[RESUELTO: Return (returns §12.1) tiene order_id obligatorio y order_item_id opcional (línea específica devuelta). Resuelve exactamente la ambigüedad — "resuelve la ambigüedad del frontend donde faltaba pedido_id" según la nota del propio documento.]`
- `[RESUELTO: CreditNote.expiresAt (credit_notes §12.2) es DateTime? real, no un string de display. La nota del documento lo confirma explícitamente: "resolviendo la ambigüedad del frontend donde vence era un string de display".]`

**Nuevo en el modelo definitivo (no estaba en la ambigüedad original, pero afecta este módulo):**
`CreditNote.returnId` es `@unique` — 1:1 opcional con la devolución que la originó (antes no estaba claro si una nota de crédito podía originarse de más de una devolución). `Return.status` usa un enum de 4 valores (`PENDING/IN_PROCESS/APPROVED/REJECTED`), igual cardinalidad que `EstadoDevolucion` del frontend.

---

# Módulo 3: `panel/catalogo`

> **Sin cambios detectados en el código** desde el análisis original.

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
- `[RESUELTO: se persiste el modelo rico y se deprecа Producto.variantes: string[]. product_options (§6.5, ej. "Talle"/"Color") → product_option_values (§6.6, ej. "M"/"Negro") → product_variants (§6.7, combinación concreta con SKU/precio/barcode propios) → variant_option_values (§6.8, pivot). Modelo relacional tipo Shopify, según lo nombra el propio documento.]`
- `[RESUELTO: product_images (§6.9) — tabla con url (Supabase Storage), position, isPrimary y option_value_id opcional (para asociar fotos a un color específico, ej. "Negro"). Reemplaza el contador Producto.imagenes: number.]`
- `[RESUELTO: products.category_id (§6.3) es FK real a categories.id. Un producto pertenece a una sola categoría (la más específica del árbol). El árbol de categorías vive en categories vía parent_id self-referencing (§6.1), con slug único por negocio — unifica el doble esquema de IDs del frontend (`remeras` en catálogo vs `cat-remeras` en descuentos).]`
- `[RESUELTO: products (§6.3) tiene cost (privado, para margen), description y basePrice como columnas propias. tags se modela como tabla Tag + pivot product_tags (§6.2/§6.4) en vez de string[] libre, "para evitar duplicados por inconsistencia de escritura".]`

**Nuevo en el modelo definitivo (no estaba en la ambigüedad original):**
- **Todo producto tiene al menos una variante**, incluso los que el dueño crea "sin variantes": el backend crea una variante `isDefault` que hereda precio/stock. El frontend no la muestra como variante, pero toda venta/todo stock es siempre de una variante — unifica la lógica de inventario y ventas de punta a punta.
- `products.inventoryType` existe como punto de bifurcación futuro (`standard | serialized | fractional | batch | simple`); en V1 siempre es `'standard'`, no tiene UI todavía.

---

# Módulo 4: `panel/inventario`

> **Sin cambios detectados en el código** desde el análisis original.

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
- `[RESUELTO: suppliers (§7.3) tiene id UUID propio como PK. ultimaCompra y totalComprado quedan confirmados como calculados (agregando stock_movements), no se persisten — igual que había anticipado el análisis original.]`
- `[RESUELTO: stock_movements (§7.2) tiene variant_id (FK a product_variants) y created_by (FK opcional a members) — ya no son strings sueltos.]`
- `[RESUELTO: stock_movements.order_id (FK opcional a orders) vincula la salida a la orden real que la generó. Nota textual del documento: "el vínculo orderId resuelve la ambigüedad del frontend donde el motivo 'Venta #1284' era solo un string". Al cobrar (POS u online), el backend crea los stock_movements de tipo SALIDA automáticamente.]`
- `[RESUELTO: variant_stock (§7.1) — stock por variante Y por sucursal (`@@unique([variantId, branchId])`), nunca "global". Es la fuente de verdad del inventario; "stock bajo" se deriva de `quantity <= stockMin` en tiempo de lectura, no se persiste.]`

---

# Módulo 5: `panel/clientes`

> **Sin cambios detectados en el código** desde el análisis original.

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
- `[RESUELTO: customers (§5.1) NO tiene columnas pedidos/gasto/ticket/ultima/segmento — se calculan on-read (agregando orders), no se materializan. Es la decisión implícita de no incluirlas como columnas propias en el modelo definitivo. tags y segment quedan explícitamente diferidos ("Sin segment ni tags en V1 (diferido)").]`
- `[RESUELTO: customers.dni (§5.1) es un campo único del Customer unificado — ya no vive solo en el POS.]`
- `[RESUELTO: customers unifica los cuatro modelos del frontend (Cliente panel, ClienteAsociado POS, Usuario storefront, comprador de checkout) en una sola tabla. auth_user_id (FK a Supabase auth.users) es nullable: NULL = cliente sin cuenta (creado en POS), con valor = cliente con cuenta de storefront. Vinculación POS↔storefront: si alguien se registra en storefront con un email que ya existe como cliente POS, el backend setea auth_user_id sobre el registro existente en vez de duplicar.]`

**Nuevo en el modelo definitivo:** `addresses` (§5.2) resuelve "Direccion (Address) — falta en el panel" de la sección cruzada: pasa a ser 1:N de `customers`, ya no exclusiva del storefront. `ClienteNota` (la tab "notas" de `ClienteDetalle`) **no aparece en los 51 modelos** — sigue sin tabla propia, `[AMBIGUO: sigue sin resolver]`.

---

# Módulo 6: `panel/descuentos`

> **Sin cambios detectados en el código** desde el análisis original.

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

## ⚠️ Decisión de arquitectura no anticipada por este análisis: `Descuento` y `Cupon` se UNIFICAN

El análisis original modelaba `Descuento` y `Cupon` como **dos entidades separadas** (con `LogAuditoria`
polimórfico entre ambas). `MODELO_DATOS_DEFINITIVO.md` (§11.1) decide lo contrario: **una sola tabla
`discounts`**, con un campo `code String?` nullable — si `code` es `null` es un descuento automático
(sin código), si tiene valor es un cupón canjeable. Cita textual: *"Una sola tabla discounts con un
campo code nullable unifica descuentos automáticos (sin código) y cupones (con código)"*.

Consecuencias para el contrato de API y el frontend (a implementar, no implementado hoy):
- `discount_redemptions` (antes `UsoCupon`/`UsoDescuento`, dos conceptos separados en el análisis)
  pasa a tener una sola FK `discount_id` — "ya no discount_id Y coupon_id separados como en el diseño
  anterior. Simplifica la tabla" (nota textual del documento).
- **V1 solo implementa 4 de los 7 `DiscountType`** (`PERCENT_PRODUCT`, `AMOUNT_PRODUCT`,
  `PERCENT_TICKET`, `AMOUNT_TICKET`). Los otros 3 (`BUY_X_PAY_Y`, `BUY_X_GET_Z`, `VOLUME` — que en el
  frontend son `lleva_x_paga_y`, `compra_x_obtiene_z`, `volumen`) quedan en el enum para no migrar en
  V2, pero su evaluación se difiere y la UI debe ocultarlos. Los campos `bonus*` de
  `compra_x_obtiene_z` **no están en el schema V1** — se agregan cuando se implemente ese tipo.
- Campos de link compartible (`linkActive`, `linkRedirect`) y `isPrivate` quedan en la tabla unificada
  — antes eran exclusivos de `Cupon` en el análisis.

## Ambigüedades
- `[RESUELTO: discount_redemptions (§11.4) — tabla de solo-inserción, imprescindible para límites por cliente, tasa de canje y métricas por canal. Trackea tanto descuentos automáticos como cupones (ver unificación arriba). Incluye channel (POS|STOREFRONT), confirmando la necesidad de branch/canal que ya intuía el análisis original.]`
- `[RESUELTO: "best discount wins" se evalúa en /api/discounts/evaluate (backend) y aplica el de mayor ahorro, con priority (Int, default 0) como desempate — confirma exactamente la hipótesis del análisis original ("prioridad vs mayor ahorro"): es mayor ahorro primero, prioridad para desempatar.]`
- `[RESUELTO: discounts.createdBy (§11.1) es FK opcional real a members, no un string suelto como `'usr-admin'`.]`

---

# Módulo 7: `panel/pos`

> **Sin cambios detectados en el código** desde el análisis original.

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
- `[RESUELTO: existe el permiso pos.edit_price (permissions §4.3, catálogo global) que controla si un miembro puede usar order_items.editedPrice. Nota textual: "Es el permiso que faltaba en el frontend para restringir la edición de precio." Además queda auditable vía audit_logs (entityType genérico, ya no exclusivo de descuentos/cupones) — resuelve también la parte de "quedar en auditoría".]`
- `[AMBIGUO: TicketPausado (ticket en pausa) sigue sin tabla en el modelo definitivo — no aparece ningún modelo de "parked ticket" entre los 51. Sigue viviendo solo en localStorage (`usePausadosStore`). Sigue sin resolver; si se necesita multi-dispositivo, es un modelo a agregar en un futuro incremento, no contemplado en V1.]`
- `[RESUELTO: se unifican en una sola tabla orders (§8.1) con channel: OrderChannel (POS|ONLINE). Los campos comunes (customerId, total, status, etc.) viven en orders; los específicos de canal en satélites 1:1 — pos_sale_details (§8.3: cashSessionId, changeAmount/vuelto) y online_order_details (§8.4: shippingAddressId, datos del comprador, tracking). orderNumber (Int, único por negocio) reemplaza tanto el numeroComprobante del POS como el id "1284" del panel — "es lo que ve el dueño y el cliente". fiscalNumber queda separado y nullable, para cuando se implemente facturación AFIP real.]`
- `[RESUELTO: el frontend debe migrar el descuento simple embebido del ticket (`pos/types.ts::Descuento`) a consumir discounts (el modelo unificado, ver Módulo 6) vía /api/discounts/evaluate. No hay dos modelos de descuento en el backend — el tipo simple del POS queda obsoleto.]`
- `[RESUELTO: order_items.isConcept (§8.2) es exactamente la bandera que pedía la ambigüedad — "ítem libre... que no existe como producto y no descuenta stock". Nota textual: "Resuelve la ambigüedad del frontend".]`

**Nuevo en el modelo definitivo (no anticipado):** `favorito` de `ProductoPOS` — ¿por usuario o por negocio? — **sigue sin resolver**, ningún campo de favoritos aparece en los 51 modelos. `pos_sale_details.cashSessionId` confirma que toda venta POS pertenece a una `CashSession` (una sesión = un turno de un cajero en una sucursal; el modelo **soporta múltiples cajas simultáneas** por sucursal, algo que el análisis original no había explicitado).

---

# Módulo 8: `panel/mensajes`

> **Sin cambios detectados en el código** desde el análisis original.

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
- `[RESUELTO: messages.sender usa el enum MessageSender (CUSTOMER|STORE) — unificado. Nota textual: "unifica los remitentes que en el frontend estaban inconsistentes (panel usaba 'cli'/'me', storefront 'cliente'/'tienda')".]`
- `[RESUELTO: messages.createdAt es DateTime real (@default(now())), no un string de display. Nota textual lo confirma explícitamente.]`
- `[RESUELTO (por regla de negocio, no por constraint de DB): la sección 13 del documento abre con "Un hilo por cliente, con menciones opcionales a pedidos" — confirma la cardinalidad que proponía el storefront (1 conversación por cliente) sobre la del panel. `conversations` no tiene `@@unique([businessId, customerId])` en el schema, así que la unicidad de "un hilo por cliente" queda a cargo de la lógica de aplicación, no de una constraint de base. `messages.orderId` (opcional) modela la mención a pedido igual que proponía el análisis original.]`
- `[AMBIGUO: el canal del mensaje (WhatsApp vs chat interno) sigue sin campo en el modelo — ni conversations ni messages tienen channel. Sigue sin resolver.]`

---

# Módulo 9: `panel/configuracion`

> **Sin cambios detectados en el código** desde el análisis original.

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
- `[RESUELTO: el ConfigGeneral hardcodeado se reparte en dos tablas 1:1 con businesses — business_config (§3.3: whatsapp, email, scheduleText, toggles acceptsMercadopago/acceptsCash/acceptsTransfer/acceptsPickup, transferAlias, shippingBase/freeShippingFrom/deliveryZones/shippingPolicy, instagram/tiktok/facebook) y businesses mismo (name, industry, description, mode, isActive/isPaused — "zona peligrosa"). Ya no son datos hardcodeados sin tipo.]`
- `[RESUELTO: se confirman 4 roles default por negocio — owner, admin, cajero, empleado (roles §4.2, isDefault=true, no editables/eliminables) — gana el esquema del proyecto sobre los 3 del mock (dueno/admin/vendedor). El frontend debe migrar los nombres.]`
- `[RESUELTO: storefront_config (§3.4) tiene logoUrl/faviconUrl como String? (URL de Supabase Storage), heroSlides como Json (array de {id,titulo,subtitulo,img,cta}). Confirma Supabase Storage como mecanismo, tal como anticipaba la ambigüedad.]`
- `[RESUELTO: permissions (§4.3) es catálogo global explícito — "No lleva business_id — es un seed estático compartido por todos los negocios", ~19 permisos en 7 grupos. Confirma la hipótesis del análisis original.]`

**Nuevo en el modelo definitivo (no anticipado):**
- `storefront_config.showRating` (default `true`) **sigue existiendo** como toggle pese a que `reviews` ya no tiene rating numérico (ver Módulo 10) — posible inconsistencia dentro del propio documento definitivo, no solo del frontend; ver nota en Análisis Cruzado.
- `notification_config` (§3.5) modela la matriz evento×canal como un solo campo `Json` (`matrix`), no como filas — más simple que lo que el análisis original dejaba abierto.
- `businesses.mode` (`FULL | SHOWCASE`) es una decisión de producto no cubierta por el análisis original: en modo `SHOWCASE` ("vidriera digital") el storefront **oculta** checkout/carrito/cupones/mensajes/opiniones y muestra un botón de WhatsApp por producto en su lugar. Esto afecta directamente a los módulos `panel/mensajes`, `panel/descuentos` y `cliente/*` (Módulo 10) — sus endpoints y vistas deben condicionarse a `business.mode`.

---

# Módulo 10: `cliente/*` (Storefront público)

> Todas las vistas consumen **`@/lib/storefront/mock.ts`** (fuera de `ventas/`), con tipos en
> `@/lib/storefront/types.ts`. Es un **modelo de datos paralelo** al del panel — clave para el
> análisis cruzado. Comparte la API de descuentos con el POS.
>
> **Cambio de código detectado** (commit `3931223`, ver "Cambios detectados" al inicio del
> documento): se quitó la UI de estrellas de `ProductoDetalle.tsx` y `ProductCard.tsx`. Es un
> cambio **parcial y solo visual** — `@/lib/storefront/types.ts` sigue declarando
> `rating: number` y `mock.ts` sigue trayendo un valor de rating por producto; además
> `cliente/catalogo/Categoria.tsx` (`'4.6 ★'` hardcodeado) y el toggle `mostrarRating` de
> `panel/configuracion/Apariencia.tsx` no se tocaron. Ver detalle e inconsistencia en Análisis
> Cruzado.

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
- `[RESUELTO (arquitectura): la evaluación de descuentos/cupones queda centralizada en /api/discounts/evaluate contra la tabla discounts unificada (ver Módulo 6), con priority para desempate de "best discount wins". El 10% hardcodeado en el checkout del storefront es deuda de implementación pendiente de reemplazar por esa llamada — el modelo de datos y el contrato ya están definidos, falta que el frontend deje de simular.]`
- `[RESUELTO: badge (Nuevo/Oferta) queda confirmado como derivado — se deriva de comparePrice != null (Oferta) o de antigüedad (Nuevo), no se persiste como columna. `Producto` del storefront y del catálogo son la misma entidad products/product_variants con proyecciones distintas por endpoint, tal como proponía el análisis.]`
- `[RESUELTO — CON CAMBIO DE DISEÑO: no se persiste un "rating agregado". reviews (§14.1) son opiniones de texto verificadas, "sin rating numérico". No hay Review.rating ni ningún campo numérico de puntuación en los 51 modelos. Esto no es lo que proponía la ambigüedad original (que asumía un rating agregado o reseñas con puntuación) — es una decisión de producto más restrictiva. El frontend actual sigue mostrando `rating: number` en tipos/mock (ver nota de cambio de código arriba); falta la migración de datos para dejar de exponer ese campo.]`
- `[RESUELTO: customers (§5.1) es una única tabla con auth_user_id opcional — unifica Usuario (storefront) y Cliente (panel) en una sola entidad con o sin cuenta. Ver detalle en Módulo 5.]`
- `[RESUELTO: orderNumber (Int, único por negocio) es el único esquema de numeración operativa — reemplaza los tres esquemas del frontend (`ORB-2847` storefront, `1284` panel, `0001-00000001` POS). fiscalNumber queda aparte y nullable para cuando exista facturación AFIP real. Ver detalle en Módulo 7.]`

---

# Sección final: Análisis Cruzado

## Entidades compartidas entre módulos

| Entidad | Módulos que la usan | Campos en conflicto / observación | Resuelto en `MODELO_DATOS_DEFINITIVO.md` |
|---|---|---|---|
| **Producto** | catalogo, inventario, pos, descuentos, pedidos, reportes, storefront | **7 formas distintas.** catalogo: `Producto{sku,stock:number,variantes:string[],estado,precioAnt}`; inventario: `ProductoStock{stock,stockMin}`; pos: `ProductoPOS{tieneVariantes,favorito,foto,categoriaId}`; descuentos: `ProductoPadre{precioDesde,variantes:Variante[]}`; pedidos: `ProductoRapido{precio}` + `LineaPedido{nombre}`; reportes: `TopProducto{unidades,monto}`; storefront: `Producto{stock:boolean,rating,badge,hue2}`. **Un solo modelo canónico con proyecciones.** | ✅ **Sí** — `products` (§6.3) + `product_variants` (§6.7) + `variant_stock` (§7.1, stock por variante×sucursal, ya no en el producto). Todo producto tiene al menos una variante (incluso sin variación explícita). `rating`/`badge`/`hue*` quedan fuera del modelo persistente (derivados o eliminados, ver abajo). |
| **VarianteProducto** | catalogo (combos), pos (VariantePOS), descuentos (Variante) | catalogo genera combos `{key,sku,precio,stock}`; pos `{talle,color,stock}`; descuentos `{nombre,sku,precio,stock}`. Atributos (talle/color) modelados como string libre en unos, tipados en otros. | ✅ **Sí** — `product_options`→`product_option_values`→`product_variants`→`variant_option_values` (§6.5-6.8), modelo relacional tipado (no string libre). |
| **Categoria** | catalogo (plana + CatNode árbol), descuentos, pos, storefront | catalogo tiene jerarquía (`subcategorias`, `slug`, `icono`); descuentos plana con `productos[]`; pos `{id,label}`; storefront `{count,hue}`. IDs distintos: `'remeras'` (catalogo) vs `'cat-remeras'` (descuentos). | ✅ **Sí** — `categories` (§6.1), árbol self-referencing vía `parent_id`, `slug` único por negocio. Un solo esquema de IDs. |
| **Cliente / Customer** | clientes, pos, descuentos, pedidos, mensajes, storefront | clientes: `Cliente{segmento,tags,gasto,ticket}`; pos: `ClienteAsociado{dni}` (¡único con DNI!); descuentos: `ClienteMock{nombre,apellido}`; pedidos: `clienteId+cliente string`; mensajes: `cliente string`; storefront: `Usuario{avatar,miembro}` + `comprador`. Sin `dni`/`direcciones` unificados. | ✅ **Sí** — `customers` (§5.1) unifica los 4 modelos, `dni` y `addresses` (§5.2) incluidos. `auth_user_id` opcional distingue cliente con/sin cuenta. `segmento`/`tags` quedan explícitamente diferidos (no en V1). |
| **Descuento** | descuentos (rico), pos (simple), storefront (Cupon/DescuentoExclusivo) | descuentos: 7 tipos con condiciones/bonus/vigencia; pos/types: `{tipo,valor,codigo}` plano; storefront: `Cupon`/`DescuentoExclusivo` simplificados. **descuentos/ es la fuente de verdad**; los demás son inputs a `/evaluar`. | ✅ **Sí, con cambio de diseño no anticipado** — `discounts` (§11.1) unifica Descuento Y Cupon en una sola tabla (`code` nullable). Ver nota completa en Módulo 6. Solo 4 de 7 `DiscountType` van en V1. |
| **Cupon** | descuentos (rico), storefront (público) | descuentos: `{usosMaxPorCliente,privado,link_*,estado(agotado)}`; storefront: `{minCompra,vencimiento,categorias}`. | ✅ **Sí** — absorbido dentro de `discounts` (ver fila de arriba); deja de ser una entidad separada. |
| **Pedido / Venta** | pedidos (Pedido), pos (ResultadoVenta), storefront (Pedido), reportes | pedidos: `{clienteId,productos:LineaPedido[],canal,monto,estado}`; pos: `{numeroComprobante,metodosPago[],vuelto,items:TicketItem[]}`; storefront: `{tracking,timeline[],comprador}`. **¿Un modelo Orden unificado con canal, o Venta(POS)+Pedido(online) separados?** | ✅ **Sí** — `orders` (§8.1) unificado con `channel: OrderChannel(POS\|ONLINE)`, satélites 1:1 `pos_sale_details`/`online_order_details` (§8.3-8.4) para los campos específicos de canal. |
| **LineaPedido / TicketItem** | pedidos, pos, storefront, carrito | pedidos: `{nombre,cantidad,precio}` sin FK; pos: `{productoId,varianteId,precioEditado,descuento,esConcepto}`; carrito: `{key,qty,descPct,variante}`. | ✅ **Sí** — `order_items` (§8.2), único modelo con `variantId` FK real, `editedPrice`, `discountAmount`, `isConcept`. |
| **Miembro / Usuario-staff** | configuracion (Miembro), pos (cajero), descuentos (creadoPor), inventario (usuario), auditoria (usuarioId) | Referenciado como FK en muchos lados pero por string suelto (`'usr-admin'`, `'Alexander'`). Tabla `business_members`. | ✅ **Sí** — `members` (§4.1), FK real en todos los lugares donde el frontend usaba string (`discounts.createdBy`, `stock_movements.createdBy`, `payments.verifiedBy`, `cash_sessions.cashierId`, `audit_logs.memberId`). |
| **Branch / Sucursal** | pos (SesionCaja), inventario (stock), descuentos (métricas sucursalId), pedidos (Presencial) | **No existe entidad Branch en ningún mock**, pero el proyecto la exige día 1 y varios módulos la necesitan. Falta crear. | ✅ **Sí** — `branches` (§3.2), se auto-crea una sucursal "Principal" al crear el negocio. `orders`, `variant_stock`, `stock_movements`, `cash_sessions`, `cash_movements` llevan `branch_id`. |
| **Negocio / Business** | configuracion (raíz), TODOS (business_id) | Solo aparece hardcodeado en ConfigGeneral. Es el tenant raíz. | ✅ **Sí** — `businesses` (§3.1) es la raíz multi-tenant, + `business_config`/`storefront_config`/`notification_config` (§3.3-3.5) 1:1 para los datos que cambian con distinta frecuencia. |

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
- **`rating` numérico** (storefront) — **confirmado que NO se persiste de ninguna forma**, ni como columna en `reviews` ni como agregado. Decisión de producto (no solo de modelado): las opiniones son solo texto. Ver inconsistencia pendiente abajo.

## ⚠️ Inconsistencia detectada (no del frontend — dentro del propio `MODELO_DATOS_DEFINITIVO.md`)

`storefront_config.showRating` (§3.4, default `true`) sigue existiendo como toggle "mostrar puntuaciones y reseñas", pero `reviews` (§14.1) no tiene ningún campo de rating que ese toggle pueda mostrar u ocultar — son solo opiniones de texto. O el campo es un remanente que debería quitarse del modelo definitivo, o su semántica cambió a "mostrar/ocultar la sección de reseñas" sin que el nombre lo refleje. Vale la pena confirmarlo con el CTO antes de implementar `Apariencia.tsx`/`StorePreview.tsx`, que hoy exponen el toggle `mostrarRating` tal cual.

## Datos que faltan en el mock pero la lógica de negocio necesita

> Estado tras cruzar con `MODELO_DATOS_DEFINITIVO.md` — la enorme mayoría ya tiene tabla/campo
> asignado. Se marca cada ítem como resuelto (✅, con la tabla que lo cubre) o pendiente (❌).

- ✅ **`business_id`** en TODAS las entidades persistentes — confirmado como convención general (§1), con las 3 excepciones documentadas (pivots, `permissions`, `role_permissions`).
- ✅ **`branch_id`** — `branches` (§3.2) existe; llevan `branch_id` exactamente `orders`, `variant_stock`, `stock_movements`, `cash_sessions`, `cash_movements` (§1), ni más ni menos que lo que pedía el análisis.
- ✅ **Timestamps `created_at`/`updated_at`** — convención general (§1): toda tabla lleva `created_at`; las que se modifican después de creadas llevan además `updated_at`. Las de solo-inserción (movimientos, canjes, auditoría, historial) no llevan `updated_at` (decisión explícita, no un olvido).
- ✅ **FKs reales** en vez de string/nombre — resueltas módulo por módulo (ver arriba): `order_items.variantId`, `stock_movements.variantId`/`createdBy`, `returns.orderId`, `conversations.customerId`.
- ✅ **Tabla de canjes** — `discount_redemptions` (§11.4), ver Módulo 6 (con el cambio de diseño de unificación Descuento+Cupon).
- ✅ **`Direccion`/`addresses`** del cliente — ahora 1:N de `customers` (§5.2), ya no exclusiva del storefront.
- ❌ **`ClienteNota`** y actividad/timeline del cliente — **sigue sin tabla** en los 51 modelos. Sigue pendiente.
- ✅ **`ProductoImagen`/`product_images`** — con URL, orden, principal y FK opcional a `product_option_values` (§6.9).
- ✅ (con cambio de diseño) **Reseñas** — `reviews` (§14.1) existe, pero **sin rating**, solo texto verificado. No es lo que pedía el análisis original (que dejaba abierto si habría puntuación).
- ✅ **`PedidoEstadoHistorial`** — `order_status_history` (§8.5), solo para órdenes `ONLINE` (POS nace y muere en `COMPLETED`, no tiene historial).
- ✅ **`Pago`/`payments`** — entidad completa (§9.1) con `status`, referencia externa (`mpOrderId`/`mpPaymentId`), y verificación humana para transferencias (`verifiedBy`/`verifiedAt`).
- ✅ **`costo`, `descripcion`, `tags`** del producto — `products.cost`/`products.description` (§6.3) + `tags`/`product_tags` (§6.2/6.4).
- ✅ **`dni`** del cliente — `customers.dni` (§5.1), ya no exclusivo de POS.
- ✅ **Vínculo cuenta-storefront ↔ Cliente** — `customers.authUserId` opcional (§5.1) resuelve la unificación.
- ❌ **Persistencia server-side de tickets pausados** — **sigue sin tabla**. Sigue en localStorage, sin decisión de backend.
- ✅ **`StockPorSucursal`** — `variant_stock` (§7.1), único por (`variantId`,`branchId`).

## Decisiones pendientes

> Estado de cada una tras `MODELO_DATOS_DEFINITIVO.md` ("Definitivo", arquitectura cerrada).

1. ✅ **RESUELTO — Orden unificada.** `orders` (§8.1) con `channel: OrderChannel`, satélites `pos_sale_details`/`online_order_details` (§8.3-8.4) para lo específico de cada canal. Exactamente la opción "una tabla orden con canal + campos opcionales" que este documento recomendaba.
2. ✅ **RESUELTO — Numeración unificada.** `orderNumber` (Int, único por negocio) reemplaza los 3 esquemas. `fiscalNumber` queda aparte para AFIP (nullable, diferido).
3. ✅ **RESUELTO — Producto canónico.** `products`+`product_variants`+`product_options`(+values)+`product_images` (§6.3-6.9). `variantes: string[]` queda deprecado a favor del modelo relacional.
4. ✅ **RESUELTO — Producto↔Categoria por FK.** `products.categoryId` (§6.3), un solo esquema de IDs vía `categories.slug` (§6.1).
5. ✅ **RESUELTO — Stock por sucursal + Branch.** `variant_stock` (§7.1) + `branches` (§3.2).
6. ✅ **RESUELTO — Cliente único.** `customers` (§5.1) fusiona los 4 modelos; `authUserId` opcional define cliente con/sin cuenta.
7. ✅ **RESUELTO — Tabla de canjes.** `discount_redemptions` (§11.4) — **con el cambio adicional de unificar Descuento+Cupon en `discounts`** (§11.1, no anticipado por este análisis, ver Módulo 6).
8. ✅ **RESUELTO — Roles.** 4 roles default (owner/admin/cajero/empleado, `roles` §4.2) ganan sobre los 3 del mock. `permissions` (§4.3) confirmado como catálogo global (sin `business_id`).
9. ✅ **RESUELTO (arquitectura) — Evaluación de descuentos.** `/api/discounts/evaluate`, `priority` (Int) para desempate de "best discount wins" (mayor ahorro primero). **Pendiente de implementación**: el frontend sigue con el 10% hardcodeado en el checkout — el contrato ya está definido, falta que el código lo use.
10. ✅ **RESUELTO — Pagos MercadoPago V1.** `payments` (§9.1): `method`/`status` tipados, campos `mp*` para MP, `verifiedBy`/`verifiedAt` para la confirmación humana de transferencias POS (sin webhook).
11. ✅ **RESUELTO — Storage de imágenes.** Confirmado Supabase Storage: `storefront_config.logoUrl`/`faviconUrl` (§3.4), `product_images.url` (§6.9).
12. ✅ **RESUELTO — Devoluciones/Notas de crédito.** `returns.orderId` (§12.1) obligatorio; `credit_notes.expiresAt` (§12.2) es `DateTime?` real; `credit_notes.returnId` (`@unique`) vincula devolución→nota de crédito 1:1 opcional.
13. 🟡 **PARCIALMENTE RESUELTO — Mensajería.** Enum de remitente (`MessageSender`) y timestamps reales (`createdAt`) sí se resolvieron (§13.2). Cardinalidad conversación↔cliente confirmada como "un hilo por cliente" (regla de negocio, sin `@@unique` en la tabla). **El canal (WhatsApp vs interno) sigue sin campo — sigue pendiente.**
14. ✅ **RESUELTO — Auditoría transversal.** `audit_logs` (§15.1) es polimórfico desde el día uno (`entityType`+`entityId`), ya no exclusivo de descuentos/cupones. Nota del documento: útil especialmente para cambios de precio POS, toggles de descuentos, cambios de estado de órdenes y config.
15. ❌ **SIGUE ABIERTA — `tienda/` (stubs vacíos).** No es una pregunta de modelo de datos — `MODELO_DATOS_DEFINITIVO.md` no la menciona. Verificado por código (`git log`/`wc -l`): los 5 archivos de `ventas/tienda/` siguen en 0 líneas, sin cambios. Sigue pendiente decidir si se elimina o se implementa.
16. ❌ **NUEVA — Rollout incompleto de "sin rating".** El commit que quita las estrellas del cliente es parcial (ver "Cambios detectados"): quedan `types.ts`/`mock.ts` con `rating: number`, `Categoria.tsx` con `'4.6 ★'` hardcodeado, y el toggle `mostrarRating` en `Apariencia.tsx`/`StorePreview.tsx`/`mock/apariencia.mock.ts` sin tocar. Falta terminar la migración en el frontend y decidir qué hacer con `storefront_config.showRating` (ver inconsistencia arriba).

---

## Anexo: componentes `_shared` relevantes al modelo

- `_shared/hooks/useCarrito.ts` → `CarritoItem{key,id,nombre,precio,cat,qty,descPct?,variante?}` (estado local, no persistente).
- `_shared/hooks/useCheckout.ts` → `computeCheckoutTotals` (cálculo de totales, IVA 21% incluido — lógica de UI que el backend debe replicar/autoritar).
- `_shared/hooks/useInventario.ts` y `tienda/useInventarioTienda.ts` → **archivos vacíos** (stubs).
- Componentes compartidos (`SelectorCliente`, `SelectorProducto`, `SelectorVariante`, `MatrizVariantes`, `DataTable`, etc.) confirman que Cliente, Producto y Variante son entidades transversales reutilizadas por POS, Pedidos, Inventario y Descuentos.
