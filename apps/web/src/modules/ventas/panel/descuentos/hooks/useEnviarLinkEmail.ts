import { useMutation } from '@tanstack/react-query'
import { cuponesMock } from '../mock/cupones'
import { clientesMock } from '../mock/clientes'

interface Params {
  cuponId: string
  clienteId: string
}

export function useEnviarLinkEmail() {
  return useMutation({
    mutationFn: async ({ cuponId, clienteId }: Params): Promise<{ email: string }> => {
      // TODO: Reemplazar por POST /api/cupones/:id/link/enviar
      await new Promise((r) => setTimeout(r, 1000))
      const cupon = cuponesMock.find((c) => c.id === cuponId)
      const cliente = clientesMock.find((c) => c.id === clienteId)
      if (!cupon || !cliente) throw new Error('Cupón o cliente no encontrado')
      console.log(`Email enviado a ${cliente.email} con link de cupón ${cupon.codigo}`)
      return { email: cliente.email }
    },
  })
}
