# Graph Report - ./apps  (2026-07-20)

## Corpus Check
- 12 files · ~264,581 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3591 nodes · 7186 edges · 244 communities (196 shown, 48 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Design System Components
- Discounts UI Components
- Messaging Module
- Inventory API DTOs
- Catalog Categories UI
- Branches API Module
- Design System Charts
- Discount Coupon Cards
- Discount Badge & Metrics
- API Auth Decorators
- Shared Web Components
- Team Config Forms
- POS History Filters
- MercadoPago DTOs
- Discount Tables UI
- Returns & Credit Notes API
- Discount Filters & Coupons
- Design System Cards
- Orders API DTOs
- Discount Detail Views
- Backend Implementation Phases
- Onboarding Business DTOs
- Shared Sales Components
- Businesses API Module
- Platform Admin DTOs
- POS Cash Register UI
- Design System Inputs
- NestJS Module Registry
- Auth Module & Controller
- Members Invitation DTOs
- Storefront Public UI
- POS Modals & Drawers
- Categories API Controller
- Auth Context Decorators
- Map Picker Component
- POS Catalog Grid
- Branches API Controller
- Conversations API Controller
- Storefront Product Cards
- POS Ticket Items
- Reviews API DTOs
- Tags API Module
- Discount Category List
- Storefront Checkout Stepper
- Discount Application Selector
- TypeScript Reference Types
- POS Payment Hooks
- API Package Dependencies
- API Dev Dependencies
- POS Cobro Payment UI
- Domains API Controller
- Message Templates DTOs
- API TypeScript Config
- Config Appearance Settings
- Storefront Public Controller
- Cash Register API Module
- Payments Verify DTOs
- Storefront Me DTOs
- Store Preview Component
- POS Returns Modal
- Module Cluster 60
- Module Cluster 61
- Module Cluster 62
- Module Cluster 63
- Module Cluster 64
- Module Cluster 65
- Module Cluster 66
- Module Cluster 67
- Module Cluster 68
- Module Cluster 69
- Module Cluster 70
- Module Cluster 71
- Module Cluster 72
- Module Cluster 73
- Module Cluster 74
- Module Cluster 75
- Module Cluster 76
- Module Cluster 77
- Module Cluster 78
- Module Cluster 79
- Module Cluster 80
- Module Cluster 81
- Module Cluster 82
- Module Cluster 83
- Module Cluster 84
- Module Cluster 85
- Module Cluster 86
- Module Cluster 87
- Module Cluster 88
- Module Cluster 89
- Module Cluster 90
- Module Cluster 91
- Module Cluster 92
- Module Cluster 93
- Module Cluster 94
- Module Cluster 95
- Module Cluster 96
- Module Cluster 97
- Module Cluster 98
- Module Cluster 99
- Module Cluster 100
- Module Cluster 101
- Module Cluster 102
- Module Cluster 103
- Module Cluster 104
- Module Cluster 105
- Module Cluster 106
- Module Cluster 107
- Module Cluster 108
- Module Cluster 109
- Module Cluster 110
- Module Cluster 111
- Module Cluster 112
- Module Cluster 113
- Module Cluster 114
- Module Cluster 115
- Module Cluster 116
- Module Cluster 117
- Module Cluster 118
- Module Cluster 119
- Module Cluster 120
- Module Cluster 121
- Module Cluster 122
- Module Cluster 123
- Module Cluster 124
- Module Cluster 125
- Module Cluster 126
- Module Cluster 127
- Module Cluster 128
- Module Cluster 129
- Module Cluster 130
- Module Cluster 131
- Module Cluster 132
- Module Cluster 133
- Module Cluster 134
- Module Cluster 135
- Module Cluster 136
- Module Cluster 137
- Module Cluster 138
- Module Cluster 139
- Module Cluster 140
- Module Cluster 141
- Module Cluster 142
- Module Cluster 143
- Module Cluster 144
- Module Cluster 145
- Module Cluster 146
- Module Cluster 147
- Module Cluster 148
- Module Cluster 149
- Module Cluster 150
- Module Cluster 151
- Module Cluster 152
- Module Cluster 153
- Module Cluster 154
- Module Cluster 155
- Module Cluster 156
- Module Cluster 157
- Module Cluster 158
- Module Cluster 159
- Module Cluster 160
- Module Cluster 161
- Module Cluster 162
- Module Cluster 163
- Module Cluster 164
- Module Cluster 165
- Module Cluster 166
- Module Cluster 167
- Module Cluster 168
- Module Cluster 169
- Module Cluster 170
- Module Cluster 176
- Module Cluster 177
- Module Cluster 178
- Module Cluster 179
- Module Cluster 180
- Module Cluster 181
- Module Cluster 182
- Module Cluster 183
- Module Cluster 184
- Module Cluster 185
- Module Cluster 186
- Module Cluster 187
- Module Cluster 188

## God Nodes (most connected - your core abstractions)
1. `AuthContext` - 75 edges
2. `PrismaService` - 69 edges
3. `PENDIENTES.md — apps/api` - 66 edges
4. `Roles()` - 61 edges
5. `CurrentBusiness` - 58 edges
6. `assertMemberContext()` - 58 edges
7. `fmtMoney()` - 46 edges
8. `RequirePermission()` - 40 edges
9. `Button()` - 34 edges
10. `Public()` - 32 edges

## Surprising Connections (you probably didn't know these)
- `Fase 16 — Integración Frontend ↔ Backend (continuo desde Fase 2)` --semantically_similar_to--> `docs/pendientes.md POS — Funcionalidad de spec no implementada + dependencias cruzadas`  [INFERRED] [semantically similar]
  api/BACKEND_IMPLEMENTACION.md → web/src/modules/ventas/panel/pos/docs/pendientes.md
- `Fase 9 — Descuentos (Backend)` --references--> `Spec funcional: Módulo de Descuentos y Cupones — Ventas (Retail)`  [INFERRED]
  api/BACKEND_IMPLEMENTACION.md → web/src/modules/ventas/panel/descuentos/implemetancion-descuentos.md
- `bootstrap()` --indirect_call--> `AppModule`  [INFERRED]
  api/src/main.ts → api/src/app.module.ts
- `RequestWithUser` --references--> `AuthContext`  [EXTRACTED]
  api/src/common/guards/auth.guard.ts → api/src/common/types/auth-context.type.ts
- `RequestWithUser` --references--> `AuthContext`  [EXTRACTED]
  api/src/common/guards/business-mode.guard.ts → api/src/common/types/auth-context.type.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Motor de descuentos: POS + Storefront comparten evaluación de descuentos via API backend** — web_descuentos_motor_backend, web_pos_cobro_no_api, api_backend_implementacion_discounts_phase [EXTRACTED 0.95]

## Communities (244 total, 48 thin omitted)

### Community 0 - "Design System Components"
Cohesion: 0.05
Nodes (76): AccionesGuardado(), Props, AlcanceCard, AlcanceSelector(), CARDS, Props, AplicacionSelector(), BeneficioBonusSelector() (+68 more)

### Community 1 - "Discounts UI Components"
Cohesion: 0.06
Nodes (66): Avatar(), AvatarProps, KpiCard(), byId(), ColaPreparacion(), ColaPreparacionProps, COLUMNAS, horaCorta() (+58 more)

### Community 2 - "Messaging Module"
Cohesion: 0.06
Nodes (55): BandejaProps, SK, Props, Avatar(), Props, BandejaLista(), FILTROS, Props (+47 more)

### Community 3 - "Inventory API DTOs"
Cohesion: 0.07
Nodes (41): Get, Delete, Post, CurrentBusiness, RequirePermission(), AuthContext, assertMemberContext(), Body (+33 more)

### Community 4 - "Catalog Categories UI"
Cohesion: 0.05
Nodes (49): catBtn, CatCampos, Categorias(), CatModal(), cl, countAll(), ICON_MAP, IconComp (+41 more)

### Community 5 - "Branches API Module"
Cohesion: 0.06
Nodes (45): CuponCardMobile(), ESTADO_ACCENT, fmtRangoCompacto(), fmtValor(), MONO, Props, CuponesTabla(), FilaCupon() (+37 more)

### Community 6 - "Design System Charts"
Cohesion: 0.05
Nodes (46): BadgeEstado(), CONFIG, Props, fmt(), MetricasDrawer(), MiniKpi2Props, Props, CANALES (+38 more)

### Community 7 - "Discount Coupon Cards"
Cohesion: 0.07
Nodes (29): PageLoader(), Props, Props, StorefrontLoader(), authedFetch(), AuthError, bffFetch(), tokenStore (+21 more)

### Community 8 - "Discount Badge & Metrics"
Cohesion: 0.05
Nodes (35): Get, CurrentUser, CustomerContext, assertCustomerContext(), AddressesController, Body, Controller, Delete (+27 more)

### Community 9 - "API Auth Decorators"
Cohesion: 0.09
Nodes (18): BusinessesController, BusinessesModule, Module, BusinessesService, NOTIFICATION_CHANNELS, NOTIFICATION_EVENTS, ChangeModeDto, Body (+10 more)

### Community 10 - "Shared Web Components"
Cohesion: 0.06
Nodes (41): CAJEROS_MOCK, ESTADOS_FILTER, FiltrosHistorial(), Props, ESTADO_CFG, FMT, formatFechaHora(), LABEL_METODO (+33 more)

### Community 11 - "Team Config Forms"
Cohesion: 0.06
Nodes (27): CreateMpOrderDto, IsOptional, IsUUID, CreateMpPosDto, IsOptional, IsString, IsUUID, CreateMpStoreDto (+19 more)

### Community 12 - "POS History Filters"
Cohesion: 0.07
Nodes (31): Button(), ButtonProps, ButtonSize, ButtonVariant, sizeStyles, variantStyles, QueueItem, pageWrap (+23 more)

### Community 13 - "MercadoPago DTOs"
Cohesion: 0.07
Nodes (36): Card(), CardProps, paddingMap, CardSectionProps, BarChart(), BarChartProps, BarItem, DonutChart() (+28 more)

### Community 14 - "Discount Tables UI"
Cohesion: 0.09
Nodes (34): ESTADO_ACCENT, FilaDescuento(), FilaDescuentoCard(), fmtFecha(), fmtRangoCompacto(), HEADS, HEADS_ORD, MONO (+26 more)

### Community 15 - "Returns & Credit Notes API"
Cohesion: 0.06
Nodes (31): CreditNotesController, Body, Controller, Get, Post, CreateCreditNoteDto, IsIn, IsNumber (+23 more)

### Community 16 - "Discount Filters & Coupons"
Cohesion: 0.07
Nodes (36): Props, DescuentosFiltros(), selectStyle, btnPrimario, btnSecundario, CuponesListado(), Props, fetchCupones() (+28 more)

### Community 17 - "Design System Cards"
Cohesion: 0.08
Nodes (24): CategoriesController, Body, Controller, Get, Param, Patch, Put, Query (+16 more)

### Community 18 - "Orders API DTOs"
Cohesion: 0.07
Nodes (30): CreateOrderDto, OrderItemInput, OrderPaymentInput, IsArray, IsBoolean, IsIn, IsInt, IsNumber (+22 more)

### Community 19 - "Discount Detail Views"
Cohesion: 0.09
Nodes (22): RequestWithUser, MemberContext, FindStockQueryDto, IsInt, IsOptional, IsString, IsUUID, Max (+14 more)

### Community 20 - "Backend Implementation Phases"
Cohesion: 0.10
Nodes (33): Err(), Inp(), InpProps, Lbl(), PasswordField(), RolRadios(), Toggle(), ToggleRow() (+25 more)

### Community 21 - "Onboarding Business DTOs"
Cohesion: 0.08
Nodes (28): DescuentosTabla(), DetalleConfiguracion(), fmt(), getRows(), Props, DetalleEncabezado(), DetalleVigencia(), DIAS (+20 more)

### Community 22 - "Shared Sales Components"
Cohesion: 0.07
Nodes (31): EmptyState(), Props, FORMATO, MontoDisplay(), MontoSize, Props, SIZE_PX, btnStyle() (+23 more)

### Community 23 - "Businesses API Module"
Cohesion: 0.07
Nodes (24): ConversationsController, Body, Controller, Get, Param, Patch, Post, ConversationsModule (+16 more)

### Community 24 - "Platform Admin DTOs"
Cohesion: 0.09
Nodes (31): Badge(), BadgeConfig, BadgeProps, BadgeStatus, config, fechaLarga(), fmtMoney(), saludoHora() (+23 more)

### Community 25 - "POS Cash Register UI"
Cohesion: 0.06
Nodes (27): CategoriesModule, Module, AppRole, BusinessModeGuard, RequestWithUser, Injectable, PermissionsGuard, Injectable (+19 more)

### Community 26 - "Design System Inputs"
Cohesion: 0.09
Nodes (21): GrantCompDto, IsString, SuspendBusinessDto, IsOptional, IsString, IsEmail, IsIn, IsString (+13 more)

### Community 27 - "NestJS Module Registry"
Cohesion: 0.06
Nodes (38): Fase 1 — Auth (NestJS Backend), Fase 4 — Catálogo (Categories/Tags/Products), Fase 9 — Descuentos (Backend), Fase 16 — Integración Frontend ↔ Backend (continuo desde Fase 2), Fase 8 — MercadoPago (OAuth, Webhooks, Point), Orbita Backend — Lista de Implementación por Fases, Fase 7 — Órdenes y Pagos (Core Transaccional), Fase 15 — Storefront Público (Endpoints sin Auth) (+30 more)

### Community 28 - "Auth Module & Controller"
Cohesion: 0.05
Nodes (37): POST /auth/accept-invitation y POST /auth/reset-password sin test e2e, POST /inventory/adjustment bloquea stock negativo (422), AppRole usaba nombres en inglés vs. roles seedeados en español, Branch no persiste lat/lng — dirección solo texto libre, Rol mínimo para operaciones de sucursal — solo owner, Bug: navegador de prueba no hidrata páginas Next.js — HMR/Turbopack issue, Panel ConfigGeneral integrado con API real — auth via useAuth+authedFetch, Análisis pre-implementación Fase 6 Customers — 7 fallas, 4 resueltas (+29 more)

### Community 29 - "Members Invitation DTOs"
Cohesion: 0.09
Nodes (21): CashController, Body, Controller, Get, Param, Post, CashModule, Module (+13 more)

### Community 30 - "Storefront Public UI"
Cohesion: 0.10
Nodes (22): BranchesController, Body, Controller, Delete, Param, Post, Put, BranchesModule (+14 more)

### Community 31 - "POS Modals & Drawers"
Cohesion: 0.08
Nodes (28): ConteoCierre(), FMT, inputBase, labelStyle, parseMonto(), Props, DiferenciaIndicador(), FMT (+20 more)

### Community 32 - "Categories API Controller"
Cohesion: 0.09
Nodes (23): JwtPayload, CustomerAuthResponse, LoginResponse, MemberAuthResponse, AcceptInvitationDto, IsString, MinLength, ForgotPasswordDto (+15 more)

### Community 33 - "Auth Context Decorators"
Cohesion: 0.14
Nodes (18): Breadcrumb(), Crumb, Props, StorefrontFooter(), NAV_LINKS, Props, StorefrontHeader(), CUPONES_MOCK (+10 more)

### Community 34 - "Map Picker Component"
Cohesion: 0.12
Nodes (24): Props, DrawerPausados(), ModalVariante(), AbrirCajaParams, CajaAbiertaProps, CajaYaAbierta(), CAJERO_MOCK, formatHora() (+16 more)

### Community 35 - "POS Catalog Grid"
Cohesion: 0.07
Nodes (16): Inner, MapPicker(), Props, checkEmail(), checkSubdomain(), BA, Cuenta, EstadoSub (+8 more)

### Community 36 - "Branches API Controller"
Cohesion: 0.08
Nodes (19): Msg, OrbiChat(), Props, QuickAction, Skeleton(), SkeletonProps, Categoria, Rubro (+11 more)

### Community 37 - "Conversations API Controller"
Cohesion: 0.13
Nodes (24): CatalogoPOS(), GRID, Props, FiltrosCatalogo(), Props, GrillaProductos(), Props, FORMATO (+16 more)

### Community 38 - "Storefront Product Cards"
Cohesion: 0.10
Nodes (17): AnnouncementBar(), badgeColor(), ProductCard(), Props, CATEGORIAS, PRODUCTOS, thumbGradientAlt(), TALLES (+9 more)

### Community 39 - "POS Ticket Items"
Cohesion: 0.11
Nodes (23): btnQty, FORMATO, Props, TicketItemRow(), FORMATO, Props, TicketPOS(), DescuentoDesglose (+15 more)

### Community 40 - "Reviews API DTOs"
Cohesion: 0.10
Nodes (17): CreateReviewDto, IsString, IsUUID, HideReviewDto, IsString, ProductReviewsController, Controller, ReviewsController (+9 more)

### Community 41 - "Tags API Module"
Cohesion: 0.09
Nodes (20): Props, DetalleProductos(), Props, ANCLA, CHART_REVENUE, CHART_USOS, FECHAS, metricasMock (+12 more)

### Community 42 - "Discount Category List"
Cohesion: 0.12
Nodes (14): InviteMemberDto, IsEmail, IsString, IsUUID, IsOptional, IsString, IsUUID, UpdateMemberDto (+6 more)

### Community 43 - "Storefront Checkout Stepper"
Cohesion: 0.12
Nodes (17): CheckoutStepper(), Props, STEPS, ProdImage(), ProdImageProps, Props, Thumb(), CARRITO_INICIAL (+9 more)

### Community 44 - "Discount Application Selector"
Cohesion: 0.10
Nodes (20): AplicacionCard, CARDS, Props, badgeBase, BadgeTipo(), esDescuento(), Props, PropsTipoCupon (+12 more)

### Community 45 - "TypeScript Reference Types"
Cohesion: 0.11
Nodes (12): IsEmail, IsOptional, IsString, UpsertSupplierDto, InventoryService, Injectable, SuppliersController, Body (+4 more)

### Community 46 - "POS Payment Hooks"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, **/*.ts (+19 more)

### Community 47 - "API Package Dependencies"
Cohesion: 0.12
Nodes (21): Props, useMovimientosCaja(), crearTicketMock(), CrearTicketParams, MOCK_TICKETS, useCrearTicket(), useTicketsRecientes(), FMT (+13 more)

### Community 48 - "API Dev Dependencies"
Cohesion: 0.07
Nodes (27): dependencies, argon2, class-transformer, handlebars, @nestjs/common, @nestjs/config, @nestjs/core, @nestjs-modules/mailer (+19 more)

### Community 49 - "POS Cobro Payment UI"
Cohesion: 0.07
Nodes (27): devDependencies, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, prisma, ts-jest, ts-node (+19 more)

### Community 50 - "Domains API Controller"
Cohesion: 0.09
Nodes (21): IconType, Modulo, MODULOS, Props, resItem, resLabel, RUBROS, SECCION_MODULO (+13 more)

### Community 51 - "Message Templates DTOs"
Cohesion: 0.14
Nodes (21): FMT, InputMonto(), parseMonto(), Props, quickAmounts(), LABELS_METODO, Metodo, METODOS_PAGO (+13 more)

### Community 52 - "API TypeScript Config"
Cohesion: 0.11
Nodes (14): DomainsController, Body, Controller, Get, Param, Post, DomainsModule, Module (+6 more)

### Community 53 - "Config Appearance Settings"
Cohesion: 0.11
Nodes (15): IsIn, IsString, UpsertMessageTemplateDto, MessageTemplatesController, Body, Controller, Delete, Get (+7 more)

### Community 54 - "Storefront Public Controller"
Cohesion: 0.08
Nodes (25): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+17 more)

