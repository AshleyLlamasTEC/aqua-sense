// resources/js/hooks/useTheme.js
/**
 * Hook para gestión del tema claro/oscuro.
 *
 * Correcciones respecto a la versión anterior:
 * - getInitialTheme es una función normal pasada a useState(),
 *   no un useCallback (los inicializadores de useState se llaman
 *   una sola vez y no son efectos — useCallback era innecesario).
 * - setTheme y toggleTheme son estables sin useCallback porque
 *   setThemeState de useState ya es estable por definición.
 */
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'app-theme';

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage no disponible
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useTheme = () => {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignorar
    }
  }, [theme]);

  const setTheme = (newTheme) => setThemeState(newTheme);
  const toggleTheme = () => setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));

  return { theme, toggleTheme, setTheme };
};
