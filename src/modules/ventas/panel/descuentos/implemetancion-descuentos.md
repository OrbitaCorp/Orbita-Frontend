# Módulo de Descuentos y Cupones — Ventas (Retail)

> Módulo padre: Ventas
> Usuarios: Dueño / Admin (gestión), Cajero (aplicación en POS, solo lectura)
> Canales: POS + Storefront (motor de evaluación compartido vía API backend)

---

## Decisiones de arquitectura

### Motor de descuentos en backend (API compartida)

El motor de evaluación de descuentos vive en el backend. Tanto POS como Storefront envían el carrito (productos, cantidades, variantes, cliente asociado) a un endpoint de la API, que devuelve los descuentos aplicables y el cálculo final. El frontend nunca calcula descuentos localmente.

Endpoints mínimos requeridos:

- `POST /api/descuentos/evaluar` — Recibe carrito, devuelve descuentos aplicados y totales.
- `POST /api/cupones/validar` — Recibe código + carrito, devuelve si aplica y por qué (o por qué no).
- CRUD de descuentos y cupones (admin only).

### Resolución de conflictos

Regla fija para V1: cuando múltiples descuentos automáticos aplican al mismo ítem o ticket, se aplica el de mayor beneficio para el cliente. No hay configuración de acumulabilidad por parte del dueño en esta versión.

Cupones no se acumulan con descuentos automáticos del mismo alcance. Si un cupón aplica al ticket y un descuento automático también, gana el de mayor beneficio.

### Granularidad de productos

Los descuentos y cupones pueden apuntar a:

- **Producto padre** — Aplica a todas las variantes (ej: "20% off en Remera básica" = aplica a negra S, blanca M, etc.).
- **Variante específica** — Aplica solo a una combinación puntual (ej: "20% off en Remera básica negra talle L").
- **Categoría** — Aplica a todos los productos de una categoría, incluyendo productos que se agreguen en el futuro. Es una regla dinámica.
- **Ticket completo** — Aplica al subtotal sin discriminar productos.

### Selectores de alcance (UI)

El selector de productos cambia según el nivel de alcance seleccionado:

- **Alcance = Categoría:** Lista plana de categorías con checkboxes. Sin chevron de expansión, sin productos hijos visibles. Cada categoría muestra "(N productos)" como dato informativo. Seleccionar una categoría = regla dinámica que aplica a todos los productos actuales y futuros de esa categoría.
- **Alcance = Productos específicos:** Árbol completo con 3 niveles: Categoría → Producto padre → Variante. Checkboxes en cada nivel. Si se selecciona producto padre, toggle "Aplicar a todas las variantes" (activo por default). Si se desactiva, se expanden las variantes para selección individual. Es una selección estática: solo los productos/variantes explícitamente seleccionados.

Esta regla aplica universalmente en todos los formularios del módulo (Crear Descuento, Crear Cupón).

---

## Entidades

### Descuento

Regla creada por el dueño. Puede ser automática (se aplica sola cuando se cumple la condición) o manual (requiere que el cajero la active). No tiene código.

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| id | UUID | sí | — |
| nombre | string | sí | Nombre visible en POS y reportes |
| tipo | enum | sí | Ver "Tipos de descuento" |
| valor | number | sí | Porcentaje o monto fijo según tipo |
| alcance | enum | sí | `producto`, `categoria`, `ticket` |
| productos_ids | UUID[] | condicional | Si alcance = producto. Puede ser ID de padre o de variante |
| categorias_ids | UUID[] | condicional | Si alcance = categoría |
| nivel_producto | enum | condicional | `padre` o `variante` — define si aplica a todas las variantes o a una específica |
| condicion | object | condicional | Para tipos condicionales (ej: cantidad mínima, monto mínimo) |
| bonus_productos_ids | UUID[] | condicional | Para tipo "Comprá X, obtené Z": productos/categorías del premio |
| bonus_alcance | enum | condicional | `producto`, `categoria` — alcance del producto bonus |
| bonus_tipo_beneficio | enum | condicional | `gratis`, `porcentaje`, `monto_fijo` — tipo de beneficio del bonus |
| bonus_valor | number | condicional | Valor del beneficio si no es gratis (% o $) |
| aplicacion | enum | sí | `automatico` o `manual` |
| fecha_inicio | datetime | sí | — |
| fecha_fin | datetime | no | null = sin vencimiento |
| dias_vigencia | int[] | no | [0-6] Días de la semana. null = todos |
| hora_inicio | time | no | Para franjas horarias (happy hour) |
| hora_fin | time | no | — |
| limite_usos_total | int | no | null = ilimitado |
| usos_consumidos | int | sí | Default 0 |
| activo | boolean | sí | Toggle rápido |
| prioridad | int | sí | Para desambiguar si beneficio es igual |
| negocio_id | UUID | sí | Aislamiento multi-negocio |
| creado_por | UUID | sí | — |
| created_at | datetime | sí | — |
| updated_at | datetime | sí | — |