### Community 55 - "Cash Register API Module"
Cohesion: 0.09
Nodes (15): EmptyState(), EmptyStateProps, Input(), InputProps, Column, PaginationProps, Table(), TableProps (+7 more)

### Community 56 - "Payments Verify DTOs"
Cohesion: 0.11
Nodes (17): ColorBlock(), IconT, pageWrap, SLIDE_GRADS, AP_DEFAULTS, EscalaFuente, FONT_DESCRIPCIONES, GOOGLE_FONTS (+9 more)

### Community 57 - "Storefront Me DTOs"
Cohesion: 0.12
Nodes (13): IsArray, IsOptional, IsString, UpsertRoleDto, PermissionsController, Controller, Get, RolesController (+5 more)

### Community 58 - "Store Preview Component"
Cohesion: 0.11
Nodes (13): MeReturnDto, IsIn, IsInt, IsOptional, IsString, IsUUID, IsOptional, IsString (+5 more)

### Community 59 - "POS Returns Modal"
Cohesion: 0.15
Nodes (9): IsString, UpsertTagDto, TagsController, Body, Controller, Get, Post, TagsService (+1 more)

### Community 60 - "Module Cluster 60"
Cohesion: 0.15
Nodes (21): ApiPermission, completeOnboarding(), getBusiness(), getBusinessConfig(), getOnboardingSession(), getRubrosCatalog(), publishBusiness(), registerBusiness() (+13 more)

