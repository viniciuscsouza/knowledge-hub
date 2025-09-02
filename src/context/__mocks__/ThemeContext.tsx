'use client';

import { createContext, useContext } from 'react';

export const mockToggleTheme = jest.fn();

const mockThemeContext = {
  theme: 'light',
  toggleTheme: mockToggleTheme,
};

export const ThemeContext = createContext(mockThemeContext);

export const useTheme = () => useContext(ThemeContext);
