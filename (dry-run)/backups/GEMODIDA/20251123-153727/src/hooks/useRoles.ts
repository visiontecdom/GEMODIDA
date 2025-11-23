import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Role {
  id_rol: number;
  codigo_rol: string;
  nombre_rol: string;
  descripcion: string | null;
  nivel_acceso: number;
  permisos_json: Record<string, any>;
  puede_crear_usuarios: boolean;
  puede_ver_todas_sucursales: boolean;
  esta_activo: boolean;
}

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data, error: err } = await supabase
          .from('usuarios_roles')
          .select('*')
          .eq('esta_activo', true)
          .order('nivel_acceso', { ascending: false });
        
        if (err) throw err;
        setRoles(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching roles');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const addRole = async (data: Partial<Role>) => {
    const { error: err } = await supabase.from('usuarios_roles').insert([data]);
    if (err) throw err;
  };

  const updateRole = async (id: number, data: Partial<Role>) => {
    const { error: err } = await supabase
      .from('usuarios_roles')
      .update(data)
      .eq('id_rol', id);
    if (err) throw err;
  };

  const deleteRole = async (id: number) => {
    const { error: err } = await supabase
      .from('usuarios_roles')
      .delete()
      .eq('id_rol', id);
    if (err) throw err;
  };

  return { roles, loading, error, addRole, updateRole, deleteRole };
}
