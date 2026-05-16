# Orbita — Frontend

Frontend de la plataforma SaaS multirubro Orbita. Permite a emprendedores argentinos crear su presencia digital con subdominio propio (`nombre-negocio.orbita.com`) y gestionar su negocio desde un panel de administración centralizado.

---

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| Next.js | 16.2.6 | Framework (Pages Router) |
| React | 19.2.4 | UI |
| TypeScript | ^5 | Tipado estático |
| Tailwind CSS | ^4 | Estilos |
| Supabase Auth | — | Autenticación |
| pnpm | ^9 | Package manager |

---

## Requisitos previos

- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)

---

## Correr el proyecto localmente

```bash
# Clonar el repositorio
git clone https://github.com/tu-org/orbita.git
cd orbita

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con los valores correspondientes

# Levantar el servidor de desarrollo
pnpm dev
```

El servidor queda disponible en `http://localhost:3000`.

Para simular el routing por subdominio localmente, agregar entradas en `/etc/hosts`:

```
127.0.0.1  mi-barberia.orbita.local
```

---

## Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
NEXT_PUBLIC_API_URL=https://api.orbita.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend NestJS |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase |

---

## Comandos disponibles

```bash
pnpm dev      # Servidor de desarrollo
pnpm build    # Build de producción
pnpm lint     # ESLint
```

---

## Estructura de carpetas

```
src/
├── components/
│   └── shared/              # Componentes reutilizables entre módulos
│       ├── Tabla.tsx
│       ├── Grafico.tsx
│       ├── FormaPago.tsx
│       ├── Modal.tsx
│       ├── Boton.tsx
│       ├── Input.tsx
│       └── Layout/
│           ├── AdminLayout.tsx   # Layout del panel de admin
│           ├── BaseNavbar.tsx
│           └── BaseFooter.tsx
│
├── hooks/                   # Hooks globales reutilizables
│   ├── useAuth.ts           # Sesión y permisos
│   ├── useFetch.ts          # Wrapper sobre fetch con manejo de errores
│   ├── useValidation.ts     # Validación de formularios
│   ├── useNegocio.ts        # Datos del negocio activo (panel público)
│   └── useNegocioAdmin.ts   # Datos del negocio activo (panel admin)
│
├── lib/                     # Utilidades y clientes externos
│   ├── api.ts               # Punto único de comunicación con el backend
│   ├── supabase.ts          # Inicialización del cliente Supabase
│   └── utils.ts             # Funciones utilitarias generales
│
├── modules/                 # Lógica organizada por módulo padre
│   ├── turnos/              # Rubros con agenda y reserva de turnos
│   └── compras/             # Rubros con catálogo y carrito de compras
│
└── pages/                   # Rutas de Next.js (Pages Router)
    ├── index.tsx             # Landing de orbita.com
    ├── login.tsx
    ├── signup.tsx
    └── admin/
        ├── index.tsx                                # Dashboard global multi-negocios
        └── [negocioId]/
            └── [moduloPadre]/
                └── [seccion].tsx                   # Ruta dinámica del admin

middleware.ts                # Intercepta subdominios y redirige al módulo correcto
```

---

## Sistema de módulos

Los módulos se organizan por **módulo padre**, que agrupa rubros con el mismo modelo de negocio.

### Estructura interna de cada módulo padre

```
modules/[moduloPadre]/
├── shared/       # Lógica y componentes comunes entre rubros del módulo
├── layout/       # Navbar y footer del panel público
├── admin/        # Vistas del panel de administración compartidas
└── [rubro]/      # Componentes específicos del rubro
```

### Módulo `turnos` — rubros con agenda

Agrupa rubros donde el cliente reserva un turno en una franja horaria.

```
modules/turnos/
├── shared/
│   ├── CalendarioBase.tsx
│   ├── useDisponibilidad.ts
│   └── useReserva.ts
├── layout/
│   ├── NavbarTurnos.tsx
│   ├── FooterTurnos.tsx
│   └── LayoutTurnos.tsx
├── admin/
│   ├── Agenda.tsx
│   ├── Turnos.tsx
│   └── KPIs.tsx
└── barberia/                  # Rubro: barbería
    ├── CatalogoBarberia.tsx
    ├── AgendaBarberia.tsx
    ├── FlujoPagoBarberia.tsx
    └── useTurnosBarberia.ts
```

### Módulo `compras` — rubros con carrito

Agrupa rubros donde el cliente navega un catálogo y completa una compra.

