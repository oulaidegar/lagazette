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

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        // Non-blocking lock implementation to prevent Navigator LockManager timeouts
        // when offline, in development, or if the Supabase project domain is unreachable
        lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
            return await fn();
        },
    },
    global: {
        // Safe fetch wrapper: gracefully handles network/DNS rejections (e.g. paused/offline Supabase hosts)
        // by returning a standard HTTP 503 Response instead of throwing uncaught TypeErrors in the browser.
        fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
            try {
                return await fetch(input, init);
            } catch (error: any) {
                return new Response(
                    JSON.stringify({
                        error: "service_unavailable",
                        message: "Supabase service is unreachable or paused."
                    }),
                    {
                        status: 503,
                        statusText: "Service Unavailable",
                        headers: { "Content-Type": "application/json" }
                    }
                );
            }
        },
    },
});
