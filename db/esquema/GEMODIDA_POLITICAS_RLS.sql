------------------------------------------------------------
CREATE POLICY actividades_admin ON public.actividad_matriz
AS PERMISSIVE
FOR ALL
TO 
USING ((current_setting('app.current_role'::text) = ANY (ARRAY['admin'::text, 'super_user'::text])))

------------------------------------------------------------
CREATE POLICY "Los usuarios pueden eliminar sus propias palabras clave" ON public.palabras_clave
AS PERMISSIVE
FOR DELETE
TO authenticated
USING ((id_usuario_creador = auth.uid()))

------------------------------------------------------------
CREATE POLICY "Los usuarios pueden editar sus propias palabras clave" ON public.palabras_clave
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING ((id_usuario_creador = auth.uid()))

------------------------------------------------------------
CREATE POLICY "Los usuarios pueden crear palabras clave" ON public.palabras_clave
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK ((id_usuario_creador = auth.uid()))
------------------------------------------------------------
CREATE POLICY "Los usuarios pueden ver sus propias palabras clave" ON public.palabras_clave
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (((id_usuario_creador = auth.uid()) OR (es_publica = true)))

------------------------------------------------------------
CREATE POLICY "Los usuarios pueden crear reportes" ON public.reportes
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK ((id_usuario_solicitante = auth.uid()))
------------------------------------------------------------
CREATE POLICY usuarios_ven_planificaciones_sucursal ON public.planificacion_trabajos
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (((EXISTS ( SELECT 1
   FROM usuarios_asignaciones au
  WHERE ((au.id_usuario = auth.uid()) AND (au.id_sucursal = planificacion_trabajos.id_sucursal) AND (au.esta_activa = true)))) OR (EXISTS ( SELECT 1
   FROM ((usuarios u
     JOIN usuarios_asignaciones au ON ((u.id_usuario = au.id_usuario)))
     JOIN usuarios_roles ur ON ((au.id_rol = ur.id_rol)))
  WHERE ((u.id_usuario = auth.uid()) AND (ur.puede_ver_todas_sucursales = true) AND (au.esta_activa = true))))))

------------------------------------------------------------
CREATE POLICY gerentes_crean_planificaciones ON public.planificacion_trabajos
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK ((EXISTS ( SELECT 1
   FROM ((usuarios u
     JOIN usuarios_asignaciones au ON ((u.id_usuario = au.id_usuario)))
     JOIN usuarios_roles ur ON ((au.id_rol = ur.id_rol)))
  WHERE ((u.id_usuario = auth.uid()) AND ((ur.codigo_rol)::text = ANY ((ARRAY['gerente'::character varying, 'supervisor'::character varying, 'admin'::character varying, 'super_user'::character varying])::text[])) AND (au.esta_activa = true)))))
------------------------------------------------------------
CREATE POLICY responsables_actualizan_planificaciones ON public.planificacion_trabajos
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (((id_usuario_responsable = auth.uid()) OR (creado_por = auth.uid()) OR (EXISTS ( SELECT 1
   FROM ((usuarios u
     JOIN usuarios_asignaciones au ON ((u.id_usuario = au.id_usuario)))
     JOIN usuarios_roles ur ON ((au.id_rol = ur.id_rol)))
  WHERE ((u.id_usuario = auth.uid()) AND ((ur.codigo_rol)::text = ANY ((ARRAY['gerente'::character varying, 'admin'::character varying, 'super_user'::character varying])::text[])) AND (au.esta_activa = true))))))

------------------------------------------------------------
CREATE POLICY usuarios_ven_tareas_planificacion ON public.tareas_planificacion
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (((EXISTS ( SELECT 1
   FROM (planificacion_trabajos pt
     JOIN usuarios_asignaciones au ON ((pt.id_sucursal = au.id_sucursal)))
  WHERE ((pt.id_planificacion = tareas_planificacion.id_planificacion) AND (au.id_usuario = auth.uid()) AND (au.esta_activa = true)))) OR (id_usuario_asignado = auth.uid())))

------------------------------------------------------------
CREATE POLICY "Los usuarios pueden ver sus propios reportes" ON public.reportes
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (((id_usuario_solicitante = auth.uid()) OR (EXISTS ( SELECT 1
   FROM usuarios u
  WHERE ((u.id_usuario = auth.uid()) AND (u.id_rol = 1))))))

------------------------------------------------------------
CREATE POLICY usuarios_select_own ON public.usuarios
AS PERMISSIVE
FOR SELECT
TO 
USING ((id_usuario = auth.uid()))

------------------------------------------------------------
CREATE POLICY usuarios_select_authenticated ON public.usuarios
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (true)

------------------------------------------------------------
CREATE POLICY users_delete_own_keywords ON public.palabras_clave
AS PERMISSIVE
FOR DELETE
TO authenticated
USING ((id_usuario_creador = auth.uid()))

