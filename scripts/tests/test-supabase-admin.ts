/**
 * Comprehensive Admin API Test Script
 *
 * This script tests ALL admin functionalities including:
 * - Stations API (GET, POST)
 * - Schedule API (GET, POST, DELETE)
 * - OAPs API (GET, POST, DELETE)
 * - Blog API (GET, POST, GET by slug, DELETE)
 * - Categories API (GET, POST)
 * - Upload APIs (OAP photos, blog images, show thumbnails, general thumbnails)
 * - File serving APIs
 *
 * Prerequisites:
 * 1. Set up Supabase project and run the schema.sql
 * 2. Configure environment variables
 * 3. Start the development server: npm run dev
 *
 * Run: npm run test:admin
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_STATION_ID = 'lounge877'; // Use existing station for tests

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

// Helper function to make API calls
async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 0, data: { error: String(error) } };
  }
}

// Helper function for FormData requests (upload tests)
async function formDataCall(
  endpoint: string,
  formData: FormData
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 0, data: { error: String(error) } };
  }
}

// Test helper
function addResult(name: string, passed: boolean, error?: string, details?: string) {
  results.push({ name, passed, error, details });
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}`);
  if (error) console.log(`   ${error}`);
}

// ============================================
// STATION TESTS
// ============================================

async function testStationsGet() {
  const { ok, data } = await apiCall('/api/stations');
  const isArray = Array.isArray(data);
  addResult(
    'GET /api/stations - Fetch all stations',
    ok && isArray,
    ok ? undefined : 'Failed to fetch stations',
    isArray ? `Found ${(data as unknown[]).length} stations` : undefined
  );
  return ok;
}

async function testStationsSave() {
  const testStation = {
    id: 'test-station-temp',
    name: 'Test Station',
    streamUrl: 'https://test-stream.example.com/stream',
  };

  const { ok, status, data } = await apiCall('/api/stations/save', {
    method: 'POST',
    body: JSON.stringify(testStation),
  });

  const expectedUnauth = status === 401;
  addResult(
    'POST /api/stations/save - Create/Update station',
    expectedUnauth || ok,
    expectedUnauth ? 'Auth required (expected without session)' : (ok ? 'Station saved successfully' : 'Failed to save station')
  );
  return ok || expectedUnauth;
}

// ============================================
// SCHEDULE TESTS
// ============================================

async function testScheduleGet() {
  const { ok, data } = await apiCall(`/api/schedule?stationId=${TEST_STATION_ID}`);
  const isArray = Array.isArray(data);
  addResult(
    'GET /api/schedule - Fetch schedule slots',
    ok && isArray,
    ok ? undefined : 'Failed to fetch schedule',
    isArray ? `Found ${(data as unknown[]).length} schedule slots` : undefined
  );
  return ok;
}

async function testScheduleSave() {
  const testSlot = {
    stationId: TEST_STATION_ID,
    scheduleSlot: {
      id: 'new-test-slot',
      showTitle: 'Test Morning Show',
      startTime: '06:00',
      endTime: '09:00',
      description: 'A test show for validation',
      weekday: 1,
    },
  };

  const { ok, status } = await apiCall('/api/schedule/save', {
    method: 'POST',
    body: JSON.stringify(testSlot),
  });

  const expectedUnauth = status === 401;
  addResult(
    'POST /api/schedule/save - Create/Update schedule slot',
    expectedUnauth || ok,
    expectedUnauth ? 'Auth required (expected without session)' : (ok ? 'Schedule saved successfully' : 'Failed to save schedule')
  );
  return ok || expectedUnauth;
}

async function testScheduleDelete() {
  const { ok, status } = await apiCall('/api/schedule/delete', {
    method: 'DELETE',
    body: JSON.stringify({
      stationId: TEST_STATION_ID,
      scheduleSlotId: 'test-slot-id',
    }),
  });

  const expectedUnauth = status === 401;
  const expected404 = status === 404;
  addResult(
    'DELETE /api/schedule/delete - Delete schedule slot',
    expectedUnauth || expected404 || ok,
    expectedUnauth ? 'Auth required (expected without session)' : (expected404 ? 'Slot not found (expected for test ID)' : undefined)
  );
  return ok || expectedUnauth || expected404;
}

// ============================================
// OAP TESTS
// ============================================

async function testOapsGet() {
  const { ok, data } = await apiCall(`/api/oaps?stationId=${TEST_STATION_ID}`);
  const isArray = Array.isArray(data);
  addResult(
    'GET /api/oaps - Fetch all OAPs',
    ok && isArray,
    ok ? undefined : 'Failed to fetch OAPs',
    isArray ? `Found ${(data as unknown[]).length} OAPs` : undefined
  );
  return ok;
}

async function testOapsSave() {
  const testOap = {
    stationId: TEST_STATION_ID,
    oaps: [
      {
        id: 'new-test-oap',
        name: 'Test Host',
        bio: 'A test on-air personality',
        photoUrl: '/test-photo.jpg',
        shows: ['Morning Show', 'Evening Drive'],
      },
    ],
  };

  const { ok, status } = await apiCall('/api/oaps/save', {
    method: 'POST',
    body: JSON.stringify(testOap),
  });

  const expectedUnauth = status === 401;
  addResult(
    'POST /api/oaps/save - Create/Update OAPs',
    expectedUnauth || ok,
    expectedUnauth ? 'Auth required (expected without session)' : (ok ? 'OAPs saved successfully' : 'Failed to save OAPs')
  );
  return ok || expectedUnauth;
}

async function testOapDelete() {
  const { ok, status } = await apiCall('/api/oaps/test-oap-id', {
    method: 'DELETE',
  });

  const expected404 = status === 404;
  const expectedUnauth = status === 401;
  addResult(
    'DELETE /api/oaps/[id] - Delete OAP',
    expected404 || expectedUnauth || ok,
    expected404 ? 'OAP not found (expected for test ID)' : (expectedUnauth ? 'Auth required (expected without session)' : undefined)
  );
  return ok || expected404 || expectedUnauth;
}

// ============================================
// BLOG TESTS
// ============================================

async function testBlogGet() {
  const { ok, data } = await apiCall(`/api/blog?stationId=${TEST_STATION_ID}`);
  const hasPostsArray = ok && typeof data === 'object' && data !== null && 'posts' in data;
  const postsCount = hasPostsArray ? ((data as { posts: unknown[] }).posts || []).length : 0;
  addResult(
    'GET /api/blog - Fetch all posts',
    hasPostsArray,
    hasPostsArray ? undefined : 'Failed to fetch posts',
    hasPostsArray ? `Found ${postsCount} posts` : undefined
  );
  return hasPostsArray;
}

async function testBlogSave() {
  const testPost = {
    stationId: TEST_STATION_ID,
    post: {
      slug: 'test-post-slug',
      title: 'Test Blog Post',
      excerpt: 'This is a test post excerpt',
      content: 'This is the full content of the test post.',
      category: 'Test Category',
      published: false,
    },
  };

  const { ok, status } = await apiCall('/api/blog/save', {
    method: 'POST',
    body: JSON.stringify(testPost),
  });

  const expectedUnauth = status === 401;
  addResult(
    'POST /api/blog/save - Create/Update blog post',
    expectedUnauth || ok,
    expectedUnauth ? 'Auth required (expected without session)' : (ok ? 'Post saved successfully' : 'Failed to save post')
  );
  return ok || expectedUnauth;
}

async function testBlogGetBySlug() {
  // Test with an existing slug from the station
  const { ok, status, data } = await apiCall(`/api/blog/lounge-post-1?stationId=${TEST_STATION_ID}`);
  const expected404 = status === 404;
  const hasPost = ok && typeof data === 'object' && data !== null && 'id' in data;
  addResult(
    'GET /api/blog/[slug] - Fetch single post by slug',
    expected404 || hasPost,
    expected404 ? 'Post not found (may not exist or unpublished)' : (hasPost ? 'Post fetched successfully' : 'Failed to fetch post')
  );
  return ok || expected404;
}

async function testBlogDelete() {
  const { ok, status } = await apiCall('/api/blog/delete', {
    method: 'POST',
    body: JSON.stringify({
      stationId: TEST_STATION_ID,
      slug: 'test-post-slug',
    }),
  });

  const expectedUnauth = status === 401;
  addResult(
    'POST /api/blog/delete - Delete blog post',
    expectedUnauth || ok,
    expectedUnauth ? 'Auth required (expected without session)' : (ok ? 'Post deleted successfully' : 'Failed to delete post')
  );
  return ok || expectedUnauth;
}

// ============================================
// CATEGORY TESTS
// ============================================

async function testCategoriesGet() {
  const { ok, data } = await apiCall(`/api/categories/get?stationId=${TEST_STATION_ID}`);
  const hasCategoriesArray = ok && typeof data === 'object' && data !== null && 'categories' in data;
  const categoriesCount = hasCategoriesArray ? ((data as { categories: unknown[] }).categories || []).length : 0;
  addResult(
    'GET /api/categories/get - Fetch all categories',
    hasCategoriesArray,
    hasCategoriesArray ? undefined : 'Failed to fetch categories',
    hasCategoriesArray ? `Found ${categoriesCount} categories` : undefined
  );
  return hasCategoriesArray;
}

async function testCategoriesSave() {
  const testCategory = {
    stationId: TEST_STATION_ID,
    category: {
      id: `test-category-${Date.now()}`,
      name: 'Test Category',
      slug: 'test-category',
      visible: true,
    },
  };

  const { ok, status } = await apiCall('/api/categories/save', {
    method: 'POST',
    body: JSON.stringify(testCategory),
  });

  const expectedUnauth = status === 401;
  addResult(
    'POST /api/categories/save - Create category',
    expectedUnauth || ok,
    expectedUnauth ? 'Auth required (expected without session)' : (ok ? 'Category saved successfully' : 'Failed to save category')
  );
  return ok || expectedUnauth;
}

// ============================================
// UPLOAD ENDPOINT TESTS
// ============================================

async function testUploadOapPhoto() {
  // Create a minimal test FormData (will fail validation but tests auth)
  const formData = new FormData();
  // Don't add file to test missing file validation

  const { ok, status, data } = await formDataCall('/api/upload', formData);

  const expectedUnauth = status === 401;
  const expectedBadRequest = status === 400; // Missing file
  addResult(
    'POST /api/upload - Upload OAP photo',
    expectedUnauth || expectedBadRequest,
    expectedUnauth ? 'Auth required (expected without session)' :
      (expectedBadRequest ? 'Validation works (missing file rejected)' : 'Unexpected response')
  );
  return expectedUnauth || expectedBadRequest;
}

async function testUploadBlogImage() {
  const formData = new FormData();
  // Don't add file to test missing file validation

  const { ok, status } = await formDataCall('/api/upload/blog', formData);

  const expectedUnauth = status === 401;
  const expectedBadRequest = status === 400;
  addResult(
    'POST /api/upload/blog - Upload blog image',
    expectedUnauth || expectedBadRequest,
    expectedUnauth ? 'Auth required (expected without session)' :
      (expectedBadRequest ? 'Validation works (missing file rejected)' : 'Unexpected response')
  );
  return expectedUnauth || expectedBadRequest;
}

async function testUploadBlogImageDelete() {
  const { ok, status } = await apiCall('/api/upload/blog?stationId=test&filename=test.jpg', {
    method: 'DELETE',
  });

  const expectedUnauth = status === 401;
  const expected404 = status === 404;
  const expectedBadRequest = status === 400;
  addResult(
    'DELETE /api/upload/blog - Delete blog image',
    expectedUnauth || expected404 || expectedBadRequest,
    expectedUnauth ? 'Auth required (expected without session)' :
      (expected404 ? 'File not found (expected for test file)' :
        (expectedBadRequest ? 'Validation works' : 'Unexpected response'))
  );
  return expectedUnauth || expected404 || expectedBadRequest;
}

async function testUploadShowThumbnail() {
  const formData = new FormData();
  // Don't add file to test missing file validation

  const { ok, status } = await formDataCall('/api/upload/shows', formData);

  const expectedUnauth = status === 401;
  const expectedBadRequest = status === 400;
  addResult(
    'POST /api/upload/shows - Upload show thumbnail',
    expectedUnauth || expectedBadRequest,
    expectedUnauth ? 'Auth required (expected without session)' :
      (expectedBadRequest ? 'Validation works (missing file rejected)' : 'Unexpected response')
  );
  return expectedUnauth || expectedBadRequest;
}

async function testUploadGeneralThumbnail() {
  const formData = new FormData();
  // Don't add file to test missing file validation

  const { ok, status } = await formDataCall('/api/upload/thumbnail', formData);

  const expectedUnauth = status === 401;
  const expectedBadRequest = status === 400;
  addResult(
    'POST /api/upload/thumbnail - Upload general thumbnail',
    expectedUnauth || expectedBadRequest,
    expectedUnauth ? 'Auth required (expected without session)' :
      (expectedBadRequest ? 'Validation works (missing file rejected)' : 'Unexpected response')
  );
  return expectedUnauth || expectedBadRequest;
}

// ============================================
// FILE SERVING TESTS
// ============================================

async function testFileServingBlog() {
  const response = await fetch(`${BASE_URL}/api/files/blog/test/test.jpg`);
  const expected404 = response.status === 404;
  const expectedOk = response.ok;
  addResult(
    'GET /api/files/blog/[...path] - Serve blog images',
    expected404 || expectedOk,
    expected404 ? 'File not found (expected for test path)' :
      (expectedOk ? 'File served successfully' : 'Unexpected error')
  );
  return expected404 || expectedOk;
}

async function testFileServingGeneral() {
  const response = await fetch(`${BASE_URL}/api/files/general/test.jpg`);
  const expected404 = response.status === 404;
  const expectedOk = response.ok;
  addResult(
    'GET /api/files/general/[...path] - Serve general files',
    expected404 || expectedOk,
    expected404 ? 'File not found (expected for test path)' :
      (expectedOk ? 'File served successfully' : 'Unexpected error')
  );
  return expected404 || expectedOk;
}

async function testFileServingOaps() {
  const response = await fetch(`${BASE_URL}/api/files/oaps/test.jpg`);
  const expected404 = response.status === 404;
  const expectedOk = response.ok;
  addResult(
    'GET /api/files/oaps/[...path] - Serve OAP photos',
    expected404 || expectedOk,
    expected404 ? 'File not found (expected for test path)' :
      (expectedOk ? 'File served successfully' : 'Unexpected error')
  );
  return expected404 || expectedOk;
}

async function testFileServingShows() {
  const response = await fetch(`${BASE_URL}/api/files/shows/test/test.jpg`);
  const expected404 = response.status === 404;
  const expectedOk = response.ok;
  addResult(
    'GET /api/files/shows/[...path] - Serve show images',
    expected404 || expectedOk,
    expected404 ? 'File not found (expected for test path)' :
      (expectedOk ? 'File served successfully' : 'Unexpected error')
  );
  return expected404 || expectedOk;
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
  console.log('\n====================================');
  console.log('  COMPREHENSIVE ADMIN API TEST SUITE');
  console.log('====================================\n');
  console.log(`Testing against: ${BASE_URL}`);
  console.log(`Test station: ${TEST_STATION_ID}\n`);

  // DATA API TESTS
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  DATA APIs');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('--- STATIONS (2 tests) ---');
  await testStationsGet();
  await testStationsSave();

  console.log('\n--- SCHEDULE (3 tests) ---');
  await testScheduleGet();
  await testScheduleSave();
  await testScheduleDelete();

  console.log('\n--- OAPs (3 tests) ---');
  await testOapsGet();
  await testOapsSave();
  await testOapDelete();

  console.log('\n--- BLOG (4 tests) ---');
  await testBlogGet();
  await testBlogSave();
  await testBlogGetBySlug();
  await testBlogDelete();

  console.log('\n--- CATEGORIES (2 tests) ---');
  await testCategoriesGet();
  await testCategoriesSave();

  // UPLOAD API TESTS
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  UPLOAD APIs');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('--- UPLOAD ENDPOINTS (5 tests) ---');
  await testUploadOapPhoto();
  await testUploadBlogImage();
  await testUploadBlogImageDelete();
  await testUploadShowThumbnail();
  await testUploadGeneralThumbnail();

  // FILE SERVING TESTS
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  FILE SERVING APIs');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('--- FILE SERVING (4 tests) ---');
  await testFileServingBlog();
  await testFileServingGeneral();
  await testFileServingOaps();
  await testFileServingShows();

  // Summary
  console.log('\n====================================');
  console.log('          TEST SUMMARY');
  console.log('====================================');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n--- Failed Tests ---');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ❌ ${r.name}`);
      if (r.error) console.log(`     ${r.error}`);
    });
  }

  // Coverage summary
  console.log('\n--- Coverage Summary ---');
  console.log('Data APIs:      14 endpoints tested');
  console.log('Upload APIs:     5 endpoints tested');
  console.log('File Serving:    4 endpoints tested');
  console.log('Total:          23 endpoint tests');

  console.log('\n====================================\n');

  // Exit with error code if tests failed
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(console.error);
