# Guía de prueba manual — Fases 3 y 4

> Continúa `Guia prueba manual fases 1 2.md`. Usa las mismas variables (`BASE`, `SLUG`,
> `TOKEN_OWNER`, `TOKEN_CAJERO`) — repetí el login de esa guía antes de empezar acá.

---

## Estado de esta guía

| Sección | Estado |
|---|---|
| Parte 3 (Equipo: roles, permisos, miembros) | ✅ **Verificado manualmente** — implementado y probado en esta sesión |
| Parte 4 (Catálogo: categorías, tags, productos) | ✅ **Verificado manualmente** — implementado y probado en esta sesión |

> **Nota (2026-07-13):** a diferencia de las Fases 1 y 2 (donde solo se *probó* lógica ya
> escrita por el CTO), en esta sesión se **implementó** la lógica de negocio de estos módulos
> desde cero — antes eran stubs (`{"message":"not implemented"}` con `200`). Ver
> `PENDIENTES.md` → "Fase 3 — Equipo" y "Fase 4 — Catálogo" para las decisiones tomadas sin
> especificación exacta del contrato.

---

## Parte 3 — Equipo

### 3.1 Catálogo de permisos ✅
```bash
curl -s $BASE/permissions -H "Authorization: Bearer $TOKEN_OWNER" | jq
```
**Qué esperar:** `200`, lista de permisos globales (`{id, group, code, label, description}[]`).
**Resultado real:** ✅ correcto.

### 3.2 Listar roles ✅
```bash
curl -s $BASE/roles -H "Authorization: Bearer $TOKEN_OWNER" | jq
```
**Qué esperar:** `200`, los 4 roles default (owner/admin/cajero/empleado) con `permissions[]` y
`memberCount`.
**Resultado real:** ✅ correcto — owner con 19 permisos, `memberCount: 1`.

### 3.3 Crear rol custom ✅
```bash
curl -s -X POST $BASE/roles -H "Authorization: Bearer $TOKEN_OWNER" -H "Content-Type: application/json" \
  -d '{"name":"Supervisor","color":"#FF0000","permissions":["orders.view","orders.manage"]}' | jq
```
**Qué esperar:** `201`, el rol creado con `isDefault: false`.
**Resultado real:** ✅ correcto.

### 3.4 Crear rol con permiso inexistente (debe fallar) ✅
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST $BASE/roles -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" -d '{"name":"Test","permissions":["permiso.inventado"]}'
```
**Qué esperar:** `400`.
**Resultado real:** ✅ correcto — mensaje lista el/los código(s) inválido(s).

### 3.5 Crear rol como cajero (debe fallar) ✅
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST $BASE/roles -H "Authorization: Bearer $TOKEN_CAJERO" \
  -H "Content-Type: application/json" -d '{"name":"Test2","permissions":[]}'
```
**Qué esperar:** `403`.
**Resultado real:** ✅ correcto.

### 3.6 Editar / borrar un rol default (debe fallar) ✅
```bash
OWNER_ROLE_ID="<id del rol 'owner' de 3.2>"
curl -s -w "\n→ %{http_code}\n" -X PUT $BASE/roles/$OWNER_ROLE_ID -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" -d '{"name":"owner","permissions":["orders.view"]}'
curl -s -w "\n→ %{http_code}\n" -X DELETE $BASE/roles/$OWNER_ROLE_ID -H "Authorization: Bearer $TOKEN_OWNER"
```
**Qué esperar:** `422` en ambos casos.
**Resultado real:** ✅ correcto — `"No se puede editar/eliminar un rol por defecto"`.

### 3.7 Borrar el rol custom (limpieza) ✅
```bash
curl -s -w "\n→ %{http_code}\n" -X DELETE $BASE/roles/<ID_SUPERVISOR> -H "Authorization: Bearer $TOKEN_OWNER"
```
**Resultado real:** ✅ correcto — `200`.

### 3.8 Listar miembros ✅
```bash
curl -s $BASE/members -H "Authorization: Bearer $TOKEN_OWNER" | jq
```
**Resultado real:** ✅ correcto — Lorena (owner) y Carlos (cajero).

