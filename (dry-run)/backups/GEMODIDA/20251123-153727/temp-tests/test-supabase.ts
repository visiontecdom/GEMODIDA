import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Faltan las variables de entorno de Supabase');
  process.exit(1);
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Prueba de conexión básica
async function testConnection() {
  console.log('🔍 Probando conexión a Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('palabras_clave')
      .select('*')
      .limit(1);

    if (error) throw error;
    
    console.log('✅ Conexión exitosa a Supabase!');
    console.log('📊 Datos de prueba:', data);
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a Supabase:');
    console.error(error);
    return false;
  }
}

// Prueba de autenticación
async function testAuth() {
  console.log('\n🔐 Probando autenticación...');
  
  try {
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) throw error;
    
    console.log('✅ Autenticación anónima exitosa!');
    console.log('👤 ID de usuario:', data.user?.id);
    return true;
  } catch (error) {
    console.error('❌ Error de autenticación:');
    console.error(error);
    return false;
  }
}

// Prueba de RPC (función almacenada)
async function testRPC() {
  console.log('\n🔄 Probando función RPC...');
  
  try {
    const { data, error } = await supabase
      .rpc('obtener_estadisticas_por_periodo', { 
        p_id_palabra: 1,
        p_tipo_periodo: 'day',
        p_limite: 7
      });
      
    if (error) throw error;
    
    console.log('✅ Función RPC ejecutada correctamente!');
    console.log('📈 Resultados:', data);
    return true;
  } catch (error) {
    console.error('❌ Error al ejecutar la función RPC:');
    console.error(error);
    return false;
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas de Supabase...\n');
  
  const tests = [
    { name: 'Conexión', fn: testConnection },
    { name: 'Autenticación', fn: testAuth },
    { name: 'Función RPC', fn: testRPC }
  ];
  
  let allPassed = true;
  
  for (const test of tests) {
    console.log(`\n=== Prueba: ${test.name} ===`);
    const passed = await test.fn();
    if (!passed) {
      console.error(`❌ La prueba ${test.name} falló`);
      allPassed = false;
    } else {
      console.log(`✅ ${test.name} pasó la prueba`);
    }
  }
  
  console.log('\n📊 Resumen de pruebas:');
  console.log(allPassed ? '🎉 ¡Todas las pruebas pasaron exitosamente!' : '❌ Algunas pruebas fallaron');
  
  process.exit(allPassed ? 0 : 1);
}

// Ejecutar las pruebas
runTests().catch(error => {
  console.error('Error inesperado:', error);
  process.exit(1);
});
