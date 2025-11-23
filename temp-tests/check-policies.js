const fs = require('fs');
const { Client } = require('pg');

(async () => {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const direct = (env.match(/DIRECT_URL=(.*)/) || [])[1] || (env.match(/DATABASE_URL=(.*)/) || [])[1];
    if (!direct) throw new Error('No DB URL');

    const client = new Client({ connectionString: direct });
    await client.connect();

    const sql = `SELECT schemaname, tablename, policyname, cmd, qual, with_check FROM pg_policies WHERE tablename IN ('usuarios','usuarios_asignaciones','usuarios_roles','usuarios_grupos','sucursales') ORDER BY tablename, policyname`;

    const res = await client.query(sql);
    console.log(JSON.stringify(res.rows, null, 2));

    await client.end();
  } catch (err) {
    console.error('ERROR', err.message || err);
    process.exit(1);
  }
})();