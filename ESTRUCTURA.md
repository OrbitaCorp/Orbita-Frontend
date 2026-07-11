
## apps/web — Frontend (Next.js)

```
apps/web
├── public
└── src
    ├── components
    │   ├── shared
    │   │   └── Layout
    │   └── storefront
    ├── design-system
    │   ├── components
    │   └── tokens
    ├── hooks
    ├── layouts
    │   └── components
    ├── lib
    │   └── storefront
    ├── modules
    │   ├── landing
    │   │   ├── components
    │   │   │   ├── cards
    │   │   │   ├── layout
    │   │   │   ├── orbit
    │   │   │   ├── sections
    │   │   │   └── ui
    │   │   └── context
    │   ├── onboarding
    │   │   ├── tienda
    │   │   └── turnos
    │   ├── turnos
    │   │   ├── _shared
    │   │   │   ├── components
    │   │   │   └── hooks
    │   │   ├── admin
    │   │   ├── barberia
    │   │   ├── layout
    │   │   ├── shared
    │   │   └── storefront
    │   └── ventas
    │       ├── _shared
    │       │   ├── components
    │       │   └── hooks
    │       ├── cliente
    │       │   ├── auth
    │       │   ├── catalogo
    │       │   ├── checkout
    │       │   ├── cupones
    │       │   ├── inicio
    │       │   ├── pedido
    │       │   ├── perfil
    │       │   │   └── components
    │       │   └── producto
    │       └── panel
    │           ├── _shared
    │           ├── catalogo
    │           │   ├── components
    │           │   ├── mock
    │           │   └── types
    │           ├── clientes
    │           │   ├── components
    │           │   ├── mock
    │           │   └── types
    │           ├── configuracion
    │           │   ├── components
    │           │   │   ├── apariencia
    │           │   │   └── equipo
    │           │   ├── mock
    │           │   └── types
    │           ├── descuentos
    │           │   ├── components
    │           │   ├── hooks
    │           │   ├── mock
    │           │   └── types
    │           ├── inventario
    │           │   ├── components
    │           │   ├── mock
    │           │   └── types
    │           ├── mensajes
    │           │   ├── components
    │           │   └── mock
    │           ├── pedidos
    │           │   ├── components
    │           │   ├── mock
    │           │   └── types
    │           ├── pos
    │           │   ├── components
    │           │   │   ├── Caja
    │           │   │   ├── CatalogoPOS
    │           │   │   ├── Cobro
    │           │   │   ├── Historial
    │           │   │   ├── Modales
    │           │   │   ├── modals
    │           │   │   └── TicketPOS
    │           │   ├── docs
    │           │   ├── hooks
    │           │   ├── mock
    │           │   └── stores
    │           └── reportes
    │               ├── components
    │               └── mock
    ├── pages
    │   ├── admin
    │   │   └── [negocioId]
    │   ├── onboarding
    │   │   ├── tienda
    │   │   └── turnos
    │   └── tienda
    │       └── [slug]
    └── styles
```

## apps/api — Backend (NestJS)

```
apps/api
├── prisma
│   └── migrations
│       └── 20260711020000_init
└── src
    ├── audit
    ├── auth
    │   └── dto
    ├── branches
    │   └── dto
    ├── businesses
    │   └── dto
    ├── cash
    │   └── dto
    ├── categories
    │   └── dto
    ├── common
    │   ├── decorators
    │   ├── filters
    │   └── guards
    ├── conversations
    │   └── dto
    ├── customers
    │   └── dto
    ├── discounts
    │   └── dto
    ├── domains
    │   └── dto
    ├── inventory
    │   └── dto
    ├── mail
    │   └── templates
    ├── members
    │   └── dto
    ├── mercadopago
    │   └── dto
    ├── message-templates
    │   └── dto
    ├── orders
    │   └── dto
    ├── payments
    │   └── dto
    ├── platform
    │   └── dto
    ├── prisma
    ├── products
    │   └── dto
    ├── reports
    ├── returns
    │   └── dto
    ├── reviews
    │   └── dto
    ├── roles
    │   └── dto
    ├── storefront
    │   └── dto
    ├── subscriptions
    └── tags
        └── dto
```
