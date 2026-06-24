# Implementación — Módulo POS (Orbita · Tienda)

> **Responsable:** Alan · CTO
> **Alcance de este documento:** UI/UX y requerimientos funcionales del módulo POS.
> **Fuera de alcance:** lógica de backend, concurrencia, integración de hardware, modo offline real.
> **Dispositivo objetivo:** Escritorio (prioridad) → Tablet horizontal (apto) → Mobile (no se rompe, no es prioridad). Mínimo de diseño: **1024px**.

---

## 0. Decisiones cerradas

| # | Decisión |
|---|----------|
| Layout cajero | Mismo sidebar que el admin, pero **reducido y configurable por rol** (POS, Pedidos, Inventario, etc. según lo que el dueño habilite). |
| Devolución en POS | **Modal**, no pantalla. La pantalla administrativa de devoluciones (pedidos online) la hace Alex. |
| Métodos de pago | Efectivo, Tarjeta (débito y crédito), Transferencia, QR. |
| Pagos mixtos | Soportados, configurable por el dueño. |
| Cliente en POS | Nombre + DNI (identificador único de búsqueda) + Teléfono. Email opcional. |
| Stock negativo en POS | Permitido con confirmación (configurable). Al ingresar stock posterior, se compensa el negativo. **Solo aplica a POS, NO a ventas online.** |
| Cierre con diferencia | Permitido con motivo escrito obligatorio + notifica al dueño. |
| Reimpresión de ticket | Desde post-venta, Historial de cajas y Detalle de pedido. |
| Intercambios | Soportados: devuelve stock del producto que vuelve, descuenta el nuevo, calcula diferencia de precio (a pagar o devolver). Configurable/aprobado por dueño. |
| Pausar venta | Soportado, múltiples tickets en standby (persistencia local). |
| Descuento del cajero | Solo descuentos habilitados por el admin (cupones o promos). Descuento libre con límite de % por permiso. |
| Cupones en POS | El cajero tipea el código, el sistema valida. |
| Promos automáticas | Se aplican automáticamente y visibles. |
| Ítem libre / concepto | Soportado (envío, servicios, gift card). No toca inventario. Configurable. |
| Egreso/ingreso de efectivo | Modal accesible desde el header del POS. |
| Forzar cierre | Desde Historial de cajas, acción sobre la sesión abierta. |
| Sesión | No expira mientras haya caja abierta. |
| Multi-tab | No se permite más de una pestaña de POS abierta a la vez. |
| Datos del ticket | Se congelan al momento de emitirse. |

---

## 1. Inventario de pantallas y componentes

### Pantallas completas
1. `/tienda/pos/open` — Apertura de caja
2. `/tienda/pos` — Cobro rápido (pantalla principal)
3. `/tienda/pos/close` — Cierre de caja
4. `/tienda/pos/sessions` — Historial de cajas

### Modales / sub-flujos (dentro de las pantallas)
- Modal de cobro (métodos, pago mixto, vuelto)
- Modal post-venta (éxito, imprimir, enviar, nuevo ticket)
- Modal asociar/crear cliente
- Modal selector de variante
- Modal descuento manual
- Modal devolución
- Modal cambio / intercambio
- Modal egreso / ingreso de efectivo
- Drawer de tickets pausados
- Modal forzar cierre (desde Historial)
- Modal detalle de sesión (desde Historial)

---

## 2. Pantalla — Apertura de caja `/tienda/pos/open`

**Objetivo:** declarar el fondo inicial y abrir el turno antes de poder cobrar.

**Contenido**
- Datos del turno: cajero (autocompletado si está logueado, seleccionable si es el dueño abriendo por otro), fecha y hora.
- Input: monto inicial en efectivo (fondo de caja). Puede ser 0 (configurable).
- Notas/observaciones opcionales.
- Contexto: nombre del negocio, moneda.

**Acciones**
- Confirmar apertura → entra al POS.
- Cancelar → vuelve al dashboard.

**Estados**
- Sin caja abierta → formulario normal.
- Caja ya abierta por este cajero → bloqueo: "Tenés una caja abierta desde [hora]" + CTA ir al POS / cerrar.
- Caja abierta por otro cajero (multi-cajero futuro) → permite abrir otra si el rol lo habilita.
- Validación: monto < 0 → error inline.

**Permisos**
- Cajero: abre su propia caja.
- Dueño/supervisor: abre por sí o por otro.

---

## 3. Pantalla — Cobro rápido `/tienda/pos`

Pantalla principal del módulo. Organizada en zonas. En desktop, layout de 2 columnas: izquierda búsqueda/catálogo, derecha ticket + totales + cobrar.

### 3.1 Header del turno (persistente)
- Caja abierta: cajero, hora de apertura, total acumulado del turno.
- Botón "Movimientos de caja" (abre modal egreso/ingreso).
- Botón "Tickets pausados" (badge con cantidad) → abre drawer.
- Si la caja está cerrada → **pantalla entera bloqueada** con CTA "Abrir caja".

