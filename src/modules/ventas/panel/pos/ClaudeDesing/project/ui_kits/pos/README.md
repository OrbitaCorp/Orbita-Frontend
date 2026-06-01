# Orbita · POS UI Kit

High-fidelity, interactive recreation of the **POS (punto de venta)** module — the in-store checkout surface a cashier uses with a customer waiting. Built on Orbita's design system (`../../colors_and_type.css`) and the component vocabulary from the codebase.

> **Note on scope:** the POS screens in the Orbita codebase (`ventas/admin/pos/*`) are empty stubs. This kit is an **original design** built strictly on Orbita's existing tokens, components, app shell and content voice — following the detailed POS product brief. It is not a recreation of finished screens.

## Run it
Open `index.html`. It's a click-thru prototype:

1. **Caja cerrada** → central "Abrir caja" CTA (everything behind is blurred/locked).
2. **Abrir caja** → cashier + starting cash form.
3. **Cobro rápido** (the priority screen) — 2 columns:
   - **Left (catalog):** big search, category chips, Favoritos (deduped from the grid below), product grid (mono prices, stock indicator, **out-of-stock cards greyed + non-clickable**), "Ítem libre". Products with variants open the **variant selector**.
   - **Right (ticket):** associate-client chip, line items with variant + per-product discount (struck price), **always-visible discount zone** (coupon input + "Descuento manual"), applied-coupon chip, automatic-promo line, **totals breakdown with a dominant TOTAL and a huge Cobrar button** (disabled & amount-less when empty), Pausar venta / Cancelar.
   - **Shift header:** "Caja abierta" status, turn total, Movimientos, Devolución, Pausados (count), Cerrar caja.
4. **Cobrar modal** → 5 methods (efectivo / débito / crédito / transferencia / QR in a 3+2 grid), Nº de operación for non-cash, "Monto exacto" + quick amounts, **Vuelto (green) / Falta (red)** computed large. Confirm gates on cash ≥ total.
5. **Post-venta modal** → success, comprobante nº, summary with vuelto, Imprimir / WhatsApp / Email / Copiar link, Nuevo ticket + Ver detalle.
6. Plus: **Asociar / crear cliente** modal, **variant selector** (talle × color matrix), **egreso/ingreso** de efectivo, **devolución / intercambio** (4-step), **Tickets pausados** drawer (retomar with auto-pause, descartar with confirm), **Cierre de caja** (turn KPIs, payment breakdown, count + colour-coded difference, confirm modal), **Historial de cajas** (filters, full table, En curso / Forzada badges, session detail modal, CSV).

Toggle **dark mode** with the moon/sun in the header — both modes are fully designed.

## Files
| File | What |
|---|---|
| `index.html` | Entry point — loads React + Babel + Lucide + all scripts. |
| `data.js` | Mock products, paused tickets, sessions + `fmt()` es-AR currency helper. |
| `Icon.jsx` | `<Icon name="credit-card">` — builds Lucide line icons (stroke 1.5). |
| `primitives.jsx` | `Button · Badge · Input · Card · Toast · Avatar` — faithful to the design-system components. |
| `Shell.jsx` | `Shell` = 240px sidebar (cashier nav subset) + 64px header. |
| `Catalog.jsx` | `Catalog` — left column: search, chips, favorites, product grid. |
| `Ticket.jsx` | `Ticket` — right column: items, totals block, Cobrar. |
| `Modals.jsx` | `CobroModal · PostVentaModal · ClienteModal · VarianteModal` + `ModalShell`. |
| `Modals2.jsx` | `PausadosDrawer · EgresoIngresoModal · DevolucionModal (4 pasos) · SesionDetalleModal`. |
| `OtherScreens.jsx` | `CajaCerrada · AperturaCaja · CierreCaja · Historial`. |
| `app.jsx` | State machine wiring the full flow. |

## Conventions used
- **All amounts in Geist Mono**, `es-AR` formatting (`$ 12.480`).
- **Sora** for screen titles / display (the POS brief's display face); Geist for body; Geist Mono for numbers.
- Icons: Lucide, `strokeWidth 1.5`, line style — no emoji.
- Voseo, sentence-case copy ("Asociar cliente", "Abrir caja"), fixed status vocabulary.
- Desktop / tablet-landscape optimized (≥1024px). Components: 8px inputs/buttons, 12px cards, subtle cool shadows, 1px `--color-border`.
