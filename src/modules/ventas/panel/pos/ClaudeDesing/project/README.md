# Orbita · Design System

> SaaS multirubro argentino para comercios. Cada negocio tiene su propio sitio, catálogo y panel de gestión bajo un subdominio (`negocio.orbita.com`). Sin comisiones, suscripción mensual.

This repository is a **design system + UI kit** for Orbita — visual foundations, tokens, component specs, and high-fidelity HTML recreations that let a design agent produce on-brand Orbita interfaces and assets.

---

## What Orbita is

Orbita is a multi-vertical ("multirubro") SaaS platform aimed at Argentine merchants — shops, barbershops, restaurants, etc. Each business gets its own public storefront, catalog and admin panel on a dedicated subdomain. The business model is a flat monthly subscription with **no per-sale commissions**.

The platform is organized into **módulos padre** (parent modules), each a self-contained world:

- **`ventas`** — every cart-based vertical: indumentaria, calzado, electrónica, ferretería, and 13+ sub-verticals. Houses catalog, orders, customers, reports, **POS**, inventory, messages, discounts.
- **`turnos`** — every appointment-based vertical: barbería, spa, uñas, sports courts. Houses agenda, bookings, services, KPIs.

Adding a vertical is mostly backend configuration — 14 of 17 sub-verticals only change the product form fields, rendered dynamically from backend JSON.

### The module being designed here: **POS** (`ventas/admin/pos`)

This design system was created to support the **POS (punto de venta)** module — the in-store checkout surface used by shop staff on a counter device. In the codebase its screens (`POSCobro`, `POSApertura`, `POSCierre`, `POSHistorial`) are **empty stubs** — so the UI kit in `ui_kits/pos/` is an original design built strictly on Orbita's existing tokens, components and visual language, not a recreation of finished screens.

POS sub-screens (from the codebase structure):
- **POSApertura** — open the register/till (caja), set starting cash.
- **POSCobro** — the main checkout: product grid + cart + payment.
- **POSCierre** — close the till, reconcile cash vs. expected.
- **POSHistorial** — past sessions and transactions.

---

## Sources

This system was reverse-engineered from the materials below. **The reader is not assumed to have access**, but they are recorded so anyone who does can go deeper.

| Source | Location | Notes |
|---|---|---|
| Frontend monorepo | **github.com/OrbitaCorp/Orbita-Frontend** | Next.js (Pages Router) · TypeScript · Tailwind · Supabase · Turborepo. Design system lives in `apps/frontend/src/design-system/`. |
| Design tokens | `src/design-system/tokens/{colors,typography,spacing,animations}.ts` | Light + dark palettes, Geist type scale, 4px spacing, motion. Mirrored in `colors_and_type.css`. |
| Components | `src/design-system/components/*.tsx` | Button, Input, Badge, Card, Modal, Toast, Table, KpiCard, Chart, Skeleton, EmptyState, Avatar. |
| App shell | `src/layouts/components/{Sidebar,Header}.tsx` | 240px sidebar + 64px sticky header (AdminLayout). |
| Brand logo | `uploads/logo.svg` → `assets/logo.svg` | Orbit mark (see Iconography). |

**Explore the repo further** to build higher-fidelity designs: the token files and `pages/design-system.tsx` reference page are the authoritative source for any value not captured here.

---

## CONTENT FUNDAMENTALS

How Orbita writes copy, in its own product voice.

