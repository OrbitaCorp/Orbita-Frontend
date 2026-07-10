# Componentes compartidos usados por el POS

> Componentes de [ventas/_shared/components/](../../../_shared/components/) que el POS consume. Props reales y ejemplos copiados del código del POS.
> Volver al [README](./README.md) · ver [arquitectura](./arquitectura.md).

El POS usa **4** componentes compartidos directamente: `SelectorCliente`, `SelectorVariante`, `ModalConfirmacion`, `DataTable`. No usa `SearchInput`, `EmptyState`, `StatusBadge`, `MontoDisplay` ni `SelectorProducto` (tiene equivalentes inline).

Todos son **named exports**. Importarlos por ruta directa al archivo (el POS los importa así, no desde el barrel).

---

## SelectorCliente

**Ubicación:** [_shared/components/SelectorCliente.tsx](../../../_shared/components/SelectorCliente.tsx)
Modal para buscar un cliente existente o crear uno nuevo. Dos pestañas internas (buscar / crear).

```ts
interface ClienteBase {
  id: string; nombre: string; dni: string; telefono: string; email?: string
}

interface Props {
  isOpen: boolean
  clientes?: ClienteBase[]                       // lista para filtrar (default [])
  onClose: () => void
  onSeleccionar: (cliente: ClienteBase) => void  // al elegir uno existente
  onCrear?: (datos: Omit<ClienteBase, 'id'>) => void  // al crear; si falta, oculta "crear"
}
```

| Prop | Descripción |
|------|-------------|
| `isOpen` | Controla el render (retorna null si false). |
| `clientes` | Universo de clientes a filtrar por nombre/DNI/teléfono. |
| `onSeleccionar` | Recibe el cliente elegido; el caller cierra el modal. |
| `onCrear` | Si se pasa, habilita la pestaña "Crear nuevo". |

**Uso real** (de [TicketPOS.tsx](../components/TicketPOS/TicketPOS.tsx)):
```tsx
<SelectorCliente
  isOpen={modalCliente}
  clientes={CLIENTES_MOCK}
  onClose={() => setModalCliente(false)}
  onSeleccionar={handleSeleccionarCliente}
  onCrear={(datos) => {
    const nuevo = { id: `cli-${Date.now()}`, ...datos }
    handleSeleccionarCliente(nuevo)
  }}
/>
```

**Notas para otros módulos:**
- `ClienteBase` es estructuralmente igual a `ClienteAsociado` del POS; el POS castea entre ambos. Si unificás el modelo de cliente (Mateo), mantené esa forma o ajustá ambos.
- ⚠️ Al crear, el componente llama `onCrear(datos)` **y además** genera su propio `nuevoCliente` para `onSeleccionar`. Si vas a persistir el cliente creado, hacelo en `onCrear` y no dependas del id interno (es un `cli-{timestamp}` temporal).

---

## SelectorVariante

**Ubicación:** [_shared/components/SelectorVariante.tsx](../../../_shared/components/SelectorVariante.tsx)
Modal de matriz de variantes (talle/color) con stock por variante y selector de cantidad. Soporta una o dos dimensiones. Internamente usa `MontoDisplay`.

```ts
interface VarianteOpcion {
  id: string; talle?: string; color?: string; stock: number; precio?: number
}

interface Props {
  isOpen: boolean
  nombreProducto: string
  precioBase: number
  variantes: VarianteOpcion[]
  onClose: () => void
  onConfirmar: (variante: VarianteOpcion, cantidad: number) => void
}
```

| Prop | Descripción |
|------|-------------|
| `nombreProducto` | Título del modal. |
| `precioBase` | Precio mostrado si no hay variante elegida. |
| `variantes` | Lista; las de stock 0 quedan deshabilitadas. |
| `onConfirmar` | Recibe la variante elegida y la cantidad. |

