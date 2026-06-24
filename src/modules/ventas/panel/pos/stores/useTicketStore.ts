import { create } from 'zustand'
import type { TicketItem, ClienteAsociado, Descuento } from '../types'

function buildItemId(productoId: string, varianteId?: string): string {
  return `${productoId}::${varianteId ?? 'base'}`
}

interface TicketState {
  items: TicketItem[]
  cliente: ClienteAsociado | null
  cupon: Descuento | null
  descuentoManual: Descuento | null

  agregarItem: (item: Omit<TicketItem, 'id'> & { productoId: string; varianteId?: string }) => void
  removerItem: (id: string) => void
  actualizarCantidad: (id: string, cantidad: number) => void
  editarPrecio: (id: string, precio: number) => void
  editarDescuentoItem: (id: string, descuento: Descuento | null) => void
  agregarNota: (id: string, nota: string) => void

  asociarCliente: (cliente: ClienteAsociado) => void
  quitarCliente: () => void

  aplicarCupon: (cupon: Descuento) => void
  quitarCupon: () => void
  aplicarDescuentoManual: (descuento: Descuento | null) => void

  limpiarTicket: () => void
}

export const useTicketStore = create<TicketState>((set) => ({
  items: [],
  cliente: null,
  cupon: null,
  descuentoManual: null,

  agregarItem: (itemBase) => {
    const id = buildItemId(itemBase.productoId, itemBase.varianteId)
    set((state) => {
      const idx = state.items.findIndex((i) => i.id === id)
      if (idx >= 0) {
        const next = [...state.items]
        next[idx] = { ...next[idx], cantidad: next[idx].cantidad + (itemBase.cantidad ?? 1) }
        return { items: next }
      }
      return { items: [...state.items, { ...itemBase, id }] }
    })
  },

  removerItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  actualizarCantidad: (id, cantidad) =>
    set((state) => ({
      items:
        cantidad <= 0
          ? state.items.filter((i) => i.id !== id)
          : state.items.map((i) => (i.id === id ? { ...i, cantidad } : i)),
    })),

  editarPrecio: (id, precio) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, precioEditado: precio } : i)),
    })),

  editarDescuentoItem: (id, descuento) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, descuento: descuento ?? undefined } : i
      ),
    })),

  agregarNota: (id, nota) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, notas: nota } : i)),
    })),

  asociarCliente: (cliente) => set({ cliente }),
  quitarCliente: () => set({ cliente: null }),

  aplicarCupon: (cupon) => set({ cupon }),
  quitarCupon: () => set({ cupon: null }),
  aplicarDescuentoManual: (descuentoManual) => set({ descuentoManual }),

  limpiarTicket: () =>
    set({ items: [], cliente: null, cupon: null, descuentoManual: null }),
}))
