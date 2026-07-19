# Pendientes — apps/api

Registro vivo de decisiones sin especificación clara, conflictos detectados, funcionalidad
a medio construir, deuda técnica y preguntas abiertas para el equipo. Ver convención completa
en `apps/api/CLAUDE.md`.

No es una bitácora de lo que ya quedó bien implementado y verificado — eso vive en el resumen
de cada tarea, no acá.

---

## Infraestructura / Entorno de desarrollo

### [2026-07-18] Error intermitente: "new row violates row-level security policy" al subir a Storage — sin causa raíz confirmada, autoresuelto
**Estado:** ABIERTO — no reproducible actualmente, causa raíz sin confirmar. Investigación
extensa documentada acá para no repetirla desde cero si reaparece.
`POST /business/storefront-config/logo` falló de forma reproducible con `400 "new row violates
row-level security policy"` durante ~40 minutos de pruebas (tanto en la sesión de desarrollo
como en el navegador real del usuario), y después empezó a funcionar de forma estable (6/6
intentos seguidos) sin ningún cambio de código de por medio. Hipótesis descartadas, una por una,
con evidencia:
- **¿Service role key incorrecta/mal resuelta por NestJS?** No — se comparó el fingerprint
  (largo, prefijo, sufijo) de la key resuelta por `ConfigService` dentro de la app corriendo
  contra la del `.env` leído directo: idénticas.
- **¿`AuthGuard` "contamina" el `adminClient` compartido llamando `auth.getUser(token)` antes de
  cada request, degradando llamadas de Storage subsiguientes a "usuario autenticado" en vez de
  "service role"?** No — se reprodujo el mismo patrón (`getUser(token)` seguido de
  `.storage.upload()` sobre el mismo cliente) en un script aislado y no falló.
- **¿Cliente "frío" en la primera llamada real a Storage tras un restart?** No — se probó
  "precalentar" el cliente en `onModuleInit()` con un upload+delete real (no alcanza con
  `listBuckets()`, que no toca el mismo path que un insert en `storage.objects`) y el error
  siguió apareciendo en la primera request real de todos modos. Se revirtió el intento (no
  demostró ningún efecto).
- **¿Diferencia en las opciones del cliente (`auth: { autoRefreshToken: false, persistSession:
  false }`) entre el `SupabaseService` real y los scripts de prueba?** No — se replicaron esas
  opciones exactas en un script aislado contra el mismo bucket y subió sin problema.
- **¿Iba y venía con cada restart del servidor?** Tampoco de forma consistente — hubo restarts
  limpios donde el primer intento fallaba, y llamadas repetidas sobre el mismo proceso (mismo
  negocio, mismo token) que siguieron fallando 2 veces seguidas antes de, más tarde, empezar a
  funcionar sin ningún cambio identificable.

**Hipótesis más plausible, sin poder confirmarla desde acá**: algo transitorio del lado de
Supabase específico al bucket `business-logos` (creado ese mismo día, a diferencia de
`product-images` que nunca mostró este problema y tiene varios días de antigüedad) — posible
demora de propagación de metadata/políticas para un bucket nuevo, o flakiness puntual de su
infraestructura de Storage. **Si reaparece**: (a) confirmar si coincide con un bucket recién
creado, (b) revisar el dashboard de Supabase (Storage → Logs, o el status page de Supabase) por
si hay incidentes reportados, (c) como mitigación pragmática (no implementada — se decidió no
agregar retries especulativos para un bug que no se pudo reproducir de forma confiable),
envolver el upload en un retry con backoff corto (1-2 reintentos) ya que empíricamente los
reintentos eventualmente funcionaron.

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
**Estado:** RESUELTO (2026-07-18)
Ya no se necesita el script: con auth propio, el seed resetea `passwordHash: null` en los
customers "sin cuenta" automáticamente en cada corrida (`pnpm seed`). No hay Supabase Auth
que limpiar externamente.

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
**Estado:** RESUELTO (2026-07-18)
Con la migración a auth propio, los tests ya no tocan Supabase Auth. Los customers de test
se crean en la DB local y se limpian con el seed (que ahora resetea `passwordHash: null` en
los fixtures "sin cuenta").

### [2026-07-12] Login de member enviando header X-Business-Slug: prioriza member
**Estado:** RESUELTO (2026-07-12)
El `AuthGuard` usaba `if (slug)` como primera condición, lo que hacía que un token de member
fuera resuelto como customer si la request incluía el header `X-Business-Slug`. Corregido:
ahora el guard busca siempre en `members` primero (por `authUserId`), sin importar si el
header está presente. Solo si no se encuentra member se procede a buscar como customer (ahí
sí se requiere el header). La prioridad member > customer es ahora incondicional. Test de
regresión agregado en `auth.e2e-spec.ts`.

### [2026-07-12] POST /auth/accept-invitation y POST /auth/reset-password sin test e2e
**Estado:** ABIERTO — cobertura parcial (ahora factible sin Supabase)
Ambos endpoints funcionan pero no tienen test e2e automatizado. Con auth propio, el
blocker técnico (necesitaban estado en Supabase) desapareció: `accept-invitation` solo
requiere un member PENDING con `hasTempPassword: true` en la DB local;
`reset-password` requiere un PasswordResetToken creado directamente en la DB.

---

## Fase 1 — Auth

### [2026-07-18] Migración de Supabase Auth a sistema propio completada
**Estado:** RESUELTO (2026-07-18)
Se eliminó Supabase Auth como proveedor de autenticación. Cada negocio ahora gestiona
credenciales independientemente: argon2id para hashing, JWT HS256 con `JWT_SECRET` propio,
refresh token con rotación (SHA-256 hash en DB). Migración SQL aplicada:
`20260718223824_own_auth_system`. El campo `authUserId` se conserva temporalmente (nullable,
sin uso funcional) para no romper registros históricos — se puede eliminar en una migración
futura cuando se confirme que no se referencia desde ningún otro sistema externo.

