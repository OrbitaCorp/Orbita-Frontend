# Alex · CPO — Log de trabajo
## Orbita Frontend · Mayo 2026 · Sesión 2

---

## Qué hice

Construí el **Dashboard (#30)** — la pantalla principal del panel.
Antes de escribir el Dashboard, identifiqué qué componentes también
van a necesitar Mateo y Alan, y los agregué al design system para
que nadie los tenga que recrear.

---

## Design system — lo que agregué o modifiqué

### `Avatar.tsx` — NUEVO
Muestra la inicial del nombre en un círculo coloreado.
El color se genera automáticamente desde el nombre — siempre es el
mismo color para el mismo nombre, sin necesidad de guardarlo.
Lo agregué al design system porque lo necesitan pedidos, clientes
y mensajes (Alan) además del Dashboard.

### `KpiCard.tsx` — NUEVO
Card para mostrar un número grande (ventas, pedidos, etc.) con
contador animado de 0 al valor real y delta ▲▼ vs período anterior.
Lo agregué al design system porque lo van a usar el Dashboard,
los 4 reportes de Alex y el POS de Alan.

### `CardSection.tsx` — NUEVO
Card con un header estructurado: título, subtítulo, badge de alerta
y slot para un botón de acción. Es el contenedor de todas las
secciones de datos del panel (gráficos, tablas, listas).
Lo agregué al design system porque lo usan todas las pantallas
del panel de los 3 devs — no tiene sentido tenerlo en el módulo.

### `PeriodoSelector.tsx` — NUEVO
Toggle de Hoy / Esta semana / Este mes / Personalizado.
El botón "Personalizado" abre un popover con un calendario
interactivo para elegir un rango de fechas, presets rápidos
(últimos 7 días, mes actual, etc.) y un contador de días.
Lo agregué al design system porque lo usan el Dashboard y los
4 reportes de Alex, y posiblemente el POS de Alan.


### `Chart.tsx` — MODIFICADO
Le agregué el prop opcional `formatValue` al `LineChart` para que
el tooltip pueda mostrar `$124.300` en vez del número crudo `124300`.
No rompe ningún uso existente — si no se pasa el prop, funciona
igual que antes.

---

## Hooks y utilidades

### `hooks/useCounter.ts` — NUEVO
Anima un número de 0 a un valor objetivo con easing suave
(easeOutCubic). Lo creé en `hooks/` global porque lo necesita
`KpiCard` del design system y puede servir en cualquier módulo.

### `lib/utils.ts` — MODIFICADO
Agregué 4 funciones utilitarias puras que no tienen lógica de
negocio de Orbita — por eso van en `lib/` y no en el módulo:
- `fmtMoney` — convierte `124300` en `$124.300`
- `saludoHora` — devuelve "Buenos días", "Buenas tardes" o "Buenas noches" según la hora
- `fechaLarga` — devuelve "viernes, 22 de mayo"
- `buildSmoothPath` — genera un path SVG suavizado con curvas Bezier

---

## Módulo — archivos del Dashboard
modules/ventas/admin/reportes/
Dashboard.tsx                    ← componente principal
components/
AlertasGrid.tsx                ← grid de 4 alertas agrupadas por tipo
TopProductos.tsx               ← ranking top 5 con barra de progreso
PedidosPendientesBanner.tsx    ← banner azul al pie con CTAs
charts/
StackedBarChart.tsx            ← barras verticales apiladas SVG
mock/
dashboard.mock.ts              ← tipos + datos mock (se elimina con backend)

### `mock/dashboard.mock.ts` — NUEVO
Tiene la interfaz `DashboardData` y los datos mock por período.
Es el contrato exacto que el backend debe respetar cuando esté listo.
Las alertas vienen agrupadas por tipo con un `count` — nunca una
alerta por cada producto o pedido individual, para que el Dashboard
no crezca con negocios grandes.

### `charts/StackedBarChart.tsx` — NUEVO
Gráfico de barras verticales apiladas por estado de pedido, en SVG
puro sin dependencias. Lo creé en el módulo y no en el design system
porque usa los colores de los estados de pedido de Orbita — es
lógica de negocio, no un primitivo genérico. Tiene hover con opacidad
para destacar la columna activa.

### `components/AlertasGrid.tsx` — NUEVO
Grid fijo de 4 columnas con las alertas del negocio agrupadas por
tipo. Siempre muestra máximo 4 — danger primero, luego warning.
Cada card muestra el contador de casos y navega al módulo
correspondiente al hacer click. Se diseñó así para que el Dashboard
no se rompa visualmente en negocios con muchos problemas activos.

### `components/TopProductos.tsx` — NUEVO
Ranking de los 5 productos más vendidos con barra de progreso
relativa al #1. Está en el módulo porque cuando Reporte de productos
lo necesite se puede mover, pero por ahora solo lo usa el Dashboard.

### `components/PedidosPendientesBanner.tsx` — NUEVO
Banner horizontal azul al pie del Dashboard. Muestra el contador
de pedidos que necesitan atención y dos botones: "Ver cola" y
"Atender ahora". Usa `Button` del design system para los CTAs.

### `Dashboard.tsx` — NUEVO
Componente principal. Tiene 5 secciones:
1. Header con saludo, fecha y selector de período
2. 4 KPIs con contador animado
3. Alertas activas full-width (máx 4 agrupadas por tipo)
4. Actividad reciente + Top productos en grid 65/35
5. Banner de pedidos pendientes al pie

**Listo para conectar al backend** — solo hay que descomentar
el `useFetch` y borrar 3 líneas del mock:

```tsx
// Descomentar:
const { data, loading } = useFetch<DashboardData>(
    negocioId
        ? periodo === 'custom' && customRange
            ? `/ventas/${negocioId}/dashboard?dateFrom=${customRange.from.toISOString()}&dateTo=${customRange.to.toISOString()}`
            : `/ventas/${negocioId}/dashboard?periodo=${periodo}`
        : null
)
```

---

## Deudas técnicas

| Deuda | Cuándo resolver |
|---|---|
| Nombre "Alexander" hardcodeado en el saludo | Cuando `useAuth()` esté listo |
| Botón notificaciones sin lógica en el Header | Cuando exista el endpoint de alertas |
| Dropdown de usuario sin lógica en el Header | Cuando `useAuth()` esté listo |

---

## Próxima pantalla

**Lista de pedidos (#21)** — prioridad alta
`modules/ventas/admin/pedidos/PedidoLista.tsx`

---

## Commit sugerido

**Summary:**