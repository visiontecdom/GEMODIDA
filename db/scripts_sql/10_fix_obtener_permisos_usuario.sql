-- Fix: Make obtener_permisos_usuario return the usuario even if they have no active assignments
-- Drop and recreate function (safe to run multiple times)

DROP FUNCTION IF EXISTS public.obtener_permisos_usuario(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.obtener_permisos_usuario(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_resultado JSON;
BEGIN
    SELECT json_build_object(
        'usuario', json_build_object(
            'id', u.id_usuario,
            'nombre', u.nombre_completo,
            'correo', u.correo,
            'esta_activo', u.esta_activo
        ),
        'asignaciones', COALESCE(
            json_agg(
                json_build_object(
                    'grupo', json_build_object(
                        'codigo', ug.codigo_grupo,
                        'nombre', ug.nombre_grupo
                    ),
                    'rol', json_build_object(
                        'codigo', ur.codigo_rol,
                        'nombre', ur.nombre_rol,
                        'nivel_acceso', ur.nivel_acceso,
                        'permisos', ur.permisos_json
                    ),
                    'sucursal', json_build_object(
                        'id', s.id_suc,
                        'nombre', s.nombre_sucursal,
                        'provincia', s.provincia
                    ),
                    'es_principal', au.es_principal,
                    'esta_activa', au.esta_activa
                )
            ) FILTER (WHERE au.esta_activa = true), '[]'::json
        )
    ) INTO v_resultado
    FROM public.usuarios u
    LEFT JOIN public.usuarios_asignaciones au ON u.id_usuario = au.id_usuario
    LEFT JOIN public.usuarios_grupos ug ON au.id_grupo = ug.id_grupo
    LEFT JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
    LEFT JOIN public.sucursales s ON au.id_sucursal = s.id_suc
    WHERE u.id_usuario = p_user_id
    GROUP BY u.id_usuario, u.nombre_completo, u.correo, u.esta_activo;

    RETURN COALESCE(v_resultado, json_build_object('error', 'Usuario no encontrado'));
END;
$function$;

-- Grant execute to authenticated role
GRANT EXECUTE ON FUNCTION public.obtener_permisos_usuario(uuid) TO authenticated;
