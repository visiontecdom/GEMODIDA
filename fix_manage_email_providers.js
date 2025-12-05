#!/usr/bin/env node

/**
 * Script para corregir la función manage_email_providers
 */

const { Client } = require('pg');

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

async function fixManageEmailProvidersFunction() {
  console.log('🔧 Corrigiendo función manage_email_providers...\n');

  const client = new Client(dbConfig);

  try {
    await client.connect();

    // Corregir la función manage_email_providers
    const fixSQL = `
-- Corregir función RPC para gestionar proveedores de email
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
                    ) ORDER BY p.is_default DESC, p.created_at ASC
                )
            ) INTO result
            FROM email_providers p;

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
`;

    console.log('⚡ Ejecutando corrección...');
    await client.query(fixSQL);

    console.log('✅ Función corregida exitosamente!\n');

    // Probar la función corregida
    console.log('🔍 Probando función corregida...');
    const testResult = await client.query("SELECT manage_email_providers('LIST') as result");

    if (testResult.rows[0].result.success) {
      console.log(`✅ LIST funciona correctamente - ${testResult.rows[0].result.providers?.length || 0} proveedores encontrados`);
    } else {
      console.log('❌ Error en función LIST:', testResult.rows[0].result.message);
    }

  } catch (error) {
    console.error('❌ Error corrigiendo función:', error.message);
  } finally {
    await client.end();
  }
}

// Ejecutar corrección
fixManageEmailProvidersFunction();