// Script para verificar las variables de entorno
console.log('=== Verificación de Variables de Entorno ===');
console.log('Directorio actual:', process.cwd());

// Variables que deberían estar definidas
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

console.log('\nVariables de entorno requeridas:');
let allVarsPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const isPresent = value !== undefined && value !== '';
  
  if (isPresent) {
    console.log(`✅ ${varName}: ${value.substring(0, 5)}... (${value.length} caracteres)`);
  } else {
    console.log(`❌ ${varName}: NO DEFINIDA`);
    allVarsPresent = false;
  }
});

console.log('\nEstado de la configuración:');
if (allVarsPresent) {
  console.log('✅ Todas las variables de entorno requeridas están definidas');
} else {
  console.log('❌ Faltan algunas variables de entorno requeridas');
  console.log('\nAsegúrate de que el archivo .env.local existe en la raíz del proyecto');
  console.log('y contiene las siguientes variables con valores válidos:');
  requiredVars.forEach(varName => console.log(`- ${varName}`));
}

console.log('\n=== Fin de la verificación ===');
