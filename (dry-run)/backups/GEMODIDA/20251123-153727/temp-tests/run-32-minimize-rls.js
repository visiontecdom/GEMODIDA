const fs = require('fs');
const { Client } = require('pg');
(async()=>{
  try{
    const env = fs.readFileSync('.env.local','utf8');
    const direct = (env.match(/DIRECT_URL=(.*)/) || [])[1] || (env.match(/DATABASE_URL=(.*)/) || [])[1];
    if(!direct) throw new Error('No DIRECT_URL or DATABASE_URL in .env.local');
    const client = new Client({ connectionString: direct });
    await client.connect();
    const sql = fs.readFileSync('db/scripts_sql/32_minimize_rls_users_related.sql','utf8');
    console.log('Running 32_minimize_rls_users_related.sql...');
    await client.query(sql);
    console.log('RLS minimization applied successfully');
    await client.end();
  }catch(e){
    console.error('ERROR', e.message || e);
    process.exit(1);
  }
})();