'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSurveys } from '@/hooks/useSurveys';
import { ExportButton } from '@/components/shared/ExportButton';
import { DataTable } from '@/components/shared/DataTable';
import { FormDialog } from '@/components/shared/FormDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { FilterBar } from '@/components/shared/FilterBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function SurveysPage() {
  const router = useRouter();
  const { surveys, loading, addSurvey, updateSurvey, deleteSurvey } = useSurveys();
  const [searchValue, setSearchValue] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [formData, setFormData] = useState({ titulo: '', descripcion: '', estado: 'activa' });

  // Eliminada la lógica duplicada de redirección y validación

  const filteredSurveys = surveys.filter(
    (s) =>
      s.titulo?.toLowerCase().includes(searchValue.toLowerCase()) ||
      s.descripcion?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleAddSurvey = async () => {
    if (formData.titulo) {
      await addSurvey(formData);
      setFormData({ titulo: '', descripcion: '', estado: 'activa' });
      setFormOpen(false);
    }
  };

  const handleEditSurvey = (s: any) => {
    setSelectedSurvey(s);
    setFormData({ titulo: s.titulo, descripcion: s.descripcion, estado: s.estado });
    setFormOpen(true);
  };

  const handleUpdateSurvey = async () => {
    if (selectedSurvey && formData.titulo) {
      await updateSurvey(selectedSurvey.id, formData);
      setFormData({ titulo: '', descripcion: '', estado: 'activa' });
      setFormOpen(false);
      setSelectedSurvey(null);
    }
  };

  const handleDeleteSurvey = async () => {
    if (selectedSurvey) {
      await deleteSurvey(selectedSurvey.id);
      setDeleteOpen(false);
      setSelectedSurvey(null);
    }
  };

  // El loading ya es manejado por ProtectedRoute

  const columns = [
    { key: 'titulo', label: 'Título' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'estado', label: 'Estado' },
    {
      key: 'fecha_creacion',
      label: 'Fecha',
      render: (row: any) => new Date(row.fecha_creacion).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditSurvey(row)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setSelectedSurvey(row);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Encuestas</h1>
          <p className="text-muted-foreground mt-2">Gestiona encuestas del sistema</p>
        </div>
        <div className="flex gap-2">
          <ExportButton 
            data={filteredSurveys} 
            filename="encuestas" 
            title="Encuestas" 
          />
          <Button onClick={() => {
          setSelectedSurvey(null);
          setFormData({ titulo: '', descripcion: '', estado: 'activa' });
          setFormOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Encuesta
          </Button>
        </div>
      </div>

      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        placeholder="Buscar encuestas..."
      />

      <DataTable
        columns={columns}
        data={filteredSurveys}
        loading={loading}
      />

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={selectedSurvey ? 'Editar Encuesta' : 'Nueva Encuesta'}
        onSubmit={selectedSurvey ? handleUpdateSurvey : handleAddSurvey}
        onCancel={() => {
          setSelectedSurvey(null);
          setFormData({ titulo: '', descripcion: '', estado: 'activa' });
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Título</label>
            <Input
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Título de la encuesta"
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
            <label className="text-sm font-medium">Estado</label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="activa">Activa</option>
              <option value="inactiva">Inactiva</option>
              <option value="cerrada">Cerrada</option>
            </select>
          </div>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Encuesta"
        description={`¿Estás seguro de que deseas eliminar la encuesta "${selectedSurvey?.titulo}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteSurvey}
        confirmLabel="Eliminar"
        isDangerous
      />
    </div>
  );
}
