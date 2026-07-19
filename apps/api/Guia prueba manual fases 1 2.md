# Guía de prueba manual — Fases 1 y 2

> Para probar con tus propias manos lo que la suite automatizada ya verificó. Usa las
> credenciales del seed (`apps/api/prisma/seed.ts`). Todos los comandos son `curl` — copiá y
> pegá en la terminal.

---

## Estado de esta guía

| Sección | Estado |
|---|---|
| 1.1 a 1.12 (Auth) | ✅ **Verificado manualmente** (2026-07-18, tras migración a auth propio) |
| Parte 2 (Negocio y sucursales) | ✅ **Verificado manualmente** — todos los pasos (2.1 a 2.13) respondieron según lo esperado |

> **Nota (2026-07-18):** el backend migró de Supabase Auth a un sistema de autenticación propio
> por negocio (argon2id + JWT HS256 + refresh tokens, ver `PENDIENTES.md` → "Fase 1 — Auth").
> Esta guía se actualizó en consecuencia: ya no hay que tocar el Dashboard de Supabase para nada
> de lo que pasa en la Parte 1, y `pnpm prisma db seed` deja el entorno completamente limpio
> (incluidos los fixtures "sin cuenta") en cada corrida.

---

## Antes de empezar

1. Asegurate de tener el seed corrido:
   ```bash
   cd apps/api
   pnpm prisma db seed
   ```

2. Levantá el servidor:
   ```bash
   pnpm dev
   ```

3. En otra terminal, definí estas variables para no repetir la URL en cada comando:
   ```bash
   BASE="http://localhost:3000/api/v1"
   SLUG="zapatoslorena"
   ```

4. **Tip:** si preferís una interfaz visual en vez de terminal, importá estos mismos
   endpoints en Postman o Insomnia — pero para una primera pasada, `curl` alcanza y es más
   rápido de copiar/pegar.

---

## Parte 1 — Auth

### 1.1 Login como owner (dueño del negocio) ✅

```bash
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dueno@zapatoslorena.test","password":"Test1234!"}' | jq
```

**Qué esperar:** `200`, body con `"type": "member"`, tu rol (`owner`), y la lista de
permisos. Copiá el `token` de la respuesta:

```bash
TOKEN_OWNER="<pegá el token acá>"
```

**Resultado real:** ✅ correcto.

### 1.2 Login como cajero ✅

```bash
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cajero@zapatoslorena.test","password":"Test1234!"}' | jq
```

**Qué esperar:** `200`, `"type": "member"`, rol `cajero`, menos permisos que el owner.

```bash
TOKEN_CAJERO="<pegá el token acá>"
```

**Resultado real:** ✅ correcto.

### 1.3 Login como cliente (storefront) ✅

```bash
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Business-Slug: zapatoslorena" \
  -d '{"email":"cliente@zapatoslorena.test","password":"Test1234!"}' | jq
```

**Qué esperar:** `200`, `"type": "customer"`.

```bash
TOKEN_CLIENTE="<pegá el token acá>"
```

**Resultado real:** ✅ correcto.

### 1.4 Login con contraseña incorrecta ✅

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dueno@zapatoslorena.test","password":"incorrecta"}'
```

**Qué esperar:** `401`.

**Resultado real:** ✅ correcto.

### 1.5 `/auth/me` como owner ✅

```bash
curl -s http://localhost:3000/api/v1/auth/me -H "Authorization: Bearer $TOKEN_OWNER" | jq
```

**Qué esperar:** los mismos datos que el login (`type: member`, rol owner).

**Resultado real:** ✅ correcto.

### 1.6 El caso del bug corregido — probalo vos mismo ✅

Este es el test más importante para confirmar que el fix de seguridad quedó bien. Usá el
token del **owner**, pero agregando el header de storefront (que en teoría "fuerza" contexto
de cliente):

```bash
curl -s http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "X-Business-Slug: zapatoslorena" | jq
```

**Qué esperar:** `"type": "member"` — el header NO debe cambiar el resultado. Si esto
devolviera `"type": "customer"`, el bug de seguridad habría vuelto.

**Resultado real:** ✅ correcto — sigue siendo `member`, el header se ignora tal como se
diseñó tras la corrección del bug.

### 1.7 Registro de cliente nuevo ✅

```bash
curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Business-Slug: zapatoslorena" \
  -d '{"email":"nuevo-'$(date +%s)'@test.com","password":"Test1234!","firstName":"Test"}' | jq
