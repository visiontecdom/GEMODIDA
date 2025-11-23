'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Componente de tarjeta personalizado para evitar dependencias externas
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5 p-6">
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-muted-foreground">
    {children}
  </p>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <img src="/imgs/Emblema_DIDA.png" alt="Emblema GEMODIDA" className="mx-auto mb-6 h-24 w-24 object-contain" />
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl">
              Bienvenido a <span className="text-primary">GEMODIDA</span>
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Herramienta avanzada para el monitoreo y análisis de datos en línea
            </p>
          </div>

          <div className="mt-12 text-center">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">¿Ya tienes una cuenta?</h2>
              <Button 
                onClick={() => router.push('/signin')}
                size="lg"
                className="px-8 py-3 mr-4"
              >
                Iniciar Sesión
              </Button>
              <Button
                onClick={() => router.push('/signup')}
                size="lg"
                className="px-8 py-3"
                variant="secondary"
              >
                Crear Cuenta
              </Button>
            </div>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-foreground">Características Principales</h2>
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Monitoreo en Tiempo Real',
                  description: 'Sigue el rendimiento de tus palabras clave en tiempo real',
                  icon: '⏱️'
                },
                {
                  title: 'Análisis Avanzado',
                  description: 'Obtén información detallada sobre el rendimiento de tus búsquedas',
                  icon: '📊'
                },
                {
                  title: 'Informes Personalizados',
                  description: 'Genera informes personalizados según tus necesidades',
                  icon: '📈'
                },
                {
                  title: 'Notificaciones',
                  description: 'Recibe alertas cuando ocurran cambios importantes',
                  icon: '🔔'
                },
                {
                  title: 'Colaboración en Equipo',
                  description: 'Trabaja con tu equipo en tiempo real',
                  icon: '👥'
                },
                {
                  title: 'Seguridad Avanzada',
                  description: 'Tus datos están protegidos con encriptación de grado empresarial',
                  icon: '🔒'
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="mb-4 text-3xl">{feature.icon}</div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
