/**
 * Supabase Connection & Schema Test Script
 *
 * This script tests direct Supabase database connectivity and validates the schema.
 *
 * Prerequisites:
 * 1. Set up Supabase project and run the schema.sql
 * 2. Configure environment variables:
 *    - NEXT_PUBLIC_SUPABASE_URL
 *    - NEXT_PUBLIC_SUPABASE_ANON_KEY
 *    - SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: npx tsx scripts/tests/test-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: unknown;
}

const results: TestResult[] = [];

function addResult(name: string, passed: boolean, error?: string, details?: unknown) {
  results.push({ name, passed, error, details });
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}`);
  if (error) console.log(`   Error: ${error}`);
}

async function runTests() {
  console.log('\n====================================');
  console.log('  SUPABASE CONNECTION TEST SUITE');
  console.log('====================================\n');

  // Check environment variables
  console.log('--- ENVIRONMENT CHECK ---');

  if (!supabaseUrl) {
    addResult('NEXT_PUBLIC_SUPABASE_URL', false, 'Not set');
    console.log('\nPlease set your Supabase environment variables.');
    console.log('Required:');
    console.log('  - NEXT_PUBLIC_SUPABASE_URL');
    console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('  - SUPABASE_SERVICE_ROLE_KEY (for admin operations)\n');
    process.exit(1);
  }

  addResult('NEXT_PUBLIC_SUPABASE_URL', true);
  addResult('NEXT_PUBLIC_SUPABASE_ANON_KEY', !!supabaseAnonKey, supabaseAnonKey ? undefined : 'Not set');
  addResult('SUPABASE_SERVICE_ROLE_KEY', !!supabaseServiceKey, supabaseServiceKey ? undefined : 'Not set (optional but recommended)');

  console.log(`\nSupabase URL: ${supabaseUrl}`);

  // Create clients
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
  const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl!, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : supabase;

  console.log('\n--- CONNECTION TEST ---');

  // Test basic connection
  try {
    const { data, error } = await supabase.from('stations').select('count').limit(1);
    if (error) throw error;
    addResult('Basic connection test', true);
  } catch (err) {
    addResult('Basic connection test', false, String(err));
    console.log('\nConnection failed. Please check:');
    console.log('1. Your Supabase project is running');
    console.log('2. Environment variables are correct');
    console.log('3. The schema has been applied to your database\n');
    process.exit(1);
  }

  console.log('\n--- SCHEMA VALIDATION ---');

  // Test each table exists
  const tables = ['stations', 'posts', 'categories', 'oaps', 'schedules'];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error) throw error;
      addResult(`Table '${table}' exists and accessible`, true);
    } catch (err) {
      addResult(`Table '${table}' exists and accessible`, false, String(err));
    }
  }

  console.log('\n--- CRUD OPERATIONS TEST ---');

  const testStationId = `test-station-${Date.now()}`;

  // Test Station CRUD
  try {
    // Create
    const { error: createError } = await supabaseAdmin.from('stations').insert({
      id: testStationId,
      name: 'Test Station',
      stream_url: 'https://test.stream/url',
    });
    if (createError) throw createError;
    addResult('Create station', true);

    // Read
    const { data: readData, error: readError } = await supabase
      .from('stations')
      .select('*')
      .eq('id', testStationId)
      .single();
    if (readError) throw readError;
    addResult('Read station', true, undefined, readData);

    // Update
    const { error: updateError } = await supabaseAdmin
      .from('stations')
      .update({ name: 'Updated Test Station' })
      .eq('id', testStationId);
    if (updateError) throw updateError;
    addResult('Update station', true);

    // Delete
    const { error: deleteError } = await supabaseAdmin
      .from('stations')
      .delete()
      .eq('id', testStationId);
    if (deleteError) throw deleteError;
    addResult('Delete station', true);
  } catch (err) {
    addResult('Station CRUD', false, String(err));
  }

  // Test Category with foreign key
  const testCategoryId = `test-category-${Date.now()}`;
  const testPostId = `test-post-${Date.now()}`;

  try {
    // First create a station for the category
    await supabaseAdmin.from('stations').insert({
      id: testStationId,
      name: 'Test Station',
      stream_url: 'https://test.stream/url',
    });

    // Create category
    const { error: catError } = await supabaseAdmin.from('categories').insert({
      id: testCategoryId,
      name: 'Test Category',
      slug: 'test-category',
      visible: true,
      station_id: testStationId,
    });
    if (catError) throw catError;
    addResult('Create category with foreign key', true);

    // Create post with category
    const { error: postError } = await supabaseAdmin.from('posts').insert({
      id: testPostId,
      title: 'Test Post',
      slug: 'test-post',
      published: false,
      station_id: testStationId,
      category_id: testCategoryId,
    });
    if (postError) throw postError;
    addResult('Create post with category reference', true);

    // Test join query
    const { data: joinData, error: joinError } = await supabase
      .from('posts')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('id', testPostId)
      .single();
    if (joinError) throw joinError;
    addResult('Join query (post with category)', true, undefined, joinData);

    // Cleanup
    await supabaseAdmin.from('posts').delete().eq('id', testPostId);
    await supabaseAdmin.from('categories').delete().eq('id', testCategoryId);
    await supabaseAdmin.from('stations').delete().eq('id', testStationId);
    addResult('Cleanup test data', true);
  } catch (err) {
    addResult('Foreign key & join tests', false, String(err));
    // Attempt cleanup
    await supabaseAdmin.from('posts').delete().eq('id', testPostId).catch(() => {});
    await supabaseAdmin.from('categories').delete().eq('id', testCategoryId).catch(() => {});
    await supabaseAdmin.from('stations').delete().eq('id', testStationId).catch(() => {});
  }

  // Test OAP with array field
  const testOapId = `test-oap-${Date.now()}`;

  try {
    // Create station for OAP
    await supabaseAdmin.from('stations').insert({
      id: testStationId,
      name: 'Test Station',
      stream_url: 'https://test.stream/url',
    });

    // Create OAP with shows array
    const { error: oapError } = await supabaseAdmin.from('oaps').insert({
      id: testOapId,
      name: 'Test OAP',
      slug: 'test-oap',
      bio: 'Test bio',
      photo_url: '/test.jpg',
      shows: ['Morning Show', 'Evening Drive'],
      station_id: testStationId,
    });
    if (oapError) throw oapError;
    addResult('Create OAP with array field (shows)', true);

    // Read OAP
    const { data: oapData, error: readOapError } = await supabase
      .from('oaps')
      .select('*')
      .eq('id', testOapId)
      .single();
    if (readOapError) throw readOapError;

    const hasArray = Array.isArray(oapData.shows) && oapData.shows.length === 2;
    addResult('Read OAP array field correctly', hasArray, hasArray ? undefined : 'Array not preserved', oapData);

    // Cleanup
    await supabaseAdmin.from('oaps').delete().eq('id', testOapId);
    await supabaseAdmin.from('stations').delete().eq('id', testStationId);
  } catch (err) {
    addResult('OAP with array field', false, String(err));
    await supabaseAdmin.from('oaps').delete().eq('id', testOapId).catch(() => {});
    await supabaseAdmin.from('stations').delete().eq('id', testStationId).catch(() => {});
  }

  // Test RLS (Row Level Security)
  console.log('\n--- RLS TEST ---');

  try {
    // Create test data with admin client
    await supabaseAdmin.from('stations').insert({
      id: testStationId,
      name: 'RLS Test Station',
      stream_url: 'https://test.stream/url',
    });

    // Read with anon client should work (public read)
    const { error: readError } = await supabase
      .from('stations')
      .select('*')
      .eq('id', testStationId);
    addResult('RLS: Public read allowed', !readError, readError ? String(readError) : undefined);

    // Write with anon client should fail (no auth)
    const { error: writeError } = await supabase
      .from('stations')
      .insert({
        id: 'rls-test-fail',
        name: 'Should Fail',
        stream_url: 'https://test.stream/url',
      });
    addResult('RLS: Public write blocked', !!writeError, writeError ? undefined : 'Write should have been blocked');

    // Cleanup
    await supabaseAdmin.from('stations').delete().eq('id', testStationId);
    await supabaseAdmin.from('stations').delete().eq('id', 'rls-test-fail').catch(() => {});
  } catch (err) {
    addResult('RLS tests', false, String(err));
    await supabaseAdmin.from('stations').delete().eq('id', testStationId).catch(() => {});
  }

  // Summary
  console.log('\n====================================');
  console.log('          TEST SUMMARY');
  console.log('====================================');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('Failed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }

  console.log('\n====================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
