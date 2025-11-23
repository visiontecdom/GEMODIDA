'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

interface PlanificacionTrabajo {
  id_planificacion: number;
  titulo: string;
  descripcion?: string;
  tipo_trabajo: string;
  id_sucursal: number;
  id_usuario_responsable?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  estado: 'planificado' | 'en_progreso' | 'completado' | 'cancelado';
  prioridad: number;
  presupuesto_estimado?: number;
  presupuesto_real?: number;
  progreso_porcentaje: number;
  metadatos?: Record<string, any>;
  creado_por?: string;
  creado_en: string;
  actualizado_en: string;
  // Datos relacionados
  sucursal_nombre?: string;
  responsable_nombre?: string;
  total_tareas?: number;
  tareas_completadas?: number;
}

interface TareaPlanificacion {
  id_tarea: number;
  id_planificacion: number;
  titulo: string;
  descripcion?: string;
  id_usuario_asignado?: string;
  fecha_limite?: string;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  prioridad: number;
  tiempo_estimado_horas?: number;
  tiempo_real_horas?: number;
  resultado?: string;
  evidencias?: string[];
  creado_en: string;
  actualizado_en: string;
  // Datos relacionados
  asignado_nombre?: string;
}

interface CreatePlanificacionData {
  titulo: string;
  descripcion?: string;
  tipo_trabajo: string;
  id_sucursal: number;
  id_responsable?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  presupuesto_estimado?: number;
}

interface CreateTareaData {
  id_planificacion: number;
  titulo: string;
  descripcion?: string;
  id_usuario_asignado?: string;
  fecha_limite?: string;
  prioridad?: number;
  tiempo_estimado_horas?: number;
}

interface PlanificacionFilters {
  tipo_trabajo?: string;
  estado?: string;
  id_sucursal?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  id_responsable?: string;
}

