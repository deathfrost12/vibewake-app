import { create } from 'zustand';
import { supabase } from '../services/supabase/client';
import { googleAuth } from '../services/auth/google-auth';
import { appleAuth } from '../services/auth/apple-auth';

// Helper function to decode JWT without verification (just for nonce extraction)
const decodeJWT = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
};

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthState {
  // Core state
  user: UserProfile | null;
  session: any;
  loading: boolean;
  error: string | null;

  // Email verification state
  emailVerificationSent: boolean;
  emailVerificationLoading: boolean;

  // Password reset state
  passwordResetSent: boolean;
  passwordResetLoading: boolean;

  // Actions - Email/Password
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{
    success: boolean;
    error?: string;
    needsVerification?: boolean;
  }>;

  // Actions - Social Auth
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithApple: () => Promise<{ success: boolean; error?: string }>;

  // Actions - General
  signOut: () => Promise<void>;

  // Email verification
  resendEmailVerification: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;

  // Password reset
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;

  // Session management
  refreshSession: () => Promise<{ success: boolean; error?: string }>;
  checkSession: () => Promise<void>;

  // Utility
  clearError: () => void;
  setSession: (session: any) => void;
  initialize: () => (() => void) | void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  // Initial state
  user: null,
  session: null,
  loading: false,
  error: null,
  emailVerificationSent: false,
  emailVerificationLoading: false,
  passwordResetSent: false,
  passwordResetLoading: false,

  // Initialize auth listener
  initialize: () => {
    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 Auth state change:', { event, hasSession: !!session });

      if (event === 'SIGNED_IN' && session) {
        const userProfile = {
          id: session.user.id,
          email: session.user.email!,
          full_name:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name,
          avatar_url:
            session.user.user_metadata?.avatar_url ||
            session.user.user_metadata?.picture,
          created_at: session.user.created_at,
          updated_at: session.user.updated_at,
        };

        set({
          user: userProfile,
          session: session,
          loading: false,
          error: null,
        });
      } else if (event === 'SIGNED_OUT') {
        set({
          user: null,
          session: null,
          loading: false,
          error: null,
          emailVerificationSent: false,
          passwordResetSent: false,
        });
      } else if (event === 'TOKEN_REFRESHED' && session) {
        set({ session: session, loading: false });
      }
    });

    // Check for existing session
    const checkInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          // Auth state change listener will handle this
        } else {
          set({ loading: false });
        }
      } catch (error) {
        console.error('Error checking initial session:', error);
        set({ loading: false });
      }
    };

    checkInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  },

  // Email/Password Authentication
  signInWithEmail: async (email: string, password: string) => {
    set({ loading: true, error: null });

    try {
      console.log('🔍 Signing in with email...', { email });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      console.log('🔍 Supabase email sign-in result:', {
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: error?.message,
      });

      if (error) {
        // Localized error messages
        let errorMsg = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMsg = 'Neplatné přihlašovací údaje. Zkontrolujte email a heslo.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMsg =
            'Email nebyl ověřen. Zkontrolujte svou emailovou schránku.';
        } else if (error.message.includes('Too many requests')) {
          errorMsg = 'Příliš mnoho pokusů. Zkuste to znovu za chvíli.';
        }

        set({ loading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      if (data.user && data.session) {
        // Auth state listener will handle user setup
        set({ loading: false });
        return { success: true };
      }

      const errorMsg = 'Nepodařilo se přihlásit. Zkuste to znovu.';
      set({ loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    } catch (error: any) {
      const errorMsg = `Chyba při přihlašování: ${error.message}`;
      set({ loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  signUpWithEmail: async (
    email: string,
    password: string,
    fullName?: string
  ) => {
    set({ loading: true, error: null });

    try {
      console.log('🔍 Signing up with email...', { email, fullName });

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${typeof window !== 'undefined' && window?.location?.origin ? window.location.origin : 'repetito://'}auth/callback`,
        },
      });

      console.log('🔍 Supabase email sign-up result:', {
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        confirmationSent: !!data?.user && !data?.session,
        error: error?.message,
      });

      if (error) {
        // Localized error messages
        let errorMsg = error.message;
        if (error.message.includes('User already registered')) {
          errorMsg =
            'Uživatel s tímto emailem již existuje. Zkuste se přihlásit.';
        } else if (error.message.includes('Password should be at least')) {
          errorMsg = 'Heslo musí mít alespoň 6 znaků.';
        } else if (error.message.includes('Unable to validate email address')) {
          errorMsg = 'Neplatný formát emailové adresy.';
        }

        set({ loading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      if (data.user) {
        if (data.session) {
          // User is immediately signed in (email confirmation disabled)
          set({ loading: false });
          return { success: true };
        } else {
          // Email confirmation required
          set({
            loading: false,
            emailVerificationSent: true,
            error: null,
          });
          return {
            success: true,
            needsVerification: true,
          };
        }
      }

      const errorMsg = 'Nepodařilo se zaregistrovat. Zkuste to znovu.';
      set({ loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    } catch (error: any) {
      const errorMsg = `Chyba při registraci: ${error.message}`;
      set({ loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  // Google OAuth (improved version)
  signInWithGoogle: async () => {
    set({ loading: true, error: null });

    try {
      console.log('🔍 Starting Google OAuth flow...');

      // Use different approach based on platform
      const isWebBrowser = typeof window !== 'undefined' && window.location;

      if (isWebBrowser) {
        // Web OAuth flow
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/auth/callback',
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        if (error) {
          const errorMsg = `Google OAuth chyba: ${error.message}`;
          set({ loading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }

        // Will redirect to Google - loading will be cleared by auth listener
        return { success: true };
      } else {
        // Mobile native flow
        console.log('🔍 Mobile detected, using custom Google Auth...');

        const result = await googleAuth.signIn();

        console.log('🔍 Google OAuth result:', {
          success: result.success,
          hasIdToken: !!result.idToken,
          hasUser: !!result.user,
          error: result.error,
        });

        if (!result.success || !result.idToken) {
          const errorMsg =
            result.error || 'Nepodařilo se přihlásit přes Google';
          set({ loading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }

        console.log('🔍 Authenticating with Supabase using Google token...');

        // Extract nonce from token for proper Supabase auth
        const decodedToken = decodeJWT(result.idToken);
        const nonce = decodedToken?.nonce;

        console.log('🔍 Token info:', {
          hasToken: !!result.idToken,
          hasNonce: !!nonce,
          tokenStart: result.idToken.substring(0, 20) + '...',
        });

        const tokenParams: any = {
          provider: 'google',
          token: result.idToken,
        };

        if (result.accessToken) {
          tokenParams.access_token = result.accessToken;
        }

        if (nonce) {
          tokenParams.nonce = nonce;
        }

        const { data: authData, error: authError } =
          await supabase.auth.signInWithIdToken(tokenParams);

        console.log('🔍 Supabase auth result:', {
          hasUser: !!authData?.user,
          hasSession: !!authData?.session,
          error: authError?.message,
        });

        if (authError) {
          const errorMsg = `Supabase auth chyba: ${authError.message}`;
          set({ loading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }

        if (authData.user && authData.session) {
          // Auth state listener will handle user setup
          set({ loading: false });
          return { success: true };
        }

        const errorMsg = 'Nepodařilo se dokončit Google přihlášení';
        set({ loading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }
    } catch (error: any) {
      const errorMsg = `Google OAuth chyba: ${error.message}`;
      set({ loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  // Apple Sign-In (production implementation)
  signInWithApple: async () => {
    set({ loading: true, error: null });

    try {
      console.log('🍎 Starting Apple Sign-In...');

      // Configure Apple Sign-In
      const configured = await appleAuth.configure();
      if (!configured) {
        const errorMsg = 'Apple Sign-In není dostupný na tomto zařízení';
        set({ loading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      // Get Apple credential
      const appleResult = await appleAuth.signIn();

      if (!appleResult.success || !appleResult.idToken) {
        const errorMsg =
          appleResult.error || 'Nepodařilo se přihlásit přes Apple';
        set({ loading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      console.log('🍎 Apple credential obtained, signing in with Supabase...');

      // Use the original nonce from Apple Auth service (not from JWT)
      const nonce = appleResult.nonce;

      console.log('🍎 Token info:', {
        hasToken: !!appleResult.idToken,
        hasNonce: !!nonce,
        tokenStart: appleResult.idToken.substring(0, 20) + '...',
        nonceSource: 'apple-auth-service',
      });

      // Sign in with Supabase using Apple ID token with original nonce
      const tokenParams: any = {
        provider: 'apple',
        token: appleResult.idToken,
      };

      if (nonce) {
        tokenParams.nonce = nonce;
      }

      const { data, error } =
        await supabase.auth.signInWithIdToken(tokenParams);

      if (error) {
        console.error('🍎 Supabase Apple Sign-In error:', error);
        const errorMsg = `Apple přihlášení chyba: ${error.message}`;
        set({ loading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      console.log('🍎 Apple Sign-In successful:', {
        hasUser: !!data.user,
        hasSession: !!data.session,
        userId: data.user?.id,
        email: data.user?.email,
      });

      // Update local state
      set({
        user: data.user
          ? {
              id: data.user.id,
              email: data.user.email || '',
              full_name:
                data.user.user_metadata?.full_name ||
                (appleResult.fullName
                  ? `${appleResult.fullName.given_name || ''} ${appleResult.fullName.family_name || ''}`.trim()
                  : undefined),
              avatar_url: data.user.user_metadata?.avatar_url,
              created_at: data.user.created_at,
              updated_at: data.user.updated_at,
            }
          : null,
        session: data.session,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error: any) {
      console.error('🍎 Apple Sign-In error:', error);
      const errorMsg = `Apple Sign-In chyba: ${error.message}`;
      set({ loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  // Sign out
  signOut: async () => {
    set({ loading: true, error: null });

    try {
      // Sign out from Google first
      try {
        await googleAuth.signOut();
      } catch (googleError) {
        console.warn('Google sign out error:', googleError);
      }

      // Sign out from Apple (minimal cleanup)
      try {
        await appleAuth.signOut();
      } catch (appleError) {
        console.warn('Apple sign out error:', appleError);
      }

      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Supabase sign out error:', error);
        set({ loading: false, error: error.message });
        return;
      }

      // Auth state listener will handle cleanup
      set({ loading: false });
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Even if there's an error, clear the local state
      set({
        user: null,
        session: null,
        loading: false,
        error: null,
        emailVerificationSent: false,
        passwordResetSent: false,
      });
    }
  },

  // Email verification
  resendEmailVerification: async (email: string) => {
    set({ emailVerificationLoading: true, error: null });

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${typeof window !== 'undefined' && window?.location?.origin ? window.location.origin : 'repetito://'}auth/callback`,
        },
      });

      if (error) {
        const errorMsg = `Chyba při odesílání ověřovacího emailu: ${error.message}`;
        set({ emailVerificationLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      set({
        emailVerificationLoading: false,
        emailVerificationSent: true,
        error: null,
      });
      return { success: true };
    } catch (error: any) {
      const errorMsg = `Chyba při odesílání ověřovacího emailu: ${error.message}`;
      set({ emailVerificationLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  // Password reset
  resetPassword: async (email: string) => {
    set({ passwordResetLoading: true, error: null });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${typeof window !== 'undefined' && window?.location?.origin ? window.location.origin : 'repetito://'}auth/reset-password`,
        }
      );

      if (error) {
        const errorMsg = `Chyba při odesílání emailu pro obnovení hesla: ${error.message}`;
        set({ passwordResetLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      set({
        passwordResetLoading: false,
        passwordResetSent: true,
        error: null,
      });
      return { success: true };
    } catch (error: any) {
      const errorMsg = `Chyba při odesílání emailu pro obnovení hesla: ${error.message}`;
      set({ passwordResetLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  updatePassword: async (newPassword: string) => {
    set({ loading: true, error: null });

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        const errorMsg = `Chyba při změně hesla: ${error.message}`;
        set({ loading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      set({ loading: false, error: null });
      return { success: true };
    } catch (error: any) {
      const errorMsg = `Chyba při změně hesla: ${error.message}`;
      set({ loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  // Session management
  refreshSession: async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Session refresh error:', error);
        return { success: false, error: error.message };
      }

      if (data.session) {
        set({ session: data.session });
        return { success: true };
      }

      return { success: false, error: 'No session to refresh' };
    } catch (error: any) {
      console.error('Session refresh error:', error);
      return { success: false, error: error.message };
    }
  },

  checkSession: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Auth state listener will handle this
      } else {
        set({ user: null, session: null, loading: false });
      }
    } catch (error: any) {
      console.error('Session check error:', error);
      set({ user: null, session: null, loading: false });
    }
  },

  // Utility methods
  clearError: () => set({ error: null }),

  setSession: (session: any) => set({ session }),
}));

// Hook for checking if user is authenticated
export const useAuth = () => {
  const { session, user, loading } = useAuthStore();

  return {
    isAuthenticated: !!session && !!user,
    user,
    loading,
  };
};
