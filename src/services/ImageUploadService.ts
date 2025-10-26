import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class ImageUploadService {
  /**
   * Request permissions for image picker
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Pick an image from the device
   */
  static async pickImage(): Promise<ImagePicker.ImagePickerResult> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Permission to access media library is required');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      return result;
    } catch (error) {
      console.error('Error picking image:', error);
      throw error;
    }
  }

  /**
   * Take a photo with the camera
   */
  static async takePhoto(): Promise<ImagePicker.ImagePickerResult> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access camera is required');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      return result;
    } catch (error) {
      console.error('Error taking photo:', error);
      throw error;
    }
  }

  /**
   * Upload image to Supabase Storage
   */
  static async uploadImage(
    imageUri: string,
    folder: string = 'chat-images'
  ): Promise<ImageUploadResult> {
    try {
      console.log('ImageUploadService: Starting image upload:', { imageUri, folder });

      // Get file info
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Check file size (5MB limit)
      const fileSizeInMB = blob.size / (1024 * 1024);
      if (fileSizeInMB > 5) {
        return {
          success: false,
          error: 'Image size must be less than 5MB'
        };
      }

      console.log('ImageUploadService: File size:', fileSizeInMB.toFixed(2), 'MB');

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = imageUri.split('.').pop() || 'jpg';
      const fileName = `${timestamp}_${randomString}.${fileExtension}`;

      console.log('ImageUploadService: Generated filename:', fileName);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(`${folder}/${fileName}`, blob, {
          contentType: blob.type,
          upsert: false
        });

      if (error) {
        console.error('ImageUploadService: Upload error:', error);
        return {
          success: false,
          error: `Upload failed: ${error.message}`
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(`${folder}/${fileName}`);

      console.log('ImageUploadService: Upload successful:', urlData.publicUrl);

      return {
        success: true,
        url: urlData.publicUrl
      };
    } catch (error) {
      console.error('ImageUploadService: Upload exception:', error);
      return {
        success: false,
        error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Show image picker options (camera or gallery)
   */
  static async showImagePickerOptions(): Promise<ImagePicker.ImagePickerResult | null> {
    try {
      // For now, we'll just use the gallery picker
      // In a real app, you might want to show an action sheet with camera/gallery options
      return await this.pickImage();
    } catch (error) {
      console.error('Error showing image picker:', error);
      return null;
    }
  }
}
