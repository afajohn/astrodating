import { parseISO } from 'date-fns';
import { AstrologyDescriptionService } from './AstrologyDescriptionService';

// Western Zodiac Signs
export const WESTERN_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

// Chinese Zodiac Signs (12-year cycle)
export const CHINESE_SIGNS = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
] as const;

// Vedic Zodiac Signs (Sidereal)
export const VEDIC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

export type WesternSign = typeof WESTERN_SIGNS[number];
export type ChineseSign = typeof CHINESE_SIGNS[number];
export type VedicSign = typeof VEDIC_SIGNS[number];

export interface AstrologyProfile {
  westernSign: WesternSign;
  chineseSign: ChineseSign;
  vedicSign: VedicSign;
  birthDate: string;
}

export interface CompatibilityResult {
  westernCompatible: boolean;
  chineseCompatible: boolean;
  vedicCompatible: boolean;
  totalScore: number; // 0-3 (2-of-3 rule)
  isMatch: boolean; // true if totalScore >= 2
}

export class AstrologyService {
  /**
   * Calculate Western Zodiac sign from birth date
   */
  static getWesternSign(birthDate: string): WesternSign {
    const date = parseISO(birthDate);
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();

    // Western zodiac dates (tropical) - corrected
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
    return 'Pisces'; // (month === 2 && day >= 19) || (month === 3 && day <= 20)
  }

  /**
   * Calculate Chinese Zodiac sign from birth date
   */
  static getChineseSign(birthDate: string): ChineseSign {
    const date = parseISO(birthDate);
    const year = date.getFullYear();
    
    // Chinese zodiac cycle starts from 1900 (Rat year)
    const chineseYear = ((year - 1900) % 12 + 12) % 12;
    
    return CHINESE_SIGNS[chineseYear];
  }

