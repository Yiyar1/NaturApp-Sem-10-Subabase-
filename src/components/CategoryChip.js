import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function CategoryChip({ label, active, onPress }) {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    return (
        <TouchableOpacity
            style={[styles.chip, active && styles.activeChip]}
            onPress={onPress}
        >
            <Text style={[styles.label, active && styles.activeLabel]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const getStyles = (colors) => StyleSheet.create({
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.surface,
        marginRight: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    activeChip: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.textSecondary,
        textTransform: 'capitalize',
    },
    activeLabel: {
        color: '#FFF',
    },
});
