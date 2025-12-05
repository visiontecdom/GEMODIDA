-- Crear tabla para proveedores de email
CREATE TABLE IF NOT EXISTS email_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    provider_type VARCHAR(50) NOT NULL, -- smtp, gmail_oauth2, sendgrid, etc.
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_email_providers_active ON email_providers(is_active);
CREATE INDEX IF NOT EXISTS idx_email_providers_default ON email_providers(is_default);
CREATE INDEX IF NOT EXISTS idx_email_providers_type ON email_providers(provider_type);

-- Función para obtener configuración de email activa
CREATE OR REPLACE FUNCTION get_active_email_config()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Primero intentar obtener el proveedor por defecto
    SELECT jsonb_build_object(
        'provider', p.provider_type,
        'config', p.config,
        'name', p.name,
        'id', p.id
    ) INTO result
    FROM email_providers p
    WHERE p.is_active = true AND p.is_default = true
    LIMIT 1;

    -- Si no hay proveedor por defecto, obtener el primero activo
    IF result IS NULL THEN
        SELECT jsonb_build_object(
            'provider', p.provider_type,
            'config', p.config,
            'name', p.name,
            'id', p.id
        ) INTO result
        FROM email_providers p
        WHERE p.is_active = true
        ORDER BY p.created_at ASC
        LIMIT 1;
    END IF;

    RETURN result;
END;
$$;

-- Función para validar configuración de proveedor
CREATE OR REPLACE FUNCTION validate_email_provider_config(
    p_provider_type VARCHAR,
    p_config JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    validation_result JSONB := jsonb_build_object('valid', true, 'errors', '[]'::jsonb);
BEGIN
    CASE p_provider_type
        WHEN 'smtp' THEN
            -- Validar SMTP
            IF NOT (p_config ? 'host' AND p_config ? 'port' AND p_config ? 'user' AND p_config ? 'pass') THEN
                validation_result := jsonb_build_object(
                    'valid', false,
                    'errors', jsonb_build_array(
                        'SMTP requiere: host, port, user, pass'
                    )
                );
            END IF;

        WHEN 'gmail_oauth2' THEN
            -- Validar Gmail OAuth2
            IF NOT (p_config ? 'client_id' AND p_config ? 'client_secret' AND p_config ? 'refresh_token') THEN
                validation_result := jsonb_build_object(
                    'valid', false,
                    'errors', jsonb_build_array(
                        'Gmail OAuth2 requiere: client_id, client_secret, refresh_token'
                    )
                );
            END IF;

        WHEN 'sendgrid' THEN
            -- Validar SendGrid
            IF NOT (p_config ? 'api_key') THEN
                validation_result := jsonb_build_object(
                    'valid', false,
                    'errors', jsonb_build_array(
                        'SendGrid requiere: api_key'
                    )
                );
            END IF;

        ELSE
            validation_result := jsonb_build_object(
                'valid', false,
                'errors', jsonb_build_array(
                    'Tipo de proveedor no soportado: ' || p_provider_type
                )
            );
    END CASE;

    RETURN validation_result;
END;
$$;

-- Trigger para validar configuración antes de insertar/actualizar
CREATE OR REPLACE FUNCTION validate_email_provider()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    validation JSONB;
BEGIN
    -- Validar configuración
    validation := validate_email_provider_config(NEW.provider_type, NEW.config);

    IF NOT (validation->>'valid')::boolean THEN
        RAISE EXCEPTION 'Configuración inválida: %', validation->>'errors';
    END IF;

    -- Si se marca como default, quitar default de otros
    IF NEW.is_default = true THEN
        UPDATE email_providers
        SET is_default = false
        WHERE id != NEW.id AND is_default = true;
    END IF;

    -- Si no hay ningún default después de esta operación, marcar este como default
    IF NOT EXISTS (SELECT 1 FROM email_providers WHERE is_default = true AND id != NEW.id) THEN
        NEW.is_default := true;
    END IF;

    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$;

-- Crear trigger
DROP TRIGGER IF EXISTS validate_email_provider_trigger ON email_providers;
CREATE TRIGGER validate_email_provider_trigger
    BEFORE INSERT OR UPDATE ON email_providers
    FOR EACH ROW EXECUTE FUNCTION validate_email_provider();

-- Función RPC para gestionar proveedores de email
CREATE OR REPLACE FUNCTION manage_email_providers(
    operation VARCHAR,
    provider_data JSONB DEFAULT NULL,
    provider_id INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    new_provider_id INTEGER;
BEGIN
    CASE operation
        WHEN 'CREATE' THEN
            INSERT INTO email_providers (
                name,
                provider_type,
                display_name,
                description,
                is_active,
                config,
                created_by
            ) VALUES (
                provider_data->>'name',
                provider_data->>'provider_type',
                provider_data->>'display_name',
                provider_data->>'description',
                (provider_data->>'is_active')::boolean,
                provider_data->'config',
                auth.uid()
            )
            RETURNING id INTO new_provider_id;

            result := jsonb_build_object(
                'success', true,
                'message', 'Proveedor creado exitosamente',
                'id', new_provider_id
            );

        WHEN 'UPDATE' THEN
            UPDATE email_providers SET
                name = COALESCE(provider_data->>'name', name),
                provider_type = COALESCE(provider_data->>'provider_type', provider_type),
                display_name = COALESCE(provider_data->>'display_name', display_name),
                description = COALESCE(provider_data->>'description', description),
                is_active = COALESCE((provider_data->>'is_active')::boolean, is_active),
                is_default = COALESCE((provider_data->>'is_default')::boolean, is_default),
                config = COALESCE(provider_data->'config', config),
                updated_by = auth.uid(),
                updated_at = NOW()
            WHERE id = provider_id;

            IF FOUND THEN
                result := jsonb_build_object(
                    'success', true,
                    'message', 'Proveedor actualizado exitosamente'
                );
            ELSE
                result := jsonb_build_object(
                    'success', false,
                    'message', 'Proveedor no encontrado'
                );
            END IF;

        WHEN 'DELETE' THEN
            DELETE FROM email_providers WHERE id = provider_id;

            IF FOUND THEN
                result := jsonb_build_object(
                    'success', true,
                    'message', 'Proveedor eliminado exitosamente'
                );
            ELSE
                result := jsonb_build_object(
                    'success', false,
                    'message', 'Proveedor no encontrado'
                );
            END IF;

        WHEN 'LIST' THEN
            SELECT jsonb_build_object(
                'success', true,
                'providers', jsonb_agg(
                    jsonb_build_object(
                        'id', p.id,
                        'name', p.name,
                        'provider_type', p.provider_type,
                        'display_name', p.display_name,
                        'description', p.description,
                        'is_active', p.is_active,
                        'is_default', p.is_default,
                        'config', p.config,
                        'created_at', p.created_at,
                        'updated_at', p.updated_at
                    )
                )
            ) INTO result
            FROM email_providers p
            ORDER BY p.is_default DESC, p.created_at ASC;

        WHEN 'SET_DEFAULT' THEN
            UPDATE email_providers SET is_default = false;
            UPDATE email_providers SET is_default = true WHERE id = provider_id;

            IF FOUND THEN
                result := jsonb_build_object(
                    'success', true,
                    'message', 'Proveedor marcado como predeterminado'
                );
            ELSE
                result := jsonb_build_object(
                    'success', false,
                    'message', 'Proveedor no encontrado'
                );
            END IF;

        ELSE
            result := jsonb_build_object(
                'success', false,
                'message', 'Operación no válida'
            );
    END CASE;

    RETURN result;
END;
$$;

-- Políticas RLS
ALTER TABLE email_providers ENABLE ROW LEVEL SECURITY;

-- Políticas para administradores
CREATE POLICY "Administradores pueden gestionar proveedores de email"
ON email_providers
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM user_role_assignments ura
        JOIN roles r ON ura.role_id = r.id
        WHERE ura.user_id = auth.uid()
        AND r.code IN ('admin', 'super_user', 'desarrollador')
    )
);

