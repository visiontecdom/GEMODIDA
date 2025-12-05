'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface CambioEstadoEncuestaProps {
  id_diseno: number;
  estado_actual: string;
  onEstadoCambiado: (nuevoEstado: string) => void;
}

const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  'borrador': ['revision', 'archivo'],
  'revision': ['borrador', 'aprobacion'],
  'aprobacion': ['revision', 'publicacion'],
  'publicacion': ['recoleccion'],
  'recoleccion': ['cierre'],
  'cierre': ['validacion'],
  'validacion': ['informe'],
  'informe': ['archivo'],
};

const ETIQUETAS_ESTADO: Record<string, string> = {
  'borrador': 'Borrador',
  'revision': 'Revisión',
  'aprobacion': 'Aprobación',
  'publicacion': 'Publicación',
  'recoleccion': 'Recolección',
  'cierre': 'Cierre',
  'validacion': 'Validación',
  'informe': 'Informe',
  'archivo': 'Archivo',
};

export function CambioEstadoEncuesta({
  id_diseno,
  estado_actual,
  onEstadoCambiado,
}: CambioEstadoEncuestaProps) {
  const [abierto, setAbierto] = useState(false);
  const [estado_nuevo, setEstadoNuevo] = useState('');
  const [razon, setRazon] = useState('');
  const [cargando, setCargando] = useState(false);
  const { toast } = useToast();

  const transiciones_disponibles = TRANSICIONES_VALIDAS[estado_actual] || [];

  const handleCambiarEstado = async () => {
    if (!estado_nuevo) {
      toast({
        title: 'Error',
        description: 'Selecciona un nuevo estado',
        variant: 'destructive',
      });
      return;
    }

    setCargando(true);
    try {
      const response = await fetch('/api/encuestas/cambiar-estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_diseno,
          estado_nuevo,
          razon,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al cambiar estado');
      }

      toast({
        title: 'Éxito',
        description: `Estado cambiado a ${ETIQUETAS_ESTADO[estado_nuevo]}`,
        variant: 'default',
      });

      onEstadoCambiado(estado_nuevo);
      setAbierto(false);
      setEstadoNuevo('');
      setRazon('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cambiar el estado',
        variant: 'destructive',
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setAbierto(true)}
        variant="outline"
        size="sm"
      >
        Cambiar Estado
      </Button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado de Encuesta</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Estado Actual</label>
              <p className="text-sm text-gray-600">{ETIQUETAS_ESTADO[estado_actual]}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Nuevo Estado</label>
              <select
                value={estado_nuevo}
                onChange={(e) => setEstadoNuevo(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Selecciona un estado</option>
                {transiciones_disponibles.map((estado) => (
                  <option key={estado} value={estado}>
                    {ETIQUETAS_ESTADO[estado]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Razón (opcional)</label>
              <Textarea
                value={razon}
                onChange={(e) => setRazon(e.target.value)}
                placeholder="Explica por qué cambias el estado..."
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setAbierto(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCambiarEstado}
                disabled={cargando}
              >
                {cargando ? 'Cambiando...' : 'Cambiar Estado'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
