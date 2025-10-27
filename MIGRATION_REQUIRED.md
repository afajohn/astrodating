# ⚠️ DATABASE MIGRATION REQUIRED

## Critical: You must run this SQL in your Supabase dashboard

The daily quotes feature requires a database migration. Without this, quotes will not be cached properly.

### Steps:

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `add-quote-system-column.sql`
4. Click "Run"

### What the migration does:

- Adds `astrology_system` column (western, chinese, vedic)
- Adds `date` column for daily tracking
- Creates indexes for better performance
- Updates existing quotes

### Without this migration:

- ❌ Quotes won't be cached
- ❌ Will regenerate every time
- ❌ Wastes Gemini API tokens
- ❌ Won't show correctly

## After running migration:

1. Restart your app
2. Open Explore screen
3. Modal should appear (once per day)
4. Quote will be cached in Supabase

The migration is idempotent - you can run it multiple times safely.
