'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth
import { 
  Users, 
  Calendar, 
  Settings, 
  BarChart3,
  FileText,
  Target,
  Building,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut // Import LogOut icon
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  requiredPermission?: string;
}

interface PanelSidebarProps {
  panelType: 'monitoreo-gerencia' | 'monitoreo-operaciones' | 'monitoreo-encuestas' | 
             'promociones-gerencia' | 'promociones-operaciones' | 'admin-general';
  userName: string;
  userRoles: string[];
}

export function PanelSidebar({ panelType, userName, userRoles }: PanelSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { hasPermission } = useRoleSystem();
  const { signOut } = useAuth(); // Use the signOut function

  const handleLogout = async () => {
    await signOut();
    // No need to redirect explicitly, useAuth should handle it
  };

  const getMenuItems = (): MenuItem[] => {
    switch (panelType) {
      case 'monitoreo-gerencia':
        return [
          {
            id: 'usuarios',
            label: 'Gestionar Usuarios',
            icon: Users,
            action: () => console.log('Gestionar usuarios'),
            requiredPermission: 'crear_usuarios'
          },
          {
            id: 'planificacion',
            label: 'Planificar Trabajos',
            icon: Calendar,
            action: () => console.log('Planificar trabajos')
          },
          {
            id: 'sucursales',
            label: 'Gestionar Sucursales',
            icon: Building,
            action: () => console.log('Gestionar sucursales'),
            requiredPermission: 'administrar_recursos'
          },
          {
            id: 'presupuestos',
            label: 'Presupuestos',
            icon: BarChart3,
            action: () => console.log('Presupuestos')
          },
          {
            id: 'informes',
            label: 'Informes Estadísticos',
            icon: FileText,
            action: () => console.log('Informes')
          },
          {
            id: 'scraping',
            label: 'Config. Scraping',
            icon: Target,
            action: () => console.log('Configurar scraping')
          }
        ];

      case 'monitoreo-operaciones':
        return [
          {
            id: 'encuestas',
            label: 'Registrar Encuestas',
            icon: FileText,
            action: () => console.log('Registrar encuestas')
          },
          {
            id: 'planificacion',
            label: 'Actualizar Planificación',
            icon: Calendar,
            action: () => console.log('Actualizar planificación')
          },
          {
            id: 'scraping',
            label: 'Ejecutar Scraping',
            icon: Target,
            action: () => console.log('Ejecutar scraping')
          },
          {
            id: 'informes',
            label: 'Informes Ejecutivos',
            icon: BarChart3,
            action: () => console.log('Informes ejecutivos')
          }
        ];

      case 'monitoreo-encuestas':
        return [
          {
            id: 'disenar',
            label: 'Diseñar Encuestas',
            icon: FileText,
            action: () => console.log('Diseñar encuestas')
          },
          {
            id: 'realizar',
            label: 'Realizar Encuestas',
            icon: Users,
            action: () => console.log('Realizar encuestas')
          },
          {
            id: 'resultados',
            label: 'Ver Resultados',
            icon: BarChart3,
            action: () => console.log('Ver resultados')
          },
          {
            id: 'exportar',
            label: 'Exportar Datos',
            icon: FileText,
            action: () => console.log('Exportar datos')
          }
        ];

      case 'promociones-gerencia':
        return [
          {
            id: 'usuarios',
            label: 'Gestionar Personal',
            icon: Users,
            action: () => console.log('Gestionar personal'),
            requiredPermission: 'crear_usuarios'
          },
          {
            id: 'planificacion',
            label: 'Planificar Actividades',
            icon: Calendar,
            action: () => console.log('Planificar actividades')
          },
          {
            id: 'eventos',
            label: 'Gestionar Eventos',
            icon: Calendar,
            action: () => console.log('Gestionar eventos')
          },
          {
            id: 'presupuestos',
            label: 'Presupuestos',
            icon: BarChart3,
            action: () => console.log('Presupuestos')
          },
          {
            id: 'informes',
            label: 'Informes Estadísticos',
            icon: FileText,
            action: () => console.log('Informes')
          }
        ];

      case 'promociones-operaciones':
        return [
          {
            id: 'actividades',
            label: 'Registrar Actividades',
            icon: FileText,
            action: () => console.log('Registrar actividades')
          },
          {
            id: 'planificacion',
            label: 'Actualizar Planificación',
            icon: Calendar,
            action: () => console.log('Actualizar planificación')
          },
          {
            id: 'avances',
            label: 'Registrar Avances',
            icon: BarChart3,
            action: () => console.log('Registrar avances')
          },
          {
            id: 'presupuestos',
            label: 'Actualizar Presupuesto',
            icon: BarChart3,
            action: () => console.log('Actualizar presupuesto')
          }
        ];

      case 'admin-general':
        return [
          {
            id: 'sucursales',
            label: 'Consultar Sucursales',
            icon: Building,
            action: () => console.log('Consultar sucursales')
          },
          {
            id: 'informes',
            label: 'Informes Globales',
            icon: FileText,
            action: () => console.log('Informes globales')
          },
          {
            id: 'estadisticas',
            label: 'Estadísticas Globales',
            icon: BarChart3,
            action: () => console.log('Estadísticas globales')
          },
          {
            id: 'permisos',
            label: 'Gestionar Permisos',
            icon: Shield,
            action: () => console.log('Gestionar permisos')
          },
          {
            id: 'configuracion',
            label: 'Configuración',
            icon: Settings,
            action: () => console.log('Configuración')
          }
        ];

      default:
        return [];
    }
  };

  const menuItems = getMenuItems().filter(item => 
    !item.requiredPermission || hasPermission(item.requiredPermission)
  );

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h3 className="font-semibold text-gray-900">Menú</h3>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <nav className="p-2">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'}`}
              onClick={item.action}
            >
              <item.icon className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">{item.label}</span>}
            </Button>
          ))}
        </div>
      </nav>
      {/* User Info and Logout */}
      <div className="flex flex-col p-4 border-t border-gray-200 mt-auto"> {/* Use flex-col and mt-auto to push to bottom */}
        {!isCollapsed && (
          <>
            <p className="text-sm font-medium text-gray-900 truncate">
              {userName}
            </p>
            <div className="flex flex-wrap gap-1 mt-1 mb-4"> {/* Added mb-4 for spacing before button */}
              {userRoles.map((role) => (
                <span key={role} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                  {role}
                </span>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