### [2026-07-18] `SupabaseService` aún existe pero ya no se usa en auth
**Estado:** ABIERTO
`SupabaseService` sigue existiendo (`src/supabase/supabase.service.ts`) y se importa en
`onboarding.service.ts` (import residual — ya no se usa funcionalmente). Queda pendiente:
(a) eliminar el import no-utilizado, (b) evaluar si `SupabaseService` se sigue necesitando
para Storage (product-images, business-logos) y si no, remover el módulo completo.

### [2026-07-18] Swagger/OpenAPI pendiente de actualizar para nuevos endpoints auth
**Estado:** ABIERTO
Los endpoints de auth cambiaron comportamiento: `register` ya no devuelve token (solo message),
`login` devuelve `refreshToken` adicional, `logout` es público y recibe `refreshToken` en body,
`forgot-password` requiere `X-Business-Slug`. Se agregó `POST /auth/refresh`. Falta actualizar
la documentación OpenAPI/Swagger para reflejar el nuevo contrato.

### [2026-07-18] Frontend no actualizado para el nuevo flujo de auth
**Estado:** ABIERTO — bloqueante para deploy a producción
El frontend sigue usando el flujo anterior (espera token en register, no envía refreshToken en
logout, no usa el endpoint /refresh). Hay que actualizar: (a) flujo de login para almacenar
y rotar refreshToken, (b) flujo de register para redirigir a login después del mensaje de
éxito, (c) interceptor axios para renovar token automáticamente cuando expire.

### [2026-07-13] `AuthService.login()` enmascara cualquier excepción como "Credenciales inválidas"
**Estado:** RESUELTO (2026-07-18)
Con la migración a auth propio, el login ya no envuelve llamadas a un servicio externo.
Los errores de argon2/Prisma no se enmascaran — solo se devuelve "Credenciales inválidas"
cuando la contraseña es incorrecta o el usuario no existe (comportamiento deliberado de
no-enumeración).

### [2026-07-12] Validación de JWT vía llamada a Supabase, no localmente
**Estado:** RESUELTO (2026-07-18)
Con la migración a JWT HS256 propio, la validación es local (`jwt.verify` con secret
simétrico). No hay más llamada de red por request. Los refresh tokens se almacenan
hasheados en DB con revocación explícita, lo que reemplaza la detección de tokens
revocados que antes proveía Supabase.

### [2026-07-12] `accept-invitation` usa `memberId` como token, sin expiración ni secreto
**Estado:** RESUELTO (2026-07-14)
Se agregaron `invitationToken` (único, 32 bytes aleatorios en hex) e `invitationTokenExpiresAt`
(7 días) a `Member` — migración `20260715013513_add_member_invitation_token` (columnas
nullable, aditiva, no tocó filas existentes). `members.invite()` genera el token y lo manda en
`panelUrl` en vez del `memberId`; `auth.acceptInvitation()` busca por `invitationToken` (no por
`id`), valida expiración y lo quema (`null`) al aceptar — de un solo uso. `AcceptInvitationDto.
token` pasó de `@IsUUID()` a `@Length(64,64)`, así que un `memberId` viejo ya ni siquiera pasa la
validación del DTO. Verificado en vivo: invite → token de 64 hex ≠ memberId → accept 201 → reuso
del mismo token 400 "ya aceptada" → memberId como token 400 (longitud inválida).

### [2026-07-12] Email de recovery duplicado de Supabase
**Estado:** RESUELTO (2026-07-18)
Con la migración a auth propio, `forgot-password` ya no llama a Supabase Auth. El email de
recuperación solo se envía desde `MailService.sendPasswordReset` — no hay duplicación posible.

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
**Estado:** RESUELTO (2026-07-14) — para los módulos de Fases 3-5
Se construyó `PermissionsGuard` + `@RequirePermission(code)` (`common/guards/permissions.guard.ts`,
`common/decorators/require-permission.decorator.ts`), registrado como `APP_GUARD` global junto a
`RolesGuard`. Se migraron todos los controllers de Roles/Members/Categories/Tags/Products/
Inventory/Suppliers siguiendo literalmente lo que dice `CONTRATO_API.md` por endpoint:
- Donde el contrato solo pide un permiso (`catalog.manage`, `catalog.view`, `inventory.manage`,
  `inventory.view`) se dejó **solo** `@RequirePermission()`, sin `@Roles()` — así un rol custom
  con ese permiso puede operar, que era el objetivo de la migración.
- Donde el contrato pide explícitamente "permiso + rol owner/admin" (crear/editar/eliminar
  roles, invitar miembros) o "rol owner" (eliminar miembro) — operaciones que pueden escalar
  privilegios de otros — se mantuvo `@Roles()` **además** de `@RequirePermission()`, a propósito:
  un rol custom con `config.team.manage` no debe poder crear otros roles/miembros.
- Los roles default (`cajero`, `empleado`) sumaron los `*.view` que antes tenían de facto (los
  GET no chequeaban nada más que membership) para no perder acceso de lectura al migrar — ver
  entrada siguiente y `prisma/seed.ts` → `ROLE_PERMISSIONS`.
Verificado en vivo: owner sigue con acceso total; cajero ahora puede ver catálogo/inventario/
roles (antes accesible a cualquier member sin permiso) y sigue bloqueado (403 con el permiso
faltante en el mensaje) en las mutaciones. No se tocó ningún otro módulo (Orders, Cash, etc.) —
siguen en `@Roles()` puro, fuera del alcance de este fix.

### [2026-07-13] Catálogo de permisos seed no incluye `catalog.*` ni `config.team.view`
**Estado:** RESUELTO (2026-07-14)
Se agregaron `catalog.view`, `catalog.manage` (grupo nuevo "Catálogo") y `config.team.view`
(grupo "Configuración") a `PERMISSIONS` en `prisma/seed.ts`, y se sumaron a `ROLE_PERMISSIONS`
de `cajero`/`empleado` (además de `inventory.view` para cajero, que no lo tenía). `owner`/`admin`
los reciben automáticamente (mapean todo el catálogo). Seed re-corrido (upsert, no destructivo):
`GET /permissions` ahora devuelve 22 permisos en 8 grupos, verificado contra el server real.

