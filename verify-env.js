// Script to verify environment variables for feature access and prompt templates
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Print out the guest-related environment variables
console.log('\n=== GUEST FEATURE ACCESS ENVIRONMENT VARIABLES ===');
console.log('NEXT_PUBLIC_GUEST_TIER_LIMIT:', process.env.NEXT_PUBLIC_GUEST_TIER_LIMIT);
console.log('NEXT_PUBLIC_GUEST_ALLOWED_STYLES:', process.env.NEXT_PUBLIC_GUEST_ALLOWED_STYLES);
console.log('NEXT_PUBLIC_GUEST_CUSTOM_STYLE:', process.env.NEXT_PUBLIC_GUEST_CUSTOM_STYLE);
console.log('NEXT_PUBLIC_GUEST_MAX_QUANTITY:', process.env.NEXT_PUBLIC_GUEST_MAX_QUANTITY);
console.log('NEXT_PUBLIC_GUEST_ADVANCED_SETTINGS:', process.env.NEXT_PUBLIC_GUEST_ADVANCED_SETTINGS);
console.log('NEXT_PUBLIC_GUEST_SAVE_TO_HISTORY:', process.env.NEXT_PUBLIC_GUEST_SAVE_TO_HISTORY);

// Parse guest allowed styles 
const guestStylesEnv = process.env.NEXT_PUBLIC_GUEST_ALLOWED_STYLES || 'corporate,casual,business';
const guestStyles = guestStylesEnv
  .split(',')
  .map(s => s.trim())
  .filter(s => s.length > 0);

// Get other values directly 
const guestTierLimit = process.env.NEXT_PUBLIC_GUEST_TIER_LIMIT || '2';
const guestCustomStyle = process.env.NEXT_PUBLIC_GUEST_CUSTOM_STYLE || 'false';
const guestMaxQuantity = process.env.NEXT_PUBLIC_GUEST_MAX_QUANTITY || '2';
const guestAdvancedSettings = process.env.NEXT_PUBLIC_GUEST_ADVANCED_SETTINGS || 'false';
const guestSaveToHistory = process.env.NEXT_PUBLIC_GUEST_SAVE_TO_HISTORY || 'false';

// Parse the values as they would be in the featureAccess.ts file
const parsedValues = {
  generationLimit: parseInt(guestTierLimit),
  allowedStyles: guestStyles,
  hasCustomStyleAccess: guestCustomStyle.toLowerCase() === 'true',
  maxQuantity: parseInt(guestMaxQuantity),
  hasAdvancedSettings: guestAdvancedSettings.toLowerCase() === 'true',
  canSaveToHistory: guestSaveToHistory.toLowerCase() === 'true'
};

console.log('\n=== PARSED GUEST FEATURE ACCESS VALUES ===');
console.log(JSON.stringify(parsedValues, null, 2));

// Check for prompt template variables
console.log('\n=== GEMINI PROMPT TEMPLATE VARIABLES ===');
console.log('GEMINI_PROMPT_TEMPLATE:', process.env.GEMINI_PROMPT_TEMPLATE ? 'Set ✅' : 'Not set ❌');
console.log('GEMINI_FACE_PRESERVATION:', process.env.GEMINI_FACE_PRESERVATION ? 'Set ✅' : 'Not set ❌');
console.log('GEMINI_ADDITIONAL_INSTRUCTIONS:', process.env.GEMINI_ADDITIONAL_INSTRUCTIONS ? 'Set ✅' : 'Not set ❌');

// Check for style-specific prompt customizations
console.log('\n=== STYLE-SPECIFIC PROMPT CUSTOMIZATIONS ===');
const styles = ['CORPORATE', 'BUSINESS', 'CASUAL', 'EXECUTIVE', 'ACADEMIC', 
                'CREATIVE', 'TECH', 'STARTUP', 'ARTISTIC', 'CINEMATIC', 'RETRO'];

styles.forEach(style => {
  const envVarName = `GEMINI_STYLE_${style}`;
  console.log(`${envVarName}:`, process.env[envVarName] ? 'Set ✅' : 'Not set ❌');
});

console.log('\nIf the values above match what you expect, the environment variables are being loaded correctly.');
console.log('If not, try restarting the application using: node restart-app.js\n');
