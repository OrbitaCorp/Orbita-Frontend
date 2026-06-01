# Roadmap de Implementacion POS (Ventas Panel)

## Objetivo
Implementar el modulo POS con paridad visual y funcional respecto a ClaudeDesing, encapsulado en `src/modules/ventas/panel/pos` y reutilizando piezas compartidas en `src/modules/ventas/_shared`.

## Alcance confirmado
- Rutas objetivo: solo `admin/[negocioId]/ventas/pos` (sin crear rutas `tienda/pos/*` por ahora).
- Fase inicial: UI + flujos frontend.
- Tipografia: Geist (sin Sora).
- Limites de edicion: `pos` y `_shared`.

## Fases

### Fase 1 - Base del modulo
- Normalizar entrypoint `POScobro.tsx`.
- Crear estructura interna por dominio: `types`, `mock`, `hooks`, `components`, `screens`.
- Definir estado central POS (vista activa, sesion de caja, ticket actual, modales, pausados).

Criterio de cierre:
- El entrypoint renderiza una vista funcional con tabs POS.
- Sin errores de TypeScript/lint en archivos nuevos.

### Fase 2 - Capa compartida `_shared`
- Implementar hooks reutilizables:
  - `useCarrito`
  - `useCheckout`
- Implementar componentes compartibles:
  - `ProductoCard`
  - `MatrizVariantes`

Criterio de cierre:
- POS consume al menos `useCarrito`, `useCheckout`, `ProductoCard`, `MatrizVariantes`.

### Fase 3 - Pantallas core
- Caja cerrada
- Apertura de caja
- Cobro rapido
- Cierre de caja
- Historial de cajas

Criterio de cierre:
- Navegacion interna entre pantallas.
- Estados vacio/sin caja abierta visibles.

### Fase 4 - Modales y subflujos
- Cobro
- Post-venta
- Asociar/crear cliente
- Selector de variante
- Devolucion/intercambio (4 pasos)
- Movimientos ingreso/egreso
- Tickets pausados (drawer)
- Detalle de sesion

Criterio de cierre:
- Flujo completo: apertura -> cobro -> post-venta -> cierre -> historial.

### Fase 5 - Reglas transversales (iterativa)
- Atajos de teclado (F1/F2/F4/F8/ESC/Enter).
- Permisos visibles (acciones disabled, no ocultas).
- Prevencion multi-tab POS.
- Toasts y confirmaciones destructivas.

Criterio de cierre:
- Checklist de `qa.md` completo.

## Riesgos
- Alineacion pendiente con backend para endpoints reales.
- Configuracion avanzada (25 settings) queda para integracion posterior.
- Permisos por rol requieren contrato de auth/autorizacion.

## Definicion de terminado (MVP UI+Flujos)
- Paridad visual de alto nivel con `pantallas/*.png`.
- Flujos interactivos navegables sin backend real.
- Reutilizacion en `_shared` para piezas candidatas a otros submodulos.
- Sin impacto en modulos fuera de `pos` y `_shared`.
