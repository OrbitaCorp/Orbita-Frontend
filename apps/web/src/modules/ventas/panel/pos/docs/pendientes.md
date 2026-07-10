# Pendientes — POS

> Lo que está en [implementacion.md](../implementacion.md) / [CLAUDE.md](../CLAUDE.md) / [goals.md](../goals.md) pero **no está en el código**, más las dependencias cruzadas con Alex y Mateo.
> Volver al [README](./README.md).

Impacto: **Alto** (bloquea uso productivo) · **Medio** (funcionalidad incompleta) · **Bajo** (pulido).

---

## Integración con backend (transversal)

- [ ] Persistir ventas reales al cobrar
  - Dónde: [POScobro.tsx](../POScobro.tsx) `handleConfirmarCobro` debería usar `useCrearTicket().mutateAsync()` (el hook ya existe en [useTickets.ts](../hooks/useTickets.ts) pero no se llama).
  - Referencia: §3.6 de implementacion.md.
  - Impacto: Alto · Bloquea a: cierre e historial reales.
- [ ] Descontar stock al cobrar (y compensar negativos al reingresar)
  - Dónde: backend + `useCrearTicket`.
  - Referencia: §0 (stock negativo en POS), §3.6.
  - Impacto: Alto · Bloquea a: Mateo (inventario).
- [ ] Numeración real de comprobantes (hoy contador local `contadorRef = 888`)
  - Dónde: [POScobro.tsx](../POScobro.tsx).
  - Referencia: §7 punto 20.
  - Impacto: Alto.
- [ ] Reemplazar todos los mocks por API real
  - Dónde: [hooks/useProductosPOS.ts](../hooks/useProductosPOS.ts), [useTickets.ts](../hooks/useTickets.ts), [useCaja.ts](../hooks/useCaja.ts), [useClientes.ts](../hooks/useClientes.ts).
  - Impacto: Alto · Bloquea a: Mateo, Alex.

---

## Cobro rápido

- [ ] Ítem libre / concepto (envío, servicio, gift card)
  - Dónde: [POScobro.tsx](../POScobro.tsx) tiene `onItemLibre={() => {/* TODO */}}`; el botón existe en [CatalogoPOS.tsx](../components/CatalogoPOS/CatalogoPOS.tsx) pero no hace nada. Usar el campo `esConcepto` de `TicketItem`.
  - Referencia: §3.2, §7 punto 6.
  - Impacto: Medio.
- [ ] Editar precio en línea
  - Dónde: `useTicketStore.editarPrecio` existe; falta UI en [TicketItem.tsx](../components/TicketPOS/TicketItem.tsx).
  - Referencia: §3.3.
  - Impacto: Medio · Bloquea a: Alex (permiso modificar precio).
- [ ] Descuento por item
  - Dónde: `useTicketStore.editarDescuentoItem` existe; falta UI.
  - Referencia: §3.3.
  - Impacto: Medio.
- [ ] Notas por item
  - Dónde: `useTicketStore.agregarNota` existe; falta UI.
  - Referencia: §3.3.
  - Impacto: Bajo.
- [ ] Venta sin stock con confirmación
  - Dónde: [ProductoCardPOS.tsx](../components/CatalogoPOS/ProductoCardPOS.tsx) hoy deshabilita la card; falta el modal de confirmación y el permiso.
  - Referencia: §3.2, §0.
  - Impacto: Medio · Bloquea a: Alex (permiso vender sin stock).
- [ ] Límite de % de descuento manual por rol
  - Dónde: [ZonaDescuentos.tsx](../components/TicketPOS/ZonaDescuentos.tsx) (sin tope hoy).
  - Referencia: §3.4, §7 punto 8.
  - Impacto: Medio · Bloquea a: Alex.
- [ ] Promos automáticas (aplicación automática + chip visible)
  - Dónde: no implementado; solo cupón manual.
  - Referencia: §3.4.
  - Impacto: Medio · Bloquea a: definición de modelo de descuentos (Mateo/B3).
