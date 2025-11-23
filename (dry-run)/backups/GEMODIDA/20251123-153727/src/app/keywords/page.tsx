'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useKeywords } from '@/hooks/useKeywords';
import { ExportButton } from '@/components/shared/ExportButton';
import { DataTable } from '@/components/shared/DataTable';
import { FormDialog } from '@/components/shared/FormDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { FilterBar } from '@/components/shared/FilterBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function KeywordsPage() {
  const router = useRouter();
  const { keywords, loading, addKeyword, updateKeyword, deleteKeyword } = useKeywords();
  const [searchValue, setSearchValue] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<any>(null);
  const [formData, setFormData] = useState({ palabra: '', descripcion: '' });

  // Eliminada la lógica duplicada de redirección y validación

  const filteredKeywords = keywords.filter(
    (k) =>
      k.palabra?.toLowerCase().includes(searchValue.toLowerCase()) ||
      k.descripcion?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleAddKeyword = async () => {
    if (formData.palabra) {
      await addKeyword(formData.palabra, formData.descripcion);
      setFormData({ palabra: '', descripcion: '' });
      setFormOpen(false);
    }
  };

  const handleEditKeyword = (k: any) => {
    setSelectedKeyword(k);
    setFormData({ palabra: k.palabra, descripcion: k.descripcion });
    setFormOpen(true);
  };

  const handleUpdateKeyword = async () => {
    if (selectedKeyword && formData.palabra) {
      await updateKeyword(selectedKeyword.id_palabra, formData);
      setFormData({ palabra: '', descripcion: '' });
      setFormOpen(false);
      setSelectedKeyword(null);
    }
  };

  const handleDeleteKeyword = async () => {
    if (selectedKeyword) {
      await deleteKeyword(selectedKeyword.id_palabra);
      setDeleteOpen(false);
      setSelectedKeyword(null);
    }
  };

  // El loading ya es manejado por ProtectedRoute

  const columns = [
    { key: 'palabra', label: 'Palabra' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'total_resultados', label: 'Resultados' },
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
          <Button size="sm" variant="outline" onClick={() => handleEditKeyword(row)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="destructive" onClick={() => {
            setSelectedKeyword(row);
            setDeleteOpen(true);
          }}>
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
          <h1 className="text-3xl font-bold tracking-tight">Palabras Clave</h1>
          <p className="text-muted-foreground mt-2">Gestiona palabras clave para monitoreo</p>
        </div>
        <div className="flex gap-2">
          <ExportButton 
            data={filteredKeywords} 
            filename="palabras-clave" 
            title="Palabras Clave" 
          />
          <Button onClick={() => {
          setSelectedKeyword(null);
          setFormData({ palabra: '', descripcion: '' });
          setFormOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Palabra Clave
          </Button>
        </div>
      </div>

      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        placeholder="Buscar palabras clave..."
      />

      <DataTable
        columns={columns}
        data={filteredKeywords}
        loading={loading}
      />

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={selectedKeyword ? 'Editar Palabra Clave' : 'Nueva Palabra Clave'}
        onSubmit={selectedKeyword ? handleUpdateKeyword : handleAddKeyword}
        onCancel={() => {
          setSelectedKeyword(null);
          setFormData({ palabra: '', descripcion: '' });
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Palabra</label>
            <Input
              value={formData.palabra}
              onChange={(e) => setFormData({ ...formData, palabra: e.target.value })}
              placeholder="Ingresa la palabra clave"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Descripción</label>
            <Input
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción (opcional)"
            />
          </div>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Palabra Clave"
        description={`¿Estás seguro de que deseas eliminar "${selectedKeyword?.palabra}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteKeyword}
        confirmLabel="Eliminar"
        isDangerous
      />
    </div>
  );
}
