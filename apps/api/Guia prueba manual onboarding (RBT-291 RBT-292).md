# Guía de prueba manual — Onboarding (RBT-291 / RBT-292 / RBT-293)

> Cubre el registro inicial del dueño de un negocio (sin sesión previa), el catálogo de
> rubros/subrubros, y la persistencia completa de los pasos del wizard (RBT-293). No requiere
> las guías de Fases 1–6 como prerrequisito — este flujo es el paso *anterior* a todo lo demás
> (crea la cuenta y el negocio desde cero).
>
> **Nota sobre el frontend (RBT-293):** lo de abajo se verificó con `curl` reproduciendo
> exactamente los payloads que arma `apps/web/src/lib/api.ts`, y con `tsc --noEmit` limpio. No
> se pudo verificar con clicks reales en el navegador integrado de la sesión de desarrollo por un
> bug de hidratación de React que afecta a *todas* las páginas del frontend (no solo onboarding)
> — ver `PENDIENTES.md`. Antes de dar por buena la UI, probarla en un Chrome real corriendo
> `pnpm install && pnpm run dev` desde `apps/web/`.

---

## Contexto — de dónde viene cada pieza

| Pieza | Endpoint | Autenticación |
|-------|----------|----------------|
| Owner completa `registro.tsx` (nombre, email, password, nombre del negocio) | `POST /onboarding/register-business` | `@Public()` — no requiere token |
| Frontend pide el catálogo de rubros para `onboarding/rubro.tsx` | `GET /onboarding/rubros` | `@Public()` — no requiere token |
| Wizard (`SetupUnificado.tsx`) completa rubro/subdominio/modo mientras el negocio sigue en borrador | `PUT /onboarding/business` | Requiere token de member (devuelto por `register-business`) |
| Activación final del negocio (fuera de este alcance, ya existente) | `POST /business/publish` | Requiere token de member (owner) |

---

## Antes de empezar

```bash
BASE="http://localhost:3000/api/v1"
```

No hace falta login previo — el primer paso crea la cuenta.

---

## 1. Catálogo de rubros — `GET /onboarding/rubros`

```bash
curl -s "$BASE/onboarding/rubros" | jq
```

**Response esperada (200)**:
```jsonc
[
  {
    "key": "tienda",
    "label": "Tienda",
    "subrubros": [
      { "key": "indumentaria", "label": "Indumentaria" },
      { "key": "calzado", "label": "Calzado" }
      // ... 18 subrubros en total, mismos que TiendaSetup.tsx
    ]
  }
]
```

**Qué verificar**: por ahora un único rubro (`tienda`) con 18 subrubros — no hay otros rubros
todavía (contrato: "por ahora solo Tienda"). No requiere `Authorization` header.

---

## 2. Registro del dueño + negocio — `POST /onboarding/register-business`

```bash
TS=$(date +%s)
R=$(curl -s -X POST "$BASE/onboarding/register-business" \
  -H "Content-Type: application/json" \
  -d '{
    "ownerName": "Fernando Test",
    "email": "fernando-'"$TS"'@test.com",
    "password": "Test1234!",
    "businessName": "Barberia Don Fernando"
  }')
echo "$R" | jq
TOKEN=$(echo "$R" | jq -r '.token')
BUSINESS_ID=$(echo "$R" | jq -r '.business.id')
```

**Request body**:

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `ownerName` | string | Sí | — |
| `email` | string | Sí | `@IsEmail()` |
| `password` | string | Sí | mínimo 8 caracteres |
| `businessName` | string | Sí | — |

**Response esperada (201)**:
```jsonc
{
  "token": "eyJ...",                    // access_token real de Supabase, ya autenticado
  "business": {
    "id": "uuid",
    "name": "Barberia Don Fernando",
    "subdomain": "barberia-don-fernando", // slug temporal generado del nombre
    "mode": "FULL",
    "isActive": false                    // "en configuración", no publicado
  },
  "branch": { "id": "uuid", "name": "Principal" },
  "member": { "id": "uuid", "name": "Fernando Test", "email": "fernando-...@test.com" }
}
```

**Qué se crea detrás de escena** (una sola transacción, `{ timeout: 15000 }`):
- `Business` (`isActive: false`, `industry: ''` — se completa después en el paso de rubro)
- `Branch` "Principal" (`isDefault: true`)
- 4 `Role`s default (`owner`, `admin`, `cajero`, `empleado`) con sus `RolePermission`
- `Member` owner (`status: ACTIVE`, `hasTempPassword: false`)
- `BusinessConfig`, `StorefrontConfig`, `NotificationConfig` con defaults razonables
- **No se crea `Subscription`** (deliberado — ver `PENDIENTES.md`)
- Usuario de Supabase Auth (fuera de la transacción de Postgres — si la transacción falla
  después, se borra el usuario de Auth para no dejarlo huérfano)

### 2.1 Verificar lo creado

