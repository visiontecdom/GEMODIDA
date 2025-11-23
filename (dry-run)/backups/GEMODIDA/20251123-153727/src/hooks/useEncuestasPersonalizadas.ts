'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

interface PreguntaEncuesta {
  id: string;
  tipo: 'texto' | 'numero' | 'seleccion_unica' | 'seleccion_multiple' | 'escala' | 'fecha' | 'boolean';
  titulo: string;
  descripcion?: string;
  requerida: boolean;
  opciones?: string[]; // Para selección única/múltiple
  min_valor?: number; // Para escalas y números
  max_valor?: number; // Para escalas y números
  validacion?: {
    patron?: string;
    mensaje_error?: string;
  };
}

interface SeccionEncuesta {
  id: string;
  titulo: string;
  descripcion?: string;
  preguntas: PreguntaEncuesta[];
}

interface EstructuraEncuesta {
  titulo: string;
  descripcion?: string;
  secciones: SeccionEncuesta[];
  configuracion: {
    permitir_guardado_parcial: boolean;
    mostrar_progreso: boolean;
    tiempo_limite_minutos?: number;
    requiere_ubicacion: boolean;
  };
}

interface DisenoEncuesta {
  id_diseno: number;
  titulo: string;
  descripcion?: string;
  tipo_encuesta: string;
  id_sucursal?: number;
  estructura_json: EstructuraEncuesta;
  esta_activa: boolean;
  es_plantilla: boolean;
  creado_por?: string;
  creado_en: string;
  actualizado_en: string;
  // Datos relacionados
  sucursal_nombre?: string;
  creador_nombre?: string;
  total_respuestas?: number;
}

interface RespuestaEncuesta {
  id_respuesta: number;
  id_diseno: number;
  id_encuestador?: string;
  respuestas_json: Record<string, any>;
  ubicacion_gps?: string;
  fecha_encuesta: string;
  duracion_minutos?: number;
  observaciones?: string;
  estado: 'completada' | 'incompleta' | 'validada';
  // Datos relacionados
  encuestador_nombre?: string;
  diseno_titulo?: string;
}

interface CreateDisenoData {
  titulo: string;
  descripcion?: string;
  tipo_encuesta: string;
  id_sucursal?: number;
  estructura_json: EstructuraEncuesta;
  es_plantilla?: boolean;
}

interface CreateRespuestaData {
  id_diseno: number;
  respuestas_json: Record<string, any>;
  ubicacion_gps?: string;
  duracion_minutos?: number;
  observaciones?: string;
}

