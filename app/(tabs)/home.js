import React from 'react';
import {
    View, Text, FlatList, TextInput,
    StyleSheet, ActivityIndicator,
    ScrollView, RefreshControl,
} from 'react-native';
import { useProducts } from
    '../../src/viewmodels/useProducts';
import { useCart } from
    '../../src/viewmodels/useCart';
import ProductCard from
    '../../src/components/ProductCard';
import CategoryChip from
    '../../src/components/CategoryChip';
import { useTheme } from '../../src/context/ThemeContext';

const CATEGORIES = [
    'todos', 'superfoods', 'aceites',
    'capsulas', 'infusiones', 'miel',
];

export default function HomeScreen() {
    // Obtener datos del ViewModel (NO del servicio)
    const {
        products, loading, error,
        category, setCategory,
        searchQuery, setSearchQuery,
        search, refresh,
    } = useProducts();
    const { addItem } = useCart();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const handleAddToCart = async (product) => {
        try {
            await addItem(product);
            alert(`${product.name} agregado al carrito`);
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <View style={styles.container}>
            {/* Barra de búsqueda */}
            <TextInput
                style={styles.searchBar}
                placeholder='Buscar productos naturales...'
                placeholderTextColor={colors.placeholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => search(searchQuery)}
            />

            {/* Chips de categorías */}
            <ScrollView horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categories}>
                {CATEGORIES.map(cat => (
                    <CategoryChip
                        key={cat}
                        label={cat}
                        active={category === cat}
                        onPress={() => setCategory(cat)}
                    />
                ))}
            </ScrollView>

            {/* Lista de productos */}
            {loading && products.length === 0 ? (
                <ActivityIndicator size='large'
                    color={colors.accent} />
            ) : error ? (
                <Text style={styles.error}>{error}</Text>
            ) : (
                <FlatList
                    data={products}
                    numColumns={2}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <ProductCard
                            product={item}
                            onAddToCart={() =>
                                handleAddToCart(item)}
                        />
                    )}
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
                            No se encontraron productos
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
        padding: 12
    },
    searchBar: {
        backgroundColor: colors.inputBg,
        color: colors.text,
        borderRadius: 10, padding: 12,
        fontSize: 15, marginBottom: 10,
        borderWidth: 1, borderColor: colors.border
    },
    categories: {
        marginBottom: 10,
        maxHeight: 44
    },
    error: {
        color: colors.danger, textAlign: 'center',
        marginTop: 40, fontSize: 16
    },
    empty: {
        color: colors.textMuted, textAlign: 'center',
        marginTop: 40, fontSize: 15
    },
});
