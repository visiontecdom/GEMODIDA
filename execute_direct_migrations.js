const fs = require('fs');
const path = require('path');
const https = require('https');

const supabaseUrl = 'https://divxhluqybbcgfqozbjq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdnhobHVxeWJiY2dmcW96YmpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA1MDc5MSwiZXhwIjoyMDc4NjI2NzkxfQ.kY91IBlAztaCStGbxtUOEdxWdaJ7X6O1AvnwIuMZXr0';

function makeSupabaseRequest(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: 'divxhluqybbcgfqozbjq.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function checkTableStructure() {
  console.log('🔍 Verificando estructura actual de la tabla usuarios...');

  try {
    // Verificar columnas actuales
    const checkColumnsSQL = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'usuarios' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;

    const response = await makeSupabaseRequest(checkColumnsSQL);

    if (response.statusCode === 200) {
      console.log('✅ Columnas actuales en tabla usuarios:');
      if (Array.isArray(response.data)) {
        response.data.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
        });
      }
    } else {
      console.log('❌ Error consultando estructura:', response.statusCode, response.data);
    }

    // Verificar algunos registros de ejemplo
    const sampleDataSQL = `
      SELECT id_usuario, correo, nombre, nombre_completo, esta_activo
      FROM usuarios
      LIMIT 3;
    `;

    const sampleResponse = await makeSupabaseRequest(sampleDataSQL);
    if (sampleResponse.statusCode === 200) {
      console.log('✅ Registros de ejemplo:');
      if (Array.isArray(sampleResponse.data)) {
        sampleResponse.data.forEach((row, i) => {
          console.log(`  ${i + 1}. ID: ${row.id_usuario}, Correo: ${row.correo}, Nombre: ${row.nombre}, Completo: ${row.nombre_completo}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error verificando estructura:', error.message);
  }
}

async function executeMigrationScript(scriptPath, scriptName) {
  console.log(`\n📄 EJECUTANDO: ${scriptName}`);
  console.log('='.repeat(60));

  try {
    const sql = fs.readFileSync(scriptPath, 'utf8');
    console.log('SQL completo a ejecutar:');
    console.log(sql);
    console.log('');

    // Intentar ejecutar el SQL completo
    console.log('🚀 Ejecutando SQL completo...');
    const response = await makeSupabaseRequest(sql);

    if (response.statusCode === 200) {
      console.log('✅ SQL ejecutado exitosamente');
      console.log('Respuesta:', JSON.stringify(response.data, null, 2));
      return true;
    } else {
      console.log(`❌ Error HTTP ${response.statusCode}`);
      console.log('Respuesta:', response.data);

      // Si falla el SQL completo, intentar ejecutar statement por statement
      console.log('\n🔄 Intentando ejecutar statement por statement...');

      const statements = sql.split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';';
        console.log(`\nStatement ${i + 1}/${statements.length}:`);
        console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));

        try {
          const stmtResponse = await makeSupabaseRequest(statement);

          if (stmtResponse.statusCode === 200) {
            console.log('  ✅ OK');
          } else {
            console.log(`  ❌ Error ${stmtResponse.statusCode}:`, stmtResponse.data);

            // Si es un error de valores nulos, intentar corregir
            if (stmtResponse.data && stmtResponse.data.includes('contains null values')) {
              console.log('  🔧 Detectado error de valores nulos, intentando corrección...');

              // Intentar generar valores por defecto primero
              const fixNullsSQL = `
                UPDATE public.usuarios
                SET nombre = LOWER(
                  CASE
                    WHEN nombre_completo IS NOT NULL AND nombre_completo != '' THEN
                      LEFT(SPLIT_PART(TRIM(nombre_completo), ' ', 1), 1) ||
                      CASE
                        WHEN ARRAY_LENGTH(STRING_TO_ARRAY(TRIM(nombre_completo), ' '), 1) >= 2
                        THEN SPLIT_PART(TRIM(nombre_completo), ' ', 2)
                        ELSE ''
                      END
                    ELSE 'usuario' || id_usuario::text
                  END
                )
                WHERE nombre IS NULL OR nombre = '';
              `;

              console.log('  Ejecutando corrección de valores nulos...');
              const fixResponse = await makeSupabaseRequest(fixNullsSQL);

              if (fixResponse.statusCode === 200) {
                console.log('  ✅ Valores nulos corregidos, reintentando statement...');

                // Reintentar el statement original
                const retryResponse = await makeSupabaseRequest(statement);
                if (retryResponse.statusCode === 200) {
                  console.log('  ✅ Statement ejecutado exitosamente tras corrección');
                } else {
                  console.log(`  ❌ Statement aún falla: ${retryResponse.statusCode}`, retryResponse.data);
                }
              } else {
                console.log('  ❌ Error en corrección de valores nulos:', fixResponse.data);
              }
            }
          }
        } catch (e) {
          console.log(`  ❌ Exception: ${e.message}`);
        }

        // Pequeña pausa entre statements
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return false;
    }

  } catch (error) {
    console.error(`❌ Error procesando ${scriptName}:`, error.message);
    return false;
  }
}

async function runDirectMigrations() {
  console.log('🚀 EJECUCIÓN DIRECTA DE MIGRACIONES VIA API REST');
  console.log('================================================');
  console.log('Proyecto: GEMODIDA - Supabase');
  console.log('Método: HTTPS API con Service Key');
  console.log('Fecha:', new Date().toISOString());
  console.log('');

  // Verificar estructura inicial
  await checkTableStructure();

  // Scripts a ejecutar
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

  let allSuccessful = true;

  for (const script of scripts) {
    const fullPath = path.join(process.cwd(), script.path);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Archivo no encontrado: ${script.path}`);
      allSuccessful = false;
      continue;
    }

    const success = await executeMigrationScript(fullPath, script.name);
    if (!success) {
      allSuccessful = false;
    }

    // Verificar estructura después de cada script
    console.log('\n🔍 Verificación post-script:');
    await checkTableStructure();
  }

  console.log('\n' + '='.repeat(60));
  if (allSuccessful) {
    console.log('🎉 TODAS LAS MIGRACIONES EJECUTADAS EXITOSAMENTE');
    console.log('✅ El sistema de login dinámico está activo');
  } else {
    console.log('⚠️  ALGUNAS MIGRACIONES REQUIEREN EJECUCIÓN MANUAL');
    console.log('');
    console.log('📋 INSTRUCCIONES PARA EJECUCIÓN MANUAL:');
    console.log('1. Ve al SQL Editor de Supabase:');
    console.log('   https://supabase.com/dashboard/project/divxhluqybbcgfqozbjq/sql');
    console.log('2. Crea un nuevo query y pega el contenido de cada archivo:');
    scripts.forEach((script, index) => {
      console.log(`   ${index + 1}. ${script.path}`);
    });
    console.log('3. Ejecuta cada script en orden');
    console.log('4. Verifica que no haya errores');
  }

  console.log('\n🧪 PRUEBAS RECOMENDADAS:');
  console.log('1. Verifica que la columna nombre_ingreso tenga valores');
  console.log('2. Prueba crear un usuario con nombre_ingreso duplicado');
  console.log('3. Prueba el login con correo y con nombre_ingreso');
  console.log('4. Verifica que las funciones RPC funcionen correctamente');
}

runDirectMigrations().catch(console.error);