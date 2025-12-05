#!/usr/bin/env node

/**
 * Script para configurar un proveedor de email de ejemplo (Gmail OAuth2)
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

async function configureExampleProvider() {
  console.log('🚀 Configurando proveedor de email de ejemplo (Gmail OAuth2)...\n');

  const client = new Client(dbConfig);

  try {
    await client.connect();

    // Configurar Gmail OAuth2 con las credenciales del .env.local
    const gmailConfig = {
      client_id: 'TU_CLIENT_ID_AQUI',
      client_secret: 'TU_CLIENT_SECRET_AQUI',
      refresh_token: 'TU_REFRESH_TOKEN_AQUI',
      from_email: 'lotecom@gmail.com',
      from_name: 'GEMODIDA Sistema'
    };

    console.log('📧 Configurando Gmail OAuth2...');
    console.log(`   From: ${gmailConfig.from_name} <${gmailConfig.from_email}>`);

    // Actualizar el proveedor Gmail OAuth2 existente
    const updateQuery = `
      UPDATE email_providers
      SET
        config = $1,
        is_active = true,
        is_default = true,
        updated_at = NOW()
      WHERE name = 'gmail_oauth2'
    `;

    await client.query(updateQuery, [JSON.stringify(gmailConfig)]);

    console.log('✅ Proveedor Gmail OAuth2 configurado y activado!\n');

    // Verificar configuración
    const verifyResult = await client.query('SELECT get_active_email_config() as config');
    const activeConfig = verifyResult.rows[0].config;

    if (activeConfig) {
      console.log('🔍 Verificación de configuración activa:');
      console.log(`   ✅ Proveedor: ${activeConfig.provider}`);
      console.log(`   ✅ Nombre: ${activeConfig.name}`);
      console.log(`   ✅ Email: ${activeConfig.config.from_email}`);
    } else {
      console.log('❌ Error: No se pudo obtener configuración activa');
    }

    console.log('\n🎉 Configuración completada!');
    console.log('\n📋 El sistema está listo para enviar emails.');
    console.log('📧 Puedes probar enviando un email de recuperación de contraseña.');
    console.log('\n💡 Para cambiar la configuración, ve al panel de administración > Proveedores de Email');

  } catch (error) {
    console.error('❌ Error configurando proveedor:', error.message);
  } finally {
    await client.end();
  }
}

// Ejecutar configuración
configureExampleProvider();
