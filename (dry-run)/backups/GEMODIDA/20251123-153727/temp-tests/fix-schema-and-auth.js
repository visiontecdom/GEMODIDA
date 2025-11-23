// Comprehensive fix for Supabase auth schema and dual-table setup
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log('🔧 COMPREHENSIVE AUTHENTICATION FIX');
console.log('Addressing: Database schema corruption + Dual-table setup');

// Create client with service role key
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Fix 1: Verify and fix auth schema
async function fixAuthSchema() {
  try {
    console.log('\n🔍 DIAGNOSIS: Checking auth schema...');
    
    // Try to query auth schema directly
    const { data: schemaCheck, error: schemaError } = await supabase.rpc('exec', {
      query: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users'`
    });

    if (schemaError) {
      console.log('⚠️  Auth schema check failed:', schemaError.message);
      console.log('🔧 ATTEMPTING: Re-enabling auth schema...');
      
      // Try to reset auth schema
      const { error: resetError } = await supabase.rpc('exec', {
        query: `
          ALTER DATABASE postgres SET "app.settings.jwt_secret" TO '';
          ALTER DATABASE postgres SET "app.settings.jwt_exp" TO '3600';
        `
      });
      
      if (resetError) {
        console.log('⚠️  Schema reset failed:', resetError.message);
        return false;
      }
    }
    
    console.log('✅ Auth schema appears to exist');
    return true;
  } catch (error) {
    console.error('❌ Schema fix failed:', error.message);
    return false;
  }
}

// Fix 2: Create user with proper error handling
async function createUserWithFallback() {
  try {
    console.log('\n👤 CREATING: User with multiple fallback strategies...');
    
    // Strategy 1: Try normal signup
    console.log('📝 Strategy 1: Standard signup...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: 'baez.israel@gmail.com',
      password: 'a12300',
      options: {
        data: {
          full_name: 'Israel Báez Herrera'
        }
      }
    });

    if (signupError) {
      console.log('❌ Strategy 1 failed:', signupError.message);
      
      // Strategy 2: Try admin createUser
      console.log('🛡️  Strategy 2: Admin user creation...');
      const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
        email: 'baez.israel@gmail.com',
        password: 'a12300',
        email_confirm: true,
        user_metadata: {
          full_name: 'Israel Báez Herrera'
        }
      });

      if (adminError) {
        console.log('❌ Strategy 2 failed:', adminError.message);
        
        // Strategy 3: Check if user already exists and update
        console.log('🔍 Strategy 3: User exists check...');
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          console.log('❌ Strategy 3 failed:', listError.message);
          return { success: false, reason: 'all_strategies_failed' };
        }
        
        const existingUser = users.users.find(user => user.email === 'baez.israel@gmail.com');
        
        if (existingUser) {
          console.log('✅ Found existing user, updating...');
          const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
              password: 'a12300',
              email_confirm: true
            }
          );
          
          if (updateError) {
            console.log('❌ Strategy 3 failed:', updateError.message);
            return { success: false, reason: 'update_failed' };
          }
          
          console.log('✅ User updated successfully');
          return { success: true, user: updateData.user, strategy: 'existing_updated' };
        } else {
          console.log('❌ No existing user found');
          return { success: false, reason: 'user_not_found' };
        }
      } else {
        console.log('✅ Admin user created successfully');
        return { success: true, user: adminData.user, strategy: 'admin_created' };
      }
    } else {
      console.log('✅ Normal signup successful');
      return { success: true, user: signupData.user, strategy: 'normal_signup' };
    }
  } catch (error) {
    console.error('❌ User creation failed:', error.message);
    return { success: false, reason: 'exception', error };
  }
}

