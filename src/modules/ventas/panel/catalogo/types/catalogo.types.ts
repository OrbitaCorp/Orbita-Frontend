export type EstadoProducto = 'activo' | 'borrador' | 'agotado' | 'pausado'

export type Variante = {
  id:            string
  sku:           string
  atributos:     Record<string, string>
  precio:        number
  precioTachado?: number
  stock:         number
  imagen?:       string
}

export type HistorialPrecio = {
  fecha:  string
  precio: number
}

export type Categoria = {
  id:               string
  nombre:           string
  slug:             string
  parentId?:        string
  imagen?:          string
  conteoProductos:  number
}

export type Producto = {
  id:              string
  sku:             string
  nombre:          string
  descripcion:     string
  precio:          number
  precioTachado?:  number
  stock:           number
  stockMinimo:     number
  estado:          EstadoProducto
  categorias:      string[]
  imagenes:        string[]
  variantes:       Variante[]
  historialPrecios: HistorialPrecio[]
  creadoEn:        string
  actualizadoEn:   string
  vendidos:        number
  vistas:          number
}
