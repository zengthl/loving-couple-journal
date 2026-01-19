import { useState, useEffect } from 'react';
import { AuthUser, getCurrentUser, getSession, onAuthStateChange } from './auth';

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        // Check active session
        getSession().then(session => {
            setSession(session);
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                });
            }
            setLoading(false);
        });

        // Listen for auth changes
        const subscription = onAuthStateChange((user) => {
            setUser(user);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return {
        user,
        loading,
        session,
        isAuthenticated: !!user,
    };
}
