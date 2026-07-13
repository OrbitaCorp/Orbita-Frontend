# Pendientes — apps/api

Registro vivo de decisiones sin especificación clara, conflictos detectados, funcionalidad
a medio construir, deuda técnica y preguntas abiertas para el equipo. Ver convención completa
en `apps/api/CLAUDE.md`.

No es una bitácora de lo que ya quedó bien implementado y verificado — eso vive en el resumen
de cada tarea, no acá.

---

## Infraestructura / Entorno de desarrollo

### [2026-07-13] Bug de infraestructura: `@supabase/supabase-js` no funciona en Node 20 sin polyfill de WebSocket
**Estado:** RESUELTO (2026-07-13)
Al correr la guía de prueba manual (fases 1 y 2) contra la base real de Supabase por primera
vez, **todos** los logins devolvían `401 "Credenciales inválidas"` — incluso con contraseñas
correctas y una `SERVICE_ROLE_KEY` válida (confirmado probando la misma request directo contra
`POST /auth/v1/token?grant_type=password` de Supabase, que respondía `200` sin problema).

Causa real: `SupabaseService.adminClient` llama a `createClient()` de `@supabase/supabase-js`
(v2.110.2), que en su constructor intenta inicializar un `RealtimeClient` y ese busca
`WebSocket` nativo del entorno — disponible recién desde Node 22. El proyecto corre en Node
20.19.6, así que `createClient()` **tiraba una excepción síncrona** apenas se llamaba, incluso
aunque este cliente admin no usa canales realtime en ningún lado. El bug quedó invisible porque
`AuthService.login()` envuelve la llamada a Supabase en un `try/catch` genérico que convierte
*cualquier* excepción (de red, de config, o de credenciales) en el mismo `401 "Credenciales
inválidas"` — ver entrada siguiente.

Fix: se instaló `ws` (+ `@types/ws`) y se le pasa explícitamente como `realtime.transport` en
`createClient()` (`src/supabase/supabase.service.ts`). Con eso `RealtimeClient` deja de intentar
resolver un `WebSocket` nativo. Verificado: los 10 pasos de Auth (1.1–1.10) y los 13 de
Negocio/Sucursales (2.1–2.13) de la guía de prueba manual ahora pasan de punta a punta.
**Alternativa a futuro:** si el equipo migra a Node 22+, este polyfill deja de ser necesario y
se puede quitar.

### [2026-07-13] `pnpm add` en un subproyecto pnpm puede podar dependencias de otro `pnpm install` previo
**Estado:** RESUELTO (2026-07-13)
Después de instalar las dependencias del módulo de mail (`pnpm add @nestjs-modules/mailer ...`),
el siguiente `pnpm dev` falló con `Cannot find module '@supabase/supabase-js'` pese a que seguía
listado en `package.json`. La carpeta `node_modules/@supabase` había quedado vacía. Se resolvió
corriendo `pnpm install` (sin argumentos) para resincronizar el lockfile con `node_modules`. Si
vuelve a pasar después de un `pnpm add`, correr `pnpm install` antes de asumir que es un bug de
código.

---

## Seed / Fixtures

### [2026-07-13] `apps/api/scripts/reset-unlinked-customer.ts` no existe
**Estado:** ABIERTO
`Guia prueba manual fases 1 2.md` (sección 1.9) menciona este script como forma de volver un
fixture "sin cuenta" (`authUserId: null`) sin tener que ir a mano al Dashboard de Supabase. El
archivo no existe en `apps/api/scripts/` (la carpeta no existe). Al correr 1.9 en esta sesión,
ambos fixtures (`sinregistrar@` y `sinregistrar2@zapatoslorena.test`) ya tenían `authUserId` seteado
de corridas anteriores — se resolvió a mano: `supabase.auth.admin.deleteUser(authUserId)` +
`prisma.customer.update({ where: { id }, data: { authUserId: null } })` sobre
`sinregistrar@zapatoslorena.test` (dejando `sinregistrar2@` intacto como respaldo). Falta crear
el script real que documenta la guía, tomando ese mismo par de pasos como base.

