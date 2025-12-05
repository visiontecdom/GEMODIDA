-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.actividad_estados (
  estado_actividad text NOT NULL,
  descripcion text,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT actividad_estados_pkey PRIMARY KEY (estado_actividad)
);
CREATE TABLE public.actividad_matriz (
  id_actividad integer NOT NULL DEFAULT nextval('activities_id_actividad_seq'::regclass),
  tipo_actividad character varying NOT NULL,
  descripcion text,
  fecha date NOT NULL,
  ubicacion character varying,
  id_usuario_asignado uuid,
  resultado text,
  creado_en timestamp with time zone DEFAULT now(),
  renglon text,
  id_sucursal integer,
  fecha_registro timestamp with time zone DEFAULT now(),
  edit_count integer DEFAULT 0,
  print_count integer DEFAULT 0,
  estado_actividad text,
  CONSTRAINT actividad_matriz_pkey PRIMARY KEY (id_actividad),
  CONSTRAINT fk_actividad_matriz_renglon FOREIGN KEY (renglon) REFERENCES public.actividad_renglon(renglon),
  CONSTRAINT fk_actividad_matriz_tipo_actividad FOREIGN KEY (tipo_actividad) REFERENCES public.actividad_tipos(tipo_actividad),
  CONSTRAINT fk_actividad_matriz_estado_actividad FOREIGN KEY (estado_actividad) REFERENCES public.actividad_estados(estado_actividad),
  CONSTRAINT activities_id_usuario_asignado_fkey FOREIGN KEY (id_usuario_asignado) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.actividad_renglon (
  renglon text NOT NULL,
  descripcion text,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT actividad_renglon_pkey PRIMARY KEY (renglon)
);
CREATE TABLE public.actividad_tipos (
  tipo_actividad text NOT NULL,
  descripcion text,
  renglon text,
  estado text,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT actividad_tipos_pkey PRIMARY KEY (tipo_actividad),
  CONSTRAINT fk_actividad_tipos_renglon FOREIGN KEY (renglon) REFERENCES public.actividad_renglon(renglon)
);
CREATE TABLE public.areas_trabajo (
  area_trab text NOT NULL,
  descripcion text,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT areas_trabajo_pkey PRIMARY KEY (area_trab)
);
CREATE TABLE public.calif_alto_bajo (
  calificacion text NOT NULL,
  puntos integer NOT NULL DEFAULT 0,
  CONSTRAINT calif_alto_bajo_pkey PRIMARY KEY (calificacion)
);
CREATE TABLE public.calif_bueno_malo (
  calificacion text NOT NULL,
  puntos integer NOT NULL DEFAULT 0,
  CONSTRAINT calif_bueno_malo_pkey PRIMARY KEY (calificacion)
);
CREATE TABLE public.calif_claridad (
  calificacion text NOT NULL,
  puntos integer NOT NULL DEFAULT 0,
  CONSTRAINT calif_claridad_pkey PRIMARY KEY (calificacion)
);
CREATE TABLE public.calif_mucho_poco (
  calificacion text NOT NULL,
  puntos integer NOT NULL DEFAULT 0,
  CONSTRAINT calif_mucho_poco_pkey PRIMARY KEY (calificacion)
);
CREATE TABLE public.calif_nivel (
  nivel integer NOT NULL,
  descripcion text,
  CONSTRAINT calif_nivel_pkey PRIMARY KEY (nivel)
);
CREATE TABLE public.calif_satisf (
  satisfaccion text NOT NULL,
  puntos integer NOT NULL DEFAULT 0,
  CONSTRAINT calif_satisf_pkey PRIMARY KEY (satisfaccion)
);
CREATE TABLE public.calif_si_no (
  calificacion text NOT NULL,
  puntos integer NOT NULL DEFAULT 0,
  CONSTRAINT calif_si_no_pkey PRIMARY KEY (calificacion)
);
CREATE TABLE public.calif_tiempo (
  duracion text NOT NULL,
  puntos integer NOT NULL DEFAULT 0,
  CONSTRAINT calif_tiempo_pkey PRIMARY KEY (duracion)
);
CREATE TABLE public.categorias_fuentes (
  id_categoria integer NOT NULL,
  nombre character varying NOT NULL,
  descripcion text,
  icono character varying,
  CONSTRAINT categorias_fuentes_pkey PRIMARY KEY (id_categoria)
);
CREATE TABLE public.clasif_centro (
  clasificacion text NOT NULL,
  detalles text,
  CONSTRAINT clasif_centro_pkey PRIMARY KEY (clasificacion)
);
CREATE TABLE public.configuracion_scraping (
  id_config integer NOT NULL DEFAULT nextval('configuracion_scraping_id_config_seq'::regclass),
  nombre_configuracion character varying NOT NULL,
  descripcion text,
  fuentes_activas ARRAY DEFAULT '{}'::integer[],
  palabras_clave_activas ARRAY DEFAULT '{}'::integer[],
  frecuencia_minutos integer DEFAULT 60,
  esta_activa boolean DEFAULT true,
  configuracion_avanzada jsonb DEFAULT '{}'::jsonb,
  creado_por uuid,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT configuracion_scraping_pkey PRIMARY KEY (id_config),
  CONSTRAINT fk_config_scraping_creador FOREIGN KEY (creado_por) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.configuraciones_sistema (
  clave character varying NOT NULL,
  valor text,
  tipo character varying NOT NULL,
  descripcion text,
  es_sensible boolean,
  creado_en timestamp with time zone,
  actualizado_en timestamp with time zone,
  CONSTRAINT configuraciones_sistema_pkey PRIMARY KEY (clave)
);
CREATE TABLE public.ddl_migrations_log (
  id integer NOT NULL DEFAULT nextval('ddl_migrations_log_id_seq'::regclass),
  mensaje text NOT NULL,
  ejecutado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT ddl_migrations_log_pkey PRIMARY KEY (id)
);
CREATE TABLE public.diseno_encuestas (
  id_diseno integer NOT NULL DEFAULT nextval('diseno_encuestas_id_diseno_seq'::regclass),
  titulo character varying NOT NULL,
  descripcion text,
  tipo_encuesta character varying NOT NULL,
  id_sucursal integer,
  estructura_json jsonb NOT NULL,
  esta_activa boolean DEFAULT true,
  es_plantilla boolean DEFAULT false,
  creado_por uuid,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT diseno_encuestas_pkey PRIMARY KEY (id_diseno),
  CONSTRAINT fk_diseno_encuesta_creador FOREIGN KEY (creado_por) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.encue_puntos (
  id_reg integer NOT NULL DEFAULT nextval('encue_puntos_id_reg_seq'::regclass),
  id_encue text NOT NULL,
  puntuacion integer NOT NULL,
  CONSTRAINT encue_puntos_pkey PRIMARY KEY (id_reg)
);
CREATE TABLE public.encue_tipos (
  tipo_encuesta text NOT NULL,
  detalles text,
  CONSTRAINT encue_tipos_pkey PRIMARY KEY (tipo_encuesta)
);
CREATE TABLE public.encuesta_pss (
  id_encue text NOT NULL,
  fecha date,
  sucursal integer,
  institucion_evaluada text NOT NULL,
  descripcion text,
  tiempo_de_espera text,
  nivel_de_higiene text,
  nivel_de_comodidad text,
  trato_del_personal text,
  claridad_de_informaciones text,
  claridad_del_diagnostico text,
  claridad_del_tratamiento text,
  satisfaccion_de_precios text,
  recomienda_el_centro text,
  observaciones_encuestado text,
  observaciones_encuestador text,
  encuestado_por text,
  puntuacion integer,
  stat_encue text,
  usuario text,
  fec_reg timestamp without time zone DEFAULT now(),
  edit_count integer DEFAULT 0,
  CONSTRAINT encuesta_pss_pkey PRIMARY KEY (id_encue),
  CONSTRAINT fk_encuesta_pss_inst FOREIGN KEY (institucion_evaluada) REFERENCES public.instituciones(id_inst),
  CONSTRAINT fk_encuesta_pss_encuestado_por FOREIGN KEY (encuestado_por) REFERENCES public.encuestadores(id_encu),
  CONSTRAINT fk_encuesta_pss_tiempo_de_espera FOREIGN KEY (tiempo_de_espera) REFERENCES public.calif_tiempo(duracion),
  CONSTRAINT fk_encuesta_pss_nivel_de_higiene FOREIGN KEY (nivel_de_higiene) REFERENCES public.calif_bueno_malo(calificacion),
  CONSTRAINT fk_encuesta_pss_nivel_de_comodidad FOREIGN KEY (nivel_de_comodidad) REFERENCES public.calif_bueno_malo(calificacion),
  CONSTRAINT fk_encuesta_pss_trato_del_personal FOREIGN KEY (trato_del_personal) REFERENCES public.calif_bueno_malo(calificacion),
  CONSTRAINT fk_encuesta_pss_claridad_de_informaciones FOREIGN KEY (claridad_de_informaciones) REFERENCES public.calif_claridad(calificacion),
  CONSTRAINT fk_encuesta_pss_claridad_del_diagnostico FOREIGN KEY (claridad_del_diagnostico) REFERENCES public.calif_claridad(calificacion),
  CONSTRAINT fk_encuesta_pss_claridad_del_tratamiento FOREIGN KEY (claridad_del_tratamiento) REFERENCES public.calif_claridad(calificacion),
  CONSTRAINT fk_encuesta_pss_satisfaccion_de_precios FOREIGN KEY (satisfaccion_de_precios) REFERENCES public.calif_alto_bajo(calificacion),
  CONSTRAINT fk_encuesta_pss_recomienda_el_centro FOREIGN KEY (recomienda_el_centro) REFERENCES public.calif_si_no(calificacion)
);
CREATE TABLE public.encuesta_uss (
  id_encue text NOT NULL,
  fecha date,
  sucursal_dida integer,
  id_inst text NOT NULL,
  descripcion text,
  tipo_institucion text,
  pueblo_o_ciudad text,
  tipo_encuesta text,
  tipo_de_afiliado text,
  genero text,
  edad integer,
  esta_empleado text,
  tiene_ars text,
  tiempo_de_espera text,
  nivel_de_higiene text,
  nivel_de_comodidad text,
  trato_del_personal text,
  claridad_de_informaciones text,
  claridad_del_diagnostico text,
  claridad_del_tratamiento text,
  cobro_irregular text,
  satisfaccion_de_precios text,
  satisfaccion_del_servicio text,
  recomienda_el_centro text,
  experiencia_con_el_centro text,
  experiencia_con_ars text,
  experiencia_con_afp text,
  observaciones_encuestador text,
  encuestado_por text,
  puntuacion integer,
  stat_encue text,
  usuario text,
  fec_reg timestamp without time zone DEFAULT now(),
  edit_count integer DEFAULT 0,
  CONSTRAINT encuesta_uss_pkey PRIMARY KEY (id_encue),
  CONSTRAINT fk_encuesta_uss_inst FOREIGN KEY (id_inst) REFERENCES public.instituciones(id_inst),
  CONSTRAINT fk_encuesta_uss_tipo_encuesta FOREIGN KEY (tipo_encuesta) REFERENCES public.encue_tipos(tipo_encuesta),
  CONSTRAINT fk_encuesta_uss_encuestado_por FOREIGN KEY (encuestado_por) REFERENCES public.encuestadores(id_encu),
  CONSTRAINT fk_encuesta_uss_tipo_institucion FOREIGN KEY (tipo_institucion) REFERENCES public.instituc_tipos(tipo_institucion),
  CONSTRAINT fk_encuesta_uss_esta_empleado FOREIGN KEY (esta_empleado) REFERENCES public.calif_si_no(calificacion),
  CONSTRAINT fk_encuesta_uss_tiene_ars FOREIGN KEY (tiene_ars) REFERENCES public.calif_mucho_poco(calificacion),
  CONSTRAINT fk_encuesta_uss_tiempo_de_espera FOREIGN KEY (tiempo_de_espera) REFERENCES public.calif_tiempo(duracion),
  CONSTRAINT fk_encuesta_uss_nivel_de_higiene FOREIGN KEY (nivel_de_higiene) REFERENCES public.calif_bueno_malo(calificacion),
  CONSTRAINT fk_encuesta_uss_nivel_de_comodidad FOREIGN KEY (nivel_de_comodidad) REFERENCES public.calif_bueno_malo(calificacion),
  CONSTRAINT fk_encuesta_uss_trato_del_personal FOREIGN KEY (trato_del_personal) REFERENCES public.calif_bueno_malo(calificacion),
  CONSTRAINT fk_encuesta_uss_claridad_de_informaciones FOREIGN KEY (claridad_de_informaciones) REFERENCES public.calif_claridad(calificacion),
  CONSTRAINT fk_encuesta_uss_claridad_del_diagnostico FOREIGN KEY (claridad_del_diagnostico) REFERENCES public.calif_claridad(calificacion),
  CONSTRAINT fk_encuesta_uss_claridad_del_tratamiento FOREIGN KEY (claridad_del_tratamiento) REFERENCES public.calif_claridad(calificacion),
  CONSTRAINT fk_encuesta_uss_cobro_irregular FOREIGN KEY (cobro_irregular) REFERENCES public.calif_si_no(calificacion),
  CONSTRAINT fk_encuesta_uss_satisfaccion_de_precios FOREIGN KEY (satisfaccion_de_precios) REFERENCES public.calif_alto_bajo(calificacion),
  CONSTRAINT fk_encuesta_uss_satisfaccion_del_servicio FOREIGN KEY (satisfaccion_del_servicio) REFERENCES public.calif_bueno_malo(calificacion),
  CONSTRAINT fk_encuesta_uss_recomienda_el_centro FOREIGN KEY (recomienda_el_centro) REFERENCES public.calif_si_no(calificacion)
);
CREATE TABLE public.encuestadores (
  id_encu text NOT NULL,
  nombre_completo text NOT NULL,
  cedula text UNIQUE,
  telefono text,
  correo text,
  posicion text,
  id_suc integer,
  CONSTRAINT encuestadores_pkey PRIMARY KEY (id_encu)
);
CREATE TABLE public.encuestas (
  id_encuesta integer NOT NULL DEFAULT nextval('surveys_id_encuesta_seq'::regclass),
  titulo character varying NOT NULL,
  descripcion text,
  id_usuario_creador uuid,
  fecha_creacion timestamp with time zone DEFAULT now(),
  estado character varying DEFAULT 'activa'::character varying,
  CONSTRAINT encuestas_pkey PRIMARY KEY (id_encuesta),
  CONSTRAINT surveys_id_usuario_creador_fkey FOREIGN KEY (id_usuario_creador) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.estadisticas (
  id_estadistica bigint NOT NULL,
  id_palabra integer,
  id_fuente integer,
  fecha_inicio timestamp with time zone NOT NULL,
  fecha_fin timestamp with time zone NOT NULL,
  total_resultados integer,
  promedio_sentimiento numeric,
  tendencia numeric,
  datos_agregados jsonb,
  creado_en timestamp with time zone
);
CREATE TABLE public.fuentes (
  id_fuente integer NOT NULL,
  nombre character varying NOT NULL,
  url_base text,
  tipo_fuente character varying NOT NULL,
  id_categoria integer,
  configuracion jsonb,
  esta_activa boolean,
  requiere_autenticacion boolean,
  creado_por uuid,
  creado_en timestamp with time zone,
  actualizado_en timestamp with time zone,
  CONSTRAINT fuentes_pkey PRIMARY KEY (id_fuente)
);
CREATE TABLE public.instituc_tipos (
  tipo_institucion text NOT NULL,
  detalles text,
  CONSTRAINT instituc_tipos_pkey PRIMARY KEY (tipo_institucion)
);
CREATE TABLE public.instituciones (
  id_inst text NOT NULL,
  nombre_institucion text NOT NULL,
  tipo_institucion text NOT NULL,
  clasificacion text,
  pueblo_o_ciudad text,
  barrio_o_sector text,
  calle_y_numero text,
  provincia text,
  geo_referencia text,
  telefono text,
  correo text,
  persona_de_contacto text,
  CONSTRAINT instituciones_pkey PRIMARY KEY (id_inst),
  CONSTRAINT fk_instituciones_tipo_institucion FOREIGN KEY (tipo_institucion) REFERENCES public.instituc_tipos(tipo_institucion),
  CONSTRAINT fk_instituciones_clasificacion FOREIGN KEY (clasificacion) REFERENCES public.clasif_centro(clasificacion)
);
CREATE TABLE public.licencias_sistema (
  id_lic text NOT NULL,
  nombre_negocio text,
  persona_responsable text,
  telefono_responsable text,
  correo_responsable text,
  codigo_licencia text UNIQUE,
  clave_acceso text,
  fecha_inicio date,
  fecha_vence date,
  nombre_bd text,
  estado_licencia text,
  cod_int_lic text,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT licencias_sistema_pkey PRIMARY KEY (id_lic)
);
CREATE TABLE public.logs_procesos (
  id_log bigint NOT NULL,
  tipo_proceso character varying NOT NULL,
  estado character varying NOT NULL,
  mensaje text,
  detalles text,
  duracion_ms integer,
  id_usuario uuid,
  metadatos jsonb,
  fecha_inicio timestamp with time zone,
  fecha_fin timestamp with time zone,
  ip_origen inet
);
CREATE TABLE public.municipios (
  nombre_municipio text NOT NULL,
  provincia text,
  fecha_creado text,
  poblacion text,
  area_km2 text,
  densidad text,
  nombre_ciudad text,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT municipios_pkey PRIMARY KEY (nombre_municipio)
);
CREATE TABLE public.notificaciones_sistema (
  id_notificacion integer NOT NULL DEFAULT nextval('notificaciones_sistema_id_notificacion_seq'::regclass),
  titulo character varying NOT NULL,
  mensaje text NOT NULL,
  tipo character varying NOT NULL,
  id_usuario_destinatario uuid,
  id_grupo_destinatario integer,
  es_leida boolean DEFAULT false,
  es_global boolean DEFAULT false,
  metadatos jsonb DEFAULT '{}'::jsonb,
  fecha_expiracion timestamp with time zone,
  creado_en timestamp with time zone DEFAULT now(),
  leida_en timestamp with time zone,
  CONSTRAINT notificaciones_sistema_pkey PRIMARY KEY (id_notificacion),
  CONSTRAINT fk_notificacion_usuario FOREIGN KEY (id_usuario_destinatario) REFERENCES public.usuarios(id_usuario),
  CONSTRAINT fk_notificacion_grupo FOREIGN KEY (id_grupo_destinatario) REFERENCES public.usuarios_grupos(id_grupo)
);
CREATE TABLE public.palabras_clave (
  id_palabra integer NOT NULL,
  palabra character varying NOT NULL,
  descripcion text,
  id_usuario_creador uuid,
  es_publica boolean,
  etiquetas ARRAY,
  fecha_creacion timestamp with time zone,
  fecha_actualizacion timestamp with time zone
);
CREATE TABLE public.planificacion_trabajos (
  id_planificacion integer NOT NULL DEFAULT nextval('planificacion_trabajos_id_planificacion_seq'::regclass),
  titulo character varying NOT NULL,
  descripcion text,
  tipo_trabajo character varying NOT NULL,
  id_sucursal integer NOT NULL,
  id_usuario_responsable uuid,
  fecha_inicio date NOT NULL,
  fecha_fin date,
  estado character varying DEFAULT 'planificado'::character varying,
  prioridad integer DEFAULT 3,
  presupuesto_estimado numeric,
  presupuesto_real numeric,
  progreso_porcentaje integer DEFAULT 0,
  metadatos jsonb DEFAULT '{}'::jsonb,
  creado_por uuid,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT planificacion_trabajos_pkey PRIMARY KEY (id_planificacion),
  CONSTRAINT fk_planificacion_responsable FOREIGN KEY (id_usuario_responsable) REFERENCES public.usuarios(id_usuario),
  CONSTRAINT fk_planificacion_creador FOREIGN KEY (creado_por) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.provincias (
  provincia text NOT NULL,
  capital text NOT NULL,
  ciudad_mas_poblada text,
  escudo text,
  region text,
  superficie_km2 numeric,
  poblacion_2021 integer,
  densidad_hab_km2 numeric,
  latitud numeric,
  longitud numeric,
  mapa text,
  CONSTRAINT provincias_pkey PRIMARY KEY (provincia)
);
CREATE TABLE public.regiones (
  region text NOT NULL,
  descripcion text,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT regiones_pkey PRIMARY KEY (region)
);
CREATE TABLE public.reportes (
  id_reporte uuid NOT NULL,
  titulo character varying NOT NULL,
  descripcion text,
  tipo_reporte character varying NOT NULL,
  parametros jsonb,
  ruta_archivo text,
  formato character varying NOT NULL,
  estado character varying,
  id_usuario_solicitante uuid,
  fecha_solicitud timestamp with time zone,
  fecha_completado timestamp with time zone,
  creado_en timestamp with time zone
);
CREATE TABLE public.respuestas_encuesta (
  id_respuesta integer NOT NULL DEFAULT nextval('survey_responses_id_respuesta_seq'::regclass),
  id_encuesta integer NOT NULL,
  id_usuario uuid,
  respuesta_json jsonb,
  fecha_respuesta timestamp with time zone DEFAULT now(),
  CONSTRAINT respuestas_encuesta_pkey PRIMARY KEY (id_respuesta),
  CONSTRAINT survey_responses_id_encuesta_fkey FOREIGN KEY (id_encuesta) REFERENCES public.encuestas(id_encuesta),
  CONSTRAINT survey_responses_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.respuestas_encuestas_personalizadas (
  id_respuesta integer NOT NULL DEFAULT nextval('respuestas_encuestas_personalizadas_id_respuesta_seq'::regclass),
  id_diseno integer NOT NULL,
  id_encuestador uuid,
  respuestas_json jsonb NOT NULL,
  ubicacion_gps character varying,
  fecha_encuesta timestamp with time zone DEFAULT now(),
  duracion_minutos integer,
  observaciones text,
  estado character varying DEFAULT 'completada'::character varying,
  CONSTRAINT respuestas_encuestas_personalizadas_pkey PRIMARY KEY (id_respuesta),
  CONSTRAINT fk_respuesta_diseno FOREIGN KEY (id_diseno) REFERENCES public.diseno_encuestas(id_diseno),
  CONSTRAINT fk_respuesta_encuestador FOREIGN KEY (id_encuestador) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.resultados (
  id_resultado bigint NOT NULL,
  id_palabra integer,
  id_fuente integer,
  titulo text,
  contenido text NOT NULL,
  url_origen text,
  url_imagen text,
  autor character varying,
  fecha_publicacion timestamp with time zone,
  fecha_extraccion timestamp with time zone,
  sentimiento character varying,
  relevancia integer,
  metadatos jsonb,
  procesado boolean
);
CREATE TABLE public.sucursales (
  id_suc integer NOT NULL DEFAULT nextval('sucursales_id_suc_seq'::regclass),
  tipo_suc text,
  nombre_sucursal text NOT NULL,
  descripcion text,
  provincia text NOT NULL,
  municipio text,
  direccion text,
  geo_referencia text,
  telefono_sucursal text,
  correo_sucursal text,
  persona_responsable text,
  telefono_responsable text,
  correo_responsable text,
  horario text,
  estado text NOT NULL,
  fec_reg date DEFAULT CURRENT_DATE,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT sucursales_pkey PRIMARY KEY (id_suc)
);
CREATE TABLE public.tareas_planificacion (
  id_tarea integer NOT NULL DEFAULT nextval('tareas_planificacion_id_tarea_seq'::regclass),
  id_planificacion integer NOT NULL,
  titulo character varying NOT NULL,
  descripcion text,
  id_usuario_asignado uuid,
  fecha_limite date,
  estado character varying DEFAULT 'pendiente'::character varying,
  prioridad integer DEFAULT 3,
  tiempo_estimado_horas numeric,
  tiempo_real_horas numeric,
  resultado text,
  evidencias jsonb DEFAULT '[]'::jsonb,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT tareas_planificacion_pkey PRIMARY KEY (id_tarea),
  CONSTRAINT fk_tarea_planificacion FOREIGN KEY (id_planificacion) REFERENCES public.planificacion_trabajos(id_planificacion),
  CONSTRAINT fk_tarea_asignado FOREIGN KEY (id_usuario_asignado) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.usuarios (
  id_usuario uuid NOT NULL UNIQUE,
  correo character varying NOT NULL,
  hash_contraseña text NOT NULL,
  id_rol integer NOT NULL,
  nombre_completo character varying NOT NULL,
  telefono character varying,
  avatar_url text,
  esta_activo boolean,
  ultimo_acceso timestamp with time zone,
  creado_en timestamp with time zone,
  actualizado_en timestamp with time zone,
  nombre text,
  login text,
  cod_lic text,
  id_suc integer,
  area text,
  grupo text,
  rol text,
  estado text,
  fec_reg date,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario)
);
CREATE TABLE public.usuarios_asignaciones (
  id_asignacion integer NOT NULL DEFAULT nextval('asignaciones_usuario_id_asignacion_seq'::regclass),
  id_usuario uuid NOT NULL,
  id_grupo integer NOT NULL,
  id_rol integer NOT NULL,
  id_sucursal integer NOT NULL,
  es_principal boolean DEFAULT false,
  fecha_inicio date DEFAULT CURRENT_DATE,
  fecha_fin date,
  esta_activa boolean DEFAULT true,
  creado_por uuid,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT usuarios_asignaciones_pkey PRIMARY KEY (id_asignacion),
  CONSTRAINT fk_asignacion_rol FOREIGN KEY (id_rol) REFERENCES public.usuarios_roles(id_rol),
  CONSTRAINT fk_asignacion_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario),
  CONSTRAINT fk_asignacion_grupo FOREIGN KEY (id_grupo) REFERENCES public.usuarios_grupos(id_grupo),
  CONSTRAINT fk_asignacion_creador FOREIGN KEY (creado_por) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.usuarios_grupos (
  id_grupo integer NOT NULL DEFAULT nextval('usuarios_grupos_id_grupo_seq'::regclass),
  codigo_grupo character varying NOT NULL UNIQUE,
  nombre_grupo character varying NOT NULL,
  descripcion text,
  esta_activo boolean DEFAULT true,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT usuarios_grupos_pkey PRIMARY KEY (id_grupo)
);
CREATE TABLE public.usuarios_perfiles (
  id_perfil integer NOT NULL,
  id_usuario uuid,
  empresa character varying,
  cargo character varying,
  preferencias jsonb,
  configuracion_notificaciones jsonb,
  creado_en timestamp with time zone,
  actualizado_en timestamp with time zone
);
CREATE TABLE public.usuarios_roles (
  id_rol integer NOT NULL DEFAULT nextval('usuarios_roles_id_rol_seq'::regclass),
  codigo_rol character varying NOT NULL UNIQUE,
  nombre_rol character varying NOT NULL,
  descripcion text,
  nivel_acceso integer DEFAULT 1,
  permisos_json jsonb DEFAULT '{}'::jsonb,
  puede_crear_usuarios boolean DEFAULT false,
  puede_ver_todas_sucursales boolean DEFAULT false,
  esta_activo boolean DEFAULT true,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT usuarios_roles_pkey PRIMARY KEY (id_rol)
);
CREATE TABLE public.usuarios_roles_backup_20251122 (
  id_rol integer,
  codigo_rol character varying,
  nombre_rol character varying,
  descripcion text,
  nivel_acceso integer,
  permisos_json jsonb,
  puede_crear_usuarios boolean,
  puede_ver_todas_sucursales boolean,
  esta_activo boolean,
  creado_en timestamp with time zone,
  actualizado_en timestamp with time zone
);