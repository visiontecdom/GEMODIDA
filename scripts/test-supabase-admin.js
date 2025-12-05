// test-supabase-admin.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // Prueba: listar usuarios (requiere privilegios admin)
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
  console.log('Conexión exitosa. Primer usuario:', data.users[0]);
}

main();
