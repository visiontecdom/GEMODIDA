'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/shared/Switch';
import { DataTable } from '@/components/shared/DataTable';
import { FormDialog } from '@/components/shared/FormDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useKeywords } from '@/hooks/useKeywords';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { 
  Settings, 
  Plus, 
  Play, 
  Edit, 
  Trash2, 
  Clock,
  Target,
  Globe,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface ConfiguracionScraping {
  id_config: number;
  nombre_configuracion: string;
  descripcion?: string;
  fuentes_activas: number[];
  palabras_clave_activas: number[];
  frecuencia_minutos: number;
  esta_activa: boolean;
  configuracion_avanzada: Record<string, any>;
  creado_por?: string;
  creado_en: string;
  actualizado_en: string;
}

interface Fuente {
  id_fuente: number;
  nombre: string;
  url_base: string;
  tipo_fuente: string;
  esta_activa: boolean;
  requiere_autenticacion: boolean;
}

interface FormData {
  nombre_configuracion: string;
  descripcion: string;
  frecuencia_minutos: number;
}

export function ConfiguracionScraping() {
  const { user } = useAuth();
  const { keywords, loadKeywords } = useKeywords();
  
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionScraping[]>([]);
  const [fuentes, setFuentes] = useState<Fuente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<ConfiguracionScraping | null>(null);
  
  const supabase = createClient();

  // Cargar datos iniciales
  useEffect(() => {
    loadConfiguraciones();
    loadFuentes();
    loadKeywords();
  }, [loadKeywords]);

  const loadConfiguraciones = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('configuracion_scraping')
        .select('*')
        .order('creado_en', { ascending: false });

      if (error) throw error;
      setConfiguraciones(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const loadFuentes = useCallback(async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('fuentes')
        .select('*')
        .eq('esta_activa', true)
        .order('nombre');

      if (error) throw error;
      setFuentes(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  }, [supabase]);

  const createConfiguracion = async (formData: FormData) => {
    if (!user?.id) throw new Error('Usuario no autenticado');

    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('configuracion_scraping')
        .insert({
          nombre_configuracion: formData.nombre_configuracion,
          descripcion: formData.descripcion,
          frecuencia_minutos: formData.frecuencia_minutos,
          fuentes_activas: [],
          palabras_clave_activas: [],
          configuracion_avanzada: {
            max_resultados_por_fuente: 100,
            filtrar_duplicados: true,
            incluir_imagenes: false,
            analizar_sentimiento: true,
            notificar_alertas: true
          },
          creado_por: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadConfiguraciones();
      setShowCreateDialog(false);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguracion = async (id: number, formData: Partial<FormData>) => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('configuracion_scraping')
        .update({
          ...formData,
          actualizado_en: new Date().toISOString()
        })
        .eq('id_config', id)
        .select()
        .single();

      if (error) throw error;
      
      await loadConfiguraciones();
      setShowEditDialog(false);
      setSelectedConfig(null);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteConfiguracion = async (id: number) => {
    try {
      setLoading(true);
      const { error } = await (supabase as any)
        .from('configuracion_scraping')
        .delete()
        .eq('id_config', id);

      if (error) throw error;
      
      await loadConfiguraciones();
      setShowDeleteDialog(false);
      setSelectedConfig(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleConfiguracion = async (id: number, activa: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('configuracion_scraping')
        .update({ esta_activa: activa })
        .eq('id_config', id);

      if (error) throw error;
      await loadConfiguraciones();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Ejecutar scraping manual
  const ejecutarScraping = async (configId: number) => {
    try {
      setLoading(true);
      const response = await fetch('/api/scraping/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config_id: configId })
      });

      if (!response.ok) throw new Error('Error al ejecutar scraping');
      
      const result = await response.json();
      console.log('Scraping ejecutado:', result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Columnas para la tabla
  const columnas = [
    {
      key: 'nombre_configuracion',
      label: 'Nombre',
      render: (value: string, row: ConfiguracionScraping) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.descripcion}</div>
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
      key: 'frecuencia_minutos',
      label: 'Frecuencia',
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>{value} min</span>
        </div>
      )
    },
    {
      key: 'fuentes_activas',
      label: 'Fuentes',
      render: (value: number[]) => (
        <div className="flex items-center space-x-1">
          <Globe className="h-4 w-4 text-gray-400" />
          <span>{value.length} fuentes</span>
        </div>
      )
    },
    {
      key: 'palabras_clave_activas',
      label: 'Keywords',
      render: (value: number[]) => (
        <div className="flex items-center space-x-1">
          <Target className="h-4 w-4 text-gray-400" />
          <span>{value.length} palabras</span>
        </div>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: any, row: ConfiguracionScraping) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => ejecutarScraping(row.id_config)}
            disabled={!row.esta_activa}
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedConfig(row);
              setShowEditDialog(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedConfig(row);
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  // Campos del formulario
  const formFields = [
    {
      name: 'nombre_configuracion',
      label: 'Nombre de la Configuración',
      type: 'text' as const,
      required: true,
      placeholder: 'Ej: Monitoreo Redes Sociales'
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea' as const,
      placeholder: 'Describe el propósito de esta configuración...'
    },
    {
      name: 'frecuencia_minutos',
      label: 'Frecuencia (minutos)',
      type: 'number' as const,
      required: true,
      min: 5,
      max: 1440,
      defaultValue: 60
    }
  ];

  const getInitialFormData = (): FormData => ({
    nombre_configuracion: selectedConfig?.nombre_configuracion || '',
    descripcion: selectedConfig?.descripcion || '',
    frecuencia_minutos: selectedConfig?.frecuencia_minutos || 60
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Configuración de Scraping
          </h2>
          <p className="text-gray-600 mt-1">
            Gestiona las configuraciones para extracción automática de datos
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Configuración
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Configuraciones</p>
                <p className="text-2xl font-bold">{configuraciones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Activas</p>
                <p className="text-2xl font-bold">
                  {configuraciones.filter(c => c.esta_activa).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Fuentes Disponibles</p>
                <p className="text-2xl font-bold">{fuentes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Keywords Disponibles</p>
                <p className="text-2xl font-bold">{keywords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Configuraciones */}
      <Card>
        <CardHeader>
          <CardTitle>Configuraciones de Scraping</CardTitle>
          <CardDescription>
            Lista de todas las configuraciones de extracción de datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={configuraciones}
            columns={columnas}
            loading={loading}
            searchable
            searchPlaceholder="Buscar configuraciones..."
            emptyMessage="No hay configuraciones creadas"
          />
        </CardContent>
      </Card>

      {/* Dialog para crear configuración */}
      <FormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        title="Nueva Configuración de Scraping"
        description="Crea una nueva configuración para extracción automática de datos"
        fields={formFields}
        onSubmit={createConfiguracion}
        submitLabel="Crear Configuración"
      />

      {/* Dialog para editar configuración */}
      <FormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        title="Editar Configuración"
        description="Modifica los parámetros de la configuración de scraping"
        fields={formFields}
        initialData={getInitialFormData()}
        onSubmit={(data) => updateConfiguracion(selectedConfig!.id_config, data)}
        submitLabel="Guardar Cambios"
      />

      {/* Dialog de confirmación para eliminar */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Eliminar Configuración"
        description={`¿Estás seguro de que deseas eliminar la configuración "${selectedConfig?.nombre_configuracion}"? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteConfiguracion(selectedConfig!.id_config)}
        confirmLabel="Eliminar"
isDangerous={true}
      />

      {/* Mostrar errores */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto"
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