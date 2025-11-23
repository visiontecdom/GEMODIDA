'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useRoles } from '@/hooks/useRoles';
import { DataTable } from '@/components/shared/DataTable';
import { FormDialog } from '@/components/shared/FormDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function RolesPage() {
  const { } = useAuth();
  const { roles, loading, addRole, updateRole, deleteRole } = useRoles();
  const [isAdmin, setIsAdmin] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

  // auth handled by ProtectedRoute

  const handleAddRole = async () => {
    if (formData.nombre) {
      await addRole(formData);
      setFormData({ nombre: '', descripcion: '' });
      setFormOpen(false);
    }
  };

  const handleEditRole = (r: any) => {
    setSelectedRole(r);
    setFormData({ nombre: r.nombre, descripcion: r.descripcion });
    setFormOpen(true);
  };

  const handleUpdateRole = async () => {
    if (selectedRole && formData.nombre) {
      await updateRole(selectedRole.id, formData);
      setFormData({ nombre: '', descripcion: '' });
      setFormOpen(false);
      setSelectedRole(null);
    }
  };

  const handleDeleteRole = async () => {
    if (selectedRole) {
      await deleteRole(selectedRole.id);
      setDeleteOpen(false);
      setSelectedRole(null);
    }
  };

  // Loading and access handled by ProtectedRoute

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditRole(row)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setSelectedRole(row);
              setDeleteOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRole="admin">
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Roles</h1>
          <p className="text-muted-foreground mt-2">Administra roles del sistema</p>
        </div>
        <Button onClick={() => {
          setSelectedRole(null);
          setFormData({ nombre: '', descripcion: '' });
          setFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Rol
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={roles}
        loading={loading}
      />

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={selectedRole ? 'Editar Rol' : 'Nuevo Rol'}
        onSubmit={selectedRole ? handleUpdateRole : handleAddRole}
        onCancel={() => {
          setSelectedRole(null);
          setFormData({ nombre: '', descripcion: '' });
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre</label>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Nombre del rol"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Descripción</label>
            <Input
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción del rol"
              />
          </div>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Rol"
        description={`¿Estás seguro de que deseas eliminar el rol ${selectedRole?.nombre}? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteRole}
        confirmLabel="Eliminar"
        isDangerous
      />
    </div>
    </ProtectedRoute>
  );
}
