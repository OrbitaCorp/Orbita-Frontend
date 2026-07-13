# Guía de prueba manual — Fase 5 (Inventario)

> Continúa `Guia prueba manual fases 3 4.md`. Usa las mismas variables (`BASE`, `TOKEN_OWNER`,
> `TOKEN_CAJERO`) — repetí el login si el token expiró (duran ~1 hora).

---

## Estado de esta guía

| Sección | Estado |
|---|---|
| Inventory (stock, entrada, ajuste, movimientos) | ✅ **Verificado manualmente** |
| Suppliers | ✅ **Verificado manualmente** — encontró y corrigió un bug propio (ver PENDIENTES.md) |

---

## Inventory

### 5.1 Crear un producto de prueba (si no tenés uno activo)
```bash
curl -s -X POST $BASE/products -H "Authorization: Bearer $TOKEN_OWNER" -H "Content-Type: application/json" \
  -d '{"name":"Botas de trabajo","basePrice":32000,"status":"PUBLISHED","variants":[]}' | jq
```
Guardá el `variants[0].id` como `VARIANT_ID`.

### 5.2 GET /inventory/stock ✅
```bash
curl -s "$BASE/inventory/stock" -H "Authorization: Bearer $TOKEN_OWNER" | jq
```
**Qué esperar:** `200`, cada fila con `productName`, `variantLabel`, `quantity`, `stockMin`,
`isLowStock` (calculado), `price`.
**Resultado real:** ✅ correcto — producto recién creado con `quantity: 0, isLowStock: true`.

### 5.3 POST /inventory/entry ✅
```bash
curl -s -X POST $BASE/inventory/entry -H "Authorization: Bearer $TOKEN_OWNER" -H "Content-Type: application/json" \
  -d '{"variantId":"'$VARIANT_ID'","quantity":20,"reason":"Compra inicial"}' | jq
```
**Qué esperar:** `201`, `StockMovement` creado (`type: ENTRADA`) + `newQuantity` reflejando el
incremento.
**Resultado real:** ✅ correcto — `newQuantity: 20`.

### 5.4 Entrada con cantidad negativa (debe fallar) ✅
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST $BASE/inventory/entry -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" -d '{"variantId":"'$VARIANT_ID'","quantity":-5}'
```
**Resultado real:** ✅ correcto — `400`.

### 5.5 Entrada como cajero (debe fallar) ✅
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST $BASE/inventory/entry -H "Authorization: Bearer $TOKEN_CAJERO" \
  -H "Content-Type: application/json" -d '{"variantId":"'$VARIANT_ID'","quantity":5}'
```
**Resultado real:** ✅ correcto — `403`.

### 5.6 POST /inventory/adjustment (negativo, rotura) ✅
```bash
curl -s -X POST $BASE/inventory/adjustment -H "Authorization: Bearer $TOKEN_OWNER" -H "Content-Type: application/json" \
  -d '{"variantId":"'$VARIANT_ID'","quantity":-3,"reason":"Rotura en depósito"}' | jq
```
**Qué esperar:** `201`, `type: AJUSTE`, `newQuantity` reduce.
**Resultado real:** ✅ correcto — `20 → 17`.

### 5.7 Ajuste que dejaría el stock negativo (debe fallar) ✅
```bash
curl -s -w "\n→ %{http_code}\n" -X POST $BASE/inventory/adjustment -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" -d '{"variantId":"'$VARIANT_ID'","quantity":-100,"reason":"Test"}'
```
**Resultado real:** ✅ correcto — `422`, mensaje indica stock actual y el movimiento rechazado.

### 5.8 GET /inventory/movements (+ filtro por type) ✅
```bash
curl -s "$BASE/inventory/movements" -H "Authorization: Bearer $TOKEN_OWNER" | jq
curl -s "$BASE/inventory/movements?type=AJUSTE" -H "Authorization: Bearer $TOKEN_OWNER" | jq
```
**Qué esperar:** paginado, con `productName` y `createdByName` resueltos por join.
**Resultado real:** ✅ correcto en ambos.

