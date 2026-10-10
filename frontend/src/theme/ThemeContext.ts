import {createContext, useContext} from 'react';

/** The theme a person picks; `system` follows their OS setting. */
export type Theme = 'light' | 'dark' | 'system';

/** The chosen theme, the one actually showing, and a way to change it. */
export interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

/**
 * Where the choice is saved. The inline script in `index.html` reads the same
 * key to apply the theme before the first paint.
 */
export const THEME_STORAGE_KEY = 'tb.theme';

/** Holds the theme; provided by `ThemeProvider`. */
export const ThemeContext = createContext<ThemeState | null>(null);

/** Returns the current theme. Must be used inside `ThemeProvider`. */
export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
