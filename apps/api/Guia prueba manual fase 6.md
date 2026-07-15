# Guía de prueba manual — Fase 6 (Clientes y Direcciones)

> **Prerrequisito:** haber ejecutado con éxito las guías de Fases 1–5 (Auth, Negocio, Equipo,
> Catálogo, Inventario). Usa las mismas variables (`BASE`, `TOKEN_OWNER`, `TOKEN_CAJERO`,
> `TOKEN_CLIENTE`) — repetí el login si el token expiró (duran ~1 hora).

---

## Análisis previo — fallas detectadas comparando con el contrato

Antes de implementar, se identificaron las siguientes discrepancias entre el estado actual del
código, `CONTRATO_API.md` (Fase 4 — Clientes) y `BACKEND_IMPLEMENTACION.md` (Fase 6):

| # | Falla | Fuente | Impacto |
|---|-------|--------|---------|
| F1 | `GET /customers` y `GET /customers/:id` no tienen `@Roles()` ni `assertMemberContext()` | Controller | Un token de **customer** (storefront) puede acceder al listado de todos los clientes del negocio — misma clase de agujero que se encontró y corrigió en Businesses/Branches (Fase 2). |
| F2 | `DELETE /customers/:id` (soft-delete) está en `BACKEND_IMPLEMENTACION.md` §6.1 pero **no existe** ni en el controller ni en el contrato | Controller + Contrato | El schema tiene `deletedAt` en `customers`, pero no hay ruta para usarlo. Decisión necesaria: ¿se implementa aunque el contrato no lo liste, o se difiere? |
| F3 | `MailService` no tiene un método genérico de envío libre (solo templates fijos) | `mail.service.ts` | `POST /customers/email` necesita enviar un subject/body arbitrario definido por el usuario, no un template prearmado. Hay que agregar un método (ej. `sendCustomEmail()`) o usar `mailerService.sendMail()` directo. |
| F4 | `AddressesController` no tiene ningún guard, ni `@Roles()` ni chequeo de contexto customer | Controller | Un token de **member** puede operar sobre `/me/addresses` sin que exista un customer asociado — comportamiento indefinido. Falta un `assertCustomerContext()` equivalente al `assertMemberContext()` de Businesses. |
| F5 | El controller de Customers no inyecta `@CurrentBusiness()` / `@CurrentUser()` ni `@Query()` en ningún handler | Controller | Los handlers no pueden acceder al `businessId`, ni a query params (`search`, `page`, `limit`). Comparar con `InventoryController` que sí los usa. |
| F6 | `CustomersModule` no importa `MailModule` — si `POST /customers/email` necesita `MailService`, falta el import | Module | Inyección de dependencia va a fallar en runtime. |
| F7 | `BACKEND_IMPLEMENTACION.md` §6.2 lista `GET/POST/PUT/DELETE /customers/:id/addresses` pero el contrato y el controller usan `/me/addresses` | Contrato vs. Implementación | Son rutas distintas con semántica distinta: `/me/addresses` es storefront (scoped al token del customer), `/customers/:id/addresses` sería panel (cualquier customer, scoped por param). El contrato solo documenta `/me/addresses`; las addresses en panel vienen embebidas en `GET /customers/:id`. |

---

## Antes de empezar

### Variables de entorno

```bash
BASE="http://localhost:3000/api/v1"
SLUG="zapatoslorena"
```

### Obtener tokens

Login como **owner** (panel):
```bash
TOKEN_OWNER=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dueno@zapatoslorena.test","password":"Test1234!"}' | jq -r '.token')
echo "TOKEN_OWNER=$TOKEN_OWNER"
```

Login como **cajero** (panel, rol restringido):
```bash
TOKEN_CAJERO=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cajero@zapatoslorena.test","password":"Test1234!"}' | jq -r '.token')
echo "TOKEN_CAJERO=$TOKEN_CAJERO"
```

Login como **cliente** (storefront):
```bash
TOKEN_CLIENTE=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Business-Slug: $SLUG" \
  -d '{"email":"cliente@zapatoslorena.test","password":"Test1234!"}' | jq -r '.token')
echo "TOKEN_CLIENTE=$TOKEN_CLIENTE"
```

