# QA Checklist - POS (UI + Flujos)

## A. Smoke general
- [ ] La seccion `ventas/pos` carga sin errores.
- [ ] No hay cambios funcionales fuera de `pos` y `_shared`.
- [ ] Dark mode no rompe contraste ni layout.

## B. Caja cerrada / apertura
- [ ] Si `cajaAbierta=false`, aparece bloqueo de caja cerrada.
- [ ] CTA "Abrir caja" lleva al formulario de apertura.
- [ ] Apertura valida monto >= 0.
- [ ] Confirmar apertura habilita cobro rapido.

## C. Cobro rapido
- [ ] Busqueda filtra por nombre/codigo/SKU.
- [ ] Filtros por categoria responden correctamente.
- [ ] Favoritos se muestran arriba.
- [ ] Item sin stock se ve bloqueado.
- [ ] Item con variantes abre selector.
- [ ] "Item libre" agrega concepto al ticket.

## D. Ticket y totales
- [ ] Agregar item actualiza lista y subtotal.
- [ ] +/- cantidad actualiza subtotal y total.
- [ ] Eliminar item remueve fila y recalcula.
- [ ] Cupón aplica descuento y se puede quitar.
- [ ] Descuento manual aplica/quita correctamente.
- [ ] IVA y total coinciden entre ticket y modal cobro.

## E. Cobro y post-venta
- [ ] Modal cobro abre desde boton cobrar.
- [ ] En efectivo: calcula vuelto/falta en tiempo real.
- [ ] Confirmar cobro genera estado post-venta.
- [ ] Post-venta muestra comprobante y acciones.
- [ ] "Nuevo ticket" limpia estado de venta.

## F. Clientes
- [ ] Modal asociar cliente busca por DNI/telefono/nombre.
- [ ] Seleccionar cliente lo vincula al ticket.
- [ ] Crear cliente nuevo requiere campos obligatorios.

## G. Pausados
- [ ] Pausar guarda ticket en drawer de pausados.
- [ ] Retomar restaura ticket.
- [ ] Descartar elimina ticket pausado con confirmacion.

## H. Devolucion/intercambio
- [ ] Flujo 4 pasos navega correctamente.
- [ ] Paso 2 exige motivo para continuar.
- [ ] Paso 3 permite elegir metodo de reembolso.
- [ ] Paso 4 confirma y cierra flujo.

## I. Movimientos y cierre
- [ ] Modal ingreso/egreso valida monto.
- [ ] Egreso exige motivo.
- [ ] Cierre muestra teorico, conteo y diferencia.
- [ ] Si hay diferencia, motivo es obligatorio.
- [ ] Confirmar cierre cambia estado de caja.

## J. Historial
- [ ] Tabla renderiza sesiones.
- [ ] Filtros por estado/cajero/diferencia funcionan.
- [ ] Sesion en curso destacada.
- [ ] Detalle de sesion abre modal.

## K. No regresion tecnica
- [ ] `get_errors` sin errores en archivos modificados.
- [ ] `pnpm lint` (o subset) sin errores nuevos relevantes.
- [ ] Sin imports rotos hacia archivos externos al alcance.
