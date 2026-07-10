# Flujos de usuario — POS

> Pasos reales según el código. Donde un paso es mock o no persiste, está marcado con ⚠️.
> Volver al [README](./README.md) · ver [arquitectura](./arquitectura.md).

Convención de estado de caja: `useCajaStore.estado` solo toma `'cerrada' | 'abierta'`. El valor `'forzada'` existe en `SesionCaja.estado` pero solo se setea en el mock del Historial.

---

## Flujo 1 — Apertura de caja

**Componentes:** [POSApertura.tsx](../POSApertura.tsx) → [FormApertura.tsx](../components/Caja/FormApertura.tsx) · store [useCajaStore](../stores/useCajaStore.ts)

**Pre-condición:** `estado === 'cerrada'`.

**Pasos:**
1. En Cobro rápido con caja cerrada, el cajero ve el bloqueo `CajaCerrada` y hace clic en "Abrir caja" → `POSShell` cambia a la pantalla `apertura`.
2. `FormApertura` muestra el cajero (hoy `CAJERO_MOCK`), la fecha y un input de monto inicial.
3. Ingresa el monto (puede ser 0) y notas opcionales.
4. Clic "Abrir caja" → `abrirCaja({ montoInicial, cajero, notas })`.
5. El store crea la `SesionCaja` (`estado: 'abierta'`, `fechaApertura: now`, `acumuladoTurno: 0`) y `POSShell` vuelve a `cobro`.

**Estados de error / borde:**
- Monto negativo → error inline "El monto inicial no puede ser negativo", no abre.
- Caja ya abierta → `POSApertura` renderiza `CajaYaAbierta` con la hora y nombre, y CTAs "Ir al POS" / "Volver al dashboard".

**Post-condición:** sesión abierta, se habilita el cobro.

---

## Flujo 2 — Cobro de una venta simple

**Componentes:** [POScobro.tsx](../POScobro.tsx), [CatalogoPOS](../components/CatalogoPOS/CatalogoPOS.tsx), [TicketPOS](../components/TicketPOS/TicketPOS.tsx), [ModalCobro](../components/Cobro/ModalCobro.tsx), [ModalPostVenta](../components/Cobro/ModalPostVenta.tsx) · stores [useTicketStore](../stores/useTicketStore.ts), [useCajaStore](../stores/useCajaStore.ts)

**Pre-condición:** caja abierta.

**Pasos:**
1. El cajero busca (debounce 250 ms) o filtra por categoría en `CatalogoPOS`.
2. Clic en una `ProductoCardPOS` → `handleAgregarProducto`:
   - Sin variantes → `agregarItem` directo (cantidad 1).
   - Con variantes → abre `ModalVariante` (ver Flujo 2 con variante).
3. El item aparece en `TicketPOS`. El store agrupa por `id = ${productoId}::${varianteId ?? 'base'}`: si ya existe, suma cantidad.
4. Ajusta cantidades con `[−][qty][+]` o elimina con la X. `actualizarCantidad` con cantidad ≤ 0 remueve el item.
5. `TicketPOS` calcula en vivo: `subtotal`, descuentos, `total`, `iva = total*21/121`.
6. Clic "Cobrar $X" → `onCobrar(total)` setea `totalACobrar` y abre `ModalCobro`.
7. En `ModalCobro` elige método. Para efectivo, `InputMonto` muestra vuelto/falta y montos rápidos.
8. "Confirmar cobro" → `handleConfirmarCobro` en `POScobro`:
   - Arma `ResultadoVenta` con número de comprobante (contador local `contadorRef`, arranca en 888). ⚠️ No usa `useCrearTicket`; **el ticket no se persiste y el stock no se descuenta**.
   - `incrementarAcumulado(total)` y `limpiarTicket()`.
   - Abre `ModalPostVenta`.
9. `ModalPostVenta` muestra el comprobante, total, método y vuelto. "Nuevo ticket" cierra y deja todo limpio.

**Estados de error / borde:**
- Ticket vacío → botón "Cobrar" deshabilitado; se muestra `TicketVacio`.
- Producto sin stock → card con opacidad 0.45, `cursor: not-allowed`, no se agrega. ⚠️ La venta sin stock con confirmación (spec) no está implementada.

### Variantes del flujo

