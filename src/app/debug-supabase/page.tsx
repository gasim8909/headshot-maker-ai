'use client';

import React, { useState, useEffect } from 'react';
import { testConnection, runFullDiagnostic } from '@/utils/supabaseDebugger';
import { useRouter } from 'next/navigation';
import AuthDebugger from '@/components/SupabaseDebugger/AuthDebugger';
import ProfileDebugger from '@/components/SupabaseDebugger/ProfileDebugger';
import SubscriptionDebugger from '@/components/SupabaseDebugger/SubscriptionDebugger';
import HeadshotDebugger from '@/components/SupabaseDebugger/HeadshotDebugger';
import RawQueryDebugger from '@/components/SupabaseDebugger/RawQueryDebugger';

// Tabs for the different sections
const TABS = [
  { id: 'connection', label: '🔌 Connection' },
  { id: 'auth', label: '🔑 Authentication' },
  { id: 'profile', label: '👤 Profile' },
  { id: 'subscription', label: '⭐ Subscription' },
  { id: 'headshot', label: '🖼️ Headshots' },
  { id: 'query', label: '🔍 Raw Query' },
];

const SupabaseDebugPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('connection');
  const [connectionState, setConnectionState] = useState<any>(null);
  const [diagnosticState, setDiagnosticState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiDiagnosticResult, setApiDiagnosticResult] = useState<any>(null);
  const [isRunningApiTest, setIsRunningApiTest] = useState(false);
  
  // Test connection on mount
  useEffect(() => {
    testConnectionStatus();
  }, []);
  
  const testConnectionStatus = async () => {
    setIsLoading(true);
    const result = await testConnection();
    setConnectionState(result);
    setIsLoading(false);
  };
  
  const runDiagnostics = async () => {
    setIsLoading(true);
    const results = await runFullDiagnostic();
    setDiagnosticState(results);
    setIsLoading(false);
  };
  
  // Function to run the API diagnostic
  const runApiDiagnostic = async () => {
    setIsRunningApiTest(true);
    try {
      const response = await fetch('/api/supabase-diagnostic');
      const data = await response.json();
      setApiDiagnosticResult(data);
      console.log('API Diagnostic Result:', data);
    } catch (error) {
      console.error('Error running API diagnostic:', error);
      setApiDiagnosticResult({ error: 'Failed to fetch diagnostic data' });
    } finally {
      setIsRunningApiTest(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Supabase Debugging Console
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Test and debug Supabase connection, auth, and data operations
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <button 
                onClick={testConnectionStatus}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                disabled={isLoading}
              >
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                  connectionState?.success ? 'bg-green-500' : 
                  connectionState?.error ? 'bg-red-500' : 
                  'bg-gray-500'
                }`}></span>
                Test Connection
              </button>
              <button 
                onClick={runDiagnostics}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                disabled={isLoading}
              >
                Run Full Diagnostics
              </button>
              <button 
                onClick={runApiDiagnostic}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                disabled={isRunningApiTest}
              >
                {isRunningApiTest ? 'Running API Test...' : 'Advanced API Diagnostics'}
              </button>
            </div>
          </div>
          
          {/* Connection status */}
          {connectionState && (
            <div className={`mt-4 p-3 rounded ${
              connectionState.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
              'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center">
                <span className={`inline-block w-4 h-4 rounded-full mr-2 ${
                  connectionState.success ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <span className={`font-medium ${
                  connectionState.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                }`}>
                  {connectionState.success ? 'Connected to Supabase' : 'Connection Failed'}
                </span>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {connectionState.data.responseTime}
                </span>
              </div>
              {connectionState.error && (
                <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {connectionState.error}
                </div>
              )}
            </div>
          )}
          
          {/* API Diagnostic results */}
          {apiDiagnosticResult && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 border rounded">
              <h3 className="font-medium">API Diagnostic Results</h3>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className={`p-2 rounded ${
                  apiDiagnosticResult.health?.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <span className="text-sm font-medium">Health Check:</span>
                  <span className={`ml-2 text-sm ${
                    apiDiagnosticResult.health?.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {apiDiagnosticResult.health?.success ? 'OK' : 'Failed'}
                    {apiDiagnosticResult.health?.responseTime && ` (${apiDiagnosticResult.health.responseTime})`}
                  </span>
                </div>
                
                <div className={`p-2 rounded ${
                  apiDiagnosticResult.tableAccess?.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <span className="text-sm font-medium">Table Access:</span>
                  <span className={`ml-2 text-sm ${
                    apiDiagnosticResult.tableAccess?.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {apiDiagnosticResult.tableAccess?.success ? 'OK' : 'Failed'}
                    {apiDiagnosticResult.tableAccess?.count !== undefined && ` (${apiDiagnosticResult.tableAccess.count} rows)`}
                  </span>
                </div>
                
                <div className={`p-2 rounded ${
                  apiDiagnosticResult.responseTime?.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <span className="text-sm font-medium">Response Time:</span>
                  <span className={`ml-2 text-sm ${
                    apiDiagnosticResult.responseTime?.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {apiDiagnosticResult.responseTime?.success ? 'OK' : 'Failed'}
                    {apiDiagnosticResult.responseTime?.responseTime && ` (${apiDiagnosticResult.responseTime.responseTime})`}
                  </span>
                </div>
              </div>
              
              {/* Environment info */}
              <div className="mt-3 p-2 border rounded bg-gray-100 dark:bg-gray-800">
                <h4 className="text-sm font-medium mb-1">Environment Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-medium">Supabase URL: </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {apiDiagnosticResult.environment?.supabaseUrl?.present ? 
                        apiDiagnosticResult.environment.supabaseUrl.value : 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Anon Key: </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {apiDiagnosticResult.environment?.supabaseAnonKey?.present ? 
                        apiDiagnosticResult.environment.supabaseAnonKey.value : 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Node Environment: </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {apiDiagnosticResult.environment?.nodeEnv || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Errors */}
              {(apiDiagnosticResult.health?.error || 
                apiDiagnosticResult.tableAccess?.error || 
                apiDiagnosticResult.responseTime?.error) && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800 text-sm">
                  <h4 className="font-medium text-red-700 dark:text-red-400">Error Details</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-red-600 dark:text-red-400">
                    {apiDiagnosticResult.health?.error && (
                      <li>{typeof apiDiagnosticResult.health.error === 'object' 
                        ? JSON.stringify(apiDiagnosticResult.health.error) 
                        : apiDiagnosticResult.health.error}</li>
                    )}
                    {apiDiagnosticResult.tableAccess?.error && (
                      <li>{typeof apiDiagnosticResult.tableAccess.error === 'object' 
                        ? (apiDiagnosticResult.tableAccess.error.message || JSON.stringify(apiDiagnosticResult.tableAccess.error))
                        : apiDiagnosticResult.tableAccess.error}
                        {apiDiagnosticResult.tableAccess.error.code && ` (Code: ${apiDiagnosticResult.tableAccess.error.code})`}</li>
                    )}
                    {apiDiagnosticResult.responseTime?.error && (
                      <li>{typeof apiDiagnosticResult.responseTime.error === 'object'
                        ? JSON.stringify(apiDiagnosticResult.responseTime.error)
                        : apiDiagnosticResult.responseTime.error}</li>
                    )}
                  </ul>
                </div>
              )}
              
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer text-blue-500">View Full API Diagnostic Results</summary>
                <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto text-xs">
                  {JSON.stringify(apiDiagnosticResult, null, 2)}
                </pre>
              </details>
            </div>
          )}
          
          {/* Diagnostic results summary */}
          {diagnosticState && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 border rounded">
              <h3 className="font-medium">Diagnostic Results</h3>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className={`p-2 rounded ${
                  diagnosticState.connection.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <span className="text-sm font-medium">Connection:</span>
                  <span className={`ml-2 text-sm ${
                    diagnosticState.connection.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {diagnosticState.connection.success ? 'OK' : 'Failed'}
                  </span>
                </div>
                <div className={`p-2 rounded ${
                  diagnosticState.auth.session.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <span className="text-sm font-medium">Session:</span>
                  <span className={`ml-2 text-sm ${
                    diagnosticState.auth.session.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {diagnosticState.auth.session.success ? (
                      diagnosticState.auth.session.data.session ? 'Active' : 'Not Logged In'
                    ) : 'Error'}
                  </span>
                </div>
                <div className={`p-2 rounded ${
                  diagnosticState.auth.user.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <span className="text-sm font-medium">User:</span>
                  <span className={`ml-2 text-sm ${
                    diagnosticState.auth.user.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {diagnosticState.auth.user.success ? (
                      diagnosticState.auth.user.data.user ? 'Authenticated' : 'Anonymous'
                    ) : 'Error'}
                  </span>
                </div>
              </div>
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer text-blue-500">View Full Results</summary>
                <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto text-xs">
                  {JSON.stringify(diagnosticState, null, 2)}
                </pre>
              </details>
            </div>
          )}
          
          {/* Help and Recommendations */}
          {connectionState && !connectionState.success && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
              <h3 className="font-medium text-blue-800 dark:text-blue-300">Troubleshooting Recommendations</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                <li>Check if your Supabase project is active in the <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline">Supabase dashboard</a></li>
                <li>Verify your environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) are correctly set</li>
                <li>Make sure your database has the required tables - try running migrations if needed</li>
                <li>Check for Row Level Security (RLS) policies that might be blocking access</li>
                <li>Try using the "Advanced API Diagnostics" for more detailed error information</li>
              </ul>
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-4 overflow-x-auto pb-px" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="mb-8">
          {activeTab === 'connection' && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Connection Testing</h2>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  This section tests basic connectivity to your Supabase project. It verifies that your
                  application can communicate with the Supabase API and access your database.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Environment Configuration</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex">
                        <span className="font-medium w-32">Supabase URL:</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {process.env.NEXT_PUBLIC_SUPABASE_URL ? 
                            process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 25) + '...' : 
                            'Not configured'}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-medium w-32">Anon Key:</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
                            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 8) + '...' : 
                            'Not configured'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Connection Details</h3>
                    {connectionState ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex">
                          <span className="font-medium w-32">Status:</span>
                          <span className={connectionState.success ? 'text-green-600' : 'text-red-600'}>
                            {connectionState.success ? 'Connected' : 'Failed'}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="font-medium w-32">Response Time:</span>
                          <span>{connectionState.data.responseTime}</span>
                        </div>
                        {connectionState.error && (
                          <div className="flex">
                            <span className="font-medium w-32">Error:</span>
                            <span className="text-red-600">{connectionState.error}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">Run a connection test to see details</p>
                    )}
                    
                    <button 
                      onClick={testConnectionStatus}
                      className="mt-4 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Testing...' : 'Test Connection'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'auth' && <AuthDebugger />}
          {activeTab === 'profile' && <ProfileDebugger />}
          {activeTab === 'subscription' && <SubscriptionDebugger />}
          {activeTab === 'headshot' && <HeadshotDebugger />}
          {activeTab === 'query' && <RawQueryDebugger />}
        </div>
        
        {/* Footer */}
        <div className="mt-auto text-center text-sm text-gray-500 py-4">
          <p>
            Supabase Debugging Console - Made with ❤️ for Headshot Maker AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupabaseDebugPage;
