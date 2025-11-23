const fs = require('fs');
const path = require('path');

console.log('=== Verificación Manual de Variables de Entorno ===');

// Ruta al archivo .env.local
const envPath = path.resolve(__dirname, '.env.local');
console.log(`Buscando archivo en: ${envPath}`);

// Verificar si el archivo existe
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: No se encontró el archivo .env.local');
  console.log('\nPor favor, crea un archivo .env.local en la raíz del proyecto con el siguiente contenido:');
  console.log(`
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
`);
  process.exit(1);
}

// Leer el archivo .env.local
console.log('✅ Archivo .env.local encontrado');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Variables requeridas
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

console.log('\nContenido del archivo .env.local:');
console.log('----------------------------------------');
console.log(envContent);
console.log('----------------------------------------');

// Verificar variables
console.log('\nVerificando variables requeridas:');
let allVarsPresent = true;

requiredVars.forEach(varName => {
  const regex = new RegExp(`^${varName}=(.+)$`, 'm');
  const match = envContent.match(regex);
  
  if (match && match[1]) {
    console.log(`✅ ${varName}: ${match[1].substring(0, 5)}... (${match[1].length} caracteres)`);
  } else {
    console.log(`❌ ${varName}: NO DEFINIDA`);
    allVarsPresent = false;
  }
});

if (allVarsPresent) {
  console.log('\n✅ Todas las variables requeridas están presentes en .env.local');
  console.log('\nPara que los cambios surtan efecto, asegúrate de reiniciar el servidor de desarrollo.');
} else {
  console.log('\n❌ Faltan algunas variables requeridas en .env.local');
  console.log('\nPor favor, asegúrate de que el archivo .env.local contenga todas las variables requeridas.');
}

console.log('\n=== Fin de la verificación ===');
