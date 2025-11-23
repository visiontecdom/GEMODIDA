'use client';

import { useMemo } from 'react';
import { useKeywords } from '@/hooks/useKeywords';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import { Download, Printer } from 'lucide-react';

export default function AnalyticsPage() {
  const { keywords } = useKeywords();
  const { stats } = useDashboardStats();

  const keywordsData = useMemo(() => {
    if (!keywords || keywords.length === 0) return [];
    return keywords.slice(0, 10).map(k => ({
      name: k.palabra,
      resultados: k.total_resultados || 0,
    }));
  }, [keywords]);

  const usersData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Activos', value: stats.usuarios_activos },
      { name: 'Inactivos', value: Math.max(0, stats.total_usuarios - stats.usuarios_activos) },
    ];
  }, [stats]);

  const reportsData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Completados', value: stats.total_palabras_clave - stats.reportes_pendientes },
      { name: 'Pendientes', value: stats.reportes_pendientes },
    ];
  }, [stats]);

  const trendData = useMemo(() => {
    return [
      { mes: 'Ene', keywords: 15, resultados: 450 },
      { mes: 'Feb', keywords: 18, resultados: 520 },
      { mes: 'Mar', keywords: 22, resultados: 680 },
      { mes: 'Abr', keywords: 24, resultados: 720 },
    ];
  }, []);

  const printChart = (chartId: string) => {
    const element = document.getElementById(chartId);
    if (!element) return;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Gráfico - ${chartId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${element.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análisis y Estadísticas</h1>
        <p className="text-muted-foreground mt-2">Visualiza datos estadísticos del sistema</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card id="chart-keywords-bar">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top 10 Palabras Clave</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => printChart('chart-keywords-bar')}>
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {keywordsData.length > 0 ? (
              <BarChartComponent data={keywordsData} dataKey="resultados" xAxisKey="name" />
            ) : (
              <p className="text-muted-foreground">Sin datos</p>
            )}
          </CardContent>
        </Card>

        <Card id="chart-users-pie">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Distribución de Usuarios</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => printChart('chart-users-pie')}>
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {usersData.length > 0 ? (
              <PieChartComponent data={usersData} dataKey="value" nameKey="name" />
            ) : (
              <p className="text-muted-foreground">Sin datos</p>
            )}
          </CardContent>
        </Card>

        <Card id="chart-reports-pie">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Estado de Reportes</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => printChart('chart-reports-pie')}>
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {reportsData.length > 0 ? (
              <PieChartComponent data={reportsData} dataKey="value" nameKey="name" />
            ) : (
              <p className="text-muted-foreground">Sin datos</p>
            )}
          </CardContent>
        </Card>

        <Card id="chart-trend-line">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tendencia Mensual</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => printChart('chart-trend-line')}>
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <LineChartComponent data={trendData} dataKey="keywords" xAxisKey="mes" />
          </CardContent>
        </Card>

        <Card id="chart-keywords-horizontal">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Resultados por Keyword (Horizontal)</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => printChart('chart-keywords-horizontal')}>
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {keywordsData.length > 0 ? (
              <BarChartComponent data={keywordsData.slice(0, 5)} dataKey="resultados" xAxisKey="name" />
            ) : (
              <p className="text-muted-foreground">Sin datos</p>
            )}
          </CardContent>
        </Card>

        <Card id="chart-results-trend">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tendencia de Resultados</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => printChart('chart-results-trend')}>
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <LineChartComponent data={trendData} dataKey="resultados" xAxisKey="mes" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}