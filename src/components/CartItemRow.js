import React from 'react';
import {
    View, Text, Image,
    TouchableOpacity, StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function CartItemRow({
    item, onIncrease, onDecrease, onRemove }) {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    return (
        <View style={styles.row}>
            <Image
                source={{ uri: item.image }}
                style={styles.image}
            />
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={styles.price}>
                    S/ {item.price.toFixed(2)}
                </Text>
                <View style={styles.qtyRow}>
                    <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={onDecrease}>
                        <Text style={styles.qtyText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantity}>
                        {item.quantity}
                    </Text>
                    <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={onIncrease}>
                        <Text style={styles.qtyText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity
                style={styles.removeBtn}
                onPress={onRemove}>
                <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
        </View>
    );
}

const getStyles = (colors) => StyleSheet.create({
    row: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        alignItems: 'center',
        elevation: 1,
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 8,
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    price: {
        fontSize: 14,
        color: colors.accent,
        fontWeight: '600',
        marginTop: 2,
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    qtyBtn: {
        backgroundColor: colors.accentSoft,
        borderRadius: 6,
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.accent,
    },
    quantity: {
        marginHorizontal: 12,
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    removeBtn: {
        padding: 8,
    },
    removeText: {
        fontSize: 16,
        color: colors.danger,
        fontWeight: 'bold',
    },
});