-- Insertar plantillas de proveedores por defecto
INSERT INTO email_providers (name, provider_type, display_name, description, is_active, is_default, config) VALUES
('smtp_microsoft', 'smtp', 'Microsoft 365 / Outlook', 'Proveedor SMTP para cuentas de Microsoft 365 u Outlook empresarial', false, false, '{
  "host": "smtp.office365.com",
  "port": 587,
  "secure": false,
  "user": "",
  "pass": "",
  "from_email": "",
  "from_name": "GEMODIDA Sistema"
}'::jsonb),

('smtp_gmail', 'smtp', 'Gmail SMTP', 'Proveedor SMTP para cuentas de Gmail (requiere contraseña de aplicación)', false, false, '{
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "user": "",
  "pass": "",
  "from_email": "",
  "from_name": "GEMODIDA Sistema"
}'::jsonb),

('smtp_zoho', 'smtp', 'Zoho Mail', 'Proveedor SMTP para cuentas de Zoho Mail', false, false, '{
  "host": "smtp.zoho.com",
  "port": 587,
  "secure": false,
  "user": "",
  "pass": "",
  "from_email": "",
  "from_name": "GEMODIDA Sistema"
}'::jsonb),

('gmail_oauth2', 'gmail_oauth2', 'Gmail API OAuth2', 'Proveedor Gmail API con OAuth2 (completamente gratuito)', false, false, '{
  "client_id": "",
  "client_secret": "",
  "refresh_token": "",
  "from_email": "",
  "from_name": "GEMODIDA Sistema"
}'::jsonb),

('sendgrid', 'sendgrid', 'SendGrid', 'Proveedor SendGrid (gratuito hasta 100 emails/día)', false, false, '{
  "api_key": "",
  "from_email": "",
  "from_name": "GEMODIDA Sistema"
}'::jsonb),

('smtp_exchange', 'smtp', 'Microsoft Exchange', 'Proveedor SMTP para servidores Microsoft Exchange locales', false, false, '{
  "host": "",
  "port": 587,
  "secure": false,
  "user": "",
  "pass": "",
  "from_email": "",
  "from_name": "GEMODIDA Sistema"
}'::jsonb),

('smtp_custom', 'smtp', 'SMTP Personalizado', 'Proveedor SMTP genérico para cualquier servidor SMTP', false, false, '{
  "host": "",
  "port": 587,
  "secure": false,
  "user": "",
  "pass": "",
  "from_email": "",
  "from_name": "GEMODIDA Sistema"
}'::jsonb);