import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import DatabaseService from
    '../src/services/databaseService';
import { ThemeProvider, useTheme } from
    '../src/context/ThemeContext';
import { CartProvider } from
    '../src/context/CartContext';

function RootLayoutNav() {
    const { colors, dark } = useTheme();

    return (
        <>
            <StatusBar style={dark ? 'light' : 'dark'} />
            <Stack screenOptions={{
                headerStyle: {
                    backgroundColor: colors.headerBg
                },
                headerTintColor: colors.headerText,
                contentStyle: {
                    backgroundColor: colors.background,
                },
            }}>
                <Stack.Screen name='(tabs)'
                    options={{ headerShown: false }} />
                <Stack.Screen name='product/[id]'
                    options={{ title: 'Detalle' }} />
            </Stack>
        </>
    );
}

export default function RootLayout() {
    // Inicializar SQLite al arrancar la app
    useEffect(() => {
        DatabaseService.init()
            .then(() => console.log('DB lista'))
            .catch(err => console.error(
                'Error DB:', err));
    }, []);

    return (
        <ThemeProvider>
            <CartProvider>
                <RootLayoutNav />
            </CartProvider>
        </ThemeProvider>
    );
}
