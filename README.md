# Orbita Frontend

SaaS multirubro argentino. Cada negocio tiene su propio sitio, catálogo y panel de gestión bajo un subdominio propio (`negocio.orbita.com`). Sin comisiones, suscripción mensual.

**Stack:** Next.js (Pages Router) · TypeScript · Tailwind CSS · Supabase · Turborepo

---

## Monorepo

```
orbita/
  apps/
    frontend/          ← este repo (Next.js + TypeScript + Tailwind)
    backend/           ← NestJS (no tocar en esta etapa)
  packages/
    shared-types/      ← tipos compartidos frontend + backend
  turbo.json
  package.json
  tsconfig.base.json
```

---

## Estructura de `apps/frontend/src/`

```
src/
  design-system/       ← tokens visuales y componentes globales
  layouts/             ← estructuras de página globales
  hooks/               ← lógica global reutilizable
  lib/                 ← clientes y utilidades
  modules/             ← lógica de negocio por módulo padre
  pages/               ← rutas de Next.js (solo registran URLs)
```

---

### `design-system/`

Tokens visuales y componentes UI de Orbita. **No contiene lógica de negocio.** No sabe qué es un pedido, un turno o un negocio — solo define cómo se ve todo.

Todo dev debe buscar acá antes de crear un componente nuevo. Si el componente que necesitás no existe, se agrega acá y no en el módulo.

```
design-system/
  tokens/
    colors.ts          ← paleta completa light + dark mode con variables CSS
    typography.ts      ← familias (Geist Sans / Mono), escala de 10 niveles, interlineado
    spacing.ts         ← escala base 4px, radios, breakpoints, z-index, grid
    animations.ts      ← duraciones, easings, transiciones por componente
  components/
    Button.tsx         ← ver tabla de componentes abajo
    Input.tsx
    Badge.tsx
    Card.tsx
    Modal.tsx
    Toast.tsx
    Table.tsx
    Chart.tsx
    Skeleton.tsx
    EmptyState.tsx
```

**Criterio de inclusión:** si lo podrías copiar a otro proyecto SaaS sin cambiar nada → va acá.

#### Referencia de componentes

| Componente | Props principales | Notas |
|---|---|---|
| `Button` | `variant` · `size` · `loading` · `icon` | `variant`: primary / secondary / ghost / danger / outline — `size`: sm / md / lg |
| `Input` | `label` · `error` · `prefix` · `trailing` · `mono` | `mono` activa Geist Mono (para precios e IDs) — `error` muestra mensaje con ícono |
| `Badge` | `status` · `dot` · `size` · `dark` | `status`: pendiente / confirmado / cancelado / completado / en-proceso / enviado |
| `Card` | `hoverable` · `padding` · `onClick` | `hoverable` activa elevación y borde al hover — `padding`: sm / md / lg |
| `Modal` | `isOpen` · `onClose` · `title` · `variant` · `footer` | `variant`: default / danger / success — se monta con `createPortal`, se cierra con Escape |
| `Toast` | `variant` · `title` · `description` · `persistent` · `onClose` | `variant`: success / error / warning / info — `persistent` agrega chip y requiere `onClose` manual |
| `Table` | `columns` · `data` · `keyField` · `pagination` | `columns` tipado con genérico `Column<T>` — `pagination` maneja estado externo |
| `Chart` | `LineChart` · `BarChart` · `DonutChart` | Tres exports nombrados — SVG puro, sin dependencias externas |
| `Skeleton` | `width` · `height` · `radius` | Shimmer animado con CSS — usarlo mientras carga cualquier bloque de contenido |
| `EmptyState` | `icon` · `title` · `description` · `action` | `action.variant`: primary / outline — `icon` acepta cualquier componente SVG con `size` y `strokeWidth` |

#### Página de referencia visual

```
pages/design-system.tsx   ← localhost:3000/design-system (solo desarrollo)
```

Muestra todos los componentes en acción con datos reales, toggle de dark mode y estados interactivos (modal, paginación, inputs). Usar como referencia antes de implementar cualquier pantalla nueva.

> **Requisito:** agregar las variables CSS de `design-system/tokens/colors.ts` a `globals.css` para que dark mode funcione. El bloque está comentado al final de ese archivo.

---

### `layouts/`

Estructuras de página globales. Cada tipo de pantalla tiene su layout.

