import React from 'react';
import {
    View, Text, FlatList,
    StyleSheet, ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useOrders } from
    '../../src/viewmodels/useOrders';
import { useTheme } from '../../src/context/ThemeContext';

export default function OrdersScreen() {
    const { orders, loading, error, refresh } = useOrders();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const renderOrder = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.orderId}>
                    Pedido #{item.id}
                </Text>
                <View style={[styles.badge,
                    { backgroundColor: item.getStatusColor() }]}>
                    <Text style={styles.badgeText}>
                        {item.status}
                    </Text>
                </View>
            </View>
            <Text style={styles.date}>
                {item.getFormattedDate()}
            </Text>
            <Text style={styles.address}>
                📍 {item.address || 'Sin dirección'}
            </Text>
            <View style={styles.footer}>
                <Text style={styles.itemCount}>
                    {item.items.length} producto(s)
                </Text>
                <Text style={styles.total}>
                    S/ {item.total.toFixed(2)}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mis Pedidos</Text>

            {loading && orders.length === 0 ? (
                <ActivityIndicator size='large'
                    color={colors.accent}
                    style={{ marginTop: 40 }} />
            ) : error ? (
                <Text style={styles.error}>{error}</Text>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderOrder}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={refresh}
                            tintColor={colors.accent}
                            colors={[colors.accent]}
                        />
                    }
                    ListEmptyComponent={
                        <Text style={styles.empty}>
                            No tienes pedidos aún
                        </Text>
                    }
                />
            )}
        </View>
    );
}

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1, backgroundColor: colors.background,
        padding: 16,
    },
    title: {
        fontSize: 22, fontWeight: 'bold',
        color: colors.primary, marginBottom: 16,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12, padding: 16,
        marginBottom: 12, elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderId: {
        fontSize: 16, fontWeight: 'bold',
        color: colors.text,
    },
    badge: {
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#FFF', fontSize: 12,
        fontWeight: '600', textTransform: 'capitalize',
    },
    date: {
        fontSize: 13, color: colors.textMuted, marginTop: 6,
    },
    address: {
        fontSize: 13, color: colors.textSecondary, marginTop: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12, paddingTop: 10,
        borderTopWidth: 1, borderTopColor: colors.border,
    },
    itemCount: {
        fontSize: 14, color: colors.textSecondary,
    },
    total: {
        fontSize: 16, fontWeight: 'bold',
        color: colors.accent,
    },
    empty: {
        textAlign: 'center', marginTop: 60,
        fontSize: 16, color: colors.textMuted,
    },
    error: {
        color: colors.danger, textAlign: 'center',
        marginTop: 40, fontSize: 16,
    },
});
