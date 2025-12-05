'use client';

import { useState } from 'react';
import { FormularioPlanificacion } from '@/components/planificacion/FormularioPlanificacion';
import { DashboardTareas } from '@/components/planificacion/DashboardTareas';
import { RegistroTiempo } from '@/components/planificacion/RegistroTiempo';
import { ReportesAvance } from '@/components/planificacion/ReportesAvance';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PlanificacionPage() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tab, setTab] = useState<'tareas' | 'tiempo' | 'reportes'>('tareas');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Planificación</h1>
        <Button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          {mostrarFormulario ? 'Cancelar' : 'Nueva Planificación'}
        </Button>
      </div>

      {mostrarFormulario && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Crear Nueva Planificación</h2>
          <FormularioPlanificacion
            onPlanificacionCreada={() => setMostrarFormulario(false)}
          />
        </div>
      )}

      <div className="flex gap-2 border-b">
        <Button
          variant={tab === 'tareas' ? 'default' : 'ghost'}
          onClick={() => setTab('tareas')}
        >
          Tareas
        </Button>
        <Button
          variant={tab === 'tiempo' ? 'default' : 'ghost'}
          onClick={() => setTab('tiempo')}
        >
          Registro de Tiempo
        </Button>
        <Button
          variant={tab === 'reportes' ? 'default' : 'ghost'}
          onClick={() => setTab('reportes')}
        >
          Reportes
        </Button>
      </div>

      {tab === 'tareas' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Gestión de Tareas</h2>
          <DashboardTareas />
        </div>
      )}

      {tab === 'tiempo' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Registro de Tiempo</h2>
          <RegistroTiempo tareaId={1} />
        </div>
      )}

      {tab === 'reportes' && (
        <div>
          <ReportesAvance />
        </div>
      )}
    </div>
  );
}
