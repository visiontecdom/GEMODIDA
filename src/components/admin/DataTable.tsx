import { useState, useEffect } from 'react';
import { DatabaseService } from '@GEMODIDA/supabase-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function DataTable<T extends { id: string | number }>({
  tableName,
  columns,
  onEdit,
  onDelete,
}: {
  tableName: string;
  columns: {
    key: string;
    header: string;
    render?: (value: any, row: T) => React.ReactNode;
  }[];
  onEdit?: (item: T) => void;
  onDelete?: (id: string | number) => Promise<void>;
}) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  const loadData = async () => {
    try {
      setLoading(true);
      const service = new DatabaseService<T>(tableName);
      const { data, error } = await service.find();
      
      if (error) throw error;
      setData(data || []);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
            {(onEdit || onDelete) && <TableHead>Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              {columns.map((column) => (
                <TableCell key={`${item.id}-${column.key}`}>
                  {column.render
                    ? column.render(item[column.key as keyof T], item)
                    : String(item[column.key as keyof T])}
                </TableCell>
              ))}
              {(onEdit || onDelete) && (
                <TableCell className="space-x-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(item)}
                    >
                      Editar
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(item.id)}
                    >
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
  );
}