### Cupón

Código canjeable con ciclo de vida propio.

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| id | UUID | sí | — |
| codigo | string | sí | Alfanumérico, único por negocio. Manual o autogenerado |
| nombre | string | sí | Nombre descriptivo para admin |
| tipo_descuento | enum | sí | `porcentaje` o `monto_fijo` |
| valor | number | sí | — |
| alcance | enum | sí | `producto`, `categoria`, `ticket` |
| productos_ids | UUID[] | condicional | — |
| categorias_ids | UUID[] | condicional | — |
| nivel_producto | enum | condicional | `padre` o `variante` |
| monto_minimo | number | no | Monto mínimo de compra para aplicar |
| usos_max_total | int | no | null = ilimitado |
| usos_max_por_cliente | int | no | null = ilimitado |
| usos_consumidos | int | sí | Default 0 |
| fecha_inicio | datetime | sí | — |
| fecha_expiracion | datetime | no | null = sin vencimiento |
| activo | boolean | sí | — |
| negocio_id | UUID | sí | — |
| creado_por | UUID | sí | — |
| created_at | datetime | sí | — |
| updated_at | datetime | sí | — |

### Log de auditoría

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | — |
| entidad_tipo | enum | `descuento` o `cupon` |
| entidad_id | UUID | — |
| accion | enum | `crear`, `editar`, `activar`, `desactivar`, `eliminar` |
| usuario_id | UUID | Quién ejecutó la acción |
| cambios | jsonb | Snapshot de campos modificados (antes/después) |
| timestamp | datetime | — |

---

## Tipos de descuento — Rubro Ventas (Retail)

### 1. Porcentaje sobre producto/categoría

- Configuración: producto(s) o categoría(s) + porcentaje.
- Ejemplo: "20% off en Remera básica negra talle L."
- Visual en POS/Storefront: precio tachado + precio final.

### 2. Monto fijo sobre producto/categoría

- Configuración: producto(s) o categoría(s) + monto.
- Ejemplo: "$2.000 off en Borcego."
- Validación: el monto no puede superar el precio del producto.

### 3. Porcentaje sobre el ticket

- Configuración: porcentaje + monto mínimo de compra (opcional).
- Ejemplo: "10% off en compras mayores a $50.000."
- Uso típico: cupones.

### 4. Monto fijo sobre el ticket

- Configuración: monto + monto mínimo de compra (opcional).
- Ejemplo: "$5.000 off en compras mayores a $50.000."
- Validación: el descuento no puede dejar el total en negativo.

### 5. Llevá X, pagá Y (misma línea)

- Configuración: producto(s) o categoría(s) + cantidad X + cantidad Y.
- Ejemplo: "Llevá 3 remeras, pagá 2."
- Lógica: se descuenta el/los de menor precio.
- Granularidad: si aplica a producto padre, cualquier combinación de variantes cuenta. Si aplica a variante específica, solo esa variante.

