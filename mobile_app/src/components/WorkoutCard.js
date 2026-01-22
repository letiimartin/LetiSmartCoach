import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Activity, Zap, Target, CheckCircle2, Circle, XCircle, ChevronRight } from 'lucide-react-native';

const SPORT_ICONS = {
    ciclismo: Zap,
    running: Activity,
    fuerza: Target,
};

const STATUS_CONFIG = {
    hecho: { icon: CheckCircle2, color: '#30d158', label: 'Hecho' },
    saltado: { icon: XCircle, color: '#ff453a', label: 'Saltado' },
    planificado: { icon: Circle, color: '#909090', label: 'Planificado' },
};

export default function WorkoutCard({ workout, onPress, onToggleStatus }) {
    const Icon = SPORT_ICONS[workout.sport] || Activity;
    const { icon: StatusIcon, color: statusColor } = STATUS_CONFIG[workout.status];
    const isDone = workout.status === 'hecho';
    const isSkipped = workout.status === 'saltado';

    return (
        <TouchableOpacity
            style={[
                styles.card,
                isDone && styles.cardDone,
                isSkipped && styles.cardSkipped
            ]}
            onPress={onPress}
        >
            <View style={[styles.iconContainer, { backgroundColor: isDone ? 'rgba(48, 209, 88, 0.1)' : 'rgba(0, 242, 255, 0.1)' }]}>
                <Icon size={24} color={isDone ? '#30d158' : '#00f2ff'} />
            </View>

            <View style={styles.details}>
                <View style={styles.titleRow}>
                    <Text style={[styles.title, isSkipped && styles.textDimmed]}>{workout.title}</Text>
                    {workout.status !== 'planificado' && (
                        <StatusIcon size={16} color={statusColor} />
                    )}
                </View>
                <Text style={styles.meta}>
                    {workout.sport.charAt(0).toUpperCase() + workout.sport.slice(1)} • {workout.duration} • {workout.zone}
                </Text>
            </View>

            <TouchableOpacity style={styles.actionArea} onPress={() => onToggleStatus?.(workout.id)}>
                {workout.status === 'planificado' ? (
                    <View style={styles.markDoneCta}>
                        <CheckCircle2 size={24} color="rgba(255,255,255,0.2)" />
                    </View>
                ) : (
                    <ChevronRight size={20} color="#606060" />
                )}
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 12,
    },
    cardDone: {
        borderColor: 'rgba(48, 209, 88, 0.3)',
        backgroundColor: 'rgba(48, 209, 88, 0.05)',
    },
    cardSkipped: {
        opacity: 0.6,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    details: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    meta: {
        fontSize: 12,
        color: '#909090',
        marginTop: 4,
    },
    textDimmed: {
        color: '#707070',
        textDecorationLine: 'line-through',
    },
    actionArea: {
        padding: 4,
    },
    markDoneCta: {
        padding: 4,
    }
});
