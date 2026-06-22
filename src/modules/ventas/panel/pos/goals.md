# Goals Funcionales del POS

## 1) Caja cerrada
Objetivo:
- Bloquear operacion de cobro cuando no hay caja abierta.

Se espera:
- Overlay con mensaje claro.
- CTA principal: "Abrir caja".
- No permitir acciones de venta hasta abrir.

## 2) Apertura de caja
Objetivo:
- Registrar fondo inicial y comenzar turno.

Se espera:
- Formulario con cajero, monto inicial y notas.
- Validacion monto >= 0.
- Confirmar apertura cambia estado de sesion a abierta.
- Cancelar vuelve a la vista anterior sin abrir.

## 3) Cobro rapido
Objetivo:
- Resolver la venta de mostrador en una sola pantalla.

Se espera:
- Columna izquierda: busqueda, categorias, favoritos y catalogo.
- Columna derecha: ticket, cliente, descuentos, totales y cobrar.
- Soporte de item libre.
- Productos con variantes abren selector.
- Productos sin stock reflejan estado visual y restricciones.

## 4) Modal de cobro
Objetivo:
- Confirmar metodo de pago y registrar la operacion.

Se espera:
- Metodos: efectivo, debito, credito, transferencia, QR.
- En efectivo: monto recibido, vuelto/falta, montos rapidos.
- Confirmacion de cobro habilitada solo con condiciones validas.

## 5) Post-venta
Objetivo:
- Dar cierre operativo inmediato a la caja.

Se espera:
- Estado de exito con numero de comprobante.
- Acciones: imprimir, enviar, copiar link, nuevo ticket.
- "Nuevo ticket" limpia carrito y estado de venta.

## 6) Asociar cliente
Objetivo:
- Vincular o crear cliente durante la venta.

Se espera:
- Buscar por DNI/telefono/nombre.
- Seleccionar cliente existente.
- Crear cliente nuevo con campos minimos requeridos.

## 7) Tickets pausados
Objetivo:
- Permitir pausa de venta y recuperacion posterior.

Se espera:
- Drawer lateral con lista de tickets en pausa.
- Retomar ticket.
- Descartar ticket con confirmacion.

## 8) Devolucion / intercambio
Objetivo:
- Gestionar devoluciones de mostrador en flujo guiado.

Se espera:
- 4 pasos: buscar comprobante -> items -> reembolso -> confirmar.
- Motivo obligatorio.
- Modo intercambio con calculo de diferencia.

## 9) Movimientos de caja
Objetivo:
- Registrar ingresos/egresos manuales.

Se espera:
- Selector ingreso/egreso.
- Monto obligatorio.
- Motivo obligatorio en egreso.

## 10) Cierre de caja
Objetivo:
- Reconciliar efectivo y cerrar turno.

Se espera:
- Resumen de turno y desglose por metodo.
- Total teorico vs conteo fisico.
- Diferencia con semaforo (cuadra/falta/sobra).
- Motivo obligatorio si hay diferencia.

## 11) Historial de cajas
Objetivo:
- Auditar sesiones pasadas y estado de caja actual.

Se espera:
- Tabla con filtros por fecha/cajero/estado/diferencia.
- Sesion abierta destacada.
- Acceso a detalle de sesion.

## 12) Requisitos transversales
Se espera:
- Dark mode compatible con tokens actuales.
- Estados vacio/carga/error/sin conexion visual.
- Confirmaciones destructivas.
- Toasts de feedback en acciones clave.
- Atajos de teclado (fase iterativa).
- Bloqueo multi-tab (fase iterativa).
