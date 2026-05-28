// Hook que anima un número de 0 a un valor objetivo con easing suave.

// Cómo funciona:
// requestAnimationFrame llama a la función tick en cada frame del navegador
// (~60 veces por segundo). En cada frame calcula cuánto tiempo pasó desde
// que arrancó y aplica una curva easeOutCubic para que el número arranque
// rápido y frene suave al llegar al objetivo.
//
// Por qué está en hooks/ global y no en el módulo:
// Lo necesitan KpiCard (design system), el Dashboard, y cualquier pantalla
// que quiera animar un número. 
//
// Uso:
//   const animVal = useCounter(124300)  // anima de 0 a 124300
//   const animVal = useCounter(value, 500)  // en 500ms
//   display: '$' + Math.round(animVal).toLocaleString('es-AR')

import { useState, useEffect } from 'react'

export function useCounter(
    target:   number,
    duration: number    = 700,   // duración en ms — default 700ms del design system
    deps:     unknown[] = []     // dependencias extra para forzar re-animación
): number {
    const [val, setVal] = useState(0)

    useEffect(() => {
        let raf: number
        const start = performance.now()

        const tick = (now: number) => {
            // p: progreso de 0 a 1 según el tiempo transcurrido
            const p     = Math.min(1, (now - start) / duration)
            // easeOutCubic: 1 - (1-p)³ — rápido al inicio, lento al final
            const eased = 1 - Math.pow(1 - p, 3)
            setVal(target * eased)

            if (p < 1) raf = requestAnimationFrame(tick)
            else setVal(target)  // fuerza el valor exacto al terminar
        }

        raf = requestAnimationFrame(tick)

        // Cleanup: cancela la animación si el componente se desmonta
        // antes de que termine — evita setState en componente desmontado
        return () => cancelAnimationFrame(raf)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, duration, ...deps])

    return val
}