// Script para actualizar la contraseña de un usuario en Supabase usando el SDK oficial
// Ejecuta este script con: node scripts/update-supabase-password.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || '<TU_SUPABASE_URL>';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '<TU_SERVICE_ROLE_KEY>';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const email = 'baez.israel@gmail.com';
  const newPassword = 'a12300';

  // Buscar el usuario por email usando listUsers
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listando usuarios:', listError.message);
    process.exit(1);
  }
  const user = usersData.users.find(u => u.email === email);
  if (!user) {
    console.error('Usuario no encontrado:', email);
    process.exit(1);
  }

  // Actualizar la contraseña
  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword
  });
  if (updateError) {
    console.error('Error actualizando contraseña:', updateError.message);
    process.exit(1);
  }

  console.log('Contraseña actualizada correctamente para:', email);
}

main();