```
layouts/
  AdminLayout.tsx      ← sidebar 240px + header 64px + área de contenido
  OnboardingLayout.tsx ← centrado, sin sidebar, barra de progreso
  components/
    Sidebar.tsx        ← 240px expandido / 64px colapsado (mobile drawer)
    Header.tsx         ← 64px fijo, sticky top
    MobileDrawer.tsx   ← sidebar en mobile (<768px)
```

---

### `hooks/` y `lib/`

Lógica global reutilizable por cualquier módulo.

```
hooks/
  useAuth.ts           ← usuario logueado desde Supabase
  useFetch.ts          ← fetch a api.orbita.com con estado de carga/error
  useValidation.ts     ← validación de formularios (onBlur)
  useNegocio.ts        ← subdominio → datos del negocio público
  useNegocioAdmin.ts   ← negocioId → acceso y datos del panel admin
  useDarkMode.ts       ← toggle light/dark mode

lib/
  api.ts               ← apiGet() y apiPost() con token automático
  supabase.ts          ← cliente Supabase para el frontend
  utils.ts             ← formatPrecio(), formatFecha(), validarEmail()
```

---

### `pages/`

Solo registran URLs en Next.js. Cada archivo importa el componente real desde `modules/` y lo re-exporta. No contienen lógica ni UI propia (máximo 2-3 líneas de código).

```
pages/
  inicio.tsx                                   ← landing pública (/inicio) — ThemeProvider + Hero + ScrollSequence + etc.
  index.tsx                                    ← landing orbita.com (redirige o es el mismo que /inicio)
  login.tsx
  signup.tsx
  home.tsx                                     ← dashboard del dueño (sus negocios)
  onboarding/
    rubro.tsx                                  ← elegir módulo padre al registrarse
    tienda/
      setup.tsx
      success.tsx
  admin/
    index.tsx                                  ← /admin — panel de administración (placeholder, en desarrollo)
    [negocioId]/
      [moduloPadre]/
        [seccion].tsx                          ← ruta dinámica (conecta URL con módulo)
```

#### URLs disponibles

| URL | Archivo | Estado |
|-----|---------|--------|
| `/inicio` | `pages/inicio.tsx` | Landing page pública completa con canvas, módulos y testimonios |
| `/admin` | `pages/admin/index.tsx` | Placeholder — panel de administración en desarrollo |

La ruta dinámica `[seccion].tsx` usa un `componentMap` que conecta cada sección con su componente:

```ts
const componentMap = {
  ventas: {
    catalogo:      dynamic(() => import('@/modules/ventas/admin/catalogo/ProductoLista')),
    pedidos:       dynamic(() => import('@/modules/ventas/admin/pedidos/PedidoLista')),
    // ...
  },
  turnos: {
    agenda:        dynamic(() => import('@/modules/turnos/admin/Agenda')),
    // ...
  },
}
```

---

## Dónde va cada cosa — árbol de decisión

Hay 4 capas. Antes de crear cualquier componente, hook o archivo, seguí este árbol:

```
¿Tiene lógica de negocio de Orbita?
│
├── NO → design-system/
│         (Button, Input, Card, tokens de color, tipografía...)
│
└── SÍ → ¿Lo necesitan múltiples módulos padre (ventas + turnos + futuros)?
          │
          ├── SÍ → hooks/ · layouts/ · lib/
          │         (useAuth, useFetch, AdminLayout, api.ts...)
          │
          └── NO → ¿Lo necesitan dos o más secciones del MISMO módulo?
                    │
                    ├── SÍ → modules/[modulo]/_shared/
                    │         (CatalogoBase la usan storefront Y admin/catalogo)
                    │
                    └── NO → queda dentro de su sección
                               (no extraer hasta que otro lo necesite)
```

### Resumen de capas

| Capa | Carpeta | Qué va | Ejemplo |
|------|---------|--------|---------|
| 1 — Primitivos UI | `design-system/` | Componentes sin lógica de negocio, tokens visuales | `Button`, `colors.ts` |
| 2 — App global | `hooks/` · `layouts/` · `lib/` | Cruza todos los módulos | `useAuth`, `AdminLayout` |
| 3 — Módulo compartido | `modules/[m]/_shared/` | Dos o más secciones del mismo módulo | `CatalogoBase`, `useCarrito` |
| 4 — Sección | dentro de `admin/x/` o `storefront/` | Solo una sección lo usa | `PedidoRow.tsx` en `admin/pedidos/` |

---

### `modules/`

