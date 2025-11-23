'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/StatCard';
import { ChartCard } from '@/components/shared/ChartCard';
import { DataTable } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';
import { ExportButton } from '@/components/shared/ExportButton';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { usePlanificacion } from '@/hooks/usePlanificacion';
import { useKeywords } from '@/hooks/useKeywords';
import { useResults } from '@/hooks/useResults';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Calendar,
  Plus,
  Settings,
  BarChart3,
  Search,
  AlertTriangle
} from 'lucide-react';

export default function MonitoreoGerenciaPage() {
  const { userPermissions, hasPermission, getUserSucursales } = useRoleSystem();
  const { planificaciones, loadPlanificaciones, createPlanificacion } = usePlanificacion();
  const { keywords, loadKeywords } = useKeywords();
  const { results, loadResults } = useResults();
  const { stats, loadStats } = useDashboardStats();
  
  const [selectedSucursal, setSelectedSucursal] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState({
    inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0]
  });

  // Cargar datos iniciales
  useEffect(() => {
    const sucursales = getUserSucursales();
    if (sucursales.length > 0) {
      const sucursalId = sucursales[0].id_suc;
      setSelectedSucursal(sucursalId);
      
      // Cargar datos para la sucursal
      loadPlanificaciones({ id_sucursal: sucursalId });
      loadKeywords();
      loadResults();
      loadStats();
    }
  }, [getUserSucursales, loadPlanificaciones, loadKeywords, loadResults, loadStats]);

  // Estadísticas principales
  const estadisticasPrincipales = [
    {
      titulo: 'Usuarios Activos',
      valor: stats?.usuarios_activos || 0,
      icono: Users,
      tendencia: '+12%',
      color: 'text-blue-600'
    },
    {
      titulo: 'Palabras Clave',
      valor: keywords.length,
      icono: Target,
      tendencia: '+5%',
      color: 'text-green-600'
    },
    {
      titulo: 'Resultados Hoy',
      valor: stats?.resultados_hoy || 0,
      icono: TrendingUp,
      tendencia: '+23%',
      color: 'text-purple-600'
    },
    {
      titulo: 'Planificaciones',
      valor: planificaciones.length,
      icono: Calendar,
      tendencia: '+8%',
      color: 'text-orange-600'
    }
  ];

  // Datos para gráficos
  const datosActividades = planificaciones.map(p => ({
    nombre: p.titulo.substring(0, 20) + '...',
    progreso: p.progreso_porcentaje,
    estado: p.estado
  }));

  const datosResultados = results.slice(0, 7).map((r, index) => ({
    fecha: new Date(r.fecha_publicacion).toLocaleDateString(),
    cantidad: Math.floor(Math.random() * 50) + 10,
    sentimiento: r.sentimiento
  }));

  // Columnas para tabla de planificaciones
  const columnasPlanificaciones = [
    {
      key: 'titulo',
      label: 'Título',
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.tipo_trabajo}</div>
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value: string) => (
        <Badge variant={
          value === 'completado' ? 'default' :
          value === 'en_progreso' ? 'secondary' :
          value === 'planificado' ? 'outline' : 'destructive'
        }>
          {value}
        </Badge>
      )
    },
    {
      key: 'progreso_porcentaje',
      label: 'Progreso',
      render: (value: number) => (
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm">{value}%</span>
        </div>
      )
    },
    {
      key: 'fecha_inicio',
      label: 'Fecha Inicio',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'responsable_nombre',
      label: 'Responsable'
    }
  ];

  // Filtros disponibles
  const filtrosDisponibles = [
    {
      key: 'tipo_trabajo',
      label: 'Tipo de Trabajo',
      type: 'select' as const,
      options: [
        { value: 'monitoreo', label: 'Monitoreo' },
        { value: 'encuesta', label: 'Encuesta' },
        { value: 'investigacion', label: 'Investigación' }
      ]
    },
    {
      key: 'estado',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { value: 'planificado', label: 'Planificado' },
        { value: 'en_progreso', label: 'En Progreso' },
        { value: 'completado', label: 'Completado' },
        { value: 'cancelado', label: 'Cancelado' }
      ]
    },
    {
      key: 'fecha_inicio',
      label: 'Fecha Desde',
      type: 'date' as const
    },
    {
      key: 'fecha_fin',
      label: 'Fecha Hasta',
      type: 'date' as const
    }
  ];

  const handleFiltroChange = (filtros: Record<string, any>) => {
    loadPlanificaciones({
      id_sucursal: selectedSucursal || undefined,
      ...filtros
    });
  };

  const handleCrearPlanificacion = () => {
    // Abrir modal de creación de planificación
    console.log('Crear nueva planificación');
  };

  const handleConfigurarScraping = () => {
    // Navegar a configuración de scraping
    console.log('Configurar scraping');
  };

  if (!hasPermission('administrar_recursos')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acceso Restringido
          </h3>
          <p className="text-gray-500">
            No tienes permisos para acceder al panel de gerencia de monitoreo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerencia de Monitoreo
          </h1>
          <p className="text-gray-600 mt-1">
            Panel de gestión gerencial del departamento de monitoreo
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleConfigurarScraping} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurar Scraping
          </Button>
          <Button onClick={handleCrearPlanificacion}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Planificación
          </Button>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estadisticasPrincipales.map((stat, index) => {
          const IconComponent = stat.icono;
          return (
            <StatCard
              key={index}
              title={stat.titulo}
              value={stat.valor.toString()}
              icon={<IconComponent className="h-4 w-4" />}
              trend={{
                value: parseInt(stat.tendencia.replace(/[^0-9]/g, '')),
                isPositive: stat.tendencia.includes('+')
              }}
              className={stat.color}
            />
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Progreso de Actividades"
          description="Estado actual de las planificaciones"
          type="bar"
          data={datosActividades}
          dataKey="progreso"
          nameKey="nombre"
        />
        <ChartCard
          title="Resultados de Monitoreo"
          description="Resultados obtenidos en los últimos 7 días"
          type="line"
          data={datosResultados}
          dataKey="cantidad"
          nameKey="fecha"
        />
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Gestión de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Crear y administrar usuarios del departamento de monitoreo
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Gestionar Usuarios
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Search className="h-5 w-5 mr-2 text-green-600" />
              Palabras Clave
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Definir temas y frases para investigación y scraping
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Gestionar Keywords
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
              Informes Estadísticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Generar reportes y análisis estadísticos de monitoreo
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Ver Informes
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Planificaciones */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Planificaciones de Trabajo</CardTitle>
              <CardDescription>
                Gestión de planificaciones y asignación de tareas
              </CardDescription>
            </div>
            <ExportButton
              data={planificaciones}
              filename="planificaciones_monitoreo"
              title="Exportar Planificaciones"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FilterBar
              filters={filtrosDisponibles}
              onFilterChange={handleFiltroChange}
              className="mb-4"
            />
            <DataTable
              data={planificaciones}
              columns={columnasPlanificaciones}
              searchable
              searchPlaceholder="Buscar planificaciones..."
              emptyMessage="No hay planificaciones registradas"
            />
          </div>
        </CardContent>
      </Card>

      {/* Alertas y Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
            Alertas Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-yellow-800">
                  Scraping de Facebook interrumpido
                </p>
                <p className="text-sm text-yellow-600">
                  Error de autenticación - Hace 2 horas
                </p>
              </div>
              <Button variant="outline" size="sm">
                Revisar
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-800">
                  Nueva palabra clave agregada
                </p>
                <p className="text-sm text-blue-600">
                  "seguridad social" - Hace 1 día
                </p>
              </div>
              <Button variant="outline" size="sm">
                Ver Detalles
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}