  /**
   * Calculate Vedic Zodiac sign from birth date
   * Vedic astrology uses sidereal calculations with ayanamsa (precession)
   * This is a simplified version using approximate sidereal dates
   */
  static getVedicSign(birthDate: string): VedicSign {
    const date = parseISO(birthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Vedic zodiac dates (sidereal with ~23° ayanamsa adjustment)
    // These dates are approximately 23 days earlier than Western tropical dates
    if ((month === 4 && day >= 13) || (month === 5 && day <= 12)) return 'Aries';
    if ((month === 5 && day >= 13) || (month === 6 && day <= 12)) return 'Taurus';
    if ((month === 6 && day >= 13) || (month === 7 && day <= 14)) return 'Gemini';
    if ((month === 7 && day >= 15) || (month === 8 && day <= 14)) return 'Cancer';
    if ((month === 8 && day >= 15) || (month === 9 && day <= 14)) return 'Leo';
    if ((month === 9 && day >= 15) || (month === 10 && day <= 14)) return 'Virgo';
    if ((month === 10 && day >= 15) || (month === 11 && day <= 13)) return 'Libra';
    if ((month === 11 && day >= 14) || (month === 12 && day <= 13)) return 'Scorpio';
    if ((month === 12 && day >= 14) || (month === 1 && day <= 12)) return 'Sagittarius';
    if ((month === 1 && day >= 13) || (month === 2 && day <= 11)) return 'Capricorn';
    if ((month === 2 && day >= 12) || (month === 3 && day <= 12)) return 'Aquarius';
    return 'Pisces'; // (month === 3 && day >= 13) || (month === 4 && day <= 12)
  }

  /**
   * Get complete astrology profile for a birth date
   */
  static getAstrologyProfile(birthDate: string): AstrologyProfile {
    return {
      westernSign: this.getWesternSign(birthDate),
      chineseSign: this.getChineseSign(birthDate),
      vedicSign: this.getVedicSign(birthDate),
      birthDate,
    };
  }

  /**
   * Check Western Zodiac compatibility
   */
  static checkWesternCompatibility(sign1: WesternSign, sign2: WesternSign): boolean {
    // Western compatibility matrix (simplified)
    const compatiblePairs: Record<WesternSign, WesternSign[]> = {
      Aries: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
      Taurus: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
      Gemini: ['Libra', 'Aquarius', 'Aries', 'Leo'],
      Cancer: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
      Leo: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
      Virgo: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
      Libra: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
      Scorpio: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
      Sagittarius: ['Aries', 'Leo', 'Libra', 'Aquarius'],
      Capricorn: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
      Aquarius: ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
      Pisces: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
    };

    return compatiblePairs[sign1].includes(sign2);
  }

  /**
   * Check Chinese Zodiac compatibility
   */
  static checkChineseCompatibility(sign1: ChineseSign, sign2: ChineseSign): boolean {
    // Chinese compatibility matrix (simplified)
    const compatiblePairs: Record<ChineseSign, ChineseSign[]> = {
      Rat: ['Dragon', 'Monkey', 'Ox'],
      Ox: ['Snake', 'Rooster', 'Rat'],
      Tiger: ['Horse', 'Dog', 'Pig'],
      Rabbit: ['Goat', 'Pig', 'Dog'],
      Dragon: ['Rat', 'Monkey', 'Rooster'],
      Snake: ['Ox', 'Rooster', 'Dragon'],
      Horse: ['Tiger', 'Dog', 'Goat'],
      Goat: ['Rabbit', 'Pig', 'Horse'],
      Monkey: ['Rat', 'Dragon', 'Snake'],
      Rooster: ['Ox', 'Snake', 'Dragon'],
      Dog: ['Tiger', 'Horse', 'Rabbit'],
      Pig: ['Rabbit', 'Goat', 'Tiger'],
    };

    return compatiblePairs[sign1].includes(sign2);
  }

  /**
   * Check Vedic Zodiac compatibility
   * Based on Vedic astrology principles and planetary friendships
   */
  static checkVedicCompatibility(sign1: VedicSign, sign2: VedicSign): boolean {
    // Vedic compatibility matrix based on planetary friendships and elements
    const compatiblePairs: Record<VedicSign, VedicSign[]> = {
      Aries: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius', 'Scorpio'],
      Taurus: ['Virgo', 'Capricorn', 'Cancer', 'Pisces', 'Libra'],
      Gemini: ['Libra', 'Aquarius', 'Aries', 'Leo', 'Virgo'],
      Cancer: ['Scorpio', 'Pisces', 'Taurus', 'Virgo', 'Capricorn'],
      Leo: ['Aries', 'Sagittarius', 'Gemini', 'Libra', 'Aquarius'],
      Virgo: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio', 'Gemini'],
      Libra: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius', 'Taurus'],
      Scorpio: ['Cancer', 'Pisces', 'Virgo', 'Capricorn', 'Aries'],
      Sagittarius: ['Aries', 'Leo', 'Libra', 'Aquarius', 'Pisces'],
      Capricorn: ['Taurus', 'Virgo', 'Scorpio', 'Pisces', 'Cancer'],
      Aquarius: ['Gemini', 'Libra', 'Aries', 'Sagittarius', 'Leo'],
      Pisces: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn', 'Sagittarius'],
    };

    return compatiblePairs[sign1].includes(sign2);
  }

  /**
   * Calculate compatibility between two astrology profiles
   * Returns compatibility result based on 2-of-3 rule
   */
  static calculateCompatibility(profile1: AstrologyProfile, profile2: AstrologyProfile): CompatibilityResult {
    const westernCompatible = this.checkWesternCompatibility(profile1.westernSign, profile2.westernSign);
    const chineseCompatible = this.checkChineseCompatibility(profile1.chineseSign, profile2.chineseSign);
    const vedicCompatible = this.checkVedicCompatibility(profile1.vedicSign, profile2.vedicSign);

    const totalScore = [westernCompatible, chineseCompatible, vedicCompatible].filter(Boolean).length;
    const isMatch = totalScore >= 2; // 2-of-3 rule

    return {
      westernCompatible,
      chineseCompatible,
      vedicCompatible,
      totalScore,
      isMatch,
    };
  }

  /**
   * Get compatibility explanation for display
   */
  static getCompatibilityExplanation(result: CompatibilityResult): string {
    const compatibleSystems = [];
    
    if (result.westernCompatible) compatibleSystems.push('Western Zodiac');
    if (result.chineseCompatible) compatibleSystems.push('Chinese Zodiac');
    if (result.vedicCompatible) compatibleSystems.push('Vedic Astrology');

    if (result.isMatch) {
      return `Great cosmic match! Compatible in ${compatibleSystems.join(', ')}.`;
    } else {
      return `Limited compatibility in ${compatibleSystems.join(', ')}.`;
    }
  }

  /**
   * Get sign descriptions for display (75 words max, cached)
   */
  static async getSignDescription(system: 'western' | 'chinese' | 'vedic', sign: string): Promise<string> {
    try {
      // Try to get from cache first
      const cachedDescription = await AstrologyDescriptionService.getCachedDescription(system, sign);
      
      if (cachedDescription) {
        return cachedDescription;
      }

      // Fallback to basic description if not cached
      return AstrologyDescriptionService.getBasicDescription(system, sign);
    } catch (error) {
      console.error('Error getting sign description:', error);
      return AstrologyDescriptionService.getBasicDescription(system, sign);
    }
  }

  /**
   * Get sign descriptions synchronously (for backward compatibility)
   */
  static getSignDescriptionSync(system: 'western' | 'chinese' | 'vedic', sign: string): string {
    return AstrologyDescriptionService.getBasicDescription(system, sign);
  }
}
