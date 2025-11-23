const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Extraer la configuración de conexión de DATABASE_URL
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ Error: DATABASE_URL no está definido en .env.local');
  process.exit(1);
}

// Crear un nuevo cliente PostgreSQL
const client = new Client({
  connectionString: dbUrl,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: true }
    : {
        rejectUnauthorized: false, // No verificar certificado en desarrollo
        sslmode: 'require'
      }
});

// Función para probar la conexión
async function testConnection() {
  console.log('🔍 Probando conexión a la base de datos...');
  
  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL correctamente!');
    
    // Probar una consulta simple
    console.log('🔍 Ejecutando consulta de prueba...');
    const result = await client.query('SELECT version()');
    console.log('✅ Versión de PostgreSQL:', result.rows[0].version);
    
    // Probar consulta a una tabla existente
    try {
      console.log('🔍 Probando consulta a la tabla palabras_clave...');
      const tableResult = await client.query('SELECT * FROM palabras_clave LIMIT 1');
      console.log(`✅ Consulta exitosa. Se encontraron ${tableResult.rowCount} registros.`);
    } catch (tableError) {
      console.warn('⚠️ No se pudo consultar la tabla palabras_clave. ¿Está creada?');
      console.warn('Mensaje de error:', tableError.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:');
    console.error(error.message);
    return false;
  } finally {
    await client.end();
  }
}

// Ejecutar la prueba
testConnection()
  .then(success => {
    console.log(success ? '\n🎉 ¡Prueba completada con éxito!' : '\n❌ La prueba encontró problemas');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('❌ Error inesperado:', err);
    process.exit(1);
  });
