// Script para buscar el usuario en las tablas 'auth.users' y 'public.usuarios' usando conexión directa a la base de datos
// y mostrar su información. Requiere la librería 'pg'.

const dotenv = require('dotenv');
let loaded = dotenv.config();
if (!process.env.DATABASE_URL) {
  loaded = dotenv.config({ path: '.env.local' });
}
const { Client } = require('pg');

let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL no está definida en .env ni .env.local.');
  process.exit(1);
}

const email = 'baez.israel@gmail.com';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  // Buscar en auth.users
  const authRes = await client.query('SELECT id, email, encrypted_password FROM auth.users WHERE email = $1', [email]);
  if (authRes.rows.length > 0) {
    console.log('auth.users:', authRes.rows[0]);
  } else {
    console.log('Usuario no encontrado en auth.users');
  }

  // Buscar en public.usuarios
  const pubRes = await client.query('SELECT * FROM public.usuarios WHERE correo = $1', [email]);
  if (pubRes.rows.length > 0) {
    console.log('public.usuarios:', pubRes.rows[0]);
  } else {
    console.log('Usuario no encontrado en public.usuarios');
  }

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
