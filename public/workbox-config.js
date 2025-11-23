module.exports = {
  // Ruta al archivo de precaché generado
  importScripts: ['/sw.js'],
  
  // Configuración de precaché
  runtimeCaching: [
    {
      urlPattern: /^https?:\/\/fonts\.googleapis\.com/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
      },
    },
    {
      urlPattern: /^https?:\/\/fonts\.gstatic\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        cacheableResponse: {
          statuses: [0, 200],
        },
        expiration: {
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
          maxEntries: 30,
        },
      },
    },
    {
      urlPattern: /\/(_next|static)/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
        },
      },
    },
    {
      urlPattern: /^https?:\/\/.*\.(png|jpg|jpeg|svg|gif|webp|ico)/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
        },
      },
    },
  ],
};
