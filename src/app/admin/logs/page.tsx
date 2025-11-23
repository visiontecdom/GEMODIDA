'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useLogs } from '@/hooks/useLogs';
import { DataTable } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export default function LogsPage() {
  const { } = useAuth();
  const { logs, loading, deleteLogs } = useLogs();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // auth handled by ProtectedRoute

  const filteredLogs = logs.filter(
    (log) =>
      log.tipo_proceso?.toLowerCase().includes(searchValue.toLowerCase()) ||
      log.mensaje?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleClearLogs = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar todos los logs? Esta acción no se puede deshacer.')) {
      await deleteLogs();
    }
  };

  // Loading and access will be handled by ProtectedRoute

  const columns = [
    { key: 'tipo_proceso', label: 'Tipo' },
    { key: 'estado', label: 'Estado' },
    { key: 'mensaje', label: 'Mensaje' },
    {
      key: 'fecha_inicio',
      label: 'Fecha',
      render: (row: any) => new Date(row.fecha_inicio).toLocaleString(),
    },
  ];

  return (
    <ProtectedRoute requiredRole="admin">
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs del Sistema</h1>
          <p className="text-muted-foreground mt-2">Historial de actividades del sistema</p>
        </div>
        <Button
          onClick={handleClearLogs}
          variant="destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Limpiar Logs
        </Button>
      </div>

      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        placeholder="Buscar por tipo o mensaje..."
      />

      <DataTable
        columns={columns}
        data={filteredLogs}
        loading={loading}
      />
    </div>
    </ProtectedRoute>
  );
}
