import { supabase } from './supabase';
import { User, AuthError, Session } from '@supabase/supabase-js';

export interface AuthUser {
    id: string;
    email: string;
}

// Sign up with email and password
export async function signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error('Sign up error:', error);
        return { user: null, error };
    }

    if (!data.user) {
        return { user: null, error: null };
    }

    return {
        user: {
            id: data.user.id,
            email: data.user.email || '',
        },
        error: null
    };
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Sign in error:', error);
        return { user: null, error };
    }

    if (!data.user) {
        return { user: null, error: null };
    }

    return {
        user: {
            id: data.user.id,
            email: data.user.email || '',
        },
        error: null
    };
}

// Sign out
export async function signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Sign out error:', error);
    }

    return { error };
}

// Get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    return {
        id: user.id,
        email: user.email || '',
    };
}

// Get current session
export async function getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
            callback({
                id: session.user.id,
                email: session.user.email || '',
            });
        } else {
            callback(null);
        }
    });

    return subscription;
}
