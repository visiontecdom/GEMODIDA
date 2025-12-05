-- 30_simplify_rls_for_roles_and_users.sql
-- Drops complex policies that cause recursion and recreates minimal safe policies

BEGIN;

-- Simplify usuarios policies: drop all and recreate safe policies
DROP POLICY IF EXISTS usuarios_select_own ON public.usuarios;
DROP POLICY IF EXISTS usuarios_select_authenticated ON public.usuarios;
DROP POLICY IF EXISTS usuarios_update_own ON public.usuarios;
DROP POLICY IF EXISTS usuarios_all_service_role ON public.usuarios;

CREATE POLICY usuarios_select_own ON public.usuarios
FOR SELECT
USING (id_usuario = auth.uid()::uuid);

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

-- usuarios_roles: remove admin policies that reference usuarios/asignaciones (cause recursion)
DROP POLICY IF EXISTS admin_seguridad_pueden_gestionar_roles ON public.usuarios_roles;
DROP POLICY IF EXISTS admin_seguridad_pueden_gestionar_roles ON public.usuarios_roles;

-- Ensure only simple policies exist for usuarios_roles
DROP POLICY IF EXISTS usuarios_roles_select ON public.usuarios_roles;
DROP POLICY IF EXISTS usuarios_roles_all ON public.usuarios_roles;

CREATE POLICY usuarios_roles_select ON public.usuarios_roles
FOR SELECT
TO authenticated
USING (esta_activo = true);

CREATE POLICY usuarios_roles_all ON public.usuarios_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- usuarios_grupos: remove admin policy that references users/assignments
DROP POLICY IF EXISTS admin_puede_gestionar_grupos ON public.usuarios_grupos;
DROP POLICY IF EXISTS admin_puede_gestionar_grupos ON public.usuarios_grupos;

-- Ensure minimal policies exist for usuarios_grupos
DROP POLICY IF EXISTS usuarios_grupos_select ON public.usuarios_grupos;
DROP POLICY IF EXISTS usuarios_grupos_all ON public.usuarios_grupos;

CREATE POLICY usuarios_grupos_select ON public.usuarios_grupos
FOR SELECT
TO authenticated
USING (esta_activo = true);

CREATE POLICY usuarios_grupos_all ON public.usuarios_grupos
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMIT;
