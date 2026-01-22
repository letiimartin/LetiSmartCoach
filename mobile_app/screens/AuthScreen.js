import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { Zap } from 'lucide-react-native';

export default function AuthScreen({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });

    async function handleAuth() {
        if (!email || !password) {
            setMessage({ type: 'error', content: 'Por favor, rellena todos los campos.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', content: '' });

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMessage({ type: 'success', content: '¡Registro casi listo! Revisa tu email para confirmar tu cuenta.' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onLogin();
            }
        } catch (error) {
            setMessage({ type: 'error', content: error.message });
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Zap size={64} color="#00f2ff" />
                    <Text style={styles.title}>LetiSmartCoach</Text>
                    <Text style={styles.subtitle}>Mobile Phase 1</Text>
                </View>

                <View style={styles.form}>
                    {message.content ? (
                        <View style={[styles.messageBox, message.type === 'error' ? styles.errorBox : styles.successBox]}>
                            <Text style={styles.messageText}>{message.content}</Text>
                        </View>
                    ) : null}

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#909090"
                        value={email}
                        onChangeText={(text) => setEmail(text.trim())}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#909090"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.buttonText}>
                                {isSignUp ? 'Crear Cuenta' : 'Entrar'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {
                        setIsSignUp(!isSignUp);
                        setMessage({ type: '', content: '' });
                    }}>
                        <Text style={styles.switchText}>
                            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0c',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#e0e0e0',
        marginTop: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#909090',
        marginTop: 4,
    },
    form: {
        gap: 16,
    },
    messageBox: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    errorBox: {
        backgroundColor: 'rgba(255, 69, 58, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 69, 58, 0.3)',
    },
    successBox: {
        backgroundColor: 'rgba(48, 209, 88, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(48, 209, 88, 0.3)',
    },
    messageText: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#00f2ff',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 8,
        height: 58,
        justifyContent: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    switchText: {
        color: '#00f2ff',
        textAlign: 'center',
        marginTop: 16,
        fontSize: 14,
    },
});
