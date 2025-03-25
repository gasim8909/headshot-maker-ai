#!/usr/bin/env node

/**
 * This script applies Supabase migrations from the supabase/migrations folder
 * to ensure the database tables are properly set up.
 * 
 * Usage: node apply-migrations.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Check if supabase CLI is installed
function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Apply migrations
async function applyMigrations() {
  console.log('🔍 Checking environment...');
  
  // Check for required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Try to load from .env.local
    try {
      const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
      const envLines = envContent.split('\n');
      
      envLines.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      });
    } catch (error) {
      console.error('❌ Could not load environment variables from .env.local');
    }
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    return false;
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    console.log('You need to add this to your .env.local file. Get it from your Supabase project settings -> API.');
    return false;
  }

  // Check if Supabase CLI is installed
  if (!checkSupabaseCLI()) {
    console.error('❌ Supabase CLI not found. Please install it first:');
    console.log('npm install -g supabase');
    return false;
  }

  // Check if migrations folder exists
  const migrationsPath = path.join(process.cwd(), 'supabase', 'migrations');
  if (!fs.existsSync(migrationsPath) || !fs.readdirSync(migrationsPath).length) {
    console.error('❌ No migrations found in supabase/migrations folder');
    return false;
  }

  console.log('✅ Environment checks passed');
  console.log('📝 Found migration files:');
  
  // List migration files
  const migrationFiles = fs.readdirSync(migrationsPath)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  migrationFiles.forEach(file => {
    console.log(`  - ${file}`);
  });

  // Confirm with user
  return new Promise((resolve) => {
    rl.question('🚨 Do you want to apply these migrations to your Supabase database? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        console.log('🚀 Applying migrations...');
        
        try {
          // Apply each migration
          migrationFiles.forEach((file, index) => {
            const migrationPath = path.join(migrationsPath, file);
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
            
            // Construct URL for SQL API
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const apiUrl = `${supabaseUrl}/rest/v1/`;
            
            // Apply migration using curl (reliable across platforms)
            const command = `curl -X POST "${apiUrl}rpc/apply_migration" ` +
              `-H "apikey: ${process.env.SUPABASE_SERVICE_ROLE_KEY}" ` +
              `-H "Authorization: Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}" ` +
              `-H "Content-Type: application/json" ` +
              `-d '{"name": "${file}", "sql": ${JSON.stringify(migrationSQL)}}'`;
            
            try {
              console.log(`⚙️  Applying migration ${index + 1}/${migrationFiles.length}: ${file}`);
              execSync(command, { stdio: 'inherit' });
              console.log(`✅ Applied migration: ${file}`);
            } catch (error) {
              console.error(`❌ Failed to apply migration ${file}:`, error.message);
            }
          });
          
          console.log('✅ Migrations completed');
          resolve(true);
        } catch (error) {
          console.error('❌ Migration process failed:', error.message);
          resolve(false);
        }
      } else {
        console.log('❌ Migration cancelled');
        resolve(false);
      }
      rl.close();
    });
  });
}

// Run the migration process
applyMigrations().then((success) => {
  if (success) {
    console.log('✨ Database schema is now up to date!');
    console.log('🔒 If you still see authentication errors, check that your Row Level Security (RLS) policies are set up correctly.');
  } else {
    console.log('📌 You may need to manually apply the migrations from the Supabase dashboard:');
    console.log('1. Go to your Supabase project');
    console.log('2. Open the SQL Editor');
    console.log('3. Create a new query and paste the contents of each migration file');
    console.log('4. Run the queries in order (01_, 02_, etc.)');
  }
  process.exit(0);
});