export function usePlanificacion() {
  const { user } = useAuth();
  const [planificaciones, setPlanificaciones] = useState<PlanificacionTrabajo[]>([]);
  const [tareas, setTareas] = useState<TareaPlanificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  const supabaseRef = useRef(createClient());

  // Cargar planificaciones con filtros
  const loadPlanificaciones = useCallback(async (
    filters: PlanificacionFilters = {},
    limit: number = 20,
    offset: number = 0
  ) => {
    try {
      setLoading(true);
      
      let query = (supabaseRef.current as any)
        .from('planificacion_trabajos')
        .select(`
          *,
          sucursales!inner(nombre_sucursal),
          usuarios!planificacion_trabajos_id_usuario_responsable_fkey(nombre_completo)
        `, { count: 'exact' });

      // Aplicar filtros
      if (filters.tipo_trabajo) {
        query = query.eq('tipo_trabajo', filters.tipo_trabajo);
      }
      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }
      if (filters.id_sucursal) {
        query = query.eq('id_sucursal', filters.id_sucursal);
      }
      if (filters.fecha_inicio) {
        query = query.gte('fecha_inicio', filters.fecha_inicio);
      }
      if (filters.fecha_fin) {
        query = query.lte('fecha_fin', filters.fecha_fin);
      }
      if (filters.id_responsable) {
        query = query.eq('id_usuario_responsable', filters.id_responsable);
      }

      const { data, error, count } = await query
        .order('fecha_inicio', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Transformar datos
      const transformedData = (data as any[] || []).map((item: any) => ({
        ...item,
        sucursal_nombre: item.sucursales?.nombre_sucursal,
        responsable_nombre: item.usuarios?.nombre_completo
      }));

      setPlanificaciones(transformedData);
      setTotalCount(count || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar tareas de una planificación
  const loadTareas = useCallback(async (idPlanificacion: number) => {
    try {
      setLoading(true);
      
      const { data, error } = await (supabaseRef.current as any)
        .from('tareas_planificacion')
        .select(`
          *,
          usuarios!tareas_planificacion_id_usuario_asignado_fkey(nombre_completo)
        `)
        .eq('id_planificacion', idPlanificacion)
        .order('fecha_limite', { ascending: true });

      if (error) throw error;

      // Transformar datos
      const transformedData = (data as any[] || []).map((item: any) => ({
        ...item,
        asignado_nombre: item.usuarios?.nombre_completo,
        evidencias: Array.isArray(item.evidencias) ? item.evidencias : []
      }));

      setTareas(transformedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear planificación
  const createPlanificacion = useCallback(async (data: CreatePlanificacionData) => {
    if (!user?.id) throw new Error('Usuario no autenticado');

    try {
      setLoading(true);
      
      const { data: result, error } = await (supabaseRef.current as any).rpc('crear_planificacion_trabajo', {
        p_titulo: data.titulo,
        p_descripcion: data.descripcion,
        p_tipo_trabajo: data.tipo_trabajo,
        p_id_sucursal: data.id_sucursal,
        p_id_responsable: data.id_responsable,
        p_fecha_inicio: data.fecha_inicio,
        p_fecha_fin: data.fecha_fin,
        p_presupuesto_estimado: data.presupuesto_estimado,
        p_creado_por: user.id
      });

      if (error) throw error;
      
      if (!result.success) {
        throw new Error(result.error || 'Error al crear planificación');
      }

      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Crear tarea
  const createTarea = useCallback(async (data: CreateTareaData) => {
    try {
      setLoading(true);
      
      const { data: result, error } = await (supabaseRef.current as any)
        .from('tareas_planificacion')
        .insert({
          id_planificacion: data.id_planificacion,
          titulo: data.titulo,
          descripcion: data.descripcion,
          id_usuario_asignado: data.id_usuario_asignado,
          fecha_limite: data.fecha_limite,
          prioridad: data.prioridad || 3,
          tiempo_estimado_horas: data.tiempo_estimado_horas
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar planificación
  const updatePlanificacion = useCallback(async (
    id: number, 
    updates: Partial<PlanificacionTrabajo>
  ) => {
    try {
      setLoading(true);
      
      const { data, error } = await (supabaseRef.current as any)
        .from('planificacion_trabajos')
        .update({
          ...updates,
          actualizado_en: new Date().toISOString()
        })
        .eq('id_planificacion', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar tarea
  const updateTarea = useCallback(async (
    id: number, 
    updates: Partial<TareaPlanificacion>
  ) => {
    try {
      setLoading(true);
      
      const { data, error } = await (supabaseRef.current as any)
        .from('tareas_planificacion')
        .update({
          ...updates,
          actualizado_en: new Date().toISOString()
        })
        .eq('id_tarea', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar progreso de planificación
  const updateProgreso = useCallback(async (id: number, progreso: number) => {
    return updatePlanificacion(id, { progreso_porcentaje: progreso });
  }, [updatePlanificacion]);

  // Cambiar estado de planificación
  const changeEstadoPlanificacion = useCallback(async (
    id: number, 
    estado: PlanificacionTrabajo['estado']
  ) => {
    return updatePlanificacion(id, { estado });
  }, [updatePlanificacion]);

  // Cambiar estado de tarea
  const changeEstadoTarea = useCallback(async (
    id: number, 
    estado: TareaPlanificacion['estado']
  ) => {
    return updateTarea(id, { estado });
  }, [updateTarea]);

  // Obtener estadísticas de planificación
  const getEstadisticasPlanificacion = useCallback((planificacion: PlanificacionTrabajo) => {
    const tareasRelacionadas = tareas.filter(t => t.id_planificacion === planificacion.id_planificacion);
    const totalTareas = tareasRelacionadas.length;
    const tareasCompletadas = tareasRelacionadas.filter(t => t.estado === 'completada').length;
    const tareasEnProgreso = tareasRelacionadas.filter(t => t.estado === 'en_progreso').length;
    const tareasPendientes = tareasRelacionadas.filter(t => t.estado === 'pendiente').length;
    
    const tiempoEstimadoTotal = tareasRelacionadas.reduce(
      (sum, t) => sum + (t.tiempo_estimado_horas || 0), 0
    );
    const tiempoRealTotal = tareasRelacionadas.reduce(
      (sum, t) => sum + (t.tiempo_real_horas || 0), 0
    );

    return {
      totalTareas,
      tareasCompletadas,
      tareasEnProgreso,
      tareasPendientes,
      porcentajeCompletado: totalTareas > 0 ? (tareasCompletadas / totalTareas) * 100 : 0,
      tiempoEstimadoTotal,
      tiempoRealTotal,
      eficienciaTiempo: tiempoEstimadoTotal > 0 ? (tiempoRealTotal / tiempoEstimadoTotal) * 100 : 0
    };
  }, [tareas]);

  // Obtener planificaciones por estado
  const getPlanificacionesByEstado = useCallback((estado: PlanificacionTrabajo['estado']) => {
    return planificaciones.filter(p => p.estado === estado);
  }, [planificaciones]);

  // Obtener tareas vencidas
  const getTareasVencidas = useCallback(() => {
    const hoy = new Date().toISOString().split('T')[0];
    return tareas.filter(t => 
      t.fecha_limite && 
      t.fecha_limite < hoy && 
      t.estado !== 'completada' && 
      t.estado !== 'cancelada'
    );
  }, [tareas]);

  return {
    // Estado
    planificaciones,
    tareas,
    loading,
    error,
    totalCount,

    // Acciones CRUD
    loadPlanificaciones,
    loadTareas,
    createPlanificacion,
    createTarea,
    updatePlanificacion,
    updateTarea,

    // Acciones específicas
    updateProgreso,
    changeEstadoPlanificacion,
    changeEstadoTarea,

    // Utilidades
    getEstadisticasPlanificacion,
    getPlanificacionesByEstado,
    getTareasVencidas,

    // Limpiar error
    clearError: () => setError(null)
  };
}
