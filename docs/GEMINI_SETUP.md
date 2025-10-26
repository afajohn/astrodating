# Gemini AI Setup Guide

## 🔑 Getting Your Gemini API Key

### Step 1: Visit Google AI Studio
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account

### Step 2: Create API Key
1. Click "Create API Key" button
2. Choose "Create API key in new project" or select existing project
3. Copy the generated API key

### Step 3: Add to Environment Variables
1. Copy your `.env.template` file to `.env`
2. Add your Gemini API key:
   ```
   EXPO_PUBLIC_GEMINI_API_KEY=your-actual-api-key-here
   ```

### Step 4: Restart Development Server
```bash
npx expo start --clear
```

## 🚀 Usage

The GeminiAIService will automatically read the API key from your environment variables. No manual initialization needed!

```typescript
// Check if service is configured
if (GeminiAIService.isConfigured()) {
  // Generate astrology content
  const quote = await GeminiAIService.generateDailyQuote('Aries', 'morning', 'life');
  const description = await GeminiAIService.generateSignDescription('Aries');
}
```

## 🔒 Security Notes

- ✅ API key is stored in `.env` file (not committed to git)
- ✅ Uses `EXPO_PUBLIC_` prefix for client-side access
- ✅ Automatic error handling if key is missing
- ✅ No hardcoded keys in source code

## 🛠️ Troubleshooting

### Error: "Gemini API key not found"
- Check that `.env` file exists in project root
- Verify `EXPO_PUBLIC_GEMINI_API_KEY` is set correctly
- Restart development server after adding the key

### Error: "Invalid API key"
- Verify the API key is correct and active
- Check if you have sufficient quota in Google AI Studio
- Ensure the key has proper permissions

## 📊 API Limits

- **Free Tier**: 15 requests per minute
- **Paid Tier**: Higher limits available
- **Rate Limiting**: Built-in delays to respect limits

## 🎯 Features Enabled

With Gemini AI integration, you get:
- 🌅 **Morning quotes** - Energizing cosmic guidance
- ☀️ **Afternoon quotes** - Practical astrology insights  
- 🌙 **Evening quotes** - Reflective stellar wisdom
- ⭐ **Personalized descriptions** - 100-word sign profiles
- 🎨 **7 categories** - Life, career, motivation, health, finances, healing, growth
