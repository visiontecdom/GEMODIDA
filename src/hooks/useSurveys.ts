import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Survey {
  id_encuesta: number;
  titulo: string;
  descripcion: string;
  estado: string;
  fecha_creacion: string;
  total_respuestas: number;
}

export function useSurveys(limit = 10, offset = 0) {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const { data, error: err } = await supabase.rpc('obtener_encuestas', {
          p_limite: limit,
          p_desplazamiento: offset,
        });
        
        if (err) throw err;
        setSurveys(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching surveys');
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, [limit, offset]);

  const addSurvey = async (data: any) => {
    const { error: err } = await supabase.from('surveys').insert([data]);
    if (err) throw err;
  };

  const updateSurvey = async (id: number, data: any) => {
    const { error: err } = await supabase
      .from('surveys')
      .update(data)
      .eq('id_encuesta', id);
    if (err) throw err;
  };

  const deleteSurvey = async (id: number) => {
    const { error: err } = await supabase
      .from('surveys')
      .delete()
      .eq('id_encuesta', id);
    if (err) throw err;
  };

  return { surveys, loading, error, addSurvey, updateSurvey, deleteSurvey };
}
