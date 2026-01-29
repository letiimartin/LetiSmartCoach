import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { wahooService } from '../services/wahooService';

const WahooCallbackScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const [status, setStatus] = useState('Procesando conexión con Wahoo...');

    useEffect(() => {
        const handleCallback = async () => {
            // Extract code from params (Universal Link or Deep Link)
            const { code } = route.params || {};

            if (!code) {
                console.error("No code found in params:", route.params);
                setStatus('Error: No se recibió el código de autorización.');
                Alert.alert("Error", "No se pudo completar la conexión con Wahoo.");
                setTimeout(() => navigation.navigate('MainTabs', { screen: 'Perfil' }), 2000);
                return;
            }

            try {
                console.log("Exchanging code:", code);
                const success = await wahooService.exchangeCode(code);

                if (success) {
                    setStatus('¡Conexión exitosa!');
                    Alert.alert("Éxito", "Tu cuenta de Wahoo ha sido conectada correctamente.");
                    navigation.navigate('MainTabs', { screen: 'Perfil' });
                } else {
                    throw new Error("Exchange failed");
                }
            } catch (error) {
                console.error("Wahoo Callback Error:", error);
                setStatus('Error al conectar con Wahoo.');
                Alert.alert("Error", "Hubo un problema al intercambiar los tokens con Wahoo.");
                navigation.navigate('MainTabs', { screen: 'Perfil' });
            }
        };

        handleCallback();
    }, [route.params]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#00f2ff" />
            <Text style={styles.text}>{status}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0c',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    text: {
        color: '#e0e0e0',
        marginTop: 20,
        fontSize: 16,
        textAlign: 'center',
    },
});

export default WahooCallbackScreen;
