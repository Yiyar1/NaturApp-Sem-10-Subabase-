import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useCart } from '../../src/viewmodels/useCart';

export default function TabLayout() {
    const { colors } = useTheme();
    const { count } = useCart();

    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.tabInactive,
            tabBarStyle: {
                backgroundColor: colors.tabBarBg,
                borderTopColor: colors.border,
            },
            headerStyle: {
                backgroundColor: colors.headerBg
            },
            headerTintColor: colors.headerText,
        }}>
            <Tabs.Screen name='home' options={{
                title: 'NaturApp',
                tabBarIcon: ({ color, size }) =>
                    <Ionicons name='leaf' size={size}
                        color={color} />
            }} />
            <Tabs.Screen name='cart' options={{
                title: 'Carrito',
                tabBarBadge: count > 0 ? count : undefined,
                tabBarIcon: ({ color, size }) =>
                    <Ionicons name='cart' size={size}
                        color={color} />
            }} />
            <Tabs.Screen name='orders' options={{
                title: 'Pedidos',
                tabBarIcon: ({ color, size }) =>
                    <Ionicons name='receipt' size={size}
                        color={color} />
            }} />
            <Tabs.Screen name='profile' options={{
                title: 'Perfil',
                tabBarIcon: ({ color, size }) =>
                    <Ionicons name='person' size={size}
                        color={color} />
            }} />
        </Tabs>
    );
}