---

## Suppliers

### 5.9 Crear proveedor ✅
```bash
curl -s -X POST $BASE/suppliers -H "Authorization: Bearer $TOKEN_OWNER" -H "Content-Type: application/json" \
  -d '{"name":"Cueros del Sur","contact":"Juan Pérez","phone":"3751123456","email":"ventas@cuerosdelsur.com"}' | jq
```
**Resultado real:** ✅ correcto — `lastPurchase: null`, `totalPurchased: 0` (todavía sin compras).

### 5.10 Entrada de stock CON proveedor ✅
```bash
curl -s -X POST $BASE/inventory/entry -H "Authorization: Bearer $TOKEN_OWNER" -H "Content-Type: application/json" \
  -d '{"variantId":"'$VARIANT_ID'","quantity":10,"supplierId":"<SUPPLIER_ID>","reason":"Reposición"}' | jq
curl -s "$BASE/suppliers" -H "Authorization: Bearer $TOKEN_OWNER" | jq
```
**Qué esperar:** después de la entrada, `GET /suppliers` debe mostrar `lastPurchase` seteado y
`totalPurchased: 10`.
**Resultado real:** ✅ correcto.

### 5.11 Entry con supplierId inválido (debe fallar) ✅
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST $BASE/inventory/entry -H "Authorization: Bearer $TOKEN_OWNER" \
  -H "Content-Type: application/json" -d '{"variantId":"'$VARIANT_ID'","quantity":5,"supplierId":"00000000-0000-0000-0000-000000000000"}'
```
**Resultado real:** ✅ correcto — `400`.

### 5.12 Editar proveedor ✅
```bash
curl -s -X PUT $BASE/suppliers/<ID> -H "Authorization: Bearer $TOKEN_OWNER" -H "Content-Type: application/json" \
  -d '{"name":"Cueros del Sur SRL","phone":"3751123456"}' | jq
```
**Resultado real:** ✅ correcto.

### 5.13 Borrar proveedor CON movimientos asociados — comportamiento real: `200`, no `422` ⚠️
```bash
curl -s -w "\n→ %{http_code}\n" -X DELETE $BASE/suppliers/<ID> -H "Authorization: Bearer $TOKEN_OWNER"
```
**Qué esperar:** `200` — el proveedor se borra y sus `stock_movements` quedan con
`supplierId: null` (el historial de movimientos **no se pierde**, solo se desvincula del
proveedor). El FK real es `ON DELETE SET NULL`, no `RESTRICT` — este comportamiento es
intencional del schema, no un bug. Ver PENDIENTES.md → Fase 5 para el detalle de cómo se
detectó (la primera implementación asumía `RESTRICT` como en `branches`, y el test manual
reveló el supuesto incorrecto).
**Resultado real:** ✅ correcto (después de corregir el código) — `200`, movimiento verificado
con `supplierId: null` post-borrado.

### 5.14 Limpieza
```bash
curl -s -w "\n→ %{http_code}\n" -X DELETE $BASE/products/<PRODUCT_ID> -H "Authorization: Bearer $TOKEN_OWNER"
```

---

## Resumen — checklist

- [x] `GET /inventory/stock` — listado con `isLowStock` calculado
- [x] `POST /inventory/entry` — suma stock, rechaza cantidad negativa, bloqueado para cajero
- [x] `POST /inventory/adjustment` — suma o resta, bloquea si el resultado da negativo
- [x] `GET /inventory/movements` — historial paginado con filtros y joins (`productName`, `createdByName`)
- [x] `Suppliers` CRUD — `lastPurchase`/`totalPurchased` calculados correctamente desde `stock_movements`
- [x] Borrar proveedor con historial → `SET NULL`, no bloquea (comportamiento verificado y documentado)

Si todos estos dan el resultado esperado, la Fase 5 funciona de punta a punta.
