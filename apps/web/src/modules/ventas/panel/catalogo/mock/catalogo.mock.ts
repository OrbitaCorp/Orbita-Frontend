// src/modules/ventas/panel/catalogo/mock/catalogo.mock.ts
// TODO: eliminar cuando el backend esté listo.
// Productos y categorías de ejemplo — Rama Indumentaria.

import type { Producto, Categoria, CatNode } from '../types/catalogo.types'

export const PRODUCTOS_DB: Producto[] = [
    { id: 'p1', nombre: 'Remera oversize negra',      sku: 'RM-OVR-NG', cat: 'Remeras',    precio: 24900, precioAnt: null,   stock: 18, stockMin: 5,  estado: 'publicado', variantes: ['XS', 'S', 'M', 'L', 'XL'],   colores: ['Negro', 'Blanco', 'Gris'],     imagenes: 1, hue: 220, codigoBarras: '7790024900018' },
    { id: 'p2', nombre: 'Pantalón cargo verde oliva', sku: 'PT-CRG-VR', cat: 'Pantalones', precio: 48900, precioAnt: 62000,  stock: 3,  stockMin: 5,  estado: 'publicado', variantes: ['38', '40', '42', '44'],       colores: ['Verde', 'Negro'],              imagenes: 2, hue: 140, codigoBarras: '7790048900032' },
    { id: 'p3', nombre: 'Buzo frisa con capucha',     sku: 'BZ-FRS-CH', cat: 'Buzos',      precio: 38500, precioAnt: null,   stock: 7,  stockMin: 5,  estado: 'publicado', variantes: ['S', 'M', 'L', 'XL', 'XXL'],  colores: ['Azul', 'Gris', 'Negro'],       imagenes: 3, hue: 215, codigoBarras: '7790038500073' },
    { id: 'p4', nombre: 'Campera bomber beige',       sku: 'CP-BMB-BG', cat: 'Camperas',   precio: 89000, precioAnt: 110000, stock: 0,  stockMin: 5,  estado: 'sin_stock', variantes: ['S', 'M', 'L', 'XL'],         colores: ['Beige', 'Negro'],              imagenes: 2, hue: 35,  codigoBarras: '7790089000049' },
    { id: 'p5', nombre: 'Gorra trucker bordada',      sku: 'GR-TRK-BD', cat: 'Accesorios', precio: 15900, precioAnt: null,   stock: 24, stockMin: 10, estado: 'publicado', variantes: ['Única'],                     colores: ['Negro', 'Beige', 'Terracota'], imagenes: 1, hue: 30,  codigoBarras: '7790015900245' },
    { id: 'p6', nombre: 'Jean tiro medio celeste',    sku: 'JN-TRM-CL', cat: 'Pantalones', precio: 56000, precioAnt: 68000,  stock: 12, stockMin: 5,  estado: 'borrador',  variantes: ['38', '40', '42', '44', '46'], colores: ['Celeste', 'Negro'],            imagenes: 0, hue: 200, codigoBarras: '7790056000126' },
]

export const CATEGORIAS_DB: Categoria[] = [
    { id: 'remeras',    nombre: 'Remeras',    emoji: 'shirt',   count: 12, hue: 220 },
    { id: 'pantalones', nombre: 'Pantalones', emoji: 'layers',  count: 8,  hue: 140 },
    { id: 'buzos',      nombre: 'Buzos',      emoji: 'package', count: 6,  hue: 215 },
    { id: 'camperas',   nombre: 'Camperas',   emoji: 'package', count: 5,  hue: 35  },
    { id: 'accesorios', nombre: 'Accesorios', emoji: 'gem',     count: 9,  hue: 30  },
]

