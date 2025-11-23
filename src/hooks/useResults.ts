import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Result {
  id_resultado: number;
  palabra: string;
  fuente_nombre: string;
  titulo: string;
  url?: string;
  autor: string;
  descripcion?: string;
  fecha_publicacion: string;
  sentimiento: string;
  relevancia: number;
}

export function useResults(limit = 10, offset = 0, idPalabra?: number, sentimiento?: string) {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error: err } = await supabase.rpc('obtener_resultados_todos', {
          p_limite: limit,
          p_desplazamiento: offset,
          p_id_palabra: idPalabra,
          p_sentimiento: sentimiento,
        });
        
        if (err) throw err;
        setResults(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [limit, offset, idPalabra, sentimiento]);

  const loadResults = async () => {
    setLoading(true);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error: err } = await supabase.rpc('obtener_resultados_todos', {
        p_limite: limit,
        p_desplazamiento: offset,
        p_id_palabra: idPalabra,
        p_sentimiento: sentimiento,
      });
      
      if (err) throw err;
      setResults(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching results');
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, loadResults };
}