### Community 61 - "Module Cluster 61"
Cohesion: 0.12
Nodes (17): changeBusinessMode(), getPermissionsCatalog(), getRoles(), panelGetBusiness(), panelGetBusinessConfig(), panelRequest(), panelUpdateBusinessConfig(), pauseBusiness() (+9 more)

### Community 62 - "Module Cluster 62"
Cohesion: 0.13
Nodes (13): IsOptional, IsString, VerifyPaymentDto, PaymentsController, Body, Controller, Get, Param (+5 more)

### Community 64 - "Module Cluster 64"
Cohesion: 0.11
Nodes (17): arrowStyle(), badgeColor(), CATS, DESTACADOS, HERO_EYEBROWS, HERO_HUES, HERO_PRECIOS, HERO_PRODS (+9 more)

### Community 65 - "Module Cluster 65"
Cohesion: 0.11
Nodes (18): FMT, ItemHistorial, MetodoReembolso, MOCK, ModalDevolucion(), ModalDevolucionContent(), MotivoDevolucion, MOTIVOS (+10 more)

### Community 66 - "Module Cluster 66"
Cohesion: 0.20
Nodes (10): AppModule, Module, HttpExceptionFilter, HttpResponseLike, bootstrap(), NOTE: Not covered automatically — requires a PENDING member with hasTempPassword, closeTestApp(), createTestApp() (+2 more)

