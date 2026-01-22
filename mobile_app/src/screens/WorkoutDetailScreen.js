import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap, Activity, Clock, Target, ChevronLeft, CheckCircle2, XCircle } from 'lucide-react-native';
import { useWorkouts } from '../context/WorkoutsContext';

export default function WorkoutDetailScreen({ route, navigation }) {
    const { workout } = route.params;
    const { updateWorkoutStatus } = useWorkouts();

    const handleStatusUpdate = (status) => {
        updateWorkoutStatus(workout.id, status);
        navigation.goBack();
    };

    const SportIcon = workout.sport === 'ciclismo' ? Zap : workout.sport === 'running' ? Activity : Target;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color="#fff" size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detalle de Sesión</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.heroSection}>
                    <View style={styles.iconCircle}>
                        <SportIcon size={40} color="#00f2ff" />
                    </View>
                    <Text style={styles.title}>{workout.title}</Text>
                    <View style={styles.badgeRow}>
                        <View style={styles.badge}><Text style={styles.badgeText}>{workout.sport.toUpperCase()}</Text></View>
                        <View style={[styles.badge, styles.zoneBadge]}><Text style={styles.zoneText}>{workout.zone}</Text></View>
                    </View>
                </View>

                <View style={styles.statsGrid}>
                    <DetailStat icon={<Clock size={20} color="#909090" />} label="Duración" value={workout.duration} />
                    <DetailStat icon={<Activity size={20} color="#909090" />} label="Carga (TSS)" value={workout.tss} />
                    <DetailStat icon={<Zap size={20} color="#909090" />} label="Intensidad" value={workout.intensity} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Objetivo y Descripción</Text>
                    <Text style={styles.description}>{workout.description}</Text>
                </View>

                <View style={styles.footerActions}>
                    <TouchableOpacity
                        style={[styles.primaryButton, workout.status === 'hecho' && styles.buttonDone]}
                        onPress={() => handleStatusUpdate('hecho')}
                    >
                        <CheckCircle2 color="#000" size={20} />
                        <Text style={styles.primaryButtonText}>Marcar como hecha</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => handleStatusUpdate('saltado')}
                    >
                        <XCircle color="#ff453a" size={20} />
                        <Text style={styles.secondaryButtonText}>Saltar sesión</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function DetailStat({ icon, label, value }) {
    return (
        <View style={styles.statItem}>
            <View style={styles.statHeader}>
                {icon}
                <Text style={styles.statLabel}>{label}</Text>
            </View>
            <Text style={styles.statValue}>{value}</Text>
        </View>
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
    backButton: {
        padding: 4,
    },
    content: {
        padding: 24,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0, 242, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(0, 242, 255, 0.3)',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: '#909090',
        fontSize: 12,
        fontWeight: 'bold',
    },
    zoneBadge: {
        backgroundColor: 'rgba(0, 242, 255, 0.2)',
    },
    zoneText: {
        color: '#00f2ff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 32,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 6,
    },
    statLabel: {
        fontSize: 10,
        color: '#606060',
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: '#b0b0b0',
        lineHeight: 24,
    },
    footerActions: {
        gap: 12,
        marginTop: 16,
    },
    primaryButton: {
        backgroundColor: '#00f2ff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: 18,
        borderRadius: 16,
    },
    buttonDone: {
        backgroundColor: '#30d158',
    },
    primaryButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 69, 58, 0.3)',
    },
    secondaryButtonText: {
        color: '#ff453a',
        fontWeight: '600',
        fontSize: 15,
    },
});
