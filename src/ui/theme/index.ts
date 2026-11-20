import { createContext, useContext } from 'react';
import { light, type Theme } from './tokens';

export * from './tokens';

export const ThemeContext = createContext<Theme>({ dark: false, c: light });
export const useTheme = () => useContext(ThemeContext);
