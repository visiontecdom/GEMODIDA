import { useState, useCallback } from 'react';

export function useExportadorEncuesta() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertirACSV = useCallback((datos: any[]): string => {
    if (!datos.length) return '';
    const headers = Object.keys(datos[0]);
    return [
      headers.join(','),
      ...datos.map((row) =>
        headers
          .map((h) => `"${String(row[h] || '').replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');
  }, []);

  const descargarArchivo = useCallback(
    (contenido: string | Blob, nombre: string, tipo: string) => {
      const blob =
        contenido instanceof Blob
          ? contenido
          : new Blob([contenido], { type: tipo });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombre;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    []
  );

  const exportarCSV = useCallback(
    (datos: any[], nombre: string) => {
      try {
        const csv = convertirACSV(datos);
        descargarArchivo(csv, `${nombre}.csv`, 'text/csv');
        setError(null);
      } catch (err: any) {
        setError(err.message);
      }
    },
    [convertirACSV, descargarArchivo]
  );

  const exportarExcel = useCallback(
    async (id: number, datos: any[], nombre: string) => {
      setCargando(true);
      try {
        const response = await fetch('/api/encuestas/exportar-excel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_diseno: id, resultados: datos }),
        });

        if (!response.ok) throw new Error('Error al exportar');

        const blob = await response.blob();
        descargarArchivo(blob, `${nombre}.xlsx`, 'application/vnd.ms-excel');
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    },
    [descargarArchivo]
  );

  const exportarPDF = useCallback(
    async (id: number, datos: any[], nombre: string) => {
      setCargando(true);
      try {
        const response = await fetch('/api/encuestas/exportar-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_diseno: id, resultados: datos }),
        });

        if (!response.ok) throw new Error('Error al exportar');

        const blob = await response.blob();
        descargarArchivo(blob, `${nombre}.pdf`, 'application/pdf');
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    },
    [descargarArchivo]
  );

  return {
    cargando,
    error,
    exportarCSV,
    exportarExcel,
    exportarPDF,
  };
}
