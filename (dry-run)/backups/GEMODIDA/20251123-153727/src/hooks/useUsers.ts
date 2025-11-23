import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface User {
  id_usuario: string;
  nombre_completo: string;
  correo: string;
  rol_nombre: string;
  esta_activo: boolean;
  creado_en: string;
}

export function useUsers(limit = 10, offset = 0) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error: err } = await supabase.rpc('obtener_usuarios', {
          p_limite: limit,
          p_desplazamiento: offset,
        });
        
        if (err) throw err;
        setUsers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [limit, offset]);

  const addUser = async (data: any) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error: err } = await supabase.from('usuarios').insert([data]);
    if (err) throw err;
  };

  const updateUser = async (id: string, data: any) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error: err } = await supabase
      .from('usuarios')
      .update(data)
      .eq('id_usuario', id);
    if (err) throw err;
  };

  const deleteUser = async (id: string) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error: err } = await supabase
      .from('usuarios')
      .delete()
      .eq('id_usuario', id);
    if (err) throw err;
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error: err } = await supabase.rpc('obtener_usuarios', {
        p_limite: limit,
        p_desplazamiento: offset,
      });
      
      if (err) throw err;
      setUsers(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, error, addUser, updateUser, deleteUser, loadUsers };
}