### [2026-07-13] `AppRole` usa 'cashier'/'employee' (inglés) pero los roles seedeados son 'cajero'/'empleado' (español)
**Estado:** RESUELTO (2026-07-14)
`common/decorators/roles.decorator.ts` → `AppRole` ahora es `'owner' | 'admin' | 'cajero' |
'empleado'`, alineado con los `name` reales de `prisma/seed.ts`. Ningún código usaba los valores
en inglés (confirmado por grep antes del cambio), así que no hubo que tocar ningún `@Roles(...)`
existente — el fix es puramente el tipo, para que el compilador rechace `@Roles('cashier')` en
vez de dejarlo pasar silenciosamente como antes.

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
**Estado:** RESUELTO (2026-07-14) — parcial, a propósito (ver alcance abajo)
Se agregó `id?: string` (UUID opcional) a `ProductVariantInput`. `update()` ahora reconcilia
variantes: las que traen `id` y matchean una variante existente del producto se actualizan
(`sku`/`barcode`/`price`/`comparePrice`); las que no traen `id` se crean, resolviendo
`optionValues` posicionalmente contra las **opciones ya persistidas** del producto (mismo
criterio posicional que `create()`). Si un `id` no pertenece al producto → `400`. Si una
variante nueva no trae la cantidad exacta de `optionValues` que el producto tiene opciones →
`400`.
**Alcance deliberado, sigue sin resolver:**
- **No se borran variantes** ausentes del body — se mantuvo la protección contra
  delete-and-recreate (mismo riesgo de `orderItems`/`stockMovements` sin cascade que motivó
  esta entrada originalmente). Sacar una variante del array simplemente no la toca.
- **El árbol de opciones (`options`) sigue sin reconciliarse** — una variante nueva solo puede
  usar valores de opciones que YA existen en el producto; no se pueden agregar/editar opciones
  vía `PUT`. Sigue pendiente si el panel necesita eso.
Verificado en vivo contra un producto con 3 variantes: actualicé precio de una existente (sin
duplicarla), agregué una variante nueva con combinación de opciones inédita, y confirmé los dos
`400` (id ajeno, optionValues con cantidad incorrecta).

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

---

## Fase 1 — Auth (corrección crítica)

### [2026-07-17] Aislamiento multi-tenant en AuthGuard y login/register
**Estado:** RESUELTO (2026-07-17)
Se detectó que `AuthGuard` y `AuthService.login()` buscaban en `members` por `authUserId` sin
filtrar por `businessId` cuando el header `X-Business-Slug` estaba presente. Esto permitía que
un miembro de negocio A fuera resuelto como miembro autenticado al acceder al subdominio de
negocio B — vulnerabilidad de cross-tenant.

Cambios:
- **`auth.guard.ts`**: reescrito con branching por slug. Con slug: resuelve el business, busca
  member y luego customer filtrados por ESE `businessId`. Sin slug: busca member globalmente
  (acceso al panel, `authUserId` es `@unique`).
- **`auth.service.ts` → `login()`**: misma lógica de branching. Con slug: devuelve
  `ForbiddenException({ error: 'NO_ACCOUNT_IN_BUSINESS' })` si el usuario no es ni member ni
  customer de ese negocio. Sin slug: devuelve `ForbiddenException({ error: 'NO_BUSINESS' })`
  si no es member de ningún negocio.
- **`auth.service.ts` → `register()`**: nuevo helper `getOrCreateSupabaseUser()` que reutiliza
  usuarios de Supabase Auth existentes en vez de fallar con "email ya registrado". Permite que
  el dueño de negocio A se registre como cliente en negocio B.
- **Guards downstream** (`RolesGuard`, `PermissionsGuard`, `BusinessModeGuard`): verificados
  limpios — no hacen queries propias a la BD, solo leen de `req.user`.
- **Auditoría del codebase**: grep de `findFirst|findUnique|findMany` sobre `member`/`customer`
  — todos los demás usos filtran por `businessId` o usan IDs ya resueltos por el guard.

### [2026-07-17] `register()` verifica la contraseña implícitamente al hacer `signInWithPassword`
**Estado:** ABIERTO
Cuando un usuario de Supabase Auth ya existente (ej. dueño de negocio A) se registra como
cliente en negocio B, `getOrCreateSupabaseUser()` reutiliza su `authUserId` correctamente. Pero
al final de `register()`, se llama `signInWithPassword(email, dto.password)` para obtener un
token de sesión — y esto falla si la contraseña que el usuario puso en el formulario de registro
del negocio B no coincide con la que ya tiene en Supabase (la del negocio A). El spec original
decía "NO verificar la contraseña" en este caso. Opciones: (a) usar `admin.generateLink()` para
emitir un token sin verificar contraseña, (b) saltear el signIn y usar otro mecanismo para
devolver una sesión, (c) dejar como está y documentar que el usuario debe usar la misma
contraseña. **Pendiente de decisión del equipo.**

---

## Fase 6 — Clientes (Customers/Addresses)

### [2026-07-14] Análisis pre-implementación: 7 fallas detectadas, 4 resueltas
**Estado:** PARCIALMENTE RESUELTO (2026-07-14)
Se comparó el código contra `CONTRATO_API.md` (Fase 4), `BACKEND_IMPLEMENTACION.md` (Fase 6) y
el schema de Prisma. Estado de cada falla:
- **F1**: RESUELTO — `@Roles('owner','admin')` + `assertMemberContext()` agregados a `findAll()`
  y `findOne()` en `CustomersController`.
- **F2**: DESCARTADO — el usuario decidió no implementar `DELETE /customers/:id`. No tiene sentido
  borrar un cliente.
