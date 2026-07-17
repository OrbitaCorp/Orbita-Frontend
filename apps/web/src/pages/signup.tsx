import { useEffect } from 'react'
import { useRouter } from 'next/router'

// Stub sin implementar — el flujo real de alta empieza en /onboarding/rubro.
export default function SignupRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/onboarding/rubro') }, [router])
  return null
}
