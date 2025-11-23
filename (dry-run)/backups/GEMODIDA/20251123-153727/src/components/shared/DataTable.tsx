'use client';

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface Action {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: any) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  actions?: Action[];
  currentPage?: number;
  onPageChange?: (page: number) => void;
  totalPages?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export function DataTable({
  columns,
  data,
  loading,
  onEdit,
  onDelete,
  actions,
  currentPage = 1,
  onPageChange,
  totalPages = 1,
  searchable = false,
  searchPlaceholder = "Buscar...",
  emptyMessage = "No hay datos disponibles",
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar datos basado en búsqueda
  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm.trim()) {
      return data;
    }

    return data.filter(row => {
      return columns.some(col => {
        const value = row[col.key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns, searchable]);

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (data.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}
      
      {filteredData.length === 0 && searchTerm ? (
        <div className="text-center py-8 text-muted-foreground">
          No se encontraron resultados para "{searchTerm}"
        </div>
      ) : (
        <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
              {(onEdit || onDelete || (actions && actions.length > 0)) && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </TableCell>
                ))}
                {(onEdit || onDelete || (actions && actions.length > 0)) && (
                  <TableCell className="text-right space-x-2">
                    {actions && actions.map((action, actionIdx) => (
                      <Button
                        key={actionIdx}
                        variant={action.variant || 'ghost'}
                        size="sm"
                        onClick={() => action.onClick(row)}
                      >
                        {action.icon}
                        {action.label}
                      </Button>
                    ))}
                    {onEdit && (
                      <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
                        Editar
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="ghost" size="sm" onClick={() => onDelete(row)}>
                        Eliminar
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      )}

      {onPageChange && totalPages > 1 && !searchTerm && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
