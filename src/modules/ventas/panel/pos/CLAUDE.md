# CLAUDE.md — Módulo POS (Orbita · Tienda)

> Este archivo da contexto a Claude Code cada vez que trabaje en `ventas/panel/pos/`.
> Leer antes de crear, editar o refactorizar cualquier archivo en esta carpeta.

---

## 1. Qué es este módulo

El POS (Punto de Venta) es la herramienta de cobro en mostrador físico de Orbita. La usa un cajero con un cliente esperando enfrente. La prioridad absoluta es velocidad y claridad.

**Pantallas:**
- `POSCobro.tsx` — pantalla principal de cobro (catálogo + ticket + pago)
- `POSApertura.tsx` — formulario de apertura de caja
- `POSCierre.tsx` — cierre de caja con conteo y diferencia
- `POSHistorial.tsx` — historial de sesiones de caja

**Archivos de referencia (NO modificar, solo leer):**
- `implementacion.md` — spec funcional completa con todas las decisiones cerradas
- `goals.md` — objetivos, métricas de UX, anti-objetivos
- `qa.md` — criterios de QA
- `img/` — capturas de Claude Design como referencia visual
- `ClaudeDesing/` — código exportado de Claude Design (referencia visual, NO copiar directamente)

---

## 2. Stack y dependencias

### Core
- **React 18+** con TypeScript
- **Tailwind CSS v4** con tokens custom en `:root` (importados globalmente)
- **Zustand** para estado del cliente (store por feature)
- **TanStack Query (React Query)** para datos del servidor (productos, tickets, historial)

### Imports del design system (globales, no importar de nuevo)
Los tokens de color están en `:root` y `.dark`. Usarlos siempre con `var(--color-*)`:
```css
var(--color-primary)     /* #3B82F6 */
var(--color-success)     /* #10B981 */
var(--color-warning)     /* #F59E0B */
var(--color-error)       /* #EF4444 */
var(--color-bg)          /* #FFFFFF / #0F172A dark */
var(--color-surface)     /* #F8FAFC / #1E293B dark */
var(--color-text)        /* #0F172A / #F1F5F9 dark */
var(--color-body)        /* #334155 / #CBD5E1 dark */
var(--color-muted)       /* #64748B / #94A3B8 dark */
var(--color-border)      /* #E2E8F0 / #334155 dark */
```

### Tipografías (ya cargadas globalmente)
- `font-family: 'Geist', 'Inter', system-ui` — texto body
- `font-family: 'Sora', 'Inter', sans-serif` — títulos y display
- `font-family: 'Geist Mono', 'Fira Code', monospace` — montos, cantidades, IDs, SKUs

---

## 3. Estructura de archivos del módulo

