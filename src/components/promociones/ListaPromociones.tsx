'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Promocion } from '@/services/PromocioneService';
import { Trash2, Play } from 'lucide-react';

interface Props {
  promociones: Promocion[];
  onEliminar: (id: number) => Promise<void>;
  onEjecutar: (id: number) => Promise<void>;
  loading?: boolean;
}

export function ListaPromociones({ promociones, onEliminar, onEjecutar, loading }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Promociones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {promociones.map((promo) => (
            <div key={promo.id} className="flex items-center justify-between p-3 border rounded">
              <div className="flex-1">
                <p className="font-medium">{promo.nombre}</p>
                <p className="text-sm text-gray-600">{promo.descripcion}</p>
                <div className="flex gap-2 mt-2">
                  <Badge>{promo.tipo}</Badge>
                  <Badge variant={promo.estado === 'activa' ? 'default' : 'secondary'}>
                    {promo.estado}
                  </Badge>
                  <span className="text-sm">{promo.valor}% - Uso: {promo.uso_actual}/{promo.limite_uso}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {promo.estado === 'activa' && (
                  <Button
                    size="sm"
                    onClick={() => onEjecutar(promo.id!)}
                    disabled={loading}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onEliminar(promo.id!)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