### Community 67 - "Module Cluster 67"
Cohesion: 0.15
Nodes (5): MailModule, Global, Module, MailService, Injectable

### Community 68 - "Module Cluster 68"
Cohesion: 0.14
Nodes (10): SubscriptionsController, Controller, Get, SubscriptionsModule, Module, SubscriptionsService, Injectable, SubscriptionsWebhookController (+2 more)

### Community 69 - "Module Cluster 69"
Cohesion: 0.13
Nodes (12): FullModeOnly(), Get, Get, Param, Get, MeController, Body, Controller (+4 more)

### Community 70 - "Module Cluster 70"
Cohesion: 0.11
Nodes (17): RegisterBusinessDto, IsEmail, IsString, MinLength, IsArray, IsBoolean, IsIn, IsOptional (+9 more)

### Community 71 - "Module Cluster 71"
Cohesion: 0.12
Nodes (11): ApiError, dataUrlToBlob(), WizardData, SetupUnificado(), initialWizard, OnboardingState, useOnboardingStore, FEATURES (+3 more)

### Community 72 - "Module Cluster 72"
Cohesion: 0.13
Nodes (16): HeaderLinkDto, IsBoolean, IsString, HeroSlideDto, IsString, IsArray, IsBoolean, IsIn (+8 more)

