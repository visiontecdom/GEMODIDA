'use client';

import { useScraping } from '@/hooks/useScraping';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function DashboardScraping() {
  const { configuraciones, resultados, cargando, cargarResultados } = useScraping();
  const [configSeleccionada, setConfigSeleccionada] = useState<number | null>(null);

  const columnas = [
    { key: 'titulo', label: 'Título' },
    { key: 'fuente', label: 'Fuente' },
    { key: 'sentimiento', label: 'Sentimiento' },
    { key: 'creado_en', label: 'Fecha' },
  ];

  const handleSeleccionarConfig = (configId: number) => {
    setConfigSeleccionada(configId);
    cargarResultados(configId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Configuraciones Activas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {configuraciones.map((config) => (
            <div
              key={config.id}
              className={`p-4 border rounded-lg cursor-pointer transition ${
                configSeleccionada === config.id
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => handleSeleccionarConfig(config.id)}
            >
              <div className="font-semibold">{config.nombre}</div>
              <div className="text-sm text-gray-600">{config.fuente}</div>
              <div className="text-xs text-gray-500 mt-2">
                {config.palabras_clave.join(', ')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Frecuencia: {config.frecuencia}
              </div>
            </div>
          ))}
        </div>
      </div>

      {configSeleccionada && (
        <div>
          <h3 className="font-semibold mb-4">Resultados</h3>
          <DataTable
            columns={columnas}
            data={resultados}
            loading={cargando}
            emptyMessage="No hay resultados para esta configuración"
          />
        </div>
      )}
    </div>
  );
}
