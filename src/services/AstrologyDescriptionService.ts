import { supabase } from '../../lib/supabase';
import { CafeAstrologyContentService } from './CafeAstrologyContentService';

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
   * Get description with fallback system: Comprehensive Content → Cache → Gemini → Basic
   */
  static async getDescription(
    astrologySystem: 'western' | 'chinese' | 'vedic',
    signName: string,
    fallbackGenerator?: () => Promise<string>
  ): Promise<string> {
    try {
      // Priority 1: Use comprehensive astrology content (for Western signs only)
      if (astrologySystem === 'western' && CafeAstrologyContentService.hasContent(signName)) {
        console.log(`📚 Using comprehensive astrology content for ${signName}`);
        const content = CafeAstrologyContentService.getSignContent(signName);
        const description = content.overview;
        
        // Save to cache for future fast access
        if (description) {
          await this.saveDescription(astrologySystem, signName, description);
        }
        
        return description;
      }

      // Priority 2: Try to get from cache
      const cachedDescription = await this.getCachedDescription(astrologySystem, signName);
      
      if (cachedDescription) {
        return cachedDescription;
      }

      // Priority 3: If no cached description and fallback generator provided, use it (Gemini)
      if (fallbackGenerator) {
        console.log(`🔄 Generating new description via Gemini for ${astrologySystem} - ${signName}`);
        const newDescription = await fallbackGenerator();
        
        // Save to cache for future use
        await this.saveDescription(astrologySystem, signName, newDescription);
        
        return newDescription;
      }

      // Priority 4: Fallback to basic description if no generator provided
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
        Rat: 'The Rat (鼠) embodies Water-Yang energy in the Chinese zodiac. You are intelligent, charming, and strategically ambitious. Your Water element makes you intuitive and adaptable, while Yang nature gives you dynamic initiative. Rats excel in business and politics through cleverness and resourcefulness. Your triad partners (Dragon, Monkey) create powerful alliances. Traditional Chinese wisdom sees Rats succeeding through thrift, bold strategy, and respect for hierarchy. Your lucky colors are blue and black, and you naturally accumulate wealth through patience.',
        Ox: 'The Ox (牛) embodies Earth-Yin energy in the Chinese zodiac. You represent strength, reliability, and methodical determination. Your Earth element grounds you with patience and practical wisdom. Ox individuals build lasting foundations through hard work and traditional values. Your triad partners (Snake, Rooster) form stable alliances. Traditional Chinese society admires Ox people for dependability in agriculture, business, and family leadership. Your lucky colors are yellow and earth tones. You prosper through steady accumulation rather than risk.',
        Tiger: 'The Tiger (虎) embodies Wood-Yang energy in Chinese zodiac. You are courageous, charismatic, and a natural leader with pioneering spirit. Your Wood element gives you growth and vision, while Yang drives bold action. Tigers excel in competitive fields like military and athletics. Your triad partners (Horse, Dog) share your adventurous spirit. Traditional Chinese wisdom sees Tigers achieving through bold moves and calculated risks. Your lucky colors are blue, gray, and green.',
        Rabbit: 'The Rabbit (兔) embodies Wood-Yin energy in Chinese zodiac. You represent gentleness, refinement, and artistic sensibility. Your Wood element gives creative growth while Yin creates harmony and diplomacy. Rabbits excel in arts and creating beauty. Your triad partners (Goat, Pig) share appreciation for harmony. Traditional Chinese society values Rabbits for avoiding conflict and maintaining social harmony. Your lucky colors are light green, pink, and cream.',
        Dragon: 'The Dragon (龍) embodies Earth-Yang energy, the most auspicious Chinese zodiac sign. You embody power, charisma, and magnetic leadership. Your Earth element provides stability while Yang drives bold action. Dragons naturally attract success through confidence and inspiration. Your triad partners (Rat, Monkey) form powerful alliances. Traditional Chinese wisdom holds Dragons as imperial, commanding respect. Your lucky colors are gold, yellow, and red.',
        Snake: 'The Snake (蛇) embodies Fire-Yin energy in Chinese zodiac. You represent wisdom, intuition, and mysterious depth. Your Fire provides passion and transformation while Yin creates introspection. Snakes excel through patience and strategic timing. Your triad partners (Ox, Rooster) share methodical approaches to success. Traditional Chinese wisdom sees Snakes succeeding in business and philosophy through deep thinking. Your lucky colors are red, black, and dark blue.',
        Horse: 'The Horse (馬) embodies Fire-Yang energy in Chinese zodiac. You embody freedom, adventure, and dynamic energy. Your Fire provides passion and enthusiasm while Yang drives independence. Horses excel in fields requiring travel and communication. Your triad partners (Tiger, Dog) share your adventurous spirit. Traditional Chinese society values Horses for bringing excitement and positive energy. Your lucky colors are yellow, red, and brown.',
        Goat: 'The Goat (羊) embodies Earth-Yin energy in Chinese zodiac. You represent creativity, compassion, and peaceful nature. Your Earth grounds you with practicality while Yin makes you artistic and empathetic. Goats excel in creative arts and healing. Your triad partners (Rabbit, Pig) share your gentle artistic nature. Traditional Chinese wisdom values Goats for bringing beauty and emotional healing. Your lucky colors are earth tones and pastels.',
        Monkey: 'The Monkey (猴) embodies Metal-Yang energy in Chinese zodiac. You represent cleverness, versatility, and playful intelligence. Your Metal provides precision and communication while Yang drives curiosity. Monkeys excel through problem-solving and innovation. Your triad partners (Rat, Dragon) form highly intelligent alliances. Traditional Chinese wisdom sees Monkeys succeeding in technology through quick thinking. Your lucky colors are white, gold, and blue.',
        Rooster: 'The Rooster (雞) embodies Metal-Yin energy in Chinese zodiac. You represent confidence, organization, and attention to detail. Your Metal provides precision and discipline while Yin makes you practical. Roosters excel through planning and punctuality. Your triad partners (Ox, Snake) share methodical approaches. Traditional Chinese society values Roosters for reliability and bringing order. Your lucky colors are white, gold, and silver.',
        Dog: 'The Dog (狗) embodies Earth-Yang energy in Chinese zodiac. You embody loyalty, justice, and protective instinct. Your Earth grounds you with reliability while Yang drives protective nature. Dogs excel through loyalty and integrity. Your triad partners (Tiger, Horse) share honesty and sense of justice. Traditional Chinese wisdom values Dogs for faithfulness and creating safe environments. Your lucky colors are earth tones, red, and blue.',
        Pig: 'The Pig (豬) embodies Water-Yin energy in Chinese zodiac. You represent generosity, sincerity, and enjoyment of life pleasures. Your Water provides emotional depth while Yin creates gentleness and peace-loving nature. Pigs excel through genuine kindness and ability to create joy. Your triad partners (Rabbit, Goat) share gentle artistic nature. Traditional Chinese society values Pigs for generosity and honest simplicity. Your lucky colors are blue, gray, and yellow.'
      },
      vedic: {
        Aries: 'Mesha (मेष), the first Rashi, ruled by Mars (Mangala). You embody Raja-guna and Pitta dosha, representing pure initiative energy in sidereal astrology. Your dharma is to initiate and lead through righteous action (Karma yoga). Your nakshatras are Ashwini (healing initiation), Bharani (transformation), and Krittika (cutting clarity). In Sanatana Dharma, Mars represents the warrior caste (Kshatriya). You incarnate to learn patience by serving others rather than forcing your will. Ayurvedically, you are Pitta dominant, benefiting from cooling foods and meditation to prevent inflammation.',
        Taurus: 'Vrishabha (वृषभ), ruled by Venus (Shukra), the second Rashi. You embody Tama-guna and Kapha dosha, representing material security and sensual appreciation. Your Venus connection gives artistic ability, love of beauty, and steady resource accumulation. Your nakshatras are Krittika (discernment), Rohini (ascending), and Mrigashira (beauty). In Sanatana Dharma, Venus teaches that security comes from within through healthy connections. Your spiritual path is Bhakti yoga—devotion and appreciation for life blessings rather than possessiveness.',
        Gemini: 'Mithuna (मिथुन), the third Rashi, ruled by Mercury (Budha). You embody Raja-guna and Vata-Pitta dosha, representing communication and curiosity. Mercury gives you networking ability, quick learning, and gift of gab. Your nakshatras are Mrigashira (searching), Ardra (moist), and Punarvasu (returning). In Sanatana Dharma, Mercury teaches that knowledge must be shared to serve others. Your dharma is bridging ideas and people through your dual nature. Ayurvedically, you benefit from grounding routines and cooling activities to balance restless mental energy.',
        Cancer: 'Karka (कर्क), the fourth Rashi, ruled by Moon (Chandra). You embody Sattva-guna and Kapha dosha, representing emotions and deep nurturing. The Moon makes you highly intuitive and protective. Your nakshatras are Pushya (nourishing), Ashlesha (entwining), and Magha (glorious). In Sanatana Dharma, the Moon represents the mind, teaching you to provide security while maintaining emotional stability. Your dharma is protecting family and creating sacred spaces. Ayurvedically, you benefit from warming spices and emotional release practices.',
        Leo: 'Simha (सिंह), the fifth Rashi, ruled by Sun (Surya). You embody Raja-guna and Pitta dosha, representing creativity and royal confidence. The Sun makes you naturally radiant and inspiring. Your nakshatras are Magha (glorious), Purva Phalguni (first fruit), and Uttara Phalguni (later fruit). In Sanatana Dharma, the Sun represents the soul, teaching you to shine authentically for your dharma rather than ego. Your spiritual path involves recognizing that the Sun shines for all—your gifts are meant to illuminate others paths.',
        Virgo: 'Kanya (कन्या), the sixth Rashi, ruled by Mercury (Budha). You embody Tama-guna and Vata-Pitta, representing service and analysis. Your analytical nature drives you to perfect, heal, and organize. Your nakshatras are Uttara Phalguni (bearing), Hasta (hand), and Chitra (bright). In Sanatana Dharma, Mercury in Virgo represents healing service (seva), teaching that perfection comes through self-improvement serving others. Your dharma is healing through practical service. Ayurvedically, you benefit from grounding and digestive support.',
        Libra: 'Tula (तुला), the seventh Rashi, ruled by Venus (Shukra). You embody Sattva-guna and Vata-Pitta, representing partnership and fairness. Venus gives you aesthetic sense, diplomacy, and desire for balanced relationships. Your nakshatras are Chitra (bright), Swati (independent), and Vishakha (dual purpose). In Sanatana Dharma, Venus teaches that true balance comes from within. Your dharma is creating harmony and justice. Your spiritual path involves understanding that balance comes from inner peace rather than external circumstances.',
        Scorpio: 'Vrishchika (वृश्चिक), the eighth Rashi, ruled by Mars (Mangala). You embody Tama-guna and Pitta, representing transformation and regeneration. Mars gives you willpower, psychological depth, and transformative ability. Your nakshatras are Vishakha (dual purpose), Anuradha (following), and Jyestha (eldest). In Sanatana Dharma, Mars represents phoenix energy—death, rebirth, and regeneration. Your dharma is transforming suffering into wisdom. Ayurvedically, you benefit from cooling practices and releasing stored anger.',
        Sagittarius: 'Dhanu (धनु), the ninth Rashi, ruled by Jupiter (Guru). You embody Sattva-guna and Pitta, representing wisdom and expansion. Jupiter gives you philosophical depth and ability to see life big picture. Your nakshatras are Mula (root), Purva Ashadha (early victory), and Uttara Ashadha (later victory). In Sanatana Dharma, Jupiter represents the guru and dharma. Your dharma is teaching, inspiring, and exploring truth. Ayurvedically, you benefit from cooling practices and not over-consuming information.',
        Capricorn: 'Makara (मकर), the tenth Rashi, ruled by Saturn (Shani). You embody Tama-guna and Vata-Kapha, representing discipline and long-term success. Saturn gives you discipline, patience, and ability to build lasting structures. Your nakshatras are Uttara Ashadha, Shravana (hearing), and Dhanishta (wealthy). In Sanatana Dharma, Saturn represents karma and time. Your dharma is building structures serving society. Ayurvedically, you benefit from warming practices and not overworking.',
        Aquarius: 'Kumbha (कुम्भ), the eleventh Rashi, ruled by Saturn (Shani). You embody Raja-guna and Vata, representing innovation and humanitarianism. Saturn gives you concern for society and detachment from emotions. Your nakshatras are Dhanishta, Satabhisha (healers), and Purva Bhadrapada (innovation). In Sanatana Dharma, Saturn in Aquarius represents working for societal change. Your dharma is humanitarian service and progressive thinking. Ayurvedically, you benefit from grounding and balancing ideals with practical implementation.',
        Pisces: 'Meena (मीन), the twelfth Rashi, ruled by Jupiter (Guru). You embody Sattva-guna and Kapha, representing spirituality and compassion. Jupiter gives you wisdom, spiritual intuition, and collective connection. Your nakshatras are Purva Bhadrapada, Uttara Bhadrapada, and Revati (prosperous). In Sanatana Dharma, Jupiter teaches that liberation comes through serving others with compassion. Your dharma is healing, creating uplifting art, and bringing spiritual beauty. Ayurvedically, you benefit from stimulating practices and healthy boundaries.'
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
