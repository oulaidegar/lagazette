'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type AuthContextType = {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signInWithGoogle: (targetRedirect?: string) => Promise<void>;
    signInWithPassword: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, fullName: string) => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signInWithGoogle: async () => { },
    signInWithPassword: async () => { },
    signUp: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check active session safely
        supabase.auth
            .getSession()
            .then(({ data: { session } }) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            })
            .catch((err) => {
                console.warn("Supabase auth session unavailable:", err?.message || err);
                setSession(null);
                setUser(null);
                setLoading(false);
            });

        // Listen for changes
        try {
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
                router.refresh();
            });

            return () => subscription.unsubscribe();
        } catch (e) {
            console.warn("Supabase onAuthStateChange unavailable:", e);
        }
    }, [router]);

    const signInWithGoogle = async (targetRedirect?: string) => {
        const next = targetRedirect || '/';
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
            },
        });
    };

    const signInWithPassword = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    };

    const signUp = async (email: string, password: string, fullName: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        });
        if (error) throw error;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signInWithPassword, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