```
ventas/panel/pos/
├── claude.md                 ← este archivo
├── implementacion.md         ← spec funcional (leer, no editar)
├── goals.md                  ← objetivos (leer, no editar)
├── qa.md                     ← QA (leer, no editar)
├── img/                      ← capturas de referencia visual (no editar)
├── ClaudeDesing/             ← código de Claude Design (referencia, no copiar directo)
│
├── index.ts                  ← barrel export del módulo
├── types.ts                  ← tipos/interfaces del módulo POS
│
├── stores/                   ← Zustand stores
│   ├── useTicketStore.ts     ← estado del ticket actual (items, cliente, descuentos)
│   ├── useCajaStore.ts       ← estado de la sesión de caja (abierta/cerrada, cajero, acumulado)
│   └── usePausadosStore.ts   ← tickets en pausa (persistidos en localStorage)
│
├── hooks/                    ← hooks custom del módulo
│   ├── useProductosPOS.ts    ← query de productos para el catálogo POS
│   ├── useTickets.ts         ← query/mutation de tickets (crear, listar)
│   ├── useCaja.ts            ← query/mutation de sesiones de caja
│   └── useMovimientosCaja.ts ← query de egresos/ingresos
│
├── components/               ← componentes internos del POS (no reutilizables afuera)
│   ├── CatalogoPOS/
│   │   ├── CatalogoPOS.tsx
│   │   ├── FiltrosCatalogo.tsx
│   │   ├── GrillaProductos.tsx
│   │   ├── ProductoCardPOS.tsx
│   │   └── Favoritos.tsx
│   ├── TicketPOS/
│   │   ├── TicketPOS.tsx
│   │   ├── TicketItem.tsx
│   │   ├── TicketTotales.tsx
│   │   ├── TicketVacio.tsx
│   │   └── ZonaDescuentos.tsx
│   ├── Cobro/
│   │   ├── ModalCobro.tsx
│   │   ├── MetodoPago.tsx
│   │   ├── PagoMixto.tsx
│   │   ├── InputMonto.tsx
│   │   └── ModalPostVenta.tsx
│   ├── Modales/
│   │   ├── ModalDevolucion.tsx
│   │   ├── ModalEgresoIngreso.tsx
│   │   ├── DrawerPausados.tsx
│   │   └── ModalVariante.tsx
│   ├── Caja/
│   │   ├── HeaderTurno.tsx
│   │   ├── ResumenTurno.tsx
│   │   ├── ConteoCierre.tsx
│   │   └── DiferenciaIndicador.tsx
│   └── Historial/
│       ├── TablaHistorial.tsx
│       ├── FiltrosHistorial.tsx
│       └── ModalDetalleSesion.tsx
│
├── POSCobro.tsx              ← pantalla principal (orquesta componentes)
├── POSApertura.tsx           ← pantalla de apertura
├── POSCierre.tsx             ← pantalla de cierre
└── POSHistorial.tsx          ← pantalla de historial
```

---

## 4. Componentes compartidos (`ventas/_shared/`)

### Reutilizar si existen:
Antes de crear un componente, verificar si ya existe en `ventas/_shared/components/` o `ventas/_shared/modales/`.

### Crear en `_shared/` si NO existen (son usados por otros módulos):
- `SelectorProducto.tsx` — buscador de productos con selector de variante (lo usa POS, Inventario, Descuentos)
- `SelectorCliente.tsx` — buscar/crear cliente por DNI/teléfono/nombre (lo usa POS, Pedidos)
- `SelectorVariante.tsx` — matriz de variantes con stock (lo usa POS, Inventario)
- `ModalConfirmacion.tsx` — modal genérico de "¿Estás seguro?" (lo usa todo)
- `EmptyState.tsx` — estado vacío con ícono + título + CTA (lo usa todo)
- `StatusBadge.tsx` — badge de estado con colores consistentes (lo usa todo)
- `MontoDisplay.tsx` — muestra un monto formateado en Geist Mono con color (lo usa POS, Inventario)
- `DataTable.tsx` — tabla genérica con sorting, paginación, selección (lo usa POS historial, Inventario, Movimientos)
- `SearchInput.tsx` — input de búsqueda con debounce (lo usa todo)

### NO crear en `_shared/`:
Componentes que solo usa el POS (ProductoCardPOS, TicketItem, ConteoCierre) van en `pos/components/`.

---

## 5. Convenciones de código

### Naming
- Componentes: PascalCase (`TicketPOS.tsx`)
- Hooks: camelCase con `use` prefix (`useTicketStore.ts`)
- Stores: camelCase con `use` prefix + `Store` suffix (`useTicketStore.ts`)
- Types: PascalCase, en `types.ts` del módulo
- Archivos: PascalCase para componentes, camelCase para hooks/stores/utils

### Estructura de un componente
```tsx
// 1. Imports (externos primero, internos después)
import { useState } from 'react'
import { useTicketStore } from '../stores/useTicketStore'
import { MontoDisplay } from '@ventas/_shared/components'
import type { TicketItem } from '../types'

// 2. Types/interfaces del componente (si son locales)
interface Props {
  item: TicketItem
  onRemove: (id: string) => void
  editable?: boolean
}

// 3. Componente
export function TicketItemRow({ item, onRemove, editable = true }: Props) {
  // hooks primero
  // lógica derivada
  // handlers
  // render
}

// NO usar export default. Siempre named exports.
```

