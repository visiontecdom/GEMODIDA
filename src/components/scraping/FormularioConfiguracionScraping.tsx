'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface FormularioConfiguracionScrapingProps {
  onConfiguracionCreada?: (config: any) => void;
}

const FUENTES = ['Facebook', 'Instagram', 'Twitter', 'YouTube', 'Portales', 'Blogs'];
const FRECUENCIAS = ['horaria', 'diaria', 'semanal', 'mensual'];

export function FormularioConfiguracionScraping({
  onConfiguracionCreada,
}: FormularioConfiguracionScrapingProps) {
  const [cargando, setCargando] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);

    try {
      const formData = new FormData(e.currentTarget);
      const palabrasTexto = formData.get('palabras_clave') as string;
      const palabrasClave = palabrasTexto
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p);

      const config = {
        nombre: formData.get('nombre'),
        fuente: formData.get('fuente'),
        url: formData.get('url'),
        palabras_clave: palabrasClave,
        frecuencia: formData.get('frecuencia'),
      };

      const response = await fetch('/api/scraping/crear-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error('Error al crear configuración');

      toast({
        title: 'Éxito',
        description: 'Configuración de scraping creada',
      });

      onConfiguracionCreada?.(config);
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
          placeholder="Nombre de la configuración"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Fuente *</label>
        <select
          name="fuente"
          required
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">Selecciona una fuente</option>
          {FUENTES.map((fuente) => (
            <option key={fuente} value={fuente}>
              {fuente}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">URL (opcional)</label>
        <Input
          name="url"
          type="url"
          placeholder="https://ejemplo.com"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Palabras Clave *</label>
        <Textarea
          name="palabras_clave"
          placeholder="Ingresa palabras clave separadas por comas"
          required
          rows={3}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Frecuencia *</label>
        <select
          name="frecuencia"
          required
          className="w-full px-3 py-2 border rounded-md"
        >
          {FRECUENCIAS.map((freq) => (
            <option key={freq} value={freq}>
              {freq.charAt(0).toUpperCase() + freq.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" disabled={cargando}>
        {cargando ? 'Creando...' : 'Crear Configuración'}
      </Button>
    </form>
  );
}
