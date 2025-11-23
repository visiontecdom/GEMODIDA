// Test script to verify Supabase connection
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  console.log('Please ensure you have the following in your .env.local file:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

console.log('🔍 Testing Supabase connection...');
console.log(`URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`Key: ${supabaseKey.substring(0, 10)}...`);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Test connection by fetching from a table
async function testConnection() {
  try {
    console.log('\n🔌 Testing database connection...');
    const { data, error } = await supabase
      .from('palabras_clave')
      .select('*')
      .limit(1);

    if (error) throw error;
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('📊 Data sample:', data);
    return true;
  } catch (error) {
    console.error('❌ Error connecting to Supabase:');
    console.error(error.message);
    return false;
  }
}

// Test authentication
async function testAuth() {
  try {
    console.log('\n🔐 Testing authentication...');
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) throw error;
    
    console.log('✅ Anonymous auth successful!');
    console.log('👤 User ID:', data.user.id);
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:');
    console.error(error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  const connectionTest = await testConnection();
  const authTest = await testAuth();
  
  console.log('\n📊 Test Results:');
  console.log(`- Database Connection: ${connectionTest ? '✅' : '❌'}`);
  console.log(`- Authentication: ${authTest ? '✅' : '❌'}`);
  
  if (connectionTest && authTest) {
    console.log('\n🎉 All tests passed! Your Supabase connection is working correctly.');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Please check the error messages above.');
    process.exit(1);
  }
}

runTests();
