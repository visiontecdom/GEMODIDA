'use client';

import { useState } from 'react';
import { FormularioRegistroActividad } from '@/components/actividades/FormularioRegistroActividad';
import { DashboardActividades } from '@/components/actividades/DashboardActividades';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ActividadesPage() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Actividades</h1>
        <Button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          {mostrarFormulario ? 'Cancelar' : 'Nueva Actividad'}
        </Button>
      </div>

      {mostrarFormulario && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Registrar Nueva Actividad</h2>
          <FormularioRegistroActividad
            onActividadRegistrada={() => setMostrarFormulario(false)}
          />
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Seguimiento de Actividades</h2>
        <DashboardActividades />
      </div>
    </div>
  );
}
