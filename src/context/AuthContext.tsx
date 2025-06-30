import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  isPro: boolean;
  createdAt: Date;
}

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
    // Check for existing session on mount
    const savedUser = localStorage.getItem('komorebi-user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser({
          ...parsedUser,
          createdAt: new Date(parsedUser.createdAt)
        });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('komorebi-user');
      }
    }
    setLoading(false);
  }, []);

  const updateUserName = (name: string) => {
    if (!user) return;
    
    const updatedUser = { ...user, name: name.trim() || undefined };
    setUser(updatedUser);
    localStorage.setItem('komorebi-user', JSON.stringify(updatedUser));
  };

  const updateUserEmail = (email: string) => {
    if (!user) return;
    
    const updatedUser = { ...user, email };
    setUser(updatedUser);
    localStorage.setItem('komorebi-user', JSON.stringify(updatedUser));
  };

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication - in real app, this would be an API call
      if (email && password) {
        const mockUser: User = {
          id: 'user_' + Date.now(),
          email,
          isPro: email.includes('pro') || email === 'dev@example.com',
          createdAt: new Date(),
        };
        
        setUser(mockUser);
        localStorage.setItem('komorebi-user', JSON.stringify(mockUser));
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('komorebi-user');
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