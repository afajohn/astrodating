/**
 * Pre-populate Astrology Cache Script (Node.js compatible)
 * 
 * This script populates the Supabase astrology_descriptions table with all sign descriptions
 * to avoid Gemini API rate limits during signup.
 * 
 * Requirements:
 * 1. Create a .env file with your Supabase credentials
 * 2. Run: npx tsx scripts/pre-populate-astrology-cache-node.ts
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import { CafeAstrologyContentService } from '../src/services/CafeAstrologyContentService';

const WESTERN_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                       'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const CHINESE_SIGNS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 
                       'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];

const VEDIC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                     'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

// Enhanced descriptions for Chinese Zodiac with Five Elements and cultural authenticity
const getBasicChineseDescription = (sign: string): string => {
  const descriptions: Record<string, string> = {
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
  };
  return descriptions[sign] || `${sign} represents unique qualities in Chinese astrology.`;
};

// Enhanced descriptions for Vedic Zodiac with Sanskrit terminology and cultural authenticity
const getBasicVedicDescription = (sign: string): string => {
  const descriptions: Record<string, string> = {
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
  };
  return descriptions[sign] || `${sign} in Vedic astrology carries deep spiritual significance and represents specific karmic and evolutionary patterns.`;
};

async function prePopulateCache() {
  console.log('🚀 Starting astrology cache pre-population...');
  
  // Get Supabase credentials from environment
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials!');
    console.error('Please create a .env file with:');
    console.error('EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    console.error('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    process.exit(1);
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  let totalSuccess = 0;
  let totalErrors = 0;

  // Helper function to save description directly to Supabase
  const saveDescription = async (
    astrologySystem: 'western' | 'chinese' | 'vedic',
    signName: string,
    description: string
  ): Promise<boolean> => {
    try {
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
        console.error(`Error saving ${astrologySystem} ${signName}:`, error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Exception saving ${astrologySystem} ${signName}:`, error);
      return false;
    }
  };

  // Populate Western signs using comprehensive astrology content
  console.log('\n📚 Populating Western signs with detailed descriptions...');
  for (const sign of WESTERN_SIGNS) {
    try {
      const hasContent = CafeAstrologyContentService.hasContent(sign);
      if (hasContent) {
        const content = CafeAstrologyContentService.getSignContent(sign);
        const success = await saveDescription(
          'western',
          sign,
          content.overview
        );
        
        if (success) {
          console.log(`✅ Saved Western ${sign}`);
          totalSuccess++;
        } else {
          console.log(`❌ Failed to save Western ${sign}`);
          totalErrors++;
        }
      }
    } catch (error) {
      console.error(`Error processing Western ${sign}:`, error);
      totalErrors++;
    }
  }

  // Populate Chinese signs using basic descriptions
  console.log('\n🐉 Populating Chinese signs...');
  for (const sign of CHINESE_SIGNS) {
    try {
      const basicDesc = getBasicChineseDescription(sign);
      const success = await saveDescription(
        'chinese',
        sign,
        basicDesc
      );
      
      if (success) {
        console.log(`✅ Saved Chinese ${sign}`);
        totalSuccess++;
      } else {
        console.log(`❌ Failed to save Chinese ${sign}`);
        totalErrors++;
      }
    } catch (error) {
      console.error(`Error processing Chinese ${sign}:`, error);
      totalErrors++;
    }
  }

  // Populate Vedic signs using basic descriptions
  console.log('\n🌟 Populating Vedic signs...');
  for (const sign of VEDIC_SIGNS) {
    try {
      const basicDesc = getBasicVedicDescription(sign);
      const success = await saveDescription(
        'vedic',
        sign,
        basicDesc
      );
      
      if (success) {
        console.log(`✅ Saved Vedic ${sign}`);
        totalSuccess++;
      } else {
        console.log(`❌ Failed to save Vedic ${sign}`);
        totalErrors++;
      }
    } catch (error) {
      console.error(`Error processing Vedic ${sign}:`, error);
      totalErrors++;
    }
  }

  console.log('\n✨ Pre-population complete!');
  console.log(`✅ Success: ${totalSuccess}`);
  console.log(`❌ Errors: ${totalErrors}`);
  console.log(`\n💡 Now all new users will get instant astrology overviews without hitting Gemini API rate limits!`);
}

// Run the script
prePopulateCache()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
