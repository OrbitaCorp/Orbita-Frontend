# Orbita — Lista de tareas de implementación

> Orden estricto de dependencias. Cada tarea necesita que las anteriores estén terminadas
> (salvo donde se indica que se puede paralelizar).
>
> **Decisión de login:** Opción A — login único, el sistema detecta si es miembro o cliente
> y redirige según corresponda.
>
> **Convención:** cada tarea incluye los endpoints del contrato de API que cubre.
> "Implementar" = lógica real en service + controller + DTOs tipados + validaciones.

---

## Fase 0 — Prerrequisitos

- [ ] **0.1** Mateo arma el backlog en la herramienta de gestión (Notion, Linear, etc.) usando
  esta lista como base. Cada tarea = una tarjeta asignable.
- [ ] **0.2** Alex decide los detalles de UX del login Opción A: ¿qué pantalla ve el usuario
  mientras el sistema detecta su rol? ¿Spinner? ¿Animación? ¿Cuánto tiempo máximo?
- [ ] **0.3** Configurar variables de entorno de Supabase Auth en `apps/api/.env` (ya hecho
  parcialmente con DATABASE_URL/DIRECT_URL).

---

## Fase 1 — Auth (desbloquea TODO lo demás)

- [ ] **1.1 Implementar `AuthGuard` real** — reemplazar el stub `return true` por validación
  de JWT de Supabase. Extraer `auth_user_id` del token y setearlo en `req.user`. Este guard
  se aplica globalmente; los endpoints públicos se marcan con `@Public()`.

- [ ] **1.2 Implementar `@CurrentUser()` y `@CurrentBusiness()`** — decoradores que extraen
  del request el usuario autenticado y el `business_id` (para multi-tenant). `@CurrentBusiness()`
  busca en `members` o `customers` según contexto para obtener el `business_id`.

- [ ] **1.3 `POST /auth/register`** — registro de cliente en storefront. Crea `auth.users` en
  Supabase + `customers` en Orbita. Si ya existe un customer con ese email (creado desde POS),
  vincula el `auth_user_id` al registro existente en vez de duplicar.

- [ ] **1.4 `POST /auth/login`** — login unificado (Opción A). Supabase valida credenciales.
  El backend busca primero en `members` (si encuentra → devuelve rol, permisos, business_id,
  redirect a panel según rol). Si no, busca en `customers` (si encuentra → devuelve perfil,
  redirect a storefront). Si no está en ninguna → error. Si está en ambas → devuelve como
  miembro (prioridad panel sobre storefront).

- [ ] **1.5 `POST /auth/logout`** — invalidar sesión en Supabase.

- [ ] **1.6 `POST /auth/forgot-password`** — generar link de reset + enviar email vía
  `MailService.sendPasswordReset()`. Primer uso real del módulo `mail/`.

- [ ] **1.7 `POST /auth/reset-password`** — cambiar contraseña con token de reset.

- [ ] **1.8 `GET /auth/me`** — devuelve datos del usuario según contexto. Si es miembro:
  `{ type: 'member', member, role, permissions, business }`. Si es cliente:
  `{ type: 'customer', customer, business }`. El frontend usa `type` para decidir a dónde
  redirigir.

- [ ] **1.9 `POST /auth/accept-invitation`** — un miembro invitado acepta, cambia contraseña
  temporal, pasa a `status = ACTIVE`.

- [ ] **1.10 Implementar `RolesGuard` real** — verifica que el miembro tenga el rol mínimo
  requerido. Usa `@Roles('owner', 'admin')` en los controllers.

- [ ] **1.11 Implementar `BusinessModeGuard` real** — verifica `business.mode` para endpoints
  que requieren `FULL`. Usa `@FullModeOnly()`.

---

## Fase 2 — Negocio y configuración

> Puede paralelizarse internamente (2.1-2.4 son independientes entre sí).

- [ ] **2.1 `businesses/`** — CRUD del negocio. `GET/PUT /businesses/me` (datos del negocio
  del usuario logueado). Incluir `subdomain` (único global). `POST /businesses/me/pause`,
  `POST /businesses/me/unpause`.