### 3.2 Búsqueda y catálogo (columna izquierda)
- Buscador por nombre / código / SKU.
- Filtros rápidos por categoría.
- Grilla/lista de productos: foto, nombre, precio, indicador de stock.
- Favoritos / quick keys: grilla configurable por el dueño, visible arriba.
- Producto sin stock: en gris, no agregable salvo permiso (entonces pide confirmación → puede quedar en negativo).
- Producto con variantes: al tocarlo abre **modal selector de variante** (matriz talle/color/etc., stock por variante).
- Ítem libre / concepto: botón "Agregar ítem libre" → descripción + precio, no toca inventario.

### 3.3 Ticket actual (columna derecha)
- Lista de items: producto, variante, cantidad, precio unitario, subtotal, eliminar.
- Editar cantidad (+/− o input).
- Editar precio en línea (permiso).
- Descuento por item (permiso): % o monto.
- Notas por item.
- Cliente asociado: chip con nombre + DNI; botón asociar/crear/quitar.
- Estado vacío: "Empezá agregando un producto" + favoritos visibles.

### 3.4 Descuentos a nivel ticket
- Cupón: input de código → valida → muestra descuento aplicado.
- Descuento manual sobre total (permiso): % o monto + motivo opcional, respetando el límite por rol.
- Promos automáticas: se aplican solas y se muestran como línea/chip.

### 3.5 Totales (siempre visibles)
- Subtotal, Descuentos (desglosados), IVA (incluido o sumado según config), **Total** dominante, cantidad de items.

### 3.6 Cobrar → Modal de cobro
- Selección de método: Efectivo / Tarjeta (débito/crédito) / Transferencia / QR.
- **Pago mixto:** distribuir el total entre varios métodos (si está habilitado).
- Efectivo: input "monto recibido" → vuelto automático, grande.
- Tarjeta/Transferencia/QR: confirmación manual + nº de operación opcional.
- Confirmar → emite ticket (congela datos) → descuenta stock → vuelve al estado limpio.

### 3.7 Modal post-venta
- Éxito + número de comprobante.
- Acciones: imprimir, enviar por WhatsApp, enviar por email, copiar link.
- "Nuevo ticket".

### 3.8 Acciones secundarias
- Cancelar venta (limpia sin grabar) → confirmación.
- **Pausar venta:** guarda el ticket en standby (persistencia local), libera la pantalla para otra venta.
- **Recuperar pausado:** drawer con lista (cliente/hora/total) → retoma.
- **Devolución:** modal (ver 3.10).
- **Movimientos de caja:** modal (ver 3.11).

### 3.9 Modal selector de variante
- Matriz de variantes con stock individual y precio.
- Selección → agrega al ticket con la variante elegida.

### 3.10 Modal de devolución (mostrador)
- Buscar ticket original (nº, fecha, cliente, DNI, últimos N).
- Seleccionar items + cantidad a devolver (descuenta lo ya devuelto).
- Motivo obligatorio.
- Método de reembolso: mismo método original / efectivo / nota de crédito interna.
- Confirmar → devuelve stock, ajusta caja, genera comprobante.
- Estados: ticket no encontrado / ya devuelto total / devolución parcial / fuera de plazo.
- **Cambio/intercambio:** modo dentro del mismo modal → devuelve item + agrega nuevo → calcula diferencia (a pagar o a devolver) → puede requerir aprobación del dueño.

### 3.11 Modal egreso / ingreso de efectivo
- Tipo: egreso (retiro) / ingreso (refuerzo).
- Monto + motivo (obligatorio en egreso).
- Afecta el cuadre del cierre.

### 3.12 Permisos relevantes (POS)
Aplicar descuento libre · modificar precio · cancelar venta cobrada · egreso/ingreso de caja · devolución · cambio/intercambio · vender sin stock · asociar/crear cliente · reimprimir ticket.

---

## 4. Pantalla — Cierre de caja `/tienda/pos/close`

**Resumen automático del turno**
- Cajero, fecha apertura, fecha actual, monto inicial.
- Ventas totales + desglose por método de pago.
- Cantidad de tickets.
- Devoluciones (cantidad y monto).
- Movimientos manuales (ingresos/egresos con motivo).
- **Total teórico en efectivo** = inicial + ventas efectivo + ingresos − egresos − devoluciones efectivo.

**Input del cajero**
- Conteo físico del efectivo.
- Diferencia calculada con color: verde (cuadra) / rojo (falta) / amarillo (sobra).
- Motivo de diferencia: obligatorio si hay diferencia.
- Notas finales.

**Acciones**
- "Cerrar caja" → confirmación con resumen → genera comprobante (imprimible).
- "Volver al POS" (descarta cierre).

**Estados**
- Sin actividad → cierre normal.
- Tickets pausados sin cobrar → avisa antes de cerrar.
- Con diferencia → motivo obligatorio + notifica al dueño.
- Forzado por dueño → marca quién lo forzó.

