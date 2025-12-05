-- MIGRACION: Agregar campos para gestión de contraseña y expiración de usuario
ALTER TABLE public.usuarios ADD COLUMN debe_cambiar_contrasena boolean DEFAULT false;
ALTER TABLE public.usuarios ADD COLUMN fecha_expiracion date;
-- Para usuarios temporales, se usará fecha_expiracion. Si es NULL, el usuario es permanente.