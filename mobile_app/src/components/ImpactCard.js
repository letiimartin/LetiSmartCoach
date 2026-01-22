import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ImpactCard({ summary }) {
    if (!summary) return null;

    return (
        <View style={styles.card}>
            <View style={styles.statsRow}>
                <StatItem value={summary.sessions} label="Sesiones" />
                <StatItem value={summary.hours} label="Horas" />
                <StatItem value={summary.tss} label="TSS" />
            </View>
            <View style={styles.divider} />
            <View style={styles.footer}>
                <Text style={styles.footerText}>• {summary.restrictions} días con restricciones</Text>
                <Text style={styles.footerText}>• {summary.keyRace}</Text>
            </View>
        </View>
    );
}

function StatItem({ value, label }) {
    return (
        <View style={styles.statBox}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(0, 242, 255, 0.05)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 242, 255, 0.2)',
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#00f2ff',
    },
    statLabel: {
        fontSize: 12,
        color: '#909090',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0, 242, 255, 0.1)',
        marginBottom: 16,
    },
    footer: {
        gap: 6,
    },
    footerText: {
        fontSize: 13,
        color: '#e0e0e0',
        lineHeight: 18,
    }
});
