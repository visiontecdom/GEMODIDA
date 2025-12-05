-- ============================================================================
-- GEMODIDA - Datos Iniciales del Sistema Completo
-- ============================================================================

-- Agregar constraints y claves primarias faltantes si no existen
DO $$
BEGIN
    -- Agregar clave primaria a categorias_fuentes si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'categorias_fuentes' AND constraint_type = 'PRIMARY KEY') THEN
        ALTER TABLE public.categorias_fuentes ADD CONSTRAINT categorias_fuentes_pkey PRIMARY KEY (id_categoria);
    END IF;
    
    -- Agregar clave primaria a fuentes si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'fuentes' AND constraint_type = 'PRIMARY KEY') THEN
        ALTER TABLE public.fuentes ADD CONSTRAINT fuentes_pkey PRIMARY KEY (id_fuente);
    END IF;
    
    -- Agregar clave primaria a configuraciones_sistema si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'configuraciones_sistema' AND constraint_type = 'PRIMARY KEY') THEN
        ALTER TABLE public.configuraciones_sistema ADD CONSTRAINT configuraciones_sistema_pkey PRIMARY KEY (clave);
    END IF;
END $$;

-- Insertar grupos de trabajo iniciales
INSERT INTO public.usuarios_grupos (codigo_grupo, nombre_grupo, descripcion) 
SELECT codigo_grupo, nombre_grupo, descripcion FROM (VALUES
('general', 'General', 'Usuarios con acceso a cualquier área de la plataforma'),
('monitoreo', 'Monitoreo', 'Usuarios del departamento de monitoreo'),
('promociones', 'Promociones', 'Usuarios del departamento de promociones'),
('seguridad', 'Seguridad', 'Usuarios que administran la seguridad del sistema'),
('desarrollo', 'Desarrollo', 'Usuarios exclusivos para desarrollo de aplicaciones')
) AS v(codigo_grupo, nombre_grupo, descripcion)
WHERE NOT EXISTS (SELECT 1 FROM public.usuarios_grupos WHERE usuarios_grupos.codigo_grupo = v.codigo_grupo);

-- Insertar roles de usuario iniciales con casting explícito para JSONB
INSERT INTO public.usuarios_roles (codigo_rol, nombre_rol, descripcion, nivel_acceso, puede_crear_usuarios, puede_ver_todas_sucursales, permisos_json) 
SELECT codigo_rol, nombre_rol, descripcion, nivel_acceso, puede_crear_usuarios, puede_ver_todas_sucursales, permisos_json::jsonb FROM (VALUES
('gerente', 'Gerente', 'Gerentes o administradores de sucursales', 4, true, false, '{"crear_usuarios": true, "administrar_recursos": true, "ejecutar_procesos": true, "ver_sucursal_propia": true}'),
('supervisor', 'Supervisor', 'Supervisores con permisos inferiores al gerente', 3, false, false, '{"ejecutar_procesos": true, "registrar_informaciones": true, "ver_sucursal_propia": true}'),
('operador', 'Operador', 'Usuarios que ejecutan procesos y registran datos', 2, false, false, '{"registrar_datos": true, "editar_informaciones": true, "ver_sucursal_propia": true}'),
('encuestador', 'Encuestador', 'Usuarios que realizan y registran encuestas', 2, false, false, '{"realizar_encuestas": true, "ver_datos_propios": true}'),
('admin', 'Administrador', 'Administradores con acceso a toda la plataforma', 5, true, true, '{"acceso_total": true, "crear_usuarios": true, "modificar_datos": true, "eliminar_datos": true, "ver_todas_sucursales": true}'),
('desarrollo', 'Desarrollador', 'Usuarios para ambiente de desarrollo', 5, true, true, '{"acceso_desarrollo": true, "ver_todas_sucursales": true, "acceso_total": true}'),
('super_user', 'Super Usuario', 'Usuario de mayor nivel con acceso total', 5, true, true, '{"super_acceso": true, "acceso_total": true, "ver_todas_sucursales": true}'),
('invitado', 'Consultas/Invitado', 'Usuarios que solo pueden ver informes y consultar datos', 1, false, false, '{"solo_lectura": true, "ver_informes": true}'),
('seguridad', 'Seguridad', 'Usuarios que administran permisos en el sistema', 4, true, false, '{"crear_usuarios": true, "otorgar_permisos": true, "administrar_seguridad": true}')
) AS v(codigo_rol, nombre_rol, descripcion, nivel_acceso, puede_crear_usuarios, puede_ver_todas_sucursales, permisos_json)
WHERE NOT EXISTS (SELECT 1 FROM public.usuarios_roles WHERE usuarios_roles.codigo_rol = v.codigo_rol);