------------------------------------------------------------
CREATE POLICY users_update_own_keywords ON public.palabras_clave
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING ((id_usuario_creador = auth.uid()))

------------------------------------------------------------
CREATE POLICY users_insert_keywords ON public.palabras_clave
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK ((id_usuario_creador = auth.uid()))
------------------------------------------------------------
CREATE POLICY users_select_keywords ON public.palabras_clave
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (((id_usuario_creador = auth.uid()) OR (es_publica = true)))

------------------------------------------------------------
CREATE POLICY users_insert_reports ON public.reportes
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK ((id_usuario_solicitante = auth.uid()))
------------------------------------------------------------
CREATE POLICY usuarios_update_own ON public.usuarios
AS PERMISSIVE
FOR UPDATE
TO 
USING ((id_usuario = auth.uid()))

------------------------------------------------------------
CREATE POLICY usuarios_all_service_role ON public.usuarios
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true)
------------------------------------------------------------
CREATE POLICY usuarios_roles_select ON public.usuarios_roles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING ((esta_activo = true))

------------------------------------------------------------
CREATE POLICY usuarios_roles_all ON public.usuarios_roles
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true)
------------------------------------------------------------
CREATE POLICY usuarios_grupos_select ON public.usuarios_grupos
AS PERMISSIVE
FOR SELECT
TO authenticated
USING ((esta_activo = true))

------------------------------------------------------------
CREATE POLICY users_select_reports ON public.reportes
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (((id_usuario_solicitante = auth.uid()) OR (EXISTS ( SELECT 1
   FROM usuarios u
  WHERE ((u.id_usuario = auth.uid()) AND (u.id_rol = 1))))))

------------------------------------------------------------
CREATE POLICY users_select_results ON public.resultados
AS PERMISSIVE
FOR SELECT
TO authenticated
USING ((EXISTS ( SELECT 1
   FROM palabras_clave pc
  WHERE ((pc.id_palabra = resultados.id_palabra) AND ((pc.id_usuario_creador = auth.uid()) OR (pc.es_publica = true))))))

------------------------------------------------------------
CREATE POLICY admins_view_logs ON public.logs_procesos
AS PERMISSIVE
FOR SELECT
TO authenticated
USING ((EXISTS ( SELECT 1
   FROM usuarios u
  WHERE ((u.id_usuario = auth.uid()) AND (u.id_rol = 1)))))

------------------------------------------------------------
CREATE POLICY usuarios_grupos_all ON public.usuarios_grupos
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true)
------------------------------------------------------------
CREATE POLICY actividades_por_sucursal ON public.actividad_matriz
AS PERMISSIVE
FOR SELECT
TO 
USING ((id_sucursal = (current_setting('app.current_sucursal'::text))::integer))

------------------------------------------------------------
CREATE POLICY usuarios_pueden_ver_grupos ON public.usuarios_grupos
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (true)

------------------------------------------------------------
CREATE POLICY usuarios_pueden_ver_roles ON public.usuarios_roles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (true)

------------------------------------------------------------
CREATE POLICY asignados_actualizan_tareas ON public.tareas_planificacion
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (((id_usuario_asignado = auth.uid()) OR (EXISTS ( SELECT 1
   FROM planificacion_trabajos pt
  WHERE ((pt.id_planificacion = tareas_planificacion.id_planificacion) AND (pt.id_usuario_responsable = auth.uid()))))))

------------------------------------------------------------
CREATE POLICY usuarios_ven_encuestas_sucursal ON public.diseno_encuestas
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (((es_plantilla = true) OR (EXISTS ( SELECT 1
   FROM usuarios_asignaciones au
  WHERE ((au.id_usuario = auth.uid()) AND (au.id_sucursal = diseno_encuestas.id_sucursal) AND (au.esta_activa = true)))) OR (creado_por = auth.uid())))

------------------------------------------------------------
CREATE POLICY usuarios_crean_encuestas ON public.diseno_encuestas
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK ((EXISTS ( SELECT 1
   FROM ((usuarios u
     JOIN usuarios_asignaciones au ON ((u.id_usuario = au.id_usuario)))
     JOIN usuarios_roles ur ON ((au.id_rol = ur.id_rol)))
  WHERE ((u.id_usuario = auth.uid()) AND ((ur.codigo_rol)::text = ANY ((ARRAY['gerente'::character varying, 'supervisor'::character varying, 'encuestador'::character varying, 'admin'::character varying, 'super_user'::character varying])::text[])) AND (au.esta_activa = true)))))
