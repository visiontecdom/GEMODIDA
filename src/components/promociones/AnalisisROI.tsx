'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Promocion } from '@/services/PromocioneService';
import { PromocioneService } from '@/services/PromocioneService';

interface Props {
  promocion: Promocion;
}

export function AnalisisROI({ promocion }: Props) {
  const [roi, setRoi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const service = new PromocioneService();

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await service.calcularROI(promocion.id!);
        setRoi(data);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [promocion.id]);

  if (loading) return <div>Cargando...</div>;
  if (!roi) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis ROI - {promocion.nombre}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Inversión</p>
            <p className="text-2xl font-bold">${roi.inversion.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Retorno</p>
            <p className="text-2xl font-bold">${roi.retorno.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">ROI</p>
            <p className="text-2xl font-bold text-green-600">{roi.roi.toFixed(1)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
