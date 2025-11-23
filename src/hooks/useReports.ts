import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Report {
  id_reporte: string;
  titulo: string;
  tipo_reporte: string;
  estado: string;
  fecha_solicitud: string;
  fecha_completado: string | null;
}

export function useReports(limit = 10, offset = 0) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error: err } = await supabase.rpc('obtener_reportes_todos', {
          p_limite: limit,
          p_desplazamiento: offset,
        });
        
        if (err) throw err;
        setReports(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [limit, offset]);

  return { reports, loading, error };
}