- **F3**: RESUELTO — agregado `sendCustomEmail(to, subject, htmlBody)` a `MailService` para envío
  libre (sin template).
- **F4**: ABIERTO — `AddressesController` sigue sin chequeo de contexto customer. Se resolverá
  al implementar la lógica de negocio del módulo (crear `assertCustomerContext()` y aplicarlo).
- **F5**: RESUELTO — `@CurrentBusiness()` y `@Query()` inyectados en todos los handlers de
  `CustomersController`.
- **F6**: NO APLICA — `MailModule` es `@Global()`, ya está disponible sin import explícito.
- **F7**: RESUELTO (decisión) — se sigue el contrato: solo `/me/addresses` (storefront, scoped al
  token). No se implementa `/customers/:id/addresses` como ruta separada; las addresses del panel
  vienen embebidas en `GET /customers/:id`.

### [2026-07-14] Módulo completo sin implementar — `CustomersService` es un stub
**Estado:** ABIERTO
`customers.controller.ts` y `addresses.controller.ts` devuelven `{"message":"not implemented"}`
en todos los handlers; `CustomersService` solo tiene un método privado que lanza
`NotImplementedException` sin usar. Pendiente: implementar `CustomersService` (CRUD con
vinculación por email `@@unique([businessId, email])`, calculados `orderCount/totalSpent/
avgTicket/lastOrderAt` desde `orders`, y `/me/addresses` scoped a customer) siguiendo el mismo
patrón usado en Fases 3-5. Ver orden sugerido en `Guia prueba manual fase 6.md`.

---

## Onboarding — RBT-291/292 (registro de negocio + rubros)

### [2026-07-18] `registerBusiness()` bloquea el email de forma GLOBAL, no por negocio — inconsistente con el modelo de aislamiento de auth
**Estado:** RESUELTO (2026-07-18) — decisión de producto explícita para V1
Auditoría del flujo de onboarding tras la migración de auth (Supabase → argon2id/JWT propio,
ver "Fase 1 — Auth" más abajo) encontró que `registerBusiness()` (y su contraparte de
verificación en vivo, `checkEmail()`) chequean si el email ya existe con
`prisma.member.findFirst({ where: { email } })` **sin `businessId`** — es decir, contra
*todos* los negocios de la plataforma, no solo el que se está creando. Esto contradice el
modelo de aislamiento que el resto de auth sí respeta (`login()` sí está scopeado por
`businessId`; el schema soporta `@@unique([businessId, email])`, un unique *compuesto*, no
global sobre `email`).

En la práctica: si `lorena@x.com` ya es member (owner/staff) de un negocio, no puede
autoservirse un **segundo** negocio propio con ese mismo email vía onboarding — recibe `409`
aunque el schema y el resto del sistema permitirían perfectamente que tuviera credenciales
independientes en cada negocio (igual que ya puede ser member de un negocio y customer de
otro con contraseñas distintas).

**Decisión (usuario, 2026-07-18):** se mantiene el comportamiento actual para V1, como regla
de producto deliberada: **un email = un negocio** en el flujo de autoservicio de onboarding
(no una limitación técnica del modelo de datos). Cambios:
- Mensaje de error actualizado de `"Ese email ya tiene una cuenta"` (ambiguo — sugería que el
  problema era la cuenta, no el negocio) a `"Este email ya tiene un negocio registrado en
  Orbita"`, para que quede claro que la restricción es "un negocio por email", no un límite
  del sistema de credenciales.
- Documentado como excepción explícita al modelo de aislamiento multi-tenant en
  `CONTRATO_API.md` (módulo Auth → "Aislamiento multi-tenant"), para que no se lea como una
  inconsistencia sin explicar la próxima vez que alguien audite este flujo.
- Test de regresión que fija este comportamiento en
  `test/onboarding.e2e-spec.ts` ("HALLAZGO: el check de email duplicado es GLOBAL...").
**Si en el futuro se quiere permitir multi-negocio por email** (ej. una persona que administra
varias tiendas independientes), el cambio es sacar el `businessId`-less `findFirst` de
`registerBusiness()`/`checkEmail()` — el schema ya lo soporta sin migración.

### [2026-07-16] `POST /onboarding/register-business` compartía servicio con el seed script — no se hizo
**Estado:** RESUELTO (2026-07-16) — decisión distinta a la prevista en la entrada de Fase 2
La entrada de Fase 2 sobre `POST /businesses` proponía extraer un `BusinessOnboardingService`
compartido con `prisma/seed.ts` para no duplicar la transacción. Al implementar RBT-291 se
mantuvo la duplicación a propósito: `prisma/` está excluido de `tsconfig.build.json` (bug ya
documentado arriba), así que código de `src/` no puede importar desde `prisma/seed.ts` sin
romper el build. `OnboardingService` (`src/onboarding/onboarding.service.ts`) duplica
`PERMISSIONS`/`ROLE_PERMISSIONS` de `prisma/seed.ts` con un comentario explícito señalando la
duplicación. **Riesgo activo**: si el catálogo de permisos cambia, hay que actualizar los dos
archivos a mano — no hay chequeo automático de que sigan sincronizados.

### [2026-07-16] `registerBusiness()` no crea `Subscription`
**Estado:** DIFERIDO — hasta que exista el módulo de Subscriptions/MercadoPago (RBT-295 o
equivalente)
El modelo `Business.subscription` es opcional en el schema. Se decidió no fabricar una
`Subscription` fantasma en el registro (requeriría inventar un plan/estado sin criterio de
negocio real). El wizard de onboarding llega hasta `plan.tsx` (mockeado) sin depender de este
registro; la activación real de suscripción queda para cuando se implemente esa fase.