- [ ] Cupones contra backend (hoy `CUPONES_MOCK`)
  - Dónde: [ZonaDescuentos.tsx](../components/TicketPOS/ZonaDescuentos.tsx).
  - Referencia: §0 (cupones en POS).
  - Impacto: Medio.

---

## Post-venta

- [ ] Enviar por WhatsApp y por Email
  - Dónde: [ModalPostVenta.tsx](../components/Cobro/ModalPostVenta.tsx) tienen `onClick={() => {}}` vacíos.
  - Referencia: §3.7, §7 punto 22.
  - Impacto: Medio.
- [ ] "Copiar link" real e "Imprimir" con plantilla
  - Dónde: hoy copia el `numeroComprobante` (no un link) y usa `window.print()` sin plantilla.
  - Referencia: §3.7, §7 punto 21.
  - Impacto: Bajo.
- [ ] "Ver detalle" del comprobante
  - Dónde: [ModalPostVenta.tsx](../components/Cobro/ModalPostVenta.tsx) el botón solo cierra el modal.
  - Impacto: Bajo.

---

## Devolución / intercambio

- [ ] Devolución funcional (hoy todo el modal es mock; al confirmar solo cierra)
  - Dónde: [ModalDevolucion.tsx](../components/Modales/ModalDevolucion.tsx) (`MOCK` con 2 tickets; sin efecto en stock/caja/comprobante).
  - Referencia: §3.10.
  - Impacto: Alto · Bloquea a: Alex (separación devoluciones POS vs admin).
- [ ] Buscar ticket original contra backend
  - Dónde: [ModalDevolucion.tsx](../components/Modales/ModalDevolucion.tsx) `buscar()`.
  - Referencia: §3.10.
  - Impacto: Alto.
- [ ] Intercambio: agregar producto de reemplazo + calcular diferencia de precio
  - Dónde: [ModalDevolucion.tsx](../components/Modales/ModalDevolucion.tsx) el toggle `intercambio` no hace nada más.
  - Referencia: §3.10, §0 (intercambios), §7 puntos 13-14.
  - Impacto: Medio · Bloquea a: Alex (aprobación de diferencia).

---

## Cierre de caja

- [ ] Devoluciones reales en el resumen (hoy KPI hardcoded en 0)
  - Dónde: [ResumenTurno.tsx](../components/Caja/ResumenTurno.tsx).
  - Referencia: §4.
  - Impacto: Medio.
- [ ] Desglose sobre ventas reales del turno (hoy `useTicketsRecientes` mock)
  - Dónde: [POSCierre.tsx](../POSCierre.tsx) — depende de persistir ventas.
  - Referencia: §4.
  - Impacto: Alto.
- [ ] Notificación al dueño cuando hay diferencia
  - Dónde: no implementado.
  - Referencia: §4, §7 punto 18.
  - Impacto: Medio · Bloquea a: Alex (canal/destinatarios).
- [ ] Comprobante de cierre imprimible
  - Dónde: no implementado.
  - Referencia: §4.
  - Impacto: Bajo.

---

## Historial

- [ ] Marcar sesión como auditada (dueño)
  - Dónde: [ModalDetalleSesion.tsx](../components/Historial/ModalDetalleSesion.tsx) / [POSHistorial.tsx](../POSHistorial.tsx).
  - Referencia: §5.2, §5.4.
  - Impacto: Bajo · Bloquea a: Alex (rol dueño).
- [ ] Paginación / scroll infinito
  - Dónde: [POSHistorial.tsx](../POSHistorial.tsx) no pasa `paginacion` a `DataTable` (la tabla ya lo soporta).
  - Referencia: §5.1.
  - Impacto: Bajo.
- [ ] Exportar PDF (hoy solo CSV)
  - Dónde: [POSHistorial.tsx](../POSHistorial.tsx) `exportarCSV`.
  - Referencia: §5.1.
  - Impacto: Bajo.
