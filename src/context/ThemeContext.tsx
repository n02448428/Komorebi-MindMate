import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'morning' | 'evening';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('komorebi-theme');
    return (savedTheme as Theme) || 'morning';
  });

  useEffect(() => {
    localStorage.setItem('komorebi-theme', theme);
    
    // Apply theme to document root
    const root = document.documentElement;
    root.classList.remove('morning', 'evening');
    root.classList.add(theme);
    
    // Update CSS custom properties based on theme
    if (theme === 'morning') {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc');
      root.style.setProperty('--text-primary', '#1f2937');
      root.style.setProperty('--text-secondary', '#6b7280');
      root.style.setProperty('--accent', '#3b82f6');
    } else {
      root.style.setProperty('--bg-primary', '#1f2937');
      root.style.setProperty('--bg-secondary', '#374151');
      root.style.setProperty('--text-primary', '#f9fafb');
      root.style.setProperty('--text-secondary', '#d1d5db');
      root.style.setProperty('--accent', '#60a5fa');
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'morning' ? 'evening' : 'morning');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const value = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};