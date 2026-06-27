import React, { useEffect, useState } from 'react';
import {
    View, Text, Image, ScrollView,
    TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ApiService from '../../src/services/apiService';
import { useCart } from '../../src/viewmodels/useCart';
import { Product } from '../../src/models/Product';
import { useTheme } from '../../src/context/ThemeContext';

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const { addItem } = useCart();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            const data = await ApiService.getProductById(id);
            setProduct(Product.fromJSON(data));
        } catch (err) {
            Alert.alert('Error',
                'No se pudo cargar el producto');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        setAdding(true);
        try {
            await addItem(product);
            Alert.alert('Agregado',
                `${product.name} agregado al carrito`);
        } catch (e) {
            Alert.alert('Error', e.message);
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size='large'
                    color={colors.accent} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>
                    Producto no encontrado
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Image
                source={{ uri: product.image }}
                style={styles.image}
            />
            <View style={styles.content}>
                <Text style={styles.category}>
                    {product.category}
                </Text>
                <Text style={styles.name}>
                    {product.name}
                </Text>
                <Text style={styles.price}>
                    {product.getFormattedPrice()}
                </Text>

                {/* Rating */}
                <View style={styles.ratingRow}>
                    <Text style={styles.rating}>
                        ⭐ {product.rating.toFixed(1)}
                    </Text>
                    <Text style={styles.stock}>
                        {product.isAvailable()
                            ? `✅ ${product.stock} en stock`
                            : '❌ Sin stock'}
                    </Text>
                </View>

                {/* Descripción */}
                <Text style={styles.sectionTitle}>
                    Descripción
                </Text>
                <Text style={styles.description}>
                    {product.description}
                </Text>

                {/* Beneficios */}
                {product.benefits.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>
                            Beneficios
                        </Text>
                        {product.benefits.map((b, i) => (
                            <Text key={i}
                                style={styles.benefit}>
                                🌿 {b}
                            </Text>
                        ))}
                    </>
                )}

                {/* Botón agregar */}
                <TouchableOpacity
                    style={[styles.addBtn,
                        (!product.isAvailable() || adding) &&
                        styles.disabledBtn]}
                    onPress={handleAddToCart}
                    disabled={!product.isAvailable() || adding}>
                    {adding ? (
                        <ActivityIndicator color='#FFF' />
                    ) : (
                        <Text style={styles.addBtnText}>
                            {product.isAvailable()
                                ? 'Agregar al Carrito'
                                : 'Sin Disponibilidad'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1, backgroundColor: colors.background,
    },
    center: {
        flex: 1, alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    image: {
        width: '100%', height: 300,
    },
    content: {
        padding: 20,
    },
    category: {
        fontSize: 13, color: colors.textMuted,
        textTransform: 'capitalize',
    },
    name: {
        fontSize: 24, fontWeight: 'bold',
        color: colors.primary, marginTop: 4,
    },
    price: {
        fontSize: 26, fontWeight: 'bold',
        color: colors.accent, marginTop: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12, paddingVertical: 10,
        borderTopWidth: 1, borderBottomWidth: 1,
        borderColor: colors.border,
    },
    rating: {
        fontSize: 15, color: colors.text,
    },
    stock: {
        fontSize: 14, color: colors.textSecondary,
    },
    sectionTitle: {
        fontSize: 18, fontWeight: 'bold',
        color: colors.primary, marginTop: 20,
        marginBottom: 8,
    },
    description: {
        fontSize: 15, color: colors.textSecondary,
        lineHeight: 22,
    },
    benefit: {
        fontSize: 14, color: colors.text,
        paddingVertical: 4,
    },
    addBtn: {
        backgroundColor: colors.accent,
        borderRadius: 12, padding: 16,
        alignItems: 'center', marginTop: 24,
        marginBottom: 30,
    },
    disabledBtn: {
        backgroundColor: colors.textMuted,
        opacity: 0.7,
    },
    addBtnText: {
        color: '#FFF', fontSize: 17,
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 16, color: colors.danger,
    },
});
