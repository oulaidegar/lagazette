import { createClient } from '@supabase/supabase-js';

// Access environment variables with placeholders for build-time safety
const getSupabaseConfig = (): { url: string; key: string } => {
    let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    const isValidUrl = (u: string): boolean => {
        if (!u || u === 'undefined' || u === 'null') return false;
        try {
            const parsed = new URL(u);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
            return false;
        }
    };
    
    if (!isValidUrl(url)) {
        url = 'https://placeholder-please-set-env-vars.supabase.co';
    }
    if (!key || key === 'undefined' || key === 'null') {
        key = 'placeholder-key';
    }
    
    return { url, key };
};

const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig();

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Missing or invalid Supabase environment variables. Using placeholder client for static generation/build.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
