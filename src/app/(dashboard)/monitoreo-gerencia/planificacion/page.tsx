'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';
import { FormDialog } from '@/components/shared/FormDialog';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { usePlanificacion } from '@/hooks/usePlanificacion';
import { Calendar, Plus, ArrowLeft, Clock, User, DollarSign } from 'lucide-react';

export default function PlanificacionMonitoreoPage() {
  const router = useRouter();
  const { userPermissions, hasPermission, getUserSucursales } = useRoleSystem();
  const { planificaciones, cargando, loadPlanificaciones, createPlanificacion } = usePlanificacion();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    const sucursales = getUserSucursales();
    if (sucursales.length > 0) {
      loadPlanificaciones({ id_sucursal: sucursales[0].id_suc });
    }
  }, [getUserSucursales, loadPlanificaciones]);

  const columnas = [
    {
      key: 'titulo',
      label: 'Planificación',
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium">{value || row.nombre || 'Sin título'}</div>
          <div className="text-sm text-gray-500">{row.tipo_trabajo}</div>
        </div>
      )
    },
    {
      key: 'responsable_nombre',
      label: 'Responsable',
      render: (value: string) => (
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-gray-400" />
          {value || 'Sin asignar'}
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
          {value === 'completado' ? 'Completado' :
           value === 'en_progreso' ? 'En Progreso' :
           value === 'planificado' ? 'Planificado' : 'Cancelado'}
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
      render: (value: string) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'presupuesto_estimado',
      label: 'Presupuesto',
      render: (value: number) => value ? (
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
          {value.toLocaleString()}
        </div>
      ) : '-'
    }
  ];

  const filtros = [
    {
      key: 'tipo_trabajo',
      label: 'Tipo de Trabajo',
      type: 'select' as const,
      options: [
        { value: 'monitoreo', label: 'Monitoreo' },
        { value: 'encuesta', label: 'Encuesta' },
        { value: 'investigacion', label: 'Investigación' },
        { value: 'scraping', label: 'Scraping' }
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

  const handleCreatePlanificacion = async (formData: any) => {
    try {
      const sucursales = getUserSucursales();
      const sucursalId = sucursales.length > 0 ? sucursales[0].id_suc : 1;
      
      await createPlanificacion({
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo_trabajo: formData.tipo_trabajo,
        id_sucursal: sucursalId,
        id_responsable: formData.id_responsable || userPermissions?.usuario?.id || '',
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        presupuesto_estimado: formData.presupuesto_estimado ? parseFloat(formData.presupuesto_estimado) : undefined,
        creado_por: userPermissions?.usuario?.id || ''
      });
      
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating planificacion:', error);
    }
  };

  const createPlanificacionFields = [
    {
      name: 'titulo',
      label: 'Título de la Planificación',
      type: 'text' as const,
      required: true
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea' as const,
      required: true
    },
    {
      name: 'tipo_trabajo',
      label: 'Tipo de Trabajo',
      type: 'select' as const,
      options: [
        { value: 'monitoreo', label: 'Monitoreo General' },
        { value: 'encuesta', label: 'Encuesta' },
        { value: 'investigacion', label: 'Investigación' },
        { value: 'scraping', label: 'Scraping de Datos' }
      ],
      required: true
    },
    {
      name: 'fecha_inicio',
      label: 'Fecha de Inicio',
      type: 'text' as const,
      required: true,
      placeholder: 'YYYY-MM-DD'
    },
    {
      name: 'fecha_fin',
      label: 'Fecha de Finalización',
      type: 'text' as const,
      placeholder: 'YYYY-MM-DD'
    },
    {
      name: 'presupuesto_estimado',
      label: 'Presupuesto Estimado',
      type: 'number' as const
    }
  ];

  // Verificar permisos según la lógica de negocio
  const hasAccess = ['gerente', 'admin', 'super_user', 'desarrollador'].some(role => 
    userPermissions?.asignaciones?.some(a => a.rol?.codigo_rol === role)
  );

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acceso Restringido
          </h3>
          <p className="text-gray-500">
            No tienes permisos para gestionar planificaciones.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/monitoreo-gerencia')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Panel
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Planificación de Trabajos - Monitoreo
            </h1>
            <p className="text-gray-600">
              Planificar trabajos y asignar tareas a usuarios de monitoreo
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Planificación
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Planificaciones</p>
                <p className="text-2xl font-bold">{planificaciones.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold">
                  {planificaciones.filter(p => p.estado === 'en_progreso').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold">
                  {planificaciones.filter(p => p.estado === 'completado').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Presupuesto Total</p>
                <p className="text-2xl font-bold">
                  ${planificaciones.reduce((sum, p) => sum + (p.presupuesto_estimado || 0), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Planificaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Planificaciones de Trabajo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FilterBar
              filters={filtros}
              onFilterChange={(filters) => loadPlanificaciones(filters)}
            />
            <DataTable
              data={planificaciones}
              columns={columnas}
              loading={cargando}
              searchable
              searchPlaceholder="Buscar planificaciones..."
              emptyMessage="No hay planificaciones registradas"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialog para crear planificación */}
      <FormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        title="Nueva Planificación de Trabajo"
        description="Crear una nueva planificación para el departamento de monitoreo"
        fields={createPlanificacionFields}
        onSubmit={handleCreatePlanificacion}
      />
    </div>
  );
}