### Community 73 - "Module Cluster 73"
Cohesion: 0.13
Nodes (6): Body, Get, Post, Query, OnboardingService, Injectable

### Community 74 - "Module Cluster 74"
Cohesion: 0.12
Nodes (15): AddImageDto, IsBoolean, IsOptional, IsUUID, FindProductsQueryDto, IsIn, IsInt, IsOptional (+7 more)

### Community 75 - "Module Cluster 75"
Cohesion: 0.29
Nodes (13): BackendResult, callBackend(), clearRefreshCookie(), cookieDomain(), firstHeader(), readRefreshCookie(), serializeCookie(), setRefreshCookie() (+5 more)

### Community 76 - "Module Cluster 76"
Cohesion: 0.15
Nodes (14): NAV_LINKS, Navbar(), OrbitSystem(), RING_SIZES, SatDef, SATS, AVATARS, Hero() (+6 more)

### Community 77 - "Module Cluster 77"
Cohesion: 0.17
Nodes (7): ReportsController, Controller, Get, ReportsModule, Module, ReportsService, Injectable

### Community 78 - "Module Cluster 78"
Cohesion: 0.14
Nodes (13): SendDiscountLinkDto, IsEmail, IsOptional, IsUUID, SetDiscountLinkDto, IsBoolean, IsOptional, IsString (+5 more)