- [ ] **2.2 `businesses/config`** — `GET/PUT /businesses/me/config` (business_config:
  contacto, pagos habilitados, transfer_alias, envíos, redes).

- [ ] **2.3 `businesses/appearance`** — `GET/PUT /businesses/me/appearance` (storefront_config:
  branding, tema, layout, toggles incluido `showReviews`).

- [ ] **2.4 `businesses/notifications`** — `GET/PUT /businesses/me/notifications`
  (notification_config: matriz evento×canal como JSON).

- [ ] **2.5 `branches/`** — `GET /branches` (devuelve la sucursal default). CRUD preparado
  pero en V1 solo se usa lectura.

---

## Fase 3 — Equipo

- [ ] **3.1 `roles/`** — `GET /roles`, `GET /permissions` (catálogo global), `POST/PUT/DELETE
  /roles/:id`, `PUT /roles/:id/permissions` (asignar permisos a rol). Seed de los 4 roles
  default (owner, admin, cajero, empleado) y los ~19 permisos al crear un negocio.

- [ ] **3.2 `members/`** — `GET /members`, `POST /members/invite` (crea auth.users con password
  temporal + envía email vía `MailService.sendMemberInvitation()`), `PUT/DELETE /members/:id`.

---

## Fase 4 — Catálogo

> El módulo más complejo. Implementar en este sub-orden.

- [ ] **4.1 `categories/`** — CRUD con árbol (`parent_id`). `GET /categories` (devuelve árbol
  completo), `POST/PUT/DELETE /categories/:id`, `PATCH /categories/:id/reorder`.

- [ ] **4.2 `tags/`** — CRUD simple. `GET /tags`, `POST/PUT/DELETE /tags/:id`.

- [ ] **4.3 `products/` — crear producto sin variantes** — `POST /products` con la lógica de
  variante default (si no vienen variantes explícitas, crear una `isDefault = true` que hereda
  precio). `GET /products` (listado con filtros), `GET /products/:id` (detalle con options,
  variants, images, tags). `PUT /products/:id`, `DELETE /products/:id` (soft-delete).

- [ ] **4.4 `products/` — crear producto CON variantes** — extender `POST /products` para
  recibir `options[]` con `values[]`, generar las combinaciones, crear `product_variants` +
  `variant_option_values` + `variant_stock` (una fila por variante × branch default). Todo en
  una transacción Prisma.

- [ ] **4.5 `products/images`** — `POST /products/:id/images` (upload a Supabase Storage,
  guardar URL), `DELETE /products/:id/images/:imageId`, `PATCH /products/:id/images/:imageId`
  (cambiar posición, primary, option_value_id).

- [ ] **4.6 `products/tags`** — `PUT /products/:id/tags` (asignar tags a producto, recibe
  array de tag_ids).

- [ ] **4.7 `products/barcodes`** — `GET /products/barcodes` (listado para impresión de
  etiquetas).

---

## Fase 5 — Inventario

- [ ] **5.1 `inventory/stock`** — `GET /inventory/stock` (stock por variante, filtrable por
  branch). Incluir indicador de "stock bajo" (`quantity <= stockMin`) calculado.

- [ ] **5.2 `inventory/entry`** — `POST /inventory/entry` (entrada de mercadería: crea
  `stock_movement` tipo ENTRADA + incrementa `variant_stock.quantity`).

- [ ] **5.3 `inventory/adjustment`** — `POST /inventory/adjustment` (ajuste manual: crea
  `stock_movement` tipo AJUSTE + actualiza `variant_stock.quantity`).

- [ ] **5.4 `inventory/movements`** — `GET /inventory/movements` (historial con filtros por
  variante, tipo, rango de fechas).

- [ ] **5.5 `suppliers/`** — CRUD simple. `GET/POST/PUT/DELETE /suppliers`.

---

## Fase 6 — Clientes

