/**
 * Comprehensive Astrology Content Service
 * Primary source for detailed astrology content with full descriptions
 * Provides complete astrological information for all 12 zodiac signs
 */

export interface CafeAstrologySignContent {
  sign: string;
  overview: string;
  keywords: string[];
  element: string;
  ruler: string;
  symbol: string;
  personalityTraits: string[];
  strengths: string[];
  challenges: string[];
  careerAffinities: string[];
  loveAndRelationships: string;
  compatibility: {
    most: string[];
    also: string[];
    avoid: string[];
  };
  healthFocus: string[];
  spiritualLessons: string;
}

export class CafeAstrologyContentService {
  /**
   * Get comprehensive sign content with detailed descriptions
   */
  static getSignContent(sign: string): CafeAstrologySignContent {
    const signLower = sign.toLowerCase();
    
    // Return specific sign content (all 12 signs)
    const contentMap: Record<string, CafeAstrologySignContent> = {
      aries: {
        sign: 'Aries',
        overview: 'Aries is the first sign of the zodiac, representing new beginnings, leadership, and the pioneering spirit. As a cardinal fire sign ruled by Mars, Aries embodies the raw energy of spring and the drive to take action. You are a natural trailblazer who thrives on challenges and competition.',
        keywords: ['Energetic', 'Pioneering', 'Impulsive', 'Competitive', 'Courageous', 'Independent'],
        element: 'Fire',
        ruler: 'Mars',
        symbol: 'Ram',
        personalityTraits: [
          'Natural born leaders with infectious enthusiasm',
          'Direct and honest communicators who say what they mean',
          'Competitive spirits who thrive in challenging situations',
          'Impulsive decision-makers who act on instinct',
          'Highly independent and value personal freedom',
          'Quick to start projects, sometimes slow to finish'
        ],
        strengths: [
          'Courage and fearlessness in the face of adversity',
          'Natural leadership abilities that inspire others',
          'Enthusiastic energy that motivates team members',
          'Direct communication style that avoids confusion',
          'Ability to take initiative and make things happen',
          'Resilience and ability to bounce back from setbacks'
        ],
        challenges: [
          'Impatience with routine and slow-moving situations',
          'Tendency to be impulsive without considering consequences',
          'Potential for being aggressive or overly competitive',
          'Struggle with following through on long-term projects',
          'Can be selfish or focused only on personal desires',
          'Difficulty with compromise or seeing other perspectives'
        ],
        careerAffinities: [
          'Entrepreneurship and business leadership',
          'Military and law enforcement careers',
          'Athletics and professional sports',
          'Emergency services and firefighting',
          'Sales and competitive business roles',
          'Pioneering roles in technology and innovation'
        ],
        loveAndRelationships: 'In relationships, you are passionate and direct, seeking partners who can match your energy and independence. You fall in love quickly and intensely, but may lose interest if things become routine. You need a partner who gives you space and doesn\'t try to control you. Communication is key for you—you appreciate honesty and directness. You\'re attracted to confident, strong-willed partners who challenge you.',
        compatibility: {
          most: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
          also: ['Libra', 'Scorpio'],
          avoid: ['Cancer', 'Capricorn']
        },
        healthFocus: [
          'Headaches and head injuries',
          'Eye strain and vision issues',
          'Stress-related inflammation',
          'Burns and accidents',
          'High blood pressure'
        ],
        spiritualLessons: 'Your spiritual path involves learning patience and considering others before yourself. You are here to learn that true leadership comes from serving others, not just taking charge. Practice slowing down and thinking before acting. Your fiery energy can inspire many when channeled constructively rather than destructively.'
      },
      taurus: {
        sign: 'Taurus',
        overview: 'Taurus is the second sign of the zodiac, representing stability, sensuality, and material security. As a fixed earth sign ruled by Venus, you embody the pleasures of life and the determination to build lasting foundations. You appreciate beauty, comfort, and the finer things in life, moving through the world with calm determination.',
        keywords: ['Stable', 'Sensual', 'Reliable', 'Materialistic', 'Patient', 'Stubborn'],
        element: 'Earth',
        ruler: 'Venus',
        symbol: 'Bull',
        personalityTraits: [
          'Highly stable and reliable in both work and relationships',
          'Deep appreciation for beauty, art, and luxurious comforts',
          'Patient and persistent when working toward goals',
          'Practical approach to money and security matters',
          'Strong attachment to possessions and comforts',
          'Stubborn resistance to change once decisions are made'
        ],
        strengths: [
          'Exceptional reliability and consistency in relationships',
          'Practical wisdom and sound financial management',
          'Ability to create and maintain lasting foundations',
          'Strong aesthetic sense and appreciation for beauty',
          'Patient persistence that achieves long-term goals',
          'Loyalty and devotion to loved ones'
        ],
        challenges: [
          'Resistance to change and inability to adapt quickly',
          'Over-attachment to possessions and material security',
          'Stubbornness that can close off to new possibilities',
          'Tendency toward complacency and avoiding necessary risks',
          'Possessiveness in relationships and friendships',
          'Procrastination and reluctance to start new projects'
        ],
        careerAffinities: [
          'Banking and financial management',
          'Real estate and property management',
          'Culinary arts and fine dining',
          'Luxury retail and high-end fashion',
          'Landscape design and agriculture',
          'Interior design and home décor'
        ],
        loveAndRelationships: 'In love, you are sensual, loyal, and devoted. You seek stable, long-term relationships with partners who appreciate your steady nature and physical affections. Romance for you involves all five senses—you enjoy beautiful settings, delicious meals, soft fabrics, and pleasant scents. You can be possessive and jealous, needing constant reassurance of your partner\'s devotion. Once committed, you are steadfast and will work hard to maintain harmony.',
        compatibility: {
          most: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
          also: ['Scorpio', 'Taurus'],
          avoid: ['Leo', 'Aquarius']
        },
        healthFocus: [
          'Neck and throat issues',
          'Thyroid problems',
          'Weight management and metabolism',
          'Digestive disorders',
          'Skin and allergy concerns'
        ],
        spiritualLessons: 'Your spiritual growth involves learning flexibility and detachment from material possessions. You are here to discover that true security comes from within, not from external comforts. Practice releasing your grip on "mine" and trusting in life\'s flow. Your sensual nature can bring deep appreciation for each moment when you learn to be present.'
      },
      // Add other signs here - continuing with Gemini
      gemini: {
        sign: 'Gemini',
        overview: 'Gemini is the third sign of the zodiac, representing communication, curiosity, and the dual nature of human experience. As a mutable air sign ruled by Mercury, you thrive on mental stimulation, variety, and learning. You are the eternal student, always gathering information and sharing knowledge with others. Your quick wit and adaptability make you fascinating company.',
        keywords: ['Communicative', 'Curious', 'Versatile', 'Restless', 'Intelligent', 'Social'],
        element: 'Air',
        ruler: 'Mercury',
        symbol: 'Twins',
        personalityTraits: [
          'Exceptional communication skills and verbal facility',
          'Inherent curiosity that drives constant learning',
          'Adaptable nature that thrives on change and variety',
          'Dual personality that can see multiple perspectives',
          'Quick thinking and mental agility',
          'Difficulty committing to long-term plans or projects'
        ],
        strengths: [
          'Excellent verbal and written communication abilities',
          'Natural networking and social skills',
          'Mental flexibility and ability to adapt quickly',
          'Multitasking and juggling multiple projects',
          'Quick learning and information retention',
          'Charming personality that puts others at ease'
        ],
        challenges: [
          'Difficulty focusing on one thing for extended periods',
          'Indecisiveness due to seeing all sides of issues',
          'Superficiality when not engaging deeply enough',
          'Nervous energy and restlessness',
          'Gossip and tendency to spread information',
          'Lack of follow-through on commitments'
        ],
        careerAffinities: [
          'Journalism and media communications',
          'Teaching and educational roles',
          'Sales and marketing professions',
          'Information technology and web development',
          'Writing and publishing industries',
          'Public relations and advertising'
        ],
        loveAndRelationships: 'In relationships, you seek partners who stimulate you mentally. Intellectual compatibility is essential—you need someone who can keep up with your thoughts and engage in deep conversations. You may struggle with commitment because you fear missing out on other possibilities. You need freedom and variety in your love life. Once you find a partner who understands your need for space and intellectual engagement, you can be devoted and exciting.',
        compatibility: {
          most: ['Libra', 'Aquarius', 'Aries', 'Leo'],
          also: ['Sagittarius', 'Gemini'],
          avoid: ['Virgo', 'Pisces']
        },
        healthFocus: [
          'Nervous system disorders',
          'Respiratory issues',
          'Hands and arms problems',
          'Anxiety and restlessness',
          'Mental exhaustion and burnout'
        ],
        spiritualLessons: 'Your spiritual path involves learning to focus your scattered energy and commit to deeper connections. You are here to integrate your dual nature and find unity within diversity. Practice being present instead of always planning the next adventure. Your gift of communication can heal and inspire when you use words with conscious awareness.'
      },
      // Remaining signs with full content
      cancer: {
        sign: 'Cancer',
        overview: 'Cancer is the fourth sign of the zodiac, representing home, family, and emotional security. As a cardinal water sign ruled by the Moon, you are deeply intuitive, nurturing, and protective of loved ones. You have a strong connection to your roots and memories, often holding onto sentimental items and relationships. Your emotional depth allows you to understand others profoundly, and you excel at creating safe, welcoming environments.',
        keywords: ['Nurturing', 'Intuitive', 'Emotional', 'Protective', 'Sentimental', 'Moody'],
        element: 'Water',
        ruler: 'Moon',
        symbol: 'Crab',
        personalityTraits: [
          'Deeply emotional and intuitive',
          'Strong connection to home and family',
          'Protective of loved ones',
          'Moody and sensitive to environment',
          'Excellent memory for emotional events',
          'Comfort-seeking and security-oriented'
        ],
        strengths: [
          'Exceptional nurturing abilities',
          'Strong intuition and emotional intelligence',
          'Loyalty to family and friends',
          'Ability to create warm, safe spaces',
          'Compassion and empathy for others'
        ],
        challenges: [
          'Over-sensitivity and moodiness',
          'Tendency to hold grudges',
          'Difficulty letting go of past hurts',
          'Neediness and emotional dependency',
          'Shell of protection that isolates'
        ],
        careerAffinities: ['Healthcare and nursing', 'Real estate and property', 'Domestic services', 'Childcare and education', 'Cooking and hospitality'],
        loveAndRelationships: 'You seek emotional security and deep connections in love, often taking time to open up but being incredibly devoted once committed. You need partners who value family and can provide the emotional stability you crave.',
        compatibility: { most: ['Scorpio', 'Pisces', 'Taurus'], also: ['Virgo'], avoid: ['Aries', 'Libra'] },
        healthFocus: ['Stomach and digestive issues', 'Breast health', 'Emotional eating', 'Water retention'],
        spiritualLessons: 'Learning to trust your emotions while maintaining healthy boundaries and releasing attachments to the past.'
      },
      leo: {
        sign: 'Leo',
        overview: 'Leo is the fifth sign of the zodiac, representing creativity, self-expression, and royal confidence. As a fixed fire sign ruled by the Sun, you shine brightly and love to be in the spotlight. You possess natural charisma and leadership qualities, drawing others to you with your warm heart and generous spirit. Your creative expression brings joy and inspiration to those around you.',
        keywords: ['Confident', 'Creative', 'Generous', 'Dramatic', 'Proud', 'Warm'],
        element: 'Fire',
        ruler: 'Sun',
        symbol: 'Lion',
        personalityTraits: [
          'Natural performer and entertainer',
          'Generous and warm-hearted',
          'Confident and charismatic',
          'Loves attention and admiration',
          'Strong sense of personal pride',
          'Protective of loved ones'
        ],
        strengths: [
          'Natural leadership and charisma',
          'Creativity and artistic expression',
          'Generosity and loyalty',
          'Ability to inspire others',
          'Courage and determination'
        ],
        challenges: [
          'Egotism and pride',
          'Need for constant validation',
          'Drama and attention-seeking behavior',
          'Arrogance when uncentered'
        ],
        careerAffinities: ['Entertainment and performing arts', 'Leadership roles', 'Event planning', 'Luxury retail', 'Teaching and coaching'],
        loveAndRelationships: 'You are passionate and devoted in love, seeking partners who appreciate your generous heart and can match your dramatic flair. You express love grandly and need affection shown in return.',
        compatibility: { most: ['Aries', 'Sagittarius', 'Gemini'], also: ['Libra'], avoid: ['Taurus', 'Scorpio'] },
        healthFocus: ['Heart and circulation', 'Back problems', 'Burnout from overexertion'],
        spiritualLessons: 'Learning to shine for yourself rather than seeking external validation, and serving others rather than dominating.'
      },
      virgo: {
        sign: 'Virgo',
        overview: 'Virgo is the sixth sign of the zodiac, representing service, perfectionism, and attention to detail. As a mutable earth sign ruled by Mercury, you excel at organization, analysis, and improvement. You have a strong desire to be useful and helpful, dedicating yourself to making things better through careful, methodical work. Your analytical mind helps you solve problems others might miss.',
        keywords: ['Analytical', 'Practical', 'Perfectionist', 'Modest', 'Helpful', 'Critical'],
        element: 'Earth',
        ruler: 'Mercury',
        symbol: 'Virgin',
        personalityTraits: [
          'Meticulous attention to detail',
          'Strong desire to be helpful',
          'Critical thinking and analysis',
          'Tendency toward perfectionism',
          'Practical and efficient approach',
          'Health and wellness focused'
        ],
        strengths: [
          'Exceptional organizational skills',
          'Reliability and attention to detail',
          'Practical problem-solving',
          'Dedication to service',
          'Analytical abilities'
        ],
        challenges: [
          'Perfectionism and self-criticism',
          'Tendency to worry and overthink',
          'Difficulty relaxing and letting go',
          'Critical of self and others',
          'Tendency to micromanage'
        ],
        careerAffinities: ['Healthcare and healing professions', 'Accounting and finance', 'Editing and writing', 'Quality control', 'Research and analysis'],
        loveAndRelationships: 'You are loyal but practical in love, showing affection through helpful actions rather than grand gestures. You seek partners who appreciate your attention to detail.',
        compatibility: { most: ['Taurus', 'Capricorn', 'Cancer'], also: ['Scorpio'], avoid: ['Gemini', 'Sagittarius'] },
        healthFocus: ['Digestive system', 'Nervous disorders', 'Skin conditions', 'Anxiety'],
        spiritualLessons: 'Learning to accept imperfection and appreciate the beauty in the process, not just the outcome.'
      },
      libra: {
        sign: 'Libra',
        overview: 'Libra is the seventh sign of the zodiac, representing balance, partnerships, and aesthetic beauty. As a cardinal air sign ruled by Venus, you seek harmony and fairness in all things. You have a natural gift for seeing multiple perspectives, making you an excellent mediator and diplomat. Your appreciation for beauty extends to art, relationships, and creating balanced environments.',
        keywords: ['Diplomatic', 'Charming', 'Balanced', 'Indecisive', 'Peaceful', 'Social'],
        element: 'Air',
        ruler: 'Venus',
        symbol: 'Scales',
        personalityTraits: [
          'Natural diplomat and peacemaker',
          'Strong aesthetic sense',
          'Indecisive due to seeing all sides',
          'Values harmony above all',
          'Charming and socially graceful',
          'Attracted to partnerships'
        ],
        strengths: [
          'Excellent sense of fairness and justice',
          'Charm and social grace',
          'Ability to see multiple perspectives',
          'Creativity and artistic appreciation',
          'Natural mediator abilities'
        ],
        challenges: [
          'Indecisiveness and inability to choose',
          'Avoiding conflict at all costs',
          'Dependence on others for validation',
          'Procrastination due to indecision'
        ],
        careerAffinities: ['Law and justice', 'Design and aesthetics', 'Counseling and mediation', 'Public relations', 'Fashion and beauty'],
        loveAndRelationships: 'You are a true romantic, seeking perfect partnerships and deeply committed once in a relationship. You need harmony and balance in your love life.',
        compatibility: { most: ['Gemini', 'Aquarius', 'Leo'], also: ['Sagittarius'], avoid: ['Cancer', 'Capricorn'] },
        healthFocus: ['Kidneys and urinary tract', 'Skin and appearance', 'Lower back', 'Circulation'],
        spiritualLessons: 'Learning to make decisions independently and value your own needs as much as others\'.'
      },
      scorpio: {
        sign: 'Scorpio',
        overview: 'Scorpio is the eighth sign of the zodiac, representing transformation, intensity, and deep emotional connections. As a fixed water sign ruled by Mars and Pluto, you possess incredible depth, magnetism, and the ability to transform yourself and others. Your powerful intuition allows you to see beyond surface appearances to understand true motivations and psychological patterns.',
        keywords: ['Intense', 'Passionate', 'Mysterious', 'Powerful', 'Transformative', 'Obsessive'],
        element: 'Water',
        ruler: 'Mars/Pluto',
        symbol: 'Scorpion',
        personalityTraits: [
          'Intense emotional depth',
          'Strong intuition and psychological insight',
          'Passionate and dedicated',
          'Mysterious and private',
          'Determined and willful',
          'Sexually magnetic'
        ],
        strengths: [
          'Incredible depth and resilience',
          'Ability to transform and regenerate',
          'Strong intuition and perception',
          'Loyalty and devotion',
          'Ability to empower and heal others'
        ],
        challenges: [
          'Tendency toward obsession and jealousy',
          'Difficulty trusting others',
          'Emotional intensity that can overwhelm',
          'Secretive nature that isolates',
          'Revenge and holding grudges'
        ],
        careerAffinities: ['Psychology and counseling', 'Research and investigation', 'Medicine and surgery', 'Occult studies', 'Finance and investment'],
        loveAndRelationships: 'You seek deep, transformative connections in love, preferring intensity over casual relationships. You are passionate and devoted but need your partner\'s complete loyalty.',
        compatibility: { most: ['Cancer', 'Pisces', 'Virgo'], also: ['Capricorn'], avoid: ['Leo', 'Aquarius'] },
        healthFocus: ['Reproductive system', 'Elimination organs', 'Chronic conditions', 'Sexual health'],
        spiritualLessons: 'Learning to let go of control and trust in the natural flow of transformation, and channeling intensity constructively.'
      },
      sagittarius: {
        sign: 'Sagittarius',
        overview: 'Sagittarius is the ninth sign of the zodiac, representing exploration, philosophy, and the quest for meaning. As a mutable fire sign ruled by Jupiter, you seek wisdom, adventure, and understanding in everything you do. Your optimistic nature and love of freedom drive you to explore new horizons, both physically and intellectually. You inspire others with your enthusiasm for life and learning.',
        keywords: ['Adventurous', 'Optimistic', 'Philosophical', 'Freedom-loving', 'Honest', 'Restless'],
        element: 'Fire',
        ruler: 'Jupiter',
        symbol: 'Archer',
        personalityTraits: [
          'Love of travel and exploration',
          'Philosophical and broad-minded',
          'Honest and direct',
          'Optimistic and enthusiastic',
          'Freedom-loving and independent',
          'Great sense of humor'
        ],
        strengths: [
          'Endless optimism and enthusiasm',
          'Broad vision and wisdom',
          'Adventurous spirit',
          'Honest communication',
          'Ability to inspire others'
        ],
        challenges: [
          'Restlessness and inability to commit',
          'Tactless honesty',
          'Tendency to overcommit',
          'Impatient with routine',
          'Reckless risk-taking'
        ],
        careerAffinities: ['Travel and tourism', 'Teaching and philosophy', 'Publishing and media', 'International business', 'Sports and athletics'],
        loveAndRelationships: 'You value freedom in relationships and need a partner who shares your love of adventure and intellectual pursuits. You may struggle with commitment but are honest and fun-loving.',
        compatibility: { most: ['Aries', 'Leo', 'Libra'], also: ['Aquarius'], avoid: ['Virgo', 'Pisces'] },
        healthFocus: ['Hips and thighs', 'Liver and digestion', 'Accidents and injuries', 'Immune system'],
        spiritualLessons: 'Learning to balance adventure with responsibility and commitment, and using wisdom gained through experience.'
      },
      capricorn: {
        sign: 'Capricorn',
        overview: 'Capricorn is the tenth sign of the zodiac, representing ambition, discipline, and the pursuit of success. As a cardinal earth sign ruled by Saturn, you are patient, persistent, and goal-oriented. You have an exceptional ability to build lasting success through hard work and determination. Your traditional values and practical approach help you navigate life\'s challenges with wisdom and grace.',
        keywords: ['Ambitious', 'Disciplined', 'Practical', 'Responsible', 'Persistent', 'Traditional'],
        element: 'Earth',
        ruler: 'Saturn',
        symbol: 'Goat',
        personalityTraits: [
          'Strong sense of duty and responsibility',
          'Ambitious and goal-oriented',
          'Patient and methodical',
          'Traditional values',
          'Reserved and serious',
          'Excellent time management'
        ],
        strengths: [
          'Exceptional discipline and self-control',
          'Ability to build lasting success',
          'Reliability and competence',
          'Leadership and authority',
          'Wisdom and maturity'
        ],
        challenges: [
          'Pessimism and fear of failure',
          'Emotional restraint and coldness',
          'Workaholic tendencies',
          'Rigidity and inflexibility',
          'Social isolation'
        ],
        careerAffinities: ['Business and management', 'Finance and banking', 'Engineering and architecture', 'Politics and government', 'Corporate leadership'],
        loveAndRelationships: 'You are cautious in love but deeply committed once you find someone who appreciates your stability and ambition. You show love through practical support rather than emotions.',
        compatibility: { most: ['Taurus', 'Virgo', 'Scorpio'], also: ['Pisces'], avoid: ['Aries', 'Cancer', 'Libra'] },
        healthFocus: ['Bones and joints', 'Skin and teeth', 'Knees and cartilage', 'Depression'],
        spiritualLessons: 'Learning to balance ambition with emotional expression and personal relationships, and finding joy in the present moment.'
      },
      aquarius: {
        sign: 'Aquarius',
        overview: 'Aquarius is the eleventh sign of the zodiac, representing innovation, humanitarianism, and independence. As a fixed air sign ruled by Uranus, you march to the beat of your own drum, valuing freedom, originality, and social progress. Your forward-thinking nature and concern for humanity make you a natural reformer and visionary. You connect with others through ideas rather than emotions.',
        keywords: ['Independent', 'Innovative', 'Humanitarian', 'Eccentric', 'Detached', 'Progressive'],
        element: 'Air',
        ruler: 'Uranus',
        symbol: 'Water Bearer',
        personalityTraits: [
          'Strong individuality and uniqueness',
          'Humanitarian and progressive',
          'Friendly yet emotionally detached',
          'Innovative and forward-thinking',
          'Social but prefers mental connection',
          'Rebellious and unpredictable'
        ],
        strengths: [
          'Ability to think outside the box',
          'Commitment to social progress',
          'Independent and authentic',
          'Innovation and creativity',
          'Friendliness and humanitarianism'
        ],
        challenges: [
          'Emotional detachment and aloofness',
          'Rebellious and unpredictable nature',
          'Difficulty with emotional intimacy',
          'Can be cold or emotionally unavailable',
          'Extreme independence that isolates'
        ],
        careerAffinities: ['Technology and innovation', 'Astrology and metaphysics', 'Social work and humanitarian causes', 'Science and research', 'Activism and reform'],
        loveAndRelationships: 'You need intellectual stimulation and freedom in relationships, often preferring friendship over traditional romance. You may seem emotionally detached but are loyal to those you care about.',
        compatibility: { most: ['Gemini', 'Libra', 'Sagittarius'], also: ['Aries'], avoid: ['Taurus', 'Scorpio'] },
        healthFocus: ['Circulatory system', 'Ankles and calves', 'Nervous disorders', 'Varicose veins'],
        spiritualLessons: 'Learning to balance independence with emotional connection and vulnerability, and combining humanitarian ideals with personal relationships.'
      },
      pisces: {
        sign: 'Pisces',
        overview: 'Pisces is the twelfth sign of the zodiac, representing spirituality, compassion, and transcendence. As a mutable water sign ruled by Neptune, you are deeply intuitive, empathetic, and connected to the collective unconscious. Your artistic nature and boundless compassion make you a natural healer and visionary. You see possibilities others cannot, often swimming between the spiritual and material worlds.',
        keywords: ['Compassionate', 'Intuitive', 'Artistic', 'Escape-prone', 'Spiritual', 'Empathetic'],
        element: 'Water',
        ruler: 'Neptune',
        symbol: 'Fish',
        personalityTraits: [
          'Deeply intuitive and psychic',
          'Compassionate and healing',
          'Artistic and creative',
          'Sensitive and vulnerable',
          'Spiritual and transcendent',
          'Escapist tendencies'
        ],
        strengths: [
          'Incredible empathy and compassion',
          'Artistic and creative expression',
          'Spiritual and transcendent wisdom',
          'Ability to heal and inspire others',
          'Intuition and psychic abilities'
        ],
        challenges: [
          'Tendency to escape reality',
          'Over-sensitivity and victim mentality',
          'Difficulty setting boundaries',
          'Addictive tendencies',
          'Lack of practical grounding'
        ],
        careerAffinities: ['Arts and creative fields', 'Healing and therapy', 'Spirituality and mysticism', 'Photography and film', 'Social work and advocacy'],
        loveAndRelationships: 'You seek deep, soul-level connections in love, often sacrificing yourself for your partner\'s needs. You are romantic and devoted but need partners who protect you from taking on too much emotional burden.',
        compatibility: { most: ['Cancer', 'Scorpio', 'Capricorn'], also: ['Taurus'], avoid: ['Gemini', 'Sagittarius'] },
        healthFocus: ['Feet and lymphatic system', 'Addictive behaviors', 'Immune system', 'Sleep disorders'],
        spiritualLessons: 'Learning to stay grounded while maintaining your mystical connection, and protecting yourself from absorbing others\' energy while maintaining your compassionate nature.'
      }
    };

    return contentMap[signLower] || this.getDefaultContent(sign);
  }

