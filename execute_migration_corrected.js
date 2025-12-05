#!/usr/bin/env node

/**
 * Script para verificar tablas existentes y ejecutar migración corregida
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de conexión directa a PostgreSQL
const dbConfig = {
  host: 'aws-0-us-west-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.divxhluqybbcgfqozbjq',
  password: 'Millonario##01',
  ssl: {
    rejectUnauthorized: false
  }
};

async function checkExistingTables() {
  console.log('🔍 Verificando tablas existentes...\n');

  const client = new Client(dbConfig);

  try {
    await client.connect();

    // Verificar tablas relacionadas con usuarios y roles
    const tablesToCheck = [
      'user_role_assignments',
      'roles',
      'auth.users',
      'email_providers'
    ];

    for (const tableName of tablesToCheck) {
      try {
        let query;
        if (tableName.includes('auth.')) {
          query = `SELECT COUNT(*) as count FROM ${tableName}`;
        } else {
          query = `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${tableName}'`;
        }

        const result = await client.query(query);

        if (tableName.includes('information_schema')) {
          const exists = result.rows[0].count > 0;
          console.log(`${exists ? '✅' : '❌'} ${tableName}: ${exists ? 'Existe' : 'No existe'}`);
        } else {
          console.log(`📊 ${tableName}: ${result.rows[0].count} registros`);
        }

      } catch (e) {
        console.log(`❌ ${tableName}: Error - ${e.message}`);
      }
    }

    // Verificar roles existentes
    console.log('\n👥 Verificando roles...');
    try {
      const rolesResult = await client.query('SELECT code, name FROM roles LIMIT 5');
      console.log('Roles encontrados:', rolesResult.rows.length);
      rolesResult.rows.forEach(role => {
        console.log(`  - ${role.code}: ${role.name}`);
      });
    } catch (e) {
      console.log('❌ Error verificando roles:', e.message);
    }

  } finally {
    await client.end();
  }
}

async function executeCorrectedMigration() {
  console.log('\n🚀 Ejecutando migración corregida...\n');

  const client = new Client(dbConfig);

  try {
    await client.connect();

    // SQL corregido sin la política RLS problemática
    const correctedSQL = `
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

-- Políticas RLS (comentadas por ahora hasta verificar estructura de roles)
-- ALTER TABLE email_providers ENABLE ROW LEVEL SECURITY;

-- Política básica para permitir acceso (temporal)
-- CREATE POLICY "Permitir acceso básico" ON email_providers FOR ALL USING (true);

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
`;

    console.log('⚡ Ejecutando SQL corregido...');
    await client.query(correctedSQL);

    console.log('✅ Migración ejecutada exitosamente!\n');

    // Verificar resultados
    const countResult = await client.query('SELECT COUNT(*) as count FROM email_providers');
    console.log(`📊 Proveedores creados: ${countResult.rows[0].count}`);

    // Probar función
    const testResult = await client.query('SELECT get_active_email_config() as config');
    console.log('🔧 Función get_active_email_config:', testResult.rows[0].config ? 'OK' : 'Sin configuración activa');

    console.log('\n🎉 Migración completada! Las políticas RLS se pueden agregar después de verificar la estructura de roles.');

  } finally {
    await client.end();
  }
}

// Ejecutar verificación y migración
async function main() {
  await checkExistingTables();
  await executeCorrectedMigration();
}

main().catch(console.error);