### 6. Comprá X, obtené Z con descuento (línea cruzada)

- Configuración: producto/categoría trigger + cantidad trigger + producto/categoría premio + tipo de beneficio sobre el premio.
- **Tipos de beneficio del bonus:**
  - **Gratis** — El producto bonus no tiene costo.
  - **Porcentaje de descuento** — El producto bonus tiene un % de descuento (ej: 50% off).
  - **Monto fijo de descuento** — El producto bonus tiene un $ de descuento (ej: $3.000 off).
- Ejemplo: "Comprá un Jean recto, llevá un cinturón al 50%."
- Complejidad: el premio se agrega manualmente por el cajero; el sistema avisa que aplica la promo.
- El selector de producto bonus usa el mismo componente de árbol que el selector de producto trigger (permite seleccionar categorías completas, no solo productos individuales).

### 7. Descuento por volumen

- Configuración: producto(s) o categoría(s) + escala de cantidades con porcentaje.
- Ejemplo: "5-9 unidades: 10% off. 10+: 15% off."
- Visual: el descuento se actualiza en tiempo real al cambiar cantidad.

---

## Pantallas

### 1. Listado de Descuentos y Cupones

Ruta: `/panel/ventas/descuentos`

**Layout:** Dos tabs: "Descuentos" y "Cupones." Breadcrumb siempre "Ventas › Descuentos" (el tab indica cuál se está viendo).

**Botones globales (derecha):** Botón secundario "Métricas" (con ícono de gráfico) + botón primario "Crear descuento" o "Crear cupón" (según tab activo).

**Columnas — Tab Descuentos (8 columnas):**

| Columna | Contenido |
|---|---|
| Nombre | Nombre del descuento |
| Tipo | Badge con ícono de rayo (⚡) si es automático: "⚡ Llevá X Pagá Y", "% Ticket", etc. Descuentos manuales sin ícono. |
| Alcance | Productos/categorías afectados (truncado con tooltip si es largo) |
| Vigencia | Fecha inicio — fin. Si tiene días/horarios, indicador "Recurrente" |
| Estado | Badge: Activo (verde), Inactivo (gris), Programado (azul), Expirado (rojo) |
| Usos | "45 / 100" o "23 / ∞" |
| Acciones | Toggle activar/desactivar, ícono lápiz (editar), menú contextual (⋮) |

**Columnas — Tab Cupones (8 columnas):**

| Columna | Contenido |
|---|---|
| Código | Código del cupón (monospace) |
| Nombre | Nombre descriptivo |
| Tipo | Badge: "% Ticket", "$ Fijo Ticket", "% Producto", "$ Fijo Producto" |
| Valor | "10%" o "$5.000" |
| Vigencia | Fecha inicio — expiración |
| Estado | Badge: Activo (verde), Inactivo (gris), Programado (azul), Expirado (rojo), Agotado (naranja) |
| Usos | "34 / 100" con subtexto gris "1 por cliente" si tiene límite por cliente |
| Acciones | Toggle, lápiz (editar), menú contextual (⋮) |

**Filtros:** Dropdown "Estado: Todos" (Activo, Inactivo, Programado, Expirado, Agotado) + dropdown "Tipo: Todos" (tipos según tab activo) + input de búsqueda por nombre/código.

**Menú contextual (⋮):** Duplicar, Ver métricas (navega a Métricas filtrada), separador, Eliminar (rojo). En tab Cupones: además "Copiar código".

**Interacciones:**
- Click en fila de Descuento → navega a página de Detalle del descuento (`/panel/ventas/descuentos/:id`).
- Click en fila de Cupón → navega directo al formulario de edición (`/panel/ventas/cupones/:id/editar`). Los cupones no tienen página de detalle intermedia.
- Hover en fila: fondo gris sutil + cursor pointer.
- Toggle desactivar: popover de confirmación ("¿Desactivar? No se aplicará en nuevas ventas." + Cancelar / Desactivar en rojo).
- Toggle activar: sin confirmación.

