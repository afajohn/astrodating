import { supabase } from '../../lib/supabase';
import { AstrologyQuote, GeminiAIService, SignDescription } from './GeminiAIService';

export interface UserNotificationPreferences {
  morningQuotes: boolean;
  afternoonQuotes: boolean;
  eveningQuotes: boolean;
  preferredCategories: string[];
  notificationTime: {
    morning: string; // HH:MM format
    afternoon: string;
    evening: string;
  };
}

export interface UserActivityPattern {
  userId: string;
  morningActive: boolean;
  afternoonActive: boolean;
  eveningActive: boolean;
  lastActiveTime: string;
  averageActiveHours: number[];
}

export class AstrologyContentService {

  /**
   * Generate and store daily quote for a user
   */
  static async generateDailyQuoteForUser(userId: string): Promise<AstrologyQuote | null> {
    try {
      console.log('AstrologyContentService: Generating daily quote for user:', userId);

      // Get user's profile and astrology info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('birth_date, western_sign, chinese_sign, vedic_sign')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.error('AstrologyContentService: Error fetching user profile:', profileError);
        return null;
      }

      // Use primary sign (Western) for quote generation
      const primarySign = profile.western_sign || 'Aries';
      const timeOfDay = this.getCurrentTimeOfDay();
      const category = GeminiAIService.getRandomCategory();

      // Generate quote using Gemini AI
      const quote = await GeminiAIService.generateDailyQuote(primarySign, timeOfDay, category);

      // Store quote in database
      const { error: storeError } = await supabase
        .from('astrology_quotes')
        .insert({
          user_id: userId,
          content: quote.content,
          category: quote.category,
          time_of_day: quote.timeOfDay,
          sign: quote.sign,
          generated_at: quote.generatedAt
        });

      if (storeError) {
        console.error('AstrologyContentService: Error storing quote:', storeError);
      }

      console.log('AstrologyContentService: Daily quote generated and stored');
      return quote;
    } catch (error) {
      console.error('AstrologyContentService: Error generating daily quote:', error);
      return null;
    }
  }

  /**
   * Generate personalized sign description based on astrology system
   */
  static async generateSignDescription(sign: string, astrologySystem: 'western' | 'chinese' | 'vedic'): Promise<SignDescription | null> {
    try {
      console.log('AstrologyContentService: Generating sign description for:', { sign, astrologySystem });

      // Create a unique cache key that includes the astrology system
      const cacheKey = `${sign}_${astrologySystem}`;

      // Check if we already have a cached description
      const { data: cached, error: cacheError } = await supabase
        .from('sign_descriptions')
        .select('*')
        .eq('sign', cacheKey)
        .single();

      if (cached && !cacheError) {
        console.log('AstrologyContentService: Using cached description');
        return {
          sign: cached.sign,
          description: cached.description,
          strengths: cached.strengths || [],
          challenges: cached.challenges || [],
          advice: cached.advice || ''
        };
      }

      // Generate new description using Gemini AI
      const description = await GeminiAIService.generateSignDescription(sign, astrologySystem);

      // Store in database for caching with system-specific key
      const { error: storeError } = await supabase
        .from('sign_descriptions')
        .upsert({
          sign: cacheKey, // Store with system-specific key
          description: description.description,
          strengths: description.strengths,
          challenges: description.challenges,
          advice: description.advice,
          astrology_system: astrologySystem,
          generated_at: new Date().toISOString()
        });

      if (storeError) {
        console.error('AstrologyContentService: Error storing sign description:', storeError);
      }

      console.log('AstrologyContentService: Sign description generated and stored');
      return description;
    } catch (error) {
      console.error('AstrologyContentService: Error generating sign description:', error);
      return null;
    }
  }

  /**
   * Get user's notification preferences
   */
  static async getUserNotificationPreferences(userId: string): Promise<UserNotificationPreferences> {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Return default preferences
        return {
          morningQuotes: true,
          afternoonQuotes: true,
          eveningQuotes: true,
          preferredCategories: ['life', 'motivation', 'career'],
          notificationTime: {
            morning: '08:00',
            afternoon: '14:00',
            evening: '20:00'
          }
        };
      }

      return data.preferences as UserNotificationPreferences;
    } catch (error) {
      console.error('AstrologyContentService: Error fetching notification preferences:', error);
      return {
        morningQuotes: true,
        afternoonQuotes: true,
        eveningQuotes: true,
        preferredCategories: ['life', 'motivation', 'career'],
        notificationTime: {
          morning: '08:00',
          afternoon: '14:00',
          evening: '20:00'
        }
      };
    }
  }

  /**
   * Update user's notification preferences
   */
  static async updateUserNotificationPreferences(
    userId: string,
    preferences: UserNotificationPreferences
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: userId,
          preferences,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('AstrologyContentService: Error updating preferences:', error);
        return false;
      }

      console.log('AstrologyContentService: Notification preferences updated');
      return true;
    } catch (error) {
      console.error('AstrologyContentService: Error updating preferences:', error);
      return false;
    }
  }

  /**
   * Track user activity pattern
   */
  static async trackUserActivity(userId: string): Promise<void> {
    try {
      const now = new Date();
      const hour = now.getHours();
      
      // Determine time of day
      const timeOfDay = this.getTimeOfDayFromHour(hour);
      
      // Update activity pattern
      const { error } = await supabase
        .from('user_activity_patterns')
        .upsert({
          user_id: userId,
          [`${timeOfDay}_active`]: true,
          last_active_time: now.toISOString(),
          updated_at: now.toISOString()
        });

      if (error) {
        console.error('AstrologyContentService: Error tracking activity:', error);
      }
    } catch (error) {
      console.error('AstrologyContentService: Error tracking activity:', error);
    }
  }

  /**
   * Get optimal notification time based on user activity
   */
  static async getOptimalNotificationTime(
    userId: string,
    timeOfDay: 'morning' | 'afternoon' | 'evening'
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('user_activity_patterns')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Return default time
        const defaults = { morning: '08:00', afternoon: '14:00', evening: '20:00' };
        return defaults[timeOfDay];
      }

      // Get user preferences
      const preferences = await this.getUserNotificationPreferences(userId);
      return preferences.notificationTime[timeOfDay];
    } catch (error) {
      console.error('AstrologyContentService: Error getting optimal notification time:', error);
      const defaults = { morning: '08:00', afternoon: '14:00', evening: '20:00' };
      return defaults[timeOfDay];
    }
  }

  /**
   * Get current time of day
   */
  private static getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
    const hour = new Date().getHours();
    return this.getTimeOfDayFromHour(hour);
  }

  /**
   * Get time of day from hour
   */
  private static getTimeOfDayFromHour(hour: number): 'morning' | 'afternoon' | 'evening' {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  }

  /**
   * Schedule daily quotes for all active users
   */
  static async scheduleDailyQuotesForAllUsers(): Promise<void> {
    try {
      console.log('AstrologyContentService: Scheduling daily quotes for all users');

      // Get all active users
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id')
        .not('birth_date', 'is', null);

      if (error || !users) {
        console.error('AstrologyContentService: Error fetching users:', error);
        return;
      }

      // Generate quotes for each user
      for (const user of users) {
        await this.generateDailyQuoteForUser(user.id);
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('AstrologyContentService: Daily quotes scheduled for all users');
    } catch (error) {
      console.error('AstrologyContentService: Error scheduling daily quotes:', error);
    }
  }
}