### [2026-07-12] GUIA_PRUEBA_MANUAL_FASES_1_2.md no existe en apps/api
**Estado:** RESUELTO (2026-07-13)
Se pidió actualizar la sección 1.9 de `GUIA_PRUEBA_MANUAL_FASES_1_2.md` para reflejar el nuevo
fixture `sinregistrar2@zapatoslorena.test`. En esta sesión se confirmó que el archivo sí existe,
como `apps/api/Guia prueba manual fases 1 2.md` (con espacios y mayúscula distinta al nombre
buscado antes) — la búsqueda anterior no lo encontró por diferencia de nombre. Ya menciona
ambos fixtures y por qué existe el segundo. Se corrió la guía completa en esta sesión (1.1–1.10
y 2.1–2.13, todos ✅) y se actualizó la tabla de estado y los resultados reales del archivo.

## Tests E2E

### [2026-07-12] Tests e2e crean usuarios reales en Supabase que no se limpian
**Estado:** ABIERTO
Los tests de `POST /auth/register` crean usuarios de test en Supabase Auth
(`test-e2e-{timestamp}@example.com` y `sinregistrar@zapatoslorena.test` en la primera
corrida). No hay cleanup automático — Supabase no expone un "delete by email" y los tests
no guardan los `authUserId` para borrarlos después. Considerar un script de limpieza que
liste usuarios con emails de patrón `test-e2e-*` y los elimine vía
`supabase.auth.admin.deleteUser()`.

### [2026-07-12] Login de member enviando header X-Business-Slug: prioriza member
**Estado:** RESUELTO (2026-07-12)
El `AuthGuard` usaba `if (slug)` como primera condición, lo que hacía que un token de member
fuera resuelto como customer si la request incluía el header `X-Business-Slug`. Corregido:
ahora el guard busca siempre en `members` primero (por `authUserId`), sin importar si el
header está presente. Solo si no se encuentra member se procede a buscar como customer (ahí
sí se requiere el header). La prioridad member > customer es ahora incondicional. Test de
regresión agregado en `auth.e2e-spec.ts`.

### [2026-07-12] POST /auth/accept-invitation y POST /auth/reset-password sin test e2e
**Estado:** ABIERTO — cobertura parcial
Ambos endpoints funcionan (verificados manualmente en Fase 1) pero no tienen test e2e
automatizado. `accept-invitation` requiere un member PENDING con `hasTempPassword: true`;
`reset-password` requiere un token de recuperación real de Supabase. Para cubrirlos, los
tests necesitarían crear estado en Supabase via admin API dentro del propio test.

---

## Fase 1 — Auth

### [2026-07-13] `AuthService.login()` enmascara cualquier excepción como "Credenciales inválidas"
**Estado:** ABIERTO
`login()` envuelve la llamada a `supabase.adminClient.auth.signInWithPassword()` en un
`try { ... } catch { throw new UnauthorizedException('Credenciales inválidas') }` que no
distingue *por qué* falló: da exactamente el mismo `401` para una contraseña incorrecta que
para un error de infraestructura (ver la entrada de WebSocket/Node 20 más arriba, que este
patrón mantuvo invisible durante la primera prueba manual contra la base real). `register()`
tiene un patrón similar en varios puntos. Sugerido: loguear el error real con
`this.logger.error(err)` (o similar) antes de convertirlo al mensaje genérico de cara al
cliente, para no perder la causa real en producción. No se tocó en esta sesión para no alterar
comportamiento de un módulo ya cerrado sin pedido explícito — queda para que el equipo decida.

### [2026-07-12] Validación de JWT vía llamada a Supabase, no localmente
**Estado:** ABIERTO
`AuthGuard` valida el token con `supabase.auth.getUser(token)` (llamada de red a Supabase Auth)
en vez de verificar el JWT localmente con la clave pública. Se eligió por simplicidad y porque
detecta tokens revocados que una validación local no vería. Trade-off: una llamada HTTP extra
por request autenticado. Revisar si conviene cachear (ej. Redis, TTL corto) cuando haya presión
de performance o el volumen de requests lo justifique.

### [2026-07-12] `accept-invitation` usa `memberId` como token, sin expiración ni secreto
**Estado:** ABIERTO — deuda de seguridad
El link de invitación de miembro usa el `id` (UUID) del registro `Member` directamente como
"token" en `AcceptInvitationDto`. No tiene expiración ni es un secreto firmado — cualquiera que
conozca (o adivine, aunque sea un UUID v4) el `memberId` de un miembro `PENDING` podría intentar
aceptarlo. Antes de tener usuarios reales en producción, agregar un campo `invitationToken`
(string aleatorio, con expiración) al modelo `Member` y usar eso en vez del `id`.