### 3.9 Invitar miembro como cajero (debe fallar) ✅
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST $BASE/members/invite -H "Authorization: Bearer $TOKEN_CAJERO" \
  -H "Content-Type: application/json" -d '{"name":"Test","email":"test@x.com","roleId":"<CAJERO_ROLE_ID>"}'
```
**Resultado real:** ✅ correcto — `403`.

### 3.10 Invitar miembro como owner ✅
```bash
curl -s -X POST $BASE/members/invite -H "Authorization: Bearer $TOKEN_OWNER" -H "Content-Type: application/json" \
  -d '{"name":"Nueva Empleada","email":"nueva-'$(date +%s)'@zapatoslorena.test","roleId":"<CAJERO_ROLE_ID>"}' | jq
```
**Qué esperar:** `201`, `status: PENDING`, `hasTempPassword: true`. En la consola del server
(mail stub) debe verse el log `[MAIL STUB]` con el `panelUrl` y la `tempPassword` generada.
**Resultado real:** ✅ correcto — el email quedó logueado con todos los datos.

### 3.11 Aceptar la invitación (cierra el círculo con Fase 1) ✅
```bash
curl -s -X POST $BASE/auth/accept-invitation -H "Content-Type: application/json" \
  -d '{"token":"<MEMBER_ID_DE_3.10>","newPassword":"NuevaPass123!"}' | jq
```
**Qué esperar:** `201`/`200` con `token` de sesión real. El miembro pasa a `ACTIVE`,
`hasTempPassword: false`.
**Resultado real:** ✅ correcto.

### 3.12 Editar miembro (nombre, rol inválido) ✅
```bash
curl -s -X PUT $BASE/members/<ID> -H "Authorization: Bearer $TOKEN_OWNER" -H "Content-Type: application/json" \
  -d '{"name":"Nombre Editado"}' | jq
curl -s -o /dev/null -w "%{http_code}\n" -X PUT $BASE/members/<ID> -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" -d '{"roleId":"00000000-0000-0000-0000-000000000000"}'
```
**Qué esperar:** `200` en el primero, `400` en el segundo (roleId inválido).
**Resultado real:** ✅ correcto en ambos.

### 3.13 Intentar borrar al owner (debe fallar) ✅
```bash
curl -s -w "\n→ %{http_code}\n" -X DELETE $BASE/members/<OWNER_MEMBER_ID> -H "Authorization: Bearer $TOKEN_OWNER"
```
**Resultado real:** ✅ correcto — `422`, `"No se puede eliminar al owner"`.

### 3.14 Borrar el miembro de prueba (limpieza) ✅
```bash
curl -s -w "\n→ %{http_code}\n" -X DELETE $BASE/members/<ID_DE_3.10> -H "Authorization: Bearer $TOKEN_OWNER"
```
**Resultado real:** ✅ correcto — `200`.

---

## Parte 4 — Catálogo

### 4.1 Crear categoría raíz + subcategoría ✅
```bash
curl -s -X POST $BASE/categories -H "Authorization: Bearer $TOKEN_OWNER" -H "Content-Type: application/json" \
  -d '{"name":"Calzado","icon":"👟","color":"#8B4513"}' | jq
curl -s -X POST $BASE/categories -H "Authorization: Bearer $TOKEN_OWNER" -H "Content-Type: application/json" \
  -d '{"name":"Zapatillas","parentId":"<CALZADO_ID>"}' | jq