```
modules/compras/
├── shared/
│   ├── CarritoBase.tsx
│   ├── CatalogoBase.tsx
│   ├── useCarrito.ts
│   └── useCheckout.ts
├── layout/
│   ├── NavbarCompras.tsx
│   ├── FooterCompras.tsx
│   └── LayoutCompras.tsx
├── admin/
│   ├── Inventario.tsx
│   ├── Ordenes.tsx
│   └── KPIs.tsx
└── tienda/                    # Rubro: tienda
    ├── CatalogoTienda.tsx
    ├── CarritoTienda.tsx
    ├── FlujoPagoTienda.tsx
    ├── ProductoCard.tsx
    └── useInventarioTienda.ts
```

---

## Routing

### Panel público — por subdominio

Cada negocio tiene su propia URL: `nombre-negocio.orbita.com`

El archivo `middleware.ts` intercepta el subdominio, identifica el negocio y renderiza el módulo correspondiente según el rubro configurado en la base de datos.

```
cortes-don-juan.orbita.com  →  módulo turnos/barberia
la-tienda-norte.orbita.com  →  módulo compras/tienda
```

### Panel admin — por ruta

El dueño accede a su panel desde rutas convencionales de Next.js:

| Ruta | Descripción |
|---|---|
| `/admin` | Dashboard global con todos sus negocios |
| `/admin/[negocioId]/turnos/agenda` | Agenda del negocio |
| `/admin/[negocioId]/turnos/turnos` | Lista de turnos |
| `/admin/[negocioId]/compras/inventario` | Inventario de productos |
| `/admin/[negocioId]/compras/ordenes` | Órdenes recibidas |

El segmento `[moduloPadre]` determina qué conjunto de vistas del admin se carga. El segmento `[seccion]` selecciona la vista específica dentro del módulo.

---

## Agregar un nuevo rubro

Ejemplo: agregar el rubro `veterinaria` al módulo padre `turnos`.

**1. Crear la carpeta del rubro**

```
src/modules/turnos/veterinaria/
```

**2. Crear los componentes específicos del rubro**

```bash
touch src/modules/turnos/veterinaria/CatalogoVeterinaria.tsx
touch src/modules/turnos/veterinaria/AgendaVeterinaria.tsx
touch src/modules/turnos/veterinaria/FlujoPagoVeterinaria.tsx
touch src/modules/turnos/veterinaria/useTurnosVeterinaria.ts
```

Reutilizar los componentes de `modules/turnos/shared/` para la disponibilidad y reserva.

**3. Registrar el rubro en el middleware**

Editar `middleware.ts` para que cuando se detecte un negocio con rubro `veterinaria`, el subdominio renderice los componentes del nuevo rubro.

**4. Verificar compatibilidad con el admin**

Las vistas de `modules/turnos/admin/` son compartidas entre todos los rubros del módulo `turnos`, por lo que la agenda y KPIs deberían funcionar sin cambios adicionales.

---

## Tipos de usuario

| Tipo | Descripción |
|---|---|
| `UsuarioDueño` | Se registra en orbita.com. Puede tener múltiples negocios. |
| `UsuarioCliente` | Se registra en el negocio específico. El mismo email puede existir en distintos negocios sin conflicto. |

---

## Comunicación con el backend

Todas las llamadas HTTP pasan por `src/lib/api.ts`. No existen rutas en `pages/api/` — el backend es un servicio independiente en NestJS corriendo en `api.orbita.com`.

```ts
// src/lib/api.ts — ejemplo de uso
import { api } from '@/lib/api'

const turnos = await api.get('/negocios/:id/turnos')
```

---

## Convenciones de código

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componentes | PascalCase | `CatalogoBarberia.tsx` |
| Hooks | camelCase con prefijo `use` | `useTurnosBarberia.ts` |
| Imports | Siempre con alias `@/` | `import { api } from '@/lib/api'` |
| Nombres de dominio | Español | `Turno`, `Negocio`, `Orden` |
| Nombres técnicos | Inglés | `handler`, `props`, `callback` |

---

## Decisiones técnicas

### Pages Router en lugar de App Router

Se eligió Pages Router porque ofrece mayor estabilidad para un proyecto en producción y un modelo de data fetching más predecible (`getServerSideProps`, `getStaticProps`). El App Router de Next.js introduce cambios de paradigma que agregan complejidad sin beneficios claros para este caso de uso.

### Sin `pages/api/`

No existe carpeta `pages/api/` porque toda la lógica de backend está en un servicio NestJS separado (`api.orbita.com`). Esto evita mezclar responsabilidades y permite escalar el backend de forma independiente.

### Routing por subdominio

Cada negocio opera bajo su propio subdominio en lugar de una ruta como `/negocios/[slug]`. Esto mejora la percepción de marca del emprendedor y permite configurar SSL por negocio a futuro.

### Estructura por módulo padre

En lugar de organizar por tipo de archivo (`components/`, `pages/`, `hooks/` globales), los módulos agrupan todo lo relacionado a un modelo de negocio. Esto hace que añadir o eliminar un rubro sea una operación contenida sin impacto en el resto del sistema.