```bash
echo "=== Negocio ==="
curl -s "$BASE/business" -H "Authorization: Bearer $TOKEN" | jq

echo "=== Roles (deben ser 4, con permisos) ==="
curl -s "$BASE/roles" -H "Authorization: Bearer $TOKEN" | jq '[.[] | {name, permissions: (.permissions | length)}]'

echo "=== Members (owner, ACTIVE) ==="
curl -s "$BASE/members" -H "Authorization: Bearer $TOKEN" | jq
```

**Esperado**: negocio con `isActive: false`; 4 roles (`owner` con todos los permisos, `admin`
igual, `cajero`/`empleado` con subconjuntos); un solo member (`status: "ACTIVE"`).

### 2.2 Email ya registrado — debe dar `409`, no `500`

```bash
curl -s -w "\n→ %{http_code}\n" -X POST "$BASE/onboarding/register-business" \
  -H "Content-Type: application/json" \
  -d '{
    "ownerName": "Duplicado",
    "email": "fernando-'"$TS"'@test.com",
    "password": "Test1234!",
    "businessName": "Otro Negocio"
  }'
# Esperado: 409, "Ese email ya tiene una cuenta"
```

### 2.3 Colisión de subdominio — debe generar un sufijo, no fallar

Registrar dos negocios con el **mismo** `businessName` (sin haber cambiado el subdominio del
primero todavía):

```bash
curl -s -X POST "$BASE/onboarding/register-business" \
  -H "Content-Type: application/json" \
  -d '{"ownerName":"Otro","email":"otro-'"$TS"'@test.com","password":"Test1234!","businessName":"Barberia Don Fernando"}' \
  | jq '.business.subdomain'
# Esperado: "barberia-don-fernando-xxxx" (sufijo aleatorio de 4 caracteres), no un error
```

---

## 3. Actualizar datos del wizard — `PUT /onboarding/business`

Con el `TOKEN` obtenido en el paso 2 (negocio todavía `isActive: false`):

```bash
curl -s -X PUT "$BASE/onboarding/business" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "corte-barba",
    "subdomain": "don-fernando",
    "mode": "SHOWCASE"
  }' | jq
```

**Request body** (todos opcionales, se actualiza lo que venga):

| Campo | Tipo | Validación |
|-------|------|------------|
| `name` | string | — |
| `industry` | string | — |
| `description` | string | — |
| `subdomain` | string | `^[a-z0-9-]+$` |
| `mode` | string | `'FULL' \| 'SHOWCASE'` |

**Response esperada (200)**: el negocio actualizado con los nuevos valores.

### 3.1 Subdominio duplicado → `409`

```bash
curl -s -w "\n→ %{http_code}\n" -X PUT "$BASE/onboarding/business" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subdomain":"don-fernando"}'
# Repetir la misma request dos veces seguidas, o usar un subdominio de otro negocio ya existente
# Esperado: 409, "Ese subdominio ya está en uso"
```

### 3.2 Rechazo una vez publicado el negocio → `422`

```bash
curl -s -X POST "$BASE/business/publish" -H "Authorization: Bearer $TOKEN" | jq

curl -s -w "\n→ %{http_code}\n" -X PUT "$BASE/onboarding/business" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subdomain":"otro-intento"}'
# Esperado: 422, "El negocio ya está publicado — subdomain y mode no se cambian por esta vía una vez activo"
```

---

## 4. RBT-293 — Persistencia de los pasos del wizard

Con el mismo `TOKEN`/`BRANCH_ID` del registro (negocio todavía `isActive: false`):

### 4.1 Rubro/subrubros, tamaño de equipo, dónde opera — `PUT /onboarding/business`

```bash
curl -s -X PUT "$BASE/onboarding/business" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subrubros": ["indumentaria", "calzado"],
    "teamSize": "mini",
    "operatesPhysical": true,
    "operatesOnline": true
  }' | jq
```
**Esperado (200)**: el negocio con `subrubros`, `teamSize`, `operatesPhysical`, `operatesOnline`
reflejados. `teamSize` solo acepta `solo|mini|medio|grande` (400 con otro valor).

### 4.2 Ubicación (dirección + coordenadas) — `PUT /branches/:id`

```bash
curl -s -X PUT "$BASE/branches/$BRANCH_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Av. Corrientes 1234, CABA",
    "latitude": -34.6037,
    "longitude": -58.3816
  }' | jq
```
**Esperado (200)**: la sucursal con `address`/`latitude`/`longitude` guardados.

### 4.3 Métodos de pago — `PUT /business/config`

```bash
curl -s -X PUT "$BASE/business/config" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "acceptsCash": true,
    "acceptsTransfer": true,
    "acceptsMercadopago": true,
    "acceptsCard": true,
    "transferAlias": "mi.negocio.mp"
  }' | jq
```
**Importante**: si `acceptsTransfer: true` y no se manda `transferAlias` (o ya había uno seteado
antes), da `400 "transferAlias es obligatorio si acceptsTransfer está habilitado"` — regla ya
existente de Fase 2, no nueva. El wizard (`StepPagos`) pide el alias en un campo que aparece
recién cuando se tilda "Transferencia".

```bash
# Sin transferAlias y sin uno previo → 400
curl -s -w "\n→ %{http_code}\n" -X PUT "$BASE/business/config" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"acceptsTransfer": true}'
```

