'use client';

import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useKeywords } from '@/hooks/useKeywords';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { KeywordForm } from './KeywordForm';

export function KeywordsList() {
  const { keywords, loading, error, deleteKeyword } = useKeywords();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<number | null>(null);

  const filteredKeywords = keywords.filter(keyword =>
    keyword.palabra.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (keyword.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleEdit = (id: number) => {
    setEditingKeyword(id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta palabra clave?')) {
      try {
        await deleteKeyword(id);
      } catch (err) {
        console.error('Error al eliminar:', err);
      }
    }
  };

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error al cargar palabras clave</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar palabras clave..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingKeyword(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar palabra clave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingKeyword ? 'Editar palabra clave' : 'Agregar nueva palabra clave'}
              </DialogTitle>
            </DialogHeader>
            <KeywordForm
              id={editingKeyword}
              onSuccess={() => {
                setIsDialogOpen(false);
                setEditingKeyword(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Palabra clave</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Resultados</TableHead>
              <TableHead>Fecha de creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="flex justify-end space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredKeywords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No se encontraron palabras clave.' : 'Aún no hay palabras clave.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredKeywords.map((keyword) => (
                <TableRow key={keyword.id_palabra}>
                  <TableCell className="font-medium">{keyword.palabra}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {keyword.descripcion || 'Sin descripción'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{keyword.total_resultados} resultados</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(keyword.fecha_creacion).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(keyword.id_palabra)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(keyword.id_palabra)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
