'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface ExportadorResultadosProps {
  id_diseno: number;
  titulo: string;
  resultados: any[];
}

export function ExportadorResultados({
  id_diseno,
  titulo,
  resultados,
}: ExportadorResultadosProps) {
  const [cargando, setCargando] = useState(false);
  const { toast } = useToast();

  const exportarCSV = () => {
    setCargando(true);
    try {
      const csv = convertirACSV(resultados);
      descargarArchivo(csv, `${titulo}.csv`, 'text/csv');
      toast({
        title: 'Éxito',
        description: 'Archivo CSV descargado',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo exportar a CSV',
        variant: 'destructive',
      });
    } finally {
      setCargando(false);
    }
  };

  const exportarExcel = async () => {
    setCargando(true);
    try {
      const response = await fetch('/api/encuestas/exportar-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_diseno, resultados }),
      });

      if (!response.ok) throw new Error('Error al exportar');

      const blob = await response.blob();
      descargarArchivo(blob, `${titulo}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      toast({
        title: 'Éxito',
        description: 'Archivo Excel descargado',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo exportar a Excel',
        variant: 'destructive',
      });
    } finally {
      setCargando(false);
    }
  };

  const exportarPDF = async () => {
    setCargando(true);
    try {
      const response = await fetch('/api/encuestas/exportar-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_diseno, resultados }),
      });

      if (!response.ok) throw new Error('Error al exportar');

      const blob = await response.blob();
      descargarArchivo(blob, `${titulo}.pdf`, 'application/pdf');
      toast({
        title: 'Éxito',
        description: 'Archivo PDF descargado',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo exportar a PDF',
        variant: 'destructive',
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={exportarCSV}
        disabled={cargando}
        variant="outline"
        size="sm"
      >
        <Download className="w-4 h-4 mr-2" />
        CSV
      </Button>
      <Button
        onClick={exportarExcel}
        disabled={cargando}
        variant="outline"
        size="sm"
      >
        <Download className="w-4 h-4 mr-2" />
        Excel
      </Button>
      <Button
        onClick={exportarPDF}
        disabled={cargando}
        variant="outline"
        size="sm"
      >
        <Download className="w-4 h-4 mr-2" />
        PDF
      </Button>
    </div>
  );
}

function convertirACSV(datos: any[]): string {
  if (datos.length === 0) return '';

  const headers = Object.keys(datos[0]);
  const csv = [
    headers.join(','),
    ...datos.map((row) =>
      headers.map((header) => JSON.stringify(row[header] || '')).join(',')
    ),
  ].join('\n');

  return csv;
}

function descargarArchivo(contenido: any, nombre: string, tipo: string) {
  const blob = contenido instanceof Blob ? contenido : new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombre;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