**Paginación:** Izquierda "Mostrar: 10" (dropdown: 10, 20, 25, 50, 100) + derecha "1-10 de 47" con botones de navegación.

---

### 2. Detalle de Descuento (solo lectura)

Ruta: `/panel/ventas/descuentos/:id`
Breadcrumb: Ventas › Descuentos › [Nombre del descuento]

Se accede al hacer click en una fila del listado. Vista de solo lectura.

**Layout:** Dos columnas (izquierda ~65%, derecha ~35% sticky).

**Columna izquierda:**

- **Card Encabezado:** Nombre (grande), badge tipo (con ⚡ si automático), badge estado, texto "Creado el DD/MM/YYYY por [usuario]". Botón "Editar descuento" (outline) en esquina superior derecha.
- **Card Configuración:** Pares label/valor según tipo de descuento (tipo, cantidad, regla, etc.).
- **Card Productos afectados:** Árbol en modo solo lectura (sin checkboxes). Primeros 5 productos, link "Ver todos" si hay más.
- **Card Vigencia:** Pares label/valor (fecha inicio, fecha fin, días, horario, límite de usos, usos consumidos).
- **Card Historial de cambios (colapsable):** Lista cronológica inversa de acciones con timestamp + usuario + descripción del cambio.

**Columna derecha (sticky):**

- **Card Acciones rápidas:** Toggle activar/desactivar (grande), botón "Duplicar" (secundario), botón "Eliminar" (texto rojo).
- **Card Preview en POS:** Mismo componente de preview que el formulario de creación. Dinámico según tipo de descuento.
- **Card Rendimiento:** Mini KPIs (usos con barra de progreso, revenue sacrificado, revenue en ventas con desc., ticket promedio). Link "Ver métricas detalladas →".

---

### 3. Crear / Editar Descuento

Ruta: `/panel/ventas/descuentos/crear` y `/panel/ventas/descuentos/:id/editar`

**Layout:** Formulario (izquierda) + sidebar preview sticky (derecha).

**Secciones:**

**Sección 1 — Información básica:** Nombre + selector visual de tipo (7 cards con ícono y descripción).

**Sección 2 — Configuración (dinámica según tipo):** Campos específicos por tipo. Para "Comprá X, obtené Z":
- Producto/categoría trigger (árbol).
- Cantidad mínima a comprar.
- Tipo de beneficio del bonus: segmented control (Gratis / % de descuento / $ de descuento). Si % o $: input numérico adicional.
- Producto/categoría bonus (árbol, mismo componente que el trigger).
- Indicador informativo dinámico: "El cliente compra [N] [trigger] y obtiene [bonus] [beneficio]."

**Sección 3 — Vigencia y restricciones:** Fecha inicio, fecha fin (toggle "Sin vencimiento"), días de la semana (chips), horario (toggle "Todo el día" — si activo, oculta time pickers), límite de usos (toggle "Ilimitado").

**Sección 4 — Aplicación:** Radio buttons Automático / Manual con descripción.

**Sidebar preview:** Se actualiza dinámicamente según tipo seleccionado. Cada tipo tiene su formato de preview propio. Alerta de conflicto en amarillo si se solapa con otro descuento.

**Footer:** Cancelar + Crear descuento.

**Validaciones:** Porcentaje 1-100, monto no supera precio del producto, fecha fin > fecha inicio, Y < X en "Llevá X Pagá Y", al menos un producto/categoría seleccionado (excepto tipo ticket), nombre único por negocio.

---

### 4. Crear / Editar Cupón

Ruta: `/panel/ventas/cupones/crear` y `/panel/ventas/cupones/:id/editar`

**Layout:** Formulario (izquierda) + sidebar preview sticky (derecha).

**Sección 1 — Información básica:** Código (monospace, botón "Generar" para autogenerar) + nombre descriptivo. Helpers: "Este es el código que el cliente ingresará en el POS o la tienda online." / "Solo visible para administradores."

