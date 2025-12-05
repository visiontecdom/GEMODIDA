-- Script para insertar usuario en auth.users y public.usuarios
-- Cumple con políticas de desarrollo GEMODIDA
-- Fecha: 2025-11-18

-- Parámetros de usuario
-- Nombre Completo: Israel Báez Herrera
-- Correo: baez.israel@gmail.com
-- Contraseña (encriptada formato supabase): $2a$06$w7NdEKshBbFI8BQoniqWc.nGyQ1YsYF4HbVQet8zDHUxXVJwFeXPi
-- Teléfono: 18092993185
-- Rol: admin

DO $$
DECLARE
    v_user_id uuid;
    v_rol_id integer := 1; -- admin
BEGIN
    -- Verificar si el usuario ya existe en auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'baez.israel@gmail.com';
    IF v_user_id IS NULL THEN
        INSERT INTO auth.users (id, email, encrypted_password, phone, email_confirmed_at, phone_confirmed_at, confirmed_at, created_at, updated_at, aud, role)
        VALUES (
            gen_random_uuid(),
            'baez.israel@gmail.com',
            '$2a$06$w7NdEKshBbFI8BQoniqWc.nGyQ1YsYF4HbVQet8zDHUxXVJwFeXPi',
            '18092993185',
            now(), now(), now(), now(), now(),
            'authenticated', 'authenticated'
        ) RETURNING id INTO v_user_id;
    END IF;

    -- Verificar si el usuario ya existe en public.usuarios
    IF NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id_usuario = v_user_id) THEN
        INSERT INTO public.usuarios (id_usuario, correo, hash_contraseña, id_rol, nombre_completo, telefono, esta_activo, creado_en, actualizado_en)
        VALUES (
            v_user_id,
            'baez.israel@gmail.com',
            '$2a$06$w7NdEKshBbFI8BQoniqWc.nGyQ1YsYF4HbVQet8zDHUxXVJwFeXPi',
            v_rol_id,
            'Israel Báez Herrera',
            '18092993185',
            true,
            now(),
            now()
        );
    END IF;
END $$;

-- Fin del script
