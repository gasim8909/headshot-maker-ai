// Simple Supabase connection test script
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey.substring(0, 10) + '...');

// Test 1: Simple health check
async function testHealth() {
  console.log('\n--- Testing Supabase Health ---');
  try {
    const start = performance.now();
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const end = performance.now();

    console.log(`Response Status: ${response.status} (${response.statusText})`);
    console.log(`Response Time: ${(end - start).toFixed(2)}ms`);
    
    if (!response.ok) {
      const text = await response.text();
      console.error('Error response:', text);
    }
    
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error.message);
    return false;
  }
}

// Test 2: Test table access - specifically user_profiles which is used in the connection test
async function testTableAccess() {
  console.log('\n--- Testing Table Access (user_profiles) ---');
  try {
    const start = performance.now();
    const response = await fetch(`${supabaseUrl}/rest/v1/user_profiles?count=exact&limit=0`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });
    const end = performance.now();

    console.log(`Response Status: ${response.status} (${response.statusText})`);
    console.log(`Response Time: ${(end - start).toFixed(2)}ms`);
    
    const data = await response.text();
    console.log('Response:', data);
    
    if (response.status === 404) {
      console.error('⚠️ The user_profiles table does not exist or is not accessible');
    }
    
    return response.ok;
  } catch (error) {
    console.error('Table access failed:', error.message);
    return false;
  }
}

// Test 3: Test timeout behavior - this is important since the original error shows a timeout
async function testResponseTime() {
  console.log('\n--- Testing Response Time ---');
  try {
    const start = performance.now();
    const response = await fetch(`${supabaseUrl}/rest/v1/user_profiles?limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      // Set a timeout to simulate the original issue
      signal: AbortSignal.timeout(6000) // 6 seconds, slightly longer than original 5.3s
    });
    const end = performance.now();

    console.log(`Response Time: ${(end - start).toFixed(2)}ms`);
    
    const data = await response.text();
    console.log(`Response Data: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`);
    
    return true;
  } catch (error) {
    console.error('Response time test failed:', error.message);
    if (error.name === 'AbortError') {
      console.error('⚠️ Request timed out - this matches the behavior in the original error');
    }
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('=== SUPABASE CONNECTION TESTS ===');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  const healthOk = await testHealth();
  const tableOk = await testTableAccess();
  const timeoutOk = await testResponseTime();
  
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Health Check: ${healthOk ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Table Access: ${tableOk ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Response Time: ${timeoutOk ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (!healthOk) {
    console.log('\n📋 RECOMMENDATION: The Supabase project may be paused or there are network connectivity issues.');
    console.log('- Check if the project is active in your Supabase dashboard');
    console.log('- Verify your network connection and any proxies or firewalls');
  } else if (!tableOk) {
    console.log('\n📋 RECOMMENDATION: The user_profiles table might not exist or is misconfigured.');
    console.log('- Check if the table exists in your Supabase dashboard');
    console.log('- Run the migrations to create the necessary tables');
    console.log('- Verify RLS (Row Level Security) policies on the table');
  } else if (!timeoutOk) {
    console.log('\n📋 RECOMMENDATION: Request timeouts indicate potential performance issues.');
    console.log('- Your database might be under heavy load or sleeping');
    console.log('- Consider upgrading your Supabase project tier');
    console.log('- Check for complex queries or missing indexes');
  }
}

runTests().catch(console.error);
