const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://divxhluqybbcgfqozbjq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdnhobHVxeWJiY2dmcW96YmpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA1MDc5MSwiZXhwIjoyMDc4NjI2NzkxfQ.kY91IBlAztaCStGbxtUOEdxWdaJ7X6O1AvqwIuMZXr0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSqlDirectly(sql, description) {
  console.log(`\n=== EJECUTANDO: ${description} ===`);

  try {
    // Intentar ejecutar el SQL completo
    const { data, error } = await supabase.rpc('exec_sql', { sql: sql });

    if (error) {
      console.log('❌ Error ejecutando con RPC, intentando método alternativo...');
      console.log('Error:', error.message);

      // Para DDL statements, no podemos ejecutar desde el cliente JS
      // Vamos a simular y mostrar instrucciones
      console.log('\n⚠️  DDL STATEMENTS DETECTADOS');
      console.log('Los siguientes statements necesitan ejecutarse manualmente en Supabase SQL Editor:');
      console.log('1. Ve a: https://supabase.com/dashboard/project/divxhluqybbcgfqozbjq');
      console.log('2. SQL Editor > New Query');
      console.log('3. Copia y pega el SQL completo');
      console.log('4. Ejecuta el query');

      return false;
    } else {
      console.log('✅ SQL ejecutado exitosamente');
      return true;
    }
  } catch (error) {
    console.error('❌ Error ejecutando SQL:', error.message);
    return false;
  }
}

async function runMigrations() {
  console.log('🚀 INICIANDO EJECUCIÓN DE MIGRACIONES SQL EN SUPABASE');
  console.log('Proyecto: divxhluqybbcgfqozbjq');
  console.log('URL: https://divxhluqybbcgfqozbjq.supabase.co');
  console.log('Fecha:', new Date().toISOString());
  console.log('');

  const migrations = [
    {
      file: 'db/scripts_sql/add_usuario_password_fields.sql',
      name: 'AGREGAR CAMPOS DE CONTRASEÑA',
      description: 'Agrega columnas debe_cambiar_contrasena y fecha_expiracion a tabla usuarios'
    },
    {
      file: 'db/scripts_sql/update_usuario_functions_with_password_fields.sql',
      name: 'ACTUALIZAR FUNCIONES RPC',
      description: 'Actualiza funciones obtener_usuarios_completos, actualizar_usuario e insertar_usuario_completo'
    },
    {
      file: 'db/scripts_sql/validate_usuario_password_fields.sql',
      name: 'VALIDACIÓN DE CAMBIOS',
      description: 'Verifica que las columnas y funciones nuevas funcionen correctamente'
    }
  ];

  let allSuccessful = true;

  for (const migration of migrations) {
    const filePath = path.join(process.cwd(), migration.file);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Archivo no encontrado: ${migration.file}`);
      allSuccessful = false;
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`📄 ${migration.file}`);
    console.log(`Descripción: ${migration.description}`);
    console.log(`Tamaño: ${sql.length} caracteres`);

    const success = await executeSqlDirectly(sql, migration.name);

    if (!success) {
      allSuccessful = false;
    }

    console.log('');
  }

  console.log('🎯 RESULTADO FINAL:');
  if (allSuccessful) {
    console.log('✅ TODAS LAS MIGRACIONES EJECUTADAS EXITOSAMENTE');
  } else {
    console.log('⚠️  ALGUNAS MIGRACIONES NECESITAN EJECUCIÓN MANUAL');
    console.log('');
    console.log('INSTRUCCIONES PARA EJECUCIÓN MANUAL:');
    console.log('1. Ve a: https://supabase.com/dashboard/project/divxhluqybbcgfqozbjq');
    console.log('2. SQL Editor > New Query');
    console.log('3. Copia y pega cada script SQL completo');
    console.log('4. Ejecuta cada query por separado');
    console.log('5. Verifica que no haya errores');
  }

  console.log('\n🔍 PRÓXIMOS PASOS:');
  console.log('1. Verificar en Supabase que las columnas nuevas existen');
  console.log('2. Probar la funcionalidad de edición de usuarios');
  console.log('3. Ejecutar pruebas de validación');
}

runMigrations().catch(console.error);