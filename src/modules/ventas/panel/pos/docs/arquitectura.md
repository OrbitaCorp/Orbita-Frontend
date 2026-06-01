# Arquitectura técnica — POS

> Estructura real en disco, stores, hooks, componentes y flujo de datos.
> Volver al [README](./README.md) · ver [tipos](./tipos.md).

---

## Estructura de archivos

```
ventas/panel/pos/
├── CLAUDE.md, implementacion.md, goals.md, qa.md   # contexto y spec (no editar)
├── img/                          # capturas de referencia visual
├── ClaudeDesing/                 # prototipo Claude Design — NO usar como código
├── docs/                         # esta documentación
│
├── index.ts                      # barrel: pantallas + types + stores + hooks
├── types.ts                      # todos los tipos del módulo
│
├── POSShell.tsx                  # orquestador: tabs + navegación entre pantallas
├── POScobro.tsx                  # pantalla principal de cobro (ojo: c minúscula)
├── POSApertura.tsx               # apertura de caja
├── POSCierre.tsx                 # cierre de caja
├── POSHistorial.tsx              # historial de sesiones
│
├── stores/                       # Zustand (estado de cliente)
│   ├── index.ts
│   ├── useTicketStore.ts         # ticket actual (items, cliente, descuentos)
│   ├── useCajaStore.ts           # sesión de caja + acumulado del turno
│   └── usePausadosStore.ts       # tickets en pausa (persiste en localStorage)
│
├── hooks/                        # TanStack Query (datos de servidor, hoy mock)
│   ├── index.ts                  # ⚠️ no re-exporta useHistorialCajas/useForzarCierre
│   ├── useProductosPOS.ts        # productos + categorías
│   ├── useTickets.ts             # tickets recientes + crear ticket
│   ├── useCaja.ts                # sesiones, movimientos, abrir, forzar, historial
│   └── useClientes.ts            # CLIENTES_MOCK (no es un hook, es data)
│
└── components/
    ├── Caja/                     # FormApertura, HeaderTurno, ResumenTurno,
    │                             #   ConteoCierre, DiferenciaIndicador
    ├── CatalogoPOS/              # CatalogoPOS, FiltrosCatalogo, GrillaProductos,
    │                             #   ProductoCardPOS
    ├── TicketPOS/                # TicketPOS, TicketItem, TicketTotales,
    │                             #   TicketVacio, ZonaDescuentos
    ├── Cobro/                    # ModalCobro, MetodoPago, InputMonto, ModalPostVenta
    ├── Modales/                  # DrawerPausados, ModalEgresoIngreso,
    │                             #   ModalDevolucion, ModalVariante
    ├── Historial/               # TablaHistorial, FiltrosHistorial, ModalDetalleSesion
    └── modals/                   # ⚠️ carpeta vacía (residual, no usar)
```

Notas:
- No existen `Favoritos.tsx` ni `PagoMixto.tsx` (los menciona CLAUDE.md): favoritos está inline en `CatalogoPOS`, pago mixto inline en `ModalCobro`.
- Cada subcarpeta de `components/` tiene su `index.ts` barrel.

---

## Estado (Stores Zustand)

### useTicketStore — [stores/useTicketStore.ts](../stores/useTicketStore.ts)
Ticket en construcción. **No persiste.**

| Guarda | Tipo |
|--------|------|
| `items` | `TicketItem[]` |
| `cliente` | `ClienteAsociado \| null` |
| `cupon` | `Descuento \| null` |
| `descuentoManual` | `Descuento \| null` |

Acciones: `agregarItem` (agrupa por `${productoId}::${varianteId ?? 'base'}`), `removerItem`, `actualizarCantidad` (≤0 elimina), `editarPrecio`, `editarDescuentoItem`, `agregarNota`, `asociarCliente`, `quitarCliente`, `aplicarCupon`, `quitarCupon`, `aplicarDescuentoManual`, `limpiarTicket`.

Consumido por: `TicketPOS`, `POScobro`, `DrawerPausados`, `ModalVariante`.
⚠️ `editarPrecio`, `editarDescuentoItem`, `agregarNota` existen en el store pero **ningún componente los usa todavía** (no hay UI).

### useCajaStore — [stores/useCajaStore.ts](../stores/useCajaStore.ts)
Sesión de caja del turno actual. **No persiste.**

| Guarda | Tipo |
|--------|------|
| `sesion` | `SesionCaja \| null` |
| `estado` | `'cerrada' \| 'abierta'` |
| `acumuladoTurno` | `number` |

Acciones: `abrirCaja`, `cerrarCaja` (siempre deja `estado: 'cerrada'`), `incrementarAcumulado`, `resetearAcumulado`.

Consumido por: `POScobro`, `POSApertura`, `POSCierre`, `POSShell`, `ModalEgresoIngreso`.

### usePausadosStore — [stores/usePausadosStore.ts](../stores/usePausadosStore.ts)
Tickets en pausa. **Persiste en localStorage** (middleware `persist`, key `pos-pausados`).

| Guarda | Tipo |
|--------|------|
| `tickets` | `TicketPausado[]` |