- [ ] **6.1 `customers/`** — `GET /customers` (listado con búsqueda y paginación),
  `GET /customers/:id` (detalle con pedidos agregados: conteo, gasto total, ticket promedio,
  última compra — calculados on-read, no persistidos).
  `POST /customers` (crear desde panel/POS), `PUT /customers/:id`, `DELETE /customers/:id`
  (soft-delete).

- [ ] **6.2 `customers/addresses`** — `GET/POST/PUT/DELETE /customers/:id/addresses`.

- [ ] **6.3 Lógica de vinculación POS↔storefront** — en `POST /auth/register`: si ya existe
  un customer con el mismo email en el mismo business, vincular `auth_user_id` al existente.
  (Esto técnicamente es parte de auth, pero se testea cuando customers está implementado.)

---

## Fase 7 — Órdenes y pagos (el core transaccional)

> Esta fase tiene las dependencias más pesadas. Sub-orden estricto.

- [ ] **7.1 `orders/` — crear orden POS** — `POST /orders` con `channel: 'POS'`. En una sola
  transacción: crear `orders` + `order_items` + `pos_sale_details` + `payments` (1 o más,
  pago mixto) + `stock_movements` (tipo SALIDA, uno por línea que no sea `isConcept`).
  Incrementar `discounts.usesConsumed` si hay descuentos aplicados. Decrementar
  `variant_stock.quantity`. Generar `orderNumber` autoincremental por business.

- [ ] **7.2 `orders/` — crear orden online** — `POST /orders` con `channel: 'ONLINE'`.
  Crear `orders` (status: PENDING) + `order_items` + `online_order_details`. NO crear payments
  ni stock_movements todavía (esperan confirmación de pago vía webhook de MP). El stock se
  reserva o se decrementa al confirmar (definir política).

- [ ] **7.3 `orders/` — cambio de estado** — `PATCH /orders/:id/status`. Validar transiciones
  según canal. Al pasar a CONFIRMED (online): crear payments + stock_movements. Al pasar a
  DELIVERED: disparar `MailService.sendOrderDelivered()` + `MailService.sendReviewRequest()`.

- [ ] **7.4 `orders/` — lecturas** — `GET /orders` (listado con filtros por estado, canal,
  búsqueda, paginación), `GET /orders/:id` (detalle con items, payments, status history).

- [ ] **7.5 `payments/`** — `GET /orders/:id/payments` (lectura). `PATCH /payments/:id/verify`
  (verificación manual de transferencia: setea `verifiedBy`, `verifiedAt`, pasa a APPROVED).

- [ ] **7.6 `cash/sessions`** — `POST /cash/sessions/open`, `POST /cash/sessions/:id/close`
  (con conteo, calcula diferencia), `POST /cash/sessions/:id/force-close`,
  `GET /cash/sessions` (historial), `GET /cash/sessions/:id/summary` (resumen de turno).

- [ ] **7.7 `cash/movements`** — `POST /cash/movements` (ingreso/egreso dentro de sesión
  abierta), `GET /cash/movements` (por sesión).

---

## Fase 8 — MercadoPago

- [ ] **8.1 OAuth** — `GET /mercadopago/oauth/connect` (redirige al flujo OAuth de MP),
  `GET /mercadopago/oauth/callback` (recibe el code, intercambia por tokens, guarda en
  `mp_credentials` cifrado). `POST /mercadopago/oauth/disconnect`.

- [ ] **8.2 Webhooks de pago** — `POST /webhooks/mercadopago/payments` (recibe notificación
  de MP, actualiza `payments.status`, si APPROVED → cambia order status + crea stock_movements).
  Validar firma del webhook.

- [ ] **8.3 Checkout online** — al confirmar checkout en storefront, crear Order de MP
  (preference), devolver URL de pago al frontend. El webhook (8.2) cierra el ciclo.

- [ ] **8.4 Point (opcional)** — `POST /mercadopago/stores` (crear store MP vinculado a branch),
  `POST /mercadopago/pos` (crear POS MP), `GET /mercadopago/devices` (listar dispositivos),
  `PATCH /mercadopago/devices/:id/activate` (modo PDV). Crear Order de MP apuntando al device.