### Community 79 - "Module Cluster 79"
Cohesion: 0.20
Nodes (7): DiscountsController, Controller, Delete, Get, Param, Patch, useDarkMode()

### Community 80 - "Module Cluster 80"
Cohesion: 0.14
Nodes (13): FindMovementsQueryDto, IsIn, IsInt, IsOptional, IsUUID, Max, Min, Type (+5 more)

### Community 81 - "Module Cluster 81"
Cohesion: 0.12
Nodes (17): babel-plugin-react-compiler, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/aos, @types/react, devDependencies (+9 more)

### Community 82 - "Module Cluster 82"
Cohesion: 0.15
Nodes (12): ApiRole, createRole(), deleteRole(), updateRole(), ModalRol(), RolCard(), RolChip(), Equipo() (+4 more)

### Community 83 - "Module Cluster 83"
Cohesion: 0.22
Nodes (13): DESCUENTOS_EXCLUSIVOS, Categoria, Cupon, DescuentoExclusivo, Direccion, ItemCarrito, Pedido, PedidoResumen (+5 more)

### Community 84 - "Module Cluster 84"
Cohesion: 0.14
Nodes (14): HISTORIAL_MOCK, MensajeCliente, MENSAJES_MOCK, USUARIO_MOCK, Burbuja(), ESTADO_COLOR, MensajesCliente(), PedidoMencionPopover() (+6 more)

### Community 85 - "Module Cluster 85"
Cohesion: 0.12
Nodes (16): aos, leaflet, next, react, react-dom, @types/leaflet, dependencies, aos (+8 more)

### Community 86 - "Module Cluster 86"
Cohesion: 0.15
Nodes (8): AppController, Controller, Get, PrismaModule, Global, Module, PrismaService, Injectable

### Community 87 - "Module Cluster 87"
Cohesion: 0.32
Nodes (7): Public(), StorefrontController, Body, Controller, Get, Param, Post

### Community 88 - "Module Cluster 88"
Cohesion: 0.15
Nodes (14): CheckoutBuyerInput, CheckoutDto, CheckoutItemInput, IsArray, IsEmail, IsIn, IsInt, IsObject (+6 more)

### Community 89 - "Module Cluster 89"
Cohesion: 0.14
Nodes (10): AdminLayout(), BcItem, CUPONES_VISTA_LABELS, DESCUENTOS_VISTA_LABELS, Notif, NOTIFS, POS_VISTA_LABELS, Props (+2 more)

### Community 90 - "Module Cluster 90"
Cohesion: 0.20
Nodes (7): AuditController, Controller, Get, AuditModule, Module, AuditService, Injectable

### Community 91 - "Module Cluster 91"
Cohesion: 0.31
Nodes (6): AuthController, Body, Controller, Post, Headers, Throttle

### Community 93 - "Module Cluster 93"
Cohesion: 0.16
Nodes (12): Modal(), ModalProps, ModalVariant, variantBg, variantColor, variantIcon, DEST, EmailMasivoModal() (+4 more)

### Community 94 - "Module Cluster 94"
Cohesion: 0.16
Nodes (7): UnifiedPanelCard(), useCounter(), BadgeVariant, MOB_STARS, Step, StepItem, STEPS

### Community 95 - "Module Cluster 95"
Cohesion: 0.24
Nodes (12): CreateProductDto, ProductOptionInput, ProductVariantInput, IsArray, IsIn, IsInt, IsNumber, IsOptional (+4 more)

### Community 96 - "Module Cluster 96"
Cohesion: 0.15
Nodes (4): ALL_PRODUCTS, CATS, SEARCH_TARGETS, StoreCard()

### Community 97 - "Module Cluster 97"
Cohesion: 0.19
Nodes (9): PresentationSections(), SLIDES, Window, RUBROS, RubrosCarousel(), Testimonial, TESTIMONIALS, Upcoming (+1 more)