### [2026-07-12] Email de recovery duplicado de Supabase
**Estado:** ABIERTO — pendiente de confirmación manual
`forgot-password` genera el link de recuperación vía `supabase.auth.admin.generateLink()` y
manda el email de branding propio (`MailService.sendPasswordReset`). Si el proyecto de Supabase
todavía tiene habilitado su propio email automático de "reset password", el usuario recibe DOS
emails. Hay que confirmar en el Dashboard de Supabase (Authentication → Email Templates) que el
envío automático de recovery esté deshabilitado. No verificado desde este entorno de desarrollo.

---

## Fase 2 — Businesses/Branches

### [2026-07-12] `PUT /business` no acepta el campo `mode`
**Estado:** RESUELTO (2026-07-12)
El contrato original permitía editar `mode` (FULL/SHOWCASE) junto con name/industry/description
en `PUT /business`. Se decidió excluirlo de este endpoint: cambiar de modo afecta todo el
comportamiento del storefront (checkout, carrito, cupones, mensajes, opiniones) y necesita
validación propia (ej. no permitir el cambio si hay pedidos pendientes sin resolver). Falta
diseñar e implementar el endpoint dedicado para cambiar `mode` — ver entrada siguiente.
`CONTRATO_API.md` corregido para reflejar esto.

### [2026-07-12] Endpoint dedicado para cambiar `business.mode` — no implementado
**Estado:** DIFERIDO — sin fecha objetivo aún
Consecuencia directa de la entrada anterior: en este momento **no existe ninguna forma de
cambiar `mode` vía API** (ni en `PUT /business` ni en otro lado). Diseñar un endpoint separado
(ej. `POST /business/mode`) con sus propias validaciones de negocio antes de habilitar el
cambio en producción.

### [2026-07-12] Rol mínimo para operaciones de sucursal
**Estado:** RESUELTO (2026-07-12)
El contrato decía owner/admin para `POST/PUT/DELETE /branches`. Se decidió owner únicamente por
ser una operación estructural (afecta stock, caja y reportes de todo el negocio) — más cerca de
"zona peligrosa" que de gestión operativa. `CONTRATO_API.md` corregido en consecuencia, y se
documentó también el endpoint `DELETE /branches/:id` (no estaba en el contrato original).

### [2026-07-12] Endpoint `POST /businesses` (creación de negocio) no implementado
**Estado:** DIFERIDO — hasta diseñar `BusinessOnboardingService` compartido
`CONTRATO_API.md` no documenta ningún endpoint de creación de negocio (el módulo Businesses
solo opera sobre el negocio ya existente del token). La transacción completa (business + branch
default + 4 roles + catálogo de permissions si no existe + business_config + storefront_config
+ notification_config + member owner + subscription inicial) hoy solo existe duplicada a mano
en `apps/api/prisma/seed.ts`. Antes de construir el endpoint real de onboarding, extraer esa
lógica a un servicio compartido (`BusinessOnboardingService` o similar) que tanto el endpoint
como el seed script invoquen — para no mantener dos copias de la misma transacción.

### [2026-07-12] `DELETE /business` (eliminar negocio) sigue sin implementar
**Estado:** DIFERIDO — hasta que exista el módulo Subscriptions
El stub de `DELETE /business` sigue tirando `NotImplementedException`. Interactúa con
`subscriptions` (cancelación) y con cascadas de borrado que dependen de módulos que todavía no
existen (Orders, Payments, etc. con datos reales del negocio). Implementar cuando el módulo de
Subscriptions esté construido.

### [2026-07-12] `assertMemberContext()` agregado en Businesses/Branches
**Estado:** ABIERTO
Se detectó que los endpoints sin `@Roles()` declarado (ej. los `GET`) no bloqueaban tokens de
tipo `customer` — un cliente del storefront que mandara el header `X-Business-Slug` podía
llamar `GET /business`, `GET /branches`, etc., porque `RolesGuard` solo actúa cuando hay roles
declarados. Se agregó un helper `assertMemberContext()` (en
`common/utils/assert-member-context.ts`) que se invoca manualmente al inicio de cada handler de
Businesses y Branches. PENDIENTE: decidir si este chequeo debería moverse al `AuthGuard` global
(aplicado automáticamente a cualquier ruta que no sea explícitamente storefront) en vez de
repetirlo módulo por módulo a medida que se implementen Members, Roles, Categories, etc.

