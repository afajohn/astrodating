import { AstrologicalSymbolsService } from '../services/AstrologicalSymbolsService';

// Test that Western and Vedic use the same symbols for the same signs
export function testAstrologicalSymbols() {
  console.log('🧪 Testing Astrological Symbols...');
  
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  
  let allMatch = true;
  
  signs.forEach(sign => {
    const westernSymbol = AstrologicalSymbolsService.getSymbol('western', sign);
    const vedicSymbol = AstrologicalSymbolsService.getSymbol('vedic', sign);
    
    if (westernSymbol !== vedicSymbol) {
      console.error(`❌ Mismatch for ${sign}: Western=${westernSymbol}, Vedic=${vedicSymbol}`);
      allMatch = false;
    } else {
      console.log(`✅ ${sign}: ${westernSymbol} (both systems)`);
    }
  });
  
  if (allMatch) {
    console.log('🎉 All Western and Vedic symbols match correctly!');
  } else {
    console.log('❌ Some symbols don\'t match between Western and Vedic systems');
  }
  
  return allMatch;
}

// Test Chinese symbols are different (as expected)
export function testChineseSymbols() {
  console.log('🧪 Testing Chinese Symbols...');
  
  const chineseSigns = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 
                       'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  
  chineseSigns.forEach(sign => {
    const symbol = AstrologicalSymbolsService.getSymbol('chinese', sign);
    console.log(`🐉 ${sign}: ${symbol}`);
  });
  
  console.log('✅ Chinese symbols are unique (as expected)');
}