- [ ] **8.5 Webhook OAuth** — `POST /webhooks/mercadopago/oauth` (escuchar
  autorización/desautorización, actualizar `mp_credentials.isActive`).

- [ ] **8.6 Refresh de tokens** — job/cron que refresca `access_token` antes de que expire
  (cada 180 días). Puede ser un cron de NestJS o un scheduled function de Supabase.

---

## Fase 9 — Descuentos

- [ ] **9.1 `discounts/` — CRUD** — `GET/POST/PUT/DELETE /discounts`. Toggle activo
  (`PATCH /discounts/:id/toggle`). Duplicar (`POST /discounts/:id/duplicate`). Filtros por
  estado (derivado), tipo, búsqueda. Solo los 4 tipos triviales; si llega un tipo diferido,
  devolver 400.

- [ ] **9.2 `discounts/evaluate`** — `POST /discounts/evaluate` (recibe items del carrito +
  cupon opcional, devuelve descuentos aplicables + totales). Regla "best discount wins" (mayor
  ahorro, priority como desempate). Endpoint compartido por POS y storefront.

- [ ] **9.3 `discounts/validate`** — `POST /discounts/validate` (valida un código de cupón:
  existe, activo, no expirado, no agotado, cumple monto mínimo).

- [ ] **9.4 `discounts/redemptions`** — la tabla `discount_redemptions` se llena
  automáticamente al crear una orden con descuento (en 7.1/7.2). `GET /discounts/:id/metrics`
  (métricas: usos, revenue sacrificado, tasa de canje). `GET /discounts/:id/audit` (log de
  auditoría).

---

## Fase 10 — Postventa y comunicación

> Paralelizable internamente.

- [ ] **10.1 `returns/`** — `GET/POST /returns`, `PATCH /returns/:id` (aprobar/rechazar).
  Al aprobar con `refundMethod = CREDIT_NOTE`: crear `credit_note` vinculada.

- [ ] **10.2 `credit-notes/`** — (dentro de `returns/`): `GET /credit-notes`,
  `PATCH /credit-notes/:id/apply`.

- [ ] **10.3 `conversations/`** — `GET /conversations` (bandeja con filtros),
  `GET /conversations/:id/messages`, `POST /conversations/:id/messages`,
  `PATCH /conversations/:id` (marcar leído, archivar). Solo modo FULL.

- [ ] **10.4 `message-templates/`** — CRUD simple. `GET/POST/PUT/DELETE /message-templates`.

- [ ] **10.5 `reviews/`** — `POST /reviews` (verificar compra: buscar order con customer_id +
  product_id en status DELIVERED/COMPLETED), `GET /products/:id/reviews` (públicas, paginadas),
  `PATCH /reviews/:id/hide` (ocultar con razón obligatoria). Solo modo FULL.

---

## Fase 11 — Auditoría y reportes

- [ ] **11.1 `audit/`** — `GET /audit-logs` (filtrar por entidad, miembro, rango). La
  escritura se integra en los otros módulos (ya deberían estar llamando a un
  `auditService.log()` en las acciones sensibles desde la fase 7).

- [ ] **11.2 `reports/dashboard`** — `GET /reports/dashboard` (KPIs: ventas, pedidos, ticket
  promedio, clientes nuevos, con deltas por "mismo período anterior"). Alertas (pedidos
  pendientes, stock bajo, pagos por confirmar). Serie de ventas. Top productos. Distribución
  por canal.

- [ ] **11.3 `reports/`** — `GET /reports/sales`, `/reports/products`, `/reports/customers`,
  `/reports/inventory`. Cada uno con filtros de rango de fechas y branch opcional.

---

## Fase 12 — Modos y vidriera digital

- [ ] **12.1 Lógica de modo** — `BusinessModeGuard` ya está implementado (fase 1). Verificar
  que todos los endpoints marcados como `@FullModeOnly()` devuelven 403 en SHOWCASE.