- **Con producto con variantes:** clic abre [ModalVariante](../components/Modales/ModalVariante.tsx) (wrapper de `SelectorVariante`). Se elige talle/color (stock por variante) y cantidad → `agregarItem` con `variante: "Talle / Color"` y `varianteId`.
- **Con cliente asociado:** en `TicketPOS`, "Asociar cliente" abre [SelectorCliente](../../../_shared/components/SelectorCliente.tsx). Buscar por nombre/DNI/teléfono o crear nuevo → `asociarCliente`. Se muestra chip con inicial, nombre y DNI; la X lo quita (`quitarCliente`).
- **Con cupón:** en [ZonaDescuentos](../components/TicketPOS/ZonaDescuentos.tsx), tipea el código y "Aplicar". ⚠️ Validación contra `CUPONES_MOCK` (`PROMO20`, `VERANO10`, `DESC500`). Código inválido → error inline. El cupón aplica sobre el subtotal.
- **Con descuento manual:** el bloque arranca colapsado. Clic en "% Descuento manual" lo expande → toggle `%`/`$` + monto → "Ok". Aplica sobre `(subtotal − cupón)`. ⚠️ No hay límite por rol (spec lo pide).
- **Con pago mixto:** en `ModalCobro`, "Pago mixto" muestra 2 filas `[método][monto]` y un "Restante". Se confirma con `sumaM > 0`. Los métodos con monto > 0 se mandan como array de `MetodoPago`.

**Post-condición:** acumulado del turno incrementado en memoria; ticket limpio.

---

## Flujo 3 — Pausar y retomar una venta

**Componentes:** [TicketPOS](../components/TicketPOS/TicketPOS.tsx), [DrawerPausados](../components/Modales/DrawerPausados.tsx) · store [usePausadosStore](../stores/usePausadosStore.ts) (persistido)

**Pasos:**
1. Con items cargados, "Pausar venta" → `pausar({ items, cliente })` y `limpiarTicket()`.
2. El ticket se guarda en `usePausadosStore`, **persistido en localStorage** (key `pos-pausados`), con `id`, `pausadoEn` y nota opcional.
3. El badge del botón "Tickets pausados" (en `HeaderTurno`) muestra la cantidad.
4. Abrir el drawer → lista de `PausadoCard` con avatar/cliente, hora, cantidad de items y total.
5. "Retomar" → `handleRetomar`: `retomar(id)` (lo saca de pausados), `limpiarTicket()`, re-agrega cada item al ticket y re-asocia cliente si había. Cierra el drawer.
6. "Descartar" (ícono tacho) → pide confirmación inline en la card → `eliminar(id)`.

**Estados de error / borde:**
- Sin items → "Pausar venta" deshabilitado.
- Sin pausados → drawer muestra "No hay tickets pausados".

**Post-condición:** ticket retomado en el carrito o descartado. Persiste entre recargas de página.

---

## Flujo 4 — Devolución en mostrador

**Componente:** [ModalDevolucion.tsx](../components/Modales/ModalDevolucion.tsx) (4 pasos)

> ⚠️ **Todo este flujo es mock.** Trabaja sobre `MOCK` (2 tickets: `#000889`, `#000001`). Al confirmar solo hace `onClose()`: **no devuelve stock, no ajusta caja, no genera comprobante.**

**Pasos:**
1. **Buscar** — input por Nº de comprobante o DNI. `buscar()` matchea contra el mock. Encontrado → muestra resumen; no encontrado → error.
2. **Items** — checkboxes por item con su `maxADevolver` (descuenta lo ya devuelto). Ajuste de cantidad si `maxADevolver > 1`. Motivo obligatorio (chips: defectuoso / no le gustó / error de cobro / otro). Toggle de intercambio (ver Flujo 5).
3. **Reembolso** — radio: mismo método / efectivo / nota de crédito. Si el original fue tarjeta, aviso de demora 5-10 días.
4. **Confirmar** — resumen (items, monto, método, stock reingresado, motivo) → "Confirmar devolución".

**Estados de error / borde:**
- Ticket no encontrado → mensaje, no avanza.
- Sin items o sin motivo → "Continuar" del paso 2 deshabilitado.
- Item con `maxADevolver === 0` → fila atenuada, no seleccionable.

---

## Flujo 5 — Intercambio / cambio de producto

**Componente:** [ModalDevolucion.tsx](../components/Modales/ModalDevolucion.tsx) (toggle en paso 2)

**Pasos (implementados):**
1. En el paso 2, activar "Cambio / intercambio".

