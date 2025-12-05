'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DataTable } from '@/components/shared/DataTable';
import { StatCard } from '@/components/shared/StatCard';
import { useAuth } from '@/hooks/useAuth';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Square,
  Eye,
  RefreshCw
} from 'lucide-react';

interface ProcesoActivo {
  id: string;
  nombre: string;
  tipo: 'scraping' | 'encuesta' | 'planificacion';
  estado: 'ejecutando' | 'pausado' | 'completado' | 'error';
  progreso: number;
  tiempo_inicio: string;
  tiempo_estimado?: number;
  detalles?: any;
}

interface Metrica {
  nombre: string;
  valor: number;
  cambio: number;
  tendencia: 'up' | 'down' | 'stable';
  icono: any;
  color: string;
}

interface Alerta {
  id: string;
  tipo: 'error' | 'warning' | 'info';
  mensaje: string;
  timestamp: string;
  proceso?: string;
  leida: boolean;
}

export function DashboardMonitoreo() {
  const { user } = useAuth();
  const [procesosActivos, setProcesosActivos] = useState<ProcesoActivo[]>([]);
  const [metricas, setMetricas] = useState<Metrica[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date());

  // Cargar datos del dashboard
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simular datos de procesos activos
      const procesosSimulados: ProcesoActivo[] = [
        {
          id: '1',
          nombre: 'Scraping Facebook - Política',
          tipo: 'scraping',
          estado: 'ejecutando',
          progreso: 65,
          tiempo_inicio: new Date(Date.now() - 300000).toISOString(),
          tiempo_estimado: 10,
          detalles: { fuente: 'Facebook', keywords: 5, resultados: 127 }
        },
        {
          id: '2',
          nombre: 'Encuesta USS - Sector Norte',
          tipo: 'encuesta',
          estado: 'ejecutando',
          progreso: 40,
          tiempo_inicio: new Date(Date.now() - 600000).toISOString(),
          tiempo_estimado: 25,
          detalles: { respuestas: 24, objetivo: 60 }
        }
      ];

      // Simular métricas
      const metricsSimuladas: Metrica[] = [
        {
          nombre: 'Procesos Activos',
          valor: procesosSimulados.filter(p => p.estado === 'ejecutando').length,
          cambio: 2,
          tendencia: 'up',
          icono: Activity,
          color: 'text-blue-600'
        },
        {
          nombre: 'Datos Recolectados',
          valor: 1247,
          cambio: 15.3,
          tendencia: 'up',
          icono: TrendingUp,
          color: 'text-green-600'
        },
        {
          nombre: 'Encuestas Completadas',
          valor: 89,
          cambio: -5.2,
          tendencia: 'down',
          icono: CheckCircle,
          color: 'text-purple-600'
        },
        {
          nombre: 'Alertas Pendientes',
          valor: 3,
          cambio: 0,
          tendencia: 'stable',
          icono: AlertTriangle,
          color: 'text-orange-600'
        }
      ];

      // Simular alertas
      const alertasSimuladas: Alerta[] = [
        {
          id: '1',
          tipo: 'warning',
          mensaje: 'Scraping tardando más de lo esperado',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          proceso: 'scraping-instagram',
          leida: false
        },
        {
          id: '2',
          tipo: 'info',
          mensaje: 'Nueva configuración activada',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          leida: false
        }
      ];

      setProcesosActivos(procesosSimulados);
      setMetricas(metricsSimuladas);
      setAlertas(alertasSimuladas);
      setUltimaActualizacion(new Date());
      
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 30000);
    return () => clearInterval(interval);
  }, [cargarDatos]);

  // Controlar proceso
  const controlarProceso = useCallback(async (procesoId: string, accion: 'play' | 'pause' | 'stop') => {
    setProcesosActivos(prev => prev.map(proceso => {
      if (proceso.id === procesoId) {
        switch (accion) {
          case 'play':
            return { ...proceso, estado: 'ejecutando' as const };
          case 'pause':
            return { ...proceso, estado: 'pausado' as const };
          case 'stop':
            return { ...proceso, estado: 'completado' as const };
          default:
            return proceso;
        }
      }
      return proceso;
    }));
  }, []);

  // Marcar alerta como leída
  const marcarAlertaLeida = useCallback((alertaId: string) => {
    setAlertas(prev => prev.map(alerta => 
      alerta.id === alertaId ? { ...alerta, leida: true } : alerta
    ));
  }, []);

  // Columnas para tabla de procesos
  const columnasProcesos = [
    {
      key: 'nombre',
      label: 'Proceso',
      render: (value: string, row: ProcesoActivo) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500 capitalize">{row.tipo}</div>
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value: string) => {
        const colores = {
          ejecutando: 'bg-green-100 text-green-800',
          pausado: 'bg-yellow-100 text-yellow-800',
          completado: 'bg-blue-100 text-blue-800',
          error: 'bg-red-100 text-red-800'
        };
        return (
          <Badge className={colores[value as keyof typeof colores]}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'progreso',
      label: 'Progreso',
      render: (value: number) => (
        <div className="flex items-center space-x-2">
          <Progress value={value} className="w-20" />
          <span className="text-sm">{value}%</span>
        </div>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: any, row: ProcesoActivo) => (
        <div className="flex space-x-1">
          {row.estado === 'ejecutando' ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => controlarProceso(row.id, 'pause')}
            >
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => controlarProceso(row.id, 'play')}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => controlarProceso(row.id, 'stop')}
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Monitoreo</h1>
          <p className="text-gray-600 mt-1">
            Monitoreo en tiempo real de procesos y métricas del sistema
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            Última actualización: {ultimaActualizacion.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            onClick={cargarDatos}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricas.map((metrica, index) => {
          const IconComponent = metrica.icono;
          
          return (
            <StatCard
              key={index}
              title={metrica.nombre}
              value={metrica.valor.toString()}
              icon={<IconComponent className="h-4 w-4" />}
              className={metrica.color}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Procesos Activos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Procesos Activos</span>
              </CardTitle>
              <CardDescription>
                Monitoreo en tiempo real de procesos en ejecución
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={procesosActivos}
                columns={columnasProcesos}
                emptyMessage="No hay procesos activos"
                searchable={false}
              />
            </CardContent>
          </Card>
        </div>

        {/* Panel de Alertas */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Alertas</span>
                </div>
                <Badge variant="outline">
                  {alertas.filter(a => !a.leida).length} nuevas
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alertas.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay alertas
                </p>
              ) : (
                alertas.map((alerta) => {
                  const iconos = {
                    error: <AlertTriangle className="h-4 w-4 text-red-500" />,
                    warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
                    info: <Activity className="h-4 w-4 text-blue-500" />
                  };

                  return (
                    <div
                      key={alerta.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        alerta.leida 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => marcarAlertaLeida(alerta.id)}
                    >
                      <div className="flex items-start space-x-2">
                        {iconos[alerta.tipo]}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${alerta.leida ? 'text-gray-600' : 'text-gray-900'}`}>
                            {alerta.mensaje}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(alerta.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        {!alerta.leida && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rendimiento del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento del Sistema</CardTitle>
          <CardDescription>Métricas de rendimiento en tiempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">CPU</span>
                <span className="text-sm">45%</span>
              </div>
              <Progress value={45} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Memoria</span>
                <span className="text-sm">62%</span>
              </div>
              <Progress value={62} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Red</span>
                <span className="text-sm">28%</span>
              </div>
              <Progress value={28} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}