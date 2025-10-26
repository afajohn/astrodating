import { supabase } from '../../lib/supabase';
import { AstrologyService } from './AstrologyService';
import { NotificationService } from './NotificationService';

export interface UserCompatibility {
  id: string;
  user_a: string;
  user_b: string;
  total_score: number;
  western_compatible: boolean;
  chinese_compatible: boolean;
  vedic_compatible: boolean;
  is_match: boolean;
  calculated_at: string;
  created_at: string;
}

export class CompatibilityService {
  /**
   * Calculate compatibility between two user profiles (for UI display)
   */
  static calculateCompatibility(profileA: any, profileB: any): { score: number; breakdown: any } {
    console.log('CompatibilityService: Input profiles', {
      profileA: {
        birth_date: profileA?.birth_date,
        western_sign: profileA?.western_sign,
        chinese_sign: profileA?.chinese_sign,
        vedic_sign: profileA?.vedic_sign,
      },
      profileB: {
        birth_date: profileB?.birth_date,
        western_sign: profileB?.western_sign,
        chinese_sign: profileB?.chinese_sign,
        vedic_sign: profileB?.vedic_sign,
      }
    });

    if (!profileA?.birth_date || !profileB?.birth_date) {
      console.log('CompatibilityService: Missing birth dates');
      return { score: 0, breakdown: {} };
    }

    try {
      // Use calculated astrology signs instead of stored ones (in case stored ones are wrong)
      const astrologyA = AstrologyService.getAstrologyProfile(profileA.birth_date);
      const astrologyB = AstrologyService.getAstrologyProfile(profileB.birth_date);
      
      console.log('CompatibilityService: Astrology profiles', {
        astrologyA: {
          westernSign: astrologyA.westernSign,
          chineseSign: astrologyA.chineseSign,
          vedicSign: astrologyA.vedicSign,
        },
        astrologyB: {
          westernSign: astrologyB.westernSign,
          chineseSign: astrologyB.chineseSign,
          vedicSign: astrologyB.vedicSign,
        }
      });
      
      const compatibility = AstrologyService.calculateCompatibility(astrologyA, astrologyB);
      
      console.log('CompatibilityService: Compatibility result', compatibility);
      
      return {
        score: compatibility.totalScore,
        breakdown: {
          western: compatibility.westernCompatible,
          chinese: compatibility.chineseCompatible,
          vedic: compatibility.vedicCompatible,
        }
      };
    } catch (error) {
      console.error('CompatibilityService: Error calculating compatibility:', error);
      return { score: 0, breakdown: {} };
    }
  }

