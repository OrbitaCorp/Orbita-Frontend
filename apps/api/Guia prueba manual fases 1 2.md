# Guía de prueba manual — Fases 1 y 2

> Para probar con tus propias manos lo que la suite automatizada ya verificó. Usa las
> credenciales del seed (`apps/api/prisma/seed.ts`). Todos los comandos son `curl` — copiá y
> pegá en la terminal.
>
> **Complementa esta guía con** `BASE_CONOCIMIENTO_SUPABASE_AUTH.md` (o el PDF equivalente) —
> ahí está explicado en profundidad por qué el paso 1.9 puede confundir, y cómo funciona la
> relación entre Supabase Auth y la base de datos.

---

## Estado de esta guía

| Sección | Estado |
|---|---|
| 1.1 a 1.10 (Auth) | ✅ **Verificado manualmente** — todos los pasos respondieron según lo esperado |
| Parte 2 (Negocio y sucursales) | ✅ **Verificado manualmente** — todos los pasos (2.1 a 2.13) respondieron según lo esperado |

> **Nota (2026-07-13):** esta segunda corrida completa se hizo contra la base de Supabase real
> (no local). En el camino apareció un bug de infraestructura que bloqueaba **todos** los logins
> con `401`, incluso con credenciales correctas — no relacionado a esta guía en sí. Está
> documentado en `PENDIENTES.md` → "Infraestructura / Entorno de desarrollo". Una vez corregido,
> los 23 pasos de la guía pasaron sin sorpresas.

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

**Qué esperar:** `201`, con un `customer` y un `token`.

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

**Este paso costó — no por un bug, sino por una confusión conceptual importante que vale la
pena entender antes de repetirlo.** El contexto completo está en
`BASE_CONOCIMIENTO_SUPABASE_AUTH.md`; acá el resumen aplicado a este test puntual.

#### Por qué es el test más delicado de toda la guía

A diferencia de 1.7 (que genera un email nuevo cada vez), este test **depende de que exista
de antemano un customer sin cuenta** (`authUserId: null`) — porque lo que se prueba es
específicamente que el registro *vincule* esa cuenta existente en vez de duplicarla. Eso
significa que **el email que uses acá se "gasta" la primera vez que el test pasa**: una vez
que el registro tiene éxito, ese customer ya tiene cuenta, y repetir el mismo `curl` con el
mismo email va a dar `400` — no porque algo esté roto, sino porque ya no hay nada que
vincular, el usuario ya existe en Supabase Auth.

Esto llevó a una confusión real durante la prueba: se agotó el fixture original
(`sinregistrar@zapatoslorena.test`), se agregó un segundo fixture al seed
(`sinregistrar2@zapatoslorena.test`) para poder repetir la prueba, y ese también se agotó
durante la verificación automática del cambio. En ese punto, resetear la base de datos
(`pnpm prisma db seed`) **no alcanzó** para volver a dejar el escenario limpio — porque el
seed solo controla la tabla `customers` en Postgres, y el usuario de login seguía existiendo
del lado de **Supabase Auth**, que es un sistema completamente separado y no se resetea con
el seed. Hubo que ir manualmente al Dashboard de Supabase (Authentication → Users) y borrar
el usuario de ahí para que los dos lados quedaran sincronizados de nuevo.

**La lección aplicada a este test:** si alguna vez repetís este paso 1.9 y te da
`400 "already been registered"` sin haber tocado nada vos mismo, no es necesariamente un bug
— probablemente el fixture ya se usó en una corrida anterior (manual o de la suite e2e). Ver
la sección de troubleshooting de `BASE_CONOCIMIENTO_SUPABASE_AUTH.md` para diagnosticarlo
paso a paso, o usar el script `apps/api/scripts/reset-unlinked-customer.ts` para volver el
fixture a su estado "sin cuenta" sin tener que ir a mano al Dashboard.

#### El comando

El seed mantiene dos fixtures de este tipo por si uno ya está "gastado":
`sinregistrar@zapatoslorena.test` (probablemente ya vinculado de pruebas anteriores) y
`sinregistrar2@zapatoslorena.test` (fixture de respaldo). Antes de correr esto, confirmá en
Prisma Studio cuál de los dos tiene `authUserId: null` — ese es el que hay que usar.

```bash
curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Business-Slug: zapatoslorena" \
  -d '{"email":"<EMAIL_DEL_FIXTURE_LIBRE>","password":"Test1234!","firstName":"Pedro"}' | jq
```

**Qué esperar:** `201`, y el `id` del customer debe ser el que YA existía (no un registro
nuevo). Para confirmarlo, comparalo contra el `id` que tenía esa fila en Prisma Studio antes
de correr el comando — debe ser el mismo. `authUserId` pasa de `null` a un UUID real.

**Si da `400 "already been registered"`:** el fixture que elegiste ya está vinculado. Revisá
en Prisma Studio si el otro fixture tiene `authUserId: null`, o corré el script de reset
mencionado arriba sobre el que quieras reutilizar.

**Resultado real:** ✅ correcto — una vez identificado el fixture libre y sincronizados
Postgres + Supabase Auth, el registro devolvió `201` con el `id` del customer preexistente,
confirmando la vinculación (no duplicación).

---

### 1.10 Forgot password (no debe filtrar información) ✅

```bash
# Con email que existe
curl -s -o /dev/null -w "Con email real: %{http_code}\n" -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"dueno@zapatoslorena.test"}'

# Con email que NO existe
curl -s -o /dev/null -w "Con email falso: %{http_code}\n" -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"noexiste@test.com"}'
```

**Qué esperar:** los dos deben dar el mismo código (`201`) — si uno diera 404 y el otro 201,
alguien podría usar este endpoint para averiguar qué emails están registrados.

**Resultado real:** ✅ correcto — `201` en ambos casos.

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
- [x] Registro nuevo → `201`
- [x] Registro sin header → `400`
- [x] Registro con email de cliente sin cuenta → vincula, no duplica (ver contexto en 1.9)
- [x] Forgot-password con email real vs falso → mismo código en ambos

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