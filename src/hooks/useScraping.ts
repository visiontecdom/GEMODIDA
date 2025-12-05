import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface ConfiguracionScraping {
  id: number;
  nombre: string;
  fuente: string;
  url?: string;
  palabras_clave: string[];
  frecuencia: string;
  activo: boolean;
}

interface ResultadoScraping {
  id: number;
  titulo: string;
  contenido: string;
  url: string;
  fuente: string;
  sentimiento: string;
  creado_en: string;
}

export function useScraping() {
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionScraping[]>([]);
  const [resultados, setResultados] = useState<ResultadoScraping[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarConfiguraciones();
  }, []);

  const cargarConfiguraciones = async () => {
    setCargando(true);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { data, error } = await supabase
        .from('scraping_config')
        .select('*')
        .eq('activo', true);

      if (error) throw error;
      setConfiguraciones(data || []);
    } finally {
      setCargando(false);
    }
  };

  const cargarResultados = async (configId?: number) => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      let query = supabase.from('scraping_resultados').select('*');

      if (configId) {
        query = query.eq('config_id', configId);
      }

      const { data, error } = await query.order('creado_en', { ascending: false });

      if (error) throw error;
      setResultados(data || []);
    } catch (error) {
      console.error('Error cargando resultados:', error);
    }
  };

  return {
    configuraciones,
    resultados,
    cargando,
    cargarConfiguraciones,
    cargarResultados,
  };
}