> ⚠️ **El resto del intercambio no está implementado.** El toggle cambia un booleano (`intercambio`) pero **no agrega un producto de reemplazo ni calcula la diferencia de precio**. La spec (§3.10) pide devolver el item, agregar el nuevo y calcular diferencia a pagar/devolver. Ver [pendientes.md](./pendientes.md).

---

## Flujo 6 — Egreso / ingreso de efectivo

**Componente:** [ModalEgresoIngreso.tsx](../components/Modales/ModalEgresoIngreso.tsx) · hook [useRegistrarMovimiento](../hooks/useCaja.ts) · store [useCajaStore](../stores/useCajaStore.ts)

**Pasos:**
1. Desde `HeaderTurno`, "Movimientos" abre el modal.
2. Toggle Ingreso / Egreso (default egreso).
3. Muestra "Efectivo actual en caja" = `montoInicial + acumuladoTurno`.
4. Monto obligatorio. Motivo obligatorio solo en egreso (opcional en ingreso).
5. "Registrar movimiento" → `useRegistrarMovimiento.mutateAsync({ tipo, monto, motivo, cajeroId })`.

**Estados de error / borde:**
- Monto 0 o egreso sin motivo → botón deshabilitado.
- Error de la mutation → mensaje "Error al registrar el movimiento".

> ⚠️ Los movimientos se guardan en un array mock module-level (`MOCK_MOVIMIENTOS`). Afectan el cierre solo dentro de la sesión mock. Quién puede hacerlo (permiso) no está chequeado.

---

## Flujo 7 — Cierre de caja

**Componentes:** [POSCierre.tsx](../POSCierre.tsx), [ResumenTurno](../components/Caja/ResumenTurno.tsx), [ConteoCierre](../components/Caja/ConteoCierre.tsx), [DiferenciaIndicador](../components/Caja/DiferenciaIndicador.tsx), [ModalConfirmacion](../../../_shared/components/ModalConfirmacion.tsx)

**Pasos:**
1. Tab "Cierre" → `POSCierre`. Lee `useCajaStore`, `usePausadosStore`, `useTicketsRecientes(sesion.id)`, `useMovimientosCaja(sesion.id)`.
2. `ResumenTurno` muestra 4 KPIs (ventas, tickets, devoluciones ⚠️ hardcoded 0, mov. manuales) + desglose por método.
3. `totalTeorico = montoInicial + efectivoVentas + ingresos − egresos`.
4. El cajero ingresa el conteo físico en `ConteoCierre`. `DiferenciaIndicador` muestra el semáforo: verde cuadra / amarillo sobra / rojo falta.
5. Si hay diferencia, aparece textarea de motivo (obligatorio). Notas opcionales siempre.
6. Si hay tickets pausados, banner de advertencia.
7. "Cerrar caja" → `ModalConfirmacion` (variante danger) con resumen → confirmar → `cerrarCaja()` y vuelve a `cobro`.

**Estados de error / borde:**
- Diferencia sin motivo → botón "Cerrar caja" deshabilitado (`puedeConfirmar = !hayDiferencia || motivo`).
- "Volver al POS" descarta el cierre.

> ⚠️ El desglose se calcula sobre `useTicketsRecientes` (mock, solo trae `vt-001` inicial) más `acumuladoTurno` real. La notificación al dueño por diferencia (spec) no existe.

**Post-condición:** `estado === 'cerrada'`, `fechaCierre` seteada.

---

## Flujo 8 — Forzar cierre (dueño)

**Componentes:** [POSHistorial.tsx](../POSHistorial.tsx), [TablaHistorial](../components/Historial/TablaHistorial.tsx), [ModalConfirmacion](../../../_shared/components/ModalConfirmacion.tsx) · hook [useForzarCierre](../hooks/useCaja.ts)

**Pasos:**
1. Tab "Historial" → tabla de sesiones. La sesión abierta tiene badge "En curso" y botón "Forzar".
2. "Forzar" → `ModalConfirmacion` (variante warning) con cajero y hora de apertura.
3. Confirmar → `useForzarCierre.mutate(sesionId)`: en el mock cambia `estado` a `'forzada'` y setea `fechaCierre`. Invalida `sesiones-caja` e `historial-cajas`.

**Estados de error / borde:**
- Solo las sesiones con `estado === 'abierta'` muestran "Forzar".
- `isPending` deshabilita el modal mientras procesa.

> ⚠️ Mock. No hay chequeo de que quien fuerza sea dueño/supervisor. No registra "quién lo forzó".
