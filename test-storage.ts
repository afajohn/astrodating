import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function testStorageBucket() {
  try {
    console.log('Testing Supabase Storage bucket...');
    
    // Test if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      console.log('This might be due to RLS policies. Let\'s try a different approach...');
      
      // Try to directly test the bucket by attempting to list files
      console.log('Testing direct bucket access...');
      const { data: files, error: filesError } = await supabase.storage
        .from('profile-photos')
        .list('', { limit: 1 });
      
      if (filesError) {
        console.error('❌ Cannot access profile-photos bucket:', filesError);
        console.log('\n🔧 SOLUTION:');
        console.log('1. Go to your Supabase Dashboard → Storage');
        console.log('2. Make sure the "profile-photos" bucket exists');
        console.log('3. Set the bucket to PUBLIC');
        console.log('4. Run the SQL policies from supabase-storage-policies.sql');
        return;
      } else {
        console.log('✅ profile-photos bucket is accessible!');
      }
    } else {
      console.log('📦 Available buckets:', buckets.map(b => b.name));
      
      // Check if profile-photos bucket exists
      const profilePhotosBucket = buckets.find(b => b.name === 'profile-photos');
      
      if (!profilePhotosBucket) {
        console.log('⚠️ profile-photos bucket not found in list, but might exist');
      } else {
        console.log('✅ profile-photos bucket exists');
        console.log('Bucket details:', profilePhotosBucket);
      }
    }
    
    // Test upload permissions
    console.log('Testing upload permissions...');
    
    // Create a test image file (1x1 pixel PNG)
    const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const testImageBlob = new Blob([Uint8Array.from(atob(testImageData), c => c.charCodeAt(0))], { type: 'image/png' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload('test/test-image.png', testImageBlob);
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
    } else {
      console.log('✅ Upload test successful!');
      
      // Clean up test file
      await supabase.storage
        .from('profile-photos')
        .remove(['test/test-image.png']);
      
      console.log('🧹 Test file cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Storage test failed:', error);
  }
}

// Run the test
testStorageBucket();
