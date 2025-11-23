// Test authentication with signup/signin
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('🔐 Testing actual authentication...');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Test signup
async function testSignup() {
  try {
    console.log('\n📝 Testing user signup...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    console.log(`Creating user: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    });
    
    if (error) {
      console.error('❌ Signup failed:', error.message);
      return false;
    }
    
    console.log('✅ User created successfully!');
    console.log('👤 User:', data.user?.email);
    console.log('📧 Confirmation sent:', !data.session);
    
    // Test signin immediately
    console.log('\n🔑 Testing immediate signin...');
    
    const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signinError) {
      console.error('❌ Signin failed:', signinError.message);
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

// Test with existing admin user
async function testSignin() {
  try {
    console.log('\n🔑 Testing signin with admin credentials...');
    
    // Try common admin credentials
    const adminEmail = 'admin@GEMODIDA.com';
    const adminPassword = 'admin123';
    
    console.log(`Attempting signin with: ${adminEmail}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    
    if (error) {
      console.log('❌ Admin signin failed:', error.message);
      return false;
    }
    
    console.log('✅ Admin signin successful!');
    console.log('👤 User:', data.user?.email);
    
    return true;
  } catch (error) {
    console.error('❌ Error in signin test:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  const signupTest = await testSignup();
  const signinTest = await testSignin();
  
  console.log('\n📊 Test Results:');
  console.log(`- User Signup: ${signupTest ? '✅' : '❌'}`);
  console.log(`- Admin Signin: ${signinTest ? '✅' : '❌'}`);
  
  if (signupTest && signinTest) {
    console.log('\n🎉 All auth tests passed! Authentication is working.');
    process.exit(0);
  } else {
    console.log('\n❌ Authentication issues detected.');
    process.exit(1);
  }
}

runTests();