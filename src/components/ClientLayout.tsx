"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

interface ClientLayoutProps {
  children: ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  // Add a loading state to prevent flash of unstyled content
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Small delay to ensure hydration is complete
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 150); // Slightly longer delay for better transition
    
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      clearTimeout(timeout);
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-gradient-primary animate-pulse"></div>
          <span className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="relative min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        {/* Decorative elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Top right gradient blob */}
          <div className="absolute -top-[30%] -right-[20%] w-[70%] h-[70%] bg-primary-100/30 dark:bg-primary-900/10 rounded-full filter blur-3xl"></div>
          {/* Bottom left gradient blob */}
          <div className="absolute -bottom-[30%] -left-[20%] w-[70%] h-[70%] bg-secondary-100/20 dark:bg-secondary-900/10 rounded-full filter blur-3xl"></div>
          {/* Background grid pattern */}
          <div className="absolute inset-0 ai-grid-pattern opacity-30"></div>
        </div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow py-6 sm:py-10 animate-[fadeIn_0.5s_ease-in-out]">
            {children}
          </main>
          <Footer />
        </div>
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
};

// Add the fadeIn animation to tailwind.css
const fadeInKeyframes = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;

// Inject the keyframes into the head to avoid modifying the CSS file directly
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = fadeInKeyframes;
  document.head.appendChild(style);
}

export default ClientLayout;
