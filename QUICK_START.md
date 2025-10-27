# Quick Start

## What You Need to Do:

### 1. Copy this SQL and run it in Supabase:
```sql
ALTER TABLE astrology_quotes ADD COLUMN IF NOT EXISTS astrology_system VARCHAR(20);
ALTER TABLE astrology_quotes ADD COLUMN IF NOT EXISTS date DATE;
UPDATE astrology_quotes SET date = DATE(generated_at) WHERE date IS NULL;
```

### 2. Restart your app

### 3. Open Explore screen

You'll see:
- ✨ Quote card at the top
- Tap it → Modal opens
- Shows your quote

That's it!