- **Language: Argentine Spanish (es-AR).** Voseo is used in product instructions ("agregá", "buscá", "pegá", "elegí"). Never the Spanish "tú" forms. Currency, dates and numbers use the `es-AR` locale: `$1.250,00`, `25/12/2026`.
- **Voice: direct, operational, plain.** Copy reads like a competent colleague explaining the system, not a marketer. Sentences are short and instructional. Example from the codebase: *"Todo dev debe buscar acá antes de crear un componente nuevo."*
- **Person:** addresses the user as **vos/tú** ("Buscar en Orbita…", "Cerrar sesión", "Mi perfil"). First-person plural only for the brand internally.
- **Casing:** **Sentence case** everywhere — buttons, titles, menu items ("Cerrar sesión", not "Cerrar Sesión"). UPPERCASE is reserved for micro-labels with letter-spacing: table headers, KPI labels, section dividers ("GESTIÓN", "CUENTA").
- **Labels are nouns, actions are verbs.** Nav items are single nouns: *Pedidos, Catálogo, Clientes, Reportes, POS, Inventario*. Buttons are imperative verbs: *Cobrar, Abrir caja, Agregar producto*.
- **Status vocabulary is fixed** (from `Badge.tsx`): `Pendiente · Confirmado · Cancelado · Completado · En proceso · Enviado · En prep. · Entregado`. Reuse these exact words; don't invent synonyms.
- **Numbers, prices and IDs are monospaced** (Geist Mono) and the system leans on them: order IDs (`#A-1042`), totals, percentages, pagination ("1–10 de 248").
- **No emoji.** The product UI uses Lucide line icons, never emoji. (A single `●` glyph appears only as an icon fallback in code.)
- **Tone of empty/error states:** helpful and concrete, never cute. EmptyState pairs a one-line title with a short clarifying sentence and a clear action.
- **Vibe:** trustworthy, efficient, "panel de control". Think a clean operational dashboard a shop owner checks between customers — not a playful consumer app.

---

## VISUAL FOUNDATIONS

- **Color vibe.** Cool, professional, slate-and-blue. Neutrals are the Tailwind **slate** ramp (`#0F172A → #F8FAFC`); the single brand accent is **blue** (`#3B82F6`, hover `#2563EB`). Semantic colors: green success, amber warning, red error, blue info — each with a tinted background (`*-bg`). Full **light + dark mode**; dark mode is layered slate surfaces (bg `#0F172A` → surface `#1E293B` → alt `#334155` → high `#475569`) and lightened accents (blue-400/300) for contrast.
- **Type.** **Geist Sans** for everything UI; **Geist Mono** for prices, IDs, code, pagination and KPI values. 10-level scale from 48px display down to 12px caption. Headings `line-height: 1.2` with slight negative tracking on displays; body `1.6`. Weights: 400 body, 500 buttons/labels, 600 headings/emphasis, 700–800 display.
- **Spacing.** Strict **4px base grid** — every margin/padding/gap is a multiple of 4. Tokens `1`(4px) → `20`(80px). Card padding sm/md/lg = 16/24/32.
- **Corner radii.** `sm 4px` (chips/tooltips), `md 8px` (inputs/buttons), `lg 12px` (cards/modals/panels), `full 9999px` (pill badges, avatars). Inputs and buttons are 8px; cards are 12px.
- **Cards.** Surface fill (`--color-surface`), 1px `--color-border`, 12px radius, resting shadow `0 1px 3px rgba(15,23,42,.06)`. Hoverable cards lift to `translateY(-1px)`, swap to `--color-border-strong`, and use a two-layer shadow. **No colored left-border accent cards** — that pattern does not exist here.
- **Shadows / elevation.** Subtle and cool-tinted (`rgba(15,23,42,…)` in light, `rgba(0,0,0,…)` in dark). Four steps: `sm` (resting card), `card` (hover), `pop` (dropdown/popover), `modal` (16px/40px). Used sparingly — borders do most of the separation work.
- **Borders over fills.** Separation is primarily 1px borders, not heavy shadows or background blocks. Table rows divide with 1px borders; hover tints rows with `--color-surface-alt`.
- **Backgrounds.** Flat. No gradients, no imagery, no textures, no patterns in the app chrome. App bg is white (light) / deep slate (dark); sections sit on `--color-surface`. **Avoid bluish-purple gradients entirely.**
- **Transparency & blur.** Used only for overlays: modal scrim is `rgba(15,23,42,0.5)` with `backdrop-filter: blur(2px)`. Dark-mode semantic badge fills use low-alpha color tints (e.g. `rgba(52,211,153,0.12)`).
- **Animation.** Functional and quick. Durations: `fast 150ms` (button hover), `base 200ms` (card hover, modal in, page), `slow 300ms` (sidebar width, toast in), `xslow 1500ms` (skeleton shimmer loop). Easings: mostly `ease`/`ease-out`; the **toast** uses a springy `cubic-bezier(0.34,1.56,0.64,1)` to grab attention. Modal in: `opacity 0→1 + scale .97→1`. Dropdown: `opacity + translateY(-4px→0)`. **Respect `prefers-reduced-motion`** — drop to 0ms.
- **Hover states.** Buttons darken (`primary → primary-h`) or tint background; ghost/menu items fill with `--color-surface-alt`; nav active item gets blue bg + blue text + 3px blue left-border (an in-app nav convention, not a card pattern). Icon buttons are 36px squares with a 1px border that don't change shape on hover.
- **Press states.** Primary buttons go to `--color-primary-700`. No scale-down/shrink on press.
- **Focus.** Inputs transition `border-color` to error/primary and may add a soft `box-shadow` ring; `--color-border-strong` marks focus-eligible components.
- **Layout rules.** Fixed 240px sidebar (collapses to 64px; becomes a drawer < 768px), 64px sticky header, max content width 1280px, content padding 24px, 12-column grid with 24px gap. Breakpoints: sm 640 / md 768 / lg 1024 / xl 1280.
- **Imagery.** The admin product is essentially image-free — it's data, tables, charts and forms. Product thumbnails in catalog/POS are simple rounded squares (8px) on `--color-surface-alt`, often with a Lucide icon placeholder when no photo exists. No photographic hero imagery, no illustration system.
- **Charts.** Pure inline SVG (no chart library): Line, Bar, Donut. Blue primary series on a slate grid; values monospaced.