Acciones: `pausar` (devuelve id), `retomar` (lo quita y lo devuelve), `eliminar`, `limpiarTodos`.

Consumido por: `TicketPOS`, `DrawerPausados`, `POScobro`, `POSCierre`.

### Relaciones store → componentes

```
useTicketStore ──┬── TicketPOS (lee items/cliente/desc, escribe todo)
                 ├── POScobro (agregarItem, limpiarTicket)
                 ├── ModalVariante (agregarItem)
                 └── DrawerPausados (limpiar + re-agregar al retomar)

useCajaStore ────┬── POSShell (estado)
                 ├── POScobro (sesion, acumulado, incrementar)
                 ├── POSApertura (abrirCaja)
                 ├── POSCierre (sesion, cerrarCaja)
                 └── ModalEgresoIngreso (efectivo actual)

usePausadosStore ┬── TicketPOS (pausar)
                 ├── DrawerPausados (retomar/eliminar)
                 ├── POScobro (count para el badge)
                 └── POSCierre (aviso pre-cierre)
```

---

## Datos del servidor (Hooks)

Todos usan TanStack Query con **funciones mock** (`setTimeout` + arrays module-level). No hay backend conectado.

### [hooks/useProductosPOS.ts](../hooks/useProductosPOS.ts)
| Hook | Devuelve | queryKey | staleTime |
|------|----------|----------|-----------|
| `useProductosPOS(filtros)` | `ProductoPOS[]` filtrado por búsqueda/categoría/favoritos | `['productos-pos', filtros]` | 30 s |
| `useCategoriasPOS()` | `CategoriaPOS[]` | `['categorias-pos']` | 5 min |

### [hooks/useTickets.ts](../hooks/useTickets.ts)
| Hook | Devuelve / hace | queryKey |
|------|-----------------|----------|
| `useTicketsRecientes(cajaId?)` | `ResultadoVenta[]` (mock, 1 ticket inicial) | `['tickets-recientes', cajaId]` |
| `useCrearTicket()` | mutation `crearTicketMock` → invalida tickets y sesiones | — |

⚠️ `useCrearTicket` **no se usa en ningún lado**. El cobro arma el `ResultadoVenta` localmente en `POScobro`.

### [hooks/useCaja.ts](../hooks/useCaja.ts)
| Hook | Devuelve / hace | queryKey |
|------|-----------------|----------|
| `useSesionesCaja()` | `SesionCaja[]` | `['sesiones-caja']` |
| `useHistorialCajas()` | `FilaSesion[]` (sesión + ventas + diferencia + desglose) | `['historial-cajas']` |
| `useMovimientosCaja(cajaId?)` | `MovimientoCaja[]` | `['movimientos-caja', cajaId]` |
| `useAbrirCaja()` | mutation → invalida `sesiones-caja` | — |
| `useRegistrarMovimiento()` | mutation → invalida `movimientos-caja` | — |
| `useForzarCierre()` | mutation → estado `'forzada'`, invalida historial | — |

⚠️ `useHistorialCajas` y `useForzarCierre` **no están en** `hooks/index.ts`; `POSHistorial` los importa directo desde `./hooks/useCaja`.

### [hooks/useClientes.ts](../hooks/useClientes.ts)
No es un hook: exporta `CLIENTES_MOCK: ClienteAsociado[]` (4 clientes). Lo consume `TicketPOS` para alimentar `SelectorCliente`.

**Estado de conexión: 100% mock.** Ningún hook llama a una API real.

---

## Componentes principales

### Caja/

| Componente | Qué hace | Props | Consume |
|-----------|----------|-------|---------|
| `FormApertura` | Form de monto inicial + notas | `cajero, onConfirm, onCancel, cargando?` | — |
| `HeaderTurno` | Barra de estado de caja + acciones del turno | `sesion, acumulado, pausadosCount, onMovimientos, onDevolucion, onPausados, onCerrar` | — |
| `ResumenTurno` | 4 KPIs + tabla desglose por método | `ventasTotales, ticketsEmitidos, movimientos, desglose` | — |
| `ConteoCierre` | Total teórico + input conteo + motivo + notas | `totalTeorico, conteo, onConteoChange, motivo, onMotivoChange, notas, onNotasChange` | `DiferenciaIndicador` |
| `DiferenciaIndicador` | Semáforo de diferencia (cuadra/sobra/falta) | `conteoN, totalTeorico` | — |

### CatalogoPOS/

| Componente | Qué hace | Props | Consume |
|-----------|----------|-------|---------|
| `CatalogoPOS` | Búsqueda (debounce 250 ms) + filtros + favoritos + grilla | `onAgregarProducto, onItemLibre` | `useProductosPOS`, `useCategoriasPOS`, `FiltrosCatalogo`, `GrillaProductos`, `ProductoCardPOS` |
| `FiltrosCatalogo` | Chips de categoría | `categorias, categoriaActiva, onChange` | — |
| `GrillaProductos` | Grilla con skeleton de carga | `titulo, productos, cargando?, onAgregarProducto` | `ProductoCardPOS` |
| `ProductoCardPOS` | Card de producto, estado sin-stock | `producto, onClick` | — |

