import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 ai-grid-pattern opacity-30 pointer-events-none"></div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-100/20 dark:bg-primary-900/10 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-secondary-100/20 dark:bg-secondary-900/10 rounded-full filter blur-3xl opacity-50"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
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
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-md">
              Create professional headshots using the power of AI. Perfect for LinkedIn, 
              corporate websites, or any professional profile. Our advanced AI technology 
              transforms your photos into studio-quality headshots in minutes.
            </p>
            
            {/* Newsletter signup - could be implemented later */}
            <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Stay updated with AI advancements</p>
              <div className="flex">
                <div className="relative flex-grow">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="ai-input py-2 px-3 text-sm w-full" 
                  />
                </div>
                <button className="ml-2 bg-gradient-primary text-white rounded-lg px-4 py-2 text-sm font-medium shadow-soft-sm hover:shadow-soft-md transition-all duration-300">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          {/* Links section */}
          <div>
            <h3 className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/create">
                  <span className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 text-sm cursor-pointer">
                    Create Headshot
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <span className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 text-sm cursor-pointer">
                    Pricing
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard">
                  <span className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 text-sm cursor-pointer">
                    Dashboard
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <span className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 text-sm cursor-pointer">
                    Features
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company section */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-600 dark:text-secondary-400 uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/about">
                  <span className="text-gray-600 dark:text-gray-400 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors duration-300 text-sm cursor-pointer">
                    About
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <span className="text-gray-600 dark:text-gray-400 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors duration-300 text-sm cursor-pointer">
                    Privacy Policy
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <span className="text-gray-600 dark:text-gray-400 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors duration-300 text-sm cursor-pointer">
                    Terms of Service
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="text-gray-600 dark:text-gray-400 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors duration-300 text-sm cursor-pointer">
                    Contact
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Social media and copyright */}
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-6 md:mb-0">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
                aria-label="Twitter"
              >
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
                aria-label="Instagram"
              >
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} Headshot Maker AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
