'use client';

import { usePlanificacion } from '@/hooks/usePlanificacion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function ReportesAvance() {
  const { planificaciones, tareas } = usePlanificacion();
  const [exportando, setExportando] = useState(false);
  const { toast } = useToast();

  const datosAvance = planificaciones.map((p) => {
    const tareasDelPlan = tareas.filter((t) => t.planificacion_id === p.id);
    const completadas = tareasDelPlan.filter((t) => t.estado === 'completada').length;
    const progreso = tareasDelPlan.length > 0 ? (completadas / tareasDelPlan.length) * 100 : 0;

    return {
      nombre: p.nombre,
      progreso: Math.round(progreso),
      completadas,
      total: tareasDelPlan.length,
    };
  });

  const datosVencidas = tareas
    .filter((t) => t.estado !== 'completada' && new Date(t.fecha_fin) < new Date())
    .map((t) => ({
      titulo: t.titulo,
      vencida: true,
    }));

  const exportarReporte = async () => {
    setExportando(true);
    try {
      const contenido = `
REPORTE DE AVANCE DE PLANIFICACIÓN
Fecha: ${new Date().toLocaleDateString()}

RESUMEN GENERAL
- Total de Planificaciones: ${planificaciones.length}
- Total de Tareas: ${tareas.length}
- Tareas Completadas: ${tareas.filter((t) => t.estado === 'completada').length}
- Tareas Vencidas: ${datosVencidas.length}

AVANCE POR PLANIFICACIÓN
${datosAvance.map((d) => `- ${d.nombre}: ${d.progreso}% (${d.completadas}/${d.total})`).join('\n')}

TAREAS VENCIDAS
${datosVencidas.length > 0 ? datosVencidas.map((t) => `- ${t.titulo}`).join('\n') : 'Ninguna'}
      `;

      const blob = new Blob([contenido], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-avance-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Éxito',
        description: 'Reporte exportado',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Reportes de Avance</h3>
        <Button
          onClick={exportarReporte}
          disabled={exportando}
          size="sm"
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold mb-4">Progreso por Planificación</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={datosAvance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="progreso" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Tareas</div>
          <div className="text-2xl font-bold">{tareas.length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Completadas</div>
          <div className="text-2xl font-bold">
            {tareas.filter((t) => t.estado === 'completada').length}
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Vencidas</div>
          <div className="text-2xl font-bold">{datosVencidas.length}</div>
        </div>
      </div>

      {datosVencidas.length > 0 && (
        <div className="border rounded-lg p-4 bg-red-50">
          <h4 className="font-semibold text-red-900 mb-2">Tareas Vencidas</h4>
          <ul className="space-y-1">
            {datosVencidas.map((t, idx) => (
              <li key={idx} className="text-sm text-red-800">• {t.titulo}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
