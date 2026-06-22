import { createClient } from '@supabase/supabase-js';

// Access environment variables with placeholders for build-time safety
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-please-set-env-vars.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Missing Supabase environment variables. Using placeholder client for static generation/build.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
