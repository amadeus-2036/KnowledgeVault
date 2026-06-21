import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('themeMode') || 'light');
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem('themeColor') || 'sage');
  const [showGrid, setShowGrid] = useState(() => {
    const saved = localStorage.getItem('showGrid');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-mode', themeMode);
    root.setAttribute('data-theme', themeColor);
    root.setAttribute('data-grid', showGrid.toString());

    localStorage.setItem('themeMode', themeMode);
    localStorage.setItem('themeColor', themeColor);
    localStorage.setItem('showGrid', showGrid.toString());
  }, [themeMode, themeColor, showGrid]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, themeColor, setThemeColor, showGrid, setShowGrid }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
