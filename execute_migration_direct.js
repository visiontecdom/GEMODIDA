#!/usr/bin/env node

/**
 * Script para ejecutar migración SQL directamente en PostgreSQL
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

async function executeMigrationDirect() {
  console.log('🚀 Ejecutando migración directa en PostgreSQL...\n');

  const client = new Client(dbConfig);

  try {
    // Conectar a la base de datos
    console.log('🔌 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, 'create_email_providers_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 Archivo SQL cargado correctamente');
    console.log(`📏 Tamaño: ${sqlContent.length} caracteres\n`);

    // Ejecutar el SQL completo
    console.log('⚡ Ejecutando migración completa...');
    await client.query(sqlContent);

    console.log('✅ Migración ejecutada exitosamente!\n');

    // Verificar que todo se creó correctamente
    console.log('🔍 Verificando componentes creados...\n');

    // Verificar tabla
    const tableResult = await client.query(`
      SELECT COUNT(*) as count FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'email_providers'
    `);

    if (tableResult.rows[0].count > 0) {
      console.log('✅ Tabla email_providers: Creada');

      // Contar registros
      const countResult = await client.query('SELECT COUNT(*) as count FROM email_providers');
      console.log(`📊 Registros en tabla: ${countResult.rows[0].count}`);
    } else {
      console.log('❌ Tabla email_providers: No encontrada');
    }

    // Verificar funciones
    const functions = [
      'get_active_email_config',
      'validate_email_provider_config',
      'manage_email_providers'
    ];

    for (const funcName of functions) {
      try {
        const funcResult = await client.query(`
          SELECT COUNT(*) as count FROM information_schema.routines
          WHERE routine_schema = 'public' AND routine_name = $1
        `, [funcName]);

        if (funcResult.rows[0].count > 0) {
          console.log(`✅ Función ${funcName}: Creada`);
        } else {
          console.log(`❌ Función ${funcName}: No encontrada`);
        }
      } catch (e) {
        console.log(`❌ Función ${funcName}: Error - ${e.message}`);
      }
    }

    // Verificar índices
    const indexResult = await client.query(`
      SELECT COUNT(*) as count FROM pg_indexes
      WHERE schemaname = 'public' AND tablename = 'email_providers'
    `);
    console.log(`📊 Índices creados: ${indexResult.rows[0].count}`);

    // Verificar triggers
    const triggerResult = await client.query(`
      SELECT COUNT(*) as count FROM information_schema.triggers
      WHERE event_object_schema = 'public' AND event_object_table = 'email_providers'
    `);
    console.log(`📊 Triggers creados: ${triggerResult.rows[0].count}`);

    console.log('\n🎉 Migración completada exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Ejecuta: node test_email_providers.js');
    console.log('2. Configura un proveedor en el panel de administración');
    console.log('3. Prueba el envío de emails');

  } catch (error) {
    console.error('❌ Error en la migración:', error.message);

    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Algunos componentes ya existen. Verificando estado actual...\n');

      // Verificar qué existe
      try {
        const tableCheck = await client.query('SELECT COUNT(*) FROM email_providers');
        console.log(`✅ Tabla existe con ${tableCheck.rows[0].count} registros`);

        // Verificar funciones
        const funcCheck = await client.query('SELECT get_active_email_config() as test');
        console.log('✅ Función get_active_email_config funciona');
      } catch (e) {
        console.log('❌ Componentes faltantes:', e.message);
      }
    }

    console.log('\n🔧 Si hay errores, ejecuta manualmente en Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/divxhluqybbcgfqozbjq/sql');

  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar migración
executeMigrationDirect();