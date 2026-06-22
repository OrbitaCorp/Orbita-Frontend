# Permisos por rol — POS

> ⚠️ **Estado actual: NO implementado en código.** Hoy no existe sistema de roles ni chequeo de permisos en el POS. El cajero está hardcodeado (`CAJERO_MOCK` en [POSApertura.tsx](../POSApertura.tsx)) y **todas las acciones están disponibles para cualquiera**.
>
> Las tablas de abajo reflejan lo que define la spec ([implementacion.md](../implementacion.md) §2, §3.12, §4, §5, §7, §24). Son el **objetivo a implementar**, no el comportamiento real. La implementación del árbol de permisos depende de **Alex** (ver [pendientes.md](./pendientes.md)).

Roles previstos: **Dueño**, **Supervisor**, **Cajero**.

---

## Apertura de caja

| Acción | Dueño | Supervisor | Cajero |
|--------|:-----:|:----------:|:------:|
| Abrir su propia caja | ✅ | ✅ | ✅ |
| Abrir caja por otro cajero | ✅ | ✅ | ❌ |

---

## Cobro rápido

| Acción | Dueño | Supervisor | Cajero |
|--------|:-----:|:----------:|:------:|
| Agregar productos al ticket | ✅ | ✅ | ✅ |
| Asociar / crear cliente | ✅ | ✅ | ✅ |
| Aplicar cupón / promo habilitada | ✅ | ✅ | ✅ |
| Aplicar descuento libre (manual) | ✅ | ✅ | ⚠️ con límite de % por rol |
| Modificar precio en línea | ✅ | ✅ | ⚠️ según permiso |
| Agregar ítem libre / concepto | ✅ | ✅ | ⚠️ configurable |
| Pausar venta | ✅ | ✅ | ✅ |
| Cancelar venta (sin grabar) | ✅ | ✅ | ✅ |
| Cancelar venta ya cobrada | ✅ | ✅ | ⚠️ según permiso |
| Vender sin stock (queda negativo) | ✅ | ✅ | ⚠️ según permiso, con confirmación |
| Reimprimir ticket | ✅ | ✅ | ⚠️ según permiso |

---

## Modal de cobro

| Acción | Dueño | Supervisor | Cajero |
|--------|:-----:|:----------:|:------:|
| Cobrar con cualquier método habilitado | ✅ | ✅ | ✅ |
| Usar pago mixto | ✅ | ✅ | ⚠️ si está habilitado |

Los métodos habilitados y el pago mixto son configurables por el dueño (§7).

---

## Devolución

| Acción | Dueño | Supervisor | Cajero |
|--------|:-----:|:----------:|:------:|
| Iniciar devolución | ✅ | ✅ | ⚠️ según permiso |
| Devolver fuera de plazo | ✅ | ✅ | ❌ |
| Reembolso sobre el límite sin autorización | ✅ | ✅ | ❌ |

Plazo máximo y límite de monto sin autorización son configurables por rol (§7).

---

## Intercambio

| Acción | Dueño | Supervisor | Cajero |
|--------|:-----:|:----------:|:------:|
| Hacer cambio / intercambio | ✅ | ✅ | ⚠️ si está habilitado |
| Aprobar diferencia de precio | ✅ | ✅ | ❌ |

Permitir intercambios y exigir aprobación del dueño para la diferencia son configurables (§7).

---

## Egreso / ingreso de caja

| Acción | Dueño | Supervisor | Cajero |
|--------|:-----:|:----------:|:------:|
| Registrar ingreso/egreso | ✅ | ✅ | ⚠️ según permiso |

---

## Cierre de caja

| Acción | Dueño | Supervisor | Cajero |
|--------|:-----:|:----------:|:------:|
| Cerrar su propia caja | ✅ | ✅ | ✅ |
| Cerrar con diferencia (con motivo) | ✅ | ✅ | ⚠️ hasta el monto tolerable; sobre eso requiere autorización |

El monto máximo de diferencia tolerable antes de exigir autorización es configurable (§7).

---

## Forzar cierre

| Acción | Dueño | Supervisor | Cajero |
|--------|:-----:|:----------:|:------:|
| Forzar cierre de una sesión ajena | ✅ | ✅ | ❌ |

---

## Historial de cajas

| Acción | Dueño | Supervisor | Cajero |
|--------|:-----:|:----------:|:------:|
| Ver sus propias sesiones | ✅ | ✅ | ✅ |
| Ver sesiones de todos (filtro por cajero) | ✅ | ✅ | ❌ |
| Exportar CSV | ✅ | ✅ | ⚠️ según permiso |
| Marcar sesión como auditada | ✅ | ❌ | ❌ |

---

## Permisos fijos vs configurables

**Fijos (por diseño de la spec):**
- Un cajero solo abre/cierra su propia caja y ve solo sus sesiones.
- Solo el dueño marca sesiones como auditadas.
- Forzar cierre es exclusivo de dueño/supervisor.

**Configurables por el dueño** (§7 y §24, modal de Configuración a cargo de otro módulo):
- Métodos de pago habilitados y pago mixto.
- Límite de % de descuento libre por rol.
- Qué cupones/promos puede aplicar el cajero.
- Venta con stock negativo (on/off y por rol).
- Ítem libre (on/off).
- Plazo y límite de monto de devolución por rol.
- Permitir intercambios y aprobación de diferencia.
- Monto de diferencia tolerable en cierre.
- Permisos custom por rol: aplicar descuento, modificar precio, cancelar venta cobrada, egreso/ingreso, devolución, intercambio, vender sin stock, forzar cierre, marcar auditada.

> Nota: las acciones marcadas ⚠️ dependen de configuración o permiso fino que **hoy no existe**. Al implementarse, el POS debe mostrar las acciones bloqueadas **deshabilitadas/con candado, no ocultas** (spec §6 "permisos visibles").
