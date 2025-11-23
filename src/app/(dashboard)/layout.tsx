'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { useAuth } from '@/hooks/useAuth';
import { PanelSidebar } from '@/components/layout/PanelSidebar';
import { 
  Monitor, 
  Users, 
  PieChart, 
  Settings, 
  Shield,
  ChevronRight,
  AlertCircle,
  Home
} from 'lucide-react';

interface PanelOption {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  requiredGroups: string[];
  requiredRoles: string[];
  color: string;
}

const PANEL_OPTIONS: PanelOption[] = [
  {
    id: 'monitoreo-gerencia',
    title: 'Gerencia de Monitoreo',
    description: 'Gestión gerencial del departamento de monitoreo',
    icon: Monitor,
    path: '/monitoreo-gerencia',
    requiredGroups: ['monitoreo', 'general'],
    requiredRoles: ['gerente', 'admin', 'super_user', 'desarrollo'],
    color: 'bg-blue-500'
  },
  {
    id: 'monitoreo-operaciones',
    title: 'Operaciones de Monitoreo',
    description: 'Panel de trabajo para uso frecuente de monitoreo',
    icon: Monitor,
    path: '/monitoreo-operaciones',
    requiredGroups: ['monitoreo', 'general'],
    requiredRoles: ['operador', 'supervisor', 'admin', 'super_user', 'desarrollo'],
    color: 'bg-green-500'
  },
  {
    id: 'monitoreo-encuestas',
    title: 'Encuestas de Monitoreo',
    description: 'Crear y registrar encuestas y sondeos de datos',
    icon: PieChart,
    path: '/monitoreo-encuestas',
    requiredGroups: ['monitoreo', 'general'],
    requiredRoles: ['encuestador', 'gerente', 'admin', 'super_user'],
    color: 'bg-purple-500'
  },
  {
    id: 'promociones-gerencia',
    title: 'Gerencia de Promociones',
    description: 'Centro de mando para el departamento de promociones',
    icon: Users,
    path: '/promociones-gerencia',
    requiredGroups: ['promociones', 'general'],
    requiredRoles: ['gerente', 'admin', 'super_user', 'desarrollo'],
    color: 'bg-orange-500'
  },
  {
    id: 'promociones-operaciones',
    title: 'Operaciones de Promociones',
    description: 'Panel de trabajo para registrar datos de promociones',
    icon: Users,
    path: '/promociones-operaciones',
    requiredGroups: ['promociones', 'general'],
    requiredRoles: ['operador', 'supervisor', 'admin', 'super_user', 'desarrollo'],
    color: 'bg-pink-500'
  },
  {
    id: 'admin-general',
    title: 'Administración General',
    description: 'Central de trabajo con vista de todas las sucursales',
    icon: Shield,
    path: '/admin-general',
    requiredGroups: ['general', 'desarrollo'],
    requiredRoles: ['admin', 'super_user', 'desarrollo'],
    color: 'bg-red-500'
  }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { userPermissions, hasGroup, hasRole, loading } = useRoleSystem();

  const [availablePanels, setAvailablePanels] = useState<PanelOption[]>([]);
  const [showPanelSelector, setShowPanelSelector] = useState(false);
  const [currentPanel, setCurrentPanel] = useState<PanelOption | null>(null);

  const userDisplayName = userPermissions?.usuario.nombre || user?.email || 'Usuario Desconocido';
  const userDisplayRoles = userPermissions?.asignaciones
    .filter(a => a.esta_activa)
    .map(a => a.rol.nombre_rol) || [];

  // Determinar paneles disponibles para el usuario
  useEffect(() => {
    if (!userPermissions?.asignaciones) return;

    const panels = PANEL_OPTIONS.filter(panel => {
      // Verificar si el usuario tiene al menos uno de los grupos requeridos
      const hasRequiredGroup = panel.requiredGroups.some(group => hasGroup(group));
      
      // Verificar si el usuario tiene al menos uno de los roles requeridos
      const hasRequiredRole = panel.requiredRoles.some(role => hasRole(role));
      
      return hasRequiredGroup && hasRequiredRole;
    });

    setAvailablePanels(panels);

    // Determinar el panel actual basado en la ruta
    const current = panels.find(panel => pathname.includes(panel.path));
    setCurrentPanel(current || null);

    // Mostrar selector si hay múltiples paneles y no estamos en uno específico
    const isInSpecificPanel = panels.some(panel => pathname.includes(panel.path));
    setShowPanelSelector(panels.length > 1 && !isInSpecificPanel);
  }, [userPermissions, hasGroup, hasRole, pathname]);

  // Redirigir automáticamente si solo hay un panel disponible
  useEffect(() => {
    if (availablePanels.length === 1 && pathname === '/principal-dashboard') {
      router.push(availablePanels[0].path);
    }
  }, [availablePanels, pathname, router]);

  const handlePanelSelect = (panel: PanelOption) => {
    router.push(panel.path);
  };

  const handleBackToDashboard = () => {
    router.push('/principal-dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Acceso Requerido
            </h3>
            <p className="text-gray-500 mb-4">
              Debes iniciar sesión para acceder a los paneles de trabajo.
            </p>
            <Button onClick={() => router.push('/signin')}>
              Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (availablePanels.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sin Acceso a Paneles
            </h3>
            <p className="text-gray-500 mb-4">
              No tienes permisos para acceder a ningún panel de trabajo. 
              Contacta al administrador para obtener los permisos necesarios.
            </p>
            <Button variant="outline" onClick={() => router.push('/')}>
              <Home className="h-4 w-4 mr-2" />
              Ir al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar selector de paneles
  if (showPanelSelector) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Selecciona tu Panel de Trabajo
            </h1>
            <p className="text-lg text-gray-600">
              Tienes acceso a múltiples áreas. Elige el panel donde deseas trabajar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePanels.map((panel) => (
              <Card 
                key={panel.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                onClick={() => handlePanelSelect(panel)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg ${panel.color} text-white mr-4`}>
                      <panel.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {panel.title}
                      </h3>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {panel.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {panel.requiredGroups.map(group => (
                      <Badge key={group} variant="secondary" className="text-xs">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Información del usuario */}
          <Card className="mt-12">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información de tu Cuenta
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Usuario</p>
                  <p className="font-medium">{userPermissions?.usuario.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Correo</p>
                  <p className="font-medium">{userPermissions?.usuario.correo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Grupos</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {userPermissions?.asignaciones
                      .filter(a => a.esta_activa)
                      .map(a => (
                        <Badge key={a.grupo.codigo_grupo} variant="outline" className="text-xs">
                          {a.grupo.nombre_grupo}
                        </Badge>
                      ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Roles</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {userPermissions?.asignaciones
                      .filter(a => a.esta_activa)
                      .map(a => (
                        <Badge key={a.rol.codigo_rol} variant="outline" className="text-xs">
                          {a.rol.nombre_rol}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Mostrar panel específico con navegación
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      {currentPanel && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToDashboard}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded ${currentPanel.color} text-white`}>
                    <currentPanel.icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-gray-900">
                    {currentPanel.title}
                  </span>
                </div>
              </div>
              
              {availablePanels.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToDashboard}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Cambiar Panel
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Panel Content */}
      <div className="flex h-screen">
        {currentPanel && (
          <PanelSidebar
            panelType={currentPanel.id as any}
            userName={userDisplayName}
            userRoles={userDisplayRoles}
          />
        )}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