### TicketPOS/

| Componente | Qué hace | Props | Consume |
|-----------|----------|-------|---------|
| `TicketPOS` | Columna derecha: cliente + items + descuentos + totales + cobrar/pausar | `onCobrar(total)` | `useTicketStore`, `usePausadosStore`, `SelectorCliente`, `CLIENTES_MOCK`, sub-componentes |
| `TicketItemRow` | Fila de item con `[−][qty][+]`, variante, subtotal | `item, onIncrementar, onDecrementar, onRemover` | — |
| `TicketTotales` | Subtotal, descuentos, IVA, TOTAL | `subtotal, descuentos, iva, total` | — |
| `TicketVacio` | Estado vacío | — | — |
| `ZonaDescuentos` | Cupón + descuento manual (colapsable) | `cupon, descuentoManual, onAplicarCupon, onQuitarCupon, onAplicarDescuentoManual, disabled?` | `CUPONES_MOCK` |

### Cobro/

| Componente | Qué hace | Props | Consume |
|-----------|----------|-------|---------|
| `ModalCobro` | Método de pago, efectivo, pago mixto | `isOpen, total, onClose, onConfirmar(metodos, vuelto?)` | `SelectorMetodoPago`, `InputMonto` |
| `SelectorMetodoPago` | Grilla 5 métodos | `seleccionado, onChange` | — |
| `InputMonto` | Monto recibido + vuelto/falta + montos rápidos | `total, monto, onChange` | — |
| `ModalPostVenta` | Éxito + comprobante + acciones | `isOpen, resultado, onNuevoTicket, onClose` | `LABELS_METODO` |

`MetodoPago.tsx` exporta además `METODOS_PAGO` y `LABELS_METODO`. `InputMonto.tsx` exporta `parseMonto`.

### Modales/

| Componente | Qué hace | Props | Consume |
|-----------|----------|-------|---------|
| `DrawerPausados` | Drawer lateral de pausados | `isOpen, onClose` | `usePausadosStore`, `useTicketStore` |
| `ModalEgresoIngreso` | Ingreso/egreso de efectivo | `isOpen, onClose` | `useCajaStore`, `useRegistrarMovimiento` |
| `ModalDevolucion` | Flujo de 4 pasos (mock) | `isOpen, onClose` | — (mock interno) |
| `ModalVariante` | Wrapper de `SelectorVariante` | `isOpen, producto, onClose` | `SelectorVariante`, `useTicketStore` |

### Historial/

| Componente | Qué hace | Props | Consume |
|-----------|----------|-------|---------|
| `TablaHistorial` | Tabla de sesiones con badges y acciones | `datos, cargando, onSeleccionarSesion, onForzarCierre` | `DataTable` |
| `FiltrosHistorial` | Filtros fecha/cajero/estado/diferencia + export CSV | `filtros, onFiltrosChange, onExportarCSV, totalRegistros` | — |
| `ModalDetalleSesion` | Detalle (resumen + movimientos) | `fila, onCerrar` | — |

---

## Componentes de `_shared/` que usa el POS

| Componente | Para qué | Dónde |
|-----------|----------|-------|
| `SelectorCliente` | Buscar/crear cliente | `TicketPOS` |
| `SelectorVariante` | Matriz talle/color con stock | `ModalVariante` |
| `ModalConfirmacion` | Confirmaciones destructivas | `POSCierre`, `POSHistorial` |
| `DataTable` | Tabla genérica del historial | `TablaHistorial` |

El POS **no** usa `SearchInput`, `EmptyState`, `StatusBadge`, `MontoDisplay` ni `SelectorProducto` de `_shared` (construyó equivalentes inline). `SelectorVariante` sí usa `MontoDisplay` internamente. Detalle en [componentes-compartidos.md](./componentes-compartidos.md).

---

## Flujo de datos: cobro completo

```
Cajero clic "Cobrar $X" en TicketPOS
   │  TicketPOS calcula total (subtotal − cupón − manual)
   ▼
onCobrar(total)  ──►  POScobro: setTotalACobrar(total) + abre ModalCobro
   │
   ▼
ModalCobro: elige método / efectivo / mixto
   │  arma MetodoPago[] (+ vuelto si efectivo)
   ▼
onConfirmar(metodos, vuelto)  ──►  POScobro.handleConfirmarCobro
   │
   ├─ arma ResultadoVenta (comprobante = contadorRef local)   ⚠️ no llama useCrearTicket
   ├─ useCajaStore.incrementarAcumulado(total)                (en memoria)
   ├─ useTicketStore.limpiarTicket()
   └─ abre ModalPostVenta(resultado)
   ▼
ModalPostVenta: muestra comprobante/total/método/vuelto
   └─ "Nuevo ticket" → limpia resultado, listo para la próxima venta
```

⚠️ En la cadena real **no hay paso a API ni descuento de stock**. El punto de integración futuro es reemplazar el armado local por `useCrearTicket().mutateAsync(...)` y que el backend persista el ticket, descuente stock y devuelva el comprobante.
