'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';
import { FormDialog } from '@/components/shared/FormDialog';
import { ChartCard } from '@/components/shared/ChartCard';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { createClient } from '@supabase/supabase-js';
import { FileText, Plus, ArrowLeft, Download, BarChart3, TrendingUp, Calendar } from 'lucide-react';

interface Reporte {
  id_reporte: string;
  titulo: string;
  tipo_reporte: string;
  estado: string;
  fecha_solicitud: string;
  fecha_completado: string;
}

export default function InformesMonitoreoPage() {
  const router = useRouter();
  const { userPermissions, getUserSucursales } = useRoleSystem();
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadReportes = async () => {
    try {
      setLoading(true);
      
      // Usar consulta directa a la tabla reportes
      const { data, error } = await supabase
        .from('reportes')
        .select('*')
        .order('fecha_solicitud', { ascending: false })
        .limit(50);

      if (error) throw error;
      setReportes(data || []);
    } catch (error) {
      console.error('Error loading reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEstadisticas = async () => {
    try {
      const sucursales = getUserSucursales();
      const sucursalId = sucursales.length > 0 ? sucursales[0].id_suc : null;
      const fechaInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const fechaFin = new Date().toISOString().split('T')[0];

      if (sucursalId) {
        // Obtener estadísticas directamente de las tablas
        const [planificacionesRes, actividadesRes, usuariosRes] = await Promise.all([
          supabase
            .from('planificacion_trabajos')
            .select('estado')
            .eq('id_sucursal', sucursalId)
            .gte('fecha_inicio', fechaInicio)
            .lte('fecha_inicio', fechaFin),
          supabase
            .from('actividad_matriz')
            .select('estado_actividad')
            .eq('id_sucursal', sucursalId)
            .gte('fecha', fechaInicio)
            .lte('fecha', fechaFin),
          supabase
            .from('usuarios')
            .select('ultimo_acceso')
            .gte('ultimo_acceso', fechaInicio)
        ]);

        const planificaciones = planificacionesRes.data || [];
        const actividades = actividadesRes.data || [];
        const usuarios = usuariosRes.data || [];

        const estadisticasCalculadas = {
          planificaciones: {
            total: planificaciones.length,
            completadas: planificaciones.filter(p => p.estado === 'completado').length,
            en_progreso: planificaciones.filter(p => p.estado === 'en_progreso').length,
            planificadas: planificaciones.filter(p => p.estado === 'planificado').length
          },
          actividades: {
            total: actividades.length,
            completadas: actividades.filter(a => a.estado_actividad === 'completada').length,
            en_progreso: actividades.filter(a => a.estado_actividad === 'en_progreso').length
          },
          usuarios_activos: usuarios.length
        };

        setEstadisticas(estadisticasCalculadas);
      }
    } catch (error) {
      console.error('Error loading estadisticas:', error);
    }
  };

  useEffect(() => {
    loadReportes();
    loadEstadisticas();
  }, []);

  const columnas = [
    {
      key: 'titulo',
      label: 'Reporte',
      render: (value: string, row: Reporte) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.tipo_reporte}</div>
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value: string) => (
        <Badge variant={
          value === 'completado' ? 'default' :
          value === 'en_proceso' ? 'secondary' :
          value === 'error' ? 'destructive' : 'outline'
        }>
          {value === 'completado' ? 'Completado' :
           value === 'en_proceso' ? 'En Proceso' :
           value === 'error' ? 'Error' : 'Pendiente'}
        </Badge>
      )
    },
    {
      key: 'fecha_solicitud',
      label: 'Fecha Solicitud',
      render: (value: string) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'fecha_completado',
      label: 'Fecha Completado',
      render: (value: string) => value ? (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-green-400" />
          {new Date(value).toLocaleDateString()}
        </div>
      ) : '-'
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (value: any, row: Reporte) => (
        <div className="flex space-x-2">
          {row.estado === 'completado' && (
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Descargar
            </Button>
          )}
        </div>
      )
    }
  ];

  const filtros = [
    {
      key: 'tipo_reporte',
      label: 'Tipo de Reporte',
      type: 'select' as const,
      options: [
        { value: 'general', label: 'General' },
        { value: 'estadistico', label: 'Estadístico' },
        { value: 'monitoreo', label: 'Monitoreo' },
        { value: 'palabras_clave', label: 'Palabras Clave' }
      ]
    },
    {
      key: 'estado',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { value: 'completado', label: 'Completado' },
        { value: 'en_proceso', label: 'En Proceso' },
        { value: 'error', label: 'Error' }
      ]
    }
  ];

  const handleCreateReporte = async (formData: any) => {
    try {
      // Usar la función RPC existente generar_reporte
      const { data, error } = await supabase.rpc('generar_reporte', {
        p_titulo: formData.titulo,
        p_descripcion: `Reporte de ${formData.tipo_reporte} generado automáticamente`,
        p_tipo_reporte: formData.tipo_reporte,
        p_parametros: {
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin,
          sucursal_id: getUserSucursales()[0]?.id_suc
        },
        p_id_usuario_solicitante: userPermissions?.usuario?.id
      });

      if (error) throw error;
      
      await loadReportes();
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating reporte:', error);
      alert('Error al crear reporte: ' + (error as Error).message);
    }
  };

  const createReporteFields = [
    {
      name: 'titulo',
      label: 'Título del Reporte',
      type: 'text' as const,
      required: true,
      placeholder: 'Ej: Reporte Mensual de Monitoreo'
    },
    {
      name: 'tipo_reporte',
      label: 'Tipo de Reporte',
      type: 'select' as const,
      options: [
        { value: 'general', label: 'Reporte General' },
        { value: 'estadistico', label: 'Reporte Estadístico' },
        { value: 'monitoreo', label: 'Reporte de Monitoreo' },
        { value: 'palabras_clave', label: 'Reporte de Palabras Clave' }
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
      label: 'Fecha de Fin',
      type: 'text' as const,
      required: true,
      placeholder: 'YYYY-MM-DD'
    }
  ];

  // Datos para gráficos
  const chartDataPlanificaciones = estadisticas?.planificaciones ? [
    { name: 'Completadas', value: estadisticas.planificaciones.completadas },
    { name: 'En Progreso', value: estadisticas.planificaciones.en_progreso },
    { name: 'Planificadas', value: estadisticas.planificaciones.planificadas }
  ] : [];

  const chartDataActividades = estadisticas?.actividades ? [
    { name: 'Completadas', value: estadisticas.actividades.completadas },
    { name: 'En Progreso', value: estadisticas.actividades.en_progreso }
  ] : [];

  // Verificar permisos según la lógica de negocio
  const hasAccess = ['gerente', 'admin', 'super_user', 'desarrollador'].some(role => 
    userPermissions?.asignaciones?.some(a => a.rol?.codigo_rol === role)
  );

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acceso Restringido
          </h3>
          <p className="text-gray-500">
            No tienes permisos para generar informes estadísticos.
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
              Informes Estadísticos - Monitoreo
            </h1>
            <p className="text-gray-600">
              Diseñar y producir informes estadísticos de monitoreo
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generar Reporte
        </Button>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reportes</p>
                <p className="text-2xl font-bold">{reportes.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completados</p>
                <p className="text-2xl font-bold">
                  {reportes.filter(r => r.estado === 'completado').length}
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
                <p className="text-sm text-gray-600">En Proceso</p>
                <p className="text-2xl font-bold">
                  {reportes.filter(r => r.estado === 'en_proceso').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold">
                  {estadisticas?.usuarios_activos || 0}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Estadísticos */}
      {estadisticas && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Estado de Planificaciones"
            description="Distribución del estado de las planificaciones"
            type="pie"
            data={chartDataPlanificaciones}
            dataKey="value"
            nameKey="name"
          />
          <ChartCard
            title="Progreso de Actividades"
            description="Estado actual de las actividades de monitoreo"
            type="bar"
            data={chartDataActividades}
            dataKey="value"
            nameKey="name"
          />
        </div>
      )}

      {/* Tabla de Reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FilterBar
              filters={filtros}
              onFilterChange={loadReportes}
            />
            <DataTable
              data={reportes}
              columns={columnas}
              loading={loading}
              searchable
              searchPlaceholder="Buscar reportes..."
              emptyMessage="No hay reportes generados"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialog para crear reporte */}
      <FormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        title="Generar Nuevo Reporte"
        description="Crear un nuevo reporte estadístico de monitoreo"
        fields={createReporteFields}
        onSubmit={handleCreateReporte}
      />
    </div>
  );
}