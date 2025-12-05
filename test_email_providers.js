#!/usr/bin/env node

/**
 * Script de prueba para el sistema de proveedores de email
 * Ejecutar después de aplicar la migración de base de datos
 */

const { createClient } = require('@supabase/supabase-js');

// Configurar Supabase - usar variables de entorno o valores por defecto para desarrollo
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://divxhluqybbcgfqozbjq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdnhobHVxeWJiY2dmcW96YmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNTA3OTEsImV4cCI6MjA3ODYyNjc5MX0.6V2UpTpkNzKJGjoWg8GoBI9jPlROxWxRJV6XjEtqpYQ';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  console.log('   Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmailProvidersSystem() {
  console.log('🧪 Probando sistema de proveedores de email...\n');

  try {
    // 1. Probar función get_active_email_config
    console.log('1. Probando get_active_email_config...');
    const { data: activeConfig, error: activeError } = await supabase.rpc('get_active_email_config');

    if (activeError) {
      console.log('   ❌ Error:', activeError.message);
    } else if (!activeConfig) {
      console.log('   ⚠️  No hay proveedor activo configurado (esperado inicialmente)');
    } else {
      console.log('   ✅ Proveedor activo encontrado:', activeConfig.name);
    }

    // 2. Probar función manage_email_providers (LIST)
    console.log('\n2. Probando listado de proveedores...');
    const { data: listResult, error: listError } = await supabase.rpc('manage_email_providers', {
      operation: 'LIST'
    });

    if (listError) {
      console.log('   ❌ Error:', listError.message);
    } else {
      console.log(`   ✅ Encontrados ${listResult.providers?.length || 0} proveedores`);
      if (listResult.providers?.length > 0) {
        console.log('   📋 Proveedores disponibles:');
        listResult.providers.forEach(p => {
          console.log(`      - ${p.display_name} (${p.provider_type}) ${p.is_active ? '[ACTIVO]' : ''} ${p.is_default ? '[POR DEFECTO]' : ''}`);
        });
      }
    }

    // 3. Probar validación de configuración
    console.log('\n3. Probando validación de configuración...');
    const testConfigs = [
      { type: 'smtp', config: { host: 'smtp.test.com', port: 587, user: 'test', pass: 'pass' } },
      { type: 'gmail_oauth2', config: { client_id: 'test', client_secret: 'test', refresh_token: 'test' } },
      { type: 'sendgrid', config: { api_key: 'test' } },
      { type: 'invalid', config: {} }
    ];

    for (const test of testConfigs) {
      const { data: validation, error: valError } = await supabase.rpc('validate_email_provider_config', {
        p_provider_type: test.type,
        p_config: test.config
      });

      if (valError) {
        console.log(`   ❌ Error validando ${test.type}:`, valError.message);
      } else {
        console.log(`   ${validation.valid ? '✅' : '❌'} ${test.type}: ${validation.valid ? 'Válido' : validation.errors.join(', ')}`);
      }
    }

    console.log('\n🎉 Pruebas completadas!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Ejecutar la migración SQL en Supabase Dashboard');
    console.log('   2. Configurar un proveedor de email en el panel de administración');
    console.log('   3. Probar envío de emails desde la aplicación');

  } catch (error) {
    console.error('❌ Error en pruebas:', error.message);
  }
}

// Ejecutar pruebas
testEmailProvidersSystem();