-- 31_fix_current_setting_missing_ok.sql
-- Make current_setting(...) calls missing_ok to prevent errors when settings are not present in anon sessions

BEGIN;

-- Update actividades_admin policy to use missing_ok for app.current_role
DROP POLICY IF EXISTS actividades_admin ON public.actividad_matriz;
CREATE POLICY actividades_admin ON public.actividad_matriz
AS PERMISSIVE
FOR ALL
USING ((current_setting('app.current_role', true) = ANY (ARRAY['admin'::text, 'super_user'::text])));

-- Update actividades_por_sucursal policy to use missing_ok for app.current_sucursal
DROP POLICY IF EXISTS actividades_por_sucursal ON public.actividad_matriz;
CREATE POLICY actividades_por_sucursal ON public.actividad_matriz
AS PERMISSIVE
FOR SELECT
USING ((id_sucursal = (current_setting('app.current_sucursal', true))::integer));

COMMIT;
