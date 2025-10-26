import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';

export interface PhotoUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class PhotoUploadService {
  /**
   * Request camera and media library permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      return cameraPermission.granted && mediaPermission.granted;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  /**
   * Pick an image from the device
   */
  static async pickImage(): Promise<{ uri: string; cancelled: boolean }> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Camera and media library permissions are required');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for profile photos
        quality: 0.8,
      });

      return {
        uri: result.assets?.[0]?.uri || '',
        cancelled: result.canceled || false,
      };
    } catch (error) {
      console.error('Image picker error:', error);
      throw error;
    }
  }

  /**
   * Take a photo with the camera
   */
  static async takePhoto(): Promise<{ uri: string; cancelled: boolean }> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Camera permission is required');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for profile photos
        quality: 0.8,
      });

      return {
        uri: result.assets?.[0]?.uri || '',
        cancelled: result.canceled || false,
      };
    } catch (error) {
      console.error('Camera error:', error);
      throw error;
    }
  }

  /**
   * Resize and optimize image for upload
   */
  static async optimizeImage(uri: string): Promise<string> {
    try {
      const optimizedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: 400, height: 400 } }, // Resize to 400x400
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return optimizedImage.uri;
    } catch (error) {
      console.error('Image optimization error:', error);
      throw error;
    }
  }

  /**
   * Upload image to Supabase Storage (React Native compatible)
   */
  static async uploadToSupabase(
    imageUri: string,
    userId: string,
    photoIndex: number = 0
  ): Promise<PhotoUploadResult> {
    try {
      console.log('🔄 Starting upload process...');
      console.log('Image URI:', imageUri);
      console.log('User ID:', userId);
      console.log('Photo Index:', photoIndex);

      // Optimize the image first
      console.log('🖼️ Optimizing image...');
      const optimizedUri = await this.optimizeImage(imageUri);
      console.log('✅ Image optimized:', optimizedUri);

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${userId}/photo_${photoIndex}_${timestamp}.jpg`;
      console.log('📁 File name:', fileName);

      // For React Native, read file as ArrayBuffer directly
      console.log('📤 Reading file as ArrayBuffer...');
      
      // Read the file as ArrayBuffer directly
      const response = await fetch(optimizedUri);
      if (!response.ok) {
        throw new Error(`Failed to read file: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log('📦 ArrayBuffer created, size:', arrayBuffer.byteLength);

      // Upload to Supabase Storage using ArrayBuffer
      console.log('☁️ Uploading to Supabase...');
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true, // Replace if exists
        });

      if (error) {
        console.error('❌ Supabase upload error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Upload successful!');
      console.log('📄 Upload data:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      console.log('🌐 Public URL:', urlData.publicUrl);

      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      console.error('❌ Upload error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }

  /**
   * Complete photo upload process
   */
  static async uploadPhoto(
    userId: string,
    photoIndex: number = 0,
    source: 'camera' | 'library' = 'library'
  ): Promise<PhotoUploadResult> {
    try {
      // Pick or take photo
      const { uri, cancelled } = source === 'camera' 
        ? await this.takePhoto() 
        : await this.pickImage();

      if (cancelled || !uri) {
        return { success: false, error: 'Photo selection cancelled' };
      }

      // Upload to Supabase
      return await this.uploadToSupabase(uri, userId, photoIndex);
    } catch (error) {
      console.error('Photo upload error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }

  /**
   * Delete photo from Supabase Storage
   */
  static async deletePhoto(photoUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const userId = urlParts[urlParts.length - 2];
      const filePath = `${userId}/${fileName}`;

      const { error } = await supabase.storage
        .from('profile-photos')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Delete failed' 
      };
    }
  }

  /**
   * Get photo upload progress (for future implementation)
   */
  static async getUploadProgress(): Promise<number> {
    // This would be implemented with a progress tracking system
    // For now, return 100% as we're using simple uploads
    return 100;
  }
}
