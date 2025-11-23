'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { FormDialog } from '@/components/shared/FormDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { useUsers } from '@/hooks/useUsers';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield,
  Users,
  AlertTriangle
} from 'lucide-react';

interface CreateUserData {
  correo: string;
  password: string;
  nombre_completo: string;
  telefono?: string;
  id_grupo: number;
  id_rol: number;
  id_sucursal: number;
}

export function UserManagement() {
  const { 
    groups, 
    roles, 
    sucursales, 
    createUser, 
    hasPermission,
    loadGroups,
    loadRoles,
    loadSucursales
  } = useRoleSystem();
  
  const { users, loadUsers } = useUsers();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
    loadGroups();
    loadRoles();
    loadSucursales();
  }, [loadUsers, loadGroups, loadRoles, loadSucursales]);

  const handleCreateUser = async (formData: CreateUserData) => {
    try {
      setLoading(true);
      await createUser(formData);
      await loadUsers();
      setShowCreateDialog(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columnas = [
    {
      key: 'nombre_completo',
      label: 'Usuario',
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.correo}</div>
        </div>
      )
    },
    {
      key: 'telefono',
      label: 'Teléfono'
    },
    {
      key: 'rol_nombre',
      label: 'Rol',
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'esta_activo',
      label: 'Estado',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
    {
      key: 'creado_en',
      label: 'Creado',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: any, row: any) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedUser(row);
              setShowEditDialog(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedUser(row);
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
      name: 'correo',
      label: 'Correo Electrónico',
      type: 'email' as const,
      required: true,
      placeholder: 'usuario@dida.gob.do'
    },
    {
      name: 'password',
      label: 'Contraseña',
      type: 'password' as const,
      required: true,
      placeholder: 'Mínimo 6 caracteres'
    },
    {
      name: 'nombre_completo',
      label: 'Nombre Completo',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre y apellidos'
    },
    {
      name: 'telefono',
      label: 'Teléfono',
      type: 'tel' as const,
      placeholder: '809-000-0000'
    },
    {
      name: 'id_grupo',
      label: 'Grupo de Trabajo',
      type: 'select' as const,
      required: true,
      options: groups.map(g => ({ value: g.id_grupo.toString(), label: g.nombre_grupo }))
    },
    {
      name: 'id_rol',
      label: 'Rol',
      type: 'select' as const,
      required: true,
      options: roles.map(r => ({ value: r.id_rol.toString(), label: r.nombre_rol }))
    },
    {
      name: 'id_sucursal',
      label: 'Sucursal',
      type: 'select' as const,
      required: true,
      options: sucursales.map(s => ({ value: s.id_suc.toString(), label: s.nombre_sucursal }))
    }
  ];

  if (!hasPermission('crear_usuarios')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Restringido</h3>
          <p className="text-gray-500">No tienes permisos para gestionar usuarios.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Gestión de Usuarios
          </h2>
          <p className="text-gray-600 mt-1">
            Crear y administrar usuarios del sistema
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>
            Lista de todos los usuarios registrados en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={users}
            columns={columnas}
            loading={loading}
            searchable
            searchPlaceholder="Buscar usuarios..."
            emptyMessage="No hay usuarios registrados"
          />
        </CardContent>
      </Card>

      <FormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        title="Crear Nuevo Usuario"
        description="Completa la información para crear un nuevo usuario en el sistema"
        fields={formFields}
        onSubmit={handleCreateUser}
        submitLabel="Crear Usuario"
      />

      <FormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        title="Editar Usuario"
        description="Modifica la información del usuario seleccionado"
        fields={formFields}
        initialData={selectedUser}
        onSubmit={(data) => console.log('Editar usuario:', data)}
        submitLabel="Guardar Cambios"
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Eliminar Usuario"
        description={`¿Estás seguro de que deseas eliminar al usuario "${selectedUser?.nombre_completo}"? Esta acción no se puede deshacer.`}
        onConfirm={() => console.log('Eliminar usuario:', selectedUser)}
        confirmLabel="Eliminar"
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