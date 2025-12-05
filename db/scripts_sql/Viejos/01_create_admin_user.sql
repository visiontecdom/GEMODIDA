-- Script para crear un usuario administrador en Supabase
-- Versión simplificada y corregida

-- 1. Crear la tabla de perfiles si no existe
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS en la tabla de perfiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Función para crear o actualizar el usuario administrador
CREATE OR REPLACE FUNCTION public.create_admin_user()
RETURNS void AS $$
DECLARE
    admin_user_id UUID;
    user_email TEXT := 'baez.israel@gmail.com';
BEGIN
    -- Verificar si el usuario ya existe
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = user_email 
    LIMIT 1;

    -- Si el usuario no existe, crearlo
    IF admin_user_id IS NULL THEN
        -- Insertar en auth.users (usando la función auth.create_user de Supabase)
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            is_super_admin,
            created_at,
            updated_at,
            phone,
            phone_confirmed_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            user_email,
            crypt('a12300', gen_salt('bf')), -- Contraseña: a12300
            NOW(), -- email confirmado
            false,
            NOW(),
            NOW(),
            '18092993185',
            NOW()
        ) RETURNING id INTO admin_user_id;

        RAISE NOTICE 'Usuario administrador creado con ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'El usuario administrador ya existe con ID: %', admin_user_id;
    END IF;

    -- Crear o actualizar el perfil del usuario
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        phone,
        role,
        updated_at
    ) VALUES (
        admin_user_id,
        'Israel Báez Herrera',
        user_email,
        '18092993185',
        'admin',
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        updated_at = NOW();

    RAISE NOTICE 'Perfil de administrador creado/actualizado correctamente';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ejecutar la función
SELECT public.create_admin_user();

-- 5. Opcional: Limpiar la función después de usarla
-- DROP FUNCTION IF EXISTS public.create_admin_user();

-- 6. Crear una política para permitir que los administradores vean todos los perfiles
-- (Ajusta según tus necesidades de seguridad)
CREATE POLICY "Enable read access for admin users"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = 'baez.israel@gmail.com'));
