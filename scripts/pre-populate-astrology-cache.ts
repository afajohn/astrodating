/**
 * Pre-populate Astrology Cache Script
 * 
 * This script populates the Supabase astrology_descriptions table with all sign descriptions
 * to avoid Gemini API rate limits during signup.
 * 
 * Run: npx tsx scripts/pre-populate-astrology-cache.ts
 */

import { AstrologyDescriptionService } from '../src/services/AstrologyDescriptionService';
import { CafeAstrologyContentService } from '../src/services/CafeAstrologyContentService';

const WESTERN_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                       'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const CHINESE_SIGNS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 
                       'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];

const VEDIC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                     'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

async function prePopulateCache() {
  console.log('🚀 Starting astrology cache pre-population...');
  
  let totalSuccess = 0;
  let totalErrors = 0;

  // Populate Western signs using comprehensive astrology content
  console.log('\n📚 Populating Western signs with detailed descriptions...');
  for (const sign of WESTERN_SIGNS) {
    try {
      const hasContent = CafeAstrologyContentService.hasContent(sign);
      if (hasContent) {
        const content = CafeAstrologyContentService.getSignContent(sign);
        const success = await AstrologyDescriptionService.saveDescription(
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
      const basicDesc = AstrologyDescriptionService.getBasicDescription('chinese', sign);
      const success = await AstrologyDescriptionService.saveDescription(
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
      const basicDesc = AstrologyDescriptionService.getBasicDescription('vedic', sign);
      const success = await AstrologyDescriptionService.saveDescription(
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
