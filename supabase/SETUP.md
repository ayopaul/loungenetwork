# Supabase Setup Guide

This guide explains how to set up Supabase for the Lounge Network platform.

## Prerequisites

1. A Supabase account (https://supabase.com)
2. Node.js 18+ installed

## Step 1: Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in the project details:
   - Name: loungenetwork (or your preferred name)
   - Database Password: Generate a strong password
   - Region: Choose the closest region to your users
4. Wait for the project to be provisioned

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings > API**
2. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Keep your existing auth config
ADMIN_PASSWORD=your-admin-password
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

## Step 4: Apply the Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase/schema.sql`
4. Click "Run" to execute the schema
5. Verify the tables were created in **Database > Tables**

## Step 5: Test the Connection

Run the Supabase connection test:

```bash
npm run test:supabase
```

This will verify:
- Environment variables are set correctly
- Database connection works
- All tables exist
- CRUD operations work
- RLS policies are configured

## Step 6: Test Admin Functionalities

### Without Authentication (basic endpoint tests)
```bash
npm run test:admin
```

### With Authentication (full CRUD tests)
1. Start the dev server: `npm run dev`
2. Log in to `/admin/login`
3. Get the session cookie from browser DevTools (Application > Cookies)
4. Run:
```bash
ADMIN_SESSION_COOKIE="next-auth.session-token=your-token-here" npm run test:admin:auth
```

## Database Schema Overview

The following tables are created:

| Table | Description |
|-------|-------------|
| `stations` | Radio stations (id, name, stream_url) |
| `posts` | Blog posts with category relations |
| `categories` | Post categories per station |
| `oaps` | On-air personalities with shows array |
| `schedules` | Weekly show schedules |

### Column Naming Convention

Supabase uses snake_case for columns, while the API returns camelCase:

| Database (snake_case) | API (camelCase) |
|----------------------|-----------------|
| `stream_url` | `streamUrl` |
| `station_id` | `stationId` |
| `category_id` | `categoryId` |
| `cover_image` | `coverImage` |
| `photo_url` | `photoUrl` |
| `show_title` | `showTitle` |
| `start_time` | `startTime` |
| `end_time` | `endTime` |
| `thumbnail_url` | `thumbnailUrl` |
| `created_at` | `createdAt` |

## Row Level Security (RLS)

The schema includes RLS policies:

- **Public read**: Anyone can read from all tables
- **Service role write**: Only the service role can insert/update/delete

This means:
- Frontend reads work with the anon key
- Admin writes require the service role key (used in API routes)

## Troubleshooting

### "Missing Supabase environment variables"
Ensure all three variables are set in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### "relation does not exist"
The schema hasn't been applied. Run the SQL from `supabase/schema.sql` in the SQL Editor.

### "permission denied for table"
Check that:
1. RLS is enabled on the table
2. Appropriate policies exist
3. You're using the service role key for writes

### "duplicate key value violates unique constraint"
You're trying to insert a record with an existing ID. Use upsert or check for existing records first.

## Project Files

### Supabase Configuration
- `lib/supabase.ts` - Supabase client configuration
- `types/supabase.ts` - TypeScript types for Supabase
- `supabase/schema.sql` - Database schema
- `supabase/SETUP.md` - This file
- `scripts/tests/*.ts` - Test scripts

### API Routes (using Supabase)
- `app/api/stations/route.ts`
- `app/api/stations/save/route.ts`
- `app/api/schedule/route.ts`
- `app/api/schedule/save/route.ts`
- `app/api/schedule/delete/route.ts`
- `app/api/oaps/route.ts`
- `app/api/oaps/save/route.ts`
- `app/api/oaps/[id]/route.ts`
- `app/api/blog/route.ts`
- `app/api/blog/save/route.ts`
- `app/api/blog/[slug]/route.ts`
- `app/api/blog/DELETE/route.ts`
- `app/api/categories/get/route.ts`
- `app/api/categories/save/route.ts`

## Support

If you encounter issues:
1. Check the Supabase dashboard for error logs
2. Verify environment variables
3. Run the test scripts for diagnostics
4. Check browser console for API errors
