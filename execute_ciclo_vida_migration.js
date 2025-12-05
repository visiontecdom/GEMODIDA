const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://divxhluqybbcgfqozbjq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdnhobHVxeWJiY2dmcW96YmpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA1MDc5MSwiZXhwIjoyMDc4NjI2NzkxfQ.kY91IBlAztaCStGbxtUOEdxWdaJ7X6O1AvnwIuMZXr0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeMigration() {
  try {
    console.log('🚀 Ejecutando migración: add_ciclo_vida_encuestas.sql');
    console.log('📅 Fecha:', new Date().toISOString());

    // Leer el archivo SQL
    const sqlPath = './db/scripts_sql/add_ciclo_vida_encuestas.sql';
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Archivo leído, ejecutando...');

    // Ejecutar directamente con supabase (esto puede no funcionar para DDL)
    const { data, error } = await supabase.rpc('exec_sql', { sql: sql });

    if (error) {
      console.log('❌ Error ejecutando migración:', error.message);
      console.log('💡 Sugerencia: Ejecuta el SQL manualmente en el SQL Editor de Supabase');
      console.log('   URL: https://supabase.com/dashboard/project/divxhluqybbcgfqozbjq/sql');
    } else {
      console.log('✅ Migración ejecutada exitosamente');
    }

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    console.log('💡 Sugerencia: Ejecuta el SQL manualmente en el SQL Editor de Supabase');
  }
}

executeMigration();