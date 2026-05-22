// Hook global para manejar el tema de la app (claro / oscuro).
// Cómo funciona:
//  1. Al iniciar, busca si el usuario ya eligió un tema (localStorage).
//  2. Si no hay nada guardado, usa la preferencia del sistema operativo.
//  3. Agrega o quita la clase 'dark' en  — globals.css hace el resto.
//  4. Guarda la elección en localStorage para la próxima visita.

import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Leer preferencia guardada en localStorage
    const guardado = localStorage.getItem('orbita-theme')

    if (guardado) {
      // El usuario ya eligió antes → respetamos su elección
      const esDark = guardado === 'dark'
      setIsDark(esDark)
      aplicarTema(esDark)
    } else {
      // Primera visita → detectar preferencia del sistema operativo
      const prefiereDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(prefiereDark)
      aplicarTema(prefiereDark)
    }
  }, [])

  function aplicarTema(dark: boolean) {
    // Agrega o quita la clase 'dark' en el elemento .
    // globals.css detecta esa clase y cambia todas las variables CSS.
    document.documentElement.classList.toggle('dark', dark)
  }

  function toggle() {
    const nuevo = !isDark
    setIsDark(nuevo)
    aplicarTema(nuevo)
    // Guardar para que al volver a entrar recuerde la elección
    localStorage.setItem('orbita-theme', nuevo ? 'dark' : 'light')
  }

  return { isDark, toggle }
}