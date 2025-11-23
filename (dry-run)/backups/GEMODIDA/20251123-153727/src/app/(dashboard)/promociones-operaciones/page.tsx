'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { useActivities } from '@/hooks/useActivities';
import { usePlanificacion } from '@/hooks/usePlanificacion';
import { 
  CheckCircle, 
  Clock, 
  DollarSign,
  FileText,
  Plus,
  Edit,
  AlertTriangle
} from 'lucide-react';

export default function PromocionesOperacionesPage() {
  const { hasGroup, hasRole, getUserSucursales } = useRoleSystem();
  const { activities, loadActivities } = useActivities();
  const { planificaciones, loadPlanificaciones } = usePlanificacion();
  
  const [selectedSucursal, setSelectedSucursal] = useState<number | null>(null);

  useEffect(() => {
    const sucursales = getUserSucursales();
    if (sucursales.length > 0) {
      const sucursalId = sucursales[0].id_suc;
      setSelectedSucursal(sucursalId);
      loadActivities();
      loadPlanificaciones({ 
        id_sucursal: sucursalId, 
        tipo_trabajo: 'promocion' 
      });
    }
  }, [getUserSucursales, loadActivities, loadPlanificaciones]);

  const estadisticasOperaciones = [
    {
      titulo: 'Actividades Completadas',
      valor: activities.filter(a => a.resultado).length,
      icono: CheckCircle,
      color: 'text-green-600'
    },
    {
      titulo: 'En Progreso',
      valor: planificaciones.filter(p => p.estado === 'en_progreso').length,
      icono: Clock,
      color: 'text-orange-600'
    },
    {
      titulo: 'Presupuesto Usado',
      valor: '68%',
      icono: DollarSign,
      color: 'text-blue-600'
    },
    {
      titulo: 'Reportes Generados',
      valor: 8,
      icono: FileText,
      color: 'text-purple-600'
    }
  ];

  const columnasActividades = [
    {
      key: 'tipo_actividad',
      label: 'Actividad',
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.descripcion?.substring(0, 50)}...</div>
        </div>
      )
    },
    {
      key: 'fecha',
      label: 'Fecha',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'ubicacion',
      label: 'Ubicación'
    },
    {
      key: 'resultado',
      label: 'Estado',
      render: (value: string) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Completada' : 'Pendiente'}
        </Badge>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: any, row: any) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (!hasGroup('promociones') || !hasRole('operador')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Restringido</h3>
          <p className="text-gray-500">No tienes permisos para acceder a operaciones de promociones.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operaciones de Promociones</h1>
          <p className="text-gray-600 mt-1">Panel de trabajo para registrar datos de promociones</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generar Reporte
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Registrar Actividad
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estadisticasOperaciones.map((stat, index) => {
          const IconComponent = stat.icono;
          return (
            <StatCard
              key={index}
              title={stat.titulo}
              value={stat.valor.toString()}
              icon={<IconComponent className="h-4 w-4" />}
              className={stat.color}
            />
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividades Realizadas</CardTitle>
          <CardDescription>Registro y seguimiento de actividades promocionales</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={activities}
            columns={columnasActividades}
            searchable
            searchPlaceholder="Buscar actividades..."
            emptyMessage="No hay actividades registradas"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Nueva Actividad
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Edit className="h-4 w-4 mr-2" />
              Actualizar Planificación
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              Actualizar Presupuesto
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Generar Informe Semanal
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de Avances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Actividades Completadas</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Presupuesto Ejecutado</span>
                  <span>68%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Metas del Mes</span>
                  <span>82%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}