- [ ] **12.2 Storefront condicional** — el endpoint `GET /storefront/:slug` debe incluir
  `business.mode` en la response para que el frontend sepa si mostrar checkout o botón de
  WhatsApp.

- [ ] **12.3 Botón WhatsApp** — en modo SHOWCASE, el storefront muestra un botón por producto
  que arma un link `wa.me/{whatsapp}?text={mensaje}` con el nombre del producto y precio. El
  `whatsapp` viene de `business_config.whatsapp`. Esto es 100% frontend — no necesita endpoint
  nuevo.

---

## Fase 13 — Suscripciones y plataforma

- [ ] **13.1 `platform/admins`** — CRUD de `platform_admins`. Seed de los 3 fundadores como
  SUPERADMIN. Auth separada (PlatformAdminGuard).

- [ ] **13.2 `platform/businesses`** — `GET /platform/businesses` (listar todos los negocios),
  `POST /platform/businesses/:id/suspend`, `/reactivate`.

- [ ] **13.3 `subscriptions/`** — `GET /subscriptions/me` (el negocio ve su suscripción).
  Crear suscripción al crear negocio (con período inicial).

- [ ] **13.4 `subscriptions/grant-comp`** — `POST /platform/subscriptions/:businessId/grant-comp`
  (ceder licencia comp con fecha de fin, registrar `grantedBy` + `grantReason`).

- [ ] **13.5 Integración preapproval MP** — crear preapproval al activar débito automático.
  Webhook `POST /webhooks/mercadopago/preapproval` (recibe resultado de cada cobro mensual,
  actualiza `subscription_payments`, transiciona estado de suscripción:
  ACTIVE↔PAST_DUE↔SUSPENDED).

- [ ] **13.6 Lógica de mora** — política B: gracia 3-5 días. Cron/job que revisa suscripciones
  `PAST_DUE` cuyo `currentPeriodEnd + gracePeriodDays` ya pasó → suspender. Enviar emails en
  cada transición (`MailService.sendSubscriptionPaymentFailed()`,
  `sendSubscriptionSuspended()`).

- [ ] **13.7 Bloqueo de acceso** — cuando `subscription.status = SUSPENDED`, el negocio ve
  una pantalla de "tienda suspendida" en vez del panel/storefront. El `AuthGuard` o un
  middleware global lo verifica.

---

## Fase 14 — Dominios

- [ ] **14.1 Subdominio funcional** — ruteo de `{subdomain}.orbita.site` al storefront
  correcto. Configuración en Vercel (wildcard domain). El endpoint
  `GET /storefront/:slug` ya resuelve por slug.

- [ ] **14.2 `domains/`** — `POST /domains/purchase` (comprar dominio vía OpenSRS/ResellerClub),
  `GET /domains` (listar dominios del negocio), `GET /domains/:id/dns-status` (verificar DNS).

- [ ] **14.3 Verificación DNS** — modelo Shopify: verificar que el registro A y el CNAME
  apuntan correctamente. Actualizar `custom_domains.dnsVerified`.

- [ ] **14.4 SSL de Vercel** — vía API de Vercel, informar el dominio custom para que emita
  el certificado. Actualizar `custom_domains.sslStatus`.

---

## Fase 15 — Storefront público

- [ ] **15.1 `storefront/`** — endpoints públicos (sin auth):
  `GET /storefront/:slug` (config + apariencia + modo),
  `GET /storefront/:slug/products` (listado público),
  `GET /storefront/:slug/products/:id` (detalle público con variantes, imágenes, opciones),
  `GET /storefront/:slug/categories`,
  `GET /storefront/:slug/coupons` (cupones públicos, solo FULL),
  `GET /storefront/:slug/exclusive-discount/:code`.

- [ ] **15.2 `POST /storefront/:slug/checkout`** — crear orden online (solo FULL). Llama
  internamente a la lógica de orders (7.2) + MercadoPago (8.3).

---

## Fase 16 — Integración frontend ↔ backend

> Esto se hace progresivamente desde la fase 2, no al final. Pero acá va el checklist
> completo de conexión, en orden de flujo de usuario.

