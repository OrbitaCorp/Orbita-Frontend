# Pendientes — apps/api

Registro vivo de decisiones sin especificación clara, conflictos detectados, funcionalidad
a medio construir, deuda técnica y preguntas abiertas para el equipo. Ver convención completa
en `apps/api/CLAUDE.md`.

No es una bitácora de lo que ya quedó bien implementado y verificado — eso vive en el resumen
de cada tarea, no acá.

---

## Seed / Fixtures

### [2026-07-12] GUIA_PRUEBA_MANUAL_FASES_1_2.md no existe en apps/api
**Estado:** ABIERTO
Se pidió actualizar la sección 1.9 de `GUIA_PRUEBA_MANUAL_FASES_1_2.md` para reflejar el nuevo
fixture `sinregistrar2@zapatoslorena.test` (agregado en `prisma/seed.ts` como segundo customer
sin cuenta, reutilizable, porque `sinregistrar@` ya quedó vinculado a una cuenta real de
Supabase en pruebas anteriores). El archivo no existe en ningún lugar de este repo (búsqueda
por nombre y por contenido `sinregistrar` no lo encontró) — probablemente vive fuera del
backend (otro repo, Drive, Notion, etc.). Si se encuentra o crea, agregar ahí la nota sobre
por qué se usa `sinregistrar2@` en vez de `sinregistrar@`.

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
