// Simple setup for Supabase authentication
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log('🔧 Setting up Supabase authentication...');

// Create client with service role key
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function setupAuth() {
  try {
    console.log('\n👤 Creating admin user with Supabase Auth...');
    
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
      if (authError.message.includes('already registered')) {
        console.log('ℹ️  User already exists, trying to update...');
        
        // Try to update existing user
        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          console.error('❌ Error listing users:', listError);
          return false;
        }
        
        const existingUser = existingUsers.users.find(user => user.email === 'baez.israel@gmail.com');
        
        if (existingUser) {
          console.log('👤 Found existing user:', existingUser.id);
          
          // Update user
          const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
              password: 'a12300',
              email_confirm: true,
              user_metadata: {
                full_name: 'Israel Báez Herrera'
              }
            }
          );
          
          if (updateError) {
            console.error('❌ Error updating user:', updateError.message);
            return false;
          }
          
          console.log('✅ User updated successfully');
          authData.user = updateData.user;
        }
      } else {
        console.error('❌ Error creating admin user:', authError.message);
        return false;
      }
    } else {
      console.log('✅ Admin user created successfully');
    }

    console.log('👤 User ID:', authData.user.id);
    console.log('📧 Email confirmed:', authData.user.email_confirmed_at ? 'Yes' : 'No');

    // Test authentication with the created user
    console.log('\n🔑 Testing authentication...');
    
    const { data: testData, error: testError } = await supabase.auth.signInWithPassword({
      email: 'baez.israel@gmail.com',
      password: 'a12300'
    });

    if (testError) {
      console.error('❌ Authentication test failed:', testError.message);
      
      // Check specific error types
      if (testError.message.includes('Invalid login credentials')) {
        console.log('🔍 User may need email confirmation');
      }
      
      return false;
    }

    console.log('✅ Authentication successful!');
    console.log('👤 User:', testData.user.email);
    console.log('🔗 Session active:', !!testData.session);
    
    // Check user details
    console.log('\n📋 User Details:');
    console.log('- ID:', testData.user.id);
    console.log('- Email:', testData.user.email);
    console.log('- Confirmed:', testData.user.email_confirmed_at ? 'Yes' : 'No');
    console.log('- Created:', testData.user.created_at);

    return true;
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return false;
  }
}

async function runSetup() {
  console.log('🎯 Setting up Supabase authentication');
  console.log('Email: baez.israel@gmail.com');
  console.log('Password: a12300');
  console.log('=' .repeat(60));
  
  const success = await setupAuth();
  
  console.log('\n📊 Setup Result:');
  console.log(`- Authentication: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (success) {
    console.log('\n🎉 Authentication setup completed!');
    console.log('Your user can now sign in successfully.');
    console.log('\n📝 Next steps:');
    console.log('1. Update ProtectedRoute to work with auth.users');
    console.log('2. Test signin in the browser');
  } else {
    console.log('\n❌ Authentication setup failed.');
    console.log('Please check the error messages above.');
  }
  
  process.exit(success ? 0 : 1);
}

runSetup();