Cada módulo padre es un mundo cerrado. Un dev puede tomar su módulo y trabajarlo de principio a fin sin abrir otras carpetas.

#### Patrón interno (igual en todos los módulos)

```
modules/[modulo-padre]/
  _shared/             ← base que todos los subrubros comparten
    components/        ← componentes base reutilizables
    hooks/             ← lógica compartida
  layout/              ← navbar + footer + layout del storefront público
  admin/               ← panel del dueño (pantallas de gestión)
  storefront/          ← vista del cliente final
  [subrubro]/          ← lo específico de cada subrubro (si aplica)
```

---

#### `modules/ventas/`

Módulo padre para todos los rubros con carrito: indumentaria, calzado, electrónica, ferretería y 13 subrubros más. El subrubro `tienda` (comercio físico/online genérico) es el primero implementado.

```
modules/ventas/
  _shared/
    components/
      CatalogoBase.tsx       ← grilla de productos genérica
      CarritoBase.tsx        ← estado del carrito, agregar/remover
      ProductoCard.tsx       ← card de producto reutilizable
      FlujoPagoBase.tsx      ← checkout genérico
      CamposSubrubro.tsx     ← renderiza campos dinámicos del backend
      MatrizVariantes.tsx    ← tabla stock cruzada (talle x color) — indumentaria/calzado
      CantidadVariable.tsx   ← venta por metro/kg/m²/litro — ferretería/corralón
      ListaNumerosSerie.tsx  ← IMEI y series por unidad — electrónica/informática
    hooks/
      useCarrito.ts
      useCheckout.ts
      useInventario.ts
      useSubrubro.ts         ← trae campos del backend según subrubro

  layout/
    NavbarTienda.tsx         ← con carrito + cuenta de cliente
    FooterTienda.tsx         ← métodos de pago + política de envíos
    LayoutTienda.tsx

  admin/
    catalogo/                ← MATEO
      ProductoLista.tsx
      ProductoNuevo.tsx      ← usa CamposSubrubro + especiales según subrubro
      ProductoEditar.tsx
      ProductoDetalle.tsx
      ProductoVariantes.tsx
      Categorias.tsx
      ImportarProductos.tsx
    pedidos/                 ← ALEX
      PedidoLista.tsx
      PedidoDetalle.tsx
      PedidoNuevo.tsx
      PedidoHistorial.tsx
      Devoluciones.tsx
      NotasCredito.tsx
      ColaPreparacion.tsx
    clientes/                ← ALEX
      ClienteLista.tsx
      ClienteDetalle.tsx
    reportes/                ← ALEX
      Dashboard.tsx
      ReporteVentas.tsx
      ReporteProductos.tsx
      ReporteClientes.tsx
      ReporteInventario.tsx
    configuracion/           ← ALEX
      ConfigGeneral.tsx
      Apariencia.tsx
      Equipo.tsx
      Notificaciones.tsx
    pos/                     ← ALAN
      POSCobro.tsx
      POSApertura.tsx
      POSCierre.tsx
      POSHistorial.tsx
    inventario/              ← ALAN
      StockGeneral.tsx
      EntradaStock.tsx
      AjusteStock.tsx
      Movimientos.tsx
      Proveedores.tsx
    mensajes/                ← ALAN
      Bandeja.tsx
      Chat.tsx
      Plantillas.tsx
    descuentos/              ← ALAN
      DescuentoLista.tsx
      CuponNuevo.tsx
      PromoAutomaticas.tsx
      RendimientoCupones.tsx

  storefront/                ← MATEO
    HomeNegocio.tsx
    CatalogoTodos.tsx
    CatalogoCategoria.tsx
    ProductoDetalle.tsx
    Busqueda.tsx
    Carrito.tsx
    LoginCliente.tsx
    RegistroCliente.tsx
    MisPedidos.tsx

  tienda/                    ← subrubro: comercio físico/online genérico
    CatalogoTienda.tsx
    CarritoTienda.tsx
    FlujoPagoTienda.tsx
    ProductoCard.tsx
    useInventarioTienda.ts
```

**Por qué no existe `subrubros/` en el frontend**