> Si algún token queda vacío o dice `null`, revisá que el seed corrió correctamente y que el
> servidor está levantado (`pnpm run dev` desde `apps/api/`).

---

## Customers (endpoints de panel)

### 6.1 Listar clientes — `GET /customers`

**Contrato**: permiso `customers.view`, paginado.

```bash
curl -s "$BASE/customers?search=pedro&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN_OWNER" | jq
```

**Request esperado (query params)**:

| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `search` | string | No | Busca en `firstName`, `lastName`, `email`, `phone` |
| `page` | number | No (default 1) | Página actual |
| `limit` | number | No (default 20) | Items por página |

**Response esperada (200)**:
```jsonc
{
  "data": [
    {
      "id": "uuid",
      "firstName": "Pedro",
      "lastName": "Martínez",
      "email": "sinregistrar@zapatoslorena.test",
      "phone": "+5493751123456",
      "dni": null,
      "hasAccount": true,        // authUserId != null
      "orderCount": 0,           // COUNT(orders) donde customerId = este customer
      "totalSpent": 0,           // SUM(orders.total) con status COMPLETED/DELIVERED
      "avgTicket": 0,            // totalSpent / orderCount (0 si no hay pedidos)
      "lastOrderAt": null,       // MAX(orders.createdAt)
      "createdAt": "2026-07-13T01:58:04.081Z"
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 10
}
```

**Campos que NO deben aparecer** (diferidos en V1): `segment`, `tags`.

**Verificaciones de autorización**:

```bash
# Con token de customer (storefront) — debe dar 403 (assertMemberContext)
curl -s -o /dev/null -w "%{http_code}" "$BASE/customers" \
  -H "Authorization: Bearer $TOKEN_CLIENTE"
# Esperado: 403

# Sin token — debe dar 401
curl -s -o /dev/null -w "%{http_code}" "$BASE/customers"
# Esperado: 401
```

---

### 6.2 Detalle de cliente — `GET /customers/:id`

**Contrato**: permiso `customers.view`.

```bash
# Primero obtener un ID real del listado:
CUSTOMER_ID=$(curl -s "$BASE/customers" \
  -H "Authorization: Bearer $TOKEN_OWNER" | jq -r '.data[0].id')

curl -s "$BASE/customers/$CUSTOMER_ID" \
  -H "Authorization: Bearer $TOKEN_OWNER" | jq
```

**Response esperada (200)**:
```jsonc
{
  "id": "uuid",
  "firstName": "Pedro",
  "lastName": "Martínez",
  "email": "sinregistrar@zapatoslorena.test",
  "phone": "+5493751123456",
  "dni": null,
  "hasAccount": true,
  "orderCount": 0,
  "totalSpent": 0,
  "avgTicket": 0,
  "lastOrderAt": null,
  "createdAt": "2026-07-13T...",
  "orders": [],              // OrderSummary[] — lista de pedidos del cliente
  "addresses": []             // Address[] — direcciones del cliente
}
```

**Qué incluye `orders` (cuando haya pedidos)**:
```jsonc
{
  "id": "uuid",
  "orderNumber": 1,
  "channel": "POS",
  "status": "COMPLETED",
  "total": 15000,
  "createdAt": "2026-07-10T..."
}
```

**Campos que NO deben aparecer**: `notas` (diferido en V1, no hay tabla ni endpoint).

**Errores esperados**:
```bash
# ID inexistente → 404
curl -s -o /dev/null -w "%{http_code}" "$BASE/customers/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer $TOKEN_OWNER"
# Esperado: 404

# ID con formato inválido → 400
curl -s -o /dev/null -w "%{http_code}" "$BASE/customers/no-es-uuid" \
  -H "Authorization: Bearer $TOKEN_OWNER"
# Esperado: 400
```

---

### 6.3 Crear cliente — `POST /customers`

**Contrato**: permiso `customers.manage`. El cliente se crea con `authUserId: null` (POS).

