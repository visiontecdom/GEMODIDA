-- tabla public.perfiles (traducción de public.profiles)
CREATE TABLE IF NOT EXISTS public.perfiles (
    id_perfil uuid NOT NULL,
    nombre_completo text,
    correo text,
    telefono text,
    rol text null default 'usuario'::text,
    creado_en timestamp with time zone null default now(),
    actualizado_en timestamp with time zone null default now(),
    constraint perfiles_pkey primary key (id_perfil),
    constraint perfiles_correo_key unique (correo),
    constraint perfiles_id_fkey foreign KEY (id_perfil) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;