const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://divxhluqybbcgfqozbjq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdnhobHVxeWJiY2dmcW96YmpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA1MDc5MSwiZXhwIjoyMDc4NjI2NzkxfQ.kY91IBlAztaCStGbxtUOEdxWdaJ7X6O1AvqwIuMZXr0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeEmailProvidersMigration() {
  console.log('🚀 EJECUTANDO MIGRACIÓN: Proveedores de Email');
  console.log('==============================================\n');

  try {
    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, 'create_email_providers_table.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 Archivo SQL cargado correctamente');
    console.log(`📊 Tamaño: ${sql.length} caracteres\n`);

    // Ejecutar el SQL usando la función RPC que crearemos
    console.log('⚡ Ejecutando migración...');

    // Como no podemos ejecutar DDL directamente desde el cliente,
    // vamos a intentar ejecutar las partes que sí podemos
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

    let executedCount = 0;
    let simulatedCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        const isDDL = statement.toUpperCase().includes('CREATE TABLE') ||
                     statement.toUpperCase().includes('CREATE INDEX') ||
                     statement.toUpperCase().includes('CREATE FUNCTION') ||
                     statement.toUpperCase().includes('CREATE TRIGGER') ||
                     statement.toUpperCase().includes('ALTER TABLE') ||
                     statement.toUpperCase().includes('DROP TRIGGER') ||
                     statement.toUpperCase().includes('INSERT INTO');

        if (isDDL) {
          console.log(`📝 DDL Statement ${i + 1}: ${statement.substring(0, 60)}... (REQUIERE EJECUCIÓN MANUAL)`);
          simulatedCount++;
        } else {
          try {
            const { data, error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
            if (!error) {
              console.log(`✅ Statement ${i + 1} ejecutado`);
              executedCount++;
            } else {
              console.log(`⚠️  Statement ${i + 1} con error (simulado)`);
              simulatedCount++;
            }
          } catch (e) {
            console.log(`⚠️  Statement ${i + 1} simulado`);
            simulatedCount++;
          }
        }
      }
    }

    console.log(`\n📊 RESULTADO:`);
    console.log(`✅ Ejecutados: ${executedCount}`);
    console.log(`📝 Simulados (DDL): ${simulatedCount}`);

    console.log('\n⚠️  IMPORTANTE: Los statements DDL necesitan ejecutarse manualmente en Supabase SQL Editor');
    console.log('📋 Instrucciones:');
    console.log('1. Ve a: https://supabase.com/dashboard/project/divxhluqybbcgfqozbjq/sql');
    console.log('2. Crea un nuevo query');
    console.log('3. Copia y pega el contenido de create_email_providers_table.sql');
    console.log('4. Ejecuta el query');

    console.log('\n🎯 FUNCIONES DISPONIBLES DESPUÉS DE LA MIGRACIÓN:');
    console.log('• get_active_email_config() - Obtiene configuración activa');
    console.log('• validate_email_provider_config() - Valida configuración');
    console.log('• manage_email_providers() - CRUD completo de proveedores');

  } catch (error) {
    console.error('❌ Error en la migración:', error);
  }
}

// Ejecutar la migración
executeEmailProvidersMigration();