### [2026-07-16] `Business.industry` se crea vacío (`''`) en el registro
**Estado:** RESUELTO (2026-07-16) — decisión tomada por diseño del flujo, no por ambigüedad
`POST /onboarding/register-business` solo recibe `ownerName/email/password/businessName` (lo
que junta `registro.tsx`). El rubro se elige un paso después, ya autenticado, en
`onboarding/rubro.tsx` vía `PUT /onboarding/business`. Se decidió crear el negocio con
`industry: ''` en vez de `null` (el campo no es nullable en el schema) y confiar en que el
wizard complete ese valor antes de publicar. **No hay validación que bloquee `publish()` si
`industry` sigue vacío** — si el usuario abandona el wizard después de crear cuenta pero antes
de elegir rubro, y de algún modo llega a publicar, el negocio queda publicado sin rubro. Falta
decidir si `BusinessesService.publish()` debería exigir `industry` no vacío.

### [2026-07-16] `Branch` no persiste lat/lng — dirección es solo texto libre
**Estado:** ABIERTO
Confirmado en el schema: `Branch.address` es `String?`, sin columnas de latitud/longitud. El
wizard de onboarding (`SetupUnificado.tsx`) pide una dirección que probablemente el frontend
resuelve con un mapa/autocomplete en algún momento — si en el futuro se necesita geolocalización
real (cálculo de envíos, mapa en storefront, etc.), va a requerir una migración para agregar
esas columnas. No bloqueante para el alcance actual de RBT-291.

### [2026-07-16] Bug de infraestructura: `$transaction` de `registerBusiness()` excedía el timeout (P2028)
**Estado:** RESUELTO (2026-07-16)
La primera versión hacía, dentro de un mismo `$transaction`, 20 `permission.upsert()`
secuenciales (catálogo global) más un loop de 4 roles con `findMany` + `createMany` cada uno —
todo contra la Postgres remota de Supabase. Excedía el timeout default de Prisma (~5s), y
fallaba con `P2028 Transaction not found` recién al llegar a `businessConfig.create()`, sin
mensaje claro en la respuesta HTTP (el `HttpExceptionFilter` global no loguea excepciones no-HTTP).
Diagnosticado agregando un `console.error` temporal en el catch y reproduciendo con un script
Node aislado. Fix: el upsert de `PERMISSIONS` y el `findMany` de permisos por rol se movieron
**fuera** de la transacción (son datos globales/idempotentes, no necesitan atomicidad con la
creación del negocio); dentro del `$transaction` solo queda la creación de business/branch/
roles/rolePermissions/member/configs, con `{ timeout: 15000 }` explícito por las dudas.
Verificado: registro completo funciona de punta a punta contra la base real.

### [2026-07-16] Subdominio temporal con sufijo aleatorio — el "real" se elige después
**Estado:** RESUELTO (2026-07-16) — decisión tomada por diseño del flujo
`registerBusiness()` no puede pedirle un subdominio al usuario todavía (recién se está creando
la cuenta), pero `Business.subdomain` es `@unique` y no nullable. Se decidió generar uno
temporal vía `generateUniqueSubdomain()`: slug del `businessName`, con reintento (hasta 20
intentos) agregando un sufijo aleatorio de 4 caracteres si hay colisión. El usuario elige el
subdominio definitivo después, ya autenticado, vía `PUT /onboarding/business` (que devuelve
`409` si el elegido ya está en uso). Verificado: registro de 3 negocios con el mismo
`businessName` generó `barberia-don-fernando`, luego (tras liberar ese slug al cambiarlo) lo
reusó, y una tercera colisión forzada generó `don-fernando-kble`.

### [2026-07-16] `PUT /onboarding/business` como endpoint separado de `PUT /business`, gateado por `isActive`
**Estado:** RESUELTO (2026-07-16)
`PUT /business` (Fase 2) ya excluye deliberadamente `subdomain`/`mode` por ser "zona peligrosa"
para un negocio en producción (ver entrada de Fase 2). En vez de reabrir esos campos ahí, se
creó `PUT /onboarding/business` (mismo controller `OnboardingController`), que solo permite
escribir `name/industry/description/subdomain/mode` **mientras `business.isActive === false`**
— tira `422` si el negocio ya fue publicado (`POST /business/publish`). Verificado: edición
exitosa con `isActive: false`, y `422` inmediatamente después de publicar el mismo negocio.

### [2026-07-16] RBT-293 — Persistencia completa del wizard de onboarding
**Estado:** RESUELTO (2026-07-16) — backend verificado por curl de punta a punta; frontend
verificado por tipo (TypeScript) y por curl simulando cada request, pero **no se pudo verificar
interactivamente en navegador** (ver entrada de infraestructura más abajo).

Se agregaron los campos que faltaban para guardar cada paso del wizard (antes solo existían
`name/industry/description/subdomain/mode`):
- **Migración `20260716191823_onboarding_wizard_fields`**: `Business.subrubros String[]`,
  `Business.teamSize String?` (informativo: solo/mini/medio/grande, sin lógica de negocio que lo
  consuma todavía), `Business.operatesPhysical/operatesOnline Boolean`, `Branch.latitude/
  longitude Decimal(9,6)?`, `BusinessConfig.acceptsCard Boolean` (el "Tarjeta" del wizard —
  decisión: campo propio, distinto de `acceptsMercadopago`, porque el checkout de MP y una
  tarjeta física en POS son conceptualmente cosas distintas).
- `UpdateOnboardingBusinessDto` extendido con `subrubros/teamSize/operatesPhysical/
  operatesOnline`; `UpdateBranchDto` con `latitude/longitude`; `UpdateBusinessConfigDto` con
  `acceptsCard`. Los servicios de `branches`/`businessConfig` ya hacían `data: dto` genérico, así
  que no hicieron falta cambios ahí. `BusinessesService.getMe()` ahora devuelve los campos nuevos
  (necesario para que el frontend pueda "retomar" el wizard leyendo el estado actual).
- **Bug encontrado durante la verificación**: el paso "Métodos de pago" del wizard no pedía
  alias de transferencia, pero `BusinessesService.updateConfig()` (regla de Fase 2, no tocada)
  exige `transferAlias` no vacío si `acceptsTransfer: true` — el primer intento de guardar
  "Transferencia" sin alias tiraba `400`. Se agregó un campo condicional "Alias o CBU" en
  `StepPagos` (SetupUnificado.tsx) que aparece solo si el usuario tilda "Transferencia", y se
  bloquea el avance del paso hasta completarlo. Verificado con y sin el fix (400 → éxito).
