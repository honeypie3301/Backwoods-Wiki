import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

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

  const setTheme = useCallback((newTheme: WikiTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore quota errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const nextTheme = prev === 'emerald' ? 'starlight' : 'emerald';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {
        // Ignore quota errors
      }
      return nextTheme;
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const contextValue = useMemo<ThemeContextType>(() => ({
    theme,
    toggleTheme,
    setTheme,
  }), [theme, toggleTheme, setTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
