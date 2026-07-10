import type { Categoria, ProductoPadre, Variante } from '../types'

// Catálogo mock — tienda de ropa argentina. Precios en ARS.
// TODO: Reemplazar por GET /api/productos/arbol

// Construye una variante. Si talle === 'Único', el nombre es solo el color.
function vr(
  prodId: string,
  talle: string,
  color: string,
  precio: number,
  stock: number
): Variante {
  const nombre = talle === 'Único' ? color : `Talle ${talle} · ${color}`
  const colorSku = color.slice(0, 3).toUpperCase()
  return {
    id: `${prodId}-${talle.toLowerCase()}-${color.slice(0, 2).toLowerCase()}`,
    nombre,
    sku: `${prodId.toUpperCase()}-${talle}-${colorSku}`,
    precio,
    stock,
  }
}

function prod(
  id: string,
  categoriaId: string,
  nombre: string,
  variantes: Variante[]
): ProductoPadre {
  return {
    id,
    nombre,
    categoriaId,
    precioDesde: Math.min(...variantes.map((v) => v.precio)),
    variantes,
  }
}

// ─── Productos por categoría ──────────────────────────────────────────────────

const remeras: ProductoPadre[] = [
  prod('p1', 'cat-remeras', 'Remera básica', [
    vr('p1', 'S', 'Blanco', 8990, 12),
    vr('p1', 'M', 'Blanco', 8990, 9),
    vr('p1', 'L', 'Negro', 8990, 7),
    vr('p1', 'XL', 'Negro', 8990, 5),
  ]),
  prod('p2', 'cat-remeras', 'Remera oversize', [
    vr('p2', 'S', 'Negro', 11990, 10),
    vr('p2', 'M', 'Negro', 11990, 8),
    vr('p2', 'L', 'Beige', 11990, 6),
    vr('p2', 'XL', 'Beige', 11990, 4),
  ]),
  prod('p12', 'cat-remeras', 'Camisa lino', [
    vr('p12', 'S', 'Blanco', 24990, 6),
    vr('p12', 'M', 'Blanco', 24990, 5),
    vr('p12', 'L', 'Celeste', 24990, 4),
  ]),
]

const pantalones: ProductoPadre[] = [
  prod('p3', 'cat-pantalones', 'Jean recto', [
    vr('p3', '28', 'Azul', 32990, 5),
    vr('p3', '30', 'Azul', 32990, 7),
    vr('p3', '32', 'Azul', 32990, 6),
    vr('p3', '34', 'Negro', 32990, 4),
    vr('p3', '36', 'Negro', 32990, 3),
  ]),
  prod('p4', 'cat-pantalones', 'Jogging', [
    vr('p4', 'S', 'Gris', 18990, 9),
    vr('p4', 'M', 'Gris', 18990, 8),
    vr('p4', 'L', 'Negro', 18990, 6),
    vr('p4', 'XL', 'Negro', 18990, 4),
  ]),
]

const calzado: ProductoPadre[] = [
  prod('p5', 'cat-calzado', 'Zapatilla urbana', [
    vr('p5', '39', 'Blanco', 45990, 4),
    vr('p5', '40', 'Blanco', 45990, 6),
    vr('p5', '41', 'Negro', 45990, 5),
    vr('p5', '42', 'Negro', 45990, 3),
  ]),
  prod('p6', 'cat-calzado', 'Borcego', [
    vr('p6', '39', 'Negro', 52990, 3),
    vr('p6', '40', 'Negro', 52990, 5),
    vr('p6', '41', 'Negro', 52990, 4),
    vr('p6', '42', 'Marrón', 52990, 3),
    vr('p6', '43', 'Marrón', 52990, 2),
  ]),
]

const accesorios: ProductoPadre[] = [
  prod('p7', 'cat-accesorios', 'Gorra trucker', [
    vr('p7', 'Único', 'Negro', 7990, 18),
    vr('p7', 'Único', 'Beige', 7990, 12),
    vr('p7', 'Único', 'Verde', 7990, 9),
  ]),
  prod('p8', 'cat-accesorios', 'Riñonera', [
    vr('p8', 'Único', 'Negro', 12990, 11),
    vr('p8', 'Único', 'Camel', 12990, 7),
    vr('p8', 'Único', 'Gris', 12990, 5),
  ]),
  prod('p11', 'cat-accesorios', 'Medias pack x3', [
    vr('p11', 'Único', 'Surtido', 5990, 30),
    vr('p11', 'Único', 'Negro', 5990, 22),
    vr('p11', 'Único', 'Blanco', 5990, 19),
  ]),
]

const abrigos: ProductoPadre[] = [
  prod('p9', 'cat-abrigos', 'Buzo canguro', [
    vr('p9', 'S', 'Gris', 34990, 8),
    vr('p9', 'M', 'Gris', 34990, 7),
    vr('p9', 'L', 'Negro', 34990, 5),
    vr('p9', 'XL', 'Negro', 34990, 3),
  ]),
  prod('p10', 'cat-abrigos', 'Campera puffer', [
    vr('p10', 'S', 'Negro', 64990, 4),
    vr('p10', 'M', 'Negro', 64990, 5),
    vr('p10', 'L', 'Verde', 64990, 3),
    vr('p10', 'XL', 'Verde', 64990, 2),
  ]),
]

// ─── Exports ──────────────────────────────────────────────────────────────────

export const productosMock: ProductoPadre[] = [
  ...remeras,
  ...pantalones,
  ...calzado,
  ...accesorios,
  ...abrigos,
]

export const categoriasMock: Categoria[] = [
  { id: 'cat-remeras', nombre: 'Remeras', productosCount: remeras.length, productos: remeras },
  { id: 'cat-pantalones', nombre: 'Pantalones', productosCount: pantalones.length, productos: pantalones },
  { id: 'cat-calzado', nombre: 'Calzado', productosCount: calzado.length, productos: calzado },
  { id: 'cat-accesorios', nombre: 'Accesorios', productosCount: accesorios.length, productos: accesorios },
  { id: 'cat-abrigos', nombre: 'Abrigos', productosCount: abrigos.length, productos: abrigos },
]