```bash
curl -s -X POST "$BASE/customers" \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Roberto",
    "lastName": "Gómez",
    "email": "roberto@test.com",
    "phone": "3751000000"
  }' | jq
```

**Request body**:

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `firstName` | string | **Sí** | No vacío |
| `lastName` | string | No | — |
| `email` | string | No | Formato email válido (`@IsEmail()`) |
| `phone` | string | No | — |
| `dni` | string | No | — |

**Response esperada (201)**:
```jsonc
{
  "id": "uuid-generado",
  "businessId": "uuid-del-negocio",
  "authUserId": null,           // creado desde POS, sin cuenta
  "firstName": "Roberto",
  "lastName": "Gómez",
  "email": "roberto@test.com",
  "phone": "3751000000",
  "dni": null,
  "createdAt": "2026-07-14T...",
  "updatedAt": "2026-07-14T..."
}
```

#### 6.3.1 Vinculación POS↔storefront (el caso más importante)

Si se crea un cliente con un `email` que **ya existe** en el negocio, el backend **no debe
duplicar** — debe devolver/actualizar el registro existente. Este es el constraint
`@@unique([businessId, email])` del schema.

```bash
# Primer POST — crea el cliente
curl -s -X POST "$BASE/customers" \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Roberto","email":"roberto@test.com"}' | jq '.id'

# Segundo POST con mismo email — NO debe crear un segundo registro
curl -s -X POST "$BASE/customers" \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Roberto V2","email":"roberto@test.com"}' | jq '.id'

# Verificar que no se duplicó
curl -s "$BASE/customers?search=roberto" \
  -H "Authorization: Bearer $TOKEN_OWNER" | jq '.total'
# Esperado: 1 (no 2)
```

**Decisión de implementación**: el segundo POST puede:
- (a) Devolver el existente sin modificar (upsert sin cambios) — `200`
- (b) Actualizar `firstName` a "Roberto V2" y devolver — `200`

El contrato dice "devuelve/actualiza", lo que sugiere (b). El equipo debería confirmar qué
comportamiento prefiere. En ambos casos: `total: 1`, nunca duplicar.

#### 6.3.2 Validaciones de body

```bash
# Sin firstName (requerido) → 400
curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/customers" \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'
# Esperado: 400 (ValidationPipe rechaza por @IsString() en firstName)

# Email inválido → 400
curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/customers" \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","email":"no-es-email"}'
# Esperado: 400
```

---

### 6.4 Crear cliente como cajero — debe dar `403`

```bash
curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/customers" \
  -H "Authorization: Bearer $TOKEN_CAJERO" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test"}'
# Esperado: 403, "Rol requerido: owner o admin. Tu rol: cajero"
```

> **Ya verificable hoy** — `@Roles('owner','admin')` corre antes del handler. Funciona
> correctamente con el stub actual.

---

### 6.5 Editar cliente — `PUT /customers/:id`

**Contrato**: permiso `customers.manage`.

```bash
curl -s -X PUT "$BASE/customers/$CUSTOMER_ID" \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Roberto Editado","phone":"3751999999"}' | jq
```

**Request body**: mismo DTO que create (`UpsertCustomerDto`).

**Response esperada (200)**: el customer actualizado con los nuevos valores.

**Errores esperados**:
```bash
# ID inexistente → 404
curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/customers/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test"}'
# Esperado: 404

# Cambiar email a uno que ya existe en el negocio → 409 (unique constraint)
curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/customers/$CUSTOMER_ID" \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","email":"cliente@zapatoslorena.test"}'
# Esperado: 409 (o 422, según cómo se maneje el P2002 de Prisma)
```

---

### 6.6 Eliminar cliente (soft-delete) — `DELETE /customers/:id`

> **Nota:** esta ruta está en `BACKEND_IMPLEMENTACION.md` §6.1 pero **NO en `CONTRATO_API.md`**.
> El schema soporta soft-delete (`deletedAt` en `customers`). Se implementa porque el checklist
> de implementación lo pide y el modelo lo permite.

