import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Users, Trophy, HeartPulse, Clock } from 'lucide-react-native';

const EVENT_CONFIG = {
    race: { label: 'Carrera', color: '#ffcc00', icon: Trophy },
    social: { label: 'Social', color: '#ff4444', icon: Users },
    health: { label: 'Salud/Personal', color: '#33ff99', icon: HeartPulse },
};

export default function EventCard({ event }) {
    const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.social;
    const Icon = config.icon;

    return (
        <View style={[styles.card, { borderColor: `${config.color}30` }]}>
            <View style={[styles.iconContainer, { backgroundColor: `${config.color}15` }]}>
                <Icon size={20} color={config.color} />
            </View>
            <View style={styles.details}>
                <Text style={styles.title}>{event.title}</Text>
                <View style={styles.metaRow}>
                    {event.time && (
                        <View style={styles.metaItem}>
                            <Clock size={12} color="#909090" />
                            <Text style={styles.metaText}>{event.time}</Text>
                        </View>
                    )}
                    <Text style={[styles.typeTag, { color: config.color }]}>{config.label}</Text>
                </View>
            </View>
            {event.impact && (
                <View style={styles.impactBadge}>
                    <Text style={styles.impactText}>{event.impact}</Text>
                </View>
            )}
            {event.restriction && (
                <View style={[styles.impactBadge, { backgroundColor: 'rgba(255, 69, 58, 0.1)' }]}>
                    <Text style={[styles.impactText, { color: '#ff453a' }]}>{event.restriction}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        marginBottom: 8,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    details: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#e0e0e0',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 4,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 11,
        color: '#909090',
    },
    typeTag: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    impactBadge: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    impactText: {
        fontSize: 10,
        color: '#909090',
        fontWeight: '600',
    }
});
