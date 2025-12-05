'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { usePlanificacion } from '@/hooks/usePlanificacion';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { useToast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Search, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Edit,
  Trash2
} from 'lucide-react';

const ESTADOS_PLANIFICACION = [
  { value: 'borrador', label: 'Borrador', color: 'bg-gray-100 text-gray-800' },
  { value: 'en_progreso', label: 'En Progreso', color: 'bg-blue-100 text-blue-800' },
  { value: 'completada', label: 'Completada', color: 'bg-green-100 text-green-800' },
  { value: 'cancelada', label: 'Cancelada', color: 'bg-red-100 text-red-800' }
];

export function GestorPlanificaciones() {
  const { hasRole, getUserSucursales } = useRoleSystem();
  const { 
    planificaciones, 
    cargando, 
    error,
    loadPlanificaciones,
    createPlanificacion,
    updatePlanificacion,
    deletePlanificacion
  } = usePlanificacion();
  
  const { toast } = useToast();
  
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
    tipo: ''
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [planificacionEditando, setPlanificacionEditando] = useState<any>(null);

  useEffect(() => {
    const sucursales = getUserSucursales();
    if (sucursales.length > 0) {
      loadPlanificaciones({ id_sucursal: sucursales[0].id_suc });
    }
  }, [getUserSucursales, loadPlanificaciones]);

  // Manejar errores
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive'
      });
    }
  }, [error, toast]);

  const planificacionesFiltradas = planificaciones.filter(plan => {
    const titulo = plan.titulo || plan.nombre || '';
    const descripcion = plan.descripcion || '';
    const coincideBusqueda = !filtros.busqueda || 
      titulo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    const coincideEstado = !filtros.estado || plan.estado === filtros.estado;
    const coincideTipo = !filtros.tipo || plan.tipo_trabajo === filtros.tipo;
    
    return coincideBusqueda && coincideEstado && coincideTipo;
  });

  const columnasPlanificaciones = [
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
      key: 'estado',
      label: 'Estado',
      render: (value: string) => {
        const estadoInfo = ESTADOS_PLANIFICACION.find(e => e.value === value);
        return (
          <Badge className={estadoInfo?.color}>
            {estadoInfo?.label || value}
          </Badge>
        );
      }
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
      label: 'Fecha Inicio',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'fecha_fin',
      label: 'Fecha Fin',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'responsable_nombre',
      label: 'Responsable',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (value: any, row: any) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPlanificacionEditando(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {hasRole('gerente') && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEliminarPlanificacion(row.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const handleCrearPlanificacion = async (datos: any) => {
    try {
      const sucursales = getUserSucursales();
      await createPlanificacion({
        ...datos,
        id_sucursal: sucursales[0].id_suc
      });
      toast({
        title: 'Éxito',
        description: 'Planificación creada correctamente'
      });
      setMostrarFormulario(false);
      // Recargar planificaciones
      loadPlanificaciones({ id_sucursal: sucursales[0].id_suc });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al crear planificación',
        variant: 'destructive'
      });
    }
  };

  const handleActualizarPlanificacion = async (id: number, datos: any) => {
    try {
      await updatePlanificacion(id, datos);
      toast({
        title: 'Éxito',
        description: 'Planificación actualizada correctamente'
      });
      setPlanificacionEditando(null);
      const sucursales = getUserSucursales();
      loadPlanificaciones({ id_sucursal: sucursales[0].id_suc });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al actualizar planificación',
        variant: 'destructive'
      });
    }
  };

  const handleEliminarPlanificacion = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta planificación?')) return;
    
    try {
      await deletePlanificacion(id);
      toast({
        title: 'Éxito',
        description: 'Planificación eliminada correctamente'
      });
      const sucursales = getUserSucursales();
      loadPlanificaciones({ id_sucursal: sucursales[0].id_suc });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al eliminar planificación',
        variant: 'destructive'
      });
    }
  };

  const estadisticasPlanificaciones = [
    {
      titulo: 'Total Planificaciones',
      valor: planificaciones.length,
      icono: Calendar,
      color: 'text-blue-600'
    },
    {
      titulo: 'En Progreso',
      valor: planificaciones.filter(p => p.estado === 'en_progreso').length,
      icono: Clock,
      color: 'text-orange-600'
    },
    {
      titulo: 'Completadas',
      valor: planificaciones.filter(p => p.estado === 'completada').length,
      icono: CheckCircle,
      color: 'text-green-600'
    },
    {
      titulo: 'Tasa de Éxito',
      valor: planificaciones.length > 0 
        ? Math.round((planificaciones.filter(p => p.estado === 'completada').length / planificaciones.length) * 100)
        : 0,
      icono: BarChart3,
      color: 'text-purple-600',
      sufijo: '%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Planificaciones</h1>
          <p className="text-gray-600 mt-1">Planificación y seguimiento de trabajos de monitoreo</p>
        </div>
        {hasRole('gerente') && (
          <Button onClick={() => setMostrarFormulario(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Planificación
          </Button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estadisticasPlanificaciones.map((stat, index) => {
          const IconComponent = stat.icono;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <IconComponent className={`h-8 w-8 ${stat.color}`} />
                  <div>
                    <div className="text-2xl font-bold">
                      {stat.valor}{stat.sufijo || ''}
                    </div>
                    <div className="text-sm text-gray-600">{stat.titulo}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar planificaciones..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              {ESTADOS_PLANIFICACION.map(estado => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
            
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              <option value="encuestas">Encuestas</option>
              <option value="scraping">Scraping</option>
              <option value="monitoreo">Monitoreo</option>
              <option value="reportes">Reportes</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de planificaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Planificaciones de Trabajo</CardTitle>
          <CardDescription>
            Lista completa de planificaciones y su estado de avance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={planificacionesFiltradas}
            columns={columnasPlanificaciones}
            loading={cargando}
            emptyMessage="No se encontraron planificaciones"
          />
        </CardContent>
      </Card>

      {/* Formulario de creación/edición (placeholder por ahora) */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nueva Planificación</CardTitle>
            <CardDescription>
              Complete los detalles de la nueva planificación de trabajo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-600">Formulario de planificación en desarrollo</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setMostrarFormulario(false)}
              >
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {planificacionEditando && (
        <Card>
          <CardHeader>
            <CardTitle>Editar Planificación</CardTitle>
            <CardDescription>
              Modificar los detalles de la planificación seleccionada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-600">Formulario de edición en desarrollo</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setPlanificacionEditando(null)}
              >
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