```bash
curl -s -X DELETE "$BASE/customers/$CUSTOMER_ID" \
  -H "Authorization: Bearer $TOKEN_OWNER" -w "\n→ %{http_code}\n"
# Esperado: 200, { "ok": true }

# Verificar que no aparece más en el listado
curl -s "$BASE/customers?search=roberto" \
  -H "Authorization: Bearer $TOKEN_OWNER" | jq '.total'
# Esperado: 0 (soft-deleted, filtrado por deletedAt IS NULL)

# GET del mismo ID → 404 (tratado como eliminado)
curl -s -o /dev/null -w "%{http_code}" "$BASE/customers/$CUSTOMER_ID" \
  -H "Authorization: Bearer $TOKEN_OWNER"
# Esperado: 404
```

---

### 6.7 Email a clientes — `POST /customers/email`

**Contrato**: permiso `customers.manage`. Acción de envío, no se persiste.

```bash
curl -s -X POST "$BASE/customers/email" \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" \
  -d '{
    "customerIds": ["'"$CUSTOMER_ID"'"],
    "subject": "Promo de invierno",
    "body": "<p>Hola, tenemos descuentos especiales para vos.</p>"
  }' | jq
```

**Request body**:

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `customerIds` | string[] | **Sí** | Array de UUIDs v4 |
| `subject` | string | **Sí** | No vacío |
| `body` | string | **Sí** | No vacío (puede ser HTML) |

**Response esperada (200)**:
```jsonc
{ "sent": 1 }
```

**Comportamiento clave**:
- Solo envía a clientes que **tienen email** — los que no, se ignoran (no cuentan en `sent`).
- **No se persiste** — no hay tabla de historial de emails en V1.
- Si `MAIL_HOST` no está configurado, `MailService` loguea en consola en vez de enviar (stub
  mode) — la response sigue siendo `{ "sent": N }` contando los que se habrían enviado.

**Errores esperados**:
```bash
# Array vacío → 400
curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/customers/email" \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" \
  -d '{"customerIds":[],"subject":"Test","body":"Test"}'
# Esperado: 400 (array vacío no tiene sentido)

# UUID inválido en el array → 400
curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/customers/email" \
  -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" \
  -d '{"customerIds":["no-uuid"],"subject":"Test","body":"Test"}'
# Esperado: 400 (@IsUUID en cada elemento)
```

---

## Addresses — `GET/POST/PUT/DELETE /me/addresses` (storefront, cuenta propia)

> Estos endpoints son del **storefront** — el customer gestiona sus propias direcciones.
> Se usan con `TOKEN_CLIENTE`, **no** con `TOKEN_OWNER`.
>
> Las direcciones en el **panel** se leen embebidas en `GET /customers/:id` (sección 6.2) —
> no hay ruta separada `/customers/:id/addresses` en el contrato.

### 6.8 Listar direcciones propias — `GET /me/addresses`

```bash
curl -s "$BASE/me/addresses" \
  -H "Authorization: Bearer $TOKEN_CLIENTE" | jq
```

**Response esperada (200)**:
```jsonc
[
  {
    "id": "uuid",
    "alias": "Casa",
    "street": "Av. Córdoba 123",
    "floor": null,
    "city": "Puerto Iguazú",
    "zip": "3370",
    "isDefault": true
  }
]
```

> Array vacío `[]` si el cliente no tiene direcciones cargadas.

**Verificación de contexto** (CRÍTICA — falla F4):
```bash
# Con token de member (owner) — DEBE dar 403 una vez implementado
curl -s -o /dev/null -w "%{http_code}" "$BASE/me/addresses" \
  -H "Authorization: Bearer $TOKEN_OWNER"
# Esperado: 403 (assertCustomerContext — un member no tiene customer asociado)
# ⚠️ Si da 200, falta el chequeo de contexto y es un bug de autorización.
```

---

### 6.9 Crear dirección — `POST /me/addresses`

```bash
curl -s -X POST "$BASE/me/addresses" \
  -H "Authorization: Bearer $TOKEN_CLIENTE" \
  -H "Content-Type: application/json" \
  -d '{
    "alias": "Casa",
    "street": "Av. Córdoba 123",
    "floor": "2B",
    "city": "Puerto Iguazú",
    "zip": "3370",
    "isDefault": true
  }' | jq
```