- **Teléfono del wizard → `BusinessConfig.whatsapp`, no un campo nuevo**: decisión — el negocio
  en Órbita usa WhatsApp como canal de contacto principal (`StorefrontConfig.showWhatsapp`,
  modo `SHOWCASE` = "solo WhatsApp"), así que el "Teléfono" que pide `StepNegocio` se guarda como
  `whatsapp`, no se creó un campo `phone` redundante.
- **Logo del wizard (`StepNegocio`) — NO se persiste todavía**: sigue siendo un preview local
  (base64 vía `FileReader`, nunca sale del navegador). `StorefrontConfig.logoUrl` espera una URL,
  no un data-URI — guardar el logo de verdad necesita un endpoint de upload a Supabase Storage
  igual al que ya existe para `POST /products/:id/images` (bucket dedicado, límite de tamaño,
  tipos permitidos). Fuera de alcance de este pase — **DIFERIDO**.
- **Tamaño de equipo (`StepEquipo`) — se guarda como dato informativo, sin validación de negocio**:
  no hay ningún límite de asientos/roles atado a `teamSize` todavía. Si en el futuro se necesita
  (ej. planes con tope de usuarios), revisar acá.
- **Rehidratación para "retomar"**: `SetupUnificado` ahora llama `GET /business` + `GET /business/
  config` al montar y precarga el estado si ya existe una sesión de onboarding guardada
  (localStorage). No se creó ninguna tabla de "progreso de wizard" nueva — como el `Business`
  real ya se crea en el registro (RBT-291) y se completa progresivamente, "retomar" es simplemente
  leer lo que ya está guardado.
- **Limpieza de negocios sin pagar — DIFERIDO, no implementado**: el usuario pidió explícitamente
  contemplar que un negocio que nunca completa el pago no debería "ocupar espacio" indefinidamente
  en la base. No se construyó ningún mecanismo de limpieza automática en este pase porque: (a) no
  existe todavía una señal real de "pagó" — `plan.tsx` sigue simulando el cobro de MercadoPago con
  un `setTimeout`, sin integración real (el módulo de Subscriptions/pagos sigue sin construir, ver
  entradas de Fase 2); (b) sin esa señal, cualquier job de limpieza automática borraría negocios
  indistintamente, sin poder distinguir "recién registrado, todavía completando el wizard" de
  "abandonado hace 3 semanas". **Recomendación para cuando exista el módulo de pagos real**: un
  job programado (`@nestjs/schedule`, no instalado todavía) que borre `Business` con
  `isActive: false` y `createdAt` más viejo que N días (a definir por el equipo) Y sin pago
  confirmado — reutilizando el mismo helper de limpieza usado manualmente en esta sesión
  (`rolePermission` → `member` → `role` → `businessConfig`/`storefrontConfig`/
  `notificationConfig` → `branch` → `business`, en ese orden por las FK).

### [2026-07-16] Bug de infraestructura: `apps/web` nunca tuvo su propio `pnpm install`
**Estado:** RESUELTO (2026-07-16)
Al intentar levantar el frontend para probar el wizard de onboarding, `next dev` fallaba con
`Next.js inferred your workspace root... couldn't find the Next.js package from the project
directory`. Causa: `apps/web/node_modules` no existía — nunca se había corrido `pnpm install`
ahí — mientras que en la raíz del repo (`Orbita-Frontend/`) hay un `node_modules`/`.next`/
`next-env.d.ts` **huérfanos** (sin `package.json` que los acompañe), aparentemente restos de una
versión anterior del proyecto antes de moverse a la estructura `apps/api` + `apps/web`. Turbopack
se confundía intentando resolver `next` desde esos restos. Fix: `pnpm install` dentro de
`apps/web` (crea su propio `node_modules`, consistente con `apps/api`). **Pendiente para el
equipo**: confirmar si los restos en la raíz del repo (`node_modules/`, `.next/`, `next-env.d.ts`,
`tsconfig.tsbuildinfo`) se pueden borrar con seguridad — no se tocaron en esta sesión por las
dudas de que fueran necesarios para algo que no se investigó a fondo.

### [2026-07-17] RBT-293 corrección de flujo — la cuenta se crea AL FINAL del onboarding, no al principio
**Estado:** RESUELTO (2026-07-17) — corrige un error de diseño de la entrega anterior (2026-07-16)
El usuario marcó que la primera versión de RBT-293 estaba mal: el botón "Crear tu espacio" del
header ya apuntaba correctamente a `/onboarding/rubro` (no a `/registro`), pero `ElegirRubro.tsx`
tenía un guard (agregado por error en la entrega anterior) que redirigía a `/registro` si no
había sesión — forzando de hecho la creación de cuenta antes de ver el wizard. El flujo correcto
es: **"Crear tu espacio" → todo el onboarding sin pedir cuenta → recién al final se crea la
cuenta con todo lo ya cargado → después, pago (diferido)**.

Cambios:
- Se sacó el guard de `ElegirRubro.tsx` y el guardado progresivo por paso contra el backend en
  `SetupUnificado.tsx` (ya no hay token durante el wizard).
- Nuevo store `apps/web/src/modules/onboarding/useOnboardingStore.ts` (zustand + `persist` en
  localStorage) acumula todo el wizard (rubro, subrubros, negocio, ubicación, pagos, equipo)
  sin autenticación. Permite retomar el wizard si se recarga la página a mitad de camino, igual
  que antes, pero del lado del cliente en vez de contra la base.