**Uso real** (de [ModalVariante.tsx](../components/Modales/ModalVariante.tsx)):
```tsx
<SelectorVariante
  isOpen
  nombreProducto={producto.nombre}
  precioBase={producto.precio}
  variantes={(producto.variantes ?? []).map((v) => ({
    id: v.id, talle: v.talle, color: v.color, stock: v.stock, precio: v.precio,
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
```

**Notas:** detecta automáticamente si hay 1 o 2 dimensiones (talles/colores). Para reusar, mapeá tus variantes a `VarianteOpcion`; el componente arma la grilla y valida stock solo.

---

## ModalConfirmacion

**Ubicación:** [_shared/components/ModalConfirmacion.tsx](../../../_shared/components/ModalConfirmacion.tsx)
Modal genérico de confirmación con variantes de color. `descripcion` respeta saltos de línea si la pasás con `\n`.

```ts
interface Props {
  isOpen: boolean
  titulo: string
  descripcion?: string
  labelConfirmar?: string   // default 'Confirmar'
  labelCancelar?: string    // default 'Cancelar'
  variante?: 'default' | 'danger' | 'warning'  // color del botón confirmar
  cargando?: boolean        // muestra "Procesando..." y deshabilita
  onConfirmar: () => void
  onCancelar: () => void
}
```

**Uso real** (de [POSHistorial.tsx](../POSHistorial.tsx), forzar cierre):
```tsx
<ModalConfirmacion
  isOpen={!!sesionAForzar}
  titulo="¿Forzar cierre de caja?"
  descripcion={descripcionForzar}
  labelConfirmar="Sí, forzar cierre"
  labelCancelar="Cancelar"
  variante="warning"
  cargando={forzarCierre.isPending}
  onConfirmar={handleForzarCierre}
  onCancelar={() => setSesionAForzar(null)}
/>
```

El POS lo usa también en [POSCierre.tsx](../POSCierre.tsx) con `variante="danger"`.

**Notas:** usar `variante="danger"` para acciones destructivas, `"warning"` para reversibles-pero-sensibles. Pasá `cargando` con el `isPending` de tu mutation para evitar doble submit.

---

## DataTable

**Ubicación:** [_shared/components/DataTable.tsx](../../../_shared/components/DataTable.tsx)
Tabla genérica con sorting por columna, selección, paginación opcional, estados de carga y vacío. Genérica en `<T>`.

```ts
interface ColumnaTabla<T> {
  key: string
  header: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render: (row: T, index: number) => React.ReactNode
}

interface Props<T> {
  columnas: ColumnaTabla<T>[]
  datos: T[]
  getRowKey: (row: T) => string
  paginacion?: { pagina; porPagina; total; onCambiar }
  seleccionable?: boolean
  seleccionados?: Set<string>
  onSeleccionar?: (keys: Set<string>) => void
  cargando?: boolean
  vacio?: React.ReactNode
  onClickFila?: (row: T) => void
}
```

| Prop | Descripción |
|------|-------------|
| `columnas` | Definición de columnas; `render` produce el contenido de cada celda. |
| `datos` / `getRowKey` | Filas y su clave única. |
| `onClickFila` | Click en fila (el POS lo usa para abrir el detalle). |
| `cargando` | Muestra skeleton de 5 filas. |
| `vacio` | Nodo a mostrar cuando no hay datos. |
| `paginacion` | Opcional; si se omite, no pagina. |

**Uso real** (de [TablaHistorial.tsx](../components/Historial/TablaHistorial.tsx), recortado):
```tsx
<DataTable
  columnas={columnas}
  datos={datos}
  getRowKey={(r) => r.sesion.id}
  cargando={cargando}
  onClickFila={onSeleccionarSesion}
  vacio={<div style={{ padding: '48px 24px', textAlign: 'center' }}>…</div>}
/>
```

Las acciones por fila van dentro de un `render` de columna con `onClick={(e) => e.stopPropagation()}` para no disparar `onClickFila`.

**Notas:** el sorting es de estado interno (visual), no reordena `datos` por vos — si necesitás orden real, ordená antes de pasar `datos`. El POS hoy no usa `paginacion` (ver [pendientes.md](./pendientes.md)).
