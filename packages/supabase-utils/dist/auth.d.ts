import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import type { AuthCredentials } from './types';
export declare class AuthService {
    static signInWithEmail(credentials: AuthCredentials): Promise<{
        user: User;
        session: Session;
        weakPassword?: import("@supabase/supabase-js").WeakPassword;
    }>;
    static signUp(credentials: AuthCredentials): Promise<{
        user: User | null;
        session: Session | null;
    }>;
    static signOut(): Promise<void>;
    static getSession(): Promise<Session | null>;
    static getUser(): Promise<User | null>;
    static onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): {
        data: {
            subscription: import("@supabase/supabase-js").Subscription;
        };
    };
    static sendMagicLink(email: string, options?: {
        redirectTo?: string;
    }): Promise<void>;
    static resetPassword(email: string, options?: {
        redirectTo?: string;
    }): Promise<void>;
    static updatePassword(newPassword: string): Promise<void>;
}