**Sección 2 — Configuración:** Tipo de descuento (2 cards: Porcentaje / Monto fijo), valor (input con sufijo dinámico % o $), alcance (3 cards: Ticket completo / Categoría / Productos específicos), selector condicional según alcance (lista plana para categoría, árbol para productos), monto mínimo de compra (toggle "Sin mínimo").

**Sección 3 — Límites de uso:** Usos máximos totales (toggle "Ilimitado"), usos máximos por cliente (toggle "Ilimitado", helper: "Requiere que la venta tenga un cliente asociado.").

**Sección 4 — Vigencia:** Fecha inicio + fecha expiración (toggle "Sin vencimiento" — deshabilita el campo, no lo oculta).

**Sidebar preview:** Código en monospace grande, tipo + valor, alcance, compra mínima, vigencia, usos.

**Footer:** Cancelar + Crear cupón.

**Nota:** Los cupones no tienen página de detalle. Click en fila del listado → formulario de edición directo. El log de auditoría se muestra como sección colapsable al final del formulario de edición.

---

### 5. Métricas de Descuentos y Cupones

Ruta: `/panel/ventas/descuentos/metricas`
Breadcrumb: Ventas › Descuentos › Métricas

**Header:** Título + selector de rango de fechas (presets: Hoy, 7 días, 30 días, 90 días, 12 meses, Personalizado) + filtros: "Sucursal: Todas", "Canal: Todos" (POS / Storefront / Todos), "Tipo: Todos" (Descuentos / Cupones / Todos).

**KPIs (4 cards):** Revenue sacrificado (con tendencia vs período anterior), ventas con descuento (cantidad + % del total), ticket promedio (con desc. vs sin desc.), tasa de canje de cupones.

**Gráfico:** Línea temporal de revenue sacrificado (día/semana/mes según rango).

**Tabla de rendimiento:** Columnas: Nombre/Código, Tipo (badge), Usos, Rev. Sacrificado (rojo), Rev. con Desc. (neutro, NO verde), Ticket Prom., Estado (badge). Columnas ordenables con indicador ↕/↓/↑. Paginación con selector de ítems por página.

**Filas clickeables:** Click abre drawer lateral derecho con detalle de rendimiento del descuento/cupón.

**Drawer de detalle:** Header (nombre + badges), KPIs mini (2×2: usos, rev. sacrificado, rev. con desc., ticket promedio), gráfico de usos por día, tabla "Productos más descontados" (producto, variante, veces, monto desc.), tasa de canje si es cupón. Link al pie: "Ir al detalle del descuento →" (descuentos) o "Editar cupón →" (cupones).

---

## Requerimientos Funcionales

