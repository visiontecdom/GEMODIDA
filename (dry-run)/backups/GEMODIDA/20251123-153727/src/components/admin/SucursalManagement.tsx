'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { FormDialog } from '@/components/shared/FormDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Building,
  MapPin,
  AlertTriangle
} from 'lucide-react';

interface Sucursal {
  id_suc: number;
  tipo_suc: string;
  nombre_sucursal: string;
  descripcion?: string;
  provincia: string;
  municipio?: string;
  direccion?: string;
  telefono_sucursal?: string;
  correo_sucursal?: string;
  persona_responsable?: string;
  estado: string;
  creado_en: string;
}

interface CreateSucursalData {
  tipo_suc: string;
  nombre_sucursal: string;
  descripcion?: string;
  provincia: string;
  municipio?: string;
  direccion?: string;
  telefono_sucursal?: string;
  correo_sucursal?: string;
  persona_responsable?: string;
}

export function SucursalManagement() {
  const { user } = useAuth();
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [provincias, setProvincias] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const loadSucursales = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('sucursales')
        .select('*')
        .order('nombre_sucursal');

      if (error) throw error;
      setSucursales(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const loadProvincias = useCallback(async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('provincias')
        .select('provincia')
        .order('provincia');

      if (error) throw error;
      setProvincias((data as any[] || []).map((p: any) => p.provincia));
    } catch (err: any) {
      // Si no existe la tabla provincias, usar lista predefinida
      setProvincias([
        'Distrito Nacional',
        'Santo Domingo',
        'Santiago',
        'La Vega',
        'San Cristóbal',
        'Puerto Plata',
        'San Pedro de Macorís',
        'La Romana',
        'Barahona',
        'Azua'
      ]);
    }
  }, [supabase]);

  useEffect(() => {
    loadSucursales();
    loadProvincias();
  }, [loadSucursales, loadProvincias]);

  const createSucursal = async (formData: CreateSucursalData) => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('sucursales')
        .insert({
          ...formData,
          estado: 'activa',
          fec_reg: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadSucursales();
      setShowCreateDialog(false);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSucursal = async (id: number, formData: Partial<CreateSucursalData>) => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('sucursales')
        .update(formData)
        .eq('id_suc', id)
        .select()
        .single();

      if (error) throw error;
      
      await loadSucursales();
      setShowEditDialog(false);
      setSelectedSucursal(null);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSucursal = async (id: number) => {
    try {
      setLoading(true);
      const { error } = await (supabase as any)
        .from('sucursales')
        .update({ estado: 'inactiva' })
        .eq('id_suc', id);

      if (error) throw error;
      
      await loadSucursales();
      setShowDeleteDialog(false);
      setSelectedSucursal(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const columnas = [
    {
      key: 'nombre_sucursal',
      label: 'Sucursal',
      render: (value: string, row: Sucursal) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.tipo_suc}</div>
        </div>
      )
    },
    {
      key: 'provincia',
      label: 'Ubicación',
      render: (value: string, row: Sucursal) => (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'persona_responsable',
      label: 'Responsable'
    },
    {
      key: 'telefono_sucursal',
      label: 'Teléfono'
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value: string) => (
        <Badge variant={value === 'activa' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: any, row: Sucursal) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedSucursal(row);
              setShowEditDialog(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedSucursal(row);
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const formFields = [
    {
      name: 'tipo_suc',
      label: 'Tipo de Sucursal',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'Sede Central', label: 'Sede Central' },
        { value: 'Regional', label: 'Regional' },
        { value: 'Provincial', label: 'Provincial' },
        { value: 'Local', label: 'Local' }
      ]
    },
    {
      name: 'nombre_sucursal',
      label: 'Nombre de la Sucursal',
      type: 'text' as const,
      required: true,
      placeholder: 'DIDA - Nombre de la Sucursal'
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea' as const,
      placeholder: 'Descripción de la sucursal...'
    },
    {
      name: 'provincia',
      label: 'Provincia',
      type: 'select' as const,
      required: true,
      options: provincias.map(p => ({ value: p, label: p }))
    },
    {
      name: 'municipio',
      label: 'Municipio',
      type: 'text' as const,
      placeholder: 'Municipio'
    },
    {
      name: 'direccion',
      label: 'Dirección',
      type: 'text' as const,
      placeholder: 'Dirección completa'
    },
    {
      name: 'telefono_sucursal',
      label: 'Teléfono',
      type: 'tel' as const,
      placeholder: '809-000-0000'
    },
    {
      name: 'correo_sucursal',
      label: 'Correo Electrónico',
      type: 'email' as const,
      placeholder: 'sucursal@dida.gob.do'
    },
    {
      name: 'persona_responsable',
      label: 'Persona Responsable',
      type: 'text' as const,
      placeholder: 'Nombre del responsable'
    }
  ];

  const getInitialFormData = (): CreateSucursalData => ({
    tipo_suc: selectedSucursal?.tipo_suc || '',
    nombre_sucursal: selectedSucursal?.nombre_sucursal || '',
    descripcion: selectedSucursal?.descripcion || '',
    provincia: selectedSucursal?.provincia || '',
    municipio: selectedSucursal?.municipio || '',
    direccion: selectedSucursal?.direccion || '',
    telefono_sucursal: selectedSucursal?.telefono_sucursal || '',
    correo_sucursal: selectedSucursal?.correo_sucursal || '',
    persona_responsable: selectedSucursal?.persona_responsable || ''
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Building className="h-6 w-6 mr-2" />
            Gestión de Sucursales
          </h2>
          <p className="text-gray-600 mt-1">
            Administrar sucursales y oficinas de la DIDA
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Sucursal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sucursales Registradas</CardTitle>
          <CardDescription>
            Lista de todas las sucursales y oficinas de la DIDA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={sucursales}
            columns={columnas}
            loading={loading}
            searchable
            searchPlaceholder="Buscar sucursales..."
            emptyMessage="No hay sucursales registradas"
          />
        </CardContent>
      </Card>

      <FormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        title="Nueva Sucursal"
        description="Registra una nueva sucursal u oficina de la DIDA"
        fields={formFields}
        onSubmit={createSucursal}
        submitLabel="Crear Sucursal"
      />

      <FormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        title="Editar Sucursal"
        description="Modifica la información de la sucursal seleccionada"
        fields={formFields}
        initialData={getInitialFormData()}
        onSubmit={(data) => updateSucursal(selectedSucursal!.id_suc, data)}
        submitLabel="Guardar Cambios"
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Desactivar Sucursal"
        description={`¿Estás seguro de que deseas desactivar la sucursal "${selectedSucursal?.nombre_sucursal}"?`}
        onConfirm={() => deleteSucursal(selectedSucursal!.id_suc)}
        confirmLabel="Desactivar"
isDangerous={true}
      />

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
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