- Nuevo último paso del wizard, **"Tu cuenta"** (`StepCuenta` en `SetupUnificado.tsx`): nombre,
  email, contraseña, términos. Al enviarlo, `apps/web/src/lib/api.ts#completeOnboarding()` llama
  `POST /onboarding/register-business` y ENCADENA de inmediato, con el token recién emitido, los
  mismos tres endpoints que ya existían (`PUT /onboarding/business`, `PUT /business/config`,
  `PUT /branches/:id`) con TODO lo acumulado durante el wizard. No se tocó el backend de
  `registerBusiness()` — se decidió reusar los endpoints ya probados en vez de extender el DTO
  de registro para aceptar el payload completo (menos riesgo, mismo resultado final).
- `pages/registro.tsx` y `pages/signup.tsx` (este último era un stub vacío, `return null`, al
  que apuntaban dos botones "Crear tu espacio" de la landing sin que nadie lo hubiera notado)
  ahora son simples redirects a `/onboarding/rubro`, por compatibilidad con links viejos.
  `pages/login.tsx` ("¿No tenés cuenta?") también se actualizó para apuntar ahí en vez de a
  `/registro`.
- **"Omitir por ahora"** se sacó de la barra de navegación: ya no tiene sentido saltear el
  último paso, porque ahí es donde se crea la cuenta — no hay a dónde "saltear".

### [2026-07-17] RBT-293 — catálogo de rubros/subrubros y validación de subdominio, 100% desde la BD
**Estado:** RESUELTO (2026-07-17)
El usuario pidió explícitamente que no quedara ningún dato mock en el onboarding. Se encontraron
dos casos:
- **`ElegirRubro.tsx`** tenía un array hardcodeado de 23 rubros en 7 categorías (con íconos,
  descripciones y flags `disponible`) que nunca llamaba a `GET /onboarding/rubros` — ese endpoint
  (RBT-292) solo devolvía "tienda", completamente desconectado del selector visual real.
  **Fix**: se extendió el catálogo del backend (`onboarding.service.ts` → `RUBROS`/`CATEGORIAS`)
  para que sea la única fuente de verdad de TODO lo que se muestra (los 23 rubros, con
  `disponible: false` para los 22 que siguen siendo roadmap). Como el backend no puede serializar
  íconos de React, cada rubro manda un string (`icon: "Scissors"`) que el frontend traduce a un
  componente real vía un mapa nuevo, `apps/web/src/modules/onboarding/iconMap.ts` — si se agrega
  un rubro con un ícono nuevo, hay que sumarlo ahí también.
- **`TiendaSetup.tsx`** (`StepTipo`) tenía su propio array hardcodeado de 18 subrubros, duplicado
  del que ya vivía en el backend para RBT-292. **Fix**: ahora pide `GET /onboarding/rubros` y usa
  los `subrubros` del rubro `tienda` que devuelve la API (con su propio `icon`/`tipo`/`descripcion`).
- **Validación de subdominio**: `StepNegocio` chequeaba contra un array hardcodeado
  (`SUBDOMINIOS_OCUPADOS`). Como ahora el wizard corre sin cuenta, no había forma de reusar los
  endpoints autenticados existentes para esto — se agregó `GET /onboarding/check-subdomain?
  subdomain=x` (`@Public()`, sin auth) que valida formato y unicidad contra la base real.

### [2026-07-18] RBT-293 — logo del negocio y verificación de email en tiempo real
**Estado:** RESUELTO (2026-07-18)
Dos huecos que el usuario detectó probando el wizard:

**1. El logo elegido en "Tu negocio" nunca se guardaba** — quedaba como preview local (base64)
que se perdía en cualquier reload, y ni siquiera se mandaba al backend al pagar. Se resolvió
igual que el resto de los datos del wizard: **se sube recién si el pago se aprueba**, no antes.
- Nuevo bucket de Supabase Storage `business-logos` (público, 5MB máx.,
  `image/png|jpeg|webp|gif` — mismos límites que `product-images`).
- Nuevo endpoint `POST /business/storefront-config/logo` (multipart, `@Roles('owner','admin')`,
  mismo patrón que `POST /products/:id/images`: sube el archivo, guarda la URL pública en
  `storefrontConfig.logoUrl`). Se puso en `BusinessesController` (no en `OnboardingController`)
  a propósito — es una operación reutilizable desde el panel de ajustes más adelante, no
  específica de onboarding.
- El wizard sigue guardando el logo como data-URI en el store de zustand mientras se completa
  el onboarding, pero **excluido de `localStorage`** (`partialize`, igual que la contraseña) —
  un data-URI en base64 puede pesar varios MB y no tiene sentido inflar localStorage con eso
  en cada campo que cambia. `plan.tsx` lo convierte a `Blob` y lo sube recién dentro del
  handler de "pagar", encadenado después de `completeOnboarding()` y antes de `publishBusiness()`.
- Al probar el endpoint por primera vez apareció un error intermitente de RLS que no se pudo
  reproducir de nuevo — ver entrada en "Infraestructura / Entorno de desarrollo" más arriba.

**2. No había aviso de email duplicado hasta después de "pagar"** — el subdominio ya se
validaba en vivo mientras se escribía (`GET /onboarding/check-subdomain`, RBT-293 original),
pero el email del dueño (paso "Tu cuenta") solo se validaba al final, vía el `409` que tira
`registerBusiness()` si el email ya tiene cuenta en Supabase Auth — el usuario se enteraba
recién después de completar todo el flujo de pago.
- Nuevo endpoint `GET /onboarding/check-email?email=x` (`@Public()`), mismo patrón visual que
  el subdominio (chequeo mientras escribe, con debounce, ✓/✗ inline).
- **Decisión técnica**: `auth.users` es de Supabase Auth, no está modelada en Prisma. Se
  decidió consultarla con `$queryRaw` (`SELECT EXISTS(... FROM auth.users WHERE lower(email) =
  ...)`) sobre la misma conexión de Postgres que ya usa la app, en vez de iterar
  `admin.listUsers()` (la API de administración de Supabase Auth no expone un filtro por email
  directo). Verificado que la conexión (`DATABASE_URL`) tiene permiso de lectura sobre el
  schema `auth`.
