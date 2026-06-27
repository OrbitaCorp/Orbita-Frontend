// Árbol de catálogo usado por los selectores de alcance (categoría / productos).

export interface Variante {
  id: string
  nombre: string // ej: "Talle M · Negro"
  sku: string
  precio: number // ARS
  stock: number
}

export interface ProductoPadre {
  id: string
  nombre: string
  categoriaId: string
  precioDesde: number // precio mínimo entre variantes (ARS)
  variantes: Variante[]
}

export interface Categoria {
  id: string
  nombre: string
  productosCount: number
  productos?: ProductoPadre[]
}
