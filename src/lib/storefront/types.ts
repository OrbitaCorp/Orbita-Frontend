export type Producto = {
  id:        string
  nombre:    string
  cat:       string
  precio:    number
  precioAnt: number | null
  badge:     string | null
  hue:       number
  rating:    number
  stock:     boolean
}

export type Categoria = {
  id:     string
  nombre: string
  count:  number
  hue:    number
}

export type ItemCarrito = {
  id:        string
  nombre:    string
  variante:  string
  qty:       number
  precio:    number
  precioAnt: number | null
  hue:       number
}

export type Direccion = {
  id:      string
  alias:   string
  calle:   string
  piso:    string
  ciudad:  string
  cp:      string
  default: boolean
}

export type TimelineStep = {
  label: string
  done:  boolean
  fecha: string
}

export type Pedido = {
  id:       string
  fecha:    string
  total:    number
  items:    number
  tracking: string
  timeline: TimelineStep[]
}

export type TiendaConfig = {
  nombre:  string
  sub:     string
  slug:    string
  dominio: string
  wpp:     string
  email:   string
}
