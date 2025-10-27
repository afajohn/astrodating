import { supabase } from '../../lib/supabase';
import { AstrologyService } from './AstrologyService';
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
  // System user ID for shared quotes (date-based quotes visible to all users)
  private static readonly SHARED_USER_ID = '00000000-0000-0000-0000-000000000000';

  /**
   * Generate and store daily quote for a user (Western system)
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
   * Generate daily quotes for all three astrology systems
   * Based on today's date's astrology sign, NOT user-specific
   */
  static async generateAllSystemDailyQuotes(userId: string): Promise<{
    western: AstrologyQuote | null;
    chinese: AstrologyQuote | null;
    vedic: AstrologyQuote | null;
  }> {
    try {
      console.log('AstrologyContentService: Generating quotes for all systems');

      // Get TODAY'S astrology signs (based on current date, not user's birth date)
      const todayDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const todayAstrology = AstrologyService.getAstrologyProfile(todayDate);
      
      console.log('AstrologyContentService: Today\'s astrology signs:', todayAstrology);

      const timeOfDay = this.getCurrentTimeOfDay();
      const category = GeminiAIService.getRandomCategory();

      // Generate quotes for all three systems based on TODAY'S signs
      const [westernQuote, chineseQuote, vedicQuote] = await Promise.all([
        GeminiAIService.generateDailyQuote(todayAstrology.westernSign, timeOfDay, category).catch(() => {
          console.error('Failed to generate Western quote');
          return null;
        }),
        GeminiAIService.generateDailyQuote(todayAstrology.chineseSign, timeOfDay, category).catch(() => {
          console.error('Failed to generate Chinese quote');
          return null;
        }),
        GeminiAIService.generateDailyQuote(todayAstrology.vedicSign, timeOfDay, category).catch(() => {
          console.error('Failed to generate Vedic quote');
          return null;
        }),
      ]);

      console.log('AstrologyContentService: Generated quotes:', {
        western: !!westernQuote,
        chinese: !!chineseQuote,
        vedic: !!vedicQuote
      });

      // Store quotes in database - shared for all users based on date
      const today = new Date().toISOString().split('T')[0];
      console.log('AstrologyContentService: Today date:', today);
      
      // Store all three quotes
      const quotesToStore = [
        westernQuote && {
          user_id: userId,
          content: westernQuote.content,
          category: westernQuote.category,
          time_of_day: westernQuote.timeOfDay,
          sign: westernQuote.sign,
          generated_at: westernQuote.generatedAt
        },
        chineseQuote && {
          user_id: userId,
          content: chineseQuote.content,
          category: chineseQuote.category,
          time_of_day: chineseQuote.timeOfDay,
          sign: chineseQuote.sign,
          generated_at: chineseQuote.generatedAt
        },
        vedicQuote && {
          user_id: userId,
          content: vedicQuote.content,
          category: vedicQuote.category,
          time_of_day: vedicQuote.timeOfDay,
          sign: vedicQuote.sign,
          generated_at: vedicQuote.generatedAt
        }
      ].filter(Boolean);

      console.log('AstrologyContentService: Storing quotes...');
      console.log('User ID being used:', userId);
      console.log('Quotes to store:', JSON.stringify(quotesToStore, null, 2));

      if (quotesToStore.length > 0) {
        // Delete existing quotes for this user (to avoid duplicates)
        console.log('Deleting existing quotes for user:', userId);
        const { error: deleteError } = await supabase
          .from('astrology_quotes')
          .delete()
          .eq('user_id', userId);

        if (deleteError) {
          console.error('Error deleting existing quotes:', deleteError);
        } else {
          console.log('✅ Successfully deleted existing quotes');
        }

        // Insert all quotes
        console.log('Inserting quotes into database...');
        const { error: insertError, data: insertData } = await supabase
          .from('astrology_quotes')
          .insert(quotesToStore);

        if (insertError) {
          console.error('❌ Error storing quotes:', insertError);
          console.error('Error details:', {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint
          });
          console.error('Failed quote data:', JSON.stringify(quotesToStore, null, 2));
        } else {
          console.log(`✅ Successfully stored ${quotesToStore.length} quotes`);
          console.log('Inserted data:', insertData);
        }
      } else {
        console.log('⚠️ No quotes to store');
      }

      console.log('AstrologyContentService: All system quotes generated');
      return {
        western: westernQuote,
        chinese: chineseQuote,
        vedic: vedicQuote
      };
    } catch (error) {
      console.error('AstrologyContentService: Error generating all system quotes:', error);
      return { western: null, chinese: null, vedic: null };
    }
  }

  /**
   * Get today's quotes from all systems
   * Quotes are now date-based and shared across all users
   */
  static async getTodayQuotes(userId?: string): Promise<{
    western: AstrologyQuote | null;
    chinese: AstrologyQuote | null;
    vedic: AstrologyQuote | null;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];

      console.log('AstrologyContentService: Fetching quotes for date:', today, 'userId:', userId);

      // Fetch quotes for the current user (RLS requires user_id match)
      let query = supabase.from('astrology_quotes').select('*');
      
      // Only filter by user_id if provided
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data: quotes, error } = await query;
      
      console.log('AstrologyContentService: Raw quotes from DB:', JSON.stringify(quotes, null, 2));
      console.log('AstrologyContentService: Number of quotes found:', quotes?.length || 0);
      
      const filteredQuotes = quotes; // Quotes are already filtered by RLS

      if (error) {
        console.error('AstrologyContentService: Error fetching quotes:', error);
        return { western: null, chinese: null, vedic: null };
      }

      console.log('AstrologyContentService: Found quotes:', filteredQuotes?.length || 0);

      // Organize quotes (they should all be recent since we delete old ones)
      // Return all available quotes
      const westernQuote = filteredQuotes && filteredQuotes.length > 0 ? filteredQuotes[0] : null;
      const chineseQuote = filteredQuotes && filteredQuotes.length > 1 ? filteredQuotes[1] : null;
      const vedicQuote = filteredQuotes && filteredQuotes.length > 2 ? filteredQuotes[2] : null;

      console.log('Quotes found - western:', !!westernQuote, 'chinese:', !!chineseQuote, 'vedic:', !!vedicQuote);

      console.log('AstrologyContentService: Organized quotes - western:', !!westernQuote, 'chinese:', !!chineseQuote, 'vedic:', !!vedicQuote);

      return {
        western: westernQuote ? {
          content: westernQuote.content || '',
          category: westernQuote.category || 'life',
          timeOfDay: westernQuote.time_of_day || 'morning',
          sign: westernQuote.sign || '',
          generatedAt: westernQuote.generated_at || new Date().toISOString()
        } : null,
        chinese: chineseQuote ? {
          content: chineseQuote.content || '',
          category: chineseQuote.category || 'life',
          timeOfDay: chineseQuote.time_of_day || 'morning',
          sign: chineseQuote.sign || '',
          generatedAt: chineseQuote.generated_at || new Date().toISOString()
        } : null,
        vedic: vedicQuote ? {
          content: vedicQuote.content || '',
          category: vedicQuote.category || 'life',
          timeOfDay: vedicQuote.time_of_day || 'morning',
          sign: vedicQuote.sign || '',
          generatedAt: vedicQuote.generated_at || new Date().toISOString()
        } : null
      };
    } catch (error) {
      console.error('AstrologyContentService: Error getting today quotes:', error);
      return { western: null, chinese: null, vedic: null };
    }
  }

  /**
   * Generate personalized sign description based on astrology system
   */
  static async generateSignDescription(sign: string, astrologySystem: 'western' | 'chinese' | 'vedic'): Promise<SignDescription | null> {
    try {
      console.log('AstrologyContentService: Generating sign description for:', { sign, astrologySystem });

      // First, check the astrology_descriptions table (where pre-populated data lives)
      const { data: cached, error: cacheError } = await supabase
        .from('astrology_descriptions')
        .select('description')
        .eq('astrology_system', astrologySystem)
        .eq('sign_name', sign)
        .single();

      if (cached && !cacheError && cached.description) {
        console.log('AstrologyContentService: Using cached description from astrology_descriptions table');
        
        // Try to parse structured data from the cached description
        const descriptionParts = cached.description.split('\n\n');
        
        // Check if this is a structured description (contains "Strengths:" or "Challenges:")
        const hasStructure = cached.description.includes('Strengths:') || cached.description.includes('Challenges:');
        
        if (hasStructure) {
          return {
            sign: sign,
            description: descriptionParts[0] || cached.description,
            strengths: this.extractListItems(cached.description, 'Strengths:') || [],
            challenges: this.extractListItems(cached.description, 'Challenges:') || [],
            advice: this.extractAdvice(cached.description) || ''
          };
        } else {
          // Simple description format - return as-is
          return {
            sign: sign,
            description: cached.description,
            strengths: [],
            challenges: [],
            advice: ''
          };
        }
      }

      // Generate new description using Gemini AI if not cached
      const description = await GeminiAIService.generateSignDescription(sign, astrologySystem);

      // Store in both tables for consistency
      // Store in astrology_descriptions table (used by cache)
      const combinedDescription = `${description.description}\n\nStrengths:\n${description.strengths.map(s => `• ${s}`).join('\n')}\n\nChallenges:\n${description.challenges.map(c => `• ${c}`).join('\n')}\n\nAdvice: ${description.advice}`;
      
      const { error: storeError } = await supabase
        .from('astrology_descriptions')
        .upsert({
          astrology_system: astrologySystem,
          sign_name: sign,
          description: combinedDescription,
          word_count: combinedDescription.split(/\s+/).length
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
   * Extract list items from a structured description
   */
  private static extractListItems(text: string, sectionName: string): string[] {
    const startIndex = text.indexOf(sectionName);
    if (startIndex === -1) return [];
    
    const section = text.substring(startIndex + sectionName.length);
    const nextSection = section.match(/\n\n\w+:/)?.[0];
    const endIndex = nextSection ? section.indexOf(nextSection) : section.length;
    const content = section.substring(0, endIndex);
    
    return content
      .split('\n')
      .map(line => line.replace(/^[•\-]\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  /**
   * Extract advice from a structured description
   */
  private static extractAdvice(text: string): string {
    const adviceMatch = text.match(/Advice:\s*(.+?)(?=\n\n|$)/s);
    return adviceMatch ? adviceMatch[1].trim() : '';
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