- 14 de 17 subrubros solo cambian los campos del formulario de producto. Esos campos los provee el backend como JSON y `CamposSubrubro.tsx` los renderiza dinámicamente. Agregar un subrubro nuevo es configuración de backend, no trabajo de frontend.
- Solo 3 casos necesitan UI específica, ya cubiertos en `_shared/components/`:
  - `MatrizVariantes` — indumentaria y calzado (tabla talle × color)
  - `CantidadVariable` — ferretería y corralón (metro/kg/m²/litro)
  - `ListaNumerosSerie` — electrónica e informática (IMEI por unidad)

---

#### `modules/turnos/`

Módulo padre para todos los rubros con agenda: barbería, spa, uñas, canchas deportivas y futuros.

```
modules/turnos/
  _shared/
    components/
      CalendarioBase.tsx     ← vista de calendario genérica
      SlotDisponible.tsx     ← bloque horario seleccionable
      FlujoReservaBase.tsx   ← pasos de reserva genéricos
      SelectorCabina.tsx     ← prestador + sala disponibles (spa, clínica)
      SelectorCancha.tsx     ← espacio físico sin prestador (fútbol, tenis, pádel)
    hooks/
      useDisponibilidad.ts   ← slots disponibles por fecha
      useReserva.ts          ← lógica de reservar un turno
      useServicio.ts         ← trae servicios y duraciones del backend

  layout/
    NavbarTurnos.tsx         ← con reserva rápida + WhatsApp
    FooterTurnos.tsx         ← horarios de atención
    LayoutTurnos.tsx

  admin/
    Agenda.tsx
    TurnosLista.tsx
    Clientes.tsx
    Servicios.tsx
    KPIs.tsx

  storefront/
    HomeNegocio.tsx
    Servicios.tsx
    Reserva.tsx
    MisTurnos.tsx

  barberia/                  ← subrubro con UI propia
    AgendaBarberia.tsx
    CatalogoBarberia.tsx
    FlujoPagoBarberia.tsx
    useTurnosBarberia.ts
```

---

## Responsabilidades MVP

| Dev | Módulo / Sección | Pantallas |
|-----|-----------------|-----------|
| **Mateo** (CEO) | `ventas/admin/catalogo/` · `ventas/storefront/` · `onboarding/` | 20 |
| **Alex** (CPO) | `ventas/admin/pedidos/` · `ventas/admin/clientes/` · `ventas/admin/reportes/` · `ventas/admin/configuracion/` | 18 |
| **Alan** (CTO) | `ventas/admin/pos/` · `ventas/admin/inventario/` · `ventas/admin/mensajes/` · `ventas/admin/descuentos/` | 16 |

---

## Cómo agregar un módulo padre nuevo

Ejemplo: agregar `restaurante` con dos subrubros (`rotiseria`, `delivery`).

**Paso 1** — crear la carpeta del módulo:

```
modules/restaurante/
  _shared/
  admin/
  storefront/
  rotiseria/
  delivery/
```

**Paso 2** — agregar una entrada al `componentMap` en `pages/admin/[negocioId]/[moduloPadre]/[seccion].tsx`:

```ts
const componentMap = {
  ventas:      { ... },   // ya existe, no se toca
  turnos:      { ... },   // ya existe, no se toca
  restaurante: {          // solo se agrega esto
    mesas:   dynamic(() => import('@/modules/restaurante/admin/Mesas')),
    pedidos: dynamic(() => import('@/modules/restaurante/admin/Pedidos')),
    kpis:    dynamic(() => import('@/modules/restaurante/admin/KPIs')),
  },
}
```

Sin migraciones. Sin cambios en DNS. Sin tocar `ventas/` ni `turnos/`.

---

## Por qué Pages Router (y no App Router)

El equipo no tiene experiencia previa en Next.js. App Router introduce Server Components, Client Components y una curva de aprendizaje significativamente mayor. Con deadline a fin de 2026, ese riesgo no tiene sentido.

Pages Router hace exactamente lo que Orbita necesita: rutas dinámicas, subdominios con middleware, dashboard multi-negocio. Si el equipo gana experiencia, la migración a App Router es gradual — Next.js permite tener ambos en paralelo, y los `modules/` quedan intactos: solo se elimina `pages/`.

---

## Por qué `pages/` y `modules/` son carpetas separadas

| | `pages/` | `modules/` |
|---|---|---|
| Qué es | Archivo de ruta | Componente real con toda la UI |
| Qué hace | Registra la URL en Next.js | Contiene lógica, estados y estilos |
| Quién lo toca | Nadie, se crea una vez | El dev que tiene asignada esa pantalla |
| Tamaño típico | 2 líneas de código | Todo el desarrollo real |
