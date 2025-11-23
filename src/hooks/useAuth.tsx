'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { diagLog } from '@/lib/diagnostic';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  userRole: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // First, try to get session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setSession(null);
        } else if (session) {
          setUser(session.user);
          setSession(session);
          diagLog('info', 'Session restored from Supabase', 'AuthProvider', { userId: session.user.id });
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
        }
      } finally {
        if (mounted) {
          isInitialized.current = true;
          setLoading(false);
        }
      }
    };

    // Set up auth state listener BEFORE getting initial session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        diagLog('info', 'onAuthStateChange event', 'AuthProvider', { event, hasSession: !!session, userId: session?.user?.id });
        
        setUser(session?.user || null);
        setSession(session);
        
        // Mark as initialized on first auth state change
        if (!isInitialized.current) {
          isInitialized.current = true;
          setLoading(false);
        }
      }
    );

    // Initialize auth state
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setUser(null);
      setSession(null);
      diagLog('info', 'signOut initiated', 'AuthProvider');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        diagLog('error', 'signOut error', 'AuthProvider', { error: error.message });
      }
    } catch (error) {
      console.error('Error in signOut:', error);
      diagLog('error', 'signOut exception', 'AuthProvider', { error: String(error) });
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated: !!session && !!user,
    userRole: user?.user_metadata?.role || null,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}