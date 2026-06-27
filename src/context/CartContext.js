import React, {
    createContext, useContext, useState,
    useCallback, useMemo, useEffect,
} from 'react';
import DatabaseService from '../services/databaseService';
import ApiService from '../services/apiService';
import { CartItem } from '../models/CartItem';

// ============================================
// CART CONTEXT
// Antes, useCart() creaba un estado de React
// independiente cada vez que se llamaba, por lo
// que Home, Carrito y Detalle de producto NO
// compartían el mismo carrito en pantalla (aunque
// SQLite sí tenía los datos correctos). Al mover
// el estado a un Context, todas las pantallas leen
// y escriben la misma fuente de verdad y se
// refrescan automáticamente entre sí.
// ============================================

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const loadCart = useCallback(async () => {
        setLoading(true);
        try {
            await DatabaseService.init();
            const rows = await DatabaseService.getCartItems();
            setItems(rows.map(r => CartItem.fromRow(r)));
            const t = await DatabaseService.getCartTotal();
            setTotal(t);
            const c = await DatabaseService.getCartCount();
            setCount(c);
        } catch (err) {
            console.warn('Error cargando carrito:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // AGREGAR producto (validación + persistencia)
    const addItem = useCallback(async (product) => {
        if (!product.isAvailable()) {
            throw new Error('Producto sin stock');
        }
        await DatabaseService.addToCart(product);
        await loadCart();
    }, [loadCart]);

    // ACTUALIZAR cantidad
    const updateQuantity = useCallback(
        async (productId, qty) => {
            if (qty < 0) return;
            await DatabaseService.updateCartQuantity(
                productId, qty
            );
            await loadCart();
        }, [loadCart]
    );

    // ELIMINAR item
    const removeItem = useCallback(
        async (productId) => {
            await DatabaseService.removeFromCart(productId);
            await loadCart();
        }, [loadCart]
    );

    // CHECKOUT: Envía pedido a la API remota (Supabase)
    const checkout = useCallback(
        async (address) => {
            if (items.length === 0) {
                throw new Error('El carrito está vacío');
            }
            if (!address.trim()) {
                throw new Error('Ingrese una dirección');
            }
            const order = await ApiService.createOrder({
                items: items.map(i => ({
                    productId: i.productId,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                })),
                total,
                address,
            });
            // Limpiar carrito local (SQLite) solo si el
            // pedido remoto se registró con éxito
            await DatabaseService.clearCart();
            await loadCart();
            return order;
        }, [items, total, loadCart]
    );

    // Cargar el carrito una sola vez al montar el Provider
    // (en la raíz de la app), no por cada pantalla.
    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const value = useMemo(() => ({
        items, total, count, loading,
        addItem, updateQuantity, removeItem,
        checkout, refresh: loadCart,
    }), [items, total, count, loading,
        addItem, updateQuantity, removeItem,
        checkout, loadCart]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

// Mismo nombre/forma que antes (useCart) para no tener
// que tocar los imports en las pantallas existentes.
export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error(
            'useCart debe usarse dentro de <CartProvider>'
        );
    }
    return ctx;
}
