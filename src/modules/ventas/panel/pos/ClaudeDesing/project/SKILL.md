---
name: orbita-design
description: Use this skill to generate well-branded interfaces and assets for Orbita — the Argentine multi-vertical commerce SaaS — for production or throwaway prototypes/mocks. Contains essential design guidelines, color + type tokens, fonts, brand assets, and a POS UI kit of recreated components for prototyping.
user-invocable: true
---

# Orbita design skill

Read **`README.md`** first — it has the full product context, content voice, visual foundations, iconography, and a file index. Then explore the other files as needed.

## What's here
- `colors_and_type.css` — all color, type, spacing, radius, shadow and motion tokens as CSS vars (light + dark) plus semantic type classes. **Import this in any Orbita artifact.**
- `assets/` — brand assets (`logo.svg`).
- `preview/` — small specimen cards for the tokens and components.
- `ui_kits/pos/` — interactive POS module recreation (React + Babel): `Shell`, `Catalog`, `Ticket`, modals, `CajaCerrada/AperturaCaja/CierreCaja/Historial`, and the `Button/Badge/Input/Card/Toast/Avatar` primitives. Copy components out as starting points.
- `src/` — read-only reference imported from the Orbita codebase (design-system tokens + components).

## How to use it
- **Visual artifacts** (slides, mocks, throwaway prototypes): copy `assets/` + `colors_and_type.css` into your output folder and build static/interactive HTML. Reuse the `ui_kits/pos` components for any commerce/admin UI.
- **Production code**: read the rules here and lift exact token values; the `src/` reference mirrors the real `design-system/`.

## Non-negotiables (the Orbita look)
- **Cool slate + single blue accent** (`#3B82F6` / hover `#2563EB`); full light + dark mode.
- **Geist Sans** UI, **Geist Mono** for every price/ID/number (es-AR: `$ 12.480`). The **POS module** additionally uses **Sora** for titles.
- **Lucide** line icons, `strokeWidth 1.5`. No emoji.
- 4px spacing grid; 8px inputs/buttons, 12px cards; subtle cool shadows; separation by 1px borders. Flat backgrounds — no gradients, no decorative imagery.
- Copy: Argentine voseo, sentence case, direct and operational. Fixed status vocabulary (Pendiente/Confirmado/…).

If invoked with no other guidance, ask the user what they want to build or design, ask a few focused questions, then act as an expert Orbita designer — output HTML artifacts or production code depending on the need.
