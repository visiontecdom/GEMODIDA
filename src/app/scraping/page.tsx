'use client';

import { useState } from 'react';
import { FormularioConfiguracionScraping } from '@/components/scraping/FormularioConfiguracionScraping';
import { MotorScraping } from '@/components/scraping/MotorScraping';
import { DashboardMonitoreo } from '@/components/scraping/DashboardMonitoreo';
import { useScraping } from '@/hooks/useScraping';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ScrapingPage() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const { configuraciones, cargarConfiguraciones } = useScraping();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Scraping de Datos</h1>
        <Button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          {mostrarFormulario ? 'Cancelar' : 'Nueva Configuración'}
        </Button>
      </div>

      {mostrarFormulario && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Crear Configuración</h2>
          <FormularioConfiguracionScraping
            onConfiguracionCreada={() => {
              setMostrarFormulario(false);
              cargarConfiguraciones();
            }}
          />
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Motor de Scraping</h2>
        <MotorScraping configuraciones={configuraciones} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Monitoreo en Tiempo Real</h2>
        <DashboardMonitoreo />
      </div>
    </div>
  );
}