### Community 98 - "Module Cluster 98"
Cohesion: 0.31
Nodes (10): AddCarritoOptions, buildItemKey(), CarritoItem, CarritoProductBase, useCarrito(), CheckoutCupon, CheckoutManualDiscount, CheckoutTotals (+2 more)

### Community 99 - "Module Cluster 99"
Cohesion: 0.17
Nodes (10): Put, IsArray, IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString (+2 more)

### Community 100 - "Module Cluster 100"
Cohesion: 0.18
Nodes (11): CartItemInput, EvaluateDiscountsDto, IsArray, IsIn, IsInt, IsNumber, IsOptional, IsString (+3 more)

### Community 101 - "Module Cluster 101"
Cohesion: 0.20
Nodes (8): ComprobanteBase(), ComprobanteBaseProps, ComprobanteEmisor, ComprobanteItem, ComprobanteTotal, fmtMonto(), FECHA_HOY, HORA_HOY

### Community 102 - "Module Cluster 102"
Cohesion: 0.23
Nodes (11): DateRangePicker(), DIAS, fmtChip(), fmtFull(), GridProps, inRange(), MESES, MonthGrid() (+3 more)

### Community 103 - "Module Cluster 103"
Cohesion: 0.24
Nodes (7): cols, Footer(), LegalKey, ScrollSequence(), ScrollToTop(), Props, SectionDivider()

### Community 105 - "Module Cluster 105"
Cohesion: 0.22
Nodes (8): AparienciaProps, ConfigTabs(), ConfigTabsProps, TABS, VistaConfig, CANALES, pageWrap, PANEL

### Community 106 - "Module Cluster 106"
Cohesion: 0.29
Nodes (9): CardProps, FMT, formatHora(), inicial(), PausadoCard(), Props, totalTicket(), PausadosState (+1 more)

### Community 107 - "Module Cluster 107"
Cohesion: 0.20
Nodes (10): scripts, build, dev, postinstall, prisma:generate, prisma:migrate:dev, prisma:validate, seed (+2 more)

### Community 108 - "Module Cluster 108"
Cohesion: 0.22
Nodes (5): SupabaseModule, Global, Module, SupabaseService, Injectable

### Community 109 - "Module Cluster 109"
Cohesion: 0.22
Nodes (6): CustomRange, DateRangePopover(), fmtShort(), Periodo, PERIODOS, PeriodoSelectorProps

### Community 111 - "Module Cluster 111"
Cohesion: 0.22
Nodes (8): collection, compilerOptions, assets, deleteOutDir, watchAssets, $schema, sourceRoot, mail/templates/**/*.hbs

### Community 112 - "Module Cluster 112"
Cohesion: 0.25
Nodes (4): DiscountsModule, Module, DiscountsService, Injectable

### Community 113 - "Module Cluster 113"
Cohesion: 0.25
Nodes (8): ImageOrderItem, ReorderImagesDto, IsArray, IsInt, IsOptional, IsUUID, Type, ValidateNested

