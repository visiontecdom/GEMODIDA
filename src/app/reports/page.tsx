'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useReports } from '@/hooks/useReports';
import { DataTable } from '@/components/shared/DataTable';
import { FormDialog } from '@/components/shared/FormDialog';
import { FilterBar } from '@/components/shared/FilterBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Download, Eye } from 'lucide-react';

export default function ReportsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { reports, loading } = useReports();
  const [searchValue, setSearchValue] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({ titulo: '', tipo: 'general' });

  // Eliminada la lógica duplicada de redirección y validación

  const filteredReports = reports.filter(
    (r) =>
      r.titulo?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleGenerateReport = async () => {
    if (formData.titulo) {
      try {
        await fetch('/api/reports/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        setFormData({ titulo: '', tipo: 'general' });
        setFormOpen(false);
      } catch (error) {
        console.error('Error generando reporte:', error);
      }
    }
  };

  // El loading ya es manejado por ProtectedRoute

  const columns = [
    { key: 'titulo', label: 'Título' },
    { key: 'tipo', label: 'Tipo' },
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
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" disabled={row.estado !== 'completado'}>
            <Download className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground mt-2">Genera y visualiza reportes</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Generar Reporte
        </Button>
      </div>

      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        placeholder="Buscar reportes..."
      />

      <DataTable
        columns={columns}
        data={filteredReports}
        loading={loading}
      />

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Generar Nuevo Reporte"
        onSubmit={handleGenerateReport}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Título</label>
            <Input
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Título del reporte"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Tipo</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="general">General</option>
              <option value="detallado">Detallado</option>
              <option value="resumen">Resumen</option>
            </select>
          </div>
        </div>
      </FormDialog>
    </div>
    </ProtectedRoute>
  );
}
