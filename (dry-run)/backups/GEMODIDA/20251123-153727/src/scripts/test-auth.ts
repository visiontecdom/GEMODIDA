import { createClient } from '../lib/supabase/client';

async function testAuth() {
  console.log('🔍 Probando autenticación con Supabase...');
  
  const supabase = createClient();
  
  // 1. Probar conexión básica
  console.log('\n1. Probando conexión con Supabase...');
  const { data: session, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('❌ Error al conectar con Supabase:', sessionError.message);
    return;
  }
  
  console.log('✅ Conexión exitosa con Supabase');
  
  // 2. Probar inicio de sesión
  console.log('\n2. Probando inicio de sesión...');
  const testEmail = 'test@example.com';
  const testPassword = 'test123456';
  
  // Intentar iniciar sesión
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });
  
  if (signInError) {
    console.log('ℹ️ No se pudo iniciar sesión (esperado si el usuario no existe):', signInError.message);
    
    // Intentar registrarse si el usuario no existe
    console.log('\n3. Probando registro de usuario...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      console.error('❌ Error al registrar usuario de prueba:', signUpError.message);
      return;
    }
    
    console.log('✅ Usuario de prueba registrado correctamente');
    console.log('   Por favor, verifica el correo electrónico para confirmar la cuenta.');
    console.log('   Luego ejecuta este script nuevamente para probar el inicio de sesión.');
    return;
  }
  
  console.log('✅ Inicio de sesión exitoso');
  console.log('   Usuario:', signInData.user?.email);
  
  // 3. Cerrar sesión
  console.log('\n4. Probando cierre de sesión...');
  const { error: signOutError } = await supabase.auth.signOut();
  
  if (signOutError) {
    console.error('❌ Error al cerrar sesión:', signOutError.message);
    return;
  }
  
  console.log('✅ Sesión cerrada correctamente');
}

// Ejecutar la prueba
testAuth().catch(console.error);
