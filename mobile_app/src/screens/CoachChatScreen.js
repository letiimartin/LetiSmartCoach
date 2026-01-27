import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, dbo, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User as UserIcon, ChevronLeft } from 'lucide-react-native';

const MOCK_INITIAL_MESSAGES = [
    { id: '1', role: 'coach', text: '¡Hola! Soy tu entrenador virtual. ¿Cómo te sientes para el entreno de hoy?' },
];

export default function CoachChatScreen({ navigation }) {
    const [messages, setMessages] = useState(MOCK_INITIAL_MESSAGES);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef(null);

    const sendMessage = () => {
        if (!inputText.trim()) return;

        const userMsg = {
            id: Date.now().toString(),
            role: 'user',
            text: inputText.trim()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // Mock Coach Response
        setTimeout(() => {
            const coachMsg = {
                id: (Date.now() + 1).toString(),
                role: 'coach',
                text: getMockResponse(userMsg.text)
            };
            setMessages(prev => [...prev, coachMsg]);
            setIsTyping(false);
        }, 1500);
    };

    const getMockResponse = (input) => {
        const lower = input.toLowerCase();
        if (lower.includes('cansado') || lower.includes('fatiga')) return "Entendido. Si te sientes muy fatigado, considera reducir la intensidad a Z1 o tomar un día de descanso activo.";
        if (lower.includes('dolor')) return "El dolor nunca es buena señal. ¿Es muscular o articular? Si persiste, mejor parar.";
        if (lower.includes('gracias')) return "¡De nada! A darle caña.";
        return "Tomo nota. Adaptaremos el plan según tu feedback. ¡Sigue así!";
    };

    useEffect(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, [messages, isTyping]);

    const renderItem = ({ item }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[styles.messageRow, isUser ? styles.rowUser : styles.rowCoach]}>
                {!isUser && (
                    <View style={styles.avatarCoach}>
                        <Bot size={20} color="#00f2ff" />
                    </View>
                )}
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleCoach]}>
                    <Text style={[styles.messageText, isUser ? styles.textUser : styles.textCoach]}>
                        {item.text}
                    </Text>
                </View>
                {isUser && (
                    <View style={styles.avatarUser}>
                        <UserIcon size={20} color="#fff" />
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color="#fff" size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Coach Chat</Text>
                <View style={{ width: 28 }} />
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={() => isTyping && (
                    <View style={styles.typingContainer}>
                        <View style={styles.avatarCoach}>
                            <Bot size={20} color="#00f2ff" />
                        </View>
                        <View style={styles.typingBubble}>
                            <ActivityIndicator size="small" color="#00f2ff" />
                        </View>
                    </View>
                )}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputArea}>
                    <TextInput
                        style={styles.input}
                        placeholder="Escribe a tu coach..."
                        placeholderTextColor="#606060"
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={sendMessage}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                        onPress={sendMessage}
                        disabled={!inputText.trim()}
                    >
                        <Send size={20} color={inputText.trim() ? "#000" : "#909090"} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0c',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
        gap: 16,
        paddingBottom: 32,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        maxWidth: '85%',
    },
    rowUser: {
        alignSelf: 'flex-end',
    },
    rowCoach: {
        alignSelf: 'flex-start',
    },
    avatarCoach: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 242, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 242, 255, 0.3)',
    },
    avatarUser: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubble: {
        padding: 12,
        borderRadius: 20,
        minWidth: 60,
    },
    bubbleCoach: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderBottomLeftRadius: 4,
    },
    bubbleUser: {
        backgroundColor: '#00f2ff',
        borderBottomRightRadius: 4,
    },
    textCoach: {
        color: '#e0e0e0',
        fontSize: 15,
        lineHeight: 22,
    },
    textUser: {
        color: '#000',
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
    },
    inputArea: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        backgroundColor: '#0a0a0c',
        alignItems: 'center',
        gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: '#fff',
        fontSize: 15,
        maxHeight: 100,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#00f2ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendBtnDisabled: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
        marginLeft: 0,
    },
    typingBubble: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
    },
});
