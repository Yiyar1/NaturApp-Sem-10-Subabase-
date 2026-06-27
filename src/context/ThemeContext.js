import React, {
    createContext, useContext, useState,
    useEffect, useCallback, useMemo,
} from 'react';
import { useColorScheme } from 'react-native';
import StorageService from '../services/storageService';

// ============================================
// THEME CONTEXT
// Fuente única de verdad para el modo oscuro.
// Cualquier pantalla o componente puede leer
// `colors` y `dark` mediante useTheme().
// ============================================

// Paleta de colores en modo claro
const lightColors = {
    mode: 'light',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    surfaceAlt: '#F0F0F0',
    primary: '#1A5276',
    accent: '#148F77',
    accentSoft: '#E8F6F3',
    text: '#333333',
    textSecondary: '#666666',
    textMuted: '#888888',
    border: '#E0E0E0',
    danger: '#E74C3C',
    headerBg: '#1A5276',
    headerText: '#FFFFFF',
    tabBarBg: '#FFFFFF',
    tabInactive: '#9AA5B1',
    placeholder: '#9AA5B1',
    inputBg: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.4)',
};

// Paleta de colores en modo oscuro
const darkColors = {
    mode: 'dark',
    background: '#0F1620',
    surface: '#1B2530',
    surfaceAlt: '#222E3A',
    primary: '#5DADE2',
    accent: '#45C9A5',
    accentSoft: '#1E3833',
    text: '#ECF0F1',
    textSecondary: '#BDC3C7',
    textMuted: '#8896A6',
    border: '#2E3B47',
    danger: '#FF6B5E',
    headerBg: '#142028',
    headerText: '#ECF0F1',
    tabBarBg: '#142028',
    tabInactive: '#6B7785',
    placeholder: '#6B7785',
    inputBg: '#222E3A',
    overlay: 'rgba(0,0,0,0.6)',
};

const ThemeContext = createContext({
    dark: false,
    colors: lightColors,
    themePreference: 'system',
    setThemePreference: () => {},
    toggleTheme: () => {},
    ready: false,
});

export function ThemeProvider({ children }) {
    const systemScheme = useColorScheme(); // 'light' | 'dark' | null

    // 'system' | 'light' | 'dark'
    const [themePreference, setThemePreferenceState] =
        useState('system');
    const [ready, setReady] = useState(false);

    // Cargar preferencia guardada al iniciar
    useEffect(() => {
        StorageService.getThemePreference()
            .then(pref => setThemePreferenceState(pref))
            .finally(() => setReady(true));
    }, []);

    const setThemePreference = useCallback(async (pref) => {
        setThemePreferenceState(pref);
        await StorageService.setThemePreference(pref);
    }, []);

    // Alterna entre claro/oscuro explícitamente
    // (usado por el Switch de Perfil)
    const toggleTheme = useCallback(async () => {
        const currentlyDark = themePreference === 'dark' ||
            (themePreference === 'system' &&
                systemScheme === 'dark');
        const next = currentlyDark ? 'light' : 'dark';
        await setThemePreference(next);
    }, [themePreference, systemScheme, setThemePreference]);

    const dark = themePreference === 'system'
        ? systemScheme === 'dark'
        : themePreference === 'dark';

    const colors = dark ? darkColors : lightColors;

    const value = useMemo(() => ({
        dark,
        colors,
        themePreference,
        setThemePreference,
        toggleTheme,
        ready,
    }), [dark, colors, themePreference,
        setThemePreference, toggleTheme, ready]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
