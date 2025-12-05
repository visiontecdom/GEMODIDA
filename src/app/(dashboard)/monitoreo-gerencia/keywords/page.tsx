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
import { createClient } from '@supabase/supabase-js';
import { Search, Plus, ArrowLeft, TrendingUp, Calendar, BarChart3 } from 'lucide-react';

interface PalabraClave {
  id_palabra: number;
  palabra: string;
  descripcion: string;
  total_resultados: number;
  resultados_hoy: number;
  ultimo_resultado: string;
  sentimiento_promedio: number;
  es_publica: boolean;
  fecha_creacion: string;
}

export default function KeywordsMonitoreoPage() {
  const router = useRouter();
  const { userPermissions, hasPermission } = useRoleSystem();
  const [palabrasClave, setPalabrasClave] = useState<PalabraClave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadPalabrasClave = async (filters: any = {}) => {
    try {
      setLoading(true);
      
      // Usar consulta directa con join para obtener estadísticas reales
      let query = supabase
        .from('palabras_clave')
        .select(`
          id_palabra,
          palabra,
          descripcion,
          es_publica,
          fecha_creacion,
          resultados:resultados(count)
        `)
        .order('fecha_creacion', { ascending: false })
        .limit(50);

      // Aplicar filtros
      if (filters.es_publica !== undefined) {
        query = query.eq('es_publica', filters.es_publica === 'true');
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transformar datos para incluir estadísticas
      const transformedData = await Promise.all((data || []).map(async (palabra) => {
        // Obtener conteo de resultados
        const { count: totalResultados } = await supabase
          .from('resultados')
          .select('*', { count: 'exact', head: true })
          .eq('id_palabra', palabra.id_palabra);
          
        // Obtener resultados de hoy
        const { count: resultadosHoy } = await supabase
          .from('resultados')
          .select('*', { count: 'exact', head: true })
          .eq('id_palabra', palabra.id_palabra)
          .gte('fecha_publicacion', new Date().toISOString().split('T')[0]);
          
        // Obtener último resultado
        const { data: ultimoResultado } = await supabase
          .from('resultados')
          .select('fecha_publicacion')
          .eq('id_palabra', palabra.id_palabra)
          .order('fecha_publicacion', { ascending: false })
          .limit(1)
          .single();
          
        // Calcular sentimiento promedio
        const { data: sentimientos } = await supabase
          .from('resultados')
          .select('sentimiento')
          .eq('id_palabra', palabra.id_palabra)
          .not('sentimiento', 'is', null);
          
        let sentimientoPromedio = 0;
        if (sentimientos && sentimientos.length > 0) {
          const valores = sentimientos.map(s => {
            if (s.sentimiento === 'positivo') return 1;
            if (s.sentimiento === 'negativo') return -1;
            return 0;
          });
          const suma = valores.reduce((a: number, b: number) => a + b, 0);
          sentimientoPromedio = suma / valores.length;
        }

        return {
          id_palabra: palabra.id_palabra,
          palabra: palabra.palabra,
          descripcion: palabra.descripcion || '',
          total_resultados: totalResultados || 0,
          resultados_hoy: resultadosHoy || 0,
          ultimo_resultado: ultimoResultado?.fecha_publicacion || '',
          sentimiento_promedio: sentimientoPromedio,
          es_publica: palabra.es_publica,
          fecha_creacion: palabra.fecha_creacion
        };
      }));
      
      setPalabrasClave(transformedData);
    } catch (error) {
      console.error('Error loading palabras clave:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPalabrasClave();
  }, []);

  const columnas = [
    {
      key: 'palabra',
      label: 'Palabra Clave',
      render: (value: string, row: PalabraClave) => (
        <div>
          <div className="font-medium flex items-center">
            <Search className="h-4 w-4 mr-2 text-blue-600" />
            {value}
          </div>
          <div className="text-sm text-gray-500 mt-1">{row.descripcion}</div>
        </div>
      )
    },
    {
      key: 'total_resultados',
      label: 'Resultados',
      render: (value: number, row: PalabraClave) => (
        <div>
          <div className="font-medium">{value.toLocaleString()}</div>
          <div className="text-sm text-green-600">
            +{row.resultados_hoy} hoy
          </div>
        </div>
      )
    },
    {
      key: 'sentimiento_promedio',
      label: 'Sentimiento',
      render: (value: number) => {
        const getSentimentColor = (sentiment: number) => {
          if (sentiment > 0.3) return 'text-green-600 bg-green-100';
          if (sentiment < -0.3) return 'text-red-600 bg-red-100';
          return 'text-gray-600 bg-gray-100';
        };
        
        const getSentimentText = (sentiment: number) => {
          if (sentiment > 0.3) return 'Positivo';
          if (sentiment < -0.3) return 'Negativo';
          return 'Neutro';
        };

        return (
          <Badge className={getSentimentColor(value)}>
            {getSentimentText(value)} ({value?.toFixed(2) || '0.00'})
          </Badge>
        );
      }
    },
    {
      key: 'ultimo_resultado',
      label: 'Último Resultado',
      render: (value: string) => value ? (
        <div className="flex items-center text-sm">
          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
          {new Date(value).toLocaleDateString()}
        </div>
      ) : 'Sin resultados'
    },
    {
      key: 'es_publica',
      label: 'Visibilidad',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'outline'}>
          {value ? 'Pública' : 'Privada'}
        </Badge>
      )
    },
    {
      key: 'fecha_creacion',
      label: 'Creada',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const filtros = [
    {
      key: 'es_publica',
      label: 'Visibilidad',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'Pública' },
        { value: 'false', label: 'Privada' }
      ]
    },
    {
      key: 'con_resultados',
      label: 'Con Resultados',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'Con resultados' },
        { value: 'false', label: 'Sin resultados' }
      ]
    }
  ];

  const handleCreateKeyword = async (formData: any) => {
    try {
      const { error } = await supabase.from('palabras_clave').insert([{
        palabra: formData.palabra,
        descripcion: formData.descripcion,
        es_publica: formData.es_publica === 'true',
        id_usuario_creador: userPermissions?.usuario?.id,
        fecha_creacion: new Date().toISOString()
      }]);

      if (error) throw error;
      
      await loadPalabrasClave();
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating keyword:', error);
    }
  };

  const createKeywordFields = [
    {
      name: 'palabra',
      label: 'Palabra o Frase Clave',
      type: 'text' as const,
      required: true,
      placeholder: 'Ej: seguridad social, ARS, DIDA'
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Describe el propósito de esta palabra clave...'
    },
    {
      name: 'es_publica',
      label: 'Visibilidad',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'Pública - Visible para todos' },
        { value: 'false', label: 'Privada - Solo para mi sucursal' }
      ],
      required: true
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
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acceso Restringido
          </h3>
          <p className="text-gray-500">
            No tienes permisos para gestionar palabras clave.
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
              Gestión de Palabras Clave - Monitoreo
            </h1>
            <p className="text-gray-600">
              Definir temas de consultas para scraping de monitoreo y registrar frases para investigar
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Palabra Clave
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Palabras</p>
                <p className="text-2xl font-bold">{palabrasClave.length}</p>
              </div>
              <Search className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Resultados</p>
                <p className="text-2xl font-bold">
                  {palabrasClave.reduce((sum, p) => sum + p.total_resultados, 0).toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resultados Hoy</p>
                <p className="text-2xl font-bold">
                  {palabrasClave.reduce((sum, p) => sum + p.resultados_hoy, 0).toLocaleString()}
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
                <p className="text-sm text-gray-600">Palabras Activas</p>
                <p className="text-2xl font-bold">
                  {palabrasClave.filter(p => p.total_resultados > 0).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Palabras Clave */}
      <Card>
        <CardHeader>
          <CardTitle>Palabras Clave para Monitoreo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FilterBar
              filters={filtros}
              onFilterChange={loadPalabrasClave}
            />
            <DataTable
              data={palabrasClave}
              columns={columnas}
              loading={loading}
              searchable
              searchPlaceholder="Buscar palabras clave..."
              emptyMessage="No hay palabras clave registradas"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialog para crear palabra clave */}
      <FormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        title="Nueva Palabra Clave"
        description="Agregar una nueva palabra clave para monitoreo y scraping"
        fields={createKeywordFields}
        onSubmit={handleCreateKeyword}
      />
    </div>
  );
}