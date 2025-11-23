export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categorias_fuentes: {
        Row: {
          id_categoria: number
          nombre: string
          descripcion: string | null
          icono: string | null
        }
        Insert: {
          id_categoria?: number
          nombre: string
          descripcion?: string | null
          icono?: string | null
        }
        Update: {
          id_categoria?: number
          nombre?: string
          descripcion?: string | null
          icono?: string | null
        }
      }
      configuraciones_sistema: {
        Row: {
          clave: string
          valor: string | null
          tipo: string
          descripcion: string | null
          es_sensible: boolean | null
          creado_en: string | null
          actualizado_en: string | null
        }
        Insert: {
          clave: string
          valor?: string | null
          tipo: string
          descripcion?: string | null
          es_sensible?: boolean | null
          creado_en?: string | null
          actualizado_en?: string | null
        }
        Update: {
          clave?: string
          valor?: string | null
          tipo?: string
          descripcion?: string | null
          es_sensible?: boolean | null
          creado_en?: string | null
          actualizado_en?: string | null
        }
      }
      estadisticas: {
        Row: {
          id_estadistica: number
          id_palabra: number | null
          id_fuente: number | null
          fecha_inicio: string
          fecha_fin: string
          total_resultados: number | null
          promedio_sentimiento: number | null
          tendencia: number | null
          datos_agregados: Json | null
          creado_en: string | null
        }
        Insert: {
          id_estadistica?: number
          id_palabra?: number | null
          id_fuente?: number | null
          fecha_inicio: string
          fecha_fin: string
          total_resultados?: number | null
          promedio_sentimiento?: number | null
          tendencia?: number | null
          datos_agregados?: Json | null
          creado_en?: string | null
        }
        Update: {
          id_estadistica?: number
          id_palabra?: number | null
          id_fuente?: number | null
          fecha_inicio?: string
          fecha_fin?: string
          total_resultados?: number | null
          promedio_sentimiento?: number | null
          tendencia?: number | null
          datos_agregados?: Json | null
          creado_en?: string | null
        }
      }
      fuentes: {
        Row: {
          id_fuente: number
          nombre: string
          url_base: string | null
          tipo_fuente: string
          id_categoria: number | null
          configuracion: Json | null
          esta_activa: boolean | null
          requiere_autenticacion: boolean | null
          creado_por: string | null
          creado_en: string | null
          actualizado_en: string | null
        }
        Insert: {
          id_fuente?: number
          nombre: string
          url_base?: string | null
          tipo_fuente: string
          id_categoria?: number | null
          configuracion?: Json | null
          esta_activa?: boolean | null
          requiere_autenticacion?: boolean | null
          creado_por?: string | null
          creado_en?: string | null
          actualizado_en?: string | null
        }
        Update: {
          id_fuente?: number
          nombre?: string
          url_base?: string | null
          tipo_fuente?: string
          id_categoria?: number | null
          configuracion?: Json | null
          esta_activa?: boolean | null
          requiere_autenticacion?: boolean | null
          creado_por?: string | null
          creado_en?: string | null
          actualizado_en?: string | null
        }
      }
      logs_procesos: {
        Row: {
          id_log: number
          tipo_proceso: string
          estado: string
          mensaje: string | null
          detalles: string | null
          duracion_ms: number | null
          id_usuario: string | null
          metadatos: Json | null
          fecha_inicio: string | null
          fecha_fin: string | null
          ip_origen: string | null
        }
        Insert: {
          id_log?: number
          tipo_proceso: string
          estado: string
          mensaje?: string | null
          detalles?: string | null
          duracion_ms?: number | null
          id_usuario?: string | null
          metadatos?: Json | null
          fecha_inicio?: string | null
          fecha_fin?: string | null
          ip_origen?: string | null
        }
        Update: {
          id_log?: number
          tipo_proceso?: string
          estado?: string
          mensaje?: string | null
          detalles?: string | null
          duracion_ms?: number | null
          id_usuario?: string | null
          metadatos?: Json | null
          fecha_inicio?: string | null
          fecha_fin?: string | null
          ip_origen?: string | null
        }
      }
      palabras_clave: {
        Row: {
          id_palabra: number
          palabra: string
          descripcion: string | null
          id_usuario_creador: string | null
          es_publica: boolean | null
          etiquetas: string[] | null
          fecha_creacion: string | null
          fecha_actualizacion: string | null
        }
        Insert: {
          id_palabra?: number
          palabra: string
          descripcion?: string | null
          id_usuario_creador?: string | null
          es_publica?: boolean | null
          etiquetas?: string[] | null
          fecha_creacion?: string | null
          fecha_actualizacion?: string | null
        }
        Update: {
          id_palabra?: number
          palabra?: string
          descripcion?: string | null
          id_usuario_creador?: string | null
          es_publica?: boolean | null
          etiquetas?: string[] | null
          fecha_creacion?: string | null
          fecha_actualizacion?: string | null
        }
      }
      perfiles_usuarios: {
        Row: {
          id_perfil: number
          id_usuario: string | null
          empresa: string | null
          cargo: string | null
          preferencias: Json | null
          configuracion_notificaciones: Json | null
          creado_en: string | null
          actualizado_en: string | null
        }
        Insert: {
          id_perfil?: number
          id_usuario?: string | null
          empresa?: string | null
          cargo?: string | null
          preferencias?: Json | null
          configuracion_notificaciones?: Json | null
          creado_en?: string | null
          actualizado_en?: string | null
        }
        Update: {
          id_perfil?: number
          id_usuario?: string | null
          empresa?: string | null
          cargo?: string | null
          preferencias?: Json | null
          configuracion_notificaciones?: Json | null
          creado_en?: string | null
          actualizado_en?: string | null
        }
      }
      reportes: {
        Row: {
          id_reporte: string
          titulo: string
          descripcion: string | null
          tipo_reporte: string
          parametros: Json | null
          ruta_archivo: string | null
          formato: string
          estado: string | null
          id_usuario_solicitante: string | null
          fecha_solicitud: string | null
          fecha_completado: string | null
          creado_en: string | null
        }
        Insert: {
          id_reporte?: string
          titulo: string
          descripcion?: string | null
          tipo_reporte: string
          parametros?: Json | null
          ruta_archivo?: string | null
          formato: string
          estado?: string | null
          id_usuario_solicitante?: string | null
          fecha_solicitud?: string | null
          fecha_completado?: string | null
          creado_en?: string | null
        }
        Update: {
          id_reporte?: string
          titulo?: string
          descripcion?: string | null
          tipo_reporte?: string
          parametros?: Json | null
          ruta_archivo?: string | null
          formato?: string
          estado?: string | null
          id_usuario_solicitante?: string | null
          fecha_solicitud?: string | null
          fecha_completado?: string | null
          creado_en?: string | null
        }
      }
      resultados: {
        Row: {
          id_resultado: number
          id_palabra: number | null
          id_fuente: number | null
          titulo: string | null
          contenido: string
          url_origen: string | null
          url_imagen: string | null
          autor: string | null
          fecha_publicacion: string | null
          fecha_extraccion: string | null
          sentimiento: string | null
          relevancia: number | null
          metadatos: Json | null
          procesado: boolean | null
        }
        Insert: {
          id_resultado?: number
          id_palabra?: number | null
          id_fuente?: number | null
          titulo?: string | null
          contenido: string
          url_origen?: string | null
          url_imagen?: string | null
          autor?: string | null
          fecha_publicacion?: string | null
          fecha_extraccion?: string | null
          sentimiento?: string | null
          relevancia?: number | null
          metadatos?: Json | null
          procesado?: boolean | null
        }
        Update: {
          id_resultado?: number
          id_palabra?: number | null
          id_fuente?: number | null
          titulo?: string | null
          contenido?: string
          url_origen?: string | null
          url_imagen?: string | null
          autor?: string | null
          fecha_publicacion?: string | null
          fecha_extraccion?: string | null
          sentimiento?: string | null
          relevancia?: number | null
          metadatos?: Json | null
          procesado?: boolean | null
        }
      }
      usuarios_roles: {
        Row: {
          id_rol: number
          codigo_rol: string
          nombre_rol: string
          descripcion: string | null
          nivel_acceso: number
          permisos_json: Json
          puede_crear_usuarios: boolean
          puede_ver_todas_sucursales: boolean
          esta_activo: boolean
          creado_en: string | null
          actualizado_en: string | null
        }
        Insert: {
          id_rol?: number
          codigo_rol: string
          nombre_rol: string
          descripcion?: string | null
          nivel_acceso?: number
          permisos_json?: Json
          puede_crear_usuarios?: boolean
          puede_ver_todas_sucursales?: boolean
          esta_activo?: boolean
          creado_en?: string | null
          actualizado_en?: string | null
        }
        Update: {
          id_rol?: number
          codigo_rol?: string
          nombre_rol?: string
          descripcion?: string | null
          nivel_acceso?: number
          permisos_json?: Json
          puede_crear_usuarios?: boolean
          puede_ver_todas_sucursales?: boolean
          esta_activo?: boolean
          creado_en?: string | null
          actualizado_en?: string | null
        }
      }
      usuarios_perfiles: {
        Row: {
          id_perfil: number
          id_usuario: string | null
          empresa: string | null
          cargo: string | null
          preferencias: Json | null
          configuracion_notificaciones: Json | null
          creado_en: string | null
          actualizado_en: string | null
        }
        Insert: {
          id_perfil?: number
          id_usuario?: string | null
          empresa?: string | null
          cargo?: string | null
          preferencias?: Json | null
          configuracion_notificaciones?: Json | null
          creado_en?: string | null
          actualizado_en?: string | null
        }
        Update: {
          id_perfil?: number
          id_usuario?: string | null
          empresa?: string | null
          cargo?: string | null
          preferencias?: Json | null
          configuracion_notificaciones?: Json | null
          creado_en?: string | null
          actualizado_en?: string | null
        }
      }
      encuestas: {
        Row: {
          id_encuesta: number
          titulo: string
          descripcion: string | null
          id_usuario_creador: string | null
          fecha_creacion: string | null
          estado: string | null
        }
        Insert: {
          id_encuesta?: number
          titulo: string
          descripcion?: string | null
          id_usuario_creador?: string | null
          fecha_creacion?: string | null
          estado?: string | null
        }
        Update: {
          id_encuesta?: number
          titulo?: string
          descripcion?: string | null
          id_usuario_creador?: string | null
          fecha_creacion?: string | null
          estado?: string | null
        }
      }
      respuestas_encuesta: {
        Row: {
          id_respuesta: number
          id_encuesta: number
          id_usuario: string | null
          respuesta_json: Json | null
          fecha_respuesta: string | null
        }
        Insert: {
          id_respuesta?: number
          id_encuesta: number
          id_usuario?: string | null
          respuesta_json?: Json | null
          fecha_respuesta?: string | null
        }
        Update: {
          id_respuesta?: number
          id_encuesta?: number
          id_usuario?: string | null
          respuesta_json?: Json | null
          fecha_respuesta?: string | null
        }
      }
      diseno_encuestas: {
        Row: {
          id_diseno: number
          titulo: string
          descripcion: string | null
          tipo_encuesta: string
          id_sucursal: number | null
          estructura_json: Json
          esta_activa: boolean | null
          es_plantilla: boolean | null
          creado_por: string | null
          creado_en: string | null
          actualizado_en: string | null
        }
        Insert: {
          id_diseno?: number
          titulo: string
          descripcion?: string | null
          tipo_encuesta: string
          id_sucursal?: number | null
          estructura_json: Json
          esta_activa?: boolean | null
          es_plantilla?: boolean | null
          creado_por?: string | null
          creado_en?: string | null
          actualizado_en?: string | null
        }
        Update: {
          id_diseno?: number
          titulo?: string
          descripcion?: string | null
          tipo_encuesta?: string
          id_sucursal?: number | null
          estructura_json?: Json
          esta_activa?: boolean | null
          es_plantilla?: boolean | null
          creado_por?: string | null
          creado_en?: string | null
          actualizado_en?: string | null
        }
      }
      usuarios_grupos: {
        Row: {
          id_grupo: number
          codigo_grupo: string
          nombre_grupo: string
          descripcion: string | null
          esta_activo: boolean
          creado_en: string | null
          actualizado_en: string | null
        }
        Insert: {
          id_grupo?: number
          codigo_grupo: string
          nombre_grupo: string
          descripcion?: string | null
          esta_activo?: boolean
          creado_en?: string | null
          actualizado_en?: string | null
        }
        Update: {
          id_grupo?: number
          codigo_grupo?: string
          nombre_grupo?: string
          descripcion?: string | null
          esta_activo?: boolean
          creado_en?: string | null
          actualizado_en?: string | null
        }
      }
      usuarios_asignaciones: {
        Row: {
          id_asignacion: number
          id_usuario: string
          id_grupo: number
          id_rol: number
          id_sucursal: number
          es_principal: boolean
          fecha_inicio: string | null
          fecha_fin: string | null
          esta_activa: boolean
          creado_por: string | null
          creado_en: string | null
        }
        Insert: {
          id_asignacion?: number
          id_usuario: string
          id_grupo: number
          id_rol: number
          id_sucursal: number
          es_principal?: boolean
          fecha_inicio?: string | null
          fecha_fin?: string | null
          esta_activa?: boolean
          creado_por?: string | null
          creado_en?: string | null
        }
        Update: {
          id_asignacion?: number
          id_usuario?: string
          id_grupo?: number
          id_rol?: number
          id_sucursal?: number
          es_principal?: boolean
          fecha_inicio?: string | null
          fecha_fin?: string | null
          esta_activa?: boolean
          creado_por?: string | null
          creado_en?: string | null
        }
      }
      sucursales: {
        Row: {
          id_suc: number
          tipo_suc: string | null
          nombre_sucursal: string
          descripcion: string | null
          provincia: string
          municipio: string | null
          direccion: string | null
          geo_referencia: string | null
          telefono_sucursal: string | null
          correo_sucursal: string | null
          persona_responsable: string | null
          telefono_responsable: string | null
          correo_responsable: string | null
          horario: string | null
          estado: string
          fec_reg: string | null
          creado_en: string | null
        }
        Insert: {
          id_suc?: number
          tipo_suc?: string | null
          nombre_sucursal: string
          descripcion?: string | null
          provincia: string
          municipio?: string | null
          direccion?: string | null
          geo_referencia?: string | null
          telefono_sucursal?: string | null
          correo_sucursal?: string | null
          persona_responsable?: string | null
          telefono_responsable?: string | null
          correo_responsable?: string | null
          horario?: string | null
          estado: string
          fec_reg?: string | null
          creado_en?: string | null
        }
        Update: {
          id_suc?: number
          tipo_suc?: string | null
          nombre_sucursal?: string
          descripcion?: string | null
          provincia?: string
          municipio?: string | null
          direccion?: string | null
          geo_referencia?: string | null
          telefono_sucursal?: string | null
          correo_sucursal?: string | null
          persona_responsable?: string | null
          telefono_responsable?: string | null
          correo_responsable?: string | null
          horario?: string | null
          estado?: string
          fec_reg?: string | null
          creado_en?: string | null
        }
      }
      usuarios: {
        Row: {
          id_usuario: string
          correo: string
          hash_contraseña: string
          id_rol: number
          nombre_completo: string
          telefono: string | null
          id_suc: number | null
          avatar_url: string | null
          esta_activo: boolean | null
          ultimo_acceso: string | null
          creado_en: string | null
          actualizado_en: string | null
        }
        Insert: {
          id_usuario?: string
          correo: string
          hash_contraseña?: string
          id_rol: number
          nombre_completo: string
          telefono?: string | null
          id_suc?: number | null
          avatar_url?: string | null
          esta_activo?: boolean | null
          ultimo_acceso?: string | null
          creado_en?: string | null
          actualizado_en?: string | null
        }
        Update: {
          id_usuario?: string
          correo?: string
          hash_contraseña?: string
          id_rol?: number
          nombre_completo?: string
          telefono?: string | null
          id_suc?: number | null
          avatar_url?: string | null
          esta_activo?: boolean | null
          ultimo_acceso?: string | null
          creado_en?: string | null
          actualizado_en?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      actualizar_estadisticas_palabra: {
        Args: { p_id_palabra: number }
        Returns: undefined
      }
      buscar_palabras_clave: {
        Args: {
          p_busqueda: string | null
          p_id_usuario: string | null
          p_limite: number | null
          p_desplazamiento: number | null
        }
        Returns: {
          id_palabra: number
          palabra: string
          descripcion: string | null
          total_resultados: number
          ultimo_resultado: string | null
        }[]
      }
      generar_reporte: {
        Args: {
          p_titulo: string
          p_descripcion: string | null
          p_tipo_reporte: string
          p_parametros: Json | null
          p_id_usuario_solicitante: string | null
        }
        Returns: string
      }
      limpiar_logs_antiguos: {
        Args: { p_dias_retencion: number | null }
        Returns: number
      }
      log_proceso: {
        Args: {
          p_tipo_proceso: string
          p_estado: string
          p_mensaje: string | null
          p_detalles: string | null
          p_id_usuario: string | null
          p_metadatos: Json | null
          p_ip_origen: string | null
        }
        Returns: number
      }
      obtener_estadisticas_palabra: {
        Args: {
          p_id_palabra: number
          p_fecha_inicio: string | null
          p_fecha_fin: string | null
        }
        Returns: {
          fecha: string
          total_resultados: number
          promedio_sentimiento: number | null
          fuentes: Json | null
        }[]
      }
      obtener_estadisticas_por_periodo: {
        Args: {
          p_id_palabra: number
          p_tipo_periodo: string | null
          p_limite: number | null
        }
        Returns: {
          periodo: string
          total_resultados: number
          positivos: number
          negativos: number
          neutros: number
          sentimiento_promedio: number | null
        }[]
      }
      actualizar_columna_actualizado_en: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      registrar_usuario_signup: {
        Args: {
          p_id_usuario: string
          p_correo: string
          p_nombre_completo: string
          p_telefono: string
        }
        Returns: undefined
      }
      obtener_usuarios_completos: {
        Args: {
          p_limite?: number
          p_desplazamiento?: number
        }
        Returns: {
          id_usuario: string
          correo: string
          nombre_completo: string
          telefono: string | null
          esta_activo: boolean
          id_rol: number
          nombre_rol: string
          id_suc: number | null
          nombre_sucursal: string | null
          creado_en: string
          ultimo_acceso: string | null
        }[]
      }
      actualizar_usuario: {
        Args: {
          p_id_usuario: string
          p_correo: string
          p_nombre_completo: string
          p_telefono: string | null
          p_id_rol: number
          p_id_suc: number | null
          p_esta_activo: boolean
        }
        Returns: {
          success: boolean
          message: string
        }
      }
      obtener_roles_todos: {
        Args: Record<PropertyKey, never>
        Returns: {
          id_rol: number
          codigo_rol: string
          nombre_rol: string
          descripcion: string | null
          nivel_acceso: number
          permisos_json: Json
          puede_crear_usuarios: boolean
          puede_ver_todas_sucursales: boolean
          esta_activo: boolean
          creado_en: string
          total_usuarios: number
        }[]
      }
      obtener_configuraciones_sistema: {
        Args: Record<PropertyKey, never>
        Returns: {
          clave: string
          valor: string
          tipo: string
          descripcion: string | null
          es_sensible: boolean
          creado_en: string
          actualizado_en: string
        }[]
      }
      obtener_configuraciones_scraping: {
        Args: Record<PropertyKey, never>
        Returns: {
          id_config: number
          nombre_configuracion: string
          descripcion: string | null
          fuentes_activas: number[]
          palabras_clave_activas: number[]
          frecuencia_minutos: number
          esta_activa: boolean
          configuracion_avanzada: Json
          creado_por: string
          nombre_creador: string
          creado_en: string
          actualizado_en: string
        }[]
      }
      obtener_estadisticas_departamentos: {
        Args: {
          p_fecha_inicio?: string
          p_fecha_fin?: string
        }
        Returns: {
          departamento: string
          total_trabajos: number
          completados: number
          en_progreso: number
          pendientes: number
          porcentaje_completado: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