### [2026-07-12] Catálogo de eventos de notificación hardcodeado
**Estado:** ABIERTO/DIFERIDO
La validación de `notification_config.matrix` en `BusinessesService` usa una lista fija de 8
eventos (`nuevo_pedido`, `pedido_cancelado`, `stock_critico`, `devolucion`, `pago_confirmado`,
`resumen_diario`, `cliente_nuevo`, `reporte_semanal`) y 3 canales (`panel`, `email`, `whatsapp`)
definida como constante en el código, no en una tabla. Si en el futuro se necesitan eventos
nuevos, o eventos configurables por negocio/vertical, hay que revisar este diseño (podría
requerir una tabla `notification_events` en vez de un catálogo hardcodeado).

### [2026-07-12] Bug de infraestructura: `tsconfig.build.json` compilaba `prisma/`
**Estado:** RESUELTO (2026-07-12)
Al agregar `apps/api/prisma/seed.ts` en Fase 1, `tsconfig.build.json` —que sobreescribe (no
mergea) el `exclude` de `tsconfig.json`— empezó a incluir `prisma/` en la compilación de `nest
build`. Esto rompía la inferencia de `rootDir` de TypeScript: en vez de `dist/main.js`, el
build generaba `dist/src/main.js`, lo que hubiera roto silenciosamente `pnpm start` (que
apunta a `dist/main.js`) recién en el primer deploy. Se agregó `"prisma"` al array `exclude` de
`tsconfig.build.json`. Verificado: `pnpm build` y `pnpm prisma db seed` funcionan correctamente
después del fix.

---

## Fase 3 — Equipo (Roles/Permissions/Members)

### [2026-07-13] Autorización por rol (`@Roles()`), no por permiso, pese a lo que dice el contrato
**Estado:** ABIERTO
`CONTRATO_API.md` especifica permiso mínimo por endpoint (`config.team.view`,
`config.team.manage`, etc.) y dice explícitamente "el backend valida que el rol del miembro
tenga ese permiso". Sin embargo, **todos** los controllers ya scaffoldeados (Fase 1/2 incluida,
escritos por el CTO) solo usan `@Roles('owner','admin')` — nunca chequean `permissions[]` pese a
que `MemberContext.permissions` ya trae los codes resueltos y listos para usarse. No existe
ningún `PermissionsGuard`/`@RequirePermission()` en el código. Para Roles/Members se mantuvo el
mismo patrón (`@Roles()`) por consistencia con el resto del código ya escrito, en vez de
introducir un mecanismo de autorización nuevo sin que el equipo lo haya pedido. Si el criterio
real es permiso-por-permiso (más granular que rol), hay que construir el guard y migrar todos
los módulos, no solo los nuevos.

### [2026-07-13] Catálogo de permisos seed no incluye `catalog.*` ni `config.team.view`
**Estado:** ABIERTO
El contrato de Roles/Categories/Tags/Products pide permisos `catalog.view`, `catalog.manage` y
`config.team.view`, pero `prisma/seed.ts` solo carga 19 permisos en 7 grupos (Pedidos, Clientes,
Reportes, Inventario, POS, Descuentos, Configuración) — sin grupo "Catálogo" y sin
`config.team.view` (solo existe `config.team.manage`). Como la autorización real usa `@Roles()`
y no permisos (ver entrada anterior), esto no bloqueó nada hoy, pero el catálogo que devuelve
`GET /permissions` queda incompleto respecto de lo que el contrato promete mostrar en la UI de
gestión de roles. Falta decidir si se agregan esos codes al seed.

### [2026-07-13] `AppRole` usa 'cashier'/'employee' (inglés) pero los roles seedeados son 'cajero'/'empleado' (español)
**Estado:** ABIERTO
`common/decorators/roles.decorator.ts` define `AppRole = 'owner' | 'admin' | 'cashier' |
'employee'`, pero `prisma/seed.ts` crea los roles con `name: 'cajero'` y `name: 'empleado'`.
`RolesGuard` compara `member.roleName` (el valor real en la DB, en español) contra el array de
`@Roles(...)` — si algún endpoint futuro usa `@Roles('cashier')` o `@Roles('employee')`, **nunca
va a matchear** y esos roles quedarán bloqueados de todo lo que debieran poder hacer. No se tocó
en esta sesión porque ningún endpoint nuevo (Fase 3/4) usa esos dos roles — todos son
`@Roles('owner')` o `@Roles('owner','admin')`. Corregir antes de que un módulo futuro (POS,
Inventario) empiece a usar `@Roles('cashier'|'employee')`.

