// Test signup to see if it works (and creates the user)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log('🔐 Testing signup process...');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function testSignup() {
  try {
    console.log('\n📝 Testing user signup...');
    
    const testEmail = `baez.israel@gmail.com`;
    const testPassword = 'a12300';
    
    console.log(`Creating user: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Israel Báez Herrera'
        }
      }
    });
    
    if (error) {
      console.error('❌ Signup failed:', error.message);
      
      // Check specific error types
      if (error.message.includes('Database error querying schema')) {
        console.log('\n🔍 ANALYSIS: Database schema error detected');
        console.log('This indicates Supabase auth schema is corrupted or missing');
        console.log('Possible causes:');
        console.log('1. Supabase project configuration issue');
        console.log('2. Missing auth schema tables');
        console.log('3. Database migration failed');
        console.log('4. Supabase service is down');
      }
      
      return false;
    }
    
    console.log('✅ User created successfully!');
    console.log('👤 User:', data.user?.email);
    console.log('📧 Confirmation sent:', !data.session);
    console.log('🆔 User ID:', data.user?.id);
    
    // Test signin immediately
    console.log('\n🔑 Testing immediate signin...');
    
    const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signinError) {
      console.error('❌ Signin failed:', signinError.message);
      
      if (signinError.message.includes('Database error querying schema')) {
        console.log('\n🔍 CONFIRMED: Database schema is corrupted');
        console.log('Cannot proceed with authentication until schema is fixed');
      }
      
      return false;
    }
    
    console.log('✅ Signin successful!');
    console.log('👤 Session active:', !!signinData.session);
    
    return true;
  } catch (error) {
    console.error('❌ Error in signup test:', error.message);
    return false;
  }
}

// Run test
async function runTest() {
  console.log('🎯 Testing if signup process works');
  console.log('This will help identify if the auth schema is working');
  console.log('=' .repeat(60));
  
  const signupSuccess = await testSignup();
  
  console.log('\n📊 Test Results:');
  console.log(`- Signup Process: ${signupSuccess ? '✅ WORKS' : '❌ BROKEN'}`);
  
  if (signupSuccess) {
    console.log('\n🎉 Signup works! Authentication system is functional.');
    console.log('The user baez.israel@gmail.com was created successfully.');
  } else {
    console.log('\n❌ Authentication system has database schema issues.');
    console.log('\n🔧 Required Actions:');
    console.log('1. Check Supabase project status');
    console.log('2. Verify database schema is properly set up');
    console.log('3. Check if auth.users table exists');
    console.log('4. Run Supabase migrations if needed');
  }
  
  process.exit(signupSuccess ? 0 : 1);
}

runTest();