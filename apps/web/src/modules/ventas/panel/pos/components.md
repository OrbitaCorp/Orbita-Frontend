# Inventario de Componentes POS

## Mapeo desde ClaudeDesing

| Fuente ClaudeDesing | Target interno POS | Tipo |
|---|---|---|
| `Catalog.jsx` | `components/Catalog.tsx` | POS especifico |
| `Ticket.jsx` | `components/Ticket.tsx` | POS especifico |
| `Modals.jsx` | `components/modals/*` | POS especifico |
| `Modals2.jsx` | `components/modals/*` | POS especifico |
| `OtherScreens.jsx` | `screens/*` | POS especifico |
| `app.jsx` | `POScobro.tsx` + `hooks/usePOSState.ts` | Orquestacion |

## Componentes compartidos en `_shared`

### 1) ProductoCard
Ubicacion:
- `src/modules/ventas/_shared/components/ProductoCard.tsx`

Responsabilidad:
- Render generico de tarjeta de producto.
- Variantes visuales para stock, precio, estado disabled.

Consumidores:
- POS catalogo.
- Potencial storefront/catalogo de otros submodulos.

### 2) MatrizVariantes
Ubicacion:
- `src/modules/ventas/_shared/components/MatrizVariantes.tsx`

Responsabilidad:
- Selector talle/color/u otra dimension.
- Mostrar stock por combinacion.

Consumidores:
- POS selector de variante.
- Catalogo/admin producto variado.

### 3) useCarrito
Ubicacion:
- `src/modules/ventas/_shared/hooks/useCarrito.ts`

Responsabilidad:
- CRUD de items de carrito.
- Merge por SKU+variante.

Consumidores:
- POS.
- Storefront futuros.

### 4) useCheckout
Ubicacion:
- `src/modules/ventas/_shared/hooks/useCheckout.ts`

Responsabilidad:
- Reglas de calculo de subtotal/descuentos/total/iva.
- Evitar duplicidad de formulas por pantalla/modal.

Consumidores:
- POS Ticket.
- POS Cobro.

## Componentes POS especificos

### Layout y shell interno
- `ShiftHeader`
- Tabs internas (`Cobro rapido`, `Historial`, `Cierre`)

### Core de venta
- `Catalog`
- `Ticket`
- `QtyControl` (interno o compartible segun uso futuro)

### Modales
- `CobroModal`
- `PostVentaModal`
- `ClienteModal`
- `VarianteModal`
- `PausadosDrawer`
- `EgresoIngresoModal`
- `DevolucionModal`
- `SesionDetalleModal`

### Pantallas
- `CajaCerrada`
- `AperturaCaja`
- `CierreCaja`
- `HistorialCajas`

## Reuso de Design System global
- `Button`
- `Input`
- `Card`
- `Badge`
- `Modal`
- `Toast`
- `Avatar`

## Criterio para promover a `_shared`
Un componente/hook pasa de POS a `_shared` solo si:
1. Lo usan al menos dos superficies de ventas (ej: POS + storefront).
2. No contiene reglas exclusivas de caja POS.
3. Tiene props suficientemente agnosticas.
