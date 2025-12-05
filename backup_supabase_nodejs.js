#!/usr/bin/env node

/**
 * Script Node.js para backup de base de datos Supabase
 * No requiere pg_dump instalado, usa la librería pg directamente
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Configuración de conexión desde variables de entorno
const config = {
  host: process.env.DB_HOST || 'aws-0-us-west-2.pooler.supabase.com',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres.divxhluqybbcgfqozbjq',
  password: process.env.DB_PASSWORD || 'Millonario##01',
  ssl: { rejectUnauthorized: false }
};

// Schemas del sistema de Supabase a excluir
const SYSTEM_SCHEMAS = [
  'graphile_worker',
  'graphql',
  'graphql_public',
  'net',
  'realtime',
  'supabase_functions',
  'pgbouncer',
  'pg_stat_statements',
  'pgsodium',
  'vault'
];

class SupabaseBackup {
  constructor() {
    this.client = new Client(config);
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    this.backupDir = path.join(process.cwd(), 'backups');
    this.backupFile = path.join(this.backupDir, `supabase_backup_${this.timestamp}.sql`);
  }

  async connect() {
    console.log('🔌 Conectando a Supabase...');
    await this.client.connect();
    console.log('✅ Conexión exitosa');
  }

  async disconnect() {
    await this.client.end();
    console.log('🔌 Conexión cerrada');
  }

  async getTables() {
    console.log('📋 Obteniendo lista de tablas...');
    const query = `
      SELECT schemaname, tablename
      FROM pg_tables
      WHERE schemaname NOT IN (${SYSTEM_SCHEMAS.map(s => `'${s}'`).join(', ')})
      ORDER BY schemaname, tablename
    `;

    const result = await this.client.query(query);
    return result.rows;
  }

  async getFunctions() {
    console.log('🔧 Obteniendo funciones...');
    const query = `
      SELECT
        n.nspname as schema,
        p.proname as name,
        pg_get_function_identity_arguments(p.oid) as args,
        obj_description(p.oid, 'pg_proc') as description
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname NOT IN (${SYSTEM_SCHEMAS.map(s => `'${s}'`).join(', ')})
      AND p.prokind = 'f'
      ORDER BY n.nspname, p.proname
    `;

    const result = await this.client.query(query);
    return result.rows;
  }

  async getTableData(schema, table) {
    const query = `SELECT * FROM "${schema}"."${table}"`;
    const result = await this.client.query(query);
    return result.rows;
  }

  generateCreateTableSQL(schema, table, columns) {
    const columnDefs = columns.map(col => {
      let def = `"${col.column_name}" ${col.data_type}`;

      if (col.character_maximum_length) {
        def += `(${col.character_maximum_length})`;
      }
      if (col.numeric_precision && col.numeric_scale) {
        def += `(${col.numeric_precision},${col.numeric_scale})`;
      }

      if (!col.is_nullable) def += ' NOT NULL';
      if (col.column_default) def += ` DEFAULT ${col.column_default}`;

      return def;
    }).join(',\n    ');

    return `CREATE TABLE IF NOT EXISTS "${schema}"."${table}" (\n    ${columnDefs}\n);\n\n`;
  }

  generateInsertSQL(schema, table, data) {
    if (data.length === 0) return '';

    const columns = Object.keys(data[0]);
    const values = data.map(row => {
      const rowValues = columns.map(col => {
        const value = row[col];
        if (value === null) return 'NULL';
        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
        if (value instanceof Date) return `'${value.toISOString()}'`;
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        return value.toString();
      });
      return `(${rowValues.join(', ')})`;
    });

    return `INSERT INTO "${schema}"."${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES\n${values.join(',\n')};\n\n`;
  }

  async backup() {
    try {
      console.log('🚀 Iniciando backup de base de datos Supabase...');
      console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
      console.log(`📁 Archivo: ${this.backupFile}`);
      console.log('');

      await this.connect();

      // Crear directorio si no existe
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      const writeStream = fs.createWriteStream(this.backupFile, { encoding: 'utf8' });

      // Escribir header
      writeStream.write(`-- Backup de Supabase generado el ${new Date().toISOString()}
-- Base de datos: ${config.database}
-- Host: ${config.host}
-- Excluyendo schemas del sistema: ${SYSTEM_SCHEMAS.join(', ')}

\\c ${config.database};

`);

      // Obtener tablas
      const tables = await this.getTables();
      console.log(`📊 Encontradas ${tables.length} tablas`);

      // Procesar cada tabla
      for (const table of tables) {
        const { schemaname, tablename } = table;
        console.log(`   Procesando ${schemaname}.${tablename}...`);

        // Obtener estructura de la tabla
        const columnsQuery = `
          SELECT column_name, data_type, character_maximum_length, numeric_precision, numeric_scale, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = $1 AND table_name = $2
          ORDER BY ordinal_position
        `;
        const columnsResult = await this.client.query(columnsQuery, [schemaname, tablename]);

        // Generar CREATE TABLE
        const createSQL = this.generateCreateTableSQL(schemaname, tablename, columnsResult.rows);
        writeStream.write(createSQL);

        // Obtener datos
        const data = await this.getTableData(schemaname, tablename);
        if (data.length > 0) {
          const insertSQL = this.generateInsertSQL(schemaname, tablename, data);
          writeStream.write(insertSQL);
        }
      }

      // Obtener funciones
      const functions = await this.getFunctions();
      console.log(`🔧 Encontradas ${functions.length} funciones`);

      if (functions.length > 0) {
        writeStream.write('-- Funciones\n\n');
        for (const func of functions) {
          const funcQuery = `
            SELECT pg_get_functiondef(p.oid) as definition
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = $1 AND p.proname = $2
          `;
          const funcResult = await this.client.query(funcQuery, [func.schema, func.name]);
          if (funcResult.rows.length > 0) {
            writeStream.write(`${funcResult.rows[0].definition};\n\n`);
          }
        }
      }

      writeStream.end();

      // Crear script de restauración
      const restoreScript = path.join(this.backupDir, `restore_backup_${this.timestamp}.js`);
      const restoreContent = `#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Configuración de PostgreSQL local
const localConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'gemodida_local',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'tu_password_local',
  ssl: false
};

async function restore() {
  const client = new Client(localConfig);

  try {
    console.log('🔌 Conectando a PostgreSQL local...');
    await client.connect();
    console.log('✅ Conexión exitosa');

    console.log('📤 Ejecutando script de restauración...');
    const sql = fs.readFileSync('${path.basename(this.backupFile)}', 'utf8');

    // Ejecutar el SQL en transacciones más pequeñas
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim().startsWith('--')) continue;
      try {
        await client.query(statement);
      } catch (error) {
        console.warn('⚠️  Error en statement:', error.message);
        // Continuar con el siguiente statement
      }
    }

    console.log('✅ Restauración completada!');
    console.log('🗄️  Base de datos:', localConfig.database);
    console.log('');
    console.log('📋 Próximos pasos:');
    console.log('   1. Actualiza tu archivo .env.local');
    console.log('   2. Ejecuta: npm run dev');
    console.log('   3. Verifica que la aplicación funcione');

  } catch (error) {
    console.error('❌ Error durante la restauración:', error);
  } finally {
    await client.end();
  }
}

restore();
`;

      fs.writeFileSync(restoreScript, restoreContent, 'utf8');

      // Hacer ejecutable el script de restauración
      try {
        require('child_process').execSync(`chmod +x "${restoreScript}"`);
      } catch (e) {
        // Ignorar en Windows
      }

      const stats = fs.statSync(this.backupFile);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log('🎯 RESUMEN DEL BACKUP:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ Backup creado: ${this.backupFile} (${sizeMB} MB)`);
      console.log(`✅ Script restauración: ${restoreScript}`);
      console.log(`📊 Tablas procesadas: ${tables.length}`);
      console.log(`🔧 Funciones procesadas: ${functions.length}`);
      console.log('');
      console.log('📋 INSTRUCCIONES PARA RESTAURAR LOCALMENTE:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('1. Instala PostgreSQL localmente si no lo tienes');
      console.log('2. Crea una base de datos local (opcional)');
      console.log(`3. Ejecuta: node ${path.basename(restoreScript)}`);
      console.log('4. Actualiza las variables de entorno en .env.local');
      console.log('5. Ejecuta: npm run dev');
      console.log('');
      console.log('🔒 NOTA DE SEGURIDAD:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('• Los archivos contienen datos sensibles');
      console.log('• No los subas a repositorios públicos');
      console.log('• Mantén backups en lugares seguros');
      console.log('');
      console.log('🎉 Backup completado exitosamente!');

    } catch (error) {
      console.error('❌ Error durante el backup:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// Ejecutar backup
const backup = new SupabaseBackup();
backup.backup().catch(console.error);