import { useState, useEffect, useCallback } from 'react';
import StorageService from '../services/storageService';
import { useTheme } from '../context/ThemeContext';

export function useProfile() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [notifications, setNotifications] =
        useState(true);

    // El tema vive en el ThemeContext (fuente única de verdad)
    // para que el cambio se refleje en toda la app al instante.
    const { dark, toggleTheme: toggleGlobalTheme } = useTheme();

    const loadProfile = useCallback(async () => {
        const profile = await StorageService.getUserProfile();
        setName(profile.name);
        setEmail(profile.email);
        setNotifications(
            await StorageService.getNotifications()
        );
    }, []);

    const saveProfile = useCallback(async () => {
        await StorageService.saveUserProfile(name, email);
    }, [name, email]);

    const toggleTheme = useCallback(async () => {
        await toggleGlobalTheme();
    }, [toggleGlobalTheme]);

    const toggleNotifications = useCallback(async () => {
        const newVal = !notifications;
        setNotifications(newVal);
        await StorageService.setNotifications(newVal);
    }, [notifications]);

    useEffect(() => { loadProfile(); }, [loadProfile]);

    return {
        name, setName, email, setEmail,
        darkTheme: dark, notifications,
        saveProfile, toggleTheme,
        toggleNotifications,
    };
}
