# Migrating to Supabase PostgreSQL

This document outlines the process of migrating from the current database setup to Supabase PostgreSQL.

## Prerequisites

1. **Supabase Project**
   - You need to have a Supabase project created
   - You need the connection string with `service_role` privileges

2. **Required Packages**
   - postgres-js (installed with `npm install postgres`)
   - drizzle-orm (already installed)

## Migration Steps

### 1. Set up DATABASE_URL Environment Variable

Set the `DATABASE_URL` environment variable in the Replit Secrets panel:

```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

Replace `[YOUR-PASSWORD]` with your actual database password and `[YOUR-PROJECT-REF]` with your Supabase project reference.

### 2. Check Connection

Use the connection check script to verify the connection to Supabase:

```bash
node -r tsx/cjs scripts/check-supabase-connection.js
```

This will confirm if the connection is working properly.

### 3. Run Migration Script

Run the migration script to create the necessary tables in Supabase:

```bash
node -r tsx/cjs scripts/supabase-migration.js
```

This script will:
- Verify connection to Supabase
- Check for existing tables
- Create tables if necessary
- Create a test record to ensure write access
- Verify the migration was successful

### 4. Switch to Supabase Implementation

After the migration is complete, switch the application to use the Supabase postgres-js implementation:

```bash
node -r tsx/cjs server/utils/database-switcher.js --use-supabase
```

This will replace the current Node-Postgres implementation with the Supabase postgres-js implementation.

### 5. Restart the Application

Restart the application workflow to use the new Supabase implementation:

```bash
# Restart workflow
```

## Verification

After migration and restarting the application, the application should display "Using database storage" in the logs and the database status API should report "available: true" and "type: postgres".

You can also check the database status with:

```bash
curl http://localhost:5000/api/system/database-status
```

## Rollback

If necessary, you can roll back to the Node-Postgres implementation:

```bash
node -r tsx/cjs server/utils/database-switcher.js --use-node-postgres
```

This will restore the original implementation from the backup.

## Implementation Details

### Supabase postgres-js Implementation

The Supabase implementation uses the postgres-js client with Drizzle ORM:

```typescript
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "@shared/schema";

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  max: 5, 
  idle_timeout: 30
});

export const db = drizzle(sql, { schema });
```

### Memory Storage Fallback

The application has a fallback mechanism that uses in-memory storage when the database connection is unavailable:

```typescript
if (!db || !databaseConnected) {
  console.log("⚠️ Using memory storage as fallback since database is not available");
  storage = new MemStorage();
} else {
  console.log("✅ Using database storage");
  storage = new DatabaseStorage();
}
```

This ensures the application remains functional even if the database connection is temporarily unavailable.