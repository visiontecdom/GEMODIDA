import Head from 'next/head';

export default function PWAHead() {
  return (
    <Head>
      <meta name="application-name" content="GEMODIDA" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="GEMODIDA" />
      <meta name="description" content="Aplicación de gestión GEMODIDA" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-config" content="/icons/browserconfig.xml" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="msapplication-tap-highlight" content="no" />
      <meta name="theme-color" content="#000000" />

      <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
      <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167x167.png" />

      <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
      <link rel="manifest" href="/manifest/manifest.json" />
      <meta name="msapplication-TileImage" content="/icons/icon-192x192.png" />
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="mask-icon" href="/icons/icon-512x512.png" color="#000000" />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:url" content="https://tudominio.com" />
      <meta name="twitter:title" content="GEMODIDA" />
      <meta name="twitter:description" content="Aplicación de gestión GEMODIDA" />
      <meta name="twitter:image" content="https://tudominio.com/icons/icon-192x192.png" />
      <meta name="twitter:creator" content="@tucuenta" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="GEMODIDA" />
      <meta property="og:description" content="Aplicación de gestión GEMODIDA" />
      <meta property="og:site_name" content="GEMODIDA" />
      <meta property="og:url" content="https://tudominio.com" />
      <meta property="og:image" content="https://tudominio.com/icons/icon-192x192.png" />
      {/* iOS/Android startup splash images */}
      <link rel="apple-touch-startup-image" href="/icons/splash-640x1136.png" sizes="640x1136" />
      <link rel="apple-touch-startup-image" href="/icons/splash-750x1334.png" sizes="750x1334" />
      <link rel="apple-touch-startup-image" href="/icons/splash-828x1792.png" sizes="828x1792" />
      <link rel="apple-touch-startup-image" href="/icons/splash-1125x2436.png" sizes="1125x2436" />
      <link rel="apple-touch-startup-image" href="/icons/splash-1242x2208.png" sizes="1242x2208" />
      <link rel="apple-touch-startup-image" href="/icons/splash-1242x2688.png" sizes="1242x2688" />
      <link rel="apple-touch-startup-image" href="/icons/splash-1536x2048.png" sizes="1536x2048" />
      <link rel="apple-touch-startup-image" href="/icons/splash-1668x2224.png" sizes="1668x2224" />
      <link rel="apple-touch-startup-image" href="/icons/splash-2048x2732.png" sizes="2048x2732" />
    </Head>
  );
}
