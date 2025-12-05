const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://divxhluqybbcgfqozbjq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdnhobHVxeWJiY2dmcW96YmpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA1MDc5MSwiZXhwIjoyMDc4NjI2NzkxfQ.kY91IBlAztaCStGbxtUOEdxWdaJ7X6O1AvqwIuMZXr0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseStructure() {
  console.log('🔍 REVISANDO ESTRUCTURA ACTUAL DE LA BASE DE DATOS');
  console.log('==================================================');

  try {
    // Verificar tabla usuarios
    console.log('\n📋 TABLA: usuarios');
    console.log('-------------------');

    const { data: usersColumns, error: usersError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_name = 'usuarios'
            AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });

    if (usersError) {
      console.log('❌ Error consultando tabla usuarios:', usersError.message);
      // Intentar consulta directa
      const { data: usersData, error: directError } = await supabase
        .from('usuarios')
        .select('*')
        .limit(1);

      if (directError) {
        console.log('❌ Error accediendo tabla usuarios:', directError.message);
      } else {
        console.log('✅ Tabla usuarios existe. Columnas detectadas:');
        if (usersData && usersData.length > 0) {
          console.log('Columnas:', Object.keys(usersData[0]).join(', '));
        }
      }
    } else {
      console.log('Columnas de usuarios:');
      usersColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
    }

    // Verificar funciones existentes
    console.log('\n🔧 FUNCIONES RPC EXISTENTES');
    console.log('----------------------------');

    const functions = [
      'autenticar_usuario',
      'obtener_usuarios_completos',
      'actualizar_usuario',
      'crear_usuario_completo'
    ];

    for (const func of functions) {
      try {
        const { data, error } = await supabase.rpc(func, {});
        if (error && !error.message.includes('function') && !error.message.includes('does not exist')) {
          console.log(`✅ Función ${func} existe`);
        } else {
          console.log(`❌ Función ${func} no existe o tiene parámetros requeridos`);
        }
      } catch (e) {
        console.log(`❌ Función ${func} no existe`);
      }
    }

    // Verificar índices únicos
    console.log('\n🔑 ÍNDICES ÚNICOS EN USUARIOS');
    console.log('-----------------------------');

    try {
      const { data: indexes, error } = await supabase
        .rpc('exec_sql', {
          sql: `
            SELECT
              indexname,
              indexdef
            FROM pg_indexes
            WHERE tablename = 'usuarios'
              AND schemaname = 'public'
              AND indexdef LIKE '%UNIQUE%';
          `
        });

      if (error) {
        console.log('❌ Error consultando índices');
      } else {
        console.log('Índices únicos encontrados:');
        indexes.forEach(idx => {
          console.log(`  - ${idx.indexname}: ${idx.indexdef}`);
        });
      }
    } catch (e) {
      console.log('❌ Error consultando índices');
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

async function executeMigrationWithChecks() {
  console.log('\n🚀 EJECUTANDO MIGRACIONES CON VERIFICACIONES');
  console.log('============================================');

  // Primero verificar estructura
  await checkDatabaseStructure();

  // Leer y ejecutar scripts
  const scripts = [
    {
      path: 'db/scripts_sql/improve_login_system.sql',
      name: 'MEJORA SISTEMA LOGIN'
    },
    {
      path: 'db/scripts_sql/create_auth_function.sql',
      name: 'FUNCIÓN AUTENTICACIÓN'
    },
    {
      path: 'db/scripts_sql/update_user_functions_with_login.sql',
      name: 'ACTUALIZACIÓN FUNCIONES CRUD'
    }
  ];

  for (const script of scripts) {
    const fullPath = path.join(process.cwd(), script.path);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Archivo no encontrado: ${script.path}`);
      continue;
    }

    console.log(`\n📄 EJECUTANDO: ${script.name}`);
    console.log('='.repeat(50));

    const sql = fs.readFileSync(fullPath, 'utf8');
    console.log('SQL a ejecutar:');
    console.log(sql.substring(0, 300) + (sql.length > 300 ? '...' : ''));
    console.log('');

    try {
      // Intentar ejecutar usando RPC si existe
      const { data, error } = await supabase.rpc('exec_sql', { sql });

      if (error) {
        console.log('❌ Error ejecutando via RPC:', error.message);

        // Intentar ejecutar statement por statement
        console.log('🔄 Intentando ejecutar statement por statement...');
        const statements = sql.split(';').filter(stmt => stmt.trim().length > 0 && !stmt.trim().startsWith('--'));

        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i].trim() + ';';
          if (statement.length < 10) continue; // Skip empty statements

          console.log(`Statement ${i + 1}: ${statement.substring(0, 60)}...`);

          try {
            // Para DDL, no podemos ejecutar via cliente JS
            console.log('⚠️  DDL statement - requiere ejecución manual en SQL Editor');
          } catch (e) {
            console.log(`❌ Error en statement ${i + 1}:`, e.message);
          }
        }
      } else {
        console.log('✅ Script ejecutado exitosamente via RPC');
        console.log('Resultado:', data);
      }
    } catch (e) {
      console.log('❌ Error general ejecutando script:', e.message);
    }

    // Verificar estado después de cada script
    console.log('\n🔍 Verificación post-ejecución:');
    await checkDatabaseStructure();
  }

  console.log('\n🎯 INSTRUCCIONES FINALES');
  console.log('=======================');
  console.log('Como algunos DDL statements requieren ejecución manual:');
  console.log('');
  console.log('1. Ve al SQL Editor: https://supabase.com/dashboard/project/divxhluqybbcgfqozbjq/sql');
  console.log('2. Ejecuta los scripts en orden:');
  scripts.forEach((script, index) => {
    console.log(`   ${index + 1}. ${script.path}`);
  });
  console.log('');
  console.log('3. Verifica que no haya errores de valores nulos en nombre_ingreso');
  console.log('4. Prueba el sistema de login con ambos métodos de autenticación');
}

executeMigrationWithChecks().catch(console.error);