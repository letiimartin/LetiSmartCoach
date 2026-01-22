import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Zap, Activity, Clock, Trophy } from 'lucide-react-native';
import { MOCK_ATHLETE } from '../constants/mocks';

export default function DashboardScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Hola, <Text style={styles.primaryText}>{MOCK_ATHLETE.name}</Text></Text>
                    <Text style={styles.subGreeting}>Tu resumen semanal está listo.</Text>
                </View>

                <View style={styles.statsGrid}>
                    <StatCard icon={<Activity color="#00f2ff" />} label="Carga" value={MOCK_ATHLETE.weekly_tss} unit="TSS" />
                    <StatCard icon={<Clock color="#00f2ff" />} label="Volumen" value="12.5" unit="h" />
                    <StatCard icon={<Zap color="#00f2ff" />} label="FTP" value={MOCK_ATHLETE.ftp} unit="W" />
                    <StatCard icon={<Trophy color="#00f2ff" />} label="Carrera" value={MOCK_ATHLETE.next_race_days} unit="días" />
                </View>

                <View style={styles.nextSessionSection}>
                    <Text style={styles.sectionTitle}>Siguiente Sesión</Text>
                    <View style={styles.sessionCard}>
                        <View style={styles.sessionHeader}>
                            <Zap color="#00f2ff" size={24} />
                            <View>
                                <Text style={styles.sessionName}>Umbral - 3x10min</Text>
                                <Text style={styles.sessionType}>Ciclismo • 1h 15min</Text>
                            </View>
                        </View>
                        <Text style={styles.sessionWhy}>
                            Estímulo de umbral para mejorar la potencia sostenida sin disparar la fatiga.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function StatCard({ icon, label, value, unit }) {
    return (
        <View style={styles.statCard}>
            <View style={styles.statIcon}>{icon}</View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label} ({unit})</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0c',
    },
    content: {
        padding: 24,
    },
    header: {
        marginBottom: 32,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '800',
        color: '#e0e0e0',
    },
    primaryText: {
        color: '#00f2ff',
    },
    subGreeting: {
        fontSize: 16,
        color: '#909090',
        marginTop: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statIcon: {
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: 12,
        color: '#909090',
        marginTop: 4,
        textTransform: 'uppercase',
    },
    nextSessionSection: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    sessionCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    sessionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    sessionName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    sessionType: {
        fontSize: 14,
        color: '#909090',
    },
    sessionWhy: {
        fontSize: 14,
        color: '#e0e0e0',
        borderLeftWidth: 2,
        borderLeftColor: '#00f2ff',
        paddingLeft: 12,
        fontStyle: 'italic',
    },
});
