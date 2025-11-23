const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const env = fs.readFileSync(path.resolve(__dirname, '..', '.env.local'), 'utf8');
    const dbUrlMatch = env.match(/DIRECT_URL=(.*)/) || env.match(/DATABASE_URL=(.*)/);
    if (!dbUrlMatch) throw new Error('No DATABASE_URL in .env.local');
    const connectionString = dbUrlMatch[1].trim();

    console.log('Connecting to DB...');
    const client = new Client({ connectionString });
    await client.connect();

    const checkSql = `SELECT EXISTS(
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public' AND tc.table_name = 'usuarios' AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'id_suc'
    ) as exists_fk;`;

    const res = await client.query(checkSql);
    const exists = res.rows[0].exists_fk;
    console.log('FK exists?', exists);

    if (!exists) {
      console.log('Adding FK usuarios.id_suc -> sucursales.id_suc');
      await client.query("ALTER TABLE public.usuarios ADD CONSTRAINT fk_usuarios_id_suc FOREIGN KEY (id_suc) REFERENCES public.sucursales(id_suc);");
      console.log('FK created');
    } else {
      console.log('FK already present');
    }

    await client.end();
  } catch (err) {
    console.error('ERROR', err.message || err);
    process.exit(1);
  }
})();