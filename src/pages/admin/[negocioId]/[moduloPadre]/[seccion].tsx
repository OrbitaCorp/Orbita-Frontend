// export default function SeccionPage() {
//   return null;
// }
// Este archivo maneja TODAS las rutas del panel admin con esta forma:
//   /admin/rama-tienda/ventas/pedidos
//   /admin/rama-tienda/ventas/catalogo
//   /admin/rama-tienda/ventas/dashboard  etc.

import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import AdminLayout from '@/layouts/AdminLayout'
import type { ComponentType } from 'react'

// componentMap: tabla de lookup moduloPadre → seccion → componente.
const componentMap: Record<string, Record<string, ComponentType>> = {
    ventas: {
        dashboard: dynamic(() => import('@/modules/ventas/admin/reportes/Dashboard'), { ssr: false }),pedidos:        dynamic(() => import('@/modules/ventas/admin/pedidos/PedidoLista'), { ssr: false }),
        catalogo:       dynamic(() => import('@/modules/ventas/admin/catalogo/ProductoLista'), { ssr: false }),
        categorias:     dynamic(() => import('@/modules/ventas/admin/catalogo/Categorias'), { ssr: false }),
        clientes:       dynamic(() => import('@/modules/ventas/admin/clientes/ClienteLista'), { ssr: false }),
        reportes:       dynamic(() => import('@/modules/ventas/admin/reportes/ReporteVentas'), { ssr: false }),
        configuracion:  dynamic(() => import('@/modules/ventas/admin/configuracion/ConfigGeneral'), { ssr: false }),
        pos:            dynamic(() => import('@/modules/ventas/admin/pos/POSCobro'), { ssr: false }),
        inventario:     dynamic(() => import('@/modules/ventas/admin/inventario/StockGeneral'), { ssr: false }),
        descuentos:     dynamic(() => import('@/modules/ventas/admin/descuentos/DescuentoLista'), { ssr: false }),
        mensajes:       dynamic(() => import('@/modules/ventas/admin/mensajes/Bandeja'), { ssr: false }),
    },
}

export default function SeccionPage() {
  const { moduloPadre, seccion } = useRouter().query
  const Componente = componentMap[moduloPadre as string]?.[seccion as string]

  if (!Componente) return <div>Página no encontrada</div>

  return (
    <AdminLayout>
      <Componente />
    </AdminLayout>
  )
}