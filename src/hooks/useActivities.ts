import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Activity {
  id_actividad: number;
  tipo_actividad: string;
  descripcion: string;
  fecha: string;
  ubicacion: string;
  usuario_asignado: string;
  resultado: string;
  creado_en: string;
}

export function useActivities(limit = 10, offset = 0) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error: err } = await supabase.rpc('obtener_actividades', {
          p_limite: limit,
          p_desplazamiento: offset,
        });
        
        if (err) throw err;
        setActivities(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [limit, offset]);

  const addActivity = async (data: any) => {
    const { error: err } = await supabase.from('activities').insert([data]);
    if (err) throw err;
  };

  const updateActivity = async (id: number, data: any) => {
    const { error: err } = await supabase
      .from('activities')
      .update(data)
      .eq('id', id);
    if (err) throw err;
  };

  const deleteActivity = async (id: number) => {
    const { error: err } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);
    if (err) throw err;
  };

  const loadActivities = async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase.rpc('obtener_actividades', {
        p_limite: limit,
        p_desplazamiento: offset,
      });
      
      if (err) throw err;
      setActivities(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching activities');
    } finally {
      setLoading(false);
    }
  };

  return { activities, loading, error, addActivity, updateActivity, deleteActivity, loadActivities };
}
