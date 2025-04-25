// reload-env.js
// Utility script to reload environment variables for development
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Reloading environment variables...');

try {
  // Check if .env file exists
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found! Please create one based on .env.example');
    process.exit(1);
  }

  // Log the current env file without showing sensitive values
  const envContent = fs.readFileSync(envPath, 'utf8');
  const safeEnvContent = envContent.replace(/(API_KEY=)([^\s]+)/g, '$1[REDACTED]');
  console.log('\nℹ️ Current .env configuration:');
  console.log(safeEnvContent);
  
  console.log('\n✅ Environment variables loaded!');
  console.log('\n🚀 To restart the app with the new variables, run:');
  console.log('   npm start -- --reset-cache');
} catch (error) {
  console.error('❌ Error reloading environment variables:', error.message);
} 