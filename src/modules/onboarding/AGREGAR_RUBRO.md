# Cómo agregar un nuevo rubro al onboarding

El onboarding está unificado en `SetupUnificado.tsx`. Lo único que cambia entre rubros es el **primer paso** (la pantalla de selección inicial). Los pasos siguientes —Tu negocio, Ubicación, Métodos de pago— son siempre los mismos.

## Pasos

### 1. Crear el archivo del rubro

Crear `src/modules/onboarding/<nombre-rubro>/Setup.tsx`.

### 2. Definir las opciones del primer paso

```tsx
import { Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SetupUnificado, type PrimerPasoProps } from '@/modules/onboarding/SetupUnificado'

const OPCIONES: { key: string; Icon: LucideIcon; label: string; descripcion: string }[] = [
  { key: 'opcion-a', Icon: ..., label: 'Opción A', descripcion: 'Descripción breve' },
  // ...
]
```

### 3. Armar el componente del primer paso

```tsx
function StepPrimero({ seleccion, toggle }: PrimerPasoProps) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h2 ...>¿Pregunta del primer paso?</h2>
        <p ...>Subtítulo explicativo.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 10 }}>
        {OPCIONES.map(o => {
          const sel = seleccion.includes(o.key)
          return (
            <button key={o.key} onClick={() => toggle(o.key)} ...>
              ...
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

Copiar el layout de tarjetas de `tienda/Setup.tsx` o `turnos/Setup.tsx` como referencia visual.

### 4. Exportar con SetupUnificado

```tsx
export function NuevoRubroSetup() {
  return (
    <SetupUnificado
      primerPasoLabel="Etiqueta del paso"   // aparece en la barra de progreso
      PrimerPaso={StepPrimero}
      conEquipo={false}                     // true si el rubro necesita el paso "Tu equipo"
      successPath="/onboarding/nuevo-rubro/success"
    />
  )
}
```

### 5. Crear la página

Crear `src/pages/onboarding/<nombre-rubro>/index.tsx`:

```tsx
import { NuevoRubroSetup } from '@/modules/onboarding/nuevo-rubro/Setup'
export default NuevoRubroSetup
```

Y la página de éxito `src/pages/onboarding/<nombre-rubro>/success.tsx` (copiar de tienda o turnos).

### 6. Registrar el rubro en ElegirRubro

En `src/modules/onboarding/ElegirRubro.tsx`, agregar el nuevo rubro al listado para que aparezca en la pantalla de selección inicial.

---

## Props de SetupUnificado

| Prop | Tipo | Descripción |
|------|------|-------------|
| `primerPasoLabel` | `string` | Nombre del paso en la barra de progreso |
| `PrimerPaso` | `FC<PrimerPasoProps>` | Componente del primer paso |
| `toggleFn` | `(prev: string[], key: string) => string[]` | Lógica de selección custom (opcional, default: add/remove) |
| `conEquipo` | `boolean` | Agrega el paso "Tu equipo" al final (default: false) |
| `successPath` | `string` | Ruta de redirección al finalizar |

## Cuándo usar `toggleFn`

Solo si el primer paso tiene lógica de selección especial. Ejemplo: tienda tiene "De todo un poco" que al seleccionarse limpia el resto:

```tsx
function toggleEspecial(prev: string[], key: string): string[] {
  if (key === 'detodo') return ['detodo']
  const sinDetodo = prev.filter(k => k !== 'detodo')
  return sinDetodo.includes(key)
    ? sinDetodo.filter(k => k !== key)
    : [...sinDetodo, key]
}
```

## Rubros existentes

| Rubro | Archivo | Primer paso | `conEquipo` |
|-------|---------|-------------|-------------|
| Tienda online | `tienda/Setup.tsx` | Tipo de productos | No |
| Turnos / Servicios | `turnos/Setup.tsx` | Tipo de servicios | Sí |