```
**Resultado real:** ✅ correcto — slug autogenerado (`calzado`, `zapatillas`).

### 4.2 Categoría con slug duplicado (debe fallar) ✅
```bash
curl -s -w "\n→ %{http_code}\n" -X POST $BASE/categories -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" -d '{"name":"Calzado"}'
```
**Resultado real:** ✅ correcto — `400`.

### 4.3 GET /categories (árbol) ✅
```bash
curl -s $BASE/categories -H "Authorization: Bearer $TOKEN_OWNER" | jq
```
**Qué esperar:** array anidado — Zapatillas dentro de `children` de Calzado.
**Resultado real:** ✅ correcto.

### 4.4 Borrar categoría con subcategorías (debe fallar) ✅
```bash
curl -s -w "\n→ %{http_code}\n" -X DELETE $BASE/categories/<CALZADO_ID> -H "Authorization: Bearer $TOKEN_OWNER"
```
**Resultado real:** ✅ correcto — `422`.

### 4.5 Reordenar categorías ✅
```bash
curl -s -w "\n→ %{http_code}\n" -X PATCH $BASE/categories/reorder -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" -d '{"items":[{"id":"<ID>","position":1,"parentId":null}]}'
```
**Resultado real:** ✅ correcto — `200`.

### 4.6 Tags: crear, duplicado, listar ✅
```bash
curl -s -X POST $BASE/tags -H "Authorization: Bearer $TOKEN_OWNER" -H "Content-Type: application/json" -d '{"name":"Oferta"}' | jq
curl -s -o /dev/null -w "%{http_code}\n" -X POST $BASE/tags -H "Authorization: Bearer $TOKEN_OWNER" -H "Content-Type: application/json" -d '{"name":"Oferta"}'
curl -s $BASE/tags -H "Authorization: Bearer $TOKEN_OWNER" | jq
```
**Resultado real:** ✅ correcto — `201`, luego `400` (duplicado), luego listado con 1 tag.

### 4.7 Crear producto SIN variantes (simple) ✅
```bash
curl -s -X POST $BASE/products -H "Authorization: Bearer $TOKEN_OWNER" -H "Content-Type: application/json" -d '{
  "name": "Ojotas de goma", "categoryId": "<CALZADO_ID>", "basePrice": 5900,
  "status": "PUBLISHED", "tagIds": ["<TAG_ID>"], "variants": []
}' | jq
```
**Qué esperar:** `201`, una variante `isDefault: true` con `price = basePrice`, stock en 0 para
la sucursal Principal.
**Resultado real:** ✅ correcto.

### 4.8 Crear producto CON variantes (Talle × Color) ✅
```bash
curl -s -X POST $BASE/products -H "Authorization: Bearer $TOKEN_OWNER" -H "Content-Type: application/json" -d '{
  "name": "Zapatilla urbana", "categoryId": "<CALZADO_ID>", "basePrice": 45000, "comparePrice": 55000,
  "status": "PUBLISHED",
  "options": [{"name":"Talle","values":["38","39","40"]}, {"name":"Color","values":["Negro","Blanco"]}],
  "variants": [
    {"sku":"ZU-38-NEG","price":45000,"optionValues":["38","Negro"],"initialStock":5,"stockMin":2},
    {"sku":"ZU-39-NEG","price":45000,"optionValues":["39","Negro"],"initialStock":3,"stockMin":2},
    {"sku":"ZU-40-BLA","price":47000,"optionValues":["40","Blanco"],"initialStock":8,"stockMin":2}
  ]
}' | jq
```
**Qué esperar:** `201`, 2 opciones creadas, 3 variantes con sus `optionValues` resueltos
correctamente y stock por variante.
**Resultado real:** ✅ correcto — el matching posicional (Talle/Color) funcionó bien.

### 4.9 Variante con cantidad incorrecta de optionValues (debe fallar) ✅
```bash
curl -s -w "\n→ %{http_code}\n" -X POST $BASE/products -H "Authorization: Bearer $TOKEN_OWNER" -H "Content-Type: application/json" -d '{
  "name":"Test","basePrice":1000,"options":[{"name":"Talle","values":["S","M"]}],
  "variants":[{"price":1000,"optionValues":["S","Extra"]}]
}'
```
**Resultado real:** ✅ correcto — `400`.

### 4.10 Producto con categoría inexistente (debe fallar) ✅
```bash
curl -s -w "\n→ %{http_code}\n" -X POST $BASE/products -H "Authorization: Bearer $TOKEN_OWNER" -H "Content-Type: application/json" \
  -d '{"name":"Test","basePrice":1000,"categoryId":"00000000-0000-0000-0000-000000000000","variants":[]}'
