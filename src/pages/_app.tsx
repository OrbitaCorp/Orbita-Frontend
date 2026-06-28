import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@/styles/globals.css'
import 'leaflet/dist/leaflet.css'
import { PageLoader } from '@/components/PageLoader'
import { StorefrontLoader } from '@/components/storefront/StorefrontLoader'
import { TIENDA } from '@/lib/storefront/mock'

const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Carga inicial: ocultar el loader después de que React hidrata
    const timer = setTimeout(() => setLoading(false), 500)

    // PageLoader solo aparece la PRIMERA vez que se visita cada módulo (pathname distinto).
    // Visitas subsiguientes son instantáneas (ya en cache).
    // Cambios de query (sub-módulos, ?vista=...) nunca disparan el loader.
    // Usa un contador para manejar redirects encadenados (ej: POS → ?vista=apertura).
    let minTimer: ReturnType<typeof setTimeout> | null = null
    const visitedPaths = new Set<string>([window.location.pathname])
    let counter = 0

    const onStart = (url: string) => {
      const nextPath = url.split('?')[0]
      const curPath = window.location.pathname
      if (nextPath !== curPath && !visitedPaths.has(nextPath)) {
        counter++
        if (minTimer) { clearTimeout(minTimer); minTimer = null }
        setLoading(true)
      }
    }
    const onFinish = (url: string) => {
      visitedPaths.add(url.split('?')[0])
      if (counter > 0) {
        counter--
        if (counter === 0) {
          if (minTimer) clearTimeout(minTimer)
          minTimer = setTimeout(() => setLoading(false), 300)
        }
      }
    }
    const onError = () => {
      counter = 0
      if (minTimer) clearTimeout(minTimer)
      setLoading(false)
    }

    router.events.on('routeChangeStart',    onStart)
    router.events.on('routeChangeComplete', onFinish)
    router.events.on('routeChangeError',    onError)

    return () => {
      clearTimeout(timer)
      if (minTimer) clearTimeout(minTimer)
      router.events.off('routeChangeStart',    onStart)
      router.events.off('routeChangeComplete', onFinish)
      router.events.off('routeChangeError',    onError)
    }
  }, [router.events])

  const isStorefront = router.pathname.startsWith('/tienda')

  return (
    <QueryClientProvider client={queryClient}>
      {/*
        Script sincrónico — corre antes de que React hidrate.
        Aplica el tema oscuro desde localStorage para evitar flash blanco.
      */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var tema = localStorage.getItem('orbita-theme');
          var prefiereDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (tema === 'dark' || (!tema && prefiereDark)) {
            document.documentElement.classList.add('dark');
          }
        })();
      `}} />
      {isStorefront
        ? <StorefrontLoader visible={loading} nombre={TIENDA.nombre} />
        : <PageLoader visible={loading} />
      }
      <Component {...pageProps} />
    </QueryClientProvider>
  )
}
