import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.warn('⚠️  SUPABASE_URL / SUPABASE_SERVICE_KEY not set — running in mock mode');
}

// Service role client (bypasses RLS) — for backend use only
export const supabase = createClient(
  process.env.SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_KEY || 'mock-key',
  { auth: { autoRefreshToken: false, persistSession: false } }
);
