import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Activity, Trophy, Users, HeartPulse, Plus, X } from 'lucide-react-native';
import { useWorkouts } from '../context/WorkoutsContext';
import WorkoutCard from '../components/WorkoutCard';
import EventCard from '../components/EventCard';
import ImpactCard from '../components/ImpactCard';

const { width } = Dimensions.get('window');

const EVENT_TYPES = {
    workout: { label: 'Entreno', color: '#00f2ff', icon: Activity, priority: 1 },
    race: { label: 'Carrera', color: '#ffcc00', icon: Trophy, priority: 2 },
    social: { label: 'Social', color: '#ff4444', icon: Users, priority: 3 },
    health: { label: 'Salud', color: '#33ff99', icon: HeartPulse, priority: 4 },
    personal: { label: 'Personal', color: '#a855f7', icon: HeartPulse, priority: 5 },
};

export default function CalendarScreen({ navigation }) {
    const { events, updateWorkoutStatus, addEvent } = useWorkouts();
    const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
    const [selectedDate, setSelectedDate] = useState('2026-01-22');
    const [modalVisible, setModalVisible] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', type: 'social', description: '' });

    // Hardcoded week for Phase 1 (TODO: make dynamic in Phase 4)
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

    const handleAddEvent = async () => {
        if (!newEvent.title) return;
        await addEvent({
            ...newEvent,
            start_dt: `${selectedDate}T12:00:00Z`
        });
        setModalVisible(false);
        setNewEvent({ title: '', type: 'social', description: '' });
    };

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
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Eventos del día</Text>
                    <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                        <Plus size={20} color="#00f2ff" />
                    </TouchableOpacity>
                </View>

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

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nuevo Evento</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Título del evento"
                            placeholderTextColor="#606060"
                            value={newEvent.title}
                            onChangeText={(t) => setNewEvent({ ...newEvent, title: t })}
                        />

                        <View style={styles.typeSelector}>
                            {['race', 'social', 'health', 'personal'].map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.typeBtn, newEvent.type === type && { backgroundColor: EVENT_TYPES[type].color + '33' }]}
                                    onPress={() => setNewEvent({ ...newEvent, type })}
                                >
                                    <View style={[styles.typeDot, { backgroundColor: EVENT_TYPES[type].color }]} />
                                    <Text style={[styles.typeBtnText, newEvent.type === type && { color: EVENT_TYPES[type].color }]}>
                                        {EVENT_TYPES[type].label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            style={[styles.input, { height: 80 }]}
                            placeholder="Descripción (opcional)"
                            placeholderTextColor="#606060"
                            multiline
                            value={newEvent.description}
                            onChangeText={(t) => setNewEvent({ ...newEvent, description: t })}
                        />

                        <TouchableOpacity style={styles.saveBtn} onPress={handleAddEvent}>
                            <Text style={styles.saveBtnText}>Guardar Evento</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

function MonthView({ events, selectedDate, onSelectDate }) {
    // January 2026 starts on a Thursday (Mon=0, Tue=1, Wed=2, Thu=3)
    // We add 3 empty slots for Mon-Wed
    const emptySlots = Array.from({ length: 3 }, (_, i) => i);
    const mainDays = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <View style={styles.monthContainer}>
            <View style={styles.weekdayHeaders}>
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                    <Text key={d} style={styles.weekdayHeaderText}>{d}</Text>
                ))}
            </View>
            <View style={styles.monthGrid}>
                {emptySlots.map(i => (
                    <View key={`empty-${i}`} style={styles.monthDayEmpty} />
                ))}
                {mainDays.map(d => {
                    const dateStr = `2026-01-${d.toString().padStart(2, '0')}`;
                    const isSelected = dateStr === selectedDate;
                    const dayEvents = events.filter(e => e.date === dateStr);

                    const seenTypes = new Set();
                    const markerColors = [];
                    dayEvents.forEach(e => {
                        const typeCfg = EVENT_TYPES[e.type];
                        if (typeCfg && !seenTypes.has(e.type) && markerColors.length < 4) {
                            seenTypes.add(e.type);
                            markerColors.push(typeCfg.color);
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
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    addBtn: {
        backgroundColor: 'rgba(0, 242, 255, 0.1)',
        padding: 8,
        borderRadius: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1a1a1c',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        marginBottom: 16,
    },
    typeSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    typeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    typeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    typeBtnText: {
        fontSize: 13,
        color: '#909090',
    },
    saveBtn: {
        backgroundColor: '#00f2ff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    saveBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
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
        height: 64, // Increased height for "expansive" feel
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    monthDayEmpty: {
        width: (width - 20) / 7,
        height: 64,
    },
    weekdayHeaders: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 0,
        marginBottom: 8,
    },
    weekdayHeaderText: {
        width: (width - 20) / 7,
        textAlign: 'center',
        color: '#606060',
        fontSize: 12,
        fontWeight: 'bold',
    },
    monthDaySelected: {
        backgroundColor: 'rgba(0, 242, 255, 0.15)',
        borderColor: 'rgba(0, 242, 255, 0.4)',
        borderRadius: 8,
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
        gap: 3,
        marginTop: 6,
    },
    miniDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
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
