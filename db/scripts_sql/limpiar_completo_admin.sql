-- ============================================================================
-- GEMODIDA - Limpiar Completamente y Crear Admin
-- ============================================================================

-- Ver todos los usuarios con ese UUID problemático
SELECT 'UUID problemático encontrado:' as info;
SELECT id_usuario, correo FROM public.usuarios WHERE id_usuario = '22ea41bc-8a75-46b7-a0be-ac3768566910';

-- Limpiar completamente ese UUID específico
DELETE FROM public.asignaciones_usuario WHERE id_usuario = '22ea41bc-8a75-46b7-a0be-ac3768566910';
DELETE FROM public.usuarios WHERE id_usuario = '22ea41bc-8a75-46b7-a0be-ac3768566910';
DELETE FROM auth.users WHERE id = '22ea41bc-8a75-46b7-a0be-ac3768566910';

-- Limpiar también por email
DELETE FROM public.asignaciones_usuario WHERE id_usuario IN (
    SELECT id_usuario FROM public.usuarios WHERE correo = 'dida.desarrollo@gmail.com'
);
DELETE FROM public.usuarios WHERE correo = 'dida.desarrollo@gmail.com';
DELETE FROM auth.users WHERE email = 'dida.desarrollo@gmail.com';

-- Crear usuario con UUID completamente nuevo
DO $$
DECLARE
    v_user_id UUID;
    v_rol_id INTEGER;
    v_grupo_id INTEGER;
BEGIN
    -- Generar UUID único verificando que no exista
    LOOP
        v_user_id := gen_random_uuid();
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id_usuario = v_user_id);
    END LOOP;
    
    -- Obtener IDs
    SELECT id_rol INTO v_rol_id FROM public.usuarios_roles WHERE codigo_rol = 'admin';
    SELECT id_grupo INTO v_grupo_id FROM public.usuarios_grupos WHERE codigo_grupo = 'general';
    
    -- Crear en public.usuarios primero
    INSERT INTO public.usuarios (
        id_usuario, correo, hash_contraseña, id_rol, nombre_completo,
        esta_activo, creado_en, actualizado_en, id_suc
    ) VALUES (
        v_user_id, 'dida.desarrollo@gmail.com', crypt('a12300', gen_salt('bf')),
        v_rol_id, 'Administrador Desarrollo', true, now(), now(), 1
    );
    
    -- Crear asignación
    INSERT INTO public.asignaciones_usuario (
        id_usuario, id_grupo, id_rol, id_sucursal, es_principal, esta_activa, creado_en
    ) VALUES (
        v_user_id, v_grupo_id, v_rol_id, 1, true, true, now()
    );
    
    RAISE NOTICE 'Usuario creado exitosamente con nuevo UUID: %', v_user_id;
END $$;

-- Verificar creación
SELECT 
    u.id_usuario,
    u.correo,
    u.nombre_completo,
    ur.nombre_rol,
    u.esta_activo
FROM public.usuarios u
JOIN public.usuarios_roles ur ON u.id_rol = ur.id_rol
WHERE u.correo = 'dida.desarrollo@gmail.com';