'use client';

import { usePlanificacion } from '@/hooks/usePlanificacion';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function DashboardPlanificacion() {
  const { planificaciones, tareas, cargando, cargarTareas } = usePlanificacion();
  const [planSeleccionada, setPlanSeleccionada] = useState<number | null>(null);

  const columnasPlanes = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'fecha_inicio', label: 'Inicio' },
    { key: 'fecha_fin', label: 'Fin' },
    { key: 'estado', label: 'Estado' },
    { key: 'progreso', label: 'Progreso' },
  ];

  const columnasTareas = [
    { key: 'titulo', label: 'Título' },
    { key: 'prioridad', label: 'Prioridad' },
    { key: 'estado', label: 'Estado' },
    { key: 'fecha_fin', label: 'Vencimiento' },
  ];

  const handleSeleccionarPlan = (planId: number) => {
    setPlanSeleccionada(planId);
    cargarTareas(planId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Planificaciones</h3>
        <DataTable
          columns={columnasPlanes}
          data={planificaciones}
          loading={cargando}
          actions={[
            {
              label: 'Ver Tareas',
              onClick: (row) => handleSeleccionarPlan(row.id),
            },
          ]}
        />
      </div>

      {planSeleccionada && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Tareas</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPlanSeleccionada(null)}
            >
              Cerrar
            </Button>
          </div>
          <DataTable
            columns={columnasTareas}
            data={tareas}
            loading={cargando}
            emptyMessage="No hay tareas para esta planificación"
          />
        </div>
      )}
    </div>
  );
}