- **Nota de seguridad** (no bloqueante, dejar constancia): esto es enumeración de usuarios por
  diseño — cualquiera puede consultar si un email ya tiene cuenta. Es el mismo patrón que ya
  usan la gran mayoría de formularios de registro (incluido el propio `registerBusiness()`, que
  ya revela lo mismo con el `409 "Ese email ya tiene una cuenta"`), así que no es una superficie
  nueva de riesgo — solo se adelantó el momento en que se informa.
- El check de email, igual que el de subdominio, **no bloquea el avance del paso** si da
  "ocupado" — es feedback visual, no una validación dura. El bloqueo real sigue siendo el `409`
  de `registerBusiness()` al momento de pagar.

### [2026-07-18] RBT-293 corrección #2 — la cuenta se crea recién cuando el pago se aprueba, no en el paso "Tu cuenta"
**Estado:** RESUELTO (2026-07-18) — corrige la entrega anterior del mismo día
El usuario aclaró el criterio real de la Fase 1: **retener todos los datos del onboarding
(incluidas las credenciales del dueño) hasta que el pago con MercadoPago se apruebe — recién
ahí se escribe a la base**. La entrega anterior creaba la cuenta un paso antes de tiempo (en
"Tu cuenta", justo antes de la pantalla de pago) — con eso, un usuario que abandona en la
pantalla de pago ya había creado una cuenta real en Supabase Auth + un `Business` en la base,
exactamente el escenario que se quería evitar.

Cambios:
- El paso "Tu cuenta" (`StepCuenta` en `SetupUnificado.tsx`) ya NO llama al backend — solo
  guarda `ownerName/ownerEmail/ownerPassword` en el wizard store y navega a `plan.tsx`.
- `pages/onboarding/plan.tsx` es ahora el único lugar que llama `completeOnboarding()` (crea
  la cuenta + guarda todo el wizard) seguido de `publishBusiness()` — y solo lo hace dentro del
  handler de "pagar", en paralelo con la demora cosmética del mock de MercadoPago. Si el pago
  nunca se confirma, no se llamó nada de esto — cero filas en la base.
- **Contraseña excluida de `localStorage`**: como el wizard entero (incluida la contraseña)
  ahora vive en el cliente por más tiempo — desde que se completa "Tu cuenta" hasta que se
  aprueba el pago, potencialmente varios minutos — se agregó `partialize` al store de zustand
  (`useOnboardingStore.ts`) para que la contraseña NUNCA se escriba a `localStorage` (queda
  solo en memoria de React). Si el usuario recarga la página entre "Tu cuenta" y "pagar", pierde
  la contraseña cargada y tiene que reescribirla — trade-off aceptado a favor de no dejar una
  contraseña en texto plano en el navegador.
- Con este cambio, la entrada de arriba ("Limpieza de negocios sin pagar — DIFERIDO") queda
  resuelta de raíz por diseño: no hace falta ningún job de limpieza porque nunca se crea el
  registro si no hay pago aprobado. Se puede marcar esa entrada como no aplicable una vez que
  el pago real de MercadoPago esté integrado (hoy sigue mockeado con `setTimeout`).

### [2026-07-17] `RegisterBusinessDto` no acepta el payload completo del wizard — decisión de no extenderlo
**Estado:** DIFERIDO — revisar si conviene atomizar en el futuro
`completeOnboarding()` (frontend) hace 1 POST + hasta 3 PUT en paralelo, todos contra endpoints
ya existentes y probados. Esto significa que si el POST de registro tiene éxito pero alguno de
los PUT posteriores falla (ej. corte de red a mitad de camino), el usuario queda con una cuenta
y un negocio creados pero con datos parcialmente guardados — no es atómico. Mitigación actual:
el negocio real ya existe (`isActive: false`), así que el usuario puede reintentar desde el
panel sin perder lo que sí se guardó. Alternativa más robusta (no implementada): extender
`RegisterBusinessDto`/`OnboardingService.registerBusiness()` para aceptar todo el payload y
hacerlo atómico dentro de la misma transacción de Prisma — se evitó en este pase para no volver
a tocar código de `registerBusiness()` ya extensivamente probado (incluye el fix del bug P2028
de timeout documentado arriba) bajo presión de tiempo. Revisar si vale la pena antes de producción.

### [2026-07-16] Bug de infraestructura: el navegador de prueba (Browser pane) no hidrata NINGUNA página del frontend
**Estado:** ABIERTO — bloqueó la verificación interactiva de RBT-293
Al intentar probar el wizard completo en el navegador integrado de esta sesión, ninguna página
—ni siquiera la landing (`/`), sin tocar en esta tarea— hidrata: los elementos del DOM no tienen
`__reactFiber$`/`__reactProps$`, por lo que ningún handler de React (`onClick`, `onChange`,
`onSubmit`) se dispara y los formularios caen al comportamiento nativo del navegador (`GET` con
query string vacía). La consola muestra un error recurrente de Next.js en modo dev:
`TypeError: Cannot read properties of undefined (reading 'components')` dentro de
`handleStaticIndicator`, disparado por un mensaje HMR (`isrManifest`) que el cliente no sabe
interpretar — plausiblemente esto aborta la hidratación antes de que corra. No se pudo confirmar
si esto es específico del navegador integrado de esta sesión (posible interferencia con el
websocket de HMR) o un bug real de esta versión de Next/Turbopack (`next@16.2.6` — un número de
versión inusualmente alto, posiblemente una build de este entorno). **Recomendación**: probar
`pnpm run dev` de `apps/web` en un Chrome real antes de asumir que el código está roto. Todo lo
construido en RBT-293 del lado del frontend se verificó por: TypeScript (`tsc --noEmit` limpio) +
simulación manual de cada request que dispara el código (vía `curl`, reproduciendo exactamente los
payloads que arma `apps/web/src/lib/api.ts`) — pero no por click real en la UI.
