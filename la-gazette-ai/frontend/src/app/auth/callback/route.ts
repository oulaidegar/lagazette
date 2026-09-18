import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') || searchParams.get('redirect') || '/';

    if (code) {
        try {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error) {
                // Ensure redirect path is relative to avoid open redirect vulnerabilities
                const safeNext = next.startsWith('/') ? next : '/';
                return NextResponse.redirect(`${origin}${safeNext}`);
            }
            console.error('OAuth code exchange error:', error);
        } catch (e) {
            console.error('OAuth callback failed:', e);
        }
    }

    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
