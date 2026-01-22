import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Activity, Trophy, Users, HeartPulse } from 'lucide-react-native';
import { useWorkouts } from '../context/WorkoutsContext';
import WorkoutCard from '../components/WorkoutCard';
import EventCard from '../components/EventCard';
import ImpactCard from '../components/ImpactCard';

const { width } = Dimensions.get('window');

const EVENT_TYPES = {
    workout: { label: 'Entreno', color: '#00f2ff', icon: Activity, priority: 1 },
    race: { label: 'Carrera', color: '#ffcc00', icon: Trophy, priority: 2 },
    social: { label: 'Social', color: '#ff4444', icon: Users, priority: 3 },
    health: { label: 'Salud/Personal', color: '#33ff99', icon: HeartPulse, priority: 4 },
};

export default function CalendarScreen({ navigation }) {
    const { events, updateWorkoutStatus } = useWorkouts();
    const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
    const [selectedDate, setSelectedDate] = useState('2026-01-22');

    // Hardcoded week for Phase 1
    const weekDays = [
        { label: 'Lun', date: '2026-01-19', day: 19 },
        { label: 'Mar', date: '2026-01-20', day: 20 },
        { label: 'Mié', date: '2026-01-21', day: 21 },
        { label: 'Jue', date: '2026-01-22', day: 22 },
        { label: 'Vie', date: '2026-01-23', day: 23 },
        { label: 'Sáb', date: '2026-01-24', day: 24 },
        { label: 'Dom', date: '2026-01-25', day: 25 },
    ];

    const dayEvents = events.filter(e => e.date === selectedDate);

    // Sort events by priority
    const sortedDayEvents = [...dayEvents].sort((a, b) => {
        const pA = EVENT_TYPES[a.type]?.priority || 99;
        const pB = EVENT_TYPES[b.type]?.priority || 99;
        return pA - pB;
    });

    const weeklySummary = {
        sessions: events.filter(e => e.type === 'workout').length,
        hours: "8h 30m",
        tss: 420,
        restrictions: events.filter(e => e.type === 'health' && e.restriction).length,
        keyRace: "15 días para: Gran Fondo Pirineos"
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.monthTitle}>Enero 2026</Text>
                    <Text style={styles.weekRange}>Semana 4</Text>
                </View>
                <View style={styles.viewSwitcher}>
                    <TouchableOpacity
                        style={[styles.switchBtn, viewMode === 'week' && styles.switchBtnActive]}
                        onPress={() => setViewMode('week')}
                    >
                        <Text style={[styles.switchText, viewMode === 'week' && styles.switchTextActive]}>Semana</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.switchBtn, viewMode === 'month' && styles.switchBtnActive]}
                        onPress={() => setViewMode('month')}
                    >
                        <Text style={[styles.switchText, viewMode === 'month' && styles.switchTextActive]}>Mes</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {viewMode === 'week' ? (
                <View style={styles.weekStrip}>
                    {weekDays.map((d) => {
                        const isSelected = d.date === selectedDate;
                        const hasWorkout = events.some(e => e.date === d.date && e.type === 'workout');
                        const hasEvent = events.some(e => e.date === d.date && e.type !== 'workout');

                        return (
                            <TouchableOpacity
                                key={d.date}
                                style={[styles.dayCol, isSelected && styles.dayColSelected]}
                                onPress={() => setSelectedDate(d.date)}
                            >
                                <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>{d.label}</Text>
                                <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>{d.day}</Text>
                                <View style={styles.dotsRow}>
                                    {hasWorkout && <View style={[styles.dot, { backgroundColor: '#00f2ff' }]} />}
                                    {hasEvent && <View style={[styles.dot, { backgroundColor: '#ffcc00' }]} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ) : (
                <MonthView events={events} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            )}

            <ScrollView contentContainerStyle={styles.eventList}>
                {sortedDayEvents.length > 0 ? (
                    sortedDayEvents.map(event => (
                        event.type === 'workout' ? (
                            <WorkoutCard
                                key={event.id}
                                workout={event}
                                onPress={() => navigation.navigate('WorkoutDetail', { workout: event })}
                                onToggleStatus={(id) => updateWorkoutStatus(id, event.status === 'hecho' ? 'planificado' : 'hecho')}
                            />
                        ) : (
                            <EventCard key={event.id} event={event} />
                        )
                    ))
                ) : (
                    <View style={styles.emptyDay}>
                        <Text style={styles.emptyText}>No hay eventos este día</Text>
                    </View>
                )}

                <View style={styles.summarySection}>
                    <Text style={styles.summaryTitle}>Impacto de la Semana</Text>
                    <ImpactCard summary={weeklySummary} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function MonthView({ events, selectedDate, onSelectDate }) {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <View style={styles.monthContainer}>
            <View style={styles.monthGrid}>
                {days.map(d => {
                    const dateStr = `2026-01-${d.toString().padStart(2, '0')}`;
                    const isSelected = dateStr === selectedDate;
                    const dayEvents = events.filter(e => e.date === dateStr);

                    // Priority sorting for dots
                    const seenTypes = new Set();
                    const markerColors = [];
                    dayEvents.forEach(e => {
                        if (!seenTypes.has(e.type) && markerColors.length < 4) {
                            seenTypes.add(e.type);
                            markerColors.push(EVENT_TYPES[e.type].color);
                        }
                    });

                    return (
                        <TouchableOpacity
                            key={d}
                            style={[styles.monthDay, isSelected && styles.monthDaySelected]}
                            onPress={() => onSelectDate(dateStr)}
                        >
                            <Text style={[styles.monthDayText, isSelected && styles.monthDayTextSelected]}>{d}</Text>
                            <View style={styles.monthDots}>
                                {markerColors.map((color, i) => (
                                    <View key={i} style={[styles.miniDot, { backgroundColor: color }]} />
                                ))}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.legend}>
                {Object.entries(EVENT_TYPES).map(([key, val]) => (
                    <View key={key} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: val.color }]} />
                        <Text style={styles.legendText}>{val.label}</Text>
                    </View>
                ))}
            </View>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    monthTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
    },
    weekRange: {
        fontSize: 14,
        color: '#909090',
        marginTop: 2,
    },
    viewSwitcher: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 4,
    },
    switchBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    switchBtnActive: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    switchText: {
        fontSize: 13,
        color: '#606060',
        fontWeight: 'bold',
    },
    switchTextActive: {
        color: '#00f2ff',
    },
    weekStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    dayCol: {
        alignItems: 'center',
        paddingVertical: 12,
        width: (width - 40) / 7,
        borderRadius: 12,
    },
    dayColSelected: {
        backgroundColor: 'rgba(0, 242, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0, 242, 255, 0.2)',
    },
    dayLabel: {
        fontSize: 12,
        color: '#606060',
        marginBottom: 4,
    },
    dayLabelSelected: {
        color: '#00f2ff',
    },
    dayNum: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#909090',
    },
    dayNumSelected: {
        color: '#fff',
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 2,
        marginTop: 6,
        height: 6,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    eventList: {
        padding: 20,
    },
    emptyDay: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        color: '#606060',
        fontStyle: 'italic',
    },
    summarySection: {
        marginTop: 24,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 16,
    },
    monthContainer: {
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    monthDay: {
        width: (width - 20) / 7,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    monthDaySelected: {
        backgroundColor: 'rgba(0, 242, 255, 0.1)',
        borderColor: 'rgba(0, 242, 255, 0.3)',
    },
    monthDayText: {
        color: '#606060',
        fontSize: 14,
    },
    monthDayTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    monthDots: {
        flexDirection: 'row',
        gap: 2,
        marginTop: 4,
    },
    miniDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
    },
    legend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
        paddingHorizontal: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 11,
        color: '#909090',
    }
});
