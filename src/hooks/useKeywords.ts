import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Keyword {
  id_palabra: number;
  palabra: string;
  descripcion: string;
  total_resultados: number;
  es_publica: boolean;
  fecha_creacion: string;
}

export function useKeywords(limit = 10, offset = 0) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const { data, error: err } = await supabase.rpc('obtener_palabras_clave_todas', {
          p_limite: limit,
          p_desplazamiento: offset,
        });
        
        if (err) throw err;
        setKeywords(data || []);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error fetching keywords';
        setError(errorMsg);
        setKeywords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchKeywords();
  }, [limit, offset]);

  const addKeyword = async (palabra: string, descripcion?: string) => {
    const { error: err } = await supabase.from('palabras_clave').insert([
      { palabra, descripcion, es_publica: false, fecha_creacion: new Date() }
    ]);
    if (err) throw err;
  };

  const updateKeyword = async (id: number, data: { palabra: string; descripcion?: string }) => {
    const { error: err } = await supabase
      .from('palabras_clave')
      .update(data)
      .eq('id_palabra', id);
    if (err) throw err;
  };

  const deleteKeyword = async (id: number) => {
    const { error: err } = await supabase
      .from('palabras_clave')
      .delete()
      .eq('id_palabra', id);
    if (err) throw err;
  };

  const loadKeywords = async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase.rpc('obtener_palabras_clave_todas', {
        p_limite: limit,
        p_desplazamiento: offset,
      });
      
      if (err) throw err;
      setKeywords(data || []);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error fetching keywords';
      setError(errorMsg);
      setKeywords([]);
    } finally {
      setLoading(false);
    }
  };

  return { keywords, loading, error, addKeyword, updateKeyword, deleteKeyword, loadKeywords };
}
