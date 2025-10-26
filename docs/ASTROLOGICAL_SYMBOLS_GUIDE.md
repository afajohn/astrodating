# Astrological Symbols Guide

## Current Symbol Implementation

### Western Zodiac Symbols
Uses traditional Unicode zodiac symbols:
- **♈ Aries** - Ram symbol
- **♉ Taurus** - Bull symbol  
- **♊ Gemini** - Twins symbol
- **♋ Cancer** - Crab symbol
- **♌ Leo** - Lion symbol
- **♍ Virgo** - Virgin symbol
- **♎ Libra** - Scales symbol
- **♏ Scorpio** - Scorpion symbol
- **♐ Sagittarius** - Archer symbol
- **♑ Capricorn** - Goat symbol
- **♒ Aquarius** - Water bearer symbol
- **♓ Pisces** - Fish symbol

### Chinese Zodiac Symbols
Uses animal emojis representing the 12-year cycle:
- **🐭 Rat** - Rat emoji
- **🐂 Ox** - Ox emoji
- **🐅 Tiger** - Tiger emoji
- **🐰 Rabbit** - Rabbit emoji
- **🐉 Dragon** - Dragon emoji
- **🐍 Snake** - Snake emoji
- **🐴 Horse** - Horse emoji
- **🐐 Goat** - Goat emoji
- **🐵 Monkey** - Monkey emoji
- **🐓 Rooster** - Rooster emoji
- **🐕 Dog** - Dog emoji
- **🐷 Pig** - Pig emoji

### Vedic Astrology Symbols
Uses culturally appropriate symbols and emojis:
- **🕉️ Mesha** - Om symbol (represents spiritual fire/energy)
- **🐂 Vrishabha** - Bull emoji (same as Chinese Ox)
- **👥 Mithuna** - People emoji (represents duality/twins)
- **🦀 Karka** - Crab emoji
- **🦁 Simha** - Lion emoji
- **🌾 Kanya** - Wheat emoji (represents harvest/virgin)
- **⚖️ Tula** - Scales emoji
- **🦂 Vrishchika** - Scorpion emoji
- **🏹 Dhanu** - Bow and arrow emoji
- **🐊 Makara** - Crocodile emoji (mythical sea creature)
- **🏺 Kumbha** - Pot emoji (water bearer)
- **🐟 Meena** - Fish emoji

## Upgrading to Professional Icon Packs

### Recommended Free Resources

1. **Flaticon Astrology Pack** (48 icons)
   - URL: https://www.flaticon.com/packs/astrology-44
   - Format: SVG
   - Style: Glyph-style, modern and clean

2. **IconScout Astrology Pack** (50 icons)
   - URL: https://iconscout.com/icon-pack/astrology-21
   - Format: SVG
   - Style: Colored outline icons

3. **Icons8 Astrology Collection** (3,000+ icons)
   - URL: https://icons8.com/icons/set/astrology
   - Format: PNG, SVG
   - Style: Various design styles

4. **Vecteezy Vedic Astrology** (Free vectors)
   - URL: https://www.vecteezy.com/free-vector/vedic-astrology
   - Format: Vector
   - Style: Traditional and modern

### Implementation Steps

1. **Download Icon Pack**
   ```bash
   # Create icons directory
   mkdir src/assets/icons/astrology
   
   # Download SVG files for each sign
   # Organize by system: western/, chinese/, vedic/
   ```

2. **Update AstrologicalSymbolsService**
   ```typescript
   // Replace emoji strings with image paths
   static symbols: AstrologicalSymbols = {
     western: {
       'Aries': require('../assets/icons/astrology/western/aries.svg'),
       'Taurus': require('../assets/icons/astrology/western/taurus.svg'),
       // ... etc
     },
     chinese: {
       'Rat': require('../assets/icons/astrology/chinese/rat.svg'),
       'Ox': require('../assets/icons/astrology/chinese/ox.svg'),
       // ... etc
     },
     vedic: {
       'Mesha': require('../assets/icons/astrology/vedic/mesha.svg'),
       'Vrishabha': require('../assets/icons/astrology/vedic/vrishabha.svg'),
       // ... etc
     }
   };
   ```

3. **Update Component to Use Images**
   ```typescript
   // Replace Text component with Image component
   <Image 
     source={AstrologicalSymbolsService.getSymbol(activeTab, getCurrentSignInfo().signName)}
     style={styles.signEmoji}
     resizeMode="contain"
   />
   ```

### Alternative: Custom SVG Components

For better control and theming:

```typescript
// Create custom SVG components
const AriesIcon = () => (
  <Svg width="60" height="60" viewBox="0 0 24 24">
    <Path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#FF6B6B"/>
  </Svg>
);
```

## Cultural Considerations

### Western Zodiac
- Use traditional astronomical symbols
- Maintain classical Greek/Roman aesthetic
- Focus on celestial and mythological themes

### Chinese Zodiac
- Use animal representations
- Consider yin/yang color schemes
- Incorporate traditional Chinese design elements

### Vedic Astrology
- Use Sanskrit-inspired symbols
- Incorporate Hindu spiritual elements
- Consider mandala or sacred geometry patterns

## Future Enhancements

1. **Animated Symbols** - Add subtle animations
2. **Color Themes** - System-specific color palettes
3. **Size Variants** - Different sizes for different contexts
4. **Accessibility** - Alt text and screen reader support
5. **Customization** - User-selectable symbol styles

## Current Status

✅ **Implemented**: Basic emoji-based symbols
✅ **Service Created**: AstrologicalSymbolsService for easy updates
✅ **Type Safety**: Full TypeScript support
🔄 **Next Step**: Replace with professional SVG icons
