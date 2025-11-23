import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface DashboardStats {
  total_usuarios: number;
  usuarios_activos: number;
  total_palabras_clave: number;
  total_resultados: number;
  resultados_hoy: number;
  reportes_pendientes: number;
  alertas_activas: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error: err } = await supabase.rpc('obtener_estadisticas_dashboard');
        
        if (err) throw err;
        if (data && data.length > 0) {
          setStats(data[0]);
        }
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error fetching stats';
        setError(errorMsg);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error: err } = await supabase.rpc('obtener_estadisticas_dashboard');
      
      if (err) throw err;
      if (data && data.length > 0) {
        setStats(data[0]);
      }
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error fetching stats';
      setError(errorMsg);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, loadStats };
}
