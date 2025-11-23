'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ServiceWorker() {
  const router = useRouter();

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('ServiceWorker registrado con éxito:', registration.scope);
            
            // Verificar si hay una nueva versión disponible
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              
              newWorker.addEventListener('statechange', () => {
                // Cuando se instala una nueva versión, recargar la página
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('Nueva versión disponible. Recargando...');
                  window.location.reload();
                }
              });
            });
          })
          .catch((error) => {
            console.error('Error al registrar el ServiceWorker:', error);
          });
      });
    }
  }, [router]);

  return null;
}
