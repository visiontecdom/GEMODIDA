// Setup proper Supabase authentication
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log('🔧 Setting up proper Supabase authentication...');

// Create client with service role key (for admin operations)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function setupAuth() {
  try {
    console.log('\n🗃️  Creating profiles table...');
    
    // First, create the profiles table
    const { error: profileError } = await supabase.rpc('exec', {
      query: `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
          full_name TEXT,
          email TEXT UNIQUE,
          phone TEXT,
          role TEXT DEFAULT 'user',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      `
    });

    if (profileError) {
      console.error('❌ Error creating profiles table:', profileError);
      return false;
    }

    console.log('✅ Profiles table created successfully');

    console.log('\n👤 Creating admin user...');
    
    // Create admin user using Supabase Auth Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'baez.israel@gmail.com',
      password: 'a12300',
      email_confirm: true,
      user_metadata: {
        full_name: 'Israel Báez Herrera'
      }
    });

    if (authError) {
      console.error('❌ Error creating admin user:', authError.message);
      return false;
    }

    console.log('✅ Admin user created successfully');
    console.log('👤 User ID:', authData.user.id);

    // Create profile for the user
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: 'Israel Báez Herrera',
        email: 'baez.israel@gmail.com',
        role: 'admin'
      });

    if (insertError) {
      console.error('❌ Error creating profile:', insertError.message);
      return false;
    }

    console.log('✅ Profile created successfully');

    // Test authentication with the created user
    console.log('\n🔑 Testing authentication...');
    
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

    return true;
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return false;
  }
}

async function runSetup() {
  console.log('🎯 Setting up Supabase authentication for baez.israel@gmail.com');
  console.log('=' .repeat(60));
  
  const success = await setupAuth();
  
  console.log('\n📊 Setup Result:');
  console.log(`- Authentication Setup: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (success) {
    console.log('\n🎉 Authentication setup completed successfully!');
    console.log('Your user baez.israel@gmail.com can now sign in.');
    console.log('Next: Update the ProtectedRoute to use the profiles table.');
  } else {
    console.log('\n❌ Authentication setup failed.');
  }
  
  process.exit(success ? 0 : 1);
}

runSetup();