- [ ] Link a detalle de cada ticket emitido / reimprimir comprobante de cierre
  - Dónde: [ModalDetalleSesion.tsx](../components/Historial/ModalDetalleSesion.tsx).
  - Referencia: §5.2.
  - Impacto: Bajo.
- [ ] Registrar "quién forzó" el cierre
  - Dónde: [useCaja.ts](../hooks/useCaja.ts) `useForzarCierre` solo cambia estado a `'forzada'`.
  - Referencia: §4 (forzado por dueño).
  - Impacto: Bajo · Bloquea a: Alex.

---

## Permisos y roles (todo el sistema)

- [ ] Sistema de roles y enforcement de permisos
  - Dónde: no existe; cajero hardcodeado (`CAJERO_MOCK`). Ver [permisos.md](./permisos.md) completo.
  - Referencia: §3.12, §24.
  - Impacto: Alto · Bloquea a: **Alex** (árbol de permisos en `/tienda/settings/team`).
- [ ] Mostrar acciones bloqueadas deshabilitadas/con candado (no ocultas)
  - Referencia: §6 (permisos visibles).
  - Impacto: Medio · Bloquea a: Alex.
- [ ] Cajero real desde autenticación (no mock)
  - Dónde: [POSApertura.tsx](../POSApertura.tsx) `CAJERO_MOCK`.
  - Impacto: Alto · Bloquea a: Alex (auth).

---

## Transversales (spec §6, goals §12)

- [ ] Toasts de feedback en acciones clave
  - Dónde: no hay toasts en el POS.
  - Referencia: §6.
  - Impacto: Medio.
- [ ] Atajos de teclado (F1 buscar · F2 cobrar · F4 cliente · F8 pausar · ESC · Enter)
  - Referencia: §6.
  - Impacto: Bajo.
- [ ] Bloqueo multi-tab (segunda pestaña de POS)
  - Referencia: §0, §6.
  - Impacto: Medio.
- [ ] Estado "sin conexión" (indicador visual)
  - Referencia: §6.
  - Impacto: Bajo.
- [ ] Routing por pantalla (la spec lista 4 rutas; hoy hay una sola entrada `pos` con tabs internos)
  - Dónde: [POSShell.tsx](../POSShell.tsx).
  - Referencia: §1.
  - Impacto: Bajo.

---

## Limpieza de código (no spec)

- [ ] Tipos definidos pero sin uso: `TotalesPOS`, `ModalPOS`, `ResumenTurno` (tipo)
  - Dónde: [types.ts](../types.ts). Adoptar o eliminar.
  - Impacto: Bajo.
- [ ] `useHistorialCajas` / `useForzarCierre` no exportados en [hooks/index.ts](../hooks/index.ts)
  - Impacto: Bajo.
- [ ] Carpeta vacía `components/modals` (residual)
  - Impacto: Bajo.

---

## Dependencias cruzadas

### Necesita de **Mateo** (catálogo / clientes)
- Productos, stock y variantes reales (reemplazar [useProductosPOS.ts](../hooks/useProductosPOS.ts)).
- Descuento de stock al vender, incluida la compensación de negativos.
- Modelo de cliente unificado storefront/POS, sin duplicar por DNI (reemplazar [useClientes.ts](../hooks/useClientes.ts) y alinear `ClienteAsociado`/`ClienteBase`).
- Decisión de modelado de descuentos/promos (B3): producto + regla, no artículo duplicado — necesario para promos automáticas.

### Necesita de **Alex** (permisos / pedidos / devoluciones)
- Árbol de permisos por rol (`/tienda/settings/team`) — desbloquea todo [permisos.md](./permisos.md).
- Cajero/usuario real desde autenticación.
- Separación devoluciones POS (modal de mostrador) vs pantalla administrativa de pedidos online.
- Canal y destinatarios de la notificación de diferencia en cierre.
- Marcar sesión auditada (rol dueño) y registro de quién fuerza un cierre.
