const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Extraer los parámetros de conexión de la URL
const dbUrl = new URL(process.env.DATABASE_URL.replace(/^postgresql:/, 'postgres:'));

// Configuración de conexión directa
const dbConfig = {
  user: dbUrl.username,
  password: dbUrl.password,
  host: dbUrl.hostname,
  port: dbUrl.port,
  database: dbUrl.pathname.replace(/^\//, ''),
  ssl: {
    rejectUnauthorized: false, // Solo para desarrollo
    sslmode: 'require'
  },
  connectionTimeoutMillis: 5000,
  query_timeout: 5000,
  statement_timeout: 5000
};

console.log('🔍 Configuración de conexión:');
console.log(`- Host: ${dbConfig.host}`);
console.log(`- Puerto: ${dbConfig.port}`);
console.log(`- Base de datos: ${dbConfig.database}`);
console.log(`- Usuario: ${dbConfig.user}`);

const client = new Client(dbConfig);

// Función para probar la conexión
async function testConnection() {
  console.log('\n🔍 Probando conexión a la base de datos...');
  
  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL correctamente!');
    
    // Probar una consulta simple
    console.log('\n🔍 Ejecutando consulta de prueba...');
    const versionResult = await client.query('SELECT version()');
    console.log('✅ Versión de PostgreSQL:', versionResult.rows[0].version);
    
    // Listar tablas disponibles
    console.log('\n📋 Tablas disponibles en la base de datos:');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('✅ Tablas encontradas:');
      tablesResult.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.table_name}`);
      });
    } else {
      console.log('ℹ️ No se encontraron tablas en el esquema público.');
    }
    
    return true;
  } catch (error) {
    console.error('\n❌ Error al conectar a la base de datos:');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
    console.error('Detalles:', error);
    return false;
  } finally {
    await client.end().catch(console.error);
  }
}

// Ejecutar la prueba
console.log('🚀 Iniciando pruebas de conexión a la base de datos...\n');

testConnection()
  .then(success => {
    console.log(success ? '\n🎉 ¡Prueba completada con éxito!' : '\n❌ La prueba encontró problemas');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('❌ Error inesperado:', err);
    process.exit(1);
  });
