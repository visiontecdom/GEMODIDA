const https = require('https');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://divxhluqybbcgfqozbjq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdnhobHVxeWJiY2dmcW96YmpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA1MDc5MSwiZXhwIjoyMDc4NjI2NzkxfQ.kY91IBlAztaCStGbxtUOEdxWdaJ7X6O1AvqwIuMZXr0';

function executeSupabaseQuery(sql) {
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

async function executeSqlScript(scriptPath, scriptName) {
  console.log(`\n=== EJECUTANDO ${scriptName} ===`);

  try {
    const sql = fs.readFileSync(scriptPath, 'utf8');
    console.log('SQL a ejecutar:');
    console.log(sql.substring(0, 150) + (sql.length > 150 ? '...' : ''));
    console.log('');

    const response = await executeSupabaseQuery(sql);

    if (response.statusCode === 200) {
      console.log('✅ SQL ejecutado exitosamente');
      console.log('Respuesta:', JSON.stringify(response.data, null, 2));
    } else {
      console.log(`❌ Error HTTP ${response.statusCode}`);
      console.log('Respuesta:', response.data);

      // Intentar ejecutar statement por statement
      console.log('\nIntentando ejecutar statement por statement...');
      const statements = sql.split(';').filter(stmt => stmt.trim().length > 0 && !stmt.trim().startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement) {
          console.log(`Statement ${i + 1}: ${statement.substring(0, 50)}...`);
          try {
            const stmtResponse = await executeSupabaseQuery(statement + ';');
            if (stmtResponse.statusCode === 200) {
              console.log('  ✅ OK');
            } else {
              console.log(`  ❌ Error: ${stmtResponse.statusCode}`);
            }
          } catch (e) {
            console.log(`  ❌ Exception: ${e.message}`);
          }
        }
      }
    }

  } catch (error) {
    console.error(`❌ Error ejecutando ${scriptName}:`, error.message);
  }
}

async function runMigrations() {
  console.log('🚀 EJECUTANDO MIGRACIONES VIA API REST SUPABASE');
  console.log('Proyecto: divxhluqybbcgfqozbjq');
  console.log('Método: HTTP API con Service Key');
  console.log('');

  const scripts = [
    { path: 'db/scripts_sql/add_usuario_password_fields.sql', name: 'AGREGAR CAMPOS DE CONTRASEÑA' },
    { path: 'db/scripts_sql/update_usuario_functions_with_password_fields.sql', name: 'ACTUALIZAR FUNCIONES RPC' },
    { path: 'db/scripts_sql/validate_usuario_password_fields.sql', name: 'VALIDACIÓN DE CAMBIOS' }
  ];

  for (const script of scripts) {
    const fullPath = path.join(process.cwd(), script.path);
    if (fs.existsSync(fullPath)) {
      await executeSqlScript(fullPath, script.name);
    } else {
      console.error(`❌ Archivo no encontrado: ${script.path}`);
    }
  }

  console.log('\n🎯 MIGRACIONES COMPLETADAS VIA API');
}

runMigrations().catch(console.error);