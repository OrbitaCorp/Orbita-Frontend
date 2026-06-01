import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@/styles/globals.css'
import 'leaflet/dist/leaflet.css'
import { PageLoader } from '@/components/PageLoader'

const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Carga inicial: ocultar el loader después de que React hidrata
    const timer = setTimeout(() => setLoading(false), 500)

    const onStart    = () => setLoading(true)
    const onFinish   = () => setLoading(false)

    router.events.on('routeChangeStart',    onStart)
    router.events.on('routeChangeComplete', onFinish)
    router.events.on('routeChangeError',    onFinish)

    return () => {
      clearTimeout(timer)
      router.events.off('routeChangeStart',    onStart)
      router.events.off('routeChangeComplete', onFinish)
      router.events.off('routeChangeError',    onFinish)
    }
  }, [router.events])

  return (
    <>
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
      <PageLoader visible={loading} />
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </>
  )
}
