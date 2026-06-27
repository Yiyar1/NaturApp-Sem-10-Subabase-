import React, { useState } from 'react';
import {
    View, Text, FlatList, TextInput,
    TouchableOpacity, StyleSheet, Alert,
    ActivityIndicator,
} from 'react-native';
import { useCart } from
    '../../src/viewmodels/useCart';
import CartItemRow from
    '../../src/components/CartItemRow';
import { useTheme } from '../../src/context/ThemeContext';

export default function CartScreen() {
    const {
        items, total, loading,
        updateQuantity, removeItem, checkout,
    } = useCart();
    const [address, setAddress] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const handleCheckout = async () => {
        setSubmitting(true);
        try {
            const order = await checkout(address);
            Alert.alert('Pedido Creado',
                `Pedido #${order.id} registrado.`);
            setAddress('');
        } catch (e) {
            Alert.alert('Error', e.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Mi Carrito ({items.length} items)
            </Text>

            <FlatList
                data={items}
                keyExtractor={item =>
                    item.productId.toString()}
                renderItem={({ item }) => (
                    <CartItemRow
                        item={item}
                        onIncrease={() =>
                            updateQuantity(
                                item.productId,
                                item.quantity + 1)}
                        onDecrease={() =>
                            updateQuantity(
                                item.productId,
                                item.quantity - 1)}
                        onRemove={() =>
                            removeItem(item.productId)}
                    />
                )}
                ListEmptyComponent={
                    !loading && (
                        <Text style={styles.empty}>
                            Tu carrito está vacío
                        </Text>
                    )}
            />

            {items.length > 0 && (
                <View style={styles.footer}>
                    <TextInput
                        style={styles.addressInput}
                        placeholder='Dirección de entrega'
                        placeholderTextColor={colors.placeholder}
                        value={address}
                        onChangeText={setAddress}
                    />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>
                            Total:</Text>
                        <Text style={styles.totalValue}>
                            S/ {total.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.checkoutBtn,
                            submitting && styles.disabledBtn]}
                        onPress={handleCheckout}
                        disabled={submitting}>
                        {submitting ? (
                            <ActivityIndicator color='#FFF' />
                        ) : (
                            <Text style={styles.checkoutText}>
                                Realizar Pedido</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1, backgroundColor: colors.background,
        padding: 16
    },
    title: {
        fontSize: 22, fontWeight: 'bold',
        color: colors.primary, marginBottom: 16
    },
    empty: {
        textAlign: 'center', marginTop: 60,
        fontSize: 16, color: colors.textMuted
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: colors.border, paddingTop: 16
    },
    addressInput: {
        backgroundColor: colors.inputBg,
        color: colors.text,
        borderRadius: 8, padding: 12,
        borderWidth: 1, borderColor: colors.border,
        marginBottom: 12
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    totalLabel: {
        fontSize: 18, fontWeight: '600',
        color: colors.text
    },
    totalValue: {
        fontSize: 20, fontWeight: 'bold',
        color: colors.accent
    },
    checkoutBtn: {
        backgroundColor: colors.accent,
        borderRadius: 10, padding: 16,
        alignItems: 'center'
    },
    disabledBtn: {
        opacity: 0.7,
    },
    checkoutText: {
        color: '#FFF', fontSize: 16,
        fontWeight: 'bold'
    },
});