-- Insertar áreas de trabajo solo si no existen
INSERT INTO public.areas_trabajo (area_trab, descripcion) 
SELECT area_trab, descripcion FROM (VALUES
('Monitoreo', 'Área de monitoreo y vigilancia'),
('Promociones', 'Área de promociones y divulgación'),
('Administración', 'Área administrativa'),
('Tecnología', 'Área de tecnología e informática'),
('Recursos Humanos', 'Área de recursos humanos'),
('Finanzas', 'Área financiera y presupuestaria')
) AS v(area_trab, descripcion)
WHERE NOT EXISTS (SELECT 1 FROM public.areas_trabajo WHERE areas_trabajo.area_trab = v.area_trab);

-- Insertar tipos de encuestas solo si no existen
INSERT INTO public.encue_tipos (tipo_encuesta, detalles) 
SELECT tipo_encuesta, detalles FROM (VALUES
('ARS', 'Encuestas para Administradoras de Riesgos de Salud'),
('AFP', 'Encuestas para Administradoras de Fondos de Pensiones'),
('PSS', 'Encuestas para Prestadoras de Servicios de Salud'),
('ARL', 'Encuestas para Administradoras de Riesgos Laborales'),
('TODO', 'Encuestas generales del sistema'),
('PERSONALIZADA', 'Encuestas personalizadas por sucursal')
) AS v(tipo_encuesta, detalles)
WHERE NOT EXISTS (SELECT 1 FROM public.encue_tipos WHERE encue_tipos.tipo_encuesta = v.tipo_encuesta);

-- Insertar estados de actividades solo si no existen
INSERT INTO public.actividad_estados (estado_actividad, descripcion) 
SELECT estado_actividad, descripcion FROM (VALUES
('planificada', 'Actividad planificada pero no iniciada'),
('en_progreso', 'Actividad en curso de ejecución'),
('completada', 'Actividad completada exitosamente'),
('cancelada', 'Actividad cancelada'),
('pausada', 'Actividad temporalmente pausada'),
('revision', 'Actividad en proceso de revisión')
) AS v(estado_actividad, descripcion)
WHERE NOT EXISTS (SELECT 1 FROM public.actividad_estados WHERE actividad_estados.estado_actividad = v.estado_actividad);

-- Insertar renglones de actividades solo si no existen
INSERT INTO public.actividad_renglon (renglon, descripcion) 
SELECT renglon, descripcion FROM (VALUES
('Monitoreo Digital', 'Actividades de monitoreo en medios digitales'),
('Encuestas Presenciales', 'Realización de encuestas cara a cara'),
('Promoción Institucional', 'Actividades de promoción de la institución'),
('Capacitación', 'Actividades de capacitación y formación'),
('Investigación', 'Actividades de investigación y análisis'),
('Eventos', 'Organización y participación en eventos'),
('Reuniones', 'Reuniones institucionales y de coordinación')
) AS v(renglon, descripcion)
WHERE NOT EXISTS (SELECT 1 FROM public.actividad_renglon WHERE actividad_renglon.renglon = v.renglon);

-- Insertar tipos de actividades solo si no existen
INSERT INTO public.actividad_tipos (tipo_actividad, descripcion, renglon) 
SELECT tipo_actividad, descripcion, renglon FROM (VALUES
('Scraping Redes Sociales', 'Extracción de datos de redes sociales', 'Monitoreo Digital'),
('Monitoreo Google Alerts', 'Seguimiento de alertas de Google', 'Monitoreo Digital'),
('Encuesta USS', 'Encuesta a usuarios del sistema de salud', 'Encuestas Presenciales'),
('Encuesta PSS', 'Encuesta a prestadores de servicios de salud', 'Encuestas Presenciales'),
('Charla Informativa', 'Charlas sobre derechos en seguridad social', 'Promoción Institucional'),
('Campaña Publicitaria', 'Campañas de divulgación', 'Promoción Institucional'),
('Taller de Capacitación', 'Talleres para personal interno', 'Capacitación'),
('Seminario', 'Seminarios especializados', 'Capacitación'),
('Estudio de Mercado', 'Investigaciones de mercado', 'Investigación'),
('Análisis de Tendencias', 'Análisis de tendencias digitales', 'Investigación')
) AS v(tipo_actividad, descripcion, renglon)
WHERE NOT EXISTS (SELECT 1 FROM public.actividad_tipos WHERE actividad_tipos.tipo_actividad = v.tipo_actividad);

