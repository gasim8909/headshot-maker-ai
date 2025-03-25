'use client';

import React, { useState, useEffect } from 'react';
import { 
  testSignUp, 
  testSignIn, 
  testSignOut, 
  testPasswordReset, 
  testGetSession, 
  testGetUser 
} from '@/utils/supabaseDebugger';

const AuthDebugger = () => {
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Results and status
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // User session status
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Check for session on mount
  useEffect(() => {
    checkSession();
  }, []);
  
  const checkSession = async () => {
    const sessionResult = await testGetSession();
    const userResult = await testGetUser();
    
    setIsLoggedIn(!!sessionResult.data.session);
    setCurrentUser(userResult.data.user);
    
    setResults(prev => [
      { type: 'session', data: sessionResult },
      { type: 'user', data: userResult },
      ...prev
    ]);
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return;
    
    setIsLoading(true);
    const result = await testSignUp(email, password, fullName);
    setResults(prev => [{ type: 'signup', data: result }, ...prev]);
    setIsLoading(false);
    
    if (result.success) {
      await checkSession();
    }
  };
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    const result = await testSignIn(email, password);
    setResults(prev => [{ type: 'signin', data: result }, ...prev]);
    setIsLoading(false);
    
    if (result.success) {
      await checkSession();
    }
  };
  
  const handleSignOut = async () => {
    setIsLoading(true);
    const result = await testSignOut();
    setResults(prev => [{ type: 'signout', data: result }, ...prev]);
    setIsLoading(false);
    
    if (result.success) {
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    const result = await testPasswordReset(email);
    setResults(prev => [{ type: 'passwordreset', data: result }, ...prev]);
    setIsLoading(false);
  };
  
  const handleGetUser = async () => {
    setIsLoading(true);
    const result = await testGetUser();
    setResults(prev => [{ type: 'getuser', data: result }, ...prev]);
    setIsLoading(false);
  };
  
  const handleGetSession = async () => {
    setIsLoading(true);
    const result = await testGetSession();
    setResults(prev => [{ type: 'getsession', data: result }, ...prev]);
    setIsLoading(false);
  };
  
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4">Auth Testing</h2>
      
      {/* Current status */}
      <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-700 rounded">
        <h3 className="text-lg font-semibold mb-2">Current Status</h3>
        <p>Logged in: <span className={isLoggedIn ? "text-green-500" : "text-red-500"}>{isLoggedIn ? "Yes" : "No"}</span></p>
        {currentUser && (
          <div className="mt-2">
            <p>User ID: {currentUser.id}</p>
            <p>Email: {currentUser.email}</p>
          </div>
        )}
        <div className="mt-3 flex space-x-2">
          <button 
            onClick={handleGetUser} 
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            disabled={isLoading}
          >
            Check User
          </button>
          <button 
            onClick={handleGetSession} 
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            disabled={isLoading}
          >
            Check Session
          </button>
          {isLoggedIn && (
            <button 
              onClick={handleSignOut} 
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              disabled={isLoading}
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
      
      {/* Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Sign Up */}
        <div className="p-3 border rounded">
          <h3 className="font-semibold mb-2">Sign Up</h3>
          <form onSubmit={handleSignUp} className="space-y-2">
            <div>
              <label className="block text-sm">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full p-1 border rounded text-sm"
                placeholder="test@example.com"
              />
            </div>
            <div>
              <label className="block text-sm">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full p-1 border rounded text-sm"
                placeholder="Password (min 6 chars)"
              />
            </div>
            <div>
              <label className="block text-sm">Full Name</label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                className="w-full p-1 border rounded text-sm"
                placeholder="John Doe"
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              disabled={isLoading || !email || !password || !fullName}
            >
              Sign Up
            </button>
          </form>
        </div>
        
        {/* Sign In */}
        <div className="p-3 border rounded">
          <h3 className="font-semibold mb-2">Sign In</h3>
          <form onSubmit={handleSignIn} className="space-y-2">
            <div>
              <label className="block text-sm">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full p-1 border rounded text-sm"
                placeholder="test@example.com"
              />
            </div>
            <div>
              <label className="block text-sm">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full p-1 border rounded text-sm"
                placeholder="Password"
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              disabled={isLoading || !email || !password}
            >
              Sign In
            </button>
            <button 
              type="button" 
              onClick={handlePasswordReset}
              className="w-full py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
              disabled={isLoading || !email}
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
      
      {/* Results */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Test Results</h3>
        <div className="max-h-60 overflow-auto border rounded">
          {results.length === 0 ? (
            <p className="p-3 text-gray-500">No test results yet</p>
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
                      <p className="text-gray-500">{result.data.data.duration}</p>
                    )}
                  </div>
                  <div className="mt-1">
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-500">View Details</summary>
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

export default AuthDebugger;
