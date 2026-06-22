import { useQuery } from '@tanstack/react-query'
import type { ProductoPOS, CategoriaPOS, FiltrosCatalogoPOS } from '../types'

const MOCK_CATEGORIAS: CategoriaPOS[] = [
  { id: 'ropa', label: 'Ropa' },
  { id: 'calzado', label: 'Calzado' },
  { id: 'accesorios', label: 'Accesorios' },
  { id: 'otros', label: 'Otros' },
]

const MOCK_PRODUCTOS: ProductoPOS[] = [
  {
    id: 'p1',
    nombre: 'Remera básica',
    sku: 'REM-001',
    precio: 5900,
    stock: 24,
    categoriaId: 'ropa',
    categoriaLabel: 'Ropa',
    favorito: true,
    tieneVariantes: true,
    variantes: [
      { id: 'p1-s-bl', talle: 'S', color: 'Blanco', stock: 8 },
      { id: 'p1-m-bl', talle: 'M', color: 'Blanco', stock: 6 },
      { id: 'p1-l-ng', talle: 'L', color: 'Negro', stock: 4 },
      { id: 'p1-xl-ng', talle: 'XL', color: 'Negro', stock: 6 },
    ],
  },
  {
    id: 'p2',
    nombre: 'Jean slim fit',
    sku: 'JEA-002',
    precio: 18500,
    stock: 12,
    categoriaId: 'ropa',
    categoriaLabel: 'Ropa',
    favorito: true,
    tieneVariantes: true,
    variantes: [
      { id: 'p2-28', talle: '28', stock: 3 },
      { id: 'p2-30', talle: '30', stock: 5 },
      { id: 'p2-32', talle: '32', stock: 4 },
    ],
  },
  {
    id: 'p3',
    nombre: 'Zapatillas urbanas',
    sku: 'ZAP-003',
    precio: 32000,
    stock: 8,
    categoriaId: 'calzado',
    categoriaLabel: 'Calzado',
    tieneVariantes: true,
    variantes: [
      { id: 'p3-38', talle: '38', stock: 2 },
      { id: 'p3-39', talle: '39', stock: 2 },
      { id: 'p3-40', talle: '40', stock: 4 },
    ],
  },
  {
    id: 'p4',
    nombre: 'Campera abrigo',
    sku: 'CAM-004',
    precio: 45000,
    stock: 0,
    categoriaId: 'ropa',
    categoriaLabel: 'Ropa',
    tieneVariantes: false,
  },
  {
    id: 'p5',
    nombre: 'Gorra snapback',
    sku: 'GOR-005',
    precio: 7500,
    stock: 15,
    categoriaId: 'accesorios',
    categoriaLabel: 'Accesorios',
    favorito: true,
    tieneVariantes: false,
  },
  {
    id: 'p6',
    nombre: 'Cinturón cuero',
    sku: 'CIN-006',
    precio: 4200,
    stock: 20,
    categoriaId: 'accesorios',
    categoriaLabel: 'Accesorios',
    tieneVariantes: false,
  },
]

async function fetchProductos(filtros: FiltrosCatalogoPOS): Promise<ProductoPOS[]> {
  await new Promise((r) => setTimeout(r, 200))
  let result = MOCK_PRODUCTOS
  if (filtros.busqueda) {
    const q = filtros.busqueda.toLowerCase()
    result = result.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    )
  }
  if (filtros.categoriaId) result = result.filter((p) => p.categoriaId === filtros.categoriaId)
  if (filtros.soloFavoritos) result = result.filter((p) => p.favorito)
  return result
}

export function useProductosPOS(filtros: FiltrosCatalogoPOS = {}) {
  return useQuery({
    queryKey: ['productos-pos', filtros],
    queryFn: () => fetchProductos(filtros),
    staleTime: 30_000,
  })
}

export function useCategoriasPOS() {
  return useQuery({
    queryKey: ['categorias-pos'],
    queryFn: async (): Promise<CategoriaPOS[]> => {
      await new Promise((r) => setTimeout(r, 100))
      return MOCK_CATEGORIAS
    },
    staleTime: 5 * 60_000,
  })
}
