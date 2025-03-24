import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

// Mock user hook since we don't have the actual Supabase helpers
const useUser = () => ({ 
  user: null, 
  subscription: null 
});

// Icon components
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.364l-1.591 1.591M21 12h-2.25m-.364 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// TypeScript interfaces
interface SubscriptionTier {
  total: number;
  used: number;
}

interface SubscriptionTiers {
  [key: string]: SubscriptionTier;
}

interface Subscription {
  tier: string;
}

interface User {
  email: string;
}

const Header: React.FC = () => {
  const pathname = usePathname();
  // Type assertion for mock data
  const { user, subscription } = useUser() as { 
    user: User | null;
    subscription: Subscription | null;
  };
  
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Mock function - implement with actual subscription data
  const getRemainingCredits = (): number | string => {
    if (!user) return 0;
    
    // This would be fetched from your database in a real implementation
    const subscriptionTiers: SubscriptionTiers = {
      free: { total: 5, used: 2 },
      premium: { total: 30, used: 12 },
      professional: { total: Number.POSITIVE_INFINITY, used: 45 }
    };
    
    const userTier = subscription?.tier || 'free';
    const { total, used } = subscriptionTiers[userTier];
    
    return total === Number.POSITIVE_INFINITY ? 'Unlimited' : (total - used);
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-soft-md backdrop-blur-sm sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer group">
                <span className="h-9 w-9 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold mr-2 shadow-soft-md group-hover:shadow-glow-primary transition-all duration-300">
                  HM
                </span>
                <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-primary">
                  Headshot Maker AI
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-5">
            <Link href="/create">
              <span className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                pathname === '/create' 
                  ? 'bg-gradient-primary text-white shadow-soft-md' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-soft-sm'
              } cursor-pointer`}>
                Create
              </span>
            </Link>
            
            {user && (
              <Link href="/dashboard">
                <span className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  pathname === '/dashboard' 
                  ? 'bg-gradient-primary text-white shadow-soft-md' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-soft-sm'
                } cursor-pointer`}>
                  Dashboard
                </span>
              </Link>
            )}
            
            <Link href="/pricing">
              <span className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                pathname === '/pricing' 
                  ? 'bg-gradient-primary text-white shadow-soft-md' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-soft-sm'
              } cursor-pointer`}>
                Pricing
              </span>
            </Link>

            {/* Dark/Light mode toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 focus:outline-none"
            >
              {isDarkMode ? (
                <SunIcon />
              ) : (
                <MoonIcon />
              )}
            </button>

            {/* User section */}
            {user ? (
              <div className="flex items-center">
                {/* Credit counter */}
                <div className="mr-4 px-4 py-1.5 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/30 border border-primary-200 dark:border-primary-800/50 rounded-full text-sm shadow-soft-sm">
                  <span className="font-semibold text-primary-700 dark:text-primary-300">{getRemainingCredits()}</span> 
                  <span className="text-gray-700 dark:text-gray-300">credits</span>
                </div>
                
                {/* User dropdown - simplified version */}
                <div className="relative">
                  <div className="flex items-center">
                    <button 
                      className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 focus:outline-none"
                    >
                      <span className="mr-2">{user.email}</span>
                      <span className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium shadow-soft-sm">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-5">
                <Link href="/login">
                  <span className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 px-3 py-2 cursor-pointer">
                    Sign in
                  </span>
                </Link>
                <Link href="/signup">
                  <span className="ai-button-primary">
                    Sign up
                  </span>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 focus:outline-none"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XIcon />
              ) : (
                <MenuIcon />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-900 shadow-lg border-t border-gray-100 dark:border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/create">
              <div className={`block px-4 py-2 rounded-lg text-base font-medium ${
                pathname === '/create' 
                  ? 'bg-gradient-primary text-white shadow-soft-sm' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              } cursor-pointer transition-all duration-300`}>
                Create
              </div>
            </Link>
            
            {user && (
              <Link href="/dashboard">
                <div className={`block px-4 py-2 rounded-lg text-base font-medium ${
                  pathname === '/dashboard' 
                    ? 'bg-gradient-primary text-white shadow-soft-sm' 
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                } cursor-pointer transition-all duration-300`}>
                  Dashboard
                </div>
              </Link>
            )}
            
            <Link href="/pricing">
              <div className={`block px-4 py-2 rounded-lg text-base font-medium ${
                pathname === '/pricing' 
                  ? 'bg-gradient-primary text-white shadow-soft-sm' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                } cursor-pointer transition-all duration-300`}>
                Pricing
              </div>
            </Link>
            
            {!user && (
              <>
                <Link href="/login">
                  <div className="block px-4 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-all duration-300">
                    Sign in
                  </div>
                </Link>
                <Link href="/signup">
                  <div className="block px-4 py-2 rounded-lg text-base font-medium bg-gradient-primary text-white hover:shadow-soft-md cursor-pointer transition-all duration-300">
                    Sign up
                  </div>
                </Link>
              </>
            )}
            
            {/* Dark/Light mode toggle */}
            <button 
              onClick={toggleTheme}
              className="w-full text-left px-4 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2 transition-all duration-300"
            >
              {isDarkMode ? (
                <>
                  <SunIcon />
                  <span className="ml-2">Light Mode</span>
                </>
              ) : (
                <>
                  <MoonIcon />
                  <span className="ml-2">Dark Mode</span>
                </>
              )}
            </button>
          </div>
          
          {/* User info in mobile menu */}
          {user && (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <span className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium shadow-soft-sm">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-white">
                    {user.email}
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {subscription?.tier || 'Free'} Plan
                  </div>
                </div>
                <div className="ml-auto bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/30 px-3 py-1 rounded-full border border-primary-200 dark:border-primary-800/50">
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">{getRemainingCredits()} credits</span>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link href="/account">
                  <div className="block px-4 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-all duration-300">
                    Account Settings
                  </div>
                </Link>
                <button 
                  className="w-full text-left block px-4 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300"
                  onClick={() => {
                    // Sign out logic - implement with Supabase
                    console.log('Sign out');
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
