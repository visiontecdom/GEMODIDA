const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://divxhluqybbcgfqozbjq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdnhobHVxeWJiY2dmcW96YmpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA1MDc5MSwiZXhwIjoyMDc4NjI2NzkxfQ.kY91IBlAztaCStGbxtUOEdxWdaJ7X6O1AvqwIuMZXr0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeMigrationScript(scriptPath, scriptName) {
  console.log(`\n=== EJECUTANDO ${scriptName} ===`);

  try {
    const sql = fs.readFileSync(scriptPath, 'utf8');
    console.log('Contenido del script:');
    console.log(sql.substring(0, 200) + (sql.length > 200 ? '...' : ''));
    console.log('');

    // Ejecutar el SQL completo usando rpc con una función que permita ejecutar DDL
    // Nota: En Supabase, DDL statements necesitan ejecutarse desde el SQL Editor
    // Pero podemos intentar ejecutar algunas partes usando funciones existentes

    console.log('⚠️  Nota: DDL statements requieren ejecución manual en Supabase SQL Editor');
    console.log('📋 Instrucciones:');
    console.log('1. Ve a https://supabase.com/dashboard/project/divxhluqybbcgfqozbjq/sql');
    console.log('2. Crea un nuevo query');
    console.log('3. Copia y pega el contenido del archivo');
    console.log('4. Ejecuta el script');
    console.log('');

    // Intentar ejecutar algunas validaciones usando funciones existentes
    try {
      console.log('Verificando estructura de tabla usuarios...');
      const { data: columns, error } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'usuarios')
        .eq('table_schema', 'public');

      if (error) {
        console.log('❌ Error verificando tabla:', error.message);
      } else {
        console.log('✅ Columnas actuales en usuarios:', columns?.map(c => c.column_name).join(', '));
      }
    } catch (e) {
      console.log('❌ Error en verificación:', e.message);
    }

  } catch (error) {
    console.error(`❌ Error procesando ${scriptName}:`, error.message);
  }
}

async function runMigrations() {
  console.log('🚀 EJECUTANDO MIGRACIONES DEL SISTEMA DE LOGIN DINÁMICO');
  console.log('Proyecto: GEMODIDA - Supabase');
  console.log('Fecha:', new Date().toISOString());
  console.log('');

  const scripts = [
    {
      path: 'db/scripts_sql/improve_login_system.sql',
      name: 'MEJORA SISTEMA LOGIN - CAMPOS OBLIGATORIOS'
    },
    {
      path: 'db/scripts_sql/create_auth_function.sql',
      name: 'FUNCIÓN AUTENTICACIÓN USUARIO'
    },
    {
      path: 'db/scripts_sql/update_user_functions_with_login.sql',
      name: 'ACTUALIZACIÓN FUNCIONES CRUD USUARIOS'
    }
  ];

  for (const script of scripts) {
    const fullPath = path.join(process.cwd(), script.path);
    if (fs.existsSync(fullPath)) {
      await executeMigrationScript(fullPath, script.name);
    } else {
      console.error(`❌ Archivo no encontrado: ${script.path}`);
    }
  }

  console.log('\n🎯 INSTRUCCIONES PARA EJECUCIÓN MANUAL');
  console.log('=====================================');
  console.log('Como Supabase no permite DDL via API, ejecuta manualmente:');
  console.log('');
  console.log('1. Ve al SQL Editor de Supabase:');
  console.log('   https://supabase.com/dashboard/project/divxhluqybbcgfqozbjq/sql');
  console.log('');
  console.log('2. Ejecuta los scripts en este orden:');
  scripts.forEach((script, index) => {
    console.log(`   ${index + 1}. ${script.path}`);
  });
  console.log('');
  console.log('3. Una vez ejecutados, el sistema de login dinámico estará activo');
  console.log('');
  console.log('✅ Script de instrucciones generado');
}

runMigrations().catch(console.error);