---

## ICONOGRAPHY

- **Icon set: [Lucide](https://lucide.dev)** (`lucide-react` in the codebase). This is the single, consistent icon system — outline/line style.
- **Default treatment:** `strokeWidth={1.5}`, size **18px** in nav/menus, **16px** inline in buttons/inputs, **26px** in empty states, **14px** in dense controls/pagination. `stroke="currentColor"` so icons inherit text color.
- **Icons seen in the app:** `Home, ShoppingBag, Package, Users, Store, BarChart2, CreditCard, ChevronDown, Settings, HelpCircle, Tag, Percent, Truck, MessageSquare, Bell, Moon, Sun, Search, LogOut, User`. POS-relevant: `CreditCard` (POS nav), plus `Banknote, QrCode, Trash2, Plus, Minus, Lock, Unlock` for checkout.
- **No emoji**, no PNG icons, no custom icon font. A lone `●` (filled circle) appears only as a KPI icon fallback.
- **How to use here:** load Lucide from CDN. For HTML/vanilla, `https://unpkg.com/lucide@latest` then `lucide.createIcons()`. For React prototypes, `https://unpkg.com/lucide-react`. Match stroke 1.5 and the sizes above. Spinner and small inline glyphs (error icon, modal close ✕) are hand-written SVGs in the components but use the same line style.
- **Logo:** `assets/logo.svg` — an orbital mark: a blue (`#2563eb`) dashed ring with a small light-blue (`#93c5fd`) "satellite" dot top-right and a dark-blue (`#1e3a8a`) core. 30×30 viewBox; pairs with the wordmark "Orbita" in 600-weight Geist at 16px. Keep the mark on flat light or dark backgrounds; don't place on busy imagery.

---

## Index — what's in this folder

| Path | What |
|---|---|
| `README.md` | This file — context, content & visual foundations, iconography, manifest. |
| `colors_and_type.css` | All color + type + spacing + motion tokens as CSS vars (light + dark) and semantic type classes. **Import this everywhere.** |
| `SKILL.md` | Agent Skill manifest — how to use this system to build Orbita designs. |
| `assets/` | Brand assets: `logo.svg`. |
| `preview/` | Small HTML cards that populate the Design System tab (colors, type, spacing, components). |
| `ui_kits/pos/` | **POS module UI kit** — `README.md`, `index.html` (interactive click-thru), and JSX components. |
| `src/` | Imported reference source from the Orbita codebase (tokens + components) — read-only reference, not used at runtime. |

### Fonts
Geist Sans + Geist Mono are loaded from **Google Fonts** (both are published there). No local font files are bundled. If you need offline/embedded fonts, download Geist from [vercel.com/font](https://vercel.com/font) and drop the `.woff2` files into `fonts/`.

> **Font divergence — POS module.** The codebase uses Geist for everything. The POS product brief introduces **Sora** (weights 600/700/800) as the display/title face for the POS module specifically, with Geist for body and Geist Mono for numbers. The POS UI kit honours this: it defines `--font-display: "Sora"` scoped to the kit (`ui_kits/pos/index.html`) so the global, Geist-based system stays untouched. **Flag:** if Sora should become the system-wide display face (or stay POS-only), let me know and I'll align the tokens accordingly.