  /**
   * Calculate and store compatibility between two users
   */
  static async calculateAndStoreCompatibility(
    userAId: string,
    userBId: string,
    userABirthDate: string,
    userBBirthDate: string
  ): Promise<{ data: UserCompatibility | null; error: any }> {
    try {
      // Get astrology profiles
      const profileA = AstrologyService.getAstrologyProfile(userABirthDate);
      const profileB = AstrologyService.getAstrologyProfile(userBBirthDate);

      // Calculate compatibility
      const compatibility = AstrologyService.calculateCompatibility(profileA, profileB);

      // Store in database
      const { data, error } = await supabase
        .from('user_compatibility')
        .upsert({
          user_a: userAId,
          user_b: userBId,
          total_score: compatibility.totalScore,
          western_compatible: compatibility.westernCompatible,
          chinese_compatible: compatibility.chineseCompatible,
          vedic_compatible: compatibility.vedicCompatible,
          calculated_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Send match notification if compatibility is high enough
      if (data && compatibility.totalScore >= 70) {
        try {
          await this.sendMatchNotification(userAId, userBId, compatibility.totalScore);
        } catch (notificationError) {
          console.error('CompatibilityService: Error sending match notification:', notificationError);
          // Don't fail the compatibility calculation if notification fails
        }
      }

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get compatibility between two users
   */
  static async getCompatibility(
    userAId: string,
    userBId: string
  ): Promise<{ data: UserCompatibility | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_compatibility')
        .select('*')
        .or(`and(user_a.eq.${userAId},user_b.eq.${userBId}),and(user_a.eq.${userBId},user_b.eq.${userAId})`)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get all matches for a user
   */
  static async getUserMatches(userId: string): Promise<{ data: UserCompatibility[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_compatibility')
        .select('*')
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .eq('is_match', true)
        .order('calculated_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get potential matches for a user (compatible but not yet matched)
   */
  static async getPotentialMatches(userId: string): Promise<{ data: UserCompatibility[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_compatibility')
        .select('*')
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .eq('is_match', true)
        .is('matched_at', null)
        .order('calculated_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Batch calculate compatibility for multiple users
   */
  static async batchCalculateCompatibility(
    currentUserId: string,
    targetUserIds: string[],
    currentUserBirthDate: string
  ): Promise<{ data: UserCompatibility[] | null; error: any }> {
    try {
      const compatibilityPromises = targetUserIds.map(async (targetUserId) => {
        // Get target user's birth date from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('birth_date')
          .eq('id', targetUserId)
          .single();

        if (!profile?.birth_date) {
          return null;
        }

        return this.calculateAndStoreCompatibility(
          currentUserId,
          targetUserId,
          currentUserBirthDate,
          profile.birth_date
        );
      });

      const results = await Promise.all(compatibilityPromises);
      const successfulResults = results
        .filter(result => result && result.data)
        .map(result => result!.data!)
        .filter(data => data !== null) as UserCompatibility[];

      return { data: successfulResults, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get compatibility statistics for a user
   */
  static async getCompatibilityStats(userId: string): Promise<{
    totalCalculated: number;
    totalMatches: number;
    westernMatches: number;
    chineseMatches: number;
    vedicMatches: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('user_compatibility')
        .select('*')
        .or(`user_a.eq.${userId},user_b.eq.${userId}`);

      if (error || !data) {
        return {
          totalCalculated: 0,
          totalMatches: 0,
          westernMatches: 0,
          chineseMatches: 0,
          vedicMatches: 0,
        };
      }

      const totalCalculated = data.length;
      const totalMatches = data.filter(item => item.is_match).length;
      const westernMatches = data.filter(item => item.western_compatible).length;
      const chineseMatches = data.filter(item => item.chinese_compatible).length;
      const vedicMatches = data.filter(item => item.vedic_compatible).length;

      return {
        totalCalculated,
        totalMatches,
        westernMatches,
        chineseMatches,
        vedicMatches,
      };
    } catch (error) {
      return {
        totalCalculated: 0,
        totalMatches: 0,
        westernMatches: 0,
        chineseMatches: 0,
        vedicMatches: 0,
      };
    }
  }

  /**
   * Delete compatibility record
   */
  static async deleteCompatibility(
    userAId: string,
    userBId: string
  ): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('user_compatibility')
        .delete()
        .or(`and(user_a.eq.${userAId},user_b.eq.${userBId}),and(user_a.eq.${userBId},user_b.eq.${userAId})`);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Recalculate all compatibility for a user (useful when profile is updated)
   */
  static async recalculateUserCompatibility(userId: string): Promise<{ error: any }> {
    try {
      // Get user's birth date
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('birth_date')
        .eq('id', userId)
        .single();

      if (!userProfile?.birth_date) {
        return { error: { message: 'User birth date not found' } };
      }

      // Get all other users
      const { data: otherUsers } = await supabase
        .from('profiles')
        .select('id, birth_date')
        .neq('id', userId)
        .not('birth_date', 'is', null);

      if (!otherUsers) {
        return { error: null };
      }

      // Recalculate compatibility with all users
      const promises = otherUsers.map(user =>
        this.calculateAndStoreCompatibility(
          userId,
          user.id,
          userProfile.birth_date,
          user.birth_date
        )
      );

      await Promise.all(promises);

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Send match notification to both users
   */
  private static async sendMatchNotification(
    userAId: string,
    userBId: string,
    compatibilityScore: number
  ): Promise<void> {
    try {
      // Get both users' profiles and push tokens
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, push_token')
        .in('id', [userAId, userBId]);

      if (!profiles || profiles.length !== 2) {
        console.log('CompatibilityService: Could not find both user profiles');
        return;
      }

      const [profileA, profileB] = profiles;
      const userAProfile = profileA.id === userAId ? profileA : profileB;
      const userBProfile = profileA.id === userAId ? profileB : profileA;

      // Send notification to user A
      if (userAProfile.push_token) {
        await NotificationService.sendNewMatchNotification(
          userAProfile.push_token,
          userBProfile.first_name || 'Someone',
          compatibilityScore
        );
      }

      // Send notification to user B
      if (userBProfile.push_token) {
        await NotificationService.sendNewMatchNotification(
          userBProfile.push_token,
          userAProfile.first_name || 'Someone',
          compatibilityScore
        );
      }

      console.log('CompatibilityService: Match notifications sent');
    } catch (error) {
      console.error('CompatibilityService: Error sending match notifications:', error);
    }
  }
}