### 4.4 Retomar el wizard — `GET /business` + `GET /business/config` + `GET /branches/:id`

```bash
curl -s "$BASE/business" -H "Authorization: Bearer $TOKEN" | jq
curl -s "$BASE/business/config" -H "Authorization: Bearer $TOKEN" | jq
curl -s "$BASE/branches/$BRANCH_ID" -H "Authorization: Bearer $TOKEN" | jq
```
**Esperado**: todo lo guardado en 4.1–4.3 disponible para que el frontend rehidrate el wizard si
el usuario recarga la página o abandona y vuelve (siempre que conserve el token — hoy en
`localStorage`, ver `apps/web/src/lib/api.ts`).

### 4.5 Activación real al "pagar" — `POST /business/publish`

`plan.tsx` sigue simulando el cobro de MercadoPago (`setTimeout`), pero ahora si la simulación
"aprueba" el pago, llama de verdad a este endpoint:

```bash
curl -s -X POST "$BASE/business/publish" -H "Authorization: Bearer $TOKEN" | jq
# Esperado: { "url": "https://<subdomain>.orbita.site", "published": true }
```

---

## Resumen — checklist de prueba

| # | Test | Método | Qué verificar |
|---|------|--------|----------------|
| 1 | Catálogo de rubros | `GET /onboarding/rubros` | 1 rubro (`tienda`), 18 subrubros, sin auth |
| 2 | Registro completo | `POST /onboarding/register-business` | 201, token real, negocio `isActive:false`, 4 roles + member owner creados |
| 2.1 | Verificación de lo creado | `GET /business`, `GET /roles`, `GET /members` | Todo vinculado correctamente al nuevo negocio |
| 2.2 | Email duplicado | `POST /onboarding/register-business` | 409, no 500 |
| 2.3 | Colisión de subdominio | `POST /onboarding/register-business` (mismo nombre 2 veces) | Sufijo aleatorio, no falla |
| 3 | Actualizar borrador | `PUT /onboarding/business` | 200, campos actualizados |
| 3.1 | Subdominio duplicado en update | `PUT /onboarding/business` | 409 |
| 3.2 | Gate de publicación | `POST /business/publish` + `PUT /onboarding/business` | 422 después de publicar |
| 4.1 | Subrubros/equipo/ubicación (RBT-293) | `PUT /onboarding/business` | subrubros[], teamSize, operatesPhysical/Online guardados |
| 4.2 | Dirección + coordenadas (RBT-293) | `PUT /branches/:id` | latitude/longitude guardados |
| 4.3 | Métodos de pago + validación de alias (RBT-293) | `PUT /business/config` | acceptsCard nuevo; 400 si falta transferAlias con transferencia activa |
| 4.4 | Retomar wizard (RBT-293) | `GET /business` + `/business/config` + `/branches/:id` | Todo lo guardado se puede releer para rehidratar |
| 4.5 | Activación real al pagar (RBT-293) | `POST /business/publish` | Negocio pasa a `isActive: true` de verdad |

Todos los pasos de esta guía fueron verificados en esta sesión contra el servidor real
(`pnpm run dev`) y la base de Supabase real. Los negocios y usuarios de prueba creados durante
la verificación fueron eliminados al finalizar (roles/member/branch/business por Prisma,
usuarios por `supabase.auth.admin.deleteUser()`).

---

## Notas de contexto para el equipo

- **`industry` vacío hasta el paso de rubro**: el registro no pide rubro (lo hace
  `registro.tsx`, que solo junta nombre/email/password/nombre del negocio). Se crea con
  `industry: ''` y se completa después vía `PUT /onboarding/business`. **No hay validación que
  bloquee `publish()` con `industry` vacío** — ver `PENDIENTES.md`.
- **No se crea `Subscription`**: diferido hasta el módulo de MercadoPago/Subscriptions.
- **Subdominio temporal**: el que se genera en el registro es un slug automático — el
  definitivo se elige en el wizard vía `PUT /onboarding/business`, antes de publicar.
- **`Branch.address` es solo texto** — no hay lat/lng en el schema. Si más adelante se necesita
  geolocalización real, va a requerir una migración.
- **RBT-293 — Logo del wizard no se persiste**: sigue siendo preview local (base64), no se sube
  a Supabase Storage. Necesita un endpoint de upload dedicado (mismo patrón que
  `POST /products/:id/images`).
- **RBT-293 — "Teléfono" del wizard se guarda como `BusinessConfig.whatsapp`**, no como un campo
  nuevo — Órbita usa WhatsApp como canal de contacto principal del negocio.
- **RBT-293 — Limpieza de negocios que nunca pagan: DIFERIDO**. No existe todavía una señal real
  de pago (`plan.tsx` sigue simulado), así que no se construyó ningún job de limpieza automática
  — hacerlo ahora borraría negocios en proceso legítimo de onboarding sin poder distinguirlos de
  los abandonados. Ver criterio sugerido en `PENDIENTES.md` para cuando exista el módulo de pagos.
