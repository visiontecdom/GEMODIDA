-- Administrators can manage users (authenticated users who are role id = 1)
CREATE POLICY "Los administradores pueden gestionar usuarios"
  ON public.usuarios
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (
    (auth.role() = 'authenticated'::text)
    AND EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.id_usuario = auth.uid() AND u.id_rol = 1
    )
  );

-- Users can view their own profile
CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON public.usuarios
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id_usuario);

-- Users can delete their own keywords
CREATE POLICY "Los usuarios pueden eliminar sus propias palabras clave"
  ON public.palabras_clave
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (id_usuario_creador = auth.uid());

-- Users can update their own keywords
CREATE POLICY "Los usuarios pueden editar sus propias palabras clave"
  ON public.palabras_clave
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (id_usuario_creador = auth.uid());

-- Users can insert keywords (must set creator to themselves)
CREATE POLICY "Los usuarios pueden crear palabras clave"
  ON public.palabras_clave
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (id_usuario_creador = auth.uid());

-- Users can select their own keywords or public ones
CREATE POLICY "Los usuarios pueden ver sus propias palabras clave"
  ON public.palabras_clave
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (id_usuario_creador = auth.uid() OR es_publica = true);

-- Users can create reports
CREATE POLICY "Los usuarios pueden crear reportes"
  ON public.reportes
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (id_usuario_solicitante = auth.uid());

-- Users can view their own reports OR admins (role id = 1)
CREATE POLICY "Los usuarios pueden ver sus propios reportes"
  ON public.reportes
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    id_usuario_solicitante = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.id_usuario = auth.uid() AND u.id_rol = 1
    )
  );