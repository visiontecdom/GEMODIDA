-- 32_minimize_rls_users_related.sql
-- Drop all existing RLS policies on the selected tables and create minimal, safe policies

BEGIN;

-- Helper: drop all policies on a table
DO $$
DECLARE
  p record;
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['usuarios','sucursales','usuarios_asignaciones','usuarios_grupos','usuarios_roles'] LOOP
    FOR p IN SELECT policyname FROM pg_policies WHERE tablename = tbl LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', p.policyname, 'public', tbl);
    END LOOP;
  END LOOP;
END $$;

-- Create minimal policies per table
-- usuarios: allow authenticated SELECT, allow owner UPDATE, allow service_role all
CREATE POLICY usuarios_select_authenticated ON public.usuarios
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY usuarios_update_own ON public.usuarios
FOR UPDATE
USING (id_usuario = auth.uid()::uuid);

CREATE POLICY usuarios_all_service_role ON public.usuarios
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- sucursales: allow authenticated SELECT of active ones, service_role full access
CREATE POLICY sucursales_select ON public.sucursales
FOR SELECT
TO authenticated
USING (estado = 'Activo');

CREATE POLICY sucursales_all ON public.sucursales
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- usuarios_asignaciones: allow authenticated SELECT of active assignments and service_role full
CREATE POLICY usuarios_asignaciones_select ON public.usuarios_asignaciones
FOR SELECT
TO authenticated
USING (esta_activa = true);

CREATE POLICY usuarios_asignaciones_all ON public.usuarios_asignaciones
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- usuarios_grupos: allow authenticated SELECT of active groups, service_role full
CREATE POLICY usuarios_grupos_select ON public.usuarios_grupos
FOR SELECT
TO authenticated
USING (esta_activo = true);

CREATE POLICY usuarios_grupos_all ON public.usuarios_grupos
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- usuarios_roles: allow authenticated SELECT of active roles, service_role full
CREATE POLICY usuarios_roles_select ON public.usuarios_roles
FOR SELECT
TO authenticated
USING (esta_activo = true);

CREATE POLICY usuarios_roles_all ON public.usuarios_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMIT;