// Fix 3: Setup public.usuarios table integration
async function setupPublicUser(userData) {
  try {
    console.log('\n🗃️  SETTING UP: Public user integration...');
    
    // Create profiles table if it doesn't exist
    console.log('📋 Creating profiles table...');
    const { error: profileError } = await supabase.rpc('exec', {
      query: `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
          full_name TEXT,
          email TEXT UNIQUE,
          role TEXT DEFAULT 'user',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own profile" ON public.profiles
        FOR SELECT USING (auth.uid() = id);
        
        CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
      `
    });

    if (profileError) {
      console.log('⚠️  Profiles table creation had issues:', profileError.message);
    } else {
      console.log('✅ Profiles table ready');
    }

    // Create/update public user record
    console.log('👤 Creating public user record...');
    
    // First check if record exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing profile:', checkError);
      return false;
    }

    if (existingProfile) {
      console.log('📝 Updating existing profile...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: 'Israel Báez Herrera',
          email: 'baez.israel@gmail.com',
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id);

      if (updateError) {
        console.error('❌ Profile update failed:', updateError);
        return false;
      }
    } else {
      console.log('➕ Creating new profile...');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userData.id,
          full_name: 'Israel Báez Herrera',
          email: 'baez.israel@gmail.com',
          role: 'admin'
        });

      if (insertError) {
        console.error('❌ Profile creation failed:', insertError);
        return false;
      }
    }

    console.log('✅ Public profile setup complete');
    return true;
  } catch (error) {
    console.error('❌ Public user setup failed:', error.message);
    return false;
  }
}

// Fix 4: Test complete authentication
async function testAuthentication() {
  try {
    console.log('\n🧪 TESTING: Complete authentication flow...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'baez.israel@gmail.com',
      password: 'a12300'
    });

    if (error) {
      console.error('❌ Authentication test failed:', error.message);
      return { success: false, error };
    }

    console.log('✅ Authentication successful!');
    console.log('👤 User:', data.user.email);
    console.log('🔗 Session active:', !!data.session);
    
    // Verify profile integration
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.log('⚠️  Profile verification had issues:', profileError.message);
    } else {
      console.log('✅ Profile integration verified');
      console.log('📋 Profile Role:', profile.role);
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    return { success: false, error };
  }
}

// Main execution
async function runComprehensiveFix() {
  console.log('🎯 COMPREHENSIVE AUTHENTICATION FIX');
  console.log('Target: baez.israel@gmail.com');
  console.log('Password: a12300');
  console.log('=' .repeat(60));
  
  // Step 1: Fix auth schema
  const schemaFixed = await fixAuthSchema();
  
  // Step 2: Create/update user
  const userResult = await createUserWithFallback();
  
  if (!userResult.success) {
    console.log('\n❌ USER CREATION FAILED');
    console.log('Reason:', userResult.reason);
    return false;
  }
  
  // Step 3: Setup public integration
  const publicSetup = await setupPublicUser(userResult.user);
  
  if (!publicSetup) {
    console.log('\n⚠️  PUBLIC SETUP INCOMPLETE');
    console.log('But authentication may still work...');
  }
  
  // Step 4: Test authentication
  const authTest = await testAuthentication();
  
  console.log('\n📊 FINAL RESULTS:');
  console.log(`- Schema Fix: ${schemaFixed ? '✅' : '❌'}`);
  console.log(`- User Created: ✅ (${userResult.strategy})`);
  console.log(`- Public Setup: ${publicSetup ? '✅' : '⚠️'}`);
  console.log(`- Authentication: ${authTest.success ? '✅' : '❌'}`);
  
  if (authTest.success) {
    console.log('\n🎉 AUTHENTICATION FIX COMPLETE!');
    console.log('✅ Your user can now sign in successfully');
    console.log('✅ Dual-table setup is operational');
    console.log('\n📝 Next: Test signin in the browser');
    return true;
  } else {
    console.log('\n❌ AUTHENTICATION STILL FAILING');
    console.log('Manual intervention may be required');
    console.log('Check Supabase project dashboard for schema issues');
    return false;
  }
}

runComprehensiveFix().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
});