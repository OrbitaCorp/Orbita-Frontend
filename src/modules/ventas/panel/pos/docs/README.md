# Módulo POS — Documentación

> Punto de Venta (mostrador físico) de Orbita · Rama Tienda.
> Esta carpeta documenta **lo que está implementado hoy en el código**. Lo que está en la spec pero no en el código vive en [pendientes.md](./pendientes.md).

---

## Qué es el POS

Herramienta de cobro en mostrador para un cajero que atiende a un cliente presente. La prioridad es velocidad: catálogo a la izquierda, ticket + cobro a la derecha, todo en una sola pantalla. Incluye apertura/cierre de caja con conteo de efectivo, tickets pausados, devoluciones, movimientos de efectivo e historial de sesiones.

Stack: **React 18 + TypeScript**, **Zustand** (estado de cliente), **TanStack Query v5** (datos de servidor, hoy con mocks), estilos inline con tokens `var(--color-*)`.

---

## Quién lo usa

La spec ([implementacion.md](../implementacion.md) §2-5) define dos roles. **Importante: el control de permisos por rol todavía NO está implementado en el código** — hoy el cajero está hardcodeado (`CAJERO_MOCK` en [POSApertura.tsx](../POSApertura.tsx)) y todas las acciones están disponibles sin chequeo. Ver [permisos.md](./permisos.md) para la matriz prevista.

- **Cajero** — abre su caja, cobra, pausa ventas, hace devoluciones y cierra su turno.
- **Dueño / supervisor** — además puede abrir caja por otro, forzar el cierre de una sesión ajena desde el Historial y (previsto) marcar sesiones como auditadas.

---

## Pantallas

El módulo se monta como una sola entrada de routing (`pos`) que renderiza [POSShell.tsx](../POSShell.tsx). El shell maneja la navegación interna por **tabs** (Cobro rápido · Historial · Cierre); no hay una URL distinta por pantalla.

| Pantalla | Archivo | Descripción |
|----------|---------|-------------|
| Cobro rápido | [POScobro.tsx](../POScobro.tsx) | Pantalla principal: catálogo + ticket + cobro. Si la caja está cerrada, muestra el bloqueo "Abrir caja". |
| Apertura | [POSApertura.tsx](../POSApertura.tsx) | Formulario de fondo inicial. Sub-flujo al que se entra desde el bloqueo de caja cerrada. |
| Cierre | [POSCierre.tsx](../POSCierre.tsx) | Conteo físico, diferencia con semáforo, motivo obligatorio si descuadra. |
| Historial | [POSHistorial.tsx](../POSHistorial.tsx) | Tabla de sesiones con filtros, detalle y forzar cierre. |

Ruta de acceso real: `/admin/{negocioId}/ventas/pos` → resuelta por [src/pages/admin/[negocioId]/[moduloPadre]/[seccion].tsx](../../../../../../pages/admin/%5BnegocioId%5D/%5BmoduloPadre%5D/%5Bseccion%5D.tsx), que carga `POSShell` con `dynamic(..., { ssr: false })`.

---

## Flujo principal (un día de cajero)

```
1. Entra a POS con la caja cerrada
   └─ Ve el bloqueo "La caja está cerrada" → clic "Abrir caja"

2. Apertura
   └─ Declara monto inicial en efectivo (+ notas) → "Abrir caja"
   └─ useCajaStore pasa a estado 'abierta', acumuladoTurno = 0

3. Cobra ventas (se repite N veces)
   ├─ Busca/elige producto del catálogo → se agrega al ticket
   │  └─ Si tiene variantes, abre ModalVariante para elegir talle/color
   ├─ (opcional) Asocia cliente, aplica cupón o descuento manual
   ├─ Clic "Cobrar $X" → ModalCobro
   │  └─ Elige método (efectivo/tarjeta/transferencia/QR) o pago mixto
   │  └─ Confirma → ModalPostVenta con número de comprobante
   └─ "Nuevo ticket" limpia y vuelve al catálogo

   Durante el turno puede además:
   ├─ Pausar una venta y retomarla después (DrawerPausados)
   ├─ Registrar ingreso/egreso de efectivo (ModalEgresoIngreso)
   └─ Hacer una devolución (ModalDevolucion)

4. Cierre (tab "Cierre")
   ├─ Ve resumen del turno + desglose por método
   ├─ Cuenta el efectivo físico → el sistema calcula la diferencia
   ├─ Si hay diferencia, escribe el motivo (obligatorio)
   └─ "Cerrar caja" → confirmación → vuelve al estado cerrada
```

Detalle paso a paso de cada uno en [flujos.md](./flujos.md).

---

## Índice de documentación

| Doc | Contenido |
|-----|-----------|
| [flujos.md](./flujos.md) | Los 8 flujos de usuario con pasos, estados de error y componentes involucrados. |
| [arquitectura.md](./arquitectura.md) | Árbol de archivos, stores, hooks, componentes y flujo de datos del cobro. |
| [tipos.md](./tipos.md) | Referencia de todos los tipos e interfaces de [types.ts](../types.ts). |
| [permisos.md](./permisos.md) | Matriz de permisos por rol (definida en spec; enforcement pendiente). |
| [componentes-compartidos.md](./componentes-compartidos.md) | Componentes de `_shared/` que el POS consume, con props y ejemplos. |
| [pendientes.md](./pendientes.md) | Lo definido en la spec pero no implementado + dependencias de Alex y Mateo. |

---

## Dependencias externas (otros módulos)

El POS hoy funciona con **datos mock** y no está conectado a backend. Cuando se integre, depende de:

- **Mateo (catálogo / clientes)**
  - Productos, stock y variantes reales que hoy mockea [useProductosPOS.ts](../hooks/useProductosPOS.ts).
  - Modelo de cliente unificado (storefront vs POS, evitar duplicados por DNI). Hoy mock en [useClientes.ts](../hooks/useClientes.ts).
- **Alex (permisos / pedidos / devoluciones)**
  - Árbol de permisos por rol — todo el [permisos.md](./permisos.md) depende de esto.
  - Separación devoluciones POS (modal de mostrador) vs pantalla administrativa de pedidos online.

Detalle en [pendientes.md](./pendientes.md).
