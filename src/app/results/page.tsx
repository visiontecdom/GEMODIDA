'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResults } from '@/hooks/useResults';
import { ExportButton } from '@/components/shared/ExportButton';
import { DataTable } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';

export default function ResultsPage() {
  const router = useRouter();
  const { results, loading } = useResults();
  const [searchValue, setSearchValue] = useState('');

  // Eliminada la lógica duplicada de redirección y validación

  const filteredResults = results.filter(
    (r) =>
      r.titulo?.toLowerCase().includes(searchValue.toLowerCase()) ||
      r.url?.toLowerCase().includes(searchValue.toLowerCase())
  );

  // El loading ya es manejado por ProtectedRoute

  const columns = [
    { key: 'titulo', label: 'Título' },
    { key: 'url', label: 'URL' },
    { key: 'descripcion', label: 'Descripción' },
    {
      key: 'fecha_publicacion',
      label: 'Fecha',
      render: (row: any) => new Date(row.fecha_publicacion).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(row.url, '_blank')}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resultados</h1>
          <p className="text-muted-foreground mt-2">Visualiza y gestiona resultados de scraping</p>
        </div>
        <ExportButton 
          data={filteredResults} 
          filename="resultados" 
          title="Resultados de Scraping" 
        />
      </div>

      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        placeholder="Buscar resultados..."
      />

      <DataTable
        columns={columns}
        data={filteredResults}
        loading={loading}
      />
    </div>
  );
}
