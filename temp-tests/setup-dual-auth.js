// Setup dual-table authentication (auth.users + public.usuarios)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log('🔧 Setting up dual-table authentication...');

// Create client with service role key
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function setupDualAuth() {
  try {
    console.log('\n👤 Creating user in auth.users...');
    
    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'baez.israel@gmail.com',
      password: 'a12300',
      email_confirm: true,
      user_metadata: {
        full_name: 'Israel Báez Herrera'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('ℹ️  User exists in auth.users, getting existing user...');
        
        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          console.error('❌ Error listing users:', listError);
          return false;
        }
        
        const existingUser = existingUsers.users.find(user => user.email === 'baez.israel@gmail.com');
        
        if (!existingUser) {
          console.error('❌ User not found in auth.users');
          return false;
        }
        
        console.log('👤 Found existing auth user:', existingUser.id);
        authData.user = existingUser;
      } else {
        console.error('❌ Error creating auth user:', authError.message);
        return false;
      }
    } else {
      console.log('✅ Auth user created successfully');
    }

    console.log('👤 Auth User ID:', authData.user.id);

    // Now create/update in public.usuarios
    console.log('\n🗃️  Creating user in public.usuarios...');
    
    // First, check if user exists in public.usuarios
    const { data: existingUsuario, error: checkError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id_usuario', authData.user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking public.usuarios:', checkError);
      return false;
    }

    if (existingUsuario) {
      console.log('👤 User exists in public.usuarios, updating...');
      
      // Update existing user
      const { data: updateData, error: updateError } = await supabase
        .from('usuarios')
        .update({
          nombre: 'Israel Báez Herrera',
          correo: 'baez.israel@gmail.com',
          rol: 'admin', // Set admin role
          fecha_registro: new Date().toISOString()
        })
        .eq('id_usuario', authData.user.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating public.usuarios:', updateError);
        return false;
      }

      console.log('✅ Public user updated successfully');
    } else {
      console.log('👤 Creating new user in public.usuarios...');
      
      // Create new user in public.usuarios
      const { data: insertData, error: insertError } = await supabase
        .from('usuarios')
        .insert({
          id_usuario: authData.user.id, // Link to auth.users.id
          nombre: 'Israel Báez Herrera',
          correo: 'baez.israel@gmail.com',
          rol: 'admin', // Set admin role
          fecha_registro: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating public.usuarios:', insertError);
        return false;
      }

      console.log('✅ Public user created successfully');
    }

    // Test the complete authentication flow
    console.log('\n🔑 Testing complete authentication...');
    
    const { data: testData, error: testError } = await supabase.auth.signInWithPassword({
      email: 'baez.israel@gmail.com',
      password: 'a12300'
    });

    if (testError) {
      console.error('❌ Authentication test failed:', testError.message);
      return false;
    }

    console.log('✅ Authentication successful!');
    console.log('👤 User:', testData.user.email);
    console.log('🔗 Session active:', !!testData.session);

    // Verify both tables are properly linked
    console.log('\n🔍 Verifying dual-table integration...');
    
    const { data: linkedUser, error: linkError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id_usuario', testData.user.id)
      .single();

    if (linkError) {
      console.error('❌ Error verifying link:', linkError);
      return false;
    }

    console.log('✅ Dual-table integration verified!');
    console.log('📋 Auth User ID:', testData.user.id);
    console.log('📋 Public User ID:', linkedUser.id_usuario);
    console.log('📋 Public User Role:', linkedUser.rol);
    console.log('📋 Public User Name:', linkedUser.nombre);

    return true;
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return false;
  }
}

async function runSetup() {
  console.log('🎯 Setting up dual-table authentication');
  console.log('Tables: auth.users + public.usuarios');
  console.log('Email: baez.israel@gmail.com');
  console.log('Password: a12300');
  console.log('=' .repeat(60));
  
  const success = await setupDualAuth();
  
  console.log('\n📊 Setup Result:');
  console.log(`- Dual Auth Setup: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (success) {
    console.log('\n🎉 Dual-table authentication setup completed!');
    console.log('✅ User exists in auth.users (authentication)');
    console.log('✅ User exists in public.usuarios (additional data)');
    console.log('✅ Tables are properly linked');
    console.log('\n📝 Next steps:');
    console.log('1. Update ProtectedRoute to work with both tables');
    console.log('2. Test authentication in the browser');
  } else {
    console.log('\n❌ Authentication setup failed.');
  }
  
  process.exit(success ? 0 : 1);
}

runSetup();