| ID | Descripción | Prioridad |
|---|---|---|
| RF-01 | El backend evalúa descuentos automáticos en tiempo real al recibir el carrito del POS o Storefront. Devuelve descuentos aplicados y totales. | Alta |
| RF-02 | Cuando múltiples descuentos automáticos aplican al mismo ítem, el motor aplica el de mayor beneficio para el cliente. | Alta |
| RF-03 | El cajero ve en el ticket: nombre del descuento, ítem afectado, monto descontado, y total ajustado. | Alta |
| RF-04 | El cajero no puede crear, editar ni eliminar descuentos o cupones. Solo ingresa códigos de cupón en el campo existente del POS. | Alta |
| RF-05 | El dueño puede programar descuentos con fecha inicio futura. El sistema los activa automáticamente. | Media |
| RF-06 | Al aplicar un cupón, el sistema valida: vigencia, usos restantes, monto mínimo, productos elegibles, y usos por cliente. Si no aplica, devuelve razón específica visible para el cajero. | Alta |
| RF-07 | El uso del cupón se confirma solo al completar la venta. Si la venta se cancela o pausa, el cupón se libera. | Alta |
| RF-08 | El motor de evaluación es un servicio backend consumido por POS y Storefront vía la misma API. No hay lógica de descuentos en frontend. | Alta |
| RF-09 | El dueño puede duplicar un descuento o cupón existente. | Baja |
| RF-10 | Toda acción sobre descuentos/cupones queda registrada en log de auditoría (crear, editar, activar, desactivar, eliminar) con usuario y timestamp. | Media |
| RF-11 | El sistema previene configuraciones inválidas: descuento > 100%, precio final negativo, fecha fin < fecha inicio, cupón sin código, Y >= X en "llevá X pagá Y." | Alta |
| RF-12 | En descuentos tipo "Llevá X Pagá Y", el POS muestra notificación contextual cuando el ticket tiene N-1 ítems elegibles: "Agregá 1 [producto] más para aplicar [nombre promo]." | Media |
| RF-13 | El selector de productos en el formulario de creación soporta dos modos: lista plana (alcance = categoría) y árbol con variantes (alcance = productos específicos). | Alta |
| RF-14 | Si un descuento aplica a producto padre, se evalúa para todas sus variantes. Si aplica a variante específica, solo para esa variante. Si aplica a categoría, se evalúa para todos los productos actuales y futuros de esa categoría. | Alta |
| RF-15 | Los descuentos son aislados por negocio. No se comparten entre negocios del mismo dueño. | Alta |
| RF-16 | La pantalla de métricas muestra: revenue sacrificado, transacciones con/sin descuento, ticket promedio comparado, tasa de canje de cupones, con filtros por canal, sucursal, tipo y rango de fechas. | Media |
| RF-17 | El tipo "Comprá X, obtené Z" soporta tres tipos de beneficio para el bonus: gratis, porcentaje de descuento, o monto fijo de descuento. | Alta |
| RF-18 | Click en fila de descuento en el listado navega a página de detalle (solo lectura). Click en fila de cupón navega directo al formulario de edición. | Media |

---

## Requerimientos No Funcionales

| ID | Descripción |
|---|---|
| RNF-01 | La evaluación de descuentos vía API no agrega más de 100ms de latencia al flujo del POS. |
| RNF-02 | El listado carga en < 1s con hasta 200 descuentos/cupones. |
| RNF-03 | Las métricas soportan consultas de hasta 12 meses sin timeout (< 3s). |
| RNF-04 | UI consistente con design system de Orbita: Tailwind v4, tokens `var(--color-*)`, sin imports de `@/design-system/`. Named exports. Archivos < 300 líneas. |
| RNF-05 | Formularios optimizados para desktop (pantalla de admin). |
| RNF-06 | Multi-negocio: cada negocio tiene sus descuentos aislados. |
| RNF-07 | El endpoint de evaluación debe ser idempotente: misma entrada → misma salida. No side effects hasta confirmar la venta. |
| RNF-08 | Todos los date pickers usan formato DD/MM/YYYY (formato argentino). |

---

## Dependencias

| Dependencia | Responsable | Estado | Impacto |
|---|---|---|---|
| API de evaluación de descuentos (backend) | Backend / por definir | Pendiente | Bloqueante para RF-01, RF-08 |
| Integración Storefront con API de descuentos | Mateo | Pendiente | Bloqueante para RF-08 en canal online |
| Sistema de variantes de producto (relación padre → variantes) | Existente (verificar) | Por confirmar | Bloqueante para RF-13, RF-14 |
| Sistema de clientes asociados a venta | Alex (Clientes) | Existente | Requerido para usos por cliente en cupones |
| Confirmación de venta (evento) | POS existente | Existente | Requerido para RF-07 |

---

## Fuera de alcance V1

- Acumulabilidad configurable por el dueño (se aplica regla fija: mejor descuento gana).
- Generación de cupones en lote.
- Descuentos por nivel de cliente / programa de fidelización.
- Descuentos por método de pago ("10% off con débito").
- Compartir descuentos entre negocios del mismo dueño.
- Descuentos específicos de rubros no-retail (gastronomía, servicios).
- Página de detalle para cupones (se usa edición directa).