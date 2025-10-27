export interface AstrologyQuote {
  content: string;
  category: 'life' | 'career' | 'heartbreak' | 'finances' | 'losses' | 'health' | 'motivation';
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  sign: string;
  generatedAt: string;
}

export interface SignDescription {
  sign: string;
  description: string;
  strengths: string[];
  challenges: string[];
  advice: string;
}

export class GeminiAIService {
  private static baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
  
  // Array of API keys for rotation and failover
  private static apiKeys: string[] = [];
  private static currentKeyIndex: number = 0;
  private static failedKeys: Set<number> = new Set();

  /**
   * Get API keys from environment variables
   * Supports multiple keys for rate limit handling
   */
  private static getApiKeys(): string[] {
    if (this.apiKeys.length === 0) {
      // Get primary API key
      const primaryKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (primaryKey) {
        this.apiKeys.push(primaryKey);
      }

      // Get additional API keys (API_KEY_2, API_KEY_3, etc.)
      for (let i = 2; i <= 10; i++) {
        const key = process.env[`EXPO_PUBLIC_GEMINI_API_KEY_${i}`];
        if (key) {
          this.apiKeys.push(key);
        }
      }

      if (this.apiKeys.length === 0) {
        throw new Error('No Gemini API keys found. Please set EXPO_PUBLIC_GEMINI_API_KEY or EXPO_PUBLIC_GEMINI_API_KEY_2, etc. in your .env file.');
      }

      console.log(`GeminiAIService: Loaded ${this.apiKeys.length} API keys`);
    }

    return this.apiKeys;
  }

  /**
   * Get current API key with rotation
   */
  private static getApiKey(): string {
    const keys = this.getApiKeys();
    return keys[this.currentKeyIndex];
  }

  /**
   * Switch to next API key when rate limited or failed
   */
  private static rotateApiKey(): void {
    const keys = this.getApiKeys();
    
    // Mark current key as failed
    this.failedKeys.add(this.currentKeyIndex);
    
    // Find next available key
    const startIndex = this.currentKeyIndex;
    let attempts = 0;
    
    do {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % keys.length;
      attempts++;
      
      if (attempts > keys.length) {
        // All keys have been used, reset failed keys and try again
        console.warn('GeminiAIService: All API keys have failed, resetting failed keys');
        this.failedKeys.clear();
      }
    } while (this.failedKeys.has(this.currentKeyIndex) && attempts < keys.length * 2);
    
    console.log(`GeminiAIService: Rotated to API key ${this.currentKeyIndex + 1} of ${keys.length}`);
  }

  /**
   * Check if we should retry with a different key
   */
  private static isRetryableError(statusCode: number): boolean {
    // Rate limit (429) or quota exceeded errors
    return statusCode === 429 || statusCode === 503;
  }

  /**
   * Generate daily astrology quote based on sign and time of day
   */
  static async generateDailyQuote(
    sign: string,
    timeOfDay: 'morning' | 'afternoon' | 'evening',
    category: 'life' | 'career' | 'heartbreak' | 'finances' | 'losses' | 'health' | 'motivation'
  ): Promise<AstrologyQuote> {
    try {
      console.log('GeminiAIService: Generating daily quote for', { sign, timeOfDay, category });

      const prompt = this.buildQuotePrompt(sign, timeOfDay, category);
      const response = await this.callGeminiAPI(prompt);
      
      const quote: AstrologyQuote = {
        content: response.trim(),
        category,
        timeOfDay,
        sign,
        generatedAt: new Date().toISOString()
      };

      console.log('GeminiAIService: Generated quote:', quote);
      return quote;
    } catch (error) {
      console.error('GeminiAIService: Error generating quote:', error);
      throw new Error('Failed to generate astrology quote');
    }
  }

