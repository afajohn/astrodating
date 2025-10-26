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

  /**
   * Get API key from environment variables
   */
  private static getApiKey(): string {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found in environment variables. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.');
    }
    return apiKey;
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

    return `You are an expert astrologer and motivational writer. Generate a ${timeContext[timeOfDay as keyof typeof timeContext]} astrology quote for a ${sign} person focusing on ${categoryContext[category as keyof typeof categoryContext]}.

Requirements:
- Exactly 150-200 words
- Personalized for ${sign} zodiac sign
- Appropriate for ${timeOfDay} timing
- Focus on ${category} theme
- Inspiring and motivational tone
- Include specific astrological insights
- Use "you" and "your" to make it personal
- End with an empowering call to action

Format: Write only the quote content, no additional text or formatting.`;
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
   * Call Gemini API
   */
  private static async callGeminiAPI(prompt: string): Promise<string> {
    const apiKey = this.getApiKey();

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
      console.error('GeminiAIService: API error:', error);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
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
      this.getApiKey();
      return true;
    } catch (error) {
      return false;
    }
  }
}
