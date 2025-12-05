'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { FormDialog } from '@/components/shared/FormDialog';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { createClient } from '@supabase/supabase-js';
import { Settings, Plus, ArrowLeft, Globe, Clock, Database } from 'lucide-react';

interface ConfiguracionScraping {
  id_config: number;
  nombre_configuracion: string;
  descripcion: string;
  fuentes_activas: number[];
  palabras_clave_activas: number[];
  frecuencia_minutos: number;
  esta_activa: boolean;
  nombre_creador: string;
  creado_en: string;
}

interface Sucursal {
  id_suc: number;
  nombre_sucursal: string;
  provincia: string;
  estado: string;
}

export default function ConfiguracionMonitoreoPage() {
  const router = useRouter();
  const { userPermissions, getUserSucursales } = useRoleSystem();
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionScraping[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScrapingDialog, setShowScrapingDialog] = useState(false);
  const [showSucursalDialog, setShowSucursalDialog] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadConfiguraciones = async () => {
    try {
      setLoading(true);
      
      // Usar consulta directa con join para obtener el nombre del creador
      const { data, error } = await supabase
        .from('configuracion_scraping')
        .select(`
          *,
          creador:usuarios(nombre_completo)
        `)
        .order('creado_en', { ascending: false });
        
      if (error) throw error;
      
      // Transformar datos para que coincidan con la interfaz
      const transformedData = (data || []).map(config => ({
        ...config,
        nombre_creador: config.creador?.nombre_completo || 'Desconocido'
      }));
      
      setConfiguraciones(transformedData);
    } catch (error) {
      console.error('Error loading configuraciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSucursales = async () => {
    try {
      const { data, error } = await supabase
        .from('sucursales')
        .select('*')
        .order('nombre_sucursal');
      
      if (error) throw error;
      setSucursales(data || []);
    } catch (error) {
      console.error('Error loading sucursales:', error);
    }
  };

  useEffect(() => {
    loadConfiguraciones();
    loadSucursales();
  }, []);

  const columnasConfiguracion = [
    {
      key: 'nombre_configuracion',
      label: 'Configuración',
      render: (value: string, row: ConfiguracionScraping) => (
        <div>
          <div className="font-medium flex items-center">
            <Settings className="h-4 w-4 mr-2 text-blue-600" />
            {value}
          </div>
          <div className="text-sm text-gray-500 mt-1">{row.descripcion}</div>
        </div>
      )
    },
    {
      key: 'frecuencia_minutos',
      label: 'Frecuencia',
      render: (value: number) => (
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-gray-400" />
          {value} minutos
        </div>
      )
    },
    {
      key: 'fuentes_activas',
      label: 'Fuentes',
      render: (value: number[]) => (
        <Badge variant="outline">
          {value?.length || 0} fuentes
        </Badge>
      )
    },
    {
      key: 'palabras_clave_activas',
      label: 'Palabras Clave',
      render: (value: number[]) => (
        <Badge variant="outline">
          {value?.length || 0} palabras
        </Badge>
      )
    },
    {
      key: 'esta_activa',
      label: 'Estado',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'destructive'}>
          {value ? 'Activa' : 'Inactiva'}
        </Badge>
      )
    },
    {
      key: 'nombre_creador',
      label: 'Creado por'
    }
  ];

  const columnasSucursales = [
    {
      key: 'nombre_sucursal',
      label: 'Sucursal',
      render: (value: string, row: Sucursal) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.provincia}</div>
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value: string) => (
        <Badge variant={value === 'Activo' ? 'default' : 'destructive'}>
          {value}
        </Badge>
      )
    }
  ];

  const handleCreateScraping = async (formData: any) => {
    try {
      const { error } = await supabase.from('configuracion_scraping').insert([{
        nombre_configuracion: formData.nombre_configuracion,
        descripcion: formData.descripcion,
        frecuencia_minutos: parseInt(formData.frecuencia_minutos),
        esta_activa: formData.esta_activa === 'true',
        creado_por: userPermissions?.usuario?.id
      }]);

      if (error) throw error;
      
      await loadConfiguraciones();
      setShowScrapingDialog(false);
    } catch (error) {
      console.error('Error creating scraping config:', error);
    }
  };

  const handleCreateSucursal = async (formData: any) => {
    try {
      const { error } = await supabase.from('sucursales').insert([{
        nombre_sucursal: formData.nombre_sucursal,
        descripcion: formData.descripcion,
        provincia: formData.provincia,
        municipio: formData.municipio,
        direccion: formData.direccion,
        telefono_sucursal: formData.telefono_sucursal,
        correo_sucursal: formData.correo_sucursal,
        estado: 'Activo'
      }]);

      if (error) throw error;
      
      await loadSucursales();
      setShowSucursalDialog(false);
    } catch (error) {
      console.error('Error creating sucursal:', error);
    }
  };

  const scrapingFields = [
    {
      name: 'nombre_configuracion',
      label: 'Nombre de la Configuración',
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
      name: 'frecuencia_minutos',
      label: 'Frecuencia (minutos)',
      type: 'number' as const,
      required: true,
      placeholder: '60'
    },
    {
      name: 'esta_activa',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'Activa' },
        { value: 'false', label: 'Inactiva' }
      ],
      required: true
    }
  ];

  const sucursalFields = [
    {
      name: 'nombre_sucursal',
      label: 'Nombre de la Sucursal',
      type: 'text' as const,
      required: true
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea' as const
    },
    {
      name: 'provincia',
      label: 'Provincia',
      type: 'text' as const,
      required: true
    },
    {
      name: 'municipio',
      label: 'Municipio',
      type: 'text' as const
    },
    {
      name: 'direccion',
      label: 'Dirección',
      type: 'text' as const
    },
    {
      name: 'telefono_sucursal',
      label: 'Teléfono',
      type: 'text' as const
    },
    {
      name: 'correo_sucursal',
      label: 'Correo Electrónico',
      type: 'email' as const
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
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acceso Restringido
          </h3>
          <p className="text-gray-500">
            No tienes permisos para configurar la plataforma.
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
              Configuración del Sistema - Monitoreo
            </h1>
            <p className="text-gray-600">
              Crear sucursales y configurar la plataforma de monitoreo
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Configuraciones</p>
                <p className="text-2xl font-bold">{configuraciones.length}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Configs Activas</p>
                <p className="text-2xl font-bold">
                  {configuraciones.filter(c => c.esta_activa).length}
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
                <p className="text-sm text-gray-600">Total Sucursales</p>
                <p className="text-2xl font-bold">{sucursales.length}</p>
              </div>
              <Globe className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sucursales Activas</p>
                <p className="text-2xl font-bold">
                  {sucursales.filter(s => s.estado === 'Activo').length}
                </p>
              </div>
              <Database className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuraciones de Scraping */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Configuraciones de Scraping</CardTitle>
            <Button onClick={() => setShowScrapingDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Configuración
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={configuraciones}
            columns={columnasConfiguracion}
            loading={loading}
            searchable
            searchPlaceholder="Buscar configuraciones..."
            emptyMessage="No hay configuraciones de scraping"
          />
        </CardContent>
      </Card>

      {/* Gestión de Sucursales */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestión de Sucursales</CardTitle>
            <Button onClick={() => setShowSucursalDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Sucursal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={sucursales}
            columns={columnasSucursales}
            searchable
            searchPlaceholder="Buscar sucursales..."
            emptyMessage="No hay sucursales registradas"
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <FormDialog
        open={showScrapingDialog}
        onOpenChange={setShowScrapingDialog}
        title="Nueva Configuración de Scraping"
        description="Crear una nueva configuración para procesos de scraping"
        fields={scrapingFields}
        onSubmit={handleCreateScraping}
      />

      <FormDialog
        open={showSucursalDialog}
        onOpenChange={setShowSucursalDialog}
        title="Nueva Sucursal"
        description="Registrar una nueva sucursal en el sistema"
        fields={sucursalFields}
        onSubmit={handleCreateSucursal}
      />
    </div>
  );
}