### [2026-07-13] Al eliminar un miembro no se borra su usuario de Supabase Auth
**Estado:** ABIERTO
`MembersService.remove()` borra la fila de `members` pero no llama a
`supabase.adminClient.auth.admin.deleteUser()`. Consecuencia: el email queda "reservado" en
Supabase Auth para siempre — si más adelante alguien quiere reinvitar a esa misma persona (o
alguien más con el mismo email), el `admin.createUser()` de `invite()` va a fallar. Se decidió
no borrarlo automáticamente porque no hay indicación clara en el contrato de que corresponda, y
borrar usuarios de Auth es una acción con más superficie de riesgo que dejarla pendiente de
confirmación explícita del equipo.

---

## Fase 4 — Catálogo (Categories/Tags/Products)

### [2026-07-13] Producto sin variantes: variante default con stock inicial en 0
**Estado:** RESUELTO (2026-07-13) — decisión tomada por ambigüedad del contrato
El contrato dice: *"Si `variants` viene vacío... el backend crea una variante `isDefault` que
hereda `basePrice` **y el stock inicial**"* — sin especificar de dónde sale ese "stock inicial"
cuando el array viene vacío (no hay ningún objeto variant del que leerlo). Se decidió: variante
única con `price = basePrice`, `comparePrice` del producto, `initialStock: 0`, `stockMin: 0`. El
stock real se carga después desde el módulo de Inventario (Fase 5). Verificado funcionando.

### [2026-07-13] Matching de `variant.optionValues` con las opciones es posicional, no por nombre
**Estado:** RESUELTO (2026-07-13) — decisión tomada por ambigüedad del contrato
El contrato define `variant.optionValues: string[]` (ej. `["M","Negro"]`) sin decir qué opción
corresponde a qué posición del array. Se implementó **matching posicional**: el índice *i* de
`optionValues` se resuelve contra `options[i]` (mismo orden en que vino `options[]` en el
request). Si `options.length !== variant.optionValues.length` para alguna variante → `400`. Se
verificó con Talle+Color en ese orden y funcionó correctamente. Si el frontend arma el array en
otro orden (o por nombre de opción), esto va a resolver mal — avisar si el frontend no controla
el orden explícitamente.

### [2026-07-13] `PUT /products/:id` no reconcilia variantes/opciones/stock — solo campos escalares y tags
**Estado:** ABIERTO — limitación deliberada, necesita definición del equipo
El contrato dice que `PUT /products/:id` debe funcionar "igual que POST (reconciliando
variantes existentes por `id`)", pero `CreateProductDto`/`ProductVariantInput` **no tiene un
campo `id`** para poder identificar qué variante-request corresponde a qué variante-existente.
Implementar un delete-and-recreate de variantes en `update()` es riesgoso: `ProductVariant`
tiene `orderItems`/`stockMovements` con FK sin `onDelete: Cascade` — borrar una variante que ya
tuvo una venta rompería el historial (o el `DELETE` fallaría con P2003 apenas el producto se
vendiera una vez). Se optó por implementar `update()` solo para `name/description/categoryId/
basePrice/comparePrice/cost/status` + reconciliación completa de `tagIds` (sin historial que
proteger ahí). **Falta**: definir con el equipo el mecanismo real de edición de variantes
(¿agregar `id?` opcional al DTO? ¿endpoints separados `POST/PUT/DELETE
/products/:id/variants/:variantId`?) antes de que el panel de catálogo necesite editar
variantes de un producto ya creado.

### [2026-07-13] No existe endpoint separado `PUT /products/:id/tags`
**Estado:** RESUELTO (2026-07-13) — aclaración, no bug
`BACKEND_IMPLEMENTACION.md` (checklist interno) lista "4.6 products/tags — PUT
/products/:id/tags" como ítem aparte, pero ni `CONTRATO_API.md` ni el controller ya
scaffoldeado por el CTO tienen esa ruta. `CreateProductDto` ya trae `tagIds?: string[]` y tanto
`create()` como `update()` lo procesan. Se interpretó que 4.6 describe *comportamiento* (los
tags se asignan vía el body de create/update), no una ruta HTTP nueva — no se agregó ninguna
ruta no documentada en el contrato.

