'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Clock } from 'lucide-react';

interface RegistroTiempoProps {
  tareaId: number;
  onRegistroCompleto?: () => void;
}

export function RegistroTiempo({ tareaId, onRegistroCompleto }: RegistroTiempoProps) {
  const [horas, setHoras] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cargando, setCargando] = useState(false);
  const [registros, setRegistros] = useState<any[]>([]);
  const { toast } = useToast();

  const registrar = async () => {
    if (!horas || parseFloat(horas) <= 0) {
      toast({
        title: 'Error',
        description: 'Ingresa horas válidas',
        variant: 'destructive',
      });
      return;
    }

    setCargando(true);
    try {
      const response = await fetch('/api/planificacion/registrar-tiempo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tareaId,
          horas: parseFloat(horas),
          descripcion,
        }),
      });

      if (!response.ok) throw new Error('Error al registrar');

      const nuevoRegistro = {
        horas: parseFloat(horas),
        descripcion,
        fecha: new Date().toLocaleDateString(),
      };

      setRegistros([...registros, nuevoRegistro]);
      setHoras('');
      setDescripcion('');

      toast({
        title: 'Éxito',
        description: `${horas} horas registradas`,
      });

      onRegistroCompleto?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCargando(false);
    }
  };

  const totalHoras = registros.reduce((sum, r) => sum + r.horas, 0);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-sm text-gray-600">Total de Horas</div>
        <div className="text-2xl font-bold">{totalHoras.toFixed(1)}h</div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Horas</label>
          <Input
            type="number"
            step="0.5"
            value={horas}
            onChange={(e) => setHoras(e.target.value)}
            placeholder="0.5"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Descripción</label>
          <Textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="¿Qué hiciste?"
            rows={2}
          />
        </div>

        <Button onClick={registrar} disabled={cargando} className="w-full">
          <Clock className="w-4 h-4 mr-2" />
          {cargando ? 'Registrando...' : 'Registrar Tiempo'}
        </Button>
      </div>

      {registros.length > 0 && (
        <div className="border rounded-lg p-3">
          <h4 className="font-semibold mb-2">Historial</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {registros.map((r, idx) => (
              <div key={idx} className="text-sm border-b pb-2">
                <p className="font-medium">{r.horas}h - {r.fecha}</p>
                <p className="text-gray-600">{r.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
