import { useMemo, useState } from 'react';

export interface CarritoItem {
	key: string;
	id: string;
	nombre: string;
	precio: number;
	cat: string;
	qty: number;
	descPct?: number;
	variante?: string;
}

export interface CarritoProductBase {
	id: string;
	nombre: string;
	precio: number;
	cat: string;
	descPct?: number;
}

interface AddCarritoOptions {
	qty?: number;
	variante?: string;
}

function buildItemKey(productoId: string, variante?: string): string {
	return `${productoId}::${variante ?? 'base'}`;
}

export function useCarrito(initialItems: CarritoItem[] = []) {
	const [items, setItems] = useState<CarritoItem[]>(initialItems);

	const addProduct = (producto: CarritoProductBase, options: AddCarritoOptions = {}) => {
		const qty = Math.max(1, options.qty ?? 1);
		const key = buildItemKey(producto.id, options.variante);

		setItems((prev) => {
			const index = prev.findIndex((item) => item.key === key);
			if (index >= 0) {
				const next = [...prev];
				next[index] = { ...next[index], qty: next[index].qty + qty };
				return next;
			}

			return [
				...prev,
				{
					key,
					id: producto.id,
					nombre: producto.nombre,
					precio: producto.precio,
					cat: producto.cat,
					qty,
					descPct: producto.descPct,
					variante: options.variante,
				},
			];
		});
	};

	const removeByKey = (key: string) => {
		setItems((prev) => prev.filter((item) => item.key !== key));
	};

	const setQtyByKey = (key: string, qty: number) => {
		const safeQty = Math.max(0, qty);
		setItems((prev) =>
			prev
				.map((item) => (item.key === key ? { ...item, qty: safeQty } : item))
				.filter((item) => item.qty > 0),
		);
	};

	const incByKey = (key: string) => {
		setItems((prev) =>
			prev.map((item) => (item.key === key ? { ...item, qty: item.qty + 1 } : item)),
		);
	};

	const decByKey = (key: string) => {
		setItems((prev) =>
			prev
				.map((item) => (item.key === key ? { ...item, qty: item.qty - 1 } : item))
				.filter((item) => item.qty > 0),
		);
	};

	const clear = () => setItems([]);

	const totalItems = useMemo(
		() => items.reduce((sum, item) => sum + item.qty, 0),
		[items],
	);

	return {
		items,
		setItems,
		addProduct,
		removeByKey,
		setQtyByKey,
		incByKey,
		decByKey,
		clear,
		totalItems,
	};
}
