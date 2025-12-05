-- ============================================================================
-- GEMODIDA - Políticas RLS Avanzadas para Sistema de Roles
-- ============================================================================

-- Habilitar RLS en todas las tablas nuevas
ALTER TABLE public.usuarios_grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asignaciones_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planificacion_trabajos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas_planificacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diseno_encuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas_encuestas_personalizadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_scraping ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS PARA USUARIOS_GRUPOS
-- ============================================================================

-- Los usuarios autenticados pueden ver todos los grupos
CREATE POLICY "usuarios_pueden_ver_grupos" ON public.usuarios_grupos
    FOR SELECT TO authenticated
    USING (true);

-- Solo administradores pueden modificar grupos
CREATE POLICY "admin_puede_gestionar_grupos" ON public.usuarios_grupos
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
            JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
            WHERE u.id_usuario = auth.uid()
            AND ur.codigo_rol IN ('admin', 'super_user', 'desarrollo')
            AND au.esta_activa = true
        )
    );

-- ============================================================================
-- POLÍTICAS PARA USUARIOS_ROLES
-- ============================================================================

-- Los usuarios autenticados pueden ver todos los roles
CREATE POLICY "usuarios_pueden_ver_roles" ON public.usuarios_roles
    FOR SELECT TO authenticated
    USING (true);

-- Solo administradores y seguridad pueden modificar roles
CREATE POLICY "admin_seguridad_pueden_gestionar_roles" ON public.usuarios_roles
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
            JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
            WHERE u.id_usuario = auth.uid()
            AND ur.codigo_rol IN ('admin', 'super_user', 'desarrollo', 'seguridad')
            AND au.esta_activa = true
        )
    );

-- ============================================================================
-- POLÍTICAS PARA ASIGNACIONES_USUARIO
-- ============================================================================

-- Los usuarios pueden ver sus propias asignaciones
CREATE POLICY "usuarios_ven_sus_asignaciones" ON public.asignaciones_usuario
    FOR SELECT TO authenticated
    USING (id_usuario = auth.uid());

-- Los administradores pueden ver todas las asignaciones
CREATE POLICY "admin_ve_todas_asignaciones" ON public.asignaciones_usuario
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
            JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
            WHERE u.id_usuario = auth.uid()
            AND ur.puede_ver_todas_sucursales = true
            AND au.esta_activa = true
        )
    );

-- Los gerentes pueden ver asignaciones de su sucursal
CREATE POLICY "gerentes_ven_asignaciones_sucursal" ON public.asignaciones_usuario
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
            JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
            WHERE u.id_usuario = auth.uid()
            AND ur.codigo_rol IN ('gerente', 'supervisor')
            AND au.id_sucursal = asignaciones_usuario.id_sucursal
            AND au.esta_activa = true
        )
    );

-- Solo usuarios con permisos pueden crear/modificar asignaciones
CREATE POLICY "usuarios_con_permisos_gestionan_asignaciones" ON public.asignaciones_usuario
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
            JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
            WHERE u.id_usuario = auth.uid()
            AND ur.puede_crear_usuarios = true
            AND au.esta_activa = true
        )
    );

CREATE POLICY "usuarios_con_permisos_actualizan_asignaciones" ON public.asignaciones_usuario
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
            JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
            WHERE u.id_usuario = auth.uid()
            AND ur.puede_crear_usuarios = true
            AND au.esta_activa = true
        )
    );

-- ============================================================================
-- POLÍTICAS PARA PLANIFICACION_TRABAJOS
-- ============================================================================

-- Los usuarios pueden ver planificaciones de su sucursal
CREATE POLICY "usuarios_ven_planificaciones_sucursal" ON public.planificacion_trabajos
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.asignaciones_usuario au
            WHERE au.id_usuario = auth.uid()
            AND au.id_sucursal = planificacion_trabajos.id_sucursal
            AND au.esta_activa = true
        )
        OR
        EXISTS (
            SELECT 1 FROM public.usuarios u
            JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
            JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
            WHERE u.id_usuario = auth.uid()
            AND ur.puede_ver_todas_sucursales = true
            AND au.esta_activa = true
        )
    );

-- Los gerentes y supervisores pueden crear planificaciones
CREATE POLICY "gerentes_crean_planificaciones" ON public.planificacion_trabajos
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
            JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
            WHERE u.id_usuario = auth.uid()
            AND ur.codigo_rol IN ('gerente', 'supervisor', 'admin', 'super_user')
            AND au.esta_activa = true
        )
    );

-- Los responsables pueden actualizar sus planificaciones
CREATE POLICY "responsables_actualizan_planificaciones" ON public.planificacion_trabajos
    FOR UPDATE TO authenticated
    USING (
        id_usuario_responsable = auth.uid()
        OR creado_por = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.usuarios u
            JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
            JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
            WHERE u.id_usuario = auth.uid()
            AND ur.codigo_rol IN ('gerente', 'admin', 'super_user')
            AND au.esta_activa = true
        )
    );

-- ============================================================================
-- POLÍTICAS PARA TAREAS_PLANIFICACION
-- ============================================================================

-- Los usuarios pueden ver tareas de planificaciones que pueden ver
CREATE POLICY "usuarios_ven_tareas_planificacion" ON public.tareas_planificacion
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.planificacion_trabajos pt
            JOIN public.asignaciones_usuario au ON pt.id_sucursal = au.id_sucursal
            WHERE pt.id_planificacion = tareas_planificacion.id_planificacion
            AND au.id_usuario = auth.uid()
            AND au.esta_activa = true
        )
        OR
        id_usuario_asignado = auth.uid()
    );

