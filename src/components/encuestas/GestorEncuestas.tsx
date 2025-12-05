'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { ConstructorEncuestas } from './ConstructorEncuestas';
import { VisualizadorEncuesta } from './VisualizadorEncuesta';
import { GestorAprobaciones } from './GestorAprobaciones';
import { useEncuestasPersonalizadas } from '@/hooks/useEncuestasPersonalizadas';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { useToast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Copy,
  Trash2,
  Play,
  BarChart3,
  Download,
  FileText,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield
} from 'lucide-react';

// Estados de encuesta según el ciclo de vida
const ESTADOS_ENCUESTA = [
  { value: 'borrador', label: 'Borrador', color: 'bg-gray-100 text-gray-800' },
  { value: 'revision', label: 'En Revisión', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'aprobacion', label: 'Pendiente Aprobación', color: 'bg-blue-100 text-blue-800' },
  { value: 'publicacion', label: 'Lista para Publicar', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'recoleccion', label: 'Recolectando Datos', color: 'bg-green-100 text-green-800' },
  { value: 'cierre', label: 'Cerrada', color: 'bg-orange-100 text-orange-800' },
  { value: 'validacion', label: 'En Validación', color: 'bg-teal-100 text-teal-800' },
  { value: 'informe_preliminar', label: 'Informe Preliminar', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'informe_final', label: 'Informe Final', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'archivo', label: 'Archivada', color: 'bg-gray-100 text-gray-600' }
];

type VistaActual = 'lista' | 'constructor' | 'realizacion' | 'preview' | 'resultados' | 'aprobaciones';

interface EstructuraEncuesta {
  titulo: string;
  descripcion?: string;
  secciones: any[];
  configuracion: {
    permitir_guardado_parcial: boolean;
    mostrar_progreso: boolean;
    tiempo_limite_minutos?: number;
    requiere_ubicacion: boolean;
  };
  estado?: string;
}