```

**Qué esperar:** `201`, con `{"message": "..."}`. **No devuelve token** — el registro ya no
loguea automáticamente. Para obtener un token hay que loguearse después con
`POST /auth/login` (ver 1.3).

**Resultado real:** ✅ correcto. Nota: usar el timestamp (`$(date +%s)`) en el email es lo
que permite repetir este test cuantas veces quieras sin chocar con un email ya usado.

### 1.8 Registro sin header (debe fallar) ✅

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"otro@test.com","password":"Test1234!","firstName":"Test"}'
```

**Qué esperar:** `400`.

**Resultado real:** ✅ correcto.

### 1.9 La vinculación POS → storefront (el caso más importante de auth) ✅

El seed crea `sinregistrar@zapatoslorena.test` como customer **sin cuenta**
(`passwordHash: null`) — simula un cliente cargado desde el POS que todavía no se registró en
el storefront. Este test confirma que registrarse con ese mismo email **vincula** la cuenta
existente en vez de duplicar la fila.

A diferencia de la versión con Supabase Auth, esto ya **no se "gasta"**: cada corrida de
`pnpm prisma db seed` resetea `passwordHash` a `null` en este fixture, así que el test es
repetible sin scripts extra ni pasos manuales en ningún dashboard.

```bash
curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Business-Slug: zapatoslorena" \
  -d '{"email":"sinregistrar@zapatoslorena.test","password":"Test1234!","firstName":"Pedro"}' | jq
```

**Qué esperar:** `201`, `{"message": "..."}`. Para confirmar que vinculó (no duplicó), contá
las filas con ese email:

```bash
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Business-Slug: zapatoslorena" \
  -d '{"email":"sinregistrar@zapatoslorena.test","password":"Test1234!"}' | jq '.customer.id'
```

Ese `id` tiene que ser el mismo que tenía la fila en Prisma Studio **antes** de registrar
(abrí Prisma Studio — `pnpm prisma studio` — y mirá la tabla `customers` antes y después si
querés verlo con tus propios ojos).

**Si da `400 "Ya tenés cuenta en esta tienda"`:** ya corriste este paso desde el último seed.
Corré `pnpm prisma db seed` de nuevo para resetear el fixture y repetir la prueba.

**Resultado real:** ✅ correcto — `201`, y el `id` devuelto en el login posterior coincide con
el customer preexistente (vinculación, no duplicación).

---

### 1.10 Forgot password (no debe filtrar información) ✅

Ahora requiere el header `X-Business-Slug` — la recuperación es siempre por negocio, ya que
cada tienda tiene sus propias credenciales.

```bash
# Con email que existe
curl -s -o /dev/null -w "Con email real: %{http_code}\n" -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -H "X-Business-Slug: zapatoslorena" \
  -d '{"email":"dueno@zapatoslorena.test"}'

# Con email que NO existe
curl -s -o /dev/null -w "Con email falso: %{http_code}\n" -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -H "X-Business-Slug: zapatoslorena" \
  -d '{"email":"noexiste@test.com"}'

# Sin header X-Business-Slug (debe fallar)
curl -s -o /dev/null -w "Sin slug: %{http_code}\n" -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"dueno@zapatoslorena.test"}'
```

**Qué esperar:** los dos primeros deben dar el mismo código (`201`) — si uno diera 404 y el
otro 201, alguien podría usar este endpoint para averiguar qué emails están registrados. El
tercero (sin slug) debe dar `400`.

**Resultado real:** ✅ correcto — `201` en los dos primeros casos, `400` sin el header.

---

### 1.11 Refrescar el token ✅