**Request body**:

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `alias` | string | No | Nombre amigable ("Casa", "Trabajo") |
| `street` | string | **Sí** | Dirección completa |
| `floor` | string | No | Piso/depto |
| `city` | string | **Sí** | Ciudad |
| `zip` | string | No | Código postal |
| `isDefault` | boolean | No (default false) | Si true, la anterior default deja de serlo |

**Response esperada (201)**:
```jsonc
{
  "id": "uuid-generado",
  "alias": "Casa",
  "street": "Av. Córdoba 123",
  "floor": "2B",
  "city": "Puerto Iguazú",
  "zip": "3370",
  "isDefault": true
}
```

**Comportamiento de `isDefault`**: si se crea con `isDefault: true` y ya existe otra dirección
default, la anterior debe pasar a `isDefault: false` (solo puede haber una default por customer).

**Errores esperados**:
```bash
# Sin street (requerido) → 400
curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/me/addresses" \
  -H "Authorization: Bearer $TOKEN_CLIENTE" \
  -H "Content-Type: application/json" \
  -d '{"city":"Posadas"}'
# Esperado: 400

# Sin city (requerido) → 400
curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/me/addresses" \
  -H "Authorization: Bearer $TOKEN_CLIENTE" \
  -H "Content-Type: application/json" \
  -d '{"street":"Calle 1"}'
# Esperado: 400
```

---

### 6.10 Editar dirección — `PUT /me/addresses/:id`

```bash
ADDRESS_ID=$(curl -s "$BASE/me/addresses" \
  -H "Authorization: Bearer $TOKEN_CLIENTE" | jq -r '.[0].id')

curl -s -X PUT "$BASE/me/addresses/$ADDRESS_ID" \
  -H "Authorization: Bearer $TOKEN_CLIENTE" \
  -H "Content-Type: application/json" \
  -d '{"street":"Av. Córdoba 456","city":"Puerto Iguazú"}' | jq
```

**Response esperada (200)**: la dirección actualizada.

**Errores esperados**:
```bash
# ID que no pertenece al customer del token → 404
curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/me/addresses/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer $TOKEN_CLIENTE" \
  -H "Content-Type: application/json" \
  -d '{"street":"Test","city":"Test"}'
# Esperado: 404 (la dirección no existe o no es suya)
```

---

### 6.11 Eliminar dirección — `DELETE /me/addresses/:id`

```bash
curl -s -X DELETE "$BASE/me/addresses/$ADDRESS_ID" \
  -H "Authorization: Bearer $TOKEN_CLIENTE" -w "\n→ %{http_code}\n"
```

**Response esperada (200)**:
```jsonc
{ "ok": true }
```

**Errores esperados**:
```bash
# ID que no pertenece al customer del token → 404
curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/me/addresses/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer $TOKEN_CLIENTE"
# Esperado: 404

# Verificar que se borró
curl -s "$BASE/me/addresses" \
  -H "Authorization: Bearer $TOKEN_CLIENTE" | jq 'length'
# Esperado: 0 (o N-1)
```

> **Nota**: `addresses` tiene `onDelete: Cascade` en el FK a `customers`. Si se borra un
> customer (soft-delete), las addresses **no se borran en cascada** (el soft-delete no activa
> el cascade de Prisma/Postgres, solo setea `deletedAt`). Esto es correcto — las addresses
> siguen existiendo en la DB aunque el customer esté soft-deleted.

---

## Resumen — checklist de implementación y prueba

### Customers (panel):

