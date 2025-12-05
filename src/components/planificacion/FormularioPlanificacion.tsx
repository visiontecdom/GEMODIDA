'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface FormularioPlanificacionProps {
  onPlanificacionCreada?: (plan: any) => void;
}

export function FormularioPlanificacion({
  onPlanificacionCreada,
}: FormularioPlanificacionProps) {
  const [cargando, setCargando] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);

    try {
      const formData = new FormData(e.currentTarget);
      const plan = {
        nombre: formData.get('nombre'),
        descripcion: formData.get('descripcion'),
        fecha_inicio: formData.get('fecha_inicio'),
        fecha_fin: formData.get('fecha_fin'),
        presupuesto: formData.get('presupuesto') ? Number(formData.get('presupuesto')) : null,
      };

      const response = await fetch('/api/planificacion/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });

      if (!response.ok) throw new Error('Error al crear planificación');

      toast({
        title: 'Éxito',
        description: 'Planificación creada correctamente',
      });

      onPlanificacionCreada?.(plan);
      e.currentTarget.reset();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="text-sm font-medium">Nombre *</label>
        <Input
          name="nombre"
          placeholder="Nombre de la planificación"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Descripción</label>
        <Textarea
          name="descripcion"
          placeholder="Describe la planificación..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Fecha Inicio *</label>
          <Input
            name="fecha_inicio"
            type="date"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Fecha Fin *</label>
          <Input
            name="fecha_fin"
            type="date"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Presupuesto (opcional)</label>
        <Input
          name="presupuesto"
          type="number"
          step="0.01"
          placeholder="0.00"
        />
      </div>

      <Button type="submit" disabled={cargando}>
        {cargando ? 'Creando...' : 'Crear Planificación'}
      </Button>
    </form>
  );
}
