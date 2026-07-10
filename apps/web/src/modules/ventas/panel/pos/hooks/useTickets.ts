import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ClienteAsociado, MetodoPago, ResultadoVenta, TicketItem } from '../types'

const MOCK_TICKETS: ResultadoVenta[] = [
  {
    id: 'vt-001',
    numeroComprobante: '0001-00000001',
    fecha: new Date(Date.now() - 60 * 60_000).toISOString(),
    items: [
      {
        id: 'p5::base',
        productoId: 'p5',
        nombre: 'Gorra snapback',
        cantidad: 2,
        precioUnitario: 7500,
      },
    ],
    cliente: null,
    metodosPago: [{ tipo: 'efectivo', monto: 15000 }],
    total: 15000,
    vuelto: 0,
  },
]

interface CrearTicketParams {
  items: TicketItem[]
  cliente: ClienteAsociado | null
  metodosPago: MetodoPago[]
  total: number
  vuelto?: number
}

async function crearTicketMock(params: CrearTicketParams): Promise<ResultadoVenta> {
  await new Promise((r) => setTimeout(r, 400))
  const num = String(MOCK_TICKETS.length + 1).padStart(8, '0')
  const venta: ResultadoVenta = {
    id: `vt-${Date.now()}`,
    numeroComprobante: `0001-${num}`,
    fecha: new Date().toISOString(),
    ...params,
  }
  MOCK_TICKETS.push(venta)
  return venta
}

export function useTicketsRecientes(cajaId?: string) {
  return useQuery({
    queryKey: ['tickets-recientes', cajaId],
    queryFn: async (): Promise<ResultadoVenta[]> => {
      await new Promise((r) => setTimeout(r, 200))
      return [...MOCK_TICKETS].reverse()
    },
    staleTime: 0,
  })
}

export function useCrearTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: crearTicketMock,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets-recientes'] })
      qc.invalidateQueries({ queryKey: ['sesiones-caja'] })
    },
  })
}