**Permisos**
- Cajero: cierra su caja.
- Dueño/supervisor: cierra la de cualquiera (forzado).

---

## 5. Pantalla — Historial de cajas `/tienda/pos/sessions`

### 5.1 Lista
- Filtros: rango de fechas, cajero, estado (cerrada/abierta/forzada), con/sin diferencia.
- Tabla: fecha, cajero, apertura, cierre, monto inicial, ventas totales, tickets, diferencia (color), estado, acciones.
- Ordenamiento, paginación/scroll infinito, exportar CSV/PDF.
- Sesión abierta resaltada con badge "En curso" + acción **Forzar cierre**.

### 5.2 Detalle de sesión (modal o vista)
- Resumen completo del turno.
- Tickets emitidos (link a detalle).
- Devoluciones.
- Movimientos manuales con motivo.
- Desglose por método de pago.
- Motivo de diferencia si aplica.
- Reimprimir comprobante de cierre.
- Marcar como auditada (dueño).

### 5.3 Estados
- Lista vacía → "Abrí tu primera caja".
- Con diferencia → indicador visual.

### 5.4 Permisos
- Cajero: solo sus sesiones.
- Dueño/supervisor: todas, con filtro por cajero. "Marcar auditada": solo dueño.

---

## 6. Requerimientos transversales

- **Modo oscuro:** soportado desde MVP (tokens ya definidos en el design system).
- **Estados:** vacío, carga (skeleton), error, sin conexión (solo indicador visual).
- **Confirmaciones destructivas:** cancelar venta, cerrar caja, anular devolución → modal.
- **Atajos de teclado:** F1 buscar · F2 cobrar · F4 cliente · F8 pausar · ESC cancelar · Enter confirmar.
- **Notificaciones:** toasts (`<Toast>`) en cada acción.
- **Permisos visibles:** acciones bloqueadas se muestran desactivadas/con candado, no se ocultan.
- **Multi-tab:** segunda pestaña de POS → bloqueo con mensaje.
- **Congelado de datos:** el ticket guarda nombre, precio e impuestos al momento de emitirse.

---

## 7. Lista completa de ajustes configurables por el administrador
> Para implementar en el modal de Configuración (`/tienda/settings`). Agrupados por área.

### Pagos
1. Métodos de pago habilitados (efectivo / tarjeta / transferencia / QR) — on/off cada uno.
2. Pagos mixtos — on/off.
3. Redondeo en efectivo — on/off + unidad de redondeo.
4. IVA — incluido en el precio o sumado al cobrar.

### Stock y productos
5. Permitir venta con stock negativo en POS — on/off, y por rol.
6. Ítem libre / concepto (envío, servicios) — on/off.
7. Productos favoritos / quick keys del POS — selección y orden.

### Descuentos
8. Límite de % de descuento libre sin autorización — por rol.
9. Descuentos habilitados para el cajero (cuáles cupones/promos puede aplicar).

### Clientes
10. Datos requeridos para crear cliente en POS (nombre / DNI / teléfono / email) — cuáles obligatorios.

### Devoluciones e intercambios
11. Plazo máximo para devoluciones (días).
12. Límite de monto de devolución sin autorización — por rol.
13. Permitir cambios/intercambios — on/off.
14. Aprobación del dueño para diferencias de precio en intercambios — on/off.

### Caja
15. Apertura: monto inicial obligatorio o puede ser 0.
16. Quién puede abrir caja por sí mismo (por rol).
17. Monto máximo de diferencia tolerable en cierre antes de exigir autorización.
18. Notificación de diferencia: canal (email default, configurable) + destinatarios.
19. Cantidad máxima de tickets pausados.

### Comprobantes
20. Numeración (formato e inicio).
21. Datos del ticket (logo, dirección, mensaje de pie).
22. Plantilla de envío por WhatsApp/email.

### Roles y acceso
23. Secciones visibles del sidebar por rol (POS, Pedidos, Inventario, etc.).
24. Permisos por rol custom: aplicar descuento, modificar precio, cancelar venta cobrada, egreso/ingreso de caja, devolución, intercambio, vender sin stock, forzar cierre, marcar sesión auditada.

### Apariencia
25. Modo oscuro permitido / forzado / a elección del usuario.

---

## 8. Riesgos abiertos / a coordinar con el equipo

- **Alex:** confirmar separación de devoluciones (modal POS de Alan vs pantalla administrativa de Alex). Confirmar que el árbol de permisos de `/tienda/settings/team` incluye las acciones del punto 24.
- **Mateo:** alinear el modelo de cliente (mismo dato, distinto canal de alta: storefront vs POS) y cómo se evita duplicar clientes por DNI.
- **Modelado de descuentos (B3):** decidir si un producto con promo es el mismo producto con descuento aplicado o un artículo separado. Recomendación: mismo producto + regla de descuento, no duplicar artículos. Pendiente de validar.