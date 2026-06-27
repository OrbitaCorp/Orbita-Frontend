import { useRouter } from 'next/router'
import { ComprobanteBase } from '@/components/shared/ComprobanteBase'
import { Thumb } from '@/components/storefront/Thumb'
import { TIENDA, CARRITO_INICIAL, PEDIDO_MOCK } from '@/lib/storefront/mock'
import { fmt } from '@/lib/storefront/utils'

export default function Comprobante() {
  const router = useRouter()
  const { slug, id } = router.query as { slug: string; id: string }
  const base = `/tienda/${slug}`

  const subtotal  = CARRITO_INICIAL.reduce((s, i) => s + i.precio * i.qty, 0)
  const descuento = CARRITO_INICIAL.reduce((s, i) => s + (i.precioAnt ? (i.precioAnt - i.precio) * i.qty : 0), 0)
  const cupon     = Math.round((subtotal - descuento) * 0.1)
  const total     = subtotal - descuento - cupon

  return (
    <ComprobanteBase
      numero={`#${PEDIDO_MOCK.id}`}
      fecha={PEDIDO_MOCK.fecha}
      emisor={{ tipo: 'tienda', nombre: TIENDA.nombre, subtitulo: TIENDA.dominio }}
      headerGradient="linear-gradient(135deg, #1D4ED8, #2563EB)"
      metadatos={[
        ['Método de pago', PEDIDO_MOCK.metodoPago ?? 'Mercado Pago'],
        ['Estado del pago', 'Aprobado'],
      ]}
      compradorDatos={PEDIDO_MOCK.comprador ? {
        Nombre:    PEDIDO_MOCK.comprador.nombre,
        Email:     PEDIDO_MOCK.comprador.email,
        Teléfono:  PEDIDO_MOCK.comprador.telefono,
        Dirección: PEDIDO_MOCK.comprador.direccion,
      } : undefined}
      items={CARRITO_INICIAL.map(it => ({
        descripcion: it.nombre,
        subtitulo:   it.variante,
        qty:         it.qty,
        subtotal:    it.precio * it.qty,
        thumb:       <Thumb hue={it.hue} size={44} radius={6} />,
      }))}
      totales={[
        { label: 'Subtotal',         valor: subtotal,             tipo: 'normal'    },
        ...(descuento > 0 ? [{ label: 'Descuentos', valor: descuento, tipo: 'descuento' as const }] : []),
        { label: 'Cupón ORBITA10',   valor: cupon,                tipo: 'descuento' },
        { label: 'Total',            valor: total,                tipo: 'total'     },
      ]}
      textoFooter={`Este documento acredita la compra realizada en ${TIENDA.nombre}.`}
      onBack={() => router.push(`${base}/pedido/${id}`)}
      backLabel="Volver al pedido"
    />
  )
}
