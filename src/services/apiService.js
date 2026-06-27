import { supabase } from './supabaseClient';
import StorageService from './storageService';

// ============================================
// PERSISTENCIA REMOTA - API REST
// Conexión con backend Express/Node.js
// Usa fetch con async/await (asincronía)

// ============================================
// PERSISTENCIA REMOTA - SUPABASE
// Conexión con base de datos PostgreSQL en la nube
// Usa el cliente de Supabase con async/await
// ============================================

/*
const BASE_URL = 'http://192.168.1.100:9090/api';

// Helper para peticiones HTTP con manejo de errores
async function request(endpoint, options = {}) {
    try {
        const token = await StorageService.getToken();
        const response = await fetch(
            `${BASE_URL}${endpoint}`,
            {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && {
                        Authorization: `Bearer ${token}`
                    }),
                    ...options.headers,
                },
            }
        );

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
            );
        }
        return await response.json();
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}
*/

const ApiService = {
    // === PRODUCTOS (READ) ===

    // Obtener productos, opcionalmente filtrados por categoría
    async getProducts(category = null) {
        /*
        const query = category
            ? `?category=${category}` : '';
        return await request(`/products${query}`);
        },
        */
        let query = supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return data;
    },

    // Obtener un producto por su ID
    async getProductById(id) {
        // return await request(`/products/${id}`);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    // Buscar productos por nombre
    async searchProducts(query) {
        /*
        return await request(
            `/products/search?q=${encodeURIComponent(query)}`
        );
        */
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .ilike('name', `%${query}%`);

        if (error) throw new Error(error.message);
        return data;
    },

    // === PEDIDOS (CRUD completo) ===
    // === PEDIDOS (CRUD) ===

    // CREATE: Crear nuevo pedido
    async createOrder(orderData) {
        /*
        return await request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
        */
        if (!orderData.items || orderData.items.length === 0) {
            throw new Error('El pedido no tiene productos');
        }

        // 1. Insertar el pedido
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                total: orderData.total,
                address: orderData.address,
                status: 'pendiente',
            })
            .select()
            .single();

        if (orderError) throw new Error(orderError.message);

        // 2. Insertar los items del pedido
        const items = orderData.items.map(item => ({
            order_id: order.id,
            product_id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(items);

        if (itemsError) {
            // Rollback manual: si no se pudieron guardar los
            // productos del pedido, no dejamos un pedido vacío
            // "fantasma" en el historial del usuario.
            await supabase.from('orders').delete().eq('id', order.id);
            throw new Error(
                'No se pudo registrar el detalle del pedido: ' +
                itemsError.message
            );
        }

        return { ...order, items };
    },

    // READ: Obtener historial de pedidos
    async getOrders() {
        // return await request('/orders');
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        // Mapear order_items a "items" para compatibilidad
        return data.map(order => ({
            ...order,
            items: order.order_items || [],
            date: order.created_at,
        }));
    },

    // READ: Detalle de un pedido
    async getOrderById(id) {
        // return await request(`/orders/${id}`);
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (*)
            `)
            .eq('id', id)
            .single();

        if (error) throw new Error(error.message);
        return {
            ...data,
            items: data.order_items || [],
            date: data.created_at,
        };
    },

    // === AUTENTICACIÓN ===
    async login(email, password) {
        /*
        const data = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        // Guarda token en persistencia básica
        if (data.token) {
            await StorageService.saveToken(data.token);
        }
        */
        const { data, error } = await supabase.auth
            .signInWithPassword({ email, password });

        if (error) throw new Error(error.message);

        // Guardar en persistencia básica
        await StorageService.saveToken(data.session.access_token);
        await StorageService.saveUserProfile(
            // data.user.name, data.user.email
            data.user.user_metadata?.name || email,
            email
        );
        return data;
    },

    // === CATEGORÍAS ===
    async getCategories() {
        //return await request('/categories');
        const { data, error } = await supabase
            .from('products')
            .select('category');

        if (error) throw new Error(error.message);

        // Extraer categorías únicas
        const unique = [...new Set(data.map(p => p.category))];
        return unique;
    },
};

export default ApiService;