-- Insertar categorías de fuentes solo si no existen
INSERT INTO public.categorias_fuentes (id_categoria, nombre, descripcion, icono) 
SELECT id_categoria, nombre, descripcion, icono FROM (VALUES
(1, 'Redes Sociales', 'Facebook, Instagram, Twitter, etc.', 'social'),
(2, 'Medios de Comunicación', 'Periódicos, revistas digitales', 'news'),
(3, 'Portales Gubernamentales', 'Sitios web oficiales', 'government'),
(4, 'Blogs y Foros', 'Blogs especializados y foros de discusión', 'forum'),
(5, 'Buscadores', 'Google, Bing, Yahoo', 'search')
) AS v(id_categoria, nombre, descripcion, icono)
WHERE NOT EXISTS (SELECT 1 FROM public.categorias_fuentes WHERE categorias_fuentes.id_categoria = v.id_categoria);

-- Insertar fuentes solo si no existen
INSERT INTO public.fuentes (id_fuente, nombre, url_base, tipo_fuente, id_categoria, esta_activa, requiere_autenticacion) 
SELECT id_fuente, nombre, url_base, tipo_fuente, id_categoria, esta_activa, requiere_autenticacion FROM (VALUES
(1, 'Facebook', 'https://facebook.com', 'red_social', 1, true, true),
(2, 'Instagram', 'https://instagram.com', 'red_social', 1, true, true),
(3, 'Twitter/X', 'https://x.com', 'red_social', 1, true, true),
(4, 'Google News', 'https://news.google.com', 'buscador', 5, true, false),
(5, 'Listín Diario', 'https://listindiario.com', 'medio_comunicacion', 2, true, false),
(6, 'Diario Libre', 'https://diariolibre.com', 'medio_comunicacion', 2, true, false),
(7, 'El Caribe', 'https://elcaribe.com.do', 'medio_comunicacion', 2, true, false),
(8, 'Presidencia RD', 'https://presidencia.gob.do', 'portal_gubernamental', 3, true, false),
(9, 'Ministerio de Salud', 'https://msp.gob.do', 'portal_gubernamental', 3, true, false),
(10, 'CNSS', 'https://cnss.gob.do', 'portal_gubernamental', 3, true, false)
) AS v(id_fuente, nombre, url_base, tipo_fuente, id_categoria, esta_activa, requiere_autenticacion)
WHERE NOT EXISTS (SELECT 1 FROM public.fuentes WHERE fuentes.id_fuente = v.id_fuente);

-- Insertar configuraciones solo si no existen
INSERT INTO public.configuraciones_sistema (clave, valor, tipo, descripcion, es_sensible) 
SELECT clave, valor, tipo, descripcion, es_sensible FROM (VALUES
('scraping_intervalo_minutos', '60', 'integer', 'Intervalo en minutos para ejecutar scraping automático', false),
('max_resultados_por_busqueda', '100', 'integer', 'Máximo número de resultados por búsqueda', false),
('dias_retencion_logs', '90', 'integer', 'Días de retención de logs del sistema', false),
('notificaciones_email_activas', 'true', 'boolean', 'Activar notificaciones por email', false),
('notificaciones_push_activas', 'true', 'boolean', 'Activar notificaciones push', false),
('modo_desarrollo', 'false', 'boolean', 'Modo de desarrollo activado', false),
('version_sistema', '1.0.0', 'string', 'Versión actual del sistema', false),
('backup_automatico', 'true', 'boolean', 'Backup automático de base de datos', false),
('limite_usuarios_por_sucursal', '50', 'integer', 'Límite de usuarios por sucursal', false),
('tiempo_sesion_minutos', '480', 'integer', 'Tiempo de sesión en minutos (8 horas)', false)
) AS v(clave, valor, tipo, descripcion, es_sensible)
WHERE NOT EXISTS (SELECT 1 FROM public.configuraciones_sistema WHERE configuraciones_sistema.clave = v.clave);

-- Log de migración
INSERT INTO public.ddl_migrations_log (mensaje) VALUES 
('Datos iniciales del sistema insertados correctamente - Datos completos con controles de duplicados');