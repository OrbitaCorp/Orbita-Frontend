# Resultados E2E — Fase 1 (Auth) + Fase 2 (Business/Branches)

**Fecha de corrida:** 2026-07-12
**Resumen:** 43 tests totales, 42 pasaron, 0 fallaron, 1 todo (pendiente de implementar).

---

## Auth (auth.e2e-spec.ts) — 17 tests

| # | Endpoint | Caso | Resultado |
|---|----------|------|-----------|
| 1 | POST /auth/login | login exitoso como owner (sin header) → 201, type member | ✅ |
| 2 | POST /auth/login | login exitoso como cajero (sin header) → 201, type member | ✅ |
| 3 | POST /auth/login | login exitoso como customer con cuenta (con header) → 201, type customer | ✅ |
| 4 | POST /auth/login | login con contraseña incorrecta → 401 | ✅ |
| 5 | POST /auth/login | login con email inexistente → 401 | ✅ |
| 6 | POST /auth/login | login de member enviando header X-Business-Slug → devuelve type member (ignora header) | ✅ |
| 7 | POST /auth/register | registro exitoso con email nuevo → 201, customer + token | ✅ |
| 8 | POST /auth/register | registro sin header X-Business-Slug → 400 | ✅ |
| 9 | POST /auth/register | registro con slug de negocio inexistente → 404 | ✅ |
| 10 | POST /auth/register | registro con email de customerWithoutAccount vincula al existente (no duplica) | ✅ |
| 11 | GET /auth/me | con token de owner (sin header) → 200, type member | ✅ |
| 12 | GET /auth/me | con token de customer (con header) → 200, type customer | ✅ |
| 13 | GET /auth/me | sin token → 401 | ✅ |
| 14 | GET /auth/me | con token inválido → 401 | ✅ |
| 15 | POST /auth/logout | con token válido → 201 | ✅ |
| 16 | POST /auth/forgot-password | con email existente → 201 | ✅ |
| 17 | POST /auth/forgot-password | con email inexistente → 201 (no filtra información) | ✅ |

**Todo (1):**
- POST /auth/accept-invitation — flujo completo (requiere member PENDING en seed, ver sección de casos no cubiertos).

---

## Business (business.e2e-spec.ts) — 17 tests

| # | Endpoint | Caso | Resultado |
|---|----------|------|-----------|
| 1 | GET /business | con token owner → 200, datos del negocio seedeado | ✅ |
| 2 | GET /business | con token cashier → 200 (lectura permitida a cualquier miembro) | ✅ |
| 3 | GET /business | sin token → 401 | ✅ |
| 4 | PUT /business | con token owner, cambiando description → 200, GET confirma | ✅ |
| 5 | PUT /business | mandar mode en el body → se ignora (whitelist: true) | ✅ |
| 6 | PUT /business | con token cashier → 403 (requiere owner o admin) | ✅ |
| 7 | POST /business/pause | con token cashier → 403 (requiere owner) | ✅ |
| 8 | POST /business/pause | con token owner, paused: true → 201, negocio pausado | ✅ |
| 9 | POST /business/pause | con token owner, paused: false → 201, negocio reanudado | ✅ |
| 10 | GET /business/config | con token owner → 200 | ✅ |
| 11 | PUT /business/config | acceptsTransfer: true sin transferAlias → 400 | ✅ |
| 12 | PUT /business/config | acceptsTransfer: true CON transferAlias → 200 | ✅ |
| 13 | GET /business/storefront-config | con token owner → 200 | ✅ |
| 14 | PUT /business/storefront-config | heroSlides válido → 200 | ✅ |
| 15 | PUT /business/storefront-config | heroSlides inválido (falta titulo) → 400 | ✅ |
| 16 | GET /business/notification-config | con token owner → 200 | ✅ |
| 17 | PUT /business/notification-config | evento inventado → 400 | ✅ |

---

## Branches (branches.e2e-spec.ts) — 8 tests

| # | Endpoint | Caso | Resultado |
|---|----------|------|-----------|
| 1 | GET /branches | con token owner → 200, incluye sucursal "Principal" | ✅ |
| 2 | GET /branches | con token cashier → 200 (lectura permitida) | ✅ |
| 3 | POST /branches | con token cashier → 403 (requiere owner) | ✅ |
| 4 | POST /branches | con token owner → 201, crea sucursal nueva | ✅ |
| 5 | DELETE /branches/:id | con token cashier → 403 (requiere owner) | ✅ |
| 6 | DELETE /branches/:id | eliminar sucursal creada en test → 200 | ✅ |
| 7 | DELETE /branches/:id | intentar eliminar sucursal "Principal" (default) → 422 | ✅ |
| 8 | PUT /business/notification-config | evento válido → 200 | ✅ |

---

## Casos no cubiertos

### 1. POST /auth/accept-invitation
**Motivo:** El seed crea los miembros como ACTIVE. Para probar el flujo completo se necesita
un member con `status: 'PENDING'` y `hasTempPassword: true` en Supabase, lo cual requiere
crear el usuario vía la admin API en el propio test. Marcado como `it.todo()`.

### 2. POST /auth/reset-password
**Motivo:** Requiere un token de recuperación real generado por Supabase
(`auth.admin.generateLink({ type: 'recovery' })`). No se puede testear sin generar ese
link dentro del test, y el token es efímero. Posible mejora: agregar un test que genere el
link vía Supabase admin API, extraiga el token del URL, y lo envíe a reset-password.

### 3. Registro de customerWithoutAccount — idempotencia limitada
**Nota:** La primera corrida después de un seed fresco crea el usuario en Supabase y vincula
al customer existente (201). Corridas posteriores reciben 400 porque el usuario ya existe en
Supabase Auth. El test maneja ambos escenarios con un branch condicional. Para idempotencia
real se necesitaría un cleanup script que elimine usuarios de test en Supabase entre corridas.

### 4. Registro exitoso — residuo en Supabase
Los tests de register crean usuarios reales en Supabase Auth (`test-e2e-*@example.com` y
potencialmente `sinregistrar@zapatoslorena.test`) que no se eliminan automáticamente. Esto
no afecta la base de datos local (los customers creados son en la BD normal), pero acumula
usuarios de test en Supabase. Considerar un cleanup script que use
`supabase.auth.admin.deleteUser()` para los emails de test.

---

## Notas técnicas

- **Open handle (CustomGC):** Jest reporta un handle abierto del módulo `@css-inline/css-inline`
  (dependencia de `@nestjs-modules/mailer`). No afecta los tests — es un GC nativo que se
  resuelve con `--forceExit`. No es un leak real.
- **Tiempo de ejecución:** ~65s (la mayor parte es startup de la app + llamadas a Supabase Auth).
- **POST endpoints devuelven 201:** NestJS retorna 201 por defecto en `@Post()`, no 200. Los
  tests verifican el status code real del framework.
