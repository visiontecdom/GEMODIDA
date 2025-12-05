-- ============================================================================
-- GEMODIDA: Corrección de Funciones RPC y Políticas RLS
-- Fecha: 2025-11-19
-- Descripción: Completa funciones RPC incompletas y agrega políticas RLS
-- ============================================================================

-- ============================================================================
-- 1. CORREGIR FUNCIÓN log_proceso (incompleta en archivo original)
-- ============================================================================

DROP FUNCTION IF EXISTS public.log_proceso(character varying, character varying, text, text, uuid, jsonb, inet) CASCADE;

CREATE OR REPLACE FUNCTION public.log_proceso(
    p_tipo_proceso character varying,
    p_estado character varying,
    p_mensaje text,
    p_detalles text DEFAULT NULL::text,
    p_id_usuario uuid DEFAULT NULL::uuid,
    p_metadatos jsonb DEFAULT '{}'::jsonb,
    p_ip_origen inet DEFAULT NULL::inet
)
RETURNS bigint
LANGUAGE plpgsql
AS $function$
DECLARE
    v_log_id BIGINT;
BEGIN
    INSERT INTO logs_procesos (
        tipo_proceso,
        estado,
        mensaje,
        detalles,
        id_usuario,
        metadatos,
        fecha_inicio,
        ip_origen
    ) VALUES (
        p_tipo_proceso,
        p_estado,
        p_mensaje,
        p_detalles,
        p_id_usuario,
        p_metadatos,
        NOW(),
        p_ip_origen
    ) RETURNING id_log INTO v_log_id;
    
    RETURN v_log_id;
END;
$function$;

-- ============================================================================
-- 2. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_resultados_id_palabra ON resultados(id_palabra);
CREATE INDEX IF NOT EXISTS idx_resultados_id_fuente ON resultados(id_fuente);
CREATE INDEX IF NOT EXISTS idx_resultados_fecha_publicacion ON resultados(fecha_publicacion);
CREATE INDEX IF NOT EXISTS idx_palabras_clave_id_usuario ON palabras_clave(id_usuario_creador);
CREATE INDEX IF NOT EXISTS idx_usuarios_id_rol ON usuarios(id_rol);
CREATE INDEX IF NOT EXISTS idx_logs_procesos_fecha ON logs_procesos(fecha_inicio);

-- ============================================================================
-- 3. HABILITAR RLS EN TABLAS CRÍTICAS
-- ============================================================================

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palabras_clave ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_procesos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREAR POLÍTICAS RLS
-- ============================================================================

-- Políticas para tabla usuarios
DROP POLICY IF EXISTS "admin_manage_users" ON public.usuarios;
DROP POLICY IF EXISTS "users_view_own_profile" ON public.usuarios;

CREATE POLICY "admin_manage_users"
  ON public.usuarios
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (
    (auth.role() = 'authenticated'::text)
    AND EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.id_usuario = auth.uid() AND u.id_rol = 1
    )
  );

CREATE POLICY "users_view_own_profile"
  ON public.usuarios
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id_usuario);

-- Políticas para tabla palabras_clave
DROP POLICY IF EXISTS "users_delete_own_keywords" ON public.palabras_clave;
DROP POLICY IF EXISTS "users_update_own_keywords" ON public.palabras_clave;
DROP POLICY IF EXISTS "users_insert_keywords" ON public.palabras_clave;
DROP POLICY IF EXISTS "users_select_keywords" ON public.palabras_clave;

CREATE POLICY "users_delete_own_keywords"
  ON public.palabras_clave
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (id_usuario_creador = auth.uid());

CREATE POLICY "users_update_own_keywords"
  ON public.palabras_clave
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (id_usuario_creador = auth.uid());

CREATE POLICY "users_insert_keywords"
  ON public.palabras_clave
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (id_usuario_creador = auth.uid());

CREATE POLICY "users_select_keywords"
  ON public.palabras_clave
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (id_usuario_creador = auth.uid() OR es_publica = true);

-- Políticas para tabla reportes
DROP POLICY IF EXISTS "users_insert_reports" ON public.reportes;
DROP POLICY IF EXISTS "users_select_reports" ON public.reportes;

CREATE POLICY "users_insert_reports"
  ON public.reportes
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (id_usuario_solicitante = auth.uid());

CREATE POLICY "users_select_reports"
  ON public.reportes
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    id_usuario_solicitante = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.id_usuario = auth.uid() AND u.id_rol = 1
    )
  );

-- Políticas para tabla resultados
DROP POLICY IF EXISTS "users_select_results" ON public.resultados;

CREATE POLICY "users_select_results"
  ON public.resultados
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.palabras_clave pc
      WHERE pc.id_palabra = resultados.id_palabra
      AND (pc.id_usuario_creador = auth.uid() OR pc.es_publica = true)
    )
  );

-- Políticas para tabla logs_procesos
DROP POLICY IF EXISTS "admins_view_logs" ON public.logs_procesos;

CREATE POLICY "admins_view_logs"
  ON public.logs_procesos
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.id_usuario = auth.uid() AND u.id_rol = 1
    )
  );

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
