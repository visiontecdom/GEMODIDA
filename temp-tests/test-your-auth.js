// Test authentication with specific user credentials
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('🔐 Testing authentication with specific user...');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Test signin with provided credentials
async function testSignin() {
  try {
    console.log('\n🔑 Testing signin with user credentials...');
    
    const userEmail = 'baez.israel@gmail.com';
    const userPassword = 'a12300';
    
    console.log(`Attempting signin with: ${userEmail}`);
    console.log('Password length:', userPassword.length);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword
    });
    
    if (error) {
      console.error('❌ Signin failed:');
      console.error('Error message:', error.message);
      console.error('Error status:', error.status);
      console.error('Error details:', error);
      
      // Check if user doesn't exist
      if (error.message.includes('Invalid login credentials')) {
        console.log('\n🔍 Analysis: User may not exist or password is wrong');
        
        // Try to check if user exists by attempting signup
        console.log('\n📝 Checking if user needs to be created...');
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: userEmail,
          password: userPassword,
          options: {
            data: {
              full_name: 'Test User'
            }
          }
        });
        
        if (signupError) {
          console.error('❌ Signup also failed:', signupError.message);
        } else {
          console.log('✅ User created successfully (was missing)!');
          console.log('👤 User:', signupData.user?.email);
          console.log('📧 Email confirmation required:', !signupData.session);
        }
      }
      
      return false;
    }
    
    console.log('✅ Signin successful!');
    console.log('👤 User:', data.user?.email);
    console.log('🆔 User ID:', data.user?.id);
    console.log('📧 Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
    console.log('🔗 Session active:', !!data.session);
    
    // Test session validation
    console.log('\n🔍 Validating session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session validation failed:', sessionError.message);
      return false;
    }
    
    console.log('✅ Session valid:', !!sessionData.session);
    
    return true;
  } catch (error) {
    console.error('❌ Error in signin test:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

// Run test
async function runTest() {
  console.log('🎯 Testing your specific credentials:');
  console.log('Email: baez.israel@gmail.com');
  console.log('Password: a12300');
  console.log('=' .repeat(50));
  
  const signinSuccess = await testSignin();
  
  console.log('\n📊 Final Result:');
  console.log(`- Your Signin: ${signinSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (signinSuccess) {
    console.log('\n🎉 Your credentials work! The issue might be with the frontend implementation.');
    console.log('Next step: Check if the frontend is sending the correct data to Supabase.');
  } else {
    console.log('\n❌ Authentication failed with your credentials.');
    console.log('Possible issues:');
    console.log('1. User doesn\'t exist in Supabase');
    console.log('2. Password is incorrect');
    console.log('3. Email confirmation required');
    console.log('4. Supabase server configuration issues');
  }
  
  process.exit(signinSuccess ? 0 : 1);
}

runTest();