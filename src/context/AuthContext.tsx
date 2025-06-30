import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  is_pro?: boolean;
  created_at?: string;
  updated_at?: string;
  timezone?: string;
  last_session_type?: string;
  preferred_scene?: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  status: string;
  plan: string;
  created_at?: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at?: string;
  canceled_at?: string;
  payment_provider: string;
  payment_provider_id?: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_scene?: string;
  video_enabled?: boolean;
  theme_preference?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  subscription: UserSubscription | null;
  preferences: UserPreferences | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: AuthError }>;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<{ error?: AuthError }>;
  // Aliases for backward compatibility
  login: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signup: (email: string, password: string, name?: string) => Promise<{ error?: AuthError }>;
  logout: () => Promise<{ error?: AuthError }>;
  isGuest: boolean;
  startGuestSession: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: any }>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<{ error?: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Fetch user profile
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Fetch user subscription
  const fetchSubscription = async (userId: string): Promise<UserSubscription | null> => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  };

  // Fetch user preferences
  const fetchPreferences = async (userId: string): Promise<UserPreferences | null> => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return null;
    }
  };

  // Load user data
  const loadUserData = async (user: User) => {
    try {
      const [profileData, subscriptionData, preferencesData] = await Promise.all([
        fetchProfile(user.id),
        fetchSubscription(user.id),
        fetchPreferences(user.id)
      ]);

      setProfile(profileData);
      setSubscription(subscriptionData);
      setPreferences(preferencesData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await loadUserData(session.user);
          } else {
            // If no user session is found, automatically start a guest session
            // This ensures everyone can use the app immediately
            setIsGuest(true);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // On any error, still allow guest access
        setIsGuest(true);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // User logged in, disable guest mode
          setIsGuest(false);
          await loadUserData(session.user);
        } else {
          // No user session, enable guest mode
          setIsGuest(true);
          setProfile(null);
          setSubscription(null);
          setPreferences(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Sign up
  const signUp = async (email: string, password: string, _name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    return { error: error || undefined };
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error || undefined };
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setIsGuest(false);
    return { error: error || undefined };
  };

  // Aliases for backward compatibility
  const login = signIn;
  const signup = signUp;
  const logout = signOut;

  // Guest session functionality
  const startGuestSession = () => {
    setIsGuest(true);
  };

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { error };
      }

      setProfile(data);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Update preferences
  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { error };
      }

      setPreferences(data);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user);
    }
  };

  const value = {
    user,
    profile,
    subscription,
    preferences,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    login,
    signup,
    logout,
    isGuest,
    startGuestSession,
    updateProfile,
    updatePreferences,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};