// Árbol jerárquico de categorías para P3. `icono` es una clave de CAT_ICONS.
export const CAT_TREE0: CatNode[] = [
    {
        id: 'cat1', nombre: 'Remeras', slug: 'remeras', icono: 'shirt', color: '#3B82F6', productos: 12, activa: true,
        subcategorias: [
            {
                id: 'sub1a', nombre: 'Remeras básicas', slug: 'basicas', icono: 'shirt', color: '#3B82F6', productos: 5, activa: true,
                subcategorias: [
                    { id: 'sub1a1', nombre: 'Manga corta', slug: 'manga-corta', icono: 'shirt', color: '#3B82F6', productos: 3, activa: true, subcategorias: [] },
                    { id: 'sub1a2', nombre: 'Manga larga', slug: 'manga-larga', icono: 'shirt', color: '#3B82F6', productos: 2, activa: true, subcategorias: [] },
                ],
            },
            { id: 'sub1b', nombre: 'Remeras oversize', slug: 'oversize', icono: 'shirt', color: '#3B82F6', productos: 4, activa: true, subcategorias: [] },
            { id: 'sub1c', nombre: 'Remeras estampadas', slug: 'estampadas', icono: 'shirt', color: '#3B82F6', productos: 3, activa: true, subcategorias: [] },
        ],
    },
    {
        id: 'cat2', nombre: 'Pantalones', slug: 'pantalones', icono: 'layers', color: '#10B981', productos: 8, activa: true,
        subcategorias: [
            {
                id: 'sub2a', nombre: 'Jeans', slug: 'jeans', icono: 'layers', color: '#10B981', productos: 3, activa: true,
                subcategorias: [
                    { id: 'sub2a1', nombre: 'Tiro alto', slug: 'tiro-alto', icono: 'layers', color: '#10B981', productos: 1, activa: true, subcategorias: [] },
                    { id: 'sub2a2', nombre: 'Tiro medio', slug: 'tiro-medio', icono: 'layers', color: '#10B981', productos: 2, activa: true, subcategorias: [] },
                ],
            },
            { id: 'sub2b', nombre: 'Joggers', slug: 'joggers', icono: 'layers', color: '#10B981', productos: 3, activa: true, subcategorias: [] },
            { id: 'sub2c', nombre: 'Cargos', slug: 'cargos', icono: 'layers', color: '#10B981', productos: 2, activa: true, subcategorias: [] },
        ],
    },
    {
        id: 'cat3', nombre: 'Buzos', slug: 'buzos', icono: 'package', color: '#8B5CF6', productos: 6, activa: true,
        subcategorias: [
            { id: 'sub3a', nombre: 'Con capucha', slug: 'capucha', icono: 'package', color: '#8B5CF6', productos: 4, activa: true, subcategorias: [] },
            { id: 'sub3b', nombre: 'Sin capucha', slug: 'sin-capucha', icono: 'package', color: '#8B5CF6', productos: 2, activa: true, subcategorias: [] },
        ],
    },
    { id: 'cat4', nombre: 'Camperas', slug: 'camperas', icono: 'package', color: '#F59E0B', productos: 5, activa: true, subcategorias: [] },
    { id: 'cat5', nombre: 'Accesorios', slug: 'accesorios', icono: 'gem', color: '#EC4899', productos: 9, activa: true, subcategorias: [] },
]

// Claves de íconos disponibles para categorías (lucide-react).
export const CAT_ICONS = [
    'shirt', 'package', 'tag', 'bag', 'layers', 'gem',
    'watch', 'star', 'heart', 'grid', 'crown', 'zap',
    'box', 'palette', 'glasses',
] as const
export type CatIconKey = typeof CAT_ICONS[number]

export const CAT_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#0F172A', '#6B7280']

export function generarSKU(nombre: string): string {
    const partes = (nombre || '').toUpperCase().split(' ').filter(p => p.length > 2)
    return partes.map(p => p.slice(0, 2)).join('-').slice(0, 12) || 'PROD-001'
}

// Slug con reemplazo explícito de acentos del español (robusto y legible).
export function slugify(s: string): string {
    const acentos: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u', ñ: 'n' }
    return s.toLowerCase()
        .replace(/[áéíóúüñ]/g, c => acentos[c] ?? c)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
}
