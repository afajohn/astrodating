/**
 * Astrological Symbols Service
 * Provides authentic symbols for different astrology systems
 */

export interface AstrologicalSymbols {
  western: Record<string, string>;
  chinese: Record<string, string>;
  vedic: Record<string, string>;
}

export class AstrologicalSymbolsService {
  private static symbols: AstrologicalSymbols = {
    western: {
      'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
      'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
      'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
    },
    chinese: {
      'Rat': '🐭', 'Ox': '🐂', 'Tiger': '🐅', 'Rabbit': '🐰',
      'Dragon': '🐉', 'Snake': '🐍', 'Horse': '🐴', 'Goat': '🐐',
      'Monkey': '🐵', 'Rooster': '🐓', 'Dog': '🐕', 'Pig': '🐷'
    },
    // Vedic uses the same 12 zodiac signs as Western, just with different calculation methods
    vedic: {
      'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
      'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
      'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
    }
  };

  /**
   * Get symbol for a specific sign in a specific astrology system
   */
  static getSymbol(signType: 'western' | 'chinese' | 'vedic', signName: string): string {
    return this.symbols[signType]?.[signName] || '✨';
  }

  /**
   * Get all symbols for a specific astrology system
   */
  static getSystemSymbols(signType: 'western' | 'chinese' | 'vedic'): Record<string, string> {
    return this.symbols[signType] || {};
  }

  /**
   * Get all symbols
   */
  static getAllSymbols(): AstrologicalSymbols {
    return this.symbols;
  }

  /**
   * Update symbols (for future customization)
   */
  static updateSymbols(newSymbols: Partial<AstrologicalSymbols>): void {
    this.symbols = { ...this.symbols, ...newSymbols };
  }

  /**
   * Get symbol with fallback
   */
  static getSymbolWithFallback(
    signType: 'western' | 'chinese' | 'vedic', 
    signName: string, 
    fallback: string = '✨'
  ): string {
    return this.symbols[signType]?.[signName] || fallback;
  }

  /**
   * Check if symbol exists for a sign
   */
  static hasSymbol(signType: 'western' | 'chinese' | 'vedic', signName: string): boolean {
    return !!this.symbols[signType]?.[signName];
  }

  /**
   * Get symbol info with metadata
   */
  static getSymbolInfo(signType: 'western' | 'chinese' | 'vedic', signName: string) {
    const symbol = this.getSymbol(signType, signName);
    return {
      symbol,
      exists: this.hasSymbol(signType, signName),
      system: signType,
      signName
    };
  }
}
