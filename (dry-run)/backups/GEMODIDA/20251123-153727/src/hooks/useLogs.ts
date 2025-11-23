import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Log {
  id_log: number;
  tipo_proceso: string;
  estado: string;
  mensaje: string;
  fecha_inicio: string;
}

export function useLogs(limit = 10, offset = 0, tipoProceso?: string) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error: err } = await supabase.rpc('obtener_logs_todos', {
          p_limite: limit,
          p_desplazamiento: offset,
          p_tipo_proceso: tipoProceso,
        });
        
        if (err) throw err;
        setLogs(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [limit, offset, tipoProceso]);

  const deleteLogs = async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await supabase.from('logs').delete().neq('id_log', 0);
      setLogs([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting logs');
    }
  };

  return { logs, loading, error, deleteLogs };
}
