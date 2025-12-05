-- Script SQL para crear nuevos grupos de trabajo
-- Ejecutar en Supabase SQL Editor

-- Insertar grupo 'administracion'
INSERT INTO usuarios_grupos (
    codigo_grupo,
    nombre_grupo,
    descripcion,
    esta_activo,
    creado_en,
    actualizado_en
) VALUES (
    'administracion',
    'Administración',
    'Grupo para el departamento de TIC y administración general del sistema',
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo_grupo) DO NOTHING;

-- Insertar grupo 'calidad_sdss'
INSERT INTO usuarios_grupos (
    codigo_grupo,
    nombre_grupo,
    descripcion,
    esta_activo,
    creado_en,
    actualizado_en
) VALUES (
    'calidad_sdss',
    'Calidad SDSS',
    'Grupo para el control de calidad del Sistema de Seguimiento Social',
    true,
    NOW(),
    NOW()
) ON CONFLICT (codigo_grupo) DO NOTHING;

-- Verificar que se crearon correctamente
SELECT id_grupo, codigo_grupo, nombre_grupo, descripcion
FROM usuarios_grupos
WHERE codigo_grupo IN ('administracion', 'calidad_sdss')
ORDER BY codigo_grupo;