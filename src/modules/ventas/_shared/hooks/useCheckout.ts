import { useMemo } from 'react';
import type { CarritoItem } from './useCarrito';

export interface CheckoutTotals {
	subtotal: number;
	descProd: number;
	descCupon: number;
	descManual: number;
	descTotal: number;
	total: number;
	iva: number;
}

export interface CheckoutCupon {
	codigo: string;
	pct: number;
}

export interface CheckoutManualDiscount {
	pct: number;
}

export function computeCheckoutTotals(
	items: CarritoItem[],
	cupon: CheckoutCupon | null,
	manual: CheckoutManualDiscount | null,
): CheckoutTotals {
	const subtotal = items.reduce((sum, item) => sum + item.precio * item.qty, 0);

	const descProd = items.reduce((sum, item) => {
		if (!item.descPct) return sum;
		return sum + Math.round((item.precio * item.qty * item.descPct) / 100);
	}, 0);

	const base = subtotal - descProd;
	const descCupon = cupon ? Math.round((base * cupon.pct) / 100) : 0;
	const descManual = manual ? Math.round((base * manual.pct) / 100) : 0;
	const descTotal = descProd + descCupon + descManual;
	const total = Math.max(0, subtotal - descTotal);
	const iva = Math.round(total - total / 1.21);

	return {
		subtotal,
		descProd,
		descCupon,
		descManual,
		descTotal,
		total,
		iva,
	};
}

export function useCheckout(
	items: CarritoItem[],
	cupon: CheckoutCupon | null,
	manual: CheckoutManualDiscount | null,
): CheckoutTotals {
	return useMemo(
		() => computeCheckoutTotals(items, cupon, manual),
		[items, cupon, manual],
	);
}
