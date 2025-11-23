'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useUsers } from '@/hooks/useUsers';
import { DataTable } from '@/components/shared/DataTable';
import { FormDialog } from '@/components/shared/FormDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { FilterBar } from '@/components/shared/FilterBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function UsersPage() {
  const { } = useAuth();
  const { users, loading, addUser, updateUser, deleteUser } = useUsers();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({ email: '', nombre: '', rol: 'user' });

  const filteredUsers = users.filter(
    (u) =>
      u.correo?.toLowerCase().includes(searchValue.toLowerCase()) ||
      u.nombre_completo?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleAddUser = async () => {
    if (formData.email && formData.nombre) {
      await addUser({ correo: formData.email, nombre_completo: formData.nombre, rol_nombre: formData.rol });
      setFormData({ email: '', nombre: '', rol: 'user' });
      setFormOpen(false);
    }
  };

  const handleEditUser = (u: any) => {
    setSelectedUser(u);
    setFormData({ email: u.correo, nombre: u.nombre_completo, rol: u.rol_nombre });
    setFormOpen(true);
  };

  const handleUpdateUser = async () => {
    if (selectedUser && formData.email && formData.nombre) {
      await updateUser(selectedUser.id_usuario, { correo: formData.email, nombre_completo: formData.nombre, rol_nombre: formData.rol });
      setFormData({ email: '', nombre: '', rol: 'user' });
      setFormOpen(false);
      setSelectedUser(null);
    }
  };

  const handleDeleteUser = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser.id_usuario);
      setDeleteOpen(false);
      setSelectedUser(null);
    }
  };

  // Auth handled by ProtectedRoute

  const columns = [
    { key: 'correo', label: 'Email' },
    { key: 'nombre_completo', label: 'Nombre' },
    { key: 'rol_nombre', label: 'Rol' },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditUser(row)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setSelectedUser(row);
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
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-2">Administra usuarios del sistema</p>
        </div>
        <Button onClick={() => {
          setSelectedUser(null);
          setFormData({ email: '', nombre: '', rol: 'user' });
          setFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        placeholder="Buscar por email o nombre..."
      />

      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
      />

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        onSubmit={selectedUser ? handleUpdateUser : handleAddUser}
        onCancel={() => {
          setSelectedUser(null);
          setFormData({ email: '', nombre: '', rol: 'user' });
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@ejemplo.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Nombre</label>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Rol</label>
            <select
              value={formData.rol}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="invitado">Consultas (Invitado)</option>
              <option value="operador">Operador</option>
              <option value="encuestador">Encuestador</option>
              <option value="supervisor">Supervisor</option>
              <option value="gerente">Gerente</option>
              <option value="admin">Administrador</option>
              <option value="desarrollo">Desarrollador</option>
              <option value="super_user">Super Usuario</option>
              <option value="seguridad">Seguridad</option>
            </select>
          </div>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Usuario"
        description={`¿Estás seguro de que deseas eliminar a ${selectedUser?.nombre_completo}? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteUser}
        confirmLabel="Eliminar"
        isDangerous
      />
    </div>
    </ProtectedRoute>
  );
}