### Barrel exports
Cada carpeta con más de 1 archivo exportable tiene un `index.ts`:
```ts
// components/CatalogoPOS/index.ts
export { CatalogoPOS } from './CatalogoPOS'
export { ProductoCardPOS } from './ProductoCardPOS'
```

### Regla de 300 líneas
Ningún archivo supera 300 líneas salvo justificación. Criterio para partir:
- **Por zona visual:** si la pantalla tiene 2 columnas (catálogo + ticket), cada columna es un componente.
- **Por responsabilidad:** lógica de estado en un hook/store, presentación en el componente.
- **Por reutilización:** si un bloque aparece en más de una pantalla, va a `_shared/` o a `components/`.

### CSS / Estilos
- Usar clases de Tailwind como primera opción.
- Para tokens de color que no tienen clase Tailwind directa, usar `style={{ color: 'var(--color-primary)' }}` o clases custom en el CSS global.
- NO hardcodear colores hex en componentes. Siempre `var(--color-*)`.
- NO usar `className` con strings dinámicas que Tailwind no pueda purgar. Usar objetos condicionales o clsx.

---

## 6. State management

### Zustand stores (estado del cliente)
```ts
// stores/useTicketStore.ts
import { create } from 'zustand'
import type { TicketItem, ClienteAsociado } from '../types'

interface TicketState {
  items: TicketItem[]
  cliente: ClienteAsociado | null
  descuentos: Descuento[]
  // acciones
  agregarItem: (item: TicketItem) => void
  removerItem: (id: string) => void
  actualizarCantidad: (id: string, cantidad: number) => void
  asociarCliente: (cliente: ClienteAsociado) => void
  limpiarTicket: () => void
}
```

### TanStack Query (datos del servidor)
```ts
// hooks/useProductosPOS.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@ventas/_shared/api'

export function useProductosPOS(filtros: FiltrosCatalogo) {
  return useQuery({
    queryKey: ['productos-pos', filtros],
    queryFn: () => api.productos.listar(filtros),
  })
}
```

### API client (`ventas/_shared/api/`)
Si no existe, crear un wrapper mínimo:
```ts
// ventas/_shared/api/client.ts
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      // auth headers se agregan acá cuando existan
      ...options?.headers,
    },
    ...options,
  })
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}
```

---

## 7. Types del módulo (`types.ts`)

```ts
// Tipos base del módulo POS
export interface TicketItem {
  id: string
  productoId: string
  varianteId: string
  nombre: string
  variante: string
  cantidad: number
  precioUnitario: number
  descuento?: Descuento
  notas?: string
}

export interface ClienteAsociado {
  id: string
  nombre: string
  dni: string
  telefono: string
  email?: string
}

export interface SesionCaja {
  id: string
  cajero: { id: string; nombre: string }
  fechaApertura: string
  fechaCierre?: string
  montoInicial: number
  estado: 'abierta' | 'cerrada' | 'forzada'
}

export interface MetodoPago {
  tipo: 'efectivo' | 'tarjeta_debito' | 'tarjeta_credito' | 'transferencia' | 'qr'
  monto: number
  referencia?: string
}

export interface Descuento {
  tipo: 'porcentaje' | 'monto_fijo'
  valor: number
  codigo?: string
  motivo?: string
}

export type EstadoCaja = 'cerrada' | 'abierta'
```

---

## 8. Reglas estrictas

### HACER:
- Leer `implementacion.md` para saber qué estados, acciones y permisos tiene cada pantalla.
- Usar las capturas de `img/` como referencia visual, NO el código de `ClaudeDesing/`.
- Reutilizar componentes de `_shared/` antes de crear nuevos.
- Todos los montos renderizados con `font-family: var(--font-family-mono)`.
- Todos los estados: vacío, carga (skeleton), error, sin conexión.
- Named exports, nunca default exports.
- Componentes puros y sin side effects en render.