### Community 114 - "Module Cluster 114"
Cohesion: 0.22
Nodes (8): exclude, extends, dist, node_modules, prisma, **/*spec.ts, test, ./tsconfig.json

### Community 115 - "Module Cluster 115"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 116 - "Module Cluster 116"
Cohesion: 0.25
Nodes (7): descuento(), CARACT, COLORES, HUES, ProductoDetalle(), RESENAS, TALLES

### Community 117 - "Module Cluster 117"
Cohesion: 0.22
Nodes (7): Appt, CalendarCard(), DAYS, INITIAL_APPTS, NEW_BOOKINGS, NUMS, WEEK_GRID

### Community 118 - "Module Cluster 118"
Cohesion: 0.25
Nodes (8): AuthGuard no validaba businessId del JWT contra DB — defensa en profundidad agregada, AuthGuard prioriza member sobre customer con X-Business-Slug, Aislamiento multi-tenant en AuthGuard y login/register — vulnerabilidad cross-tenant corregida, Email de recovery duplicado de Supabase — resuelto con auth propio, Validación JWT vía Supabase → migrada a jwt.verify local (HS256), AuthService.login() enmascaraba excepciones como 'Credenciales inválidas', Migración de Supabase Auth a sistema propio (argon2id/JWT HS256), 15 casos de TOCTOU: update/delete por id sin businessId en where — corregidos

### Community 119 - "Module Cluster 119"
Cohesion: 0.25
Nodes (7): IsArray, IsBoolean, IsEmail, IsNumber, IsOptional, IsString, UpdateBusinessConfigDto

### Community 120 - "Module Cluster 120"
Cohesion: 0.25
Nodes (7): breakpoints, grid, layout, radius, spacing, SpacingKey, zIndex

### Community 121 - "Module Cluster 121"
Cohesion: 0.36
Nodes (7): DashboardCard(), DATA, Period, PERIODS, SALES_POOL, StatCard(), useCountUp()

### Community 122 - "Module Cluster 122"
Cohesion: 0.29
Nodes (6): description, name, prisma, seed, private, version

### Community 123 - "Module Cluster 123"
Cohesion: 0.29
Nodes (5): RegisterDto, IsEmail, IsOptional, IsString, MinLength

### Community 124 - "Module Cluster 124"
Cohesion: 0.29
Nodes (6): fontFamily, letterSpacing, lineHeight, prose, TextStyleKey, textStyles

### Community 125 - "Module Cluster 125"
Cohesion: 0.38
Nodes (5): LEGAL_CONTENT, LegalKey, LegalModal(), Props, LegalModal()

### Community 126 - "Module Cluster 126"
Cohesion: 0.33
Nodes (3): PrimerPasoProps, SERVICIOS, TurnosSetup()

### Community 129 - "Module Cluster 129"
Cohesion: 0.40
Nodes (3): PERMISSIONS, prisma, ROLE_PERMISSIONS

### Community 130 - "Module Cluster 130"
Cohesion: 0.60
Nodes (4): config, isPassthrough(), middleware(), slugFromHost()

### Community 131 - "Module Cluster 131"
Cohesion: 0.50
Nodes (4): LiveChatCard(), Msg, Source, SOURCES

### Community 132 - "Module Cluster 132"
Cohesion: 0.50
Nodes (5): Apariencia(), FontSelect(), StorePreview(), fontStack(), loadFont()

### Community 133 - "Module Cluster 133"
Cohesion: 0.50
Nodes (3): AuthModule, Global, Module

### Community 134 - "Module Cluster 134"
Cohesion: 0.50
Nodes (3): IsOptional, IsString, UpdateBusinessDto

### Community 136 - "Module Cluster 136"
Cohesion: 0.50
Nodes (3): duration, easing, transitions

### Community 137 - "Module Cluster 137"
Cohesion: 0.50
Nodes (3): ColorToken, dark, light

### Community 138 - "Module Cluster 138"
Cohesion: 0.50
Nodes (3): ImgUploader(), ImgUploaderProps, smallBtn

### Community 139 - "Module Cluster 139"
Cohesion: 0.67
Nodes (3): DELETE /business diferido hasta módulo Subscriptions, registerBusiness() no crea Subscription — diferido hasta módulo Subscriptions/MercadoPago, Política de suscripción vencida y eliminación de espacio

### Community 140 - "Module Cluster 140"
Cohesion: 0.67
Nodes (3): RBT-293 — logo del negocio y verificación de email en tiempo real, Bug: bucket product-images no existía en Supabase Storage, Error intermitente RLS en Storage (business-logos)

### Community 141 - "Module Cluster 141"
Cohesion: 0.67
Nodes (3): OnboardingService duplica PERMISSIONS/ROLE_PERMISSIONS de prisma/seed.ts — riesgo de desincronización, POST /businesses no implementado — diferido hasta BusinessOnboardingService, Bug: tsconfig.build.json compilaba prisma/ rompiendo rootDir de dist/

### Community 144 - "Module Cluster 144"
Cohesion: 0.67
Nodes (3): Guía: Cómo agregar un nuevo rubro al onboarding (SetupUnificado), ElegirRubro — Selector visual de rubros del onboarding, SetupUnificado — Componente orquestador del wizard de onboarding

## Knowledge Gaps
- **735 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `mail/templates/**/*.hbs` (+730 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **48 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useDarkMode()` connect `Module Cluster 79` to `Module Cluster 64`, `Module Cluster 132`?**
  _High betweenness centrality (0.371) - this node is a cross-community bridge._
- **Why does `Roles()` connect `Storefront Public UI` to `Module Cluster 128`, `Inventory API DTOs`, `Discount Badge & Metrics`, `Team Config Forms`, `Returns & Credit Notes API`, `Orders API DTOs`, `Discount Detail Views`, `POS Cash Register UI`, `Members Invitation DTOs`, `Reviews API DTOs`, `Discount Category List`, `API TypeScript Config`, `Config Appearance Settings`, `Storefront Me DTOs`, `Module Cluster 62`, `Module Cluster 68`, `Module Cluster 78`, `Module Cluster 79`, `Module Cluster 90`, `Module Cluster 99`?**
  _High betweenness centrality (0.321) - this node is a cross-community bridge._
- **Why does `Button()` connect `POS History Filters` to `Discounts UI Components`, `Catalog Categories UI`, `Module Cluster 109`, `MercadoPago DTOs`, `Domains API Controller`, `Backend Implementation Phases`, `Cash Register API Module`, `Platform Admin DTOs`, `Payments Verify DTOs`, `Module Cluster 93`?**
  _High betweenness centrality (0.191) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _735 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Design System Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05025699600228441 - nodes in this community are weakly interconnected._
- **Should `Discounts UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05510388437217705 - nodes in this community are weakly interconnected._
- **Should `Messaging Module` be split into smaller, more focused modules?**
  _Cohesion score 0.05627705627705628 - nodes in this community are weakly interconnected._