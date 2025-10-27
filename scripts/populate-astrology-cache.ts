/**
 * Pre-populate Astrology Cache Script
 * 
 * This script populates the Supabase astrology_descriptions table with all sign descriptions
 * to avoid Gemini API rate limits during signup.
 * 
 * Requirements:
 * 1. Create a .env file with your Supabase credentials
 * 2. Run: npx tsx scripts/populate-astrology-cache.ts
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Comprehensive astrology content (simplified)
const CAFE_OVERVIEWS: Record<string, string> = {
  Aries: 'Bold and ambitious, Aries dives headfirst into even the most challenging situations. They are leaders who aren\'t afraid of taking risks and pushing boundaries to achieve their goals. This sign embodies the energy of a warrior, always ready to fight for what they believe in. Aries rises to every challenge with fierce determination.',
  Taurus: 'With Venus as the ruling planet, Taurus is the sign of luxury, beauty, and sensual pleasures. This earth sign values stability, comfort, and the finer things in life. Taureans are reliable and patient, with a strong appreciation for art, music, and good food. They build lasting foundations in both their personal and professional lives.',
  Gemini: 'Air sign Gemini is characterized by curious, quick-witted dual nature. Geminis are excellent communicators, skilled at seeing both sides of a situation and able to talk their way out of anything. They love intellectual stimulation, variety, and social interaction. Gemini minds are always active, processing information and sharing knowledge.',
  Cancer: 'Cancer, ruled by the Moon, represents emotions, intuition, and nurturing. This water sign is deeply connected to family, home, and the past. Cancers are highly sensitive and empathetic, with an incredible ability to read and respond to others\' emotional needs. They protect their loved ones fiercely and create safe, comfortable spaces.',
  Leo: 'Fiery Leo is ruled by the Sun, making this sign charismatic, confident, and naturally drawn to the spotlight. Leos are natural-born leaders with generous hearts and infectious enthusiasm. They love to express themselves creatively and inspire others with their courage and warmth. This sign radiates positive energy wherever they go.',
  Virgo: 'Virgo, ruled by Mercury, is the perfectionist of the zodiac. This earth sign has an eye for detail and strives for excellence in everything they do. Virgos are analytical, practical, and helpful to others. They excel at organizing, planning, and improving systems. This sign values cleanliness, order, and continuous self-improvement.',
  Libra: 'Libra, ruled by Venus, is the sign of balance, harmony, and partnership. This air sign values beauty, justice, and fairness above all else. Librans are natural diplomats who excel at mediating conflicts and bringing people together. They have excellent taste and a strong appreciation for art, music, and aesthetic beauty.',
  Scorpio: 'Water sign Scorpio is intense, passionate, and deeply emotional. Ruled by Mars and Pluto, Scorpios possess incredible depth and transformational power. They are highly intuitive, with an almost psychic ability to understand human nature and hidden motivations. Scorpios value authenticity and profound emotional connections.',
  Sagittarius: 'Fire sign Sagittarius is optimistic, adventurous, and philosophical. Ruled by Jupiter, this sign represents expansion, higher learning, and the pursuit of truth. Sagittarians love to travel, explore new ideas, and share their wisdom with others. They have an infectious enthusiasm and a deep sense of humor that lightens any situation.',
  Capricorn: 'Earth sign Capricorn is ambitious, disciplined, and driven by success. Ruled by Saturn, this sign values tradition, structure, and long-term planning. Capricorns are natural-born leaders who work steadily toward their goals. They are patient, practical, and have excellent organizational skills. This sign builds lasting foundations for the future.',
  Aquarius: 'Air sign Aquarius is innovative, independent, and humanitarian. Ruled by Uranus, this sign represents progressive thinking and originality. Aquarians are visionaries who think outside the box and work to improve society. They value freedom, friendship, and intellectual stimulation. This sign is friendly yet detached, connecting with people from all walks of life.',
  Pisces: 'Water sign Pisces is compassionate, intuitive, and deeply spiritual. Ruled by Neptune, this sign represents imagination, empathy, and artistic expression. Pisceans are highly sensitive to the emotions of others and have an incredible ability to heal and inspire. They are dreamers with a deep connection to the spiritual and creative realms.',
};

const BASIC_CHINESE_SIGNS: Record<string, string> = {
  Rat: 'Clever and resourceful, Rat individuals are natural problem-solvers. They excel in business and social settings with their sharp intelligence and quick wit. Rats are charming and adaptable, making them popular among friends.',
  Ox: 'Strong and reliable, Ox individuals are patient and methodical. They approach life with determination and rarely give up on their goals. Their honest nature and dependability make them trusted friends and valued colleagues.',
  Tiger: 'Bold and courageous, Tiger individuals are natural leaders who thrive on challenge. They possess great confidence and the ability to inspire others with their passion. Tigers are protective of loved ones and fiercely fight for their beliefs.',
  Rabbit: 'Gentle and refined, Rabbit individuals are known for their kindness and excellent taste. They have a natural ability to create harmony and avoid conflict. Rabbits are cautious and prefer to think before acting, leading to wise decisions.',
  Dragon: 'Powerful and charismatic, Dragon individuals inspire others with their confidence and vision. They possess great energy and the ability to achieve remarkable success. Dragons are generous with their time and resources, always willing to help others.',
  Snake: 'Wise and intuitive, Snake individuals are known for their deep thinking and excellent judgment. They have a natural ability to understand human psychology and wait for the perfect moment to act. Snakes are highly intelligent and successful in business.',
  Horse: 'Energetic and adventurous, Horse individuals love freedom and new experiences. They possess great enthusiasm and the ability to inspire others. Horses are excellent communicators who connect with people from all walks of life.',
  Goat: 'Creative and compassionate, Goat individuals have an artistic nature and gentle spirit. They excel at creating beauty and bringing comfort to others. Goats are highly sensitive and value peaceful, supportive environments.',
  Monkey: 'Clever and versatile, Monkey individuals excel at finding creative solutions. They possess quick wit and the ability to adapt to any situation. Monkeys are curious, optimistic, and have a natural sense of humor.',
  Rooster: 'Confident and organized, Rooster individuals are punctual and responsible. They have excellent organizational skills and a natural ability to manage complex projects. Roosters are honest and have a strong sense of duty.',
  Dog: 'Loyal and protective, Dog individuals have a strong sense of justice. They can quickly assess people\'s character and protect their loved ones from harm. Dogs are reliable, compassionate, and create safe, supportive environments.',
  Pig: 'Generous and sincere, Pig individuals are known for their kindness and strong work ethic. They enjoy life\'s simple pleasures and appreciate the good things around them. Pigs are excellent at building lasting relationships.',
};

const BASIC_VEDIC_SIGNS: Record<string, string> = {
  Aries: 'Fire sign Aries represents courage, leadership, and initiative. Dynamic and pioneering, Aries individuals approach life with enthusiasm and determination. They value independence and prefer to blaze their own trail with passionate energy.',
  Taurus: 'Earth sign Taurus represents stability and material security. Grounded and patient, Taurus individuals appreciate life\'s comforts and build lasting foundations. They value consistency and have excellent taste in art, food, and possessions.',
  Gemini: 'Air sign Gemini represents communication and intellectual curiosity. Versatile and adaptable, Gemini individuals see multiple perspectives and excel at networking. They are quick-witted, charming, and always eager to learn new things.',
  Cancer: 'Water sign Cancer represents emotions and family connections. Nurturing and intuitive, Cancer individuals protect their loved ones and create warm, welcoming spaces. They are highly sensitive to their environment and others\' emotions.',
  Leo: 'Fire sign Leo represents creativity and self-expression. Confident and charismatic, Leo individuals inspire others with their creative vision. They have a generous spirit and an infectious enthusiasm that lights up any gathering.',
  Virgo: 'Earth sign Virgo represents service and attention to detail. Analytical and practical, Virgo individuals excel at organizing and improving systems. They are reliable, hardworking, and have a keen eye for what needs to be fixed.',
  Libra: 'Air sign Libra represents balance and partnership. Harmonious and diplomatic, Libra individuals seek fairness and beauty in all aspects of life. They have excellent taste and a natural ability to bring people together peacefully.',
  Scorpio: 'Water sign Scorpio represents transformation and deep connections. Intense and passionate, Scorpio individuals possess incredible depth and intuition. They value authenticity and have an almost psychic understanding of human nature.',
  Sagittarius: 'Fire sign Sagittarius represents wisdom and higher learning. Adventurous and philosophical, Sagittarius individuals seek knowledge and meaning in life. They are honest, generous, and have an insatiable curiosity about life\'s mysteries.',
  Capricorn: 'Earth sign Capricorn represents discipline and long-term success. Ambitious and responsible, Capricorn individuals work steadily toward their goals with patience. They are practical, loyal, and understand how to build enduring foundations.',
  Aquarius: 'Air sign Aquarius represents humanitarian ideals and progressive thinking. Innovative and visionary, Aquarius individuals see solutions others miss. They value independence and work to improve society for everyone.',
  Pisces: 'Water sign Pisces represents spirituality and artistic expression. Compassionate and intuitive, Pisces individuals connect deeply to emotions and imagination. They are gentle healers who bring beauty and compassion to the world.',
};

const WESTERN_SIGNS = Object.keys(CAFE_OVERVIEWS);
const CHINESE_SIGNS = Object.keys(BASIC_CHINESE_SIGNS);
const VEDIC_SIGNS = Object.keys(BASIC_VEDIC_SIGNS);

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

  // Create Supabase client WITHOUT AsyncStorage (for Node.js environment)
  const supabase = createClient(supabaseUrl, supabaseKey);

  let totalSuccess = 0;
  let totalErrors = 0;

  // Helper function to save description
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
    const success = await saveDescription('western', sign, CAFE_OVERVIEWS[sign]);
    if (success) {
      console.log(`✅ Saved Western ${sign}`);
      totalSuccess++;
    } else {
      console.log(`❌ Failed to save Western ${sign}`);
      totalErrors++;
    }
  }

  // Populate Chinese signs
  console.log('\n🐉 Populating Chinese signs...');
  for (const sign of CHINESE_SIGNS) {
    const success = await saveDescription('chinese', sign, BASIC_CHINESE_SIGNS[sign]);
    if (success) {
      console.log(`✅ Saved Chinese ${sign}`);
      totalSuccess++;
    } else {
      console.log(`❌ Failed to save Chinese ${sign}`);
      totalErrors++;
    }
  }

  // Populate Vedic signs
  console.log('\n🌟 Populating Vedic signs...');
  for (const sign of VEDIC_SIGNS) {
    const success = await saveDescription('vedic', sign, BASIC_VEDIC_SIGNS[sign]);
    if (success) {
      console.log(`✅ Saved Vedic ${sign}`);
      totalSuccess++;
    } else {
      console.log(`❌ Failed to save Vedic ${sign}`);
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
