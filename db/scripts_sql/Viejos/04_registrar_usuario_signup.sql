-- Script para crear función RPC para registrar usuario en public.usuarios durante signup
-- Cumple con políticas de desarrollo GEMODIDA
-- Fecha: 2025-11-19

-- NOTA: Este script crea una función RPC con SECURITY DEFINER para permitir
-- la inserción en public.usuarios durante el proceso de registro, ya que
-- el usuario no está autenticado inmediatamente después de signUp.

-- Función para registrar usuario en public.usuarios
CREATE OR REPLACE FUNCTION public.registrar_usuario_signup(
    p_id_usuario UUID,
    p_correo VARCHAR(255),
    p_nombre_completo VARCHAR(150),
    p_telefono VARCHAR(20)
) RETURNS VOID AS $$
BEGIN
    -- Verificar que el usuario no exista ya en public.usuarios
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE id_usuario = p_id_usuario) THEN
        RAISE EXCEPTION 'El usuario ya está registrado en public.usuarios';
    END IF;

    -- Insertar en public.usuarios
    INSERT INTO public.usuarios (
        id_usuario,
        correo,
        hash_contraseña,  -- Se establece como vacío ya que la contraseña se maneja en auth.users
        id_rol,           -- Rol por defecto: usuario (id_rol = 2)
        nombre_completo,
        telefono,
        esta_activo,
        creado_en
    ) VALUES (
        p_id_usuario,
        p_correo,
        '',  -- Contraseña vacía, ya que se maneja en Supabase Auth
        2,   -- ID del rol 'usuario'
        p_nombre_completo,
        p_telefono,
        TRUE,  -- Usuario activo por defecto
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.registrar_usuario_signup(UUID, VARCHAR, VARCHAR, VARCHAR) TO authenticated;

-- Fin del script