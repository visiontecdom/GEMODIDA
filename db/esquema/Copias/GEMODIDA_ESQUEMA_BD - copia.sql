-- tabla public.categorias_fuentes
CREATE TABLE public.categorias_fuentes (
    id_categoria integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    icono character varying(50)
);
--------------------------------------------------------------------------------

-- tabla public.configuraciones_sistema
CREATE TABLE public.configuraciones_sistema (
    clave character varying(100) NOT NULL,
    valor text,
    tipo character varying(50) NOT NULL,
    descripcion text,
    es_sensible boolean,
    creado_en timestamp with time zone,
    actualizado_en timestamp with time zone
);
--------------------------------------------------------------------------------

-- tabla public.estadisticas
CREATE TABLE public.estadisticas (
    id_estadistica bigint NOT NULL,
    id_palabra integer,
    id_fuente integer,
    fecha_inicio timestamp with time zone NOT NULL,
    fecha_fin timestamp with time zone NOT NULL,
    total_resultados integer,
    promedio_sentimiento numeric(5,2),
    tendencia numeric(5,2),
    datos_agregados jsonb,
    creado_en timestamp with time zone
);
--------------------------------------------------------------------------------

-- tabla public.fuentes
CREATE TABLE public.fuentes (
    id_fuente integer NOT NULL,
    nombre character varying(200) NOT NULL,
    url_base text,
    tipo_fuente character varying(50) NOT NULL,
    id_categoria integer,
    configuracion jsonb,
    esta_activa boolean,
    requiere_autenticacion boolean,
    creado_por uuid,
    creado_en timestamp with time zone,
    actualizado_en timestamp with time zone
);
--------------------------------------------------------------------------------

-- tabla public.logs_procesos
CREATE TABLE public.logs_procesos (
    id_log bigint NOT NULL,
    tipo_proceso character varying(100) NOT NULL,
    estado character varying(50) NOT NULL,
    mensaje text,
    detalles text,
    duracion_ms integer,
    id_usuario uuid,
    metadatos jsonb,
    fecha_inicio timestamp with time zone,
    fecha_fin timestamp with time zone,
    ip_origen inet
);
--------------------------------------------------------------------------------

-- tabla public.palabras_clave
CREATE TABLE public.palabras_clave (
    id_palabra integer NOT NULL,
    palabra character varying(255) NOT NULL,
    descripcion text,
    id_usuario_creador uuid,
    es_publica boolean,
    etiquetas text[],
    fecha_creacion timestamp with time zone,
    fecha_actualizacion timestamp with time zone
);
--------------------------------------------------------------------------------

-- tabla public.perfiles_usuarios
CREATE TABLE public.perfiles_usuarios (
    id_perfil integer NOT NULL,
    id_usuario uuid,
    empresa character varying(100),
    cargo character varying(100),
    preferencias jsonb,
    configuracion_notificaciones jsonb,
    creado_en timestamp with time zone,
    actualizado_en timestamp with time zone
);
--------------------------------------------------------------------------------

-- tabla public.reportes
CREATE TABLE public.reportes (
    id_reporte uuid NOT NULL,
    titulo character varying(255) NOT NULL,
    descripcion text,
    tipo_reporte character varying(50) NOT NULL,
    parametros jsonb,
    ruta_archivo text,
    formato character varying(20) NOT NULL,
    estado character varying(20),
    id_usuario_solicitante uuid,
    fecha_solicitud timestamp with time zone,
    fecha_completado timestamp with time zone,
    creado_en timestamp with time zone
);
--------------------------------------------------------------------------------

-- tabla public.resultados
CREATE TABLE public.resultados (
    id_resultado bigint NOT NULL,
    id_palabra integer,
    id_fuente integer,
    titulo text,
    contenido text NOT NULL,
    url_origen text,
    url_imagen text,
    autor character varying(200),
    fecha_publicacion timestamp with time zone,
    fecha_extraccion timestamp with time zone,
    sentimiento character varying(50),
    relevancia integer,
    metadatos jsonb,
    procesado boolean
);
--------------------------------------------------------------------------------

-- tabla public.roles
CREATE TABLE public.roles (
    id_rol integer NOT NULL,
    nombre_rol character varying(50) NOT NULL,
    descripcion text,
    permisos jsonb,
    creado_en timestamp with time zone,
    actualizado_en timestamp with time zone
);
--------------------------------------------------------------------------------

-- tabla public.usuarios
CREATE TABLE public.usuarios (
    id_usuario uuid NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    id_rol integer NOT NULL,
    nombre_completo character varying(150) NOT NULL,
    telefono character varying(20),
    avatar_url text,
    esta_activo boolean,
    ultimo_acceso timestamp with time zone,
    creado_en timestamp with time zone,
    actualizado_en timestamp with time zone
);
--------------------------------------------------------------------------------