  /**
   * Generate personalized sign description based on astrology system
   */
  static async generateSignDescription(sign: string, astrologySystem: 'western' | 'chinese' | 'vedic'): Promise<SignDescription> {
    try {
      console.log('GeminiAIService: Generating sign description for', { sign, astrologySystem });

      const prompt = this.buildSignDescriptionPrompt(sign, astrologySystem);
      const response = await this.callGeminiAPI(prompt);
      
      // Parse the response into structured data
      const description = this.parseSignDescription(response, sign);
      
      console.log('GeminiAIService: Generated sign description:', description);
      return description;
    } catch (error) {
      console.error('GeminiAIService: Error generating sign description:', error);
      throw new Error('Failed to generate sign description');
    }
  }

  /**
   * Build prompt for daily quote generation
   */
  private static buildQuotePrompt(
    sign: string,
    timeOfDay: string,
    category: string
  ): string {
    const timeContext = {
      morning: 'energizing and motivational',
      afternoon: 'practical and career-focused',
      evening: 'reflective and healing'
    };

    const categoryContext = {
      life: 'life guidance and personal growth',
      career: 'professional development and success',
      heartbreak: 'healing from relationships and emotional wounds',
      finances: 'money management and abundance',
      losses: 'coping with loss and moving forward',
      health: 'physical and mental wellness',
      motivation: 'inspiration and drive'
    };

    return `Generate a short, concise astrology quote for a ${sign} person. Keep it EXACTLY 50 words or less.

Context: ${timeOfDay} timing, focusing on ${category}

Rules:
1. Count each word - the quote must be 50 words or fewer
2. Write in a personal tone using "you" and "your"
3. Include ${sign}-specific astrological insights
4. Keep it inspiring and empowering
5. End with a call to action

Write ONLY the quote text, no explanations or extra text.`;
  }

  /**
   * Build prompt for sign description generation based on astrology system
   */
  private static buildSignDescriptionPrompt(sign: string, astrologySystem: 'western' | 'chinese' | 'vedic'): string {
    const systemContexts = {
      western: {
        title: 'Western Zodiac',
        background: 'Western astrology is based on the 12 zodiac signs derived from Greek and Babylonian traditions. It focuses on personality traits, behavioral patterns, and psychological characteristics.',
        elements: 'Each sign belongs to one of four elements (Fire, Earth, Air, Water) and three modalities (Cardinal, Fixed, Mutable).',
        focus: 'Focus on personality psychology, behavioral patterns, and modern life applications.'
      },
      chinese: {
        title: 'Chinese Zodiac',
        background: 'Chinese astrology is based on the 12-year cycle of animals, deeply rooted in Chinese philosophy, Confucianism, and Taoism. It emphasizes harmony, balance, and the five elements.',
        elements: 'Each sign is associated with one of five elements (Wood, Fire, Earth, Metal, Water) and yin/yang principles.',
        focus: 'Focus on character traits, social relationships, career compatibility, and traditional Chinese values.'
      },
      vedic: {
        title: 'Vedic Astrology',
        background: 'Vedic astrology (Jyotish) is the traditional Hindu system of astrology, deeply connected to Hindu philosophy, karma, and spiritual development. It uses sidereal zodiac and emphasizes spiritual growth.',
        elements: 'Each sign is associated with specific deities, planets, and spiritual qualities that influence life purpose and spiritual evolution.',
        focus: 'Focus on spiritual development, life purpose, karma, dharma, and the soul\'s journey through lifetimes.'
      }
    };

    const context = systemContexts[astrologySystem];

    return `You are an expert ${context.title} astrologer with deep knowledge of ${context.background} ${context.elements}

Create a comprehensive, culturally authentic description for a ${sign} in the ${context.title} system.

Requirements:
- Exactly 100 words for the main description
- Include 3 key strengths specific to ${sign} in ${context.title}
- Include 2 main challenges or growth areas for ${sign}
- Include 1 piece of practical advice rooted in ${context.title} wisdom
- Make it inspiring and motivational while staying culturally authentic
- Use "you" and "your" to make it personal
- ${context.focus}
- Include specific ${context.title} insights and characteristics
- Avoid generic personality descriptions - be specific to this astrology system

Format your response as JSON:
{
  "description": "100-word personalized description rooted in ${context.title} tradition",
  "strengths": ["strength1 specific to ${sign} in ${context.title}", "strength2", "strength3"],
  "challenges": ["challenge1 specific to ${sign} in ${context.title}", "challenge2"],
  "advice": "practical advice based on ${context.title} wisdom for ${sign}"
}`;
  }

