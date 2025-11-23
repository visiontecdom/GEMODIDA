'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { useEncuestasPersonalizadas } from '@/hooks/useEncuestasPersonalizadas';
import { 
  FileText, 
  Plus, 
  Users,
  BarChart3,
  Download,
  AlertTriangle
} from 'lucide-react';

export default function MonitoreoEncuestasPage() {
  const { hasRole, getUserSucursales } = useRoleSystem();
  const { disenos, respuestas, loadDisenos, loadRespuestas, getEstadisticasEncuesta } = useEncuestasPersonalizadas();
  
  const [selectedSucursal, setSelectedSucursal] = useState<number | null>(null);

  useEffect(() => {
    const sucursales = getUserSucursales();
    if (sucursales.length > 0) {
      const sucursalId = sucursales[0].id_suc;
      setSelectedSucursal(sucursalId);
      loadDisenos(sucursalId);
    }
  }, [getUserSucursales, loadDisenos]);

  const estadisticasEncuestas = [
    {
      titulo: 'Encuestas Diseñadas',
      valor: disenos.length,
      icono: FileText,
      color: 'text-blue-600'
    },
    {
      titulo: 'Respuestas Totales',
      valor: respuestas.length,
      icono: Users,
      color: 'text-green-600'
    },
    {
      titulo: 'Encuestas Activas',
      valor: disenos.filter(d => d.esta_activa).length,
      icono: BarChart3,
      color: 'text-purple-600'
    },
    {
      titulo: 'Completadas Hoy',
      valor: respuestas.filter(r => 
        new Date(r.fecha_encuesta).toDateString() === new Date().toDateString()
      ).length,
      icono: Download,
      color: 'text-orange-600'
    }
  ];

  const columnasDisenos = [
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
      key: 'esta_activa',
      label: 'Estado',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Activa' : 'Inactiva'}
        </Badge>
      )
    },
    {
      key: 'total_respuestas',
      label: 'Respuestas',
      render: (value: number = 0) => value
    },
    {
      key: 'creado_en',
      label: 'Creada',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: any, row: any) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">Ver</Button>
          <Button size="sm" variant="outline">Realizar</Button>
        </div>
      )
    }
  ];

  if (!hasRole('encuestador') && !hasRole('gerente')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Restringido</h3>
          <p className="text-gray-500">No tienes permisos para acceder al módulo de encuestas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Encuestas de Monitoreo</h1>
          <p className="text-gray-600 mt-1">Crear y registrar encuestas y sondeos de datos</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Resultados
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Diseñar Encuesta
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estadisticasEncuestas.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.titulo}
            value={stat.valor.toString()}
            icon={<stat.icono className="h-6 w-6" />}
            className={stat.color}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Encuestas Disponibles</CardTitle>
          <CardDescription>Gestión de encuestas y sondeos del departamento</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={disenos}
            columns={columnasDisenos}
            searchable
            searchPlaceholder="Buscar encuestas..."
            emptyMessage="No hay encuestas diseñadas"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Encuestas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Encuesta USS
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Encuesta PSS
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Encuesta Personalizada
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Realizar Encuesta
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              Ver Resultados
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Generar Reporte
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tasa de Respuesta</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tiempo Promedio</span>
                <span className="font-medium">12 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Satisfacción</span>
                <span className="font-medium">4.2/5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
