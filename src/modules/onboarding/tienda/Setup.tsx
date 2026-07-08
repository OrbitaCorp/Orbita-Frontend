import {
  Check, type LucideIcon,
  Shirt, Footprints, Sparkles, Smartphone, Hammer, Package2, BookOpen, Gift,
  PawPrint, Car, Gem, Sofa, Monitor, Package, Droplets, Sprout, Palette, Store,
} from 'lucide-react'
import { SetupUnificado, type PrimerPasoProps } from '@/modules/onboarding/SetupUnificado'

// ─── Data del primer paso (específico de tienda) ──────────────────────────────

type Tipo = 'variantes' | 'serie' | 'volumen' | 'simple'

type Subrubro = {
  key:         string
  Icon:        LucideIcon
  label:       string
  descripcion: string
  tipo:        Tipo
}

const SUBRUBROS: Subrubro[] = [
  { key: 'indumentaria', Icon: Shirt,      label: 'Indumentaria',              descripcion: 'Talles, colores y variantes',                tipo: 'variantes' },
  { key: 'calzado',      Icon: Footprints, label: 'Calzado',                   descripcion: 'Numeración y variantes por talle',           tipo: 'variantes' },
  { key: 'cosmetica',    Icon: Sparkles,   label: 'Perfumería / Cosmética',    descripcion: 'Vencimientos y control de lotes',            tipo: 'simple'    },
  { key: 'electronica',  Icon: Smartphone, label: 'Electrónica',               descripcion: 'N° de serie / IMEI por unidad',              tipo: 'serie'     },
  { key: 'ferreteria',   Icon: Hammer,     label: 'Ferretería',                descripcion: 'Miles de SKUs, venta por unidad',            tipo: 'simple'    },
  { key: 'corralon',     Icon: Package2,   label: 'Corralón / Construcción',   descripcion: 'Venta por m², kg o litro',                   tipo: 'volumen'   },
  { key: 'libreria',     Icon: BookOpen,   label: 'Librería',                  descripcion: 'ISBN, editorial y autor',                    tipo: 'simple'    },
  { key: 'jugueteria',   Icon: Gift,       label: 'Juguetería',                descripcion: 'Edad recomendada por producto',              tipo: 'simple'    },
  { key: 'petshop',      Icon: PawPrint,   label: 'Pet Shop',                  descripcion: 'Alimentos por peso y accesorios',            tipo: 'volumen'   },
  { key: 'repuestos',    Icon: Car,        label: 'Repuestos Automotor',        descripcion: 'Compatibilidad por modelo de vehículo',      tipo: 'serie'     },
  { key: 'joyeria',      Icon: Gem,        label: 'Joyería',                   descripcion: 'Materiales, peso y tasación',                tipo: 'simple'    },
  { key: 'muebleria',    Icon: Sofa,       label: 'Mueblería',                 descripcion: 'Medidas físicas y variantes de color',       tipo: 'simple'    },
  { key: 'informatica',  Icon: Monitor,    label: 'Informática',               descripcion: 'Compatibilidades técnicas',                  tipo: 'serie'     },
  { key: 'mayorista',    Icon: Package,    label: 'Distribuidora / Mayorista', descripcion: 'Precios escalonados por volumen',            tipo: 'volumen'   },
  { key: 'limpieza',     Icon: Droplets,   label: 'Limpieza',                  descripcion: 'Litros y concentración',                     tipo: 'volumen'   },
  { key: 'vivero',       Icon: Sprout,     label: 'Vivero',                    descripcion: 'Productos vivos con cuidados especiales',    tipo: 'volumen'   },
  { key: 'artistica',    Icon: Palette,    label: 'Artística / Mercería',      descripcion: 'Variantes de color, material y medida',      tipo: 'simple'    },
  { key: 'detodo',       Icon: Store,      label: 'De todo un poco',           descripcion: 'Tienda variada sin un rubro fijo',           tipo: 'simple'    },
]

const TIPO_BADGE: Record<Tipo, string | null> = {
  variantes: '✦ Matriz de talles / variantes',
  serie:     '✦ N° de serie / IMEI',
  volumen:   '✦ Cantidad variable',
  simple:    null,
}

// ─── Primer paso ──────────────────────────────────────────────────────────────

function StepTipo({ seleccion, toggle }: PrimerPasoProps) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text)', margin: '0 0 6px' }}>
          ¿Qué tipo de productos vendés?
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: 0 }}>
          Podés elegir varios. Configuramos los atributos según cada rubro.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 10 }}>
        {SUBRUBROS.map(s => {
          const sel   = seleccion.includes(s.key)
          const badge = TIPO_BADGE[s.tipo]
          return (
            <button
              key={s.key}
              onClick={() => toggle(s.key)}
              style={{
                position: 'relative', textAlign: 'left', padding: '13px 13px 12px', borderRadius: 14,
                border:     `2px solid ${sel ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: sel ? 'rgba(59,130,246,0.05)' : 'var(--color-bg)',
                cursor: 'pointer', transition: 'all 150ms ease',
                boxShadow: sel ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
              }}
              onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--color-primary)' }}
              onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--color-border)'  }}
            >
              {sel && (
                <div style={{ position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={10} color="white" strokeWidth={3} />
                </div>
              )}
              <div style={{ width: 38, height: 38, borderRadius: 10, marginBottom: 9, background: sel ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.Icon size={19} strokeWidth={1.75} color={sel ? 'var(--color-primary)' : '#3B82F6'} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.4, marginBottom: badge ? 8 : 0 }}>{s.descripcion}</div>
              {badge && (
                <div style={{ fontSize: 10, fontWeight: 600, color: '#6366F1', background: 'rgba(99,102,241,0.08)', borderRadius: 6, padding: '3px 7px', display: 'inline-flex' }}>
                  {badge}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Toggle especial: "de todo un poco" limpia el resto
function toggleTienda(prev: string[], key: string): string[] {
  if (key === 'detodo') return ['detodo']
  const sinDetodo = prev.filter(k => k !== 'detodo')
  return sinDetodo.includes(key)
    ? sinDetodo.filter(k => k !== key)
    : [...sinDetodo, key]
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function TiendaSetup() {
  return (
    <SetupUnificado
      primerPasoLabel="Tipo de tienda"
      PrimerPaso={StepTipo}
      toggleFn={toggleTienda}
      conEquipo={true}
      successPath="/onboarding/plan?next=/onboarding/tienda/success"
    />
  )
}
