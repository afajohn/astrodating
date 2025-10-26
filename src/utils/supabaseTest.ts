import { supabase } from '../../lib/supabase';

// Test Supabase client in React Native environment
export const testSupabaseInRN = async () => {
  try {
    console.log('🧪 Testing Supabase client in React Native...');
    
    // Test 1: Check if client is initialized
    console.log('📡 Supabase URL:', supabase.supabaseUrl);
    console.log('🔑 Supabase Key:', supabase.supabaseKey?.substring(0, 20) + '...');
    
    // Test 2: Test basic connection
    console.log('🔌 Testing connection...');
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
    
    console.log('✅ Connection test passed:', data);
    
    // Test 3: Test storage access
    console.log('📦 Testing storage access...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Storage test failed:', bucketsError);
      return false;
    }
    
    console.log('✅ Storage test passed, buckets:', buckets.map(b => b.name));
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};