```bash
LOGIN_RES=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dueno@zapatoslorena.test","password":"Test1234!"}')

REFRESH_TOKEN=$(echo $LOGIN_RES | jq -r '.refreshToken')

curl -s -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"'$REFRESH_TOKEN'"}' | jq
```

**Qué esperar:** `201`, con un `token` y `refreshToken` **nuevos** (distintos a los
originales — el refresh token viejo queda revocado). Probá reusar el `REFRESH_TOKEN` original
después de este paso: debe dar `401` (rotación de un solo uso).

**Resultado real:** ✅ correcto.

### 1.12 Logout ✅

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"'$REFRESH_TOKEN'"}'
```

**Qué esperar:** `201`. No requiere `Authorization` header — es un endpoint público que opera
sobre el refresh token del body. Probar refrescar con ese mismo `refreshToken` después de este
paso debe dar `401` (quedó revocado).

**Resultado real:** ✅ correcto.

---

## Parte 2 — Negocio y sucursales ✅

### 2.1 Ver los datos del negocio ✅

```bash
curl -s http://localhost:3000/api/v1/business -H "Authorization: Bearer $TOKEN_OWNER" | jq
```

**Qué esperar:** `200`, datos de "Zapatos Lorena".

**Resultado real:** ✅ correcto.

### 2.2 Editar el negocio ✅

```bash
curl -s -X PUT http://localhost:3000/api/v1/business \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" \
  -d '{"description":"La mejor tienda de zapatos de Iguazú"}' | jq
```

**Qué esperar:** `200`. Confirmá con un GET posterior que el cambio quedó.

**Resultado real:** ✅ correcto — `200`, el cambio quedó confirmado en un GET posterior.

### 2.3 Intentar pausar la tienda como cajero (debe fallar) ✅

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/v1/business/pause \
  -H "Authorization: Bearer $TOKEN_CAJERO" \
  -H "Content-Type: application/json" \
  -d '{"paused": true}'
```

**Qué esperar:** `403`.

**Resultado real:** ✅ correcto.

### 2.4 Pausar la tienda como owner ✅

```bash
curl -s -X POST http://localhost:3000/api/v1/business/pause \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" \
  -d '{"paused": true}' | jq

# Confirmar
curl -s http://localhost:3000/api/v1/business -H "Authorization: Bearer $TOKEN_OWNER" | jq '.isPaused'
```

**Qué esperar:** `true`. Ahora reactivala para no dejarla pausada:

```bash
curl -s -X POST http://localhost:3000/api/v1/business/pause \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" \
  -d '{"paused": false}' | jq
```

**Resultado real:** ✅ correcto — `isPaused` pasó a `true` y se revirtió a `false` sin dejar la
tienda pausada.

### 2.5 Configurar transferencias sin alias (debe fallar) ✅

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X PUT http://localhost:3000/api/v1/business/config \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" \
  -d '{"acceptsTransfer": true, "transferAlias": ""}'
```

**Qué esperar:** `400`.

**Resultado real:** ✅ correcto.

### 2.6 Configurar transferencias con alias (debe funcionar) ✅

```bash
curl -s -X PUT http://localhost:3000/api/v1/business/config \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" \
  -d '{"acceptsTransfer": true, "transferAlias": "zapatoslorena.mp"}' | jq
```

**Qué esperar:** `200`.

**Resultado real:** ✅ correcto.

### 2.7 Apariencia con un slide inválido (debe fallar con mensaje claro) ✅

```bash
curl -s -X PUT http://localhost:3000/api/v1/business/storefront-config \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" \
  -d '{"heroSlides": [{"subtitulo": "sin titulo"}]}' | jq
```

**Qué esperar:** `400`, con un mensaje que mencione específicamente el campo `titulo`
faltante.

**Resultado real:** ✅ correcto — `400` con `"heroSlides.0.titulo must be a string"` (junto con
`id`, `img` y `cta`, también requeridos en el DTO).

### 2.8 Notificaciones con evento inventado (debe fallar) ✅

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X PUT http://localhost:3000/api/v1/business/notification-config \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" \
  -d '{"matrix": {"evento_que_no_existe": {"panel": true}}}'
```