| # | Test | Método | Qué verificar | Auth |
|---|------|--------|---------------|------|
| 6.1 | Listar clientes | `GET /customers` | Paginación, `search`, campos calculados (`orderCount`, `totalSpent`, `avgTicket`, `lastOrderAt`), sin `segment`/`tags` | `assertMemberContext()` + `@Roles('owner','admin')` |
| 6.2 | Detalle cliente | `GET /customers/:id` | Calculados + `orders[]` + `addresses[]`, sin notas. 404 si no existe | `assertMemberContext()` + `@Roles('owner','admin')` |
| 6.3 | Crear cliente | `POST /customers` | `authUserId: null`, vinculación por email (no duplica si ya existe) | `@Roles('owner','admin')` |
| 6.4 | Guard de rol | `POST /customers` con cajero | 403 | `@Roles('owner','admin')` |
| 6.5 | Editar cliente | `PUT /customers/:id` | Actualiza campos, 404 si no existe, 409 si email duplicado | `@Roles('owner','admin')` |
| 6.6 | Eliminar cliente | `DELETE /customers/:id` | Soft-delete, no aparece en listado después | `@Roles('owner','admin')` |
| 6.7 | Email a clientes | `POST /customers/email` | Envía (o loguea stub), devuelve `{sent: N}`, no persiste | `@Roles('owner','admin')` |

### Addresses (storefront):

| # | Test | Método | Qué verificar | Auth |
|---|------|--------|---------------|------|
| 6.8 | Listar propias | `GET /me/addresses` | Solo las del customer del token. 403 con token de member | `assertCustomerContext()` |
| 6.9 | Crear | `POST /me/addresses` | Vincula al customer del token. `isDefault` toggling | `assertCustomerContext()` |
| 6.10 | Editar | `PUT /me/addresses/:id` | 404 si no es suya | `assertCustomerContext()` |
| 6.11 | Eliminar | `DELETE /me/addresses/:id` | Hard delete. 404 si no es suya | `assertCustomerContext()` |

### Fallas a resolver antes/durante la implementación:

- [ ] **F1**: Agregar `assertMemberContext()` a `findAll()` y `findOne()` en `CustomersController`
- [ ] **F2**: Agregar `@Delete(':id')` al controller + soft-delete en service (o diferir con decisión explícita)
- [ ] **F3**: Agregar `sendCustomEmail(to, subject, htmlBody)` a `MailService`, o crear método directo
- [ ] **F4**: Crear `assertCustomerContext()` y usarlo en todos los handlers de `AddressesController`
- [ ] **F5**: Inyectar `@CurrentBusiness()`, `@Query()` en los handlers de `CustomersController`
- [ ] **F6**: Importar `MailModule` en `CustomersModule`
- [ ] **F7**: Confirmar que `/customers/:id/addresses` NO se implementa como ruta separada (las addresses vienen embebidas en el detalle del cliente, según el contrato)

### Orden sugerido de implementación:

1. Resolver F1, F4, F5 (infraestructura de autorización y decoradores)
2. `CustomersService.findAll()` y `findOne()` con calculados
3. `CustomersService.create()` con lógica de vinculación por email
4. `CustomersService.update()`
5. `CustomersService.remove()` (soft-delete) — resolver F2
6. Addresses CRUD en `CustomersService` (o `AddressesService` separado)
7. Resolver F3 + F6 → `POST /customers/email`
8. Probar toda la guía de punta a punta

---

## Notas de contexto para el equipo

- **Autorización**: el backend usa `@Roles('owner','admin')` (por rol), no `@RequirePermission('customers.view')` (por permiso), **aunque el contrato pida permisos**. Esta discrepancia está registrada en `PENDIENTES.md` (Fase 3) y aplica a todos los módulos. La guía usa el patrón de `@Roles()` por consistencia con el código existente.

- **Calculados** (`orderCount`, `totalSpent`, `avgTicket`, `lastOrderAt`): se calculan on-read desde `orders`, NO se persisten. Esto es correcto para V1 con catálogos chicos, pero no escala — si llega a ser un problema de performance, considerar campos desnormalizados o vistas materializadas.

- **`POST /customers/email`** no tiene template propio — el usuario escribe subject y body desde el panel. `MailService` hoy solo tiene templates fijos (welcome, reset-password, etc.), así que hay que agregar un método genérico o bypassear los templates.

- **`DELETE /customers/:id`**: el contrato de API **no lo documenta**, pero `BACKEND_IMPLEMENTACION.md` sí lo lista. El schema lo soporta (`deletedAt`). Se incluye en esta guía por completitud, pero es una decisión que el equipo debe confirmar.