export function GestorEncuestas() {
  const { hasRole, getUserSucursales } = useRoleSystem();
  const { 
    disenos, 
    respuestas, 
    loading, 
    error,
    loadDisenos,
    loadRespuestas,
    createDiseno,
    createRespuesta,
    updateDiseno,
    actualizarEstadoEncuesta,
    exportarRespuestasCSV,
    clearError
  } = useEncuestasPersonalizadas();
  
  const { toast } = useToast();
  
  const [vistaActual, setVistaActual] = useState<VistaActual>('lista');
  const [encuestaSeleccionada, setEncuestaSeleccionada] = useState<any>(null);
  const [encuestaEditando, setEncuestaEditando] = useState<EstructuraEncuesta | null>(null);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
    tipo: ''
  });

  // Cargar datos iniciales
  useState(() => {
    const sucursales = getUserSucursales();
    if (sucursales.length > 0) {
      loadDisenos(sucursales[0].id_suc);
    }
  });

  // Manejar errores
  useState(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive'
      });
      clearError();
    }
  });

  // Crear nueva encuesta
  const crearNuevaEncuesta = useCallback(() => {
    setEncuestaEditando(null);
    setVistaActual('constructor');
  }, []);

  // Editar encuesta existente
  const editarEncuesta = useCallback((encuesta: any) => {
    setEncuestaEditando(encuesta.estructura_json);
    setEncuestaSeleccionada(encuesta);
    setVistaActual('constructor');
  }, []);

  // Realizar encuesta
  const realizarEncuesta = useCallback((encuesta: any) => {
    setEncuestaSeleccionada(encuesta);
    setVistaActual('realizacion');
  }, []);

  // Vista previa de encuesta
  const previsualizarEncuesta = useCallback((encuesta: any) => {
    setEncuestaSeleccionada(encuesta);
    setVistaActual('preview');
  }, []);

  // Ver resultados
  const verResultados = useCallback((encuesta: any) => {
    setEncuestaSeleccionada(encuesta);
    loadRespuestas(encuesta.id_diseno);
    setVistaActual('resultados');
  }, [loadRespuestas]);

  // Ver aprobaciones
  const verAprobaciones = useCallback((encuesta: any) => {
    setEncuestaSeleccionada(encuesta);
    setVistaActual('aprobaciones');
  }, []);

  // Guardar encuesta
  const guardarEncuesta = useCallback(async (estructura: EstructuraEncuesta) => {
    try {
      const sucursales = getUserSucursales();
      const sucursalId = sucursales[0]?.id_suc;

      if (encuestaSeleccionada) {
        // Actualizar encuesta existente
        await updateDiseno(encuestaSeleccionada.id_diseno, {
          titulo: estructura.titulo,
          descripcion: estructura.descripcion,
          estructura_json: estructura
        });
        toast({
          title: 'Éxito',
          description: 'Encuesta actualizada correctamente'
        });
      } else {
        // Crear nueva encuesta
        await createDiseno({
          titulo: estructura.titulo,
          descripcion: estructura.descripcion,
          tipo_encuesta: 'personalizada',
          id_sucursal: sucursalId,
          estructura_json: estructura
        });
        toast({
          title: 'Éxito',
          description: 'Encuesta creada correctamente'
        });
      }

      setVistaActual('lista');
      setEncuestaSeleccionada(null);
      setEncuestaEditando(null);
      
      // Recargar lista
      if (sucursalId) {
        loadDisenos(sucursalId);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al guardar la encuesta',
        variant: 'destructive'
      });
    }
  }, [encuestaSeleccionada, getUserSucursales, updateDiseno, createDiseno, toast, loadDisenos]);

  // Enviar respuesta de encuesta
  const enviarRespuesta = useCallback(async (respuestas: Record<string, any>, metadatos: any) => {
    try {
      await createRespuesta({
        id_diseno: encuestaSeleccionada.id_diseno,
        respuestas_json: respuestas,
        ubicacion_gps: metadatos.ubicacion_gps,
        duracion_minutos: metadatos.duracion_minutos,
        observaciones: metadatos.observaciones
      });

      toast({
        title: 'Éxito',
        description: 'Encuesta completada correctamente'
      });

      setVistaActual('lista');
      setEncuestaSeleccionada(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al enviar la encuesta',
        variant: 'destructive'
      });
    }
  }, [encuestaSeleccionada, createRespuesta, toast]);

  // Exportar resultados
  const exportarResultados = useCallback((encuesta: any) => {
    try {
      exportarRespuestasCSV(encuesta.id_diseno);
      toast({
        title: 'Éxito',
        description: 'Resultados exportados correctamente'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al exportar resultados',
        variant: 'destructive'
      });
    }
  }, [exportarRespuestasCSV, toast]);

  // Columnas para la tabla de encuestas
  const columnasEncuestas = [
    {
      key: 'titulo',
      label: 'Encuesta',
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.tipo_encuesta}</div>
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value: string, row: any) => {
        const estadoValue = row.estado || 'borrador';
        const estado = ESTADOS_ENCUESTA.find(e => e.value === estadoValue) || ESTADOS_ENCUESTA[0];
        return (
          <Badge className={estado.color}>
            {estado.label}
          </Badge>
        );
      }
    },
    {
      key: 'total_respuestas',
      label: 'Respuestas',
      render: (value: number = 0) => (
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'creado_en',
      label: 'Creada',
      render: (value: string) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: any, row: any) => (
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => previsualizarEncuesta(row)}
            title="Vista previa"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {hasRole('gerente') && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => editarEncuesta(row)}
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => realizarEncuesta(row)}
            title="Realizar encuesta"
          >
            <Play className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => verResultados(row)}
            title="Ver resultados"
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => verAprobaciones(row)}
            title="Gestionar aprobaciones"
          >
            <Shield className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  // Filtrar encuestas
  const encuestasFiltradas = disenos.filter(encuesta => {
    const coincideBusqueda = !filtros.busqueda || 
      encuesta.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      encuesta.descripcion?.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    const estadoEncuesta = encuesta.estado || 'borrador';
    const coincideEstado = !filtros.estado || estadoEncuesta === filtros.estado;
    const coincideTipo = !filtros.tipo || encuesta.tipo_encuesta === filtros.tipo;
    
    return coincideBusqueda && coincideEstado && coincideTipo;
  });

  // Renderizar vista actual
  const renderizarVistaActual = () => {
    switch (vistaActual) {
      case 'constructor':
        return (
          <ConstructorEncuestas
            encuestaInicial={encuestaEditando || undefined}
            onGuardar={guardarEncuesta}
            onPreview={(encuesta) => {
              setEncuestaEditando(encuesta);
              setVistaActual('preview');
            }}
            loading={loading}
          />
        );

      case 'realizacion':
        return encuestaSeleccionada ? (
          <VisualizadorEncuesta
            encuesta={encuestaSeleccionada.estructura_json}
            onSubmit={enviarRespuesta}
            onCancelar={() => setVistaActual('lista')}
            loading={loading}
          />
        ) : null;

      case 'preview':
        return encuestaEditando ? (
          <VisualizadorEncuesta
            encuesta={encuestaEditando}
            onSubmit={() => {}}
            onCancelar={() => setVistaActual(encuestaSeleccionada ? 'constructor' : 'lista')}
            modoPreview={true}
          />
        ) : null;

      case 'resultados':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Resultados: {encuestaSeleccionada?.titulo}</h2>
                <p className="text-gray-600">Análisis de respuestas recolectadas</p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => exportarResultados(encuestaSeleccionada)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setVistaActual('lista')}
                >
                  Volver
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Total Respuestas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {respuestas.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Completadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {respuestas.filter(r => r.estado === 'completada').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Tasa de Completado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {respuestas.length > 0 
                      ? Math.round((respuestas.filter(r => r.estado === 'completada').length / respuestas.length) * 100)
                      : 0}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Aquí se pueden agregar más visualizaciones de resultados */}
          </div>
        );

      case 'aprobaciones':
        return encuestaSeleccionada ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Aprobaciones: {encuestaSeleccionada.titulo}</h2>
                <p className="text-gray-600">Gestión del ciclo de vida y aprobaciones</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setVistaActual('lista')}
              >
                Volver
              </Button>
            </div>

            <GestorAprobaciones
              encuesta={encuestaSeleccionada}
              onEstadoActualizado={() => {
                // Recargar datos después de actualizar estado
                const sucursales = getUserSucursales();
                if (sucursales.length > 0) {
                  loadDisenos(sucursales[0].id_suc);
                }
              }}
            />
          </div>
        ) : null;

      default:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Encuestas</h1>
                <p className="text-gray-600 mt-1">Diseña, administra y analiza encuestas personalizadas</p>
              </div>
              {hasRole('gerente') && (
                <Button onClick={crearNuevaEncuesta}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Encuesta
                </Button>
              )}
            </div>

            {/* Filtros */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar encuestas..."
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
                    {ESTADOS_ENCUESTA.map(estado => (
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
                    <option value="uss">Encuesta USS</option>
                    <option value="pss">Encuesta PSS</option>
                    <option value="personalizada">Personalizada</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold">{disenos.length}</div>
                      <div className="text-sm text-gray-600">Total Encuestas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {disenos.filter(d => d.esta_activa).length}
                      </div>
                      <div className="text-sm text-gray-600">Activas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {disenos.reduce((total, d) => total + (d.total_respuestas || 0), 0)}
                      </div>
                      <div className="text-sm text-gray-600">Respuestas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-8 w-8 text-orange-600" />
                    <div>
                      <div className="text-2xl font-bold">
                        {disenos.filter(d => d.creado_en && 
                          new Date(d.creado_en).toDateString() === new Date().toDateString()
                        ).length}
                      </div>
                      <div className="text-sm text-gray-600">Hoy</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabla de encuestas */}
            <Card>
              <CardHeader>
                <CardTitle>Encuestas Disponibles</CardTitle>
                <CardDescription>
                  Gestiona y administra todas las encuestas del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={encuestasFiltradas}
                  columns={columnasEncuestas}
                  searchable={false}
                  emptyMessage="No se encontraron encuestas"
                />
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return renderizarVistaActual();
}