import { supabase } from '../../lib/supabase';

export interface AstrologyDescription {
  id: string;
  astrology_system: 'western' | 'chinese' | 'vedic';
  sign_name: string;
  description: string;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export class AstrologyDescriptionService {
  /**
   * Get cached description for a sign
   */
  static async getCachedDescription(
    astrologySystem: 'western' | 'chinese' | 'vedic',
    signName: string
  ): Promise<string | null> {
    try {
      console.log(`🔍 Looking for cached description: ${astrologySystem} - ${signName}`);
      
      const { data, error } = await supabase
        .from('astrology_descriptions')
        .select('description')
        .eq('astrology_system', astrologySystem)
        .eq('sign_name', signName)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found - this is expected for new signs
          console.log(`📝 No cached description found for ${astrologySystem} - ${signName}`);
          return null;
        }
        console.error('Error fetching cached description:', error);
        return null;
      }

      console.log(`✅ Found cached description for ${astrologySystem} - ${signName}`);
      return data.description;
    } catch (error) {
      console.error('Error in getCachedDescription:', error);
      return null;
    }
  }

  /**
   * Save description to cache
   */
  static async saveDescription(
    astrologySystem: 'western' | 'chinese' | 'vedic',
    signName: string,
    description: string
  ): Promise<boolean> {
    try {
      console.log(`💾 Saving description for ${astrologySystem} - ${signName}`);
      
      // Count words in description
      const wordCount = description.trim().split(/\s+/).length;
      
      const { error } = await supabase
        .from('astrology_descriptions')
        .upsert({
          astrology_system: astrologySystem,
          sign_name: signName,
          description: description,
          word_count: wordCount,
        }, {
          onConflict: 'astrology_system,sign_name'
        });

      if (error) {
        console.error('Error saving description:', error);
        return false;
      }

      console.log(`✅ Description saved for ${astrologySystem} - ${signName} (${wordCount} words)`);
      return true;
    } catch (error) {
      console.error('Error in saveDescription:', error);
      return false;
    }
  }

  /**
   * Get all cached descriptions for a system
   */
  static async getAllDescriptions(
    astrologySystem: 'western' | 'chinese' | 'vedic'
  ): Promise<AstrologyDescription[]> {
    try {
      const { data, error } = await supabase
        .from('astrology_descriptions')
        .select('*')
        .eq('astrology_system', astrologySystem)
        .order('sign_name');

      if (error) {
        console.error('Error fetching all descriptions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllDescriptions:', error);
      return [];
    }
  }

  /**
   * Check if description exists in cache
   */
  static async hasDescription(
    astrologySystem: 'western' | 'chinese' | 'vedic',
    signName: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('astrology_descriptions')
        .select('id')
        .eq('astrology_system', astrologySystem)
        .eq('sign_name', signName)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return false; // No rows found
        }
        console.error('Error checking description existence:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in hasDescription:', error);
      return false;
    }
  }

  /**
   * Get description with fallback to Gemini (if needed)
   */
  static async getDescription(
    astrologySystem: 'western' | 'chinese' | 'vedic',
    signName: string,
    fallbackGenerator?: () => Promise<string>
  ): Promise<string> {
    try {
      // First, try to get from cache
      const cachedDescription = await this.getCachedDescription(astrologySystem, signName);
      
      if (cachedDescription) {
        return cachedDescription;
      }

      // If no cached description and fallback generator provided, use it
      if (fallbackGenerator) {
        console.log(`🔄 Generating new description for ${astrologySystem} - ${signName}`);
        const newDescription = await fallbackGenerator();
        
        // Save to cache for future use
        await this.saveDescription(astrologySystem, signName, newDescription);
        
        return newDescription;
      }

      // Fallback to basic description if no generator provided
      return this.getBasicDescription(astrologySystem, signName);
    } catch (error) {
      console.error('Error in getDescription:', error);
      return this.getBasicDescription(astrologySystem, signName);
    }
  }

  /**
   * Get basic fallback description (75 words max) - PUBLIC METHOD
   */
  static getBasicDescription(
    astrologySystem: 'western' | 'chinese' | 'vedic',
    signName: string
  ): string {
    const basicDescriptions: Record<string, Record<string, string>> = {
      western: {
        Aries: 'Dynamic fire sign ruled by Mars. Aries individuals are natural leaders with boundless energy and courage. They approach life with enthusiasm and determination, always ready to tackle new challenges. Their impulsive nature drives them to take action quickly, sometimes without thinking through consequences. They value independence and freedom, often preferring to lead rather than follow. Aries people are passionate, competitive, and have a strong desire to be first in everything they do.',
        Taurus: 'Grounded earth sign ruled by Venus. Taurus individuals are known for their stability, reliability, and appreciation for life\'s finer things. They have a strong connection to the physical world and enjoy comfort, beauty, and sensual pleasures. Patient and persistent, they work steadily toward their goals without rushing. They value security and consistency, often preferring familiar routines over sudden changes. Taurus people are loyal, practical, and have excellent taste in art, food, and aesthetics.',
        Gemini: 'Versatile air sign ruled by Mercury. Gemini individuals are curious, adaptable, and excellent communicators who thrive on mental stimulation. They have a natural ability to see multiple perspectives and enjoy learning about diverse topics. Their dual nature makes them both social butterflies and deep thinkers. They excel at networking, writing, and any activity requiring quick thinking. Gemini people are witty, charming, and always ready for intellectual conversation or new experiences.',
        Cancer: 'Nurturing water sign ruled by the Moon. Cancer individuals are deeply emotional, intuitive, and protective of their loved ones. They have a strong connection to family, home, and emotional security. Their caring nature makes them excellent caregivers and friends who remember every important detail. They are highly sensitive to their environment and the emotions of others. Cancer people are loyal, imaginative, and have a natural ability to create warm, welcoming spaces wherever they go.',
        Leo: 'Dramatic fire sign ruled by the Sun. Leo individuals are natural performers who love to be the center of attention. They possess great confidence, creativity, and leadership abilities that inspire others. Their generous spirit and warm heart make them beloved by many. They have a strong sense of personal pride and enjoy expressing themselves through various forms of art. Leo people are loyal, protective, and have an infectious enthusiasm that lights up any room they enter.',
        Virgo: 'Analytical earth sign ruled by Mercury. Virgo individuals are perfectionists who excel at organizing, analyzing, and improving everything around them. They have a keen eye for detail and a strong desire to be helpful and useful to others. Their practical approach to life helps them solve complex problems efficiently. They value cleanliness, order, and continuous self-improvement. Virgo people are reliable, hardworking, and have a natural ability to see what needs to be fixed or improved.',
        Libra: 'Harmonious air sign ruled by Venus. Libra individuals are natural diplomats who seek balance, beauty, and fairness in all aspects of life. They have excellent taste and a strong appreciation for art, music, and aesthetic beauty. Their charming personality and ability to see multiple sides of any situation make them excellent mediators. They value relationships and partnerships above all else. Libra people are cooperative, gracious, and have a natural ability to bring people together harmoniously.',
        Scorpio: 'Intense water sign ruled by Mars and Pluto. Scorpio individuals are passionate, mysterious, and possess incredible depth of character. They have strong intuition and the ability to see through superficial appearances to understand true motivations. Their transformative nature allows them to reinvent themselves and help others do the same. They value authenticity and deep emotional connections over casual relationships. Scorpio people are loyal, determined, and have an almost psychic ability to understand human nature.',
        Sagittarius: 'Adventurous fire sign ruled by Jupiter. Sagittarius individuals are natural explorers who seek knowledge, adventure, and meaning in life. They have an optimistic outlook and a philosophical approach to understanding the world. Their love of freedom and travel drives them to experience different cultures and perspectives. They are excellent teachers and storytellers who inspire others with their enthusiasm. Sagittarius people are honest, generous, and have an insatiable curiosity about life\'s mysteries.',
        Capricorn: 'Ambitious earth sign ruled by Saturn. Capricorn individuals are disciplined, responsible, and have a strong work ethic that helps them achieve their long-term goals. They value tradition, structure, and practical approaches to success. Their patient nature allows them to work steadily toward their ambitions without getting discouraged. They are natural leaders who earn respect through their competence and reliability. Capricorn people are loyal, practical, and have an excellent understanding of how to build lasting success.',
        Aquarius: 'Innovative air sign ruled by Uranus. Aquarius individuals are forward-thinking visionaries who value independence, originality, and humanitarian causes. They have a unique perspective on life and often see solutions that others miss. Their friendly yet detached nature allows them to connect with people from all walks of life. They are natural reformers who work to improve society and help others. Aquarius people are progressive, inventive, and have a natural ability to think outside conventional boundaries.',
        Pisces: 'Compassionate water sign ruled by Neptune. Pisces individuals are deeply intuitive, empathetic, and have a strong connection to the spiritual and artistic realms. They possess incredible imagination and creativity that allows them to see possibilities others cannot. Their sensitive nature makes them highly attuned to the emotions and needs of others. They are natural healers and artists who bring beauty and compassion to the world. Pisces people are gentle, wise, and have an almost mystical understanding of life\'s deeper meanings.'
      },
      chinese: {
        Rat: 'Clever and resourceful, Rat individuals are natural problem-solvers who excel in challenging situations. They possess sharp intelligence, quick wit, and excellent memory that helps them succeed in business and social settings. Their charming personality and adaptability make them popular among friends and colleagues. They are thrifty with money but generous with their time and energy. Rat people are ambitious, optimistic, and have a natural ability to turn obstacles into opportunities for success.',
        Ox: 'Strong and reliable, Ox individuals are known for their determination, patience, and strong work ethic. They approach life with methodical precision and rarely give up on their goals. Their honest nature and dependability make them trusted friends and colleagues. They value tradition and prefer stable, predictable environments. Ox people are loyal, practical, and have an excellent ability to build lasting foundations in both personal and professional relationships.',
        Tiger: 'Bold and courageous, Tiger individuals are natural leaders who thrive on challenge and adventure. They possess great confidence, charisma, and the ability to inspire others with their passion. Their independent spirit and competitive nature drive them to achieve extraordinary things. They are protective of their loved ones and will fight fiercely for what they believe in. Tiger people are generous, optimistic, and have a magnetic personality that draws others to them.',
        Rabbit: 'Gentle and refined, Rabbit individuals are known for their kindness, sensitivity, and excellent taste. They have a natural ability to create harmony and avoid conflict in their relationships. Their artistic nature and appreciation for beauty make them excellent companions and creative partners. They are cautious and prefer to think before acting, which often leads to wise decisions. Rabbit people are loyal, diplomatic, and have a calming presence that brings peace to any situation.',
        Dragon: 'Powerful and charismatic, Dragon individuals are natural-born leaders who inspire others with their confidence and vision. They possess great energy, creativity, and the ability to achieve remarkable success. Their bold nature and willingness to take risks often lead to extraordinary accomplishments. They are generous with their time and resources, always willing to help others succeed. Dragon people are ambitious, optimistic, and have a magnetic personality that commands respect and admiration.',
        Snake: 'Wise and intuitive, Snake individuals are known for their deep thinking, mysterious nature, and excellent judgment. They have a natural ability to understand human psychology and see through superficial appearances. Their calm demeanor and patience allow them to wait for the perfect moment to act. They are highly intelligent and often successful in business and intellectual pursuits. Snake people are loyal, determined, and have an almost psychic ability to understand what others are thinking.',
        Horse: 'Energetic and adventurous, Horse individuals are natural explorers who love freedom, travel, and new experiences. They possess great enthusiasm, optimism, and the ability to inspire others with their positive energy. Their independent spirit and love of adventure drive them to seek new challenges and opportunities. They are excellent communicators who can connect with people from all walks of life. Horse people are generous, honest, and have a natural ability to bring excitement and joy to any situation.',
        Goat: 'Creative and compassionate, Goat individuals are known for their artistic nature, gentle spirit, and strong sense of empathy. They have a natural ability to create beauty and bring comfort to others through their creative expressions. Their sensitive nature makes them highly attuned to the emotions and needs of those around them. They value harmony and prefer peaceful, supportive environments. Goat people are loyal, imaginative, and have a natural ability to heal and nurture others through their art and compassion.',
        Monkey: 'Clever and versatile, Monkey individuals are natural problem-solvers who excel at finding creative solutions to complex challenges. They possess quick wit, excellent memory, and the ability to adapt to any situation. Their playful nature and sense of humor make them popular among friends and colleagues. They are curious and always eager to learn new things. Monkey people are innovative, optimistic, and have a natural ability to turn difficult situations into opportunities for success and growth.',
        Rooster: 'Confident and organized, Rooster individuals are known for their punctuality, attention to detail, and strong sense of responsibility. They have excellent organizational skills and a natural ability to manage complex projects efficiently. Their honest nature and direct communication style make them reliable friends and colleagues. They are hardworking and take great pride in their accomplishments. Rooster people are loyal, practical, and have a natural ability to lead others through their competence and reliability.',
        Dog: 'Loyal and protective, Dog individuals are known for their faithfulness, honesty, and strong sense of justice. They have a natural ability to sense danger and protect their loved ones from harm. Their caring nature and willingness to help others make them beloved friends and family members. They are highly intuitive and can quickly assess people\'s true character. Dog people are reliable, compassionate, and have a natural ability to create safe, supportive environments for those they care about.',
        Pig: 'Generous and sincere, Pig individuals are known for their kindness, honesty, and strong work ethic. They have a natural ability to enjoy life\'s simple pleasures and appreciate the good things around them. Their generous spirit and willingness to help others make them beloved by many. They are excellent at building lasting relationships and creating comfortable, welcoming environments. Pig people are loyal, optimistic, and have a natural ability to bring joy and abundance to their relationships and communities.'
      },
      vedic: {
        Aries: 'Dynamic fire sign ruled by Mars, representing courage and leadership. Aries individuals are natural pioneers who approach life with enthusiasm and determination. They possess great energy and the ability to inspire others with their bold actions. Their impulsive nature drives them to take initiative and lead others forward. They value independence and freedom, often preferring to blaze their own trail. Aries people are passionate, competitive, and have a strong desire to be first in everything they undertake.',
        Taurus: 'Stable earth sign ruled by Venus, representing material security and sensual pleasures. Taurus individuals are known for their reliability, patience, and appreciation for life\'s comforts. They have a strong connection to the physical world and enjoy creating beautiful, comfortable environments. Their methodical approach to life helps them build lasting foundations. They value consistency and prefer familiar routines over sudden changes. Taurus people are loyal, practical, and have excellent taste in art, food, and material possessions.',
        Gemini: 'Versatile air sign ruled by Mercury, representing communication and intellectual curiosity. Gemini individuals are natural communicators who thrive on mental stimulation and variety. They have a dual nature that allows them to see multiple perspectives and adapt to different situations. Their quick wit and charm make them excellent conversationalists and networkers. They excel at learning new skills and sharing knowledge with others. Gemini people are curious, adaptable, and have a natural ability to connect with people from all walks of life.',
        Cancer: 'Nurturing water sign ruled by the Moon, representing emotions and family connections. Cancer individuals are deeply intuitive and protective of their loved ones. They have a strong connection to home, family, and emotional security. Their caring nature makes them excellent caregivers who remember every important detail about their relationships. They are highly sensitive to their environment and the emotions of others. Cancer people are loyal, imaginative, and have a natural ability to create warm, welcoming spaces for their families.',
        Leo: 'Regal fire sign ruled by the Sun, representing creativity and self-expression. Leo individuals are natural performers who love to share their talents with the world. They possess great confidence, charisma, and the ability to inspire others with their creative vision. Their generous spirit and warm heart make them beloved leaders and friends. They have a strong sense of personal pride and enjoy expressing themselves through various forms of art. Leo people are loyal, protective, and have an infectious enthusiasm that lights up any gathering.',
        Virgo: 'Analytical earth sign ruled by Mercury, representing service and attention to detail. Virgo individuals are perfectionists who excel at organizing, analyzing, and improving everything around them. They have a keen eye for detail and a strong desire to be helpful and useful to others. Their practical approach to life helps them solve complex problems efficiently. They value cleanliness, order, and continuous self-improvement. Virgo people are reliable, hardworking, and have a natural ability to see what needs to be fixed or improved in any situation.',
        Libra: 'Harmonious air sign ruled by Venus, representing balance and partnership. Libra individuals are natural diplomats who seek fairness, beauty, and harmony in all aspects of life. They have excellent taste and a strong appreciation for art, music, and aesthetic beauty. Their charming personality and ability to see multiple sides of any situation make them excellent mediators. They value relationships and partnerships above all else. Libra people are cooperative, gracious, and have a natural ability to bring people together in peaceful cooperation.',
        Scorpio: 'Intense water sign ruled by Mars, representing transformation and deep emotional connections. Scorpio individuals are passionate, mysterious, and possess incredible depth of character. They have strong intuition and the ability to see through superficial appearances to understand true motivations. Their transformative nature allows them to reinvent themselves and help others do the same. They value authenticity and deep emotional bonds over casual relationships. Scorpio people are loyal, determined, and have an almost psychic ability to understand the hidden aspects of human nature.',
        Sagittarius: 'Adventurous fire sign ruled by Jupiter, representing wisdom and higher learning. Sagittarius individuals are natural philosophers who seek knowledge, adventure, and meaning in life. They have an optimistic outlook and a broad perspective on understanding the world. Their love of freedom and travel drives them to experience different cultures and belief systems. They are excellent teachers and storytellers who inspire others with their enthusiasm for life. Sagittarius people are honest, generous, and have an insatiable curiosity about life\'s deeper mysteries.',
        Capricorn: 'Ambitious earth sign ruled by Saturn, representing discipline and long-term success. Capricorn individuals are disciplined, responsible, and have a strong work ethic that helps them achieve their ambitious goals. They value tradition, structure, and practical approaches to building lasting success. Their patient nature allows them to work steadily toward their objectives without getting discouraged. They are natural leaders who earn respect through their competence and reliability. Capricorn people are loyal, practical, and have an excellent understanding of how to build enduring foundations.',
        Aquarius: 'Innovative air sign ruled by Saturn, representing humanitarian ideals and progressive thinking. Aquarius individuals are forward-thinking visionaries who value independence, originality, and humanitarian causes. They have a unique perspective on life and often see solutions that others miss. Their friendly yet detached nature allows them to connect with people from all walks of life. They are natural reformers who work to improve society and help others. Aquarius people are progressive, inventive, and have a natural ability to think beyond conventional boundaries.',
        Pisces: 'Compassionate water sign ruled by Jupiter, representing spirituality and artistic expression. Pisces individuals are deeply intuitive, empathetic, and have a strong connection to the spiritual and artistic realms. They possess incredible imagination and creativity that allows them to see possibilities others cannot. Their sensitive nature makes them highly attuned to the emotions and needs of others. They are natural healers and artists who bring beauty and compassion to the world. Pisces people are gentle, wise, and have an almost mystical understanding of life\'s deeper spiritual meanings.'
      }
    };

    return basicDescriptions[astrologySystem]?.[signName] || `${signName} is a mysterious and unique sign with special qualities.`;
  }

  /**
   * Initialize cache with default descriptions
   */
  static async initializeCache(): Promise<void> {
    try {
      console.log('🚀 Initializing astrology descriptions cache...');
      
      // This would typically be called during app initialization
      // The SQL file already contains the initial data
      console.log('✅ Astrology descriptions cache initialized');
    } catch (error) {
      console.error('Error initializing cache:', error);
    }
  }
}
