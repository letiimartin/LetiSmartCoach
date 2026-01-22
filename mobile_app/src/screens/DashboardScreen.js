import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap, Activity, Clock, Trophy, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import { useWorkouts } from '../context/WorkoutsContext';
import { profileService } from '../services/profileService';
import ImpactCard from '../components/ImpactCard';

export default function DashboardScreen({ navigation }) {
    const { events, loading: workoutsLoading, updateWorkoutStatus } = useWorkouts();
    const [athlete, setAthlete] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        profileService.getProfile().then(data => {
            setAthlete(data);
            setLoading(false);
        });
    }, []);

    if (loading || workoutsLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator color="#00f2ff" />
            </SafeAreaView>
        );
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todayWorkout = events.find(e => e.date === '2026-01-22' && e.type === 'workout'); // Hardcoded today for mock

    // Summary Stats
    const weeklySummary = {
        sessions: events.filter(e => e.type === 'workout').length,
        hours: "8h 30m",
        tss: 420,
        restrictions: events.filter(e => e.type === 'health' && e.restriction).length,
        keyRace: "15 días para: Gran Fondo Pirineos"
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Hola, <Text style={styles.primaryText}>{athlete.name}</Text></Text>
                    <Text style={styles.subGreeting}>Tu resumen semanal está listo.</Text>
                </View>

                {/* Sección HOY */}
                <View style={styles.heroSection}>
                    <Text style={styles.sectionTitle}>Entreno de Hoy</Text>
                    {todayWorkout ? (
                        <View style={[styles.todayCard, todayWorkout.status === 'hecho' && styles.todayCardDone]}>
                            <View style={styles.todayHeader}>
                                <View style={styles.todayIconCircle}>
                                    <Zap color="#00f2ff" size={32} />
                                </View>
                                <View style={styles.todayMeta}>
                                    <Text style={styles.todaySport}>{todayWorkout.sport.toUpperCase()}</Text>
                                    <Text style={styles.todayTitle}>{todayWorkout.title}</Text>
                                    <View style={styles.intensityTag}>
                                        <Text style={styles.intensityText}>{todayWorkout.zone} • {todayWorkout.intensity}</Text>
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.todayDesc} numberOfLines={2}>
                                {todayWorkout.description}
                            </Text>

                            <View style={styles.todayActions}>
                                <TouchableOpacity
                                    style={styles.mainCta}
                                    onPress={() => navigation.navigate('WorkoutDetail', { workout: todayWorkout })}
                                >
                                    <Text style={styles.mainCtaText}>Ver sesión</Text>
                                    <ChevronRight size={18} color="#000" />
                                </TouchableOpacity>

                                {todayWorkout.status === 'planificado' && (
                                    <TouchableOpacity
                                        style={styles.secondaryCta}
                                        onPress={() => updateWorkoutStatus(todayWorkout.id, 'hecho')}
                                    >
                                        <CheckCircle2 size={18} color="#30d158" />
                                        <Text style={styles.secondaryCtaText}>Hecho</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.restDayCard}>
                            <Text style={styles.restDayText}>Hoy toca recuperación 🧘‍♂️</Text>
                            <Text style={styles.restDaySub}>Aprovecha para hidratar y descansar.</Text>
                        </View>
                    )}
                </View>

                {/* Resumen Semanal Strip */}
                <ImpactCard summary={weeklySummary} />

                {/* Métricas con Significado */}
                <View style={styles.statsGrid}>
                    <StatCard
                        icon={<Zap color="#00f2ff" size={20} />}
                        label="FTP"
                        value={athlete.ftp_w ? `${athlete.ftp_w}W` : 'No definido'}
                        trend="↑ 5W"
                    />
                    <StatCard
                        icon={<Trophy color="#ffcc00" size={20} />}
                        label="Meta"
                        value={`${athlete.next_race_days} días`}
                        trend="En 2 semanas"
                    />
                </View>

                {/* Mini Agenda Semanal */}
                <View style={styles.agendaSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Agenda Semanal</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Calendario')}>
                            <Text style={styles.linkText}>Ver todo</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.agendaStrip}>
                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => {
                            const hasWorkout = i !== 4; // Mock logic
                            const intensityColor = i === 1 || i === 3 ? '#ff453a' : i === 6 ? '#00f2ff' : '#30d158';
                            return (
                                <View key={i} style={styles.agendaDay}>
                                    <Text style={styles.dayLabel}>{day}</Text>
                                    <View style={[
                                        styles.dayIndicator,
                                        hasWorkout ? { backgroundColor: intensityColor } : styles.dayRest
                                    ]} />
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function StatCard({ icon, label, value, trend }) {
    return (
        <View style={styles.statCard}>
            <View style={styles.statTop}>
                {icon}
                <Text style={styles.statTrend}>{trend}</Text>
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0c',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0a0a0c',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    greeting: {
        fontSize: 26,
        fontWeight: '800',
        color: '#e0e0e0',
    },
    primaryText: {
        color: '#00f2ff',
    },
    subGreeting: {
        fontSize: 15,
        color: '#909090',
        marginTop: 4,
    },
    heroSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 12,
    },
    todayCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#00f2ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    todayCardDone: {
        borderColor: 'rgba(48, 209, 88, 0.3)',
    },
    todayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 12,
    },
    todayIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(0, 242, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    todayMeta: {
        flex: 1,
    },
    todaySport: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#00f2ff',
        letterSpacing: 1,
    },
    todayTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 2,
    },
    intensityTag: {
        marginTop: 4,
    },
    intensityText: {
        fontSize: 12,
        color: '#909090',
    },
    todayDesc: {
        fontSize: 14,
        color: '#b0b0b0',
        lineHeight: 20,
        marginBottom: 16,
    },
    todayActions: {
        flexDirection: 'row',
        gap: 12,
    },
    mainCta: {
        flex: 1,
        backgroundColor: '#00f2ff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
    },
    mainCtaText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 15,
    },
    secondaryCta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    secondaryCtaText: {
        color: '#e0e0e0',
        fontSize: 14,
        fontWeight: '600',
    },
    restDayCard: {
        backgroundColor: 'rgba(48, 209, 88, 0.05)',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(48, 209, 88, 0.2)',
    },
    restDayText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#30d158',
    },
    restDaySub: {
        fontSize: 13,
        color: '#909090',
        marginTop: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statTrend: {
        fontSize: 10,
        color: '#30d158',
        fontWeight: 'bold',
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: 11,
        color: '#606060',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    agendaSection: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    linkText: {
        fontSize: 14,
        color: '#00f2ff',
        fontWeight: '600',
    },
    agendaStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 16,
        borderRadius: 16,
    },
    agendaDay: {
        alignItems: 'center',
        gap: 8,
    },
    dayLabel: {
        fontSize: 12,
        color: '#606060',
        fontWeight: 'bold',
    },
    dayIndicator: {
        width: 24,
        height: 4,
        borderRadius: 2,
    },
    dayRest: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    }
});
