import { useEffect } from 'react'
import { useRouter } from 'next/router'

// El registro ya no es un paso separado — la cuenta se crea al final del
// wizard de onboarding (ver PENDIENTES.md, "el flujo es: crear tu espacio →
// completar el onboarding → recién ahí se crea la cuenta"). Esta ruta queda
// como redirect por compatibilidad con links viejos.
export default function AdminRegistroRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/onboarding/rubro') }, [router])
  return null
}
