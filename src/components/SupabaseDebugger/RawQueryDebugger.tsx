'use client';

import React, { useState } from 'react';
import { testExecuteRawQuery } from '@/utils/supabaseDebugger';

const RawQueryDebugger = () => {
  // Form states
  const [table, setTable] = useState('user_profiles');
  const [query, setQuery] = useState('SELECT * FROM user_profiles LIMIT 10;');
  const [params, setParams] = useState('[]');
  
  // Results and status
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleExecuteQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    let parsedParams = [];
    try {
      parsedParams = JSON.parse(params);
      if (!Array.isArray(parsedParams)) {
        throw new Error('Parameters must be a JSON array');
      }
    } catch (err) {
      alert('Invalid JSON for parameters. Must be an array.');
      setIsLoading(false);
      return;
    }
    
    // Validate query is a SELECT statement
    if (!query.trim().toLowerCase().startsWith('select')) {
      alert('For safety, only SELECT queries are allowed through this interface');
      setIsLoading(false);
      return;
    }
    
    const result = await testExecuteRawQuery(table, query, parsedParams);
    setResults(prev => [{ type: 'executeQuery', data: result }, ...prev]);
    
    setIsLoading(false);
  };
  
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4">Raw Query Testing</h2>
      
      {/* Query form */}
      <div className="mb-6">
        <form onSubmit={handleExecuteQuery} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Target Table</label>
            <select 
              value={table} 
              onChange={(e) => setTable(e.target.value)} 
              className="w-full p-2 border rounded"
            >
              <option value="user_profiles">user_profiles</option>
              <option value="user_subscriptions">user_subscriptions</option>
              <option value="user_headshots">user_headshots</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">SQL Query (SELECT only)</label>
            <textarea 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              className="w-full p-2 border rounded h-24 font-mono text-sm"
              placeholder="SELECT * FROM user_profiles LIMIT 10;"
            />
            <p className="text-xs text-gray-500 mt-1">
              Note: For security reasons, only SELECT queries are allowed in this interface
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium">Parameters (JSON Array)</label>
            <textarea 
              value={params} 
              onChange={(e) => setParams(e.target.value)} 
              className="w-full p-2 border rounded h-16 font-mono text-sm"
              placeholder="[]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: ["value1", "value2"] for parameterized queries
            </p>
          </div>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? 'Executing...' : 'Execute Query'}
          </button>
        </form>
      </div>
      
      {/* Example queries */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Example Queries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div 
            className="p-2 border rounded text-xs cursor-pointer hover:bg-gray-50"
            onClick={() => setQuery('SELECT * FROM user_profiles LIMIT 10;')}
          >
            List profiles (limit 10)
          </div>
          <div 
            className="p-2 border rounded text-xs cursor-pointer hover:bg-gray-50"
            onClick={() => setQuery('SELECT * FROM user_subscriptions WHERE credits_remaining > 0;')}
          >
            Find subscriptions with remaining credits
          </div>
          <div 
            className="p-2 border rounded text-xs cursor-pointer hover:bg-gray-50"
            onClick={() => setQuery('SELECT COUNT(*) FROM user_headshots GROUP BY user_id;')}
          >
            Count headshots per user
          </div>
          <div 
            className="p-2 border rounded text-xs cursor-pointer hover:bg-gray-50"
            onClick={() => setQuery('SELECT p.full_name, s.tier, s.credits_remaining FROM user_profiles p JOIN user_subscriptions s ON p.user_id = s.user_id LIMIT 10;')}
          >
            Join profiles with subscriptions
          </div>
        </div>
      </div>
      
      {/* Results */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Query Results</h3>
        <div className="max-h-60 overflow-auto border rounded">
          {results.length === 0 ? (
            <p className="p-3 text-gray-500">No query results yet</p>
          ) : (
            <div className="divide-y">
              {results.map((result, i) => (
                <div key={i} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{result.type} - {result.data.action}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${result.data.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {result.data.success ? 'SUCCESS' : 'ERROR'}
                    </span>
                  </div>
                  <div className="mt-1 text-xs">
                    {result.data.error ? (
                      <p className="text-red-500">{result.data.error}</p>
                    ) : (
                      <div>
                        <p className="text-gray-500">
                          Table: {result.data.data.table} • 
                          Duration: {result.data.data.duration}
                        </p>
                        <details className="mt-1" open>
                          <summary className="cursor-pointer text-blue-500">Query Results</summary>
                          <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto text-xs">
                            {JSON.stringify(result.data.data.results, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                  <div className="mt-1">
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-500">View Raw Response</summary>
                      <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RawQueryDebugger;
