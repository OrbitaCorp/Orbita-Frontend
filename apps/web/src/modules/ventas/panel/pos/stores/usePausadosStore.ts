import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TicketItem, ClienteAsociado, TicketPausado } from '../types'

interface PausarParams {
  items: TicketItem[]
  cliente: ClienteAsociado | null
  nota?: string
}

interface PausadosState {
  tickets: TicketPausado[]

  pausar: (data: PausarParams) => string
  retomar: (id: string) => TicketPausado | undefined
  eliminar: (id: string) => void
  limpiarTodos: () => void
}

export const usePausadosStore = create<PausadosState>()(
  persist(
    (set, get) => ({
      tickets: [],

      pausar: ({ items, cliente, nota }) => {
        const id = `pausado-${Date.now()}`
        const ticket: TicketPausado = {
          id,
          items,
          cliente,
          pausadoEn: new Date().toISOString(),
          nota,
        }
        set((state) => ({ tickets: [...state.tickets, ticket] }))
        return id
      },

      retomar: (id) => {
        const ticket = get().tickets.find((t) => t.id === id)
        if (ticket) {
          set((state) => ({ tickets: state.tickets.filter((t) => t.id !== id) }))
        }
        return ticket
      },

      eliminar: (id) =>
        set((state) => ({ tickets: state.tickets.filter((t) => t.id !== id) })),

      limpiarTodos: () => set({ tickets: [] }),
    }),
    { name: 'pos-pausados' }
  )
)