  /**
   * Get condensed description suitable for profile display (75 words)
   */
  static getCondensedDescription(sign: string): string {
    const content = this.getSignContent(sign);
    const keywords = content.keywords.slice(0, 3).join(', ');
    return `${content.overview} As a ${content.element}-sign ruled by ${content.ruler}, you ${content.personalityTraits[0].toLowerCase()}. Your strengths include ${content.strengths[0].toLowerCase()} and ${content.strengths[1].toLowerCase()}.`;
  }

  private static getDefaultContent(sign: string): CafeAstrologySignContent {
    return {
      sign,
      overview: `${sign} is a unique zodiac sign with distinct personality traits and qualities that shape your life journey.`,
      keywords: ['Unique', 'Special', 'Individual'],
      element: 'Unknown',
      ruler: 'Unknown',
      symbol: 'Unknown',
      personalityTraits: ['Distinct personality', 'Unique qualities'],
      strengths: ['Personal strengths'],
      challenges: ['Growth areas'],
      careerAffinities: ['Various career paths'],
      loveAndRelationships: 'Your approach to love and relationships is unique.',
      compatibility: { most: [], also: [], avoid: [] },
      healthFocus: ['General health'],
      spiritualLessons: 'Your spiritual journey is unique to you.'
    };
  }

  /**
   * Check if content exists for a sign
   */
  static hasContent(sign: string): boolean {
    const signLower = sign.toLowerCase();
    const supportedSigns = [
      'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
      'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];
    return supportedSigns.includes(signLower);
  }

  /**
   * Get Rising Sign (Ascendant) description
   * The Ascendant represents how others perceive you and your outward demeanor
   */
  static getRisingSignDescription(ascendant: string): string {
    const risingDescriptions: Record<string, string> = {
      aries: 'With Aries Rising, you project energy, initiative, and boldness. Others see you as a natural leader who takes action and isn\'t afraid to go first. You appear direct, confident, and physically active. People perceive you as independent and sometimes impulsive, with a strong need for immediate action.',
      taurus: 'With Taurus Rising, you appear steady, reliable, and physically strong. Others see you as patient, grounded, and someone who values comfort and stability. You have a calming, sensual presence that makes people feel secure. Your physical appearance often reflects strength and solidity.',
      gemini: 'With Gemini Rising, you project quick wit, curiosity, and versatility. Others see you as communicative, social, and mentally agile. You appear young, energetic, and always ready for conversation. People perceive you as adaptable and intellectually curious, sometimes scattered but never boring.',
      cancer: 'With Cancer Rising, you project nurturing, emotional, and protective qualities. Others see you as caring, intuitive, and mood-sensitive. You appear gentle and empathetic, with a strong emotional presence. People perceive you as someone who creates a sense of home and family wherever you go.',
      leo: 'With Leo Rising, you project confidence, charisma, and creativity. Others see you as radiant, enthusiastic, and naturally dramatic. You appear warm, generous, and attention-seeking in the best way. People perceive you as a natural performer with a commanding presence that lights up any room.',
      virgo: 'With Virgo Rising, you project practical, analytical, and detail-oriented qualities. Others see you as organized, efficient, and perfectionistic. You appear modest yet competent, always ready to help or improve situations. People perceive you as reliable and intelligent, sometimes critical but always useful.',
      libra: 'With Libra Rising, you project charm, diplomacy, and aesthetic appreciation. Others see you as balanced, beautiful, and relationship-focused. You appear graceful, pleasant, and always seeking harmony. People perceive you as someone who values fairness, partnership, and social grace above all.',
      scorpio: 'With Scorpio Rising, you project intensity, mystery, and magnetism. Others see you as powerful, perceptive, and emotionally deep. You appear reserved yet magnetic, with an ability to see through superficiality. People perceive you as someone who keeps secrets but understands others completely.',
      sagittarius: 'With Sagittarius Rising, you project optimism, adventure, and philosophical wisdom. Others see you as enthusiastic, freedom-loving, and honest to a fault. You appear adventurous, broad-minded, and always ready for the next journey. People perceive you as someone who brings excitement and perspective to life.',
      capricorn: 'With Capricorn Rising, you project ambition, discipline, and authority. Others see you as serious, capable, and professionally focused. You appear mature, responsible, and someone who gets things done. People perceive you as reliable and goal-oriented, sometimes reserved but always competent.',
      aquarius: 'With Aquarius Rising, you project uniqueness, innovation, and humanitarian ideals. Others see you as friendly yet detached, progressive, and independent. You appear unconventional, forward-thinking, and interested in social causes. People perceive you as someone who thinks outside the box and values freedom.',
      pisces: 'With Pisces Rising, you project sensitivity, intuition, and artistic sensibility. Others see you as dreamy, compassionate, and emotionally open. You appear gentle, spiritual, and sometimes otherworldly. People perceive you as someone who feels deeply and brings empathy and creativity to all encounters.'
    };

    return risingDescriptions[ascendant.toLowerCase()] || 
           `${ascendant} Rising influences how others perceive your personality and outward presentation.`;
  }
}

