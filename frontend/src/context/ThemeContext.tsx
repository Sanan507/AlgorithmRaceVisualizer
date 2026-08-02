import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeMode = 'dark' | 'light';
export type AccessibilityMode = 'default' | 'deuteranopia' | 'protanopia' | 'high-contrast';

export interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  accessibilityMode: AccessibilityMode;
  setAccessibilityMode: (mode: AccessibilityMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY_THEME = 'algorace_theme_mode';
const STORAGE_KEY_ACCESSIBILITY = 'algorace_accessibility_mode';

const ThemeContext = createContext<ThemeContextValue>({
  themeMode: 'dark',
  setThemeMode: () => {},
  accessibilityMode: 'default',
  setAccessibilityMode: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const [accessibilityMode, setAccessibilityModeState] = useState<AccessibilityMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACCESSIBILITY);
    if (saved === 'deuteranopia' || saved === 'protanopia' || saved === 'high-contrast') {
      return saved;
    }
    return 'default';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    localStorage.setItem(STORAGE_KEY_THEME, themeMode);
  }, [themeMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-accessibility', accessibilityMode);
    localStorage.setItem(STORAGE_KEY_ACCESSIBILITY, accessibilityMode);
  }, [accessibilityMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const setAccessibilityMode = (mode: AccessibilityMode) => {
    setAccessibilityModeState(mode);
  };

  const toggleTheme = () => {
    setThemeModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        accessibilityMode,
        setAccessibilityMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
