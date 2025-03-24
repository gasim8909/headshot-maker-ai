"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean; // Added for convenience
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Use a function for initial state to avoid hydration mismatch
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Run once on mount
  useEffect(() => {
    // Check for saved preference, then OS preference, and default to light
    const savedTheme = localStorage.getItem('theme');
    
    // If user has explicitly set a preference, use that
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Otherwise check for OS preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      setTheme(initialTheme);
      applyTheme(initialTheme);
      // Save this preference
      localStorage.setItem('theme', initialTheme);
    }
    
    // Listen for OS theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only apply OS theme change if user hasn't set a preference
      if (!localStorage.getItem('theme')) {
        const osTheme = e.matches ? 'dark' : 'light';
        setTheme(osTheme);
        applyTheme(osTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Mark as mounted
    setMounted(true);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    // Add transition class for smoother transitions
    document.documentElement.classList.add('theme-transition');
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Remove transition class after transition completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Update localStorage with explicit user preference
    localStorage.setItem('theme', newTheme);
    
    // Apply theme to document
    applyTheme(newTheme);
    
    // Dispatch event for legacy components that might be listening
    const themeChangeEvent = new CustomEvent('themeChange', { 
      detail: { theme: newTheme, isDark: newTheme === 'dark' } 
    });
    window.dispatchEvent(themeChangeEvent);
  };

  // Avoid rendering with incorrect theme to prevent flash
  if (!mounted) {
    // Return null or a loading indicator that matches both themes
    return <div className="hidden"></div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Add the CSS for theme transitions
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .theme-transition {
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }
    
    .theme-transition * {
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease !important;
    }
  `;
  document.head.appendChild(style);
}
