'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/StatCard';
import { ChartCard } from '@/components/shared/ChartCard';
import { DataTable } from '@/components/shared/DataTable';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { usePlanificacion } from '@/hooks/usePlanificacion';
import { useActivities } from '@/hooks/useActivities';
import { 
  Users, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Plus,
  Settings,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

export default function PromocionesGerenciaPage() {
  const { hasGroup, hasRole, getUserSucursales } = useRoleSystem();
  const { planificaciones, loadPlanificaciones } = usePlanificacion();
  const { activities, loadActivities } = useActivities();
  
  const [selectedSucursal, setSelectedSucursal] = useState<number | null>(null);

  useEffect(() => {
    const sucursales = getUserSucursales();
    if (sucursales.length > 0) {
      const sucursalId = sucursales[0].id_suc;
      setSelectedSucursal(sucursalId);
      loadPlanificaciones({ 
        id_sucursal: sucursalId, 
        tipo_trabajo: 'promocion' 
      });
      loadActivities();
    }
  }, [getUserSucursales, loadPlanificaciones, loadActivities]);

  const estadisticasPromociones = [
    {
      titulo: 'Personal Asignado',
      valor: 15,
      icono: Users,
      tendencia: '+3%',
      color: 'text-blue-600'
    },
    {
      titulo: 'Actividades Planificadas',
      valor: planificaciones.length,
      icono: Calendar,
      tendencia: '+12%',
      color: 'text-green-600'
    },
    {
      titulo: 'Presupuesto Ejecutado',
      valor: '85%',
      icono: DollarSign,
      tendencia: '+5%',
      color: 'text-purple-600'
    },
    {
      titulo: 'Eventos Realizados',
      valor: activities.filter(a => a.tipo_actividad?.includes('Evento')).length,
      icono: TrendingUp,
      tendencia: '+18%',
      color: 'text-orange-600'
    }
  ];

  const datosActividades = planificaciones.map(p => ({
    nombre: p.titulo.substring(0, 15) + '...',
    presupuesto: Math.floor(Math.random() * 50000) + 10000,
    ejecutado: Math.floor(Math.random() * 40000) + 5000
  }));

  const columnasActividades = [
    {
      key: 'titulo',
      label: 'Actividad',
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
          value === 'en_progreso' ? 'secondary' : 'outline'
        }>
          {value}
        </Badge>
      )
    },
    {
      key: 'presupuesto_estimado',
      label: 'Presupuesto',
      render: (value: number) => value ? `$${value.toLocaleString()}` : 'N/A'
    },
    {
      key: 'responsable_nombre',
      label: 'Responsable'
    },
    {
      key: 'fecha_inicio',
      label: 'Fecha',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  if (!hasGroup('promociones') || !hasRole('gerente')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Restringido</h3>
          <p className="text-gray-500">No tienes permisos para acceder a la gerencia de promociones.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerencia de Promociones</h1>
          <p className="text-gray-600 mt-1">Centro de mando para el departamento de promociones</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurar Campañas
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Actividad
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estadisticasPromociones.map((stat, index) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Presupuesto vs Ejecutado"
          description="Comparación de presupuestos planificados y ejecutados"
          type="bar"
          data={datosActividades}
          dataKey="presupuesto"
          nameKey="nombre"
        />
        <ChartCard
          title="Actividades por Mes"
          description="Distribución de actividades promocionales"
          type="line"
          data={[
            { mes: 'Ene', actividades: 12 },
            { mes: 'Feb', actividades: 15 },
            { mes: 'Mar', actividades: 18 },
            { mes: 'Abr', actividades: 22 },
            { mes: 'May', actividades: 25 },
            { mes: 'Jun', actividades: 20 }
          ]}
          dataKey="actividades"
          nameKey="mes"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Gestión de Personal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Crear usuarios y asignar tareas al personal de promociones
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Gestionar Personal
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              Planificar Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Organizar charlas, reuniones, campañas y efemérides
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Planificar Eventos
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
              Generar reportes diarios, semanales y mensuales
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Ver Informes
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividades de Promoción</CardTitle>
          <CardDescription>Planificación y seguimiento de actividades promocionales</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={planificaciones}
            columns={columnasActividades}
            searchable
            searchPlaceholder="Buscar actividades..."
            emptyMessage="No hay actividades planificadas"
          />
        </CardContent>
      </Card>
    </div>
  );
}