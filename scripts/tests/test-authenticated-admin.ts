/**
 * Authenticated Admin API Test Script
 *
 * This script tests ALL admin functionalities WITH authentication.
 * It performs actual CRUD operations to verify full functionality.
 *
 * Prerequisites:
 * 1. Set up Supabase project and run the schema.sql
 * 2. Configure environment variables
 * 3. Start the development server: npm run dev
 * 4. Set ADMIN_SESSION_COOKIE environment variable with a valid session
 *
 * Get session cookie:
 * 1. Log in to /admin/login
 * 2. Open DevTools > Application > Cookies
 * 3. Copy the 'next-auth.session-token' value
 *
 * Run: ADMIN_SESSION_COOKIE="next-auth.session-token=your-token" npm run test:admin:auth
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE || '';
const TEST_STATION_ID = 'lounge877'; // Use existing station

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];
const timestamp = Date.now();

// Helper function to make authenticated API calls
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
        Cookie: SESSION_COOKIE,
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
      headers: {
        Cookie: SESSION_COOKIE,
      },
    });

    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 0, data: { error: String(error) } };
  }
}

function addResult(name: string, passed: boolean, error?: string, details?: string) {
  results.push({ name, passed, error, details });
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}`);
  if (error) console.log(`   ${error}`);
  if (details) console.log(`   ${details}`);
}

// ============================================
// STATION TESTS
// ============================================

async function testStationsGet() {
  const { ok, data } = await apiCall('/api/stations');
  const isArray = Array.isArray(data);
  addResult(
    'GET /api/stations',
    ok && isArray,
    undefined,
    isArray ? `Found ${(data as unknown[]).length} stations` : undefined
  );
  return ok;
}

async function testStationCreateUpdate() {
  const testId = `test-station-${timestamp}`;

  // Create
  const { ok: created, status, data } = await apiCall('/api/stations/save', {
    method: 'POST',
    body: JSON.stringify({
      id: testId,
      name: 'Test Station Auth',
      streamUrl: 'https://test.example.com/stream',
    }),
  });

  if (status === 401) {
    addResult('POST /api/stations/save - Create', false, 'Auth failed - check session cookie');
    return false;
  }

  addResult(
    'POST /api/stations/save - Create',
    created,
    created ? 'Station created' : `Failed: ${JSON.stringify(data)}`
  );

  // Update
  const { ok: updated } = await apiCall('/api/stations/save', {
    method: 'POST',
    body: JSON.stringify({
      id: testId,
      name: 'Test Station Auth Updated',
      streamUrl: 'https://test.example.com/stream-v2',
    }),
  });

  addResult(
    'POST /api/stations/save - Update',
    updated,
    updated ? 'Station updated' : 'Update failed'
  );

  return created;
}

// ============================================
// SCHEDULE TESTS
// ============================================

async function testScheduleGet() {
  const { ok, data } = await apiCall(`/api/schedule?stationId=${TEST_STATION_ID}`);
  const isArray = Array.isArray(data);
  addResult(
    'GET /api/schedule',
    ok && isArray,
    undefined,
    isArray ? `Found ${(data as unknown[]).length} slots` : undefined
  );
  return ok;
}

async function testScheduleCRUD() {
  const testSlug = `test-show-${timestamp}`;

  // Create
  const { ok: created, data: createData } = await apiCall('/api/schedule/save', {
    method: 'POST',
    body: JSON.stringify({
      stationId: TEST_STATION_ID,
      scheduleSlot: {
        id: `new-${testSlug}`,
        showTitle: 'Auth Test Show',
        startTime: '22:00',
        endTime: '23:00',
        description: 'Created by auth test',
        weekday: 0,
        slug: testSlug,
      },
    }),
  });

  let createdId = '';
  if (created && createData && typeof createData === 'object') {
    const slot = (createData as { scheduleSlot?: { id?: string } }).scheduleSlot;
    createdId = slot?.id || '';
  }

  addResult(
    'POST /api/schedule/save - Create',
    created,
    created ? `ID: ${createdId}` : `Failed: ${JSON.stringify(createData)}`
  );

  if (createdId) {
    // Update
    const { ok: updated } = await apiCall('/api/schedule/save', {
      method: 'POST',
      body: JSON.stringify({
        stationId: TEST_STATION_ID,
        scheduleSlot: {
          id: createdId,
          showTitle: 'Auth Test Show Updated',
          startTime: '22:00',
          endTime: '23:30',
          description: 'Updated by auth test',
          weekday: 0,
        },
      }),
    });

    addResult(
      'POST /api/schedule/save - Update',
      updated,
      updated ? 'Slot updated' : 'Update failed'
    );

    // Delete
    const { ok: deleted } = await apiCall('/api/schedule/delete', {
      method: 'DELETE',
      body: JSON.stringify({
        stationId: TEST_STATION_ID,
        scheduleSlotId: createdId,
      }),
    });

    addResult(
      'DELETE /api/schedule/delete',
      deleted,
      deleted ? 'Slot deleted' : 'Delete failed'
    );
  }

  return created;
}

// ============================================
// OAP TESTS
// ============================================

async function testOapsGet() {
  const { ok, data } = await apiCall(`/api/oaps?stationId=${TEST_STATION_ID}`);
  const isArray = Array.isArray(data);
  addResult(
    'GET /api/oaps',
    ok && isArray,
    undefined,
    isArray ? `Found ${(data as unknown[]).length} OAPs` : undefined
  );
  return ok;
}

async function testOapsCRUD() {
  const testId = `test-oap-${timestamp}`;

  // Create
  const { ok: created } = await apiCall('/api/oaps/save', {
    method: 'POST',
    body: JSON.stringify({
      stationId: TEST_STATION_ID,
      oaps: [{
        id: testId,
        name: 'Auth Test OAP',
        slug: `auth-test-oap-${timestamp}`,
        bio: 'Created by auth test',
        photoUrl: '/placeholder.jpg',
        shows: ['Test Show 1', 'Test Show 2'],
      }],
    }),
  });

  addResult(
    'POST /api/oaps/save - Create',
    created,
    created ? 'OAP created' : 'Create failed'
  );

  if (created) {
    // Update
    const { ok: updated } = await apiCall('/api/oaps/save', {
      method: 'POST',
      body: JSON.stringify({
        stationId: TEST_STATION_ID,
        oaps: [{
          id: testId,
          name: 'Auth Test OAP Updated',
          slug: `auth-test-oap-updated-${timestamp}`,
          bio: 'Updated by auth test',
          photoUrl: '/placeholder.jpg',
          shows: ['Updated Show'],
        }],
      }),
    });

    addResult(
      'POST /api/oaps/save - Update',
      updated,
      updated ? 'OAP updated' : 'Update failed'
    );

    // Delete
    const { ok: deleted } = await apiCall(`/api/oaps/${testId}`, {
      method: 'DELETE',
    });

    addResult(
      'DELETE /api/oaps/[id]',
      deleted,
      deleted ? 'OAP deleted' : 'Delete failed'
    );
  }

  return created;
}

// ============================================
// BLOG TESTS
// ============================================

async function testBlogGet() {
  const { ok, data } = await apiCall(`/api/blog?stationId=${TEST_STATION_ID}`);
  const hasPosts = ok && typeof data === 'object' && data !== null && 'posts' in data;
  addResult(
    'GET /api/blog',
    hasPosts,
    undefined,
    hasPosts ? `Found ${((data as { posts: unknown[] }).posts || []).length} posts` : undefined
  );
  return hasPosts;
}

async function testBlogCRUD() {
  const testSlug = `test-post-${timestamp}`;

  // Create
  const { ok: created } = await apiCall('/api/blog/save', {
    method: 'POST',
    body: JSON.stringify({
      stationId: TEST_STATION_ID,
      post: {
        title: 'Auth Test Post',
        slug: testSlug,
        excerpt: 'Test excerpt',
        content: 'Test content from auth test.',
        published: false,
      },
    }),
  });

  addResult(
    'POST /api/blog/save - Create',
    created,
    created ? 'Post created' : 'Create failed'
  );

  // Get by slug
  const { ok: fetched, status } = await apiCall(`/api/blog/${testSlug}?stationId=${TEST_STATION_ID}`);
  addResult(
    'GET /api/blog/[slug]',
    fetched || status === 404,
    fetched ? 'Post fetched' : 'Post not found (may be unpublished)'
  );

  if (created) {
    // Update
    const { ok: updated } = await apiCall('/api/blog/save', {
      method: 'POST',
      body: JSON.stringify({
        stationId: TEST_STATION_ID,
        post: {
          title: 'Auth Test Post Updated',
          slug: testSlug,
          excerpt: 'Updated excerpt',
          content: 'Updated content.',
          published: false,
        },
      }),
    });

    addResult(
      'POST /api/blog/save - Update',
      updated,
      updated ? 'Post updated' : 'Update failed'
    );

    // Delete
    const { ok: deleted } = await apiCall('/api/blog/delete', {
      method: 'POST',
      body: JSON.stringify({
        stationId: TEST_STATION_ID,
        slug: testSlug,
      }),
    });

    addResult(
      'POST /api/blog/delete',
      deleted,
      deleted ? 'Post deleted' : 'Delete failed'
    );
  }

  return created;
}

// ============================================
// CATEGORY TESTS
// ============================================

async function testCategoriesGet() {
  const { ok, data } = await apiCall(`/api/categories/get?stationId=${TEST_STATION_ID}`);
  const hasCats = ok && typeof data === 'object' && data !== null && 'categories' in data;
  addResult(
    'GET /api/categories/get',
    hasCats,
    undefined,
    hasCats ? `Found ${((data as { categories: unknown[] }).categories || []).length} categories` : undefined
  );
  return hasCats;
}

async function testCategoryCreate() {
  const testId = `test-cat-${timestamp}`;

  const { ok: created } = await apiCall('/api/categories/save', {
    method: 'POST',
    body: JSON.stringify({
      stationId: TEST_STATION_ID,
      category: {
        id: testId,
        name: `Auth Test Category ${timestamp}`,
        slug: testId,
        visible: true,
      },
    }),
  });

  addResult(
    'POST /api/categories/save - Create',
    created,
    created ? 'Category created' : 'Create failed'
  );

  return created;
}

// ============================================
// UPLOAD TESTS (with auth)
// ============================================

async function testUploadOapPhoto() {
  // Create a minimal test - tests auth and validation
  const formData = new FormData();
  // Empty formData to test validation

  const { status } = await formDataCall('/api/upload', formData);

  // With auth, should get 400 (missing file) not 401
  const passed = status === 400;
  addResult(
    'POST /api/upload - OAP photo validation',
    passed,
    passed ? 'Validation works (400 for missing file)' : `Unexpected status: ${status}`
  );
  return passed;
}

async function testUploadBlogImage() {
  const formData = new FormData();

  const { status } = await formDataCall('/api/upload/blog', formData);

  const passed = status === 400;
  addResult(
    'POST /api/upload/blog - Blog image validation',
    passed,
    passed ? 'Validation works (400 for missing file)' : `Unexpected status: ${status}`
  );
  return passed;
}

async function testUploadShowThumbnail() {
  const formData = new FormData();

  const { status } = await formDataCall('/api/upload/shows', formData);

  const passed = status === 400;
  addResult(
    'POST /api/upload/shows - Show thumbnail validation',
    passed,
    passed ? 'Validation works (400 for missing file)' : `Unexpected status: ${status}`
  );
  return passed;
}

async function testUploadGeneralThumbnail() {
  const formData = new FormData();

  const { status } = await formDataCall('/api/upload/thumbnail', formData);

  const passed = status === 400;
  addResult(
    'POST /api/upload/thumbnail - General thumbnail validation',
    passed,
    passed ? 'Validation works (400 for missing file)' : `Unexpected status: ${status}`
  );
  return passed;
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
  console.log('\n====================================');
  console.log('  AUTHENTICATED ADMIN API TESTS');
  console.log('====================================\n');
  console.log(`Testing against: ${BASE_URL}`);
  console.log(`Test station: ${TEST_STATION_ID}`);
  console.log(`Session cookie: ${SESSION_COOKIE ? 'PROVIDED' : 'NOT PROVIDED'}\n`);

  if (!SESSION_COOKIE) {
    console.log('⚠️  WARNING: No session cookie provided!');
    console.log('   Write operations will fail with 401.\n');
    console.log('To get the session cookie:');
    console.log('1. Log in to /admin/login');
    console.log('2. Open DevTools > Application > Cookies');
    console.log('3. Copy "next-auth.session-token" value');
    console.log('4. Run with: ADMIN_SESSION_COOKIE="next-auth.session-token=<value>" npm run test:admin:auth\n');
  }

  // DATA APIs
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  DATA APIs');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('--- STATIONS ---');
  await testStationsGet();
  const stationOk = await testStationCreateUpdate();

  if (!stationOk && SESSION_COOKIE) {
    console.log('\n⚠️  Station creation failed. Session may be expired.');
    console.log('Please log in again and update the session cookie.\n');
  }

  console.log('\n--- SCHEDULE ---');
  await testScheduleGet();
  await testScheduleCRUD();

  console.log('\n--- OAPs ---');
  await testOapsGet();
  await testOapsCRUD();

  console.log('\n--- BLOG ---');
  await testBlogGet();
  await testBlogCRUD();

  console.log('\n--- CATEGORIES ---');
  await testCategoriesGet();
  await testCategoryCreate();

  // UPLOAD APIs
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  UPLOAD APIs');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('--- UPLOAD VALIDATION ---');
  await testUploadOapPhoto();
  await testUploadBlogImage();
  await testUploadShowThumbnail();
  await testUploadGeneralThumbnail();

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

  // Coverage
  console.log('\n--- Test Coverage ---');
  console.log('Stations:    GET, CREATE, UPDATE');
  console.log('Schedule:    GET, CREATE, UPDATE, DELETE');
  console.log('OAPs:        GET, CREATE, UPDATE, DELETE');
  console.log('Blog:        GET, GET by slug, CREATE, UPDATE, DELETE');
  console.log('Categories:  GET, CREATE');
  console.log('Uploads:     4 endpoint validations');

  console.log('\n====================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(console.error);
