# Orbita API — Backend NestJS + Prisma

Backend de Orbita: **NestJS + Prisma + PostgreSQL (Supabase)**. Gestor de paquetes: **pnpm**.

Este proyecto contiene, por ahora, solo la **infraestructura base**: bootstrap de NestJS,
`PrismaModule`/`PrismaService` global y endpoints de salud. **Los módulos de dominio
(auth, productos, órdenes, etc.) se agregan en un paso posterior**, una vez definido el
contrato de API. El schema completo de datos vive en
[`MODELO_DATOS_DEFINITIVO.md`](../../MODELO_DATOS_DEFINITIVO.md) (raíz del repo) y ya está
volcado en [`prisma/schema.prisma`](./prisma/schema.prisma).

## Requisitos

- Node.js 22+
- pnpm 11+
- Una base PostgreSQL de Supabase (para migrar y correr contra la base real)

## Instalación

```bash
cd apps/api
pnpm install
```

> La primera instalación pide aprobar los build scripts de Prisma (descarga de engines).
> Ya están aprobados en [`pnpm-workspace.yaml`](./pnpm-workspace.yaml) (`allowBuilds`), así
> que `pnpm install` los corre sin intervención. Si por algún motivo quedaran pendientes,
> corré `pnpm approve-builds --all`.

## Configuración de entorno

Copiá el ejemplo y cargá tus credenciales de Supabase (Dashboard → **Database → Connection
string**). El `.env` real **no se versiona**.

```bash
cp .env.example .env
```

Se usan **dos** variables, y esto es importante con Supabase:

- `DATABASE_URL` — conexión **pooled** (Transaction mode, puerto **6543**, `?pgbouncer=true`).
  La usa la app en runtime.
- `DIRECT_URL` — conexión **directa** (Session mode, puerto **5432**). La usa Prisma Migrate.
  pgbouncer no soporta algunas operaciones que las migraciones necesitan, por eso van separadas.

## Base de datos (Prisma)

```bash
pnpm prisma:generate      # genera el Prisma Client
pnpm prisma:validate      # valida el schema
pnpm prisma:migrate:dev   # crea/aplica migraciones (requiere .env con credenciales reales)
```

La primera vez, para crear todas las tablas en Supabase:

```bash
pnpm prisma:migrate:dev --name init
```

## Desarrollo

```bash
pnpm dev      # Nest en modo watch (por defecto en el puerto 3001, configurable con PORT)
pnpm build    # compila a dist/
pnpm start    # corre la build compilada (node dist/main.js)
```

## Endpoints de salud

- `GET /health` → `{ "status": "ok" }` — salud del proceso, no toca la base.
- `GET /health/db` → hace un `SELECT 1` vía Prisma para confirmar la conexión a la base.
  Requiere `.env` con credenciales válidas.

## Estructura

```
apps/api/
  prisma/
    schema.prisma        # 51 modelos + 29 enums (fuente: MODELO_DATOS_DEFINITIVO.md)
  src/
    main.ts              # bootstrap
    app.module.ts        # módulo raíz
    app.controller.ts    # endpoints /health y /health/db
    prisma/
      prisma.module.ts   # módulo global de infraestructura
      prisma.service.ts  # PrismaClient inyectable (connect/disconnect por lifecycle)
  .env.example
```

## Próximo paso

Definir el contrato de API y recién ahí agregar los módulos de dominio (uno por área del
schema). Toda la capa de datos ya está lista para que esos módulos inyecten `PrismaService`.