**Qué esperar:** `400`.

**Resultado real:** ✅ correcto.

### 2.9 Sucursales — ver la lista ✅

```bash
curl -s http://localhost:3000/api/v1/branches -H "Authorization: Bearer $TOKEN_OWNER" | jq
```

**Qué esperar:** `200`, incluye la sucursal "Principal".

**Resultado real:** ✅ correcto.

### 2.10 Crear sucursal como cajero (debe fallar) ✅

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/v1/branches \
  -H "Authorization: Bearer $TOKEN_CAJERO" \
  -H "Content-Type: application/json" \
  -d '{"name": "Sucursal Centro"}'
```

**Qué esperar:** `403`.

**Resultado real:** ✅ correcto.

### 2.11 Crear sucursal como owner ✅

```bash
curl -s -X POST http://localhost:3000/api/v1/branches \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" \
  -d '{"name": "Sucursal Centro"}' | jq
```

**Qué esperar:** `201`. Copiá el `id` de la sucursal creada:

```bash
BRANCH_ID="<pegá el id acá>"
```

**Resultado real:** ✅ correcto — `201`.

### 2.12 Intentar borrar la sucursal "Principal" (debe fallar) ✅

Primero conseguí el `id` de la sucursal Principal desde el resultado de 2.9, y:

```bash
curl -s -X DELETE http://localhost:3000/api/v1/branches/<ID_DE_PRINCIPAL> \
  -H "Authorization: Bearer $TOKEN_OWNER" | jq
```

**Qué esperar:** `422`, con mensaje explicando que no se puede eliminar la sucursal default.

**Resultado real:** ✅ correcto — `422` con `"No se puede eliminar la sucursal principal"`.

### 2.13 Borrar la sucursal de prueba que creaste ✅

```bash
curl -s -X DELETE http://localhost:3000/api/v1/branches/$BRANCH_ID \
  -H "Authorization: Bearer $TOKEN_OWNER" | jq
```

**Qué esperar:** `200`. Esto limpia el dato de prueba para no dejar basura.

**Resultado real:** ✅ correcto — `{"ok":true}`, `200`.

---

## Resumen — checklist para tildar mientras probás

**Auth:**
- [x] Login owner → `type: member`
- [x] Login cajero → `type: member`, menos permisos
- [x] Login cliente → `type: customer`
- [x] Login con contraseña mala → `401`
- [x] `/auth/me` normal → coincide con login
- [x] **`/auth/me` con token de owner + header de storefront → sigue siendo `member`** (el
      test del bug corregido)
- [x] Registro nuevo → `201`, `{message}` sin token
- [x] Registro sin header → `400`
- [x] Registro con email de cliente sin cuenta → vincula, no duplica (ver contexto en 1.9)
- [x] Forgot-password con email real vs falso (con slug) → mismo código en ambos
- [x] Forgot-password sin `X-Business-Slug` → `400`
- [x] Refresh token → emite token+refreshToken nuevos, revoca el viejo (uso único)
- [x] Logout → revoca el refresh token, no requiere `Authorization`

**Negocio:**
- [x] `GET /business` → datos correctos
- [x] `PUT /business` → cambio aplicado
- [x] Pausar como cajero → `403`
- [x] Pausar como owner → funciona, y lo revertiste después
- [x] Transferencia sin alias → `400`
- [x] Transferencia con alias → `200`
- [x] Slide inválido → `400` con mensaje claro
- [x] Evento de notificación inventado → `400`
- [x] `GET /branches` → incluye Principal
- [x] Crear sucursal como cajero → `403`
- [x] Crear sucursal como owner → `201`
- [x] Borrar Principal → `422`
- [x] Borrar la sucursal de prueba → `200` (limpieza)

Si todos estos dan el resultado esperado, las Fases 1 y 2 están funcionando correctamente
de punta a punta — exactamente lo mismo que confirma la suite automática, pero visto con
tus propios ojos.