import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env file manually if it exists
try {
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        if (key && value && !key.startsWith('#')) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (e) {
  console.log('No local .env file found or failed to parse it, using existing environment variables.');
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n[DATABASE CONNECTION TEST: FAILED]');
  console.error('Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.');
  console.error('Please configure your .env file with the following variables:');
  console.error('SUPABASE_URL\nSUPABASE_ANON_KEY\nSUPABASE_SERVICE_ROLE_KEY\nSESSION_SECRET\n');
  process.exit(1);
}

console.log('\nSupabase URL detected:', supabaseUrl);
console.log('Testing Supabase Client connection...');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runTest() {
  try {
    // 1. Check database connectivity
    console.log('Querying table "admin_users" to check connectivity...');
    const { count, error } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('\n[DATABASE CONNECTION TEST: FAILED]');
      console.error('Database connection failed! Error details:', error.message);
      console.error('Make sure your Supabase project is active, tables are created by schema.sql, and credentials are correct.\n');
      process.exit(1);
    }

    console.log('Connection Successful! Successfully queried admin_users table (rows found: ' + count + ').');

    // 2. Check storage bucket connectivity
    console.log('Testing Supabase Storage for bucket "acm-media"...');
    const { data: bucket, error: bucketError } = await supabase
      .storage
      .getBucket('acm-media');

    if (bucketError) {
      console.warn('\n[STORAGE BUCKET CHECK: WARNING]');
      console.warn('Storage bucket "acm-media" could not be read. Error:', bucketError.message);
      console.warn('The netlify upload function will attempt to initialize it during first upload.');
      console.warn('Ensure the service-role key has storage permission policies enabled in your Supabase project.\n');
    } else {
      console.log('Storage bucket "acm-media" successfully verified and is active.');
      console.log('MIME types restriction:', bucket.allowed_mime_types);
      console.log('Public bucket status:', bucket.public);
    }

    console.log('\n[DATABASE CONNECTION TEST: PASSED]');
    console.log('All backend environment credentials and client connection checks completed successfully!\n');
  } catch (err) {
    console.error('\n[DATABASE CONNECTION TEST: FAILED]');
    console.error('Test execution failed with exception:', err.message);
    process.exit(1);
  }
}

runTest();
