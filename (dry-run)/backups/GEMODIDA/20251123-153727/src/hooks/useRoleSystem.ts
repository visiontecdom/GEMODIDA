'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

interface UserGroup {
  id_grupo: number;
  codigo_grupo: string;
  nombre_grupo: string;
  descripcion?: string;
}

interface UserRole {
  id_rol: number;
  codigo_rol: string;
  nombre_rol: string;
  nivel_acceso: number;
  permisos_json: Record<string, any>;
  puede_crear_usuarios: boolean;
  puede_ver_todas_sucursales: boolean;
}

interface Sucursal {
  id_suc: number;
  nombre_sucursal: string;
  provincia: string;
}

interface UserAssignment {
  id_asignacion: number;
  grupo: UserGroup;
  rol: UserRole;
  sucursal: Sucursal;
  es_principal: boolean;
  esta_activa: boolean;
}

interface UserPermissions {
  usuario: {
    id: string;
    nombre: string;
    correo: string;
    esta_activo: boolean;
  };
  asignaciones: UserAssignment[];
}

interface CreateUserData {
  correo: string;
  password: string;
  nombre_completo: string;
  telefono?: string;
  id_grupo: number;
  id_rol: number;
  id_sucursal: number;
}

export function useRoleSystem() {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabaseRef = useRef(createClient());

  // Cargar permisos del usuario actual
  const loadUserPermissions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await (supabaseRef.current as any).rpc('obtener_permisos_usuario', {
        p_user_id: user.id
      });

      if (error) throw error;
      setUserPermissions(data);
    } catch (err: any) {
      // RPC failed (404 or 500). Fall back to resilient direct queries that do not rely on RPC
      try {
        const sup = supabaseRef.current as any;

        const { data: uData, error: uErr } = await sup
          .from('usuarios')
          .select('id_usuario, nombre_completo, correo, esta_activo')
          .eq('id_usuario', user.id)
          .maybeSingle();

        if (uErr) throw uErr;

        // Attempt to fetch joined assignments; if relationships are missing, fallback to raw rows
        let assignments: any[] = [];
        try {
          const { data: asigData, error: asigErr } = await sup
            .from('usuarios_asignaciones')
            .select(
              `id_asignacion, es_principal, esta_activa, id_rol, id_grupo, id_sucursal, usuarios_roles(id_rol, codigo_rol, nombre_rol, nivel_acceso, permisos_json, puede_ver_todas_sucursales, puede_crear_usuarios), usuarios_grupos(id_grupo, codigo_grupo, nombre_grupo), sucursales(id_suc, nombre_sucursal, provincia)`
            )
            .eq('id_usuario', user.id)
            .eq('esta_activa', true);

          if (asigErr) throw asigErr;
          assignments = asigData || [];
        } catch (innerErr) {
          const { data: rawAssign, error: rawErr } = await sup
            .from('usuarios_asignaciones')
            .select('id_asignacion, id_rol, id_grupo, id_sucursal, es_principal, esta_activa')
            .eq('id_usuario', user.id)
            .eq('esta_activa', true);

          if (rawErr) throw rawErr;

          const roleIds = Array.from(new Set((rawAssign || []).map((r: any) => r.id_rol)));
          const groupIds = Array.from(new Set((rawAssign || []).map((r: any) => r.id_grupo)));
          const sucIds = Array.from(new Set((rawAssign || []).map((r: any) => r.id_sucursal)));

          const [rolesRes, groupsRes, sucsRes] = await Promise.all([
            sup.from('usuarios_roles').select('id_rol, codigo_rol, nombre_rol, nivel_acceso, permisos_json, puede_ver_todas_sucursales, puede_crear_usuarios').in('id_rol', roleIds || []),
            sup.from('usuarios_grupos').select('id_grupo, codigo_grupo, nombre_grupo').in('id_grupo', groupIds || []),
            sup.from('sucursales').select('id_suc, nombre_sucursal, provincia').in('id_suc', sucIds || [])
          ]);

          const rolesMap = (rolesRes.data || []).reduce((acc: any, r: any) => { acc[r.id_rol] = r; return acc; }, {});
          const groupsMap = (groupsRes.data || []).reduce((acc: any, g: any) => { acc[g.id_grupo] = g; return acc; }, {});
          const sucsMap = (sucsRes.data || []).reduce((acc: any, s: any) => { acc[s.id_suc] = s; return acc; }, {});

          assignments = (rawAssign || []).map((r: any) => ({
            id_asignacion: r.id_asignacion,
            es_principal: r.es_principal,
            esta_activa: r.esta_activa,
            grupo: groupsMap[r.id_grupo] || null,
            rol: rolesMap[r.id_rol] || null,
            sucursal: sucsMap[r.id_sucursal] || null
          }));
        }

        const result = {
          usuario: uData || null,
          asignaciones: assignments || []
        };

        setUserPermissions(result as UserPermissions);
      } catch (fallbackErr: any) {
        setError(fallbackErr?.message || String(err));
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Cargar grupos disponibles
  const loadGroups = useCallback(async () => {
    try {
      const { data, error } = await (supabaseRef.current as any)
        .from('usuarios_grupos')
        .select('*')
        .eq('esta_activo', true)
        .order('nombre_grupo');

      if (error) throw error;
      setGroups(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  // Cargar roles disponibles
  const loadRoles = useCallback(async () => {
    try {
      const { data, error } = await (supabaseRef.current as any)
        .from('usuarios_roles')
        .select('*')
        .eq('esta_activo', true)
        .order('nivel_acceso', { ascending: false });

      if (error) throw error;
      setRoles(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  // Cargar sucursales disponibles
  const loadSucursales = useCallback(async () => {
    try {
      const { data, error } = await (supabaseRef.current as any)
        .from('sucursales')
        .select('id_suc, nombre_sucursal, provincia')
        .ilike('estado', 'activo')
        .order('nombre_sucursal');

      if (error) throw error;
      setSucursales(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  // Crear usuario completo
  const createUser = useCallback(async (userData: CreateUserData) => {
    if (!user?.id) throw new Error('Usuario no autenticado');

    try {
      setLoading(true);
      
      // Obtener códigos de rol y grupo
      const selectedRole = roles.find(r => r.id_rol === userData.id_rol);
      const selectedGroup = groups.find(g => g.id_grupo === userData.id_grupo);
      
      if (!selectedRole || !selectedGroup) {
        throw new Error('Rol o grupo no válido');
      }

      const { data, error } = await (supabaseRef.current as any).rpc('crear_nuevo_usuario_sistema', {
        p_email: userData.correo,
        p_password: userData.password,
        p_nombre_completo: userData.nombre_completo,
        p_codigo_rol: selectedRole.codigo_rol,
        p_codigo_grupo: selectedGroup.codigo_grupo,
        p_id_sucursal: userData.id_sucursal
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.message || 'Error al crear usuario');
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, roles, groups]);

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = useCallback((permission: string): boolean => {
    if (!userPermissions?.asignaciones) return false;

    return userPermissions.asignaciones.some(asignacion => {
      if (!asignacion.esta_activa) return false;
      
      // Super usuarios y admins tienen todos los permisos
      if (['admin', 'super_user'].includes(asignacion.rol.codigo_rol)) {
        return true;
      }

      // Verificar permiso específico en JSON
      return asignacion.rol.permisos_json[permission] === true;
    });
  }, [userPermissions]);

  // Verificar si el usuario tiene un rol específico
  const hasRole = useCallback((roleCode: string): boolean => {
    if (!userPermissions?.asignaciones) return false;

    return userPermissions.asignaciones.some(asignacion => 
      asignacion.esta_activa && asignacion.rol.codigo_rol === roleCode
    );
  }, [userPermissions]);

  // Verificar si el usuario pertenece a un grupo específico
  const hasGroup = useCallback((groupCode: string): boolean => {
    if (!userPermissions?.asignaciones) return false;

    return userPermissions.asignaciones.some(asignacion => 
      asignacion.esta_activa && asignacion.grupo.codigo_grupo === groupCode
    );
  }, [userPermissions]);

  // Obtener sucursales del usuario
  const getUserSucursales = useCallback((): Sucursal[] => {
    if (!userPermissions?.asignaciones) return [];

    return userPermissions.asignaciones
      .filter(asignacion => asignacion.esta_activa)
      .map(asignacion => asignacion.sucursal);
  }, [userPermissions]);

  // Verificar si puede ver todas las sucursales
  const canViewAllSucursales = useCallback((): boolean => {
    if (!userPermissions?.asignaciones) return false;

    return userPermissions.asignaciones.some(asignacion => 
      asignacion.esta_activa && asignacion.rol.puede_ver_todas_sucursales
    );
  }, [userPermissions]);

  // Obtener asignación principal
  const getPrimaryAssignment = useCallback((): UserAssignment | null => {
    if (!userPermissions?.asignaciones) return null;

    return userPermissions.asignaciones.find(asignacion => 
      asignacion.esta_activa && asignacion.es_principal
    ) || null;
  }, [userPermissions]);

  // Obtener nivel de acceso máximo
  const getMaxAccessLevel = useCallback((): number => {
    if (!userPermissions?.asignaciones) return 0;

    return Math.max(
      ...userPermissions.asignaciones
        .filter(asignacion => asignacion.esta_activa)
        .map(asignacion => asignacion.rol.nivel_acceso)
    );
  }, [userPermissions]);

  // Cargar datos iniciales
  useEffect(() => {
    if (user?.id) {
      loadUserPermissions();
      loadGroups();
      loadRoles();
      loadSucursales();
    }
  }, [user?.id, loadUserPermissions, loadGroups, loadRoles, loadSucursales]);

  return {
    // Estado
    userPermissions,
    groups,
    roles,
    sucursales,
    loading,
    error,

    // Acciones
    loadUserPermissions,
    loadGroups,
    loadRoles,
    loadSucursales,
    createUser,

    // Verificaciones
    hasPermission,
    hasRole,
    hasGroup,
    canViewAllSucursales,

    // Utilidades
    getUserSucursales,
    getPrimaryAssignment,
    getMaxAccessLevel,

    // Limpiar error
    clearError: () => setError(null)
  };
}
