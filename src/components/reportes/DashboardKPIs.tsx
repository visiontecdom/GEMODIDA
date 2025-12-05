'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPIService, KPI } from '@/services/KPIService';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function DashboardKPIs() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const service = new KPIService();

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await service.calcularKPIs();
        setKpis(data);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  if (loading) return <div>Cargando KPIs...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              {kpi.nombre}
              {kpi.tendencia === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{kpi.valor}</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(kpi.porcentaje, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600">
                {kpi.porcentaje.toFixed(1)}% de meta ({kpi.meta})
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
