// src/modules/ventas/admin/catalogo/types/catalogo.types.ts
// Tipos del módulo de catálogo (productos + categorías).

export type EstadoProducto = 'publicado' | 'borrador' | 'sin_stock'

export interface Producto {
    id:        string
    nombre:    string
    sku:       string
    cat:       string
    precio:    number
    precioAnt: number | null
    stock:     number
    stockMin:  number
    estado:    EstadoProducto
    variantes: string[]
    colores:   string[]
    imagenes:  number
    hue:       number
}

// Categoría plana (para selects y filtros).
export interface Categoria {
    id:     string
    nombre: string
    emoji:  string
    count:  number
    hue:    number
}

// Nodo del árbol jerárquico de categorías (P3).
export interface CatNode {
    id:            string
    nombre:        string
    slug:          string
    icono:         string
    color:         string
    productos:     number
    activa:        boolean
    subcategorias: CatNode[]
}
