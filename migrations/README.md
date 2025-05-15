# Database Migration to Supabase

This folder contains migration files and utilities for transitioning from the Replit database to Supabase.

## Complete Migration Steps

1. Get the Supabase connection string from your Supabase dashboard:
   - Go to Project Settings → Database
   - Under "Connection string", select "URI" format 
   - Copy the string that looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xyz.supabase.co:5432/postgres`
   - Replace `[YOUR-PASSWORD]` with your actual database password

2. Set the `DATABASE_URL` environment variable in Replit:
   - Click on the "Secrets" tab in the left sidebar (key icon)
   - Find the "DATABASE_URL" entry and click to edit
   - Paste your Supabase connection string and save

3. Run the database connection check script:
   ```
   node -r tsx/cjs server/utils/check-db-connection.js
   ```

4. When the connection is verified, run the migration script:
   ```
   node -r tsx/cjs migrations/run-migration.js
   ```

5. Restart the application workflow to connect to Supabase

## Alternative Options

If the automatic migration doesn't work, there are two manual approaches:

### Option 1: Run SQL directly in Supabase

1. Copy the contents of `migrations/full_schema.sql`
2. Go to the Supabase dashboard → SQL Editor
3. Paste the SQL and run it

### Option 2: Use Drizzle Kit

```
npx drizzle-kit push
```

## Key Files

- `full_schema.sql`: Complete SQL schema for Supabase
- `run-migration.js`: Interactive migration script
- `check-db-connection.js`: Tool to verify database connectivity

## Fallback Mechanism

The application has a built-in fallback to memory storage when the database connection is unavailable. This ensures the application remains functional during the migration process.

Benefits:
1. App continues to run during migration
2. Same interface and operations regardless of storage type
3. Automatic database switching when connection is available
4. Sample data available for testing and development

## Troubleshooting

If you encounter connection issues:
1. Verify the hostname in your DATABASE_URL is correct (should match your Supabase project)
2. Ensure the password is correct and properly URL-encoded
3. Check that your IP address has access to Supabase (in Project Settings → Database → Connection Pooling)
4. Verify SSL settings are correct (rejectUnauthorized is set to false in our code)