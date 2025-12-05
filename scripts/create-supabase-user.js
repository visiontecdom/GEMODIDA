// Script para crear un usuario en Supabase usando el SDK oficial
// Ejecuta este script con: node scripts/create-supabase-user.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configura tus variables de entorno en .env.local o .env
const SUPABASE_URL = process.env.SUPABASE_URL || '<TU_SUPABASE_URL>';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '<TU_SERVICE_ROLE_KEY>';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const email = 'baez.israel@gmail.com';
  const password = 'a12300';
  const fullName = 'Israel Báez Herrera';
  const phone = '18092993185';
  const role = 'admin';

  // Verifica si el usuario ya existe
  const { data: existingUser, error: searchError } = await supabase.auth.admin.getUserByEmail(email);
  if (searchError) {
    console.error('Error buscando usuario:', searchError.message);
    process.exit(1);
  }
  if (existingUser && existingUser.user) {
    console.log('El usuario ya existe en Supabase:', existingUser.user.id);
    return;
  }

  // Crea el usuario
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    phone,
    user_metadata: {
      full_name: fullName,
      role: role
    },
    email_confirm: true
  });

  if (error) {
    console.error('Error creando usuario:', error.message);
    process.exit(1);
  }

  console.log('Usuario creado correctamente:', data.user.id);
}

main();