export function useEncuestasPersonalizadas() {
  const { user } = useAuth();
  const [disenos, setDisenos] = useState<DisenoEncuesta[]>([]);
  const [respuestas, setRespuestas] = useState<RespuestaEncuesta[]>([]);
  const [plantillas, setPlantillas] = useState<DisenoEncuesta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabaseRef = useRef(createClient());

  // Cargar diseños de encuestas
  const loadDisenos = useCallback(async (
    idSucursal?: number,
    soloActivas: boolean = true
  ) => {
    try {
      setLoading(true);
      
      let query: any = (supabaseRef.current as any)
        .from('diseno_encuestas')
        .select(`
          *,
          sucursales(nombre_sucursal),
          usuarios!diseno_encuestas_creado_por_fkey(nombre_completo)
        `);

      if (soloActivas) {
        query = query.eq('esta_activa', true);
      }

      if (idSucursal) {
        query = query.eq('id_sucursal', idSucursal);
      }

      const { data, error } = await query
        .order('creado_en', { ascending: false });

      if (error) throw error;

      // Transformar datos
      const transformedData = (data as any[] || []).map((item: any) => ({ // Cast item to any
        ...item,
        sucursal_nombre: item.sucursales?.nombre_sucursal,
        creador_nombre: item.usuarios?.nombre_completo
      }));

      setDisenos(transformedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar plantillas
  const loadPlantillas = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await (supabaseRef.current as any)
        .from('diseno_encuestas')
        .select(`
          *,
          usuarios!diseno_encuestas_creado_por_fkey(nombre_completo)
        `)
        .eq('es_plantilla', true)
        .eq('esta_activa', true)
        .order('titulo');

      if (error) throw error;

      // Transformar datos
      const transformedData = (data as any[] || []).map((item: any) => ({ // Cast item to any
        ...item,
        creador_nombre: item.usuarios?.nombre_completo
      }));

      setPlantillas(transformedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar respuestas de una encuesta
  const loadRespuestas = useCallback(async (idDiseno: number) => {
    try {
      setLoading(true);
      
      const { data, error } = await (supabaseRef.current as any)
        .from('respuestas_encuestas_personalizadas')
        .select(`
          *,
          usuarios!respuestas_encuestas_personalizadas_id_encuestador_fkey(nombre_completo),
          diseno_encuestas!inner(titulo)
        `)
        .eq('id_diseno', idDiseno)
        .order('fecha_encuesta', { ascending: false });

      if (error) throw error;

      // Transformar datos
      const transformedData = (data as any[] || []).map((item: any) => ({ // Cast item to any
        ...item,
        encuestador_nombre: item.usuarios?.nombre_completo,
        diseno_titulo: item.diseno_encuestas?.titulo
      }));

      setRespuestas(transformedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear diseño de encuesta
  const createDiseno = useCallback(async (data: CreateDisenoData) => {
    if (!user?.id) throw new Error('Usuario no autenticado');

    try {
      setLoading(true);
      
      const { data: result, error } = await (supabaseRef.current as any).rpc('crear_encuesta_personalizada', {
        p_titulo: data.titulo,
        p_descripcion: data.descripcion,
        p_tipo_encuesta: data.tipo_encuesta,
        p_id_sucursal: data.id_sucursal,
        p_estructura_json: data.estructura_json,
        p_creado_por: user.id
      }) as { data: { success: boolean, error?: string }, error: any };

      if (error) throw error;
      
      if (!result.success) {
        throw new Error(result.error || 'Error al crear encuesta');
      }

      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Crear respuesta de encuesta
  const createRespuesta = useCallback(async (data: CreateRespuestaData) => {
    if (!user?.id) throw new Error('Usuario no autenticado');

    try {
      setLoading(true);
      
      const { data: result, error } = await (supabaseRef.current as any)
        .from('respuestas_encuestas_personalizadas')
        .insert({
          id_diseno: data.id_diseno,
          id_encuestador: user.id,
          respuestas_json: data.respuestas_json,
          ubicacion_gps: data.ubicacion_gps,
          duracion_minutos: data.duracion_minutos,
          observaciones: data.observaciones,
          estado: 'completada'
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
  }, [user?.id]);

  // Actualizar diseño
  const updateDiseno = useCallback(async (
    id: number, 
    updates: Partial<DisenoEncuesta>
  ) => {
    try {
      setLoading(true);
      
      const { data, error } = await (supabaseRef.current as any)
        .from('diseno_encuestas')
        .update(updates)
        .eq('id_diseno', id)
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

  // Clonar diseño desde plantilla
  const clonarDesdePlantilla = useCallback(async (
    idPlantilla: number,
    nuevoTitulo: string,
    idSucursal?: number
  ) => {
    try {
      const plantilla: any = plantillas.find(p => p.id_diseno === idPlantilla); // Cast plantilla to any
      if (!plantilla) throw new Error('Plantilla no encontrada');

      return await createDiseno({
        titulo: nuevoTitulo,
        descripcion: `Basado en plantilla: ${plantilla.titulo}`,
        tipo_encuesta: plantilla.tipo_encuesta,
        id_sucursal: idSucursal,
        estructura_json: plantilla.estructura_json,
        es_plantilla: false
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [plantillas, createDiseno]);

  // Validar respuestas de encuesta
  const validarRespuestas = useCallback((
    estructura: EstructuraEncuesta,
    respuestas: Record<string, any>
  ): { valido: boolean; errores: string[] } => {
    const errores: string[] = [];

    estructura.secciones.forEach(seccion => {
      seccion.preguntas.forEach(pregunta => {
        const respuesta = respuestas[pregunta.id];

        // Verificar preguntas requeridas
        if (pregunta.requerida && (respuesta === undefined || respuesta === null || respuesta === '')) {
          errores.push(`La pregunta "${pregunta.titulo}" es requerida`);
          return;
        }

        // Validar según tipo de pregunta
        if (respuesta !== undefined && respuesta !== null && respuesta !== '') {
          switch (pregunta.tipo) {
            case 'numero':
              if (isNaN(Number(respuesta))) {
                errores.push(`"${pregunta.titulo}" debe ser un número válido`);
              } else {
                const num = Number(respuesta);
                if (pregunta.min_valor !== undefined && num < pregunta.min_valor) {
                  errores.push(`"${pregunta.titulo}" debe ser mayor o igual a ${pregunta.min_valor}`);
                }
                if (pregunta.max_valor !== undefined && num > pregunta.max_valor) {
                  errores.push(`"${pregunta.titulo}" debe ser menor o igual a ${pregunta.max_valor}`);
                }
              }
              break;

            case 'escala':
              const escala = Number(respuesta);
              if (isNaN(escala) || escala < (pregunta.min_valor || 1) || escala > (pregunta.max_valor || 5)) {
                errores.push(`"${pregunta.titulo}" debe estar entre ${pregunta.min_valor || 1} y ${pregunta.max_valor || 5}`);
              }
              break;

            case 'seleccion_unica':
              if (pregunta.opciones && !pregunta.opciones.includes(respuesta)) {
                errores.push(`"${pregunta.titulo}" contiene una opción no válida`);
              }
              break;

            case 'seleccion_multiple':
              if (Array.isArray(respuesta) && pregunta.opciones) {
                const opcionesInvalidas = respuesta.filter(r => !pregunta.opciones!.includes(r));
                if (opcionesInvalidas.length > 0) {
                  errores.push(`"${pregunta.titulo}" contiene opciones no válidas: ${opcionesInvalidas.join(', ')}`);
                }
              }
              break;

            case 'fecha':
              if (!/^\d{4}-\d{2}-\d{2}$/.test(respuesta)) {
                errores.push(`"${pregunta.titulo}" debe tener formato de fecha válido (YYYY-MM-DD)`);
              }
              break;

            case 'texto':
              if (pregunta.validacion?.patron) {
                const regex = new RegExp(pregunta.validacion.patron);
                if (!regex.test(respuesta)) {
                  errores.push(pregunta.validacion.mensaje_error || `"${pregunta.titulo}" no cumple el formato requerido`);
                }
              }
              break;
          }
        }
      });
    });

    return {
      valido: errores.length === 0,
      errores
    };
  }, []);

  // Obtener estadísticas de encuesta
  const getEstadisticasEncuesta = useCallback((idDiseno: number) => {
    const respuestasEncuesta = respuestas.filter(r => r.id_diseno === idDiseno);
    const totalRespuestas = respuestasEncuesta.length;
    const respuestasCompletadas = respuestasEncuesta.filter(r => r.estado === 'completada').length;
    const respuestasValidadas = respuestasEncuesta.filter(r => r.estado === 'validada').length;
    
    const duracionPromedio = respuestasEncuesta.reduce(
      (sum, r) => sum + (r.duracion_minutos || 0), 0
    ) / (totalRespuestas || 1);

    return {
      totalRespuestas,
      respuestasCompletadas,
      respuestasValidadas,
      respuestasIncompletas: totalRespuestas - respuestasCompletadas,
      duracionPromedio: Math.round(duracionPromedio),
      tasaCompletado: totalRespuestas > 0 ? (respuestasCompletadas / totalRespuestas) * 100 : 0
    };
  }, [respuestas]);

  // Exportar respuestas a CSV
  const exportarRespuestasCSV = useCallback((idDiseno: number) => {
    const diseno = disenos.find(d => d.id_diseno === idDiseno);
    const respuestasEncuesta = respuestas.filter(r => r.id_diseno === idDiseno);
    
    if (!diseno || respuestasEncuesta.length === 0) {
      throw new Error('No hay datos para exportar');
    }

    // Crear headers
    const headers = ['ID Respuesta', 'Encuestador', 'Fecha', 'Duración (min)', 'Estado'];
    
    // Agregar headers de preguntas
    diseno.estructura_json.secciones.forEach(seccion => {
      seccion.preguntas.forEach(pregunta => {
        headers.push(`${seccion.titulo} - ${pregunta.titulo}`);
      });
    });

    // Crear filas de datos
    const rows = respuestasEncuesta.map(respuesta => {
      const row = [
        respuesta.id_respuesta,
        respuesta.encuestador_nombre || '',
        new Date(respuesta.fecha_encuesta).toLocaleDateString(),
        respuesta.duracion_minutos || '',
        respuesta.estado
      ];

      // Agregar respuestas
      diseno.estructura_json.secciones.forEach(seccion => {
        seccion.preguntas.forEach(pregunta => {
          const valor = respuesta.respuestas_json[pregunta.id];
          row.push(Array.isArray(valor) ? valor.join('; ') : (valor || ''));
        });
      });

      return row;
    });

    // Crear CSV
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `encuesta_${diseno.titulo.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [disenos, respuestas]);

  return {
    // Estado
    disenos,
    respuestas,
    plantillas,
    loading,
    error,

    // Acciones CRUD
    loadDisenos,
    loadPlantillas,
    loadRespuestas,
    createDiseno,
    createRespuesta,
    updateDiseno,

    // Utilidades
    clonarDesdePlantilla,
    validarRespuestas,
    getEstadisticasEncuesta,
    exportarRespuestasCSV,

    // Limpiar error
    clearError: () => setError(null)
  };
}
