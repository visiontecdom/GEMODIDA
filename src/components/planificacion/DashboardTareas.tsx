'use client';

import { usePlanificacion } from '@/hooks/usePlanificacion';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function DashboardTareas() {
  const { tareas, cargando, cargarTareas } = usePlanificacion();
  const [filtroEstado, setFiltroEstado] = useState('');

  const tareasFiltradas = filtroEstado
    ? tareas.filter((t) => t.estado === filtroEstado)
    : tareas;

  const columnas = [
    { key: 'titulo', label: 'Título' },
    { key: 'prioridad', label: 'Prioridad' },
    { key: 'estado', label: 'Estado' },
    { key: 'fecha_fin', label: 'Vencimiento' },
  ];

  const estadisticas = {
    total: tareas.length,
    pendientes: tareas.filter((t) => t.estado === 'pendiente').length,
    enProgreso: tareas.filter((t) => t.estado === 'en_progreso').length,
    completadas: tareas.filter((t) => t.estado === 'completada').length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold">{estadisticas.total}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Pendientes</div>
          <div className="text-2xl font-bold">{estadisticas.pendientes}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">En Progreso</div>
          <div className="text-2xl font-bold">{estadisticas.enProgreso}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Completadas</div>
          <div className="text-2xl font-bold">{estadisticas.completadas}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filtroEstado === '' ? 'default' : 'outline'}
          onClick={() => setFiltroEstado('')}
          size="sm"
        >
          Todas
        </Button>
        <Button
          variant={filtroEstado === 'pendiente' ? 'default' : 'outline'}
          onClick={() => setFiltroEstado('pendiente')}
          size="sm"
        >
          Pendientes
        </Button>
        <Button
          variant={filtroEstado === 'en_progreso' ? 'default' : 'outline'}
          onClick={() => setFiltroEstado('en_progreso')}
          size="sm"
        >
          En Progreso
        </Button>
        <Button
          variant={filtroEstado === 'completada' ? 'default' : 'outline'}
          onClick={() => setFiltroEstado('completada')}
          size="sm"
        >
          Completadas
        </Button>
      </div>

      <DataTable
        columns={columnas}
        data={tareasFiltradas}
        loading={cargando}
      />
    </div>
  );
}
