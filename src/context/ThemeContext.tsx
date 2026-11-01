import React, { createContext, useContext, useEffect, useState } from 'react';

export type WikiTheme = 'emerald' | 'starlight';

interface ThemeContextType {
  theme: WikiTheme;
  toggleTheme: () => void;
  setTheme: (theme: WikiTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'emerald',
  toggleTheme: () => {},
  setTheme: () => {},
});

const THEME_STORAGE_KEY = 'backwoods_wiki_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<WikiTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'starlight' || saved === 'emerald') {
        return saved;
      }
    } catch {
      // Fallback if localStorage is restricted
    }
    return 'emerald';
  });

  const setTheme = (newTheme: WikiTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore quota errors
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'emerald' ? 'starlight' : 'emerald');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
