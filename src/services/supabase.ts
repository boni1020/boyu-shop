import { createClient } from '@supabase/supabase-js';

const env: Record<string, any> =
  (typeof import.meta !== 'undefined' && import.meta.env)
    ? import.meta.env
    : (typeof process !== 'undefined' ? process.env : {}) || {};

const rawUrl = (
  env.VITE_SUPABASE_URL ||
  env.SUPABASE_URL ||
  ''
).trim();

// Normalize URL: Strip trailing '/rest/v1', '/rest/v1/', or trailing slashes if present
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

const supabaseAnonKey = (
  env.VITE_SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim();

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;



