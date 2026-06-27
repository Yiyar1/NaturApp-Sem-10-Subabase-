import React from 'react';
import {
    View, Text, TextInput, Switch,
    TouchableOpacity, StyleSheet, Alert,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from
    '../../src/viewmodels/useProfile';
import { useTheme } from '../../src/context/ThemeContext';

export default function ProfileScreen() {
    const {
        name, setName, email, setEmail,
        darkTheme, notifications,
        saveProfile, toggleTheme,
        toggleNotifications,
    } = useProfile();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const handleSave = async () => {
        await saveProfile();
        Alert.alert('Guardado', 'Perfil actualizado');
    };

    return (
        <ScrollView style={styles.container}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
                <View style={styles.avatar}>
                    <Ionicons name='person'
                        size={48} color='#FFF' />
                </View>
                <Text style={styles.greeting}>
                    {name || 'Usuario NaturApp'}
                </Text>
            </View>

            {/* Datos personales */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Datos Personales
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder='Tu nombre'
                    placeholderTextColor={colors.placeholder}
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder='tu@email.com'
                    placeholderTextColor={colors.placeholder}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType='email-address'
                    autoCapitalize='none'
                />
                <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSave}>
                    <Text style={styles.saveBtnText}>
                        Guardar Cambios
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Preferencias */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Preferencias
                </Text>
                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Ionicons name='moon'
                            size={20} color={colors.textSecondary} />
                        <Text style={styles.settingLabel}>
                            Tema Oscuro
                        </Text>
                    </View>
                    <Switch
                        value={darkTheme}
                        onValueChange={toggleTheme}
                        trackColor={{
                            false: colors.border,
                            true: colors.accent
                        }}
                        thumbColor='#FFF'
                    />
                </View>
                <View style={[styles.settingRow,
                    styles.settingRowLast]}>
                    <View style={styles.settingInfo}>
                        <Ionicons name='notifications'
                            size={20} color={colors.textSecondary} />
                        <Text style={styles.settingLabel}>
                            Notificaciones
                        </Text>
                    </View>
                    <Switch
                        value={notifications}
                        onValueChange={toggleNotifications}
                        trackColor={{
                            false: colors.border,
                            true: colors.accent
                        }}
                        thumbColor='#FFF'
                    />
                </View>
            </View>

            {/* Info app */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Acerca de
                </Text>
                <Text style={styles.aboutText}>
                    NaturApp v1.0.0
                </Text>
                <Text style={styles.aboutDesc}>
                    Tu tienda de productos naturales 🌿
                </Text>
            </View>
        </ScrollView>
    );
}

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1, backgroundColor: colors.background,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: colors.headerBg,
    },
    avatar: {
        width: 80, height: 80,
        borderRadius: 40,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    greeting: {
        fontSize: 18, fontWeight: 'bold',
        color: colors.headerText,
    },
    section: {
        backgroundColor: colors.surface,
        marginHorizontal: 16, marginTop: 16,
        borderRadius: 12, padding: 16,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 16, fontWeight: 'bold',
        color: colors.primary, marginBottom: 12,
    },
    input: {
        borderWidth: 1, borderColor: colors.border,
        backgroundColor: colors.inputBg,
        color: colors.text,
        borderRadius: 8, padding: 12,
        marginBottom: 10, fontSize: 15,
    },
    saveBtn: {
        backgroundColor: colors.accent,
        borderRadius: 10, padding: 14,
        alignItems: 'center', marginTop: 4,
    },
    saveBtnText: {
        color: '#FFF', fontSize: 15,
        fontWeight: 'bold',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceAlt,
    },
    settingRowLast: {
        borderBottomWidth: 0,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 15, color: colors.text,
        marginLeft: 10,
    },
    aboutText: {
        fontSize: 15, color: colors.text,
        fontWeight: '600',
    },
    aboutDesc: {
        fontSize: 14, color: colors.textMuted,
        marginTop: 4, marginBottom: 8,
    },
});
