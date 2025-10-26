import { supabase } from '../../lib/supabase';

export async function initializeAstrologyDescriptions(): Promise<boolean> {
  try {
    console.log('🚀 Initializing astrology descriptions cache...');
    
    // Check if descriptions already exist
    const { data: existingDescriptions, error: checkError } = await supabase
      .from('astrology_descriptions')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing descriptions:', checkError);
      return false;
    }

    if (existingDescriptions && existingDescriptions.length > 0) {
      console.log('✅ Astrology descriptions already exist in cache');
      return true;
    }

    console.log('📝 No descriptions found, initializing cache...');
    
    // The SQL script should be run manually in Supabase dashboard
    // or through a migration system
    console.log('⚠️ Please run the supabase-astrology-descriptions.sql script in your Supabase dashboard');
    
    return true;
  } catch (error) {
    console.error('Error initializing astrology descriptions:', error);
    return false;
  }
}

export async function testAstrologyDescriptionsCache(): Promise<boolean> {
  try {
    console.log('🧪 Testing astrology descriptions cache...');
    
    // Test fetching a description
    const { data, error } = await supabase
      .from('astrology_descriptions')
      .select('description')
      .eq('astrology_system', 'western')
      .eq('sign_name', 'Aries')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ No descriptions found in cache');
        return false;
      }
      console.error('Error testing cache:', error);
      return false;
    }

    console.log('✅ Cache test successful:', data.description.substring(0, 50) + '...');
    return true;
  } catch (error) {
    console.error('Error testing cache:', error);
    return false;
  }
}
