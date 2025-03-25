import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

// Simple health check function
async function testHealth() {
  try {
    const start = performance.now();
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      }
    });
    const end = performance.now();

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      responseTime: `${(end - start).toFixed(2)}ms`,
      ...(response.ok ? {} : { errorText: await response.text() })
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Test table access
async function testTableAccess() {
  try {
    const start = performance.now();
    const { data, error, count } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })
      .limit(1);
    const end = performance.now();

    return {
      success: !error,
      data: data ? data.slice(0, 1) : null, // just return the first item for privacy
      count,
      error: error ? { message: error.message, code: error.code } : null,
      responseTime: `${(end - start).toFixed(2)}ms`
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Test timeout behavior
async function testResponseTime() {
  try {
    const start = performance.now();
    
    // We'll wrap this in a Promise.race with a 6-second timeout
    const result = await Promise.race([
      supabase.from('user_profiles').select('count(*)', { count: 'exact', head: true }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out after 6 seconds')), 6000)
      )
    ]);
    
    const end = performance.now();
    
    // @ts-ignore - Handle result which could be from supabase
    const { data, error } = result || {};
    
    return {
      success: !error,
      responseTime: `${(end - start).toFixed(2)}ms`,
      data,
      error: error ? { message: error.message, code: error.code } : null
    };
  } catch (error: any) {
    const isTimeout = error.message && error.message.includes('timed out');
    
    return {
      success: false,
      error: error.message,
      isTimeout,
      message: isTimeout ? 
        'Request timed out - this matches the behavior in the original error' : 
        'Request failed but not due to timeout'
    };
  }
}

// Environment check
function checkEnvironment() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL 
      ? { 
          value: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 15)}...`, 
          present: true 
        }
      : { present: false },
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? { 
          value: `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10)}...`, 
          present: true 
        }
      : { present: false },
    nodeEnv: process.env.NODE_ENV
  };
}

export async function GET() {
  const timestamp = new Date().toISOString();
  
  const results = {
    timestamp,
    environment: checkEnvironment(),
    health: await testHealth(),
    tableAccess: await testTableAccess(),
    responseTime: await testResponseTime()
  };
  
  return NextResponse.json(results);
}
