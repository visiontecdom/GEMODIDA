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
import { Users, UserPlus, ArrowLeft, Mail, Phone } from 'lucide-react';

interface Usuario {
  id_usuario: string;
  nombre_completo: string;
  correo: string;
  telefono: string;
  rol_nombre: string;
  grupo_nombre: string;
  sucursal_nombre: string;
  esta_activo: boolean;
  ultimo_acceso: string;
  creado_en: string;
}

export default function UsuariosMonitoreoPage() {
  const router = useRouter();
  const { userPermissions, hasPermission, getUserSucursales } = useRoleSystem();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadUsuarios = async (filters: any = {}) => {
    try {
      setLoading(true);
      const sucursales = getUserSucursales();
      const sucursalId = sucursales.length > 0 ? sucursales[0].id_suc : null;

      // Usar consulta directa con joins para obtener datos reales
      let query = supabase
        .from('usuarios')
        .select(`
          id_usuario,
          nombre_completo,
          correo,
          telefono,
          esta_activo,
          ultimo_acceso,
          creado_en,
          asignaciones:usuarios_asignaciones!inner(
            id_grupo,
            id_rol,
            id_sucursal,
            esta_activa,
            grupo:usuarios_grupos(nombre_grupo),
            rol:usuarios_roles(nombre_rol),
            sucursal:sucursales(nombre_sucursal)
          )
        `)
        .eq('asignaciones.esta_activa', true)
        .eq('asignaciones.grupo.codigo_grupo', 'monitoreo')
        .order('nombre_completo');

      if (sucursalId && !userPermissions?.asignaciones?.some(a => a.rol?.puede_ver_todas_sucursales)) {
        query = query.eq('asignaciones.id_sucursal', sucursalId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transformar datos para que coincidan con la interfaz
      const transformedData = (data || []).map((user: any) => {
        const asignacion = user.asignaciones?.[0]; // Tomar la primera asignación activa
        return {
          id_usuario: user.id_usuario,
          nombre_completo: user.nombre_completo,
          correo: user.correo,
          telefono: user.telefono || '',
          rol_nombre: asignacion?.rol?.nombre_rol || 'Sin rol',
          grupo_nombre: asignacion?.grupo?.nombre_grupo || 'Sin grupo',
          sucursal_nombre: asignacion?.sucursal?.nombre_sucursal || 'Sin sucursal',
          esta_activo: user.esta_activo,
          ultimo_acceso: user.ultimo_acceso,
          creado_en: user.creado_en
        };
      });
      
      setUsuarios(transformedData);
    } catch (error) {
      console.error('Error loading usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const columnas = [
    {
      key: 'nombre_completo',
      label: 'Usuario',
      render: (value: string, row: Usuario) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              {row.correo}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'rol_nombre',
      label: 'Rol',
      render: (value: string, row: Usuario) => (
        <div>
          <Badge variant="outline">{value}</Badge>
          <div className="text-sm text-gray-500 mt-1">{row.grupo_nombre}</div>
        </div>
      )
    },
    {
      key: 'sucursal_nombre',
      label: 'Sucursal'
    },
    {
      key: 'telefono',
      label: 'Contacto',
      render: (value: string) => value ? (
        <div className="flex items-center text-sm">
          <Phone className="h-3 w-3 mr-1" />
          {value}
        </div>
      ) : '-'
    },
    {
      key: 'esta_activo',
      label: 'Estado',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'destructive'}>
          {value ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
    {
      key: 'ultimo_acceso',
      label: 'Último Acceso',
      render: (value: string) => value ? 
        new Date(value).toLocaleDateString() : 'Nunca'
    }
  ];

  const filtros = [
    {
      key: 'rol_nombre',
      label: 'Rol',
      type: 'select' as const,
      options: [
        { value: 'gerente', label: 'Gerente' },
        { value: 'operador', label: 'Operador' },
        { value: 'encuestador', label: 'Encuestador' }
      ]
    },
    {
      key: 'esta_activo',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'Activo' },
        { value: 'false', label: 'Inactivo' }
      ]
    }
  ];

  const handleCreateUser = async (formData: any) => {
    try {
      const sucursales = getUserSucursales();
      const sucursalId = sucursales.length > 0 ? sucursales[0].id_suc : 1;
      
      // Obtener IDs de grupo y rol
      const { data: grupos } = await supabase
        .from('usuarios_grupos')
        .select('id_grupo')
        .eq('codigo_grupo', 'monitoreo')
        .single();
        
      const { data: roles } = await supabase
        .from('usuarios_roles')
        .select('id_rol')
        .eq('codigo_rol', formData.rol)
        .single();

      if (!grupos || !roles) {
        throw new Error('No se pudo obtener grupo o rol');
      }

      // Usar la función RPC existente para crear usuario
      const { data, error } = await supabase.rpc('crear_usuario_completo', {
        p_correo: formData.correo,
        p_nombre_completo: formData.nombre_completo,
        p_telefono: formData.telefono || null,
        p_id_grupo: grupos.id_grupo,
        p_id_rol: roles.id_rol,
        p_id_sucursal: sucursalId,
        p_creado_por: userPermissions?.usuario?.id
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || 'Error al crear usuario');
      
      await loadUsuarios();
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error al crear usuario: ' + (error as Error).message);
    }
  };

  const createUserFields = [
    {
      name: 'nombre_completo',
      label: 'Nombre Completo',
      type: 'text' as const,
      required: true
    },
    {
      name: 'correo',
      label: 'Correo Electrónico',
      type: 'email' as const,
      required: true
    },
    {
      name: 'telefono',
      label: 'Teléfono',
      type: 'text' as const
    },
    {
      name: 'rol',
      label: 'Rol',
      type: 'select' as const,
      options: [
        { value: 'operador', label: 'Operador' },
        { value: 'encuestador', label: 'Encuestador' },
        { value: 'gerente', label: 'Gerente' }
      ],
      required: true
    }
  ];

  // Verificar permisos según la lógica de negocio
  const hasAccess = hasPermission('administrar_recursos') || 
    ['gerente', 'admin', 'super_user', 'desarrollador'].some(role => 
      userPermissions?.asignaciones?.some(a => a.rol?.codigo_rol === role)
    );

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acceso Restringido
          </h3>
          <p className="text-gray-500">
            No tienes permisos para gestionar usuarios de monitoreo.
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
              Gestión de Usuarios - Monitoreo
            </h1>
            <p className="text-gray-600">
              Crear usuarios y asignar permisos a usuarios de monitoreo
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Crear Usuario
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold">{usuarios.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold">
                  {usuarios.filter(u => u.esta_activo).length}
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
                <p className="text-sm text-gray-600">Gerentes</p>
                <p className="text-2xl font-bold">
                  {usuarios.filter(u => u.rol_nombre?.toLowerCase().includes('gerente')).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Operadores</p>
                <p className="text-2xl font-bold">
                  {usuarios.filter(u => u.rol_nombre?.toLowerCase().includes('operador')).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Departamento de Monitoreo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FilterBar
              filters={filtros}
              onFilterChange={loadUsuarios}
            />
            <DataTable
              data={usuarios}
              columns={columnas}
              loading={loading}
              searchable
              searchPlaceholder="Buscar usuarios..."
              emptyMessage="No hay usuarios registrados en monitoreo"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialog para crear usuario */}
      <FormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        title="Crear Nuevo Usuario de Monitoreo"
        description="Agregar un nuevo usuario al departamento de monitoreo"
        fields={createUserFields}
        onSubmit={handleCreateUser}
      />
    </div>
  );
}