- [ ] **16.1 Onboarding** — crear negocio (`POST /businesses`) con subdominio + branch default
  + roles default + suscripción inicial. Elegir modo (FULL/SHOWCASE).

- [ ] **16.2 Login/registro** — conectar `cliente/auth/` al endpoint `POST /auth/login` y
  `/auth/register`. Implementar la redirección según `type` de la respuesta de `/auth/me`.

- [ ] **16.3 Panel — configuración** — conectar `panel/configuracion/` a los endpoints de
  businesses (config, apariencia, equipo, notificaciones).

- [ ] **16.4 Panel — catálogo** — conectar `panel/catalogo/` a `/products`, `/categories`,
  `/tags`. Reemplazar todos los mocks por llamadas reales. El wizard de producto nuevo es el
  más complejo (crear producto + variantes + imágenes en una transacción).

- [ ] **16.5 Panel — inventario** — conectar `panel/inventario/` a `/inventory/*`,
  `/suppliers`.

- [ ] **16.6 Panel — clientes** — conectar `panel/clientes/` a `/customers`. Los KPIs del
  detalle (pedidos, gasto, ticket) vienen calculados del backend.

- [ ] **16.7 Panel — POS** — conectar `panel/pos/` a `/orders` (canal POS), `/cash/*`,
  `/pos/products`, `/discounts/evaluate`. Reemplazar stores Zustand de mock por llamadas API.

- [ ] **16.8 Panel — pedidos** — conectar `panel/pedidos/` a `/orders` (canal ONLINE), cambios
  de estado, cola de preparación, devoluciones, notas de crédito.

- [ ] **16.9 Panel — descuentos** — conectar `panel/descuentos/` a `/discounts`. Ocultar
  los 3 tipos diferidos de la UI. Conectar métricas y auditoría.

- [ ] **16.10 Panel — mensajes** — conectar `panel/mensajes/` a `/conversations`,
  `/message-templates`.

- [ ] **16.11 Panel — reportes** — conectar `panel/reportes/` a `/reports/*`.

- [ ] **16.12 Storefront** — conectar `cliente/` a `/storefront/:slug/*`, `/auth/*`,
  `/me/*`. Checkout → MercadoPago. Opiniones. Cupones públicos.

- [ ] **16.13 Vidriera digital** — bifurcar el storefront según `business.mode`. Ocultar
  checkout/carrito/cupones/mensajes/opiniones. Mostrar botón WhatsApp.

- [ ] **16.14 Super-admin** — crear las pantallas del panel de plataforma (no existen en el
  frontend actual — son nuevas).

---

## Resumen de fases

| Fase | Módulos | Depende de | Estimación |
|---|---|---|---|
| 0 | Prerrequisitos | — | 1 día |
| 1 | Auth | 0 | 3-5 días |
| 2 | Negocio + config | 1 | 2-3 días |
| 3 | Equipo | 1, 2 | 2 días |
| 4 | Catálogo | 1, 2 | 4-6 días |
| 5 | Inventario | 4 | 2-3 días |
| 6 | Clientes | 1 | 2-3 días |
| 7 | Órdenes + pagos + caja | 4, 5, 6 | 5-7 días |
| 8 | MercadoPago | 7 | 4-6 días |
| 9 | Descuentos | 4, 7 | 3-5 días |
| 10 | Postventa + comunicación | 6, 7 | 3-4 días |
| 11 | Auditoría + reportes | 7 | 3-4 días |
| 12 | Modos (vidriera) | 2, 15 | 1-2 días |
| 13 | Suscripciones + plataforma | 1, 8 | 4-6 días |
| 14 | Dominios | 2 | 3-5 días |
| 15 | Storefront público | 4, 9 | 2-3 días |
| 16 | Integración frontend | todas | continuo |
| | **Total estimado** | | **~45-65 días de desarrollo** |

> Con 3 devs en paralelo (después de que auth esté listo): **~4-6 semanas** calendario,
> asumiendo que no hay bloqueos externos (MercadoPago sandbox, proveedor de email, etc.).
