import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../services/apiService';
import { Order } from '../models/Order';

export function useOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ApiService.getOrders();
            setOrders(data.map(o => Order.fromJSON(o)));
        } catch (err) {
            setError('No se pudo cargar el historial');
        } finally {
            setLoading(false);
        }
    }, []);

    // Antes la pantalla de Pedidos solo cargaba los datos una
    // vez al montarse (useEffect con []). Como Expo Router
    // mantiene las pestañas montadas, si el usuario ya había
    // visitado "Pedidos" y luego creaba un pedido nuevo desde
    // el Carrito, no lo veía aparecer al volver a esta pestaña.
    // useFocusEffect recarga los pedidos cada vez que la
    // pantalla vuelve a estar en foco.
    useFocusEffect(
        useCallback(() => {
            loadOrders();
        }, [loadOrders])
    );

    return {
        orders, loading, error,
        refresh: loadOrders
    };
}
