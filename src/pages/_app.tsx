// import type { AppProps } from 'next/app';
// import '../styles/globals.css';

// export default function App({ Component, pageProps }: AppProps) {
//   return <Component {...pageProps} />;
// }
// Sin esto, al recargar la página el usuario ve un flash blanco
// antes de que React aplique el tema oscuro (porque useEffect
// corre después del primer render).
//
// La solución: un script inline que corre ANTES de que React hidrate,
// aplicando el tema directamente desde localStorage.

import type { AppProps } from 'next/app'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/*
        Script que corre sincrónicamente antes del render.
        dangerouslySetInnerHTML es necesario — no hay otra forma
        de inyectar un script inline en Next.js Pages Router.
        El contenido es seguro: solo lee localStorage y agrega una clase.
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
      <Component {...pageProps} />
    </>
  )
}