  /**
   * Call Gemini API with automatic retry and key rotation
   */
  private static async callGeminiAPI(prompt: string, maxRetries: number = 3): Promise<string> {
    const keys = this.getApiKeys();
    let lastError: Error | null = null;
    let startKeyIndex = this.currentKeyIndex;

    for (let attempt = 0; attempt < maxRetries * keys.length; attempt++) {
      try {
        const apiKey = this.getApiKey();
        console.log(`GeminiAIService: Attempt ${attempt + 1} with API key ${this.currentKeyIndex + 1} of ${keys.length}`);

        const response = await fetch(`${this.baseUrl}?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        });

        if (!response.ok) {
          const error = await response.text();
          console.error(`GeminiAIService: API error (status ${response.status}):`, error);

          // If rate limited, try next key
          if (this.isRetryableError(response.status)) {
            console.log(`GeminiAIService: Rate limited on key ${this.currentKeyIndex + 1}, rotating to next key`);
            this.rotateApiKey();
            
            // Add small delay before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }

          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          throw new Error('Invalid response from Gemini API');
        }

        // Success - reset failed keys on successful response
        if (this.failedKeys.size > 0 && startKeyIndex !== this.currentKeyIndex) {
          console.log('GeminiAIService: Successfully recovered from failed key');
          this.failedKeys.clear();
        }

        return data.candidates[0].content.parts[0].text;

      } catch (error) {
        lastError = error as Error;
        console.error(`GeminiAIService: Attempt ${attempt + 1} failed:`, error);

        // On error, try next key
        if (attempt < maxRetries * keys.length - 1) {
          console.log(`GeminiAIService: Rotating to next API key`);
          this.rotateApiKey();
          
          // Small delay before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // All retries failed
    throw new Error(`Gemini API failed after ${maxRetries * keys.length} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Parse sign description response
   */
  private static parseSignDescription(response: string, sign: string): SignDescription {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      return {
        sign,
        description: parsed.description || '',
        strengths: parsed.strengths || [],
        challenges: parsed.challenges || [],
        advice: parsed.advice || ''
      };
    } catch (error) {
      // Fallback to default description if JSON parsing fails
      console.warn('GeminiAIService: Failed to parse JSON response, using fallback');
      return {
        sign,
        description: `As a ${sign}, you possess unique cosmic energy that shapes your personality and life path. Your astrological sign influences your approach to relationships, career, and personal growth.`,
        strengths: ['Natural intuition', 'Strong determination', 'Creative expression'],
        challenges: ['Perfectionism', 'Emotional intensity'],
        advice: 'Trust your instincts and embrace your authentic self.'
      };
    }
  }

  /**
   * Get random category for daily quote
   */
  static getRandomCategory(): 'life' | 'career' | 'heartbreak' | 'finances' | 'losses' | 'health' | 'motivation' {
    const categories = ['life', 'career', 'heartbreak', 'finances', 'losses', 'health', 'motivation'];
    return categories[Math.floor(Math.random() * categories.length)] as any;
  }

  /**
   * Check if service is properly configured
   */
  static isConfigured(): boolean {
    try {
      const keys = this.getApiKeys();
      return keys.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get API key statistics for debugging
   */
  static getApiKeyStats(): { total: number; current: number; failed: number } {
    return {
      total: this.apiKeys.length,
      current: this.currentKeyIndex,
      failed: this.failedKeys.size
    };
  }
}
