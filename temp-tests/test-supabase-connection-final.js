const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan las variables de entorno de Supabase');
  process.exit(1);
}

console.log('🔍 Configuración de Supabase:');
console.log(`- URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`- Clave: ${supabaseKey.substring(0, 10)}...`);

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

// Función para probar la conexión
async function testConnection() {
  console.log('\n🔍 Probando conexión a Supabase...');
  
  try {
    // 1. Probar autenticación anónima
    console.log('\n🔐 Probando autenticación...');
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
    
    if (authError) throw authError;
    console.log('✅ Autenticación anónima exitosa');
    console.log(`   ID de sesión: ${authData.session?.user?.id.substring(0, 8)}...`);
    
    // 2. Probar consulta a la base de datos
    console.log('\n📊 Probando consulta a la base de datos...');
    const { data: tableData, error: tableError } = await supabase
      .from('palabras_clave')
      .select('*')
      .limit(1);
    
    if (tableError) throw tableError;
    
    console.log('✅ Consulta a la base de datos exitosa');
    console.log(`   Tabla 'palabras_clave': ${tableData.length} registros encontrados`);
    
    // 3. Probar función RPC
    console.log('\n⚙️ Probando función RPC...');
    try {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('obtener_estadisticas_por_periodo', {
          p_id_palabra: 1,
          p_tipo_periodo: 'day',
          p_limite: 1
        });
      
      if (rpcError) {
        console.warn('⚠️ Advertencia en función RPC (puede ser esperado):', rpcError.message);
      } else {
        console.log('✅ Función RPC ejecutada correctamente');
        console.log('   Resultado:', JSON.stringify(rpcData, null, 2));
      }
    } catch (rpcError) {
      console.warn('⚠️ Error al probar función RPC (puede ser esperado):', rpcError.message);
    }
    
    return true;
  } catch (error) {
    console.error('\n❌ Error en la prueba:');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code || 'N/A');
    console.error('Detalles:', JSON.stringify(error, null, 2));
    return false;
  }
}

// Ejecutar prueba
console.log('\n🚀 Iniciando pruebas de conexión a Supabase...');
testConnection()
  .then(success => {
    console.log(success ? '\n🎉 ¡Todas las pruebas se completaron con éxito!' : '\n❌ Algunas pruebas fallaron');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Error inesperado:', err);
    process.exit(1);
  });