### [2026-07-13] Bug de infraestructura: no existía el bucket de Supabase Storage `product-images`
**Estado:** RESUELTO (2026-07-13)
`POST /products/:id/images` subía correctamente el archivo vía `supabase.adminClient.storage`,
pero devolvía `400 Bucket not found` porque el bucket `product-images` nunca se había creado en
este proyecto de Supabase. Se creó manualmente vía `supabase.storage.createBucket()` (público,
5MB máx., solo `image/png|jpeg|webp|gif`). **Importante para el equipo**: este bucket vive en
*este* proyecto de Supabase (dev/test) — si existe un proyecto separado de staging/producción,
también va a necesitar el mismo bucket creado antes de que la subida de imágenes funcione ahí.

### [2026-07-13] `totalStock` en `GET /products` suma todas las sucursales, no solo la default
**Estado:** DIFERIDO — hasta que exista multi-sucursal real
El listado de productos calcula `totalStock` sumando `variant_stock.quantity` de **todas** las
filas de la variante, sin filtrar por `branch_id`. Con una sola sucursal (V1) da el mismo
resultado que filtrar por la sucursal Principal, así que no se nota. Cuando el negocio tenga
más de una sucursal esto va a mostrar stock combinado de todas — revisar si se necesita
filtrar por sucursal del miembro logueado o agregar `branch_id` como query param opcional
(la convención "Multi-branch" de `CONTRATO_API.md` ya prevé esto para otras tablas).

---

## Fase 5 — Inventario (Inventory/Suppliers)

### [2026-07-13] Bug propio detectado y corregido en el momento: protección de borrado de Supplier basada en un supuesto incorrecto sobre el FK
**Estado:** RESUELTO (2026-07-13)
Implementé `removeSupplier()` copiando el patrón de `BranchesService.remove()` (try/catch de
`P2003` → `422 "tiene registros asociados"`), asumiendo que `stock_movements.supplier_id` era
`RESTRICT` como `branches`. Al probarlo manualmente, el borrado de un proveedor **con
movimientos asociados devolvió `200 ok` en vez del `422` esperado** — reveló que el FK real
(`migration.sql`) es `ON DELETE SET NULL`, no `RESTRICT`: el schema ya decidió que borrar un
proveedor debe conservar el historial de `stock_movements` y solo desvincular la referencia.
Se corrigió el código para no fingir una protección que la base de datos no aplica (el
try/catch nunca se iba a disparar — código muerto). Verificado: al borrar un proveedor con
movimientos, estos quedan con `supplierId: null` y el resto de los datos intactos. **Lección
para los próximos módulos**: no asumir el mismo `onDelete` que otro módulo solo porque el
patrón de código se parece — confirmar contra `migration.sql` o `schema.prisma` antes de
escribir el catch, sobre todo en relaciones opcionales (`String?`).

### [2026-07-13] Filtro `lowStock` y paginación de `GET /inventory/stock` se resuelven en memoria
**Estado:** ABIERTO — deuda de performance, no de corrección
`isLowStock` es `quantity <= stockMin`, una comparación entre dos columnas de la misma fila que
Prisma no expresa directamente en un `where` (no hay `field <= field` en el query builder). Se
resolvió trayendo todas las filas de `variant_stock` de la sucursal y filtrando/paginando en
JS. Funciona correctamente pero no escala: con catálogos grandes (miles de variantes) esto trae
todo a memoria antes de paginar. Alternativas si se vuelve un problema real: `$queryRaw` con SQL
crudo, o agregar una columna calculada/generada en Postgres.

### [2026-07-13] `POST /inventory/adjustment` bloquea si el resultado da stock negativo
**Estado:** RESUELTO (2026-07-13) — decisión tomada por ambigüedad del contrato
El contrato no dice explícitamente qué pasa si un ajuste (`quantity` puede ser negativo) deja el
stock por debajo de cero. Se decidió bloquear con `422` en vez de permitir stock negativo —
criterio de negocio (no tiene sentido operativo vender/ajustar por debajo de lo que hay). Mismo
criterio no se aplicó a `entry` (siempre suma, no puede dar negativo por diseño).
