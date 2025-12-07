// components/IncrementInput.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

interface IncrementInputProps {
    label: string;
    value: number;
    onChange: (newValue: number) => void;
    min?: number;
    max?: number;
}

const IncrementInput = ({ label, value, onChange, min = 0, max = 100 }: IncrementInputProps) => {
    const decrement = () => {
        if (value > min) onChange(value - 1);
    };

    const increment = () => {
        if (value < max) onChange(value + 1);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.controlContainer}>
                <TouchableOpacity onPress={decrement} style={styles.button}>
                    <Text style={styles.buttonText}>−</Text>
                </TouchableOpacity>

                <View style={styles.valueBox}>
                    <Text style={styles.valueText}>{value}</Text>
                </View>

                <TouchableOpacity onPress={increment} style={styles.button}>
                    <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default IncrementInput;

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        marginBottom: 16
    },
    label: {
        fontSize: 16,
        marginBottom: 6,
        fontWeight: '500',
    },
    controlContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#007BFF',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    valueBox: {
        marginHorizontal: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderRadius: 6,
        borderColor: '#ccc',
    },
    valueText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
