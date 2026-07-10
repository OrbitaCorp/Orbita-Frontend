import { SelectorVariante } from '../../../../_shared/components/SelectorVariante'
import { useTicketStore } from '../../stores/useTicketStore'
import type { ProductoPOS } from '../../types'

interface Props {
  isOpen: boolean
  producto: ProductoPOS | null
  onClose: () => void
}

export function ModalVariante({ isOpen, producto, onClose }: Props) {
  const { agregarItem } = useTicketStore()

  if (!isOpen || !producto) return null

  return (
    <SelectorVariante
      isOpen
      nombreProducto={producto.nombre}
      precioBase={producto.precio}
      variantes={(producto.variantes ?? []).map((v) => ({
        id: v.id,
        talle: v.talle,
        color: v.color,
        stock: v.stock,
        precio: v.precio,
      }))}
      onClose={onClose}
      onConfirmar={(variante, cantidad) => {
        agregarItem({
          productoId: producto.id,
          varianteId: variante.id,
          nombre: producto.nombre,
          variante: [variante.talle, variante.color].filter(Boolean).join(' / ') || variante.id,
          cantidad,
          precioUnitario: variante.precio ?? producto.precio,
        })
        onClose()
      }}
    />
  )
}
