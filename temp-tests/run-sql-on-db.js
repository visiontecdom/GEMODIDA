const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

(async ()=>{
  try {
    const env = fs.readFileSync(path.resolve(__dirname, '..', '.env.local'), 'utf8');
    const directMatch = env.match(/DIRECT_URL=(.*)/);
    const dbUrl = directMatch ? directMatch[1].trim() : (env.match(/DATABASE_URL=(.*)/) || [])[1];
    if(!dbUrl) throw new Error('No DIRECT_URL or DATABASE_URL found in .env.local');

    console.log('Connecting to DB using url from .env.local...');
    const client = new Client({ connectionString: dbUrl });
    await client.connect();

    const scripts = [
      'd:/Proyectos/Web/GEMODIDA/db/scripts_sql/fix_all_diagnostic_errors.sql',
      'd:/Proyectos/Web/GEMODIDA/db/scripts_sql/10_fix_obtener_permisos_usuario.sql'
    ];

    for(const file of scripts){
      console.log('\n--- RUNNING', file);
      const sql = fs.readFileSync(file,'utf8');
      // split by $$ blocks to avoid sending too many statements at once
      // We'll run whole file in one query, Postgres supports multiple statements.
      const res = await client.query(sql);
      console.log('OK:', file, '->', res.command || 'executed');
    }

    await client.end();
    console.log('\nAll scripts executed.');
  }catch(err){
    console.error('ERROR:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();