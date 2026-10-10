import {useEffect, useMemo, useState, type ReactNode} from 'react';
import {
  THEME_STORAGE_KEY,
  ThemeContext,
  type Theme,
  type ThemeState,
} from './ThemeContext';

/** Props for {@link ThemeProvider}. */
export interface ThemeProviderProps {
  children: ReactNode;
}

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Applies the saved or system theme to the page and provides it to the app. */
export function ThemeProvider({children}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia(DARK_QUERY).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const handleChange = () => setSystemDark(media.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  let resolvedTheme: 'light' | 'dark' = systemDark ? 'dark' : 'light';
  if (theme !== 'system') resolvedTheme = theme;

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const value = useMemo<ThemeState>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: next => {
        setThemeState(next);
        try {
          localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
          // Storage can be blocked (private windows); the choice still applies
          // for this visit.
        }
      },
    }),
    [theme, resolvedTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Storage can be blocked; fall back to the system theme.
  }
  return 'system';
}

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  // Match the browser chrome (mobile address bar) to the page background.
  const background = getComputedStyle(root)
    .getPropertyValue('--background')
    .trim();
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', background);
}
