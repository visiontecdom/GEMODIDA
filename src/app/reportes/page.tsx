'use client';

import { DashboardKPIs } from '@/components/reportes/DashboardKPIs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function ReportesPage() {
  const handleExportar = () => {
    const data = {
      fecha: new Date().toISOString(),
      kpis: 'Datos de KPIs exportados'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reportes e Indicadores</h1>
        <Button onClick={handleExportar}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KPIs Principales</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardKPIs />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen Ejecutivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Período</p>
              <p className="text-lg font-bold">Último mes</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <p className="text-lg font-bold text-green-600">En Progreso</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
