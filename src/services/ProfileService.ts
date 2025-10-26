import { supabase } from '../../lib/supabase';
import { NotificationService } from './NotificationService';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  age: number | null;
  country: 'Philippines' | 'Thailand' | null;
  gender: 'male' | 'female' | null;
  seeking: 'male' | 'female' | null;
  marital_status: 'single' | 'divorced' | 'widowed' | null;
  bio: string | null;
  photos: string[];
  profile_photo: string | null;
  western_sign: string | null;
  chinese_sign: string | null;
  vedic_sign: string | null;
  hotlist: string[];
  profiles_browsed_today: number;
  last_browse_reset_date: string;
  is_profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  country?: 'Philippines' | 'Thailand';
  gender?: 'male' | 'female';
  seeking?: 'male' | 'female';
  marital_status?: 'single' | 'divorced' | 'widowed';
  bio?: string;
  photos?: string[];
  profile_photo?: string;
  western_sign?: string;
  chinese_sign?: string;
  vedic_sign?: string;
}

export class ProfileService {
  /**
   * Get the current user's profile
   */
  static async getCurrentProfile(): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: { message: 'No authenticated user' } };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update the current user's profile
   */
  static async updateProfile(updates: ProfileUpdateData): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: { message: 'No authenticated user' } };
      }

      console.log('Updating profile for user:', user.id);
      console.log('Update data:', updates);

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        return { data: null, error };
      }

      console.log('Profile updated successfully:', data);
      
      // Register for push notifications if not already done
      try {
        const pushToken = await NotificationService.registerForPushNotifications();
        if (pushToken) {
          await this.updatePushToken(user.id, pushToken);
        }
      } catch (notificationError) {
        console.error('ProfileService: Error registering push notifications:', notificationError);
        // Don't fail the profile update if notification registration fails
      }

      return { data, error };
    } catch (error) {
      console.error('Profile update exception:', error);
      return { data: null, error };
    }
  }

  /**
   * Upload a photo to Supabase Storage
   */
  static async uploadPhoto(file: File, userId: string): Promise<{ data: string | null; error: any }> {
    try {
      const fileName = `${userId}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file);

      if (error) {
        return { data: null, error };
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      return { data: urlData.publicUrl, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete a photo from Supabase Storage
   */
  static async deletePhoto(photoUrl: string): Promise<{ error: any }> {
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const userId = urlParts[urlParts.length - 2];
      const filePath = `${userId}/${fileName}`;

      const { error } = await supabase.storage
        .from('profile-photos')
        .remove([filePath]);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Get profiles for browsing (excluding current user)
   */
  static async getBrowseProfiles(
    limit: number = 10,
    offset: number = 0
  ): Promise<{ data: UserProfile[] | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: { message: 'No authenticated user' } };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .eq('is_profile_complete', true)
        .range(offset, offset + limit - 1);

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Add user to hotlist
   */
  static async addToHotlist(targetUserId: string): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'No authenticated user' } };
      }

      // Get current hotlist
      const { data: profile } = await this.getCurrentProfile();
      if (!profile) {
        return { error: { message: 'Profile not found' } };
      }

      const currentHotlist = profile.hotlist || [];
      if (currentHotlist.includes(targetUserId)) {
        return { error: null }; // Already in hotlist
      }

      const updatedHotlist = [...currentHotlist, targetUserId];

      const { error } = await supabase
        .from('profiles')
        .update({ hotlist: updatedHotlist })
        .eq('id', user.id);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Get profiles for explore screen (excluding current user)
   */
  static async getExploreProfiles(): Promise<{ data: UserProfile[] | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log('ProfileService: Getting explore profiles for user:', user?.id);
      
      if (!user) {
        // For non-authenticated users, show profiles with basic info (not requiring full completion)
        console.log('ProfileService: No authenticated user, showing profiles with basic info');
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .not('first_name', 'is', null)
          .not('last_name', 'is', null)
          .not('gender', 'is', null)
          .not('seeking', 'is', null)
          .order('created_at', { ascending: false });
        
        console.log('ProfileService: Non-auth profiles result:', { count: data?.length, error });
        return { data, error };
      }

      // Get current user's profile to filter by seeking preference
      const { data: currentProfile } = await this.getCurrentProfile();
      if (!currentProfile) {
        console.log('ProfileService: Current profile not found for authenticated user');
        return { data: null, error: { message: 'Current profile not found' } };
      }

      console.log('ProfileService: Current profile seeking:', currentProfile.seeking);

      // Build query based on seeking preference
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id) // Exclude current user
        .not('first_name', 'is', null)
        .not('last_name', 'is', null)
        .not('gender', 'is', null)
        .not('seeking', 'is', null); // Show profiles with basic info

      // Filter by seeking preference
      if (currentProfile.seeking) {
        query = query.eq('gender', currentProfile.seeking);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      console.log('ProfileService: Auth profiles result:', { count: data?.length, error });
      return { data, error };
    } catch (error) {
      console.error('ProfileService: Error getting explore profiles:', error);
      return { data: null, error };
    }
  }

  /**
   * Get profiles in user's hotlist
   */
  static async getHotlistProfiles(): Promise<{ data: UserProfile[] | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: { message: 'No authenticated user' } };
      }

      // Get current user's profile to get hotlist
      const { data: currentProfile } = await this.getCurrentProfile();
      if (!currentProfile || !currentProfile.hotlist || currentProfile.hotlist.length === 0) {
        return { data: [], error: null };
      }

      // Get profiles for hotlist user IDs
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', currentProfile.hotlist);

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update daily browse count
   */
  static async updateBrowseCount(count: number): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'No authenticated user' } };
      }

      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          profiles_browsed_today: count,
          last_browse_reset_date: today
        })
        .eq('id', user.id);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Remove user from hotlist
   */
  static async removeFromHotlist(targetUserId: string): Promise<{ error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'No authenticated user' } };
      }

      // Get current hotlist
      const { data: profile } = await this.getCurrentProfile();
      if (!profile) {
        return { error: { message: 'Profile not found' } };
      }

      const currentHotlist = profile.hotlist || [];
      const updatedHotlist = currentHotlist.filter(id => id !== targetUserId);

      const { error } = await supabase
        .from('profiles')
        .update({ hotlist: updatedHotlist })
        .eq('id', user.id);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Update user's push token for notifications
   */
  static async updatePushToken(userId: string, pushToken: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ push_token: pushToken })
        .eq('id', userId);

      if (error) {
        console.error('ProfileService: Error updating push token:', error);
        return { error };
      }

      console.log('ProfileService: Push token updated successfully');
      return { error: null };
    } catch (error) {
      console.error('ProfileService: Exception updating push token:', error);
      return { error };
    }
  }
}
