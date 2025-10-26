import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug: Show all loaded environment variables
console.log('Loaded environment variables:');
Object.keys(process.env).forEach(key => {
  if (key.includes('SUPABASE') || key.includes('EXPO')) {
    console.log(`${key}: ${process.env[key]?.substring(0, 20)}...`);
  }
});

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY; // Note: Your .env uses SUPABASE_KEY, not SUPABASE_ANON_KEY

// Check if we have valid credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials not found in .env file');
  console.log('Make sure you have:');
  console.log('- EXPO_PUBLIC_SUPABASE_URL');
  console.log('- EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Create Supabase client for Node.js testing (without AsyncStorage)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseAnonKey.substring(0, 20) + '...');
    
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('Data:', data);
      return true;
    }
  } catch (err) {
    console.error('❌ Connection test failed:', err);
    return false;
  }
}

// Export for use in other files
export { testSupabaseConnection };

// Run test if this file is executed directly
if (require.main === module) {
  testSupabaseConnection();
}
