-- Script para crear relación uno a uno entre auth.users y public.usuarios
-- Cumple con políticas de desarrollo GEMODIDA
-- Fecha: 2025-11-18

-- NOTA: Este script NO modifica archivos en /db/esquema, solo crea un script nuevo en /db/scripts_sql

-- El campo id_usuario de public.usuarios debe ser UUID y referenciar a auth.users(id)
-- Si la relación ya existe, este script no la duplicará

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'usuarios' AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE public.usuarios
        ADD CONSTRAINT usuarios_id_usuario_fkey FOREIGN KEY (id_usuario)
        REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Validar que id_usuario sea PRIMARY KEY y UUID
-- Si no lo es, el usuario debe revisar la estructura manualmente.

-- Fin del script