### NO HACER:
- NO copiar código de `ClaudeDesing/` directamente. Es código presentacional con datos hardcodeados.
- NO hardcodear datos de ejemplo en componentes. Usar props/stores/queries.
- NO crear componentes que superen 300 líneas sin justificar.
- NO modificar NADA fuera de `ventas/panel/pos/` excepto agregar componentes a `ventas/_shared/`.
- NO hardcodear colores hex. Usar `var(--color-*)`.
- NO usar `export default`.
- NO crear archivos `.css` por componente. Usar Tailwind + tokens globales.
- NO duplicar lógica que ya exista en un hook o store.
- NO importes desde @/design-system/. Ese path es del prototipo de ClaudeDesing/ y no existe en el proyecto. Los componentes UI se construyen con Tailwind + tokens CSS globales (var(--color-*)) o se crean en ventas/_shared/components/.

---

## 9. Plan de implementación (fases)

### Fase 0 — Infraestructura
1. Crear `types.ts` con todos los tipos del módulo.
2. Crear stores de Zustand: `useTicketStore`, `useCajaStore`, `usePausadosStore`.
3. Crear hooks de datos: `useProductosPOS`, `useTickets`, `useCaja`.
4. Verificar `_shared/` y crear componentes compartidos faltantes.
5. Crear `index.ts` barrel exports.

### Fase 1 — POSApertura
Pantalla más simple. Valida que la infraestructura funciona.

### Fase 2 — POSCobro (por capas)
- 2a: Layout + CatalogoPOS + HeaderTurno (sin ticket aún).
- 2b: TicketPOS + agregar/remover items.
- 2c: Descuentos + cliente.
- 2d: ModalCobro + ModalPostVenta.
- 2e: DrawerPausados + ModalEgresoIngreso.
- 2f: ModalDevolucion.

### Fase 3 — POSCierre
Depende de datos de Fase 2 (ventas del turno).

### Fase 4 — POSHistorial
Consume todo lo anterior.

### Fase 5 — Pulido
Modo oscuro, atajos de teclado, bloqueo multi-tab, permisos visibles.

---

## 10. Prompts sugeridos para Claude Code

### Mensaje 1 (análisis)
```
Lee @file:claude.md, @file:implementacion.md y @file:goals.md.
Luego revisá qué existe en @ventas/_shared/components/.
Listame:
1. Qué componentes compartidos ya existen y son reutilizables.
2. Qué componentes compartidos faltan según claude.md sección 4.
3. Qué dependencias necesito instalar (zustand, @tanstack/react-query, clsx).
No crees ningún archivo todavía.
```

### Mensaje 2 (infraestructura)
```
Ejecutá la Fase 0 de claude.md:
1. Creá types.ts con los tipos del módulo.
2. Creá los 3 stores de Zustand.
3. Creá los hooks de datos con datos mock por ahora.
4. Creá los componentes compartidos faltantes en @ventas/_shared/.
5. Creá los index.ts de barrel export.
Usá las capturas de img/ como referencia visual. No copies código de ClaudeDesing/.
```

### Mensaje 3 (primera pantalla)
```
Implementá POSApertura.tsx siguiendo la spec de implementacion.md sección 2.
Referencia visual: img/apertura.png.
Usá los stores y tipos de Fase 0.
Máximo 300 líneas por archivo. Si necesitás partir, creá sub-componentes en components/.
```

### Mensajes 4-7 (POSCobro por capas)
```
Implementá POSCobro.tsx Fase 2a: layout de 2 columnas + CatalogoPOS + HeaderTurno.
Referencia visual: img/cobro-vacio.png
El ticket queda como componente placeholder por ahora.
```
(Y así sucesivamente con cada sub-fase.)