------------------------------------------------------------
CREATE POLICY usuarios_ven_respuestas_encuestas ON public.respuestas_encuestas_personalizadas
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (((id_encuestador = auth.uid()) OR (EXISTS ( SELECT 1
   FROM (diseno_encuestas de
     JOIN usuarios_asignaciones au ON ((de.id_sucursal = au.id_sucursal)))
  WHERE ((de.id_diseno = respuestas_encuestas_personalizadas.id_diseno) AND (au.id_usuario = auth.uid()) AND (au.esta_activa = true))))))

------------------------------------------------------------
CREATE POLICY encuestadores_crean_respuestas ON public.respuestas_encuestas_personalizadas
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK ((EXISTS ( SELECT 1
   FROM ((usuarios u
     JOIN usuarios_asignaciones au ON ((u.id_usuario = au.id_usuario)))
     JOIN usuarios_roles ur ON ((au.id_rol = ur.id_rol)))
  WHERE ((u.id_usuario = auth.uid()) AND ((ur.codigo_rol)::text = ANY ((ARRAY['encuestador'::character varying, 'operador'::character varying, 'supervisor'::character varying, 'gerente'::character varying, 'admin'::character varying, 'super_user'::character varying])::text[])) AND (au.esta_activa = true)))))
------------------------------------------------------------
CREATE POLICY usuarios_ven_sus_notificaciones ON public.notificaciones_sistema
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (((id_usuario_destinatario = auth.uid()) OR (es_global = true) OR (EXISTS ( SELECT 1
   FROM usuarios_asignaciones au
  WHERE ((au.id_usuario = auth.uid()) AND (au.id_grupo = notificaciones_sistema.id_grupo_destinatario) AND (au.esta_activa = true))))))

------------------------------------------------------------
CREATE POLICY usuarios_marcan_notificaciones_leidas ON public.notificaciones_sistema
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (((id_usuario_destinatario = auth.uid()) OR (EXISTS ( SELECT 1
   FROM usuarios_asignaciones au
  WHERE ((au.id_usuario = auth.uid()) AND (au.id_grupo = notificaciones_sistema.id_grupo_destinatario) AND (au.esta_activa = true))))))

------------------------------------------------------------
CREATE POLICY admin_crea_notificaciones ON public.notificaciones_sistema
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK ((EXISTS ( SELECT 1
   FROM ((usuarios u
     JOIN usuarios_asignaciones au ON ((u.id_usuario = au.id_usuario)))
     JOIN usuarios_roles ur ON ((au.id_rol = ur.id_rol)))
  WHERE ((u.id_usuario = auth.uid()) AND ((ur.codigo_rol)::text = ANY ((ARRAY['admin'::character varying, 'super_user'::character varying, 'gerente'::character varying, 'supervisor'::character varying])::text[])) AND (au.esta_activa = true)))))
------------------------------------------------------------
CREATE POLICY usuarios_ven_config_scraping ON public.configuracion_scraping
AS PERMISSIVE
FOR SELECT
TO authenticated
USING ((EXISTS ( SELECT 1
   FROM ((usuarios u
     JOIN usuarios_asignaciones au ON ((u.id_usuario = au.id_usuario)))
     JOIN usuarios_grupos ug ON ((au.id_grupo = ug.id_grupo)))
  WHERE ((u.id_usuario = auth.uid()) AND ((ug.codigo_grupo)::text = ANY ((ARRAY['monitoreo'::character varying, 'general'::character varying, 'desarrollo'::character varying])::text[])) AND (au.esta_activa = true)))))

------------------------------------------------------------
CREATE POLICY monitoreo_gestiona_config_scraping ON public.configuracion_scraping
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((EXISTS ( SELECT 1
   FROM (((usuarios u
     JOIN usuarios_asignaciones au ON ((u.id_usuario = au.id_usuario)))
     JOIN usuarios_grupos ug ON ((au.id_grupo = ug.id_grupo)))
     JOIN usuarios_roles ur ON ((au.id_rol = ur.id_rol)))
  WHERE ((u.id_usuario = auth.uid()) AND ((ug.codigo_grupo)::text = ANY ((ARRAY['monitoreo'::character varying, 'general'::character varying])::text[])) AND ((ur.codigo_rol)::text = ANY ((ARRAY['operador'::character varying, 'supervisor'::character varying, 'gerente'::character varying, 'admin'::character varying, 'super_user'::character varying])::text[])) AND (au.esta_activa = true)))))

------------------------------------------------------------
CREATE POLICY usuarios_asignaciones_select ON public.usuarios_asignaciones
AS PERMISSIVE
FOR SELECT
TO authenticated
USING ((esta_activa = true))

------------------------------------------------------------
CREATE POLICY usuarios_asignaciones_all ON public.usuarios_asignaciones
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true)
------------------------------------------------------------
CREATE POLICY sucursales_select ON public.sucursales
AS PERMISSIVE
FOR SELECT
TO authenticated
USING ((estado = 'Activo'::text))

------------------------------------------------------------
CREATE POLICY sucursales_all ON public.sucursales
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true)