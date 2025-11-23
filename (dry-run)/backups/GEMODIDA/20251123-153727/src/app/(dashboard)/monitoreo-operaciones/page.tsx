'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { usePlanificacion } from '@/hooks/usePlanificacion';
import { useEncuestasPersonalizadas } from '@/hooks/useEncuestasPersonalizadas';
import { useKeywords } from '@/hooks/useKeywords';
import { 
  Play, 
  FileText, 
  Calendar,
  TrendingUp,
  Plus,
  Search,
  AlertTriangle
} from 'lucide-react';

export default function MonitoreoOperacionesPage() {
  const { hasPermission, getUserSucursales } = useRoleSystem();
  const { planificaciones, loadPlanificaciones } = usePlanificacion();
  const { disenos, loadDisenos, createRespuesta } = useEncuestasPersonalizadas();
  const { keywords, loadKeywords } = useKeywords();
  
  const [selectedSucursal, setSelectedSucursal] = useState<number | null>(null);

  useEffect(() => {
    const sucursales = getUserSucursales();
    if (sucursales.length > 0) {
      const sucursalId = sucursales[0].id_suc;
      setSelectedSucursal(sucursalId);
      loadPlanificaciones({ id_sucursal: sucursalId, estado: 'en_progreso' });
      loadDisenos(sucursalId);
      loadKeywords();
    }
  }, [getUserSucursales, loadPlanificaciones, loadDisenos, loadKeywords]);

  const estadisticasOperativas = [
    {
      titulo: 'Tareas Pendientes',
      valor: planificaciones.filter(p => p.estado === 'en_progreso').length,
      icono: Calendar,
      color: 'text-orange-600'
    },
    {
      titulo: 'Encuestas Activas',
      valor: disenos.filter(d => d.esta_activa).length,
      icono: FileText,
      color: 'text-blue-600'
    },
    {
      titulo: 'Keywords Monitoreadas',
      valor: keywords.length,
      icono: Search,
      color: 'text-green-600'
    },
    {
      titulo: 'Procesos Ejecutados',
      valor: 12,
      icono: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  const columnasPlanificaciones = [
    {
      key: 'titulo',
      label: 'Planificación',
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.tipo_trabajo}</div>
        </div>
      )
    },
    {
      key: 'progreso_porcentaje',
      label: 'Progreso',
      render: (value: number) => (
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${value}%` }} />
          </div>
          <span className="text-sm">{value}%</span>
        </div>
      )
    },
    {
      key: 'fecha_inicio',
      label: 'Fecha',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  if (!hasPermission('ejecutar_procesos')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Restringido</h3>
          <p className="text-gray-500">No tienes permisos para acceder a operaciones de monitoreo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operaciones de Monitoreo</h1>
          <p className="text-gray-600 mt-1">Panel de trabajo para uso frecuente de monitoreo</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Play className="h-4 w-4 mr-2" />
            Ejecutar Scraping
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Encuesta
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estadisticasOperativas.map((stat, index) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Planificaciones en Progreso</CardTitle>
            <CardDescription>Tareas asignadas y su estado actual</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={planificaciones.filter(p => p.estado === 'en_progreso')}
              columns={columnasPlanificaciones}
              emptyMessage="No hay planificaciones en progreso"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Operaciones frecuentes de monitoreo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Registrar Encuesta Manual
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Play className="h-4 w-4 mr-2" />
              Ejecutar Proceso de Scraping
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Generar Informe Diario
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Actualizar Planificación
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}