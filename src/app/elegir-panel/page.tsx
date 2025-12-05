'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { diagLog } from '@/lib/diagnostic';

// Componente de tarjeta personalizado para evitar dependencias externas
const Card = ({ children, className = '', onClick, disabled }: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <div
    className={`rounded-lg border bg-card text-card-foreground shadow-sm transition-all ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:scale-105'
    } ${className}`}
    onClick={disabled ? undefined : onClick}
  >
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

export default function ElegirPanelPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { hasGroup, userPermissions, loading: roleLoading } = useRoleSystem();
  const [availablePanels, setAvailablePanels] = useState<string[]>([]);

  // Combinar loading states
  const loading = authLoading || roleLoading;

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  // Log de diagnóstico
  useEffect(() => {
    diagLog('info', 'ElegirPanelPage render', 'ElegirPanelPage', {
      userId: user?.id,
      authLoading,
      roleLoading,
      hasUserPermissions: !!userPermissions,
      hasAssignments: !!userPermissions?.asignaciones,
      assignmentsCount: userPermissions?.asignaciones?.length || 0
    });
  }, [user, authLoading, roleLoading, userPermissions]);

  // Definir los paneles disponibles con sus grupos permitidos
  const panels = [
    {
      id: 'monitoreo-gerencia',
      title: 'GESTIÓN DE MONITOREO',
      description: 'Acceso al sistema de gestión de monitoreo a la calidad de la seguridad social',
      icon: '📊',
      allowedGroups: ['monitoreo', 'desarrollo', 'general'],
      path: '/monitoreo-gerencia'
    },
    {
      id: 'monitoreo-operaciones',
      title: 'OPERACIONES DE MONITOREO',
      description: 'Panel operativo para registro y seguimiento de actividades de monitoreo',
      icon: '🔍',
      allowedGroups: ['monitoreo', 'desarrollo', 'general'],
      path: '/monitoreo-operaciones'
    },
    {
      id: 'monitoreo-encuestas',
      title: 'ENCUESTAS DE MONITOREO',
      description: 'Diseño, ejecución y análisis de encuestas de calidad',
      icon: '📋',
      allowedGroups: ['monitoreo', 'desarrollo', 'general'],
      path: '/monitoreo-encuestas'
    },
    {
      id: 'promociones-gerencia',
      title: 'GESTIÓN DE PROMOCIONES',
      description: 'Navega al sistema para la gestión de promociones y actividades de la DIDA',
      icon: '📢',
      allowedGroups: ['promociones', 'desarrollo', 'general'],
      path: '/promociones-gerencia'
    },
    {
      id: 'promociones-operaciones',
      title: 'OPERACIONES DE PROMOCIONES',
      description: 'Registro y seguimiento de actividades promocionales',
      icon: '🎯',
      allowedGroups: ['promociones', 'desarrollo', 'general'],
      path: '/promociones-operaciones'
    },
    {
      id: 'admin-general',
      title: 'ADMINISTRACIÓN DIDA',
      description: 'Panel de trabajo para el departamento de TIC y la administración general',
      icon: '🛠️',
      allowedGroups: ['administracion', 'desarrollo', 'general'],
      path: '/admin-general'
    },
    {
      id: 'seguridad-sistema',
      title: 'SEGURIDAD DEL SISTEMA',
      description: 'Panel de trabajo exclusivo para administradores de seguridad y permisos',
      icon: '🛡️',
      allowedGroups: ['seguridad', 'desarrollo', 'general'],
      path: '/seguridad-sistema'
    },
    {
      id: 'principal-dashboard',
      title: 'TRABAJOS MISCELANEOS',
      description: 'Panel de trabajo para tareas diversas y desarrollo del sistema',
      icon: '🔧',
      allowedGroups: ['desarrollo', 'general'],
      path: '/principal-dashboard'
    }
  ];

  // Determinar qué paneles están disponibles para el usuario
  useEffect(() => {
    if (!userPermissions?.asignaciones) {
      diagLog('info', 'No user permissions or assignments', 'ElegirPanelPage');
      return;
    }

    const userGroups = userPermissions.asignaciones
      .filter(asignacion => asignacion.esta_activa)
      .map(asignacion => asignacion.grupo?.codigo_grupo?.toLowerCase())
      .filter(Boolean);

    diagLog('info', 'User groups determined', 'ElegirPanelPage', {
      userGroups,
      totalAssignments: userPermissions.asignaciones.length,
      activeAssignments: userPermissions.asignaciones.filter(a => a.esta_activa).length
    });

    // Si el usuario pertenece al grupo 'general', tiene acceso a todos los paneles
    const hasGeneralAccess = userGroups.includes('general');

    const available = panels
      .filter(panel => {
        if (hasGeneralAccess) {
          return true; // Grupo general tiene acceso a todos los paneles
        }

        // Comparación case-insensitive para otros grupos
        return panel.allowedGroups.some(allowedGroup =>
          userGroups.includes(allowedGroup.toLowerCase())
        );
      })
      .map(panel => panel.id);

    diagLog('info', 'Available panels determined', 'ElegirPanelPage', {
      availablePanels: available,
      totalPanels: panels.length,
      hasGeneralAccess
    });

    setAvailablePanels(available);
  }, [userPermissions]);

  // Redirigir si no hay usuario autenticado o si hay error cargando permisos
  useEffect(() => {
    diagLog('info', 'Auth check useEffect', 'ElegirPanelPage', {
      authLoading,
      roleLoading,
      hasUser: !!user,
      userId: user?.id
    });

    // Solo redirigir después de que ambos hooks hayan terminado de cargar
    if (authLoading || roleLoading) {
      diagLog('info', 'Still loading, skipping redirect check', 'ElegirPanelPage');
      return;
    }

    // Si no hay usuario, redirigir al login
    if (!user) {
      diagLog('info', 'No user found, redirecting to signin', 'ElegirPanelPage');
      router.push('/signin');
      return;
    }

    diagLog('info', 'User authenticated, staying on elegir-panel', 'ElegirPanelPage');

    // Si hay usuario pero no hay permisos después de cargar, podría ser un error
    // En este caso, permitimos que la página se muestre pero con paneles deshabilitados
    // El usuario podrá ver que no tiene acceso a ningún panel
  }, [user, authLoading, roleLoading, router]);

  const handlePanelClick = (panelId: string, path: string) => {
    // Aquí podríamos agregar lógica adicional para determinar el panel específico
    // basado en el rol del usuario dentro del grupo
    router.push(path);
  };

  const isPanelAvailable = (panelId: string) => {
    return availablePanels.includes(panelId);
  };

  // Verificar si el usuario tiene asignaciones válidas
  const hasValidAssignments = userPermissions?.asignaciones?.some(
    asignacion => asignacion.esta_activa
  ) || false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando paneles disponibles...</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje de error si no hay asignaciones válidas
  if (!hasValidAssignments && !authLoading && !roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <img src="/imgs/Emblema_DIDA.png" alt="Emblema GEMODIDA" className="mx-auto h-24 w-24 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Acceso Restringido
          </h1>
          <p className="text-muted-foreground mb-6">
            No tienes asignaciones activas en el sistema. Contacta al administrador para obtener acceso.
          </p>
          <Button onClick={() => router.push('/signin')} variant="outline">
            Volver al Inicio de Sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header con botón de cerrar sesión */}
      <div className="absolute top-4 left-4 z-10">
        <Button 
          onClick={handleSignOut} 
          variant="outline" 
          className="bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-white"
        >
          Cerrar Sesión
        </Button>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <img src="/imgs/Emblema_DIDA.png" alt="Emblema GEMODIDA" className="mx-auto mb-6 h-24 w-24 object-contain" />
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl">
              Elegir Panel de Trabajo
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Selecciona el panel de trabajo correspondiente a tu área
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {panels.map((panel) => (
                <Card
                  key={panel.id}
                  className="transition-all"
                  onClick={() => isPanelAvailable(panel.id) ? handlePanelClick(panel.id, panel.path) : undefined}
                  disabled={!isPanelAvailable(panel.id)}
                >
                  <CardContent className="text-center">
                    <div className="mb-4 text-4xl">{panel.icon}</div>
                    <CardTitle className="mb-2">{panel.title}</CardTitle>
                    <CardDescription>{panel.description}</CardDescription>
                    {!isPanelAvailable(panel.id) && (
                      <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        No disponible para tu grupo
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Información del usuario */}
          {userPermissions?.usuario && (
            <div className="mt-12 text-center">
              <div className="bg-muted/50 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="font-semibold text-foreground mb-2">
                  Usuario: {userPermissions.usuario.nombre_completo}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Correo: {userPermissions.usuario.correo}
                </p>
                <div className="flex flex-wrap justify-center gap-1">
                  {userPermissions.asignaciones
                    .filter(asignacion => asignacion.esta_activa)
                    .map((asignacion, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {asignacion.grupo?.nombre_grupo} - {asignacion.rol?.nombre_rol}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}