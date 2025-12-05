const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de PostgreSQL directa
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Variable DATABASE_URL no encontrada');
  process.exit(1);
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function executeSqlFile(filePath) {
  console.log(`📄 Ejecutando script: ${path.basename(filePath)}`);
  console.log('='.repeat(60));

  try {
    // Conectar a la base de datos
    await client.connect();
    console.log('✅ Conexión a PostgreSQL establecida');

    // Leer el archivo SQL
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log('SQL a ejecutar:');
    console.log(sql.substring(0, 300) + (sql.length > 300 ? '...' : ''));
    console.log('');

    // Ejecutar el SQL completo
    console.log('🚀 Ejecutando SQL completo...');
    const result = await client.query(sql);

    console.log('✅ SQL ejecutado exitosamente');
    console.log('Resultado:', result);

  } catch (error) {
    console.error('❌ Error ejecutando SQL:', error.message);

    // Si falla el SQL completo, intentar ejecutar statement por statement
    console.log('\n🔄 Intentando ejecutar statement por statement...');

    try {
      const sql = fs.readFileSync(filePath, 'utf8');
      const statements = sql.split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (!statement) continue;

        console.log(`\nStatement ${i + 1}/${statements.length}:`);
        console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));

        try {
          await client.query(statement + ';');
          console.log('  ✅ OK');
        } catch (stmtError) {
          console.log(`  ❌ Error: ${stmtError.message}`);

          // Si es un error de función ya existente, continuar
          if (stmtError.message.includes('already exists')) {
            console.log('  ⚠️  Función ya existe, continuando...');
          } else {
            // Para otros errores, intentar continuar
            console.log('  ⚠️  Continuando con el siguiente statement...');
          }
        }

        // Pequeña pausa entre statements
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('\n✅ Ejecución por statements completada');

    } catch (fallbackError) {
      console.error('❌ Error en ejecución por statements:', fallbackError.message);
    }

  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

async function runDirectSupabaseExecution() {
  console.log('🚀 EJECUCIÓN DIRECTA EN SUPABASE VIA POSTGRESQL');
  console.log('===============================================');
  console.log('Proyecto: GEMODIDA');
  console.log('Método: Conexión PostgreSQL directa');
  console.log('Fecha:', new Date().toISOString());
  console.log('');

  const scriptPath = path.join(__dirname, 'db', 'Scripts_SQL', 'reset_password_functionality.sql');

  if (!fs.existsSync(scriptPath)) {
    console.error('❌ Archivo no encontrado:', scriptPath);
    process.exit(1);
  }

  await executeSqlFile(scriptPath);

  console.log('\n' + '='.repeat(60));
  console.log('🎉 PROCESO COMPLETADO');
  console.log('');
  console.log('📋 VERIFICACIONES RECOMENDADAS:');
  console.log('1. Verificar que la tabla password_reset_tokens existe');
  console.log('2. Verificar que las funciones RPC están creadas:');
  console.log('   - solicitar_reset_password');
  console.log('   - verificar_reset_token');
  console.log('   - limpiar_tokens_expirados');
  console.log('3. Verificar políticas RLS en la tabla');
  console.log('4. Probar la funcionalidad en el frontend');
  console.log('');
  console.log('🔧 PRÓXIMOS PASOS:');
  console.log('1. Descomentar el código en PasswordResetModal.tsx');
  console.log('2. Reiniciar el servidor de desarrollo');
  console.log('3. Probar la funcionalidad completa');
}

runDirectSupabaseExecution().catch(console.error);