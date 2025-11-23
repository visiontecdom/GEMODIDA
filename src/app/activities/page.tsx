'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useActivities } from '@/hooks/useActivities';
import { DataTable } from '@/components/shared/DataTable';
import { FormDialog } from '@/components/shared/FormDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { FilterBar } from '@/components/shared/FilterBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function ActivitiesPage() {
  const { } = useAuth();
  const { activities, loading, addActivity, updateActivity, deleteActivity } = useActivities();
  const [searchValue, setSearchValue] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', tipo: 'tarea' });

  // auth handled by ProtectedRoute

  const filteredActivities = activities.filter(
    (a) =>
      a.tipo_actividad?.toLowerCase().includes(searchValue.toLowerCase()) ||
      a.descripcion?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleAddActivity = async () => {
    if (formData.nombre) {
      await addActivity({ tipo_actividad: formData.tipo, descripcion: formData.descripcion, fecha: new Date() });
      setFormData({ nombre: '', descripcion: '', tipo: 'tarea' });
      setFormOpen(false);
    }
  };

  const handleEditActivity = (a: any) => {
    setSelectedActivity(a);
    setFormData({ nombre: a.tipo_actividad, descripcion: a.descripcion, tipo: a.tipo_actividad });
    setFormOpen(true);
  };

  const handleUpdateActivity = async () => {
    if (selectedActivity && formData.nombre) {
      await updateActivity(selectedActivity.id_actividad, { tipo_actividad: formData.tipo, descripcion: formData.descripcion });
      setFormData({ nombre: '', descripcion: '', tipo: 'tarea' });
      setFormOpen(false);
      setSelectedActivity(null);
    }
  };

  const handleDeleteActivity = async () => {
    if (selectedActivity) {
      await deleteActivity(selectedActivity.id_actividad);
      setDeleteOpen(false);
      setSelectedActivity(null);
    }
  };

  // Loading/spinner handled by ProtectedRoute

  const columns = [
    { key: 'tipo_actividad', label: 'Tipo' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'fecha', label: 'Fecha' },
    {
      key: 'creado_en',
      label: 'Creado',
      render: (row: any) => new Date(row.creado_en).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditActivity(row)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setSelectedActivity(row);
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
    <ProtectedRoute>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Actividades</h1>
          <p className="text-muted-foreground mt-2">Gestiona actividades del sistema</p>
        </div>
        <Button onClick={() => {
          setSelectedActivity(null);
          setFormData({ nombre: '', descripcion: '', tipo: 'tarea' });
          setFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Actividad
        </Button>
      </div>

      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        placeholder="Buscar actividades..."
      />

      <DataTable
        columns={columns}
        data={filteredActivities}
        loading={loading}
      />

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={selectedActivity ? 'Editar Actividad' : 'Nueva Actividad'}
        onSubmit={selectedActivity ? handleUpdateActivity : handleAddActivity}
        onCancel={() => {
          setSelectedActivity(null);
          setFormData({ nombre: '', descripcion: '', tipo: 'tarea' });
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre</label>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Nombre de la actividad"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Descripción</label>
            <Input
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Tipo</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="tarea">Tarea</option>
              <option value="evento">Evento</option>
              <option value="notificacion">Notificación</option>
            </select>
          </div>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Actividad"
        description={`¿Estás seguro de que deseas eliminar la actividad "${selectedActivity?.tipo_actividad}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteActivity}
        confirmLabel="Eliminar"
        isDangerous
      />
    </div>
    </ProtectedRoute>
  );
}
