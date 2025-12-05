'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Play, Loader } from 'lucide-react';

interface MotorScrapingProps {
  configuraciones: any[];
  onScrapingCompleto?: (resultados: any[]) => void;
}

export function MotorScraping({ configuraciones, onScrapingCompleto }: MotorScrapingProps) {
  const [ejecutando, setEjecutando] = useState(false);
  const [configSeleccionada, setConfigSeleccionada] = useState<number | null>(null);
  const [resultados, setResultados] = useState<any[]>([]);
  const { toast } = useToast();

  const ejecutarScraping = async (configId: number) => {
    setEjecutando(true);
    try {
      const response = await fetch('/api/scraping/ejecutar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configId }),
      });

      if (!response.ok) throw new Error('Error al ejecutar scraping');

      const data = await response.json();
      setResultados(data.resultados);
      setConfigSeleccionada(configId);

      toast({
        title: 'Éxito',
        description: `${data.cantidad} resultados obtenidos`,
      });

      onScrapingCompleto?.(data.resultados);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setEjecutando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {configuraciones.map((config) => (
          <div key={config.id} className="border rounded-lg p-4">
            <h3 className="font-semibold">{config.nombre}</h3>
            <p className="text-sm text-gray-600">{config.fuente}</p>
            <p className="text-xs text-gray-500 mt-2">
              {config.palabras_clave.join(', ')}
            </p>
            <Button
              onClick={() => ejecutarScraping(config.id)}
              disabled={ejecutando}
              size="sm"
              className="mt-3 w-full"
            >
              {ejecutando ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Ejecutando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Ejecutar
                </>
              )}
            </Button>
          </div>
        ))}
      </div>

      {resultados.length > 0 && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold mb-3">Resultados ({resultados.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {resultados.map((r, idx) => (
              <div key={idx} className="bg-white p-2 rounded border text-sm">
                <p className="font-medium">{r.titulo}</p>
                <p className="text-gray-600">{r.fuente}</p>
                <span className={`text-xs px-2 py-1 rounded ${
                  r.sentimiento === 'positivo' ? 'bg-green-100 text-green-800' :
                  r.sentimiento === 'negativo' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {r.sentimiento}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
