import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  updateUserName: (name: string) => void;
  updateUserEmail: (email: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing Supabase session on mount
    const fetchSession = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Get user profile data
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error('Error fetching user profile:', error);
            throw error;
          }
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.name || undefined,
            isPro: profile?.is_pro || false,
            createdAt: profile?.created_at ? new Date(profile.created_at) : new Date(),
          });
        }
      } catch (error) {
        console.error('Session fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Get user profile after sign-in
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.name || undefined,
            isPro: profile?.is_pro || false,
            createdAt: profile?.created_at ? new Date(profile.created_at) : new Date(),
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateUserName = (name: string) => {
    if (!user || !name.trim()) return;

    // Update in Supabase
    supabase
      .from('profiles')
      .update({ name: name.trim() })
      .eq('id', user.id)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating user name:', error);
          return;
        }

        // Update local state
        setUser({ ...user, name: name.trim() });
      });
  };

  const updateUserEmail = (email: string) => {
    if (!user) return;
    
    // Update in Supabase Auth
    supabase.auth.updateUser({ email })
      .then(({ error }) => {
        if (error) {
          console.error('Error updating user email:', error);
          return;
        }

        // Update local state
        setUser({ ...user, email });
      });
  };

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Get user profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error('Error fetching user profile:', profileError);
        }

        // Set user data
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: profile?.name || undefined,
          isPro: profile?.is_pro || false,
          createdAt: profile?.created_at ? new Date(profile.created_at) : new Date(),
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    login,
    updateUserName,
    updateUserEmail,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};