// Cuando alguien entra a /admin sin especificar negocio ni sección, lo mandamos directo al dashboard de 'rama-tienda'.
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminPage() {
    const router = useRouter()
    useEffect(() => {
        router.replace('/admin/rama-tienda/ventas/dashboard')
    }, [])
    return null
}