```
**Resultado real:** ✅ correcto — `422`.

### 4.11 Listado con filtros ✅
```bash
curl -s "$BASE/products?limit=5" -H "Authorization: Bearer $TOKEN_OWNER" | jq
curl -s "$BASE/products?categoryId=<CALZADO_ID>" -H "Authorization: Bearer $TOKEN_OWNER" | jq
curl -s "$BASE/products?search=zapatilla" -H "Authorization: Bearer $TOKEN_OWNER" | jq
```
**Qué esperar:** `{data, total, page, limit}`, cada producto con `totalStock`, `variantCount`,
`categoryName`, `primaryImageUrl` calculados.
**Resultado real:** ✅ correcto.

### 4.12 GET /products/barcodes ✅
```bash
curl -s "$BASE/products/barcodes" -H "Authorization: Bearer $TOKEN_OWNER" | jq
```
**Qué esperar:** una fila por variante, con `variantLabel` como `"38 / Negro"` (opciones
unidas con `/`).
**Resultado real:** ✅ correcto.

### 4.13 Actualizar producto (solo campos escalares) ✅
```bash
curl -s -X PUT $BASE/products/<ID> -H "Authorization: Bearer $TOKEN_OWNER" -H "Content-Type: application/json" \
  -d '{"name":"Ojotas de goma PRO","basePrice":6500,"status":"PUBLISHED","variants":[]}' | jq
```
**Qué esperar:** `200`, nombre y precio actualizados. **Las variantes existentes no cambian**
(ver PENDIENTES.md — `update()` no reconcilia variantes).
**Resultado real:** ✅ correcto — el `basePrice` del producto cambió pero la variante default
conservó su precio original.

### 4.14 Soft-delete de producto ✅
```bash
curl -s -w "\n→ %{http_code}\n" -X DELETE $BASE/products/<ID> -H "Authorization: Bearer $TOKEN_OWNER"
curl -s -o /dev/null -w "%{http_code}\n" $BASE/products/<ID> -H "Authorization: Bearer $TOKEN_OWNER"
```
**Qué esperar:** `200` en el delete, `404` al pedirlo después, y no debe aparecer en el listado.
**Resultado real:** ✅ correcto en los tres casos.

### 4.15 Subir imagen de producto ✅
```bash
curl -s -w "\n→ %{http_code}\n" -X POST "$BASE/products/<ID>/images" -H "Authorization: Bearer $TOKEN_OWNER" \
  -F "file=@/ruta/imagen.png;type=image/png" -F "isPrimary=true"
```
**Qué esperar:** `201`, URL pública de Supabase Storage.
**Resultado real:** ✅ correcto — **importante**: hubo que crear el bucket `product-images` en
Supabase Storage manualmente (no existía). Ver PENDIENTES.md. Con el bucket creado, la URL
pública devuelta respondió `200` al pedirla directo.

### 4.16 Reordenar imágenes + cambiar primary ✅
```bash
curl -s -w "\n→ %{http_code}\n" -X PATCH "$BASE/products/<ID>/images/reorder" -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" -d '{"items":[{"id":"<IMG1>","position":1},{"id":"<IMG2>","position":0}],"primaryId":"<IMG2>"}'
```
**Resultado real:** ✅ correcto — reflejado en el GET del detalle del producto.

### 4.17 Borrar imagen ✅
```bash
curl -s -w "\n→ %{http_code}\n" -X DELETE "$BASE/products/<ID>/images/<IMAGE_ID>" -H "Authorization: Bearer $TOKEN_OWNER"
```
**Resultado real:** ✅ correcto — `200`.

---

## Resumen — checklist

**Equipo:**
- [x] Catálogo de permisos, listar/crear/editar/eliminar roles
- [x] Rol default no editable/eliminable → `422`
- [x] Permiso inexistente al crear rol → `400`
- [x] Autorización por rol (`@Roles`) bloquea a cajero → `403`
- [x] Listar/invitar/editar/eliminar miembros
- [x] Invitación → email (mail stub) → accept-invitation → miembro ACTIVE
- [x] No se puede eliminar al owner → `422`

**Catálogo:**
- [x] Árbol de categorías, slug único, protección de borrado con hijos/productos
- [x] Reordenar categorías
- [x] Tags CRUD con nombre único
- [x] Producto simple (sin variantes) → variante default con stock 0
- [x] Producto con variantes (options × combinaciones) → stock por variante
- [x] Validaciones: categoría inexistente, tags inválidos, optionValues mal formados
- [x] Listado paginado con filtros y campos calculados
- [x] Códigos de barras
- [x] Update (solo escalares — variantes no se tocan, ver PENDIENTES.md)
- [x] Soft-delete
- [x] Imágenes: subir, reordenar, marcar principal, borrar (requirió crear el bucket de Storage)

Si todos estos dan el resultado esperado, las Fases 3 y 4 funcionan de punta a punta.
