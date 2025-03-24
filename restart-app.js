// Script to clean cache and restart Next.js application
const { execSync } = require('child_process');

console.log('🧹 Cleaning Next.js cache...');
try {
  execSync('npx rimraf .next', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error clearing cache:', error.message);
}

console.log('🔄 Rebuilding application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error building application:', error.message);
  process.exit(1);
}

console.log('🚀 Starting development server...');
try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error starting server:', error.message);
}