-- Los asignados pueden actualizar sus tareas
CREATE POLICY "asignados_actualizan_tareas" ON public.tareas_planificacion
    FOR UPDATE TO authenticated
    USING (
        id_usuario_asignado = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.planificacion_trabajos pt
            WHERE pt.id_planificacion = tareas_planificacion.id_planificacion
            AND pt.id_usuario_responsable = auth.uid()
        )
    );

-- ============================================================================
-- POLÍTICAS PARA DISENO_ENCUESTAS
-- ============================================================================

-- Los usuarios pueden ver encuestas de su sucursal o públicas
CREATE POLICY "usuarios_ven_encuestas_sucursal" ON public.diseno_encuestas
    FOR SELECT TO authenticated
    USING (
        es_plantilla = true
        OR
        EXISTS (
            SELECT 1 FROM public.asignaciones_usuario au
            WHERE au.id_usuario = auth.uid()
            AND au.id_sucursal = diseno_encuestas.id_sucursal
            AND au.esta_activa = true
        )
        OR
        creado_por = auth.uid()
    );

-- Los usuarios con rol adecuado pueden crear encuestas
CREATE POLICY "usuarios_crean_encuestas" ON public.diseno_encuestas
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
            JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
            WHERE u.id_usuario = auth.uid()
            AND ur.codigo_rol IN ('gerente', 'supervisor', 'encuestador', 'admin', 'super_user')
            AND au.esta_activa = true
        )
    );

-- ============================================================================
-- POLÍTICAS PARA RESPUESTAS_ENCUESTAS_PERSONALIZADAS
-- ============================================================================

-- Los usuarios pueden ver respuestas de encuestas que pueden ver
CREATE POLICY "usuarios_ven_respuestas_encuestas" ON public.respuestas_encuestas_personalizadas
    FOR SELECT TO authenticated
    USING (
        id_encuestador = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.diseno_encuestas de
            JOIN public.asignaciones_usuario au ON de.id_sucursal = au.id_sucursal
            WHERE de.id_diseno = respuestas_encuestas_personalizadas.id_diseno
            AND au.id_usuario = auth.uid()
            AND au.esta_activa = true
        )
    );

-- Los encuestadores pueden crear respuestas
CREATE POLICY "encuestadores_crean_respuestas" ON public.respuestas_encuestas_personalizadas
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
            JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
            WHERE u.id_usuario = auth.uid()
            AND ur.codigo_rol IN ('encuestador', 'operador', 'supervisor', 'gerente', 'admin', 'super_user')
            AND au.esta_activa = true
        )
    );

-- ============================================================================
-- POLÍTICAS PARA NOTIFICACIONES_SISTEMA
-- ============================================================================

-- Los usuarios pueden ver sus notificaciones
CREATE POLICY "usuarios_ven_sus_notificaciones" ON public.notificaciones_sistema
    FOR SELECT TO authenticated
    USING (
        id_usuario_destinatario = auth.uid()
        OR es_global = true
        OR
        EXISTS (
            SELECT 1 FROM public.asignaciones_usuario au
            WHERE au.id_usuario = auth.uid()
            AND au.id_grupo = notificaciones_sistema.id_grupo_destinatario
            AND au.esta_activa = true
        )
    );

-- Los usuarios pueden marcar como leídas sus notificaciones
CREATE POLICY "usuarios_marcan_notificaciones_leidas" ON public.notificaciones_sistema
    FOR UPDATE TO authenticated
    USING (
        id_usuario_destinatario = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.asignaciones_usuario au
            WHERE au.id_usuario = auth.uid()
            AND au.id_grupo = notificaciones_sistema.id_grupo_destinatario
            AND au.esta_activa = true
        )
    );

-- Los administradores pueden crear notificaciones
CREATE POLICY "admin_crea_notificaciones" ON public.notificaciones_sistema
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
            JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
            WHERE u.id_usuario = auth.uid()
            AND ur.codigo_rol IN ('admin', 'super_user', 'gerente', 'supervisor')
            AND au.esta_activa = true
        )
    );

-- ============================================================================
-- POLÍTICAS PARA CONFIGURACION_SCRAPING
-- ============================================================================

-- Los usuarios pueden ver configuraciones de scraping
CREATE POLICY "usuarios_ven_config_scraping" ON public.configuracion_scraping
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
            JOIN public.usuarios_grupos ug ON au.id_grupo = ug.id_grupo
            WHERE u.id_usuario = auth.uid()
            AND ug.codigo_grupo IN ('monitoreo', 'general', 'desarrollo')
            AND au.esta_activa = true
        )
    );

-- Solo usuarios de monitoreo pueden crear/modificar configuraciones
CREATE POLICY "monitoreo_gestiona_config_scraping" ON public.configuracion_scraping
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
            JOIN public.usuarios_grupos ug ON au.id_grupo = ug.id_grupo
            JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
            WHERE u.id_usuario = auth.uid()
            AND ug.codigo_grupo IN ('monitoreo', 'general')
            AND ur.codigo_rol IN ('operador', 'supervisor', 'gerente', 'admin', 'super_user')
            AND au.esta_activa = true
        )
    );

-- ============================================================================
-- FUNCIÓN AUXILIAR PARA VERIFICAR PERMISOS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.usuario_tiene_permiso(
    p_usuario_id UUID,
    p_permiso TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.usuarios u
        JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
        JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
        WHERE u.id_usuario = p_usuario_id
        AND au.esta_activa = true
        AND (
            ur.permisos_json ? p_permiso
            OR ur.codigo_rol IN ('admin', 'super_user')
        )
    );
END;
$$;

-- Log de migración
INSERT INTO public.ddl_migrations_log (mensaje) VALUES 
('Políticas RLS avanzadas aplicadas correctamente para sistema de roles y permisos');