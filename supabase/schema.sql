-- Supabase Schema Migration
-- This file creates the database schema for the Lounge Network platform
-- Run this in the Supabase SQL Editor to set up your database

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS stations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stream_url TEXT NOT NULL
);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT concat('c', to_hex(extract(epoch from now())::bigint), substr(md5(random()::text), 1, 12)),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT true,
  station_id TEXT NOT NULL REFERENCES stations(id) ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT categories_slug_station_unique UNIQUE (slug, station_id)
);

CREATE INDEX IF NOT EXISTS idx_categories_station ON categories(station_id);

-- ============================================
-- POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY DEFAULT concat('c', to_hex(extract(epoch from now())::bigint), substr(md5(random()::text), 1, 12)),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  station_id TEXT NOT NULL REFERENCES stations(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  category_id TEXT REFERENCES categories(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT posts_slug_station_unique UNIQUE (slug, station_id)
);

CREATE INDEX IF NOT EXISTS idx_posts_station ON posts(station_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
-- Composite index for common query pattern: station + published status
CREATE INDEX IF NOT EXISTS idx_posts_station_published ON posts(station_id, published);

-- ============================================
-- OAPS TABLE (On-Air Personalities)
-- ============================================
CREATE TABLE IF NOT EXISTS oaps (
  id TEXT PRIMARY KEY DEFAULT concat('c', to_hex(extract(epoch from now())::bigint), substr(md5(random()::text), 1, 12)),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  bio TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  shows TEXT[] NOT NULL DEFAULT '{}',
  station_id TEXT NOT NULL REFERENCES stations(id) ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT oaps_slug_station_unique UNIQUE (slug, station_id)
);

CREATE INDEX IF NOT EXISTS idx_oaps_station ON oaps(station_id);

-- ============================================
-- SCHEDULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY DEFAULT concat('c', to_hex(extract(epoch from now())::bigint), substr(md5(random()::text), 1, 12)),
  show_title TEXT NOT NULL,
  slug TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  weekday INTEGER NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
  station_id TEXT NOT NULL REFERENCES stations(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_schedules_station ON schedules(station_id);
CREATE INDEX IF NOT EXISTS idx_schedules_weekday ON schedules(weekday);
-- Composite index for common query pattern: station + weekday
CREATE INDEX IF NOT EXISTS idx_schedules_station_weekday ON schedules(station_id, weekday);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE oaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (anon users can read)
CREATE POLICY "Allow public read on stations" ON stations FOR SELECT USING (true);
CREATE POLICY "Allow public read on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read on posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Allow public read on oaps" ON oaps FOR SELECT USING (true);
CREATE POLICY "Allow public read on schedules" ON schedules FOR SELECT USING (true);

-- Service role has full access (for admin operations via API)
CREATE POLICY "Allow service role full access on stations" ON stations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access on categories" ON categories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access on posts" ON posts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access on oaps" ON oaps FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role full access on schedules" ON schedules FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to generate CUID-like IDs (for manual use if needed)
CREATE OR REPLACE FUNCTION generate_cuid()
RETURNS TEXT AS $$
BEGIN
  RETURN concat('c', to_hex(extract(epoch from now())::bigint), substr(md5(random()::text), 1, 12));
END;
$$ LANGUAGE plpgsql SET search_path = '';
