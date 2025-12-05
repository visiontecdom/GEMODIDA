-- Script para insertar datos iniciales en las tablas GEMODIDA
-- Fecha de generación: 2025-11-18

-- Tabla: public.roles
INSERT INTO public.roles (id_rol, nombre_rol, descripcion, permisos, creado_en, actualizado_en)
VALUES
    (1, 'admin', 'Administrador del sistema', '{"*": true}', '2025-11-13 17:28:55.430016+00', '2025-11-13 17:28:55.430016+00'),
    (2, 'usuario', 'Usuario estándar', '{"reportes": ["read", "create"], "palabras_clave": ["read", "create", "update", "delete"]}', '2025-11-13 17:28:55.430016+00', '2025-11-13 17:28:55.430016+00'),
    (3, 'lector', 'Solo lectura', '{"reportes": ["read"], "palabras_clave": ["read"]}', '2025-11-13 17:28:55.430016+00', '2025-11-13 17:28:55.430016+00');

-- Tabla: public.usuarios
INSERT INTO public.usuarios (id_usuario, correo, hash_contraseña, id_rol, nombre_completo, telefono, avatar_url, esta_activo, ultimo_acceso, creado_en, actualizado_en)
VALUES
    ('88035f13-9834-4b6a-8fab-4ea8e5c3d249', 'baez.israel@gmail.com', '$2a$06$w7NdEKshBbFI8BQoniqWc.nGyQ1YsYF4HbVQet8zDHUxXVJwFeXPi', 1, 'Israel Báez Herrera', '18092993185', NULL, TRUE, NULL, '2025-11-17 16:32:18.219254+00', '2025-11-17 16:32:18.219254+00');

-- Tabla: public.perfiles
INSERT INTO public.perfiles (id_perfil, nombre_completo, correo, telefono, rol, creado_en, actualizado_en)
VALUES
    ('88035f13-9834-4b6a-8fab-4ea8e5c3d249', 'Israel Báez Herrera', 'baez.israel@gmail.com', '18092993185', 'admin', '2025-11-17 16:32:18.219254+00', '2025-11-17 16:32:18.219254+00')
ON CONFLICT (id_perfil) DO NOTHING;

-- NOTA: Para la tabla auth.users, la inserción depende del motor de autenticación y no se recomienda insertar manualmente a menos que sea estrictamente necesario.
